import { useAsset } from '../../context/AssetContext';
import { OfficersTable } from '../Tables/Officers';
import { useSettings } from '../../context/SettingsContext';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { MarketCapCategory } from '../UI/MarketCapCategory';
import { InfoSummary } from '../Panels/InfoSummary';
import { formatNumber } from '../../utilities/numbers';
export function OverviewTab() {
  const { unitFormat } = useSettings();
  const { assetData } = useAsset();

  return (
    <div className="tab-content">
      <section className="company-overview">
        <div className="overview-header">
          <h2 className="section-title">About the Company</h2>
        </div>
        
        <div className="overview-content">
          <div className="main-description">
            <p>{assetData.longBusinessSummary || 'Choose a Company to view details...'}</p>
          </div>
    
          { assetData.symbol && <div className="company-details">
            <div className="detail-item market-cap-item">
              <span className="detail-label">Market Cap: </span>
              <span><div className="market-cap-info">
                <MarketCapCategory marketCap={assetData.marketCap} />
                {assetData.marketCap ? <span className="market-cap-value">{` (${formatNumber(assetData.marketCap, unitFormat)} ${assetData.currency})` }</span> : <span>N/A</span>} 
              </div></span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Industry: </span>
              <span className="detail-value">{`${assetData.industry || 'N/A'}`}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Full Time Employees: </span>
              <span className="detail-value">{assetData.fullTimeEmployees || 'N/A'}</span>
            </div>

            {assetData.website && (
              <div className="detail-item website-item">
                <a 
                  href={assetData.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="website-link"
                >
                  {assetData.website}
                  <FaExternalLinkAlt className="external-link-icon" />
                </a>
              </div>
            )}
            {assetData.irWebsite && (
              <div className="detail-item website-item">
                <a 
                  href={assetData.irWebsite} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="website-link"
                >
                  {assetData.irWebsite}
                  <FaExternalLinkAlt className="external-link-icon" />
                </a>
              </div>
            )}
            <InfoSummary />
          </div> }
        </div>
        {assetData.symbol && <OfficersTable data={assetData.companyOfficers} unitFormat={unitFormat} />}
      </section>
    </div>
  );
} 