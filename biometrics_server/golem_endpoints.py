#!/usr/bin/env python3
"""
Golem DB Integration for HumanID Biometrics Server
Handles writing verification data to Golem DB using the established pattern
"""

import os
import json
import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Set up logger
logger = logging.getLogger(__name__)

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
        ttl=1000000,
        string_annotations=annotations,
        numeric_annotations=[],
    )
    
    result = await client.create_entities([create_operation])
    if not result or not result[0].entity_key:
        raise RuntimeError("Failed to create humanity verification entity in Golem DB")
    
    logger.info(f"✅ Humanity verification stored in Golem DB with entity key: {result[0].entity_key.as_hex_string()}")
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
        ttl=1000000,
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
        import threading
        import concurrent.futures
        
        def run_async_in_thread():
            """Run async function in a separate thread with proper event loop handling"""
            # Create a new event loop for this thread
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                if endpoint == "humanity_verification":
                    return loop.run_until_complete(store_humanity_verification(data))
                elif endpoint == "similarity_check":
                    return loop.run_until_complete(store_similarity_check(data))
                else:
                    raise ValueError(f"Unknown endpoint: {endpoint}")
            finally:
                loop.close()
        
        # Run the async function in a separate thread to avoid signal issues
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(run_async_in_thread)
            entity_key = future.result(timeout=30)  # 30 second timeout
            
            if endpoint == "humanity_verification":
                print(f"✅ Humanity verification stored in Golem DB with entity key: {entity_key}")
            elif endpoint == "similarity_check":
                print(f"✅ Similarity check stored in Golem DB with entity key: {entity_key}")
            
            return True
            
    except Exception as e:
        print(f"❌ Failed to notify Golem DB: {e}")
        return False
# ========= UTILITY FUNCTIONS =========
async def get_writer_address() -> str:
    """Get the Golem DB writer address"""
    client = await get_golem_client()
    return client.get_account_address()

# ========= FETCH FUNCTIONS =========
async def fetch_latest_verification_by_timestamp() -> Optional[dict]:
    """Fetch the latest humanity verification from Golem DB based on timestamp annotation"""
    client = await get_golem_client()
    
    # Get account address
    account_address = client.get_account_address()
    
    # Get all entities owned by this account
    entity_keys = await client.get_entities_of_owner(account_address)
    
    latest_verification = None
    latest_timestamp = None
    
    for entity_key in entity_keys:
        try:
            # Get metadata to check if this is a humanity verification
            metadata = await client.get_entity_metadata(entity_key)
            
            # Check if this is a humanity verification with timestamp
            is_humanity_verification = False
            verification_timestamp = None
            
            for annotation in metadata.string_annotations:
                if annotation.key == "recordType" and annotation.value == "humanity_verification":
                    is_humanity_verification = True
                elif annotation.key == "timestamp":
                    verification_timestamp = annotation.value
            
            if is_humanity_verification and verification_timestamp:
                # Parse timestamp to compare
                try:
                    timestamp_dt = datetime.fromisoformat(verification_timestamp.replace('Z', '+00:00'))
                    
                    # Check if this is the latest
                    if latest_timestamp is None or timestamp_dt > latest_timestamp:
                        # Get the actual data using get_storage_value
                        entity_key_hex = entity_key.as_hex_string()
                        storage_value = await client.get_storage_value(GenericBytes.from_hex_string(entity_key_hex))
                        
                        if storage_value:
                            # Decode the JSON data
                            entity_data = json.loads(storage_value.decode('utf-8'))
                            
                            # Add all annotations to the response
                            annotations_dict = {}
                            for annotation in metadata.string_annotations:
                                annotations_dict[annotation.key] = annotation.value
                            
                            # Merge entity data with annotations
                            latest_verification = {
                                **entity_data,
                                'entity_key': entity_key_hex,
                                'annotations': annotations_dict
                            }
                            latest_timestamp = timestamp_dt
                            
                except ValueError as e:
                    logger.error(f"Error parsing timestamp {verification_timestamp}: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error processing entity {entity_key}: {e}")
            continue
    
    return latest_verification

async def fetch_all_verifications() -> list[dict]:
    """Fetch all humanity verifications from Golem DB, sorted by timestamp (newest first)"""
    client = await get_golem_client()
    
    # Get account address
    account_address = client.get_account_address()
    
    # Get all entities owned by this account
    entity_keys = await client.get_entities_of_owner(account_address)
    
    verifications = []
    
    for entity_key in entity_keys:
        try:
            # Get metadata to check if this is a humanity verification
            metadata = await client.get_entity_metadata(entity_key)
            
            # Check if this is a humanity verification
            is_humanity_verification = False
            verification_timestamp = None
            
            for annotation in metadata.string_annotations:
                if annotation.key == "recordType" and annotation.value == "humanity_verification":
                    is_humanity_verification = True
                elif annotation.key == "timestamp":
                    verification_timestamp = annotation.value
            
            if is_humanity_verification and verification_timestamp:
                try:
                    # Get the actual data using get_storage_value
                    entity_key_hex = entity_key.as_hex_string()
                    storage_value = await client.get_storage_value(GenericBytes.from_hex_string(entity_key_hex))
                    
                    if storage_value:
                        # Decode the JSON data
                        entity_data = json.loads(storage_value.decode('utf-8'))
                        
                        # Add all annotations to the response
                        annotations_dict = {}
                        for annotation in metadata.string_annotations:
                            annotations_dict[annotation.key] = annotation.value
                        
                        # Merge entity data with annotations
                        verification_data = {
                            **entity_data,
                            'entity_key': entity_key_hex,
                            'annotations': annotations_dict
                        }
                        verifications.append(verification_data)
                        
                except Exception as e:
                    logger.error(f"Error processing entity data {entity_key}: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error processing entity {entity_key}: {e}")
            continue
    
    # Sort by timestamp (newest first)
    verifications.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    return verifications

# ========= SYNCHRONOUS WRAPPER FUNCTIONS =========
def fetch_latest_verification_sync() -> Optional[dict]:
    """
    Synchronous wrapper for fetching latest verification from Golem DB
    Use this function from Flask routes
    """
    try:
        import threading
        import concurrent.futures
        
        def run_async_in_thread():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                return loop.run_until_complete(fetch_latest_verification_by_timestamp())
            finally:
                loop.close()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(run_async_in_thread)
            return future.result(timeout=30)  # 30 second timeout
            
    except Exception as e:
        logger.error(f"❌ Failed to fetch latest verification: {e}")
        return None

def fetch_all_verifications_sync() -> list[dict]:
    """
    Synchronous wrapper for fetching all verifications from Golem DB
    Use this function from Flask routes
    """
    try:
        import threading
        import concurrent.futures
        
        def run_async_in_thread():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                return loop.run_until_complete(fetch_all_verifications())
            finally:
                loop.close()
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(run_async_in_thread)
            return future.result(timeout=30)  # 30 second timeout
            
    except Exception as e:
        logger.error(f"❌ Failed to fetch verifications: {e}")
        return []

def get_golem_info() -> Dict[str, str]:
    """Get Golem DB connection info"""
    return {
        "app": APP_TAG,
        "rpc": GOLEM_DB_RPC,
        "wss": GOLEM_DB_WSS,
        "writer": "Not connected yet"
    }

