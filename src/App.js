import { Maze } from "./utlis.js";
import { useState, useEffect, useRef, useCallback } from "react";

function App() {
	const [gridSize, setGridSize] = useState(10);
	const [inputValue, setInputValue] = useState(gridSize);
	const [grid, setGrid] = useState(null);
	const gridRef = useRef(grid);
	const [currentPos, setCurrentPos] = useState([0, 0]);
	const currentPosRef = useRef(currentPos);
	const [clickCount, setClickCount] = useState(0);
	const [checked, setChecked] = useState(false);
	const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
	const maze = useRef();

	const generateClassName = (walls, r, c) => {
		let className = ["", ""];
		let cell = gridRef.current[r][c];

		Object.keys(walls).forEach((wall) => {
			if (walls[wall]) className[0] += ` border-${wall}`;
		});

		if (cell.path && !cell.playerVisited && checked) className[1] += "path";
		if (r === currentPos[0] && c === currentPos[1]) {
			cell.playerVisited = true;
			className[1] = "player-position";
		}
		if (isLastCell(r, c)) className[1] += " finish";

		return className;
	};

	const drawMaze = () => {
		if (gridRef.current !== null) {
			return gridRef.current.map((row, i) => {
				return (
					<tr className="table-row" key={`${i}`}>
						{row.map((col, j) => {
							let [cellClassName, playerPosClassName] =
								generateClassName(col.walls, i, j);
							return (
								<td
									className={`table-col${cellClassName}`}
									key={`${i}${j}`}
								>
									<div className={playerPosClassName} />
								</td>
							);
						})}
					</tr>
				);
			});
		}
	};

	const isLastCell = useCallback(
		(row, column) => {
			return row === gridSize - 1 && column === gridSize - 1;
		},
		[gridSize]
	);

	const helper = useCallback(
		(direction) => {
			let nextPos = maze.current.movePlayerPos(
				[...currentPosRef.current],
				direction
			);
			let currentCell =
				gridRef.current[currentPosRef.current[0]][
					currentPosRef.current[1]
				];
			let nextCell = gridRef.current[nextPos[0]][nextPos[1]];
			let [currentPosRow, currentPosCol] = currentPosRef.current;
			let [nextPosRow, nextPosCol] = nextPos;

			if (currentPosRow !== nextPosRow || currentPosCol !== nextPosCol) {
				if (nextCell.playerVisited) {
					currentCell.playerVisited = false;
				} else if (
					!nextCell.path &&
					!isLastCell(nextPosRow, nextPosCol)
				) {
					currentCell.playerVisited = false;
					currentCell.path = true;
				}
			}

			return nextPos;
		},
		[isLastCell]
	);

	const controls = useCallback(
		(e) => {
			if (
				!isLastCell(currentPosRef.current[0], currentPosRef.current[1])
			) {
				const handleMove = (dir) => {
					e.preventDefault();
					let nextPos = helper(dir);
					currentPosRef.current = [...nextPos];
					setCurrentPos(() => [...nextPos]);
				};

				if (
					e.key === "ArrowLeft" ||
					e.key === "a" ||
					e.target.className === "left"
				) {
					handleMove("left");
				}

				if (
					e.key === "ArrowRight" ||
					e.key === "d" ||
					e.target.className === "right"
				) {
					handleMove("right");
				}

				if (
					e.key === "ArrowUp" ||
					e.key === "w" ||
					e.target.className === "up"
				) {
					handleMove("top");
				}

				if (
					e.key === "ArrowDown" ||
					e.key === "s" ||
					e.target.className === "down"
				) {
					handleMove("bottom");
				}
			}
		},
		[helper, isLastCell]
	);

	const showControls = () => {
		if (isMobile) {
			return (
				<div className="controls_container">
					<button className="arrow" onClick={controls}>
						<p className="up">↑</p>
					</button>
					<div className="left-right">
						<button className="arrow" onClick={controls}>
							<p className="left">↑</p>
						</button>
						<button className="arrow" onClick={controls}>
							<p className="down">↑</p>
						</button>
						<button className="arrow" onClick={controls}>
							<p className="right">↑</p>
						</button>
					</div>
				</div>
			);
		}
	};

	const restartGame = () => {
		setCurrentPos([0, 0]);
		currentPosRef.current = [0, 0];
		setGridSize(inputValue);
		setClickCount(clickCount + 1);
	};

	const checkMazeSize = (e) => {
		if (e.target.value < 5 || e.target.value > maxLimit()) {
			if (
				Math.abs(e.target.value - maxLimit()) <
				Math.abs(e.target.value - 5)
			) {
				setInputValue(maxLimit());
			} else {
				setInputValue(5);
			}
		}
	};

	const maxLimit = () => {
		return isMobile ? 14 : 40;
	};

	useEffect(() => {
		maze.current = new Maze(gridSize);
		maze.current.setup();
		let grid = maze.current.draw();
		gridRef.current = grid;
		setGrid(grid);

		document.addEventListener("keydown", controls);
		return () => document.removeEventListener("keydown", controls);
	}, [clickCount, controls, gridSize]);

	return (
		<>
			<div className="container">
				<div className="input_container">
					<p>
						{isMobile
							? "Use on-screen controls to play"
							: "Use WASD keys or Arrow keys to play"}
					</p>
					<div className="checkbox">
						<p>Cheat Mode</p>
						<input
							type={"checkbox"}
							checked={checked}
							onChange={() => setChecked(!checked)}
						/>
					</div>
					<p>{`Maze Size (5-${maxLimit()})`}</p>
					<input
						className="maze_size"
						type="number"
						min={5}
						max={maxLimit()}
						name="maze-size"
						value={inputValue}
						onChange={(e) =>
							setInputValue(parseInt(e.target.value))
						}
						onBlur={checkMazeSize}
					/>
					<button onClick={restartGame}>Restart game</button>
				</div>
				<table style={{ width: gridSize * 30 }}>
					<tbody>{drawMaze()}</tbody>
				</table>
				{showControls()}
			</div>
		</>
	);
};

export default App;
