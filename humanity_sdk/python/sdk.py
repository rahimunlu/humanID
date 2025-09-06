#!/usr/bin/env python3
"""
Humanity Verification SDK
Allows other companies to request humanity verification using the HumanID network
"""

import os
import json
import uuid
import hashlib
import requests
from datetime import datetime
from typing import Dict, Any, Optional, Union
from dataclasses import dataclass
from enum import Enum


class VerificationStatus(Enum):
    """Verification status enumeration"""
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    EXPIRED = "expired"


class HumanitySDKError(Exception):
    """Base exception for Humanity SDK errors"""
    pass


class NetworkError(HumanitySDKError):
    """Network-related errors"""
    pass


class ValidationError(HumanitySDKError):
    """Input validation errors"""
    pass


class BlockchainError(HumanitySDKError):
    """Blockchain transaction errors"""
    pass


@dataclass
class VerificationResult:
    """Result of a verification request"""
    verification_id: str
    user_id: str
    status: VerificationStatus
    humanity_score: Optional[float] = None
    transaction_hash: Optional[str] = None
    timestamp: Optional[str] = None
    error_message: Optional[str] = None


class HumanitySDK:
    """
    Humanity Verification SDK
    
    This SDK allows other companies to integrate with the HumanID network
    for decentralized human verification services.
    """
    
    def __init__(self, 
                 network_endpoint: str = "https://api.humanid.network",
                 custodian_endpoint: Optional[str] = None,
                 timeout: int = 30):
        """
        Initialize the Humanity SDK
        
        Args:
            network_endpoint: Base URL for the HumanID network API
            custodian_endpoint: Optional custodian server endpoint
            timeout: Request timeout in seconds
        """
        self.network_endpoint = network_endpoint.rstrip('/')
        self.custodian_endpoint = custodian_endpoint
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'HumanitySDK/1.0.0'
        })
    
    def _validate_private_key(self, private_key: str) -> None:
        """Validate private key format"""
        if not private_key or not isinstance(private_key, str):
            raise ValidationError("Private key must be a non-empty string")
        
        # Basic validation - should be hex string of appropriate length
        try:
            if len(private_key) != 64:  # 32 bytes = 64 hex chars
                raise ValidationError("Private key must be 64 characters (32 bytes)")
            int(private_key, 16)  # Validate hex format
        except ValueError:
            raise ValidationError("Private key must be a valid hexadecimal string")
    
    def _validate_user_id(self, user_id: str) -> None:
        """Validate user ID format"""
        if not user_id or not isinstance(user_id, str):
            raise ValidationError("User ID must be a non-empty string")
        
        if len(user_id) < 3 or len(user_id) > 100:
            raise ValidationError("User ID must be between 3 and 100 characters")
    
    def _validate_custodian(self, custodian: str) -> None:
        """Validate custodian format"""
        if not custodian or not isinstance(custodian, str):
            raise ValidationError("Custodian must be a non-empty string")
    
    def _make_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make HTTP request to the network"""
        try:
            url = f"{self.network_endpoint}/{endpoint.lstrip('/')}"
            response = self.session.post(url, json=data, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.Timeout:
            raise NetworkError(f"Request timed out after {self.timeout} seconds")
        except requests.exceptions.ConnectionError:
            raise NetworkError("Failed to connect to the network")
        except requests.exceptions.HTTPError as e:
            try:
                error_data = e.response.json()
                error_msg = error_data.get('error', str(e))
            except:
                error_msg = str(e)
            raise NetworkError(f"HTTP error: {error_msg}")
        except requests.exceptions.RequestException as e:
            raise NetworkError(f"Request failed: {str(e)}")
    
    def _sign_transaction(self, private_key: str, data: Dict[str, Any]) -> str:
        """
        Sign transaction data with private key
        In a real implementation, this would use proper cryptographic signing
        """
        # This is a placeholder implementation
        # In production, you would use proper ECDSA signing with the private key
        data_string = json.dumps(data, sort_keys=True)
        data_hash = hashlib.sha256(data_string.encode()).hexdigest()
        
        # Simulate transaction hash generation
        # In reality, this would be the actual blockchain transaction hash
        transaction_data = f"{private_key[:8]}{data_hash[:8]}{int(datetime.utcnow().timestamp())}"
        return hashlib.sha256(transaction_data.encode()).hexdigest()
    
    def first_humanity_verification(self, 
                                  private_key: str, 
                                  user_id: str, 
                                  custodian: str, 
                                  custodian_server_endpoint: str) -> VerificationResult:
        """
        Initiate first humanity verification for a user
        
        This function starts the verification process by submitting a request
        to the HumanID network with the organization's wallet covering transaction fees.
        
        Args:
            private_key: Organization wallet private key (covers transaction fees)
            user_id: Unique identifier for the user being verified
            custodian: Custodian identifier for the verification
            custodian_server_endpoint: Endpoint where custodian will handle verification
            
        Returns:
            VerificationResult: Result of the verification request
            
        Raises:
            ValidationError: If input parameters are invalid
            NetworkError: If network request fails
            BlockchainError: If blockchain transaction fails
        """
        try:
            # Validate inputs
            self._validate_private_key(private_key)
            self._validate_user_id(user_id)
            self._validate_custodian(custodian)
            
            if not custodian_server_endpoint or not isinstance(custodian_server_endpoint, str):
                raise ValidationError("Custodian server endpoint must be a non-empty string")
            
            # Generate verification ID
            verification_id = str(uuid.uuid4())
            timestamp = datetime.utcnow().isoformat()
            
            # Prepare verification data
            verification_data = {
                "verification_id": verification_id,
                "user_id": user_id,
                "custodian": custodian,
                "custodian_server_endpoint": custodian_server_endpoint,
                "timestamp": timestamp,
                "verification_type": "first_humanity_verification",
                "organization_wallet": private_key[:8] + "..." + private_key[-8:]  # Masked for security
            }
            
            # Sign the transaction
            transaction_hash = self._sign_transaction(private_key, verification_data)
            
            # Add transaction hash to data
            verification_data["transaction_hash"] = transaction_hash
            
            # Make request to network
            response = self._make_request("/api/v1/verification/initiate", verification_data)
            
            # Parse response
            if response.get("success"):
                return VerificationResult(
                    verification_id=verification_id,
                    user_id=user_id,
                    status=VerificationStatus.PENDING,
                    transaction_hash=transaction_hash,
                    timestamp=timestamp
                )
            else:
                error_msg = response.get("error", "Unknown error occurred")
                return VerificationResult(
                    verification_id=verification_id,
                    user_id=user_id,
                    status=VerificationStatus.REJECTED,
                    error_message=error_msg,
                    timestamp=timestamp
                )
                
        except ValidationError:
            raise
        except NetworkError:
            raise
        except Exception as e:
            raise HumanitySDKError(f"Unexpected error during verification: {str(e)}")
    
    def humanity_confirmation(self, 
                            private_key: str, 
                            user_id: str, 
                            custodian_server_endpoint: str) -> VerificationResult:
        """
        Confirm humanity verification for a user
        
        This function confirms that a user has been successfully verified
        through the HumanID network verification process.
        
        Args:
            private_key: Organization wallet private key (covers transaction fees)
            user_id: Unique identifier for the user being confirmed
            custodian_server_endpoint: Endpoint where custodian handled verification
            
        Returns:
            VerificationResult: Result of the confirmation request
            
        Raises:
            ValidationError: If input parameters are invalid
            NetworkError: If network request fails
            BlockchainError: If blockchain transaction fails
        """
        try:
            # Validate inputs
            self._validate_private_key(private_key)
            self._validate_user_id(user_id)
            
            if not custodian_server_endpoint or not isinstance(custodian_server_endpoint, str):
                raise ValidationError("Custodian server endpoint must be a non-empty string")
            
            # Generate confirmation ID
            confirmation_id = str(uuid.uuid4())
            timestamp = datetime.utcnow().isoformat()
            
            # Prepare confirmation data
            confirmation_data = {
                "confirmation_id": confirmation_id,
                "user_id": user_id,
                "custodian_server_endpoint": custodian_server_endpoint,
                "timestamp": timestamp,
                "confirmation_type": "humanity_confirmation",
                "organization_wallet": private_key[:8] + "..." + private_key[-8:]  # Masked for security
            }
            
            # Sign the transaction
            transaction_hash = self._sign_transaction(private_key, confirmation_data)
            
            # Add transaction hash to data
            confirmation_data["transaction_hash"] = transaction_hash
            
            # Make request to network
            response = self._make_request("/api/v1/verification/confirm", confirmation_data)
            
            # Parse response
            if response.get("success"):
                humanity_score = response.get("humanity_score")
                return VerificationResult(
                    verification_id=confirmation_id,
                    user_id=user_id,
                    status=VerificationStatus.VERIFIED,
                    humanity_score=humanity_score,
                    transaction_hash=transaction_hash,
                    timestamp=timestamp
                )
            else:
                error_msg = response.get("error", "Unknown error occurred")
                return VerificationResult(
                    verification_id=confirmation_id,
                    user_id=user_id,
                    status=VerificationStatus.REJECTED,
                    error_message=error_msg,
                    timestamp=timestamp
                )
                
        except ValidationError:
            raise
        except NetworkError:
            raise
        except Exception as e:
            raise HumanitySDKError(f"Unexpected error during confirmation: {str(e)}")
    
    def get_verification_status(self, user_id: str) -> Dict[str, Any]:
        """
        Get verification status for a user
        
        Args:
            user_id: Unique identifier for the user
            
        Returns:
            Dict containing verification status information
            
        Raises:
            ValidationError: If user_id is invalid
            NetworkError: If network request fails
        """
        try:
            self._validate_user_id(user_id)
            
            response = self._make_request(f"/api/v1/verification/status/{user_id}", {})
            return response
            
        except ValidationError:
            raise
        except NetworkError:
            raise
        except Exception as e:
            raise HumanitySDKError(f"Unexpected error getting status: {str(e)}")
    
    def health_check(self) -> Dict[str, Any]:
        """
        Check if the HumanID network is healthy and accessible
        
        Returns:
            Dict containing health status information
        """
        try:
            response = self._make_request("/health", {})
            return response
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }


# Convenience functions for direct usage
def create_sdk(network_endpoint: str = "https://api.humanid.network", 
               custodian_endpoint: Optional[str] = None) -> HumanitySDK:
    """
    Create a new HumanitySDK instance
    
    Args:
        network_endpoint: Base URL for the HumanID network API
        custodian_endpoint: Optional custodian server endpoint
        
    Returns:
        HumanitySDK instance
    """
    return HumanitySDK(network_endpoint, custodian_endpoint)


def first_humanity_verification(private_key: str, 
                               user_id: str, 
                               custodian: str, 
                               custodian_server_endpoint: str,
                               network_endpoint: str = "https://api.humanid.network") -> VerificationResult:
    """
    Convenience function for first humanity verification
    
    Args:
        private_key: Organization wallet private key
        user_id: Unique identifier for the user
        custodian: Custodian identifier
        custodian_server_endpoint: Custodian server endpoint
        network_endpoint: HumanID network endpoint
        
    Returns:
        VerificationResult
    """
    sdk = HumanitySDK(network_endpoint)
    return sdk.first_humanity_verification(private_key, user_id, custodian, custodian_server_endpoint)


def humanity_confirmation(private_key: str, 
                         user_id: str, 
                         custodian_server_endpoint: str,
                         network_endpoint: str = "https://api.humanid.network") -> VerificationResult:
    """
    Convenience function for humanity confirmation
    
    Args:
        private_key: Organization wallet private key
        user_id: Unique identifier for the user
        custodian_server_endpoint: Custodian server endpoint
        network_endpoint: HumanID network endpoint
        
    Returns:
        VerificationResult
    """
    sdk = HumanitySDK(network_endpoint)
    return sdk.humanity_confirmation(private_key, user_id, custodian_server_endpoint)
