import React from 'react';
import { renderCard } from './CardUtils';

export default function BoardDisplay({ board, isPlayer }) {
  const title = isPlayer ? '⭐ YOUR CAPTURED' : '🎴 ENEMY CAPTURED';
  const boardBg = isPlayer ? 'bg-gradient-to-br from-primary-500 to-secondary-600' : 'bg-gradient-to-br from-dark-800 to-primary-700';
  const borderStyle = isPlayer ? 'border-t-4 border-primary-700' : 'border-b-4 border-dark-900';

  return (
    <div className={`p-4 md:p-6 ${boardBg} rounded-lg md:rounded-xl shadow-lg ${borderStyle}`}>
      <div className="min-h-[140px] md:min-h-[160px] bg-dark-600/60 p-3 rounded-lg md:rounded-xl shadow-inner">
        <div className="text-sm md:text-base font-game mb-2 text-light">
          {title} - {board.length} cards
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {board.map((c, i) => renderCard(c, i, true))}
        </div>
      </div>
    </div>
  );
}