# Genome Device Server

A FastAPI server that handles DNA sequencing requests from the frontend, runs bioinformatics analysis, and uploads results to custodian endpoints.

## 🧬 Features

- **DNA Sequencing API**: Accepts sequencing requests with user metadata
- **Bioinformatics Processing**: Runs STR profile generation automatically
- **Data Upload**: Sends processed data to custodian endpoints
- **Status Tracking**: Real-time status updates for sequencing jobs
- **Background Processing**: Non-blocking DNA analysis
- **Health Monitoring**: Health checks and status endpoints

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Server
```bash
python server.py
```

### 3. Test Server
```bash
python test_server.py
```

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Start DNA Sequencing
```bash
POST /start_sequencing
Content-Type: application/json

{
  "user_id": "user_123",
  "custodian": "custodian_name",
  "expiration_date": "2024-12-31",
  "custodian_endpoint": "https://biometrics-server.biokami.com"
}
```

### Get Sequencing Status
```bash
GET /status/{user_id}
```

### List All Statuses
```bash
GET /list_status
```

## 🐳 Docker Deployment

### Build Image
```bash
./build.sh
```

### Run Container
```bash
docker run -p 8000:8000 genome-device:latest
```

## ☸️ Kubernetes Deployment

### Deploy to K8s
```bash
kubectl apply -f release.yaml
```

### Check Status
```bash
kubectl get pods -n ethwarsaw
kubectl logs -n ethwarsaw -l app=genome-device
```

## 🔄 Workflow

1. **Frontend Request**: Frontend sends DNA sequencing request
2. **Queue Job**: Server queues the sequencing job
3. **Bioinformatics**: Runs `bioinformatics.py` to generate STR profile
4. **Data Upload**: Runs `send_data.py` to upload to custodian
5. **Status Update**: Updates job status throughout process

## 📊 Status Types

- `queued`: Job is queued for processing
- `processing`: Bioinformatics analysis in progress
- `completed`: Sequencing completed successfully
- `failed`: Sequencing failed with error message

## 🛠️ Configuration

### Environment Variables
- `PYTHONUNBUFFERED=1`: Ensures proper logging

### Dependencies
- `fastapi`: Web framework
- `uvicorn`: ASGI server
- `pydantic`: Data validation
- `requests`: HTTP client for data upload

## 🔍 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:8000/health

# Start sequencing
curl -X POST http://localhost:8000/start_sequencing \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "custodian": "test_custodian", 
    "expiration_date": "2024-12-31",
    "custodian_endpoint": "https://biometrics-server.biokami.com"
  }'

# Check status
curl http://localhost:8000/status/test_user
```

### Automated Testing
```bash
python test_server.py
```

## 📝 Logs

The server provides detailed logging for:
- Request processing
- Bioinformatics analysis
- Data upload status
- Error handling

## 🔧 Development

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Production Deployment
- Use Docker for containerization
- Deploy to Kubernetes for scalability
- Configure proper CORS origins
- Use Redis/DB for status storage in production
