#!/bin/bash

# Quick start script for genome device systemd service
# Run this on the device as ethereum user

echo "🧬 Setting up Genome Device as systemd service..."

# Copy service file
echo "📁 Copying service file..."
sudo cp /home/ethereum/genome_device/genome-device.service /etc/systemd/system/

# Reload systemd
echo "🔄 Reloading systemd..."
sudo systemctl daemon-reload

# Enable service
echo "⚙️ Enabling service..."
sudo systemctl enable genome-device.service

# Open firewall
echo "🔥 Opening firewall port 8002..."
sudo ufw allow 8002

# Start service
echo "🚀 Starting service..."
sudo systemctl start genome-device.service

# Check status
echo "📊 Checking status..."
sudo systemctl status genome-device.service --no-pager

echo ""
echo "✅ Setup complete!"
echo "🌐 Server should be available at: http://spit-on-that-thing.local:8002"
echo ""
echo "📝 Useful commands:"
echo "   sudo systemctl status genome-device.service"
echo "   sudo journalctl -u genome-device.service -f"
echo "   sudo systemctl restart genome-device.service"
echo "   sudo systemctl stop genome-device.service"
