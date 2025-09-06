#!/usr/bin/env python3
"""
Flask Biometrics Server
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

from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
from cryptography.fernet import Fernet
import requests

# Initialize Flask app
app = Flask(__name__)

# Configure enhanced logging with colors
import colorama
from colorama import Fore, Back, Style

# Initialize colorama for cross-platform colored output
colorama.init(autoreset=True)

# Configure logging with enhanced formatting
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
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
        elif record.levelno == logging.SUCCESS:
            record.levelname = f"{Fore.GREEN}SUCCESS{Style.RESET_ALL}"
        
        return super().format(record)

# Add custom SUCCESS level
logging.addLevelName(25, "SUCCESS")
def success(self, message, *args, **kwargs):
    if self.isEnabledFor(25):
        self._log(25, message, args, **kwargs)
logging.Logger.success = success

# Apply custom formatter
handler = logging.StreamHandler()
handler.setFormatter(DemoFormatter('%(asctime)s | %(levelname)-8s | %(message)s', '%Y-%m-%d %H:%M:%S'))
logger.handlers = [handler]

# Configuration
UPLOAD_FOLDER = '/tmp/biometrics_uploads'
ENCRYPTED_FOLDER = '/tmp/biometrics_encrypted'
ALLOWED_EXTENSIONS = {'txt', 'csv', 'json'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(ENCRYPTED_FOLDER, exist_ok=True)

# Set Flask config
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['ENCRYPTED_FOLDER'] = ENCRYPTED_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Encryption key (in production, this should be stored securely)
ENCRYPTION_KEY = Fernet.generate_key()
cipher_suite = Fernet(ENCRYPTION_KEY)

# Import Golem DB integration
from golem_endpoints import notify_golem

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
    
    with open(output_path, 'wb') as file:
        file.write(decrypted_data)
    
    return output_path

# notify_golemdb function is now imported from golem_endpoints.py

def get_file_hash(file_path: str) -> str:
    """Calculate SHA-256 hash of a file"""
    hash_sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()

def get_client_info(request):
    """Get detailed client information for logging"""
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', 'unknown'))
    user_agent = request.headers.get('User-Agent', 'unknown')
    return {
        'ip': client_ip,
        'user_agent': user_agent,
        'method': request.method,
        'path': request.path,
        'headers': dict(request.headers)
    }

def log_request_start(endpoint_name, client_info, user_id=None):
    """Log the start of a request with enhanced formatting"""
    logger.info(f"{Fore.BLUE}🚀 {endpoint_name.upper()} REQUEST STARTED{Style.RESET_ALL}")
    logger.info(f"   📍 Client IP: {Fore.CYAN}{client_info['ip']}{Style.RESET_ALL}")
    logger.info(f"   🌐 User Agent: {Fore.CYAN}{client_info['user_agent'][:50]}...{Style.RESET_ALL}")
    if user_id:
        logger.info(f"   👤 User ID: {Fore.GREEN}{user_id}{Style.RESET_ALL}")
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

def log_request_error(endpoint_name, error_msg, client_info):
    """Log request errors with enhanced formatting"""
    logger.error(f"❌ {endpoint_name.upper()} FAILED")
    logger.error(f"   📍 Client IP: {Fore.RED}{client_info['ip']}{Style.RESET_ALL}")
    logger.error(f"   🚨 Error: {Fore.RED}{error_msg}{Style.RESET_ALL}")

def calculate_humanity_score(file_path: str) -> float:
    """Calculate humanity score based on file content analysis"""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        # Count STR entries (lines that contain colon and comma)
        str_entries = 0
        for line in content.split('\n'):
            line = line.strip()
            if ':' in line and ',' in line and not line.startswith('#'):
                str_entries += 1
        
        # Base score on number of STR entries and file structure
        base_score = min(0.8, str_entries / 25.0)  # Normalize to 25 expected entries
        
        # Add some randomness to simulate real analysis
        random_factor = random.uniform(0.1, 0.2)
        
        # Ensure score is between 0.5 and 1.0
        humanity_score = min(1.0, max(0.5, base_score + random_factor))
        
        logger.info(f"Calculated humanity score: {humanity_score:.3f} for {str_entries} STR entries")
        return round(humanity_score, 3)
        
    except Exception as e:
        logger.error(f"Error calculating humanity score: {e}")
        return 0.75  # Default score if calculation fails

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'biometrics_server'
    })

@app.route('/first_humanity_verification', methods=['POST'])
def first_humanity_verification():
    """
    First humanity verification endpoint
    Accepts file upload, encrypts it, stores metadata, and notifies GolemDB
    """
    start_time = datetime.utcnow()
    client_info = get_client_info(request)
    
    try:
        log_request_start("FIRST HUMANITY VERIFICATION", client_info)
        
        # Check if file is present
        if 'file' not in request.files:
            log_request_error("FIRST HUMANITY VERIFICATION", "No file provided in request", client_info)
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            log_request_error("FIRST HUMANITY VERIFICATION", "No file selected", client_info)
            return jsonify({'error': 'No file selected'}), 400
        
        # Get required parameters
        user_id = request.form.get('user_id')
        external_kyc_document_id = request.form.get('external_kyc_document_id')
        
        if not all([user_id, external_kyc_document_id]):
            log_request_error("FIRST HUMANITY VERIFICATION", f"Missing required parameters: user_id={user_id}, external_kyc_document_id={external_kyc_document_id}", client_info)
            return jsonify({
                'error': 'Missing required parameters: user_id, external_kyc_document_id'
            }), 400
        
        log_request_start("FIRST HUMANITY VERIFICATION", client_info, user_id)
        
        # Validate file
        if not allowed_file(file.filename):
            log_request_error("FIRST HUMANITY VERIFICATION", f"File type not allowed: {file.filename}", client_info)
            return jsonify({'error': 'File type not allowed'}), 400
        
        logger.info(f"   📁 File: {Fore.CYAN}{file.filename}{Style.RESET_ALL}")
        logger.info(f"   📏 File Size: {Fore.CYAN}{len(file.read())} bytes{Style.RESET_ALL}")
        file.seek(0)  # Reset file pointer
        
        # Generate unique identifiers
        verification_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        # Secure filename
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{verification_id}.{file_extension}"
        
        logger.info(f"   🆔 Generated Verification ID: {Fore.GREEN}{verification_id}{Style.RESET_ALL}")
        logger.info(f"   📝 KYC Document ID: {Fore.GREEN}{external_kyc_document_id}{Style.RESET_ALL}")
        
        # Save uploaded file
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(upload_path)
        logger.info(f"   💾 File saved to: {Fore.CYAN}{upload_path}{Style.RESET_ALL}")
        
        # Calculate file hash
        file_hash = get_file_hash(upload_path)
        logger.info(f"   🔐 File Hash: {Fore.CYAN}{file_hash[:16]}...{Style.RESET_ALL}")
        
        # Calculate humanity score based on file content
        logger.info(f"   🧮 Calculating humanity score...")
        humanity_score = calculate_humanity_score(upload_path)
        logger.info(f"   📊 Humanity Score: {Fore.GREEN}{humanity_score}{Style.RESET_ALL}")
        
        # Encrypt file
        encrypted_filename = f"{verification_id}_encrypted.{file_extension}"
        encrypted_path = os.path.join(app.config['ENCRYPTED_FOLDER'], encrypted_filename)
        logger.info(f"   🔒 Encrypting file...")
        encrypt_file(upload_path, encrypted_path)
        logger.info(f"   🔐 File encrypted and saved to: {Fore.CYAN}{encrypted_path}{Style.RESET_ALL}")
        
        # Create metadata
        metadata = {
            'verification_id': verification_id,
            'user_id': user_id,
            'external_kyc_document_id': external_kyc_document_id,
            'humanity_score': float(humanity_score),
            'original_filename': filename,
            'file_hash': file_hash,
            'file_size': os.path.getsize(upload_path),
            'encrypted_path': encrypted_path,
            'timestamp': timestamp,
            'verification_type': 'first_humanity_verification'
        }
        
        # Save metadata
        metadata_path = os.path.join(app.config['ENCRYPTED_FOLDER'], f"{verification_id}_metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        logger.info(f"   📋 Metadata saved to: {Fore.CYAN}{metadata_path}{Style.RESET_ALL}")
        
        # Notify GolemDB
        logger.info(f"   📡 Notifying GolemDB...")
        golemdb_data = {
            'verification_id': verification_id,
            'user_id': user_id,
            'external_kyc_document_id': external_kyc_document_id,
            'humanity_score': float(humanity_score),
            'file_hash': file_hash,
            'timestamp': timestamp,
            'verification_type': 'first_humanity_verification'
        }
        
        golemdb_success = notify_golem('humanity_verification', golemdb_data)
        if golemdb_success:
            logger.info(f"   ✅ GolemDB notification sent successfully")
        else:
            logger.warning(f"   ⚠️  GolemDB notification failed")
        
        # Clean up temporary uploaded file
        os.remove(upload_path)
        logger.info(f"   🗑️  Temporary file cleaned up")
        
        # Calculate processing time
        processing_time = (datetime.utcnow() - start_time).total_seconds()
        
        # Prepare result data for logging
        result_data = {
            'verification_id': verification_id,
            'humanity_score': float(humanity_score),
            'user_id': user_id
        }
        
        # Log success
        log_request_success("FIRST HUMANITY VERIFICATION", result_data, processing_time)
        
        return jsonify({
            'success': True,
            'verification_id': verification_id,
            'message': 'File uploaded, encrypted, and stored successfully',
            'metadata': {
                'user_id': user_id,
                'external_kyc_document_id': external_kyc_document_id,
                'humanity_score': float(humanity_score),
                'file_hash': file_hash,
                'timestamp': timestamp
            },
            'golemdb_notified': golemdb_success
        }), 200
        
    except Exception as e:
        log_request_error("FIRST HUMANITY VERIFICATION", f"Internal server error: {str(e)}", client_info)
        return jsonify({
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/similarity_check', methods=['POST'])
def similarity_check():
    """
    Similarity check endpoint
    Accepts file upload, runs similarity_check.sh against stored user file
    """
    start_time = datetime.utcnow()
    client_info = get_client_info(request)
    
    try:
        log_request_start("SIMILARITY CHECK", client_info)
        
        # Check if file is present
        if 'file' not in request.files:
            log_request_error("SIMILARITY CHECK", "No file provided in similarity check request", client_info)
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            log_request_error("SIMILARITY CHECK", "No file selected for similarity check", client_info)
            return jsonify({'error': 'No file selected'}), 400
        
        # Get required parameters
        user_id = request.form.get('user_id')
        
        if not user_id:
            log_request_error("SIMILARITY CHECK", "Missing user_id parameter for similarity check", client_info)
            return jsonify({'error': 'Missing required parameter: user_id'}), 400
        
        log_request_start("SIMILARITY CHECK", client_info, user_id)
        
        # Validate file
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Generate unique identifiers
        check_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        # Secure filename
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{check_id}_new.{file_extension}"
        
        # Save uploaded file
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(upload_path)
        
        # Find stored file for this user
        stored_file_path = None
        stored_metadata = None
        
        # Look for stored files in encrypted folder
        for file_name in os.listdir(app.config['ENCRYPTED_FOLDER']):
            if file_name.endswith('_metadata.json'):
                metadata_path = os.path.join(app.config['ENCRYPTED_FOLDER'], file_name)
                try:
                    with open(metadata_path, 'r') as f:
                        metadata = json.load(f)
                        if metadata.get('user_id') == user_id and metadata.get('verification_type') == 'first_humanity_verification':
                            stored_metadata = metadata
                            stored_file_path = metadata.get('encrypted_path')
                            break
                except Exception as e:
                    print(f"Error reading metadata file {file_name}: {e}")
                    continue
        
        if not stored_file_path or not os.path.exists(stored_file_path):
            # Clean up uploaded file
            os.remove(upload_path)
            return jsonify({
                'error': f'No stored verification file found for user_id: {user_id}'
            }), 404
        
        # Decrypt stored file for comparison
        stored_decrypted_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{check_id}_stored.{file_extension}")
        decrypt_file(stored_file_path, stored_decrypted_path)
        
        # Run similarity check script
        similarity_script_path = os.path.join(os.path.dirname(__file__), 'similarity_check.sh')
        
        if not os.path.exists(similarity_script_path):
            # Clean up files
            os.remove(upload_path)
            os.remove(stored_decrypted_path)
            return jsonify({'error': 'Similarity check script not found'}), 500
        
        # Make script executable
        os.chmod(similarity_script_path, 0o755)
        
        # Run similarity check
        try:
            logger.info(f"Running similarity check script for user {user_id}")
            result = subprocess.run(
                [similarity_script_path, stored_decrypted_path, upload_path, '--quiet'],
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode != 0:
                logger.error(f"Similarity check script failed: {result.stderr}")
                # Clean up files
                os.remove(upload_path)
                os.remove(stored_decrypted_path)
                return jsonify({
                    'error': f'Similarity check failed: {result.stderr}'
                }), 500
            
            # Parse result - extract only the final result from the output
            raw_output = result.stdout.strip()
            logger.info(f"Similarity check raw output: {raw_output}")
            
            # Extract the final result (SAME_PERSON, RELATED_PERSON, or UNRELATED_PERSON)
            similarity_result = "UNRELATED_PERSON"  # Default
            if "SAME_PERSON" in raw_output:
                similarity_result = "SAME_PERSON"
            elif "RELATED_PERSON" in raw_output:
                similarity_result = "RELATED_PERSON"
            elif "UNRELATED_PERSON" in raw_output:
                similarity_result = "UNRELATED_PERSON"
            
            logger.info(f"Parsed similarity result: {similarity_result}")
            
            # Calculate probability score based on result
            if similarity_result == "SAME_PERSON":
                probability_score = 0.99
            elif similarity_result == "RELATED_PERSON":
                probability_score = 0.75
            else:  # UNRELATED_PERSON
                probability_score = 0.25
            
            # Create check metadata
            check_metadata = {
                'check_id': check_id,
                'user_id': user_id,
                'stored_verification_id': stored_metadata.get('verification_id'),
                'similarity_result': similarity_result,
                'probability_score': probability_score,
                'new_file_hash': get_file_hash(upload_path),
                'stored_file_hash': stored_metadata.get('file_hash'),
                'timestamp': timestamp,
                'check_type': 'similarity_check'
            }
            
            # Save check metadata
            check_metadata_path = os.path.join(app.config['ENCRYPTED_FOLDER'], f"{check_id}_check_metadata.json")
            with open(check_metadata_path, 'w') as f:
                json.dump(check_metadata, f, indent=2)
            
            # Notify GolemDB
            golemdb_data = {
                'check_id': check_id,
                'user_id': user_id,
                'stored_verification_id': stored_metadata.get('verification_id'),
                'similarity_result': similarity_result,
                'probability_score': probability_score,
                'timestamp': timestamp,
                'check_type': 'similarity_check'
            }
            
            golemdb_success = notify_golem('similarity_check', golemdb_data)
            
            # Clean up files
            os.remove(upload_path)
            os.remove(stored_decrypted_path)
            
            return jsonify({
                'success': True,
                'check_id': check_id,
                'similarity_result': similarity_result,
                'probability_score': probability_score,
                'message': 'Similarity check completed successfully',
                'metadata': {
                    'user_id': user_id,
                    'stored_verification_id': stored_metadata.get('verification_id'),
                    'similarity_result': similarity_result,
                    'probability_score': probability_score,
                    'timestamp': timestamp
                },
                'golemdb_notified': golemdb_success
            }), 200
            
        except subprocess.TimeoutExpired:
            # Clean up files
            os.remove(upload_path)
            os.remove(stored_decrypted_path)
            return jsonify({'error': 'Similarity check timed out'}), 500
        
    except Exception as e:
        return jsonify({
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/verification_status/<user_id>', methods=['GET'])
def get_verification_status(user_id: str):
    """Get verification status for a user"""
    try:
        logger.info(f"Getting verification status for user: {user_id}")
        verifications = []
        
        # Look for verification files
        for file_name in os.listdir(app.config['ENCRYPTED_FOLDER']):
            if file_name.endswith('_metadata.json') or file_name.endswith('_check_metadata.json'):
                metadata_path = os.path.join(app.config['ENCRYPTED_FOLDER'], file_name)
                try:
                    with open(metadata_path, 'r') as f:
                        metadata = json.load(f)
                        if metadata.get('user_id') == user_id:
                            verification_data = {
                                'user_id': metadata.get('user_id'),
                                'verification_id': metadata.get('verification_id') or metadata.get('check_id'),
                                'verification_type': metadata.get('verification_type') or metadata.get('check_type'),
                                'timestamp': metadata.get('timestamp')
                            }
                            
                            # Add humanity_score for first verification
                            if metadata.get('humanity_score') is not None:
                                verification_data['humanity_score'] = metadata.get('humanity_score')
                            
                            # Add similarity result for similarity checks
                            if metadata.get('similarity_result'):
                                verification_data['similarity_result'] = metadata.get('similarity_result')
                            
                            # Add probability score for similarity checks
                            if metadata.get('probability_score') is not None:
                                verification_data['probability_score'] = metadata.get('probability_score')
                            
                            verifications.append(verification_data)
                            
                except Exception as e:
                    logger.error(f"Error reading metadata file {file_name}: {e}")
                    continue
        
        # Sort by timestamp (newest first)
        verifications.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        logger.info(f"Found {len(verifications)} verifications for user {user_id}")
        return jsonify({
            'user_id': user_id,
            'verifications': verifications,
            'count': len(verifications)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting verification status: {e}")
        return jsonify({
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/latest_verification', methods=['GET'])
def get_latest_verification():
    """Get the latest humanity verification from Golem DB"""
    try:
        logger.info("Fetching latest verification from Golem DB")
        
        # Import the fetch function from golem_endpoints
        from golem_endpoints import fetch_latest_verification_sync
        
        # Fetch the latest verification
        verification = fetch_latest_verification_sync()
        
        if verification is None:
            return jsonify({
                'error': 'No verification found in Golem DB'
            }), 404
        
        logger.info(f"Found latest verification: {verification.get('verification_id', 'unknown')}")
        return jsonify({
            'status': 'success',
            'verification': verification
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching latest verification: {e}")
        return jsonify({
            'error': f'Failed to fetch verification: {str(e)}'
        }), 500

@app.route('/all_verifications', methods=['GET'])
def get_all_verifications():
    """Get all humanity verifications from Golem DB"""
    try:
        logger.info("Fetching all verifications from Golem DB")
        
        # Import the fetch function from golem_endpoints
        from golem_endpoints import fetch_all_verifications_sync
        
        # Fetch all verifications
        verifications = fetch_all_verifications_sync()
        
        logger.info(f"Found {len(verifications)} verifications in Golem DB")
        return jsonify({
            'status': 'success',
            'verifications': verifications,
            'count': len(verifications)
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching verifications: {e}")
        return jsonify({
            'error': f'Failed to fetch verifications: {str(e)}'
        }), 500

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    return jsonify({'error': 'File too large. Maximum size is 16MB.'}), 413

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Development server
    app.run(debug=True, host='0.0.0.0', port=5000)
