#!/bin/bash

# =============================================================================
# STR Similarity Confirmation Script
# =============================================================================
# This script compares two STR profiles and determines the relationship type:
# - Same person (98%+ similarity)
# - Related person (50-97% similarity)
# - Different unrelated person (<50% similarity)
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

print_result() {
    echo -e "${GREEN}🎯 $1${NC}"
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

# Function to show usage
show_usage() {
    echo -e "${WHITE}Usage: $0 <profile1> <profile2> [options]${NC}"
    echo -e "${CYAN}  profile1    : First STR profile file (sorted)${NC}"
    echo -e "${CYAN}  profile2    : Second STR profile file (sorted)${NC}"
    echo -e "\n${YELLOW}Options:${NC}"
    echo -e "  -v, --verbose    : Show detailed comparison results"
    echo -e "  -q, --quiet      : Show only final result"
    echo -e "  -h, --help       : Show this help message"
    echo -e "\n${YELLOW}Examples:${NC}"
    echo -e "  $0 max_str_profile_sorted.txt dad_str_profile_sorted.txt"
    echo -e "  $0 profile1.txt profile2.txt --verbose"
    echo -e "  $0 profile1.txt profile2.txt --quiet"
    exit 1
}

# Function to determine relationship type
determine_relationship() {
    local similarity=$1
    
    if (( $(echo "$similarity >= 0.98" | bc -l) )); then
        echo "SAME_PERSON"
    elif (( $(echo "$similarity >= 0.50" | bc -l) )); then
        echo "RELATED_PERSON"
    else
        echo "UNRELATED_PERSON"
    fi
}

# Function to get relationship description
get_relationship_description() {
    local relationship=$1
    local similarity=$2
    
    case $relationship in
        "SAME_PERSON")
            echo "Same Person (Identical or Near-Identical)"
            ;;
        "RELATED_PERSON")
            if (( $(echo "$similarity >= 0.70" | bc -l) )); then
                echo "Close Family Member (Parent-Child, Siblings)"
            elif (( $(echo "$similarity >= 0.50" | bc -l) )); then
                echo "Family Member (Parent-Child, Siblings, Half-siblings)"
            else
                echo "Extended Family Member (Cousins, etc.)"
            fi
            ;;
        "UNRELATED_PERSON")
            echo "Unrelated Person (No Family Relationship)"
            ;;
    esac
}

# Function to get confidence level
get_confidence_level() {
    local similarity=$1
    
    if (( $(echo "$similarity >= 0.99" | bc -l) )); then
        echo "Very High (99%+)"
    elif (( $(echo "$similarity >= 0.95" | bc -l) )); then
        echo "High (95-99%)"
    elif (( $(echo "$similarity >= 0.80" | bc -l) )); then
        echo "Moderate-High (80-95%)"
    elif (( $(echo "$similarity >= 0.60" | bc -l) )); then
        echo "Moderate (60-80%)"
    elif (( $(echo "$similarity >= 0.40" | bc -l) )); then
        echo "Low-Moderate (40-60%)"
    else
        echo "Low (<40%)"
    fi
}

# =============================================================================
# MAIN SCRIPT START
# =============================================================================

# Parse command line arguments
VERBOSE=false
QUIET=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -q|--quiet)
            QUIET=true
            shift
            ;;
        -h|--help)
            show_usage
            ;;
        -*)
            print_error "Unknown option $1"
            show_usage
            ;;
        *)
            if [ -z "$PROFILE1" ]; then
                PROFILE1="$1"
            elif [ -z "$PROFILE2" ]; then
                PROFILE2="$1"
            else
                print_error "Too many arguments"
                show_usage
            fi
            shift
            ;;
    esac
done

# Check if required arguments are provided
if [ -z "$PROFILE1" ] || [ -z "$PROFILE2" ]; then
    print_error "Missing required arguments"
    show_usage
fi

# Validate input files
if [ ! -f "$PROFILE1" ]; then
    print_error "Profile file not found: $PROFILE1"
    exit 1
fi

if [ ! -f "$PROFILE2" ]; then
    print_error "Profile file not found: $PROFILE2"
    exit 1
fi

# Check if files have metadata headers and extract data
if head -1 "$PROFILE1" | grep -q "^#"; then
    print_info "Profile 1 has metadata header, extracting STR data..."
    grep -v "^#" "$PROFILE1" > "${PROFILE1}.data"
    PROFILE1="${PROFILE1}.data"
fi

if head -1 "$PROFILE2" | grep -q "^#"; then
    print_info "Profile 2 has metadata header, extracting STR data..."
    grep -v "^#" "$PROFILE2" > "${PROFILE2}.data"
    PROFILE2="${PROFILE2}.data"
fi

# Check if files are sorted
if ! sort -c "$PROFILE1" 2>/dev/null; then
    print_warning "Profile 1 is not sorted, sorting now..."
    sort "$PROFILE1" > "${PROFILE1}.sorted"
    PROFILE1="${PROFILE1}.sorted"
fi

if ! sort -c "$PROFILE2" 2>/dev/null; then
    print_warning "Profile 2 is not sorted, sorting now..."
    sort "$PROFILE2" > "${PROFILE2}.sorted"
    PROFILE2="${PROFILE2}.sorted"
fi

if [ "$QUIET" = false ]; then
    print_header "STR Similarity Confirmation Script"
    print_info "Profile 1: $PROFILE1"
    print_info "Profile 2: $PROFILE2"
fi

# =============================================================================
# STEP 1: ANALYZE PROFILES
# =============================================================================

if [ "$QUIET" = false ]; then
    print_header "STEP 1: Analyzing STR Profiles"
fi

print_step "Reading profile 1..."
PROFILE1_LINES=$(wc -l < "$PROFILE1")
print_success "Profile 1 contains $(format_number $PROFILE1_LINES) STR entries"

print_step "Reading profile 2..."
PROFILE2_LINES=$(wc -l < "$PROFILE2")
print_success "Profile 2 contains $(format_number $PROFILE2_LINES) STR entries"
sleep 0.5

# =============================================================================
# STEP 2: COMPARE PROFILES
# =============================================================================

if [ "$QUIET" = false ]; then
    print_header "STEP 2: Comparing STR Profiles"
fi

print_step "Finding common STRs..."
comm -12 "$PROFILE1" "$PROFILE2" > common_strs.txt
if [ $? -eq 0 ]; then
    COMMON_STRs=$(wc -l < common_strs.txt)
    print_success "Found $(format_number $COMMON_STRs) common STRs"
else
    print_error "Failed to find common STRs"
    exit 1
fi

print_step "Finding profile 1 unique STRs..."
comm -23 "$PROFILE1" "$PROFILE2" > profile1_unique.txt
if [ $? -eq 0 ]; then
    PROFILE1_UNIQUE=$(wc -l < profile1_unique.txt)
    print_success "Found $(format_number $PROFILE1_UNIQUE) unique STRs in profile 1"
else
    print_error "Failed to find profile 1 unique STRs"
    exit 1
fi

print_step "Finding profile 2 unique STRs..."
comm -13 "$PROFILE1" "$PROFILE2" > profile2_unique.txt
if [ $? -eq 0 ]; then
    PROFILE2_UNIQUE=$(wc -l < profile2_unique.txt)
    print_success "Found $(format_number $PROFILE2_UNIQUE) unique STRs in profile 2"
else
    print_error "Failed to find profile 2 unique STRs"
    exit 1
fi
sleep 0.5

# =============================================================================
# STEP 3: CALCULATE SIMILARITY
# =============================================================================

if [ "$QUIET" = false ]; then
    print_header "STEP 3: Calculating Similarity Metrics"
fi

# Calculate Jaccard similarity
TOTAL_STRs=$((PROFILE1_LINES + PROFILE2_LINES - COMMON_STRs))
if [ $TOTAL_STRs -gt 0 ]; then
    SIMILARITY=$(echo "scale=4; $COMMON_STRs / $TOTAL_STRs" | bc)
else
    SIMILARITY="0.0000"
fi

# Calculate percentages
PROFILE1_SHARED_PCT=$(calculate_percentage $COMMON_STRs $PROFILE1_LINES)
PROFILE2_SHARED_PCT=$(calculate_percentage $COMMON_STRs $PROFILE2_LINES)

print_success "Similarity calculation complete"
sleep 0.5

# =============================================================================
# STEP 4: DETERMINE RELATIONSHIP
# =============================================================================

if [ "$QUIET" = false ]; then
    print_header "STEP 4: Determining Relationship Type"
fi

RELATIONSHIP=$(determine_relationship $SIMILARITY)
RELATIONSHIP_DESC=$(get_relationship_description $RELATIONSHIP $SIMILARITY)
CONFIDENCE=$(get_confidence_level $SIMILARITY)
sleep 0.5

# =============================================================================
# STEP 5: DISPLAY RESULTS
# =============================================================================

if [ "$QUIET" = false ]; then
    print_header "FINAL RESULTS - STR Similarity Analysis"
    
    echo -e "${WHITE}📊 Profile Statistics:${NC}"
    echo -e "  Profile 1 STRs: $(format_number $PROFILE1_LINES)"
    echo -e "  Profile 2 STRs: $(format_number $PROFILE2_LINES)"
    echo -e "  Common STRs: $(format_number $COMMON_STRs)"
    echo -e "  Profile 1 Unique: $(format_number $PROFILE1_UNIQUE)"
    echo -e "  Profile 2 Unique: $(format_number $PROFILE2_UNIQUE)"
    
    echo -e "\n${WHITE}📈 Similarity Metrics:${NC}"
    echo -e "  Jaccard Similarity: ${GREEN}$SIMILARITY${NC} ($(echo "scale=2; $SIMILARITY * 100" | bc)%)"
    echo -e "  Profile 1 Shared: ${CYAN}${PROFILE1_SHARED_PCT}%${NC}"
    echo -e "  Profile 2 Shared: ${CYAN}${PROFILE2_SHARED_PCT}%${NC}"
    
    echo -e "\n${WHITE}🎯 Relationship Analysis:${NC}"
    echo -e "  Relationship Type: ${GREEN}$RELATIONSHIP_DESC${NC}"
    echo -e "  Confidence Level: ${YELLOW}$CONFIDENCE${NC}"
    
    echo -e "\n${WHITE}📋 Reference Ranges:${NC}"
    echo -e "  Same Person: 98%+"
    echo -e "  Parent-Child: ~50%"
    echo -e "  Full Siblings: ~50%"
    echo -e "  Half Siblings: ~25%"
    echo -e "  First Cousins: ~12.5%"
    echo -e "  Unrelated: ~30-40%"
fi
sleep 0.5

# =============================================================================
# STEP 6: SAVE RESULTS
# =============================================================================

if [ "$QUIET" = false ]; then
    print_header "STEP 6: Saving Results"
fi

# Create results directory
mkdir -p similarity_results
print_success "Created results directory: similarity_results/"

# Save detailed report
cat > similarity_results/similarity_report.txt << EOF
STR Similarity Analysis Report
Generated: $(date)
Profile 1: $PROFILE1
Profile 2: $PROFILE2

PROFILE STATISTICS:
- Profile 1 STRs: $(format_number $PROFILE1_LINES)
- Profile 2 STRs: $(format_number $PROFILE2_LINES)
- Common STRs: $(format_number $COMMON_STRs)
- Profile 1 Unique: $(format_number $PROFILE1_UNIQUE)
- Profile 2 Unique: $(format_number $PROFILE2_UNIQUE)

SIMILARITY METRICS:
- Jaccard Similarity: $SIMILARITY ($(echo "scale=2; $SIMILARITY * 100" | bc)%)
- Profile 1 Shared: ${PROFILE1_SHARED_PCT}%
- Profile 2 Shared: ${PROFILE2_SHARED_PCT}%

RELATIONSHIP ANALYSIS:
- Relationship Type: $RELATIONSHIP_DESC
- Confidence Level: $CONFIDENCE
- Classification: $RELATIONSHIP

REFERENCE RANGES:
- Same Person: 98%+
- Parent-Child: ~50%
- Full Siblings: ~50%
- Half Siblings: ~25%
- First Cousins: ~12.5%
- Unrelated: ~30-40%

FILES GENERATED:
- common_strs.txt (Common STR entries)
- profile1_unique.txt (Profile 1 unique STRs)
- profile2_unique.txt (Profile 2 unique STRs)
- similarity_report.txt (This report)
EOF

print_success "Detailed report saved: similarity_results/similarity_report.txt"

# Copy result files
cp common_strs.txt similarity_results/
cp profile1_unique.txt similarity_results/
cp profile2_unique.txt similarity_results/

print_success "All result files saved to similarity_results/"
sleep 0.5

# =============================================================================
# STEP 7: FINAL RESULT
# =============================================================================

print_header "SIMILARITY CONFIRMATION RESULT"

case $RELATIONSHIP in
    "SAME_PERSON")
        print_result "SAME PERSON CONFIRMED"
        echo -e "${GREEN}✓ The profiles belong to the same person${NC}"
        echo -e "${CYAN}  Similarity: $(echo "scale-2; $SIMILARITY * 100" | bc)%${NC}"
        echo -e "${YELLOW}  Confidence: $CONFIDENCE${NC}"
        ;;
    "RELATED_PERSON")
        print_result "RELATED PERSON CONFIRMED"
        echo -e "${GREEN}✓ The profiles belong to related individuals${NC}"
        echo -e "${CYAN}  Similarity: $(echo "scale-2; $SIMILARITY * 100" | bc)%${NC}"
        echo -e "${YELLOW}  Relationship: $RELATIONSHIP_DESC${NC}"
        echo -e "${YELLOW}  Confidence: $CONFIDENCE${NC}"
        ;;
    "UNRELATED_PERSON")
        print_result "UNRELATED PERSON CONFIRMED"
        echo -e "${RED}✗ The profiles belong to unrelated individuals${NC}"
        echo -e "${CYAN}  Similarity: $(echo "scale-2; $SIMILARITY * 100" | bc)%${NC}"
        echo -e "${YELLOW}  Confidence: $CONFIDENCE${NC}"
        ;;
esac
sleep 0.5

# =============================================================================
# CLEANUP
# =============================================================================

if [ "$QUIET" = false ]; then
    print_header "Cleanup"
    print_step "Cleaning up temporary files..."
    rm -f common_strs.txt profile1_unique.txt profile2_unique.txt
    rm -f "${PROFILE1}.data" "${PROFILE1}.sorted" "${PROFILE2}.data" "${PROFILE2}.sorted" 2>/dev/null
    print_success "Temporary files cleaned up"
    sleep 0.5
fi

# =============================================================================
# FINAL MESSAGE
# =============================================================================

if [ "$QUIET" = false ]; then
    print_header "Analysis Complete!"
    echo -e "${GREEN}🎉 STR similarity analysis completed successfully!${NC}"
    echo -e "${CYAN}📁 Results saved in: similarity_results/${NC}"
    echo -e "${YELLOW}📊 Final Classification: $RELATIONSHIP${NC}"
    echo -e "${WHITE}⏱️  Total processing time: $SECONDS seconds${NC}"
    
    echo -e "\n${BLUE}==============================================================================${NC}"
    echo -e "${WHITE}Thank you for using the STR Similarity Confirmation Script!${NC}"
    echo -e "${BLUE}==============================================================================${NC}"
else
    # Quiet mode - just show the result
    echo "$RELATIONSHIP"
fi
