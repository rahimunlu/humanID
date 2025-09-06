# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for the application
RUN apt-get update && apt-get install -y \
    bash \
    bc \
    coreutils \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY main.py .
COPY similarity_check.sh .

# Make the similarity check script executable
RUN chmod +x similarity_check.sh

# Create directories for file storage
RUN mkdir -p /tmp/biometrics_uploads /tmp/biometrics_encrypted

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=main.py
ENV FLASK_ENV=production

# Expose port 5000
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Install curl for health check
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Run the application
CMD ["python", "main.py"]
