
import React from 'react';
import { PieceType } from '../types';
import { TETROMINOS } from '../constants';

interface PreviewProps {
  type: PieceType;
  hideTitle?: boolean;
}

const Preview: React.FC<PreviewProps> = ({ type, hideTitle = false }) => {
  const { shape, color } = TETROMINOS[type];
  
  return (
    <div className={hideTitle ? "bg-transparent" : "p-4 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl"}>
      {!hideTitle && <h3 className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 mb-3 tracking-widest text-center">Next</h3>}
      <div className="flex items-center justify-center h-12 w-12 md:h-16 md:w-16">
        <div 
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${shape[0].length}, 1fr)` }}
        >
          {shape.flat().map((filled, i) => (
            <div
              key={i}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-sm ${filled ? color : 'bg-transparent'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Preview;
