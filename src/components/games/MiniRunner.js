import React, { useState, useEffect, useRef } from 'react';
import styles from './MiniRunner.module.css';

export default function MiniRunner({ onClose }) {
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [distance, setDistance] = useState(0);

    const gameStateRef = useRef({
        playerY: 100,
        velocity: 0,
        isJumping: false,
        obstacles: [],
        obstacleCounter: 0,
        distance: 0,
        score: 0
    });

    const playerRef = useRef(null);
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const obstacleRefs = useRef([]);

    const GRAVITY = -0.6;  // Negative pulls player down
    const JUMP_STRENGTH = 12;  // Positive pushs player up
    const GROUND_Y = 100;
    const GAME_SPEED = 6;

    useEffect(() => {
        if (gameOver) return;

        const gameLoop = () => {
            const state = gameStateRef.current;

            // Update player physics
            state.velocity += GRAVITY;
            state.playerY += state.velocity;

            // Check if player hit ground
            if (state.playerY <= GROUND_Y) {
                state.playerY = GROUND_Y;
                state.velocity = 0;
                state.isJumping = false;
            }

            // Update player DOM
            if (playerRef.current) {
                playerRef.current.style.bottom = `${state.playerY}px`;
            }

            // Move and update obstacles
            state.obstacles = state.obstacles.filter((obs, index) => {
                obs.x -= GAME_SPEED;

                // Check collision
                if (obs.x < 80 && obs.x > 30 && state.playerY < GROUND_Y + 50) {
                    setGameOver(true);
                    return false;
                }

                // Update obstacle DOM
                if (obstacleRefs.current[index]) {
                    obstacleRefs.current[index].style.left = `${obs.x}px`;
                }

                return obs.x > -50;
            });

            // Spawn new obstacles
            state.obstacleCounter++;
            if (state.obstacleCounter > 80) {
                state.obstacleCounter = 0;
                const newObs = {
                    x: 600,
                    width: 20 + Math.random() * 20,
                    height: 40 + Math.random() * 20,
                    id: Date.now()
                };
                state.obstacles.push(newObs);
            }

            // Update score
            state.distance += 1;
            state.score += 1;

            if (state.distance % 10 === 0) {
                setDistance(state.distance);
                setScore(state.score);
            }

            animationRef.current = requestAnimationFrame(gameLoop);
        };

        animationRef.current = requestAnimationFrame(gameLoop);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [gameOver]);

    const jump = () => {
        const state = gameStateRef.current;
        if (!state.isJumping && !gameOver) {
            state.velocity = JUMP_STRENGTH;
            state.isJumping = true;
        }
    };

    const restartGame = () => {
        gameStateRef.current = {
            playerY: 100,
            velocity: 0,
            isJumping: false,
            obstacles: [],
            obstacleCounter: 0,
            distance: 0,
            score: 0
        };
        setDistance(0);
        setScore(0);
        setGameOver(false);
    };

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (gameOver) {
                    restartGame();
                } else {
                    jump();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [gameOver]);

    return (
        <div className={styles.container}>
            <div className={styles.gameArea}>
                <div className={styles.scoreBoard}>
                    <div className={styles.scoreItem}>
                        <span className={styles.label}>Distance</span>
                        <span className={styles.value}>{Math.floor(distance / 10)}m</span>
                    </div>
                    <div className={styles.scoreItem}>
                        <span className={styles.label}>Score</span>
                        <span className={styles.value}>{score}</span>
                    </div>
                </div>

                <div className={styles.canvas} ref={canvasRef}>
                    <div className={styles.ground} />

                    <div
                        ref={playerRef}
                        className={styles.player}
                        style={{ bottom: '100px' }}
                    />

                    {gameStateRef.current.obstacles.map((obs, index) => (
                        <div
                            key={obs.id}
                            ref={el => obstacleRefs.current[index] = el}
                            className={styles.obstacle}
                            style={{
                                left: `${obs.x}px`,
                                width: `${obs.width}px`,
                                height: `${obs.height}px`
                            }}
                        />
                    ))}

                    {gameOver && (
                        <div className={styles.gameOverOverlay}>
                            <div className={styles.gameOverCard}>
                                <h2>🏃 Game Over!</h2>
                                <div className={styles.finalScore}>
                                    <p>Distance: <strong>{Math.floor(distance / 10)}m</strong></p>
                                    <p>Score: <strong>{score}</strong></p>
                                </div>
                                <button className={styles.restartButton} onClick={restartGame}>
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles.controls}>
                    <p>Press <kbd>SPACE</kbd> or click to jump</p>
                    <button className={styles.jumpButton} onClick={jump} disabled={gameOver}>
                        Jump
                    </button>
                </div>
            </div>
        </div>
    );
}
