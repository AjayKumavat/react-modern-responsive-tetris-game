
import { useState, useCallback, useEffect, useRef } from 'react';
import { COLS, ROWS, TETROMINOS, INITIAL_DROP_TIME, MIN_DROP_TIME, DROP_TIME_DECREMENT } from '../constants';
import { Piece, PieceType, Grid, Position, GameStatus } from '../types';

interface TetrisOptions {
  onMove?: () => void;
  onRotate?: () => void;
  onClear?: (count: number) => void;
  onGameOver?: () => void;
  onHardDrop?: () => void;
}

export const useTetris = (options?: TetrisOptions) => {
  const [grid, setGrid] = useState<Grid>(
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  );
  const [activePiece, setActivePiece] = useState<Piece | null>(null);
  const [nextPieceType, setNextPieceType] = useState<PieceType>(getRandomPieceType());
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [linesCleared, setLinesCleared] = useState(0);

  const dropTimeRef = useRef<number>(INITIAL_DROP_TIME);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function getRandomPieceType(): PieceType {
    const keys = Object.keys(TETROMINOS) as PieceType[];
    return keys[Math.floor(Math.random() * keys.length)];
  }

  const createPiece = useCallback((type: PieceType): Piece => {
    const { shape, color } = TETROMINOS[type];
    return {
      type,
      shape,
      color,
      position: { x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 }
    };
  }, []);

  const isValidMove = useCallback(
    (shape: number[][], position: Position, currentGrid: Grid) => {
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            const newX = position.x + x;
            const newY = position.y + y;
            if (
              newX < 0 ||
              newX >= COLS ||
              newY >= ROWS ||
              (newY >= 0 && currentGrid[newY][newX] !== null)
            ) {
              return false;
            }
          }
        }
      }
      return true;
    },
    []
  );

  const performLock = useCallback((pieceToLock: Piece, currentGrid: Grid, currentNextType: PieceType) => {
    const newGrid = [...currentGrid.map((row) => [...row])];
    pieceToLock.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const gridY = pieceToLock.position.y + y;
          const gridX = pieceToLock.position.x + x;
          if (gridY >= 0) {
            newGrid[gridY][gridX] = pieceToLock.color;
          }
        }
      });
    });

    let clearedCount = 0;
    const filteredGrid = newGrid.filter((row) => {
      const isFull = row.every((cell) => cell !== null);
      if (isFull) clearedCount++;
      return !isFull;
    });

    while (filteredGrid.length < ROWS) {
      filteredGrid.unshift(Array(COLS).fill(null));
    }

    if (clearedCount > 0) {
      const linePoints = [0, 100, 300, 500, 800];
      const points = linePoints[clearedCount] * level;
      setScore((prev) => prev + points);
      setLinesCleared((prev) => {
        const nextLines = prev + clearedCount;
        if (nextLines >= level * 10) {
          setLevel((l) => l + 1);
          dropTimeRef.current = Math.max(MIN_DROP_TIME, INITIAL_DROP_TIME - level * DROP_TIME_DECREMENT);
        }
        return nextLines;
      });
      options?.onClear?.(clearedCount);
    }

    setGrid(filteredGrid);
    
    const nextPiece = createPiece(currentNextType);
    if (!isValidMove(nextPiece.shape, nextPiece.position, filteredGrid)) {
      setStatus(GameStatus.GAME_OVER);
      setActivePiece(null);
      options?.onGameOver?.();
    } else {
      setActivePiece(nextPiece);
      setNextPieceType(getRandomPieceType());
    }
  }, [level, options, createPiece, isValidMove]);

  const lockPiece = useCallback(() => {
    if (!activePiece) return;
    performLock(activePiece, grid, nextPieceType);
  }, [activePiece, grid, nextPieceType, performLock]);

  const resetGame = useCallback(() => {
    setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    const firstType = getRandomPieceType();
    const secondType = getRandomPieceType();
    setActivePiece(createPiece(firstType));
    setNextPieceType(secondType);
    setStatus(GameStatus.PLAYING);
    dropTimeRef.current = INITIAL_DROP_TIME;
  }, [createPiece]);

  const rotate = useCallback(() => {
    if (!activePiece || status !== GameStatus.PLAYING) return;
    const newShape = activePiece.shape[0].map((_, index) =>
      activePiece.shape.map((col) => col[index]).reverse()
    );
    if (isValidMove(newShape, activePiece.position, grid)) {
      setActivePiece({ ...activePiece, shape: newShape });
      options?.onRotate?.();
    }
  }, [activePiece, grid, isValidMove, status, options]);

  const moveSide = useCallback(
    (dir: number) => {
      if (!activePiece || status !== GameStatus.PLAYING) return;
      const newPos = { ...activePiece.position, x: activePiece.position.x + dir };
      if (isValidMove(activePiece.shape, newPos, grid)) {
        setActivePiece({ ...activePiece, position: newPos });
        options?.onMove?.();
      }
    },
    [activePiece, grid, isValidMove, status, options]
  );

  const moveDown = useCallback(() => {
    if (!activePiece || status !== GameStatus.PLAYING) return;
    const newPos = { ...activePiece.position, y: activePiece.position.y + 1 };
    if (isValidMove(activePiece.shape, newPos, grid)) {
      setActivePiece({ ...activePiece, position: newPos });
    } else {
      lockPiece();
    }
  }, [activePiece, grid, isValidMove, lockPiece, status]);

  const hardDrop = useCallback(() => {
    if (!activePiece || status !== GameStatus.PLAYING) return;
    let currentY = activePiece.position.y;
    while (isValidMove(activePiece.shape, { ...activePiece.position, y: currentY + 1 }, grid)) {
      currentY++;
    }
    const finalPiece = { ...activePiece, position: { ...activePiece.position, y: currentY } };
    options?.onHardDrop?.();
    performLock(finalPiece, grid, nextPieceType);
  }, [activePiece, grid, isValidMove, status, options, performLock, nextPieceType]);

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      timerRef.current = setInterval(moveDown, dropTimeRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [moveDown, status]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  return {
    grid,
    activePiece,
    nextPieceType,
    status,
    score,
    highScore,
    level,
    linesCleared,
    resetGame,
    pauseGame: () => setStatus((s) => (s === GameStatus.PLAYING ? GameStatus.PAUSED : GameStatus.PLAYING)),
    moveSide,
    moveDown,
    rotate,
    hardDrop
  };
};
