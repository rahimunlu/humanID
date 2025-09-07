# Genome Device Server - Physical Machine Setup

This guide explains how to set up the genome device server on a physical machine in your local network.

## 🧬 Overview

The genome device is a physical machine that:
- Runs DNA sequencing analysis locally
- Connects to your local network
- Provides a REST API for the frontend to communicate with
- Processes DNA samples and uploads results to the biometrics server

## 🖥️ Physical Machine Requirements

- **OS**: Linux (Ubuntu 20.04+ recommended)
- **Python**: 3.11 or later
- **RAM**: Minimum 4GB (8GB+ recommended for DNA processing)
- **Storage**: 10GB+ free space for DNA analysis files
- **Network**: Connected to same network as frontend

## 🚀 Quick Setup

### 1. Copy Files to Device
```bash
# Copy the genome_device folder to your physical machine
scp -r genome_device/ user@device-ip:/home/user/
```

### 2. Run Setup Script
```bash
# SSH into the device
ssh user@device-ip

# Navigate to the genome_device directory
cd genome_device

# Make scripts executable
chmod +x setup-device.sh start-device.sh

# Run the setup script
./setup-device.sh
```

### 3. Start the Server
```bash
# Option A: Start as systemd service (recommended for production)
sudo systemctl start genome-device.service

# Option B: Start manually for testing
./start-device.sh
```

## 🔧 Configuration

### Network Configuration
The device needs to be accessible from your frontend. Configure:

1. **Static IP** (recommended):
   ```bash
   # Edit network configuration
   sudo nano /etc/netplan/01-netcfg.yaml
   ```

2. **DNS Entry** (optional but recommended):
   Add to your router's DNS or `/etc/hosts`:
   ```
   device-ip    spit-on-that-thing.local
   ```

### Firewall Configuration
```bash
# Allow port 8002
sudo ufw allow 8002

# Check status
sudo ufw status
```

## 📊 Monitoring

### Check Service Status
```bash
# Check if service is running
sudo systemctl status genome-device.service

# View recent logs
sudo journalctl -u genome-device.service -n 50

# Follow logs in real-time
sudo journalctl -u genome-device.service -f
```

### Test the API
```bash
# Health check
curl http://spit-on-that-thing.local:8002/health

# Test from frontend machine
curl http://device-ip:8002/health
```

## 🔄 Updates

To update the genome device server:

```bash
# Stop the service
sudo systemctl stop genome-device.service

# Update the code
git pull  # or copy new files

# Restart the service
sudo systemctl start genome-device.service
```

## 🐛 Troubleshooting

### Service Won't Start
```bash
# Check logs for errors
sudo journalctl -u genome-device.service -n 100

# Check if port is in use
sudo netstat -tlnp | grep 8002

# Test Python script directly
cd /path/to/genome_device
source venv/bin/activate
python server.py
```

### Network Issues
```bash
# Check if device is reachable
ping spit-on-that-thing.local

# Check if port is open
telnet spit-on-that-thing.local 8002

# Check firewall
sudo ufw status
```

### DNA Processing Issues
```bash
# Check if bioinformatics scripts work
cd /path/to/genome_device
source venv/bin/activate
python bioinformatics.py

# Check output directory permissions
ls -la output/
```

## 📁 Directory Structure

```
genome_device/
├── server.py              # Main FastAPI server
├── bioinformatics.py      # DNA analysis script
├── send_data.py          # Data upload script
├── requirements.txt      # Python dependencies
├── setup-device.sh      # Setup script
├── start-device.sh      # Manual start script
├── output/              # DNA analysis results
├── encrypted/           # Encrypted files
└── logs/               # Server logs
```

## 🌐 API Endpoints

Once running, the server provides:

- `GET /health` - Health check
- `POST /start_sequencing` - Start DNA analysis
- `GET /status/{user_id}` - Check analysis status
- `GET /list_status` - List all analyses
- `GET /docs` - API documentation

## 🔗 Frontend Integration

The frontend is already configured to connect to:
- **URL**: `http://spit-on-that-thing.local:8002`
- **Health Check**: `GET /health`
- **Start Analysis**: `POST /start_sequencing`

## 📝 Example Usage

1. **Start the device server** on the physical machine
2. **Access the frontend** at `https://biometrics.biokami.com/dna-sequencing`
3. **Configure parameters**:
   - User ID: `user_12345`
   - Custodian: `biokami_labs`
   - Endpoint: `https://biometrics-server.biokami.com`
   - Expiry: `2024-12-31T23:59:59Z`
4. **Click "Start DNA Sequencing"**
5. **Monitor progress** in real-time

The device will process the DNA sample and upload results to your biometrics server automatically!
