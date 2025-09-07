#!/bin/bash

# Simple script to start the genome device server manually
# Run this on the physical genome device machine

set -e

echo "🧬 Starting Genome Device Server..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup-device.sh first."
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Create necessary directories
mkdir -p output encrypted logs

# Start the server
echo "🚀 Starting server on port 8002..."
echo "🌐 Server will be available at:"
echo "   http://$(hostname -I | awk '{print $1}'):8002"
echo "   http://spit-on-that-thing.local:8002"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python server.py
