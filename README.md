# HumanID - Biometric Verification System

A comprehensive biometric verification system that uses genome data for humanity verification and identity confirmation. The system consists of a biometrics server for processing STR profiles and a genome device for generating and uploading genetic profiles.

## 🧬 System Overview

HumanID provides two main verification modes:
1. **Humanity Verification** - First-time verification using genome data
2. **Identity Confirmation** - Similarity checking against existing records

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Genome Device │───▶│ Biometrics Server│───▶│   GolemDB       │
│   (device.py)   │    │  (Flask API)     │    │  (Storage)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Components

- **Genome Device** (`genome_device/`) - Generates STR profiles from VCF files and uploads to server
- **Biometrics Server** (`biometrics_server/`) - Flask API for processing and storing biometric data
- **Humanity SDK** (`humanity_sdk/`) - Multi-language SDKs for integration
- **Web App** (`src/`) - Next.js frontend application

## 🚀 Quick Start

### Prerequisites

- Python 3.7+
- bcftools (for VCF processing)
- Docker (for server deployment)
- Node.js 18+ (for web app)

### 1. Biometrics Server

The server is deployed at: `https://biometrics-server.biokami.com/`

**Local Development:**
```bash
cd biometrics_server
pip install -r requirements.txt
python main.py
```

**Docker Deployment:**
```bash
cd biometrics_server
./build.sh
```

### 2. Genome Device

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
├── biometrics_server/      # Flask API server
│   ├── main.py            # Main server application
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

### Local Development
```bash
# Start biometrics server
cd biometrics_server && python main.py

# Start web application
npm install && npm run dev
```

## 📚 Documentation

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
