'use client';

import { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, ArrowLeft } from 'lucide-react';
import { useUserPreferences } from '@/lib/stores/preferences';

interface DefenderGameProps {
  onClose: () => void;
  onBack: () => void;
}

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  lives: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  width: number;
  height: number;
}

interface Enemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  type: 'lander' | 'mutant' | 'bomber';
  abducting: boolean;
}

interface Humanoid {
  x: number;
  y: number;
  width: number;
  height: number;
  alive: boolean;
  abducted: boolean;
}

export function DefenderGame({ onClose, onBack }: DefenderGameProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const { ageMode } = useUserPreferences();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Game state
    let animationFrameId: number;
    const keys: Record<string, boolean> = {};
    let currentScore = 0;
    let worldWidth = canvas.width * 3; // World is 3x canvas width
    let cameraX = 0;
    let lastShot = 0;

    // Difficulty settings based on age mode
    const difficulty = {
      explorer: {
        enemySpeed: 1,
        enemyCount: 5,
        spawnRate: 0.01,
        bulletSpeed: 8,
        playerSpeed: 4,
      },
      cadet: {
        enemySpeed: 1.5,
        enemyCount: 8,
        spawnRate: 0.015,
        bulletSpeed: 7,
        playerSpeed: 3.5,
      },
      missionControl: {
        enemySpeed: 2,
        enemyCount: 12,
        spawnRate: 0.02,
        bulletSpeed: 6,
        playerSpeed: 3,
      },
    }[ageMode];

    // Initialize player
    const player: Player = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: 0,
      vy: 0,
      width: 30,
      height: 15,
      lives: 3,
    };

    // Initialize game objects
    const bullets: Bullet[] = [];
    const enemies: Enemy[] = [];
    const humanoids: Humanoid[] = [];

    // Spawn initial humanoids
    for (let i = 0; i < 10; i++) {
      humanoids.push({
        x: (worldWidth / 10) * i + 50,
        y: canvas.height - 40,
        width: 8,
        height: 16,
        alive: true,
        abducted: false,
      });
    }

    // Spawn initial enemies
    for (let i = 0; i < difficulty.enemyCount; i++) {
      spawnEnemy();
    }

    function spawnEnemy() {
      if (!canvas) return;

      const types: ('lander' | 'mutant' | 'bomber')[] = ['lander', 'mutant', 'bomber'];
      const type = types[Math.floor(Math.random() * types.length)];

      enemies.push({
        x: Math.random() * worldWidth,
        y: Math.random() * (canvas.height - 200) + 50,
        vx: (Math.random() - 0.5) * difficulty.enemySpeed,
        vy: (Math.random() - 0.5) * difficulty.enemySpeed * 0.5,
        width: 25,
        height: 15,
        type,
        abducting: false,
      });
    }

    function shootBullet() {
      const now = Date.now();
      if (now - lastShot > 200) {
        bullets.push({
          x: player.x + player.width,
          y: player.y + player.height / 2,
          vx: difficulty.bulletSpeed,
          width: 10,
          height: 3,
        });
        lastShot = now;
      }
    }

    function checkCollisions() {
      if (!canvas) return;

      // Bullets vs enemies
      bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
          if (
            bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y
          ) {
            bullets.splice(bulletIndex, 1);
            enemies.splice(enemyIndex, 1);
            currentScore += enemy.type === 'bomber' ? 150 : enemy.type === 'mutant' ? 150 : 150;
            setScore(currentScore);
          }
        });
      });

      // Player vs enemies
      enemies.forEach((enemy, index) => {
        if (
          player.x < enemy.x + enemy.width &&
          player.x + player.width > enemy.x &&
          player.y < enemy.y + enemy.height &&
          player.y + player.height > enemy.y
        ) {
          enemies.splice(index, 1);
          player.lives--;
          player.x = canvas.width / 2;
          player.y = canvas.height / 2;

          if (player.lives <= 0) {
            setGameOver(true);
          }
        }
      });

      // Enemies abducting humanoids
      enemies.forEach(enemy => {
        if (enemy.type === 'lander' && !enemy.abducting) {
          humanoids.forEach(humanoid => {
            if (humanoid.alive && !humanoid.abducted) {
              const dist = Math.sqrt(
                Math.pow(enemy.x - humanoid.x, 2) + Math.pow(enemy.y - humanoid.y, 2)
              );
              if (dist < 30) {
                enemy.abducting = true;
                humanoid.abducted = true;
              }
            }
          });
        }
      });
    }

    function gameLoop() {
      if (paused || gameOver || !ctx || !canvas) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      // Clear canvas
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Handle input
      if (keys['ArrowLeft'] || keys['a']) {
        player.vx = -difficulty.playerSpeed;
      } else if (keys['ArrowRight'] || keys['d']) {
        player.vx = difficulty.playerSpeed;
      } else {
        player.vx = 0;
      }

      if (keys['ArrowUp'] || keys['w']) {
        player.vy = -3;
      } else if (keys['ArrowDown'] || keys['s']) {
        player.vy = 3;
      } else {
        player.vy = 0;
      }

      if (keys[' ']) {
        shootBullet();
      }

      // Update player position
      player.x += player.vx;
      player.y += player.vy;

      // Keep player in bounds vertically
      if (player.y < 0) player.y = 0;
      if (player.y + player.height > canvas.height - 30) {
        player.y = canvas.height - 30 - player.height;
      }

      // Update camera to follow player
      cameraX = player.x - canvas.width / 2;

      // Wrap player horizontally in world
      if (player.x < 0) player.x = worldWidth;
      if (player.x > worldWidth) player.x = 0;

      // Update bullets
      bullets.forEach((bullet, index) => {
        bullet.x += bullet.vx;

        // Remove off-screen bullets
        if (bullet.x > player.x + canvas.width || bullet.x < player.x - canvas.width) {
          bullets.splice(index, 1);
        }
      });

      // Update enemies
      enemies.forEach((enemy, index) => {
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Wrap enemies horizontally
        if (enemy.x < 0) enemy.x = worldWidth;
        if (enemy.x > worldWidth) enemy.x = 0;

        // Keep enemies in vertical bounds
        if (enemy.y < 50) {
          enemy.y = 50;
          enemy.vy = Math.abs(enemy.vy);
        }
        if (enemy.y > canvas.height - 100) {
          enemy.y = canvas.height - 100;
          enemy.vy = -Math.abs(enemy.vy);
        }

        // Lander behavior - move toward humanoids
        if (enemy.type === 'lander' && !enemy.abducting) {
          const nearestHumanoid = humanoids
            .filter(h => h.alive && !h.abducted)
            .reduce((nearest, h) => {
              const dist = Math.abs(h.x - enemy.x);
              const nearestDist = nearest ? Math.abs(nearest.x - enemy.x) : Infinity;
              return dist < nearestDist ? h : nearest;
            }, null as Humanoid | null);

          if (nearestHumanoid) {
            enemy.vx = enemy.x < nearestHumanoid.x ? difficulty.enemySpeed : -difficulty.enemySpeed;
            enemy.vy = enemy.y < nearestHumanoid.y ? difficulty.enemySpeed * 0.5 : -difficulty.enemySpeed * 0.5;
          }
        }

        // If abducting, move upward
        if (enemy.abducting) {
          enemy.vy = -1;
          if (enemy.y < 0) {
            // Humanoid lost
            const abductedHumanoid = humanoids.find(h => h.abducted);
            if (abductedHumanoid) abductedHumanoid.alive = false;
            enemies.splice(index, 1);
          }
        }

        // Mutant behavior - chase player
        if (enemy.type === 'mutant') {
          const dx = player.x - enemy.x;
          const dy = player.y - enemy.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            enemy.vx = (dx / dist) * difficulty.enemySpeed * 1.5;
            enemy.vy = (dy / dist) * difficulty.enemySpeed * 1.5;
          }
        }
      });

      // Spawn new enemies
      if (enemies.length < difficulty.enemyCount && Math.random() < difficulty.spawnRate) {
        spawnEnemy();
      }

      // Draw ground
      ctx.fillStyle = '#1a1f36';
      ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

      // Draw scanner/minimap
      const scannerWidth = canvas.width;
      const scannerHeight = 40;
      const scannerY = canvas.height - 30;

      ctx.fillStyle = 'rgba(26, 31, 54, 0.8)';
      ctx.fillRect(0, scannerY, scannerWidth, scannerHeight);

      // Draw player on scanner
      const playerScannerX = (player.x / worldWidth) * scannerWidth;
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(playerScannerX - 2, scannerY + scannerHeight / 2 - 2, 4, 4);

      // Draw enemies on scanner
      enemies.forEach(enemy => {
        const enemyScannerX = (enemy.x / worldWidth) * scannerWidth;
        ctx.fillStyle = enemy.type === 'lander' ? '#ef4444' : enemy.type === 'mutant' ? '#8b5cf6' : '#f97316';
        ctx.fillRect(enemyScannerX - 1, scannerY + scannerHeight / 2 - 1, 2, 2);
      });

      // Draw humanoids on scanner
      humanoids.forEach(humanoid => {
        if (humanoid.alive) {
          const humanoidScannerX = (humanoid.x / worldWidth) * scannerWidth;
          ctx.fillStyle = '#14b8a6';
          ctx.fillRect(humanoidScannerX - 1, scannerY + scannerHeight / 2 - 1, 2, 2);
        }
      });

      // Save context and translate for camera
      ctx.save();
      ctx.translate(-cameraX, 0);

      // Draw humanoids
      humanoids.forEach(humanoid => {
        if (humanoid.alive && !humanoid.abducted) {
          ctx.fillStyle = '#14b8a6';
          ctx.fillRect(humanoid.x, humanoid.y, humanoid.width, humanoid.height);
        }
      });

      // Draw bullets
      bullets.forEach(bullet => {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      });

      // Draw enemies
      enemies.forEach(enemy => {
        let color = '#ef4444';
        if (enemy.type === 'mutant') color = '#8b5cf6';
        if (enemy.type === 'bomber') color = '#f97316';

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width / 2, enemy.y);
        ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height);
        ctx.lineTo(enemy.x, enemy.y + enemy.height);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw player
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(player.x + player.width, player.y + player.height / 2);
      ctx.lineTo(player.x, player.y);
      ctx.lineTo(player.x, player.y + player.height);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      // Draw HUD
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'left';

      // Lives
      for (let i = 0; i < player.lives; i++) {
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(20 + i * 25, 20);
        ctx.lineTo(10 + i * 25, 30);
        ctx.lineTo(20 + i * 25, 25);
        ctx.lineTo(30 + i * 25, 30);
        ctx.closePath();
        ctx.fill();
      }

      // Humanoids remaining
      const humanoidsAlive = humanoids.filter(h => h.alive && !h.abducted).length;
      ctx.fillStyle = '#14b8a6';
      ctx.fillText(`Humanoids: ${humanoidsAlive}`, canvas.width - 150, 25);

      // Check collisions
      checkCollisions();

      // Check if all humanoids are gone
      if (humanoidsAlive === 0) {
        setGameOver(true);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    }

    function handleKeyDown(e: KeyboardEvent) {
      keys[e.key] = true;
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setPaused(p => !p);
      }
      if (e.key === 'r' || e.key === 'R') {
        if (gameOver) {
          setScore(0);
          setGameOver(false);
          setPaused(false);
        }
      }
      if (e.key === 'Escape') {
        onBack();
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      keys[e.key] = false;
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [ageMode, onBack, paused, gameOver]);

  const handleRestart = () => {
    setScore(0);
    setGameOver(false);
    setPaused(false);
  };

  return (
    <div className="relative bg-cosmos/95 backdrop-blur-sm rounded-lg shadow-2xl border border-nebula p-6 max-w-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-nebula rounded-lg transition-colors"
          aria-label="Back to game selection"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-2xl font-display font-bold text-starlight">Defender</h2>
          <div className="flex items-center justify-center gap-6 mt-2 text-sm text-stardust">
            <span>Score: <span className="text-rocket-orange font-bold">{score}</span></span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-nebula rounded-lg transition-colors"
          aria-label="Close game"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border-2 border-nebula rounded-lg bg-void"
          style={{ display: 'block' }}
        />

        {/* Pause Overlay */}
        {paused && (
          <div className="absolute inset-0 bg-void/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="text-center">
              <h3 className="text-3xl font-display font-bold text-starlight mb-4">PAUSED</h3>
              <p className="text-stardust">Press P to resume</p>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-void/90 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="text-center">
              <h3 className="text-4xl font-display font-bold text-mars-red mb-4">MISSION FAILED</h3>
              <p className="text-xl text-starlight mb-6">Final Score: {score}</p>
              <button
                type="button"
                onClick={handleRestart}
                className="px-6 py-3 bg-rocket-orange hover:bg-rocket-orange/80 text-starlight rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="h-5 w-5" />
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 text-sm text-stardust text-center space-y-1">
        <p><span className="text-starlight font-semibold">↑ ↓ ← →</span> Move | <span className="text-starlight font-semibold">SPACE:</span> Fire</p>
        <p><span className="text-starlight font-semibold">P:</span> Pause | <span className="text-starlight font-semibold">R:</span> Restart | <span className="text-starlight font-semibold">ESC:</span> Back</p>
      </div>
    </div>
  );
}
