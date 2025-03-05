import { getValue } from './util';

export function getGrossProfit(data) {
    const totalRevenue = getValue(data, "Total Revenue");
    const costOfRevenue = getValue(data, "Cost Of Revenue");
    return totalRevenue - costOfRevenue;
}
/*
export function getEbit(data) {
    const grossProfit = getGrossProfit(data);
    const operatingExpense = getValue(data, "Operating Expense");
    const otherIncomeExpense = getValue(data, "Other Income Expense");
    const otherNonOperatingIncomeExpenses = getValue(data, "Other Non Operating Income Expenses");
    const ebit = grossProfit - operatingExpense - otherIncomeExpense - otherNonOperatingIncomeExpenses;
    return ebit;
}
*/

export function getEbt(data) {
    const ebit = getValue(data, "EBIT");
    const interestExpense = getValue(data, "Interest Expense");
    const ebt = ebit - interestExpense;
    return ebt;
}

export function getEbitda(data) {
    const ebit = getValue(data, "EBIT");
    const depreciation = getValue(data, "Reconciled Depreciation");
    const ebitda = ebit + depreciation;
    return ebitda;
}

export function getGrossMargin(data) {
    const grossProfit = getGrossProfit(data);
    const totalRevenue = getValue(data, "Total Revenue");
    const grossMargin = grossProfit / totalRevenue;
    return grossMargin * 100;
}

export function getNetIncome(data) {
    const ebitda = getEbitda(data);
    const taxProvision = getValue(data, "Tax Provision");
    const netIncome = ebitda - taxProvision;
    return netIncome;
}

export function getEbitdaMargin(data) {
    const ebitda = getEbitda(data);
    const totalRevenue = getValue(data, "Total Revenue");
    const ebitdaMargin = ebitda / totalRevenue;
    return ebitdaMargin * 100;
}

export function getOperatingExpenses(data) {
    const sellingGeneralAndAdministration = getValue(data, "Selling General And Administration");
    const sellingAndMarketingExpense = getValue(data, "Selling And Marketing Expense");
    const interestExpense = getValue(data, "Interest Expense");
    const operatingExpenses = sellingGeneralAndAdministration + sellingAndMarketingExpense + interestExpense;
    return operatingExpenses;
}

export function getOperatingMargin(data) {
    const operatingIncome = getValue(data, "Operating Income");
    const totalRevenue = getValue(data, "Total Revenue");
    const operatingMargin = operatingIncome / totalRevenue;
    return operatingMargin * 100;
}

export function getEffectiveTaxRate(data) {
    const taxProvision = Math.abs(getValue(data, "Tax Provision"));
    const ebt = Math.abs(getEbt(data));
    const effectiveTaxRate = taxProvision / ebt;
    return effectiveTaxRate * 100;
}

export function verticalCommonAnalysisLogic(data, pivot, excludeData) {
    // Find the pivot row (Total Revenue)
    const pivotRow = data.find(row => row.metric === pivot);
    if (!pivotRow) return [];

    // Transform the data, keeping separators
    return data.map(row => {
        // If it's a separator row, return it as-is
        if (excludeData.includes(row.metric)) {
            return { ...row };
        }

        // Create a new object with the same metric and label
        const result = {
            metric: row.metric,
            label: row.label
        };

        // Calculate percentage for each year
        Object.keys(row).forEach(key => {
            // Only process year columns (dates)
            if (key.includes('-')) {
                const percentage = (row[key] / pivotRow[key]) * 100;
                result[key] = percentage;
            }
        });

        return result;
    });
}