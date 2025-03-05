import { createContext, useContext, useState } from 'react';
import { API_CONFIG } from '../config/api.config';
import { useAuth } from './AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AssetContext = createContext();

const initialAssetState = {
  ticker: '',
  name: '',
  exchange: '',
  historicalData: [],
  companyOfficers: [],
  //competitors: [],
};

const ONE_DAY =        24 * 60 * 60 * 1000; // 1 day
const ONE_MONTH = 30 * 24 * 60 * 60 * 1000; // 30 days 

export function AssetProvider({ children }) {
  const [assetData, setAssetData] = useState(initialAssetState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getAccessToken, isAuthenticated } = useAuth();
  const storage = useLocalStorage('asset_');

  const fetchAssetInfo = async (searchValue) => {
    if (!searchValue?.trim() || searchValue.length < 1) {
      setError('Please enter at least 1 char');
      return;
    }

    if (!isAuthenticated()) {
      setError('Please login to search for assets');
      return;
    }
    clearAssetState();
    setLoadingState(true);
    setError(null);

    try {
      const sanitizedSearch = searchValue.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const token = getAccessToken();
      
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FINANCIALS_INFO}?symbol=${sanitizedSearch}`, 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch asset information');
      }

      const data = await response.json();
      // Cache the response with 1 month expiry
      //storage.set(sanitizedSearch, data, ONE_MONTH);
      updateAssetData(data);
    } catch (error) {
      console.error('Error fetching asset info:', error);
      setError(error.message || 'Failed to fetch asset information');
      updateAssetData({
        ticker: '',
        name: '',
        exchange: '',
        historicalData: [],
        competitors: [],
      });
    } finally {
      setLoadingState(false);
    }
  };

  const fetchAssetPrices = async (period, symbol=assetData.symbol) => {
    if(!assetData.symbol) {
      setError('Ticker doesn\'t exists');
      return;
    }

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      } 

      const cacheKey = `prices_${symbol}_${period}`;
      const cachedData = storage.get(cacheKey);
      if (cachedData) {
        updatePrices(cachedData);
        return;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRICES_HISTORICAL}?symbol=${symbol}&period=${period}`, 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch asset prices');
      }

      const data = await response.json();
      // Cache the prices data with 1 day expiry
      storage.set(cacheKey, data, ONE_DAY);
      updatePrices(data);

    } catch(error) {
      console.error('Error fetching asset prices:', error);
      setError(error.message || 'Failed to fetch asset prices');
    }
  };

  const fetchAssetCompetitors = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('No access token available');
      }

      // Check cache first using industryKey as the cache key
      const cacheKey = `competitors_${assetData.industryKey}`;
      const cachedData = storage.get(cacheKey);
      if (cachedData) {
        updateCompetitors(cachedData);
        return;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INDUSTRIES_TOP_COMPANIES}?key=${assetData.industryKey}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch competitors');
      }

      const data = await response.json();
      // Cache the competitors data with 1 month expiry
      storage.set(cacheKey, data, ONE_MONTH);
      updateCompetitors(data);

    } catch(error) {
      console.error('Error fetching asset competitors:', error);
      setError(error.message || 'Failed to fetch asset competitors');
    }
  }

  const updateAssetData = (newData) => {
    setError(null);
    setAssetData(prevData => ({
      ...prevData,
      //competitors: [],
      ...newData
    }));
  };

  const updatePrices = (newData) => {
    setError(null);
    setAssetData({ ...assetData, historicalData: newData?.data || {} });
  };

  const updateCompetitors = (newData) => {
    setError(null);
    setAssetData({ ...assetData, competitors: newData || [] });
  };

  const setLoadingState = (loading) => {
    setIsLoading(loading);
  };

  const setErrorState = (errorMessage) => {
    setError(errorMessage);
  };

  const clearAssetState = () => {
    setAssetData(initialAssetState);
    setIsLoading(false);
    setError(null);
    // storage.clear();
  };

  const fetchDividends = async (symbols) => {
    try {
        setIsLoading(true);
        setError(null);

        // Check cache first for all symbols
        const cachedDividends = {};
        const symbolsToFetch = [];

        symbols.forEach(symbol => {
            const cacheKey = `dividends_${symbol}`;
            const cachedData = storage.get(cacheKey);
            if (cachedData) {
                cachedDividends[symbol] = cachedData;
            } else {
                symbolsToFetch.push(symbol);
            }
        });

        // If we have all data in cache, use it and return
        if (symbolsToFetch.length === 0) {
            setAssetData(prev => ({
                ...prev,
                dividends: cachedDividends
            }));
            return;
        }

        const token = getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        const promises = symbolsToFetch.map(async (symbol) => {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FINANCIALS_DIVIDENDS}?symbol=${symbol}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) throw new Error('Failed to fetch dividends');
            return response.json();
        });

        const results = await Promise.all(promises);

        const hasErrors = results.some(result => result.error);
        if (hasErrors) {
            throw new Error('Some dividends failed to load');
        }

        // Combine fresh data with cached data and cache new results
        symbolsToFetch.forEach((symbol, index) => {
            const cacheKey = `dividends_${symbol}`;
            storage.set(cacheKey, results[index], ONE_MONTH);
            cachedDividends[symbol] = results[index];
        });

        setAssetData(prev => ({
            ...prev,
            dividends: cachedDividends
        }));
    } catch (error) {
        console.error('Error fetching dividends:', error);
        setError(error.message || 'Failed to fetch dividends');
        setAssetData(prev => ({
            ...prev,
            dividends: {}
        }));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <AssetContext.Provider 
      value={{ 
        assetData, 
        updateAssetData, 
        isLoading, 
        setLoadingState,
        error,
        setError,
        fetchAssetInfo,
        fetchAssetPrices,
        fetchAssetCompetitors,
        clearAssetState,
        fetchDividends
      }}
    >
      {children}
    </AssetContext.Provider>
  );
}

export const useAsset = () => useContext(AssetContext); 