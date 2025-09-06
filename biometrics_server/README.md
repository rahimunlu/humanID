# Biometrics Server

A Flask application for handling biometric file uploads, encryption, and similarity checking.

## Features

- **First Humanity Verification**: Upload files, encrypt them at rest, store metadata, and notify GolemDB
- **Similarity Check**: Compare new files against previously stored user files using the similarity_check.sh script
- **File Encryption**: All uploaded files are encrypted using Fernet encryption
- **GolemDB Integration**: Automatic notifications to GolemDB for verification events

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables (optional):
```bash
export GOLEMDB_BASE_URL=http://your-golemdb-server:8080
```

## Usage

### Start the server:
```bash
python main.py
```

The server will run on `http://localhost:5000`

### Endpoints

#### 1. First Humanity Verification
**POST** `/first_humanity_verification`

Upload a file for first-time humanity verification.

**Form Data:**
- `file`: The file to upload
- `user_id`: Unique user identifier
- `external_kyc_document_id`: External KYC document ID
- `humanity_score`: Humanity verification score (float)

**Example:**
```bash
curl -X POST http://localhost:5000/first_humanity_verification \
  -F "file=@profile.txt" \
  -F "user_id=user123" \
  -F "external_kyc_document_id=kyc456" \
  -F "humanity_score=0.95"
```

#### 2. Similarity Check
**POST** `/similarity_check`

Compare a new file against the previously stored file for a user.

**Form Data:**
- `file`: The new file to compare
- `user_id`: User identifier (must have a stored verification)

**Example:**
```bash
curl -X POST http://localhost:5000/similarity_check \
  -F "file=@new_profile.txt" \
  -F "user_id=user123"
```

#### 3. Verification Status
**GET** `/verification_status/<user_id>`

Get verification status for a specific user.

**Example:**
```bash
curl http://localhost:5000/verification_status/user123
```

#### 4. Health Check
**GET** `/health`

Check server health status.

**Example:**
```bash
curl http://localhost:5000/health
```

## File Storage

- **Uploaded files**: Stored temporarily in `/tmp/biometrics_uploads`
- **Encrypted files**: Stored in `/tmp/biometrics_encrypted`
- **Metadata**: Stored as JSON files alongside encrypted files

## Security Features

- File type validation (only .txt, .csv, .json allowed)
- File size limits (16MB maximum)
- Secure filename handling
- File encryption at rest using Fernet
- SHA-256 file hashing for integrity verification

## GolemDB Integration

The server automatically notifies GolemDB when:
- A first humanity verification is completed
- A similarity check is performed

Configure the GolemDB endpoint using the `GOLEMDB_BASE_URL` environment variable.

## Error Handling

The server includes comprehensive error handling for:
- Missing files or parameters
- Invalid file types
- File size limits
- Encryption/decryption errors
- Similarity check script failures
- GolemDB communication errors

## Development

For development, the server runs in debug mode with auto-reload enabled.

## Dependencies

- Flask 3.0.0
- Werkzeug 3.0.1
- cryptography 41.0.7
- requests 2.31.0
- python-dotenv 1.0.0
