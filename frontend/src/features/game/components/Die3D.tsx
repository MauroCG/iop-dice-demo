import React from 'react';
import { cn } from '../../../utils/cn';

interface Die3DProps {
  value: number; // 1 to 6
  isRolling: boolean;
}

export const Die3D: React.FC<Die3DProps> = ({ value, isRolling }) => {
  // Dot pip renderer
  const renderDots = (count: number) => {
    switch (count) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className="w-3.5 h-3.5 rounded-full bg-neon-cyan shadow-glow-cyan" />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex justify-between p-1">
            <span className="w-3 h-3 rounded-full bg-neon-cyan shadow-glow-cyan self-start" />
            <span className="w-3 h-3 rounded-full bg-neon-cyan shadow-glow-cyan self-end" />
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex justify-between p-1">
            <span className="w-3 h-3 rounded-full bg-neon-cyan shadow-glow-cyan self-start" />
            <span className="w-3 h-3 rounded-full bg-neon-cyan shadow-glow-cyan self-center" />
            <span className="w-3 h-3 rounded-full bg-neon-cyan shadow-glow-cyan self-end" />
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 p-1 gap-2">
            <span className="w-3 h-3 rounded-full bg-neon-cyan shadow-glow-cyan place-self-start" />
            <span className="w-3 h-3 rounded-full bg-neon-cyan shadow-glow-cyan place-self-end" />
            <span className="w-3 h-3 rounded-full bg-neon-cyan shadow-glow-cyan place-self-start" />
            <span className="w-3 h-3 rounded-full bg-neon-cyan shadow-glow-cyan place-self-end" />
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full relative p-1">
            <span className="absolute top-1 left-1 w-3 h-3 rounded-full bg-neon-cyan shadow-glow-cyan" />
            <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-neon-cyan shadow-glow-cyan" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-neon-cyan shadow-glow-cyan" />
            <span className="absolute bottom-1 left-1 w-3 h-3 rounded-full bg-neon-cyan shadow-glow-cyan" />
            <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-neon-cyan shadow-glow-cyan" />
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-3 p-1 gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-glow-cyan place-self-center" />
            <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-glow-cyan place-self-center" />
            <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-glow-cyan place-self-center" />
            <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-glow-cyan place-self-center" />
            <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-glow-cyan place-self-center" />
            <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-glow-cyan place-self-center" />
          </div>
        );
      default:
        return null;
    }
  };

  const showClass = `show-${Math.min(6, Math.max(1, value))}`;

  return (
    <div className="dice-scene w-20 h-20 flex items-center justify-center">
      <div
        className={cn(
          'dice-cube',
          isRolling && 'rolling',
          !isRolling && showClass
        )}
      >
        <div className="dice-face dice-face-1">{renderDots(1)}</div>
        <div className="dice-face dice-face-2">{renderDots(2)}</div>
        <div className="dice-face dice-face-3">{renderDots(3)}</div>
        <div className="dice-face dice-face-4">{renderDots(4)}</div>
        <div className="dice-face dice-face-5">{renderDots(5)}</div>
        <div className="dice-face dice-face-6">{renderDots(6)}</div>
      </div>
    </div>
  );
};
