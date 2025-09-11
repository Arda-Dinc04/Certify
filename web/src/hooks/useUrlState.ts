import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UrlStateOptions {
  replace?: boolean; // Use replace instead of push for navigation
  debounce?: number; // Debounce URL updates
}

interface UseUrlStateReturn<T> {
  state: T;
  setState: (newState: Partial<T>) => void;
  resetState: () => void;
  getShareableUrl: () => string;
}

function parseUrlParams(search: string): Record<string, any> {
  const params = new URLSearchParams(search);
  const result: Record<string, any> = {};
  
  for (const [key, value] of params.entries()) {
    // Parse different types
    if (value === 'true') {
      result[key] = true;
    } else if (value === 'false') {
      result[key] = false;
    } else if (!isNaN(Number(value)) && value !== '') {
      result[key] = Number(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

function buildUrlParams(state: Record<string, any>, defaultState: Record<string, any>): URLSearchParams {
  const params = new URLSearchParams();
  
  for (const [key, value] of Object.entries(state)) {
    // Only include non-default values
    if (value !== undefined && value !== null && value !== defaultState[key]) {
      if (typeof value === 'boolean') {
        params.set(key, value.toString());
      } else if (typeof value === 'number') {
        params.set(key, value.toString());
      } else if (typeof value === 'string' && value.trim() !== '') {
        params.set(key, value);
      } else if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(','));
      }
    }
  }
  
  return params;
}

export function useUrlState<T extends Record<string, any>>(
  defaultState: T,
  options: UrlStateOptions = {}
): UseUrlStateReturn<T> {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { replace = false, debounce = 300 } = options;
  
  // Initialize state from URL or defaults
  const [state, setStateInternal] = useState<T>(() => {
    const urlParams = parseUrlParams(location.search);
    return { ...defaultState, ...urlParams };
  });
  
  // Debounced navigation update
  const [navigationTimeout, setNavigationTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const updateUrl = useCallback((newState: T) => {
    if (navigationTimeout) {
      clearTimeout(navigationTimeout);
    }
    
    const timeout = setTimeout(() => {
      const params = buildUrlParams(newState, defaultState);
      const newSearch = params.toString();
      const newPath = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
      
      if (newPath !== `${location.pathname}${location.search}`) {
        navigate(newPath, { replace });
      }
    }, debounce);
    
    setNavigationTimeout(timeout);
  }, [navigate, location.pathname, location.search, replace, debounce, defaultState, navigationTimeout]);
  
  // Update state and URL
  const setState = useCallback((newState: Partial<T>) => {
    const updatedState = { ...state, ...newState };
    setStateInternal(updatedState);
    updateUrl(updatedState);
  }, [state, updateUrl]);
  
  // Reset to default state
  const resetState = useCallback(() => {
    setStateInternal(defaultState);
    navigate(location.pathname, { replace: true });
  }, [defaultState, navigate, location.pathname]);
  
  // Get shareable URL
  const getShareableUrl = useCallback(() => {
    const params = buildUrlParams(state, defaultState);
    const search = params.toString();
    const baseUrl = `${window.location.origin}${location.pathname}`;
    return search ? `${baseUrl}?${search}` : baseUrl;
  }, [state, defaultState, location.pathname]);
  
  // Update state when URL changes (e.g., back/forward navigation)
  useEffect(() => {
    const urlParams = parseUrlParams(location.search);
    const newState = { ...defaultState, ...urlParams };
    
    // Only update if different to avoid loops
    if (JSON.stringify(newState) !== JSON.stringify(state)) {
      setStateInternal(newState);
    }
  }, [location.search]); // Don't include state and defaultState to avoid loops
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeout) {
        clearTimeout(navigationTimeout);
      }
    };
  }, [navigationTimeout]);
  
  return {
    state,
    setState,
    resetState,
    getShareableUrl
  };
}

// Specialized hook for certification filters
export interface CertificationFilters {
  query: string;
  domain: string;
  issuer: string;
  level: string;
  minRating: number;
  maxCost: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export const defaultCertificationFilters: CertificationFilters = {
  query: '',
  domain: '',
  issuer: '',
  level: '',
  minRating: 0,
  maxCost: 10000,
  sortBy: 'ranking',
  sortOrder: 'asc',
  page: 1,
  pageSize: 12
};

export function useCertificationFilters() {
  return useUrlState(defaultCertificationFilters, {
    replace: false,
    debounce: 200
  });
}

// Specialized hook for company filters
export interface CompanyFilters {
  domain: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const defaultCompanyFilters: CompanyFilters = {
  domain: '',
  sortBy: 'postings',
  sortOrder: 'desc'
};

export function useCompanyFilters() {
  return useUrlState(defaultCompanyFilters, {
    replace: false,
    debounce: 200
  });
}

// Specialized hook for rankings filters
export interface RankingsFilters {
  domain: string;
}

export const defaultRankingsFilters: RankingsFilters = {
  domain: 'all'
};

export function useRankingsFilters() {
  return useUrlState(defaultRankingsFilters, {
    replace: false,
    debounce: 100
  });
}

export default useUrlState;