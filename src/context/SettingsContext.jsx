import { createContext, useContext, useState } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [unitFormat, setUnitFormat] = useState('AUTO'); // Changed default to AUTO
  const [showScreener, setShowScreener] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [period, setPeriod] = useState('YEARLY');

  const value = {
    unitFormat,
    setUnitFormat,
    showScreener,
    setShowScreener,
    searchValue,
    setSearchValue,
    period,
    setPeriod,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 