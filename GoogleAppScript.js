/**
 * Google Apps Script to call the Puppeteer Cloud Function
 * and fetch Lichess game data including extension data
 */

// Replace this with your deployed Cloud Function URL
const CLOUD_FUNCTION_URL = 'https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/fetchLichessGame';

/**
 * Fetches Lichess game data via Cloud Function
 * @param {string} gameId - The Lichess game ID
 * @returns {object} Game data including extension data
 */
function fetchLichessGameWithExtensions(gameId) {
  if (!gameId) {
    Logger.log('Error: No game ID provided');
    return null;
  }
  
  try {
    const url = `${CLOUD_FUNCTION_URL}?gameId=${gameId}`;
    
    Logger.log(`Calling Cloud Function for game: ${gameId}`);
    
    const options = {
      'method': 'get',
      'muteHttpExceptions': true,
      'headers': {
        'Content-Type': 'application/json'
      }
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    
    Logger.log(`Status: ${statusCode}`);
    
    if (statusCode !== 200) {
      Logger.log(`Error: ${response.getContentText()}`);
      return null;
    }
    
    const jsonResponse = JSON.parse(response.getContentText());
    
    if (jsonResponse.success) {
      Logger.log('Game data fetched successfully!');
      Logger.log(`HTML Length: ${jsonResponse.data.htmlLength}`);
      
      // Log the page init data
      if (jsonResponse.data.pageInitData) {
        Logger.log('Page Init Data Found:');
        Logger.log(JSON.stringify(jsonResponse.data.pageInitData, null, 2));
      }
      
      // Log extension data
      if (jsonResponse.data.extensionData) {
        Logger.log('Extension Data Found:');
        Logger.log(JSON.stringify(jsonResponse.data.extensionData, null, 2));
      }
      
      // Log additional data
      if (jsonResponse.data.additionalData) {
        Logger.log('Additional Data:');
        Logger.log(JSON.stringify(jsonResponse.data.additionalData, null, 2));
      }
      
      return jsonResponse.data;
    } else {
      Logger.log(`Error: ${jsonResponse.error}`);
      return null;
    }
    
  } catch (error) {
    Logger.log(`Error calling Cloud Function: ${error.toString()}`);
    return null;
  }
}

/**
 * Example: Write game data to a Google Sheet
 */
function writeGameDataToSheet(gameId) {
  const gameData = fetchLichessGameWithExtensions(gameId);
  
  if (!gameData) {
    Logger.log('Failed to fetch game data');
    return;
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Write basic info
  const row = sheet.getLastRow() + 1;
  sheet.getRange(row, 1).setValue(gameId);
  sheet.getRange(row, 2).setValue(new Date());
  
  // Write page init data
  if (gameData.pageInitData) {
    sheet.getRange(row, 3).setValue(JSON.stringify(gameData.pageInitData));
  }
  
  // Write extension data
  if (gameData.extensionData) {
    sheet.getRange(row, 4).setValue(JSON.stringify(gameData.extensionData));
  }
  
  Logger.log(`Data written to row ${row}`);
}

/**
 * Example: Process multiple games
 */
function processMultipleGames() {
  const gameIds = [
    'Bm5DQUPZ',
    'ANOTHER_GAME_ID',
    'YET_ANOTHER_ID'
  ];
  
  gameIds.forEach(gameId => {
    Logger.log(`\n--- Processing game: ${gameId} ---`);
    const data = fetchLichessGameWithExtensions(gameId);
    
    if (data) {
      // Process the data as needed
      // For example, extract specific fields:
      if (data.pageInitData?.game) {
        const game = data.pageInitData.game;
        Logger.log(`White: ${game.players?.white?.name || 'Unknown'}`);
        Logger.log(`Black: ${game.players?.black?.name || 'Unknown'}`);
        Logger.log(`Result: ${game.status?.name || 'Unknown'}`);
      }
    }
    
    // Be nice to the API - wait between requests
    Utilities.sleep(2000);
  });
}

/**
 * Test function
 */
function testFunction() {
  fetchLichessGameWithExtensions('Bm5DQUPZ');
}
