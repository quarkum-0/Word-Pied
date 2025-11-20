import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Home.module.css';
import UserProfile from '../components/UserProfile';
import { useTheme } from '../context/ThemeContext';
import WritingEditor from '../components/WritingEditor';
import GameModal from '../components/GameModal';
import { FiHelpCircle, FiX, FiSun, FiMoon, FiPlay, FiPause, FiZap } from 'react-icons/fi';

const audioFiles = [
  '/assets/Time.mp3',
  '/assets/Addicted.mp3',
  '/assets/AVENOIR.mp3',
  '/assets/Cyberfreak.mp3',
  '/assets/From Paris To Berlin.mp3',
  '/assets/Hope.mp3',
  '/assets/I Don\'t Know.mp3',
  '/assets/I Like It.mp3',
  '/assets/ICARUS.mp3',
  '/assets/impress you.mp3',
  '/assets/Lost.mp3',
  '/assets/My Gospel.mp3',
  '/assets/Name Tag.mp3',
  '/assets/Nobody But Me.mp3',
  '/assets/Stay The Night.mp3',
  '/assets/Talk To Me.mp3',
  '/assets/Upstairs.mp3',
  '/assets/Voicemail.mp3',
  '/assets/What Do You Mean.mp3',
  '/assets/Nothing but Trouble-Instagram Models.mp3',
];

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [shuffledAudioFiles, setShuffledAudioFiles] = useState([]);
  const [chaosMode, setChaosMode] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const audioRef = useRef(null);
  const { currentTheme, changeTheme } = useTheme();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(isDark);
      if (isDark) document.body.classList.add('dark-mode');
    }
  }, []);

  useEffect(() => {
    setShuffledAudioFiles(shuffleArray([...audioFiles]));
  }, []);

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const toggleDarkMode = () => {
    const newTheme = darkMode ? 'light' : 'dark';
    changeTheme(newTheme);
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleMusic = () => {
    if (musicPlaying) {
      audioRef.current.pause();
      setMusicPlaying(false);
    } else {
      if (!audioRef.current.src) {
        audioRef.current.src = shuffledAudioFiles[currentTrackIndex];
      }
      audioRef.current.play().catch(() => { });
      setMusicPlaying(true);
    }
  };

  const playNextTrack = useCallback(() => {
    if (audioRef.current && shuffledAudioFiles.length > 0) {
      const nextIdx = (currentTrackIndex + 1) % shuffledAudioFiles.length;
      setCurrentTrackIndex(nextIdx);
      audioRef.current.src = shuffledAudioFiles[nextIdx];
      audioRef.current.play().catch(() => { });
    }
  }, [currentTrackIndex, shuffledAudioFiles]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', playNextTrack);
      return () => {
        if (audioRef.current) audioRef.current.removeEventListener('ended', playNextTrack);
      };
    }
  }, [playNextTrack]);

  const scrollTo = (pos) => {
    if (pos === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (pos === 'bottom') {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  const triggerConfetti = () => {
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.className = styles.confetti;
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.top = `${Math.random() * 100}vh`;
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 2000);
    }
  };

  const toggleChaos = () => {
    setChaosMode(!chaosMode);
  };

  return (
    <div className={`${styles.homeContainer} ${darkMode ? styles.darkMode : ''}`}>
      <audio ref={audioRef} />

      <GameModal isOpen={showGames} onClose={() => setShowGames(false)} />

      <header className={`${styles.header} ${styles.slideIn}`}>
        <h1 className={`${styles.homeTitle} ${styles.neonText}`}>Word‑Pied</h1>

        <div className={styles.headerControls}>
          <button className={styles.navButton} onClick={toggleDarkMode}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          <button className={styles.navButton} onClick={toggleMusic}>
            {musicPlaying ? 'Pause Music' : 'Play Music'}
          </button>

          <button className={styles.navButton} onClick={triggerConfetti}>
            Celebrate
          </button>

          <button
            className={`${styles.navButton} ${chaosMode ? styles.active : ''}`}
            onClick={toggleChaos}
          >
            {chaosMode ? 'Calm Down' : 'Chaos Mode'}
          </button>

          <button
            className={styles.navButton}
            onClick={() => setShowGames(true)}
          >
            🎮 Play Games
          </button>
        </div>

        <div className="justify-self-end">
          <UserProfile />
        </div>
      </header>

      <p className={`${styles.subtitle} ${styles.slideUp}`} style={{ '--delay': 1 }}>
        Write and add links for the world to find.
      </p>
      <p className={`${styles.subtitle} ${styles.slideUp}`} style={{ '--delay': 2 }}>
        Music changes every time you refresh and you can embed links.
      </p>
      <p className={`${styles.subtitle} ${styles.slideUp}`} style={{ '--delay': 3 }}>
        Please let everyone have fun and don't clear others stuff.
      </p>

      <div className={`${styles.writingBoxesGrid} ${chaosMode ? styles.chaosGrid : ''}`}>
        {Array.from({ length: 1000 }, (_, i) => i).map((boxNumber) => (
          <div key={boxNumber} className={styles.writingBoxContainer}>
            <WritingEditor boxNumber={boxNumber} />
          </div>
        ))}
      </div>

      <button className={`${styles.scrollButton} ${styles.scrollToTop}`} onClick={() => scrollTo('top')}>
        ↑
      </button>
      <button className={`${styles.scrollButton} ${styles.scrollToBottom}`} onClick={() => scrollTo('bottom')}>
        ↓
      </button>
    </div >
  );
}
