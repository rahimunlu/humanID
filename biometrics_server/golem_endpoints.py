#!/usr/bin/env python3
"""
Golem DB Integration for HumanID Biometrics Server
Handles writing verification data to Golem DB using the established pattern
"""

import os
import json
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv

from golem_base_sdk import GolemBaseClient, Annotation, GenericBytes
from golem_base_sdk.types import GolemBaseCreate

# Load .env
load_dotenv()

# ========= ENV & GLOBALS =========
APP_TAG = os.getenv("GOLEM_APP_TAG", "HumanID-Biometrics")
GOLEM_DB_RPC = os.getenv("GOLEM_DB_RPC", "https://ethwarsaw.holesky.golemdb.io/rpc")
GOLEM_DB_WSS = os.getenv("GOLEM_DB_WSS", "wss://ethwarsaw.holesky.golemdb.io/rpc/ws")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

# PRIVATE_KEY will be checked when actually needed

# ========= GOLEM CLIENT (lazy, long-lived) =========
golem_client: Optional[GolemBaseClient] = None

async def get_golem_client() -> GolemBaseClient:
    """Get or create Golem DB client"""
    global golem_client
    if golem_client is None:
        if not PRIVATE_KEY:
            raise ValueError("PRIVATE_KEY environment variable is required")
        
        golem_client = await GolemBaseClient.create_rw_client(
            GOLEM_DB_RPC,
            GOLEM_DB_WSS,
            PRIVATE_KEY
        )
    return golem_client

# ========= STORAGE HELPERS =========
async def store_humanity_verification(verification_data: Dict[str, Any]) -> str:
    """Store humanity verification data in Golem DB"""
    client = await get_golem_client()
    
    entity_data = {
        "schema": "humanity_verification_v1",
        "verification_id": verification_data.get("verification_id"),
        "user_id": verification_data.get("user_id"),
        "external_kyc_document_id": verification_data.get("external_kyc_document_id"),
        "humanity_score": float(verification_data.get("humanity_score", 0.0)),
        "file_hash": verification_data.get("file_hash"),
        "timestamp": verification_data.get("timestamp"),
        "verification_type": "first_humanity_verification",
        "written_by": client.get_account_address(),
        "app": APP_TAG,
        "record_type": "humanity_verification",
    }
    
    annotations = [
        Annotation(key="app", value=APP_TAG),
        Annotation(key="recordType", value="humanity_verification"),
        Annotation(key="schema", value="humanity_verification_v1"),
        Annotation(key="user_id", value=verification_data.get("user_id", "")),
        Annotation(key="verification_id", value=verification_data.get("verification_id", "")),
        Annotation(key="external_kyc_document_id", value=verification_data.get("external_kyc_document_id", "")),
        Annotation(key="verification_type", value="first_humanity_verification"),
        Annotation(key="timestamp", value=verification_data.get("timestamp", "")),
        Annotation(key="humanity_score", value=str(verification_data.get("humanity_score", 0.0))),
        Annotation(key="file_hash", value=verification_data.get("file_hash", "")),
    ]
    
    entity_bytes = json.dumps(entity_data).encode("utf-8")
    
    create_operation = GolemBaseCreate(
        data=entity_bytes,
        btl=1_000_000,
        string_annotations=annotations,
        numeric_annotations=[],
    )
    
    result = await client.create_entities([create_operation])
    if not result or not result[0].entity_key:
        raise RuntimeError("Failed to create humanity verification entity in Golem DB")
    
    return result[0].entity_key.as_hex_string()

async def store_similarity_check(check_data: Dict[str, Any]) -> str:
    """Store similarity check data in Golem DB"""
    client = await get_golem_client()
    
    entity_data = {
        "schema": "similarity_check_v1",
        "check_id": check_data.get("check_id"),
        "user_id": check_data.get("user_id"),
        "stored_verification_id": check_data.get("stored_verification_id"),
        "similarity_result": check_data.get("similarity_result"),
        "probability_score": float(check_data.get("probability_score", 0.0)),
        "timestamp": check_data.get("timestamp"),
        "check_type": "similarity_check",
        "written_by": client.get_account_address(),
        "app": APP_TAG,
        "record_type": "similarity_check",
    }
    
    annotations = [
        Annotation(key="app", value=APP_TAG),
        Annotation(key="recordType", value="similarity_check"),
        Annotation(key="schema", value="similarity_check_v1"),
        Annotation(key="user_id", value=check_data.get("user_id", "")),
        Annotation(key="check_id", value=check_data.get("check_id", "")),
        Annotation(key="stored_verification_id", value=check_data.get("stored_verification_id", "")),
        Annotation(key="check_type", value="similarity_check"),
        Annotation(key="timestamp", value=check_data.get("timestamp", "")),
        Annotation(key="similarity_result", value=check_data.get("similarity_result", "")),
        Annotation(key="probability_score", value=str(check_data.get("probability_score", 0.0))),
    ]
    
    entity_bytes = json.dumps(entity_data).encode("utf-8")
    
    create_operation = GolemBaseCreate(
        data=entity_bytes,
        btl=1_000_000,
        string_annotations=annotations,
        numeric_annotations=[],
    )
    
    result = await client.create_entities([create_operation])
    if not result or not result[0].entity_key:
        raise RuntimeError("Failed to create similarity check entity in Golem DB")
    
    return result[0].entity_key.as_hex_string()

# ========= MAIN NOTIFICATION FUNCTION =========
def notify_golem(endpoint: str, data: Dict[str, Any]) -> bool:
    """
    Main function to notify Golem DB - replaces the boilerplate function
    This function handles both humanity verification and similarity check data
    """
    try:
        # Run the async function in a new event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            if endpoint == "humanity_verification":
                entity_key = loop.run_until_complete(store_humanity_verification(data))
                print(f"✅ Humanity verification stored in Golem DB with entity key: {entity_key}")
                return True
            elif endpoint == "similarity_check":
                entity_key = loop.run_until_complete(store_similarity_check(data))
                print(f"✅ Similarity check stored in Golem DB with entity key: {entity_key}")
                return True
            else:
                print(f"❌ Unknown endpoint: {endpoint}")
                return False
        finally:
            loop.close()
            
    except Exception as e:
        print(f"❌ Failed to notify Golem DB: {e}")
        return False

# ========= UTILITY FUNCTIONS =========
async def get_writer_address() -> str:
    """Get the Golem DB writer address"""
    client = await get_golem_client()
    return client.get_account_address()

def get_golem_info() -> Dict[str, str]:
    """Get Golem DB connection info"""
    return {
        "app": APP_TAG,
        "rpc": GOLEM_DB_RPC,
        "wss": GOLEM_DB_WSS,
        "writer": "Not connected yet"
    }
