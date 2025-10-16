# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Deploy to Google Cloud Functions

**Option A: Using the deployment script (Recommended)**
```bash
cd lichess-scraper
chmod +x deploy.sh
./deploy.sh
```

**Option B: Manual deployment**
```bash
gcloud functions deploy fetchLichessGame \
  --gen2 \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --region us-central1 \
  --memory 1GB \
  --timeout 120s \
  --entry-point fetchLichessGame
```

### Step 2: Copy Your Function URL

After deployment, you'll get a URL like:
```
https://us-central1-yourproject.cloudfunctions.net/fetchLichessGame
```

### Step 3: Test It

```bash
curl "YOUR_FUNCTION_URL?gameId=Bm5DQUPZ"
```

### Step 4: Setup Google Apps Script

1. Open Google Sheets
2. Extensions → Apps Script
3. Copy `GoogleAppsScript.js` content
4. Replace `CLOUD_FUNCTION_URL` with your actual URL
5. Save

### Step 5: Run It!

```javascript
function test() {
  fetchLichessGameWithExtensions('Bm5DQUPZ');
}
```

## 📊 What You Get

- **Game data**: Players, moves, result, ratings
- **Timing**: Clock times for each move
- **Analysis**: Computer evaluation if available
- **Opening**: ECO code and opening name
- **Extension data**: Any browser extension modifications (limited)

## 🔧 Files Explained

- `index.js` - Basic Cloud Function (use this first)
- `index-advanced.js` - Advanced version with script injection
- `GoogleAppsScript.js` - Simple integration script
- `GoogleAppsScript-Advanced.js` - Full data extraction helpers
- `deploy.sh` - Automated deployment script
- `README.md` - Complete documentation

## 💡 Usage Examples

### Example 1: Single Game to Sheet
```javascript
function importGame() {
  writeGameDataToSheet('Bm5DQUPZ');
}
```

### Example 2: Multiple Games
```javascript
function importMultiple() {
  const games = ['game1', 'game2', 'game3'];
  games.forEach(id => {
    writeOrganizedDataToSheet(id);
    Utilities.sleep(2000);
  });
}
```

### Example 3: Get Specific Data
```javascript
function getPlayerRatings() {
  const data = fetchLichessToolsData('Bm5DQUPZ');
  Logger.log(`White: ${data.playerInfo.white.rating}`);
  Logger.log(`Black: ${data.playerInfo.black.rating}`);
}
```

## ⚠️ Important Notes

### About Extension Data

**The Cloud Function cannot run actual browser extensions**, but it can:
- ✅ Capture DOM elements that extensions create
- ✅ Read localStorage data that extensions save
- ✅ Extract window object properties extensions add
- ❌ Cannot load .crx extension files
- ❌ Cannot execute extension background scripts

### To Get Real Extension Data

If you need actual Lichess Tools extension data:

1. **Run Puppeteer locally** with extensions loaded
2. **Use the extension's API** if it exposes one
3. **Scrape the modified DOM** (what this function does)
4. **Use browser automation** services that support extensions

### Example: Running Locally with Extensions

```javascript
const browser = await puppeteer.launch({
  headless: false,
  args: [
    '--disable-extensions-except=/path/to/lichess-tools',
    '--load-extension=/path/to/lichess-tools'
  ]
});
```

## 💰 Costs

Very minimal! Approximately:
- **$0.0001 - $0.001 per request**
- First 2 million invocations free per month
- Most users will stay in free tier

## 🐛 Troubleshooting

### Function Times Out
```bash
# Increase timeout and memory
gcloud functions deploy fetchLichessGame ... --timeout 300s --memory 2GB
```

### No Extension Data Found
This is expected - Cloud Functions don't run real extensions. Check:
- `data.dom.extensionElements` for DOM modifications
- `data.localStorage` for saved settings
- `data.extensionData` for window object properties

### Authentication Error
```bash
# Make sure function is public
gcloud functions add-iam-policy-binding fetchLichessGame \
  --region=us-central1 \
  --member=allUsers \
  --role=roles/cloudfunctions.invoker
```

## 📚 Next Steps

1. Read the full `README.md`
2. Try the advanced version with `index-advanced.js`
3. Customize data extraction in `GoogleAppsScript-Advanced.js`
4. Set up automated scheduling with Apps Script triggers

## 🆘 Need Help?

- Check the full README.md
- Review Google Cloud Functions docs
- Test with curl first before using Apps Script
- Enable logging in Cloud Functions console

## 🎯 Pro Tips

1. **Cache results** - Don't fetch the same game multiple times
2. **Batch process** - Use sleep() between requests
3. **Error handling** - Always wrap in try-catch
4. **Monitor costs** - Check Cloud Functions dashboard
5. **Use filters** - Only fetch data you need

Happy scraping! 🎉
