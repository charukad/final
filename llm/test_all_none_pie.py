#!/usr/bin/env python3
"""
Test script to verify pie chart visualization with all None values.
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

def test_pie_chart_with_all_none_values():
    """Test the pie chart visualization with all None values."""
    # Initialize the agent with a test directory
    test_dir = "test_visualizations"
    os.makedirs(test_dir, exist_ok=True)
    agent = SuperVisualizationAgent({"storage_dir": test_dir})
    
    # Create a pie chart with all None values
    print("\nTest: Pie Chart with all None values")
    message = create_message("pie", {
        "values": [None, None, None],
        "labels": ["A", "B", "C"],
        "title": "Pie Chart with All None Values",
        "filename": "test_all_none_pie.png"
    })
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")

if __name__ == "__main__":
    test_pie_chart_with_all_none_values()
    print("\nTest completed!") 