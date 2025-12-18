'use client';

import { useEffect, useRef, useState } from 'react';
import { useUserPreferences } from '@/lib/stores/preferences';

interface SnakeGameProps {
  onClose: () => void;
  onBack: () => void;
}

interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export function SnakeGame({ onClose, onBack }: SnakeGameProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const { ageMode } = useUserPreferences();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    const gridSize = 20;
    const gridWidth = canvas.width / gridSize;
    const gridHeight = canvas.height / gridSize;

    // Difficulty settings
    const difficulty = {
      explorer: { speed: 150, growthRate: 1 },
      cadet: { speed: 120, growthRate: 2 },
      missionControl: { speed: 90, growthRate: 3 },
    }[ageMode];

    // Game state
    const snake: Position[] = [
      { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) },
    ];
    let direction: Direction = 'RIGHT';
    let nextDirection: Direction = 'RIGHT';
    let fuel: Position = generateFuel();
    let gameSpeed = difficulty.speed;

    function generateFuel(): Position {
      let newFuel: Position;
      do {
        newFuel = {
          x: Math.floor(Math.random() * gridWidth),
          y: Math.floor(Math.random() * gridHeight),
        };
      } while (snake.some((segment) => segment.x === newFuel.x && segment.y === newFuel.y));
      return newFuel;
    }

    // Input handling
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setPaused((p) => !p);
        return;
      }

      // Prevent reversing direction
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') nextDirection = 'UP';
          break;
        case 'ArrowDown':
          if (direction !== 'UP') nextDirection = 'DOWN';
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') nextDirection = 'LEFT';
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') nextDirection = 'RIGHT';
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    // Game loop
    let gameInterval: NodeJS.Timeout;

    function gameLoop() {
      if (paused || gameOver || !ctx || !canvas) return;

      // Update direction
      direction = nextDirection;

      // Move snake
      const head = { ...snake[0] };

      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        setGameOver(true);
        return;
      }

      // Check self collision
      if (snake.some((segment) => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        return;
      }

      // Add new head
      snake.unshift(head);

      // Check fuel collection
      if (head.x === fuel.x && head.y === fuel.y) {
        setScore((s) => {
          const newScore = s + 10 * difficulty.growthRate;
          // Increase speed every 50 points
          if (newScore % 50 === 0 && gameSpeed > 50) {
            clearInterval(gameInterval);
            gameSpeed -= 10;
            gameInterval = setInterval(gameLoop, gameSpeed);
          }
          return newScore;
        });
        fuel = generateFuel();
      } else {
        // Remove tail if no fuel collected
        snake.pop();
      }

      // Clear canvas
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = '#1a1a2e';
      ctx.lineWidth = 1;
      for (let x = 0; x <= gridWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * gridSize, 0);
        ctx.lineTo(x * gridSize, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= gridHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * gridSize);
        ctx.lineTo(canvas.width, y * gridSize);
        ctx.stroke();
      }

      // Draw snake
      snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#ff6b2c' : '#8b5cf6';
        ctx.fillRect(
          segment.x * gridSize + 1,
          segment.y * gridSize + 1,
          gridSize - 2,
          gridSize - 2
        );

        // Draw eyes on head
        if (index === 0) {
          ctx.fillStyle = '#fff';
          const eyeSize = 3;
          const eyeOffset = 6;

          if (direction === 'UP' || direction === 'DOWN') {
            ctx.fillRect(segment.x * gridSize + eyeOffset, segment.y * gridSize + 7, eyeSize, eyeSize);
            ctx.fillRect(
              segment.x * gridSize + gridSize - eyeOffset - eyeSize,
              segment.y * gridSize + 7,
              eyeSize,
              eyeSize
            );
          } else {
            ctx.fillRect(segment.x * gridSize + 7, segment.y * gridSize + eyeOffset, eyeSize, eyeSize);
            ctx.fillRect(
              segment.x * gridSize + 7,
              segment.y * gridSize + gridSize - eyeOffset - eyeSize,
              eyeSize,
              eyeSize
            );
          }
        }
      });

      // Draw fuel
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(
        fuel.x * gridSize + gridSize / 2,
        fuel.y * gridSize + gridSize / 2,
        gridSize / 3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    gameInterval = setInterval(gameLoop, gameSpeed);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(gameInterval);
    };
  }, [ageMode, paused, gameOver]);

  const handleRestart = () => {
    setScore(0);
    setGameOver(false);
    setPaused(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 sm:p-6 bg-void rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-[800px]">
        <button
          type="button"
          onClick={onBack}
          className="text-stardust hover:text-starlight transition-colors"
          aria-label="Back to game selection"
        >
          ← Back
        </button>
        <div className="text-starlight">
          <span className="text-sm text-stardust">Score:</span>{' '}
          <span className="text-xl font-bold">{score}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-stardust hover:text-starlight transition-colors text-2xl"
          aria-label="Close game"
        >
          ×
        </button>
      </div>

      {/* Canvas */}
      <div className="relative w-full max-w-[800px]">
        <canvas
          ref={canvasRef}
          className="border-2 border-nebula rounded-lg w-full"
          style={{ maxWidth: '100%', height: 'auto', aspectRatio: '4/3' }}
        />

        {/* Overlays */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-void/90 rounded-lg">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-starlight">Game Over!</h2>
              <p className="text-xl text-stardust">Final Score: {score}</p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-6 py-3 bg-rocket-orange text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                >
                  Play Again
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-3 bg-nebula text-starlight rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                >
                  Game Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {paused && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-void/90 rounded-lg">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-starlight">Paused</h2>
              <p className="text-stardust">Press ESC to resume</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="text-center text-sm text-stardust space-y-1">
        <p>
          <kbd className="px-2 py-1 bg-nebula rounded">↑</kbd> Up •{' '}
          <kbd className="px-2 py-1 bg-nebula rounded">↓</kbd> Down •{' '}
          <kbd className="px-2 py-1 bg-nebula rounded">←</kbd> Left •{' '}
          <kbd className="px-2 py-1 bg-nebula rounded">→</kbd> Right
        </p>
        <p>
          <kbd className="px-2 py-1 bg-nebula rounded">ESC</kbd> Pause
        </p>
      </div>
    </div>
  );
}
