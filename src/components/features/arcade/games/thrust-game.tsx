'use client';

import { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, ArrowLeft } from 'lucide-react';
import { useUserPreferences } from '@/lib/stores/preferences';

interface ThrustGameProps {
  onClose: () => void;
  onBack: () => void;
}

interface Ship {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  fuel: number;
  size: number;
}

interface FuelPod {
  x: number;
  y: number;
  size: number;
  collected: boolean;
}

interface Wall {
  x: number;
  topY: number;
  bottomY: number;
  gap: number;
}

export function ThrustGame({ onClose, onBack }: ThrustGameProps): JSX.Element {
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
    let distance = 0;

    // Difficulty settings based on age mode
    const difficulty = {
      explorer: {
        gravity: 0.05,
        thrustPower: 0.2,
        rotationSpeed: 0.08,
        initialFuel: 200,
        caveGap: 250,
        caveVariation: 80,
      },
      cadet: {
        gravity: 0.08,
        thrustPower: 0.18,
        rotationSpeed: 0.06,
        initialFuel: 150,
        caveGap: 200,
        caveVariation: 100,
      },
      missionControl: {
        gravity: 0.1,
        thrustPower: 0.15,
        rotationSpeed: 0.05,
        initialFuel: 120,
        caveGap: 180,
        caveVariation: 120,
      },
    }[ageMode];

    // Initialize ship
    const ship: Ship = {
      x: 100,
      y: canvas.height / 2,
      vx: 1,
      vy: 0,
      angle: 0,
      fuel: difficulty.initialFuel,
      size: 15,
    };

    // Initialize walls
    const walls: Wall[] = [];
    let wallX = canvas.width;

    function generateWall(x: number) {
      if (!canvas) return;

      const prevWall = walls[walls.length - 1];
      let topY: number;
      let bottomY: number;

      if (prevWall) {
        // Smooth cave generation
        const targetTop = prevWall.topY + (Math.random() - 0.5) * difficulty.caveVariation;
        topY = Math.max(80, Math.min(canvas.height / 2 - difficulty.caveGap / 2 - 50, targetTop));
        bottomY = topY + difficulty.caveGap;
      } else {
        topY = canvas.height / 2 - difficulty.caveGap / 2;
        bottomY = canvas.height / 2 + difficulty.caveGap / 2;
      }

      walls.push({
        x,
        topY,
        bottomY,
        gap: difficulty.caveGap,
      });
    }

    // Generate initial walls
    for (let i = 0; i < 10; i++) {
      generateWall(wallX + i * 80);
    }

    // Initialize fuel pods
    const fuelPods: FuelPod[] = [];

    function generateFuelPod() {
      if (fuelPods.length < 3 && Math.random() < 0.01) {
        const wall = walls[Math.floor(walls.length / 2)];
        if (wall) {
          fuelPods.push({
            x: wall.x + 40,
            y: wall.topY + wall.gap / 2,
            size: 10,
            collected: false,
          });
        }
      }
    }

    function checkCollisions() {
      if (!canvas) return;

      // Check wall collisions
      walls.forEach(wall => {
        if (
          ship.x + ship.size > wall.x &&
          ship.x - ship.size < wall.x + 10 &&
          (ship.y - ship.size < wall.topY || ship.y + ship.size > wall.bottomY)
        ) {
          setGameOver(true);
        }
      });

      // Check fuel pod collection
      fuelPods.forEach(pod => {
        if (!pod.collected) {
          const dx = ship.x - pod.x;
          const dy = ship.y - pod.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < ship.size + pod.size) {
            pod.collected = true;
            ship.fuel = Math.min(ship.fuel + 50, difficulty.initialFuel);
            currentScore += 100;
            setScore(currentScore);
          }
        }
      });

      // Check boundaries
      if (ship.y - ship.size < 0 || ship.y + ship.size > canvas.height) {
        setGameOver(true);
      }

      // Check fuel
      if (ship.fuel <= 0) {
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

      // Handle input
      if (keys['ArrowLeft'] || keys['a']) {
        ship.angle -= difficulty.rotationSpeed;
      }
      if (keys['ArrowRight'] || keys['d']) {
        ship.angle += difficulty.rotationSpeed;
      }
      if (keys['ArrowUp'] || keys['w'] || keys[' ']) {
        if (ship.fuel > 0) {
          ship.vx += Math.cos(ship.angle) * difficulty.thrustPower;
          ship.vy += Math.sin(ship.angle) * difficulty.thrustPower;
          ship.fuel -= 0.5;

          // Draw thrust flame
          ctx.save();
          ctx.translate(ship.x, ship.y);
          ctx.rotate(ship.angle);

          const gradient = ctx.createLinearGradient(0, 0, -20, 0);
          gradient.addColorStop(0, '#fbbf24');
          gradient.addColorStop(0.5, '#f97316');
          gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(-ship.size, -3);
          ctx.lineTo(-ship.size - 15 - Math.random() * 5, 0);
          ctx.lineTo(-ship.size, 3);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
      }

      // Apply physics
      ship.vy += difficulty.gravity; // Gravity
      ship.vx *= 0.99; // Air resistance
      ship.vy *= 0.99;

      // Update position
      ship.x += ship.vx;
      ship.y += ship.vy;

      // Update camera (scroll walls left)
      const scrollSpeed = 2;
      walls.forEach(wall => {
        wall.x -= scrollSpeed;
      });

      // Remove off-screen walls and generate new ones
      if (walls[0] && walls[0].x < -20) {
        walls.shift();
        generateWall(walls[walls.length - 1].x + 80);
      }

      // Update fuel pods
      fuelPods.forEach((pod, index) => {
        pod.x -= scrollSpeed;
        if (pod.x < -20 || pod.collected) {
          fuelPods.splice(index, 1);
        }
      });

      generateFuelPod();

      // Update score
      distance += scrollSpeed;
      if (Math.floor(distance) % 10 === 0) {
        currentScore += 1;
        setScore(currentScore);
      }

      // Draw cave walls
      ctx.fillStyle = '#1a1f36';
      walls.forEach(wall => {
        // Top wall
        ctx.fillRect(wall.x, 0, 10, wall.topY);

        // Bottom wall
        ctx.fillRect(wall.x, wall.bottomY, 10, canvas.height - wall.bottomY);

        // Wall edges for texture
        ctx.strokeStyle = '#14b8a6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(wall.x, wall.topY);
        ctx.lineTo(wall.x + 10, wall.topY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(wall.x, wall.bottomY);
        ctx.lineTo(wall.x + 10, wall.bottomY);
        ctx.stroke();
      });

      // Draw fuel pods
      fuelPods.forEach(pod => {
        if (!pod.collected) {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(pod.x, pod.y, pod.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Pulsing effect
          const pulseSize = pod.size + Math.sin(Date.now() / 200) * 2;
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pod.x, pod.y, pulseSize, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Draw ship
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle);

      // Ship body
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(ship.size, 0);
      ctx.lineTo(-ship.size, -ship.size / 2);
      ctx.lineTo(-ship.size / 2, 0);
      ctx.lineTo(-ship.size, ship.size / 2);
      ctx.closePath();
      ctx.fill();

      // Ship outline
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cockpit
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.arc(ship.size / 3, 0, ship.size / 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Check collisions
      checkCollisions();

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
          <h2 className="text-2xl font-display font-bold text-starlight">Thrust</h2>
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

        {/* HUD Overlay */}
        {!gameOver && !paused && (
          <div className="absolute top-4 left-4 bg-void/80 backdrop-blur-sm rounded-lg p-3 border border-nebula">
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-stardust">Fuel:</span>
                <div className="w-32 h-4 bg-nebula rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-mars-red via-solar-gold to-aurora-teal transition-all"
                    style={{
                      width: `${(canvasRef.current && canvasRef.current.getContext('2d')) ?
                        Math.max(0, 100) : 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

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
              <h3 className="text-4xl font-display font-bold text-mars-red mb-4">CRASHED!</h3>
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
        <p><span className="text-starlight font-semibold">← →</span> Rotate | <span className="text-starlight font-semibold">↑ / SPACE:</span> Thrust</p>
        <p><span className="text-starlight font-semibold">P:</span> Pause | <span className="text-starlight font-semibold">R:</span> Restart | <span className="text-starlight font-semibold">ESC:</span> Back</p>
      </div>
    </div>
  );
}
