let board = [];
let gameActive = true;
const GAME_SPEED = 100;
const NATURAL_FALL_SPEED = 1000;
let gameInterval;
let score = 0;
let alreadySwapped = false;

const EMPTY = 0;
const CURRENT_BLOCK = 1;
const LOCKIN_BLOCK = 2;
const BOARD_CENTER = 4;

let currentBlock = null;
let nextBlock = null;
let storedBlock = null;
let currentBlockClock = NATURAL_FALL_SPEED - GAME_SPEED;
let currentPlayerMove = null;
let currentPlayerRotate = null;

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
            [1, 0],
            [1, 0],
            [1, 1],
        ],
        currentLocation: [],
    },
    {
        name: "J",
        shape: [
            [0, 1],
            [0, 1],
            [1, 1],
        ],
        currentLocation: [],
    },
    {
        name: "J",
        shape: [
            [1, 1],
            [1, 1],
        ],
        currentLocation: [],
    },
    {
        name: "S",
        shape: [
            [0, 1, 1],
            [1, 1, 0],
        ],
        currentLocation: [],
    },
    {
        name: "Z",
        shape: [
            [1, 1, 0],
            [0, 1, 1],
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

function renderNextBlock() {
    const nextBlockBoard = document.getElementById("next-block-board");
    nextBlockBoard.innerHTML = "";
    const previewGrid = Array(4).fill(null).map(() => Array(4).fill(EMPTY));

    if (nextBlock) {
        const shape = nextBlock.shape;
        const offsetRow = Math.floor((4 - shape.length) / 2);
        const offsetCol = Math.floor((4 - shape[0].length) / 2);

        shape.map((row, rowIndex) => {
            row.map((cell, colIndex) => {
                if (cell !== EMPTY) {
                    previewGrid[offsetRow + rowIndex][offsetCol + colIndex] = CURRENT_BLOCK;
                }
            });
        });
    }

    previewGrid.map(row => {
        row.map(cell => {
            const cellElement = document.createElement("div");
            cellElement.className = "cell";
            if (cell === CURRENT_BLOCK) {
                cellElement.className += " current-block";
            } else {
                cellElement.className += " preview-empty";
            }
            nextBlockBoard.appendChild(cellElement);
        });
    });
}

function renderStoredBlock() {
    const storeBlockBoard = document.getElementById("store-block-board");
    storeBlockBoard.innerHTML = "";
    const previewGrid = Array(4).fill(null).map(() => Array(4).fill(EMPTY));

    if (storedBlock) {
        const shape = storedBlock.shape;
        const offsetRow = Math.floor((4 - shape.length) / 2);
        const offsetCol = Math.floor((4 - shape[0].length) / 2);

        shape.map((row, rowIndex) => {
            row.map((cell, colIndex) => {
                if (cell !== EMPTY) {
                    previewGrid[offsetRow + rowIndex][offsetCol + colIndex] = CURRENT_BLOCK;
                }
            });
        });
    }

    previewGrid.map(row => {
        row.map(cell => {
            const cellElement = document.createElement("div");
            cellElement.className = "cell";
            if (cell === CURRENT_BLOCK) {
                cellElement.className += " current-block";
            } else {
                cellElement.className += " preview-empty";
            }
            storeBlockBoard.appendChild(cellElement);
        });
    });
}

function renderboard() {
    renderMainBoard();
    document.getElementById("score").textContent = score;
    renderNextBlock();
    renderStoredBlock();
}

function renderMainBoard() {
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
    if (currentBlock.shape.some((blockRow, rowIndex) => {
        return blockRow.some((blockCell, colIndex) => {
            if (blockCell === EMPTY) {
                return false;
            }
            const row = rowIndex;
            const col = BOARD_CENTER + colIndex;
            return board[row][col] === LOCKIN_BLOCK;
        });
    })) {
        gameActive = false;
        clearInterval(gameInterval);
        applyGameOverStyles();
        return;
    }

    currentBlock.shape.map((blockRow, rowIndex) => {
        blockRow.map((blockCell, colIndex) => {
            if (blockCell === EMPTY) {
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
        alreadySwapped = false;
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
            newLocation = currentBlock.currentLocation.map(([row, col]) => {
                col += 1;
                return [row, col];
            });
            if (checkPlayerValidMove(newLocation) === false) {
                return;
            }
            moveCurrentBlock(currentBlock, newLocation);
            break;
        case DOWN:
            newLocation = currentBlock.currentLocation.map(([row, col]) => {
                row += 1;
                return [row, col];
            });
            if (checkPlayerValidMove(newLocation) === false) {
                return;
            }
            moveCurrentBlock(currentBlock, newLocation);
            break;
    }
    currentPlayerMove = null;
}

function transpose(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

function reverseRows(matrix) {
    return matrix.map(row => row.reverse());
}

function playerRotateBlock() {
    if (currentBlock == null || currentPlayerRotate == null) {
        return;
    }
    switch (currentPlayerRotate) {
        case 90:
            newShape = reverseRows(transpose(currentBlock.shape));
            newLocation = getLocationAfterRotation(newShape);
            if (checkPlayerValidMove(newLocation) === false) {
                return;
            }
            moveCurrentBlock(currentBlock, newLocation);
            currentBlock.shape = newShape;
            break;
        case -90:
            newShape = transpose(reverseRows(currentBlock.shape));
            newLocation = getLocationAfterRotation(newShape);
            if (checkPlayerValidMove(newLocation) === false) {
                return;
            }
            moveCurrentBlock(currentBlock, newLocation);
            currentBlock.shape = newShape;
            break;
    }
    currentPlayerRotate = null;
}

function getLocationAfterRotation(newShape) {
    const [baseRow, baseCol] = currentBlock.currentLocation[0];
    return newShape.flatMap((row, rowIndex) => {
        return row.map((cell, colIndex) => {
            if (cell === 0) {
                return null;
            }
            return [baseRow + rowIndex, baseCol + colIndex];
        }).filter(Boolean);
    });
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
    switch (event.key) {
        case 'a':
            currentPlayerMove = LEFT;
            break;
        case 'd':
            currentPlayerMove = RIGHT;
            break;
        case 's':
            currentPlayerMove = DOWN;
            break;
        case 'ArrowLeft':
            currentPlayerRotate = -90;
            break;
        case 'ArrowRight':
            currentPlayerRotate = 90;
            break;
        case ' ':
            swapStoredBlock();
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

function resetBlockLocation(block) {
    block.currentLocation = [];
    block.shape.map((blockRow, rowIndex) => {
        blockRow.map((blockCell, colIndex) => {
            if (blockCell === 0) {
                return;
            }
            const row = rowIndex;
            const col = BOARD_CENTER + colIndex;
            block.currentLocation.push([row, col]);
        });
    });
    block.currentLocation.map(([row, col]) => {
        board[row][col] = CURRENT_BLOCK;
    });
}

function swapStoredBlock() {
    if (alreadySwapped == true) {
        return; 
    }
    alreadySwapped = true;

    currentBlock.currentLocation.map(([row, col]) => {
        board[row][col] = EMPTY;
    });
    currentBlock.currentLocation = [];
    if (storedBlock == null) {
        storedBlock = currentBlock;
        currentBlock = null;
    } else {
        const temp = currentBlock;
        currentBlock = storedBlock;
        storedBlock = temp;
    }
    if (currentBlock != null) {
        resetBlockLocation(currentBlock);
    }
}

function clearFullRows() {
    let fullRows = 0;
    board.map((row, rowIndex) => {
        if (row.every(cell => cell === LOCKIN_BLOCK)) {
            board.splice(rowIndex, 1);
            board.unshift(new Array(10).fill(EMPTY));
            fullRows += 1;
        }
    });

    if (fullRows === 0) {
        return;
    }

    score += Math.floor(1000 * (1.1 ** fullRows));
}

function resetGame() {
    clearInterval(gameInterval);
    score = 0;
    alreadySwapped = false;
    currentBlock = null;
    nextBlock = null;
    storedBlock = null;
    currentBlockClock = NATURAL_FALL_SPEED - GAME_SPEED;
    currentPlayerMove = null;
    currentPlayerRotate = null;
    initBoard();
    gameActive = true;
    gameInterval = setInterval(() => {
        playerMoveBlock();
        playerRotateBlock();
        moveBlock();
        if (currentBlock == null) {
            currentBlock = nextBlock;
            const blocks = Object.values(BLOCK_TEMPLATE);
            const randomBlockNumber = Math.floor(Math.random() * blocks.length);
            nextBlock = null;
            nextBlock = createBlock(randomBlockNumber);
            spawnBlock();
            if (gameActive === false) {
                return;
            }
        }
        clearFullRows();
        renderboard();
    }, GAME_SPEED);
}

const resetButton = document.getElementById("reset-button");
if (resetButton) {
    resetButton.addEventListener("click", resetGame);
}

function applyGameOverStyles() {
    const boardElement = document.getElementById("board");
    boardElement.innerHTML = "";
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            if (board[row][col] === LOCKIN_BLOCK) {
                cell.className += " game-over-lockin";
            } else {
                cell.className += " game-over-empty";
            }
            boardElement.appendChild(cell);
        }
    }
}


resetGame();


