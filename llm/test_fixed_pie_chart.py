#!/usr/bin/env python3
"""
Test script to verify the fixed pie chart visualization functionality.
This tests the pie chart generation with various edge cases to ensure our fix works.
"""

import os
import sys
import json
import uuid
from typing import Dict, Any, List

# Add the current directory to sys.path to ensure imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the visualization agent
from visualization.agent.super_viz_agent import SuperVisualizationAgent

def create_message(vis_type: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Create a message for the visualization agent."""
    message_id = str(uuid.uuid4())
    return {
        "header": {
            "message_id": message_id,
            "message_type": "visualization_request",
            "timestamp": "2023-08-15T12:00:00Z"
        },
        "body": {
            "visualization_type": vis_type,
            "parameters": params
        }
    }

def test_pie_chart_with_edge_cases():
    """Test the pie chart visualization with various edge cases."""
    # Initialize the agent with a test directory
    test_dir = "test_visualizations"
    os.makedirs(test_dir, exist_ok=True)
    agent = SuperVisualizationAgent({"storage_dir": test_dir})
    
    # Test case 1: Values with None
    print("\nTest Case 1: Values with None")
    message = create_message("pie", {
        "values": [None, 30, 70],
        "labels": ["A", "B", "C"],
        "title": "Pie Chart with None Value",
        "filename": "test_none_pie.png"
    })
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")
    
    # Test case 2: No values parameter
    print("\nTest Case 2: No values parameter")
    message = create_message("pie", {
        "labels": ["X", "Y", "Z"],
        "title": "Pie Chart without Values Parameter",
        "filename": "test_no_values_pie.png"
    })
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")
    
    # Test case 3: Empty parameters
    print("\nTest Case 3: Empty parameters")
    message = create_message("pie", {})
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")
    
    # Test case 4: Negative values
    print("\nTest Case 4: Negative values")
    message = create_message("pie", {
        "values": [-10, 20, -30],
        "labels": ["D", "E", "F"],
        "title": "Pie Chart with Negative Values",
        "filename": "test_negative_pie.png"
    })
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")
    
    # Test case 5: All zeros
    print("\nTest Case 5: All zeros")
    message = create_message("pie", {
        "values": [0, 0, 0],
        "labels": ["G", "H", "I"],
        "title": "Pie Chart with All Zeros",
        "filename": "test_zeros_pie.png"
    })
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")
    
    # Test case 6: Normal values (for comparison)
    print("\nTest Case 6: Normal values (for comparison)")
    message = create_message("pie", {
        "values": [25, 40, 35],
        "labels": ["Category A", "Category B", "Category C"],
        "title": "Normal Pie Chart",
        "filename": "test_normal_pie.png"
    })
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")
    
    # Test case 7: Mismatched labels and values
    print("\nTest Case 7: Mismatched labels and values")
    message = create_message("pie", {
        "values": [10, 20, 30, 40],
        "labels": ["J", "K"],
        "title": "Pie Chart with Mismatched Labels",
        "filename": "test_mismatched_pie.png"
    })
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")

if __name__ == "__main__":
    test_pie_chart_with_edge_cases()
    print("\nAll tests completed!") 