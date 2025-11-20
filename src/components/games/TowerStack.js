import React, { useState, useEffect, useRef } from 'react';
import styles from './TowerStack.module.css';

export default function TowerStack({ onClose }) {
  const [blocks, setBlocks] = useState([
    { width: 150, x: 75, y: 420, color: '#3b82f6' }
  ]);
  const [currentBlock, setCurrentBlock] = useState({
    width: 150,
    x: 40,
    direction: 1,
    speed: 2,
    color: '#8b5cf6'
  });
  const [score, setScore] = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const animationRef = useRef(null);

  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  useEffect(() => {
    if (!gameActive || gameOver) return;

    const animate = () => {
      setCurrentBlock(prev => {
        let newX = prev.x + prev.direction * prev.speed;
        let newDirection = prev.direction;

        if (newX <= 0 || newX + prev.width >= 300) {
          newDirection = -prev.direction;
          newX = newX <= 0 ? 0 : 300 - prev.width;
        }

        return { ...prev, x: newX, direction: newDirection };
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameActive, gameOver]);

  const dropBlock = () => {
    if (!gameActive || gameOver) return;

    const lastBlock = blocks[blocks.length - 1];
    const overlap = Math.min(
      lastBlock.x + lastBlock.width,
      currentBlock.x + currentBlock.width
    ) - Math.max(lastBlock.x, currentBlock.x);

    if (overlap <= 0) {
      setGameOver(true);
      setGameActive(false);
      return;
    }

    const newWidth = overlap;
    const newX = Math.max(lastBlock.x, currentBlock.x);
    const isPerfect = Math.abs(overlap - lastBlock.width) < 5;

    const newBlock = {
      width: newWidth,
      x: newX,
      y: lastBlock.y - 30,
      color: colors[blocks.length % colors.length]
    };

    setBlocks([...blocks, newBlock]);
    setScore(prev => prev + (isPerfect ? 20 : 10));

    if (isPerfect) {
      setPerfectCount(prev => prev + 1);
    } else {
      setPerfectCount(0);
    }

    const speedBoost = perfectCount >= 2 ? 0.7 : 1;
    setCurrentBlock({
      width: newWidth,
      x: Math.random() * (300 - newWidth),
      direction: Math.random() > 0.5 ? 1 : -1,
      speed: Math.min(2 + blocks.length * 0.1, 5) * speedBoost,
      color: colors[(blocks.length + 1) % colors.length]
    });
  };

  const restartGame = () => {
    setBlocks([{ width: 150, x: 75, y: 420, color: '#3b82f6' }]);
    setCurrentBlock({
      width: 150,
      x: 40,
      direction: 1,
      speed: 2,
      color: '#8b5cf6'
    });
    setScore(0);
    setPerfectCount(0);
    setGameActive(true);
    setGameOver(false);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameOver) {
          restartGame();
        } else {
          dropBlock();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameActive, gameOver, blocks, currentBlock, perfectCount]);

  return (
    <div className={styles.container}>
      <div className={styles.gameArea}>
        <div className={styles.scoreBoard}>
          <div className={styles.scoreItem}>
            <span className={styles.label}>Score</span>
            <span className={styles.value}>{score}</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.label}>Blocks</span>
            <span className={styles.value}>{blocks.length}</span>
          </div>
          {perfectCount > 0 && (
            <div className={styles.perfectStreak}>
              🔥 {perfectCount}x Perfect!
            </div>
          )}
        </div>

        <div className={styles.canvas}>
          {blocks.map((block, i) => (
            <div
              key={i}
              className={styles.block}
              style={{
                width: `${block.width}px`,
                left: `${block.x}px`,
                bottom: `${450 - block.y}px`,
                background: block.color,
                boxShadow: `0 0 20px ${block.color}80`
              }}
            />
          ))}

          {gameActive && !gameOver && (
            <div
              className={`${styles.block} ${styles.currentBlock}`}
              style={{
                width: `${currentBlock.width}px`,
                left: `${currentBlock.x}px`,
                bottom: `${450 - (blocks[blocks.length - 1].y - 30)}px`,
                background: currentBlock.color,
                boxShadow: `0 0 30px ${currentBlock.color}`
              }}
            />
          )}
        </div>

        {gameOver && (
          <div className={styles.gameOverOverlay}>
            <div className={styles.gameOverCard}>
              <h2>🏗️ Tower Complete!</h2>
              <div className={styles.finalScore}>
                <p>Final Score: <strong>{score}</strong></p>
                <p>Blocks Stacked: <strong>{blocks.length}</strong></p>
              </div>
              <button className={styles.restartButton} onClick={restartGame}>
                Play Again
              </button>
            </div>
          </div>
        )}

        <div className={styles.controls}>
          <p>Press <kbd>SPACE</kbd> or click to drop block</p>
          <button className={styles.dropButton} onClick={dropBlock} disabled={gameOver}>
            Drop Block
          </button>
        </div>
      </div>
    </div>
  );
}
