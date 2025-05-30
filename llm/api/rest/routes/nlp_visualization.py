"""
Natural Language Visualization API endpoint.

This module provides an endpoint for generating visualizations from natural language descriptions.
It uses the LLM to extract data and visualization parameters from text, then generates the visualization.
"""

import logging
import json
import uuid
import re
import os
import glob
from typing import Dict, Any, List, Optional, Union
from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from datetime import datetime
import numpy as np

from core.agent.llm_agent import CoreLLMAgent
from visualization.agent.viz_agent import VisualizationAgent
from visualization.agent.advanced_viz_agent import AdvancedVisualizationAgent
from visualization.agent.super_viz_agent import SuperVisualizationAgent

# Create router
router = APIRouter(prefix="/nlp-visualization", tags=["nlp-visualization"])

# Setup logging
logger = logging.getLogger(__name__)

# Define request model
class NLPVisualizationRequest(BaseModel):
    prompt: str
    
# Define response model
class NLPVisualizationResponse(BaseModel):
    success: bool
    visualization_type: Optional[str] = None
    file_path: Optional[str] = None
    base64_image: Optional[str] = None
    error: Optional[str] = None
    llm_analysis: Optional[Dict[str, Any]] = None

# Track the latest visualization for retrieval after timeouts
latest_visualization = {
    "file_path": None,
    "timestamp": None,
    "visualization_type": None
}

# Endpoints
@router.post("", response_model=NLPVisualizationResponse)
async def generate_visualization(request: NLPVisualizationRequest):
    """
    Generate a visualization from a natural language description.
    
    Args:
        request: The visualization request with prompt
        
    Returns:
        Visualization result
    """
    try:
        prompt = request.prompt
        logger.info(f"Processing NLP visualization request: {prompt}")
        
        # Initialize agents
        llm_agent = CoreLLMAgent()
        super_viz_agent = SuperVisualizationAgent({"storage_dir": "visualizations", "use_database": True})
        
        # Use LLM to extract visualization type and parameters
        extracted_data = await extract_parameters_with_llm(llm_agent, prompt)
        
        # If LLM extraction fails, return error
        if not extracted_data:
            logger.error("Failed to extract visualization parameters")
            return NLPVisualizationResponse(
                success=False,
                error="Failed to extract visualization parameters from prompt"
            )
        
        # Log extracted parameters
        logger.info(f"Extracted visualization type: {extracted_data.get('visualization_type')}")
        logger.info(f"Extracted parameters: {extracted_data.get('parameters')}")
        
        # Generate a unique filename if not provided
        parameters = extracted_data.get("parameters", {})
        if "filename" not in parameters:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_id = str(uuid.uuid4())[:8]
            parameters["filename"] = f"nlp_{extracted_data.get('visualization_type')}_{timestamp}_{unique_id}.png"
            extracted_data["parameters"] = parameters
        
        # Create message for visualization agent
        message = {
            "header": {
                "message_id": str(uuid.uuid4()),
                "sender": "nlp_visualization_endpoint",
                "recipient": "visualization_agent", 
                "timestamp": datetime.now().isoformat(),
                "message_type": "visualization_request"
            },
            "body": extracted_data
        }
        
        logger.info(f"Sending visualization request to SuperVisualizationAgent")
        
        # Generate the visualization using the super visualization agent
        visualization_result = super_viz_agent.process_message(message)
        
        # Log visualization result
        if visualization_result.get("success", False):
            logger.info(f"Visualization successful: {extracted_data.get('visualization_type')}")
            if "file_path" in visualization_result:
                logger.info(f"Visualization saved to: {visualization_result['file_path']}")
                
                # Update latest visualization for recovery after timeouts
                global latest_visualization
                latest_visualization = {
                    "file_path": visualization_result['file_path'],
                    "timestamp": datetime.now().isoformat(),
                    "visualization_type": extracted_data.get('visualization_type')
                }
                
                # Save latest visualization info to a JSON file for recovery
                try:
                    with open(os.path.join("visualizations", "latest.json"), "w") as f:
                        json.dump(latest_visualization, f)
                except Exception as e:
                    logger.error(f"Error saving latest visualization info: {e}")
        else:
            logger.error(f"Visualization failed: {visualization_result.get('error', 'Unknown error')}")
        
        # Convert NumPy types to Python native types
        visualization_result = convert_numpy_types(visualization_result)
        
        # Return the response
        return NLPVisualizationResponse(
            success=visualization_result.get("success", False),
            visualization_type=extracted_data.get("visualization_type"),
            file_path=visualization_result.get("file_path"),
            base64_image=visualization_result.get("base64_image"),
            error=visualization_result.get("error"),
            llm_analysis={"parameters": parameters}
        )
        
    except Exception as e:
        logger.exception(f"Error processing NLP visualization: {e}")
        return NLPVisualizationResponse(
            success=False,
            error=f"Error processing NLP visualization: {str(e)}"
        )

@router.get("/latest")
async def get_latest_visualization():
    """
    Get the latest successfully generated visualization.
    This is useful for recovery after timeouts.
    
    Returns:
        Latest visualization information
    """
    try:
        # Check if we have a latest visualization
        if not latest_visualization["file_path"]:
            # Try to read from the JSON file if in-memory cache is empty
            try:
                if os.path.exists(os.path.join("visualizations", "latest.json")):
                    with open(os.path.join("visualizations", "latest.json"), "r") as f:
                        file_data = json.load(f)
                        if file_data and "file_path" in file_data:
                            latest_visualization.update(file_data)
            except Exception as read_error:
                logger.error(f"Error reading latest visualization info: {read_error}")
                
            # If still no data, try to find the most recent file
            if not latest_visualization["file_path"]:
                try:
                    viz_files = glob.glob("visualizations/*.png")
                    if viz_files:
                        # Sort by modification time, newest first
                        newest_file = max(viz_files, key=os.path.getmtime)
                        latest_visualization["file_path"] = newest_file
                        latest_visualization["timestamp"] = datetime.fromtimestamp(
                            os.path.getmtime(newest_file)
                        ).isoformat()
                except Exception as glob_error:
                    logger.error(f"Error finding latest visualization file: {glob_error}")
        
        # If we still don't have a file, return 404
        if not latest_visualization["file_path"]:
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": "No visualizations found"}
            )
            
        # Check if the file exists
        file_path = latest_visualization["file_path"]
        if not os.path.exists(file_path):
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": f"File not found: {file_path}"}
            )
            
        # Return the file info
        return JSONResponse(
            content={
                "success": True,
                "file_path": file_path,
                "timestamp": latest_visualization["timestamp"],
                "visualization_type": latest_visualization.get("visualization_type")
            }
        )
        
    except Exception as e:
        logger.exception(f"Error retrieving latest visualization: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": f"Error retrieving latest visualization: {str(e)}"}
        )

@router.get("/files/{filename:path}")
async def get_visualization_file(filename: str):
    """
    Get a specific visualization file.
    
    Args:
        filename: The filename to retrieve
        
    Returns:
        The visualization file
    """
    try:
        file_path = os.path.join("visualizations", filename)
        if not os.path.exists(file_path):
            return JSONResponse(
                status_code=404,
                content={"success": False, "error": f"File not found: {filename}"}
            )
            
        return FileResponse(file_path)
        
    except Exception as e:
        logger.exception(f"Error retrieving visualization file: {e}")
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": f"Error retrieving visualization file: {str(e)}"}
        )

@router.post("/debug", response_model=Dict[str, Any])
async def debug_visualization_detection(request: NLPVisualizationRequest):
    """
    Debug endpoint to show what parameters would be extracted from a prompt.
    This is helpful for troubleshooting visualization detection issues.
    
    Args:
        request: The visualization request with prompt
        
    Returns:
        Details about extracted parameters and detection method
    """
    try:
        prompt = request.prompt
        logger.info(f"Processing debugging request for: {prompt}")
        
        # Set up debug logging handler to capture logs
        debug_handler = DebugLogHandler()
        logger.addHandler(debug_handler)
        logger.setLevel(logging.DEBUG)
        
        # Initialize LLM agent
        llm_agent = CoreLLMAgent()
        
        # Use LLM extraction
        llm_result = await extract_parameters_with_llm(llm_agent, prompt)
        llm_logs = debug_handler.get_logs()
        
        # Clean up handler
        logger.removeHandler(debug_handler)
        logger.setLevel(logging.INFO)
        
        # Get a list of all visualization types supported
        super_viz_agent = SuperVisualizationAgent({"storage_dir": "visualizations", "use_database": False})
        supported_types = super_viz_agent.get_capabilities().get("supported_types", [])
        
        return {
            "prompt": prompt,
            "visualization_type": llm_result.get("visualization_type") if llm_result else None,
            "parameters": llm_result.get("parameters") if llm_result else None,
            "raw_llm_result": llm_result,
            "logs": llm_logs,
            "supported_types": supported_types
        }
        
    except Exception as e:
        logger.exception(f"Error in debug endpoint: {e}")
        return {
            "success": False,
            "error": f"Debug processing error: {str(e)}"
        }

class DebugLogHandler(logging.Handler):
    """Custom log handler to capture logs for debugging."""
    
    def __init__(self):
        super().__init__()
        self.logs = []
        
    def emit(self, record):
        """Store log record."""
        log_entry = {
            "level": record.levelname,
            "message": record.getMessage(),
            "timestamp": datetime.now().isoformat()
        }
        self.logs.append(log_entry)
        
    def get_logs(self):
        """Return captured logs."""
        return self.logs
        
    def reset(self):
        """Clear logs."""
        self.logs = []

async def extract_parameters_with_llm(llm_agent: CoreLLMAgent, prompt: str) -> Dict[str, Any]:
    """
    Extract visualization parameters from a prompt using the LLM.
    
    Args:
        llm_agent: The LLM agent
        prompt: The natural language prompt
        
    Returns:
        Dictionary with visualization type and parameters
    """
    # Create a detailed prompt for the LLM
    extraction_prompt = f"""
You are an AI specialized in extracting visualization parameters from natural language descriptions.
IMPORTANT: You must carefully analyze the prompt to determine the EXACT type of visualization requested.

Extract the visualization type and all necessary parameters from the following text:

"{prompt}"

IMPORTANT DISAMBIGUATION RULES:
1. If the prompt mentions "3D", "3-D", "three dimensional", "surface plot", or any z-axis related terms, ALWAYS use "function_3d" type, NOT "heatmap"
2. If the prompt specifically mentions a heatmap, temperature map, or color-coded matrix, use "heatmap"
3. "plot" without specific qualifiers typically means "function_2d"
4. NEVER default to "heatmap" unless explicitly mentioned or truly the best representation
5. Each visualization type has a very specific meaning and purpose - select the ONE that best matches

The system supports these visualization types:
1. function_2d - 2D function plot (e.g., f(x) = sin(x))
2. functions_2d - Multiple 2D functions plot
3. function_3d - 3D surface plot (e.g., f(x,y) = sin(x)*cos(y))
4. parametric_3d - 3D parametric plot
5. histogram - Distribution visualization
6. scatter - Scatter plot of data points
7. boxplot - Box and whisker plot
8. violin - Violin plot
9. bar - Bar chart
10. heatmap - Heatmap or color map
11. pie - Pie chart
12. contour - Contour plot (level curves)
13. complex_function - Visualization of complex functions
14. time_series - Time series visualization
15. correlation_matrix - Correlation matrix
16. slope_field - Vector/slope field for differential equations

VISUALIZATION TYPE DEFINITIONS:
- function_3d: A 3D surface representation of a function z = f(x,y)
- heatmap: A 2D grid where values are represented by colors, not a 3D surface
- function_2d: A 2D plot of a function y = f(x)
- pie: A circular chart divided into sectors showing proportions
- bar: A chart with rectangular bars proportional to values
- scatter: A plot showing individual data points as markers

VISUALIZATION TYPE GUIDELINES:
- For surfaces in 3D, always use "function_3d", not "contour" and NEVER "heatmap"
- If the prompt mentions "3D plot" or "3D surface" or "z = f(x,y)", use "function_3d" 
- If the prompt mentions "contour", "level curves", or similar 2D map terminology, use "contour"
- If the prompt mentions complex functions (functions of z), use "complex_function"
- For slope fields, vector fields, direction fields, or differential equations, use "slope_field"
- For scatter plots, extract the points from the prompt and put them in the "x_data" and "y_data" arrays

REQUIRED PARAMETER NAMING CONVENTIONS:
- For function_2d and function_3d: Use "expression" for the mathematical function, not "function"
- For scatter plots: Use "x_data" and "y_data" arrays, not a "data" array
- For ranges: Use "x_range" and "y_range" as arrays with exactly 2 values: [min, max]
- For titles: Use "title" parameter
- For pie charts: Use "values" (not "sizes") for the numerical values
- For boxplots: Use "data" as a list of lists (e.g., [[1,2,3], [4,5,6]]) for multiple datasets
- For histograms: Use "data" as a single list of values
- For time series: Use "data" as a list of values and optionally "times" as a list of time points
- Always use numbers for numeric values, not strings or variables like "pi" (use 3.14159 instead)

EXAMPLES:

1. For a 2D function plot:
{{
  "visualization_type": "function_2d",
  "parameters": {{
    "expression": "sin(x)",
    "x_range": [-10, 10],
    "title": "Plot of sin(x)"
  }}
}}

2. For a 3D surface plot:
{{
  "visualization_type": "function_3d",
  "parameters": {{
    "expression": "sin(x)*cos(y)",
    "x_range": [-3.14159, 3.14159],
    "y_range": [-3.14159, 3.14159],
    "title": "3D Surface of sin(x)*cos(y)"
  }}
}}

3. For a scatter plot:
{{
  "visualization_type": "scatter",
  "parameters": {{
    "x_data": [1, 2, 4, 5, 8],
    "y_data": [3, 5, 4, 7, 9],
    "show_regression": true,
    "title": "Scatter Plot with Regression Line"
  }}
}}

4. For a contour plot:
{{
  "visualization_type": "contour",
  "parameters": {{
    "expression": "x**2 + y**2",
    "x_range": [-5, 5],
    "y_range": [-5, 5],
    "levels": 15,
    "title": "Contour Plot of x**2 + y**2"
  }}
}}

5. For a pie chart:
{{
  "visualization_type": "pie",
  "parameters": {{
    "values": [30, 45, 25],
    "labels": ["A", "B", "C"],
    "title": "Pie Chart Distribution"
  }}
}}

6. For a histogram:
{{
  "visualization_type": "histogram",
  "parameters": {{
    "data": [1, 2, 2, 3, 3, 3, 4, 4, 5],
    "bins": 5,
    "title": "Histogram of Data",
    "show_kde": true
  }}
}}

7. For a boxplot:
{{
  "visualization_type": "boxplot",
  "parameters": {{
    "data": [[1, 2, 3, 4, 5], [2, 4, 6, 8, 10], [3, 6, 9, 12, 15]],
    "labels": ["Group A", "Group B", "Group C"],
    "title": "Boxplot Comparison"
  }}
}}

8. For a time series:
{{
  "visualization_type": "time_series",
  "parameters": {{
    "data": [10, 15, 13, 17, 20, 22, 25, 23, 25],
    "times": [1, 2, 3, 4, 5, 6, 7, 8, 9],
    "title": "Temperature Time Series"
  }}
}}

9. For a heatmap (which is DIFFERENT from a 3D plot):
{{
  "visualization_type": "heatmap",
  "parameters": {{
    "data": [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
    "x_labels": ["A", "B", "C"],
    "y_labels": ["X", "Y", "Z"],
    "title": "2D Heatmap of Values",
    "cmap": "viridis"
  }}
}}

Format your response as a valid JSON object with the following structure:
{{
  "visualization_type": "one of the above types",
  "parameters": {{
    // All necessary parameters for the chosen visualization type
  }}
}}

IMPORTANT FORMATTING RULES:
- Use only valid JSON syntax: use "null" instead of None, "true" instead of True, "false" instead of False
- For function_3d type, provide ONLY the mathematical expression without "z = " or "f(x,y) = " prefix
- For mathematical expressions, use Python notation: x**2 instead of x^2, np.sin(x) instead of sin(x)
- For ranges, provide as [min, max] arrays
- Default x and y ranges should be [-10, 10] for 2D and [-5, 5] for 3D if not specified
- Ensure all numeric data is properly formatted as numbers, not strings
- Lists should be proper JSON arrays
- Make sure to include all closing braces and brackets in your JSON
- Do NOT use ellipsis notation [...] in arrays - either specify all values or use a single number for parameters like "levels"

FINAL INSTRUCTION:
Double-check your selection of visualization_type before submitting. If the prompt asks for a 3D visualization, you MUST use "function_3d", not "heatmap".
Analyze the text carefully to determine the most appropriate visualization type and extract relevant parameters.
Return only valid JSON, no explanations or additional text.
"""

    # Generate a response
    llm_response = llm_agent.generate_response(extraction_prompt)
    
    # Log the LLM response for debugging
    logger.debug(f"LLM extraction prompt: {extraction_prompt[:200]}...")
    
    if not llm_response.get("success", False):
        logger.error(f"LLM extraction failed: {llm_response.get('error', 'Unknown error')}")
        return {}
    
    # Extract JSON from LLM response
    response_text = llm_response.get("response", "")
    logger.debug(f"LLM response: {response_text[:200]}...")
    
    try:
        # Multiple JSON extraction strategies
        
        # Strategy 1: Find content between triple backticks
        json_matches = re.findall(r'```(?:json)?(.*?)```', response_text, re.DOTALL)
        if json_matches:
            for json_str in json_matches:
                try:
                    cleaned_json = clean_json_string(json_str)
                    extracted_data = json.loads(cleaned_json)
                    logger.debug(f"Successfully extracted parameters with LLM strategy 1")
                    return extracted_data
                except json.JSONDecodeError:
                    continue
        
        # Strategy 2: Extract largest JSON object
        json_matches = re.findall(r'({[\s\S]*?})', response_text)
        if json_matches:
            # Take the longest match, which is likely the full JSON
            json_str = max(json_matches, key=len)
            
            # Clean the JSON string
            cleaned_json = clean_json_string(json_str)
            
            try:
                extracted_data = json.loads(cleaned_json)
                logger.debug(f"Successfully extracted parameters with LLM strategy 2")
                return extracted_data
            except json.JSONDecodeError as e:
                logger.warning(f"JSON decode error after cleaning: {e}")
                logger.warning(f"Problematic JSON: {cleaned_json}")
        
        # Strategy 3: Try to extract just the JSON part using regex
        pattern = r'{\s*"visualization_type"\s*:.*?}'
        matches = re.search(pattern, response_text, re.DOTALL)
        if matches:
            json_str = matches.group(0)
            
            # Clean the JSON string
            cleaned_json = clean_json_string(json_str)
            
            try:
                extracted_data = json.loads(cleaned_json)
                logger.debug(f"Successfully extracted parameters with LLM strategy 3")
                return extracted_data
            except json.JSONDecodeError as e:
                logger.warning(f"JSON decode error after second attempt: {e}")
                
        logger.warning("All JSON extraction strategies failed")
        return {}
        
    except Exception as e:
        logger.exception(f"Error extracting parameters with LLM: {e}")
        return {}

def clean_json_string(json_str: str) -> str:
    """
    Clean and fix common JSON string issues.
    
    Args:
        json_str: The JSON string to clean
        
    Returns:
        Cleaned JSON string
    """
    # Remove comments
    json_str = re.sub(r'//.*?\n', '\n', json_str)
    json_str = re.sub(r'/\*.*?\*/', '', json_str, flags=re.DOTALL)
    
    # Replace single quotes with double quotes
    json_str = json_str.replace("'", '"')
    
    # 1. IMPROVED: Fix power notation (^ to **) - enhanced regex to handle more complex cases
    # Handle negative exponents and expressions with parentheses
    json_str = re.sub(r'(\w+|\))\s*\^\s*-?\s*(\d+)', r'\1**\2', json_str)
    json_str = re.sub(r'\(([^)]+)\)\s*\^\s*-?\s*(\d+)', r'(\1)**\2', json_str)
    
    # 2. NEW: Special handling for complex fractions in 3D functions
    if '"visualization_type": "function_3d"' in json_str:
        # Handle expressions like z = 1/(x^2+y^2)
        json_str = re.sub(r'"expression"\s*:\s*"(?:[zZ]\s*=\s*)?(\d+)\/\(([^)]+)\)"', 
                          r'"expression": "\1/(\2)"', json_str)
        
        # Handle expressions with negative exponents like (x^2+y^2)^-2
        json_str = re.sub(r'"expression"\s*:\s*"(?:[zZ]\s*=\s*)?(\([^)]+\))\s*\^\s*-\s*(\d+)"', 
                          r'"expression": "\1**-\2"', json_str)
        
        # Fix incomplete expressions with missing closing parentheses
        expr_match = re.search(r'"expression"\s*:\s*"([^"]+)"', json_str)
        if expr_match:
            expr = expr_match.group(1)
            # Count parentheses and fix if unbalanced
            open_parens = expr.count('(')
            close_parens = expr.count(')')
            if open_parens > close_parens:
                fixed_expr = expr + ')' * (open_parens - close_parens)
                json_str = json_str.replace(f'"expression": "{expr}"', f'"expression": "{fixed_expr}"')
    
    # Handle pi and mathematical constants without using backreferences
    json_str = json_str.replace(' pi ', ' 3.14159 ')
    json_str = json_str.replace(' π ', ' 3.14159 ')
    json_str = json_str.replace('[-pi,', '[-3.14159,')
    json_str = json_str.replace(', pi]', ', 3.14159]')
    json_str = json_str.replace('[-π,', '[-3.14159,')
    json_str = json_str.replace(', π]', ', 3.14159]')
    
    # Replace any remaining instances of pi
    json_str = json_str.replace('"pi"', '"3.14159"')
    json_str = json_str.replace('"π"', '"3.14159"')
    
    # 3. NEW: Handle trigonometric functions 
    trig_funcs = ['sin', 'cos', 'tan', 'arcsin', 'arccos', 'arctan']
    for func in trig_funcs:
        # Replace function(x) with np.function(x)
        json_str = re.sub(r'(\W|^)(' + func + r')\(', r'\1np.\2(', json_str)
    
    # 4. NEW: Handle logarithmic functions
    log_funcs = ['log', 'ln', 'log10']
    for func in log_funcs:
        # Replace log(x) with np.log(x)
        json_str = re.sub(r'(\W|^)(' + func + r')\(', r'\1np.\2(', json_str)
    
    # 5. NEW: Handle square roots and other math functions
    if 'sqrt' in json_str:
        json_str = re.sub(r'(\W|^)(sqrt)\(', r'\1np.\2(', json_str)
    
    # 6. NEW: Handle expressions like z = sin(sqrt(x^2 + y^2))
    complex_expr_match = re.search(r'"expression"\s*:\s*"(?:[zZ]\s*=\s*)?([^"]+)"', json_str)
    if complex_expr_match:
        complex_expr = complex_expr_match.group(1)
        # Replace ^ with ** if not already done
        if '^' in complex_expr:
            fixed_expr = re.sub(r'(\w+|\))\s*\^\s*(\d+)', r'\1**\2', complex_expr)
            json_str = json_str.replace(f'"expression": "{complex_expr}"', f'"expression": "{fixed_expr}"')
    
    # 7. NEW: Handle implicit equations like z^2-x^2-y^2=-1
    implicit_eq_match = re.search(r'"expression"\s*:\s*"([^"]*[zZ]\s*(?:\^|\*\*)\s*2[^"]*=.+)"', json_str)
    if implicit_eq_match:
        implicit_expr = implicit_eq_match.group(1)
        # We'll keep the expression as is, but flag it as an implicit equation
        json_str = json_str.replace(f'"expression": "{implicit_expr}"', 
                                   f'"expression": "{implicit_expr}", "is_implicit": true')
    
    # Fix missing quotes around property names
    json_str = re.sub(r'([{,])\s*(\w+)\s*:', r'\1"\2":', json_str)
    
    # Fix name mismatches in parameters
    json_str = json_str.replace('"function":', '"expression":')
    
    # Fix specific visualization parameter issues
    # 1. Convert "sizes" to "values" for pie charts
    if '"visualization_type": "pie"' in json_str and '"sizes":' in json_str and not '"values":' in json_str:
        json_str = json_str.replace('"sizes":', '"values":')
        
    # 2. Convert percentage values to decimals if needed
    percentage_match = re.search(r'"values"\s*:\s*\[([\d\s,.]+)\]', json_str)
    if percentage_match and "%" in percentage_match.group(1):
        values_str = percentage_match.group(1)
        values = []
        for v in re.findall(r'([\d.]+)%?', values_str):
            try:
                num_val = float(v)
                # If the number is a percentage (likely > 1 but < 100)
                if num_val > 0 and num_val <= 100:
                    values.append(num_val)
            except:
                pass
        if values:
            json_str = re.sub(r'"values"\s*:\s*\[[\d\s,.%]+\]', f'"values": {values}', json_str)
    
    # Replace Python literals with JSON literals
    # 1. Replace None with null
    json_str = re.sub(r':\s*None', r': null', json_str)
    json_str = re.sub(r',\s*None,', r', null,', json_str)
    json_str = re.sub(r'=\s*None', r'= null', json_str)
    
    # 2. Replace True with true
    json_str = re.sub(r':\s*True', r': true', json_str)
    json_str = re.sub(r',\s*True,', r', true,', json_str)
    json_str = re.sub(r'=\s*True', r'= true', json_str)
    
    # 3. Replace False with false
    json_str = re.sub(r':\s*False', r': false', json_str)
    json_str = re.sub(r',\s*False,', r', false,', json_str)
    json_str = re.sub(r'=\s*False', r'= false', json_str)
    
    # Remove trailing commas before closing brackets
    json_str = re.sub(r',\s*}', '}', json_str)
    json_str = re.sub(r',\s*]', ']', json_str)
    
    # Fix unclosed objects and arrays
    # Count opening and closing braces and brackets
    open_braces = json_str.count('{')
    close_braces = json_str.count('}')
    open_brackets = json_str.count('[')
    close_brackets = json_str.count(']')
    
    # Add missing closing braces
    if open_braces > close_braces:
        json_str += '}' * (open_braces - close_braces)
    
    # Add missing closing brackets
    if open_brackets > close_brackets:
        json_str += ']' * (open_brackets - close_brackets)
    
    return json_str

def convert_numpy_types(obj: Any) -> Any:
    """
    Convert numpy types to native Python types to ensure JSON serialization works.
    
    Args:
        obj: Object that might contain numpy types
        
    Returns:
        Object with numpy types converted to native Python types
    """
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, dict):
        return {k: convert_numpy_types(v) for k, v in obj.items()}
    elif isinstance(obj, tuple):
        return tuple(convert_numpy_types(item) for item in obj)
    else:
        return obj