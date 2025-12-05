import { ELEMENTS, CARD_NAMES } from './constants';

export const createDeck = () => {
  const deck = [];
  const costs = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4,
    4, 4, 4, 4,
  ];
  costs.forEach((cost, i) => {
    const element = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
    const names = CARD_NAMES[cost][element];
    const name = names[Math.floor(Math.random() * names.length)];
    deck.push({ id: `card-${i}-${Date.now()}-${Math.random()}`, cost, name, element });
  });
  return deck.sort(() => Math.random() - 0.5);
};
