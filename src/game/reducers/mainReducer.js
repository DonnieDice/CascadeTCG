// src/game/reducers/mainReducer.js

import { initialGameState } from '../initialState';

// Helper function to check win/loss
export const checkWinLoss = (state) => {
  if (state.player.hp <= 0) {
    return { ...state, gameStatus: 'enemyWon', log: [...state.log, '💥 You Lose!'] };
  }
  if (state.enemy.hp <= 0) {
    return { ...state, gameStatus: 'playerWon', log: [...state.log, '🎉 You Win!'] };
  }
  if (state.playerDeck.length === 0 && state.currentTurn === 'player' && state.phase === 'flip') {
    return { ...state, gameStatus: 'playerWon', log: [...state.log, '🎉 You Win! Deck Empty!'] };
  }
  if (state.enemyDeck.length === 0 && state.currentTurn === 'enemy') {
    return { ...state, gameStatus: 'enemyWon', log: [...state.log, '💥 Enemy Wins! Your deck is empty!'] };
  }
  return state;
};

export const gameReducer = (state, action) => {
  let newState;
  
  switch (action.type) {
    case 'START_GAME':
      return initialGameState(action.payload.playerHeroId, action.payload.enemyHeroId);

    case 'RESET_GAME':
      return initialGameState(null, null);

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
        log: action.payload.message ? [...state.log, action.payload.message] : state.log,
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
        lastPlayedCost: card.cost, // C stays same for R = C
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
        lastPlayedCost: null,
        cascadeCount: 0,
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
        newState = {
          ...state,
          phase: 'end',
          waitingForPlayer: true,
          log: [...state.log, '⚠️ Deck empty!'],
        };
        return checkWinLoss(newState);
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
        log: [...state.log, '✨ Reveal: ' + card.name + ' (Cost ' + card.cost + ')'],
        phase: 'resolve-free',
        waitingForPlayer: true,
      };
    }

    case 'RESOLVE_FREE': {
      const card = state.revealedCard;
      const { forcedCapture } = action.payload || {};
      let newState = { ...state, waitingForPlayer: true, revealedCard: null };

      if (!card) {
        return {
          ...state,
          log: [...state.log, '❌ No card to resolve'],
          phase: 'choice',
          waitingForPlayer: true,
        };
      }

      // R < C: FREE CASCADE
      if (card.cost < state.lastPlayedCost && state.cascadeCount < 3) {
        const newCascadeCount = state.cascadeCount + 1;
        newState = {
          ...newState,
          playerDeck: state.playerDeck.slice(1),
          playerBoard: [...state.playerBoard, card],
          cascadeCount: newCascadeCount,
          lastPlayedCost: card.cost, // Update C to R
          log: [...state.log, `✅ FREE CASCADE: ${card.name} (${newCascadeCount}/3)`],
          phase: newCascadeCount >= 3 ? 'hero' : 'choice',
        };
      }
      // R = C: FORCED CAPTURE (must pay R+1 seals)
      else if (card.cost === state.lastPlayedCost) {
        const requiredSeals = card.cost + 1;
        
        if (forcedCapture && state.playerSeals >= requiredSeals && state.cascadeCount < 3) {
          const newCascadeCount = state.cascadeCount + 1;
          newState = {
            ...newState,
            playerSeals: state.playerSeals - requiredSeals,
            playerDeck: state.playerDeck.slice(1),
            playerBoard: [...state.playerBoard, card],
            cascadeCount: newCascadeCount,
            lastPlayedCost: card.cost, // C stays same
            log: [...state.log, `💎 FORCED! Paid ${requiredSeals} seals (${newCascadeCount}/3)`],
            phase: newCascadeCount >= 3 ? 'hero' : 'choice',
          };
        } else {
          // Declined or can't afford - card goes to bottom
          newState = {
            ...newState,
            playerDeck: [...state.playerDeck.slice(1), card],
            log: [...state.log, `❌ Declined/Can't afford (${requiredSeals} seals needed). Card to bottom.`],
            phase: 'choice',
          };
        }
      }
      // R > C: CASCADE BREAKS
      else {
        newState = {
          ...newState,
          playerDeck: [...state.playerDeck.slice(1), card],
          log: [...state.log, `❌ CASCADE BREAKS (${card.cost} > ${state.lastPlayedCost}). Card to bottom.`],
          phase: 'choice',
        };
      }
      
      return newState;
    }

    case 'USE_SEAL': {
      if (state.playerSeals <= 0 || state.playerDeck.length === 0) {
        return {
          ...state,
          log: [...state.log, '⚠️ Cannot start new cascade (need 1 seal)'],
          phase: 'hero',
          waitingForPlayer: true,
        };
      }
      
      if (state.cascadeCount >= 3) {
        return {
          ...state,
          log: [...state.log, '⚠️ Cascade limit reached (3/3)'],
          phase: 'hero',
          waitingForPlayer: true,
        };
      }

      const card = state.playerDeck[0];
      return {
        ...state,
        playerSeals: state.playerSeals - 1,
        revealedCard: card,
        log: [...state.log, '🔮 NEW CASCADE (paid 1 seal): Reveal ' + card.name + ' (Cost ' + card.cost + ')'],
        phase: 'resolve-paid',
        waitingForPlayer: true,
      };
    }

    case 'RESOLVE_PAID': {
      const card = state.revealedCard;
      const { forcedCapture } = action.payload || {};
      let newState = { ...state, waitingForPlayer: true, revealedCard: null };

      if (!card) {
        return {
          ...state,
          log: [...state.log, '❌ No card to resolve'],
          phase: 'choice',
          waitingForPlayer: true,
        };
      }

      // R < C: FREE CASCADE
      if (card.cost < state.lastPlayedCost && state.cascadeCount < 3) {
        const newCascadeCount = state.cascadeCount + 1;
        newState = {
          ...newState,
          playerDeck: state.playerDeck.slice(1),
          playerBoard: [...state.playerBoard, card],
          cascadeCount: newCascadeCount,
          lastPlayedCost: card.cost, // Update C to R
          log: [...state.log, `✅ FREE CASCADE: ${card.name} (${newCascadeCount}/3)`],
          phase: newCascadeCount >= 3 ? 'hero' : 'choice',
        };
      }
      // R = C: FORCED CAPTURE (must pay R+1 seals)
      else if (card.cost === state.lastPlayedCost) {
        const requiredSeals = card.cost + 1;
        
        if (forcedCapture && state.playerSeals >= requiredSeals && state.cascadeCount < 3) {
          const newCascadeCount = state.cascadeCount + 1;
          newState = {
            ...newState,
            playerSeals: state.playerSeals - requiredSeals,
            playerDeck: state.playerDeck.slice(1),
            playerBoard: [...state.playerBoard, card],
            cascadeCount: newCascadeCount,
            lastPlayedCost: card.cost, // C stays same
            log: [...state.log, `💎 FORCED! Paid ${requiredSeals} seals (${newCascadeCount}/3)`],
            phase: newCascadeCount >= 3 ? 'hero' : 'choice',
          };
        } else {
          // Declined or can't afford - card goes to bottom
          newState = {
            ...newState,
            playerDeck: [...state.playerDeck.slice(1), card],
            log: [...state.log, `❌ Declined/Can't afford (${requiredSeals} seals needed). Card to bottom.`],
            phase: 'choice',
          };
        }
      }
      // R > C: Can now force capture by paying R+1
      else if (card.cost > state.lastPlayedCost) {
        const requiredSeals = card.cost + 1;
        
        if (forcedCapture && state.playerSeals >= requiredSeals && state.cascadeCount < 3) {
          const newCascadeCount = state.cascadeCount + 1;
          newState = {
            ...newState,
            playerSeals: state.playerSeals - requiredSeals,
            playerDeck: state.playerDeck.slice(1),
            playerBoard: [...state.playerBoard, card],
            cascadeCount: newCascadeCount,
            lastPlayedCost: card.cost, // Update C to R (starting new cascade at higher cost)
            log: [...state.log, `💎 FORCED NEW CASCADE! Paid ${requiredSeals} seals (${newCascadeCount}/3)`],
            phase: newCascadeCount >= 3 ? 'hero' : 'choice',
          };
        } else {
          // Declined or can't afford - card goes to bottom, cascade ends
          newState = {
            ...newState,
            playerDeck: [...state.playerDeck.slice(1), card],
            log: [...state.log, `❌ Cascade attempt failed. Card to bottom.`],
            phase: 'choice',
          };
        }
      }
      
      return newState;
    }

    case 'STOP_SEALING':
      return {
        ...state,
        log: [...state.log, '→ Stop cascading'],
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
          log: [...state.log, '→ No hero ability triggered'],
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
            payload: { forcedCapture: false },
          });
        case 'resolve-paid':
          return gameReducer(state, {
            type: 'RESOLVE_PAID',
            payload: { forcedCapture: false },
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