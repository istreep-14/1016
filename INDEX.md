# Lichess Game Scraper - Complete Package

## 📦 What's Included

This package provides a complete solution for scraping Lichess game data using Google Cloud Functions with Puppeteer, integrated with Google Apps Script.

## 🗂️ Files Overview

### Core Cloud Function Files
- **`index.js`** - Basic Puppeteer scraper (start here!)
- **`index-advanced.js`** - Advanced version with custom script injection
- **`package.json`** - Node.js dependencies

### Google Apps Script Files
- **`GoogleAppsScript.js`** - Simple integration script
- **`GoogleAppsScript-Advanced.js`** - Full data extraction with helpers
- **`CustomScriptExamples.js`** - Example custom scripts for advanced features

### Documentation
- **`QUICKSTART.md`** - Get started in 5 minutes ⚡
- **`README.md`** - Complete documentation
- **`COMPARISON.md`** - Apps Script vs Puppeteer comparison
- **`INDEX.md`** - This file

### Deployment
- **`deploy.sh`** - Automated deployment script (Linux/Mac)

## 🚀 Quick Start

### 1. Deploy Cloud Function
```bash
cd lichess-scraper
chmod +x deploy.sh
./deploy.sh
```

### 2. Setup Apps Script
1. Copy `GoogleAppsScript.js` to your Apps Script project
2. Update `CLOUD_FUNCTION_URL` with your function URL
3. Run `testFunction()`

### 3. Fetch Your First Game
```javascript
fetchLichessGameWithExtensions('Bm5DQUPZ');
```

## 📖 Which Files Do I Need?

### Minimal Setup
If you just want basic game scraping:
- ✅ `index.js`
- ✅ `package.json`
- ✅ `GoogleAppsScript.js`
- 📖 `QUICKSTART.md`

### Full Setup
If you want advanced features and custom analysis:
- ✅ `index-advanced.js` (rename to index.js)
- ✅ `package.json`
- ✅ `GoogleAppsScript-Advanced.js`
- ✅ `CustomScriptExamples.js`
- 📖 `README.md`
- 📖 `COMPARISON.md`

## 🎯 Use Cases

### Basic Game Data
Use: `index.js` + `GoogleAppsScript.js`
```javascript
const data = fetchLichessGameWithExtensions('gameId');
// Get: players, moves, result, ratings, opening
```

### Advanced Analysis
Use: `index-advanced.js` + `GoogleAppsScript-Advanced.js`
```javascript
const data = fetchLichessToolsData('gameId');
// Get: organized data, accuracy, move analysis, timing
```

### Custom Calculations
Use: `index-advanced.js` + `CustomScriptExamples.js`
```javascript
fetchWithCustomScript('gameId', 'accuracy');
// Get: custom calculations injected via JavaScript
```

## 💡 Important Notes

### About Browser Extensions
⚠️ **Reality Check**: You cannot run actual browser extensions (like Lichess Tools) in Google Cloud Functions.

**What you CAN do:**
- ✅ Scrape DOM elements extensions create
- ✅ Read localStorage data
- ✅ Access window object properties
- ✅ Inject custom scripts to replicate extension features

**What you CANNOT do:**
- ❌ Load .crx extension files
- ❌ Run extension background scripts
- ❌ Access Chrome extension APIs

See `COMPARISON.md` for detailed explanation.

## 📊 Features Comparison

| Feature | Basic | Advanced |
|---------|-------|----------|
| Page data extraction | ✅ | ✅ |
| Window object access | ✅ | ✅ |
| Custom script injection | ❌ | ✅ |
| Accuracy calculation | ❌ | ✅ |
| Move analysis | ❌ | ✅ |
| Opening tracking | ❌ | ✅ |

## 💰 Cost Estimate

For most users: **$0/month** (free tier covers 2M requests)

Example costs if you exceed free tier:
- 10,000 games/month: ~$0 (within free tier)
- 100,000 games/month: ~$5-10/month
- 1,000,000 games/month: ~$50-100/month

See `COMPARISON.md` for detailed cost analysis.

## 🛠️ Customization

### Add Your Own Analysis
Edit `CustomScriptExamples.js` to create custom scripts:
```javascript
const myCustomScript = `
  // Your JavaScript here
  window.__myAnalysis = {
    // Custom calculations
  };
`;
```

### Modify Data Extraction
Edit `GoogleAppsScript-Advanced.js` functions:
- `extractBasicInfo()` - Game metadata
- `extractMoves()` - Move list and timing
- `extractAnalysis()` - Computer analysis
- `extractPlayerInfo()` - Player data

## 📚 Learning Path

### Day 1: Basic Setup
1. Read `QUICKSTART.md`
2. Deploy `index.js`
3. Test with `GoogleAppsScript.js`

### Day 2: Understand Data
1. Read `README.md`
2. Review `COMPARISON.md`
3. Explore what data you're getting

### Day 3: Advanced Features
1. Switch to `index-advanced.js`
2. Try `GoogleAppsScript-Advanced.js`
3. Test `CustomScriptExamples.js`

### Day 4: Customize
1. Write custom scripts
2. Add your own analysis
3. Integrate with your workflow

## 🔧 Troubleshooting

### Common Issues

**Function times out**
- Solution: Increase timeout in deployment

**No extension data**
- Expected! Extensions don't run in Cloud Functions
- Use custom scripts to replicate functionality

**Authentication errors**
- Ensure function allows unauthenticated access

**Out of memory**
- Increase memory allocation (512MB → 1GB → 2GB)

See `README.md` troubleshooting section for more.

## 🤝 Support

Need help?
1. Check `README.md` for detailed docs
2. Review `COMPARISON.md` for understanding limitations
3. Look at examples in `CustomScriptExamples.js`
4. Test with `curl` before trying Apps Script

## 🎓 Resources

### Documentation
- [Google Cloud Functions](https://cloud.google.com/functions/docs)
- [Puppeteer API](https://pptr.dev/)
- [Google Apps Script](https://developers.google.com/apps-script)
- [Lichess API](https://lichess.org/api)

### Tools
- [gcloud CLI](https://cloud.google.com/sdk/docs/install)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

## 📝 Version History

- **v1.0** - Initial release
  - Basic scraping (index.js)
  - Advanced scraping (index-advanced.js)
  - Apps Script integration
  - Custom script examples

## 🎉 Next Steps

1. **Read QUICKSTART.md** - Get up and running fast
2. **Deploy your function** - Use deploy.sh or manual steps
3. **Test it out** - Try with a game ID
4. **Explore advanced features** - Custom scripts and analysis
5. **Integrate with your workflow** - Sheets, automation, etc.

---

**Ready to start?** → Open `QUICKSTART.md`

**Want to understand more?** → Read `COMPARISON.md`

**Need full details?** → Check `README.md`
