import React from 'react';
import { Heart, Zap, Star } from 'lucide-react';

export default function HeroDisplay({ hero, hp, seals, deckLength, isPlayer, cascadeCount }) {
  const starColor = isPlayer ? 'text-secondary' : 'text-danger';
  const heartBg = isPlayer ? 'bg-secondary-100' : 'bg-danger-100';
  const deckBg = isPlayer ? 'bg-secondary-100' : 'bg-danger-100';
  const sealsBg = 'bg-gradient-to-br from-primary-200 to-secondary-200';
  const sealsTextColor = 'text-primary-800';

  return (
    <div className={`p-4 md:p-6 ${isPlayer ? 'bg-gradient-to-br from-primary-500 to-secondary-600' : 'bg-gradient-to-br from-dark-800 to-primary-700'} rounded-lg md:rounded-xl shadow-lg ${isPlayer ? 'border-t-4 border-primary-700' : 'border-b-4 border-dark-900'}`}>
      <div className="mb-3 md:mb-4 p-4 md:p-5 bg-dark-200/90 rounded-lg md:rounded-xl shadow-inner">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <Star className={starColor} size={28} />
              <div className="text-2xl md:text-3xl font-game text-dark">{hero?.name}</div>
            </div>
            <div className="text-base md:text-xl text-warning-700 font-semibold mb-1">
              {hero?.ability}
            </div>
            <p className="text-xs md:text-sm text-dark-600 hidden sm:block">{hero?.desc}</p>
          </div>
          <div className="flex gap-4 md:gap-6 items-center">
            <div className="text-center">
              <div className="text-xs md:text-sm font-bold mb-1 text-dark">HP</div>
              <div className="flex items-center gap-1 px-3 py-2 bg-danger-100 rounded-lg shadow-md">
                <Heart className="text-danger" size={20} />
                <span className="text-2xl md:text-3xl font-bold text-dark">{hp}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs md:text-sm font-bold mb-1 text-dark">SEALS</div>
              <div className={`flex items-center gap-1 px-4 py-2 ${sealsBg} rounded-lg shadow-md border border-primary-400`}>
                <Zap className="text-accent" size={28} />
                <span className={`text-3xl md:text-4xl font-game ${sealsTextColor}`}>
                  {seals}
                </span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs md:text-sm font-bold mb-1 text-dark">DECK</div>
              <div className={`px-3 py-2 ${deckBg} rounded-lg shadow-md`}>
                <span className="text-xl md:text-2xl font-bold text-dark">
                  📚 {deckLength}
                </span>
              </div>
            </div>
            {isPlayer && (
              <div className="text-center">
                <div className="text-xs md:text-sm font-bold mb-1 text-dark">CASCADE</div>
                <div className="px-3 py-2 bg-light rounded-lg shadow-md">
                  <span className={`text-xl md:text-2xl font-game ${cascadeCount >= 3 ? 'text-danger' : 'text-accent'}`}>
                    ✨ {cascadeCount}/3
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}