#!/usr/bin/env python3
"""
Test script to verify hyperboloid equation handling.
This specifically tests equations like z^2-x^2-y^2=-4 which were problematic.
"""

import os
import sys
import logging
import uuid
from datetime import datetime
from typing import Dict, Any, List

# Add the current directory to sys.path to ensure imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the visualization agent and relevant modules
from visualization.agent.super_viz_agent import SuperVisualizationAgent
from visualization.plotting.plot_3d import preprocess_expression

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_expression_preprocessing():
    """Test the preprocessing of hyperboloid expressions."""
    test_cases = [
        "z^2-x^2-y^2=-4",
        "z**2-x**2-y**2=-4",
        "z^2 - x^2 - y^2 = -4",
        "z^2 = x^2 + y^2 - 4",
        "-4 = z^2 - x^2 - y^2",
        "x^2 + y^2 - z^2 = 4"
    ]
    
    print("\nTESTING EXPRESSION PREPROCESSING:")
    print("=================================")
    
    for expr in test_cases:
        processed = preprocess_expression(expr)
        print(f"Original: {expr}")
        print(f"Processed: {processed}")
        print("-" * 50)

def create_test_message(expression: str, title: str) -> Dict[str, Any]:
    """Create a test message with the given expression."""
    message_id = str(uuid.uuid4())
    filename = f"test_hyperboloid_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.png"
    
    return {
        "header": {
            "message_id": message_id,
            "message_type": "visualization_request",
            "timestamp": datetime.now().isoformat()
        },
        "body": {
            "visualization_type": "function_3d",
            "parameters": {
                "expression": expression,
                "title": title,
                "x_range": [-5, 5],
                "y_range": [-5, 5],
                "filename": filename
            }
        }
    }

def test_hyperboloid_rendering():
    """Test hyperboloid rendering with different variations."""
    # Initialize the agent
    test_dir = "test_visualizations"
    os.makedirs(test_dir, exist_ok=True)
    agent = SuperVisualizationAgent({"storage_dir": test_dir})
    
    # Test cases - different ways to express the same hyperboloid
    test_cases = [
        ("z^2-x^2-y^2=-4", "Hyperboloid Form 1"),
        ("z^2 = x^2 + y^2 - 4", "Hyperboloid Form 2"),
        ("z^2 - x^2 - y^2 + 4 = 0", "Hyperboloid Form 3"),
        ("x^2 + y^2 - z^2 = 4", "Hyperboloid Form 4 (One Sheet)"),
        ("z^2 - x^2 - y^2 = 1", "Hyperboloid of Two Sheets"),
        ("x^2 + y^2 - z^2 = 1", "Hyperboloid of One Sheet"),
        # Add the problematic case with unicode characters
        ("𝑧^2−𝑥^2−𝑦^2=−4", "Hyperboloid With Unicode"),
    ]
    
    results = []
    
    # Run tests
    for expr, title in test_cases:
        logger.info(f"Testing hyperboloid equation: {expr}")
        message = create_test_message(expr, title)
        
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
    print("HYPERBOLOID TEST RESULTS")
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
    # First test preprocessing
    test_expression_preprocessing()
    
    # Then test actual rendering
    test_hyperboloid_rendering() 