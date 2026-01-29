
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, RotateCw, ArrowDownToLine } from 'lucide-react';

interface MobileControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onDown: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
}

const ControlButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ 
  onClick, children, className = "" 
}) => (
  <button
    onPointerDown={(e) => {
        e.preventDefault();
        onClick();
    }}
    className={`w-14 h-14 flex items-center justify-center bg-slate-800/90 dark:bg-white/10 backdrop-blur-md border border-slate-700 dark:border-white/20 rounded-full active:scale-90 active:bg-slate-700 dark:active:bg-white/30 shadow-lg transition-all pointer-events-auto ${className}`}
  >
    {children}
  </button>
);

const MobileControls: React.FC<MobileControlsProps> = ({ 
  onLeft, onRight, onDown, onRotate, onHardDrop 
}) => {
  return (
    <div className="md:hidden w-full flex flex-col gap-3 items-center py-4 px-6 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-slate-200 dark:border-white/5 shrink-0">
      <div className="flex gap-8">
        <ControlButton onClick={onRotate}>
          <RotateCw className="w-6 h-6 text-white" />
        </ControlButton>
        <ControlButton onClick={onHardDrop}>
          <ArrowDownToLine className="w-6 h-6 text-white" />
        </ControlButton>
      </div>
      <div className="flex gap-10 items-center">
        <ControlButton onClick={onLeft}>
          <ChevronLeft className="w-8 h-8 text-white" />
        </ControlButton>
        <ControlButton onClick={onDown}>
          <ChevronDown className="w-8 h-8 text-white" />
        </ControlButton>
        <ControlButton onClick={onRight}>
          <ChevronRight className="w-8 h-8 text-white" />
        </ControlButton>
      </div>
    </div>
  );
};

export default MobileControls;
