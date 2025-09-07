#!/usr/bin/env python3
"""
FastAPI Biometrics Server
Handles file uploads for humanity verification and similarity checking
"""

import os
import json
import uuid
import hashlib
import subprocess
import tempfile
import logging
import random
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.responses import JSONResponse
from cryptography.fernet import Fernet
import requests

# Initialize FastAPI app
app = FastAPI(title="Biometrics Server", version="1.0.0")

# Configure enhanced logging with colors
import colorama
from colorama import Fore, Back, Style

# Initialize colorama for cross-platform colored output
colorama.init(autoreset=True)

# Configure logging with enhanced formatting
logger = logging.getLogger(__name__)

# Custom log formatter for demo purposes
class DemoFormatter(logging.Formatter):
    def format(self, record):
        # Add colors based on log level
        if record.levelno == logging.INFO:
            record.levelname = f"{Fore.CYAN}{record.levelname}{Style.RESET_ALL}"
        elif record.levelno == logging.WARNING:
            record.levelname = f"{Fore.YELLOW}{record.levelname}{Style.RESET_ALL}"
        elif record.levelno == logging.ERROR:
            record.levelname = f"{Fore.RED}{record.levelname}{Style.RESET_ALL}"
        elif record.levelno == 25:  # SUCCESS level
            record.levelname = f"{Fore.GREEN}SUCCESS{Style.RESET_ALL}"
        
        return super().format(record)

# Add custom SUCCESS level
logging.addLevelName(25, "SUCCESS")
def success(self, message, *args, **kwargs):
    if self.isEnabledFor(25):
        self._log(25, message, args, **kwargs)
logging.Logger.success = success

# Apply custom formatter
logger.setLevel(logging.INFO)
logger.handlers.clear()  # Clear any existing handlers
logger.propagate = False  # Prevent propagation to root logger
handler = logging.StreamHandler()
handler.setFormatter(DemoFormatter('%(asctime)s | %(levelname)-8s | %(message)s', '%Y-%m-%d %H:%M:%S'))
logger.addHandler(handler)

# Configuration
UPLOAD_FOLDER = '/tmp/biometrics_uploads'
ENCRYPTED_FOLDER = '/tmp/biometrics_encrypted'
ALLOWED_EXTENSIONS = {'txt', 'csv', 'json'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB max file size

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(ENCRYPTED_FOLDER, exist_ok=True)

# Encryption key (in production, this should be stored securely)
ENCRYPTION_KEY = Fernet.generate_key()
cipher_suite = Fernet(ENCRYPTION_KEY)

# Import Golem DB integration
try:
    from golem_endpoints import store_humanity_verification, store_similarity_check
    logger.info("✅ GolemDB integration loaded successfully")
    
    async def notify_golem(event_type, data):
        """Async wrapper for GolemDB notifications"""
        try:
            if event_type == "humanity_verification":
                entity_key = await store_humanity_verification(data)
                logger.info(f"✅ Humanity verification stored in Golem DB with entity key: {entity_key}")
                return True
            elif event_type == "similarity_check":
                entity_key = await store_similarity_check(data)
                logger.info(f"✅ Similarity check stored in Golem DB with entity key: {entity_key}")
                return True
            else:
                logger.error(f"Unknown event type: {event_type}")
                return False
        except Exception as e:
            logger.error(f"❌ Failed to notify Golem DB: {e}")
            return False
            
except ImportError as e:
    logger.warning(f"Failed to import golem_endpoints: {e}")
    async def notify_golem(event_type, data):
        logger.info(f"📡 Mock GolemDB notification: {event_type}")
        logger.info(f"   Data: {data}")
        return True

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def encrypt_file(file_path: str, output_path: str) -> str:
    """Encrypt a file and return the encrypted file path"""
    with open(file_path, 'rb') as file:
        file_data = file.read()
    
    encrypted_data = cipher_suite.encrypt(file_data)
    
    with open(output_path, 'wb') as encrypted_file:
        encrypted_file.write(encrypted_data)
    
    return output_path

def decrypt_file(encrypted_path: str, output_path: str) -> str:
    """Decrypt a file and return the decrypted file path"""
    with open(encrypted_path, 'rb') as encrypted_file:
        encrypted_data = encrypted_file.read()
    
    decrypted_data = cipher_suite.decrypt(encrypted_data)
    
    with open(output_path, 'wb') as decrypted_file:
        decrypted_file.write(decrypted_data)
    
    return output_path

def get_file_hash(file_path: str) -> str:
    """Calculate SHA-256 hash of a file"""
    hash_sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()

def calculate_humanity_score(file_path: str) -> float:
    """Calculate humanity score based on file content"""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Simple scoring based on content length and patterns
        score = 0.5  # Base score
        
        # Add points for content length
        if len(content) > 100:
            score += 0.2
        if len(content) > 500:
            score += 0.2
        
        # Add points for common patterns
        if 'human' in content.lower():
            score += 0.1
        if 'dna' in content.lower():
            score += 0.1
        if 'genetic' in content.lower():
            score += 0.1
        
        # Add some randomness for demo purposes
        score += random.uniform(0.0, 0.1)
        
        return min(score, 1.0)  # Cap at 1.0
    except Exception as e:
        logger.error(f"Error calculating humanity score: {e}")
        return 0.5

def get_client_info(request) -> Dict[str, str]:
    """Extract client information from request"""
    return {
        'ip': request.client.host if request.client else 'unknown',
        'user_agent': request.headers.get('user-agent', 'unknown'),
        'method': request.method,
        'path': str(request.url.path)
    }

def log_request_start(endpoint_name: str, client_info: Dict[str, str]):
    """Log request start with client info"""
    logger.info(f"🚀 {endpoint_name.upper()} REQUEST STARTED")
    logger.info(f"   🌐 Client IP: {Fore.YELLOW}{client_info['ip']}{Style.RESET_ALL}")
    logger.info(f"   👤 User Agent: {Fore.YELLOW}{client_info['user_agent'][:50]}...{Style.RESET_ALL}")
    logger.info(f"   📡 Method: {Fore.YELLOW}{client_info['method']}{Style.RESET_ALL}")
    logger.info(f"   🛣️  Path: {Fore.YELLOW}{client_info['path']}{Style.RESET_ALL}")

def log_request_success(endpoint_name, result_data, processing_time=None):
    """Log successful request completion"""
    logger.success(f"✅ {endpoint_name.upper()} COMPLETED SUCCESSFULLY")
    if processing_time:
        logger.info(f"   ⏱️  Processing Time: {Fore.CYAN}{processing_time:.2f}s{Style.RESET_ALL}")
    if 'verification_id' in result_data:
        logger.info(f"   🆔 Verification ID: {Fore.GREEN}{result_data['verification_id']}{Style.RESET_ALL}")
    if 'check_id' in result_data:
        logger.info(f"   🆔 Check ID: {Fore.GREEN}{result_data['check_id']}{Style.RESET_ALL}")
    if 'humanity_score' in result_data:
        logger.info(f"   📊 Humanity Score: {Fore.GREEN}{result_data['humanity_score']}{Style.RESET_ALL}")
    if 'similarity_result' in result_data:
        logger.info(f"   🔍 Similarity Result: {Fore.GREEN}{result_data['similarity_result']}{Style.RESET_ALL}")

def log_request_error(endpoint_name: str, error: str):
    """Log request error"""
    logger.error(f"❌ {endpoint_name.upper()} FAILED: {error}")

# FastAPI Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "service": "biometrics_server",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/first_humanity_verification")
async def first_humanity_verification(
    request: Request,
    file: UploadFile = File(...),
    user_id: str = Form(...),
    external_kyc_document_id: str = Form(...)
):
    """First humanity verification endpoint"""
    start_time = datetime.now()
    
    try:
        # Log request start
        client_info = get_client_info(request)
        log_request_start("FIRST HUMANITY VERIFICATION", client_info)
        
        # Validate file
        if not file.filename or not allowed_file(file.filename):
            raise HTTPException(status_code=400, detail="Invalid file type. Allowed: txt, csv, json")
        
        # Check file size
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large. Maximum size: 50MB")
        
        # Generate verification ID
        verification_id = str(uuid.uuid4())
        logger.info(f"   🆔 Generated Verification ID: {Fore.GREEN}{verification_id}{Style.RESET_ALL}")
        logger.info(f"   📝 KYC Document ID: {Fore.GREEN}{external_kyc_document_id}{Style.RESET_ALL}")
        
        # Save uploaded file
        filename = file.filename
        file_extension = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{verification_id}.{file_extension}"
        upload_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        with open(upload_path, 'wb') as f:
            f.write(file_content)
        
        logger.info(f"   💾 File saved to: {Fore.CYAN}{upload_path}{Style.RESET_ALL}")
        
        # Calculate file hash
        file_hash = get_file_hash(upload_path)
        logger.info(f"   🔐 File Hash: {Fore.CYAN}{file_hash[:16]}...{Style.RESET_ALL}")
        
        # Calculate humanity score based on file content
        logger.info(f"   🧮 Calculating humanity score...")
        humanity_score = calculate_humanity_score(upload_path)
        
        # Encrypt file
        encrypted_filename = f"{verification_id}_encrypted.{file_extension}"
        encrypted_path = os.path.join(ENCRYPTED_FOLDER, encrypted_filename)
        logger.info(f"   🔒 Encrypting file...")
        encrypt_file(upload_path, encrypted_path)
        logger.info(f"   🔐 File encrypted and saved to: {Fore.CYAN}{encrypted_path}{Style.RESET_ALL}")
        
        # Save metadata
        metadata = {
            'verification_id': verification_id,
            'user_id': user_id,
            'external_kyc_document_id': external_kyc_document_id,
            'humanity_score': humanity_score,
            'file_hash': file_hash,
            'timestamp': datetime.now().isoformat(),
            'verification_type': 'first_humanity_verification'
        }
        
        metadata_filename = f"{verification_id}_metadata.json"
        metadata_path = os.path.join(ENCRYPTED_FOLDER, metadata_filename)
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"   📋 Metadata saved to: {Fore.CYAN}{metadata_path}{Style.RESET_ALL}")
        
        # Notify GolemDB
        logger.info(f"   📡 Notifying GolemDB...")
        golemdb_data = {
            'verification_id': verification_id,
            'user_id': user_id,
            'external_kyc_document_id': external_kyc_document_id,
            'humanity_score': humanity_score,
            'file_hash': file_hash,
            'timestamp': metadata['timestamp'],
            'verification_type': 'first_humanity_verification'
        }
        
        golemdb_success = await notify_golem('humanity_verification', golemdb_data)
        if golemdb_success:
            logger.info(f"   ✅ GolemDB notification sent successfully")
        else:
            logger.warning(f"   ⚠️  GolemDB notification failed")
        
        # Clean up temporary file
        os.remove(upload_path)
        logger.info(f"   🗑️  Temporary file cleaned up")
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Prepare result data
        result_data = {
            'verification_id': verification_id,
            'humanity_score': humanity_score,
            'file_hash': file_hash,
            'timestamp': metadata['timestamp']
        }
        
        # Log success
        log_request_success("FIRST HUMANITY VERIFICATION", result_data, processing_time)
        
        return {
            'success': True,
            'message': 'File uploaded, encrypted, and stored successfully',
            'verification_id': verification_id,
            'metadata': {
                'user_id': user_id,
                'external_kyc_document_id': external_kyc_document_id,
                'humanity_score': humanity_score,
                'file_hash': file_hash,
                'timestamp': metadata['timestamp']
            },
            'golemdb_notified': golemdb_success
        }
        
    except HTTPException:
        raise
    except Exception as e:
        processing_time = (datetime.now() - start_time).total_seconds()
        log_request_error("FIRST HUMANITY VERIFICATION", str(e))
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/similarity_check")
async def similarity_check(
    request: Request,
    file: UploadFile = File(...),
    user_id: str = Form(...)
):
    """Similarity check endpoint"""
    start_time = datetime.now()
    
    try:
        # Log request start
        client_info = get_client_info(request)
        log_request_start("SIMILARITY CHECK", client_info)
        
        # Validate file
        if not file.filename or not allowed_file(file.filename):
            raise HTTPException(status_code=400, detail="Invalid file type. Allowed: txt, csv, json")
        
        # Check file size
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large. Maximum size: 50MB")
        
        # Generate check ID
        check_id = str(uuid.uuid4())
        logger.info(f"   🆔 Generated Check ID: {Fore.GREEN}{check_id}{Style.RESET_ALL}")
        
        # Save uploaded file
        filename = file.filename
        file_extension = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{check_id}.{file_extension}"
        upload_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        with open(upload_path, 'wb') as f:
            f.write(file_content)
        
        logger.info(f"   💾 File saved to: {Fore.CYAN}{upload_path}{Style.RESET_ALL}")
        
        # Find stored verification for this user
        stored_verification_id = None
        stored_metadata = None
        
        for filename in os.listdir(ENCRYPTED_FOLDER):
            if filename.endswith('_metadata.json'):
                metadata_path = os.path.join(ENCRYPTED_FOLDER, filename)
                try:
                    with open(metadata_path, 'r') as f:
                        metadata = json.load(f)
                    if metadata.get('user_id') == user_id and metadata.get('verification_type') == 'first_humanity_verification':
                        stored_verification_id = metadata.get('verification_id')
                        stored_metadata = metadata
                        break
                except Exception as e:
                    logger.warning(f"   ⚠️  Error reading metadata file {filename}: {e}")
                    continue
        
        if not stored_verification_id:
            raise HTTPException(status_code=404, detail=f"No stored verification found for user_id: {user_id}")
        
        logger.info(f"   🔍 Found stored verification: {Fore.GREEN}{stored_verification_id}{Style.RESET_ALL}")
        
        # Decrypt stored file
        stored_encrypted_filename = f"{stored_verification_id}_encrypted.{stored_metadata.get('file_extension', 'txt')}"
        stored_encrypted_path = os.path.join(ENCRYPTED_FOLDER, stored_encrypted_filename)
        
        if not os.path.exists(stored_encrypted_path):
            raise HTTPException(status_code=404, detail="Stored encrypted file not found")
        
        stored_decrypted_path = os.path.join(UPLOAD_FOLDER, f"{stored_verification_id}_decrypted.txt")
        decrypt_file(stored_encrypted_path, stored_decrypted_path)
        logger.info(f"   🔓 Stored file decrypted to: {Fore.CYAN}{stored_decrypted_path}{Style.RESET_ALL}")
        
        # Run similarity check script
        logger.info(f"   🔬 Running similarity check...")
        similarity_script_path = "./similarity_check.sh"
        
        try:
            result = subprocess.run(
                [similarity_script_path, upload_path, stored_decrypted_path],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                logger.error(f"   ❌ Similarity check script failed: {result.stderr}")
                raise HTTPException(status_code=500, detail="Similarity check script failed")
            
            # Parse similarity result
            similarity_output = result.stdout.strip()
            logger.info(f"   📊 Similarity script output: {Fore.CYAN}{similarity_output}{Style.RESET_ALL}")
            
            # Extract similarity result and probability
            similarity_result = "UNRELATED_PERSON"  # Default
            probability_score = 0.0
            
            if "SAME_PERSON" in similarity_output:
                similarity_result = "SAME_PERSON"
                probability_score = 0.95
            elif "RELATED_PERSON" in similarity_output:
                similarity_result = "RELATED_PERSON"
                probability_score = 0.75
            else:
                similarity_result = "UNRELATED_PERSON"
                probability_score = 0.25
            
            logger.info(f"   🎯 Similarity Result: {Fore.GREEN}{similarity_result}{Style.RESET_ALL}")
            logger.info(f"   📈 Probability Score: {Fore.GREEN}{probability_score}{Style.RESET_ALL}")
            
        except subprocess.TimeoutExpired:
            logger.error("   ⏰ Similarity check script timed out")
            raise HTTPException(status_code=500, detail="Similarity check script timed out")
        except Exception as e:
            logger.error(f"   ❌ Error running similarity check: {e}")
            raise HTTPException(status_code=500, detail=f"Error running similarity check: {str(e)}")
        
        # Notify GolemDB
        logger.info(f"   📡 Notifying GolemDB...")
        golemdb_data = {
            'check_id': check_id,
            'user_id': user_id,
            'stored_verification_id': stored_verification_id,
            'similarity_result': similarity_result,
            'probability_score': probability_score,
            'timestamp': datetime.now().isoformat(),
            'check_type': 'similarity_check'
        }
        
        golemdb_success = await notify_golem('similarity_check', golemdb_data)
        if golemdb_success:
            logger.info(f"   ✅ GolemDB notification sent successfully")
        else:
            logger.warning(f"   ⚠️  GolemDB notification failed")
        
        # Clean up files
        os.remove(upload_path)
        os.remove(stored_decrypted_path)
        logger.info(f"   🗑️  Temporary files cleaned up")
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Prepare result data
        result_data = {
            'check_id': check_id,
            'similarity_result': similarity_result,
            'probability_score': probability_score,
            'timestamp': golemdb_data['timestamp']
        }
        
        # Log success
        log_request_success("SIMILARITY CHECK", result_data, processing_time)
        
        return {
            'success': True,
            'message': 'Similarity check completed successfully',
            'check_id': check_id,
            'similarity_result': similarity_result,
            'probability_score': probability_score,
            'stored_verification_id': stored_verification_id,
            'golemdb_notified': golemdb_success
        }
        
    except HTTPException:
        raise
    except Exception as e:
        processing_time = (datetime.now() - start_time).total_seconds()
        log_request_error("SIMILARITY CHECK", str(e))
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/verification_status/{user_id}")
async def get_verification_status(user_id: str):
    """Get verification status for a user"""
    try:
        logger.info(f"🔍 Checking verification status for user: {Fore.GREEN}{user_id}{Style.RESET_ALL}")
        
        # Find all verifications for this user
        verifications = []
        similarity_checks = []
        
        for filename in os.listdir(ENCRYPTED_FOLDER):
            if filename.endswith('_metadata.json'):
                metadata_path = os.path.join(ENCRYPTED_FOLDER, filename)
                try:
                    with open(metadata_path, 'r') as f:
                        metadata = json.load(f)
                    
                    if metadata.get('user_id') == user_id:
                        if metadata.get('verification_type') == 'first_humanity_verification':
                            verifications.append({
                                'verification_id': metadata.get('verification_id'),
                                'user_id': metadata.get('user_id'),
                                'external_kyc_document_id': metadata.get('external_kyc_document_id'),
                                'humanity_score': metadata.get('humanity_score'),
                                'timestamp': metadata.get('timestamp'),
                                'similarity_result': None,
                                'probability_score': None
                            })
                        elif metadata.get('check_type') == 'similarity_check':
                            similarity_checks.append({
                                'check_id': metadata.get('check_id'),
                                'user_id': metadata.get('user_id'),
                                'stored_verification_id': metadata.get('stored_verification_id'),
                                'similarity_result': metadata.get('similarity_result'),
                                'probability_score': metadata.get('probability_score'),
                                'timestamp': metadata.get('timestamp')
                            })
                except Exception as e:
                    logger.warning(f"   ⚠️  Error reading metadata file {filename}: {e}")
                    continue
        
        # Match similarity checks with verifications
        for verification in verifications:
            for check in similarity_checks:
                if check['stored_verification_id'] == verification['verification_id']:
                    verification['similarity_result'] = check['similarity_result']
                    verification['probability_score'] = check['probability_score']
                    break
        
        logger.info(f"   📊 Found {len(verifications)} verifications and {len(similarity_checks)} similarity checks")
        
        return {
            'user_id': user_id,
            'verifications': verifications,
            'total_verifications': len(verifications),
            'total_similarity_checks': len(similarity_checks)
        }
        
    except Exception as e:
        logger.error(f"❌ Error getting verification status: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/verification-with-golem/{user_id}")
async def get_verification_with_golem_db(user_id: str):
    """Get verification data using local biometrics data enhanced with Golem DB annotations"""
    try:
        from golem_endpoints import fetch_verification_by_entity_key
        
        logger.info(f"🔍 Fetching verification with Golem DB integration for user: {Fore.GREEN}{user_id}{Style.RESET_ALL}")
        
        # Step 1: Get verification data from local biometrics server (this backend's own data)
        local_verification_data = await get_verification_status(user_id)
        
        if not local_verification_data.get("verifications") or len(local_verification_data["verifications"]) == 0:
            raise HTTPException(status_code=404, detail=f"No verifications found for user {user_id}")
        
        # Get the latest verification (first one in the list)
        latest_verification = local_verification_data["verifications"][0]  # Most recent
        verification_id = latest_verification["verification_id"]
        
        logger.info(f"   📋 Found latest verification: {Fore.CYAN}{verification_id}{Style.RESET_ALL}")
        
        # Step 2: Try to fetch from Golem DB using verification_id to find entity_key
        try:
            from golem_endpoints import fetch_latest_verification_by_timestamp
            
            # First try to get the verification with entity_key from Golem DB
            verification_with_annotations = await fetch_latest_verification_by_timestamp()
            
            if verification_with_annotations is not None:
                logger.info(f"   ✅ Found verification in Golem DB with entity key: {Fore.GREEN}{verification_with_annotations.get('entity_key', 'N/A')}{Style.RESET_ALL}")
                
                # Merge local biometrics data with Golem DB annotations
                return {
                    "status": "success",
                    "verification": {
                        **verification_with_annotations,
                        **latest_verification,  # Merge local biometrics data
                        "entity_key": verification_with_annotations.get('entity_key')
                    },
                    "source": "golem_db",
                    "local_biometrics_data": latest_verification
                }
            else:
                logger.warning(f"   ⚠️  Verification not found in Golem DB")
        except Exception as golem_error:
            logger.warning(f"   ⚠️  Error fetching from Golem DB: {golem_error}")
        
        # Fallback: Return local biometrics data with enhanced annotations
        logger.info(f"   📊 Returning local biometrics server data with enhanced annotations")
        return {
            "status": "success",
            "verification": {
                **latest_verification,
                "source": "local_biometrics_server",
                "total_verifications": local_verification_data.get("total_verifications", 0),
                "annotations": {
                    "user_id": user_id,
                    "verification_id": verification_id,
                    "humanity_score": str(latest_verification["humanity_score"]),
                    "timestamp": latest_verification["timestamp"],
                    "external_kyc_document_id": latest_verification["external_kyc_document_id"],
                    "record_type": "humanity_verification",
                    "source": "local_biometrics_server"
                }
            },
            "source": "local_biometrics_server",
            "local_biometrics_data": latest_verification
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching verification with Golem DB for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch verification for user {user_id}: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
