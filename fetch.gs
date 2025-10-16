function fetchLichessGame() {
  const gameId = "Bm5DQUPZ"; // Your game ID
  const url = `https://lichess.org/${gameId}`;
  
  try {
    const response = UrlFetchApp.fetch(url, {
      'muteHttpExceptions': true,
      'headers': {
        'User-Agent': 'Mozilla/5.0 (compatible; GoogleAppsScript)'
      }
    });
    
    const html = response.getContentText();
    const statusCode = response.getResponseCode();
    
    Logger.log(`Status: ${statusCode}`);
    Logger.log(`HTML length: ${html.length}`);
    
    // Extract the JSON data from the page
    const jsonData = extractGameData(html);
    if (jsonData) {
      Logger.log("Game data extracted successfully!");
      Logger.log(JSON.stringify(jsonData, null, 2));
    }
    
    return html;
    
  } catch (error) {
    Logger.log(`Error fetching game: ${error.toString()}`);
    return null;
  }
}

function extractGameData(html) {
  // The game data is in a script tag with id="page-init-data"
  const regex = /<script[^>]*id="page-init-data"[^>]*>([\s\S]*?)<\/script>/i;
  const match = html.match(regex);
  
  if (match && match[1]) {
    try {
      const jsonData = JSON.parse(match[1].trim());
      return jsonData;
    } catch (e) {
      Logger.log(`Error parsing JSON: ${e.toString()}`);
      return null;
    }
  }
  return null;
}

// Example: Get specific game information
function getGameInfo() {
  const gameId = "Bm5DQUPZ";
  const url = `https://lichess.org/${gameId}`;
  
  const response = UrlFetchApp.fetch(url);
  const html = response.getContentText();
  const gameData = extractGameData(html);
  
  if (gameData && gameData.data) {
    const game = gameData.data.game;
    const white = gameData.data.player;
    const black = gameData.data.opponent;
    
    Logger.log(`White: ${white.user.username} (${white.rating})`);
    Logger.log(`Black: ${black.user.username} (${black.rating})`);
    Logger.log(`Result: ${game.winner || 'Draw'}`);
    Logger.log(`Speed: ${game.speed}`);
    Logger.log(`Opening: ${game.opening.name}`);
    Logger.log(`Total moves: ${game.turns}`);
  }
  
  return gameData;
}
