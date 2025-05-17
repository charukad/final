#!/bin/bash

# Test script for 3D complex mathematical expressions

echo "Testing complex mathematical expressions for 3D visualization..."
echo "================================================================"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "Activated virtual environment"
else
    echo "Warning: No virtual environment found at 'venv'. Using system Python."
fi

# Run the test script
python test_complex_expressions.py

# Check if the test was successful
if [ $? -eq 0 ]; then
    echo "Tests completed successfully."
    
    # Print information about the test output
    test_dir="test_visualizations"
    if [ -d "$test_dir" ]; then
        echo "Generated visualization files in: $test_dir"
        echo "Total files: $(ls -1 $test_dir | wc -l)"
    fi
else
    echo "ERROR: Tests failed to run properly."
fi

echo "================================================================" 