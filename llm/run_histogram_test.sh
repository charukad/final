#!/bin/bash
# Test script to verify histogram generation fix

echo "Activating Python environment..."
source venv/bin/activate

echo "Running histogram test script..."
python test_histogram_generation.py

echo "Test completed. Check the visualizations directory for results." 