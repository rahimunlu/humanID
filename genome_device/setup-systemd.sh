#!/bin/bash

# Setup systemd service for genome device
echo "🔧 Setting up systemd service for genome device..."

# Copy service file
echo "📁 Copying service file..."
sudo cp /home/ethereum/genome_device/genome-device.service /etc/systemd/system/

# Reload systemd
echo "🔄 Reloading systemd..."
sudo systemctl daemon-reload

# Stop any running processes
echo "🛑 Stopping existing processes..."
pkill -f 'uvicorn server:app' || true
pkill -f 'python server.py' || true

# Enable service
echo "⚙️ Enabling service..."
sudo systemctl enable genome-device.service

# Start service
echo "🚀 Starting service..."
sudo systemctl start genome-device.service

# Check status
echo "📊 Checking status..."
sudo systemctl status genome-device.service --no-pager

echo ""
echo "✅ Setup complete!"
echo "🌐 Server should be available at: https://spit-on-that-thing.local:8002"
echo ""
echo "📝 Useful commands:"
echo "   sudo systemctl status genome-device.service"
echo "   sudo journalctl -u genome-device.service -f"
echo "   sudo systemctl restart genome-device.service"
