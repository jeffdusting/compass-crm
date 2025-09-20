#!/bin/bash

# CompassCRM Email API Server Startup Script

echo "Starting CompassCRM Email API Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if package.json exists
if [ ! -f "email-api-package.json" ]; then
    echo "Error: email-api-package.json not found"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --package-lock-only --package-lock-file=email-api-package.json
    cp email-api-package.json package.json
    npm install
fi

# Load environment variables
if [ -f ".env.email-api" ]; then
    echo "Loading environment variables from .env.email-api"
    export $(cat .env.email-api | grep -v '^#' | xargs)
else
    echo "Warning: .env.email-api file not found, using default configuration"
fi

# Start the server
echo "Starting server on port ${EMAIL_API_PORT:-3001}..."
node email-api-server.js
