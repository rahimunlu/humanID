# Humanity Verification SDK

A Python SDK that allows other companies to integrate with the HumanID network for decentralized human verification services.

## Features

- **First Humanity Verification**: Initiate verification process for new users
- **Humanity Confirmation**: Confirm successful verification of users
- **Blockchain Integration**: Automatic transaction fee handling using organization wallet
- **Comprehensive Error Handling**: Detailed error messages and validation
- **Network Health Monitoring**: Check network status and connectivity

## Installation

```bash
pip install -r requirements.txt
```

## Quick Start

### Basic Usage

```python
from humanity_sdk import HumanitySDK, first_humanity_verification, humanity_confirmation

# Initialize SDK
sdk = HumanitySDK(network_endpoint="https://api.humanid.network")

# Your organization's private key (covers transaction fees)
private_key = "your_64_character_hex_private_key"

# First verification
result = sdk.first_humanity_verification(
    private_key=private_key,
    user_id="user_12345",
    custodian="custodian_org",
    custodian_server_endpoint="https://custodian.example.com/verify"
)

print(f"Verification ID: {result.verification_id}")
print(f"Status: {result.status}")
print(f"Transaction Hash: {result.transaction_hash}")

# Confirm verification
confirmation = sdk.humanity_confirmation(
    private_key=private_key,
    user_id="user_12345",
    custodian_server_endpoint="https://custodian.example.com/verify"
)

print(f"Humanity Score: {confirmation.humanity_score}")
print(f"Status: {confirmation.status}")
```

### Using Convenience Functions

```python
from humanity_sdk import first_humanity_verification, humanity_confirmation

# Direct function calls
result = first_humanity_verification(
    private_key="your_private_key",
    user_id="user_12345",
    custodian="custodian_org",
    custodian_server_endpoint="https://custodian.example.com/verify"
)

confirmation = humanity_confirmation(
    private_key="your_private_key",
    user_id="user_12345",
    custodian_server_endpoint="https://custodian.example.com/verify"
)
```

## API Reference

### HumanitySDK Class

#### Constructor

```python
HumanitySDK(network_endpoint="https://api.humanid.network", 
           custodian_endpoint=None, 
           timeout=30)
```

**Parameters:**
- `network_endpoint` (str): Base URL for the HumanID network API
- `custodian_endpoint` (str, optional): Custodian server endpoint
- `timeout` (int): Request timeout in seconds (default: 30)

#### Methods

##### first_humanity_verification()

Initiates the first humanity verification for a user.

```python
def first_humanity_verification(self, 
                               private_key: str, 
                               user_id: str, 
                               custodian: str, 
                               custodian_server_endpoint: str) -> VerificationResult
```

**Parameters:**
- `private_key` (str): Organization wallet private key (64-character hex string)
- `user_id` (str): Unique identifier for the user (3-100 characters)
- `custodian` (str): Custodian identifier for the verification
- `custodian_server_endpoint` (str): Endpoint where custodian will handle verification

**Returns:** `VerificationResult` object

**Raises:**
- `ValidationError`: If input parameters are invalid
- `NetworkError`: If network request fails
- `BlockchainError`: If blockchain transaction fails

##### humanity_confirmation()

Confirms humanity verification for a user.

```python
def humanity_confirmation(self, 
                        private_key: str, 
                        user_id: str, 
                        custodian_server_endpoint: str) -> VerificationResult
```

**Parameters:**
- `private_key` (str): Organization wallet private key (64-character hex string)
- `user_id` (str): Unique identifier for the user (3-100 characters)
- `custodian_server_endpoint` (str): Endpoint where custodian handled verification

**Returns:** `VerificationResult` object

**Raises:**
- `ValidationError`: If input parameters are invalid
- `NetworkError`: If network request fails
- `BlockchainError`: If blockchain transaction fails

##### get_verification_status()

Gets verification status for a user.

```python
def get_verification_status(self, user_id: str) -> Dict[str, Any]
```

**Parameters:**
- `user_id` (str): Unique identifier for the user

**Returns:** Dictionary containing verification status information

##### health_check()

Checks if the HumanID network is healthy and accessible.

```python
def health_check(self) -> Dict[str, Any]
```

**Returns:** Dictionary containing health status information

### VerificationResult Class

Represents the result of a verification request.

**Attributes:**
- `verification_id` (str): Unique identifier for the verification
- `user_id` (str): User identifier
- `status` (VerificationStatus): Current verification status
- `humanity_score` (float, optional): Humanity verification score
- `transaction_hash` (str, optional): Blockchain transaction hash
- `timestamp` (str, optional): Timestamp of the verification
- `error_message` (str, optional): Error message if verification failed

### VerificationStatus Enum

Represents possible verification statuses:
- `PENDING`: Verification is in progress
- `VERIFIED`: Verification completed successfully
- `REJECTED`: Verification was rejected
- `EXPIRED`: Verification has expired

### Exception Classes

- `HumanitySDKError`: Base exception for all SDK errors
- `ValidationError`: Input validation errors
- `NetworkError`: Network-related errors
- `BlockchainError`: Blockchain transaction errors

## Error Handling

The SDK provides comprehensive error handling with specific exception types:

```python
from humanity_sdk import HumanitySDK, ValidationError, NetworkError, BlockchainError

sdk = HumanitySDK()

try:
    result = sdk.first_humanity_verification(
        private_key="invalid_key",
        user_id="user_123",
        custodian="custodian",
        custodian_server_endpoint="https://example.com"
    )
except ValidationError as e:
    print(f"Validation error: {e}")
except NetworkError as e:
    print(f"Network error: {e}")
except BlockchainError as e:
    print(f"Blockchain error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

## Examples

### Complete Verification Flow

```python
from humanity_sdk import HumanitySDK

# Initialize SDK
sdk = HumanitySDK(network_endpoint="https://api.humanid.network")

# Your organization's private key
private_key = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"

# Step 1: Initiate verification
print("Initiating verification...")
verification = sdk.first_humanity_verification(
    private_key=private_key,
    user_id="user_12345",
    custodian="trusted_custodian",
    custodian_server_endpoint="https://custodian.example.com/verify"
)

if verification.status.value == "pending":
    print(f"Verification initiated: {verification.verification_id}")
    print(f"Transaction hash: {verification.transaction_hash}")
    
    # Step 2: Wait for custodian to process (in real scenario)
    # ... custodian processes verification ...
    
    # Step 3: Confirm verification
    print("Confirming verification...")
    confirmation = sdk.humanity_confirmation(
        private_key=private_key,
        user_id="user_12345",
        custodian_server_endpoint="https://custodian.example.com/verify"
    )
    
    if confirmation.status.value == "verified":
        print(f"User verified! Humanity score: {confirmation.humanity_score}")
    else:
        print(f"Verification failed: {confirmation.error_message}")
else:
    print(f"Verification failed: {verification.error_message}")
```

### Health Check

```python
from humanity_sdk import HumanitySDK

sdk = HumanitySDK()

# Check network health
health = sdk.health_check()
print(f"Network status: {health.get('status')}")

if health.get('status') == 'healthy':
    print("Network is operational")
else:
    print(f"Network issue: {health.get('error')}")
```

### Get User Status

```python
from humanity_sdk import HumanitySDK

sdk = HumanitySDK()

# Get verification status for a user
status = sdk.get_verification_status("user_12345")
print(f"User verifications: {status.get('count', 0)}")

for verification in status.get('verifications', []):
    print(f"Verification ID: {verification['verification_id']}")
    print(f"Type: {verification['verification_type']}")
    print(f"Score: {verification.get('humanity_score', 'N/A')}")
    print(f"Timestamp: {verification['timestamp']}")
```

## Security Considerations

1. **Private Key Security**: Never hardcode private keys in your source code. Use environment variables or secure key management systems.

2. **Network Security**: Always use HTTPS endpoints for production environments.

3. **Input Validation**: The SDK validates all inputs, but you should also validate user inputs before passing them to the SDK.

4. **Error Handling**: Implement proper error handling to avoid exposing sensitive information in error messages.

## Environment Variables

You can configure the SDK using environment variables:

```bash
export HUMANID_NETWORK_ENDPOINT="https://api.humanid.network"
export HUMANID_CUSTODIAN_ENDPOINT="https://custodian.example.com"
export HUMANID_TIMEOUT="30"
```

## License

This SDK is part of the HumanID project. Please refer to the main project license for usage terms.

## Support

For support and questions, please contact the HumanID team or refer to the main project documentation.
