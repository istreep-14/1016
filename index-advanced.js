const puppeteer = require('puppeteer');

/**
 * Advanced Google Cloud Function with extension code injection support
 * This version can inject custom JavaScript to simulate extension behavior
 */
exports.fetchLichessGameAdvanced = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    return res.status(204).send('');
  }

  const gameId = req.query.gameId || req.body?.gameId;
  const customScript = req.body?.customScript; // Custom JS to inject
  const waitTime = parseInt(req.query.waitTime || req.body?.waitTime || '5000');
  
  if (!gameId) {
    return res.status(400).json({ 
      error: 'Missing gameId parameter'
    });
  }

  let browser = null;
  
  try {
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
    
    // Intercept and modify requests if needed
    await page.setRequestInterception(true);
    page.on('request', request => {
      request.continue();
    });

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    const url = `https://lichess.org/${gameId}`;
    console.log(`Fetching game: ${url}`);
    
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // If custom script provided, inject it
    if (customScript) {
      console.log('Injecting custom script...');
      await page.evaluate(customScript);
    }

    // Wait for dynamic content and potential extension modifications
    console.log(`Waiting ${waitTime}ms for content to load...`);
    await page.waitForTimeout(waitTime);

    // Capture network requests that might contain data
    const requests = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('api') || url.includes('game')) {
        try {
          const data = await response.json();
          requests.push({ url, data });
        } catch (e) {
          // Not JSON
        }
      }
    });

    // Extract comprehensive data
    const gameData = await page.evaluate(() => {
      const data = {
        pageInitData: null,
        extensionData: {},
        dom: {},
        localStorage: {},
        cookies: {},
        computedData: {}
      };

      // Standard page init data
      const pageInitScript = document.getElementById('page-init-data');
      if (pageInitScript) {
        try {
          data.pageInitData = JSON.parse(pageInitScript.textContent.trim());
        } catch (e) {
          console.error('Error parsing page-init-data:', e);
        }
      }

      // Scan window object thoroughly
      const windowKeys = Object.keys(window);
      const interestingKeys = windowKeys.filter(key => {
        const keyLower = key.toLowerCase();
        return keyLower.includes('lichess') || 
               keyLower.includes('extension') || 
               keyLower.includes('chess') ||
               keyLower.includes('tool') ||
               keyLower.includes('plugin') ||
               key.startsWith('__') ||
               key.startsWith('_');
      });
      
      interestingKeys.forEach(key => {
        try {
          const value = window[key];
          if (value !== null && value !== undefined) {
            // Try to serialize the value
            if (typeof value === 'object') {
              data.extensionData[key] = JSON.parse(JSON.stringify(value));
            } else if (typeof value === 'function') {
              data.extensionData[key] = value.toString().substring(0, 200);
            } else {
              data.extensionData[key] = value;
            }
          }
        } catch (e) {
          data.extensionData[key] = '[Error accessing property]';
        }
      });

      // Extract localStorage (extension data often stored here)
      try {
        Object.keys(localStorage).forEach(key => {
          try {
            const value = localStorage.getItem(key);
            if (key.toLowerCase().includes('lichess') || 
                key.toLowerCase().includes('chess') ||
                key.toLowerCase().includes('extension')) {
              data.localStorage[key] = value;
            }
          } catch (e) {
            // Skip
          }
        });
      } catch (e) {
        console.error('Cannot access localStorage');
      }

      // Extract relevant DOM data
      data.dom.title = document.title;
      data.dom.url = window.location.href;
      
      // Game moves
      const moveElements = document.querySelectorAll('.moves move, move');
      if (moveElements.length > 0) {
        data.dom.moves = Array.from(moveElements).map(m => m.textContent.trim());
      }

      // Player info
      const playerElements = document.querySelectorAll('.ruser, .player');
      if (playerElements.length > 0) {
        data.dom.players = Array.from(playerElements).map(p => ({
          text: p.textContent.trim(),
          classes: p.className
        }));
      }

      // Analysis/evaluation data
      const evalElements = document.querySelectorAll('[data-eval], .eval, .evaluation');
      if (evalElements.length > 0) {
        data.dom.evaluations = Array.from(evalElements).map(e => ({
          eval: e.getAttribute('data-eval'),
          text: e.textContent.trim()
        }));
      }

      // Extension-specific selectors (common patterns)
      const extensionSelectors = [
        '[data-lichess-tools]',
        '[data-extension]',
        '[class*="extension"]',
        '[class*="tool"]',
        '[class*="enhanced"]',
        '[id*="extension"]',
        '[id*="tool"]'
      ];

      extensionSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            const key = selector.replace(/[\[\]"'*]/g, '');
            data.dom[key] = Array.from(elements).map(el => ({
              tag: el.tagName,
              id: el.id,
              classes: el.className,
              attributes: Array.from(el.attributes).map(attr => ({
                name: attr.name,
                value: attr.value
              })),
              text: el.textContent.substring(0, 300)
            }));
          }
        } catch (e) {
          // Skip invalid selectors
        }
      });

      // Computed game data
      const rmoves = document.querySelectorAll('.rmoves move');
      if (rmoves.length > 0) {
        data.computedData.moveCount = rmoves.length;
      }

      // Extract any JSON in script tags
      const scripts = document.querySelectorAll('script:not([src])');
      const jsonScripts = [];
      scripts.forEach(script => {
        const content = script.textContent.trim();
        if (content.startsWith('{') || content.startsWith('[')) {
          try {
            const json = JSON.parse(content);
            jsonScripts.push(json);
          } catch (e) {
            // Not valid JSON
          }
        }
      });
      if (jsonScripts.length > 0) {
        data.computedData.jsonScripts = jsonScripts;
      }

      return data;
    });

    await browser.close();
    browser = null;

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
      stack: error.stack,
      gameId: gameId
    });
  }
};
