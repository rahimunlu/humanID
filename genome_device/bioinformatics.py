#!/usr/bin/env python3
"""
Bioinformatics Module
Handles STR profile generation and file processing
"""

import os
import sys
import logging
import subprocess
from pathlib import Path
from typing import Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

class BioinformaticsProcessor:
    """Bioinformatics processor for STR profile generation"""
    
    def __init__(self):
        self.script_dir = Path(__file__).parent
        self.generate_script = self.script_dir / "generate_str_profile.sh"
        
        # Validate script exists
        if not self.generate_script.exists():
            raise FileNotFoundError(f"Generate script not found: {self.generate_script}")
        
        # Make script executable
        os.chmod(self.generate_script, 0o755)
        
        logger.info(f"Bioinformatics processor initialized")
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

def main():
    """Main function for standalone bioinformatics processing"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Bioinformatics Processor - STR Profile Generation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate STR profile
  python bioinformatics.py genome.vcf.gz --output-name sample123
  
  # Generate with default output name
  python bioinformatics.py genome.vcf.gz
        """
    )
    
    parser.add_argument('vcf_file', help='Path to VCF file')
    parser.add_argument('--output-name', help='Name for output files (default: VCF filename)')
    
    args = parser.parse_args()
    
    try:
        # Initialize processor
        processor = BioinformaticsProcessor()
        
        # Generate STR profile
        str_file, summary_file = processor.generate_str_profile(
            args.vcf_file,
            args.output_name
        )
        
        print(f"STR profile generated successfully!")
        print(f"Final STR file: {str_file}")
        if summary_file:
            print(f"Profile summary: {summary_file}")
        
    except KeyboardInterrupt:
        logger.info("Operation cancelled by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Operation failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
