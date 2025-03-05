import { getValue } from './util';

export function getTotalCashAndShortTermInvestments(data) {
    const cashAndEquivalents = getValue(data, "Cash And Cash Equivalents");
    const otherShortTermInvestments = getValue(data, "Other Short Term Investments");
    return cashAndEquivalents + otherShortTermInvestments;
}

export function getTotalReceivables(data) {
    const accountsReceivable = getValue(data, "Accounts Receivable");
    const otherReceivables = getValue(data, "Other Receivables");
    return accountsReceivable + otherReceivables;
}

export function getTotalCapitalLeaseObligations(data) {
    const currentDeferredRevenue = getValue(data, "Capital Lease Obligations");
    const capitalLeaseObligations = getValue(data, "Long Term Debt And Capital Lease Obligation");
    return currentDeferredRevenue // + capitalLeaseObligations;
}

export function getAccruedExpenses(data) {
    const payablePlusAccruedExpenses = getValue(data, "Payables And Accrued Expenses");
    const accountPayable = getValue(data, "Accounts Payable");
    return payablePlusAccruedExpenses - accountPayable;
}