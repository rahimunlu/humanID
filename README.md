# HumanID - Biometric Verification System

A comprehensive biometric verification system that uses genome data for humanity verification and identity confirmation. The system consists of a biometrics server for processing STR profiles and a genome device for generating and uploading genetic profiles.

## 🧬 System Overview

HumanID provides two main verification modes:
1. **Humanity Verification** - First-time verification using genome data
2. **Identity Confirmation** - Similarity checking against existing records

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │ Biometrics Server│    │   GolemDB       │
│   (Next.js)     │───▶│  (FastAPI)       │───▶│  (Storage)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       ▲
         │                       │
┌─────────────────┐              │
│   Genome Device │──────────────┘
│   (device.py)   │
└─────────────────┘
```

### Components

- **Frontend** (`frontend/`) - Next.js web application with RainbowKit wallet integration
- **Genome Device** (`genome_device/`) - Generates STR profiles from VCF files and uploads to server
- **Biometrics Server** (`biometrics_server/`) - FastAPI server for processing and storing biometric data
- **Humanity SDK** (`humanity_sdk/`) - Multi-language SDKs for integration

## 🚀 Quick Start

### Prerequisites

- Python 3.7+
- bcftools (for VCF processing)
- Docker (for server deployment)
- Node.js 18+ (for web app)

### 1. Frontend Application

**Local Development:**
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

**Features:**
- Next.js 14 with App Router
- RainbowKit wallet integration
- Wallet connection modal
- Responsive design

### 2. Biometrics Server

The server is deployed at: `https://biometrics-server.biokami.com/`

**Local Development:**
```bash
cd biometrics_server
pip install -r requirements.txt
uvicorn main_fastapi:app --host 0.0.0.0 --port 5000
```

**Docker Deployment:**
```bash
cd biometrics_server
./build.sh
```

### 3. Genome Device

**Installation:**
```bash
cd genome_device
pip install -r requirements.txt
chmod +x generate_str_profile.sh
```

**Usage:**

Humanity Verification (first-time):
```bash
python device.py humanity-verification genome.vcf.gz --user-id user123 --kyc-doc-id doc456
```

Identity Confirmation (similarity check):
```bash
python device.py identity-confirmation genome.vcf.gz --user-id user123
```

## 📁 Project Structure

```
humanID/
├── genome_device/           # Genome processing device
│   ├── device.py           # Main device script
│   ├── generate_str_profile.sh  # STR profile generation
│   ├── requirements.txt    # Python dependencies
│   └── README.md          # Device documentation
├── frontend/              # Next.js web application
│   ├── src/              # Source code
│   ├── package.json      # Dependencies
│   └── README-RainbowKit.md # Wallet integration docs
├── biometrics_server/      # FastAPI server
│   ├── main_fastapi.py   # Main server application
│   ├── similarity_check.sh # Similarity comparison script
│   ├── Dockerfile         # Container configuration
│   ├── build.sh          # Build script
│   └── requirements.txt  # Python dependencies
├── humanity_sdk/          # Multi-language SDKs
│   ├── python/           # Python SDK
│   ├── typescript/       # TypeScript SDK
│   └── rust/             # Rust SDK
└── src/                  # Next.js web application
    ├── app/              # App router pages
    ├── components/       # React components
    └── lib/              # Utility functions
```

## 🔧 API Endpoints

### Biometrics Server

- `GET /health` - Health check
- `POST /first_humanity_verification` - First-time verification
- `POST /similarity_check` - Identity confirmation
- `GET /verification_status/<user_id>` - Check verification status

### Request Format

**Humanity Verification:**
```bash
curl -X POST https://biometrics-server.biokami.com/first_humanity_verification \
  -F "file=@profile.txt" \
  -F "user_id=user123" \
  -F "external_kyc_document_id=doc456"
```

**Similarity Check:**
```bash
curl -X POST https://biometrics-server.biokami.com/similarity_check \
  -F "file=@profile.txt" \
  -F "user_id=user123"
```

## 🧪 Testing

### Test with Sample Data

The server includes test profiles for development:

```bash
# Test humanity verification
python device.py humanity-verification biometrics_server/test_profile.txt --user-id test-user --kyc-doc-id test-doc

# Test identity confirmation
python device.py identity-confirmation biometrics_server/test_profile2.txt --user-id test-user
```

## 🔒 Security Features

- **File Encryption**: All uploaded files are encrypted using Fernet encryption
- **Secure Storage**: Files stored in encrypted format
- **Hash Verification**: File integrity checking with SHA-256
- **Metadata Tracking**: Comprehensive audit trail

## 📊 Data Flow

1. **VCF Processing**: Genome device processes VCF file using bcftools
2. **STR Generation**: Creates STR profile from genetic variants
3. **File Upload**: Uploads profile to biometrics server
4. **Encryption**: Server encrypts and stores the profile
5. **Verification**: Server processes and returns verification results
6. **Storage**: Metadata stored in GolemDB for future reference

## 🌐 Deployment

### Production Server
- **URL**: https://biometrics-server.biokami.com/
- **Status**: Deployed and operational
- **Health Check**: `GET /health`

### Kubernetes Deployment

The biometrics server is deployed on Kubernetes. To deploy manually:

**1. Create GolemDB Secret:**
```bash
kubectl create secret generic golemdb-secret \
  --from-literal=GOLEM_APP_TAG="HumanID" \
  --from-literal=GOLEM_DB_RPC="https://ethwarsaw.holesky.golemdb.io/rpc" \
  --from-literal=GOLEM_DB_WSS="wss://ethwarsaw.holesky.golemdb.io/rpc/ws" \
  --from-literal=PRIVATE_KEY="your_private_key_here" \
  -n ethwarsaw
```

**2. Deploy Application:**
```bash
cd biometrics_server
kubectl apply -f release.yaml
```

**3. Check Deployment Status:**
```bash
kubectl get pods -n ethwarsaw
kubectl logs -l app=web -n ethwarsaw
```

### Local Development
```bash
# Start biometrics server
cd biometrics_server && uvicorn main_fastapi:app --host 0.0.0.0 --port 5000

# Start web application
cd frontend && npm install && npm run dev
```

## 🎨 Frontend Features

The frontend application provides a modern web interface for biometric verification:

- **Wallet Integration**: Connect with MetaMask, WalletConnect, and other wallets via RainbowKit
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Status**: Live updates on verification progress
- **Secure Upload**: Encrypted file upload with progress indicators
- **Verification History**: View past verification attempts and results

## 📚 Documentation

- [Frontend README](frontend/README-RainbowKit.md) - Wallet integration and frontend setup
- [Genome Device README](genome_device/README.md) - Device usage and configuration
- [Biometrics Server README](biometrics_server/README.md) - Server API documentation
- [Humanity SDK Documentation](humanity_sdk/) - SDK integration guides

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Check the documentation in each component directory
- Review the API endpoints and examples
- Test with the provided sample data
