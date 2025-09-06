#!/bin/bash

# =============================================================================
# STR Profile Generation Script
# =============================================================================
# This script generates a comprehensive STR profile from a single VCF file
# and creates all necessary output files for later similarity comparison.
# =============================================================================

# Color codes for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${BLUE}==============================================================================${NC}"
    echo -e "${WHITE}$1${NC}"
    echo -e "${BLUE}==============================================================================${NC}"
}

print_step() {
    echo -e "\n${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to format numbers with commas
format_number() {
    printf "%'d" $1
}

# Function to calculate percentage
calculate_percentage() {
    local part=$1
    local total=$2
    if [ $total -gt 0 ]; then
        echo "scale=2; $part * 100 / $total" | bc
    else
        echo "0.00"
    fi
}

# Function to estimate processing time
estimate_time() {
    local lines=$1
    local estimated_minutes=$((lines / 100000))
    if [ $estimated_minutes -lt 1 ]; then
        echo "< 1 minute"
    else
        echo "~$estimated_minutes minutes"
    fi
}

# Function to show usage
show_usage() {
    echo -e "${WHITE}Usage: $0 <vcf_file> [output_name]${NC}"
    echo -e "${CYAN}  vcf_file    : Path to the VCF file (e.g., genome.vcf.gz)${NC}"
    echo -e "${CYAN}  output_name : Optional name for output files (default: genome)${NC}"
    echo -e "\n${YELLOW}Example:${NC}"
    echo -e "  $0 max_genome.mm2.sortdup.bqsr.hc.vcf.gz max"
    echo -e "  $0 dad_genome.vcf.gz dad"
    exit 1
}

# =============================================================================
# MAIN SCRIPT START
# =============================================================================

# Check arguments
if [ $# -lt 1 ]; then
    print_error "Missing VCF file argument"
    show_usage
fi

VCF_FILE="$1"
OUTPUT_NAME="${2:-genome}"

# Validate VCF file
if [ ! -f "$VCF_FILE" ]; then
    print_error "VCF file not found: $VCF_FILE"
    exit 1
fi

# Check if bcftools is available
if ! command -v bcftools &> /dev/null; then
    print_error "bcftools is not installed or not in PATH"
    exit 1
fi

print_header "STR Profile Generation Script"
print_info "Input VCF: $VCF_FILE"
print_info "Output name: $OUTPUT_NAME"

# =============================================================================
# STEP 1: EXTRACT VARIANTS
# =============================================================================

print_header "STEP 1: Extracting Variants from VCF File"

print_step "Extracting all variants from $VCF_FILE..."
bcftools view "$VCF_FILE" > "${OUTPUT_NAME}_all_variants.vcf"
if [ $? -eq 0 ]; then
    TOTAL_VARIANTS=$(bcftools view -H "${OUTPUT_NAME}_all_variants.vcf" | wc -l)
    print_success "Extracted $(format_number $TOTAL_VARIANTS) variants"
else
    print_error "Failed to extract variants from $VCF_FILE"
    exit 1
fi

# =============================================================================
# STEP 2: ANALYZE VARIANT TYPES
# =============================================================================

print_header "STEP 2: Analyzing Variant Types"

print_step "Analyzing variant types..."
bcftools query -f '%TYPE\n' "${OUTPUT_NAME}_all_variants.vcf" | sort | uniq -c > "${OUTPUT_NAME}_variant_types.txt"
print_success "Variant type analysis complete"

# Display variant type summary
echo -e "\n${CYAN}Variant Type Summary:${NC}"
while read count type; do
    if [ ! -z "$count" ] && [ ! -z "$type" ]; then
        percentage=$(calculate_percentage $count $TOTAL_VARIANTS)
        echo -e "  ${type}: $(format_number $count) (${percentage}%)"
    fi
done < "${OUTPUT_NAME}_variant_types.txt"

# =============================================================================
# STEP 3: EXTRACT INDELS (STRs)
# =============================================================================

print_header "STEP 3: Extracting Indels (STRs)"

print_step "Extracting indels..."
bcftools view -i 'TYPE="indel"' "${OUTPUT_NAME}_all_variants.vcf" > "${OUTPUT_NAME}_indels.vcf"
if [ $? -eq 0 ]; then
    INDEL_COUNT=$(bcftools view -H "${OUTPUT_NAME}_indels.vcf" | wc -l)
    if [ $INDEL_COUNT -gt 0 ]; then
        print_success "Extracted $(format_number $INDEL_COUNT) indels"
    else
        print_warning "No indels found, using all variants for STR analysis"
        cp "${OUTPUT_NAME}_all_variants.vcf" "${OUTPUT_NAME}_indels.vcf"
        INDEL_COUNT=$TOTAL_VARIANTS
    fi
else
    print_warning "Failed to extract indels, using all variants"
    cp "${OUTPUT_NAME}_all_variants.vcf" "${OUTPUT_NAME}_indels.vcf"
    INDEL_COUNT=$TOTAL_VARIANTS
fi

# =============================================================================
# STEP 4: GENERATE STR PROFILE
# =============================================================================

print_header "STEP 4: Generating STR Profile"

print_step "Generating STR profile..."
bcftools query -f '%CHROM\t%POS\t%REF\t%ALT\n' "${OUTPUT_NAME}_indels.vcf" > "${OUTPUT_NAME}_str_profile.txt"
if [ $? -eq 0 ]; then
    PROFILE_LINES=$(wc -l < "${OUTPUT_NAME}_str_profile.txt")
    print_success "Generated STR profile with $(format_number $PROFILE_LINES) entries"
else
    print_error "Failed to generate STR profile"
    exit 1
fi

# =============================================================================
# STEP 5: SORT STR PROFILE
# =============================================================================

print_header "STEP 5: Sorting STR Profile"

print_step "Sorting STR profile..."
print_info "Estimated time: $(estimate_time $PROFILE_LINES)"
sort "${OUTPUT_NAME}_str_profile.txt" > "${OUTPUT_NAME}_str_profile_sorted.txt"
if [ $? -eq 0 ]; then
    print_success "STR profile sorted successfully"
else
    print_error "Failed to sort STR profile"
    exit 1
fi

# =============================================================================
# STEP 6: CREATE FINAL STR FILE
# =============================================================================

print_header "STEP 6: Creating Final STR File"

print_step "Creating final STR file for upload and comparison..."
# Create a comprehensive STR file with metadata
cat > "${OUTPUT_NAME}_str_final.txt" << EOF
# STR Profile File
# Generated: $(date)
# Source VCF: $VCF_FILE
# Total Variants: $(format_number $TOTAL_VARIANTS)
# STR Entries: $(format_number $PROFILE_LINES)
# Format: CHROM<TAB>POS<TAB>REF<TAB>ALT
# =============================================================================
EOF

# Add the sorted STR data
cat "${OUTPUT_NAME}_str_profile_sorted.txt" >> "${OUTPUT_NAME}_str_final.txt"

print_success "Final STR file created: ${OUTPUT_NAME}_str_final.txt"
print_info "This file can be uploaded to storage AND used for similarity comparison"

# =============================================================================
# STEP 7: CREATE PROFILE SUMMARY
# =============================================================================

print_header "STEP 7: Creating Profile Summary"

print_step "Generating profile summary..."
cat > "${OUTPUT_NAME}_profile_summary.txt" << EOF
STR Profile Summary
==================
Generated: $(date)
Source VCF: $VCF_FILE
Output Name: $OUTPUT_NAME

STATISTICS:
- Total Variants: $(format_number $TOTAL_VARIANTS)
- STR Entries: $(format_number $PROFILE_LINES)
- Indel Count: $(format_number $INDEL_COUNT)

VARIANT TYPE BREAKDOWN:
EOF

# Add variant type breakdown
while read count type; do
    if [ ! -z "$count" ] && [ ! -z "$type" ]; then
        percentage=$(calculate_percentage $count $TOTAL_VARIANTS)
        echo "- ${type}: $(format_number $count) (${percentage}%)" >> "${OUTPUT_NAME}_profile_summary.txt"
    fi
done < "${OUTPUT_NAME}_variant_types.txt"

cat >> "${OUTPUT_NAME}_profile_summary.txt" << EOF

FILES GENERATED:
- ${OUTPUT_NAME}_str_final.txt (Main STR file for upload AND comparison)
- ${OUTPUT_NAME}_str_profile.txt (Raw STR profile)
- ${OUTPUT_NAME}_indels.vcf (Indel VCF file)
- ${OUTPUT_NAME}_all_variants.vcf (All variants VCF file)
- ${OUTPUT_NAME}_variant_types.txt (Variant type breakdown)
- ${OUTPUT_NAME}_profile_summary.txt (This summary file)

USAGE:
- Upload ${OUTPUT_NAME}_str_final.txt to your storage system
- Use the SAME file for similarity comparison
- Keep all files for future reference
EOF

print_success "Profile summary created: ${OUTPUT_NAME}_profile_summary.txt"

# =============================================================================
# STEP 8: DISPLAY RESULTS
# =============================================================================

print_header "FINAL RESULTS - STR Profile Generation Complete"

echo -e "${WHITE}📊 Profile Statistics:${NC}"
echo -e "  Total Variants: $(format_number $TOTAL_VARIANTS)"
echo -e "  STR Entries: $(format_number $PROFILE_LINES)"
echo -e "  Indel Count: $(format_number $INDEL_COUNT)"

echo -e "\n${WHITE}📁 Generated Files:${NC}"
echo -e "  ${GREEN}${OUTPUT_NAME}_str_final.txt${NC} - Main STR file (upload + comparison)"
echo -e "  ${YELLOW}${OUTPUT_NAME}_profile_summary.txt${NC} - Profile summary"
echo -e "  ${PURPLE}${OUTPUT_NAME}_variant_types.txt${NC} - Variant type breakdown"

echo -e "\n${WHITE}🎯 Next Steps:${NC}"
echo -e "  1. Upload ${GREEN}${OUTPUT_NAME}_str_final.txt${NC} to your storage system"
echo -e "  2. Use the same file for similarity comparison"
echo -e "  3. Keep all generated files for future reference"

# =============================================================================
# CLEANUP
# =============================================================================

print_header "Cleanup"

print_step "Cleaning up intermediate files..."
rm -f "${OUTPUT_NAME}_all_variants.vcf"
print_success "Intermediate files cleaned up"

# =============================================================================
# FINAL MESSAGE
# =============================================================================

print_header "Profile Generation Complete!"

echo -e "${GREEN}🎉 STR profile generated successfully!${NC}"
echo -e "${CYAN}📁 Main file ready for upload: ${OUTPUT_NAME}_str_final.txt${NC}"
echo -e "${YELLOW}📊 Profile contains $(format_number $PROFILE_LINES) STR entries${NC}"
echo -e "${WHITE}⏱️  Total processing time: $SECONDS seconds${NC}"

print_info "You can now upload the STR file and use it for similarity comparison!"

echo -e "\n${BLUE}==============================================================================${NC}"
echo -e "${WHITE}Thank you for using the STR Profile Generation Script!${NC}"
echo -e "${BLUE}==============================================================================${NC}"
