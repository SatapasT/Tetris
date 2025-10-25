let board = [];
let gameActive = true;
const GAME_SPEED = 100;
const NATURAL_FALL_SPEED = 1000;
let gameInterval;
const EMPTY = 0;
const CURRENT_BLOCK = 1;
const LOCKIN_BLOCK = 2;
const BOARD_CENTER = 4;

let currentBlock = null;
let currentBlockClock = NATURAL_FALL_SPEED - GAME_SPEED;
let currentPlayerMove = null;

LEFT = 0;
RIGHT = 1;
DOWN = 2;

const BLOCK_TEMPLATE = [
    {
        name: "T",
        shape: [
            [1, 1, 1],
            [0, 1, 0],
        ],
        currentLocation: [],
    },
    {
        name: "I",
        shape: [
            [1],
            [1],
            [1],
            [1],
        ],
        currentLocation: [],
    },
    {
        name: "L",
        shape: [
            [1,0],
            [1,0],
            [1,1],
        ],
        currentLocation: [],
    },
    {
        name: "J",
        shape: [
            [0,1],
            [0,1],
            [1,1],
        ],
        currentLocation: [],
    },
    {
        name: "J",
        shape: [
            [1,1],
            [1,1],
        ],
        currentLocation: [],
    },
    {
        name: "S",
        shape: [
            [0,1,1],
            [1,1,0],
        ],
        currentLocation: [],
    },
    {
        name: "Z",
        shape: [
            [1,1,0],
            [0,1,1],
        ],
        currentLocation: [],
    }
    
];

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
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = "";
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            if (board[row][col] === CURRENT_BLOCK) {
                cell.className += " current-block";
            } else if (board[row][col] === LOCKIN_BLOCK) {
                cell.className += " lockin-block";
            }
            boardElement.appendChild(cell);
        }
    }
}

function spawnBlock() {
    currentBlock.shape.map((blockRow, rowIndex) => {
        blockRow.map((blockCell, colIndex) => {
            if (blockCell === 0) {
                return;
            }
            const row = rowIndex;
            const col = BOARD_CENTER + colIndex;

            board[row][col] = CURRENT_BLOCK;
            currentBlock.currentLocation.push([row, col]);
        });
    });
}

function moveBlock() {
    currentBlockClock += GAME_SPEED;
    if (currentBlockClock % NATURAL_FALL_SPEED !== 0) {
        return;
    }

    currentBlockClock %= NATURAL_FALL_SPEED;

    if (currentBlock == null) {
        const blocks = Object.values(BLOCK_TEMPLATE);
        const randomBlockNumber = Math.floor(Math.random() * blocks.length);
        currentBlock = createBlock(randomBlockNumber);
        spawnBlock();
        return;
    }

    if (
        currentBlock.currentLocation.some(
            ([row, col]) => row === 19 || board[row + 1][col] === LOCKIN_BLOCK
        )
    ) {
        currentBlock.currentLocation.map(([lockRow, lockCol]) => {
            board[lockRow][lockCol] = LOCKIN_BLOCK;
        });
        currentBlock = null;
        return;
    }

    const newLocation = currentBlock.currentLocation.map(([row, col]) => {
        board[row][col] = EMPTY;
        return [row + 1, col];
    });

    newLocation.map(([row, col]) => {
        board[row][col] = CURRENT_BLOCK;
    });

    currentBlock.currentLocation = newLocation;
}

function playerMoveBlock() {
    if (currentBlock == null || currentPlayerMove == null) {
        return;
    }
    switch (currentPlayerMove) {
        case LEFT:
            newLocation = currentBlock.currentLocation.map(([row, col]) => {
                col -= 1;
                return [row, col];
            });
            if (checkPlayerValidMove(newLocation) === false) {
                return;
            }
            moveCurrentBlock(currentBlock, newLocation);
            break;
        case RIGHT:
            // Move block right logic
            break;
        case DOWN:
            // Move block down logic
            break;
    }
    currentPlayerMove = null;
}

function moveCurrentBlock(currentBlock, newLocation) {
    currentBlock.currentLocation.map(([row, col]) => {
                board[row][col] = EMPTY;
            });
            
            
            newLocation.map(([row, col]) => {
                board[row][col] = CURRENT_BLOCK;
            });
            currentBlock.currentLocation = newLocation;
}

function checkPlayerValidMove(newLocation) {
    return newLocation.every(([row, col]) => {
        return (
            row >= 0 && row < 20 &&
            col >= 0 && col < 10 &&
            (board[row][col] === EMPTY || board[row][col] === CURRENT_BLOCK)
        );
    });
}


document.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'a':
            currentPlayerMove = LEFT;
            break;
        case 'd':
            currentPlayerMove = RIGHT;
            break;
        case 's':
            currentPlayerMove = DOWN;
            break;
    }
});

function createBlock(blockNumber) {
    const blocks = BLOCK_TEMPLATE;
    const newBlock = {
        name: blocks[blockNumber].name,
        shape: blocks[blockNumber].shape,
        currentLocation: [],
    };
    return newBlock;
}

initBoard();
gameActive = true;
gameInterval = setInterval(() => {
    playerMoveBlock();
    moveBlock();
    renderboard();
}, GAME_SPEED);
