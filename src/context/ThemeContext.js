import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const themes = {
  light: {
    name: 'Light',
    backgroundColor: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    textColor: 'text-gray-800',
    boxBg: 'bg-white',
    boxShadow: 'shadow-md hover:shadow-lg',
    buttonBg: 'bg-primary-500 hover:bg-primary-600',
    buttonText: 'text-white',
  },
  dark: {
    name: 'Dark',
    backgroundColor: 'bg-gradient-to-br from-gray-900 to-gray-800',
    textColor: 'text-gray-100',
    boxBg: 'bg-gray-800',
    boxShadow: 'shadow-md shadow-gray-900/20 hover:shadow-lg hover:shadow-gray-900/30',
    buttonBg: 'bg-primary-600 hover:bg-primary-700',
    buttonText: 'text-white',
  },
  sunset: {
    name: 'Sunset',
    backgroundColor: 'bg-gradient-to-br from-orange-100 to-pink-100',
    textColor: 'text-gray-800',
    boxBg: 'bg-white',
    boxShadow: 'shadow-md shadow-orange-900/10 hover:shadow-lg hover:shadow-orange-900/20',
    buttonBg: 'bg-orange-500 hover:bg-orange-600',
    buttonText: 'text-white',
  },
  ocean: {
    name: 'Ocean',
    backgroundColor: 'bg-gradient-to-br from-cyan-100 to-blue-100',
    textColor: 'text-gray-800',
    boxBg: 'bg-white',
    boxShadow: 'shadow-md shadow-blue-900/10 hover:shadow-lg hover:shadow-blue-900/20',
    buttonBg: 'bg-cyan-600 hover:bg-cyan-700',
    buttonText: 'text-white',
  },
  forest: {
    name: 'Forest',
    backgroundColor: 'bg-gradient-to-br from-green-100 to-emerald-100',
    textColor: 'text-gray-800',
    boxBg: 'bg-white',
    boxShadow: 'shadow-md shadow-green-900/10 hover:shadow-lg hover:shadow-green-900/20',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
    buttonText: 'text-white',
  },
  midnight: {
    name: 'Midnight',
    backgroundColor: 'bg-gradient-to-br from-indigo-900 to-purple-900',
    textColor: 'text-gray-100',
    boxBg: 'bg-indigo-800',
    boxShadow: 'shadow-md shadow-indigo-900/50 hover:shadow-lg hover:shadow-indigo-900/60',
    buttonBg: 'bg-purple-500 hover:bg-purple-600',
    buttonText: 'text-white',
  },
};

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [systemTheme, setSystemTheme] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(themes[theme].className);
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    setSystemTheme(false);
  };

  const useSystemTheme = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
    setSystemTheme(true);
    localStorage.removeItem('theme');
  };

  const value = {
    theme,
    themes,
    changeTheme,
    useSystemTheme,
    isSystemTheme: systemTheme,
    currentTheme: themes[theme] || themes.light,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={`min-h-screen ${themes[theme]?.backgroundColor || 'bg-white'} ${themes[theme]?.textColor || 'text-gray-800'}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
