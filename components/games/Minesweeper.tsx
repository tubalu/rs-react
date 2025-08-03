'use client';

import { useCallback, useEffect, useState } from 'react';
import './Minesweeper.css';

interface Cell {
  id: string;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
}

interface DifficultyLevel {
  name: string;
  rows: number;
  cols: number;
  mines: number;
  description: string;
}

const DIFFICULTY_LEVELS: Record<string, DifficultyLevel> = {
  beginner: {
    name: 'Beginner',
    rows: 9,
    cols: 9,
    mines: 10,
    description: '9×9 grid, 10 mines',
  },
  intermediate: {
    name: 'Intermediate',
    rows: 16,
    cols: 16,
    mines: 40,
    description: '16×16 grid, 40 mines',
  },
  expert: {
    name: 'Expert',
    rows: 16,
    cols: 30,
    mines: 99,
    description: '16×30 grid, 99 mines',
  },
  nightmare: {
    name: 'Nightmare',
    rows: 20,
    cols: 35,
    mines: 150,
    description: '20×35 grid, 150 mines',
  },
};

const Minesweeper = () => {
  const [currentDifficulty, setCurrentDifficulty] =
    useState<string>('intermediate');
  const [screenDimensions, setScreenDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Calculate dynamic dimensions for Nightmare level
  const calculateNightmareDimensions = () => {
    if (typeof window === 'undefined')
      return { rows: 20, cols: 35, mines: 150 };

    // Cell size including borders (approximately 22px per cell)
    const cellSize = 22;
    // Reserve space for UI elements (difficulty selector, header, padding)
    const reservedHeight = 180;
    const reservedWidth = 40;

    // Calculate available space
    const availableWidth = screenDimensions.width - reservedWidth;
    const availableHeight = screenDimensions.height - reservedHeight;

    // Calculate maximum grid dimensions
    const maxCols = Math.floor(availableWidth / cellSize);
    const maxRows = Math.floor(availableHeight / cellSize);

    // Ensure minimum dimensions and reasonable limits
    const cols = Math.max(25, Math.min(maxCols, 50));
    const rows = Math.max(15, Math.min(maxRows, 35));

    // Calculate mines (approximately 22% density for nightmare)
    const totalCells = rows * cols;
    const mines = Math.floor(totalCells * 0.22);

    return { rows, cols, mines };
  };

  const nightmareDims = calculateNightmareDimensions();
  const difficulty =
    currentDifficulty === 'nightmare'
      ? {
          ...DIFFICULTY_LEVELS.nightmare,
          ...nightmareDims,
          description: `${nightmareDims.rows}×${nightmareDims.cols} grid, ${nightmareDims.mines} mines (Screen-Fitted)`,
        }
      : DIFFICULTY_LEVELS[currentDifficulty];

  const ROWS = difficulty.rows;
  const COLS = difficulty.cols;
  const MINES = difficulty.mines;

  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>(
    'playing',
  );
  const [mineCount, setMineCount] = useState(MINES);
  const [time, setTime] = useState(0);
  const [firstClick, setFirstClick] = useState(true);
  const [mouseButtons, setMouseButtons] = useState({
    left: false,
    right: false,
  });
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const createEmptyBoard = useCallback(() => {
    return Array(ROWS)
      .fill(null)
      .map((_, rowIndex) =>
        Array(COLS)
          .fill(null)
          .map((_, colIndex) => ({
            id: `${rowIndex}-${colIndex}`,
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborCount: 0,
          })),
      );
  }, [ROWS, COLS]);

  const placeMines = useCallback(
    (board: Cell[][], firstClickRow: number, firstClickCol: number) => {
      const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
      let minesPlaced = 0;

      while (minesPlaced < MINES) {
        const row = Math.floor(Math.random() * ROWS);
        const col = Math.floor(Math.random() * COLS);

        // Don't place mine on first click or if already has mine
        if (
          !newBoard[row][col].isMine &&
          !(row === firstClickRow && col === firstClickCol)
        ) {
          newBoard[row][col].isMine = true;
          minesPlaced++;
        }
      }

      // Calculate neighbor counts
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          if (!newBoard[row][col].isMine) {
            let count = 0;
            for (let i = -1; i <= 1; i++) {
              for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (
                  newRow >= 0 &&
                  newRow < ROWS &&
                  newCol >= 0 &&
                  newCol < COLS &&
                  newBoard[newRow][newCol].isMine
                ) {
                  count++;
                }
              }
            }
            newBoard[row][col].neighborCount = count;
          }
        }
      }

      return newBoard;
    },
    [ROWS, COLS, MINES],
  );

  const initializeGame = useCallback(() => {
    const newBoard = createEmptyBoard();
    setBoard(newBoard);
    setGameState('playing');
    setMineCount(MINES);
    setTime(0);
    setFirstClick(true);
    setHoveredCell(null);
    setMouseButtons({ left: false, right: false });
  }, [createEmptyBoard, MINES]);

  const handleDifficultyChange = (newDifficulty: string) => {
    setCurrentDifficulty(newDifficulty);
    // Game will be reinitialized when difficulty changes
  };

  // Detect screen dimensions for Nightmare level
  useEffect(() => {
    const updateDimensions = () => {
      setScreenDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Initial dimensions
    updateDimensions();

    // Listen for window resize
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Reinitialize game when difficulty changes or screen dimensions change (for Nightmare)
  // biome-ignore lint/correctness/useExhaustiveDependencies: screenDimensions needed for nightmare mode calculations
  useEffect(() => {
    if (currentDifficulty === 'nightmare') {
      initializeGame();
    }
  }, [currentDifficulty, screenDimensions, initializeGame]);

  // Reinitialize game when difficulty changes (for non-nightmare levels)
  useEffect(() => {
    if (currentDifficulty !== 'nightmare') {
      initializeGame();
    }
  }, [currentDifficulty, initializeGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing' && !firstClick) {
      interval = setInterval(() => {
        setTime((prev) => Math.min(prev + 1, 999));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, firstClick]);

  const revealCell = (row: number, col: number) => {
    if (
      gameState !== 'playing' ||
      board[row][col].isRevealed ||
      board[row][col].isFlagged
    ) {
      return;
    }

    let newBoard = [...board];

    // First click - place mines
    if (firstClick) {
      newBoard = placeMines(newBoard, row, col);
      setFirstClick(false);
    }

    const revealCells = (r: number, c: number) => {
      if (
        r < 0 ||
        r >= ROWS ||
        c < 0 ||
        c >= COLS ||
        newBoard[r][c].isRevealed ||
        newBoard[r][c].isFlagged
      ) {
        return;
      }

      newBoard[r][c].isRevealed = true;

      // If it's a mine, game over
      if (newBoard[r][c].isMine) {
        setGameState('lost');
        // Reveal all mines
        for (let i = 0; i < ROWS; i++) {
          for (let j = 0; j < COLS; j++) {
            if (newBoard[i][j].isMine) {
              newBoard[i][j].isRevealed = true;
            }
          }
        }
        return;
      }

      // If no neighboring mines, reveal adjacent cells
      if (newBoard[r][c].neighborCount === 0) {
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            revealCells(r + i, c + j);
          }
        }
      }
    };

    revealCells(row, col);
    setBoard(newBoard);

    // Check for win condition
    let revealedCount = 0;
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (newBoard[i][j].isRevealed && !newBoard[i][j].isMine) {
          revealedCount++;
        }
      }
    }

    if (revealedCount === ROWS * COLS - MINES) {
      setGameState('won');
      setMineCount(0);
    }
  };

  const toggleFlag = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameState !== 'playing' || board[row][col].isRevealed) {
      return;
    }

    const newBoard = [...board];
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;

    setMineCount((prev) =>
      newBoard[row][col].isFlagged ? prev - 1 : prev + 1,
    );
    setBoard(newBoard);
  };

  const getAdjacentCells = (row: number, col: number) => {
    const adjacent = [];
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i;
        const newCol = col + j;
        if (
          newRow >= 0 &&
          newRow < ROWS &&
          newCol >= 0 &&
          newCol < COLS &&
          !(i === 0 && j === 0)
        ) {
          adjacent.push({ row: newRow, col: newCol });
        }
      }
    }
    return adjacent;
  };

  const chordClick = (row: number, col: number) => {
    if (
      gameState !== 'playing' ||
      !board[row][col].isRevealed ||
      board[row][col].isMine
    ) {
      return;
    }

    const adjacentCells = getAdjacentCells(row, col);
    const flaggedCount = adjacentCells.filter(
      ({ row: r, col: c }) => board[r][c].isFlagged,
    ).length;

    // Only chord if the number of flags matches the cell's number
    if (flaggedCount === board[row][col].neighborCount) {
      const newBoard = [...board];
      let hitMine = false;

      // First click - place mines if needed
      if (firstClick) {
        const boardWithMines = placeMines(newBoard, row, col);
        newBoard.splice(0, newBoard.length, ...boardWithMines);
        setFirstClick(false);
      }

      const revealCells = (r: number, c: number) => {
        if (
          r < 0 ||
          r >= ROWS ||
          c < 0 ||
          c >= COLS ||
          newBoard[r][c].isRevealed ||
          newBoard[r][c].isFlagged
        ) {
          return;
        }

        newBoard[r][c].isRevealed = true;

        if (newBoard[r][c].isMine) {
          hitMine = true;
          return;
        }

        if (newBoard[r][c].neighborCount === 0) {
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              revealCells(r + i, c + j);
            }
          }
        }
      };

      // Reveal all unflagged adjacent cells
      for (const { row: r, col: c } of adjacentCells) {
        if (!newBoard[r][c].isFlagged) {
          revealCells(r, c);
        }
      }

      if (hitMine) {
        setGameState('lost');
        // Reveal all mines
        for (let i = 0; i < ROWS; i++) {
          for (let j = 0; j < COLS; j++) {
            if (newBoard[i][j].isMine) {
              newBoard[i][j].isRevealed = true;
            }
          }
        }
      }

      setBoard(newBoard);

      // Check for win condition
      if (!hitMine) {
        let revealedCount = 0;
        for (let i = 0; i < ROWS; i++) {
          for (let j = 0; j < COLS; j++) {
            if (newBoard[i][j].isRevealed && !newBoard[i][j].isMine) {
              revealedCount++;
            }
          }
        }

        if (revealedCount === ROWS * COLS - MINES) {
          setGameState('won');
          setMineCount(0);
        }
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent, row: number, col: number) => {
    if (e.button === 0) {
      // Left button
      setMouseButtons((prev) => ({ ...prev, left: true }));
      setHoveredCell({ row, col });
    } else if (e.button === 2) {
      // Right button
      setMouseButtons((prev) => ({ ...prev, right: true }));
      setHoveredCell({ row, col });
    }
  };

  const handleMouseUp = (e: React.MouseEvent, row: number, col: number) => {
    const wasLeftDown = mouseButtons.left;
    const wasRightDown = mouseButtons.right;

    if (e.button === 0) {
      // Left button
      setMouseButtons((prev) => ({ ...prev, left: false }));
      setHoveredCell(null);

      // If both buttons were down, perform chord click
      if (wasLeftDown && wasRightDown) {
        chordClick(row, col);
      } else if (!wasRightDown) {
        // Normal left click only if right wasn't also down
        revealCell(row, col);
      }
    } else if (e.button === 2) {
      // Right button
      setMouseButtons((prev) => ({ ...prev, right: false }));
      setHoveredCell(null);

      // If both buttons were down, perform chord click
      if (wasLeftDown && wasRightDown) {
        chordClick(row, col);
      }
    }
  };

  const getFaceEmoji = () => {
    if (gameState === 'lost') return '😵';
    if (gameState === 'won') return '😎';
    return '🙂';
  };

  const getCellContent = (cell: Cell) => {
    if (cell.isFlagged) return '🚩';
    if (!cell.isRevealed) return '';
    if (cell.isMine) return '💣';
    if (cell.neighborCount === 0) return '';
    return cell.neighborCount;
  };

  const getCellClass = (cell: Cell, rowIndex: number, colIndex: number) => {
    let className = 'cell';
    if (cell.isRevealed) {
      className += ' revealed';
      if (cell.isMine) className += ' mine';
      else if (cell.neighborCount > 0)
        className += ` number-${cell.neighborCount}`;
    } else {
      className += ' hidden';

      // Add pressed state for chord clicking on 9 cells around hovered cell
      if (
        mouseButtons.left &&
        mouseButtons.right &&
        !cell.isFlagged &&
        hoveredCell
      ) {
        const rowDiff = Math.abs(rowIndex - hoveredCell.row);
        const colDiff = Math.abs(colIndex - hoveredCell.col);
        // Check if this cell is within the 3x3 grid around the hovered cell
        if (rowDiff <= 1 && colDiff <= 1) {
          className += ' pressed';
        }
      }
    }
    return className;
  };

  return (
    <div
      className={`minesweeper ${currentDifficulty === 'nightmare' ? 'nightmare-mode' : ''}`}
    >
      <div className="difficulty-selector">
        <label htmlFor="difficulty-select">Difficulty:</label>
        <select
          id="difficulty-select"
          value={currentDifficulty}
          onChange={(e) => handleDifficultyChange(e.target.value)}
          className="difficulty-select"
        >
          {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
            <option key={key} value={key}>
              {level.name} - {level.description}
            </option>
          ))}
        </select>
      </div>

      <div className="game-header">
        <div className="counter">{String(mineCount).padStart(3, '0')}</div>
        <button type="button" className="reset-button" onClick={initializeGame}>
          {getFaceEmoji()}
        </button>
        <div className="counter">{String(time).padStart(3, '0')}</div>
      </div>

      <div className="game-board">
        {board.map((row, rowIndex) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: Fixed grid positions never reorder
          <div key={`game-row-${rowIndex}`} className="row">
            {row.map((cell: Cell, colIndex: number) => (
              <button
                type="button"
                key={cell.id}
                className={getCellClass(cell, rowIndex, colIndex)}
                onMouseDown={(e) => handleMouseDown(e, rowIndex, colIndex)}
                onMouseUp={(e) => handleMouseUp(e, rowIndex, colIndex)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (!mouseButtons.left) {
                    toggleFlag(e, rowIndex, colIndex);
                  }
                }}
                disabled={gameState !== 'playing'}
              >
                {getCellContent(cell)}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Minesweeper;
