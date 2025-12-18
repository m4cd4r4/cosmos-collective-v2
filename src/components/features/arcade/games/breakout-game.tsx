'use client';

import { useEffect, useRef, useState } from 'react';
import { useUserPreferences } from '@/lib/stores/preferences';

interface BreakoutGameProps {
  onClose: () => void;
  onBack: () => void;
}

interface Paddle {
  x: number;
  width: number;
  height: number;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  hits: number;
  maxHits: number;
}

export function BreakoutGame({ onClose, onBack }: BreakoutGameProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [paused, setPaused] = useState(false);
  const { ageMode } = useUserPreferences();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    // Difficulty settings
    const difficulty = {
      explorer: { rows: 3, cols: 8, ballSpeed: 4, paddleWidth: 120 },
      cadet: { rows: 4, cols: 10, ballSpeed: 5, paddleWidth: 100 },
      missionControl: { rows: 5, cols: 12, ballSpeed: 6, paddleWidth: 80 },
    }[ageMode];

    // Game state
    const paddle: Paddle = {
      x: canvas.width / 2 - difficulty.paddleWidth / 2,
      width: difficulty.paddleWidth,
      height: 15,
    };

    const ball: Ball = {
      x: canvas.width / 2,
      y: canvas.height - 100,
      dx: difficulty.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
      dy: -difficulty.ballSpeed,
      radius: 8,
    };

    const bricks: Brick[] = [];
    const brickWidth = 60;
    const brickHeight = 25;
    const brickPadding = 10;
    const brickOffsetTop = 60;
    const brickOffsetLeft = (canvas.width - (difficulty.cols * (brickWidth + brickPadding) - brickPadding)) / 2;

    // Initialize bricks
    for (let row = 0; row < difficulty.rows; row++) {
      for (let col = 0; col < difficulty.cols; col++) {
        const maxHits = Math.min(row + 1, 3); // Stronger bricks at the top
        bricks.push({
          x: brickOffsetLeft + col * (brickWidth + brickPadding),
          y: brickOffsetTop + row * (brickHeight + brickPadding),
          width: brickWidth,
          height: brickHeight,
          hits: 0,
          maxHits,
        });
      }
    }

    const keys: { [key: string]: boolean } = {};

    // Input handling
    function handleKeyDown(e: KeyboardEvent) {
      keys[e.key] = true;
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
      if (paused || gameOver || won || !ctx || !canvas) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      // Clear canvas
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update paddle
      if (keys['ArrowLeft'] && paddle.x > 0) {
        paddle.x -= 7;
      }
      if (keys['ArrowRight'] && paddle.x < canvas.width - paddle.width) {
        paddle.x += 7;
      }

      // Draw paddle
      ctx.fillStyle = '#ff6b2c';
      ctx.fillRect(paddle.x, canvas.height - paddle.height - 10, paddle.width, paddle.height);

      // Update ball
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Ball collision with walls
      if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
      }
      if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
      }

      // Ball collision with paddle
      if (
        ball.y + ball.radius > canvas.height - paddle.height - 10 &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
      ) {
        // Calculate bounce angle based on where ball hits paddle
        const hitPos = (ball.x - paddle.x) / paddle.width;
        const angle = (hitPos - 0.5) * (Math.PI / 3); // Max 60 degree angle
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = speed * Math.sin(angle);
        ball.dy = -Math.abs(speed * Math.cos(angle)); // Always bounce up
      }

      // Ball falls off bottom
      if (ball.y - ball.radius > canvas.height) {
        setLives((l) => {
          const newLives = l - 1;
          if (newLives <= 0) {
            setGameOver(true);
          } else {
            // Reset ball
            ball.x = canvas.width / 2;
            ball.y = canvas.height - 100;
            ball.dx = difficulty.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
            ball.dy = -difficulty.ballSpeed;
          }
          return newLives;
        });
      }

      // Draw ball
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw and check bricks
      let remainingBricks = 0;
      for (let i = bricks.length - 1; i >= 0; i--) {
        const brick = bricks[i];

        // Skip destroyed bricks
        if (brick.hits >= brick.maxHits) continue;

        remainingBricks++;

        // Draw brick with color based on hits
        const colors = ['#8b5cf6', '#6d28d9', '#4c1d95'];
        ctx.fillStyle = colors[Math.min(brick.maxHits - brick.hits - 1, colors.length - 1)];
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

        // Draw brick outline
        ctx.strokeStyle = '#a78bfa';
        ctx.lineWidth = 2;
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);

        // Check collision with ball
        if (
          ball.x + ball.radius > brick.x &&
          ball.x - ball.radius < brick.x + brick.width &&
          ball.y + ball.radius > brick.y &&
          ball.y - ball.radius < brick.y + brick.height
        ) {
          // Determine bounce direction
          const ballCenterX = ball.x;
          const ballCenterY = ball.y;
          const brickCenterX = brick.x + brick.width / 2;
          const brickCenterY = brick.y + brick.height / 2;

          const dx = ballCenterX - brickCenterX;
          const dy = ballCenterY - brickCenterY;

          if (Math.abs(dx / (brick.width / 2)) > Math.abs(dy / (brick.height / 2))) {
            ball.dx = -ball.dx;
          } else {
            ball.dy = -ball.dy;
          }

          brick.hits++;
          if (brick.hits >= brick.maxHits) {
            setScore((s) => s + brick.maxHits * 10);
          }
        }
      }

      // Check win condition
      if (remainingBricks === 0) {
        setWon(true);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    }

    gameLoop();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [ageMode, paused, gameOver, won]);

  const handleRestart = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWon(false);
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

        {won && (
          <div className="absolute inset-0 flex items-center justify-center bg-void/90 rounded-lg">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-starlight">Victory!</h2>
              <p className="text-xl text-stardust">Station Defended!</p>
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

        {paused && !gameOver && !won && (
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
          <kbd className="px-2 py-1 bg-nebula rounded">←</kbd> Move Left •{' '}
          <kbd className="px-2 py-1 bg-nebula rounded">→</kbd> Move Right
        </p>
        <p>
          <kbd className="px-2 py-1 bg-nebula rounded">ESC</kbd> Pause
        </p>
      </div>
    </div>
  );
}
