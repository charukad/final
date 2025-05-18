#!/bin/bash

# Kill any existing proxy server instances
echo "Stopping any running visualization proxy servers..."
pkill -f "node visualization_proxy.js" || true

# Default port is 3001 if not specified
PORT=${1:-3001}

# Wait a moment for port to be released
sleep 1

echo "Starting visualization proxy server on port $PORT with improved visualization detection..."
PORT=$PORT node visualization_proxy.js 