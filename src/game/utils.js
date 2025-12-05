// src/game/utils.js

// import { HEROES } from '../constants'; // Import HEROES for checkWinLoss

const handleResolveFree = (state) => {
  const card = state.revealedCard;
  let newState = { ...state, waitingForPlayer: true, revealedCard: null };

  if (
    card &&
    card.cost < state.player.lastCapturedCost &&
    state.player.cascadeCount < state.player.cascadeLimit
  ) {
    const newCascadeCount = state.player.cascadeCount + 1;
    newState = {
      ...newState,
      player: {
        ...state.player,
        deck: state.player.deck.slice(1),
        field: [...state.player.field, card],
        cascadeCount: newCascadeCount,
        lastCapturedCost: card.cost,
      },
      log: [
        ...state.log,
        `✅ FREE CASCADE: ${card.name} (${newCascadeCount}/${state.player.cascadeLimit})`,
      ],
      phase: newCascadeCount >= state.player.cascadeLimit ? 'hero' : 'choice',
    };
  } else {
    if (card) {
      newState = {
        ...newState,
        player: {
          ...state.player,
          deck: [...state.player.deck.slice(1), card], // Put revealed card to bottom
        },
        log: [...state.log, `❌ FREE CASCADE FAILED (Card to bottom): ${card.name}`],
        phase: 'choice',
      };
    } else {
      newState = {
        ...newState,
        log: [...state.log, `❌ FREE CASCADE FAILED (No card revealed)`],
        phase: 'choice',
      };
    }
  }
  return newState;
};

const handleResolvePaid = (state, payload) => {
  const { payToSucceed } = payload;
  const card = state.revealedCard;
  let newState = { ...state, waitingForPlayer: true, revealedCard: null };

  if (
    payToSucceed &&
    card &&
    card.cost >= state.player.lastCapturedCost &&
    state.player.seals >= card.cost + 1 &&
    state.player.cascadeCount < state.player.cascadeLimit
  ) {
    const cost = card.cost + 1;
    const newCascadeCount = state.player.cascadeCount + 1;
    newState = {
      ...newState,
      player: {
        ...state.player,
        seals: state.player.seals - cost,
        deck: state.player.deck.slice(1),
        field: [...state.player.field, card],
        cascadeCount: newCascadeCount,
        lastCapturedCost: card.cost,
      },
      log: [
        ...state.log,
        `💎 FORCED! Paid ${cost} (${newCascadeCount}/${state.player.cascadeLimit}) for Cost ${card.cost}`,
      ],
      phase: newCascadeCount >= state.player.cascadeLimit ? 'hero' : 'choice',
    };
  } else if (card) {
    newState = {
      ...newState,
      player: {
        ...state.player,
        deck: [...state.player.deck.slice(1), card],
      },
      log: [...state.log, `❌ FAILED (Card to bottom): ${card.name}`],
      phase: 'choice',
    };
  } else {
    newState = {
      ...newState,
      log: [...state.log, `❌ PAID CASCADE FAILED (No card revealed)`],
      phase: 'choice',
    };
  }
  return newState;
};
const checkWinLoss = (state) => {
  if (state.player.hp <= 0) {
    return { ...state, gameState: 'enemyWon', log: [...state.log, '💥 You Lose!'] };
  }
  if (state.enemy.hp <= 0) {
    return { ...state, gameState: 'playerWon', log: [...state.log, '🎉 You Win!'] };
  }
  return state;
};

// --- ExPORTS ---
export { handleResolveFree, handleResolvePaid, checkWinLoss };
