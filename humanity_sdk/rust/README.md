# Humanity Verification SDK - Rust

A Rust SDK that allows other companies to integrate with the HumanID network for decentralized human verification services.

## Features

- **First Humanity Verification**: Initiate verification process for new users
- **Humanity Confirmation**: Confirm successful verification of users
- **Blockchain Integration**: Automatic transaction fee handling using organization wallet
- **Comprehensive Error Handling**: Detailed error messages and validation using Result types
- **Network Health Monitoring**: Check network status and connectivity
- **Async/Await Support**: Built on tokio for high-performance async operations
- **Type Safety**: Full compile-time type checking and safety

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
humanity-sdk = "1.0.0"
tokio = { version = "1.0", features = ["full"] }
```

## Quick Start

### Basic Usage

```rust
use humanity_sdk::{HumanitySDK, VerificationStatus, FirstVerificationRequest, ConfirmationRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize SDK
    let sdk = HumanitySDK::new();

    // Your organization's private key (covers transaction fees)
    let private_key = "your_64_character_hex_private_key";

    // First verification
    let verification_request = FirstVerificationRequest {
        private_key: private_key.to_string(),
        user_id: "user_12345".to_string(),
        custodian: "custodian_org".to_string(),
        custodian_server_endpoint: "https://custodian.example.com/verify".to_string(),
    };

    let result = sdk.first_humanity_verification(verification_request).await?;

    println!("Verification ID: {}", result.verification_id);
    println!("Status: {:?}", result.status);
    println!("Transaction Hash: {:?}", result.transaction_hash);

    // Confirm verification
    let confirmation_request = ConfirmationRequest {
        private_key: private_key.to_string(),
        user_id: "user_12345".to_string(),
        custodian_server_endpoint: "https://custodian.example.com/verify".to_string(),
    };

    let confirmation = sdk.humanity_confirmation(confirmation_request).await?;

    println!("Humanity Score: {:?}", confirmation.humanity_score);
    println!("Status: {:?}", confirmation.status);

    Ok(())
}
```

### Using Convenience Functions

```rust
use humanity_sdk::{first_humanity_verification, humanity_confirmation, FirstVerificationRequest, ConfirmationRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Direct function calls
    let verification_request = FirstVerificationRequest {
        private_key: "your_private_key".to_string(),
        user_id: "user_12345".to_string(),
        custodian: "custodian_org".to_string(),
        custodian_server_endpoint: "https://custodian.example.com/verify".to_string(),
    };

    let result = first_humanity_verification(verification_request, None).await?;

    let confirmation_request = ConfirmationRequest {
        private_key: "your_private_key".to_string(),
        user_id: "user_12345".to_string(),
        custodian_server_endpoint: "https://custodian.example.com/verify".to_string(),
    };

    let confirmation = humanity_confirmation(confirmation_request, None).await?;

    Ok(())
}
```

## API Reference

### HumanitySDK

#### Constructor

```rust
// Create with default configuration
let sdk = HumanitySDK::new();

// Create with custom configuration
let config = HumanitySDKConfig {
    network_endpoint: "https://api.humanid.network".to_string(),
    custodian_endpoint: None,
    timeout: Duration::from_secs(30),
    api_key: Some("your_api_key".to_string()),
};
let sdk = HumanitySDK::with_config(config);
```

#### Methods

##### first_humanity_verification()

Initiates the first humanity verification for a user.

```rust
async fn first_humanity_verification(
    &self,
    request: FirstVerificationRequest,
) -> Result<VerificationResult, HumanitySDKError>
```

**Parameters:**
- `request.private_key` (String): Organization wallet private key (64-character hex string)
- `request.user_id` (String): Unique identifier for the user (3-100 characters)
- `request.custodian` (String): Custodian identifier for the verification
- `request.custodian_server_endpoint` (String): Endpoint where custodian will handle verification

**Returns:** `Result<VerificationResult, HumanitySDKError>`

##### humanity_confirmation()

Confirms humanity verification for a user.

```rust
async fn humanity_confirmation(
    &self,
    request: ConfirmationRequest,
) -> Result<VerificationResult, HumanitySDKError>
```

**Parameters:**
- `request.private_key` (String): Organization wallet private key (64-character hex string)
- `request.user_id` (String): Unique identifier for the user (3-100 characters)
- `request.custodian_server_endpoint` (String): Endpoint where custodian handled verification

**Returns:** `Result<VerificationResult, HumanitySDKError>`

##### get_verification_status()

Gets verification status for a user.

```rust
async fn get_verification_status(
    &self,
    user_id: &str,
) -> Result<serde_json::Value, HumanitySDKError>
```

##### health_check()

Checks if the HumanID network is healthy and accessible.

```rust
async fn health_check(&self) -> Result<serde_json::Value, HumanitySDKError>
```

### Types

#### VerificationResult

Represents the result of a verification request.

```rust
pub struct VerificationResult {
    pub verification_id: String,
    pub user_id: String,
    pub status: VerificationStatus,
    pub humanity_score: Option<f64>,
    pub transaction_hash: Option<String>,
    pub timestamp: Option<DateTime<Utc>>,
    pub error_message: Option<String>,
}
```

#### VerificationStatus

Represents possible verification statuses:

```rust
pub enum VerificationStatus {
    Pending,
    Verified,
    Rejected,
    Expired,
}
```

#### Error Types

- `HumanitySDKError::Validation`: Input validation errors
- `HumanitySDKError::Network`: Network-related errors
- `HumanitySDKError::Blockchain`: Blockchain transaction errors
- `HumanitySDKError::Http`: HTTP request errors
- `HumanitySDKError::Json`: JSON parsing errors
- `HumanitySDKError::Unexpected`: Unexpected errors

## Error Handling

The SDK uses Rust's `Result` type for comprehensive error handling:

```rust
use humanity_sdk::{HumanitySDK, HumanitySDKError, FirstVerificationRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let sdk = HumanitySDK::new();
    
    let request = FirstVerificationRequest {
        private_key: "invalid_key".to_string(),
        user_id: "user_123".to_string(),
        custodian: "custodian".to_string(),
        custodian_server_endpoint: "https://example.com".to_string(),
    };

    match sdk.first_humanity_verification(request).await {
        Ok(result) => {
            println!("Verification successful: {:?}", result);
        }
        Err(HumanitySDKError::Validation(msg)) => {
            println!("Validation error: {}", msg);
        }
        Err(HumanitySDKError::Network(msg)) => {
            println!("Network error: {}", msg);
        }
        Err(HumanitySDKError::Blockchain(msg)) => {
            println!("Blockchain error: {}", msg);
        }
        Err(e) => {
            println!("Other error: {}", e);
        }
    }

    Ok(())
}
```

## Examples

### Complete Verification Flow

```rust
use humanity_sdk::{HumanitySDK, VerificationStatus, FirstVerificationRequest, ConfirmationRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize SDK
    let sdk = HumanitySDK::new();

    // Your organization's private key
    let private_key = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";

    // Step 1: Initiate verification
    println!("Initiating verification...");
    let verification_request = FirstVerificationRequest {
        private_key: private_key.to_string(),
        user_id: "user_12345".to_string(),
        custodian: "trusted_custodian".to_string(),
        custodian_server_endpoint: "https://custodian.example.com/verify".to_string(),
    };

    let verification = sdk.first_humanity_verification(verification_request).await?;

    if verification.status == VerificationStatus::Pending {
        println!("Verification initiated: {}", verification.verification_id);
        println!("Transaction hash: {:?}", verification.transaction_hash);
        
        // Step 2: Wait for custodian to process (in real scenario)
        // ... custodian processes verification ...
        
        // Step 3: Confirm verification
        println!("Confirming verification...");
        let confirmation_request = ConfirmationRequest {
            private_key: private_key.to_string(),
            user_id: "user_12345".to_string(),
            custodian_server_endpoint: "https://custodian.example.com/verify".to_string(),
        };
        
        let confirmation = sdk.humanity_confirmation(confirmation_request).await?;
        
        if confirmation.status == VerificationStatus::Verified {
            println!("User verified! Humanity score: {:?}", confirmation.humanity_score);
        } else {
            println!("Verification failed: {:?}", confirmation.error_message);
        }
    } else {
        println!("Verification failed: {:?}", verification.error_message);
    }

    Ok(())
}
```

### Health Check

```rust
use humanity_sdk::HumanitySDK;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let sdk = HumanitySDK::new();

    // Check network health
    let health = sdk.health_check().await?;
    println!("Network status: {}", health.get("status").unwrap_or(&serde_json::Value::String("unknown".to_string())));

    if health.get("status").and_then(|v| v.as_str()) == Some("healthy") {
        println!("Network is operational");
    } else {
        println!("Network issue: {:?}", health.get("error"));
    }

    Ok(())
}
```

### Get User Status

```rust
use humanity_sdk::HumanitySDK;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let sdk = HumanitySDK::new();

    // Get verification status for a user
    let status = sdk.get_verification_status("user_12345").await?;
    
    if let Some(count) = status.get("count").and_then(|v| v.as_u64()) {
        println!("User has {} verifications", count);
    }

    if let Some(verifications) = status.get("verifications").and_then(|v| v.as_array()) {
        for verification in verifications {
            println!("Verification ID: {}", verification.get("verification_id").unwrap_or(&serde_json::Value::String("N/A".to_string())));
            println!("Type: {}", verification.get("verification_type").unwrap_or(&serde_json::Value::String("N/A".to_string())));
            println!("Score: {:?}", verification.get("humanity_score"));
            println!("Timestamp: {}", verification.get("timestamp").unwrap_or(&serde_json::Value::String("N/A".to_string())));
        }
    }

    Ok(())
}
```

## Running Examples

```bash
# Run the basic usage example
cargo run --example basic_usage

# Run tests
cargo test

# Build the library
cargo build

# Build with release optimizations
cargo build --release
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
export HUMANID_API_KEY="your_api_key"
```

## License

This SDK is part of the HumanID project. Please refer to the main project license for usage terms.

## Support

For support and questions, please contact the HumanID team or refer to the main project documentation.
