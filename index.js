const puppeteer = require('puppeteer');

/**
 * Google Cloud Function to scrape Lichess game data with Puppeteer
 * Includes extension-injected data
 */
exports.fetchLichessGame = async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    return res.status(204).send('');
  }

  const gameId = req.query.gameId || req.body?.gameId;
  
  if (!gameId) {
    return res.status(400).json({ 
      error: 'Missing gameId parameter',
      usage: 'Call with ?gameId=YOUR_GAME_ID or POST with {"gameId": "YOUR_GAME_ID"}'
    });
  }

  let browser = null;
  
  try {
    // Launch browser with appropriate settings for Cloud Functions
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
      ]
    });

    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Navigate to the game page
    const url = `https://lichess.org/${gameId}`;
    console.log(`Fetching game: ${url}`);
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait a bit for any dynamic content or extensions to load
    await page.waitForTimeout(3000);

    // Extract all the data
    const gameData = await page.evaluate(() => {
      const data = {
        pageInitData: null,
        extensionData: null,
        additionalData: {}
      };

      // Extract the standard page-init-data
      const pageInitScript = document.getElementById('page-init-data');
      if (pageInitScript) {
        try {
          data.pageInitData = JSON.parse(pageInitScript.textContent.trim());
        } catch (e) {
          console.error('Error parsing page-init-data:', e);
        }
      }

      // Look for extension-injected data
      // Extensions often add data to window object or custom script tags
      
      // Check window object for common extension data patterns
      const windowKeys = Object.keys(window).filter(key => 
        key.includes('lichess') || 
        key.includes('extension') || 
        key.includes('chess') ||
        key.startsWith('__')
      );
      
      if (windowKeys.length > 0) {
        data.extensionData = {};
        windowKeys.forEach(key => {
          try {
            const value = window[key];
            if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
              data.extensionData[key] = value;
            }
          } catch (e) {
            // Skip properties that can't be accessed
          }
        });
      }

      // Extract additional useful data from the page
      data.additionalData.title = document.title;
      data.additionalData.url = window.location.href;
      
      // Get move list if available
      const moves = document.querySelectorAll('.moves move');
      if (moves.length > 0) {
        data.additionalData.moves = Array.from(moves).map(m => m.textContent);
      }

      // Get analysis data if available
      const analysisElements = document.querySelectorAll('[data-analysis]');
      if (analysisElements.length > 0) {
        data.additionalData.analysis = Array.from(analysisElements).map(el => ({
          analysis: el.getAttribute('data-analysis'),
          text: el.textContent
        }));
      }

      // Check for any custom data attributes that extensions might add
      const customDataElements = document.querySelectorAll('[data-lichess-tools], [data-extension], [class*="extension"]');
      if (customDataElements.length > 0) {
        data.additionalData.extensionElements = Array.from(customDataElements).map(el => ({
          tagName: el.tagName,
          className: el.className,
          attributes: Array.from(el.attributes).map(attr => ({
            name: attr.name,
            value: attr.value
          })),
          textContent: el.textContent.substring(0, 500) // Limit length
        }));
      }

      return data;
    });

    // Get the full HTML as well
    const html = await page.content();
    gameData.htmlLength = html.length;

    await browser.close();
    browser = null;

    // Return the data
    return res.status(200).json({
      success: true,
      gameId: gameId,
      data: gameData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching game:', error);
    
    if (browser) {
      await browser.close();
    }

    return res.status(500).json({
      success: false,
      error: error.message,
      gameId: gameId
    });
  }
};
