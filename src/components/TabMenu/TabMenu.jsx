import { useState } from 'react';

export function TabMenu({ tabs, onTabChange }) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');

  return (
    <div className="tab-menu">
      <div className="tab-buttons">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              onTabChange && onTabChange(tab.id);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {tabs.map((tab) => (
          activeTab === tab.id && (
            <div key={tab.id} className="tab-pane">
              {tab.content}
            </div>
          )
        ))}
      </div>
    </div>
  );
}
