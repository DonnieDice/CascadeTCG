import React from 'react';

export default function TurnIndicator({ isPlayerTurn }) {
  return (
    <div className="p-4 md:p-6 bg-dark-200/90 rounded-xl shadow-xl border-b-4 border-primary-500 text-center">
      <div
        className={`text-3xl md:text-5xl font-game px-8 py-4 md:px-12 md:py-6 rounded-xl shadow-2xl inline-block
                       ${isPlayerTurn ? 'bg-gradient-to-r from-secondary to-accent text-dark' : 'bg-gradient-to-r from-danger to-warning text-dark'}`}
      >
        {isPlayerTurn ? '⭐ YOUR TURN' : '🎴 ENEMY TURN'}
      </div>
    </div>
  );
}