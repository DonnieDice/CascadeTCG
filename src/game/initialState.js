// src/game/initialState.js

import { createDeck } from '../gameLogic';
import { HEROES } from '../constants';

export const initialGameState = (playerHeroId, enemyHeroId) => {
  if (!playerHeroId || !enemyHeroId) {
    // Return a default state for hero selection phase
    return {
      gameState: 'hero-select',
      gameStatus: 'selecting',
      playerHero: null,
      enemyHero: null,
      playerHP: 0,
      playerSeals: 0,
      playerDeck: [],
      playerBoard: [],
      enemyHP: 0,
      enemySeals: 0,
      enemyDeck: [],
      enemyBoard: [],
      log: [],
      currentTurn: 'none',
      turnNumber: 0,
      lastPlayedCost: null,
      cascadeCount: 0,
      revealedCard: null,
      phase: 'none',
      waitingForPlayer: false,
    };
  }

  const playerHero = HEROES.find((h) => h.id === playerHeroId);
  const enemyHero = HEROES.find((h) => h.id === enemyHeroId);

  if (!playerHero || !enemyHero) {
    console.error('Invalid hero selected, falling back to hero-select state.');
    return initialGameState(null, null);
  }

  const playerDeck = createDeck();
  const enemyDeck = createDeck();

  return {
    gameState: 'playing',
    gameStatus: 'playing',
    playerHero: playerHero,
    enemyHero: enemyHero,
    playerHP: playerHero.hp,
    playerSeals: 3,
    playerDeck: playerDeck,
    playerBoard: [],
    enemyHP: enemyHero.hp,
    enemySeals: 3,
    enemyDeck: enemyDeck,
    enemyBoard: [],
    log: [],
    currentTurn: 'player',
    turnNumber: 1,
    lastPlayedCost: null,
    cascadeCount: 0,
    revealedCard: null,
    phase: 'start-turn',
    waitingForPlayer: true,
  };
};

export default initialGameState;