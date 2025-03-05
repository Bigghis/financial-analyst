import { getValue } from './util';
import { getEffectiveTaxRate } from './income';


const getLastPrice = (historicalData, date) => {
    if (!historicalData || !Array.isArray(historicalData) || !date) return 0;
    
    // Find price data where the date matches (ignoring time portion)
    let priceData = historicalData.find(item => 
        item && item.Date && item.Date.split(' ')[0] === date
    );
    
    if (!priceData) {
        const targetDate = new Date(date);
        // Search backwards up to 30 days (arbitrary limit to prevent infinite loop)
        for (let i = 1; i <= 30; i++) {
            const previousDay = new Date(targetDate);
            previousDay.setDate(previousDay.getDate() - i);

            // console.log(previousDay);
            const closestData = historicalData.find(item => 
                item && item.Date && 
                new Date(item.Date.split(' ')[0]).getTime() === previousDay.getTime()
            );
            
            if (closestData) {
                priceData = closestData;
                break;
            }
        }
    }
    
    if (!priceData) return 0;
    
    const lastPrice = Object.entries(priceData).find(([key]) => key.startsWith('Close_'))?.[1] ?? 0;
    return lastPrice;
};


/**
 * Calculate Return on Assets (ROA)
 * ROA = (Net Income / Total Assets) * 100
* @param {Object} incomeData - Financial data object
 * @param {Object} balanceData - Financial data object
 * @returns {number} ROA as a percentage
 */
export const calculateROA = (incomeData, balanceData) => {
    const netIncome = getValue(incomeData, "Net Income");
    const totalAssets = getValue(balanceData, "Total Assets");
    if (totalAssets === 0) return 0;
    return (netIncome / totalAssets) * 100;
};

/**
 * Calculate Return on Equity (ROE)
 * ROE = (Net Income / Shareholders' Equity) * 100
 * @param {Object} incomeData - Financial data object
 * @param {Object} balanceData - Financial data object
 * @returns {number} ROE as a percentage
 */
export const calculateROE = (incomeData, balanceData) => {
    const netIncome = getValue(incomeData, "Net Income");
    const shareholdersEquity = getValue(balanceData, "Stockholders Equity");
    if (shareholdersEquity === 0) return 0;
    return (netIncome / shareholdersEquity) * 100;
};

/** UNUSED FOR NOW
 * Calculate Return on Investment (ROI)
 * ROI = ((Current Value - Initial Investment) / Initial Investment) * 100
 * @param {Object} incomeData - Financial data object
 * @param {Object} balanceData - Financial data object
 * @returns {number} ROI as a percentage
 */
export const calculateROI = (incomeData, balanceData) => {
    const currentValue = getValue(incomeData, "Current Value");
    const initialInvestment = getValue(balanceData, "Initial Investment");
    if (initialInvestment === 0) return 0;
    return ((currentValue - initialInvestment) / initialInvestment) * 100;
};

/**
 * Calculate Return on Invested Capital (ROIC)
 * ROIC = (Net Operating Profit After Taxes / Invested Capital) * 100
 * @param {Object} incomeData - Financial data object
 * @param {Object} balanceData - Financial data object
 * @returns {number} ROIC as a percentage
 */
export const calculateROIC = (incomeData, balanceData) => {
    const ebit = getValue(incomeData, "EBIT");
    const taxRate = getEffectiveTaxRate(incomeData)/100;
    const totalAssets = getValue(balanceData, "Total Assets");
    const currentLiabilities = getValue(balanceData, "Current Liabilities");
    const investedCapital = totalAssets - currentLiabilities;
    const nopat = ebit * (1 - taxRate);
    
    if (investedCapital === 0) return 0;
    return (nopat / investedCapital) * 100;
};

/**
 * Calculate Return on Capital Employed (ROCE)
 * ROCE = (EBIT / Capital Employed) * 100
 * Capital Employed = Total Assets - Current Liabilities
 * @param {Object} incomeData - Financial data object
 * @param {Object} balanceData - Financial data object
 * @returns {number} ROCE as a percentage
 */
export const calculateROCE = (incomeData, balanceData) => {
    const ebit = getValue(incomeData, "EBIT");
    const totalAssets = getValue(balanceData, "Total Assets");
    const currentLiabilities = getValue(balanceData, "Current Liabilities");
    const capitalEmployed = totalAssets - currentLiabilities;
    if (capitalEmployed === 0) return 0;
    return (ebit / capitalEmployed) * 100;
};

export const calculateCurrentRatio = (balanceData) => {
    const currentAssets = getValue(balanceData, "Current Assets");
    const currentLiabilities = getValue(balanceData, "Current Liabilities");
    if (currentLiabilities === 0) return 0;
    return currentAssets / currentLiabilities;
};

export const calculateQuickRatio = (balanceData) => {
    const currentAssets = getValue(balanceData, "Current Assets");
    const inventory = getValue(balanceData, "Inventory");
    const currentLiabilities = getValue(balanceData, "Current Liabilities");
    if (currentLiabilities === 0) return 0;
    return (currentAssets - inventory) / currentLiabilities;
};

// https://www.investopedia.com/terms/d/dso.asp
export const calculateDaysSalesOutstanding = (incomeData, balanceData, quarterly = false) => {
    const revenue = getValue(incomeData, "Total Revenue");
    const accountsReceivable = getValue(balanceData, "Accounts Receivable");
    if (accountsReceivable === 0) return 0;
    return (accountsReceivable / revenue) * (quarterly ? 90 : 365);
};

export const calculateDebtToEquity = (balanceData) => {
    const totalDebt = getValue(balanceData, "Total Debt");
    const shareholdersEquity = getValue(balanceData, "Stockholders Equity");
    if (shareholdersEquity === 0) return 0;
    return (totalDebt / shareholdersEquity) * 100;
};

export const calculateDebtToAsset = (balanceData) => {
    const totalDebt = getValue(balanceData, "Total Debt");
    const totalAssets = getValue(balanceData, "Total Assets");
    if (totalAssets === 0) return 0;
    return (totalDebt / totalAssets) * 100;
};

export const calculateEquityRatio = (balanceData) => {
    const shareholdersEquity = getValue(balanceData, "Stockholders Equity");
    const totalAssets = getValue(balanceData, "Total Assets");
    if (totalAssets === 0) return 0;
    return (shareholdersEquity / totalAssets);
};

export const calculateDaysInventoryOutstanding = (incomeData, balanceData, quarterly = false) => {
    const inventory = getValue(balanceData, "Inventory");
    const costOfGoodsSold = getValue(incomeData, "Cost Of Revenue");
    if (costOfGoodsSold === 0) return 0;
    return (inventory / costOfGoodsSold) * (quarterly ? 90 : 365);
};

export const calculateInventoryTurnoverRatio = (incomeData, balanceData, quarterly = false) => {
    const costOfGoodsSold = getValue(incomeData, "Cost Of Revenue");
    const inventory = getValue(balanceData, "Inventory");
    if (costOfGoodsSold === 0) return 0;
    return (costOfGoodsSold / inventory) // / (quarterly ? 4 : 12);
};

export const calculateAssetTurnoverRatio = (incomeData, balanceData, date) => {
    const totalRevenue = getValue(incomeData[date], "Total Revenue");
    const currentTotalAssets = getValue(balanceData[date], "Total Assets");
    
    const dates = Object.keys(balanceData).sort((a, b) => new Date(a) - new Date(b));
    const currentDateIndex = dates.indexOf(date);
    const previousDate = currentDateIndex > 0 ? dates[currentDateIndex - 1] : null;
    
    // Get previous total assets if available, otherwise use current
    const previousTotalAssets = previousDate 
        ? getValue(balanceData[previousDate], "Total Assets")
        : currentTotalAssets;
    
    const averageTotalAssets = (currentTotalAssets + previousTotalAssets) / 2;
    
    if (averageTotalAssets === 0) return 0;
    return (totalRevenue / averageTotalAssets);
};

export const calculatePE = (incomeData, historicalData, date, quarterly = false) => {
    console.log("calculatePE incomeData ", incomeData);
    console.log("calculatePE historicalData ", historicalData);
    console.log("calculatePE date ", date);
    const lastPrice = getLastPrice(historicalData, date);
    if (lastPrice === 0) return 0;

    if (quarterly) {
        // Get all dates and sort them in descending order
        const dates = Object.keys(incomeData)
            .sort((a, b) => new Date(b) - new Date(a));
        
        // Find the starting index for our date
        const startIndex = dates.findIndex(d => d === date);
        if (startIndex === -1) return 0;

        // Get array of 4 quarters starting from our date
        const quarterDates = dates.slice(startIndex, startIndex + 4);
        
        // Return 0 if we don't have full 4 quarters of data
        if (quarterDates.length < 4) return 0;

        const annualizedEPS = quarterDates.reduce((sum, quarterDate) => {
            return sum + getValue(incomeData[quarterDate], "Diluted EPS");
        }, 0);

        return lastPrice / annualizedEPS;
    }

    const eps = getValue(incomeData[date], "Diluted EPS");
    return lastPrice / eps;
};

export const calculatePB = (incomeData, balanceData, historicalData, date) => {
    const lastPrice = getLastPrice(historicalData, date);
    if (lastPrice === 0) return 0;

    const bookValuePerShare = getValue(balanceData[date], "Book Value Per Share");
    if (bookValuePerShare === 0) return 0;

    return lastPrice / bookValuePerShare;
};