#!/usr/bin/env python3
"""
Send Data Module
Handles uploading final txt files to the biometrics server
"""

import os
import sys
import json
import logging
import argparse
from pathlib import Path
from typing import Dict, Any
import requests

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class DataSender:
    """Data sender for uploading files to biometrics server"""
    
    def __init__(self, server_url: str = "https://biometrics-server.biokami.com"):
        self.server_url = server_url.rstrip('/')
        logger.info(f"Data sender initialized")
        logger.info(f"Server URL: {self.server_url}")
    
    def upload_file(self, file_path: str, endpoint: str, user_id: str, 
                   external_kyc_document_id: str = None) -> Dict[str, Any]:
        """
        Upload file to biometrics server
        
        Args:
            file_path: Path to file to upload
            endpoint: API endpoint ('first_humanity_verification' or 'similarity_check')
            user_id: User identifier
            external_kyc_document_id: KYC document ID (required for first verification)
            
        Returns:
            Server response as dictionary
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Prepare URL
        url = f"{self.server_url}/{endpoint}"
        
        # Prepare form data
        form_data = {'user_id': user_id}
        if external_kyc_document_id:
            form_data['external_kyc_document_id'] = external_kyc_document_id
        
        # Prepare file
        filename = os.path.basename(file_path)
        
        logger.info(f"Uploading file to {url}")
        logger.info(f"File: {filename}")
        logger.info(f"User ID: {user_id}")
        if external_kyc_document_id:
            logger.info(f"KYC Document ID: {external_kyc_document_id}")
        
        try:
            with open(file_path, 'rb') as f:
                files = {'file': (filename, f, 'text/plain')}
                
                response = requests.post(
                    url,
                    data=form_data,
                    files=files,
                    timeout=60
                )
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Upload failed: {e}")
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_detail = e.response.json()
                    logger.error(f"Server error: {error_detail}")
                except:
                    logger.error(f"Server response: {e.response.text}")
            raise
    
    def humanity_verification(self, str_file: str, user_id: str, 
                            external_kyc_document_id: str) -> Dict[str, Any]:
        """
        Perform first humanity verification
        
        Args:
            str_file: Path to STR file
            user_id: User identifier
            external_kyc_document_id: KYC document ID
            
        Returns:
            Server response as dictionary
        """
        logger.info("=" * 60)
        logger.info("HUMANITY VERIFICATION MODE")
        logger.info("=" * 60)
        
        # Upload to server
        response = self.upload_file(
            str_file, 
            'first_humanity_verification', 
            user_id, 
            external_kyc_document_id
        )
        
        logger.info("Humanity verification completed")
        return response
    
    def identity_confirmation(self, str_file: str, user_id: str) -> Dict[str, Any]:
        """
        Perform identity confirmation (similarity check)
        
        Args:
            str_file: Path to STR file
            user_id: User identifier
            
        Returns:
            Server response as dictionary
        """
        logger.info("=" * 60)
        logger.info("IDENTITY CONFIRMATION MODE")
        logger.info("=" * 60)
        
        # Upload to server
        response = self.upload_file(
            str_file, 
            'similarity_check', 
            user_id
        )
        
        logger.info("Identity confirmation completed")
        return response
    
    def check_server_health(self) -> bool:
        """Check if the biometrics server is healthy"""
        try:
            url = f"{self.server_url}/health"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            health_data = response.json()
            logger.info(f"Server health check: {health_data.get('status', 'unknown')}")
            return health_data.get('status') == 'healthy'
            
        except Exception as e:
            logger.error(f"Server health check failed: {e}")
            return False

def main():
    """Main function with CLI interface"""
    parser = argparse.ArgumentParser(
        description="Data Sender - Upload STR Files to Biometrics Server",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Humanity verification
  python send_data.py humanity-verification sample_str_final.txt --user-id user123 --kyc-doc-id doc456
  
  # Identity confirmation
  python send_data.py identity-confirmation sample_str_final.txt --user-id user123
  
  # Custom server URL
  python send_data.py humanity-verification sample_str_final.txt --user-id user123 --kyc-doc-id doc456 --server-url http://localhost:5000
        """
    )
    
    parser.add_argument('mode', choices=['humanity-verification', 'identity-confirmation'],
                       help='Operation mode')
    parser.add_argument('str_file', help='Path to STR file to upload')
    parser.add_argument('--user-id', required=True, help='User identifier')
    parser.add_argument('--kyc-doc-id', help='KYC document ID (required for humanity verification)')
    parser.add_argument('--server-url', default='https://biometrics-server.biokami.com',
                       help='Biometrics server URL')
    parser.add_argument('--check-health', action='store_true',
                       help='Check server health before proceeding')
    
    args = parser.parse_args()
    
    try:
        # Initialize sender
        sender = DataSender(args.server_url)
        
        # Check server health if requested
        if args.check_health:
            if not sender.check_server_health():
                logger.error("Server health check failed. Exiting.")
                sys.exit(1)
        
        # Validate arguments
        if args.mode == 'humanity-verification' and not args.kyc_doc_id:
            logger.error("KYC document ID is required for humanity verification")
            sys.exit(1)
        
        # Execute based on mode
        if args.mode == 'humanity-verification':
            response = sender.humanity_verification(
                args.str_file,
                args.user_id,
                args.kyc_doc_id
            )
        else:  # identity-confirmation
            response = sender.identity_confirmation(
                args.str_file,
                args.user_id
            )
        
        # Print results
        print("\n" + "=" * 60)
        print("RESULTS")
        print("=" * 60)
        print(json.dumps(response, indent=2))
        
        if response.get('success'):
            logger.info("Operation completed successfully!")
        else:
            logger.error("Operation failed!")
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Operation failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
