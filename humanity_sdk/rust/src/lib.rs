/**
 * Humanity Verification SDK - Rust
 * Allows other companies to request humanity verification using the HumanID network
 */

use chrono::{DateTime, Utc};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::time::Duration;
use thiserror::Error;
use uuid::Uuid;

/// Verification status enumeration
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum VerificationStatus {
    #[serde(rename = "pending")]
    Pending,
    #[serde(rename = "verified")]
    Verified,
    #[serde(rename = "rejected")]
    Rejected,
    #[serde(rename = "expired")]
    Expired,
}

/// Result of a verification request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerificationResult {
    pub verification_id: String,
    pub user_id: String,
    pub status: VerificationStatus,
    pub humanity_score: Option<f64>,
    pub transaction_hash: Option<String>,
    pub timestamp: Option<DateTime<Utc>>,
    pub error_message: Option<String>,
}

/// Configuration options for the SDK
#[derive(Debug, Clone)]
pub struct HumanitySDKConfig {
    pub network_endpoint: String,
    pub custodian_endpoint: Option<String>,
    pub timeout: Duration,
    pub api_key: Option<String>,
}

impl Default for HumanitySDKConfig {
    fn default() -> Self {
        Self {
            network_endpoint: "https://api.humanid.network".to_string(),
            custodian_endpoint: None,
            timeout: Duration::from_secs(30),
            api_key: None,
        }
    }
}

/// Verification request data
#[derive(Debug, Clone)]
pub struct FirstVerificationRequest {
    pub private_key: String,
    pub user_id: String,
    pub custodian: String,
    pub custodian_server_endpoint: String,
}

#[derive(Debug, Clone)]
pub struct ConfirmationRequest {
    pub private_key: String,
    pub user_id: String,
    pub custodian_server_endpoint: String,
}

/// Custom error types
#[derive(Error, Debug)]
pub enum HumanitySDKError {
    #[error("Validation error: {0}")]
    Validation(String),
    
    #[error("Network error: {0}")]
    Network(String),
    
    #[error("Blockchain error: {0}")]
    Blockchain(String),
    
    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),
    
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    
    #[error("Unexpected error: {0}")]
    Unexpected(String),
}

/// Humanity Verification SDK
pub struct HumanitySDK {
    client: Client,
    config: HumanitySDKConfig,
}

impl HumanitySDK {
    /// Create a new SDK instance with default configuration
    pub fn new() -> Self {
        Self::with_config(HumanitySDKConfig::default())
    }

    /// Create a new SDK instance with custom configuration
    pub fn with_config(config: HumanitySDKConfig) -> Self {
        let mut client_builder = Client::builder()
            .timeout(config.timeout)
            .user_agent("HumanitySDK-Rust/1.0.0");

        if let Some(api_key) = &config.api_key {
            client_builder = client_builder.default_headers(
                std::collections::HashMap::from([(
                    "Authorization".to_string(),
                    format!("Bearer {}", api_key),
                )]),
            );
        }

        let client = client_builder.build().expect("Failed to create HTTP client");

        Self { client, config }
    }

    /// Validate private key format
    fn validate_private_key(&self, private_key: &str) -> Result<(), HumanitySDKError> {
        if private_key.is_empty() {
            return Err(HumanitySDKError::Validation(
                "Private key must be a non-empty string".to_string(),
            ));
        }

        if private_key.len() != 64 {
            return Err(HumanitySDKError::Validation(
                "Private key must be 64 characters (32 bytes)".to_string(),
            ));
        }

        if !private_key.chars().all(|c| c.is_ascii_hexdigit()) {
            return Err(HumanitySDKError::Validation(
                "Private key must be a valid hexadecimal string".to_string(),
            ));
        }

        Ok(())
    }

    /// Validate user ID format
    fn validate_user_id(&self, user_id: &str) -> Result<(), HumanitySDKError> {
        if user_id.is_empty() {
            return Err(HumanitySDKError::Validation(
                "User ID must be a non-empty string".to_string(),
            ));
        }

        if user_id.len() < 3 || user_id.len() > 100 {
            return Err(HumanitySDKError::Validation(
                "User ID must be between 3 and 100 characters".to_string(),
            ));
        }

        Ok(())
    }

    /// Validate custodian format
    fn validate_custodian(&self, custodian: &str) -> Result<(), HumanitySDKError> {
        if custodian.is_empty() {
            return Err(HumanitySDKError::Validation(
                "Custodian must be a non-empty string".to_string(),
            ));
        }

        Ok(())
    }

    /// Sign transaction data with private key
    fn sign_transaction(&self, private_key: &str, data: &serde_json::Value) -> String {
        let data_string = serde_json::to_string(data).unwrap_or_default();
        let mut hasher = Sha256::new();
        hasher.update(data_string.as_bytes());
        let data_hash = hex::encode(hasher.finalize());

        // Simulate transaction hash generation
        let transaction_data = format!(
            "{}{}{}",
            &private_key[..8],
            &data_hash[..8],
            Utc::now().timestamp()
        );

        let mut hasher = Sha256::new();
        hasher.update(transaction_data.as_bytes());
        hex::encode(hasher.finalize())
    }

    /// Make HTTP request to the network
    async fn make_request<T>(&self, endpoint: &str, data: &serde_json::Value) -> Result<T, HumanitySDKError>
    where
        T: for<'de> Deserialize<'de>,
    {
        let url = format!("{}/{}", self.config.network_endpoint.trim_end_matches('/'), endpoint.trim_start_matches('/'));
        
        let response = self
            .client
            .post(&url)
            .json(data)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
            return Err(HumanitySDKError::Network(format!(
                "HTTP {}: {}",
                response.status(),
                error_text
            )));
        }

        let result: T = response.json().await?;
        Ok(result)
    }

    /// Initiate first humanity verification for a user
    pub async fn first_humanity_verification(
        &self,
        request: FirstVerificationRequest,
    ) -> Result<VerificationResult, HumanitySDKError> {
        // Validate inputs
        self.validate_private_key(&request.private_key)?;
        self.validate_user_id(&request.user_id)?;
        self.validate_custodian(&request.custodian)?;

        if request.custodian_server_endpoint.is_empty() {
            return Err(HumanitySDKError::Validation(
                "Custodian server endpoint must be a non-empty string".to_string(),
            ));
        }

        // Generate verification ID
        let verification_id = Uuid::new_v4().to_string();
        let timestamp = Utc::now();

        // Prepare verification data
        let verification_data = serde_json::json!({
            "verification_id": verification_id,
            "user_id": request.user_id,
            "custodian": request.custodian,
            "custodian_server_endpoint": request.custodian_server_endpoint,
            "timestamp": timestamp.to_rfc3339(),
            "verification_type": "first_humanity_verification",
            "organization_wallet": format!("{}...{}", &request.private_key[..8], &request.private_key[56..])
        });

        // Sign the transaction
        let transaction_hash = self.sign_transaction(&request.private_key, &verification_data);

        // Add transaction hash to data
        let mut request_data = verification_data;
        request_data["transaction_hash"] = serde_json::Value::String(transaction_hash.clone());

        // Make request to network
        let response: serde_json::Value = self
            .make_request("/api/v1/verification/initiate", &request_data)
            .await?;

        let success = response.get("success").and_then(|v| v.as_bool()).unwrap_or(false);

        if success {
            Ok(VerificationResult {
                verification_id,
                user_id: request.user_id,
                status: VerificationStatus::Pending,
                transaction_hash: Some(transaction_hash),
                timestamp: Some(timestamp),
                humanity_score: None,
                error_message: None,
            })
        } else {
            let error_message = response
                .get("error")
                .and_then(|v| v.as_str())
                .unwrap_or("Unknown error occurred")
                .to_string();

            Ok(VerificationResult {
                verification_id,
                user_id: request.user_id,
                status: VerificationStatus::Rejected,
                transaction_hash: Some(transaction_hash),
                timestamp: Some(timestamp),
                humanity_score: None,
                error_message: Some(error_message),
            })
        }
    }

    /// Confirm humanity verification for a user
    pub async fn humanity_confirmation(
        &self,
        request: ConfirmationRequest,
    ) -> Result<VerificationResult, HumanitySDKError> {
        // Validate inputs
        self.validate_private_key(&request.private_key)?;
        self.validate_user_id(&request.user_id)?;

        if request.custodian_server_endpoint.is_empty() {
            return Err(HumanitySDKError::Validation(
                "Custodian server endpoint must be a non-empty string".to_string(),
            ));
        }

        // Generate confirmation ID
        let confirmation_id = Uuid::new_v4().to_string();
        let timestamp = Utc::now();

        // Prepare confirmation data
        let confirmation_data = serde_json::json!({
            "confirmation_id": confirmation_id,
            "user_id": request.user_id,
            "custodian_server_endpoint": request.custodian_server_endpoint,
            "timestamp": timestamp.to_rfc3339(),
            "confirmation_type": "humanity_confirmation",
            "organization_wallet": format!("{}...{}", &request.private_key[..8], &request.private_key[56..])
        });

        // Sign the transaction
        let transaction_hash = self.sign_transaction(&request.private_key, &confirmation_data);

        // Add transaction hash to data
        let mut request_data = confirmation_data;
        request_data["transaction_hash"] = serde_json::Value::String(transaction_hash.clone());

        // Make request to network
        let response: serde_json::Value = self
            .make_request("/api/v1/verification/confirm", &request_data)
            .await?;

        let success = response.get("success").and_then(|v| v.as_bool()).unwrap_or(false);

        if success {
            let humanity_score = response
                .get("humanity_score")
                .and_then(|v| v.as_f64());

            Ok(VerificationResult {
                verification_id: confirmation_id,
                user_id: request.user_id,
                status: VerificationStatus::Verified,
                transaction_hash: Some(transaction_hash),
                timestamp: Some(timestamp),
                humanity_score,
                error_message: None,
            })
        } else {
            let error_message = response
                .get("error")
                .and_then(|v| v.as_str())
                .unwrap_or("Unknown error occurred")
                .to_string();

            Ok(VerificationResult {
                verification_id: confirmation_id,
                user_id: request.user_id,
                status: VerificationStatus::Rejected,
                transaction_hash: Some(transaction_hash),
                timestamp: Some(timestamp),
                humanity_score: None,
                error_message: Some(error_message),
            })
        }
    }

    /// Get verification status for a user
    pub async fn get_verification_status(
        &self,
        user_id: &str,
    ) -> Result<serde_json::Value, HumanitySDKError> {
        self.validate_user_id(user_id)?;

        let response: serde_json::Value = self
            .make_request(&format!("/api/v1/verification/status/{}", user_id), &serde_json::Value::Null)
            .await?;

        Ok(response)
    }

    /// Check if the HumanID network is healthy and accessible
    pub async fn health_check(&self) -> Result<serde_json::Value, HumanitySDKError> {
        match self.make_request::<serde_json::Value>("/health", &serde_json::Value::Null).await {
            Ok(response) => Ok(response),
            Err(error) => {
                // Return unhealthy status on error
                Ok(serde_json::json!({
                    "status": "unhealthy",
                    "error": error.to_string(),
                    "timestamp": Utc::now().to_rfc3339()
                }))
            }
        }
    }
}

impl Default for HumanitySDK {
    fn default() -> Self {
        Self::new()
    }
}

/// Convenience functions for direct usage
pub async fn first_humanity_verification(
    request: FirstVerificationRequest,
    config: Option<HumanitySDKConfig>,
) -> Result<VerificationResult, HumanitySDKError> {
    let sdk = match config {
        Some(cfg) => HumanitySDK::with_config(cfg),
        None => HumanitySDK::new(),
    };
    sdk.first_humanity_verification(request).await
}

pub async fn humanity_confirmation(
    request: ConfirmationRequest,
    config: Option<HumanitySDKConfig>,
) -> Result<VerificationResult, HumanitySDKError> {
    let sdk = match config {
        Some(cfg) => HumanitySDK::with_config(cfg),
        None => HumanitySDK::new(),
    };
    sdk.humanity_confirmation(request).await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_private_key() {
        let sdk = HumanitySDK::new();
        
        // Valid private key
        assert!(sdk.validate_private_key("a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456").is_ok());
        
        // Invalid private key - too short
        assert!(sdk.validate_private_key("short").is_err());
        
        // Invalid private key - not hex
        assert!(sdk.validate_private_key("g1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456").is_err());
    }

    #[test]
    fn test_validate_user_id() {
        let sdk = HumanitySDK::new();
        
        // Valid user ID
        assert!(sdk.validate_user_id("user123").is_ok());
        
        // Invalid user ID - too short
        assert!(sdk.validate_user_id("ab").is_err());
        
        // Invalid user ID - too long
        assert!(sdk.validate_user_id(&"a".repeat(101)).is_err());
    }
}
