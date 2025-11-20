import React, { useState } from 'react';
import styles from './GameModal.module.css';
import TowerStack from './games/TowerStack';
import MiniRunner from './games/MiniRunner';
import WordleGame from './games/WordleGame';
import PhysicsFun from './games/PhysicsFun';

export default function GameModal({ isOpen, onClose }) {
    const [activeGame, setActiveGame] = useState(null);

    if (!isOpen) return null;

    const games = [
        {
            id: 'tower',
            name: 'Tower Stack',
            description: 'Stack blocks as high as you can!',
            emoji: '🏗️',
            color: 'from-purple-500 to-pink-500'
        },
        {
            id: 'runner',
            name: 'Mini Runner',
            description: 'Jump to survive the endless run!',
            emoji: '🏃',
            color: 'from-blue-500 to-cyan-500'
        },
        {
            id: 'wordle',
            name: 'Word Puzzle',
            description: 'Guess the daily word in 6 tries!',
            emoji: '📝',
            color: 'from-green-500 to-emerald-500'
        },
        {
            id: 'physics',
            name: 'Physics Fun',
            description: 'Throw objects and watch physics!',
            emoji: '🎱',
            color: 'from-orange-500 to-red-500'
        }
    ];

    if (activeGame) {
        return (
            <div className={styles.modalOverlay} onClick={(e) => {
                if (e.target === e.currentTarget) {
                    setActiveGame(null);
                }
            }}>
                <div className={styles.gameContainer}>
                    <button className={styles.backButton} onClick={() => setActiveGame(null)}>
                        ← Back to Games
                    </button>
                    {activeGame === 'tower' && <TowerStack onClose={() => setActiveGame(null)} />}
                    {activeGame === 'runner' && <MiniRunner onClose={() => setActiveGame(null)} />}
                    {activeGame === 'wordle' && <WordleGame onClose={() => setActiveGame(null)} />}
                    {activeGame === 'physics' && <PhysicsFun onClose={() => setActiveGame(null)} />}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.modalOverlay} onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>🎮 Mini Games</h2>
                    <button className={styles.closeButton} onClick={onClose}>✕</button>
                </div>

                <div className={styles.gamesGrid}>
                    {games.map(game => (
                        <button
                            key={game.id}
                            className={`${styles.gameCard} ${game.comingSoon ? styles.comingSoon : ''}`}
                            onClick={() => !game.comingSoon && setActiveGame(game.id)}
                            disabled={game.comingSoon}
                        >
                            <div className={`${styles.gameEmoji} bg-gradient-to-br ${game.color}`}>
                                {game.emoji}
                            </div>
                            <h3 className={styles.gameName}>{game.name}</h3>
                            <p className={styles.gameDescription}>{game.description}</p>
                            {game.comingSoon && (
                                <span className={styles.comingSoonBadge}>Coming Soon</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
