
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Moon, Sun, Music, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { useTetris } from './hooks/useTetris';
import TetrisBoard from './components/TetrisBoard';
import Preview from './components/Preview';
import MobileControls from './components/MobileControls';
import { GameStatus } from './types';

/**
 * Audio assets are referenced locally from an 'assets' folder for offline support.
 * Updated with a new set of reliable Tetris sound effects.
 * PLEASE DOWNLOAD THESE FILES AND PLACE THEM IN AN 'assets' FOLDER IN YOUR PROJECT ROOT.
 */
const SFX_REMOTE_BASE = '/assets/';
const SFX_REMOTE_URLS = {
  MOVE: SFX_REMOTE_BASE + 'move.mp3',
  ROTATE: SFX_REMOTE_BASE + 'rotate.mp3',
  CLEAR: SFX_REMOTE_BASE + 'clear.mp3',
  GAMEOVER: SFX_REMOTE_BASE + 'gameover.mp3',
  DROP: SFX_REMOTE_BASE + 'drop.mp3'
};

const SFX_URLS = {
  MOVE: '/assets/move.mp3',          // Download: https://raw.githubusercontent.com/dionyziz/canvas-tetris/master/sounds/move.mp3
  ROTATE: '/assets/rotate.mp3',      // Download: https://raw.githubusercontent.com/dionyziz/canvas-tetris/master/sounds/rotate.mp3
  CLEAR: '/assets/clear.mp3',        // Download: https://raw.githubusercontent.com/dionyziz/canvas-tetris/master/sounds/line.mp3
  GAMEOVER: '/assets/gameover.mp3',  // Download: https://raw.githubusercontent.com/dionyziz/canvas-tetris/master/sounds/gameover.mp3
  DROP: '/assets/drop.mp3'           // Download: https://raw.githubusercontent.com/dionyziz/canvas-tetris/master/sounds/fall.mp3
};

const BG_MUSIC_URL = '/assets/bg-music.mp3'; 
const BG_MUSIC_REMOTE = '/assets/bg-music.mp3';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sfxRefs = {
    move: useRef<HTMLAudioElement | null>(null),
    rotate: useRef<HTMLAudioElement | null>(null),
    clear: useRef<HTMLAudioElement | null>(null),
    gameover: useRef<HTMLAudioElement | null>(null),
    drop: useRef<HTMLAudioElement | null>(null)
  };

  const playSFX = useCallback((key: keyof typeof sfxRefs) => {
    if (!soundEnabled) return; 
    const audio = sfxRefs[key].current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Fallback for missing local assets
        console.warn(`Local audio file missing for ${key}. Reverting to remote source.`);
        const remoteUrl = (SFX_REMOTE_URLS as any)[key.toUpperCase()];
        if (remoteUrl) {
           const remoteAudio = new Audio(remoteUrl);
           remoteAudio.play().catch(() => {});
        }
      });
    }
  }, [soundEnabled]);

  const {
    grid,
    activePiece,
    nextPieceType,
    status,
    score,
    highScore,
    level,
    linesCleared,
    resetGame,
    pauseGame,
    moveSide,
    moveDown,
    rotate,
    hardDrop
  } = useTetris({
    onMove: () => playSFX('move'),
    onRotate: () => playSFX('rotate'),
    onClear: () => playSFX('clear'),
    onGameOver: () => playSFX('gameover'),
    onHardDrop: () => playSFX('drop')
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (status !== GameStatus.PLAYING) return;
    switch (e.key) {
      case 'ArrowLeft': moveSide(-1); break;
      case 'ArrowRight': moveSide(1); break;
      case 'ArrowDown': moveDown(); break;
      case 'ArrowUp': rotate(); break;
      case ' ': 
        e.preventDefault();
        hardDrop(); 
        break;
      case 'p': case 'P': pauseGame(); break;
    }
  }, [status, moveSide, moveDown, rotate, hardDrop, pauseGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      audioRef.current?.play().catch(() => {
        console.warn(`Background music failed locally. Reverting to remote source.`);
        if (audioRef.current) {
          audioRef.current.src = BG_MUSIC_REMOTE;
          audioRef.current.play().catch(() => {});
        }
      });
    } else {
      audioRef.current?.pause();
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center bg-slate-50 dark:bg-slate-950 transition-colors duration-500 text-slate-900 dark:text-white select-none overflow-hidden">
      
      {/* Audio elements for SFX */}
      <audio ref={sfxRefs.move} src={SFX_URLS.MOVE} preload="auto" />
      <audio ref={sfxRefs.rotate} src={SFX_URLS.ROTATE} preload="auto" />
      <audio ref={sfxRefs.clear} src={SFX_URLS.CLEAR} preload="auto" />
      <audio ref={sfxRefs.gameover} src={SFX_URLS.GAMEOVER} preload="auto" />
      <audio ref={sfxRefs.drop} src={SFX_URLS.DROP} preload="auto" />
      
      {/* Background Music */}
      <audio ref={audioRef} loop src={BG_MUSIC_URL} preload="auto" />

      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 dark:bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-5xl px-4 py-3 md:py-6 flex items-center justify-between z-40 shrink-0">
        <h1 className="text-xl md:text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          NEON TETRIS
        </h1>
        
        <div className="flex gap-2 items-center">
           {(status === GameStatus.PLAYING || status === GameStatus.PAUSED) && (
              <button 
                onClick={pauseGame}
                className="p-2 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm active:scale-90 transition-all"
                aria-label={status === GameStatus.PAUSED ? "Resume Game" : "Pause Game"}
              >
                {status === GameStatus.PAUSED ? <Play size={18} className="fill-current" /> : <Pause size={18} className="fill-current" />}
              </button>
           )}
           <button 
            onClick={toggleSound}
            className="p-2 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:scale-105 active:scale-90 transition-all"
            aria-label={soundEnabled ? "Disable Sound" : "Enable Sound"}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:scale-105 active:scale-90 transition-all"
            aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* Game Content Area */}
      <div className="flex-1 w-full flex flex-col items-center justify-center gap-2 px-4 overflow-hidden relative">
        
        {/* Compact Horizontal Mobile HUD */}
        <div className="md:hidden w-full max-w-md flex items-center justify-between bg-white/40 dark:bg-white/5 backdrop-blur-md p-2 rounded-xl border border-slate-200 dark:border-white/10 shrink-0 mb-1">
          <div className="flex items-center gap-4 ml-2">
            <div>
              <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Score</span>
              <span className="text-sm font-black mono text-blue-500 leading-none">{score}</span>
            </div>
            <div>
              <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">High</span>
              <span className="text-sm font-black mono text-purple-500 leading-none">{highScore}</span>
            </div>
            <div>
              <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Level</span>
              <span className="text-sm font-black mono text-green-500 leading-none">{level}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-900/5 dark:bg-white/5 p-1 px-2 rounded-lg border border-slate-200 dark:border-white/5 scale-90 origin-right">
             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Next</span>
             <div className="scale-50 origin-center -mx-4 -my-2">
                <Preview type={nextPieceType} hideTitle />
             </div>
          </div>
        </div>

        {/* Main Board Layout Container */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-4 md:gap-8 w-full max-w-4xl flex-1 overflow-hidden min-h-0">
          
          {/* Desktop Left Sidebar */}
          <div className="hidden md:flex flex-col gap-4 w-32 shrink-0">
            <div className="p-4 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl text-center shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-widest block mb-1">Score</span>
              <span className="text-xl font-black mono text-blue-500">{score.toLocaleString()}</span>
            </div>
            <div className="p-4 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl text-center shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-widest block mb-1">High Score</span>
              <span className="text-xl font-black mono text-purple-500">{highScore.toLocaleString()}</span>
            </div>
          </div>

          {/* Board Container */}
          <div className="relative flex items-center justify-center h-full max-h-full w-full md:w-auto overflow-hidden">
            <TetrisBoard grid={grid} activePiece={activePiece} />
            
            {/* Overlays with Padding */}
            <div className="absolute inset-0 z-30 pointer-events-none p-2 md:p-4">
              {status === GameStatus.IDLE && (
                <div className="w-full h-full flex items-center justify-center bg-slate-900/40 backdrop-blur-sm pointer-events-auto rounded-xl">
                  <button onClick={resetGame} className="group flex flex-col items-center gap-4 animate-bounce">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform">
                      <Play className="text-white fill-white ml-1" size={28} />
                    </div>
                    <span className="font-bold tracking-widest uppercase text-white drop-shadow-md text-sm">Start Game</span>
                  </button>
                </div>
              )}

              {status === GameStatus.GAME_OVER && (
                <div className="w-full h-full flex items-center justify-center bg-red-900/80 backdrop-blur-md pointer-events-auto rounded-xl p-4">
                  <div className="text-center">
                    <h2 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tighter">GAME OVER</h2>
                    <p className="text-red-100 mb-6 font-medium text-sm md:text-base">Final Score: {score}</p>
                    <button onClick={resetGame} className="px-8 py-3 bg-white text-red-600 font-bold rounded-full hover:bg-slate-100 transition-colors shadow-xl active:scale-95 text-sm md:text-base">
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {status === GameStatus.PAUSED && (
                <div className="w-full h-full flex items-center justify-center bg-slate-900/80 backdrop-blur-md pointer-events-auto rounded-xl p-4">
                  <div className="flex flex-col items-center gap-6">
                    <button onClick={pauseGame} className="group flex flex-col items-center gap-2">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-yellow-500 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.5)] group-hover:scale-110 transition-transform active:scale-95">
                        <Play className="text-white fill-white ml-1" size={28} />
                      </div>
                      <span className="font-bold tracking-widest uppercase text-white text-xs md:text-sm">Paused</span>
                    </button>
                    <button onClick={resetGame} className="flex items-center gap-2 px-6 py-2 bg-white/10 border border-white/20 rounded-full text-white font-bold hover:bg-white/20 active:scale-95 transition-all text-xs md:text-sm">
                      <RefreshCw size={14} /> Reset Game
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Right Sidebar */}
          <div className="hidden md:flex flex-col gap-6 w-32 shrink-0">
            <Preview type={nextPieceType} />
            <div className="p-4 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-2xl text-center shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-widest block mb-1">Level</span>
              <span className="text-xl font-black mono text-green-500">{level}</span>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={pauseGame} disabled={status === GameStatus.IDLE || status === GameStatus.GAME_OVER} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-200 dark:bg-white/10 font-bold hover:bg-slate-300 dark:hover:bg-white/20 active:scale-95 transition-all disabled:opacity-50 text-sm">
                {status === GameStatus.PAUSED ? <Play size={16} /> : <Pause size={16} />}
                {status === GameStatus.PAUSED ? "Resume" : "Pause"}
              </button>
              <button onClick={resetGame} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-white/10 font-bold hover:bg-slate-200 dark:hover:bg-white/10 active:scale-95 transition-all text-sm">
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Controls */}
      {status === GameStatus.PLAYING && (
         <MobileControls 
          onLeft={() => moveSide(-1)}
          onRight={() => moveSide(1)}
          onDown={moveDown}
          onRotate={rotate}
          onHardDrop={hardDrop}
        />
      )}

      {/* Desktop shortcuts hint */}
      <div className="hidden lg:block fixed bottom-4 text-[10px] text-slate-400 font-medium tracking-wide">
        ARROWS: MOVE & ROTATE • SPACE: HARD DROP • P: PAUSE
      </div>
    </div>
  );
};

export default App;
