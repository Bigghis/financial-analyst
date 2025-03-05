import { useAsset } from '../../context/AssetContext';
import { DataSummarySection } from './Sub/DataSummarySection';
import { DataSummaryRow } from './Sub/DataSummaryRow';
import { formatNumber, formatPercentage, toLocaleString } from '../../utilities/numbers';
import { useSettings } from '../../context/SettingsContext';
import { MarketCapCategory, generateMarketCapTooltip } from '../UI/MarketCapCategory';

export function DataSummary() {
    const { assetData } = useAsset();
    const { unitFormat } = useSettings();

    // per calcolare il PEG Ratio:
    // 1. prendere il P/E Ratio
    // 2. dividere il P/E Ratio per il Growth Rate    
    // _netIncomeGrowthRate[year] = toPercent(getGrowthRate(_netIncome[year - 1], _netIncome[year]))

    return (
        <div className="data-info-summary">
            <DataSummarySection title="Market Data">
                <DataSummaryRow 
                    label="52 Week High" 
                    value={`${toLocaleString(assetData.fiftyTwoWeekHigh)} ${assetData.currency}`} 
                />
                <DataSummaryRow 
                    label="52 Week Low" 
                    value={`${toLocaleString(assetData.fiftyTwoWeekLow)} ${assetData.currency}`} 
                />
                <DataSummaryRow 
                    label="200 Day Average" 
                    value={`${toLocaleString(assetData.twoHundredDayAverage, 2)} ${assetData.currency}`}
                />
                <DataSummaryRow 
                    label="Beta" 
                    value={`${toLocaleString(assetData.beta, 2)}`}
                    tooltip="A measure of stock volatility relative to the overall market. Beta > 1 indicates higher volatility than the market"
                />
            </DataSummarySection>

            <DataSummarySection title="Capital Structure">
                <DataSummaryRow 
                    label="Market Cap" 
                    value={
                        <div>
                            <MarketCapCategory marketCap={assetData.marketCap} />
                            <span>{` (${formatNumber(assetData.marketCap, unitFormat)} ${assetData.currency})`}</span>
                        </div>
                    }
                    tooltip={generateMarketCapTooltip()}
                />
                <DataSummaryRow 
                    label="Enterprise Value" 
                    value={`${formatNumber(assetData.enterpriseValue, unitFormat)} ${assetData.currency}`} 
                    tooltip="Enterprise value is a measure of a company's total value, often used as a more comprehensive alternative to market capitalization"
                />
                <DataSummaryRow 
                    label="Shares Outstanding" 
                    value={`${formatNumber(assetData.sharesOutstanding, unitFormat)}`} 
                    tooltip="Total number of shares of a company that are currently held by investors"
                />
                <DataSummaryRow 
                    label="Net Debt" 
                    value={`${assetData.netDebt} USD`}
                    tooltip="Total debt minus cash and cash equivalents" 
                />
            </DataSummarySection>

            <DataSummarySection title="Efficiency">
                <DataSummaryRow 
                    label="LTM Gross Margin" 
                    value={`${assetData.grossMargin}%`} 
                />
                <DataSummaryRow 
                    label="LTM EBIT Margin" 
                    value={`${assetData.ebitMargin}%`} 
                />
                <DataSummaryRow 
                    label="LTM ROA" 
                    value={`${formatPercentage(assetData.returnOnAssets, 1)}`}
                    tooltip="Return on Assets (Last Twelve Months)" 
                />
                <DataSummaryRow 
                    label="LTM ROE" 
                    value={`${formatPercentage(assetData.returnOnEquity, 1)}`}
                    tooltip="Return on Equity (Last Twelve Months)" 
                />
                <DataSummaryRow 
                    label="LTM ROIC" 
                    value={`${formatPercentage(assetData.roic, 1)}`}
                    tooltip="Return on Invested Capital (Last Twelve Months)" 
                />
                <DataSummaryRow 
                    label="LTM ROCE" 
                    value={`${formatPercentage(assetData.roce, 1)}`}
                    tooltip="Return on Capital Employed (Last Twelve Months)" 
                />
            </DataSummarySection>
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
            <DataSummarySection title="Growth">
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
            </DataSummarySection>
        </div>
    );
} 
