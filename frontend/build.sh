#!/bin/bash

# Build script for frontend Docker container

set -e

echo "Building frontend Docker image for linux/amd64 platform..."

# Build the Docker image for AMD64 platform (Kubernetes compatible)
docker build --platform linux/amd64 -t frontend:latest .
docker build --platform linux/amd64 -t maxkokocom/frontend:latest .

echo "Docker image built successfully for linux/amd64!"
echo ""
echo "Pushing to Docker Hub..."

# Push to Docker Hub
docker push maxkokocom/frontend:latest

echo "Docker image pushed to Docker Hub successfully!"
echo ""
echo "To run the container locally:"
echo "  docker run -p 3000:3000 frontend:latest"
echo ""
echo "To run in background:"
echo "  docker run -d -p 3000:3000 --name frontend frontend:latest"
echo ""
echo "To stop the container:"
echo "  docker stop frontend"
echo ""
echo "To remove the container:"
echo "  docker rm frontend"
