/** @type {HTMLInputElement} */
let rowInput;

/** @type {HTMLInputElement} */
let colInput;

/** @type {HTMLTableElement} */
let maze;

const DIRECTIONS = {
    TOP: 0,
    RIGHT: 1,
    BOTTOM: 2,
    LEFT: 3,
};

window.addEventListener('load', () => {
    console.log('Loaded');
    rowInput = document.querySelector('#rows');
    colInput = document.querySelector('#cols');
    maze = document.querySelector('#maze');

    rowInput.addEventListener('input', () => {
        updateMaze();
    });

    colInput.addEventListener('input', () => {
        updateMaze();
    });

    updateMaze();
});

/** @type {Number[][][]} */
let cells;

/** @type {boolean[][]} */
let unvis;

function initialize(r, c) {
    cells = new Array(r);
    unvis = new Array(r);

    for (let i=0; i<r; i++) {
        cells[i] = new Array(c);
        unvis[i] = new Array(c);
        for (let j=0; j<c; j++) {

            // top, right, bottom, left
            cells[i][j] = [1, 1, 1, 1];
            unvis[i][j] = true;
        }
    }
}

function updateMaze() {
    let rowCount = Number(rowInput.value);
    let colCount = Number(colInput.value);

    if (rowCount <= 0 || colCount <= 0) {
        console.log('Invalid values');
        return;
    }
    
    let totalCells = rowCount * colCount;
    let totalVisited = 0;

    initialize(rowCount, colCount);

    //let currentCell = [Math.floor(Math.random() * rowCount), Math.floor(Math.random() * colCount)];
    let currentCell = [0, 0];
    let path = [];

    while (path.length < totalCells && unvis[currentCell[0]][currentCell[1]]) {
        /** @type {Object[]} */
        let availableNeighbors = [];
        let x = currentCell[0];
        let y = currentCell[1];

        unvis[x][y] = false;
        path.push([x, y]);

        if (x-1 >= 0 && unvis[x-1][y]) {
            availableNeighbors.push({x: x-1, y, direction: DIRECTIONS.LEFT });
        }

        if (x+1 < rowCount && unvis[x+1][y]) {
            availableNeighbors.push({x: x+1, y, direction: DIRECTIONS.RIGHT })
        }

        if (y-1 >= 0 && unvis[x][y-1]) {
            availableNeighbors.push({x, y: y-1, direction: DIRECTIONS.TOP });
        }

        if (y+1 < colCount && unvis[x][y+1]) {
            availableNeighbors.push({x, y: y+1, direction: DIRECTIONS.BOTTOM });
        }

        if (availableNeighbors.length > 0) {
            let nextCell = availableNeighbors[availableNeighbors.length === 1 ? 0 : Math.floor(Math.random() * availableNeighbors.length)];
            cells[nextCell.x][nextCell.y][nextCell.direction] = 0;
            currentCell = [nextCell.x, nextCell.y];
        }
    }

    console.log(path);
    renderMaze(cells);
}

/**
 * Render maze table
 * @param {Number[][][]} cells 
 */
function renderMaze(cells) {
    maze.innerHTML = '';
    for (let i=0; i<cells.length; i++) {
        let tableRow = document.createElement('tr');
        for (let j=0; j<cells[i].length; j++) {
            let directions = cells[i][j];
            let tableCol = document.createElement('td');

            let top = directions[DIRECTIONS.TOP] != 0 ? '5px' : '0px';
            let right = directions[DIRECTIONS.RIGHT] != 0 ? '5px' : '0px';
            let bottom = directions[DIRECTIONS.BOTTOM] != 0 ? '5px' : '0px';
            let left = directions[DIRECTIONS.LEFT] != 0 ? '5px' : '0px';

            tableCol.style.borderWidth = `${top} ${right} ${bottom} ${left}`;
            tableRow.appendChild(tableCol);
        }
        maze.appendChild(tableRow);
    }   
}