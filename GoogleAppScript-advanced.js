/**
 * Google Apps Script - Lichess Tools Data Extractor
 * This script provides helper functions to extract specific data
 * that the Lichess Tools extension would add
 */

const CLOUD_FUNCTION_URL = 'https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/fetchLichessGame';

/**
 * Main function to fetch game with Lichess Tools data
 */
function fetchLichessToolsData(gameId) {
  const rawData = fetchLichessGameWithExtensions(gameId);
  
  if (!rawData) {
    return null;
  }
  
  // Parse and organize the data
  const organized = {
    gameId: gameId,
    basicInfo: extractBasicInfo(rawData),
    moves: extractMoves(rawData),
    analysis: extractAnalysis(rawData),
    playerInfo: extractPlayerInfo(rawData),
    extensionData: extractExtensionSpecificData(rawData),
    timing: extractTiming(rawData),
    opening: extractOpening(rawData)
  };
  
  return organized;
}

/**
 * Extract basic game information
 */
function extractBasicInfo(data) {
  const pageInit = data.pageInitData;
  if (!pageInit || !pageInit.game) return null;
  
  const game = pageInit.game;
  
  return {
    id: game.id,
    variant: game.variant?.key || 'standard',
    speed: game.speed,
    rated: game.rated,
    initialFen: game.initialFen,
    status: game.status?.name,
    winner: game.winner,
    startedAt: game.createdAt,
    lastMoveAt: game.lastMoveAt
  };
}

/**
 * Extract moves with timestamps if available
 */
function extractMoves(data) {
  const moves = [];
  
  // From page init data
  if (data.pageInitData?.game?.moves) {
    const moveString = data.pageInitData.game.moves;
    const moveArray = moveString.split(' ');
    moveArray.forEach((move, index) => {
      moves.push({
        number: Math.floor(index / 2) + 1,
        color: index % 2 === 0 ? 'white' : 'black',
        move: move,
        san: move
      });
    });
  }
  
  // Add clock times if available
  if (data.pageInitData?.game?.clocks) {
    const clocks = data.pageInitData.game.clocks;
    clocks.forEach((clock, index) => {
      if (moves[index]) {
        moves[index].clockSeconds = clock;
        moves[index].clockTime = formatTime(clock);
      }
    });
  }
  
  // Add analysis from DOM if available
  if (data.dom?.evaluations) {
    data.dom.evaluations.forEach((eval, index) => {
      if (moves[index]) {
        moves[index].evaluation = eval.eval;
      }
    });
  }
  
  return moves;
}

/**
 * Extract analysis data
 */
function extractAnalysis(data) {
  const analysis = {
    available: false,
    computerAnalysis: null,
    accuracy: {}
  };
  
  if (data.pageInitData?.analysis) {
    analysis.available = true;
    analysis.computerAnalysis = data.pageInitData.analysis;
  }
  
  // Look for accuracy data that extensions might add
  if (data.localStorage) {
    Object.keys(data.localStorage).forEach(key => {
      if (key.includes('accuracy') || key.includes('analysis')) {
        try {
          analysis.accuracy[key] = JSON.parse(data.localStorage[key]);
        } catch (e) {
          analysis.accuracy[key] = data.localStorage[key];
        }
      }
    });
  }
  
  return analysis;
}

/**
 * Extract player information
 */
function extractPlayerInfo(data) {
  const players = {
    white: null,
    black: null
  };
  
  if (data.pageInitData?.game?.players) {
    const gamePlayers = data.pageInitData.game.players;
    
    if (gamePlayers.white) {
      players.white = {
        name: gamePlayers.white.name || gamePlayers.white.user?.name,
        rating: gamePlayers.white.rating,
        ratingDiff: gamePlayers.white.ratingDiff,
        userId: gamePlayers.white.user?.id,
        title: gamePlayers.white.user?.title
      };
    }
    
    if (gamePlayers.black) {
      players.black = {
        name: gamePlayers.black.name || gamePlayers.black.user?.name,
        rating: gamePlayers.black.rating,
        ratingDiff: gamePlayers.black.ratingDiff,
        userId: gamePlayers.black.user?.id,
        title: gamePlayers.black.user?.title
      };
    }
  }
  
  return players;
}

/**
 * Extract Lichess Tools specific data
 */
function extractExtensionSpecificData(data) {
  const extensionData = {
    found: false,
    tools: {},
    settings: {},
    enhancements: []
  };
  
  // Check for Lichess Tools specific keys
  if (data.extensionData) {
    Object.keys(data.extensionData).forEach(key => {
      const keyLower = key.toLowerCase();
      if (keyLower.includes('lichesstools') || keyLower.includes('lichess-tools')) {
        extensionData.found = true;
        extensionData.tools[key] = data.extensionData[key];
      }
    });
  }
  
  // Check localStorage for Lichess Tools settings
  if (data.localStorage) {
    Object.keys(data.localStorage).forEach(key => {
      if (key.includes('LichessTools') || key.includes('lichess-tools')) {
        extensionData.found = true;
        try {
          extensionData.settings[key] = JSON.parse(data.localStorage[key]);
        } catch (e) {
          extensionData.settings[key] = data.localStorage[key];
        }
      }
    });
  }
  
  // Check for enhanced DOM elements
  if (data.dom) {
    Object.keys(data.dom).forEach(key => {
      if (key.includes('tool') || key.includes('extension') || key.includes('enhanced')) {
        extensionData.enhancements.push({
          type: key,
          data: data.dom[key]
        });
      }
    });
  }
  
  return extensionData;
}

/**
 * Extract timing information
 */
function extractTiming(data) {
  const timing = {
    timeControl: null,
    clockInitial: null,
    clockIncrement: null,
    totalGameTime: null
  };
  
  if (data.pageInitData?.game?.clock) {
    const clock = data.pageInitData.game.clock;
    timing.clockInitial = clock.initial;
    timing.clockIncrement = clock.increment;
    timing.timeControl = `${clock.initial / 60}+${clock.increment}`;
  }
  
  if (data.pageInitData?.game?.createdAt && data.pageInitData?.game?.lastMoveAt) {
    const start = new Date(data.pageInitData.game.createdAt);
    const end = new Date(data.pageInitData.game.lastMoveAt);
    timing.totalGameTime = Math.floor((end - start) / 1000); // in seconds
  }
  
  return timing;
}

/**
 * Extract opening information
 */
function extractOpening(data) {
  const opening = {
    name: null,
    eco: null,
    ply: null
  };
  
  if (data.pageInitData?.game?.opening) {
    const op = data.pageInitData.game.opening;
    opening.name = op.name;
    opening.eco = op.eco;
    opening.ply = op.ply;
  }
  
  return opening;
}

/**
 * Helper: Format seconds to MM:SS
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Write organized data to sheet
 */
function writeOrganizedDataToSheet(gameId) {
  const data = fetchLichessToolsData(gameId);
  
  if (!data) {
    Logger.log('Failed to fetch game data');
    return;
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create or get sheets
  let basicSheet = ss.getSheetByName('Basic Info') || ss.insertSheet('Basic Info');
  let movesSheet = ss.getSheetByName('Moves') || ss.insertSheet('Moves');
  let playersSheet = ss.getSheetByName('Players') || ss.insertSheet('Players');
  
  // Write basic info
  writeBasicInfoToSheet(basicSheet, data.basicInfo, data.timing, data.opening);
  
  // Write moves
  writeMovesToSheet(movesSheet, data.moves, gameId);
  
  // Write player info
  writePlayersToSheet(playersSheet, data.playerInfo, gameId);
  
  Logger.log('Data written to sheets successfully!');
}

function writeBasicInfoToSheet(sheet, basicInfo, timing, opening) {
  const row = sheet.getLastRow() + 1;
  
  sheet.getRange(row, 1).setValue(basicInfo.id);
  sheet.getRange(row, 2).setValue(basicInfo.variant);
  sheet.getRange(row, 3).setValue(basicInfo.speed);
  sheet.getRange(row, 4).setValue(basicInfo.rated ? 'Rated' : 'Casual');
  sheet.getRange(row, 5).setValue(basicInfo.status);
  sheet.getRange(row, 6).setValue(basicInfo.winner || 'Draw');
  sheet.getRange(row, 7).setValue(timing.timeControl);
  sheet.getRange(row, 8).setValue(opening.name);
  sheet.getRange(row, 9).setValue(opening.eco);
}

function writeMovesToSheet(sheet, moves, gameId) {
  if (moves.length === 0) return;
  
  const startRow = sheet.getLastRow() + 1;
  
  moves.forEach((move, index) => {
    const row = startRow + index;
    sheet.getRange(row, 1).setValue(gameId);
    sheet.getRange(row, 2).setValue(move.number);
    sheet.getRange(row, 3).setValue(move.color);
    sheet.getRange(row, 4).setValue(move.san);
    sheet.getRange(row, 5).setValue(move.clockTime || '');
    sheet.getRange(row, 6).setValue(move.evaluation || '');
  });
}

function writePlayersToSheet(sheet, players, gameId) {
  const row = sheet.getLastRow() + 1;
  
  // White player
  if (players.white) {
    sheet.getRange(row, 1).setValue(gameId);
    sheet.getRange(row, 2).setValue('White');
    sheet.getRange(row, 3).setValue(players.white.name);
    sheet.getRange(row, 4).setValue(players.white.rating);
    sheet.getRange(row, 5).setValue(players.white.ratingDiff);
  }
  
  // Black player
  if (players.black) {
    sheet.getRange(row + 1, 1).setValue(gameId);
    sheet.getRange(row + 1, 2).setValue('Black');
    sheet.getRange(row + 1, 3).setValue(players.black.name);
    sheet.getRange(row + 1, 4).setValue(players.black.rating);
    sheet.getRange(row + 1, 5).setValue(players.black.ratingDiff);
  }
}

/**
 * Example: Analyze multiple games
 */
function analyzeMultipleGames() {
  const gameIds = [
    'Bm5DQUPZ',
    'GAME_ID_2',
    'GAME_ID_3'
  ];
  
  gameIds.forEach((gameId, index) => {
    Logger.log(`Processing game ${index + 1}/${gameIds.length}: ${gameId}`);
    
    try {
      writeOrganizedDataToSheet(gameId);
      Utilities.sleep(2000); // Be nice to the API
    } catch (error) {
      Logger.log(`Error processing ${gameId}: ${error}`);
    }
  });
  
  Logger.log('Batch processing complete!');
}

/**
 * Test function
 */
function testLichessTools() {
  const data = fetchLichessToolsData('Bm5DQUPZ');
  Logger.log(JSON.stringify(data, null, 2));
}
