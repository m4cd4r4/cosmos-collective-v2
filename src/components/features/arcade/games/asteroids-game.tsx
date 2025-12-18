'use client';

import { useEffect, useRef, useState } from 'react';
import { useUserPreferences } from '@/lib/stores/preferences';

interface AsteroidsGameProps {
  onClose: () => void;
  onBack: () => void;
}

interface Ship {
  x: number;
  y: number;
  angle: number;
  rotation: number;
  velocity: { x: number; y: number };
  thrust: number;
}

interface Asteroid {
  x: number;
  y: number;
  velocity: { x: number; y: number };
  radius: number;
  angle: number;
}

interface Bullet {
  x: number;
  y: number;
  velocity: { x: number; y: number };
  life: number;
}

export function AsteroidsGame({ onClose, onBack }: AsteroidsGameProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const { ageMode } = useUserPreferences();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Game state
    const ship: Ship = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      angle: 0,
      rotation: 0,
      velocity: { x: 0, y: 0 },
      thrust: 0,
    };

    const asteroids: Asteroid[] = [];
    const bullets: Bullet[] = [];
    const keys: { [key: string]: boolean } = {};

    // Difficulty settings based on age mode
    const difficulty = {
      explorer: { asteroidCount: 3, asteroidSpeed: 0.5, bulletSpeed: 5 },
      cadet: { asteroidCount: 4, asteroidSpeed: 1, bulletSpeed: 6 },
      missionControl: { asteroidCount: 5, asteroidSpeed: 1.5, bulletSpeed: 7 },
    }[ageMode];

    // Initialize asteroids
    function spawnAsteroids(count: number) {
      if (!canvas) return;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() + 0.5) * difficulty.asteroidSpeed;
        const edge = Math.floor(Math.random() * 4);
        let x, y;

        // Spawn from edges
        switch (edge) {
          case 0: // Top
            x = Math.random() * canvas.width;
            y = -20;
            break;
          case 1: // Right
            x = canvas.width + 20;
            y = Math.random() * canvas.height;
            break;
          case 2: // Bottom
            x = Math.random() * canvas.width;
            y = canvas.height + 20;
            break;
          default: // Left
            x = -20;
            y = Math.random() * canvas.height;
        }

        asteroids.push({
          x,
          y,
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed,
          },
          radius: 30 + Math.random() * 20,
          angle: 0,
        });
      }
    }

    spawnAsteroids(difficulty.asteroidCount);

    // Input handling
    function handleKeyDown(e: KeyboardEvent) {
      keys[e.key] = true;
      if (e.key === ' ') {
        e.preventDefault();
        // Shoot bullet
        bullets.push({
          x: ship.x + Math.cos(ship.angle) * 20,
          y: ship.y + Math.sin(ship.angle) * 20,
          velocity: {
            x: Math.cos(ship.angle) * difficulty.bulletSpeed,
            y: Math.sin(ship.angle) * difficulty.bulletSpeed,
          },
          life: 60,
        });
      }
      if (e.key === 'Escape') {
        setPaused((p) => !p);
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      keys[e.key] = false;
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Game loop
    let animationFrameId: number;

    function gameLoop() {
      if (paused || gameOver || !ctx || !canvas) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      // Clear canvas
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update ship rotation
      if (keys['ArrowLeft']) ship.rotation = -0.1;
      else if (keys['ArrowRight']) ship.rotation = 0.1;
      else ship.rotation = 0;

      ship.angle += ship.rotation;

      // Update ship thrust
      if (keys['ArrowUp']) {
        ship.thrust = 0.15;
        ship.velocity.x += Math.cos(ship.angle) * ship.thrust;
        ship.velocity.y += Math.sin(ship.angle) * ship.thrust;
      } else {
        ship.thrust = 0;
      }

      // Apply friction
      ship.velocity.x *= 0.98;
      ship.velocity.y *= 0.98;

      // Update ship position
      ship.x += ship.velocity.x;
      ship.y += ship.velocity.y;

      // Wrap around screen
      if (ship.x < 0) ship.x = canvas.width;
      if (ship.x > canvas.width) ship.x = 0;
      if (ship.y < 0) ship.y = canvas.height;
      if (ship.y > canvas.height) ship.y = 0;

      // Draw ship
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle);
      ctx.strokeStyle = '#ff6b2c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(-15, -12);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-15, 12);
      ctx.closePath();
      ctx.stroke();

      // Draw thrust
      if (ship.thrust > 0) {
        ctx.fillStyle = '#ff6b2c';
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(-20, 0);
        ctx.lineTo(-10, 5);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Update and draw asteroids
      for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.x += asteroid.velocity.x;
        asteroid.y += asteroid.velocity.y;
        asteroid.angle += 0.01;

        // Wrap around
        if (asteroid.x < -asteroid.radius) asteroid.x = canvas.width + asteroid.radius;
        if (asteroid.x > canvas.width + asteroid.radius) asteroid.x = -asteroid.radius;
        if (asteroid.y < -asteroid.radius) asteroid.y = canvas.height + asteroid.radius;
        if (asteroid.y > canvas.height + asteroid.radius) asteroid.y = -asteroid.radius;

        // Draw asteroid
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.angle);
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const vertices = 8;
        for (let j = 0; j < vertices; j++) {
          const angle = (j / vertices) * Math.PI * 2;
          const radius = asteroid.radius + Math.sin(j) * 5;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // Check collision with ship
        const dx = asteroid.x - ship.x;
        const dy = asteroid.y - ship.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < asteroid.radius + 15) {
          setLives((l) => {
            const newLives = l - 1;
            if (newLives <= 0) {
              setGameOver(true);
            }
            return newLives;
          });
          // Reset ship position
          ship.x = canvas.width / 2;
          ship.y = canvas.height / 2;
          ship.velocity = { x: 0, y: 0 };
          ship.angle = 0;
        }
      }

      // Update and draw bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.x += bullet.velocity.x;
        bullet.y += bullet.velocity.y;
        bullet.life--;

        // Remove if off screen or expired
        if (
          bullet.x < 0 ||
          bullet.x > canvas.width ||
          bullet.y < 0 ||
          bullet.y > canvas.height ||
          bullet.life <= 0
        ) {
          bullets.splice(i, 1);
          continue;
        }

        // Draw bullet
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Check collision with asteroids
        for (let j = asteroids.length - 1; j >= 0; j--) {
          const asteroid = asteroids[j];
          const dx = asteroid.x - bullet.x;
          const dy = asteroid.y - bullet.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < asteroid.radius) {
            // Hit!
            setScore((s) => s + Math.floor(100 / (asteroid.radius / 20)));
            asteroids.splice(j, 1);
            bullets.splice(i, 1);

            // Spawn new asteroids to keep game interesting
            if (asteroids.length < difficulty.asteroidCount) {
              spawnAsteroids(1);
            }
            break;
          }
        }
      }

      // Ensure minimum asteroids are always present
      if (asteroids.length < Math.max(2, difficulty.asteroidCount - 2)) {
        spawnAsteroids(1);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    }

    gameLoop();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [ageMode, paused, gameOver]);

  const handleRestart = () => {
    setScore(0);
    setLives(3);
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
        <div className="flex items-center gap-6">
          <div className="text-starlight">
            <span className="text-sm text-stardust">Score:</span>{' '}
            <span className="text-xl font-bold">{score}</span>
          </div>
          <div className="text-starlight">
            <span className="text-sm text-stardust">Lives:</span>{' '}
            <span className="text-xl font-bold">{'🚀'.repeat(lives)}</span>
          </div>
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
          <kbd className="px-2 py-1 bg-nebula rounded">←</kbd> Rotate Left •{' '}
          <kbd className="px-2 py-1 bg-nebula rounded">→</kbd> Rotate Right •{' '}
          <kbd className="px-2 py-1 bg-nebula rounded">↑</kbd> Thrust
        </p>
        <p>
          <kbd className="px-2 py-1 bg-nebula rounded">Space</kbd> Shoot •{' '}
          <kbd className="px-2 py-1 bg-nebula rounded">ESC</kbd> Pause
        </p>
      </div>
    </div>
  );
}
