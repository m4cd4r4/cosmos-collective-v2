'use client';

import { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, ArrowLeft } from 'lucide-react';
import { useUserPreferences } from '@/lib/stores/preferences';

interface MissileCommandGameProps {
  onClose: () => void;
  onBack: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface EnemyMissile {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
}

interface PlayerMissile {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  x: number;
  y: number;
  speed: number;
  exploding: boolean;
  explosionRadius: number;
  maxExplosionRadius: number;
}

interface City {
  x: number;
  y: number;
  width: number;
  height: number;
  alive: boolean;
}

interface Base {
  x: number;
  y: number;
  width: number;
  height: number;
  ammo: number;
  alive: boolean;
}

export function MissileCommandGame({ onClose, onBack }: MissileCommandGameProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
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
    const enemyMissiles: EnemyMissile[] = [];
    const playerMissiles: PlayerMissile[] = [];
    const explosions: PlayerMissile[] = [];
    const cities: City[] = [];
    const bases: Base[] = [];
    let crosshair: Point = { x: canvas.width / 2, y: canvas.height / 2 };
    let currentScore = 0;
    let currentWave = 1;
    let waveActive = false;
    let waveDelay = 0;

    // Difficulty settings based on age mode
    const difficulty = {
      explorer: {
        enemySpeed: 0.5,
        enemyCount: 5,
        splitChance: 0,
        baseAmmo: 30,
        explosionRadius: 50,
      },
      cadet: {
        enemySpeed: 1,
        enemyCount: 8,
        splitChance: 0.1,
        baseAmmo: 25,
        explosionRadius: 40,
      },
      missionControl: {
        enemySpeed: 1.5,
        enemyCount: 12,
        splitChance: 0.2,
        baseAmmo: 20,
        explosionRadius: 35,
      },
    }[ageMode];

    // Initialize cities (6 cities in the middle)
    const citySpacing = canvas.width / 8;
    for (let i = 0; i < 6; i++) {
      const skipMiddle = i >= 3 ? 1 : 0; // Skip middle position for bases
      cities.push({
        x: citySpacing * (i + 1 + skipMiddle) - 15,
        y: canvas.height - 40,
        width: 30,
        height: 30,
        alive: true,
      });
    }

    // Initialize bases (3 bases at left, center, right)
    bases.push({
      x: 20,
      y: canvas.height - 50,
      width: 40,
      height: 40,
      ammo: difficulty.baseAmmo,
      alive: true,
    });
    bases.push({
      x: canvas.width / 2 - 20,
      y: canvas.height - 50,
      width: 40,
      height: 40,
      ammo: difficulty.baseAmmo,
      alive: true,
    });
    bases.push({
      x: canvas.width - 60,
      y: canvas.height - 50,
      width: 40,
      height: 40,
      ammo: difficulty.baseAmmo,
      alive: true,
    });

    // Start first wave
    startWave();

    function startWave() {
      waveActive = true;
      const count = difficulty.enemyCount + (currentWave - 1) * 2;

      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          spawnEnemyMissile();
        }, i * 800);
      }
    }

    function spawnEnemyMissile() {
      if (!canvas) return;

      const startX = Math.random() * canvas.width;
      let targetX: number;
      let targetY: number;

      // Target cities or bases
      const targets = [...cities.filter(c => c.alive), ...bases.filter(b => b.alive)];
      if (targets.length > 0 && Math.random() < 0.7) {
        const target = targets[Math.floor(Math.random() * targets.length)];
        targetX = target.x + target.width / 2;
        targetY = target.y + target.height / 2;
      } else {
        // Random ground target
        targetX = Math.random() * canvas.width;
        targetY = canvas.height - 10;
      }

      enemyMissiles.push({
        x: startX,
        y: 0,
        targetX,
        targetY,
        speed: difficulty.enemySpeed + currentWave * 0.1,
      });
    }

    function getNearestBase(x: number): Base | null {
      const aliveBases = bases.filter(b => b.alive && b.ammo > 0);
      if (aliveBases.length === 0) return null;

      return aliveBases.reduce((nearest, base) => {
        const distToBase = Math.abs(base.x + base.width / 2 - x);
        const distToNearest = Math.abs(nearest.x + nearest.width / 2 - x);
        return distToBase < distToNearest ? base : nearest;
      });
    }

    function firePlayerMissile(targetX: number, targetY: number) {
      const base = getNearestBase(targetX);
      if (!base) return;

      base.ammo--;

      playerMissiles.push({
        startX: base.x + base.width / 2,
        startY: base.y,
        targetX,
        targetY,
        x: base.x + base.width / 2,
        y: base.y,
        speed: 5,
        exploding: false,
        explosionRadius: 0,
        maxExplosionRadius: difficulty.explosionRadius,
      });
    }

    function checkCollisions() {
      // Check player missile explosions against enemy missiles
      explosions.forEach(explosion => {
        enemyMissiles.forEach((enemy, enemyIndex) => {
          const dx = enemy.x - explosion.targetX;
          const dy = enemy.y - explosion.targetY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < explosion.explosionRadius) {
            enemyMissiles.splice(enemyIndex, 1);
            currentScore += 25;
            setScore(currentScore);

            // Chance to split missile
            if (Math.random() < difficulty.splitChance && currentWave > 2) {
              spawnEnemyMissile();
            }
          }
        });
      });

      // Check enemy missiles hitting ground targets
      enemyMissiles.forEach((enemy, enemyIndex) => {
        const dx = enemy.targetX - enemy.x;
        const dy = enemy.targetY - enemy.y;
        const distToTarget = Math.sqrt(dx * dx + dy * dy);

        if (distToTarget < 5) {
          enemyMissiles.splice(enemyIndex, 1);

          // Check if hit a city
          cities.forEach(city => {
            if (city.alive) {
              const cityDist = Math.sqrt(
                Math.pow(enemy.x - (city.x + city.width / 2), 2) +
                Math.pow(enemy.y - (city.y + city.height / 2), 2)
              );
              if (cityDist < 40) {
                city.alive = false;
              }
            }
          });

          // Check if hit a base
          bases.forEach(base => {
            if (base.alive) {
              const baseDist = Math.sqrt(
                Math.pow(enemy.x - (base.x + base.width / 2), 2) +
                Math.pow(enemy.y - (base.y + base.height / 2), 2)
              );
              if (baseDist < 50) {
                base.alive = false;
              }
            }
          });
        }
      });
    }

    function checkWaveComplete() {
      if (waveActive && enemyMissiles.length === 0 && playerMissiles.length === 0 && explosions.length === 0) {
        waveActive = false;
        waveDelay = 180; // 3 seconds at 60fps

        // Bonus points for remaining cities and ammo
        cities.forEach(city => {
          if (city.alive) {
            currentScore += 100;
          }
        });
        bases.forEach(base => {
          currentScore += base.ammo * 5;
        });
        setScore(currentScore);

        // Rearm bases
        bases.forEach(base => {
          if (base.alive) {
            base.ammo = difficulty.baseAmmo;
          }
        });
      }

      // Check game over
      const anyCitiesAlive = cities.some(c => c.alive);
      const anyBasesAlive = bases.some(b => b.alive);
      if (!anyCitiesAlive || !anyBasesAlive) {
        setGameOver(true);
      }
    }

    function gameLoop() {
      if (paused || gameOver || !ctx || !canvas) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      // Clear canvas
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      ctx.fillStyle = '#1a1f36';
      ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

      // Update and draw enemy missiles
      enemyMissiles.forEach((missile, index) => {
        const dx = missile.targetX - missile.x;
        const dy = missile.targetY - missile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 1) {
          missile.x += (dx / distance) * missile.speed;
          missile.y += (dy / distance) * missile.speed;
        }

        // Draw trail
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(missile.x, 0);
        ctx.lineTo(missile.x, missile.y);
        ctx.stroke();

        // Draw missile head
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(missile.x, missile.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Update and draw player missiles
      playerMissiles.forEach((missile, index) => {
        if (!missile.exploding) {
          const dx = missile.targetX - missile.x;
          const dy = missile.targetY - missile.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > missile.speed) {
            missile.x += (dx / distance) * missile.speed;
            missile.y += (dy / distance) * missile.speed;
          } else {
            missile.exploding = true;
            explosions.push(missile);
            playerMissiles.splice(index, 1);
          }

          // Draw trail
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(missile.startX, missile.startY);
          ctx.lineTo(missile.x, missile.y);
          ctx.stroke();

          // Draw missile head
          ctx.fillStyle = '#93c5fd';
          ctx.beginPath();
          ctx.arc(missile.x, missile.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Update and draw explosions
      explosions.forEach((explosion, index) => {
        explosion.explosionRadius += 2;

        if (explosion.explosionRadius >= explosion.maxExplosionRadius) {
          explosion.explosionRadius = explosion.maxExplosionRadius;

          // Fade out after reaching max radius
          setTimeout(() => {
            const idx = explosions.indexOf(explosion);
            if (idx > -1) explosions.splice(idx, 1);
          }, 500);
        }

        // Draw explosion
        const gradient = ctx.createRadialGradient(
          explosion.targetX, explosion.targetY, 0,
          explosion.targetX, explosion.targetY, explosion.explosionRadius
        );
        gradient.addColorStop(0, '#fbbf24');
        gradient.addColorStop(0.5, '#f97316');
        gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(explosion.targetX, explosion.targetY, explosion.explosionRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw cities
      cities.forEach(city => {
        if (city.alive) {
          ctx.fillStyle = '#14b8a6';
          ctx.fillRect(city.x, city.y, city.width, city.height);
          ctx.fillStyle = '#0d9488';
          ctx.fillRect(city.x + 5, city.y + 5, 8, 25);
          ctx.fillRect(city.x + 17, city.y + 5, 8, 25);
        } else {
          // Draw ruins
          ctx.fillStyle = '#374151';
          ctx.fillRect(city.x, city.y + 20, city.width, 10);
        }
      });

      // Draw bases
      bases.forEach(base => {
        if (base.alive) {
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(base.x, base.y, base.width, base.height);
          ctx.fillStyle = '#1d4ed8';

          // Draw turret
          ctx.beginPath();
          ctx.arc(base.x + base.width / 2, base.y + 10, 8, 0, Math.PI * 2);
          ctx.fill();

          // Draw ammo count
          ctx.fillStyle = '#f1f5f9';
          ctx.font = '12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(base.ammo.toString(), base.x + base.width / 2, base.y + base.height + 15);
        } else {
          // Draw destroyed base
          ctx.fillStyle = '#374151';
          ctx.fillRect(base.x + 10, base.y + 20, base.width - 20, base.height - 20);
        }
      });

      // Draw crosshair
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(crosshair.x - 10, crosshair.y);
      ctx.lineTo(crosshair.x + 10, crosshair.y);
      ctx.moveTo(crosshair.x, crosshair.y - 10);
      ctx.lineTo(crosshair.x, crosshair.y + 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(crosshair.x, crosshair.y, 15, 0, Math.PI * 2);
      ctx.stroke();

      // Check collisions and wave state
      checkCollisions();
      checkWaveComplete();

      // Handle wave delay
      if (!waveActive && waveDelay > 0) {
        waveDelay--;

        // Draw "WAVE COMPLETE" message
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('WAVE COMPLETE!', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '20px monospace';
        ctx.fillText(`Next wave in ${Math.ceil(waveDelay / 60)}...`, canvas.width / 2, canvas.height / 2 + 20);

        if (waveDelay === 0) {
          currentWave++;
          setWave(currentWave);
          startWave();
        }
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    }

    function handleMouseMove(e: MouseEvent) {
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      crosshair.x = e.clientX - rect.left;
      crosshair.y = e.clientY - rect.top;
    }

    function handleClick(e: MouseEvent) {
      if (paused || gameOver || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      firePlayerMissile(x, y);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === ' ') {
        e.preventDefault();
        setPaused(p => !p);
      }
      if (e.key === 'r' || e.key === 'R') {
        if (gameOver) {
          setScore(0);
          setWave(1);
          setGameOver(false);
          setPaused(false);
        }
      }
      if (e.key === 'Escape') {
        onBack();
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [ageMode, onBack, paused, gameOver]);

  const handleRestart = () => {
    setScore(0);
    setWave(1);
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
          <h2 className="text-2xl font-display font-bold text-starlight">Missile Command</h2>
          <div className="flex items-center justify-center gap-6 mt-2 text-sm text-stardust">
            <span>Score: <span className="text-rocket-orange font-bold">{score}</span></span>
            <span>Wave: <span className="text-plasma-blue font-bold">{wave}</span></span>
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
              <p className="text-stardust">Press SPACE to resume</p>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-void/90 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="text-center">
              <h3 className="text-4xl font-display font-bold text-mars-red mb-4">GAME OVER</h3>
              <p className="text-xl text-starlight mb-2">Final Score: {score}</p>
              <p className="text-stardust mb-6">Wave: {wave}</p>
              <button
                type="button"
                onClick={handleRestart}
                className="px-6 py-3 bg-rocket-orange hover:bg-rocket-orange/80 text-starlight rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="h-5 w-5" />
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 text-sm text-stardust text-center space-y-1">
        <p><span className="text-starlight font-semibold">Mouse:</span> Aim | <span className="text-starlight font-semibold">Click:</span> Fire</p>
        <p><span className="text-starlight font-semibold">SPACE:</span> Pause | <span className="text-starlight font-semibold">R:</span> Restart | <span className="text-starlight font-semibold">ESC:</span> Back</p>
      </div>
    </div>
  );
}
