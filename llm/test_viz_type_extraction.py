#!/usr/bin/env python3
"""
Test script to debug visualization type extraction from natural language.
This helps diagnose why certain visualization types are being consistently
misidentified as other types (e.g., 3D plots being identified as heatmaps).
"""

import os
import sys
import json
import uuid
import logging
import asyncio
from typing import Dict, Any, List

# Add the current directory to sys.path to ensure imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import required modules
from core.agent.llm_agent import CoreLLMAgent
from api.rest.routes.nlp_visualization import extract_parameters_with_llm, clean_json_string

# Setup logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class VisualizationTypeDebugger:
    """Debug visualization type extraction."""
    
    def __init__(self):
        """Initialize the debugger."""
        self.llm_agent = CoreLLMAgent()
        
    async def test_prompt(self, prompt: str) -> Dict[str, Any]:
        """Test a specific prompt."""
        logger.info(f"Testing prompt: {prompt}")
        
        result = await extract_parameters_with_llm(self.llm_agent, prompt)
        
        vis_type = result.get("visualization_type", "None")
        params = result.get("parameters", {})
        
        logger.info(f"Extracted type: {vis_type}")
        logger.info(f"Parameters summary: {list(params.keys())}")
        
        return result
    
    async def run_test_suite(self):
        """Run tests on different prompts."""
        test_prompts = [
            # 3D plots
            "Can you create a 3D plot for me?",
            "Create a 3D surface plot of sin(x)*cos(y)",
            "Generate a 3D visualization of the function z = x^2 + y^2",
            
            # 2D function plots
            "Plot the function y = sin(x)",
            "Create a 2D plot of the parabola f(x) = x^2",
            
            # Heatmaps
            "Create a heatmap of the following data matrix: [[1,2,3],[4,5,6],[7,8,9]]",
            "Generate a heatmap showing student attendance",
            
            # Pie charts
            "Create a pie chart with values 30, 40, 20 for categories A, B, C",
            "Make a pie chart visualization",
            
            # Bar charts
            "Generate a bar chart showing sales data: 120, 140, 160, 180, 200",
            "Create a bar graph with categories X, Y, Z and values 10, 20, 30",
            
            # Scatter plots
            "Make a scatter plot of the points (1,2), (3,4), (5,6)",
            "Create a scatter plot visualization"
        ]
        
        results = {}
        for prompt in test_prompts:
            result = await self.test_prompt(prompt)
            results[prompt] = {
                "visualization_type": result.get("visualization_type"),
                "parameter_keys": list(result.get("parameters", {}).keys())
            }
            # Add a separator between tests
            print("-" * 80)
        
        # Print summary
        print("\n\nSUMMARY OF VISUALIZATION TYPE EXTRACTION:")
        print("=" * 80)
        for prompt, result in results.items():
            vis_type = result["visualization_type"]
            print(f"Prompt: \"{prompt}\"")
            print(f"Type: {vis_type}")
            print(f"Parameters: {result['parameter_keys']}")
            print("-" * 80)
        
        return results

async def main():
    """Run the debugger."""
    debugger = VisualizationTypeDebugger()
    await debugger.run_test_suite()
    
    # Also test with custom prompts if provided as command line arguments
    if len(sys.argv) > 1:
        custom_prompt = " ".join(sys.argv[1:])
        print(f"\nTesting custom prompt: {custom_prompt}")
        await debugger.test_prompt(custom_prompt)

if __name__ == "__main__":
    asyncio.run(main()) 