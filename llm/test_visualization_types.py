#!/usr/bin/env python3
"""
Test script to verify different visualization types are working correctly.
This helps diagnose issues where all visualization requests are being identified as a single type.
"""

import os
import sys
import uuid
from typing import Dict, Any

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

def test_visualization_types():
    """Test different visualization types to verify they work correctly."""
    # Initialize the agent with a test directory
    test_dir = "test_visualizations"
    os.makedirs(test_dir, exist_ok=True)
    agent = SuperVisualizationAgent({"storage_dir": test_dir})
    
    # Get agent capabilities first to see all supported types
    capabilities = agent.get_capabilities()
    supported_types = capabilities.get("supported_types", [])
    
    print(f"\nSupported visualization types ({len(supported_types)}):")
    for i, vis_type in enumerate(sorted(supported_types)):
        print(f"{i+1}. {vis_type}")
    
    # Test a 3D function plot
    print("\nTest: 3D Function Plot")
    message = create_message("function_3d", {
        "expression": "x**2 + y**2",  # Simple paraboloid
        "x_range": [-5, 5],
        "y_range": [-5, 5],
        "title": "3D Paraboloid",
        "filename": "test_3d_function.png"
    })
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")
    
    # Test a 2D function plot
    print("\nTest: 2D Function Plot")
    message = create_message("function_2d", {
        "expression": "x**2",  # Simple parabola
        "x_range": [-5, 5],
        "title": "2D Parabola",
        "filename": "test_2d_function.png"
    })
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")
    
    # Test a pie chart
    print("\nTest: Pie Chart")
    message = create_message("pie", {
        "values": [25, 40, 35],
        "labels": ["Category A", "Category B", "Category C"],
        "title": "Sample Pie Chart",
        "filename": "test_pie_chart.png"
    })
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")
    
    # Test a heatmap
    print("\nTest: Heatmap")
    message = create_message("heatmap", {
        "data": [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
        "title": "Sample Heatmap",
        "filename": "test_heatmap.png"
    })
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")
    
    # Test a bar chart
    print("\nTest: Bar Chart")
    message = create_message("bar", {
        "values": [10, 20, 30, 25, 15],
        "labels": ["A", "B", "C", "D", "E"],
        "title": "Sample Bar Chart",
        "filename": "test_bar_chart.png"
    })
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")

if __name__ == "__main__":
    test_visualization_types()
    print("\nTests completed!") 