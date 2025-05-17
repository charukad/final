#!/usr/bin/env python3
"""
Test script to verify the fixed heatmap visualization functionality.
This tests the heatmap generation with empty data to ensure our fix works.
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

def test_heatmap_with_empty_data():
    """Test the heatmap visualization with empty data."""
    # Initialize the agent with a test directory
    test_dir = "test_visualizations"
    os.makedirs(test_dir, exist_ok=True)
    agent = SuperVisualizationAgent({"storage_dir": test_dir})
    
    # Test case 1: Empty data list
    print("\nTest Case 1: Empty data list")
    message = create_message("heatmap", {
        "data": [],
        "title": "Heatmap with Empty Data",
        "filename": "test_empty_heatmap.png"
    })
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")
    
    # Test case 2: No data parameter
    print("\nTest Case 2: No data parameter")
    message = create_message("heatmap", {
        "title": "Heatmap without Data Parameter",
        "filename": "test_no_data_heatmap.png"
    })
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")
    
    # Test case 3: Completely empty parameters
    print("\nTest Case 3: Empty parameters")
    message = create_message("heatmap", {})
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")
    
    # Test case 4: Normal data for comparison
    print("\nTest Case 4: Normal data (for comparison)")
    import numpy as np
    np.random.seed(42)
    data = np.random.rand(5, 5).tolist()
    
    message = create_message("heatmap", {
        "data": data,
        "title": "Normal Heatmap",
        "filename": "test_normal_heatmap.png"
    })
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")

if __name__ == "__main__":
    test_heatmap_with_empty_data()
    print("\nAll tests completed!") 