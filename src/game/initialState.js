// src/game/initialState.js

import { createDeck } from '../gameLogic';
import { HEROES } from '../constants';

export const initialGameState = (playerHeroId, enemyHeroId) => {
  if (!playerHeroId || !enemyHeroId) {
    // Return a default state for hero selection phase
    return {
      gameState: 'hero-select', // Initial state for hero selection
      gameStatus: 'selecting', // New status for hero selection
      playerHero: null,
      enemyHero: null,
      playerHP: 0,
      playerSeals: 0,
      playerDeck: [],
      playerBoard: [],
      playerHand: [],
      playerDiscard: [],
      enemyHP: 0,
      enemySeals: 0,
      enemyDeck: [],
      enemyBoard: [],
      enemyHand: [],
      enemyDiscard: [],
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
    return initialGameState(null, null); // Recursively return the hero-select state
  }

  const playerDeck = createDeck();
  const enemyDeck = createDeck();

  return {
    gameState: 'playing', // Reflects the state after hero selection and game start
    gameStatus: 'playing', // New: Added gameStatus
    playerHero: playerHero,
    enemyHero: enemyHero,
    playerHP: playerHero.hp, // Initial HP from hero object
    playerSeals: 3,
    playerDeck: playerDeck,
    playerBoard: [],
    playerHand: [],
    playerDiscard: [],
    enemyHP: enemyHero.hp, // Initial HP from hero object
    enemySeals: 3,
    enemyDeck: enemyDeck,
    enemyBoard: [],
    enemyHand: [],
    enemyDiscard: [],
    log: [], // Renamed from gameLog to log for consistency with App.jsx
    currentTurn: 'player', // Renamed from activePlayer to currentTurn
    turnNumber: 1,
    lastPlayedCost: null,
    cascadeCount: 0,
    revealedCard: null,
    phase: 'start-turn', // Matches initial phase in App.jsx's startGame
    waitingForPlayer: true,
    // These were in App.jsx as state variables, but are now part of the central state object.
    // selectedCard: null,
    // isFreeCascade: false,
    // freeCascadeCost: null,
    // sealPayAmount: 0,
    // capturedCards: [],
    // enemyAction: null,
  };
};

export default initialGameState;
