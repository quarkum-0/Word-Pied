import React from 'react';
import { FiSun, FiMoon, FiMusic, FiInfo, FiStar } from 'react-icons/fi';
import UserProfile from './UserProfile';

const Header = ({ darkMode, toggleDarkMode, toggleMusic, startTutorial }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            WordPied
          </h1>
          <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 px-2 py-1 rounded-full">
            Beta
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            aria-label="Toggle theme"
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          <button
            onClick={toggleMusic}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            aria-label="Toggle music"
          >
            <FiMusic size={20} />
          </button>

          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            aria-label="Favorites"
          >
            <FiStar size={20} />
          </button>

          <button
            onClick={startTutorial}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            aria-label="Show tutorial"
          >
            <FiInfo size={20} />
          </button>

          <UserProfile />
        </div>
      </div>
    </header>
  );
};

export default Header;
