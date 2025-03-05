import { useState } from 'react';
import { FaChartLine, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useAsset } from '../../context/AssetContext';
import { StockChart } from '../Charts/StockChart';
import { DataSummary } from './DataSummary';

export function HeaderPanel() {
  const { assetData, fetchAssetPrices } = useAsset();
  const [showChart, setShowChart] = useState(false);

  if (!assetData?.shortName) {
    return null;
  }

  return (
    <div className="header-panel">
      <div className="asset-header">
        <div className="asset-primary-info">
          <h1 className="asset-name">
            {assetData.shortName}
            <span className="asset-ticker">({assetData.underlyingSymbol})</span>
            <span className="asset-exchange">{assetData.exchange}</span>
          </h1>
          <div className="">
            <span className="asset-industry">{`${assetData.industry} (${assetData.sector})`}</span>
          </div>
        </div>

        <div className="asset-price-container">
          <div className="asset-price-info">
            <div className="current-price">
                <span className="price">
                  {`${Number(assetData.currentPrice).toLocaleString(navigator.language || 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${assetData.currency}`}
                </span>
            </div>

            {/* {assetData.priceChange && (
              <div className={`price-change ${assetData.priceChange >= 0 ? 'positive' : 'negative'}`}>
                <span className="change-amount">
                  {assetData.priceChange}
                </span>
                <span className="change-percentage">
                  ({(assetData.priceChangePercent || 0).toFixed(2)}%)
                </span>
              </div>
            )} */}
          </div>
          <div className="toggle-chart-container">
            <button 
              className="toggle-chart-button"
              onClick={() => setShowChart(!showChart)}
              title={showChart ? 'Hide Chart' : 'Show Chart'}
            >
              <FaChartLine />
              {showChart ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
        </div>
      </div>

      {showChart && (
        <div className="chart-container">
              <StockChart 
                data={assetData.historicalData} 
                onRangeChange={(range) => {
                  // Handle range change
                  fetchAssetPrices(range);
                  // console.log('Range changed:', range);
                    }}
              />
              <DataSummary />
        </div>
      )}
    </div>
  );
}
