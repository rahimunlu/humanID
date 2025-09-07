#!/bin/bash

# Genome Device Server Setup Script
# Run this on the physical genome device machine

set -e

echo "🧬 Setting up Genome Device Server on physical machine..."

# Check if Python 3.11+ is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11 or later."
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "✅ Python version: $PYTHON_VERSION"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p output encrypted logs

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x generate_str_profile.sh
chmod +x test_server.py

# Create systemd service file
echo "⚙️ Creating systemd service..."
sudo tee /etc/systemd/system/genome-device.service > /dev/null <<EOF
[Unit]
Description=Genome Device Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=PATH=$(pwd)/venv/bin
ExecStart=$(pwd)/venv/bin/python server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
echo "🔄 Enabling service..."
sudo systemctl daemon-reload
sudo systemctl enable genome-device.service

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the server:"
echo "   sudo systemctl start genome-device.service"
echo ""
echo "📊 To check status:"
echo "   sudo systemctl status genome-device.service"
echo ""
echo "📝 To view logs:"
echo "   sudo journalctl -u genome-device.service -f"
echo ""
echo "🛑 To stop the server:"
echo "   sudo systemctl stop genome-device.service"
echo ""
echo "🌐 Server will be available at:"
echo "   http://$(hostname -I | awk '{print $1}'):8002"
echo "   http://spit-on-that-thing.local:8002 (if DNS is configured)"
