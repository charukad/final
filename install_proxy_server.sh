#!/bin/bash

# Set up the proxy server
echo "Setting up the visualization proxy server..."

# Install dependencies
npm install

# Check if the original multimodalService.js exists and create a backup
if [ -f "sandboxdemo/client/src/services/multimodalService.js" ]; then
    echo "Creating backup of original multimodalService.js..."
    cp sandboxdemo/client/src/services/multimodalService.js sandboxdemo/client/src/services/multimodalService.js.bak
fi

# Copy the fixed multimodalService.js to the right location
echo "Installing fixed multimodalService.js..."
cp multimodalService_fixed.js sandboxdemo/client/src/services/multimodalService.js

# Start the proxy server in the background
echo "Starting the proxy server..."
node visualization_proxy.js &

echo "Proxy server set up complete!"
echo "The proxy server is running on port 3001."
echo "The multimodalService.js file has been updated to use the proxy."
echo "You can now try creating visualizations with extended timeout support." 