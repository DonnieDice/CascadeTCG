// src/game/reducers/mainReducer.js

import { initialGameState } from '../initialState';
import { handleResolveFree, handleResolvePaid, checkWinLoss } from '../utils';

export const gameReducer = (state, action) => {
  let newState;
  switch (action.type) {
    case 'START_GAME':
      return initialGameState(action.payload.playerHeroId, action.payload.enemyHeroId);
    case 'DRAW_CARD': {
      const deck = [...state[`${action.player}Deck`]];
      const hand = [...state[`${action.player}Hand`]];
      if (deck.length === 0) return state; // No cards to draw

      const newCard = deck.shift();
      hand.push(newCard);

      newState = {
        ...state,
        [`${action.player}Deck`]: deck,
        [`${action.player}Hand`]: hand,
        log: [...state.log, `${action.player} drew a card.`],
      };
      return checkWinLoss(newState);
    }
    case 'PLAYER_LOSE_HP':
      newState = {
        ...state,
        playerHP: state.playerHP - action.payload.amount,
        log: [
          ...state.log,
          `-${action.payload.amount} HP for Player. (${state.playerHP - action.payload.amount} remaining)`,
        ],
      };
      return checkWinLoss(newState);
    case 'ENEMY_LOSE_HP':
      newState = {
        ...state,
        enemyHP: state.enemyHP - action.payload.amount,
        log: [
          ...state.log,
          `-${action.payload.amount} HP for Enemy. (${state.enemyHP - action.payload.amount} remaining)`,
        ],
      };
      return checkWinLoss(newState);
    case 'ENEMY_GAIN_SEAL':
      return {
        ...state,
        enemySeals: state.enemySeals + action.payload.amount,
        log: [...state.log, action.payload.message],
      };
    case 'ENEMY_CAPTURE_CARD': {
      const card = action.payload.card;
      return {
        ...state,
        enemyDeck: state.enemyDeck.slice(1),
        enemyBoard: [...state.enemyBoard, card],
        lastPlayedCost: card.cost,
        cascadeCount: 0,
        log: [...state.log, action.payload.message],
      };
    }
    case 'SET_REVEALED_CARD':
      return {
        ...state,
        revealedCard: action.payload.card,
        log: action.payload.message ? [...state.log, action.payload.message] : state.log,
      };
    case 'ENEMY_CASCADED': {
      const card = action.payload.card;
      const newCascadeCount = state.cascadeCount + 1;
      return {
        ...state,
        enemyDeck: state.enemyDeck.slice(1),
        enemyBoard: [...state.enemyBoard, card],
        lastPlayedCost: card.cost,
        cascadeCount: newCascadeCount,
        revealedCard: null,
        log: [...state.log, action.payload.message],
      };
    }
    case 'ENEMY_PAID_SAME_CASCADED': {
      const card = action.payload.card;
      const newCascadeCount = state.cascadeCount + 1;
      return {
        ...state,
        enemySeals: state.enemySeals - action.payload.costPaid,
        enemyDeck: state.enemyDeck.slice(1),
        enemyBoard: [...state.enemyBoard, card],
        lastPlayedCost: card.cost,
        cascadeCount: newCascadeCount,
        revealedCard: null,
        log: [...state.log, action.payload.message],
      };
    }
    case 'ENEMY_FAILED_CASCADE': {
      const card = action.payload.card;
      return {
        ...state,
        enemyDeck: [...state.enemyDeck.slice(1), card],
        revealedCard: null,
        log: [...state.log, action.payload.message],
      };
    }
    case 'ADD_LOG':
      return {
        ...state,
        log: [...state.log, action.payload.message],
      };
    case 'SET_PHASE':
      return {
        ...state,
        phase: action.payload.phase,
      };
    case 'END_TURN': {
      const nextTurn = state.currentTurn === 'player' ? 'enemy' : 'player';
      newState = {
        ...state,
        currentTurn: nextTurn,
        turnNumber: nextTurn === 'player' ? state.turnNumber + 1 : state.turnNumber,
        log: [],
        revealedCard: null,
        waitingForPlayer: nextTurn === 'player',
        phase: 'start-turn',
        lastPlayedCost: null, // Reset last played cost for new turn
        cascadeCount: 0, // Reset cascade count for new turn
      };
      return checkWinLoss(newState);
    }
    case 'START_PLAYER_TURN': {
      let newSeals = state.playerSeals + 1;
      if (
        state.playerHero.id === 'mirror' &&
        state.enemyBoard.length - state.playerBoard.length >= 3
      ) {
        newSeals += 1;
        // log added in App.jsx
      }
      return {
        ...state,
        playerSeals: newSeals,
        phase: 'flip',
        waitingForPlayer: true,
      };
    }
    case 'FLIP_CARD': {
      if (state.playerDeck.length === 0) {
        return {
          ...state,
          phase: 'end', // or some other end-game state
          waitingForPlayer: true,
          log: [...state.log, '⚠️ Deck empty!'],
        };
      }
      const card = state.playerDeck[0];
      return {
        ...state,
        playerDeck: state.playerDeck.slice(1),
        playerBoard: [...state.playerBoard, card],
        lastPlayedCost: card.cost,
        cascadeCount: 0,
        phase: 'free',
        waitingForPlayer: true,
        log: [...state.log, '🎴 You captured: ' + card.name],
      };
    }
    case 'FREE_CASCADE': {
      if (state.playerDeck.length === 0) {
        return {
          ...state,
          log: [...state.log, '→ No cards left'],
          phase: 'choice',
          waitingForPlayer: true,
        };
      }
      const card = state.playerDeck[0];
      return {
        ...state,
        revealedCard: card,
        log: [...state.log, '✨ FREE: ' + card.name + ' (' + card.cost + ')'],
        phase: 'resolve-free',
        waitingForPlayer: true,
      };
    }
    case 'RESOLVE_FREE':
      return handleResolveFree(state);
    case 'USE_SEAL': {
      if (state.playerSeals <= 0 || state.playerDeck.length === 0) {
        return {
          ...state,
          log: [...state.log, '⚠️ Cannot use seal'],
          phase: 'hero', // or 'choice' depending on flow
          waitingForPlayer: true,
        };
      }
      const card = state.playerDeck[0];
      return {
        ...state,
        playerSeals: state.playerSeals - 1,
        revealedCard: card,
        log: [...state.log, '🔮 SEAL: ' + card.name + ' (' + card.cost + ')'],
        phase: 'resolve-paid',
        waitingForPlayer: true,
      };
    }
    case 'RESOLVE_PAID':
      return handleResolvePaid(state, action.payload);
    case 'STOP_SEALING':
      return {
        ...state,
        log: [...state.log, '→ Stop'],
        phase: 'hero',
        waitingForPlayer: true,
      };
    case 'APPLY_HERO_ABILITY': {
      let newState = { ...state, waitingForPlayer: true };
      if (state.playerHero.id === 'fortune' && state.cascadeCount <= 1) {
        newState = {
          ...newState,
          playerSeals: state.playerSeals + 1,
          log: [...state.log, '⭐ ' + state.playerHero.ability + ': +1 seal'],
        };
      } else {
        newState = {
          ...newState,
          log: [...state.log, '→ No ability'],
        };
      }
      newState = {
        ...newState,
        log: [...newState.log, '════════════════════════════════════════'],
        phase: 'end',
      };
      return checkWinLoss(newState);
    }
    case 'HANDLE_ACTION': {
      switch (state.phase) {
        case 'start-turn':
          return gameReducer(state, { type: 'START_PLAYER_TURN' });
        case 'flip':
          return gameReducer(state, { type: 'FLIP_CARD' });
        case 'free':
          return gameReducer(state, { type: 'FREE_CASCADE' });
        case 'resolve-free':
          return gameReducer(state, {
            type: 'RESOLVE_FREE',
            payload: { paySame: false, payToSucceed: false },
          });
        case 'resolve-paid':
          return gameReducer(state, {
            type: 'RESOLVE_PAID',
            payload: { paySame: false, payToSucceed: false },
          });
        case 'hero':
          return gameReducer(state, { type: 'APPLY_HERO_ABILITY' });
        case 'end':
          return gameReducer(state, { type: 'END_TURN' });
        default:
          return state;
      }
    }
    default:
      return state;
  }
};

export default gameReducer;
