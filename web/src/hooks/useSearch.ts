import { useState, useEffect, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';

interface SearchIndexEntry {
  slug: string;
  t: string; // search text
  name: string;
  issuer: string;
  domain: string;
  level: string;
}

interface SearchResult {
  item: SearchIndexEntry;
  score?: number;
  matches?: any[];
}

interface UseSearchOptions {
  threshold?: number; // 0 = perfect match, 1 = match anything
  limit?: number;
  keys?: string[];
}

interface UseSearchReturn {
  search: (query: string) => SearchResult[];
  isLoading: boolean;
  error: string | null;
  searchIndex: SearchIndexEntry[] | null;
  clearCache: () => void;
}

const DEFAULT_FUSE_OPTIONS: any = {
  keys: [
    { name: 't', weight: 1.0 }, // Primary search text
    { name: 'name', weight: 0.8 },
    { name: 'issuer', weight: 0.6 },
    { name: 'domain', weight: 0.4 },
    { name: 'level', weight: 0.2 }
  ],
  threshold: 0.3, // 0 = perfect match, 1 = match anything
  location: 0,
  distance: 100,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
  shouldSort: true,
  ignoreLocation: true,
  ignoreFieldNorm: false
};

let searchIndexCache: SearchIndexEntry[] | null = null;
let fuseInstance: Fuse<SearchIndexEntry> | null = null;

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchIndex, setSearchIndex] = useState<SearchIndexEntry[] | null>(searchIndexCache);

  const fuseOptions = useMemo(() => ({
    ...DEFAULT_FUSE_OPTIONS,
    threshold: options.threshold ?? DEFAULT_FUSE_OPTIONS.threshold,
    keys: options.keys ? options.keys.map(key => ({ name: key, weight: 1.0 })) : DEFAULT_FUSE_OPTIONS.keys
  }), [options.threshold, options.keys]);

  // Load search index
  useEffect(() => {
    let isCancelled = false;

    async function loadSearchIndex() {
      if (searchIndexCache) {
        setSearchIndex(searchIndexCache);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Try JSONL first (more efficient)
        let response = await fetch('/data/search/index.jsonl', { 
          cache: 'force-cache' 
        });

        let entries: SearchIndexEntry[];

        if (response.ok) {
          // Parse JSONL
          const text = await response.text();
          entries = text
            .split('\n')
            .filter(line => line.trim())
            .map(line => JSON.parse(line));
        } else {
          // Fallback to JSON
          response = await fetch('/data/search/index.json', { 
            cache: 'force-cache' 
          });
          
          if (!response.ok) {
            throw new Error(`Failed to load search index: ${response.status}`);
          }
          
          entries = await response.json();
        }

        if (!isCancelled) {
          searchIndexCache = entries;
          fuseInstance = new Fuse(entries, fuseOptions);
          setSearchIndex(entries);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load search index';
          setError(errorMessage);
          console.error('Search index loading error:', err);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadSearchIndex();

    return () => {
      isCancelled = true;
    };
  }, [fuseOptions]);

  // Update Fuse instance when options change
  useEffect(() => {
    if (searchIndex && (!fuseInstance || JSON.stringify((fuseInstance as any)._options) !== JSON.stringify(fuseOptions))) {
      fuseInstance = new Fuse(searchIndex, fuseOptions);
    }
  }, [searchIndex, fuseOptions]);

  const search = useCallback((query: string): SearchResult[] => {
    if (!query.trim() || !fuseInstance) {
      return [];
    }

    const results = fuseInstance.search(query, { 
      limit: options.limit || 50 
    });

    return results.map(result => ({
      item: result.item,
      score: result.score,
      matches: result.matches ? [...result.matches] : undefined
    }));
  }, [options.limit]);

  const clearCache = useCallback(() => {
    searchIndexCache = null;
    fuseInstance = null;
    setSearchIndex(null);
  }, []);

  return {
    search,
    isLoading,
    error,
    searchIndex,
    clearCache
  };
}

// Utility hook for debounced search
export function useDebouncedSearch(
  query: string, 
  delay: number = 300,
  searchOptions: UseSearchOptions = {}
): UseSearchReturn & { debouncedQuery: string; results: SearchResult[] } {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const searchHook = useSearch(searchOptions);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, delay);

    return () => clearTimeout(timer);
  }, [query, delay]);

  const results = useMemo(() => {
    return searchHook.search(debouncedQuery);
  }, [searchHook.search, debouncedQuery]);

  return {
    ...searchHook,
    debouncedQuery,
    results
  };
}

export default useSearch;