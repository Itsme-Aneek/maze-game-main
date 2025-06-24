let current;

export class Maze {
    constructor(size) {
        this.size = size
        this.grid = [];
        this.stack = [];
        this.last = false;
    };

    setup() {
        for (let r=0; r<this.size; r++) {
            let row = [];
            for (let c=0; c<this.size; c++) {
                let cell = new Cell(r, c, this.grid, this.size);
                row.push(cell);
            };
            this.grid.push(row);
        };
        current = this.grid[0][0];
        return this.grid;
    };

    draw() {
        current.visited = true;
        let next = current.checkNeighbours();

        if (next) {
            next.visited = true;
            this.stack.push(current);

            if (next.row === this.size-1 && next.column === this.size-1) this.last = true;
            if (!this.last) next.path = true;

            current.removeWalls(current, next);
            current = next;
        } else if (this.stack.length > 0){
            let cell = this.stack.pop();
            if (!this.last) current.path = false;
            current = cell;
        };

        if (this.stack.length === 0) {
            return this.grid;
        };

        return this.draw();
    };

    movePlayerPos(currentPos, direction) {
        let r = currentPos[0];
        let c = currentPos[1];

        if (direction === "right") {
            if (this.grid[r][c].walls.rightWall) {
                return currentPos;
            } else {
                currentPos[1] = currentPos[1]+1;
                return currentPos;
            };
            
        } else if (direction === "left") {
            if (this.grid[r][c].walls.leftWall) {
                return currentPos;
            } else {
                currentPos[1] = currentPos[1]-1;
                return currentPos;
            };
            
        } else if (direction === "top") {
            if (this.grid[r][c].walls.topWall) {
                return currentPos;
            } else {
                currentPos[0] = currentPos[0]-1;
                return currentPos;
            };

        } else if (direction === "bottom") {
            if (this.grid[r][c].walls.bottomWall) {
                return currentPos;
            } else {
                currentPos[0] = currentPos[0]+1;
                return currentPos;
            };
        };
    };
};

class Cell {
    constructor(row, column, parentGrid, parentSize) {
        this.row = row;
        this.column = column;
        this.parentGrid = parentGrid;
        this.parentSize = parentSize;
        this.visited = false;
        this.playerVisited = false;
        this.path = false;
        this.walls = {
            topWall: true,
            bottomWall: true,
            leftWall: true,
            rightWall: true
        };
    };

    checkNeighbours() {
        let grid = this.parentGrid;
        let row = this.row;
        let column = this.column;
        let neighbours = [];

        let top = row !== 0 ? grid[row-1][column] : undefined;
        let bottom = row !== grid.length-1 ? grid[row+1][column] : undefined;
        let left = column !== 0 ? grid[row][column-1] : undefined;
        let right = column !== grid.length-1 ? grid[row][column+1] : undefined;

        if (top && !top.visited) neighbours.push(top);
        if (right && !right.visited) neighbours.push(right);
        if (bottom && !bottom.visited) neighbours.push(bottom);
        if (left && !left.visited) neighbours.push(left);

        if(neighbours.length !==0) {
            let random = Math.floor(Math.random()*neighbours.length);
            return neighbours[random];
        } else {
            return undefined;
        };
    };

    removeWalls(cell1, cell2) {
        let x = (cell1.column - cell2.column);

        if (x===1) {
            cell1.walls.leftWall = false;
            cell2.walls.rightWall = false;
        } else if (x===-1) {
            cell1.walls.rightWall = false;
            cell2.walls.leftWall = false;
        };

        let y = (cell1.row - cell2.row);

        if (y===1) {
            cell1.walls.topWall = false;
            cell2.walls.bottomWall = false;
        } else if (y===-1) {
            cell1.walls.bottomWall = false;
            cell2.walls.topWall = false;
        };
    };
};
