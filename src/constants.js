export const HEROES = [
  {
    id: 'fortune',
    name: 'The Fortune',
    ability: 'Lucky Draw',
    desc: 'If you cascade 1 or less cards this turn, gain +1 seal point',
    hp: 25,
  },
  {
    id: 'mirror',
    name: 'The Mirror',
    ability: 'Reflection Power',
    desc: 'At start of turn: If opponent has 3+ more cards, gain +1 seal point',
    hp: 25,
  },
  {
    id: 'power',
    name: 'The Power',
    ability: 'Raw Strength',
    desc: 'No special ability - pure consistency',
    hp: 25,
  },
];

export const CARD_NAMES = {
  1: {
    fire: ['Spark', 'Ember'],
    water: ['Drop', 'Stream'],
    wind: ['Breeze', 'Gust'],
    earth: ['Pebble', 'Stone'],
  },
  2: {
    fire: ['Firey', 'Heat'],
    water: ['Watery', 'Flow'],
    wind: ['Windy', 'Blow'],
    earth: ['Earthy', 'Ground'],
  },
  3: {
    fire: ['Inferno', 'Phoenix'],
    water: ['Ocean', 'Glacier'],
    wind: ['Tempest', 'Thunder'],
    earth: ['Terra', 'Canyon'],
  },
  4: {
    fire: ['Sun', 'Star'],
    water: ['Moon', 'Eclipse'],
    wind: ['Cosmos', 'Astral'],
    earth: ['World', 'Titan'],
  },
};

export const ELEMENTS = ['fire', 'water', 'wind', 'earth'];

export const ELEMENT_COLORS = {
  fire: 'from-red-600 to-orange-500',
  water: 'from-blue-600 to-cyan-500',
  wind: 'from-green-600 to-emerald-500',
  earth: 'from-amber-700 to-yellow-600',
};

export const ELEMENT_BACKGROUNDS = {
  fire: 'bg-gradient-to-br from-red-600 to-orange-500',
  water: 'bg-gradient-to-br from-blue-600 to-cyan-500',
  wind: 'bg-gradient-to-br from-green-600 to-emerald-500',
  earth: 'bg-gradient-to-br from-amber-700 to-yellow-600',
};
