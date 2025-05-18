#!/bin/bash

# Default port is 3001 if not specified
PORT=${1:-3001}
 
echo "Starting visualization proxy server on port $PORT..."
PORT=$PORT node visualization_proxy.js 