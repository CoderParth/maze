// Get the maze element and button elements
const mazeElement = document.getElementById('maze');
const resetButton = document.getElementById('reset-button');
const startButton = document.getElementById('start-button');
const algorithmSelect = document.getElementById('algorithm-select');

class PriorityQueue {
	constructor() {
		this.elements = [];
	}

	enqueue(element, priority) {
		this.elements.push({ element, priority });
		this.heapifyUp();
	}

	dequeue() {
		const result = this.elements[0];
		const end = this.elements.pop();
		if (this.elements.length > 0) {
			this.elements[0] = end;
			this.heapifyDown();
		}
		return result.element;
	}

	heapifyUp() {
		let index = this.elements.length - 1;
		const element = this.elements[index];
		while (index > 0) {
			const parentIndex = Math.floor((index - 1) / 2);
			const parent = this.elements[parentIndex];
			if (element.priority >= parent.priority) {
				break;
			}
			this.elements[index] = parent;
			this.elements[parentIndex] = element;
			index = parentIndex;
		}
	}

	heapifyDown() {
		let index = 0;
		const length = this.elements.length;
		const element = this.elements[0];
		while (true) {
			const leftChildIndex = 2 * index + 1;
			const rightChildIndex = 2 * index + 2;
			let leftChild, rightChild;
			let swap = null;
			if (leftChildIndex < length) {
				leftChild = this.elements[leftChildIndex];
				if (leftChild.priority < element.priority) {
					swap = leftChildIndex;
				}
			}
			if (rightChildIndex < length) {
				rightChild = this.elements[rightChildIndex];
				if ((swap === null && rightChild.priority < element.priority) ||
					(swap !== null && rightChild.priority < leftChild.priority)) {
					swap = rightChildIndex;
				}
			}
			if (swap === null) {
				break;
			}
			this.elements[index] = this.elements[swap];
			this.elements[swap] = element;
			index = swap;
		}
	}

	isEmpty() {
		return this.elements.length === 0;
	}
}


// Define maze as a 2D array of cells
const numRows = 10;
const numCols = 27;
let maze = [];

// Set the start and end points to null initially
let start = null;
let end = null;

// Create the maze by adding divs for each cell
function createMaze() {
	// Remove existing cells from the maze element
	while (mazeElement.firstChild) {
		mazeElement.removeChild(mazeElement.firstChild);
	}
	// Create a random maze
	for (let y = 0; y < numRows; y++) {
		const row = [];
		for (let x = 0; x < numCols; x++) {
			const randNum = Math.floor(Math.random() * 2);
			row.push(randNum);
			const cell = document.createElement('div');
			cell.classList.add('cell');
			if (randNum === 1) {
				cell.classList.add('wall');
			}
			cell.style.left = `${x * 60}px`;
			cell.style.top = `${y * 60}px`;
			cell.dataset.x = x;
			cell.dataset.y = y;
			mazeElement.appendChild(cell);
		}
		maze.push(row);
	}

	// Add event listener to cells to set start and end points
	const cells = document.querySelectorAll('.cell');
	cells.forEach((cell) => {
		cell.addEventListener('click', (event) => {
			const cellClasses = event.target.classList;
			if (!start) {
				start = cell;
				cellClasses.add('start');
				console.log('added start')
			} else if (!end) {
				end = cell;
				cellClasses.add('end');
				console.log('added end')
			}
		});
	});
}

// Reset the maze and start/end points
function resetMaze() {
	maze = [];
	start = null;
	end = null;
	createMaze();
}

// Add event listener to reset button
resetButton.addEventListener('click', resetMaze);


// Create the maze initially
createMaze();


// Create a map of each algorithm's name and the corresponding function to call
const algorithms = {
	bfs: bfs,
	dfs: dfs,
	dijkstra: dijkstra
};

// Define function to find shortest path using the selected algorithm
function findShortestPath(startCell, endCell, selectedAlgorithm) {
	// Find the function corresponding to the selected algorithm
	const algorithmFunction = algorithms[selectedAlgorithm];

	// Call the selected algorithm function and return the result
	return algorithmFunction(startCell, endCell);
}

// Add event listener to start button
startButton.addEventListener('click', () => {
	if (start && end) {
		// Clear any existing shortest path
		// clearPath();

		// Get the selected algorithm from the dropdown menu
		const selectedAlgorithm = algorithmSelect.value;
		console.log(selectedAlgorithm)
		// Find the shortest path using the selected algorithm
		const shortestPath = findShortestPath(start, end, selectedAlgorithm);

		// If a path is found, highlight the path in the maze
		if (shortestPath) {
			shortestPath.forEach(cell => {
				cell.classList.add('path');
			});
		} else {
			console.log('No path found');
		}
	} else {
		console.log('Please select a start and end point');
	}
});


// Define the different shortest path algorithms
function bfs(startCell, endCell) {
	// Queue to keep track of cells to be visited
	const queue = [startCell];

	// Map to keep track of visited cells and their parent cells
	const visited = new Map();
	visited.set(startCell, null);

	// Breadth-First Search
	while (queue.length > 0) {
		const cell = queue.shift();
		if (cell === endCell) {
			// Trace back the path from end to start
			const shortestPath = [cell];
			let parent = visited.get(cell);
			while (parent !== null) {
				shortestPath.push(parent);
				parent = visited.get(parent);
			}
			shortestPath.reverse();

			return shortestPath;
		}
		const neighbors = getNeighbors(cell);
		neighbors.forEach((neighbor) => {
			if (!visited.has(neighbor)) {
				queue.push(neighbor);
				visited.set(neighbor, cell);
			}
		});
	}

	// If no path is found, return an empty array
	return [];
}

function dfs(startCell, endCell) {
	// Stack to keep track of cells to be visited
	const stack = [startCell];

	// Map to keep track of visited cells and their parent cells
	const visited = new Map();
	visited.set(startCell, null);

	// Depth-First Search
	while (stack.length > 0) {
		const cell = stack.pop();
		if (cell === endCell) {
			// Trace back the path from end to start
			const shortestPath = [cell];
			let parent = visited.get(cell);
			while (parent !== null) {
				shortestPath.push(parent);
				parent = visited.get(parent);
			}
			shortestPath.reverse();

			return shortestPath;
		}
		const neighbors = getNeighbors(cell);
		neighbors.forEach((neighbor) => {
			if (!visited.has(neighbor)) {
				stack.push(neighbor);
				visited.set(neighbor, cell);
			}
		});
	}

	// If no path is found, return an empty array
	return [];
}

function dijkstra(startCell, endCell) {
	// Check if start and end cells are valid
	if (!startCell || !endCell) {
		console.log('Please select a start and end point');
		return [];
	}

	// Create a priority queue to keep track of unvisited cells
	const queue = new PriorityQueue();

	// Map to keep track of visited cells and their parent cells
	const visited = new Map();
	visited.set(startCell, null);

	// Get the coordinates of the start cell and the end cell
	const startCoords = getCellCoords(startCell);
	const endCoords = getCellCoords(endCell);

	// Object to keep track of the shortest distance to each cell
	const distances = {};
	distances[`${startCoords.x},${startCoords.y}`] = 0;

	// Initialize the priority queue with the start cell
	queue.enqueue(startCell, 0);

	// Dijkstra's Algorithm
	while (!queue.isEmpty()) {
		const current = queue.dequeue();

		if (current === endCell) {
			// Trace back the path from end to start
			const shortestPath = [current];
			let parent = visited.get(current);
			while (parent !== null) {
				shortestPath.push(parent);
				parent = visited.get(parent);
			}
			shortestPath.reverse();
			return shortestPath;
		}

		const neighbors = getNeighborsWithWalls(current);
		for (const neighbor of neighbors) {
			const neighborCoords = getCellCoords(neighbor.cell);
			const distance = distances[`${current.dataset.x},${current.dataset.y}`] + neighbor.weight; // Add the weight of the edge
			if (!distances[`${neighborCoords.x},${neighborCoords.y}`] || distance < distances[`${neighborCoords.x},${neighborCoords.y}`]) {
				distances[`${neighborCoords.x},${neighborCoords.y}`] = distance;
				visited.set(neighbor.cell, current);
				queue.enqueue(neighbor.cell, distance);
			}
		}
	}

	// If no path is found, return an empty array
	console.log('No path found');
	return [];
}






function getNeighbors(cell) {
	const neighbors = [];
	const { x, y } = getCellCoords(cell);

	if (x > 0 && maze[y][x - 1] === 0) {
		neighbors.push(getCell(x - 1, y));
	}
	if (x < numCols - 1 && maze[y][x + 1] === 0) {
		neighbors.push(getCell(x + 1, y));
	}
	if (y > 0 && maze[y - 1][x] === 0) {
		neighbors.push(getCell(x, y - 1));
	}
	if (y < numRows - 1 && maze[y + 1][x] === 0) {
		neighbors.push(getCell(x, y + 1));
	}

	return neighbors;
}


function getNeighborsWithWalls(cell) {
	const { x, y } = getCellCoords(cell);
	const neighbors = [];

	// Add horizontal and vertical neighbors
	const offsets = [-1, 0, 1];
	for (const xOffset of offsets) {
		for (const yOffset of offsets) {
			if (Math.abs(xOffset) === Math.abs(yOffset)) continue; // Skip diagonal neighbors
			const neighborX = x + xOffset;
			const neighborY = y + yOffset;
			if (neighborX < 0 || neighborX >= numCols || neighborY < 0 || neighborY >= numRows) continue; // Skip out-of-bounds neighbors
			const neighbor = getCell(neighborX, neighborY);
			const weight = Math.abs(maze[y][x] - maze[neighborY][neighborX]); // Compute the weight of the edge
			neighbors.push({ cell: neighbor, weight });
		}
	}

	return neighbors;
}


function getCell(x, y) {
	return document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
}

function getCellCoords(cell) {
	const x = parseInt(cell.dataset.x);
	const y = parseInt(cell.dataset.y);
	return { x, y };
}



