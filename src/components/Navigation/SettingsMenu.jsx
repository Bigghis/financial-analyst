import { useTheme } from '../../context/ThemeContext';
import { LogoutButton } from '../UI/LogoutButton';
import { useSettings } from '../../context/SettingsContext';
// import '../../styles/components/SettingsMenu.css';

export function SettingsMenu({ isOpen, onClose }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { unitFormat, setUnitFormat } = useSettings('AUTO');
  const { period, setPeriod } = useSettings('YEARLY');
  if (!isOpen) return null;

  return (
    <div className="settings-menu-overlay" onClick={onClose}>
      <div 
        className={`settings-menu ${isDarkMode ? 'dark-theme' : 'light-theme'}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="menu-item">
          <span>Account Settings</span>
          <span className="menu-icon">👤</span>
        </div>
        <div className="menu-item">
          <span>Units</span>
          <div className="format-buttons">
            {['K', 'M', 'B', 'AUTO'].map((format) => (
              <button
                key={format}
                className={`button ${unitFormat === format ? 'active' : ''}`}
                onClick={() => setUnitFormat(format)}
              >
                {format}
              </button>
            ))}
          </div>
        </div>
        <div className="menu-item">
          <span>Period</span>
          <div className="format-buttons">
            {['YEARLY', 'QUARTERLY'].map((format) => (
              <button
                key={format}
                className={`button ${period === format ? 'active' : ''}`}
                onClick={() => setPeriod(format)}
              >
                {format}
              </button>
            ))}
          </div>
        </div>
        
        <div className="menu-item">
          <span>Subscription and Billing</span>
        </div>
        
        <div className="menu-item">
          <span>Help Desk & Support</span>
          <span className="menu-icon">❔</span>
        </div>
        
        <div className="menu-item">
          <span>Rewatch Product Tour</span>
          <span className="menu-icon">▶️</span>
        </div>
        
        <div className="menu-divider"></div>
        
        <div className="menu-item">
          <span>Language: EN</span>
        </div>
        
        <div className="menu-item">
          <span>Business Owner Mode</span>
          <label className="toggle-switch">
            <input type="checkbox" />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="menu-item">
          <span>Dark Mode</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={isDarkMode}
              onChange={toggleTheme}
              onClick={e => e.stopPropagation()}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="menu-divider"></div>
        
        <div className="menu-item">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
} 