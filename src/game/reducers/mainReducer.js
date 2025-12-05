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
        playerHP: state.player.hp - action.payload.amount,
        log: [
          ...state.log,
          `Player lost ${action.payload.amount} HP. (${state.player.hp} -> ${state.player.hp - action.payload.amount})`,
        ],
      };
      return checkWinLoss(newState);

    case 'ENEMY_LOSE_HP':
      newState = {
        ...state,
        enemyHP: state.enemy.hp - action.payload.amount,
        log: [
          ...state.log,
          `Enemy lost ${action.payload.amount} HP. (${state.enemy.hp} -> ${state.enemy.hp - action.payload.amount})`,
        ],
      };
      return checkWinLoss(newState);

    case 'ENEMY_GAIN_SEAL':
      return {
        ...state,
        enemySeals: state.enemySeals + action.payload.amount,
        log: [
          ...state.log,
          `Enemy gained ${action.payload.amount} seals. (${state.enemySeals} -> ${state.enemySeals + action.payload.amount})`,
        ],
      };

    case 'ENEMY_CAPTURE_CARD': {
      const card = action.payload.card;
      return {
        ...state,
        enemyDeck: state.enemyDeck.slice(1),
        // enemyBoard: [...state.enemyBoard, card], // Removed direct addition to board
        lastPlayedCost: card.cost,
        cascadeCount: 0,
        revealedCascadeChain: [card], // Add to chain for initial reveal
        log: [...state.log, `Enemy revealed ${card.name} (Cost ${card.cost}). This starts a new cascade.`],
      };
    }

    case 'SET_REVEALED_CARD':
      // This action is now redundant as cards are added directly to revealedCascadeChain
      // during FLIP_CARD, ENEMY_CAPTURE_CARD, FREE_CASCADE, USE_SEAL.
      // However, if it's still used to reveal a *new* card after a sequence, it needs adjustment.
      // For now, let's keep it but recognize it might need refactoring later.
      return {
        ...state,
        log: [...state.log, `Revealed ${action.payload.card.name} (Cost ${action.payload.card.cost}).`],
      };

    case 'ENEMY_CASCADED': {
      const card = action.payload.card;
      const newCascadeCount = state.cascadeCount + 1;
      return {
        ...state,
        enemyDeck: state.enemyDeck.slice(1),
        // enemyBoard: [...state.enemyBoard, card], // Removed direct addition to board
        lastPlayedCost: card.cost,
        cascadeCount: newCascadeCount,
        revealedCascadeChain: [...state.revealedCascadeChain, card], // Append to chain
        log: [...state.log, `Enemy performed FREE CASCADE with ${card.name} (Cost ${card.cost}). Cascade count: ${newCascadeCount}/3.`],
      };
    }

    case 'ENEMY_PAID_SAME_CASCADED': {
      const card = action.payload.card;
      const newCascadeCount = state.cascadeCount + 1;
      return {
        ...state,
        enemySeals: state.enemySeals - action.payload.costPaid,
        enemyDeck: state.enemyDeck.slice(1),
        // enemyBoard: [...state.enemyBoard, card], // Removed direct addition to board
        lastPlayedCost: card.cost, // C stays same for R = C
        cascadeCount: newCascadeCount,
        revealedCascadeChain: [...state.revealedCascadeChain, card], // Append to chain
        log: [...state.log, `Enemy paid ${action.payload.costPaid} seals to force cascade with ${card.name} (Cost ${card.cost}). Cascade count: ${newCascadeCount}/3.`],
      };
    }

    case 'ENEMY_FAILED_CASCADE': {
      // The card that caused the failure is the last in the revealedCascadeChain
      const cardToReturn = state.revealedCascadeChain[state.revealedCascadeChain.length - 1];
      return {
        ...state,
        enemyDeck: [...state.enemyDeck, cardToReturn], // Return failed card to bottom of enemy deck
        revealedCascadeChain: [], // Clear chain if failed
        lastPlayedCost: null, // Reset last played cost
        cascadeCount: 0, // Reset cascade count
        log: [...state.log, `Enemy failed to cascade with ${cardToReturn.name} (Cost ${cardToReturn.cost}). Card returned to bottom of deck. Cascade chain cleared.`],
      };
    }

    case 'ADD_LOG':
      return {
        ...state,
        log: [...state.log, action.payload.message],
      };

    case 'END_TURN': {
      const nextTurn = state.currentTurn === 'player' ? 'enemy' : 'player';

      // Move all cards from revealedCascadeChain to the appropriate board
      const finalPlayerBoard = state.currentTurn === 'player' ? [...state.playerBoard, ...state.revealedCascadeChain] : state.playerBoard;
      const finalEnemyBoard = state.currentTurn === 'enemy' ? [...state.enemyBoard, ...state.revealedCascadeChain] : state.enemyBoard;

      newState = {
        ...state,
        currentTurn: nextTurn,
        turnNumber: nextTurn === 'player' ? state.turnNumber + 1 : state.turnNumber,
        log: [...state.log, `--- Turn ${state.turnNumber} Ends ---`], // Keep previous logs, add separator
        revealedCascadeChain: [], // Clear chain at end of turn
        waitingForPlayer: nextTurn === 'player',
        phase: 'start-turn',
        lastPlayedCost: null,
        cascadeCount: 0,
        playerBoard: finalPlayerBoard, // Update boards
        enemyBoard: finalEnemyBoard,   // Update boards
      };
      return checkWinLoss(newState);
    }

    case 'START_PLAYER_TURN': {
      let newSeals = state.playerSeals + 1;
      let logMessage = `Player's turn starts. Gained 1 seal.`;
      if (
        state.playerHero.id === 'mirror' &&
        state.enemyBoard.length - state.playerBoard.length >= 3
      ) {
        newSeals += 1;
        logMessage += ` (${state.playerHero.ability}: +1 additional seal).`;
      }
      return {
        ...state,
        playerSeals: newSeals,
        phase: 'flip',
        waitingForPlayer: true,
        log: [...state.log, logMessage],
      };
    }

    case 'FLIP_CARD': {
      if (state.playerDeck.length === 0) {
        newState = {
          ...state,
          phase: 'end',
          waitingForPlayer: true,
          log: [...state.log, '⚠️ Your deck is empty! Cannot flip card.'],
        };
        return checkWinLoss(newState);
      }
      const card = state.playerDeck[0];
      return {
        ...state,
        playerDeck: state.playerDeck.slice(1),
        // playerBoard: [...state.playerBoard, card], // Removed direct addition to board
        lastPlayedCost: card.cost,
        cascadeCount: 0, // Cascade count is 0 for the first card of a new cascade
        revealedCascadeChain: [card], // Add card to revealedCascadeChain
        phase: 'free',
        waitingForPlayer: true,
        log: [...state.log, `You flipped ${card.name} (Cost ${card.cost}). This starts a new cascade.`],
      };
    }

    case 'FREE_CASCADE': {
      if (state.playerDeck.length === 0) {
        return {
          ...state,
          log: [...state.log, '→ No cards left in deck to free cascade.'],
          phase: 'choice',
          waitingForPlayer: true,
        };
      }
      const card = state.playerDeck[0];
      return {
        ...state,
        revealedCascadeChain: [...state.revealedCascadeChain, card], // Append to chain
        log: [...state.log, `You revealed ${card.name} (Cost ${card.cost}) for a free cascade attempt.`],
        phase: 'resolve-free',
        waitingForPlayer: true,
      };
    }

    case 'RESOLVE_FREE': {
      // The card being resolved is the last one in the revealedCascadeChain
      const card = state.revealedCascadeChain[state.revealedCascadeChain.length - 1];
      const { forcedCapture } = action.payload || {};
      let newState = { ...state, waitingForPlayer: true }; // revealedCascadeChain is handled based on capture/failure

      if (!card) {
        return {
          ...state,
          log: [...state.log, 'No card was revealed to resolve.'],
          phase: 'choice',
          waitingForPlayer: true,
        };
      }

      // R < C: FREE CASCADE (Capture)
      if (card.cost < state.lastPlayedCost && state.cascadeCount < 2) {
        const newCascadeCount = state.cascadeCount + 1;
        newState = {
          ...newState,
          playerDeck: state.playerDeck.slice(1),
          // playerBoard: [...state.playerBoard, card], // Card moved at END_TURN
          cascadeCount: newCascadeCount,
          lastPlayedCost: card.cost, // Update C to R
          log: [...state.log, `You successfully free cascaded ${card.name} (Cost ${card.cost}). Cascade count: ${newCascadeCount}/3.`],
          phase: newCascadeCount >= 3 ? 'hero' : 'choice',
        };
      }
      // R = C: FORCED CAPTURE (must pay R+1 seals)
      else if (card.cost === state.lastPlayedCost) {
        const requiredSeals = card.cost + 1;
        
        if (forcedCapture && state.playerSeals >= requiredSeals && state.cascadeCount < 2) {
          const newCascadeCount = state.cascadeCount + 1;
          newState = {
            ...newState,
            playerSeals: state.playerSeals - requiredSeals,
            playerDeck: state.playerDeck.slice(1),
            // playerBoard: [...state.playerBoard, card], // Card moved at END_TURN
            cascadeCount: newCascadeCount,
            lastPlayedCost: card.cost, // C stays same
            log: [...state.log, `You paid ${requiredSeals} seals to force cascade with ${card.name} (Cost ${card.cost}). Cascade count: ${newCascadeCount}/3.`],
            phase: newCascadeCount >= 3 ? 'hero' : 'choice',
          };
        } else {
          // Declined or can't afford - card goes to bottom, chain clears
          newState = {
            ...newState,
            playerDeck: [...state.playerDeck.slice(1), card],
            revealedCascadeChain: [], // Clear chain
            lastPlayedCost: null, // Reset last played cost
            cascadeCount: 0, // Reset cascade count
            log: [...state.log, `You declined or couldn't afford (${requiredSeals} seals needed) to force cascade ${card.name} (Cost ${card.cost}). Card returned to bottom of deck. Cascade chain cleared.`],
            phase: 'choice',
          };
        }
      }
      // R > C: CASCADE BREAKS (Card returns to bottom, chain clears)
      else {
        newState = {
          ...newState,
          playerDeck: [...state.playerDeck.slice(1), card],
          revealedCascadeChain: [], // Clear chain
          lastPlayedCost: null, // Reset last played cost
          cascadeCount: 0, // Reset cascade count
          log: [...state.log, `Cascade broke with ${card.name} (Cost ${card.cost} > Last Played Cost ${state.lastPlayedCost}). Card returned to bottom of deck. Cascade chain cleared.`],
          phase: 'choice',
        };
      }
      
      return newState;
    }

    case 'USE_SEAL': {
      if (state.playerSeals <= 0) { // Check player seals first
        return {
          ...state,
          log: [...state.log, `⚠️ You have no seals to start a new cascade. (Current seals: ${state.playerSeals})`],
          phase: 'hero',
          waitingForPlayer: true,
        };
      }
      
      if (state.playerDeck.length === 0) { // Then check player deck
        return {
          ...state,
          log: [...state.log, '⚠️ Your deck is empty! Cannot start a new cascade.'],
          phase: 'hero',
          waitingForPlayer: true,
        };
      }
      
      if (state.cascadeCount >= 3) {
        return {
          ...state,
          log: [...state.log, `⚠️ Cascade limit reached (3/3). Cannot start a new cascade.`],
          phase: 'hero',
          waitingForPlayer: true,
        };
      }

      const card = state.playerDeck[0];
      return {
        ...state,
        playerSeals: state.playerSeals - 1,
        revealedCascadeChain: [...state.revealedCascadeChain, card], // Add to chain
        log: [...state.log, `You paid 1 seal. Revealed ${card.name} (Cost ${card.cost}) to start a new cascade.`],
        phase: 'resolve-paid',
        waitingForPlayer: true,
      };
    }

    case 'RESOLVE_PAID': {
      // The card being resolved is the last one in the revealedCascadeChain
      const card = state.revealedCascadeChain[state.revealedCascadeChain.length - 1];
      const { forcedCapture } = action.payload || {};
      let newState = { ...state, waitingForPlayer: true }; // revealedCascadeChain is handled based on capture/failure

      if (!card) {
        return {
          ...state,
          log: [...state.log, 'No card was revealed to resolve.'],
          phase: 'choice',
          waitingForPlayer: true,
        };
      }

      // R < C: FREE CASCADE (Capture)
      if (card.cost < state.lastPlayedCost && state.cascadeCount < 2) {
        const newCascadeCount = state.cascadeCount + 1;
        newState = {
          ...newState,
          playerDeck: state.playerDeck.slice(1),
          // playerBoard: [...state.playerBoard, card], // Card moved at END_TURN
          cascadeCount: newCascadeCount,
          lastPlayedCost: card.cost, // Update C to R
          log: [...state.log, `You performed a free cascade with ${card.name} (Cost ${card.cost}) after paying a seal. Cascade count: ${newCascadeCount}/3.`],
          phase: newCascadeCount >= 3 ? 'hero' : 'choice',
        };
      }
      // R = C: FORCED CAPTURE (must pay R+1 seals)
      else if (card.cost === state.lastPlayedCost) {
        const requiredSeals = card.cost + 1;
        
        if (forcedCapture && state.playerSeals >= requiredSeals && state.cascadeCount < 2) {
          const newCascadeCount = state.cascadeCount + 1;
          newState = {
            ...newState,
            playerSeals: state.playerSeals - requiredSeals,
            playerDeck: state.playerDeck.slice(1),
            // playerBoard: [...state.playerBoard, card], // Card moved at END_TURN
            cascadeCount: newCascadeCount,
            lastPlayedCost: card.cost, // C stays same
            log: [...state.log, `You paid ${requiredSeals} seals to force cascade with ${card.name} (Cost ${card.cost}). Cascade count: ${newCascadeCount}/3.`],
            phase: newCascadeCount >= 3 ? 'hero' : 'choice',
          };
        } else {
          // Declined or can't afford - card goes to bottom, chain clears
          newState = {
            ...newState,
            playerDeck: [...state.playerDeck.slice(1), card],
            revealedCascadeChain: [], // Clear chain
            lastPlayedCost: null, // Reset last played cost
            cascadeCount: 0, // Reset cascade count
            log: [...state.log, `You declined or couldn't afford (${requiredSeals} seals needed) to force cascade ${card.name} (Cost ${card.cost}). Card returned to bottom of deck. Cascade chain cleared.`],
            phase: 'choice',
          };
        }
      }
      // R > C: Can now force capture by paying R+1
      else if (card.cost > state.lastPlayedCost) {
        const requiredSeals = card.cost + 1;
        
        if (forcedCapture && state.playerSeals >= requiredSeals && state.cascadeCount < 2) {
          const newCascadeCount = state.cascadeCount + 1;
          newState = {
            ...newState,
            playerSeals: state.playerSeals - requiredSeals,
            playerDeck: state.playerDeck.slice(1),
            // playerBoard: [...state.playerBoard, card], // Card moved at END_TURN
            cascadeCount: newCascadeCount,
            lastPlayedCost: card.cost, // Update C to R (starting new cascade at higher cost)
            log: [...state.log, `You paid ${requiredSeals} seals to start a new cascade with ${card.name} (Cost ${card.cost}). Cascade count: ${newCascadeCount}/3.`],
            phase: newCascadeCount >= 3 ? 'hero' : 'choice',
          };
        } else {
          // Declined or can't afford - card goes to bottom, chain clears
          newState = {
            ...newState,
            playerDeck: [...state.playerDeck.slice(1), card],
            revealedCascadeChain: [], // Clear chain
            lastPlayedCost: null, // Reset last played cost
            cascadeCount: 0, // Reset cascade count
            log: [...state.log, `You declined or couldn't afford (${requiredSeals} seals needed) to start a new cascade with ${card.name} (Cost ${card.cost}). Card returned to bottom of deck. Cascade chain cleared.`],
            phase: 'choice',
          };
        }
      }
      
      return newState;
    }

    case 'STOP_SEALING':
      return {
        ...state,
        log: [...state.log, 'You chose to stop cascading.'], // More verbose log
        revealedCascadeChain: [], // Clear chain
        lastPlayedCost: null, // Reset last played cost
        cascadeCount: 0, // Reset cascade count
        phase: 'hero',
        waitingForPlayer: true,
      };

    case 'APPLY_HERO_ABILITY': {
      let newState = { ...state, waitingForPlayer: true };
      if (state.playerHero.id === 'fortune' && state.cascadeCount <= 1) {
        newState = {
          ...newState,
          playerSeals: state.playerSeals + 1,
          log: [...state.log, `⭐ ${state.playerHero.name}'s ability triggered: ${state.playerHero.ability}. Player gains 1 seal. (Current seals: ${state.playerSeals} -> ${state.playerSeals + 1})`],
        };
      } else {
        newState = {
          ...newState,
          log: [...newState.log, `No hero ability triggered for ${state.playerHero.name}.`],
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
