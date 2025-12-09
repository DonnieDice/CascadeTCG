import React from 'react';

export default function PlayerActions({ isPlayerTurn, waitingForPlayer, isGameActive, phase, cascadeCount, playerSeals, revealedCascadeChain, lastPlayedCost, dispatch }) {
  if (!isPlayerTurn || !waitingForPlayer || !isGameActive) {
    return null;
  }

  const revealedCard = revealedCascadeChain[revealedCascadeChain.length - 1]; // Get the last revealed card

  return (
    <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-center p-5 md:p-6 bg-dark-300/20 rounded-xl shadow-xl border-4 border-secondary-600">
      {phase === 'choice' && cascadeCount < 3 ? (
        <>
          <button
            onClick={() => dispatch({ type: 'USE_SEAL' })}
            disabled={playerSeals === 0}
            className="flex-1 py-4 md:py-6 px-6 md:px-8 bg-primary-700 hover:bg-primary-800 disabled:bg-dark-400 disabled:cursor-not-allowed text-light rounded-xl font-game text-xl md:text-2xl shadow-2xl transition-all duration-200 hover:scale-105"
          >
            🔮 Start New Cascade (1 Seal)
          </button>
          <button
            onClick={() => dispatch({ type: 'STOP_SEALING' })}
            className="flex-1 py-4 md:py-6 px-6 md:px-8 bg-dark-600 hover:bg-dark-700 text-light rounded-xl font-game text-xl md:text-2xl shadow-2xl transition-all duration-200 hover:scale-105"
          >
            ⏭️ Stop Cascading
          </button>
        </>
      ) : (phase === 'resolve-free' || phase === 'resolve-paid') && revealedCard ? (
        <>
          {revealedCard.cost >= lastPlayedCost &&
            playerSeals >= revealedCard.cost + 1 &&
            cascadeCount < 3 && (
              <button
                onClick={() =>
                  dispatch({
                    type: phase === 'resolve-free' ? 'RESOLVE_FREE' : 'RESOLVE_PAID',
                    payload: { forcedCapture: true },
                  })
                }
                className="flex-1 py-4 md:py-6 px-6 md:px-8 bg-warning hover:bg-warning-700 text-dark rounded-xl font-game text-lg md:text-xl shadow-2xl transition-all duration-200 hover:scale-105"
              >
                💎 Force Capture ({revealedCard.cost + 1} Seals)
              </button>
            )}
          <button
            onClick={() => dispatch({ type: 'HANDLE_ACTION' })}
            className="flex-1 py-4 md:py-6 px-6 md:px-8 bg-info hover:bg-info-700 text-light rounded-xl font-game text-lg md:text-xl shadow-2xl transition-all duration-200 hover:scale-105"
          >
            ▶️ Continue / Decline
          </button>
        </>
      ) : (
        <button
          onClick={() => dispatch({ type: 'HANDLE_ACTION' })}
          className="w-full py-5 md:py-7 px-8 md:px-12 bg-success hover:bg-success-700 text-light rounded-xl font-game text-2xl md:text-3xl shadow-2xl transition-all duration-200 hover:scale-105"
        >
          ▶️ NEXT PHASE
        </button>
      )}
    </div>
  );
}