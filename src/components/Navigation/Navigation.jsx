import { useEffect, useState } from 'react';
import { FaCog, FaSearch } from 'react-icons/fa';
import { Link } from '@tanstack/react-router';
import { useTheme } from '../../context/ThemeContext';
import { useAsset } from '../../context/AssetContext';
import { useSettings } from '../../context/SettingsContext';
import { SettingsMenu } from './SettingsMenu';

export function Navigation() {
  const { isDarkMode } = useTheme();
  const { fetchAssetInfo, isLoading, error } = useAsset();
  const { setShowScreener, searchValue, setSearchValue } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const handleSearch = () => {
    fetchAssetInfo(searchValue);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
      <nav className={`navigation ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>      
        <div className="nav-left">
          <Link to="/" className="logo">
            <span className="logo-icon">💰</span>
            <span className="logo-text">Financial Analyst</span>
          </Link>
          <div className="nav-buttons">
            <button 
              className={`nav-button ${!showSearch ? 'active' : ''}`}
              onClick={() => {
                setShowScreener(true);
                setShowSearch(false);
              }}
            >
              Screener
            </button>
            <button 
              className={`nav-button ${showSearch ? 'active' : ''}`}
              onClick={() => {
                setShowScreener(false);
                setShowSearch(true);
              }}
            >
              Search
            </button>
          </div>
        </div>
        
        <div className="nav-center">
          {showSearch && (
            <div className="search-container">
              <input 
                type="search" 
                placeholder="Search Tickers..." 
                className="search-input"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <button 
                className="search-button"
                onClick={handleSearch}
                aria-label="Search"
                disabled={isLoading}
              >
                <FaSearch />
              </button>
              {error && <div className="search-error">{error}</div>}
            </div>
          )}
        </div>
        
        <div className="nav-right">
          <button 
            className="settings-button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <span className="settings-icon"><FaCog /></span>
          </button>
          <SettingsMenu 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
          />
        </div>
      </nav>
  );
} 