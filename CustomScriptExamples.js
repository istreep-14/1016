/**
 * Example Custom Script Injection
 * This shows how to inject JavaScript that simulates extension behavior
 * Use this with the advanced Cloud Function (index-advanced.js)
 */

// Example 1: Simple data extraction script
const simpleExtractionScript = `
(function() {
  // Add custom data to window object
  window.__customLichessData = {
    timestamp: new Date().toISOString(),
    moves: [],
    evaluations: []
  };
  
  // Extract moves
  const moveElements = document.querySelectorAll('.moves move');
  moveElements.forEach(move => {
    window.__customLichessData.moves.push(move.textContent);
  });
  
  // Extract evaluations
  const evalElements = document.querySelectorAll('[data-eval]');
  evalElements.forEach(eval => {
    window.__customLichessData.evaluations.push(eval.getAttribute('data-eval'));
  });
  
  // Add a marker that this script ran
  window.__customLichessData.scriptExecuted = true;
  
  console.log('Custom extraction complete', window.__customLichessData);
})();
`;

// Example 2: Calculate accuracy (simplified version of what Lichess Tools might do)
const accuracyCalculationScript = `
(function() {
  window.__lichessAccuracy = {
    white: { total: 0, count: 0, accuracy: 0 },
    black: { total: 0, count: 0, accuracy: 0 }
  };
  
  // Get all evaluation elements
  const evalElements = document.querySelectorAll('[data-eval]');
  let previousEval = 0;
  
  evalElements.forEach((elem, index) => {
    const evalValue = parseFloat(elem.getAttribute('data-eval'));
    if (!isNaN(evalValue)) {
      const color = index % 2 === 0 ? 'white' : 'black';
      const evalDiff = Math.abs(evalValue - previousEval);
      
      // Simplified accuracy: 100 - (eval loss * 10)
      const moveAccuracy = Math.max(0, 100 - (evalDiff * 10));
      
      window.__lichessAccuracy[color].total += moveAccuracy;
      window.__lichessAccuracy[color].count += 1;
      
      previousEval = evalValue;
    }
  });
  
  // Calculate averages
  if (window.__lichessAccuracy.white.count > 0) {
    window.__lichessAccuracy.white.accuracy = 
      window.__lichessAccuracy.white.total / window.__lichessAccuracy.white.count;
  }
  if (window.__lichessAccuracy.black.count > 0) {
    window.__lichessAccuracy.black.accuracy = 
      window.__lichessAccuracy.black.total / window.__lichessAccuracy.black.count;
  }
  
  console.log('Accuracy calculated', window.__lichessAccuracy);
})();
`;

// Example 3: Enhanced move analysis
const moveAnalysisScript = `
(function() {
  window.__lichessMoveAnalysis = {
    moves: [],
    blunders: [],
    mistakes: [],
    inaccuracies: [],
    brilliant: [],
    best: []
  };
  
  const evalElements = document.querySelectorAll('[data-eval]');
  const moveElements = document.querySelectorAll('.moves move');
  
  let previousEval = 0;
  
  evalElements.forEach((evalElem, index) => {
    const evalValue = parseFloat(evalElem.getAttribute('data-eval'));
    const move = moveElements[index] ? moveElements[index].textContent : '';
    
    if (!isNaN(evalValue)) {
      const evalDiff = evalValue - previousEval;
      const color = index % 2 === 0 ? 'white' : 'black';
      
      // Categorize moves (simplified)
      const moveData = {
        number: Math.floor(index / 2) + 1,
        color: color,
        move: move,
        eval: evalValue,
        evalDiff: evalDiff,
        category: 'good'
      };
      
      // Categorization logic (for perspective of player who moved)
      const effectiveEvalDiff = color === 'white' ? -evalDiff : evalDiff;
      
      if (effectiveEvalDiff < -3) {
        moveData.category = 'blunder';
        window.__lichessMoveAnalysis.blunders.push(moveData);
      } else if (effectiveEvalDiff < -1.5) {
        moveData.category = 'mistake';
        window.__lichessMoveAnalysis.mistakes.push(moveData);
      } else if (effectiveEvalDiff < -0.5) {
        moveData.category = 'inaccuracy';
        window.__lichessMoveAnalysis.inaccuracies.push(moveData);
      } else if (effectiveEvalDiff > 1) {
        moveData.category = 'brilliant';
        window.__lichessMoveAnalysis.brilliant.push(moveData);
      } else if (effectiveEvalDiff > 0) {
        moveData.category = 'best';
        window.__lichessMoveAnalysis.best.push(moveData);
      }
      
      window.__lichessMoveAnalysis.moves.push(moveData);
      previousEval = evalValue;
    }
  });
  
  // Summary statistics
  window.__lichessMoveAnalysis.summary = {
    totalMoves: window.__lichessMoveAnalysis.moves.length,
    blunders: window.__lichessMoveAnalysis.blunders.length,
    mistakes: window.__lichessMoveAnalysis.mistakes.length,
    inaccuracies: window.__lichessMoveAnalysis.inaccuracies.length,
    brilliant: window.__lichessMoveAnalysis.brilliant.length,
    best: window.__lichessMoveAnalysis.best.length
  };
  
  console.log('Move analysis complete', window.__lichessMoveAnalysis.summary);
})();
`;

// Example 4: Opening repertoire tracker
const openingTrackerScript = `
(function() {
  window.__lichessOpeningTracker = {
    opening: {},
    firstMoves: []
  };
  
  // Get opening info from page init data
  const pageInitScript = document.getElementById('page-init-data');
  if (pageInitScript) {
    try {
      const data = JSON.parse(pageInitScript.textContent);
      if (data.game && data.game.opening) {
        window.__lichessOpeningTracker.opening = {
          name: data.game.opening.name,
          eco: data.game.opening.eco,
          ply: data.game.opening.ply
        };
      }
    } catch (e) {
      console.error('Error parsing opening data', e);
    }
  }
  
  // Get first N moves
  const moveElements = document.querySelectorAll('.moves move');
  const firstMovesCount = Math.min(10, moveElements.length);
  
  for (let i = 0; i < firstMovesCount; i++) {
    window.__lichessOpeningTracker.firstMoves.push(moveElements[i].textContent);
  }
  
  console.log('Opening tracked', window.__lichessOpeningTracker);
})();
`;

/**
 * Google Apps Script function to use custom scripts
 */
function fetchWithCustomScript(gameId, scriptType = 'simple') {
  const scripts = {
    'simple': simpleExtractionScript,
    'accuracy': accuracyCalculationScript,
    'analysis': moveAnalysisScript,
    'opening': openingTrackerScript,
    'all': simpleExtractionScript + accuracyCalculationScript + moveAnalysisScript + openingTrackerScript
  };
  
  const script = scripts[scriptType] || scripts.simple;
  
  try {
    // Call the advanced Cloud Function with custom script
    const options = {
      'method': 'post',
      'contentType': 'application/json',
      'payload': JSON.stringify({
        gameId: gameId,
        customScript: script,
        waitTime: 5000  // Wait 5 seconds for script to execute
      }),
      'muteHttpExceptions': true
    };
    
    const response = UrlFetchApp.fetch(CLOUD_FUNCTION_URL, options);
    const jsonResponse = JSON.parse(response.getContentText());
    
    if (jsonResponse.success) {
      Logger.log('Custom script executed successfully!');
      
      // Log the custom data
      if (jsonResponse.data.extensionData.__customLichessData) {
        Logger.log('Custom Lichess Data:');
        Logger.log(JSON.stringify(jsonResponse.data.extensionData.__customLichessData, null, 2));
      }
      
      if (jsonResponse.data.extensionData.__lichessAccuracy) {
        Logger.log('Accuracy Data:');
        Logger.log(JSON.stringify(jsonResponse.data.extensionData.__lichessAccuracy, null, 2));
      }
      
      if (jsonResponse.data.extensionData.__lichessMoveAnalysis) {
        Logger.log('Move Analysis:');
        Logger.log(JSON.stringify(jsonResponse.data.extensionData.__lichessMoveAnalysis.summary, null, 2));
      }
      
      return jsonResponse.data;
    } else {
      Logger.log('Error: ' + jsonResponse.error);
      return null;
    }
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return null;
  }
}

/**
 * Example: Fetch and analyze a game
 */
function analyzeGameWithCustomScripts() {
  const gameId = 'Bm5DQUPZ';
  
  Logger.log('Fetching game with custom analysis scripts...');
  const data = fetchWithCustomScript(gameId, 'all');
  
  if (data && data.extensionData) {
    // Extract the custom data
    const accuracy = data.extensionData.__lichessAccuracy;
    const analysis = data.extensionData.__lichessMoveAnalysis;
    
    if (accuracy) {
      Logger.log(`\nWhite Accuracy: ${accuracy.white.accuracy.toFixed(2)}%`);
      Logger.log(`Black Accuracy: ${accuracy.black.accuracy.toFixed(2)}%`);
    }
    
    if (analysis && analysis.summary) {
      Logger.log(`\nMove Analysis Summary:`);
      Logger.log(`  Blunders: ${analysis.summary.blunders}`);
      Logger.log(`  Mistakes: ${analysis.summary.mistakes}`);
      Logger.log(`  Inaccuracies: ${analysis.summary.inaccuracies}`);
      Logger.log(`  Brilliant moves: ${analysis.summary.brilliant}`);
      Logger.log(`  Best moves: ${analysis.summary.best}`);
    }
  }
}

/**
 * Example: Write custom analysis to sheet
 */
function writeCustomAnalysisToSheet(gameId) {
  const data = fetchWithCustomScript(gameId, 'all');
  
  if (!data) {
    Logger.log('Failed to fetch data');
    return;
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = sheet.getLastRow() + 1;
  
  // Write basic info
  sheet.getRange(row, 1).setValue(gameId);
  sheet.getRange(row, 2).setValue(new Date());
  
  // Write accuracy
  if (data.extensionData.__lichessAccuracy) {
    const acc = data.extensionData.__lichessAccuracy;
    sheet.getRange(row, 3).setValue(acc.white.accuracy.toFixed(2));
    sheet.getRange(row, 4).setValue(acc.black.accuracy.toFixed(2));
  }
  
  // Write move analysis
  if (data.extensionData.__lichessMoveAnalysis) {
    const summary = data.extensionData.__lichessMoveAnalysis.summary;
    sheet.getRange(row, 5).setValue(summary.blunders);
    sheet.getRange(row, 6).setValue(summary.mistakes);
    sheet.getRange(row, 7).setValue(summary.inaccuracies);
    sheet.getRange(row, 8).setValue(summary.brilliant);
  }
  
  Logger.log(`Data written to row ${row}`);
}

// Export scripts as strings for easy copying
const SCRIPTS = {
  simple: simpleExtractionScript,
  accuracy: accuracyCalculationScript,
  analysis: moveAnalysisScript,
  opening: openingTrackerScript
};
