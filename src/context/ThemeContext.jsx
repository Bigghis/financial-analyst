import { createContext, useContext, useState, useEffect } from 'react';

const THEME_KEY = 'isDarkMode';

// Helper functions for localStorage
const getStoredTheme = () => {
  const storedTheme = localStorage.getItem(THEME_KEY);
  return storedTheme ? JSON.parse(storedTheme) : true; // default to dark mode
};

const setStoredTheme = (isDark) => {
  localStorage.setItem(THEME_KEY, JSON.stringify(isDark));
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize state with stored value
  const [isDarkMode, setIsDarkMode] = useState(getStoredTheme());

  // Update localStorage when theme changes
  useEffect(() => {
    setStoredTheme(isDarkMode);
    // Update document classes
    document.documentElement.classList.toggle('dark-theme', isDarkMode);
    document.documentElement.classList.toggle('light-theme', !isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext); 