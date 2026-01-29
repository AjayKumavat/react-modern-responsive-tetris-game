
import React from 'react';
import { Grid, Piece } from '../types';
import { COLS, ROWS } from '../constants';

interface TetrisBoardProps {
  grid: Grid;
  activePiece: Piece | null;
}

const TetrisBoard: React.FC<TetrisBoardProps> = ({ grid, activePiece }) => {
  const displayGrid = grid.map((row) => [...row]);
  if (activePiece) {
    activePiece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const gridY = activePiece.position.y + y;
          const gridX = activePiece.position.x + x;
          if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
            displayGrid[gridY][gridX] = activePiece.color;
          }
        }
      });
    });
  }

  return (
    <div className="relative p-1 bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-xl border-2 border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center h-full max-h-full aspect-[1/2]">
      <div 
        className="grid gap-px bg-slate-300 dark:bg-slate-700 h-full w-full"
        style={{ 
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
        }}
      >
        {displayGrid.flat().map((color, i) => (
          <div
            key={i}
            className={`w-full h-full rounded-sm transition-all duration-100 ${
              color || 'bg-slate-50 dark:bg-slate-900'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TetrisBoard;
