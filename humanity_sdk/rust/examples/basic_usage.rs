/**
 * Example usage of the Humanity Verification SDK - Rust
 */

use humanity_sdk::{
    HumanitySDK, HumanitySDKConfig, VerificationStatus, 
    first_humanity_verification, humanity_confirmation,
    FirstVerificationRequest, ConfirmationRequest
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Example private key (in production, use environment variables)
    let private_key = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456";
    
    // Example user data
    let user_id = "user_12345";
    let custodian = "trusted_custodian";
    let custodian_endpoint = "https://custodian.example.com/verify";
    
    println!("=== Humanity Verification SDK Example (Rust) ===\n");
    
    // Method 1: Using SDK struct
    println!("1. Using HumanitySDK struct:");
    let config = HumanitySDKConfig {
        network_endpoint: "https://api.humanid.network".to_string(),
        custodian_endpoint: None,
        timeout: std::time::Duration::from_secs(30),
        api_key: None,
    };
    
    let sdk = HumanitySDK::with_config(config);
    
    // Health check
    match sdk.health_check().await {
        Ok(health) => {
            println!("   Network health: {}", health.get("status").unwrap_or(&serde_json::Value::String("unknown".to_string())));
        }
        Err(e) => {
            println!("   Health check failed: {}", e);
        }
    }
    
    // First verification
    println!("   Initiating first verification...");
    let verification_request = FirstVerificationRequest {
        private_key: private_key.to_string(),
        user_id: user_id.to_string(),
        custodian: custodian.to_string(),
        custodian_server_endpoint: custodian_endpoint.to_string(),
    };
    
    match sdk.first_humanity_verification(verification_request).await {
        Ok(verification) => {
            println!("   Verification ID: {}", verification.verification_id);
            println!("   Status: {:?}", verification.status);
            println!("   Transaction Hash: {:?}", verification.transaction_hash);
            
            if verification.status == VerificationStatus::Pending {
                // Humanity confirmation
                println!("   Confirming verification...");
                let confirmation_request = ConfirmationRequest {
                    private_key: private_key.to_string(),
                    user_id: user_id.to_string(),
                    custodian_server_endpoint: custodian_endpoint.to_string(),
                };
                
                match sdk.humanity_confirmation(confirmation_request).await {
                    Ok(confirmation) => {
                        println!("   Confirmation ID: {}", confirmation.verification_id);
                        println!("   Status: {:?}", confirmation.status);
                        println!("   Humanity Score: {:?}", confirmation.humanity_score);
                    }
                    Err(e) => {
                        println!("   Confirmation error: {}", e);
                    }
                }
            }
        }
        Err(e) => {
            println!("   Verification error: {}", e);
        }
    }
    
    // Get verification status
    println!("   Getting verification status...");
    match sdk.get_verification_status(user_id).await {
        Ok(status) => {
            if let Some(count) = status.get("count").and_then(|v| v.as_u64()) {
                println!("   User has {} verifications", count);
            }
        }
        Err(e) => {
            println!("   Status check error: {}", e);
        }
    }
    
    println!("\n{}", "=".repeat(50));
    println!();
    
    // Method 2: Using convenience functions
    println!("2. Using convenience functions:");
    
    let verification_request = FirstVerificationRequest {
        private_key: private_key.to_string(),
        user_id: "user_67890".to_string(),
        custodian: custodian.to_string(),
        custodian_server_endpoint: custodian_endpoint.to_string(),
    };
    
    match first_humanity_verification(verification_request, None).await {
        Ok(verification) => {
            println!("   Verification ID: {}", verification.verification_id);
            println!("   Status: {:?}", verification.status);
        }
        Err(e) => {
            println!("   Verification error: {}", e);
        }
    }
    
    let confirmation_request = ConfirmationRequest {
        private_key: private_key.to_string(),
        user_id: "user_67890".to_string(),
        custodian_server_endpoint: custodian_endpoint.to_string(),
    };
    
    match humanity_confirmation(confirmation_request, None).await {
        Ok(confirmation) => {
            println!("   Confirmation ID: {}", confirmation.verification_id);
            println!("   Status: {:?}", confirmation.status);
            println!("   Humanity Score: {:?}", confirmation.humanity_score);
        }
        Err(e) => {
            println!("   Confirmation error: {}", e);
        }
    }
    
    println!("\n=== Example completed ===");
    
    Ok(())
}
