#!/usr/bin/env python3
"""
Example usage of the Humanity Verification SDK
"""

from sdk import HumanitySDK, first_humanity_verification, humanity_confirmation
import os


def main():
    """Example usage of the Humanity SDK"""
    
    # Example private key (in production, use environment variables)
    private_key = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456"
    
    # Example user data
    user_id = "user_12345"
    custodian = "trusted_custodian"
    custodian_endpoint = "https://custodian.example.com/verify"
    
    print("=== Humanity Verification SDK Example ===\n")
    
    # Method 1: Using SDK class
    print("1. Using HumanitySDK class:")
    sdk = HumanitySDK(network_endpoint="https://api.humanid.network")
    
    try:
        # Health check
        health = sdk.health_check()
        print(f"   Network health: {health.get('status', 'unknown')}")
        
        # First verification
        print("   Initiating first verification...")
        verification = sdk.first_humanity_verification(
            private_key=private_key,
            user_id=user_id,
            custodian=custodian,
            custodian_server_endpoint=custodian_endpoint
        )
        
        print(f"   Verification ID: {verification.verification_id}")
        print(f"   Status: {verification.status.value}")
        print(f"   Transaction Hash: {verification.transaction_hash}")
        
        if verification.status.value == "pending":
            # Humanity confirmation
            print("   Confirming verification...")
            confirmation = sdk.humanity_confirmation(
                private_key=private_key,
                user_id=user_id,
                custodian_server_endpoint=custodian_endpoint
            )
            
            print(f"   Confirmation ID: {confirmation.verification_id}")
            print(f"   Status: {confirmation.status.value}")
            print(f"   Humanity Score: {confirmation.humanity_score}")
            
        # Get verification status
        print("   Getting verification status...")
        status = sdk.get_verification_status(user_id)
        print(f"   User has {status.get('count', 0)} verifications")
        
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Method 2: Using convenience functions
    print("2. Using convenience functions:")
    
    try:
        # Direct function calls
        verification = first_humanity_verification(
            private_key=private_key,
            user_id="user_67890",
            custodian=custodian,
            custodian_server_endpoint=custodian_endpoint
        )
        
        print(f"   Verification ID: {verification.verification_id}")
        print(f"   Status: {verification.status.value}")
        
        confirmation = humanity_confirmation(
            private_key=private_key,
            user_id="user_67890",
            custodian_server_endpoint=custodian_endpoint
        )
        
        print(f"   Confirmation ID: {confirmation.verification_id}")
        print(f"   Status: {confirmation.status.value}")
        print(f"   Humanity Score: {confirmation.humanity_score}")
        
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n=== Example completed ===")


if __name__ == "__main__":
    main()
