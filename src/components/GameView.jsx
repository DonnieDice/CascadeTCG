import React from 'react';
import { Heart, Zap, Star } from 'lucide-react';
import { ELEMENT_BACKGROUNDS } from '../constants';

export default function GameView({ state, dispatch }) {
  const {
    playerHero,
    enemyHero,
    playerBoard,
    enemyBoard,
    playerHP,
    enemyHP,
    playerSeals,
    enemySeals,
    playerDeck,
    enemyDeck,
    log,
    currentTurn,
    cascadeCount,
    revealedCard,
    phase,
    waitingForPlayer,
    lastPlayedCost,
    gameStatus,
  } = state;

  const isPlayerTurn = currentTurn === 'player';
  const isGameActive = gameStatus === 'playing';

  // Compact card rendering
  const renderCard = (card, index) => (
    <div
      key={index}
      className={`relative w-16 h-20 ${ELEMENT_BACKGROUNDS[card.element]} rounded p-1 border border-light shadow-sm
                  flex flex-col justify-between items-center text-dark text-[8px] leading-tight`}
    >
      <div className="absolute -top-1 -right-1 bg-accent text-dark font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-light">
        {card.cost}
      </div>
      <div className="font-bold text-center mt-2 truncate w-full px-0.5">{card.name}</div>
    </div>
  );

  return (
    <div className="h-screen bg-gradient-to-br from-primary-800 to-dark font-sans text-light p-2 overflow-hidden flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-1 min-h-0">
        {/* Turn Indicator - Compact */}
        <div className="p-1 bg-light/90 rounded shadow-sm text-center flex-shrink-0">
          <div
            className={`text-sm font-game px-3 py-1 rounded shadow inline-block
                           ${isPlayerTurn ? 'bg-gradient-to-r from-secondary to-accent text-dark' : 'bg-gradient-to-r from-danger to-warning text-dark'}`}
          >
            {isPlayerTurn ? '⭐ YOUR TURN' : '🎴 ENEMY TURN'}
          </div>
        </div>

        {/* Enemy Section - Compact */}
        <div className="p-2 bg-gradient-to-br from-dark-800 to-primary-700 rounded shadow flex-shrink-0">
          <div className="flex justify-between items-center gap-2 mb-1">
            <div className="flex items-center gap-1">
              <Star className="text-danger" size={14} />
              <span className="text-sm font-game text-light">{enemyHero?.name}</span>
            </div>
            <div className="flex gap-2 items-center text-xs">
              <div className="flex items-center gap-1 px-1 py-0.5 bg-danger-100 rounded">
                <Heart className="text-danger" size={12} />
                <span className="font-bold text-dark">{enemyHP}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-br from-primary-200 to-secondary-200 rounded">
                <Zap className="text-accent" size={14} />
                <span className="font-game text-primary-800">{enemySeals}</span>
              </div>
              <div className="px-1 py-0.5 bg-danger-100 rounded">
                <span className="font-bold text-dark">📚 {enemyDeck.length}</span>
              </div>
            </div>
          </div>

          {/* Enemy Board - Compact */}
          <div className="min-h-[80px] bg-dark-600/60 p-1 rounded">
            <div className="text-[10px] font-game mb-1 text-light">
              🎴 ENEMY - {enemyBoard.length}
            </div>
            <div className="flex flex-wrap gap-1">
              {enemyBoard.map((c, i) => renderCard(c, i))}
            </div>
          </div>
        </div>

        {/* Middle Section - Log and Revealed Card */}
        <div className="flex gap-2 flex-1 min-h-0">
          {/* Game Log - Compact and Scrollable */}
          <div className="flex-1 p-2 bg-light/10 rounded shadow-inner border border-primary-600 overflow-y-auto font-mono text-light text-[10px] leading-tight">
            {log.slice(-15).map((m, i) => (
              <div key={i} className="py-0.5">
                {m}
              </div>
            ))}
          </div>

          {/* Revealed Card - Compact */}
          <div className="w-20 flex flex-col items-center justify-center p-2 bg-light/10 rounded shadow-inner border border-secondary-600">
            {revealedCard ? (
              <>
                <div className="relative w-16 h-20 mb-1">
                  {renderCard(revealedCard, 'revealed')}
                </div>
                {lastPlayedCost !== null && (
                  <div className="text-center text-light font-game text-[8px] leading-tight">
                    {revealedCard.cost < lastPlayedCost && '✅ FREE'}
                    {revealedCard.cost === lastPlayedCost && `💰 ${revealedCard.cost + 1}`}
                    {revealedCard.cost > lastPlayedCost && '❌ BREAK'}
                  </div>
                )}
              </>
            ) : (
              <div className="text-dark-400 font-game text-[10px] text-center">No Card</div>
            )}
          </div>
        </div>

        {/* Player Board - Compact */}
        <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-600 rounded shadow flex-shrink-0">
          <div className="min-h-[80px] bg-dark-600/60 p-1 rounded">
            <div className="text-[10px] font-game mb-1 text-light">
              ⭐ YOUR BOARD - {playerBoard.length}
            </div>
            <div className="flex flex-wrap gap-1">
              {playerBoard.map((c, i) => renderCard(c, i))}
            </div>
          </div>
        </div>

        {/* Player Info - Compact */}
        <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-600 rounded shadow flex-shrink-0">
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="text-secondary" size={14} />
              <span className="text-sm font-game text-light">{playerHero?.name}</span>
            </div>
            <div className="flex gap-2 items-center text-xs">
              <div className="flex items-center gap-1 px-1 py-0.5 bg-secondary-100 rounded">
                <Heart className="text-secondary" size={12} />
                <span className="font-bold text-dark">{playerHP}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-br from-primary-200 to-secondary-200 rounded">
                <Zap className="text-accent" size={14} />
                <span className="font-game text-primary-800">{playerSeals}</span>
              </div>
              <div className="px-1 py-0.5 bg-secondary-100 rounded">
                <span className="font-bold text-dark">📚 {playerDeck.length}</span>
              </div>
              <div className="px-1 py-0.5 bg-light rounded">
                <span className={`font-game text-xs ${cascadeCount >= 3 ? 'text-danger' : 'text-accent'}`}>
                  ✨ {cascadeCount}/3
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Player Actions - Compact */}
        {isPlayerTurn && waitingForPlayer && isGameActive && (
          <div className="flex gap-2 justify-center p-2 bg-light/10 rounded shadow-sm flex-shrink-0">
            {phase === 'choice' && cascadeCount < 3 && (
              <>
                <button
                  onClick={() => dispatch({ type: 'USE_SEAL' })}
                  disabled={playerSeals === 0}
                  className="flex-1 py-2 px-3 bg-primary hover:bg-primary-700 disabled:bg-dark-400 text-light rounded font-game text-sm shadow-md transition-all duration-200"
                >
                  🔮 Cascade (1)
                </button>
                <button
                  onClick={() => dispatch({ type: 'STOP_SEALING' })}
                  className="flex-1 py-2 px-3 bg-dark-600 hover:bg-dark-700 text-light rounded font-game text-sm shadow-md transition-all duration-200"
                >
                  ⏭️ Stop
                </button>
              </>
            )}
            
            {(phase === 'resolve-free' || phase === 'resolve-paid') && revealedCard && (
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
                    className="flex-1 py-2 px-3 bg-warning hover:bg-warning-700 text-dark rounded font-game text-sm shadow-md transition-all duration-200"
                  >
                    💎 Force ({revealedCard.cost + 1})
                  </button>
                )}
                <button
                  onClick={() => dispatch({ type: 'HANDLE_ACTION' })}
                  className="flex-1 py-2 px-3 bg-info hover:bg-info-700 text-light rounded font-game text-sm shadow-md transition-all duration-200"
                >
                  ▶️ Next
                </button>
              </>
            )}
            
            {(phase === 'start-turn' || phase === 'flip' || phase === 'free' || phase === 'hero' || phase === 'end' || (phase === 'choice' && cascadeCount >= 3)) && (
              <button
                onClick={() => dispatch({ type: 'HANDLE_ACTION' })}
                className="w-full py-2 px-4 bg-success hover:bg-success-700 text-light rounded font-game text-base shadow-md transition-all duration-200"
              >
                ▶️ NEXT
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}