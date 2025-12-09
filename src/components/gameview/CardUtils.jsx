import React from 'react';
import { ELEMENT_BACKGROUNDS } from '../../constants';

// Card rendering with optional stack count
export const renderCard = (card, index, stack = false) => (
  <div
    key={index}
    className={`relative w-24 h-32 md:w-28 md:h-36 ${ELEMENT_BACKGROUNDS[card.element]} rounded-lg md:rounded-xl p-2 border-2 border-light shadow-md
                flex flex-col justify-between items-center text-dark font-sans
                ${stack ? 'transform transition-transform duration-200 hover:-translate-y-2' : ''}`}
    style={stack ? { zIndex: index, left: `${index * 2}px` } : {}}
  >
    <div className="absolute -top-3 -right-3 bg-accent text-dark font-game text-base md:text-xl w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 border-light shadow-lg">
      {card.cost}
    </div>
    <div className="text-xs md:text-sm font-bold text-center mt-4 leading-tight px-1">{card.name}</div>
    <div className="text-xxs md:text-xs text-center opacity-80">{card.element}</div>
  </div>
);

export const groupAndStackCards = (board) => {
  const grouped = {};
  board.forEach(card => {
    const key = `${card.name}-${card.cost}`; // Group by name and cost
    if (!grouped[key]) {
      grouped[key] = { card: card, count: 0 };
    }
    grouped[key].count++;
  });
  return Object.values(grouped);
};