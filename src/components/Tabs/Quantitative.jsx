import { useEffect, useState } from 'react';
import { TabMenu } from '../TabMenu/TabMenu';
import { IncomeStatementTable } from '../Tables/IncomeStatement';
import { BalanceSheetTable } from '../Tables/BalanceSheet';
import { CashFlowTable } from '../Tables/CashFlow';
import { CompetitorsTable } from '../Tables/Competitors';
import { MultiplesTable } from '../Tables/Multiples';
import { DCF } from './sub/DCF';
import { Dividends } from './sub/Dividends';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAsset } from '../../context/AssetContext';
import { useSettings } from '../../context/SettingsContext';
import { API_CONFIG } from '../../config/api.config';

export function QuantitativeTab() {
  const [tab, setTab] = useState('income');
  const [financialData, setFinancialData] = useState({
    income: [],
    balance: [],
    cashflow: [],
    dividends: [],
    competitors: []
  });
  const isLoading = undefined;
  // const [isLoading, setIsLoading] = useState({
  //   income: false,
  //   balance: false,
  //   cashflow: false,
  //   dividends: false,
  //   competitors: false,
  //   multiples: false
  // });
  
  const { fetchAssetPrices, assetData, fetchAssetCompetitors } = useAsset();
  const { period } = useSettings();
  const storage = useLocalStorage(`asset_${period.charAt(0).toLowerCase()}_`);

  const fetchData = async (endpoint, type, key="symbol", value=assetData.symbol) => {
    if (!assetData.symbol) return;
    // If data already exists in state, don't fetch again
    if (financialData[type] && financialData[type].length > 0) return;
    
    // Check cache first
    const cacheKey = `${type}_${value}`;
    const cachedData = storage.get(cacheKey);
    if (cachedData) {
      setFinancialData(prev => ({
        ...prev,
        [type]: cachedData
      }));
      return;
    }

   // setIsLoading(prev => ({ ...prev, [type]: true }));
    try {
      let url = `${API_CONFIG.BASE_URL}${endpoint}?${key}=${value}`;
      if (period === 'QUARTERLY') {
        url = `${url}&quarterly=true`;
      }
      const response = await fetch(url);
      const data = await response.json();
      // Cache the response
      storage.set(cacheKey, data);
      setFinancialData(prev => ({
        ...prev,
        [type]: data
      }));
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
    } finally {
      //setIsLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const fetchTabData = (tabId) => {
    switch (tabId) {
      case 'dcf':
      case 'income':
        fetchData(API_CONFIG.ENDPOINTS.FINANCIALS_INCOME_STATEMENT, 'income');
        break;
      case 'balance':
        fetchData(API_CONFIG.ENDPOINTS.FINANCIALS_BALANCE_SHEET, 'balance');
        break;
      case 'cashflow':
        fetchData(API_CONFIG.ENDPOINTS.FINANCIALS_CASH_FLOW, 'cashflow');
        break;
      case 'multiples':
        fetchAssetPrices("max");
        fetchData(API_CONFIG.ENDPOINTS.FINANCIALS_INCOME_STATEMENT, 'income');
        fetchData(API_CONFIG.ENDPOINTS.FINANCIALS_BALANCE_SHEET, 'balance');
        break;
      case 'dividends':
        fetchData(API_CONFIG.ENDPOINTS.FINANCIALS_DIVIDENDS, 'dividends');
        break;
      case 'competitors':
        fetchAssetCompetitors();
        break;
    }
  };

  useEffect(() => {
    // Clear existing data when period changes
    setFinancialData({
      income: [],
      balance: [],
      cashflow: [],
      dividends: []
    });
    
    // Fetch data for current tab
    fetchTabData(tab);
  }, [period]);

  const handleTabChange = (tabId) => {
    fetchTabData(tabId);
    setTab(tabId);
  };

  const tabsConfig = [
    {
      id: 'income',
      label: 'Income Statement',
      content: (
        <div>
          {isLoading && isLoading.income ? (
            <div>Loading...</div>
          ) : (
            <IncomeStatementTable data={financialData.income} />
          )}
        </div>
      )
    },
    {
      id: 'balance',
      label: 'Balance Sheet',
      content: (
        <div>
          {isLoading && isLoading.balance ? (
            <div>Loading...</div>
          ) : (
            <BalanceSheetTable data={financialData.balance} />
          )}
        </div>
      )
    },
    {
      id: 'cashflow',
      label: 'Cash Flow',
      content: (
        <div>
          {isLoading && isLoading.cashflow ? (
            <div>Loading...</div>
          ) : (
            <CashFlowTable data={financialData.cashflow} />
          )}
        </div>
      )
    },
    {
      id: 'multiples',
      label: 'Multiples',
      content: (
        <div>
          {isLoading && isLoading.multiples ? (
            <div>Loading...</div>
          ) : (
            <MultiplesTable 
              incomeData={financialData.income}
              balanceData={financialData.balance}
              historicalData={assetData.historicalData}
              // isLoading={isLoading.multiples}
            />
          )}
        </div>
      )
    },
    {
      id: 'dividends',
      label: 'Dividends',
      content: (
        <div>
          {isLoading && isLoading.dividends ? (
            <div>Loading...</div>
          ) : (
            <Dividends data={financialData.dividends} />
          )}
        </div>
      )
    },
    {
      id: 'competitors',
      label: 'Competitors',
      content: (
        <div>
          <CompetitorsTable data={assetData.competitors} />
        </div>
      )
    },
    {
      id: 'dcf',
      label: 'DCF',
      content: <DCF data={assetData.income} />
    }
  ];

  return (
    <div className="tab-content">
      <TabMenu tabs={tabsConfig} onTabChange={handleTabChange} />
    </div>
  );
} 