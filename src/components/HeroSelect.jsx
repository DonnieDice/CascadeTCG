import React from 'react';
import { Star } from 'lucide-react';
// import { HEROES } from '../constants'; // Removed direct import

export default function HeroSelect({
  playerHero,
  enemyHero,
  setPlayerHero,
  setEnemyHero,
  startGame,
  heroes, // Accept heroes as a prop
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-200 via-primary-300 to-info-200 p-4 font-sans text-dark">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-game text-primary mb-4 animate-pulse">
            ✨ Cascade Cards ✨
          </h1>
          <p className="text-lg md:text-xl text-primary-700 mb-8">
            Select your heroes and prepare for battle!
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-game text-secondary mb-4 text-center">⭐ Your Hero</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {heroes.map((hero) => (
              <div
                key={hero.id}
                onClick={() => setPlayerHero(hero)}
                className={
                  'p-4 sm:p-6 rounded-xl cursor-pointer border-4 transition-all duration-200 ' +
                  (playerHero?.id === hero.id
                    ? 'border-secondary bg-light shadow-lg scale-105'
                    : 'border-primary-300 bg-light/80 hover:border-primary-500')
                }
              >
                <Star className="mx-auto mb-2 text-accent" size={40} />
                <h3 className="font-game text-xl text-primary-900 text-center">{hero.name}</h3>
                <div className="text-sm text-secondary-600 font-semibold mb-2 text-center">
                  {hero.ability}
                </div>
                <p className="text-xs text-dark-600 text-center">{hero.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-game text-danger mb-4 text-center">🎴 Enemy Hero</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {heroes.map((hero) => (
              <div
                key={hero.id}
                onClick={() => setEnemyHero(hero)}
                className={
                  'p-4 sm:p-6 rounded-xl cursor-pointer border-4 transition-all duration-200 ' +
                  (enemyHero?.id === hero.id
                    ? 'border-danger bg-light shadow-lg scale-105'
                    : 'border-dark-300 bg-light/80 hover:border-danger-500')
                }
              >
                <Star className="mx-auto mb-2 text-accent" size={40} />
                <h3 className="font-game text-xl text-danger-900 text-center">{hero.name}</h3>
                <div className="text-sm text-warning-600 font-semibold mb-2 text-center">
                  {hero.ability}
                </div>
                <p className="text-xs text-dark-600 text-center">{hero.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={startGame}
          disabled={!playerHero || !enemyHero}
          className="w-full py-4 px-6 bg-gradient-to-r from-secondary to-primary disabled:from-gray-400 disabled:to-gray-500 text-white font-game text-xl rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
        >
          {!playerHero || !enemyHero ? '✨ Select Your Heroes ✨' : '🎴 Begin Capture! 🎴'}
        </button>
      </div>
    </div>
  );
}
