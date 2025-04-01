let squareSize = 50, bPieces = [], wPieces = [], selectedSquare = null, validMoves = [], board = [];
let currentPlayer = 'white', isComputerThinking = false, gameStatus = 'playing';
let statusMessage = null, statusTimer = 0, statusDuration = 180;
let movedPieces = new Set();

let aiAlgorithm = 'greedy'; // Can be 'greedy', 'minmax', 'negamax', or 'alphabeta'
let searchDepth = 3; // Adjust based on desired AI strength

const pieceValues = {
    0: 5,  // Rook
    1: 3,  // Knight
    2: 3,  // Bishop
    3: 9,  // Queen
    4: 100, // King
    5: 3,  // Bishop
    6: 3,  // Knight
    7: 5,  // Rook
    8: 1   // Pawn
};


function preload() {
    let pieceOrder = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'];
    pieceOrder.forEach(piece => {
        bPieces.push(loadImage(`Images/b${piece}.png`));
        wPieces.push(loadImage(`Images/w${piece}.png`));
    });
}
function setup() {
    createCanvas(400, 400);
    
    // Remove algorithm selector since we're using all algorithms
    
    // Update depth slider label and position
    let difficultyLabel = createElement('p', 'AI Difficulty:');
    difficultyLabel.position(420, 50);
    
    let depthSlider = createSlider(1, 4, 3, 1);
    depthSlider.position(420, 80);
    depthSlider.input(() => {
        searchDepth = depthSlider.value();
    });
    
    // Add difficulty level indicator
    let difficultyText = createElement('p', 'Current Level: Normal');
    difficultyText.position(420, 100);
    
    depthSlider.input(() => {
        searchDepth = depthSlider.value();
        let level;
        switch(searchDepth) {
            case 1: level = 'Easy'; break;
            case 2: level = 'Normal'; break;
            case 3: level = 'Hard'; break;
            case 4: level = 'Expert'; break;
        }
        difficultyText.html('Current Level: ' + level);
    });
    
    initializeBoard();
}

function initializeBoard() {
    board = Array(8).fill().map(() => Array(8).fill(null));
    movedPieces.clear();
    for (let i = 0; i < 8; i++) {
        board[0][i] = { type: i, color: 'black' };
        board[7][i] = { type: i, color: 'white' };
        board[1][i] = { type: 8, color: 'black' };
        board[6][i] = { type: 8, color: 'white' };
    }
}

function draw() {
    board.forEach((row, i) => row.forEach((_, j) => {
        fill((i + j) % 2 === 0 ? 230 : 100);
        rect(j * squareSize, i * squareSize, squareSize, squareSize);
    }));

    validMoves.forEach(move => {
        fill(144, 238, 144, 150);
        rect(move[0] * squareSize, move[1] * squareSize, squareSize, squareSize);
    });

    if (selectedSquare) {
        fill(135, 206, 315, 150);
        rect(selectedSquare[0] * squareSize, selectedSquare[1] * squareSize, squareSize, squareSize);
    }

    if (currentPlayer === 'white' && !isComputerThinking) {
        let x = Math.floor(mouseX / squareSize), y = Math.floor(mouseY / squareSize);
        if (x >= 0 && x < 8 && y >= 0 && y < 8) {
            fill(135, 206, 235, 150);
            rect(x * squareSize, y * squareSize, squareSize, squareSize);
        }
    }

    board.forEach((row, y) => row.forEach((piece, x) => {
        if (piece) {
            image(piece.color === 'black' ? bPieces[piece.type] : wPieces[piece.type], 
                  x * squareSize, y * squareSize);
        }
    }));

    textAlign(CENTER, CENTER);
    fill(0);
    if (gameStatus !== 'playing') {
        if (gameStatus === 'Stalemate') {
            fill(112, 85, 47);
            rect(50, height/2 - 30, 300, 60);
            fill(0);
            textSize(48);
            text('STALEMATE', width/2, height/2);
        } else {
            fill(112, 85, 47);
            rect(50, height/2 - 60, 300, 120);
            fill(0);
            textSize(32);
            let winner = gameStatus.toUpperCase();
            text(winner, width/2, height/2 - 30);
            text('BY', width/2, height/2);
            text('CHECKMATE', width/2, height/2 + 30);
        }
    } else if (statusMessage && statusTimer < statusDuration) {
        fill(112, 85, 47);
        rect(50, height/2 - 20, 300, 40);
        fill(0);
        textSize(32);
        text(statusMessage, width/2, height/2);
        statusTimer++;
        if (statusTimer >= statusDuration) {
            statusMessage = null;
            statusTimer = 0;
        }
    }
}

function getValidMoves(x, y) {
    let moves = [], piece = board[y][x];
    if (!piece) return moves;

    if (piece.type === 8) {
        let dir = piece.color === 'white' ? -1 : 1;
        if (!board[y + dir]?.[x]) {
            moves.push([x, y + dir]);
            if (((piece.color === 'white' && y === 6) || (piece.color === 'black' && y === 1)) && 
                !board[y + (2 * dir)]?.[x]) {
                moves.push([x, y + (2 * dir)]);
            }
        }
        [-1, 1].forEach(dx => {
            if (board[y + dir]?.[x + dx]?.color !== piece.color && board[y + dir]?.[x + dx]) {
                moves.push([x + dx, y + dir]);
            }
        });
        return moves;
    }

    let directions = piece.type === 1 || piece.type === 6 ? 
        [[2,1], [2,-1], [-2,1], [-2,-1], [1,2], [1,-2], [-1,2], [-1,-2]] :
        piece.type === 0 || piece.type === 7 ? [[0,1], [1,0], [0,-1], [-1,0]] :
        piece.type === 2 || piece.type === 5 ? [[1,1], [-1,1], [1,-1], [-1,-1]] :
        [[0,1], [1,0], [0,-1], [-1,0], [1,1], [-1,1], [1,-1], [-1,-1]];

    if (piece.type === 1 || piece.type === 6) {
        return directions.filter(([dx, dy]) => {
            let newX = x + dx, newY = y + dy;
            return newX >= 0 && newX < 8 && newY >= 0 && newY < 8 && 
                   (!board[newY][newX] || board[newY][newX].color !== piece.color);
        }).map(([dx, dy]) => [x + dx, y + dy]);
    }

    let maxSteps = piece.type === 4 ? 1 : 7;
    directions.forEach(([dx, dy]) => {
        for (let step = 1; step <= maxSteps; step++) {
            let newX = x + (dx * step), newY = y + (dy * step);
            if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) break;
            if (!board[newY][newX]) {
                moves.push([newX, newY]);
                continue;
            }
            if (board[newY][newX].color !== piece.color) moves.push([newX, newY]);
            break;
        }
    });

    if (piece.type === 4 && !movedPieces.has(`${x},${y}`)) {
        if (!movedPieces.has(`7,${y}`) && !board[y][5] && !board[y][6] && 
            board[y][7]?.type === 7 && board[y][7]?.color === piece.color) {
            moves.push([6, y, 'kingside']);
        }
        if (!movedPieces.has(`0,${y}`) && !board[y][1] && !board[y][2] && 
            !board[y][3] && board[y][0]?.type === 0 && board[y][0]?.color === piece.color) {
            moves.push([2, y, 'queenside']);
        }
    }
    return moves;
}

function isSquareUnderAttack(x, y, attackingColor) {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board[i][j]?.color === attackingColor && 
                getValidMoves(j, i).some(move => move[0] === x && move[1] === y)) {
                return true;
            }
        }
    }
    return false;
}

function mousePressed() {
    if (currentPlayer !== 'white' || isComputerThinking || gameStatus !== 'playing') return;
    let x = Math.floor(mouseX / squareSize), y = Math.floor(mouseY / squareSize);
    if (x < 0 || x >= 8 || y < 0 || y >= 8) return;

    if (selectedSquare && validMoves.some(m => m[0] === x && m[1] === y)) {
        makeMove(selectedSquare[0], selectedSquare[1], x, y);
        selectedSquare = null;
        validMoves = [];
        if (gameStatus === 'playing') {
            currentPlayer = 'black';
            setTimeout(makeComputerMove, 500);
        }
        return;
    }
    
    if (board[y][x]?.color === 'white') {
        selectedSquare = [x, y];
        validMoves = getValidMoves(x, y);
    } else {
        selectedSquare = null;
        validMoves = [];
    }
}

function makeMove(fromX, fromY, toX, toY) {
    let piece = board[fromY][fromX];
    let moveKey = `${fromX},${fromY}`;
    
    if (piece.type === 4 && Math.abs(toX - fromX) === 2) {
        let rookX = toX > fromX ? 7 : 0;
        let newRookX = toX > fromX ? 5 : 3;
        board[toY][newRookX] = board[fromY][rookX];
        board[fromY][rookX] = null;
        movedPieces.add(`${rookX},${fromY}`);
    }
    
    movedPieces.add(moveKey);
    if (piece.type === 0 || piece.type === 7) movedPieces.add(`${toX},${toY}`);
    
    board[toY][toX] = piece;
    board[fromY][fromX] = null;
    checkGameStatus();
}


function makeComputerMove() {
    isComputerThinking = true;
    
    // Get moves from all algorithms
    let moves = {
        greedy: findGreedyMove('black'),
        minmax: findMinMaxMove('black', searchDepth),
        negamax: findNegamaxMove('black', searchDepth),
        alphabeta: findAlphaBetaMove('black', searchDepth)
    };
    
    // Evaluate each move's strength
    let moveStrengths = {};
    for (let algo in moves) {
        if (!moves[algo]) continue;
        
        // Make temporary move
        let fromPiece = board[moves[algo].from[1]][moves[algo].from[0]];
        let toPiece = board[moves[algo].to[1]][moves[algo].to[0]];
        board[moves[algo].to[1]][moves[algo].to[0]] = fromPiece;
        board[moves[algo].from[1]][moves[algo].from[0]] = null;
        
        // Evaluate position
        moveStrengths[algo] = evaluatePosition('black');
        
        // Undo move
        board[moves[algo].from[1]][moves[algo].from[0]] = fromPiece;
        board[moves[algo].to[1]][moves[algo].to[0]] = toPiece;
    }
    
    // Sort algorithms by move strength
    let sortedAlgos = Object.entries(moveStrengths)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
    
    // Select move based on difficulty (searchDepth)
    // Lower depth = more random/weaker moves, Higher depth = stronger moves
    let selectedAlgo;
    let randomFactor = (5 - searchDepth) / 4; // Convert depth 1-4 to randomness 1-0.25
    
    if (Math.random() < randomFactor) {
        // Choose a random algorithm with bias towards weaker moves
        let index = Math.floor(Math.random() * sortedAlgos.length);
        selectedAlgo = sortedAlgos[index];
    } else {
        // Choose the strongest move
        selectedAlgo = sortedAlgos[0];
    }
    
    // Make the selected move
    let selectedMove = moves[selectedAlgo];
    if (selectedMove) {
        makeMove(selectedMove.from[0], selectedMove.from[1], 
                selectedMove.to[0], selectedMove.to[1]);
        
        // Update status message to show which algorithm was used
        statusMessage = `AI used ${selectedAlgo.toUpperCase()}`;
        statusTimer = 0;
    }
    
    currentPlayer = 'white';
    isComputerThinking = false;
}


function checkGameStatus() {
    let kings = { white: null, black: null };
    board.forEach((row, y) => row.forEach((piece, x) => {
        if (piece?.type === 4) kings[piece.color] = [x, y];
    }));
    
    if (!kings.white) gameStatus = 'Black Wins';
    else if (!kings.black) gameStatus = 'White Wins';
    else {
        let hasValidMoves = false;
        outer: for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (board[y][x]?.color === currentPlayer && getValidMoves(x, y).length) {
                    hasValidMoves = true;
                    break outer;
                }
            }
        }
        
        let kingPos = kings[currentPlayer];
        let isInCheck = isSquareUnderAttack(kingPos[0], kingPos[1], 
                                          currentPlayer === 'white' ? 'black' : 'white');
        
        if (!hasValidMoves) {
            if (isInCheck) {
                gameStatus = currentPlayer === 'white' ? 'Black Wins' : 'White Wins';
            } else {
                gameStatus = 'Stalemate';
            }
        } else if (isInCheck) {
            statusMessage = `${currentPlayer.toUpperCase()} IN CHECK`;
            statusTimer = 0;
        }
    }
}


function evaluatePosition(color) {
    let score = 0;
    
    // Material evaluation
    board.forEach(row => row.forEach(piece => {
        if (!piece) return;
        let value = pieceValues[piece.type];
        if (piece.color === color) {
            score += value;
        } else {
            score -= value;
        }
    }));
    
    // Position evaluation
    board.forEach((row, y) => row.forEach((piece, x) => {
        if (!piece) return;
        
        // Center control bonus
        if ((x === 3 || x === 4) && (y === 3 || y === 4)) {
            if (piece.color === color) {
                score += 0.3;
            } else {
                score -= 0.3;
            }
        }
        
        // Piece development bonus
        if (piece.type !== 8 && piece.type !== 4) {
            if (piece.color === 'white') {
                if (piece.color === color) {
                    score += (7 - y) * 0.1;
                } else {
                    score -= (7 - y) * 0.1;
                }
            } else {
                if (piece.color === color) {
                    score += y * 0.1;
                } else {
                    score -= y * 0.1;
                }
            }
        }
    }));
    
    return score;
}


function findGreedyMove(color) {
    let bestMove = null;
    let bestScore = -Infinity;
    
    board.forEach((row, y) => row.forEach((piece, x) => {
        if (piece?.color === color) {
            getValidMoves(x, y).forEach(move => {
                // Make temporary move
                let tempPiece = board[move[1]][move[0]];
                board[move[1]][move[0]] = piece;
                board[y][x] = null;
                
                // Evaluate position
                let score = evaluatePosition(color);
                
                // Add randomness to prevent repetitive play
                score += Math.random() * 0.2;
                
                // Undo move
                board[y][x] = piece;
                board[move[1]][move[0]] = tempPiece;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { from: [x, y], to: move };
                }
            });
        }
    }));
    
    return bestMove;
}

// Minimax Algorithm
function findMinMaxMove(color, depth) {
    let bestMove = null;
    let bestScore = -Infinity;
    
    board.forEach((row, y) => row.forEach((piece, x) => {
        if (piece?.color === color) {
            getValidMoves(x, y).forEach(move => {
                // Make move
                let tempPiece = board[move[1]][move[0]];
                board[move[1]][move[0]] = piece;
                board[y][x] = null;
                
                // Evaluate position
                let score = minmax(depth - 1, false, color);
                
                // Undo move
                board[y][x] = piece;
                board[move[1]][move[0]] = tempPiece;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { from: [x, y], to: move };
                }
            });
        }
    }));
    
    return bestMove;
}

function minmax(depth, isMaximizing, originalColor) {
    if (depth === 0) {
        return evaluatePosition(originalColor);
    }
    
    let currentColor = isMaximizing ? originalColor : (originalColor === 'white' ? 'black' : 'white');
    let bestScore = isMaximizing ? -Infinity : Infinity;
    
    board.forEach((row, y) => row.forEach((piece, x) => {
        if (piece?.color === currentColor) {
            getValidMoves(x, y).forEach(move => {
                // Make move
                let tempPiece = board[move[1]][move[0]];
                board[move[1]][move[0]] = piece;
                board[y][x] = null;
                
                // Recursive evaluation
                let score = minmax(depth - 1, !isMaximizing, originalColor);
                
                // Undo move
                board[y][x] = piece;
                board[move[1]][move[0]] = tempPiece;
                
                bestScore = isMaximizing ? 
                    Math.max(score, bestScore) : 
                    Math.min(score, bestScore);
            });
        }
    }));
    
    return bestScore;
}

// Negamax Algorithm
function findNegamaxMove(color, depth) {
    let bestMove = null;
    let bestScore = -Infinity;
    
    board.forEach((row, y) => row.forEach((piece, x) => {
        if (piece?.color === color) {
            getValidMoves(x, y).forEach(move => {
                // Make move
                let tempPiece = board[move[1]][move[0]];
                board[move[1]][move[0]] = piece;
                board[y][x] = null;
                
                // Evaluate position
                let score = -negamax(depth - 1, color === 'white' ? 'black' : 'white');
                
                // Undo move
                board[y][x] = piece;
                board[move[1]][move[0]] = tempPiece;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { from: [x, y], to: move };
                }
            });
        }
    }));
    
    return bestMove;
}

function negamax(depth, color) {
    if (depth === 0) {
        return evaluatePosition(color);
    }
    
    let bestScore = -Infinity;
    
    board.forEach((row, y) => row.forEach((piece, x) => {
        if (piece?.color === color) {
            getValidMoves(x, y).forEach(move => {
                // Make move
                let tempPiece = board[move[1]][move[0]];
                board[move[1]][move[0]] = piece;
                board[y][x] = null;
                
                // Recursive evaluation
                let score = -negamax(depth - 1, color === 'white' ? 'black' : 'white');
                
                // Undo move
                board[y][x] = piece;
                board[move[1]][move[0]] = tempPiece;
                
                bestScore = Math.max(score, bestScore);
            });
        }
    }));
    
    return bestScore;
}

// Alpha-Beta Pruning
function findAlphaBetaMove(color, depth) {
    let bestMove = null;
    let alpha = -Infinity;
    let beta = Infinity;
    let bestScore = -Infinity;
    
    board.forEach((row, y) => row.forEach((piece, x) => {
        if (piece?.color === color) {
            getValidMoves(x, y).forEach(move => {
                // Make move
                let tempPiece = board[move[1]][move[0]];
                board[move[1]][move[0]] = piece;
                board[y][x] = null;
                
                // Evaluate position
                let score = -alphaBeta(depth - 1, -beta, -alpha, color === 'white' ? 'black' : 'white');
                
                // Undo move
                board[y][x] = piece;
                board[move[1]][move[0]] = tempPiece;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { from: [x, y], to: move };
                }
                alpha = Math.max(alpha, score);
            });
        }
    }));
    
    return bestMove;
}

function alphaBeta(depth, alpha, beta, color) {
    if (depth === 0) {
        return evaluatePosition(color);
    }
    
    let bestScore = -Infinity;
    
    board.forEach((row, y) => row.forEach((piece, x) => {
        if (piece?.color === color) {
            getValidMoves(x, y).forEach(move => {
                // Make move
                let tempPiece = board[move[1]][move[0]];
                board[move[1]][move[0]] = piece;
                board[y][x] = null;
                
                // Recursive evaluation
                let score = -alphaBeta(depth - 1, -beta, -alpha, color === 'white' ? 'black' : 'white');
                
                // Undo move
                board[y][x] = piece;
                board[move[1]][move[0]] = tempPiece;
                
                bestScore = Math.max(score, bestScore);
                alpha = Math.max(alpha, score);
                
                if (alpha >= beta) {
                    return bestScore;
                }
            });
        }
    }));
    
    return bestScore;
}
