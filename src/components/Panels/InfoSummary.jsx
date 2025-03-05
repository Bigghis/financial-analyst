import { useAsset } from '../../context/AssetContext';
import { DataSummarySection } from './Sub/DataSummarySection';
import { DataSummaryRow } from './Sub/DataSummaryRow';
import { toLocaleString } from '../../utilities/numbers';
import { useSettings } from '../../context/SettingsContext';
// import { MarketCapCategory, generateMarketCapTooltip } from '../UI/MarketCapCategory';

export function InfoSummary() {
    const { assetData } = useAsset();
    const { unitFormat } = useSettings();

    // per calcolare il PEG Ratio:
    // 1. prendere il P/E Ratio
    // 2. dividere il P/E Ratio per il Growth Rate    
    // _netIncomeGrowthRate[year] = toPercent(getGrowthRate(_netIncome[year - 1], _netIncome[year]))

    return (
        <div className="data-info-summary">
            <DataSummarySection title="Multiples">
            <DataSummaryRow 
                label="PEG Ratio" 
                // value={`${getPegRatio(assetData.trailingPE, assetData.earningsGrowth)}`}
                value={`${toLocaleString(assetData.trailingPegRatio, 2)}`}
                tooltip="Price/Earnings to Growth Ratio (Trailing)" 
                />
            <DataSummaryRow 
                label="PE Ratio" 
                value={`${assetData.trailingPE}`}
                tooltip="Price/Earnings" 
                />
            </DataSummarySection>
            {/* <DataSummarySection title="Growth">
                <DataSummaryRow 
                    label="Revenue CAGR" 
                    value={`${assetData.revenueCagr}%`} 
                />
                <DataSummaryRow 
                    label="EBITDA CAGR" 
                    value={`${assetData.ebitdaCagr}%`} 
                />
                <DataSummaryRow 
                    label="EPS CAGR" 
                    value={`${assetData.epsCagr}%`}
                    tooltip="Earnings Per Share Compound Annual Growth Rate" 
                />
            </DataSummarySection> */}
        </div>
    );
} 
