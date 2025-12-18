'use client';

import { Rocket, Zap, Move, Shield, Target, Plane, Crosshair, Moon } from 'lucide-react';

export type GameType = 'asteroids' | 'invaders' | 'snake' | 'breakout' | 'missile-command' | 'thrust' | 'defender' | 'lunar-lander';

interface GameSelectionProps {
  onSelectGame: (game: GameType) => void;
  onClose: () => void;
}

interface GameCard {
  id: GameType;
  title: string;
  description: string;
  icon: React.ReactNode;
  difficulty: string;
}

export function GameSelection({ onSelectGame, onClose }: GameSelectionProps): JSX.Element {
  const games: GameCard[] = [
    {
      id: 'asteroids',
      title: 'Asteroids',
      description: 'Navigate through an asteroid field and shoot to survive',
      icon: <Rocket className="h-8 w-8" />,
      difficulty: 'Medium',
    },
    {
      id: 'invaders',
      title: 'Space Invaders',
      description: 'Defend Earth from waves of alien invaders',
      icon: <Zap className="h-8 w-8" />,
      difficulty: 'Easy',
    },
    {
      id: 'snake',
      title: 'Cosmic Snake',
      description: 'Collect space fuel while avoiding your own trail',
      icon: <Move className="h-8 w-8" />,
      difficulty: 'Easy',
    },
    {
      id: 'breakout',
      title: 'Asteroid Defense',
      description: 'Break through asteroid barriers to protect the station',
      icon: <Shield className="h-8 w-8" />,
      difficulty: 'Medium',
    },
    {
      id: 'missile-command',
      title: 'Missile Command',
      description: 'Strategically defend cities from incoming missile attacks',
      icon: <Target className="h-8 w-8" />,
      difficulty: 'Hard',
    },
    {
      id: 'thrust',
      title: 'Thrust',
      description: 'Master gravity and inertia in a cave-flying challenge',
      icon: <Plane className="h-8 w-8" />,
      difficulty: 'Hard',
    },
    {
      id: 'defender',
      title: 'Defender',
      description: 'Protect humanoids from alien abduction in this classic shooter',
      icon: <Crosshair className="h-8 w-8" />,
      difficulty: 'Medium',
    },
    {
      id: 'lunar-lander',
      title: 'Lunar Lander',
      description: 'Execute precise landings with limited fuel and physics',
      icon: <Moon className="h-8 w-8" />,
      difficulty: 'Medium',
    },
  ];

  return (
    <div className="flex flex-col items-center gap-6 p-4 sm:p-6 bg-void rounded-lg max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div>
          <h2 className="text-3xl font-bold text-starlight mb-2">Space Arcade</h2>
          <p className="text-stardust">Choose your mission</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-stardust hover:text-starlight transition-colors text-2xl"
          aria-label="Close arcade"
        >
          ×
        </button>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {games.map((game) => (
          <button
            key={game.id}
            type="button"
            onClick={() => onSelectGame(game.id)}
            className="group relative p-6 bg-nebula/50 hover:bg-nebula border-2 border-nebula hover:border-rocket-orange rounded-lg transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className="text-rocket-orange group-hover:scale-110 transition-transform">
                {game.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-starlight mb-1">{game.title}</h3>
                <p className="text-sm text-stardust mb-2">{game.description}</p>
                <span className="inline-block px-2 py-1 text-xs bg-void rounded text-stardust">
                  {game.difficulty}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Info */}
      <p className="text-sm text-stardust text-center">
        All games adjust difficulty based on your age mode setting
      </p>
    </div>
  );
}
