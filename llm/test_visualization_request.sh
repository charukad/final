#!/bin/bash
# Script to test the NLP visualization endpoint with different visualization types

endpoint="http://localhost:8000/nlp-visualization"

# Check if an argument was provided
if [ $# -eq 0 ]; then
  echo "Usage: $0 \"your visualization request text\""
  echo "Example: $0 \"Create a 3D plot of sin(x)*cos(y)\""
  exit 1
fi

prompt="$1"
echo "Testing visualization request: \"$prompt\""

# Make the request using curl
curl -s -X POST "$endpoint" \
  -H "Content-Type: application/json" \
  -d "{\"prompt\": \"$prompt\"}" | python -m json.tool

echo -e "\nTo debug the visualization type extraction, try:"
echo "curl -s -X POST \"$endpoint/debug\" -H \"Content-Type: application/json\" -d '{\"prompt\": \"$prompt\"}' | python -m json.tool" 