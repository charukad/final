#!/usr/bin/env python3
"""
Test script for histogram generation to verify fixes for handling None or empty data.
"""

import sys
import os
import json
from datetime import datetime
import logging
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import visualization agent
from visualization.agent.super_viz_agent import SuperVisualizationAgent

def test_histogram_with_data(viz_agent, data, title, filename_prefix=None):
    """Test histogram generation with specific data."""
    if filename_prefix is None:
        filename_prefix = "test"
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{filename_prefix}_histogram_{timestamp}.png"
    
    # Create message for visualization agent
    message = {
        "header": {
            "message_id": "test123",
            "sender": "test_histogram",
            "recipient": "visualization_agent",
            "timestamp": datetime.now().isoformat(),
            "message_type": "visualization_request"
        },
        "body": {
            "visualization_type": "histogram",
            "parameters": {
                "data": data,
                "title": title,
                "filename": filename
            }
        }
    }
    
    # Process message
    result = viz_agent.process_message(message)
    
    # Log result
    success = result.get("success", False)
    if success:
        logger.info(f"Successfully generated histogram: {result.get('file_path')}")
    else:
        logger.error(f"Failed to generate histogram: {result.get('error')}")
    
    return result

def main():
    """Run the histogram test with different data scenarios."""
    logger.info("Starting histogram generation test script")
    
    # Create visualization agent
    viz_agent = SuperVisualizationAgent({"storage_dir": "visualizations", "use_database": False})
    
    # Test cases
    test_cases = [
        {
            "data": None,
            "title": "Histogram with None data",
            "filename_prefix": "none_data"
        },
        {
            "data": [],
            "title": "Histogram with empty list",
            "filename_prefix": "empty_list"
        },
        {
            "data": [None, None, None],
            "title": "Histogram with all None values",
            "filename_prefix": "all_none"
        },
        {
            "data": [1, 2, None, 4, 5],
            "title": "Histogram with some None values",
            "filename_prefix": "some_none"
        },
        {
            "data": [5, 5, 6, 8, 9, 10, 11, 12],
            "title": "Distribution of Study Hours",
            "filename_prefix": "study_hours"
        },
        {
            "data": np.random.normal(10, 2, 1000).tolist(),
            "title": "Normal Distribution (μ=10, σ=2)",
            "filename_prefix": "normal_dist"
        }
    ]
    
    # Run tests
    results = {}
    for i, test_case in enumerate(test_cases):
        logger.info(f"Running test case {i+1}/{len(test_cases)}: {test_case['title']}")
        result = test_histogram_with_data(
            viz_agent=viz_agent,
            data=test_case["data"],
            title=test_case["title"],
            filename_prefix=test_case["filename_prefix"]
        )
        results[test_case["title"]] = {
            "success": result.get("success", False),
            "error": result.get("error"),
            "file_path": result.get("file_path")
        }
    
    # Summary
    logger.info("\n=== Test Results Summary ===")
    for title, result in results.items():
        status = "✅ Pass" if result["success"] else f"❌ Fail: {result['error']}"
        logger.info(f"{title}: {status}")

if __name__ == "__main__":
    main() 