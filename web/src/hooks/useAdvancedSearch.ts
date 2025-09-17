import { useState, useEffect, useMemo, useCallback } from 'react';
import { searchService } from '../services/searchService';
import { shardedDataService } from '../services/shardedDataService';
import { debounce } from '../utils/debounce';

interface UseAdvancedSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  maxResults?: number;
}

interface SearchResult {
  slug: string;
  name: string;
  issuer: string;
  domain: string;
  level: string;
  score?: number;
  highlightedName?: string;
}

export const useAdvancedSearch = (
  query: string,
  options: UseAdvancedSearchOptions = {}
) => {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    maxResults = 20
  } = options;

  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchAvailable, setIsSearchAvailable] = useState(false);

  // Check if search service is available
  useEffect(() => {
    const checkAvailability = () => {
      setIsSearchAvailable(searchService.isAvailable());
    };

    // Check immediately
    checkAvailability();

    // Check periodically until available
    const interval = setInterval(() => {
      if (searchService.isAvailable()) {
        setIsSearchAvailable(true);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim() || searchQuery.length < minQueryLength) {
        setResults([]);
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      if (!searchService.isAvailable()) {
        setIsLoading(false);
        return;
      }

      try {
        // Perform the search
        const searchResults = searchService.search(searchQuery, maxResults);
        
        if (searchResults.length === 0) {
          setResults([]);
          setIsLoading(false);
          return;
        }

        // Get the slugs from search results
        const slugs = searchResults.map(result => result.item.slug);

        // Fetch full certification data for the matched slugs
        const certifications = [];
        for (const slug of slugs) {
          try {
            const cert = await shardedDataService.getCertificationBySlug(slug);
            if (cert) {
              certifications.push(cert);
            }
          } catch (error) {
            console.warn(`Failed to load certification ${slug}:`, error);
          }
        }

        // Combine search results with certification data
        const combinedResults: SearchResult[] = certifications.map((cert, _index) => {
          const searchResult = searchResults.find(r => r.item.slug === cert.slug);
          
          return {
            slug: cert.slug,
            name: cert.name,
            issuer: cert.issuer,
            domain: cert.domain,
            level: cert.level,
            score: searchResult?.score,
            highlightedName: searchResult?.matches 
              ? searchService.highlightMatches(cert.name, searchResult.matches)
              : cert.name
          };
        });

        // Sort by search score
        combinedResults.sort((a, b) => (a.score || 1) - (b.score || 1));

        setResults(combinedResults);

        // Get suggestions for autocomplete
        const searchSuggestions = searchService.getSuggestions(searchQuery, 5);
        setSuggestions(searchSuggestions);

      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs),
    [minQueryLength, maxResults, debounceMs]
  );

  // Trigger search when query changes
  useEffect(() => {
    if (query) {
      setIsLoading(true);
      performSearch(query);
    } else {
      setResults([]);
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [query, performSearch]);

  // Stats and utilities
  const stats = useMemo(() => searchService.getStats(), [isSearchAvailable]);

  const clearResults = useCallback(() => {
    setResults([]);
    setSuggestions([]);
  }, []);

  return {
    results,
    suggestions,
    isLoading,
    isSearchAvailable,
    stats,
    clearResults,
    highlightMatches: searchService.highlightMatches.bind(searchService)
  };
};