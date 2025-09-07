#!/usr/bin/env python3
"""
Test script for Genome Device Server
"""

import requests
import json
import time

# Server URL (adjust as needed)
SERVER_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{SERVER_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_root():
    """Test root endpoint"""
    print("\n🔍 Testing root endpoint...")
    try:
        response = requests.get(f"{SERVER_URL}/")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Root endpoint failed: {e}")
        return False

def test_start_sequencing():
    """Test start sequencing endpoint"""
    print("\n🧬 Testing start sequencing endpoint...")
    
    test_request = {
        "user_id": "test_user_123",
        "custodian": "test_custodian",
        "expiration_date": "2024-12-31",
        "custodian_endpoint": "https://biometrics-server.biokami.com"
    }
    
    try:
        response = requests.post(
            f"{SERVER_URL}/start_sequencing",
            json=test_request
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Start sequencing failed: {e}")
        return False

def test_status():
    """Test status endpoint"""
    print("\n📊 Testing status endpoint...")
    try:
        response = requests.get(f"{SERVER_URL}/status/test_user_123")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Status check failed: {e}")
        return False

def test_list_status():
    """Test list all statuses endpoint"""
    print("\n📋 Testing list status endpoint...")
    try:
        response = requests.get(f"{SERVER_URL}/list_status")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ List status failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧬 Genome Device Server Test Suite")
    print("=" * 40)
    
    tests = [
        test_health,
        test_root,
        test_start_sequencing,
        test_status,
        test_list_status
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        time.sleep(1)  # Small delay between tests
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("✅ All tests passed!")
    else:
        print("❌ Some tests failed!")

if __name__ == "__main__":
    main()
