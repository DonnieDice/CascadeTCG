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
    revealedCascadeChain, // Changed from revealedCard
    phase,
    waitingForPlayer,
    lastPlayedCost,
    gameStatus,
  } = state;

  const isPlayerTurn = currentTurn === 'player';
  const isGameActive = gameStatus === 'playing';

  // Card rendering with optional stack count
  const renderCard = (cardObj, index) => (
    <div
      key={index}
      className={`relative w-16 h-20 ${ELEMENT_BACKGROUNDS[cardObj.card.element]} rounded p-1 border border-light shadow-sm
                  flex flex-col justify-between items-center text-dark text-[8px] leading-tight`}
    >
      <div className="absolute -top-1 -right-1 bg-accent text-dark font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-light">
        {cardObj.card.cost}
      </div>
      <div className="font-bold text-center mt-2 truncate w-full px-0.5">{cardObj.card.name}</div>
      {cardObj.count > 1 && (
        <div className="absolute -bottom-1 -left-1 bg-info text-light font-bold text-[8px] w-5 h-5 rounded-full flex items-center justify-center border border-light">
          x{cardObj.count}
        </div>
      )}
    </div>
  );

  const groupAndStackCards = (board) => {
    const grouped = {};
    board.forEach(card => {
      const key = `${card.name}-${card.cost}`; // Group by name and cost
      if (!grouped[key]) {
        grouped[key] = { card: card, count: 0 };
      }
      grouped[key].count++;
    });
    return Object.values(grouped);
  };


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
              {enemyHero?.ability && <p className="text-xs text-light-400 ml-2">({enemyHero.ability})</p>}
            </div>
            <div className="flex gap-2 items-center text-sm"> {/* Increased text size */}
              <div className="flex items-center gap-1 px-2 py-1 bg-danger-100 rounded"> {/* Increased padding */}
                <Heart className="text-danger" size={16} /> {/* Increased icon size */}
                <span className="font-bold text-dark text-base">{enemyHP}</span> {/* Increased text size */}
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-br from-primary-200 to-secondary-200 rounded"> {/* Increased padding */}
                <Zap className="text-accent" size={18} /> {/* Increased icon size */}
                <span className="font-game text-primary-800 text-base">{enemySeals}</span> {/* Increased text size */}
              </div>
              <div className="px-2 py-1 bg-danger-100 rounded"> {/* Increased padding */}
                <span className="font-bold text-dark text-base">📚 {enemyDeck.length}</span> {/* Increased text size */}
              </div>
            </div>
          </div>

          {/* Enemy Board - Stacked */}
          <div className="min-h-[80px] bg-dark-600/60 p-1 rounded">
            <div className="text-[10px] font-game mb-1 text-light">
              🎴 ENEMY - {enemyBoard.length} cards
            </div>
            <div className="flex flex-wrap gap-1">
              {groupAndStackCards(enemyBoard).map((cardObj, i) => (
                <div key={i} className="relative w-16 h-20"> {/* Container for stacked card */}
                  {renderCard(cardObj, i)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle Section - Log and Revealed Card */}
        <div className="flex gap-2 flex-1 min-h-0">
          {/* Game Log - Smaller and Scrollable */}
          <div className="w-80 p-2 bg-light/10 rounded shadow-inner border border-primary-600 overflow-y-auto font-mono text-light text-[10px] leading-tight">
            {log.slice(-10).map((m, i) => (
              <div key={i} className="py-0.5">
                {m}
              </div>
            ))}
          </div>

          {/* Revealed Cards - Enlarged and Stacked */}
          <div className="w-48 flex flex-col items-center justify-center p-2 bg-light/10 rounded shadow-inner border border-secondary-600 relative overflow-hidden">
            {revealedCascadeChain.length > 0 ? (
              <div className="relative w-32 h-40"> {/* Container for stacked cards */}
                {revealedCascadeChain.map((card, index) => (
                  <div
                    key={index}
                    className="absolute w-full h-full"
                    style={{ top: `${index * 20}px`, zIndex: index }} // Stack cards vertically
                  >
                    {renderCard(card, `revealed-${index}`)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-dark-400 font-game text-sm text-center">No Card Revealed</div>
            )}
            {revealedCascadeChain.length > 0 && lastPlayedCost !== null && (
                <div className="absolute bottom-2 left-2 right-2 p-1 bg-dark/70 rounded text-center text-light font-game text-xs leading-tight">
                  Last Played Cost: <span className="font-bold">{lastPlayedCost}</span><br/>
                  Current Cascade: <span className="font-bold">{state.cascadeCount + 1}/3</span>
                </div>
            )}
          </div>

                  {/* Player Board - Stacked */}
                  <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-600 rounded shadow flex-shrink-0">
                    <div className="min-h-[80px] bg-dark-600/60 p-1 rounded">
                      <div className="text-[10px] font-game mb-1 text-light">
                        ⭐ YOUR BOARD - {playerBoard.length} cards
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {groupAndStackCards(playerBoard).map((cardObj, i) => (
                          <div key={i} className="relative w-16 h-20"> {/* Container for stacked card */}
                            {renderCard(cardObj, i)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
        {/* Player Info - Compact */}
        <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-600 rounded shadow flex-shrink-0">
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="text-secondary" size={14} />
              <span className="text-sm font-game text-light">{playerHero?.name}</span>
              {playerHero?.ability && <p className="text-xs text-light-400 ml-2">({playerHero.ability})</p>}
            </div>
            <div className="flex gap-2 items-center text-sm"> {/* Increased text size */}
              <div className="flex items-center gap-1 px-2 py-1 bg-secondary-100 rounded"> {/* Increased padding */}
                <Heart className="text-secondary" size={16} /> {/* Increased icon size */}
                <span className="font-bold text-dark text-base">{playerHP}</span> {/* Increased text size */}
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-br from-primary-200 to-secondary-200 rounded"> {/* Increased padding */}
                <Zap className="text-accent" size={18} /> {/* Increased icon size */}
                <span className="font-game text-primary-800 text-base">{playerSeals}</span> {/* Increased text size */}
              </div>
              <div className="px-2 py-1 bg-secondary-100 rounded"> {/* Increased padding */}
                <span className="font-bold text-dark text-base">📚 {playerDeck.length}</span> {/* Increased text size */}
              </div>
              <div className="px-2 py-1 bg-light rounded"> {/* Increased padding */}
                <span className={`font-game text-sm ${state.cascadeCount + 1 >= 3 ? 'text-danger' : 'text-accent'}`}> {/* Increased text size */}
                  ✨ {state.cascadeCount + 1}/3 // Corrected cascade count display
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
                  🔮 Cascade (Spend 1 seal)
                </button>
                <button
                  onClick={() => dispatch({ type: 'STOP_SEALING' })}
                  className="flex-1 py-2 px-3 bg-dark-600 hover:bg-dark-700 text-light rounded font-game text-sm shadow-md transition-all duration-200"
                >
                  ⏭️ Stop
                </button>
              </>
            )}
            
            {(phase === 'resolve-free' || phase === 'resolve-paid') && revealedCascadeChain.length > 0 && ( // Use revealedCascadeChain
              <>
                {(revealedCascadeChain[revealedCascadeChain.length - 1]?.cost >= lastPlayedCost || lastPlayedCost === null) && 
                 playerSeals >= (revealedCascadeChain[revealedCascadeChain.length - 1]?.cost || 0) + 1 && 
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
                    💎 Force (Pay {(revealedCascadeChain[revealedCascadeChain.length - 1]?.cost || 0) + 1} seals)
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