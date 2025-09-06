#!/usr/bin/env python3
"""
Genome Device Script
Handles STR profile generation and upload to biometrics server
Supports two modes: humanity verification and identity confirmation
"""

import os
import sys
import json
import uuid
import time
import logging
import subprocess
import argparse
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import requests
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class GenomeDevice:
    """Genome device for STR profile generation and biometric verification"""
    
    def __init__(self, server_url: str = "https://biometrics-server.biokami.com"):
        self.server_url = server_url.rstrip('/')
        self.script_dir = Path(__file__).parent
        self.generate_script = self.script_dir / "generate_str_profile.sh"
        
        # Validate script exists
        if not self.generate_script.exists():
            raise FileNotFoundError(f"Generate script not found: {self.generate_script}")
        
        # Make script executable
        os.chmod(self.generate_script, 0o755)
        
        logger.info(f"Genome Device initialized")
        logger.info(f"Server URL: {self.server_url}")
        logger.info(f"Generate script: {self.generate_script}")
    
    def generate_str_profile(self, vcf_file: str, output_name: str = None) -> Tuple[str, str]:
        """
        Generate STR profile using the bash script
        
        Args:
            vcf_file: Path to VCF file
            output_name: Optional name for output files
            
        Returns:
            Tuple of (final_str_file_path, profile_summary_path)
        """
        logger.info(f"Generating STR profile from: {vcf_file}")
        
        # Validate VCF file exists
        if not os.path.exists(vcf_file):
            raise FileNotFoundError(f"VCF file not found: {vcf_file}")
        
        # Set default output name if not provided
        if not output_name:
            output_name = Path(vcf_file).stem
        
        # Prepare command
        cmd = [str(self.generate_script), vcf_file, output_name]
        
        logger.info(f"Running command: {' '.join(cmd)}")
        
        try:
            # Run the script
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            if result.returncode != 0:
                logger.error(f"Script failed with return code {result.returncode}")
                logger.error(f"STDERR: {result.stderr}")
                raise RuntimeError(f"STR profile generation failed: {result.stderr}")
            
            # Check for generated files
            final_str_file = self.script_dir / f"{output_name}_str_final.txt"
            profile_summary = self.script_dir / f"{output_name}_profile_summary.txt"
            
            if not final_str_file.exists():
                raise FileNotFoundError(f"Expected output file not found: {final_str_file}")
            
            logger.info(f"STR profile generated successfully")
            logger.info(f"Final STR file: {final_str_file}")
            logger.info(f"Profile summary: {profile_summary}")
            
            return str(final_str_file), str(profile_summary) if profile_summary.exists() else None
            
        except subprocess.TimeoutExpired:
            logger.error("STR profile generation timed out")
            raise RuntimeError("STR profile generation timed out")
        except Exception as e:
            logger.error(f"Error generating STR profile: {e}")
            raise
    
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
    
    def humanity_verification(self, vcf_file: str, user_id: str, 
                            external_kyc_document_id: str, output_name: str = None) -> Dict[str, Any]:
        """
        Perform first humanity verification
        
        Args:
            vcf_file: Path to VCF file
            user_id: User identifier
            external_kyc_document_id: KYC document ID
            output_name: Optional name for output files
            
        Returns:
            Server response as dictionary
        """
        logger.info("=" * 60)
        logger.info("HUMANITY VERIFICATION MODE")
        logger.info("=" * 60)
        
        # Generate STR profile
        str_file, summary_file = self.generate_str_profile(vcf_file, output_name)
        
        # Upload to server
        response = self.upload_file(
            str_file, 
            'first_humanity_verification', 
            user_id, 
            external_kyc_document_id
        )
        
        logger.info("Humanity verification completed")
        return response
    
    def identity_confirmation(self, vcf_file: str, user_id: str, 
                            output_name: str = None) -> Dict[str, Any]:
        """
        Perform identity confirmation (similarity check)
        
        Args:
            vcf_file: Path to VCF file
            user_id: User identifier
            output_name: Optional name for output files
            
        Returns:
            Server response as dictionary
        """
        logger.info("=" * 60)
        logger.info("IDENTITY CONFIRMATION MODE")
        logger.info("=" * 60)
        
        # Generate STR profile
        str_file, summary_file = self.generate_str_profile(vcf_file, output_name)
        
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
        description="Genome Device - STR Profile Generation and Biometric Verification",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Humanity verification
  python device.py humanity-verification genome.vcf.gz --user-id user123 --kyc-doc-id doc456
  
  # Identity confirmation
  python device.py identity-confirmation genome.vcf.gz --user-id user123
  
  # Custom server URL
  python device.py humanity-verification genome.vcf.gz --user-id user123 --kyc-doc-id doc456 --server-url http://localhost:5000
        """
    )
    
    parser.add_argument('mode', choices=['humanity-verification', 'identity-confirmation'],
                       help='Operation mode')
    parser.add_argument('vcf_file', help='Path to VCF file')
    parser.add_argument('--user-id', required=True, help='User identifier')
    parser.add_argument('--kyc-doc-id', help='KYC document ID (required for humanity verification)')
    parser.add_argument('--output-name', help='Name for output files (default: VCF filename)')
    parser.add_argument('--server-url', default='https://biometrics-server.biokami.com',
                       help='Biometrics server URL')
    parser.add_argument('--check-health', action='store_true',
                       help='Check server health before proceeding')
    
    args = parser.parse_args()
    
    try:
        # Initialize device
        device = GenomeDevice(args.server_url)
        
        # Check server health if requested
        if args.check_health:
            if not device.check_server_health():
                logger.error("Server health check failed. Exiting.")
                sys.exit(1)
        
        # Validate arguments
        if args.mode == 'humanity-verification' and not args.kyc_doc_id:
            logger.error("KYC document ID is required for humanity verification")
            sys.exit(1)
        
        # Execute based on mode
        if args.mode == 'humanity-verification':
            response = device.humanity_verification(
                args.vcf_file,
                args.user_id,
                args.kyc_doc_id,
                args.output_name
            )
        else:  # identity-confirmation
            response = device.identity_confirmation(
                args.vcf_file,
                args.user_id,
                args.output_name
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
