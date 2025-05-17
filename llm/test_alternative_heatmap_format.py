#!/usr/bin/env python3
"""
Test script to verify heatmap visualization with alternative format parameters.
Tests the heatmap generation with x_data, y_data, and values instead of a 2D matrix.
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

def test_heatmap_with_alternative_format():
    """Test the heatmap visualization with alternative format."""
    # Initialize the agent with a test directory
    test_dir = "test_visualizations"
    os.makedirs(test_dir, exist_ok=True)
    agent = SuperVisualizationAgent({"storage_dir": test_dir})
    
    # Test the alternative format based on the student attendance example
    print("\nTest: Student Attendance Heatmap (alternative format)")
    
    # Define student attendance data
    students = ["Student A", "Student B", "Student C", "Student D", "Student E"]
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    
    # Hours attended by each student each day (flattened in row-major order)
    attendance = [
        4, 5, 3, 2, 4,  # Student A (Mon-Fri)
        5, 5, 4, 4, 5,  # Student B (Mon-Fri)
        3, 2, 4, 3, 2,  # Student C (Mon-Fri)
        4, 4, 4, 5, 4,  # Student D (Mon-Fri)
        2, 3, 3, 2, 3   # Student E (Mon-Fri)
    ]
    
    message = create_message("heatmap", {
        "x_data": students,
        "y_data": days,
        "values": attendance,
        "title": "Student Attendance Heatmap",
        "filename": "test_student_attendance.png"
    })
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")
    
    # Also test the standard 2D matrix format for comparison
    print("\nTest: Student Attendance Heatmap (standard 2D matrix format)")
    
    # Reshape the data into a 2D matrix (days × students)
    attendance_matrix = [
        [4, 5, 3, 4, 2],  # Monday
        [5, 5, 2, 4, 3],  # Tuesday
        [3, 4, 4, 4, 3],  # Wednesday
        [2, 4, 3, 5, 2],  # Thursday
        [4, 5, 2, 4, 3]   # Friday
    ]
    
    message = create_message("heatmap", {
        "data": attendance_matrix,
        "x_labels": students,
        "y_labels": days,
        "title": "Student Attendance Heatmap (Matrix Format)",
        "filename": "test_student_attendance_matrix.png"
    })
    
    result = agent.process_message(message)
    print(f"Success: {result.get('success', False)}")
    print(f"Error: {result.get('error', 'No error')}")
    print(f"File path: {result.get('file_path', 'No file')}")

if __name__ == "__main__":
    test_heatmap_with_alternative_format()
    print("\nTests completed!") 