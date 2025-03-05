import { USE_CACHE } from "../config/api.config";

const DEFAULT_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours

export function useLocalStorage(prefix = '') {
    const getCacheKey = (key) => `${prefix}${key}`;

    const get = (key) => {
        if (!USE_CACHE) return null;
        try {
            const cacheKey = getCacheKey(key);
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;

            const { data, timestamp, expiryTime = DEFAULT_EXPIRY_TIME } = JSON.parse(cached);
            
            // Check if cache is expired
            if (Date.now() - timestamp > expiryTime) {
                localStorage.removeItem(cacheKey);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error reading from cache:', error);
            return null;
        }
    };

    const set = (key, data, expiryTime = DEFAULT_EXPIRY_TIME) => {
        if (!USE_CACHE) return;
        try {
            const cacheKey = getCacheKey(key);
            const cacheData = {
                data,
                timestamp: Date.now(),
                expiryTime
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error saving to cache:', error);
        }
    };

    const remove = (key) => {
        if (!USE_CACHE) return;
        try {
            const cacheKey = getCacheKey(key);
            localStorage.removeItem(cacheKey);
        } catch (error) {
            console.error('Error removing from cache:', error);
        }
    };

    const clear = (prefixOnly = true) => {
        if (!USE_CACHE) return;
        try {
            if (prefixOnly) {
                // Clear only items with this prefix
                Object.keys(localStorage)
                    .filter(key => key.startsWith(prefix))
                    .forEach(key => localStorage.removeItem(key));
            } else {
                // Clear all localStorage
                localStorage.clear();
            }
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    };

    return { get, set, remove, clear };
} 