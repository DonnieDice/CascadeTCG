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

  // Helper function for card rendering to reduce repetition
  // Added optional className for stacking
  const renderCard = (card, index, stack = false) => (
    <div
      key={index}
      className={`relative w-28 h-36 md:w-32 md:h-40 ${ELEMENT_BACKGROUNDS[card.element]} rounded-lg md:rounded-xl p-2 border-2 border-light shadow-md
                  flex flex-col justify-between items-center text-dark font-sans text-shadow-sm
                  ${stack ? 'transform transition-transform duration-200 hover:-translate-y-2' : ''}`} // Added hover effect for stacking
      style={stack ? { zIndex: index, left: `${index * 2}px` } : {}} // Basic stacking offset
    >
      <div className="absolute -top-3 -right-3 bg-accent text-dark font-game text-sm md:text-xl w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 border-light shadow-lg">
        {card.cost}
      </div>
      <div className="text-xs md:text-sm font-bold text-center mt-4">{card.name}</div>
      <div className="text-xxs md:text-xs text-center opacity-80">{card.element}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 to-dark font-sans text-light p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        {/* Turn Indicator */}
        <div className="p-3 md:p-4 bg-light/90 rounded-lg md:rounded-xl shadow-md border-b-4 border-primary-500 text-center">
          <div
            className={`text-2xl md:text-3xl font-game px-4 py-2 md:px-8 md:py-3 rounded-lg md:rounded-xl shadow-lg inline-block
                           ${isPlayerTurn ? 'bg-gradient-to-r from-secondary to-accent text-dark' : 'bg-gradient-to-r from-danger to-warning text-dark'}`}
          >
            {isPlayerTurn ? '⭐ YOUR TURN' : '🎴 ENEMY TURN'}
          </div>
        </div>

        {/* Enemy Info and Board */}
        <div className="p-4 md:p-6 bg-gradient-to-br from-dark-800 to-primary-700 rounded-lg md:rounded-xl shadow-lg border-b-4 border-dark-900">
          <div className="mb-3 md:mb-4 p-3 md:p-5 bg-light/90 rounded-lg md:rounded-xl shadow-inner">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
              <div className="flex-1 text-center md:text-left mb-3 md:mb-0">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <Star className="text-danger" size={24} />
                  <div className="text-xl md:text-2xl font-game text-dark">{enemyHero?.name}</div>
                </div>
                <div className="text-sm md:text-lg text-warning-700 font-semibold">
                  {enemyHero?.ability}
                </div>
                <p className="text-xs text-dark-600 hidden sm:block">{enemyHero?.desc}</p>
              </div>
              <div className="flex gap-3 md:gap-4 items-center">
                <div className="text-center">
                  <div className="text-xxs md:text-xs font-bold mb-1 text-dark">HP</div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-danger-100 rounded-lg">
                    <Heart className="text-danger" size={16} />
                    <span className="text-xl md:text-2xl font-bold text-dark">{enemyHP}</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xxs md:text-xs font-bold mb-1 text-dark">SEALS</div>
                  <div className="flex items-center gap-1 px-4 py-1 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-lg shadow-inner border border-primary-400">
                    <Zap className="text-accent" size={24} />
                    <span className="text-2xl md:text-3xl font-game text-primary-800">
                      {enemySeals}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xxs md:text-xs font-bold mb-1 text-dark">DECK</div>
                  <div className="px-2 py-1 bg-danger-100 rounded-lg">
                    <span className="text-lg md:text-xl font-bold text-dark">
                      📚 {enemyDeck.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enemy Captured Cards (Board) */}
          <div className="min-h-[120px] md:min-h-[150px] bg-dark-600/60 p-3 rounded-lg md:rounded-xl shadow-inner relative">
            <div className="text-sm font-game mb-2 text-light">
              🎴 ENEMY CAPTURED - {enemyBoard.length} total
            </div>
            <div className="flex flex-wrap justify-center overflow-x-auto pb-2">
              {enemyBoard.map((c, i) => renderCard(c, i, true))}
            </div>
          </div>
        </div>

        {/* Log and Revealed Card Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Game Log */}
          <div className="flex-1 p-3 bg-light/10 rounded-lg md:rounded-xl shadow-inner border-2 border-primary-600 h-40 md:h-48 overflow-y-auto font-mono text-light text-xs md:text-sm">
            {log.map((m, i) => (
              <div key={i} className="py-0.5">
                {m}
              </div>
            ))}
          </div>

          {/* Revealed Card */}
          <div className="w-full md:w-auto flex-shrink-0 flex items-center justify-center p-3 bg-light/10 rounded-lg md:rounded-xl shadow-inner border-2 border-secondary-600 h-40 md:h-48">
            {revealedCard ? (
              <div className="relative w-32 h-40">
                {' '}
                {/* Container for revealed card */}
                {renderCard(revealedCard, 'revealed-single')}
              </div>
            ) : (
              <div className="text-dark-400 font-game text-lg text-center">No Card Revealed</div>
            )}
          </div>
        </div>

        {/* Player Captured Cards (Board) */}
        <div className="p-4 md:p-6 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg md:rounded-xl shadow-lg border-t-4 border-primary-700">
          <div className="min-h-[120px] md:min-h-[150px] bg-dark-600/60 p-3 rounded-lg md:rounded-xl shadow-inner relative">
            <div className="text-sm font-game mb-2 text-light">
              ⭐ YOUR CAPTURED - {playerBoard.length} total
            </div>
            <div className="flex flex-wrap justify-center overflow-x-auto pb-2">
              {playerBoard.map((c, i) => renderCard(c, i, true))}
            </div>
          </div>
        </div>

        {/* Player Info */}
        <div className="p-4 md:p-6 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-lg md:rounded-xl shadow-lg border-t-4 border-primary-700">
          <div className="mb-3 md:mb-4 p-3 md:p-5 bg-light/90 rounded-lg md:rounded-xl shadow-inner">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
              <div className="flex-1 text-center md:text-left mb-3 md:mb-0">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <Star className="text-secondary" size={24} />
                  <div className="text-xl md:text-2xl font-game text-dark">{playerHero?.name}</div>
                </div>
                <div className="text-sm md:text-lg text-primary-700 font-semibold">
                  {playerHero?.ability}
                </div>
                <p className="text-xs text-dark-600 hidden sm:block">{playerHero?.desc}</p>
              </div>
              <div className="flex gap-3 md:gap-4 items-center">
                <div className="text-center">
                  <div className="text-xxs md:text-xs font-bold mb-1 text-dark">HP</div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-secondary-100 rounded-lg">
                    <Heart className="text-secondary" size={16} />
                    <span className="text-xl md:text-2xl font-bold text-dark">{playerHP}</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xxs md:text-xs font-bold mb-1 text-dark">SEALS</div>
                  <div className="flex items-center gap-1 px-4 py-1 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-lg shadow-inner border border-primary-400">
                    <Zap className="text-accent" size={24} />
                    <span className="text-2xl md:text-3xl font-game text-primary-800">
                      {playerSeals}
                    </span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xxs md:text-xs font-bold mb-1 text-dark">DECK</div>
                  <div className="px-2 py-1 bg-secondary-100 rounded-lg">
                    <span className="text-lg md:text-xl font-bold text-dark">
                      📚 {playerDeck.length}
                    </span>
                  </div>
                </div>
                {/* Cascade Count Moved Here */}
                <div className="text-center">
                  <div className="text-xxs md:text-xs font-bold mb-1 text-dark">CASCADE</div>
                  <div className="px-2 py-1 bg-light rounded-lg">
                    <span className="text-lg md:text-xl font-game text-accent">
                      ✨ {cascadeCount}/3
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Player Actions */}
        {isPlayerTurn && waitingForPlayer && isGameActive && (
          <div className="mb-4 flex flex-col sm:flex-row gap-3 justify-center p-3 bg-light/10 rounded-lg md:rounded-xl shadow-md border-t-2 border-b-2 border-secondary-600">
            {phase === 'choice' ? (
              <>
                <button
                  onClick={() => dispatch({ type: 'USE_SEAL' })}
                  disabled={playerSeals === 0}
                  className="flex-1 py-3 px-4 bg-primary hover:bg-primary-700 disabled:bg-dark-400 text-light rounded-lg font-game text-base md:text-xl shadow-md transition-all duration-200"
                >
                  🔮 Use Seal ({playerSeals})
                </button>
                <button
                  onClick={() => dispatch({ type: 'STOP_SEALING' })}
                  className="flex-1 py-3 px-4 bg-dark-600 hover:bg-dark-700 text-light rounded-lg font-game text-base md:text-xl shadow-md transition-all duration-200"
                >
                  ⏭️ Stop
                </button>
              </>
            ) : phase === 'resolve-free' || phase === 'resolve-paid' ? (
              <>
                {/* Changed cost logic for paySame based on GameEngine */}
                {revealedCard &&
                  revealedCard.cost === lastPlayedCost &&
                  playerSeals >= 1 &&
                  cascadeCount < 3 && (
                    <button
                      onClick={() =>
                        dispatch({
                          type: phase === 'resolve-free' ? 'RESOLVE_FREE' : 'RESOLVE_PAID',
                          payload: { paySame: true, payToSucceed: false },
                        })
                      }
                      className="flex-1 py-3 px-4 bg-success hover:bg-success-700 text-light rounded-lg font-game text-base md:text-lg shadow-md transition-all duration-200"
                    >
                      ⚡ Pay Same (1 Seal)
                    </button>
                  )}
                {/* Changed cost logic for payToSucceed based on GameEngine */}
                {revealedCard &&
                  revealedCard.cost >= lastPlayedCost &&
                  playerSeals >= revealedCard.cost + 1 &&
                  cascadeCount < 3 && (
                    <button
                      onClick={() =>
                        dispatch({
                          type: phase === 'resolve-free' ? 'RESOLVE_FREE' : 'RESOLVE_PAID',
                          payload: { paySame: false, payToSucceed: true },
                        })
                      }
                      className="flex-1 py-3 px-4 bg-warning hover:bg-warning-700 text-dark rounded-lg font-game text-base md:text-lg shadow-md transition-all duration-200"
                    >
                      💎 Force ({revealedCard.cost + 1} Seals)
                    </button>
                  )}
                <button
                  onClick={() => dispatch({ type: 'HANDLE_ACTION' })}
                  className="flex-1 py-3 px-4 bg-info hover:bg-info-700 text-light rounded-lg font-game text-base md:text-lg shadow-md transition-all duration-200"
                >
                  ▶️ Continue
                </button>
              </>
            ) : (
              <button
                onClick={() => dispatch({ type: 'HANDLE_ACTION' })}
                className="w-full py-4 px-6 bg-success hover:bg-success-700 text-light rounded-lg font-game text-xl shadow-md transition-all duration-200"
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
