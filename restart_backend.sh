#!/bin/bash

echo "Attempting to restart the backend visualization server..."

# Find and stop the backend server process
echo "Stopping any running visualization server..."
pkill -f "uvicorn server.main:app" || true

# Wait a moment for processes to terminate
sleep 2

# Check for any Python processes related to the server
python_procs=$(ps aux | grep -i "python" | grep -i "server" | grep -v grep)
if [ -n "$python_procs" ]; then
  echo "Found running Python server processes:"
  echo "$python_procs"
  echo "Forcefully terminating these processes..."
  pkill -9 -f "uvicorn server.main:app" || true
  sleep 1
fi

# Start the server again
echo "Starting visualization server..."
cd server && uvicorn main:app --reload &
echo "Server restart initiated. Check logs for details." 