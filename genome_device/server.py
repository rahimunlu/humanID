#!/usr/bin/env python3
"""
Genome Device Server
Handles DNA sequencing requests from the frontend
"""

import os
import sys
import json
import logging
import asyncio
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
from pydantic import BaseModel

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

# Add current directory to path for imports
sys.path.append(str(Path(__file__).parent))

from bioinformatics import BioinformaticsProcessor
from send_data import DataSender

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Genome Device Server",
    description="DNA sequencing and bioinformatics processing server",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize processors
bioinformatics_processor = BioinformaticsProcessor()
data_sender = DataSender()

# Request models
class DNASequencingRequest(BaseModel):
    user_id: str
    custodian: str
    custodian_endpoint: str
    expiry_time: str

class SequencingStatus(BaseModel):
    user_id: str
    status: str  # "queued", "processing", "completed", "failed"
    message: str
    timestamp: str
    result_file: Optional[str] = None

# In-memory storage for sequencing status (use Redis/DB in production)
sequencing_status: Dict[str, SequencingStatus] = {}

@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint with landing page"""
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Genome Device Server</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 600px;
                margin: 20px;
            }
            .logo {
                font-size: 4rem;
                margin-bottom: 20px;
            }
            h1 {
                color: #333;
                margin-bottom: 10px;
                font-size: 2.5rem;
            }
            .subtitle {
                color: #666;
                font-size: 1.2rem;
                margin-bottom: 30px;
            }
            .status {
                background: #4CAF50;
                color: white;
                padding: 15px 30px;
                border-radius: 50px;
                font-size: 1.1rem;
                font-weight: bold;
                margin: 20px 0;
                display: inline-block;
            }
            .info {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            .info h3 {
                margin-top: 0;
                color: #333;
            }
            .endpoint {
                background: #e9ecef;
                padding: 10px;
                border-radius: 5px;
                font-family: monospace;
                margin: 5px 0;
                word-break: break-all;
            }
            .btn {
                display: inline-block;
                background: #007bff;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 5px;
                margin: 10px;
                transition: background 0.3s;
            }
            .btn:hover {
                background: #0056b3;
            }
            .footer {
                margin-top: 30px;
                color: #666;
                font-size: 0.9rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">🧬</div>
            <h1>Genome Device Server</h1>
            <p class="subtitle">DNA Sequencing & Analysis Platform</p>
            
            <div class="status">✅ Server is Running</div>
            
            <div class="info">
                <h3>📊 Server Information</h3>
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>Status:</strong> Active</p>
                <p><strong>Uptime:</strong> Running</p>
                <p><strong>Port:</strong> 8002</p>
            </div>
            
            <div class="info">
                <h3>🔗 API Endpoints</h3>
                <div class="endpoint">GET /health - Health check</div>
                <div class="endpoint">POST /start_sequencing - Start DNA analysis</div>
                <div class="endpoint">GET /status/{user_id} - Check analysis status</div>
                <div class="endpoint">GET /list_status - List all analyses</div>
                <div class="endpoint">GET /docs - API documentation</div>
            </div>
            
            <div class="info">
                <h3>🧪 Test the API</h3>
                <a href="/health" class="btn">Health Check</a>
                <a href="/docs" class="btn">API Docs</a>
            </div>
            
            <div class="footer">
                <p>Genome Device Server v1.0.0 | Ready for DNA sequencing</p>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "service": "genome_device_server",
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "bioinformatics": "available",
            "data_sender": "available"
        }
    }

@app.post("/start_sequencing")
async def start_sequencing(
    request: DNASequencingRequest,
    background_tasks: BackgroundTasks
):
    """Start DNA sequencing process"""
    logger.info(f"🧬 Starting DNA sequencing for user: {request.user_id}")
    
    # Check if sequencing is already in progress
    if request.user_id in sequencing_status:
        current_status = sequencing_status[request.user_id]
        if current_status.status in ["queued", "processing"]:
            raise HTTPException(
                status_code=409, 
                detail=f"Sequencing already in progress for user {request.user_id}"
            )
    
    # Initialize status
    sequencing_status[request.user_id] = SequencingStatus(
        user_id=request.user_id,
        status="queued",
        message="DNA sequencing request queued",
        timestamp=datetime.now().isoformat()
    )
    
    # Start background processing
    background_tasks.add_task(
        process_dna_sequencing,
        request.user_id,
        request.custodian,
        request.custodian_endpoint,
        request.expiry_time
    )
    
    return {
        "message": "DNA sequencing started",
        "user_id": request.user_id,
        "status": "queued",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/status/{user_id}")
async def get_sequencing_status(user_id: str):
    """Get sequencing status for a user"""
    if user_id not in sequencing_status:
        raise HTTPException(
            status_code=404,
            detail=f"No sequencing found for user {user_id}"
        )
    
    return sequencing_status[user_id]

async def process_dna_sequencing(
    user_id: str, 
    custodian: str, 
    custodian_endpoint: str, 
    expiry_time: str
):
    """Background task to process DNA sequencing"""
    try:
        # Update status to processing
        sequencing_status[user_id].status = "processing"
        sequencing_status[user_id].message = "Running bioinformatics analysis"
        sequencing_status[user_id].timestamp = datetime.now().isoformat()
        
        logger.info(f"🔬 Processing DNA sequencing for user: {user_id}")
        
        # Step 1: Run bioinformatics analysis
        logger.info("📊 Running bioinformatics analysis...")
        result_file = await run_bioinformatics_analysis(user_id)
        
        if not result_file:
            raise Exception("Bioinformatics analysis failed")
        
        # Update status
        sequencing_status[user_id].message = "Bioinformatics analysis completed, uploading data"
        sequencing_status[user_id].timestamp = datetime.now().isoformat()
        
        # Step 2: Send data to custodian endpoint
        logger.info("📤 Uploading data to custodian...")
        upload_success = await send_data_to_custodian(
            result_file, user_id, custodian, expiry_time, custodian_endpoint
        )
        
        if not upload_success:
            raise Exception("Data upload failed")
        
        # Update status to completed
        sequencing_status[user_id].status = "completed"
        sequencing_status[user_id].message = "DNA sequencing completed successfully"
        sequencing_status[user_id].timestamp = datetime.now().isoformat()
        sequencing_status[user_id].result_file = result_file
        
        logger.info(f"✅ DNA sequencing completed for user: {user_id}")
        
    except Exception as e:
        logger.error(f"❌ DNA sequencing failed for user {user_id}: {str(e)}")
        
        # Update status to failed
        sequencing_status[user_id].status = "failed"
        sequencing_status[user_id].message = f"DNA sequencing failed: {str(e)}"
        sequencing_status[user_id].timestamp = datetime.now().isoformat()

async def run_bioinformatics_analysis(user_id: str) -> Optional[str]:
    """Run bioinformatics analysis and return result file path"""
    try:
        # Run the bioinformatics processor
        result_file = bioinformatics_processor.generate_str_profile(user_id)
        
        if result_file and os.path.exists(result_file):
            logger.info(f"✅ Bioinformatics analysis completed: {result_file}")
            return result_file
        else:
            logger.error("❌ Bioinformatics analysis failed - no result file")
            return None
            
    except Exception as e:
        logger.error(f"❌ Bioinformatics analysis error: {str(e)}")
        return None

async def send_data_to_custodian(
    result_file: str,
    user_id: str,
    custodian: str,
    expiry_time: str,
    custodian_endpoint: str
) -> bool:
    """Send data to custodian endpoint"""
    try:
        # Update data sender with custodian endpoint
        data_sender.server_url = custodian_endpoint.rstrip('/')
        
        # Send the file
        success = data_sender.upload_file(
            file_path=result_file,
            user_id=user_id,
            custodian=custodian,
            expiration_date=expiry_time
        )
        
        if success:
            logger.info(f"✅ Data uploaded successfully to {custodian_endpoint}")
            return True
        else:
            logger.error(f"❌ Data upload failed to {custodian_endpoint}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Data upload error: {str(e)}")
        return False

@app.get("/list_status")
async def list_all_status():
    """List all sequencing statuses (for debugging)"""
    return {
        "total_sequencing": len(sequencing_status),
        "statuses": list(sequencing_status.values())
    }

if __name__ == "__main__":
    import uvicorn
    
    logger.info("🧬 Starting Genome Device Server...")
    logger.info("📊 Bioinformatics processor initialized")
    logger.info("📤 Data sender initialized")
    
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
        log_level="info"
    )
