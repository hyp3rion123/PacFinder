//The Dijkstra function will return an array of objects of the format {x: xpos, y: ypos, state: currentState} to indicate the next tile and what animation to render.
// currentState will be one of: "explored"(the "visited" tiles), "exploring"(the current tile being examined), "path" (one of the tiles that leads the start node to the exit node
// through an optimal path calculated by the algorithm)
//The grid will receive this array instantly and then render the visualization. In other words, the visualization is pre-calculated.

class MinHeap { //data structure for keeping track of unvisited nodes and the order in which they are visited
    constructor(root) {
        this.heap=[root]
    }
    getRoot = () => this.heap[0];

    length = () => this.heap.length;

    getArrayForm = () => this.heap;

    insertNode = (node) => {
        if (this.heap.length === 0) {
            this.heap.push(node)
        } else {
            this.heap.push(node); //inserts at next available leaf node
            let currIndex = this.heap.length - 1;
            let parentIndex = Math.floor((currIndex - 1) / 2);
            while(parentIndex >= 0 && this.heap[parentIndex].distance > this.heap[currIndex].distance) { //fix heap
                //SWAP                
                [this.heap[parentIndex], this.heap[currIndex]] = [this.heap[currIndex], this.heap[parentIndex]];
                currIndex = parentIndex;
                parentIndex = Math.floor((currIndex - 1) / 2);
            }
        }
    }

    deleteRoot = () => {
        if (this.heap.length === 0) {
            return;
        } else if (this.heap.length === 1) {
            this.heap.length = 0;
        } else {
           this.heap[0] = this.heap[this.heap.length - 1];
           this.heap.pop();
           let currIndex = 0;
           let leftChildIndex = (currIndex * 2) + 1;
           let rightChildIndex = (currIndex * 2) + 2;
           let leftChildExists = leftChildIndex < this.heap.length;
           let rightChildExists = rightChildIndex < this.heap.length;
           while((leftChildExists && this.heap[currIndex].distance > this.heap[leftChildIndex].distance) || 
                (rightChildExists && this.heap[currIndex].distance > this.heap[rightChildIndex].distance)){ //fix heap after deletion
                    let swappingWithLeft = true; //true: swap with left, false: swap with right
                    if (rightChildExists && this.heap[rightChildIndex].distance < this.heap[leftChildIndex].distance) {
                        swappingWithLeft = false;
                    }

                    if (swappingWithLeft) {
                        [this.heap[currIndex], this.heap[leftChildIndex]] = [this.heap[leftChildIndex], this.heap[currIndex]];
                        currIndex = leftChildIndex;                        
                    } else {
                        [this.heap[currIndex], this.heap[rightChildIndex]] = [this.heap[rightChildIndex], this.heap[currIndex]];
                        currIndex = rightChildIndex;   
                    }

                    leftChildIndex = (currIndex * 2) + 1;
                    rightChildIndex = (currIndex * 2) + 2;
                    leftChildExists = leftChildIndex < this.heap.length;
                    rightChildExists = rightChildIndex < this.heap.length;
                }
        }
    }
}
    
export const dijkstra = async (startX, startY, endX, endY, grid) => {
    let moves = [];// unvisited = [];
    let Heap = new MinHeap(grid[startY][startX]);    

    grid.map(row => {
        row.map(tile => {
            if (tile.x !== startX || tile.y !== startY) {
                tile.distance = Infinity;
            }            
            return tile.tileState = "unexplored";            
        })
        return grid;
    })

    const getNeighbours = (x,y) => {
        const width = grid[0].length;
        const height = grid.length;
        let neighbours = [], unvisited = Heap.getArrayForm();
        //UP
        if (y - 1 >= 0 && !grid[y-1][x].wall && grid[y-1][x].tileState.localeCompare("explored") !== 0 && !grid[y-1][x].start && !unvisited.includes(grid[y-1][x])) {
            neighbours.push(grid[y-1][x])
        }
        //RIGHT
        if (x + 1 < width && !grid[y][x+1].wall && grid[y][x+1].tileState.localeCompare("explored") !== 0 && !grid[y][x+1].start && !unvisited.includes(grid[y][x+1])) {
            neighbours.push(grid[y][x+1])
        }
        //DOWN
        if (y + 1 < height && !grid[y+1][x].wall && grid[y+1][x].tileState.localeCompare("explored") !== 0 && !grid[y+1][x].start && !unvisited.includes(grid[y+1][x])) {
            neighbours.push(grid[y+1][x])
        }
        //LEFT
        if (x - 1 >= 0 && !grid[y][x-1].wall && grid[y][x-1].tileState.localeCompare("explored") !== 0 && !grid[y][x-1].start && !unvisited.includes(grid[y][x-1])) {
            neighbours.push(grid[y][x-1])
        }
        return neighbours;
    }

    let neighbours = getNeighbours(startX, startY);
    for(let neighbour in neighbours) {
        neighbours[neighbour].distance = 1;
        neighbours[neighbour].previousTile = grid[startY][startX];
        //unvisited.push(neighbours[neighbour]);
        Heap.insertNode(neighbours[neighbour]);
    }    
    Heap.deleteRoot();
    
    //Heap currently contains the (up to) 4 neighbours of start node
    const explore = () => {
        while(grid[endY][endX].tileState.localeCompare("explored") !== 0 && Heap.length() > 0) {
            const toExplore = Heap.length();
            for (let i = 0; i < toExplore; i++) {
                let root = Heap.getRoot();
                root.tileState = "exploring";
                moves.push({x: root.x, y: root.y, state: "exploring"});
                const neighbours = getNeighbours(root.x, root.y);
                
                if (neighbours.includes(grid[endY][endX])){ //if end has been found, start exiting the loop
                    if(grid[endY][endX].distance > root.distance + 1) {
                        grid[endY][endX].distance = root.distance + 1;
                        grid[endY][endX].previousTile = root;
                    }
                    let currentTile = grid[endY][endX].previousTile;
                    while(currentTile.x !== startX || currentTile.y !== startY) {
                        currentTile.tileState = "path";
                        moves.push({x: currentTile.x, y: currentTile.y, state: "path"});
                        currentTile = currentTile.previousTile;
                    }
                    return;
                }
                for (let neighbour in neighbours) {                
                    if (neighbours[neighbour].distance > root.distance + 1){
                        neighbours[neighbour].distance = root.distance + 1;
                        neighbours[neighbour].previousTile = root;
                    }
                    //unvisited.push(neighbours[neighbour]);
                    Heap.insertNode(neighbours[neighbour])
                }
                root.tileState = "explored";
                moves.push({x: root.x, y: root.y, state: "explored"});
                Heap.deleteRoot();               
            }
            //unvisited = unvisited.slice(toExplore - 1);
        }
        
        let currentTile = grid[endY][endX].previousTile;
        while(currentTile && (currentTile.x !== startX || currentTile.y !== startY)) {
            currentTile.tileState = "path";
            moves.push({x: currentTile.x, y: currentTile.y, state: "path"});
            currentTile = currentTile.previousTile;
        }
    }
    explore();
    return moves;    
}  


