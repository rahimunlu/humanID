"""
Humanity Verification SDK

A Python SDK for integrating with the HumanID network for decentralized human verification.
"""

from .sdk import (
    HumanitySDK,
    VerificationResult,
    VerificationStatus,
    HumanitySDKError,
    ValidationError,
    NetworkError,
    BlockchainError,
    first_humanity_verification,
    humanity_confirmation,
    create_sdk
)

__version__ = "1.0.0"
__author__ = "HumanID Team"
__email__ = "team@humanid.network"

__all__ = [
    "HumanitySDK",
    "VerificationResult", 
    "VerificationStatus",
    "HumanitySDKError",
    "ValidationError",
    "NetworkError", 
    "BlockchainError",
    "first_humanity_verification",
    "humanity_confirmation",
    "create_sdk"
]
