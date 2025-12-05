// src/game/utils.test.js
import { describe, it, expect } from 'vitest';
import { handleResolveFree, handleResolvePaid, checkWinLoss } from './utils';

// Mock initial game state for testing purposes
const createMockState = (overrides = {}) => {
  const defaultPlayer = {
    hero: { id: 'power', name: 'The Power', ability: 'None' },
    hp: 25,
    seals: 3,
    deck: [
      { id: 'c1', cost: 1, element: 'fire', name: 'Spark' },
      { id: 'c2', cost: 2, element: 'water', name: 'Stream' },
      { id: 'c3', cost: 3, element: 'wind', name: 'Breeze' },
      { id: 'c4', cost: 4, element: 'earth', name: 'Stone' },
      { id: 'c5', cost: 1, element: 'fire', name: 'Ember' },
    ],
    field: [],
    lastTurnCaptures: 0,
    cascadeCount: 0,
    cascadeLimit: 3,
    lastCapturedCost: null,
  };

  const defaultEnemy = {
    hero: { id: 'power', name: 'The Power', ability: 'None' },
    hp: 25,
    seals: 3,
    deck: [],
    field: [],
    lastTurnCaptures: 0,
    cascadeCount: 0,
    cascadeLimit: 3,
    lastCapturedCost: null,
  };

  // Start with base state
  let state = {
    gameState: 'playing',
    currentTurn: 'player',
    turnNumber: 1,
    phase: 'cascade',
    player: defaultPlayer,
    enemy: defaultEnemy,
    revealedCard: null,
    log: [],
    waitingForPlayer: true,
  };

  // Apply top-level overrides
  state = { ...state, ...overrides };

  // Apply specific nested overrides if they exist in the original overrides
  // These should merge on top of the defaultPlayer/defaultEnemy
  if (overrides.player) {
    state.player = { ...defaultPlayer, ...overrides.player };
  }
  if (overrides.enemy) {
    state.enemy = { ...defaultEnemy, ...overrides.enemy };
  }

  return state;
};

describe('handleResolveFree', () => {
  it('should auto-capture a card if R < C and cascadeCount < limit', () => {
    const playerDeck = [
      { id: 'rc', cost: 3, element: 'water', name: 'River' }, // R = 3
      { id: 'c1', cost: 1, element: 'fire', name: 'Spark' },
      { id: 'c2', cost: 2, element: 'water', name: 'Stream' },
      { id: 'c3', cost: 3, element: 'wind', name: 'Breeze' },
      { id: 'c4', cost: 4, element: 'earth', name: 'Stone' },
      { id: 'c5', cost: 1, element: 'fire', name: 'Ember' },
    ];
    const initialState = createMockState({
      player: {
        lastCapturedCost: 4, // C = 4
        deck: playerDeck,
      },
      revealedCard: playerDeck[0],
    });
    const newState = handleResolveFree(initialState);

    expect(newState.player.deck.length).toBe(initialState.player.deck.length - 1);
    expect(newState.player.field.length).toBe(1);
    expect(newState.player.field[0].id).toBe('rc');
    expect(newState.player.cascadeCount).toBe(1);
    expect(newState.player.lastCapturedCost).toBe(3); // C should update to R
    expect(newState.log).toContain('✅ FREE CASCADE: River (1/3)');
    expect(newState.phase).toBe('choice');
  });

  it('should end phase if cascadeCount reaches limit', () => {
    const playerDeck = [
      { id: 'rc', cost: 1, element: 'fire', name: 'Flicker' }, // R = 1
      { id: 'c1', cost: 1, element: 'fire', name: 'Spark' },
      { id: 'c2', cost: 2, element: 'water', name: 'Stream' },
      { id: 'c3', cost: 3, element: 'wind', name: 'Breeze' },
      { id: 'c4', cost: 4, element: 'earth', name: 'Stone' },
      { id: 'c5', cost: 1, element: 'fire', name: 'Ember' },
    ];
    const initialState = createMockState({
      player: {
        lastCapturedCost: 2, // C = 2
        cascadeCount: 2, // 2/3 cascades already
        deck: playerDeck,
      },
      revealedCard: playerDeck[0],
    });
    const newState = handleResolveFree(initialState);

    expect(newState.player.cascadeCount).toBe(3);
    expect(newState.phase).toBe('hero'); // Should move to 'hero' phase
  });

  it('should put card to bottom and fail if R >= C', () => {
    const playerDeck = [
      { id: 'rc', cost: 2, element: 'water', name: 'Stream' }, // R = 2
      { id: 'c1', cost: 1, element: 'fire', name: 'Spark' },
      { id: 'c2', cost: 2, element: 'water', name: 'Stream' },
      { id: 'c3', cost: 3, element: 'wind', name: 'Breeze' },
      { id: 'c4', cost: 4, element: 'earth', name: 'Stone' },
      { id: 'c5', cost: 1, element: 'fire', name: 'Ember' },
    ];
    const initialState = createMockState({
      player: {
        lastCapturedCost: 2, // C = 2
        deck: playerDeck,
      },
      revealedCard: playerDeck[0],
    });
    const newState = handleResolveFree(initialState);

    expect(newState.player.deck.length).toBe(initialState.player.deck.length); // Card moved to bottom, so length same
    expect(newState.player.deck[initialState.player.deck.length - 1].id).toBe('rc'); // Card is at bottom
    expect(newState.player.field.length).toBe(0); // Not captured
    expect(newState.player.cascadeCount).toBe(0); // No cascade
    expect(newState.player.lastCapturedCost).toBe(2); // C remains unchanged
    expect(newState.log).toContain('❌ FREE CASCADE FAILED (Card to bottom): Stream');
    expect(newState.phase).toBe('choice');
  });
});

describe('handleResolvePaid', () => {
  it('should capture card if R = C, player pays R+1 seals, and cascadeCount < limit', () => {
    const playerDeck = [
      { id: 'rc', cost: 2, element: 'fire', name: 'Heat' }, // R = 2
      { id: 'c1', cost: 1, element: 'fire', name: 'Spark' },
      { id: 'c2', cost: 2, element: 'water', name: 'Stream' },
      { id: 'c3', cost: 3, element: 'wind', name: 'Breeze' },
    ];
    const initialState = createMockState({
      player: {
        lastCapturedCost: 2, // C = 2
        seals: 5, // Enough seals for 2+1=3 cost
        deck: playerDeck,
      },
      revealedCard: playerDeck[0],
    });
    const newState = handleResolvePaid(initialState, { payToSucceed: true });

    expect(newState.player.deck.length).toBe(initialState.player.deck.length - 1);
    expect(newState.player.field.length).toBe(1);
    expect(newState.player.field[0].id).toBe('rc');
    expect(newState.player.cascadeCount).toBe(1);
    expect(newState.player.seals).toBe(initialState.player.seals - 3); // 5 - (2+1) = 2 seals left
    expect(newState.player.lastCapturedCost).toBe(2); // C stays same
    expect(newState.log).toContain('💎 FORCED! Paid 3 (1/3) for Cost 2');
    expect(newState.phase).toBe('choice');
  });

  it('should capture card if R > C, player pays R+1 seals, and cascadeCount < limit (starting new chain)', () => {
    const playerDeck = [
      { id: 'rc', cost: 3, element: 'wind', name: 'Gale' }, // R = 3
      { id: 'c1', cost: 1, element: 'fire', name: 'Spark' },
      { id: 'c2', cost: 2, element: 'water', name: 'Stream' },
      { id: 'c3', cost: 3, element: 'wind', name: 'Breeze' },
    ];
    const initialState = createMockState({
      player: {
        lastCapturedCost: 1, // C = 1
        seals: 6, // Enough seals for 3+1=4 cost
        deck: playerDeck,
      },
      revealedCard: playerDeck[0],
    });
    const newState = handleResolvePaid(initialState, { payToSucceed: true });

    expect(newState.player.deck.length).toBe(initialState.player.deck.length - 1);
    expect(newState.player.field.length).toBe(1);
    expect(newState.player.field[0].id).toBe('rc');
    expect(newState.player.cascadeCount).toBe(1);
    expect(newState.player.seals).toBe(initialState.player.seals - 4); // 6 - (3+1) = 2 seals left
    expect(newState.player.lastCapturedCost).toBe(3); // C updates to R
    expect(newState.log).toContain('💎 FORCED! Paid 4 (1/3) for Cost 3');
    expect(newState.phase).toBe('choice');
  });


  it('should put card to bottom and fail if not enough seals', () => {
    const playerDeck = [
      { id: 'rc', cost: 2, element: 'fire', name: 'Heat' }, // R = 2
      { id: 'c1', cost: 1, element: 'fire', name: 'Spark' },
      { id: 'c2', cost: 2, element: 'water', name: 'Stream' },
      { id: 'c3', cost: 3, element: 'wind', name: 'Breeze' },
    ];
    const initialState = createMockState({
      player: {
        lastCapturedCost: 2, // C = 2
        seals: 1, // Not enough seals for 2+1=3 cost
        deck: playerDeck,
      },
      revealedCard: playerDeck[0],
    });
    const newState = handleResolvePaid(initialState, { payToSucceed: true });

    expect(newState.player.deck.length).toBe(initialState.player.deck.length); // Card moved to bottom
    expect(newState.player.deck[initialState.player.deck.length - 1].id).toBe('rc');
    expect(newState.player.field.length).toBe(0);
    expect(newState.player.cascadeCount).toBe(0);
    expect(newState.player.seals).toBe(1); // Seals unchanged
    expect(newState.log).toContain('❌ FAILED (Card to bottom): Heat');
    expect(newState.phase).toBe('choice');
  });

  it('should put card to bottom and fail if cascadeCount reaches limit', () => {
    const playerDeck = [
      { id: 'rc', cost: 2, element: 'fire', name: 'Heat' }, // R = 2
      { id: 'c1', cost: 1, element: 'fire', name: 'Spark' },
      { id: 'c2', cost: 2, element: 'water', name: 'Stream' },
      { id: 'c3', cost: 3, element: 'wind', name: 'Breeze' },
    ];
    const initialState = createMockState({
      player: {
        lastCapturedCost: 2, // C = 2
        seals: 5,
        cascadeCount: 3, // Already at limit
        deck: playerDeck,
      },
      revealedCard: playerDeck[0],
    });
    const newState = handleResolvePaid(initialState, { payToSucceed: true });

    expect(newState.player.deck.length).toBe(initialState.player.deck.length); // Card moved to bottom
    expect(newState.player.deck[initialState.player.deck.length - 1].id).toBe('rc');
    expect(newState.log).toContain('❌ FAILED (Card to bottom): Heat');
    expect(newState.phase).toBe('choice');
  });

  it('should put card to bottom if payToSucceed is false', () => {
    const playerDeck = [
      { id: 'rc', cost: 2, element: 'fire', name: 'Heat' }, // R = 2
      { id: 'c1', cost: 1, element: 'fire', name: 'Spark' },
      { id: 'c2', cost: 2, element: 'water', name: 'Stream' },
      { id: 'c3', cost: 3, element: 'wind', name: 'Breeze' },
    ];
    const initialState = createMockState({
      player: {
        lastCapturedCost: 2, // C = 2
        seals: 5,
        deck: playerDeck,
      },
      revealedCard: playerDeck[0],
    });
    const newState = handleResolvePaid(initialState, { payToSucceed: false });

    expect(newState.player.deck.length).toBe(initialState.player.deck.length); // Card moved to bottom
    expect(newState.player.deck[initialState.player.deck.length - 1].id).toBe('rc');
    expect(newState.log).toContain('❌ FAILED (Card to bottom): Heat');
    expect(newState.phase).toBe('choice');
  });
});

describe('checkWinLoss', () => {
  it('should return gameState enemyWon if playerHP is 0 or less', () => {
    const initialState = createMockState({ player: { ...createMockState().player, hp: 0 } });
    const newState = checkWinLoss(initialState);
    expect(newState.gameState).toBe('enemyWon');
    expect(newState.log).toContain('💥 You Lose!');
  });

  it('should return gameState playerWon if enemyHP is 0 or less', () => {
    const initialState = createMockState({ enemy: { ...createMockState().enemy, hp: 0 } });
    const newState = checkWinLoss(initialState);
    expect(newState.gameState).toBe('playerWon');
    expect(newState.log).toContain('🎉 You Win!');
  });

  it('should return state unchanged if neither player has lost HP', () => {
    const initialState = createMockState({ player: { ...createMockState().player, hp: 10 }, enemy: { ...createMockState().enemy, hp: 10 } });
    const newState = checkWinLoss(initialState);
    expect(newState.gameState).toBe('playing');
    expect(newState.player.hp).toBe(10);
    expect(newState.enemy.hp).toBe(10);
  });
});