#!/usr/bin/env python3
"""
Test script to verify complex mathematical expressions work correctly.
This helps validate the fixes for handling complex expressions like negative exponents,
fractions, and special mathematical functions.
"""

import os
import sys
import logging
import uuid
from datetime import datetime
from typing import Dict, Any, List

# Add the current directory to sys.path to ensure imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the visualization agent
from visualization.agent.super_viz_agent import SuperVisualizationAgent

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_test_message(vis_type: str, expression: str, title: str) -> Dict[str, Any]:
    """Create a test message with the given expression."""
    message_id = str(uuid.uuid4())
    filename = f"test_{vis_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.png"
    
    return {
        "header": {
            "message_id": message_id,
            "message_type": "visualization_request",
            "timestamp": datetime.now().isoformat()
        },
        "body": {
            "visualization_type": vis_type,
            "parameters": {
                "expression": expression,
                "title": title,
                "filename": filename
            }
        }
    }

def test_complex_expressions():
    """Test complex mathematical expressions for visualization."""
    # Initialize the agent
    test_dir = "test_visualizations"
    os.makedirs(test_dir, exist_ok=True)
    agent = SuperVisualizationAgent({"storage_dir": test_dir})
    
    # Define test cases - each is (expression, title)
    test_cases = [
        # Basic test cases
        ("x**2 + y**2", "Simple Paraboloid"),
        
        # Negative exponents
        ("(x**2 + y**2)**(-1)", "Inverse Quadratic"),
        ("1/(x**2 + y**2)", "Another Inverse Quadratic"),
        ("(x**2 + y**2)**(-2)", "Inverse Quartic"),
        
        # With z= prefix
        ("z = (x**2 + y**2)**-2", "With z= prefix"),
        
        # With fractions
        ("1/(x**2 + y**2 + 1)", "Fraction Expression"),
        ("x**2/(1 + y**2)", "Mixed Fraction"),
        
        # Trigonometric functions
        ("sin(x) * cos(y)", "Trigonometric Product"),
        ("sin(sqrt(x**2 + y**2))", "Sine of Distance"),
        
        # Special surfaces
        ("1 - (x**2 + y**2)/9", "Circle Cap"),
        ("sqrt(9 - x**2 - y**2)", "Hemisphere"),
        
        # Complex expressions
        ("(exp(-x**2 - y**2))", "Gaussian Bell"),
        ("sin(x) * sin(y) / (x * y + 0.1)", "Complex Trigonometric"),
        
        # Expressions with bad syntax that should be fixed
        ("(x^2+y^2)^-2", "Bad Power Notation"),
        ("sin(x^2+y^2)", "Bad Power in Function"),
        ("1/((x^2+y^2)", "Missing Parenthesis"),
    ]
    
    results = []
    
    # Run tests
    for expr, title in test_cases:
        logger.info(f"Testing expression: {expr}")
        message = create_test_message("function_3d", expr, title)
        
        # Process the message and save the result
        result = agent.process_message(message)
        
        # Print the result
        logger.info(f"Result: {'SUCCESS' if result.get('success', False) else 'FAILURE'}")
        if not result.get('success', False):
            logger.error(f"Error: {result.get('error', 'Unknown error')}")
        
        # Store the result
        results.append({
            "expression": expr,
            "title": title,
            "success": result.get('success', False),
            "error": result.get('error'),
            "file_path": result.get('file_path')
        })
    
    # Print summary
    print("\n" + "="*80)
    print("TEST RESULTS SUMMARY")
    print("="*80)
    
    # Count successful and failed tests
    successful = sum(1 for r in results if r['success'])
    failed = len(results) - successful
    
    print(f"Total tests: {len(results)}")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    print("-"*80)
    
    # Print detailed results
    for i, result in enumerate(results):
        status = "✅ PASS" if result['success'] else "❌ FAIL"
        print(f"{i+1}. {status} | {result['expression']} | {result['title']}")
        if not result['success']:
            print(f"   Error: {result['error']}")
        else:
            print(f"   File: {result['file_path']}")
    
    print("="*80)

if __name__ == "__main__":
    test_complex_expressions() 