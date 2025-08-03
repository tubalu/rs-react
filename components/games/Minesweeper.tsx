'use client';

import { useState, useEffect, useCallback } from 'react';
import './Minesweeper.css';

const Minesweeper = () => {
  const ROWS = 16;
  const COLS = 16;
  const MINES = 40;

  const [board, setBoard] = useState<any[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [mineCount, setMineCount] = useState(MINES);
  const [time, setTime] = useState(0);
  const [firstClick, setFirstClick] = useState(true);
  const [mouseButtons, setMouseButtons] = useState({ left: false, right: false });
  const [hoveredCell, setHoveredCell] = useState<{row: number, col: number} | null>(null);

  const createEmptyBoard = useCallback(() => {
    return Array(ROWS).fill(null).map(() =>
      Array(COLS).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborCount: 0
      }))
    );
  }, []);

  const placeMines = useCallback((board: any[][], firstClickRow: number, firstClickCol: number) => {
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    let minesPlaced = 0;

    while (minesPlaced < MINES) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);

      // Don't place mine on first click or if already has mine
      if (!newBoard[row][col].isMine && 
          !(row === firstClickRow && col === firstClickCol)) {
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
              if (newRow >= 0 && newRow < ROWS && 
                  newCol >= 0 && newCol < COLS && 
                  newBoard[newRow][newCol].isMine) {
                count++;
              }
            }
          }
          newBoard[row][col].neighborCount = count;
        }
      }
    }

    return newBoard;
  }, []);

  const initializeGame = useCallback(() => {
    const newBoard = createEmptyBoard();
    setBoard(newBoard);
    setGameState('playing');
    setMineCount(MINES);
    setTime(0);
    setFirstClick(true);
  }, [createEmptyBoard]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing' && !firstClick) {
      interval = setInterval(() => {
        setTime(prev => Math.min(prev + 1, 999));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, firstClick]);

  const revealCell = (row: number, col: number) => {
    if (gameState !== 'playing' || board[row][col].isRevealed || board[row][col].isFlagged) {
      return;
    }

    let newBoard = [...board];

    // First click - place mines
    if (firstClick) {
      newBoard = placeMines(newBoard, row, col);
      setFirstClick(false);
    }

    const revealCells = (r: number, c: number) => {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || 
          newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) {
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
    
    setMineCount(prev => newBoard[row][col].isFlagged ? prev - 1 : prev + 1);
    setBoard(newBoard);
  };

  const getAdjacentCells = (row: number, col: number) => {
    const adjacent = [];
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i;
        const newCol = col + j;
        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && !(i === 0 && j === 0)) {
          adjacent.push({ row: newRow, col: newCol });
        }
      }
    }
    return adjacent;
  };

  const chordClick = (row: number, col: number) => {
    if (gameState !== 'playing' || !board[row][col].isRevealed || board[row][col].isMine) {
      return;
    }

    const adjacentCells = getAdjacentCells(row, col);
    const flaggedCount = adjacentCells.filter(({row: r, col: c}) => board[r][c].isFlagged).length;
    
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
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS || 
            newBoard[r][c].isRevealed || newBoard[r][c].isFlagged) {
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
      adjacentCells.forEach(({row: r, col: c}) => {
        if (!newBoard[r][c].isFlagged) {
          revealCells(r, c);
        }
      });

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
    if (e.button === 0) { // Left button
      setMouseButtons(prev => ({ ...prev, left: true }));
      setHoveredCell({ row, col });
    } else if (e.button === 2) { // Right button
      setMouseButtons(prev => ({ ...prev, right: true }));
      setHoveredCell({ row, col });
    }
  };

  const handleMouseUp = (e: React.MouseEvent, row: number, col: number) => {
    const wasLeftDown = mouseButtons.left;
    const wasRightDown = mouseButtons.right;

    if (e.button === 0) { // Left button
      setMouseButtons(prev => ({ ...prev, left: false }));
      setHoveredCell(null);
      
      // If both buttons were down, perform chord click
      if (wasLeftDown && wasRightDown) {
        chordClick(row, col);
      } else if (!wasRightDown) {
        // Normal left click only if right wasn't also down
        revealCell(row, col);
      }
    } else if (e.button === 2) { // Right button
      setMouseButtons(prev => ({ ...prev, right: false }));
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

  const getCellContent = (cell: any) => {
    if (cell.isFlagged) return '🚩';
    if (!cell.isRevealed) return '';
    if (cell.isMine) return '💣';
    if (cell.neighborCount === 0) return '';
    return cell.neighborCount;
  };

  const getCellClass = (cell: any, rowIndex: number, colIndex: number) => {
    let className = 'cell';
    if (cell.isRevealed) {
      className += ' revealed';
      if (cell.isMine) className += ' mine';
      else if (cell.neighborCount > 0) className += ` number-${cell.neighborCount}`;
    } else {
      className += ' hidden';
      
      // Add pressed state for chord clicking on 9 cells around hovered cell
      if (mouseButtons.left && mouseButtons.right && !cell.isFlagged && hoveredCell) {
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
    <div className="minesweeper">
      <div className="game-header">
        <div className="counter">{String(mineCount).padStart(3, '0')}</div>
        <button className="reset-button" onClick={initializeGame}>
          {getFaceEmoji()}
        </button>
        <div className="counter">{String(time).padStart(3, '0')}</div>
      </div>
      
      <div className="game-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell: any, colIndex: number) => (
              <button
                key={`${rowIndex}-${colIndex}`}
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