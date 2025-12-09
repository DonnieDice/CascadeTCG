import React from 'react';
import { renderCard } from './CardUtils';

export default function RevealedCardDisplay({ revealedCascadeChain, lastPlayedCost }) {
  // Determine if there's an active revealed card for cost comparison
  const activeRevealedCard = revealedCascadeChain[revealedCascadeChain.length - 1];

  return (
    <div className="w-full md:w-64 flex-shrink-0 flex flex-col items-center justify-center p-3 bg-dark-300/20 rounded-lg md:rounded-xl shadow-inner border-2 border-secondary-600 h-48 md:h-64 relative overflow-hidden">
      {revealedCascadeChain.length > 0 ? (
        <div className="relative w-32 h-40"> {/* Container for stacked cards */}
          {revealedCascadeChain.map((card, index) => (
            <div
              key={index}
              className="absolute w-full h-full transform transition-all duration-300 ease-out"
              style={{
                top: `${index * 20}px`, // Stack vertically with offset
                zIndex: index,
                left: `${index * 5}px`, // Slight horizontal offset for fanning effect
              }}
            >
              {renderCard(card, `revealed-${index}`)}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-dark-400 font-game text-sm text-center">No Card Revealed</div>
      )}
      {activeRevealedCard && lastPlayedCost !== null && (
        <div className="absolute bottom-2 left-2 right-2 p-1 bg-dark/70 rounded text-center text-light font-game text-xs leading-tight">
          Last Played Cost: <span className="font-bold">{lastPlayedCost}</span><br/>
          {activeRevealedCard.cost < lastPlayedCost && '✅ R<C FREE'}
          {activeRevealedCard.cost === lastPlayedCost && `💰 R=C`}
          {activeRevealedCard.cost > lastPlayedCost && '❌ R>C BREAK'}
        </div>
      )}
    </div>
  );
}