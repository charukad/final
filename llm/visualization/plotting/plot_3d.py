import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import numpy as np
import sympy as sp
from typing import Dict, Any, Tuple, Optional, List, Union
import io
import base64
import os
from datetime import datetime
import uuid
import re
import logging

def plot_function_3d(
    function_expr: Union[sp.Expr, str], 
    x_range: Tuple[float, float] = (-5, 5),
    y_range: Tuple[float, float] = (-5, 5),
    num_points: int = 50, 
    title: Optional[str] = None,
    x_label: str = "x",
    y_label: str = "y",
    z_label: str = "z",
    figsize: Tuple[int, int] = (10, 8),
    cmap: str = 'viridis',
    view_angle: Tuple[float, float] = (30, 30),
    save_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate a 3D surface plot of a mathematical function f(x,y).
    
    Args:
        function_expr: SymPy expression or string to plot (must be a function of x and y)
        x_range: Tuple with (min_x, max_x) values
        y_range: Tuple with (min_y, max_y) values
        num_points: Number of points to sample in each dimension
        title: Plot title (defaults to LaTeX representation if None)
        x_label: Label for x-axis
        y_label: Label for y-axis
        z_label: Label for z-axis
        figsize: Figure size in inches (width, height)
        cmap: Colormap for the surface
        view_angle: Initial viewing angle (elevation, azimuth)
        save_path: Path to save the figure (if None, will be returned as base64)
        
    Returns:
        Dictionary with plot information, including base64 encoded image or path
    """
    # Setup figure
    fig = plt.figure(figsize=figsize)
    ax = fig.add_subplot(111, projection='3d')
    
    # Generate x and y values
    x = np.linspace(x_range[0], x_range[1], num_points)
    y = np.linspace(y_range[0], y_range[1], num_points)
    X, Y = np.meshgrid(x, y)
    
    # Convert string expression to SymPy if needed
    if isinstance(function_expr, str):
        try:
            # Pre-process the expression to handle common issues
            function_expr = preprocess_expression(function_expr)
            
            # Setup symbols
            x_sym, y_sym = sp.symbols('x y')
            
            # Parse the expression
            try:
                # Import sympy functions for use in parsing
                from sympy import sqrt, Abs, sign, sin, cos, tan, exp, log
                
                # Import the globals from sympy to enable parsing of sqrt, abs, etc.
                # This will ensure that sympy functions are used during parsing
                function_expr = sp.sympify(function_expr, locals={'sqrt': sqrt, 'Abs': Abs, 'sign': sign,
                                                                 'sin': sin, 'cos': cos, 'tan': tan,
                                                                 'exp': exp, 'log': log})
            except Exception as parse_error:
                # If direct parsing fails, try additional preprocessing
                logging.warning(f"Initial expression parsing failed: {parse_error}")
                
                # Try alternative parsing approaches
                # 1. Try replacing ^ with ** if not already done
                if '^' in function_expr:
                    function_expr = function_expr.replace('^', '**')
                    
                # 2. Try wrapping negative exponents in parentheses
                function_expr = re.sub(r'(\w+)\*\*-(\d+)', r'(\1)**(-\2)', function_expr)
                
                # 3. Try again with improved expression
                logging.info(f"Retrying with preprocessed expression: {function_expr}")
                function_expr = sp.sympify(function_expr)
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to parse expression: {str(e)}"
            }
    
    # Convert SymPy expression to NumPy function
    x_sym, y_sym = sp.symbols('x y')
    
    try:
        f = sp.lambdify((x_sym, y_sym), function_expr, "numpy")
        
        # Use try/except to handle domain errors and create a safe evaluation
        def safe_eval(X, Y):
            try:
                result = f(X, Y)
                # Replace infinities with NaN
                return np.where(np.isfinite(result), result, np.nan)
            except Exception as eval_error:
                logging.warning(f"Evaluation error: {eval_error}")
                # Create a masked array filled with NaNs where the function is undefined
                return np.full_like(X, np.nan)
        
        Z = safe_eval(X, Y)
        
        # Check for infinities or NaN values
        mask = np.isfinite(Z)
        if not np.any(mask):
            # If all values are non-finite, try to provide a fallback
            logging.warning("No finite values in the specified range. Adjusting domain...")
            
            # Try with a smaller domain to see if we can get valid results
            x_adjusted = np.linspace(x_range[0]/2, x_range[1]/2, num_points)
            y_adjusted = np.linspace(y_range[0]/2, y_range[1]/2, num_points)
            X_adj, Y_adj = np.meshgrid(x_adjusted, y_adjusted)
            
            Z = safe_eval(X_adj, Y_adj)
            mask = np.isfinite(Z)
            
            if not np.any(mask):
                return {
                    "success": False,
                    "error": "No finite values in the function domain. Try adjusting the range or checking the expression."
                }
            else:
                # Update our grid with the adjusted version
                X, Y = X_adj, Y_adj
                logging.info("Successfully found finite values with adjusted domain.")
        
        # Replace infinities and NaNs with NaN for plotting
        Z = np.where(mask, Z, np.nan)
        
        # Plot the surface
        surf = ax.plot_surface(X, Y, Z, cmap=cmap, alpha=0.8, linewidth=0)
        
        # Add color bar
        fig.colorbar(surf, ax=ax, shrink=0.5, aspect=5)
        
        # Set labels
        ax.set_xlabel(x_label)
        ax.set_ylabel(y_label)
        ax.set_zlabel(z_label)
        
        # Set view angle
        ax.view_init(elev=view_angle[0], azim=view_angle[1])
        
        # Add title if provided, otherwise use LaTeX representation
        if title:
            ax.set_title(title)
        else:
            ax.set_title(f"$f(x,y) = {sp.latex(function_expr)}$")
        
        # Save or encode the figure
        if save_path:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
            
            # Save the figure
            plt.savefig(save_path)
            plt.close(fig)
            
            return {
                "success": True,
                "plot_type": "3d_function",
                "file_path": save_path,
                "data": {
                    "expression": str(function_expr),
                    "expression_latex": sp.latex(function_expr),
                    "x_range": x_range,
                    "y_range": y_range,
                    "finite_points": np.sum(mask)
                }
            }
        else:
            # Convert to base64 for embedding in web applications
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png')
            plt.close(fig)
            
            buffer.seek(0)
            image_png = buffer.getvalue()
            buffer.close()
            
            image_base64 = base64.b64encode(image_png).decode('utf-8')
            
            return {
                "success": True,
                "plot_type": "3d_function",
                "base64_image": image_base64,
                "data": {
                    "expression": str(function_expr),
                    "expression_latex": sp.latex(function_expr),
                    "x_range": x_range,
                    "y_range": y_range,
                    "finite_points": np.sum(mask)
                }
            }
    
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to plot function: {str(e)}"
        }

def preprocess_expression(expr: str) -> str:
    """
    Preprocess a mathematical expression string to handle common issues.
    
    Args:
        expr: The original expression string
        
    Returns:
        Preprocessed expression string
    """
    # Handle variable naming and common replacements
    expr = expr.strip()
    
    # 1. Remove any "z = " or "f(x,y) = " prefixes
    if expr.startswith(('z=', 'z =', 'f(x,y)=', 'f(x,y) =', 'f(x, y)=', 'f(x, y) =')):
        expr = expr.split('=', 1)[1].strip()
    
    # 2. Handle implicit equations like z^2 = x^2 + y^2
    if '=' in expr:
        # Extract sides of the equation
        left_side, right_side = expr.split('=', 1)
        left_side = left_side.strip()
        right_side = right_side.strip()
        
        # Check if this is a quadric surface with z^2
        if 'z^2' in left_side or 'z**2' in left_side or 'z^2' in right_side or 'z**2' in right_side:
            # Put equation in the form: z^2 = f(x,y)
            if 'z^2' in left_side or 'z**2' in left_side:
                # Already in form z^2 + ... = ...
                z_side = left_side
                other_side = right_side
            else:
                # In form ... = z^2 + ...
                z_side = right_side
                other_side = left_side
                
            # Standardize notation
            z_side = z_side.replace('^', '**')
            other_side = other_side.replace('^', '**')
            
            # Extract z^2 term from z_side
            z_squared_pattern = r'([+-]?\s*\d*\.?\d*)\s*\*?\s*z\*\*2'
            z_squared_match = re.search(z_squared_pattern, z_side)
            
            z_coef = 1.0
            if z_squared_match:
                coef_str = z_squared_match.group(1).strip()
                if coef_str in ['+', '']:
                    z_coef = 1.0
                elif coef_str == '-':
                    z_coef = -1.0
                else:
                    try:
                        z_coef = float(coef_str)
                    except:
                        pass
                
            # Remove z^2 term from z_side
            z_side = re.sub(z_squared_pattern, '', z_side)
            
            # Combine remaining terms
            if z_side.strip():
                # Move remaining terms from left to right with sign change
                other_expr = f"{other_side} - ({z_side})"
            else:
                other_expr = other_side
                
            # Final expression: z = sqrt(other_expr / z_coef) with proper sign handling
            if z_coef != 0:
                # Important: Use sympy-compatible functions here, not numpy
                # We'll use sympy.sqrt and sympy.sign, which get converted to numpy versions later
                expr = f"sqrt(Abs(({other_expr}) / {z_coef})) * sign(({other_expr}) / {z_coef})"
            else:
                # Can't solve for z if coefficient is 0
                expr = "0"
        else:
            # For other equation types, just solve for z if possible
            if 'z' in left_side and 'z' not in right_side:
                # Simplest case: z = right_side
                if left_side.strip() == 'z':
                    expr = right_side
                else:
                    # Attempt to solve for z (limited capability)
                    expr = right_side
            elif 'z' in right_side and 'z' not in left_side:
                # Form: left_side = z
                if right_side.strip() == 'z':
                    expr = left_side
                else:
                    # Attempt to solve for z (limited capability)
                    expr = left_side
    
    # 3. Replace caret notation with power notation
    expr = re.sub(r'(\w+|\))\s*\^\s*(\d+)', r'\1**\2', expr)
    # Also handle expressions with parentheses
    expr = re.sub(r'\(([^)]+)\)\s*\^\s*(\d+)', r'(\1)**\2', expr)
    
    # 4. Handle negative exponents
    expr = re.sub(r'(\w+|\))\s*\^\s*-\s*(\d+)', r'\1**(-\2)', expr)
    expr = re.sub(r'\(([^)]+)\)\s*\^\s*-\s*(\d+)', r'(\1)**(-\2)', expr)
    
    # 5. Fix common mathematical constants - use sympy versions
    expr = expr.replace('pi', 'Pi')
    
    # 6. Handle fraction notation with inverse power
    expr = expr.replace('1/', '1.0/')
    
    # 7. Check for balanced parentheses and add missing ones
    open_parens = expr.count('(')
    close_parens = expr.count(')')
    if open_parens > close_parens:
        expr += ')' * (open_parens - close_parens)
    
    # 8. Replace unicode math characters with ASCII
    # This helps with both parsing and encoding issues
    expr = expr.replace('−', '-')  # Unicode minus sign to ASCII hyphen
    expr = expr.replace('𝑥', 'x')  # Unicode x to ASCII x
    expr = expr.replace('𝑦', 'y')  # Unicode y to ASCII y  
    expr = expr.replace('𝑧', 'z')  # Unicode z to ASCII z
    
    return expr

def plot_parametric_3d(
    x_expr: Union[sp.Expr, str],
    y_expr: Union[sp.Expr, str],
    z_expr: Union[sp.Expr, str],
    t_range: Tuple[float, float] = (0, 2*np.pi),
    num_points: int = 1000,
    title: Optional[str] = None,
    x_label: str = "x",
    y_label: str = "y",
    z_label: str = "z",
    figsize: Tuple[int, int] = (10, 8),
    color: str = 'blue',
    view_angle: Tuple[float, float] = (30, 30),
    save_path: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate a 3D parametric curve plot.
    
    Args:
        x_expr: SymPy expression or string for x(t)
        y_expr: SymPy expression or string for y(t)
        z_expr: SymPy expression or string for z(t)
        t_range: Tuple with (min_t, max_t) values
        num_points: Number of points to sample
        title: Plot title
        x_label: Label for x-axis
        y_label: Label for y-axis
        z_label: Label for z-axis
        figsize: Figure size in inches (width, height)
        color: Color for the curve
        view_angle: Initial viewing angle (elevation, azimuth)
        save_path: Path to save the figure (if None, will be returned as base64)
        
    Returns:
        Dictionary with plot information, including base64 encoded image or path
    """
    # Setup figure
    fig = plt.figure(figsize=figsize)
    ax = fig.add_subplot(111, projection='3d')
    
    # Generate t values
    t_vals = np.linspace(t_range[0], t_range[1], num_points)
    
    # Process expressions
    exprs = []
    for expr in [x_expr, y_expr, z_expr]:
        if isinstance(expr, str):
            try:
                t = sp.symbols('t')
                expr = sp.sympify(expr)
                exprs.append(expr)
            except Exception as e:
                return {
                    "success": False,
                    "error": f"Failed to parse expression: {str(e)}"
                }
        else:
            exprs.append(expr)
    
    # Convert SymPy expressions to NumPy functions
    t = sp.symbols('t')
    
    try:
        x_func = sp.lambdify(t, exprs[0], "numpy")
        y_func = sp.lambdify(t, exprs[1], "numpy")
        z_func = sp.lambdify(t, exprs[2], "numpy")
        
        # Compute values
        x_vals = x_func(t_vals)
        y_vals = y_func(t_vals)
        z_vals = z_func(t_vals)
        
        # Check for infinities or NaN values
        mask = np.isfinite(x_vals) & np.isfinite(y_vals) & np.isfinite(z_vals)
        if not np.any(mask):
            return {
                "success": False,
                "error": "No finite values in the specified range"
            }
        
        # Plot the curve
        ax.plot(x_vals[mask], y_vals[mask], z_vals[mask], color=color)
        
        # Set labels
        ax.set_xlabel(x_label)
        ax.set_ylabel(y_label)
        ax.set_zlabel(z_label)
        
        # Set view angle
        ax.view_init(elev=view_angle[0], azim=view_angle[1])
        
        # Add title if provided
        if title:
            ax.set_title(title)
        else:
            ax.set_title("Parametric Curve")
        
        # Save or encode the figure
        if save_path:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(os.path.abspath(save_path)), exist_ok=True)
            
            # Save the figure
            plt.savefig(save_path)
            plt.close(fig)
            
            return {
                "success": True,
                "plot_type": "3d_parametric",
                "file_path": save_path,
                "data": {
                    "x_expression": str(exprs[0]),
                    "y_expression": str(exprs[1]),
                    "z_expression": str(exprs[2]),
                    "t_range": t_range,
                    "finite_points": np.sum(mask)
                }
            }
        else:
            # Convert to base64 for embedding in web applications
            buffer = io.BytesIO()
            plt.savefig(buffer, format='png')
            plt.close(fig)
            
            buffer.seek(0)
            image_png = buffer.getvalue()
            buffer.close()
            
            image_base64 = base64.b64encode(image_png).decode('utf-8')
            
            return {
                "success": True,
                "plot_type": "3d_parametric",
                "base64_image": image_base64,
                "data": {
                    "x_expression": str(exprs[0]),
                    "y_expression": str(exprs[1]),
                    "z_expression": str(exprs[2]),
                    "t_range": t_range,
                    "finite_points": np.sum(mask)
                }
            }
    
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to plot parametric curve: {str(e)}"
        }

def generate_unique_filename(base_dir: str, prefix: str = "plot", extension: str = "png") -> str:
    """Generate a unique filename for saving plots."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    return os.path.join(base_dir, f"{prefix}_{timestamp}_{unique_id}.{extension}")
