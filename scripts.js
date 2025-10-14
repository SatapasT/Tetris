let board = [];
let gameActive = true;
const GAME_SPEED = 500;
let gameInterval;
const EMPTY = 0;
const CURRENT_BLOCK = 1;
const LOCKIN_BLOCK = 2;

let currentBlock = null;

function initBoard() {
    board = [];
    for (let row = 0; row < 20; row++) {
        board[row] = [];
        for (let col = 0; col < 10; col++) {
            board[row][col] = 0;
        }
    }
    renderboard();
}

function renderboard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (board[row][col] === CURRENT_BLOCK) {
                cell.className += ' current-block';
            } else if (board[row][col] === LOCKIN_BLOCK) {
                cell.className += ' lockin-block';
            }
            boardElement.appendChild(cell);
        }
    }
}

function createBlock() {
    currentBlock = {
        shape: [
            [1, 1, 1],
            [0, 1, 0]
        ],
        blockRow: 0,
        blockCol: 3 
    };
}

function placeBlockOnBoard() {
    // Clear previous block
    for (let boardRow = 0; boardRow < 20; boardRow++) {
        for (let boardCol = 0; boardCol < 10; boardCol++) {
            if (board[boardRow][boardCol] === CURRENT_BLOCK) {
                board[boardRow][boardCol] = EMPTY;
            }
        }
    }
    // Place current block
    if (currentBlock) {
        for (let shapeRow = 0; shapeRow < currentBlock.shape.length; shapeRow++) {
            for (let shapeCol = 0; shapeCol < currentBlock.shape[shapeRow].length; shapeCol++) {
                if (currentBlock.shape[shapeRow][shapeCol]) {
                    let boardRow = currentBlock.blockRow + shapeRow;
                    let boardCol = currentBlock.blockCol + shapeCol;
                    if (boardRow >= 0 && boardRow < 20 && boardCol >= 0 && boardCol < 10) {
                        board[boardRow][boardCol] = CURRENT_BLOCK;
                    }
                }
            }
        }
    }
}

function renderGame() {
    if (!currentBlock) {
        createBlock();
    } else {
        // Move block down
        currentBlock.blockRow++;
        // If block reaches bottom, stop moving
        if (currentBlock.blockRow + currentBlock.shape.length > 20) {
            currentBlock.blockRow--;
        }
    }
    placeBlockOnBoard();
    renderboard();
}

initBoard();
createBlock();
gameActive = true;
gameInterval = setInterval(() => {
    renderGame();
}, GAME_SPEED);