# Lichess Game Scraper with Puppeteer

A Google Cloud Function using Puppeteer to scrape Lichess game data, including browser extension data, for use with Google Apps Script.

## Architecture

```
Lichess Website → Google Cloud Function (Puppeteer) → Google Apps Script → Google Sheets/Docs
```

## Features

- Scrapes standard Lichess game data (page-init-data)
- Captures browser extension data (like Lichess Tools)
- Returns structured JSON data
- Integrates seamlessly with Google Apps Script
- Handles CORS for web requests

## Deployment Instructions

### 1. Deploy to Google Cloud Functions

#### Option A: Using gcloud CLI

```bash
# Install gcloud CLI if you haven't: https://cloud.google.com/sdk/docs/install

# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Deploy the function
gcloud functions deploy fetchLichessGame \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --region us-central1 \
  --memory 1GB \
  --timeout 60s \
  --entry-point fetchLichessGame

# Note: You may need more memory (2GB) depending on the game complexity
```

#### Option B: Using Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to Cloud Functions
3. Click "CREATE FUNCTION"
4. Configure:
   - **Environment**: 2nd gen
   - **Function name**: fetchLichessGame
   - **Region**: us-central1 (or your preferred region)
   - **Trigger**: HTTPS
   - **Authentication**: Allow unauthenticated invocations
   - **Memory**: 1GB
   - **Timeout**: 60 seconds
   - **Runtime**: Node.js 18
5. Click "NEXT"
6. Copy the contents of `index.js` into the inline editor
7. Copy the contents of `package.json` into package.json
8. Set **Entry point**: `fetchLichessGame`
9. Click "DEPLOY"

### 2. Get Your Cloud Function URL

After deployment, you'll get a URL like:
```
https://us-central1-YOUR_PROJECT.cloudfunctions.net/fetchLichessGame
```

### 3. Setup Google Apps Script

1. Open your Google Sheets document
2. Go to Extensions → Apps Script
3. Copy the contents of `GoogleAppsScript.js`
4. Replace `CLOUD_FUNCTION_URL` with your actual Cloud Function URL
5. Save the script

## Usage

### Testing the Cloud Function Directly

```bash
# Using curl
curl "https://YOUR_CLOUD_FUNCTION_URL?gameId=Bm5DQUPZ"

# Using browser
https://YOUR_CLOUD_FUNCTION_URL?gameId=Bm5DQUPZ
```

### Using from Google Apps Script

```javascript
// Fetch a single game
function test() {
  const data = fetchLichessGameWithExtensions('Bm5DQUPZ');
  Logger.log(data);
}

// Write to sheet
function writeData() {
  writeGameDataToSheet('Bm5DQUPZ');
}

// Process multiple games
function batchProcess() {
  processMultipleGames();
}
```

## Response Format

```json
{
  "success": true,
  "gameId": "Bm5DQUPZ",
  "data": {
    "pageInitData": {
      // Standard Lichess page initialization data
      "game": { ... },
      "player": { ... },
      "opponent": { ... }
    },
    "extensionData": {
      // Data injected by browser extensions
      "__lichessTools": { ... },
      // Other extension properties
    },
    "additionalData": {
      "title": "Page title",
      "url": "Full URL",
      "moves": ["e4", "e5", ...],
      "analysis": [...],
      "extensionElements": [...]
    },
    "htmlLength": 123456
  },
  "timestamp": "2025-10-16T12:00:00.000Z"
}
```

## Capturing Extension Data

The scraper looks for extension data in several ways:

1. **Window Object**: Checks for properties with keywords like 'lichess', 'extension', 'chess'
2. **Custom Data Attributes**: Finds elements with `data-lichess-tools`, `data-extension`, etc.
3. **Custom Classes**: Searches for elements with 'extension' in class names
4. **Script Tags**: Extracts data from custom script tags

### For Lichess Tools Extension

If you have the Lichess Tools extension installed, the scraper will capture:
- Settings and preferences
- Enhanced analysis data
- Custom annotations
- Additional metrics

## Important Notes

### Limitations

- **No Real Extensions**: Cloud Functions run in a headless browser without actual extensions installed
- **Extension Data**: To capture real extension data, you'd need to:
  - Load the extension programmatically (complex)
  - Or scrape the DOM elements the extension creates
  - Or use a browser automation service that supports extensions

### Workaround for Extension Data

If you need actual extension functionality:

1. **Option 1**: Run Puppeteer locally with extensions
```javascript
const browser = await puppeteer.launch({
  headless: false,
  args: [
    '--disable-extensions-except=/path/to/extension',
    '--load-extension=/path/to/extension'
  ]
});
```

2. **Option 2**: Use the extension's API if available
3. **Option 3**: Reverse engineer what the extension adds to the page

## Costs

Google Cloud Functions pricing (as of 2025):
- **Invocations**: First 2M free per month
- **Compute time**: ~$0.0000025 per GB-second
- **Network**: First 5GB free per month

Estimated cost per scrape: < $0.001

## Troubleshooting

### Function Times Out
- Increase timeout to 120s or 300s
- Increase memory to 2GB

### Missing Extension Data
- Extensions don't run in Cloud Functions by default
- Check `additionalData.extensionElements` for DOM elements

### Authentication Errors
- Ensure "Allow unauthenticated invocations" is enabled
- Check CORS settings if calling from web

## Security Considerations

- Function is public (unauthenticated)
- Add authentication if needed using Cloud Functions auth
- Rate limit requests to avoid abuse
- Consider using Cloud Armor for DDoS protection

## Support

For issues related to:
- Google Cloud Functions: [GCP Documentation](https://cloud.google.com/functions/docs)
- Puppeteer: [Puppeteer Documentation](https://pptr.dev/)
- Google Apps Script: [Apps Script Documentation](https://developers.google.com/apps-script)
