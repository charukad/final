# Visualization Type Disambiguation

## Problem

The system was consistently identifying various visualization requests as "heatmaps" regardless of what was actually requested. This was especially problematic for 3D plot requests, which were being incorrectly identified as heatmaps.

## Root Cause

The LLM (mistral-7b-instruct-v0.3) used for extracting visualization parameters from natural language was not correctly distinguishing between different visualization types. The prompt did not provide enough clear guidance on the differences between visualization types, allowing the LLM to default to certain types (particularly "heatmap").

## Solution

We enhanced the LLM prompt in `llm/api/rest/routes/nlp_visualization.py` with several improvements:

1. Added explicit disambiguation rules at the top of the prompt to ensure proper identification of visualization types
2. Added clear definitions of each major visualization type to help the LLM understand the distinctions
3. Enhanced the guidelines specifically calling out that 3D plots should NEVER be identified as heatmaps
4. Added a specific example of a heatmap with clear explanation of how it differs from a 3D plot
5. Added a final instruction to double-check the visualization type selection

## Testing the Fix

You can test different visualization requests with the provided bash script:

```bash
cd llm
./test_visualization_request.sh "Create a 3D plot of sin(x)*cos(y)"
```

You can also run a comprehensive test of various visualization types:

```bash
cd llm
source venv/bin/activate
python test_viz_type_extraction.py
```

## Best Practices for Users

When requesting visualizations, be as specific as possible about the type of visualization you want:

- For 3D plots, explicitly mention "3D plot", "3D surface", or similar terms
- For heatmaps, specifically request a "heatmap" or "color map"
- For other visualization types, be clear about what you're asking for (bar chart, pie chart, etc.)

## Supported Visualization Types

The system supports the following visualization types:

1. `function_2d` - 2D function plot (e.g., f(x) = sin(x))
2. `functions_2d` - Multiple 2D functions plot
3. `function_3d` - 3D surface plot (e.g., f(x,y) = sin(x)*cos(y))
4. `parametric_3d` - 3D parametric plot
5. `histogram` - Distribution visualization
6. `scatter` - Scatter plot of data points
7. `boxplot` - Box and whisker plot
8. `violin` - Violin plot
9. `bar` - Bar chart
10. `heatmap` - Heatmap or color map (not 3D)
11. `pie` - Pie chart
12. `contour` - Contour plot (level curves)
13. `complex_function` - Visualization of complex functions
14. `time_series` - Time series visualization
15. `correlation_matrix` - Correlation matrix
16. `slope_field` - Vector/slope field for differential equations 