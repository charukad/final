import os
import json
from typing import Dict, Any, Optional, List, Union, Tuple
import numpy as np
import sympy as sp
import uuid
from datetime import datetime
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
import seaborn as sns

# Local imports
from visualization.agent.advanced_viz_agent import AdvancedVisualizationAgent
from math_processing.computation.sympy_wrapper import SymbolicProcessor

class SuperVisualizationAgent(AdvancedVisualizationAgent):
    """
    Super visualization agent with enhanced capabilities for creating a wide variety of
    visualizations from natural language descriptions.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the Super Visualization Agent.
        
        Args:
            config: Configuration dictionary with visualization settings
        """
        # Initialize the advanced visualization agent
        super().__init__(config)
        
        # Check for necessary dependencies
        self._check_dependencies()
        
        # Add new visualization types
        additional_types = {
            # Statistical visualizations
            "boxplot": self._plot_boxplot,
            "violin": self._plot_violin,
            "bar": self._plot_bar,
            "heatmap": self._plot_heatmap,
            "pie": self._plot_pie,
            "contour": self._plot_contour,
            
            # Advanced mathematical visualizations
            "complex_function": self._plot_complex_function,
            "slope_field": self._plot_slope_field,
            
            # Time series and specialized visualizations
            "time_series": self._plot_time_series,
            "correlation_matrix": self._plot_correlation_matrix
        }
        
        # Update supported types
        self.supported_types.update(additional_types)
    
    def _check_dependencies(self):
        """Check for necessary dependencies and log warnings if any are missing."""
        dependencies = {
            "numpy": "NumPy is required for numerical computations.",
            "matplotlib": "Matplotlib is required for creating visualizations.",
            "seaborn": "Seaborn is recommended for enhanced statistical visualizations.",
            "sympy": "SymPy is required for symbolic mathematics.",
            "scipy": "SciPy is recommended for advanced mathematical functions."
        }
        
        missing_deps = []
        
        # Import logging early to ensure we can log issues
        import logging
        logger = logging.getLogger(__name__)
        
        for dep, message in dependencies.items():
            try:
                if dep == "numpy":
                    import numpy
                elif dep == "matplotlib":
                    import matplotlib.pyplot
                elif dep == "seaborn":
                    import seaborn
                elif dep == "sympy":
                    import sympy
                elif dep == "scipy":
                    import scipy
            except ImportError:
                missing_deps.append(f"{dep}: {message}")
                logger.warning(f"Missing dependency: {dep} - {message}")
        
        # Set a flag to indicate dependency status
        self.missing_dependencies = missing_deps
        
        if missing_deps:
            for msg in missing_deps:
                logger.warning(f"Missing dependency: {msg}")
            
            # Log a summary
            logger.warning(f"Missing {len(missing_deps)} dependencies. Some visualizations may not work properly.")
            
        return len(missing_deps) == 0
    
    def process_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a message to generate visualizations.
        
        Args:
            message: The visualization request message
            
        Returns:
            Visualization result
        """
        try:
            # Import needed modules
            import logging
            import numpy as np
            
            # Extract message parts
            header = message.get("header", {})
            body = message.get("body", {})
            
            # Log message reception
            logger = logging.getLogger(__name__)
            logger.info(f"SuperVisualizationAgent processing message: {header.get('message_id', 'unknown')}")
            
            # Extract visualization type and parameters
            visualization_type = body.get("visualization_type")
            parameters = body.get("parameters", {})
            
            # Log the request details
            logger.info(f"Visualization request - type: {visualization_type}")
            logger.debug(f"Visualization parameters: {parameters}")
            
            # Check if visualization type is supported
            if visualization_type not in self.supported_types:
                logger.error(f"Unsupported visualization type: {visualization_type}")
                supported_types_list = list(self.supported_types.keys())
                return {
                    "success": False,
                    "error": f"Unsupported visualization type: {visualization_type}. Supported types: {supported_types_list}"
                }
            
            # Check for missing dependencies
            if hasattr(self, 'missing_dependencies') and self.missing_dependencies:
                logger.warning(f"Running with missing dependencies: {self.missing_dependencies}")
            
            # Handle alternative heatmap parameter formats
            if visualization_type == "heatmap":
                # First check if data is provided in alternative format (x_data, y_data, values)
                if "x_data" in parameters and "y_data" in parameters and "values" in parameters:
                    x_data = parameters.get("x_data")
                    y_data = parameters.get("y_data")
                    values = parameters.get("values")
                    
                    # Check if we have all the necessary data
                    if x_data and y_data and values:
                        # Convert to 2D matrix format
                        try:
                            x_len = len(x_data)
                            y_len = len(y_data)
                            
                            # Reshape values into a proper matrix
                            if isinstance(values, list) and len(values) == x_len * y_len:
                                data_matrix = []
                                values_idx = 0
                                
                                # Construct 2D matrix from flat values list
                                # For a proper heatmap, typically each row is an x value and each column is a y value
                                for i in range(y_len):
                                    row = []
                                    for j in range(x_len):
                                        row.append(values[values_idx])
                                        values_idx += 1
                                    data_matrix.append(row)
                                
                                # Update parameters with the newly constructed 2D matrix
                                parameters["data"] = data_matrix
                                
                                # Add axis labels if not already present
                                if "x_labels" not in parameters:
                                    parameters["x_labels"] = x_data
                                if "y_labels" not in parameters:
                                    parameters["y_labels"] = y_data
                                
                                logger.info("Converted alternative format to 2D matrix for heatmap")
                        except Exception as e:
                            logger.error(f"Error converting alternative format to 2D matrix: {str(e)}")
                
                # Now check if we need default data (after trying to convert alternative format)
                if "data" not in parameters or not parameters["data"]:
                    # Generate default heatmap data if none provided
                    np.random.seed(42)  # For reproducibility
                    parameters["data"] = np.random.rand(5, 5).tolist()
                    parameters["title"] = parameters.get("title", "Sample Heatmap")
                    logger.info("Providing default data for heatmap visualization")
            
            # Provide defaults for pie chart
            elif visualization_type == "pie" and (not parameters or "values" not in parameters or not parameters["values"]):
                # Generate default pie chart data if none provided
                np.random.seed(42)  # For reproducibility
                parameters["values"] = [25, 30, 45]
                parameters["labels"] = parameters.get("labels") or ["Category 1", "Category 2", "Category 3"]
                parameters["title"] = parameters.get("title", "Sample Pie Chart")
                logger.info("Providing default data for pie chart visualization")
            
            # Enhanced logic for handling function_3d expressions
            if "expression" in parameters:
                # Clean and preprocess the expression
                expression = parameters["expression"]
                
                # 1. Remove common prefixes like z= or f(x,y)=
                if any(expression.startswith(prefix) for prefix in ["z=", "z =", "f(x,y)=", "f(x,y) =", "f(x, y)=", "f(x, y) ="]):
                    expression = expression.split("=", 1)[1].strip()
                
                # 2. Replace caret power notation with double asterisk
                expression = expression.replace("^", "**")
                
                # 3. Handle special cases for different visualization types
                if visualization_type == "function_3d":
                    # Handle negative exponents in 3D functions
                    import re
                    
                    # Check for implicit equations (where z appears on both sides or with powers)
                    implicit_eq_pattern = r'z\s*\^?\s*2|z\s*\*\*\s*2'
                    is_implicit_equation = re.search(implicit_eq_pattern, expression, re.IGNORECASE)
                    
                    if is_implicit_equation:
                        logger.info(f"Detected implicit equation: {expression}")
                        
                        # Check if there's an equals sign in the expression
                        if '=' in expression:
                            # Split into left and right sides of the equation
                            left_side, right_side = expression.split('=', 1)
                            left_side = left_side.strip()
                            right_side = right_side.strip()
                            
                            # Rearrange to standard form: left_side - right_side = 0
                            implicit_form = f"({left_side}) - ({right_side})"
                            
                            # Try several approaches to handle implicit equations
                            
                            # APPROACH 1: Quadric surfaces (hyperboloids, ellipsoids, etc.)
                            # Look for z^2 term to identify quadric surfaces
                            if re.search(r'z\s*\*\*\s*2|z\s*\^\s*2', left_side + right_side, re.IGNORECASE):
                                logger.info("Detected quadric surface. Attempting to solve for z...")
                                
                                # Move all terms to left side: implicit_form = 0
                                # Replace ^ with ** for exponents
                                implicit_form = implicit_form.replace('^', '**')
                                
                                # Extract z^2 coefficient (usually 1 or -1)
                                z_coef = 1.0
                                z_squared_match = re.search(r'([+-]?\s*\d*\.?\d*)\s*\*?\s*z\s*\*\*\s*2', implicit_form)
                                if z_squared_match:
                                    z_coef_str = z_squared_match.group(1).strip()
                                    if z_coef_str in ['+', '-']:
                                        z_coef = 1.0 if z_coef_str == '+' else -1.0
                                    elif z_coef_str:  # If not empty
                                        z_coef = float(z_coef_str)
                                
                                # Remove the z^2 term
                                implicit_form = re.sub(r'[+-]?\s*\d*\.?\d*\s*\*?\s*z\s*\*\*\s*2', '', implicit_form)
                                
                                # Simplify and isolate: z^2 = -implicit_form / z_coef
                                if z_coef != 0:
                                    z_squared_expr = f"-(({implicit_form})) / {z_coef}"
                                    
                                    # Formula for z: z = ±sqrt(expression) if expression >= 0
                                    expression = f"np.sqrt(np.maximum({z_squared_expr}, 0)) * np.sign({z_squared_expr})"
                                    logger.info(f"Reformulated quadric surface to: z = {expression}")
                                else:
                                    logger.warning("Cannot solve implicit equation: z^2 coefficient is zero")
                        
                        # If we reach here without a solution, try a generic approach
                        if '=' in expression:
                            logger.warning("Using generic approach for implicit equation")
                            left_side, right_side = expression.split('=', 1)
                            left_side = left_side.strip()
                            right_side = right_side.strip()
                            
                            # Just isolate the z^2 term and take square root
                            if 'z^2' in left_side or 'z**2' in left_side:
                                # Move everything else to the right side
                                left_side_terms = re.split(r'([+-])', left_side)
                                z_squared_term = ''
                                other_terms = []
                                
                                for i, term in enumerate(left_side_terms):
                                    if 'z^2' in term or 'z**2' in term:
                                        z_squared_term = term
                                        sign = left_side_terms[i-1] if i > 0 and left_side_terms[i-1] in ['+', '-'] else '+'
                                        z_coefficient = 1.0
                                        # Extract coefficient if any
                                        coef_match = re.search(r'(\d+(?:\.\d+)?)\s*\*?\s*z', term)
                                        if coef_match:
                                            z_coefficient = float(coef_match.group(1))
                                        if sign == '-':
                                            z_coefficient = -z_coefficient
                                    else:
                                        other_terms.append(term)
                                
                                # Combine other terms
                                other_side = ''.join(other_terms)
                                # If not empty, negate and add to right side
                                if other_side.strip():
                                    if other_side.startswith('+'):
                                        other_side = other_side[1:]
                                    right_side = f"{right_side} - ({other_side})"
                                
                                # Now z^2 = right_side / z_coefficient
                                expr = f"({right_side}) / {z_coefficient}"
                                
                                # Replace ^ with **
                                expr = expr.replace('^', '**')
                                
                                # Final expression: z = ±sqrt(expr)
                                expression = f"np.sqrt(abs({expr})) * np.sign({expr})"
                                logger.info(f"Final expression after solving for z: {expression}")
                    
                    # Fix expressions with negative exponents like (x^2+y^2)^-2
                    expression = re.sub(r'(\w+)\*\*-(\d+)', r'\1**(-\2)', expression)
                    expression = re.sub(r'\(([^)]+)\)\*\*-(\d+)', r'(\1)**(-\2)', expression)
                    
                    # Fix expressions with complex fractions
                    if '/' in expression:
                        # Ensure proper division operations
                        expression = expression.replace('1/', '1.0/')
                    
                    # Handle special trig and other functions
                    if any(func in expression for func in ['sin', 'cos', 'tan', 'log', 'exp', 'sqrt']):
                        # Add numpy prefix to mathematical functions if not already present
                        for func in ['sin', 'cos', 'tan', 'exp', 'log', 'sqrt']:
                            if func + '(' in expression and 'np.' + func + '(' not in expression:
                                expression = expression.replace(func + '(', 'np.' + func + '(')
                    
                    # Check for balanced parentheses
                    open_count = expression.count('(')
                    close_count = expression.count(')')
                    if open_count > close_count:
                        expression += ')' * (open_count - close_count)
                        logger.info(f"Fixed unbalanced parentheses in expression: {expression}")
                    
                    # Update the parameter
                    parameters["expression"] = expression
                    logger.debug(f"Preprocessed 3D expression: {expression}")
                    
                elif visualization_type == "function_2d":
                    # Remove y= or f(x)= prefixes
                    expression = re.sub(r'^y\s*=\s*', '', expression)
                    expression = re.sub(r'^f\s*\(\s*x\s*\)\s*=\s*', '', expression)
                    
                    # Fix negative exponents
                    expression = re.sub(r'(\w+)\*\*-(\d+)', r'\1**(-\2)', expression)
                    
                    # Update the parameter
                    parameters["expression"] = expression
                    logger.debug(f"Preprocessed 2D expression: {expression}")
            
            # Call the appropriate visualization method
            try:
                logger.info(f"Generating visualization: {visualization_type}")
                visualization_result = self.supported_types[visualization_type](parameters)
                
                if visualization_result.get("success", False):
                    logger.info(f"Visualization created successfully: {visualization_type}")
                else:
                    logger.error(f"Visualization failed: {visualization_result.get('error', 'Unknown error')}")
                
                return visualization_result
            except Exception as e:
                import traceback
                error_traceback = traceback.format_exc()
                logger.error(f"Error creating visualization: {str(e)}\n{error_traceback}")
                
                # Provide more context-specific error messages
                error_message = f"Error creating {visualization_type} visualization: {str(e)}"
                
                if "2D" in str(e) and visualization_type == "function_3d":
                    error_message += "\nPossible cause: The expression might be intended for a 2D plot."
                elif "3D" in str(e) and visualization_type == "function_2d":
                    error_message += "\nPossible cause: The expression might be intended for a 3D plot."
                elif "not defined" in str(e):
                    error_message += "\nPossible cause: Missing import or function not available."
                elif "numpy" in str(e).lower() or "scipy" in str(e).lower() or "matplotlib" in str(e).lower():
                    error_message += "\nPossible cause: Dependency issue with scientific computing libraries."
                
                return {
                    "success": False,
                    "error": error_message,
                    "traceback": error_traceback
                }
                
        except Exception as e:
            import traceback
            error_traceback = traceback.format_exc()
            logger = logging.getLogger(__name__)
            logger.error(f"Error processing visualization message: {str(e)}\n{error_traceback}")
            
            return {
                "success": False,
                "error": f"Error processing visualization message: {str(e)}",
                "traceback": error_traceback
            }
    
    def _plot_boxplot(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Plot a boxplot for one or more datasets."""
        try:
            # Extract parameters
            data = parameters.get("data")
            if data is None:
                return {"success": False, "error": "Missing required parameter: data"}
                
            # Handle optional parameters
            labels = parameters.get("labels")
            title = parameters.get("title", "Boxplot")
            x_label = parameters.get("x_label", "")
            y_label = parameters.get("y_label", "Value")
            figsize = parameters.get("figsize", (10, 6))
            color = parameters.get("color", "skyblue")
            orient = parameters.get("orientation", "vertical")
            show_points = parameters.get("show_points", True)
            notch = parameters.get("notch", False)
            
            # Determine output path
            save_path = None
            if parameters.get("save", True):
                filename = parameters.get("filename")
                if not filename:
                    filename = f"boxplot_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.{self.default_format}"
                save_path = os.path.join(self.storage_dir, filename)
            
            # Create the plot
            fig, ax = plt.subplots(figsize=figsize)
            
            # Convert single list to a list of lists if needed
            if isinstance(data[0], (int, float, np.number)):
                data = [data]
            
            # Create the boxplot
            boxplot = ax.boxplot(data, 
                                labels=labels, 
                                notch=notch, 
                                vert=(orient == "vertical"),
                                patch_artist=True,
                                showfliers=show_points)
            
            # Add colors
            if isinstance(color, list):
                colors = color
            else:
                colors = [color] * len(data)
                
            for patch, c in zip(boxplot['boxes'], colors):
                patch.set_facecolor(c)
                
            # Set labels and title
            ax.set_title(title)
            if orient == "vertical":
                ax.set_xlabel(x_label)
                ax.set_ylabel(y_label)
            else:
                ax.set_xlabel(y_label)
                ax.set_ylabel(x_label)
            
            ax.grid(True, alpha=0.3)
            
            # Save or encode the figure
            if save_path:
                # Create directory if it doesn't exist
                os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
                
                # Save the figure
                plt.savefig(save_path)
                plt.close(fig)
                
                return {
                    "success": True,
                    "plot_type": "boxplot",
                    "file_path": save_path,
                    "data": {
                        "statistics": self._compute_statistics(data),
                        "orientation": orient
                    }
                }
            else:
                # Convert to base64
                import io
                import base64
                
                buffer = io.BytesIO()
                plt.savefig(buffer, format='png')
                plt.close(fig)
                
                buffer.seek(0)
                image_png = buffer.getvalue()
                buffer.close()
                
                image_base64 = base64.b64encode(image_png).decode('utf-8')
                
                return {
                    "success": True,
                    "plot_type": "boxplot",
                    "base64_image": image_base64,
                    "data": {
                        "statistics": self._compute_statistics(data),
                        "orientation": orient
                    }
                }
                
        except Exception as e:
            return {"success": False, "error": f"Error in boxplot visualization: {str(e)}"}
    
    def _plot_violin(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Plot a violin plot for one or more datasets."""
        try:
            # Extract parameters
            data = parameters.get("data")
            if data is None:
                return {"success": False, "error": "Missing required parameter: data"}
                
            # Handle optional parameters
            labels = parameters.get("labels")
            title = parameters.get("title", "Violin Plot")
            x_label = parameters.get("x_label", "")
            y_label = parameters.get("y_label", "Value")
            figsize = parameters.get("figsize", (10, 6))
            color = parameters.get("color", "skyblue")
            orient = parameters.get("orientation", "vertical")
            show_points = parameters.get("show_points", True)
            
            # Determine output path
            save_path = None
            if parameters.get("save", True):
                filename = parameters.get("filename")
                if not filename:
                    filename = f"violin_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.{self.default_format}"
                save_path = os.path.join(self.storage_dir, filename)
            
            # Create the plot
            fig, ax = plt.subplots(figsize=figsize)
            
            # If data is a single list, convert to pandas DataFrame for seaborn
            if isinstance(data[0], (int, float, np.number)):
                import pandas as pd
                df = pd.DataFrame({"value": data, "group": ["Group 1"] * len(data)})
                sns.violinplot(x="group", y="value", data=df, ax=ax, 
                              inner='box' if show_points else 'quartile',
                              color=color, orient=orient)
            else:
                # For multiple datasets, prepare data for violinplot
                if labels is None:
                    labels = [f"Group {i+1}" for i in range(len(data))]
                
                import pandas as pd
                all_data = []
                for i, dataset in enumerate(data):
                    for value in dataset:
                        all_data.append({"value": value, "group": labels[i]})
                
                df = pd.DataFrame(all_data)
                
                # Plot based on orientation
                if orient == "vertical":
                    sns.violinplot(x="group", y="value", data=df, ax=ax, 
                                  inner='box' if show_points else 'quartile',
                                  palette=color if isinstance(color, list) else None)
                else:
                    sns.violinplot(x="value", y="group", data=df, ax=ax, 
                                  inner='box' if show_points else 'quartile',
                                  palette=color if isinstance(color, list) else None)
            
            # Set labels and title
            ax.set_title(title)
            if orient == "vertical":
                ax.set_xlabel(x_label if x_label else "")
                ax.set_ylabel(y_label)
            else:
                ax.set_xlabel(y_label)
                ax.set_ylabel(x_label if x_label else "")
            
            ax.grid(True, alpha=0.3)
            
            # Save or encode the figure
            if save_path:
                # Create directory if it doesn't exist
                os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
                
                # Save the figure
                plt.savefig(save_path)
                plt.close(fig)
                
                return {
                    "success": True,
                    "plot_type": "violin",
                    "file_path": save_path,
                    "data": {
                        "statistics": self._compute_statistics(data),
                        "orientation": orient
                    }
                }
            else:
                # Convert to base64
                import io
                import base64
                
                buffer = io.BytesIO()
                plt.savefig(buffer, format='png')
                plt.close(fig)
                
                buffer.seek(0)
                image_png = buffer.getvalue()
                buffer.close()
                
                image_base64 = base64.b64encode(image_png).decode('utf-8')
                
                return {
                    "success": True,
                    "plot_type": "violin",
                    "base64_image": image_base64,
                    "data": {
                        "statistics": self._compute_statistics(data),
                        "orientation": orient
                    }
                }
                
        except Exception as e:
            return {"success": False, "error": f"Error in violin plot visualization: {str(e)}"}
    
    def _plot_bar(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Plot a bar chart."""
        try:
            # Extract parameters
            values = parameters.get("values")
            labels = parameters.get("labels")
            
            if values is None:
                return {"success": False, "error": "Missing required parameter: values"}
                
            # Generate default labels if needed
            if labels is None:
                labels = [f"Category {i+1}" for i in range(len(values))]
                
            # Handle optional parameters
            title = parameters.get("title", "Bar Chart")
            x_label = parameters.get("x_label", "")
            y_label = parameters.get("y_label", "Value")
            figsize = parameters.get("figsize", (10, 6))
            color = parameters.get("color", "skyblue")
            horizontal = parameters.get("horizontal", False)
            
            # Determine output path
            save_path = None
            if parameters.get("save", True):
                filename = parameters.get("filename")
                if not filename:
                    filename = f"bar_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.{self.default_format}"
                save_path = os.path.join(self.storage_dir, filename)
            
            # Create the plot
            fig, ax = plt.subplots(figsize=figsize)
            
            # Plot bar chart
            if horizontal:
                bars = ax.barh(labels, values, color=color)
            else:
                bars = ax.bar(labels, values, color=color)
            
            # Add value labels on top/beside each bar
            for bar in bars:
                if horizontal:
                    height = bar.get_width()
                    ax.annotate(f'{height:.1f}',
                               xy=(height, bar.get_y() + bar.get_height()/2),
                               xytext=(5, 0),  # Offset
                               textcoords="offset points",
                               va='center', ha='left')
                else:
                    height = bar.get_height()
                    ax.annotate(f'{height:.1f}',
                               xy=(bar.get_x() + bar.get_width()/2, height),
                               xytext=(0, 5),  # Offset
                               textcoords="offset points",
                               ha='center', va='bottom')
            
            # Set labels and title
            ax.set_title(title)
            if horizontal:
                ax.set_xlabel(y_label)
                ax.set_ylabel(x_label)
            else:
                ax.set_xlabel(x_label)
                ax.set_ylabel(y_label)
            
            ax.grid(True, alpha=0.3, axis='y' if not horizontal else 'x')
            
            # Save or encode the figure
            if save_path:
                # Create directory if it doesn't exist
                os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
                
                # Save the figure
                plt.savefig(save_path)
                plt.close(fig)
                
                return {
                    "success": True,
                    "plot_type": "bar",
                    "file_path": save_path,
                    "data": {
                        "values": values,
                        "labels": labels,
                        "orientation": "horizontal" if horizontal else "vertical"
                    }
                }
            else:
                # Convert to base64
                import io
                import base64
                
                buffer = io.BytesIO()
                plt.savefig(buffer, format='png')
                plt.close(fig)
                
                buffer.seek(0)
                image_png = buffer.getvalue()
                buffer.close()
                
                image_base64 = base64.b64encode(image_png).decode('utf-8')
                
                return {
                    "success": True,
                    "plot_type": "bar",
                    "base64_image": image_base64,
                    "data": {
                        "values": values,
                        "labels": labels,
                        "orientation": "horizontal" if horizontal else "vertical"
                    }
                }
                
        except Exception as e:
            return {"success": False, "error": f"Error in bar chart visualization: {str(e)}"}
    
    def _plot_pie(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Plot a pie chart."""
        try:
            # Import needed modules
            import logging
            import numpy as np
            
            # Extract parameters
            values = parameters.get("values")
            labels = parameters.get("labels")
            
            # Handle missing or invalid values
            if values is None or not values:
                # Generate default values if none provided
                np.random.seed(42)  # For reproducibility
                values = [25, 30, 45]
                logging.info("Using default values for pie chart visualization")
            
            # Handle None values in the data array
            if isinstance(values, list):
                # Replace None values with 0
                values = [0 if v is None else v for v in values]
                
                # Check if any values are negative or all values are zero
                if any(v < 0 for v in values) or sum(values) == 0:
                    # Convert negative values to positive
                    values = [abs(v) for v in values]
                    # If all values are still zero, use default
                    if sum(values) == 0:
                        values = [25, 30, 45]
                        logging.info("Using default values for pie chart: all values were zero or negative")
            
            # Generate default labels if needed
            if labels is None or len(labels) != len(values):
                labels = [f"Category {i+1}" for i in range(len(values))]
                
            # Handle optional parameters
            title = parameters.get("title", "Pie Chart")
            figsize = parameters.get("figsize", (8, 8))
            colors = parameters.get("colors")
            explode = parameters.get("explode")
            shadow = parameters.get("shadow", False)
            startangle = parameters.get("startangle", 0)
            autopct = parameters.get("autopct", '%1.1f%%')
            
            # Determine output path
            save_path = None
            if parameters.get("save", True):
                filename = parameters.get("filename")
                if not filename:
                    filename = f"pie_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.{self.default_format}"
                save_path = os.path.join(self.storage_dir, filename)
            
            # Create the plot
            fig, ax = plt.subplots(figsize=figsize)
            
            # Plot pie chart
            ax.pie(values, labels=labels, autopct=autopct, shadow=shadow, startangle=startangle,
                  explode=explode, colors=colors)
            
            # Set title
            ax.set_title(title)
            
            # Equal aspect ratio ensures that pie is drawn as a circle
            ax.axis('equal')
            
            # Save or encode the figure
            if save_path:
                # Create directory if it doesn't exist
                os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
                
                # Save the figure
                plt.savefig(save_path)
                plt.close(fig)
                
                return {
                    "success": True,
                    "plot_type": "pie",
                    "file_path": save_path,
                    "data": {
                        "values": values,
                        "labels": labels,
                        "percentages": [v/sum(values)*100 for v in values]
                    }
                }
            else:
                # Convert to base64
                import io
                import base64
                
                buffer = io.BytesIO()
                plt.savefig(buffer, format='png')
                plt.close(fig)
                
                buffer.seek(0)
                image_png = buffer.getvalue()
                buffer.close()
                
                image_base64 = base64.b64encode(image_png).decode('utf-8')
                
                return {
                    "success": True,
                    "plot_type": "pie",
                    "base64_image": image_base64,
                    "data": {
                        "values": values,
                        "labels": labels,
                        "percentages": [v/sum(values)*100 for v in values]
                    }
                }
                
        except Exception as e:
            return {"success": False, "error": f"Error in pie chart visualization: {str(e)}"}
    
    def _compute_statistics(self, data) -> Dict[str, Any]:
        """
        Compute basic statistics for the data.
        
        Args:
            data: The data to analyze (single list or list of lists)
            
        Returns:
            Dictionary with statistics for each dataset
        """
        statistics = []
        
        # Handle both single dataset and multiple datasets
        datasets = [data] if isinstance(data[0], (int, float, np.number)) else data
        
        for i, dataset in enumerate(datasets):
            dataset_np = np.array(dataset)
            stats = {
                "mean": float(np.mean(dataset_np)),
                "median": float(np.median(dataset_np)),
                "std": float(np.std(dataset_np)),
                "min": float(np.min(dataset_np)),
                "max": float(np.max(dataset_np)),
                "count": int(len(dataset_np)),
                "q1": float(np.percentile(dataset_np, 25)),
                "q3": float(np.percentile(dataset_np, 75)),
                "iqr": float(np.percentile(dataset_np, 75) - np.percentile(dataset_np, 25))
            }
            statistics.append(stats)
        
        # If it's a single dataset, return just the stats, otherwise return a list
        return statistics[0] if len(statistics) == 1 else statistics
    
    def get_capabilities(self) -> Dict[str, Any]:
        """
        Return the agent's capabilities.
        
        Returns:
            Dictionary of agent capabilities
        """
        base_capabilities = super().get_capabilities()
        
        # Add additional capabilities
        extended_capabilities = {
            "agent_type": "super_visualization",
            "advanced_features": [
                "boxplot", "violin", "bar", "heatmap", "pie", "contour",
                "complex_function", "slope_field",
                "time_series", "correlation_matrix"
            ],
            "description": "Enhanced visualization agent capable of generating a wide range of plots from natural language descriptions"
        }
        
        # Update the base capabilities
        base_capabilities.update(extended_capabilities)
        
        # Remove duplicates from supported_types by converting to a set and back to a list
        existing_types = set(base_capabilities["supported_types"])
        # Add only the new types that don't already exist
        for type_name in extended_capabilities["advanced_features"]:
            if type_name not in existing_types:
                base_capabilities["supported_types"].append(type_name)
                existing_types.add(type_name)
        
        return base_capabilities

    def _plot_heatmap(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Plot a heatmap visualization."""
        try:
            # Import needed modules
            import logging
            import numpy as np
            
            # Extract parameters
            data = parameters.get("data")
            
            # Create default data if none is provided or if the data is empty
            if data is None or (isinstance(data, list) and len(data) == 0):
                # Generate a 5x5 sample data matrix if none is provided
                np.random.seed(42)  # For reproducibility
                data = np.random.rand(5, 5).tolist()
                logging.info("Using default 5x5 random data matrix for heatmap visualization")
                
            # Convert to numpy array if it's a list
            if isinstance(data, list):
                data = np.array(data)
                
            # Ensure data is 2D
            if data.ndim == 1:
                # Convert 1D array to 2D array (1 row)
                data = data.reshape(1, -1)
                
            # Handle optional parameters
            title = parameters.get("title", "Heatmap")
            x_labels = parameters.get("x_labels")
            y_labels = parameters.get("y_labels")
            figsize = parameters.get("figsize", (10, 8))
            cmap = parameters.get("cmap", "viridis")
            vmin = parameters.get("vmin")
            vmax = parameters.get("vmax")
            show_values = parameters.get("show_values", True)
            
            # Determine output path
            save_path = None
            if parameters.get("save", True):
                filename = parameters.get("filename")
                if not filename:
                    filename = f"heatmap_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.{self.default_format}"
                save_path = os.path.join(self.storage_dir, filename)
            
            # Create the plot
            fig, ax = plt.subplots(figsize=figsize)
            
            # Plot heatmap
            im = ax.imshow(data, cmap=cmap, vmin=vmin, vmax=vmax, aspect='auto')
            
            # Add colorbar
            cbar = plt.colorbar(im, ax=ax)
            
            # Set title
            ax.set_title(title)
            
            # Set axis labels if provided
            # For x-axis (columns)
            if x_labels:
                # Ensure we don't have more labels than columns
                if len(x_labels) > data.shape[1]:
                    x_labels = x_labels[:data.shape[1]]
                elif len(x_labels) < data.shape[1]:
                    # If fewer labels than columns, extend with generic labels
                    x_labels = list(x_labels) + [f"Col {i+1}" for i in range(len(x_labels), data.shape[1])]
                    
                ax.set_xticks(np.arange(len(x_labels)))
                ax.set_xticklabels(x_labels, rotation=45, ha="right")
            
            # For y-axis (rows)
            if y_labels:
                # Ensure we don't have more labels than rows
                if len(y_labels) > data.shape[0]:
                    y_labels = y_labels[:data.shape[0]]
                elif len(y_labels) < data.shape[0]:
                    # If fewer labels than rows, extend with generic labels
                    y_labels = list(y_labels) + [f"Row {i+1}" for i in range(len(y_labels), data.shape[0])]
                
                ax.set_yticks(np.arange(len(y_labels)))
                ax.set_yticklabels(y_labels)
            
            # Add text annotations if requested
            if show_values:
                for i in range(data.shape[0]):
                    for j in range(data.shape[1]):
                        value = data[i, j]
                        # Determine text color based on cell value for better contrast
                        max_val = vmax if vmax is not None else np.max(data)
                        min_val = vmin if vmin is not None else np.min(data)
                        mid_val = (max_val + min_val) / 2 if max_val != min_val else max_val
                        text_color = "white" if value > mid_val else "black"
                        
                        # Format the text based on whether the value is an integer or float
                        if np.issubdtype(type(value), np.integer) or (isinstance(value, float) and value.is_integer()):
                            text = f"{int(value)}"
                        else:
                            text = f"{value:.2f}"
                            
                        ax.text(j, i, text, ha="center", va="center", color=text_color)
            
            # Save or encode the figure
            if save_path:
                # Create directory if it doesn't exist
                os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
                
                # Save the figure
                plt.savefig(save_path)
                plt.close(fig)
                
                return {
                    "success": True,
                    "plot_type": "heatmap",
                    "file_path": save_path,
                    "data": {
                        "min_value": float(np.min(data)),
                        "max_value": float(np.max(data)),
                        "mean_value": float(np.mean(data))
                    }
                }
            else:
                # Convert to base64
                import io
                import base64
                
                buffer = io.BytesIO()
                plt.savefig(buffer, format='png')
                plt.close(fig)
                
                buffer.seek(0)
                image_png = buffer.getvalue()
                buffer.close()
                
                image_base64 = base64.b64encode(image_png).decode('utf-8')
                
                return {
                    "success": True,
                    "plot_type": "heatmap",
                    "base64_image": image_base64,
                    "data": {
                        "min_value": float(np.min(data)),
                        "max_value": float(np.max(data)),
                        "mean_value": float(np.mean(data))
                    }
                }
                
        except Exception as e:
            return {"success": False, "error": f"Error in heatmap visualization: {str(e)}"}

    def _plot_contour(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Plot a contour visualization of a 2D function."""
        try:
            # Extract parameters
            expression = parameters.get("expression")
            if expression is None:
                return {"success": False, "error": "Missing required parameter: expression"}
                
            # Handle optional parameters
            x_range = parameters.get("x_range", (-5, 5))
            y_range = parameters.get("y_range", (-5, 5))
            num_points = parameters.get("num_points", 100)
            title = parameters.get("title", "Contour Plot")
            x_label = parameters.get("x_label", "x")
            y_label = parameters.get("y_label", "y")
            figsize = parameters.get("figsize", (10, 8))
            cmap = parameters.get("cmap", "viridis")
            levels = parameters.get("levels", 20)
            filled = parameters.get("filled", True)
            
            # Determine output path
            save_path = None
            if parameters.get("save", True):
                filename = parameters.get("filename")
                if not filename:
                    filename = f"contour_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.{self.default_format}"
                save_path = os.path.join(self.storage_dir, filename)
            
            # Create the plot
            fig, ax = plt.subplots(figsize=figsize)
            
            # Generate mesh grid
            x = np.linspace(x_range[0], x_range[1], num_points)
            y = np.linspace(y_range[0], y_range[1], num_points)
            X, Y = np.meshgrid(x, y)
            
            # Convert expression to function
            if isinstance(expression, str):
                x_sym, y_sym = sp.symbols('x y')
                expr = sp.sympify(expression)
                f = sp.lambdify((x_sym, y_sym), expr, "numpy")
                Z = f(X, Y)
            else:
                Z = expression(X, Y)
            
            # Plot contour
            if filled:
                cs = ax.contourf(X, Y, Z, levels=levels, cmap=cmap)
                fig.colorbar(cs, ax=ax)
            else:
                cs = ax.contour(X, Y, Z, levels=levels, cmap=cmap)
                ax.clabel(cs, inline=True, fontsize=8)
            
            # Set labels and title
            ax.set_xlabel(x_label)
            ax.set_ylabel(y_label)
            ax.set_title(title)
            
            # Add grid
            ax.grid(True, alpha=0.3)
            
            # Save or encode the figure
            if save_path:
                # Create directory if it doesn't exist
                os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
                
                # Save the figure
                plt.savefig(save_path)
                plt.close(fig)
                
                return {
                    "success": True,
                    "plot_type": "contour",
                    "file_path": save_path,
                    "data": {
                        "expression": str(expression) if isinstance(expression, str) else "custom_function",
                        "x_range": x_range,
                        "y_range": y_range,
                        "filled": filled
                    }
                }
            else:
                # Convert to base64
                import io
                import base64
                
                buffer = io.BytesIO()
                plt.savefig(buffer, format='png')
                plt.close(fig)
                
                buffer.seek(0)
                image_png = buffer.getvalue()
                buffer.close()
                
                image_base64 = base64.b64encode(image_png).decode('utf-8')
                
                return {
                    "success": True,
                    "plot_type": "contour",
                    "base64_image": image_base64,
                    "data": {
                        "expression": str(expression) if isinstance(expression, str) else "custom_function",
                        "x_range": x_range,
                        "y_range": y_range,
                        "filled": filled
                    }
                }
                
        except Exception as e:
            return {"success": False, "error": f"Error in contour visualization: {str(e)}"}

    def _plot_complex_function(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Plot a complex function using domain coloring."""
        try:
            # Extract parameters
            expression = parameters.get("expression")
            if expression is None:
                return {"success": False, "error": "Missing required parameter: expression"}
                
            # Handle optional parameters
            x_range = parameters.get("x_range", (-5, 5))
            y_range = parameters.get("y_range", (-5, 5))
            num_points = parameters.get("num_points", 500)
            title = parameters.get("title", "Complex Function")
            figsize = parameters.get("figsize", (10, 8))
            plot_type = parameters.get("plot_type", "phase")  # phase, abs, real, imag
            
            # Determine output path
            save_path = None
            if parameters.get("save", True):
                filename = parameters.get("filename")
                if not filename:
                    filename = f"complex_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.{self.default_format}"
                save_path = os.path.join(self.storage_dir, filename)
            
            # Create the plot
            fig, ax = plt.subplots(figsize=figsize)
            
            # Generate mesh grid
            x = np.linspace(x_range[0], x_range[1], num_points)
            y = np.linspace(y_range[0], y_range[1], num_points)
            X, Y = np.meshgrid(x, y)
            Z = X + 1j * Y
            
            # Convert expression to function
            if isinstance(expression, str):
                z = sp.symbols('z')
                expr = sp.sympify(expression.replace('i', 'I'))
                f = sp.lambdify(z, expr, "numpy")
                W = f(Z)
            else:
                W = expression(Z)
            
            # Plot based on plot_type
            if plot_type == "phase":
                # Create a phase plot (domain coloring)
                phase = np.angle(W)
                amplitude = np.abs(W)
                
                # Normalize amplitude for brightness
                brightness = 0.5 * (1 + np.tanh(np.log(amplitude) / 2))
                
                # Create HSV color mapping (phase to hue, amplitude to value)
                hsv = np.zeros((num_points, num_points, 3))
                hsv[:, :, 0] = (phase + np.pi) / (2 * np.pi)  # Hue (from phase)
                hsv[:, :, 1] = 1.0  # Saturation
                hsv[:, :, 2] = brightness  # Value (brightness from amplitude)
                
                # Convert HSV to RGB
                from matplotlib.colors import hsv_to_rgb
                rgb = hsv_to_rgb(hsv)
                
                # Plot the image
                ax.imshow(rgb, extent=[x_range[0], x_range[1], y_range[0], y_range[1]], origin='lower')
                
            elif plot_type == "abs":
                # Plot absolute value
                abs_W = np.abs(W)
                
                # Apply logarithmic scaling for better visualization
                log_abs_W = np.log(abs_W + 1)
                
                im = ax.imshow(log_abs_W, extent=[x_range[0], x_range[1], y_range[0], y_range[1]], 
                              origin='lower', cmap='viridis')
                plt.colorbar(im, ax=ax, label="|f(z)| (log scale)")
                
            elif plot_type == "real":
                # Plot real part
                real_W = np.real(W)
                im = ax.imshow(real_W, extent=[x_range[0], x_range[1], y_range[0], y_range[1]], 
                              origin='lower', cmap='RdBu')
                plt.colorbar(im, ax=ax, label="Re(f(z))")
                
            elif plot_type == "imag":
                # Plot imaginary part
                imag_W = np.imag(W)
                im = ax.imshow(imag_W, extent=[x_range[0], x_range[1], y_range[0], y_range[1]], 
                              origin='lower', cmap='RdBu')
                plt.colorbar(im, ax=ax, label="Im(f(z))")
            
            # Set labels and title
            ax.set_xlabel("Re(z)")
            ax.set_ylabel("Im(z)")
            ax.set_title(title)
            
            # Save or encode the figure
            if save_path:
                # Create directory if it doesn't exist
                os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
                
                # Save the figure
                plt.savefig(save_path)
                plt.close(fig)
                
                return {
                    "success": True,
                    "plot_type": "complex_function",
                    "file_path": save_path,
                    "data": {
                        "expression": str(expression) if isinstance(expression, str) else "custom_function",
                        "x_range": x_range,
                        "y_range": y_range,
                        "visualization_type": plot_type
                    }
                }
            else:
                # Convert to base64
                import io
                import base64
                
                buffer = io.BytesIO()
                plt.savefig(buffer, format='png')
                plt.close(fig)
                
                buffer.seek(0)
                image_png = buffer.getvalue()
                buffer.close()
                
                image_base64 = base64.b64encode(image_png).decode('utf-8')
                
                return {
                    "success": True,
                    "plot_type": "complex_function",
                    "base64_image": image_base64,
                    "data": {
                        "expression": str(expression) if isinstance(expression, str) else "custom_function",
                        "x_range": x_range,
                        "y_range": y_range,
                        "visualization_type": plot_type
                    }
                }
                
        except Exception as e:
            return {"success": False, "error": f"Error in complex function visualization: {str(e)}"}

    def _plot_slope_field(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Plot a slope field for a first-order ODE."""
        try:
            # Extract parameters
            expression = parameters.get("expression")
            if expression is None:
                return {"success": False, "error": "Missing required parameter: expression"}
                
            # Handle optional parameters
            x_range = parameters.get("x_range", (-5, 5))
            y_range = parameters.get("y_range", (-5, 5))
            density = parameters.get("density", 20)
            title = parameters.get("title", "Slope Field")
            x_label = parameters.get("x_label", "x")
            y_label = parameters.get("y_label", "y")
            figsize = parameters.get("figsize", (10, 8))
            color = parameters.get("color", 'black')
            
            # Particular solutions (optional)
            solutions = parameters.get("solutions", [])
            
            # Determine output path
            save_path = None
            if parameters.get("save", True):
                filename = parameters.get("filename")
                if not filename:
                    filename = f"slope_field_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.{self.default_format}"
                save_path = os.path.join(self.storage_dir, filename)
            
            # Create the plot
            fig, ax = plt.subplots(figsize=figsize)
            
            # Generate grid points
            x = np.linspace(x_range[0], x_range[1], density)
            y = np.linspace(y_range[0], y_range[1], density)
            X, Y = np.meshgrid(x, y)
            
            # Convert expression to function
            if isinstance(expression, str):
                x_sym, y_sym = sp.symbols('x y')
                expr = sp.sympify(expression)
                f = sp.lambdify((x_sym, y_sym), expr, "numpy")
                U = np.ones_like(X)
                V = f(X, Y)
            else:
                U = np.ones_like(X)
                V = expression(X, Y)
            
            # Normalize slopes for better visualization
            norm = np.sqrt(U**2 + V**2)
            U_norm = U / norm
            V_norm = V / norm
            
            # Plot slope field
            ax.quiver(X, Y, U_norm, V_norm, color=color, pivot='mid', scale=30, width=0.003)
            
            # Plot particular solutions if provided
            if solutions:
                from scipy.integrate import odeint
                
                # Convert expression to function for odeint
                if isinstance(expression, str):
                    def deriv(y, x):
                        return f(x, y)
                else:
                    def deriv(y, x):
                        return expression(x, y)
                
                # Generate x values for solutions
                x_sol = np.linspace(x_range[0], x_range[1], 100)
                
                for initial_y in solutions:
                    y_sol = odeint(deriv, initial_y, x_sol)
                    ax.plot(x_sol, y_sol, label=f"y({x_range[0]}) = {initial_y}")
                
                ax.legend()
            
            # Set labels and title
            ax.set_xlabel(x_label)
            ax.set_ylabel(y_label)
            ax.set_title(title)
            
            # Set limits
            ax.set_xlim(x_range)
            ax.set_ylim(y_range)
            
            # Add grid
            ax.grid(True, alpha=0.3)
            
            # Save or encode the figure
            if save_path:
                # Create directory if it doesn't exist
                os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
                
                # Save the figure
                plt.savefig(save_path)
                plt.close(fig)
                
                return {
                    "success": True,
                    "plot_type": "slope_field",
                    "file_path": save_path,
                    "data": {
                        "expression": str(expression) if isinstance(expression, str) else "custom_function",
                        "x_range": x_range,
                        "y_range": y_range,
                        "solutions": solutions
                    }
                }
            else:
                # Convert to base64
                import io
                import base64
                
                buffer = io.BytesIO()
                plt.savefig(buffer, format='png')
                plt.close(fig)
                
                buffer.seek(0)
                image_png = buffer.getvalue()
                buffer.close()
                
                image_base64 = base64.b64encode(image_png).decode('utf-8')
                
                return {
                    "success": True,
                    "plot_type": "slope_field",
                    "base64_image": image_base64,
                    "data": {
                        "expression": str(expression) if isinstance(expression, str) else "custom_function",
                        "x_range": x_range,
                        "y_range": y_range,
                        "solutions": solutions
                    }
                }
                
        except Exception as e:
            return {"success": False, "error": f"Error in slope field visualization: {str(e)}"}

    def _plot_time_series(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Plot a time series visualization."""
        try:
            # Extract parameters
            data = parameters.get("data")
            times = parameters.get("times")
            
            if data is None:
                return {"success": False, "error": "Missing required parameter: data"}
                
            # Handle optional parameters
            title = parameters.get("title", "Time Series")
            x_label = parameters.get("x_label", "Time")
            y_label = parameters.get("y_label", "Value")
            figsize = parameters.get("figsize", (12, 6))
            color = parameters.get("color", "blue")
            style = parameters.get("style", "-")
            markers = parameters.get("markers", None)
            show_grid = parameters.get("show_grid", True)
            
            # Multiple series support
            series_names = parameters.get("series_names")
            
            # Create times array if not provided
            if times is None:
                # Check if we're dealing with multiple series
                if isinstance(data[0], list) or isinstance(data[0], np.ndarray):
                    series_length = len(data[0])
                    times = np.arange(series_length)
                else:
                    times = np.arange(len(data))
            
            # Determine output path
            save_path = None
            if parameters.get("save", True):
                filename = parameters.get("filename")
                if not filename:
                    filename = f"time_series_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.{self.default_format}"
                save_path = os.path.join(self.storage_dir, filename)
            
            # Create the plot
            fig, ax = plt.subplots(figsize=figsize)
            
            # Plot time series
            # Check if we're dealing with multiple series
            if isinstance(data[0], list) or (isinstance(data[0], np.ndarray) and data[0].ndim > 0):
                # Multiple series
                for i, series in enumerate(data):
                    series_color = color[i] if isinstance(color, list) else None
                    series_style = style[i] if isinstance(style, list) else style
                    marker = markers[i] if markers and isinstance(markers, list) else markers
                    
                    # Use provided series name or generate one
                    series_label = series_names[i] if series_names else f"Series {i+1}"
                    
                    ax.plot(times, series, series_style, color=series_color, marker=marker, label=series_label)
                
                # Add legend for multiple series
                ax.legend()
            else:
                # Single series
                ax.plot(times, data, style, color=color, marker=markers)
            
            # Set labels and title
            ax.set_xlabel(x_label)
            ax.set_ylabel(y_label)
            ax.set_title(title)
            
            # Add grid if requested
            if show_grid:
                ax.grid(True, alpha=0.3)
            
            # Save or encode the figure
            if save_path:
                # Create directory if it doesn't exist
                os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
                
                # Save the figure
                plt.savefig(save_path)
                plt.close(fig)
                
                return {
                    "success": True,
                    "plot_type": "time_series",
                    "file_path": save_path,
                    "data": {
                        "series_count": 1 if not isinstance(data[0], (list, np.ndarray)) else len(data),
                        "time_points": len(times)
                    }
                }
            else:
                # Convert to base64
                import io
                import base64
                
                buffer = io.BytesIO()
                plt.savefig(buffer, format='png')
                plt.close(fig)
                
                buffer.seek(0)
                image_png = buffer.getvalue()
                buffer.close()
                
                image_base64 = base64.b64encode(image_png).decode('utf-8')
                
                return {
                    "success": True,
                    "plot_type": "time_series",
                    "base64_image": image_base64,
                    "data": {
                        "series_count": 1 if not isinstance(data[0], (list, np.ndarray)) else len(data),
                        "time_points": len(times)
                    }
                }
                
        except Exception as e:
            return {"success": False, "error": f"Error in time series visualization: {str(e)}"}

    def _plot_correlation_matrix(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Plot a correlation matrix visualization."""
        try:
            # Extract parameters
            data = parameters.get("data")
            
            if data is None:
                return {"success": False, "error": "Missing required parameter: data"}
                
            # Handle optional parameters
            title = parameters.get("title", "Correlation Matrix")
            figsize = parameters.get("figsize", (10, 8))
            cmap = parameters.get("cmap", "coolwarm")
            vmin = parameters.get("vmin", -1)
            vmax = parameters.get("vmax", 1)
            labels = parameters.get("labels")
            annotate = parameters.get("annotate", True)
            
            # Determine output path
            save_path = None
            if parameters.get("save", True):
                filename = parameters.get("filename")
                if not filename:
                    filename = f"correlation_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.{self.default_format}"
                save_path = os.path.join(self.storage_dir, filename)
            
            # Calculate correlation matrix if not already provided
            if isinstance(data, np.ndarray) and data.ndim == 2:
                # If data is a 2D array and already appears to be a correlation matrix
                if data.shape[0] == data.shape[1] and np.allclose(np.diag(data), 1.0):
                    corr_matrix = data
                else:
                    # Compute correlation matrix from data
                    corr_matrix = np.corrcoef(data, rowvar=False)
            else:
                # Convert to numpy array and compute correlation
                if isinstance(data[0], (list, np.ndarray)):
                    # Data is a list of lists/arrays
                    data_np = np.array(data)
                    # Transpose if variables are in rows
                    if parameters.get("variables_in_rows", False):
                        data_np = data_np.T
                    corr_matrix = np.corrcoef(data_np, rowvar=False)
                else:
                    return {"success": False, "error": "Data format not supported for correlation matrix"}
            
            # Generate default labels if not provided
            if labels is None:
                labels = [f"Var {i+1}" for i in range(corr_matrix.shape[0])]
                
            # Create the plot
            fig, ax = plt.subplots(figsize=figsize)
            
            # Plot heatmap
            im = ax.imshow(corr_matrix, cmap=cmap, vmin=vmin, vmax=vmax)
            
            # Add colorbar
            cbar = plt.colorbar(im, ax=ax)
            cbar.set_label('Correlation Coefficient')
            
            # Set title
            ax.set_title(title)
            
            # Set tick labels
            ax.set_xticks(np.arange(len(labels)))
            ax.set_yticks(np.arange(len(labels)))
            ax.set_xticklabels(labels, rotation=45, ha="right")
            ax.set_yticklabels(labels)
            
            # Loop over data dimensions and create text annotations
            if annotate:
                for i in range(len(labels)):
                    for j in range(len(labels)):
                        text_color = "white" if abs(corr_matrix[i, j]) > 0.5 else "black"
                        ax.text(j, i, f"{corr_matrix[i, j]:.2f}",
                               ha="center", va="center", color=text_color)
            
            # Save or encode the figure
            if save_path:
                # Create directory if it doesn't exist
                os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
                
                # Save the figure
                plt.savefig(save_path)
                plt.close(fig)
                
                return {
                    "success": True,
                    "plot_type": "correlation_matrix",
                    "file_path": save_path,
                    "data": {
                        "correlation_matrix": corr_matrix.tolist(),
                        "variables": labels
                    }
                }
            else:
                # Convert to base64
                import io
                import base64
                
                buffer = io.BytesIO()
                plt.savefig(buffer, format='png')
                plt.close(fig)
                
                buffer.seek(0)
                image_png = buffer.getvalue()
                buffer.close()
                
                image_base64 = base64.b64encode(image_png).decode('utf-8')
                
                return {
                    "success": True,
                    "plot_type": "correlation_matrix",
                    "base64_image": image_base64,
                    "data": {
                        "correlation_matrix": corr_matrix.tolist(),
                        "variables": labels
                    }
                }
                
        except Exception as e:
            return {"success": False, "error": f"Error in correlation matrix visualization: {str(e)}"} 