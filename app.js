/**
* @typedef {Object} MatrixCell
* @property {Number} x Row Index
* @property {Number} y Column Index
*/

/**
* @typedef {Object} MazeCell
* @property {Number} left
* @property {Number} right
* @property {Number} top
* @property {Number} bottom
*/

/**
* @typedef {Object} Neighbor
* @property {MatrixCell} position Cell's absolute position 
* @property {string} direction direction from the perspective of current cell
*/

/**
* @type {enum}
*/
const WALL_TYPE = {
    OPEN: -1,
    PATH: 0,
    BLOCKED: 1,
};

const DIRECTIONS = {
    TOP: 'top',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right',
};

/** @type {HTMLInputElement} */
let rowInput;

/** @type {HTMLInputElement} */
let colInput;

/** @type {HTMLTableElement} */
let maze;

window.addEventListener('load', () => {
    console.log('Loaded');
    rowInput = document.querySelector('#rows');
    colInput = document.querySelector('#cols');
    maze = document.querySelector('#maze');
    
    rowInput.addEventListener('input', () => {
        createAndRenderMaze();
    });
    
    colInput.addEventListener('input', () => {
        createAndRenderMaze();
    });
    
    createAndRenderMaze();
});

/**
* Render maze table
* @param {MazeCell[][]} mazeCells 
*/
function renderMaze(mazeCells) {
    console.log(mazeCells);
    maze.innerHTML = '';
    for (let i=0; i<mazeCells.length; i++) {
        
        let tableRow = document.createElement('tr');
        
        for (let j=0; j<mazeCells[i].length; j++) {
            
            let borders = 0;
            const walls = mazeCells[i][j];
            const tableCol = document.createElement('td');
            
            if (walls.top !== WALL_TYPE.BLOCKED) {
                tableCol.style.borderTopWidth = "0px";
                borders += 1;
            }
            
            if (walls.bottom !== WALL_TYPE.BLOCKED) {
                tableCol.style.borderBottomWidth = "0px";
                borders += 1;
            }
            
            if (walls.left !== WALL_TYPE.BLOCKED) {
                tableCol.style.borderLeftWidth = "0px";
                borders += 1;
            }
            
            if (walls.right !== WALL_TYPE.BLOCKED) {
                tableCol.style.borderRightWidth = "0px";
                borders += 1;
            }
            
            tableCol.textContent = `(${i},${j})`;
            
            if (borders === 0) {
                tableCol.classList.add('blocked');
            }
            
            tableRow.appendChild(tableCol);
        }
        maze.appendChild(tableRow);
    }   
}

function toggleText() {
    document.querySelector('#maze').classList.toggle('no-text');
}

function createAndRenderMaze() {
    let mazeObj = Maze();
    const rows = Number(rowInput.value);
    const cols = Number(colInput.value);
    const mazeData = mazeObj.generate(rows, cols);
    renderMaze(mazeData);
}

const Maze = () => {
    
    /** @type {MazeCell[][]} */
    let mazeCells;
    
    /** @type {boolean[][]} */
    let visited;
    
    /**
    * Initialize matrix and visited arrays
    * @param {Number} r 
    * @param {Number} c 
    */
    function initialize(r, c) {
        console.log('# Rows', r);
        console.log('# Cols', c);
        
        mazeCells = new Array(r);
        visited = new Array(r);
        
        for (let i=0; i<r; i++) {
            mazeCells[i] = new Array(c);
            visited[i] = new Array(c);
            for (let j=0; j<c; j++) {
                mazeCells[i][j] = {
                    left: WALL_TYPE.OPEN,
                    right: WALL_TYPE.OPEN,
                    top: WALL_TYPE.OPEN,
                    bottom: WALL_TYPE.OPEN,
                };
                visited[i][j] = false;
            }
        }
    }
    
    /**
    * Get next unvisited cell
    * 
    * @returns {MatrixCell}
    */
    function getNextUnvisitedCell() {
        for (let i=0; i<mazeCells.length; i++) {
            for (let j=0; j<mazeCells[i].length; j++) {
                if (!visited[i][j]) {
                    return {
                        x: i,
                        y: j,
                    };
                }
            }
        }
        return null;
    }
    
    /**
    * Generate Maze
    * @param {Number} rowCount 
    * @param {Number} colCount 
    * 
    * @returns {MazeCell[][]} The 3D matrix representing the maze
    */
    function generate(rowCount, colCount) {
        if (rowCount <= 3 || colCount <= 3) {
            console.log('Invalid values');
            return;
        }
        
        initialize(rowCount, colCount);
        
        /** @type {MatrixCell} */
        let currentCell = {
            x: Math.floor(Math.random() * rowCount),
            y:  Math.floor(Math.random() * colCount),
        };
        
        // let currentCell = {
        //     x: 0,
        //     y: 0,
        // }
        
        /** @type {MatrixCell[]} */
        let path = [];
        
        let totalCells = rowCount * colCount;
        let totalVisited = 0;
        
        while (totalVisited < totalCells) {
            let availableNeighbors = getAccessibleNeighbors(currentCell.x, currentCell.y);
            if (availableNeighbors.length === 0) {
                currentCell = path.pop();
                console.log('No available neighbors');
                visited[currentCell.x][currentCell.y] = true;
                createWalls(currentCell.x, currentCell.y);
                console.log('Taking a step back to ', currentCell);
                continue;
            }
            
            let nextCell = availableNeighbors[availableNeighbors.length === 1 ? 0 : Math.floor(Math.random() * availableNeighbors.length)];
            switch (nextCell.direction) {
                case DIRECTIONS.TOP:
                mazeCells[currentCell.x][currentCell.y].top = WALL_TYPE.PATH;
                mazeCells[nextCell.position.x][nextCell.position.y].bottom = WALL_TYPE.PATH;
                break;
                case DIRECTIONS.BOTTOM:
                mazeCells[currentCell.x][currentCell.y].bottom = WALL_TYPE.PATH;
                mazeCells[nextCell.position.x][nextCell.position.y].top = WALL_TYPE.PATH;
                break;
                case DIRECTIONS.LEFT:
                mazeCells[currentCell.x][currentCell.y].left = WALL_TYPE.PATH;
                mazeCells[nextCell.position.x][nextCell.position.y].right = WALL_TYPE.PATH;
                break;
                case DIRECTIONS.RIGHT:
                mazeCells[currentCell.x][currentCell.y].right = WALL_TYPE.PATH;
                mazeCells[nextCell.position.x][nextCell.position.y].left = WALL_TYPE.PATH;
                break;
                default:
                console.warn('Unknown Direction');
            }
            
            createWalls(currentCell.x, currentCell.y);
            
            path.push({
                x: currentCell.x,
                y: currentCell.y,
            });
            
            visited[currentCell.x][currentCell.y] = true;
            totalVisited += 1;
            
            currentCell = {
                x: nextCell.position.x,
                y: nextCell.position.y,
            };
        }
        
        for (let i=0; i<mazeCells.length; i++) {
            for (let j=0; j<mazeCells[i].length; j++) {
                if (!visited[i][j]) {
                    createWalls(i, j);
                }
            }
        }
        
        console.log(path);
        return mazeCells;
    }
    
    /**
    * 
    * @param {Number} x 
    * @param {Number} y 
    */
    function createWalls(x, y) {
        Object.keys(mazeCells[x][y]).forEach(key => {
            if (mazeCells[x][y][key] === WALL_TYPE.OPEN) {
                mazeCells[x][y][key] = WALL_TYPE.BLOCKED;
            }
        });
    }
    
    /**
    * Get all accessible neighbors
    * @param {Number} x 
    * @param {Number} y
    * 
    * @returns {Neighbor[]} Accessible neighbors from position (x, y)
    */
    function getAccessibleNeighbors(x, y) {
        /** @type {Neighbor[]} */
        let list = [];
        
        if (x - 1 >= 0 && mazeCells[x-1][y].bottom === WALL_TYPE.OPEN) {
            list.push({
                position: {
                    x: x-1,
                    y
                },
                direction: DIRECTIONS.TOP,
            });
        }
        
        if (x + 1 < mazeCells.length && mazeCells[x+1][y].top === WALL_TYPE.OPEN) {
            list.push({
                position: {
                    x: x + 1,
                    y
                },
                direction: DIRECTIONS.BOTTOM,
            });
        }
        
        if (y - 1 >= 0 && mazeCells[x][y-1].right === WALL_TYPE.OPEN) {
            list.push({
                position: {
                    x,
                    y: y - 1,
                },
                direction: DIRECTIONS.LEFT,
            });
        }
        
        if (y + 1 < mazeCells[x].length && mazeCells[x][y+1].left === WALL_TYPE.OPEN) {
            list.push({
                position: {
                    x,
                    y: y + 1,
                },
                direction: DIRECTIONS.RIGHT,
            });
        }
        
        return list.filter(p => !visited[p.position.x][p.position.y]);
    }
    
    return {
        generate
    };
};