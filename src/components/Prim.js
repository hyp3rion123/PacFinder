class MinHeap {
  //data structure for keeping track of unvisited nodes and the order in which they are visited
  constructor(root) {
    this.heap = [root];
  }
  getRoot = () => this.heap[0];

  length = () => this.heap.length;

  getArrayForm = () => this.heap;

  insertNode = (node) => {
    if (this.heap.length === 0) {
      this.heap.push(node);
    } else {
      this.heap.push(node); //inserts at next available leaf node
      let currIndex = this.heap.length - 1;
      let parentIndex = Math.floor((currIndex - 1) / 2);
      while (
        parentIndex >= 0 &&
        this.heap[parentIndex].weight > this.heap[currIndex].weight
      ) {
        //fix heap
        //SWAP
        [this.heap[parentIndex], this.heap[currIndex]] = [
          this.heap[currIndex],
          this.heap[parentIndex],
        ];
        currIndex = parentIndex;
        parentIndex = Math.floor((currIndex - 1) / 2);
      }
    }
  };

  deleteRoot = () => {
    if (this.heap.length === 0) {
      return;
    } else if (this.heap.length === 1) {
      this.heap.length = 0;
    } else {
      this.heap[0] = this.heap[this.heap.length - 1];
      this.heap.pop();
      let currIndex = 0;
      let leftChildIndex = currIndex * 2 + 1;
      let rightChildIndex = currIndex * 2 + 2;
      let leftChildExists = leftChildIndex < this.heap.length;
      let rightChildExists = rightChildIndex < this.heap.length;
      while (
        (leftChildExists &&
          this.heap[currIndex].weight > this.heap[leftChildIndex].weight) ||
        (rightChildExists &&
          this.heap[currIndex].weight > this.heap[rightChildIndex].weight)
      ) {
        //fix heap after deletion
        let swappingWithLeft = true; //true: swap with left, false: swap with right
        if (
          rightChildExists &&
          this.heap[rightChildIndex].weight < this.heap[leftChildIndex].weight
        ) {
          swappingWithLeft = false;
        }
        if (swappingWithLeft) {
          [this.heap[currIndex], this.heap[leftChildIndex]] = [
            this.heap[leftChildIndex],
            this.heap[currIndex],
          ];
          currIndex = leftChildIndex;
        } else {
          [this.heap[currIndex], this.heap[rightChildIndex]] = [
            this.heap[rightChildIndex],
            this.heap[currIndex],
          ];
          currIndex = rightChildIndex;
        }

        leftChildIndex = currIndex * 2 + 1;
        rightChildIndex = currIndex * 2 + 2;
        leftChildExists = leftChildIndex < this.heap.length;
        rightChildExists = rightChildIndex < this.heap.length;
      }
    }
  };
}

export const prim = async (start, end, grid) => {
  let Heap = new MinHeap(start);
  let moves = [];
  grid.map((row) => {
    row.map((tile) => {
      if (
        !(tile.x === start.x && tile.y === start.y) &&
        !(tile.x === end.x && tile.y === end.y)
      ) {
        tile.weight = Math.random();
        tile.wall = true;
      }
    });
  });

  const adjacentEmptyGap = (x, y) => {
    const width = grid[0].length;
    const height = grid.length;
    let countGaps = 0;
    //UP
    if (y - 1 >= 0 && !grid[y - 1][x].wall && !grid[y - 1][x].end) {
      countGaps++;
    }
    //RIGHT
    if (x + 1 < width && !grid[y][x + 1].wall && !grid[y][x + 1].end) {
      countGaps++;
    }
    //DOWN
    if (y + 1 < height && !grid[y + 1][x].wall && !grid[y + 1][x].end) {
      countGaps++;
    }
    //LEFT
    if (x - 1 >= 0 && !grid[y][x - 1].wall && !grid[y][x - 1].end) {
      countGaps++;
    }
    return countGaps;
  };

  const getNeighbours = (x, y) => {
    const width = grid[0].length;
    const height = grid.length;
    let neighbours = [],
      unvisited = Heap.getArrayForm();
    //UP
    if (y - 1 >= 0 && grid[y - 1][x].wall) {
      neighbours.push(grid[y - 1][x]);
    }
    //RIGHT
    if (x + 1 < width && grid[y][x + 1].wall) {
      neighbours.push(grid[y][x + 1]);
    }
    //DOWN
    if (y + 1 < height && grid[y + 1][x].wall) {
      neighbours.push(grid[y + 1][x]);
    }
    //LEFT
    if (x - 1 >= 0 && grid[y][x - 1].wall) {
      neighbours.push(grid[y][x - 1]);
    }
    return neighbours;
  };

  let currentRoot = Heap.getRoot();
  while (Heap.length !== 0 && currentRoot) {
    Heap.deleteRoot();
    if (adjacentEmptyGap(currentRoot.x, currentRoot.y) <= 1) {
      let neighbours = getNeighbours(currentRoot.x, currentRoot.y);
      for (let neighbour in neighbours) {
        Heap.insertNode(neighbours[neighbour]);
      }
      currentRoot.wall = false;
      moves.push({ x: currentRoot.x, y: currentRoot.y, state: "exploring" });
      moves.push({ x: currentRoot.x, y: currentRoot.y, state: "carveWall" });
    }
    currentRoot = Heap.getRoot();
  }
  return moves;
};
