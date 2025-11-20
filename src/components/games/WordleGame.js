import React, { useState, useEffect } from 'react';
import styles from './WordleGame.module.css';

const WORD_LIST = [
    'REACT', 'WATER', 'PLANT', 'BREAD', 'STONE', 'CLOUD', 'MUSIC', 'LIGHT',
    'HOUSE', 'EARTH', 'SMILE', 'DREAM', 'HEART', 'BEACH', 'TIGER', 'GRAPE',
    'FLAME', 'OCEAN', 'MAPLE', 'NOBLE', 'PIANO', 'QUICK', 'RIVER', 'STORM',
    'TRACE', 'URBAN', 'VOICE', 'WHALE', 'YOUTH', 'CHAIR', 'LEMON', 'PEARL'
];

export default function WordleGame({ onClose }) {
    const [targetWord, setTargetWord] = useState('');
    const [guesses, setGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [gameWon, setGameWon] = useState(false);
    const [gameLost, setGameLost] = useState(false);

    useEffect(() => {
        const dailyIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % WORD_LIST.length;
        setTargetWord(WORD_LIST[dailyIndex]);
    }, []);

    const handleKeyPress = (key) => {
        if (gameWon || gameLost) return;

        if (key === 'ENTER') {
            if (currentGuess.length === 5) {
                const newGuesses = [...guesses, currentGuess];
                setGuesses(newGuesses);

                if (currentGuess === targetWord) {
                    setGameWon(true);
                } else if (newGuesses.length >= 6) {
                    setGameLost(true);
                }

                setCurrentGuess('');
            }
        } else if (key === 'BACK') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
            setCurrentGuess(prev => prev + key);
        }
    };

    useEffect(() => {
        const handlePhysicalKeyPress = (e) => {
            if (e.key === 'Enter') {
                handleKeyPress('ENTER');
            } else if (e.key === 'Backspace') {
                handleKeyPress('BACK');
            } else if (/^[a-zA-Z]$/.test(e.key)) {
                handleKeyPress(e.key.toUpperCase());
            }
        };

        window.addEventListener('keydown', handlePhysicalKeyPress);
        return () => window.removeEventListener('keydown', handlePhysicalKeyPress);
    }, [currentGuess, guesses, gameWon, gameLost]);

    const getTileColor = (letter, index, word) => {
        if (word[index] === targetWord[index]) {
            return styles.correct;
        } else if (targetWord.includes(letter)) {
            return styles.present;
        } else {
            return styles.absent;
        }
    };

    const restartGame = () => {
        setGuesses([]);
        setCurrentGuess('');
        setGameWon(false);
        setGameLost(false);
        const dailyIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % WORD_LIST.length;
        setTargetWord(WORD_LIST[dailyIndex]);
    };

    const keyboard = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
    ];

    return (
        <div className={styles.container}>
            <div className={styles.gameArea}>
                <h2 className={styles.title}>Word Puzzle</h2>
                <p className={styles.subtitle}>Guess the daily 5-letter word</p>

                <div className={styles.grid}>
                    {[...Array(6)].map((_, rowIndex) => (
                        <div key={rowIndex} className={styles.row}>
                            {[...Array(5)].map((_, colIndex) => {
                                const guess = guesses[rowIndex];
                                const isCurrentRow = rowIndex === guesses.length && !gameWon && !gameLost;
                                const letter = guess ? guess[colIndex] : (isCurrentRow ? currentGuess[colIndex] : '');
                                const tileClass = guess ? getTileColor(guess[colIndex], colIndex, guess) : '';

                                return (
                                    <div
                                        key={colIndex}
                                        className={`${styles.tile} ${tileClass} ${isCurrentRow && letter ? styles.filled : ''}`}
                                    >
                                        {letter || ''}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {(gameWon || gameLost) && (
                    <div className={styles.result}>
                        <h3>{gameWon ? '🎉 You Won!' : '😢 Game Over'}</h3>
                        {gameLost && <p>The word was: <strong>{targetWord}</strong></p>}
                        <button className={styles.restartButton} onClick={restartGame}>
                            Play Again
                        </button>
                    </div>
                )}

                <div className={styles.keyboard}>
                    {keyboard.map((row, rowIndex) => (
                        <div key={rowIndex} className={styles.keyboardRow}>
                            {row.map(key => (
                                <button
                                    key={key}
                                    className={`${styles.key} ${key.length > 1 ? styles.specialKey : ''}`}
                                    onClick={() => handleKeyPress(key)}
                                    disabled={gameWon || gameLost}
                                >
                                    {key === 'BACK' ? '⌫' : key}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
