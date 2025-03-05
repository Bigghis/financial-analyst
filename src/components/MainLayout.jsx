import { useState } from 'react';

export function MainLayout() {
  const [selectedTab, setSelectedTab] = useState('overview');

  return (
    <div className="main-layout">
      {/* Header Section */}
      <div className="stock-header">
        <div className="stock-title">
          <h1>Company Name (TICKER)</h1>
          <button className="favorite-button">♡</button>
        </div>
        
        <div className="stock-price-section">
          <div className="current-price">
            <span className="price">38.22 USD</span>
            <span className="price-change negative">-0.57 USD (-1.47%)</span>
          </div>
          <div className="price-date">15 novembre 2024 Close</div>
        </div>

        <div className="controls">
          <button className="currency-toggle">USD</button>
          <button className="show-chart">SHOW PRICE CHART</button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="navigation-tabs">
        <button 
          className={`tab ${selectedTab === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${selectedTab === 'news' ? 'active' : ''}`}
          onClick={() => setSelectedTab('news')}
        >
          News
        </button>
      </div>

      {/* Content Area */}
      <div className="content-area">
        {selectedTab === 'overview' && (
          <div className="overview-content">
            {/* Overview content goes here */}
          </div>
        )}
        {selectedTab === 'news' && (
          <div className="news-content">
            {/* News content goes here */}
          </div>
        )}
      </div>
    </div>
  );
} 