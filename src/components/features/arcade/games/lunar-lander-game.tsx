'use client';

import { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, ArrowLeft } from 'lucide-react';
import { useUserPreferences } from '@/lib/stores/preferences';

interface LunarLanderGameProps {
  onClose: () => void;
  onBack: () => void;
}

interface Lander {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  fuel: number;
  width: number;
  height: number;
}

interface LandingPad {
  x: number;
  y: number;
  width: number;
}

interface Terrain {
  points: { x: number; y: number }[];
}

export function LunarLanderGame({ onClose, onBack }: LunarLanderGameProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [landed, setLanded] = useState(false);
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
    let currentLevel = 1;
    let landedState = false;

    // Difficulty settings based on age mode
    const difficulty = {
      explorer: {
        gravity: 0.02,
        thrustPower: 0.15,
        rotationPower: 0.015,
        initialFuel: 1000,
        maxSafeLandingSpeed: 2,
      },
      cadet: {
        gravity: 0.05,
        thrustPower: 0.12,
        rotationPower: 0.012,
        initialFuel: 800,
        maxSafeLandingSpeed: 1.5,
      },
      missionControl: {
        gravity: 0.08,
        thrustPower: 0.1,
        rotationPower: 0.01,
        initialFuel: 600,
        maxSafeLandingSpeed: 1,
      },
    }[ageMode];

    // Initialize lander
    const lander: Lander = {
      x: canvas.width / 2,
      y: 100,
      vx: 0,
      vy: 0,
      angle: 0,
      fuel: difficulty.initialFuel,
      width: 30,
      height: 20,
    };

    // Generate terrain
    const terrain: Terrain = {
      points: [],
    };

    function generateTerrain() {
      if (!canvas) return;

      terrain.points = [];
      const segments = 20;
      const segmentWidth = canvas.width / segments;

      for (let i = 0; i <= segments; i++) {
        const x = i * segmentWidth;
        let y: number;

        // Create flat landing pad area
        if (i >= 8 && i <= 12) {
          y = canvas.height - 100;
        } else {
          // Random terrain height
          y = canvas.height - 50 - Math.random() * 150 - currentLevel * 20;
        }

        terrain.points.push({ x, y });
      }
    }

    // Landing pad
    const landingPad: LandingPad = {
      x: (canvas.width / 20) * 8,
      y: canvas.height - 100,
      width: (canvas.width / 20) * 4,
    };

    generateTerrain();

    function checkLanding() {
      if (!canvas) return;

      // Check if lander is on landing pad
      if (
        lander.y + lander.height >= landingPad.y &&
        lander.x >= landingPad.x &&
        lander.x <= landingPad.x + landingPad.width
      ) {
        const speed = Math.sqrt(lander.vx * lander.vx + lander.vy * lander.vy);
        const angleOk = Math.abs(lander.angle) < 0.3;

        if (speed <= difficulty.maxSafeLandingSpeed && angleOk) {
          // Successful landing
          landedState = true;
          setLanded(true);

          // Calculate bonus
          const speedBonus = Math.floor((difficulty.maxSafeLandingSpeed - speed) * 100);
          const fuelBonus = Math.floor(lander.fuel);
          const levelBonus = currentLevel * 1000;

          currentScore += speedBonus + fuelBonus + levelBonus;
          setScore(currentScore);
        } else {
          // Crash
          setGameOver(true);
        }
      }

      // Check collision with terrain
      terrain.points.forEach((point, i) => {
        if (i < terrain.points.length - 1) {
          const nextPoint = terrain.points[i + 1];

          if (
            lander.x >= point.x &&
            lander.x <= nextPoint.x &&
            lander.y + lander.height >= Math.min(point.y, nextPoint.y)
          ) {
            // Not on landing pad = crash
            if (lander.x < landingPad.x || lander.x > landingPad.x + landingPad.width) {
              setGameOver(true);
            }
          }
        }
      });

      // Check if lander is out of bounds
      if (lander.x < 0 || lander.x > canvas.width || lander.y < 0 || lander.y > canvas.height) {
        setGameOver(true);
      }
    }

    function nextLevel() {
      if (!canvas) return;

      currentLevel++;
      setLevel(currentLevel);
      lander.x = canvas.width / 2;
      lander.y = 100;
      lander.vx = 0;
      lander.vy = 0;
      lander.angle = 0;
      lander.fuel = difficulty.initialFuel;
      landedState = false;
      setLanded(false);
      generateTerrain();
    }

    function gameLoop() {
      if (paused || gameOver || landedState || !ctx || !canvas) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      // Clear canvas
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a0a1a');
      gradient.addColorStop(1, '#1a1030');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 50; i++) {
        const x = (i * 123) % canvas.width;
        const y = (i * 456) % (canvas.height / 2);
        ctx.fillRect(x, y, 1, 1);
      }

      // Handle input
      if (keys['ArrowLeft'] || keys['a']) {
        if (lander.fuel > 0) {
          lander.angle -= difficulty.rotationPower;
          lander.fuel -= 0.1;
        }
      }
      if (keys['ArrowRight'] || keys['d']) {
        if (lander.fuel > 0) {
          lander.angle += difficulty.rotationPower;
          lander.fuel -= 0.1;
        }
      }
      if (keys['ArrowUp'] || keys['w'] || keys[' ']) {
        if (lander.fuel > 0) {
          lander.vx += Math.sin(lander.angle) * difficulty.thrustPower;
          lander.vy -= Math.cos(lander.angle) * difficulty.thrustPower;
          lander.fuel -= 1;

          // Draw thrust flame
          ctx.save();
          ctx.translate(lander.x, lander.y);
          ctx.rotate(lander.angle);

          const gradient = ctx.createLinearGradient(0, lander.height / 2, 0, lander.height / 2 + 20);
          gradient.addColorStop(0, '#fbbf24');
          gradient.addColorStop(0.5, '#f97316');
          gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(-5, lander.height / 2);
          ctx.lineTo(0, lander.height / 2 + 15 + Math.random() * 5);
          ctx.lineTo(5, lander.height / 2);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        }
      }

      // Apply physics
      lander.vy += difficulty.gravity; // Gravity
      lander.x += lander.vx;
      lander.y += lander.vy;

      // Draw terrain
      ctx.fillStyle = '#1a1f36';
      ctx.strokeStyle = '#14b8a6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);

      terrain.points.forEach((point, i) => {
        if (i === 0) {
          ctx.lineTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });

      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw landing pad
      ctx.fillStyle = '#14b8a6';
      ctx.fillRect(landingPad.x, landingPad.y - 5, landingPad.width, 5);

      // Draw landing pad markers
      for (let i = 0; i < 5; i++) {
        const x = landingPad.x + (landingPad.width / 4) * i;
        ctx.fillStyle = i % 2 === 0 ? '#fbbf24' : '#f97316';
        ctx.fillRect(x, landingPad.y - 10, 10, 5);
      }

      // Draw lander
      ctx.save();
      ctx.translate(lander.x, lander.y);
      ctx.rotate(lander.angle);

      // Lander body
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(-lander.width / 2, -lander.height / 2, lander.width, lander.height);

      // Lander window
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.arc(0, -lander.height / 4, 6, 0, Math.PI * 2);
      ctx.fill();

      // Lander legs
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-lander.width / 2, lander.height / 2);
      ctx.lineTo(-lander.width / 2 - 8, lander.height / 2 + 12);
      ctx.moveTo(lander.width / 2, lander.height / 2);
      ctx.lineTo(lander.width / 2 + 8, lander.height / 2 + 12);
      ctx.stroke();

      // Leg pads
      ctx.fillStyle = '#93c5fd';
      ctx.fillRect(-lander.width / 2 - 12, lander.height / 2 + 12, 8, 2);
      ctx.fillRect(lander.width / 2 + 4, lander.height / 2 + 12, 8, 2);

      ctx.restore();

      // Draw velocity indicator
      const speed = Math.sqrt(lander.vx * lander.vx + lander.vy * lander.vy);
      ctx.strokeStyle = speed > difficulty.maxSafeLandingSpeed ? '#ef4444' : '#14b8a6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lander.x, lander.y);
      ctx.lineTo(lander.x + lander.vx * 10, lander.y + lander.vy * 10);
      ctx.stroke();

      // Draw HUD
      ctx.fillStyle = 'rgba(26, 31, 54, 0.8)';
      ctx.fillRect(10, 10, 200, 120);

      ctx.fillStyle = '#f1f5f9';
      ctx.font = '14px monospace';
      ctx.textAlign = 'left';

      ctx.fillText(`Altitude: ${Math.floor(canvas.height - lander.y)} m`, 20, 30);
      ctx.fillText(`Velocity: ${speed.toFixed(2)} m/s`, 20, 50);
      ctx.fillText(`Angle: ${(lander.angle * (180 / Math.PI)).toFixed(1)}°`, 20, 70);

      // Fuel bar
      ctx.fillText('Fuel:', 20, 90);
      ctx.strokeStyle = '#14b8a6';
      ctx.strokeRect(20, 95, 170, 20);
      const fuelPercent = Math.max(0, lander.fuel / difficulty.initialFuel);
      ctx.fillStyle = fuelPercent > 0.3 ? '#14b8a6' : '#ef4444';
      ctx.fillRect(20, 95, 170 * fuelPercent, 20);

      // Target speed indicator
      ctx.fillStyle = '#fbbf24';
      ctx.font = '12px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`Safe landing speed: ≤${difficulty.maxSafeLandingSpeed} m/s`, canvas.width - 20, 30);

      // Check landing/collision
      checkLanding();

      animationFrameId = requestAnimationFrame(gameLoop);
    }

    function handleKeyDown(e: KeyboardEvent) {
      keys[e.key] = true;
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setPaused(p => !p);
      }
      if (e.key === 'r' || e.key === 'R') {
        if (gameOver || landed) {
          setScore(0);
          setLevel(1);
          setGameOver(false);
          setLanded(false);
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
  }, [ageMode, onBack, paused, gameOver, landed]);

  const handleRestart = () => {
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setLanded(false);
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
          <h2 className="text-2xl font-display font-bold text-starlight">Lunar Lander</h2>
          <div className="flex items-center justify-center gap-6 mt-2 text-sm text-stardust">
            <span>Score: <span className="text-rocket-orange font-bold">{score}</span></span>
            <span>Level: <span className="text-plasma-blue font-bold">{level}</span></span>
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

        {/* Landing Success Overlay */}
        {landed && (
          <div className="absolute inset-0 bg-void/90 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="text-center">
              <h3 className="text-4xl font-display font-bold text-aurora-teal mb-4">PERFECT LANDING!</h3>
              <p className="text-xl text-starlight mb-2">Score: {score}</p>
              <p className="text-stardust mb-6">Level {level} Complete</p>
              <button
                type="button"
                onClick={() => {
                  setLanded(false);
                  setLevel(level + 1);
                }}
                className="px-6 py-3 bg-aurora-teal hover:bg-aurora-teal/80 text-starlight rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
              >
                Next Level
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
