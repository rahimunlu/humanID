#!/bin/bash

# Build script for genome device Docker container

set -e

echo "Building genome device Docker image for linux/amd64 platform..."

# Build the Docker image for AMD64 platform (Kubernetes compatible)
docker build --platform linux/amd64 -t genome-device:latest .
docker build --platform linux/amd64 -t maxkokocom/genome-device:latest .

echo "Docker image built successfully for linux/amd64!"
echo ""
echo "Pushing to Docker Hub..."

# Push to Docker Hub
docker push maxkokocom/genome-device:latest

echo "Docker image pushed to Docker Hub successfully!"
echo ""
echo "To run the container locally:"
echo "  docker run -p 8000:8000 genome-device:latest"
echo ""
echo "To run in background:"
echo "  docker run -d -p 8000:8000 --name genome-device genome-device:latest"
echo ""
echo "To stop the container:"
echo "  docker stop genome-device"
echo ""
echo "To remove the container:"
echo "  docker rm genome-device"
