
import { PieceType } from './types';

export const COLS = 10;
export const ROWS = 20;
export const INITIAL_DROP_TIME = 800;
export const MIN_DROP_TIME = 100;
export const DROP_TIME_DECREMENT = 20;

export const TETROMINOS: Record<PieceType, { shape: number[][]; color: string }> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)]',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.6)]',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]',
  },
};
