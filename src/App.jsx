import React, { useReducer, useEffect, useState } from 'react';
import { HEROES } from './constants';
import gameReducer from './game/GameEngine';
import { initialGameState } from './game/initialState';
import HeroSelect from './components/HeroSelect';
import GameView from './components/GameView';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState(null, null));
  const [localPlayerHero, setLocalPlayerHero] = useState(null);
  const [localEnemyHero, setLocalEnemyHero] = useState(null);

  const startGame = () => {
    if (!localPlayerHero || !localEnemyHero) return;
    dispatch({
      type: 'START_GAME',
      payload: {
        playerHeroId: localPlayerHero.id,
        enemyHeroId: localEnemyHero.id,
      },
    });
  };

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  // Effect for enemy turn logic
  useEffect(() => {
    if (
      state.gameState !== 'playing' ||
      state.currentTurn !== 'enemy' ||
      state.gameStatus !== 'playing'
    ) {
      return;
    }

    let isMounted = true;

    const runEnemyTurn = async () => {
      if (!isMounted) return;

      await delay(800);
      let newSeals = state.enemySeals + 1;
      if (
        state.enemyHero.id === 'mirror' &&
        state.playerBoard.length - state.enemyBoard.length >= 3
      ) {
        newSeals += 1;
        dispatch({
          type: 'ADD_LOG',
          payload: { message: '⭐ ' + state.enemyHero.ability + ': +1 seal' },
        });
        await delay(600);
      }
      dispatch({
        type: 'ADD_LOG',
        payload: { message: '🔄 Enemy Turn ' + state.turnNumber + ' - Gains +1 seal' },
      });
      if (newSeals > state.enemySeals) {
        dispatch({
          type: 'ENEMY_GAIN_SEAL',
          payload: { amount: newSeals - state.enemySeals, message: '' },
        });
      }
      await delay(800);

      if (state.enemyDeck.length === 0) {
        dispatch({ type: 'ADD_LOG', payload: { message: '⚠️ Enemy deck empty!' } });
        await delay(1000);
        dispatch({ type: 'END_TURN' });
        return;
      }

      const card = state.enemyDeck[0];
      dispatch({
        type: 'ENEMY_CAPTURE_CARD',
        payload: { card: card, message: '🎴 Enemy captured: ' + card.name },
      });
      await delay(1000);

      let currentDeck = state.enemyDeck.slice(1);
      let currentCascades = 1; // After the first card is captured, cascade count is 1.
      let currentLastCost = card.cost; // The cost of the card just captured.
      let currentSeals = newSeals; // Seals after initial gain for the turn.

      if (currentDeck.length > 0) {
        const next = currentDeck[0];
        dispatch({
          type: 'SET_REVEALED_CARD',
          payload: { card: next, message: '✨ FREE: ' + next.name + ' (' + next.cost + ')' },
        });
        await delay(1200);

        // Now, use currentLastCost and currentCascades for decision.
        if (next.cost < currentLastCost && currentCascades < 3) {
          dispatch({
            type: 'ENEMY_CASCADED',
            payload: { card: next, message: '✅ CASCADE (' + (currentCascades + 1) + '/3)' },
          });
          await delay(800);
        } else if (
          next.cost === currentLastCost &&
          currentCascades < 3 &&
          currentSeals >= next.cost + 1
        ) {
          const cost = next.cost + 1;
          dispatch({
            type: 'ENEMY_PAID_SAME_CASCADED',
            payload: { card: next, costPaid: cost, message: '⚡ SAME! Paid ' + cost },
          });
          await delay(800);
        } else {
          dispatch({ type: 'ENEMY_FAILED_CASCADE', payload: { card: next, message: '❌ FAILED' } });
          await delay(800);
        }
      }

      if (state.enemyHero.id === 'fortune' && currentCascades <= 1) {
        dispatch({
          type: 'ENEMY_GAIN_SEAL',
          payload: { amount: 1, message: '⭐ ' + state.enemyHero.ability + ': +1 seal' },
        });
        await delay(800);
      }

      dispatch({
        type: 'ADD_LOG',
        payload: { message: '════════════════════════════════════════' },
      });
      await delay(1000);
      dispatch({ type: 'END_TURN' });
    };

    runEnemyTurn();

    return () => {
      isMounted = false;
    };
  }, [
    state.currentTurn,
    state.gameState,
    state.gameStatus,
    state.enemyBoard.length,
    state.enemyDeck,
    state.enemyHero,
    state.enemySeals,
    state.playerBoard.length,
    state.turnNumber,
  ]);

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
    setLocalPlayerHero(null);
    setLocalEnemyHero(null);
  };

  if (state.gameState === 'hero-select') {
    return (
      <HeroSelect
        playerHero={localPlayerHero}
        enemyHero={localEnemyHero}
        setPlayerHero={setLocalPlayerHero}
        setEnemyHero={setLocalEnemyHero}
        startGame={startGame}
        heroes={HEROES}
      />
    );
  }

  if (state.gameStatus !== 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-6 flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 rounded-xl border-4 border-purple-400">
          <h1 className="text-5xl font-bold text-purple-800 mb-4">
            {state.gameStatus === 'playerWon' ? '🎉 YOU WIN! 🎉' : '💥 YOU LOSE! 💥'}
          </h1>
          <button
            onClick={resetGame}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xl"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return <GameView state={state} dispatch={dispatch} />;
}