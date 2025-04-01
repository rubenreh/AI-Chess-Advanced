let squareSize = 50, bPieces = [], wPieces = [], selectedSquare = null, validMoves = [], board = [];
let currentPlayer = 'white', gameStatus = 'playing';
let statusMessage = null, statusTimer = 0, statusDuration = 180;
let turnMessage = null, turnTimer = 0, turnDuration = 120;
let movedPieces = new Set();


function preload() {
    const pieceOrder = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R', 'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'];
    pieceOrder.forEach(p => {
        bPieces.push(loadImage(`Images/b${p}.png`));
        wPieces.push(loadImage(`Images/w${p}.png`));
    });
}

function setup() {
    createCanvas(400, 400);  // Create 8x8 chess board canvas
    initializeBoard();  // Set up initial board state
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
    
    turnMessage = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
    turnTimer = 0;
}

function draw() {
    drawBoard();
    validMoves.forEach(m => drawHighlight(m[0], m[1], 144, 238, 144));
    if (selectedSquare) drawHighlight(selectedSquare[0], selectedSquare[1], 135, 206, 315);
    
    const mousePos = getMousePosition();
    if (isValidPosition(mousePos)) drawHighlight(mousePos.x, mousePos.y, 135, 206, 235);
    
    drawPieces();
    drawUI();
}

function drawBoard() {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            fill((i + j) % 2 === 0 ? 230 : 100);
            rect(i * squareSize, j * squareSize, squareSize, squareSize);
        }
    }
}

function drawPieces() {
    board.forEach((row, y) => {
        row.forEach((piece, x) => {
            if (piece) {
                const img = piece.color === 'black' ? bPieces[piece.type] : wPieces[piece.type];
                image(img, x * squareSize, y * squareSize);
            }
        });
    });
}

function drawHighlight(x, y, r, g, b) {
    fill(r, g, b, 150);
    rect(x * squareSize, y * squareSize, squareSize, squareSize);
}

function drawUI() {
    if (gameStatus !== 'playing') {
        drawMessage(gameStatus === 'Stalemate' ? 'Stalemate' : 
            `${gameStatus.split(' ')[0]} Wins!\nby Checkmate`, true);
    } else if (statusMessage && statusTimer < statusDuration) {
        drawMessage(statusMessage);
        if (++statusTimer >= statusDuration) {
            statusMessage = null;
            statusTimer = 0;
        }
    } else if (turnMessage && turnTimer < turnDuration) {
        drawMessage(turnMessage);
        if (++turnTimer >= turnDuration) {
            turnMessage = null;
            turnTimer = 0;
        }
    }
}

function drawMessage(msg, isGameEnd = false) {
    fill(63, 73, 87);
    rect(50, 20, 300, isGameEnd ? 60 : 40, 15);
    fill(109, 228, 162);
    textAlign(CENTER, CENTER);
    textSize(20);
    textStyle(BOLD);
    text(msg, width/2, isGameEnd ? 52 : 40);
}

function isValidPosition(pos) {
    return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
}

function getValidMoves(x, y) {
    let moves = [];
    let piece = board[y][x];
    if (!piece) return moves;  // Return empty array for empty squares

    if (piece.type === 8) {  // Pawn movement logic
        let direction = piece.color === 'white' ? -1 : 1;  // Determine pawn direction based on color
        
        if (board[y + direction]?.[x] === null) {  // Check forward move
            moves.push([x, y + direction]);
            if ((piece.color === 'white' && y === 6) || (piece.color === 'black' && y === 1)) {  // Check initial two-square move
                if (!board[y + (2 * direction)]?.[x]) {
                    moves.push([x, y + (2 * direction)]);
                }
            }
        }
        
        for (let dx of [-1, 1]) {  // Check diagonal captures
            let newX = x + dx;
            let newY = y + direction;
            if (board[newY]?.[newX]?.color !== piece.color && board[newY]?.[newX] !== null) {
                moves.push([newX, newY]);
            }
        }
        return moves;
    }

    let directions = [];  // Define movement patterns for pieces
    switch(piece.type) {
        case 0: case 7: // Rook moves orthogonally
            directions = [[0,1], [1,0], [0,-1], [-1,0]];
            break;
        case 2: case 5: // Bishop moves diagonally
            directions = [[1,1], [-1,1], [1,-1], [-1,-1]];
            break;
        case 3: // Queen moves in all directions
            directions = [[0,1], [1,0], [0,-1], [-1,0], [1,1], [-1,1], [1,-1], [-1,-1]];
            break;
        case 4: // King moves one square in all directions
            directions = [[0,1], [1,0], [0,-1], [-1,0], [1,1], [-1,1], [1,-1], [-1,-1]];
            
            if (!movedPieces.has(`${x},${y}`)) {  // Check castling conditions
                if (!movedPieces.has(`7,${y}`) && !board[y][5] && !board[y][6] && board[y][7]?.type === 7 && board[y][7]?.color === piece.color) {
                    moves.push([6, y, 'kingside']);  // Add kingside castling move
                }
                
                if (!movedPieces.has(`0,${y}`) && !board[y][1] && !board[y][2] && !board[y][3] && board[y][0]?.type === 0 && board[y][0]?.color === piece.color) {
                    moves.push([2, y, 'queenside']);  // Add queenside castling move
                }
            }
            break;
        case 1: case 6: // Knight movement
            let knightMoves = [[2,1], [2,-1], [-2,1], [-2,-1], [1,2], [1,-2], [-1,2], [-1,-2]];  // L-shaped moves
            for (let move of knightMoves) {
                let newX = x + move[0];
                let newY = y + move[1];
                if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {  // Check board boundaries
                    if (!board[newY][newX] || board[newY][newX].color !== piece.color) {  // Check if square is empty or contains enemy piece
                        moves.push([newX, newY]);
                    }
                }
            }
            return moves;
    }

    let maxSteps = piece.type === 4 ? 1 : 7;  // Kings move one square, other pieces can move up to 7 squares
    for (let dir of directions) {
        for (let step = 1; step <= maxSteps; step++) {
            let newX = x + (dir[0] * step);
            let newY = y + (dir[1] * step);
            
            if (newX < 0 || newX >= 8 || newY < 0 || newY >= 8) break;  // Stop at board boundaries
            
            if (!board[newY][newX]) {  // Add empty square moves
                moves.push([newX, newY]);
                continue;
            }
            
            if (board[newY][newX].color !== piece.color) {  // Add capture moves
                moves.push([newX, newY]);
            }
            break;  // Stop checking this direction after hitting a piece
        }
    }

    return moves;
}

function isSquareUnderAttack(x, y, attackingColor) {  // Check if a square is under attack by the opposing color
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let piece = board[i][j];
            if (piece && piece.color === attackingColor) {
                let moves = getValidMoves(j, i, true);  // Get all possible moves for attacking pieces
                if (moves.some(move => move[0] === x && move[1] === y)) {  // Check if any move threatens the square
                    return true;
                }
            }
        }
    }
    return false;
}

function getMousePosition() {
    return {
        x: Math.floor(mouseX / squareSize),
        y: Math.floor(mouseY / squareSize)
    };
}

function mousePressed() {
    if (gameStatus !== 'playing') return;
    
    let mouseXIndex = Math.floor(mouseX / squareSize);
    let mouseYIndex = Math.floor(mouseY / squareSize);
    
    if (mouseXIndex < 0 || mouseXIndex >= 8 || mouseYIndex < 0 || mouseYIndex >= 8) return;
    
    if (selectedSquare) {
        let canMove = validMoves.some(move => move[0] === mouseXIndex && move[1] === mouseYIndex);
        
        if (canMove) {
            makeMove(selectedSquare[0], selectedSquare[1], mouseXIndex, mouseYIndex);
            selectedSquare = null;
            validMoves = [];
            return;
        }
    }
    
    if (board[mouseYIndex][mouseXIndex]?.color === currentPlayer) {
        selectedSquare = [mouseXIndex, mouseYIndex];
        validMoves = getValidMoves(mouseXIndex, mouseYIndex);
    } else {
        selectedSquare = null;
        validMoves = [];
    }
}

function makeMove(fromX, fromY, toX, toY) {
    let piece = board[fromY][fromX];
    let moveKey = `${fromX},${fromY}`;
    
    if (piece.type === 4 && !movedPieces.has(moveKey)) {
        if (toX === 6 && !movedPieces.has(`7,${fromY}`)) {
            board[toY][5] = board[fromY][7];
            board[fromY][7] = null;
            movedPieces.add(`7,${fromY}`);
        }
        else if (toX === 2 && !movedPieces.has(`0,${fromY}`)) {
            board[toY][3] = board[fromY][0];
            board[fromY][0] = null;
            movedPieces.add(`0,${fromY}`);
        }
    }
    
    movedPieces.add(moveKey);
    if (piece.type === 0 || piece.type === 7) {
        movedPieces.add(`${toX},${toY}`);
    }
    
    board[toY][toX] = board[fromY][fromX];
    board[fromY][fromX] = null;
    
    // Switch players and update turn message with "Turn" capitalized
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    turnMessage = currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1) + "'s Turn";
    turnTimer = 0;
    
    checkGameStatus();
}

function checkGameStatus() {
    let whiteKing = false;
    let blackKing = false;
    let whiteKingPos = null;
    let blackKingPos = null;
    
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            let piece = board[y][x];
            if (piece?.type === 4) {
                if (piece.color === 'white') {
                    whiteKing = true;
                    whiteKingPos = [x, y];
                } else {
                    blackKing = true;
                    blackKingPos = [x, y];
                }
            }
        }
    }
    
    if (!whiteKing) {
        gameStatus = 'Black Wins!';
        return;
    } else if (!blackKing) {
        gameStatus = 'White Wins!';
        return;
    }
    
    let hasValidMoves = false;
    
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (board[y][x]?.color === currentPlayer) {
                if (getValidMoves(x, y).length > 0) {
                    hasValidMoves = true;
                    break;
                }
            }
        }
        if (hasValidMoves) break;
    }
    
    let kingPos = currentPlayer === 'white' ? whiteKingPos : blackKingPos;
    let isInCheck = isSquareUnderAttack(kingPos[0], kingPos[1], currentPlayer === 'white' ? 'black' : 'white');
    
    if (!hasValidMoves) {
        if (isInCheck) {
            gameStatus = currentPlayer === 'white' ? 'Black Wins' : 'White Wins';
        } else {
            gameStatus = 'Stalemate';
        }
    } else if (isInCheck) {
        statusMessage = currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1) + " in Check";
        statusTimer = 0;
    }
}
