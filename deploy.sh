#!/bin/bash

# Lichess Scraper Deployment Script
# This script deploys the Cloud Function to Google Cloud

set -e

echo "==================================="
echo "Lichess Scraper Deployment Script"
echo "==================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found!"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ gcloud CLI found"
echo ""

# Get project ID
echo "📋 Please enter your Google Cloud Project ID:"
read -p "Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Project ID cannot be empty"
    exit 1
fi

# Set project
echo "Setting project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Select region
echo ""
echo "📍 Select your preferred region:"
echo "1) us-central1 (Iowa)"
echo "2) us-east1 (South Carolina)"
echo "3) us-west1 (Oregon)"
echo "4) europe-west1 (Belgium)"
echo "5) asia-east1 (Taiwan)"
read -p "Enter choice [1-5]: " REGION_CHOICE

case $REGION_CHOICE in
    1) REGION="us-central1";;
    2) REGION="us-east1";;
    3) REGION="us-west1";;
    4) REGION="europe-west1";;
    5) REGION="asia-east1";;
    *) REGION="us-central1";;
esac

echo "Selected region: $REGION"

# Select function version
echo ""
echo "📦 Select function version:"
echo "1) Basic version (index.js)"
echo "2) Advanced version with script injection (index-advanced.js)"
read -p "Enter choice [1-2]: " VERSION_CHOICE

if [ "$VERSION_CHOICE" == "2" ]; then
    ENTRY_POINT="fetchLichessGameAdvanced"
    SOURCE_FILE="index-advanced.js"
    mv index-advanced.js index.js
else
    ENTRY_POINT="fetchLichessGame"
    SOURCE_FILE="index.js"
fi

echo "Using: $SOURCE_FILE with entry point: $ENTRY_POINT"

# Select memory
echo ""
echo "💾 Select memory allocation:"
echo "1) 512MB (cheaper, may timeout)"
echo "2) 1GB (recommended)"
echo "3) 2GB (for complex pages)"
read -p "Enter choice [1-3]: " MEMORY_CHOICE

case $MEMORY_CHOICE in
    1) MEMORY="512MB";;
    2) MEMORY="1GB";;
    3) MEMORY="2GB";;
    *) MEMORY="1GB";;
esac

echo "Memory: $MEMORY"

# Confirm deployment
echo ""
echo "==================================="
echo "Deployment Configuration:"
echo "==================================="
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Function: fetchLichessGame"
echo "Entry Point: $ENTRY_POINT"
echo "Memory: $MEMORY"
echo "Timeout: 120s"
echo "==================================="
echo ""
read -p "Deploy with these settings? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

# Deploy
echo ""
echo "🚀 Deploying Cloud Function..."
echo ""

gcloud functions deploy fetchLichessGame \
  --gen2 \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --region $REGION \
  --memory $MEMORY \
  --timeout 120s \
  --entry-point $ENTRY_POINT \
  --set-env-vars NODE_ENV=production

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    
    # Get the function URL
    FUNCTION_URL=$(gcloud functions describe fetchLichessGame --region $REGION --gen2 --format="value(serviceConfig.uri)")
    
    echo "==================================="
    echo "Your Cloud Function URL:"
    echo "$FUNCTION_URL"
    echo "==================================="
    echo ""
    echo "📝 Next steps:"
    echo "1. Copy the URL above"
    echo "2. Open your Google Apps Script"
    echo "3. Replace CLOUD_FUNCTION_URL with this URL"
    echo "4. Test with: fetchLichessGameWithExtensions('Bm5DQUPZ')"
    echo ""
    echo "🧪 Test your function now:"
    echo "curl \"$FUNCTION_URL?gameId=Bm5DQUPZ\""
    echo ""
else
    echo "❌ Deployment failed"
    exit 1
fi
