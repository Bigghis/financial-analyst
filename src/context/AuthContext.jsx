import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { API_CONFIG } from '../config/api.config';
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Check if token is valid and not expired
  const checkTokenValidity = useCallback(() => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return false;

      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      return decodedToken.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }, []);

  // Initialize authentication state
  useEffect(() => {
    const isValid = checkTokenValidity();
    console.log('useEffect checkTokenValidity:', isValid);
    setIsAuthenticated(isValid);
    
    if (isValid) {
      startRefreshTimer();
    } else {
      clearTokens();
    }
  }, []);

  const clearTokens = useCallback(() => {
    console.log('Clearing all tokens from localStorage');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenType');
    setIsAuthenticated(false);
    
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [refreshInterval]);

  const startRefreshTimer = useCallback(() => {
    console.log('Starting refresh timer');
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    
    const newInterval = setInterval(async () => {
      try {
        const refresh_token = localStorage.getItem('refreshToken');
        if (!refresh_token) {
          throw new Error('No refresh token available');
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: refresh_token
          })
        });

        if (response.ok) {
          console.log('Token refresh successful setting tokens');
          setIsAuthenticated(true);
          const data = await response.json();
          localStorage.setItem('accessToken', data.access_token);
          localStorage.setItem('refreshToken', data.refresh_token);
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
        clearTokens();
        window.location.href = '/login';
      }
    }, API_CONFIG.TOKEN_REFRESH_INTERVAL);
    
    setRefreshInterval(newInterval);
  }, [refreshInterval, clearTokens]);

  const login = useCallback(async (username, password) => {
    try {
      const formBody = new URLSearchParams({
        username,
        password,
        grant_type: 'password',
        scope: '',
      });

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
       // credentials: 'include',
        body: formBody.toString()
      });

      if (response.ok) {
        console.log('Login successful setting tokens');
        setIsAuthenticated(true);
        const data = await response.json();
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        localStorage.setItem('tokenType', data.token_type);
        startRefreshTimer();
        return { success: true };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.detail || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'An error occurred during login' 
      };
    }
  }, [startRefreshTimer]);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        console.log('Sending logout request to server');
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          console.error('Logout request failed:', response.status);
        }
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      clearTokens();
    }
  }, [clearTokens]);

  // Function to check if user is authenticated
  const checkIsAuthenticated = useCallback(() => {
    const isTokenValid = checkTokenValidity();
    
    if (!isTokenValid) {
      clearTokens();
    //  window.location.href = '/login';
      return false;
    }
    return true;
    // return isAuthenticated;
  }, [checkTokenValidity, clearTokens]);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: checkIsAuthenticated,
      login, 
      logout,
      getAccessToken: () => localStorage.getItem('accessToken')
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 