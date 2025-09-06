#!/bin/bash

# Build script for biometrics server Docker container

set -e

echo "Building biometrics server Docker image for linux/amd64 platform..."

# Build the Docker image for AMD64 platform (Kubernetes compatible)
docker build --platform linux/amd64 -t biometrics-server:latest .
docker build --platform linux/amd64 -t maxkokocom/biometrics:latest .

echo "Docker image built successfully for linux/amd64!"
echo ""
echo "Pushing to Docker Hub..."

# Push to Docker Hub
docker push maxkokocom/biometrics:latest

echo "Docker image pushed to Docker Hub successfully!"
echo ""
echo "To run the container locally:"
echo "  docker run -p 5000:5000 biometrics-server:latest"
echo ""
echo "To run in background:"
echo "  docker run -d -p 5000:5000 --name biometrics-server biometrics-server:latest"
echo ""
echo "To stop the container:"
echo "  docker stop biometrics-server"
echo ""
echo "To remove the container:"
echo "  docker rm biometrics-server"
