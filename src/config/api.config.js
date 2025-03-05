const environments = {
  development: {
    BASE_URL: 'http://127.0.0.1:8000',
  },
  staging: {
    BASE_URL: 'https://staging-api.yourapp.com',
  },
  production: {
    BASE_URL: 'https://api.yourapp.com',
  }
};

const currentEnv = import.meta.env.VITE_APP_ENV || 'development';

export const API_CONFIG = {
  BASE_URL: environments[currentEnv].BASE_URL,
  ENDPOINTS: {
    LOGIN: '/api/v1/auth/token',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    FINANCIALS_INFO: '/api/v1/financials/info',
    FINANCIALS_INCOME_STATEMENT: '/api/v1/financials/income',
    FINANCIALS_BALANCE_SHEET: '/api/v1/financials/balance',
    FINANCIALS_CASH_FLOW: '/api/v1/financials/cashflow',
    FINANCIALS_DIVIDENDS: '/api/v1/stock/dividends',
    PRICES_HISTORICAL: '/api/v1/prices/historical',
    INDUSTRIES_TOP_COMPANIES: '/api/v1/industry/top_companies',
    SCREENER_EQUITY_FIELDS: '/api/v1/screener/valid_equity_fields',
    SCREENER_VALID_MAPS: '/api/v1/screener/valid_equity_maps',
    RUN_SCREENER: '/api/v1/screener/run',

  },
  TOKEN_REFRESH_INTERVAL: 4 * 60 * 1000 // 4 minutes
};


export const USE_CACHE = false;