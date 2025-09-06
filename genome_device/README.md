# Genome Device

This directory contains the genome device script that generates STR profiles from VCF files and uploads them to the biometrics server for verification.

## Files

- `device.py` - Main Python script for genome device operations
- `generate_str_profile.sh` - Bash script for STR profile generation from VCF files
- `requirements.txt` - Python dependencies
- `README.md` - This file

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Ensure the bash script is executable:
```bash
chmod +x generate_str_profile.sh
```

## Usage

The device supports two modes:

### 1. Humanity Verification (First-time verification)

```bash
python device.py humanity-verification genome.vcf.gz --user-id user123 --kyc-doc-id doc456
```

### 2. Identity Confirmation (Similarity check against existing records)

```bash
python device.py identity-confirmation genome.vcf.gz --user-id user123
```

### Additional Options

- `--output-name NAME` - Custom name for output files (default: VCF filename)
- `--server-url URL` - Custom biometrics server URL (default: https://biometrics-server.biokami.com)
- `--check-health` - Check server health before proceeding

## How it Works

1. **STR Profile Generation**: The script runs `generate_str_profile.sh` to process the VCF file and generate a STR profile
2. **File Upload**: The generated STR profile is uploaded to the biometrics server
3. **Verification**: The server processes the file and returns verification results

## Output Files

The script generates several files during processing:
- `{name}_str_final.txt` - Main STR file uploaded to server
- `{name}_profile_summary.txt` - Summary of the generated profile
- `{name}_variant_types.txt` - Breakdown of variant types
- Other intermediate files (cleaned up automatically)

## Requirements

- Python 3.7+
- bcftools (for VCF processing)
- Internet connection (for server communication)
