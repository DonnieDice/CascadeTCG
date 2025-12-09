import React from 'react';
import { Heart, Zap, Star } from 'lucide-react'; // These icons are now used in HeroDisplay, but kept here for other potential uses or if moved back.
import TurnIndicator from './gameview/TurnIndicator';
import HeroDisplay from './gameview/HeroDisplay';
import BoardDisplay from './gameview/BoardDisplay';
import GameLog from './gameview/GameLog'; // New import
import RevealedCardDisplay from './gameview/RevealedCardDisplay'; // New import
import PlayerActions from './gameview/PlayerActions'; // New import

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
    revealedCascadeChain,
    phase,
    waitingForPlayer,
    lastPlayedCost,
    gameStatus,
  } = state;

  const isPlayerTurn = currentTurn === 'player';
  const isGameActive = gameStatus === 'playing';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 to-dark font-sans text-light p-4 md:p-6 overflow-y-auto">
      <div className="transform scale-[0.8] origin-top max-w-5xl mx-auto flex flex-col gap-4">
        {/* Turn Indicator - LARGER */}
        <TurnIndicator isPlayerTurn={isPlayerTurn} />

        {/* Enemy Info and Board */}
        <HeroDisplay
          hero={enemyHero}
          hp={enemyHP}
          seals={enemySeals}
          deckLength={enemyDeck.length}
          isPlayer={false}
        />
        <BoardDisplay board={enemyBoard} isPlayer={false} />

        {/* Log and Revealed Card Section - REDUCED */}
        <div className="flex flex-col md:flex-row gap-4">
          <GameLog log={log} />
          <RevealedCardDisplay revealedCascadeChain={revealedCascadeChain} lastPlayedCost={lastPlayedCost} />
        </div>

        {/* Player Captured Cards (Board) */}
        <BoardDisplay board={playerBoard} isPlayer={true} />

        {/* Player Info - LARGER */}
        <HeroDisplay
          hero={playerHero}
          hp={playerHP}
          seals={playerSeals}
          deckLength={playerDeck.length}
          isPlayer={true}
          cascadeCount={cascadeCount}
        />

        {/* Player Actions - MUCH LARGER */}
        <PlayerActions
          isPlayerTurn={isPlayerTurn}
          waitingForPlayer={waitingForPlayer}
          isGameActive={isGameActive}
          phase={phase}
          cascadeCount={cascadeCount}
          playerSeals={playerSeals}
          revealedCascadeChain={revealedCascadeChain}
          lastPlayedCost={lastPlayedCost}
          dispatch={dispatch}
        />


      </div>
    </div>
  );
}