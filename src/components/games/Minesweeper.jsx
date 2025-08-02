import { useState, useEffect, useCallback } from 'react';
import './Minesweeper.css';

const Minesweeper = () => {
  const ROWS = 16;
  const COLS = 16;
  const MINES = 40;

  const [board, setBoard] = useState([]);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'lost'
  const [mineCount, setMineCount] = useState(MINES);
  const [time, setTime] = useState(0);
  const [firstClick, setFirstClick] = useState(true);
  const [mouseButtons, setMouseButtons] = useState({ left: false, right: false });

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

  const placeMines = useCallback((board, firstClickRow, firstClickCol) => {
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
    let interval;
    if (gameState === 'playing' && !firstClick) {
      interval = setInterval(() => {
        setTime(prev => Math.min(prev + 1, 999));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, firstClick]);

  const revealCell = (row, col) => {
    if (gameState !== 'playing' || board[row][col].isRevealed || board[row][col].isFlagged) {
      return;
    }

    let newBoard = [...board];

    // First click - place mines
    if (firstClick) {
      newBoard = placeMines(newBoard, row, col);
      setFirstClick(false);
    }

    const revealCells = (r, c) => {
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

  const toggleFlag = (e, row, col) => {
    e.preventDefault();
    if (gameState !== 'playing' || board[row][col].isRevealed) {
      return;
    }

    const newBoard = [...board];
    newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;
    
    setMineCount(prev => newBoard[row][col].isFlagged ? prev - 1 : prev + 1);
    setBoard(newBoard);
  };

  const getAdjacentCells = (row, col) => {
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

  const chordClick = (row, col) => {
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

      const revealCells = (r, c) => {
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

  const handleMouseDown = (e, row, col) => {
    if (e.button === 0) { // Left button
      setMouseButtons(prev => ({ ...prev, left: true }));
    } else if (e.button === 2) { // Right button
      setMouseButtons(prev => ({ ...prev, right: true }));
    }
  };

  const handleMouseUp = (e, row, col) => {
    const wasLeftDown = mouseButtons.left;
    const wasRightDown = mouseButtons.right;

    if (e.button === 0) { // Left button
      setMouseButtons(prev => ({ ...prev, left: false }));
      
      // If both buttons were down, perform chord click
      if (wasLeftDown && wasRightDown) {
        chordClick(row, col);
      } else if (!wasRightDown) {
        // Normal left click only if right wasn't also down
        revealCell(row, col);
      }
    } else if (e.button === 2) { // Right button
      setMouseButtons(prev => ({ ...prev, right: false }));
      
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

  const getCellContent = (cell) => {
    if (cell.isFlagged) return '🚩';
    if (!cell.isRevealed) return '';
    if (cell.isMine) return '💣';
    if (cell.neighborCount === 0) return '';
    return cell.neighborCount;
  };

  const getCellClass = (cell) => {
    let className = 'cell';
    if (cell.isRevealed) {
      className += ' revealed';
      if (cell.isMine) className += ' mine';
      else if (cell.neighborCount > 0) className += ` number-${cell.neighborCount}`;
    } else {
      className += ' hidden';
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
            {row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={getCellClass(cell)}
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