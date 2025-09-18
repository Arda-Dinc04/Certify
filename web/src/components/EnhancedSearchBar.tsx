import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Filter, ChevronDown, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../utils/cn';
import { enhancedDataService } from '../services/enhancedDataService';
import { ALL_DOMAIN_SLUGS, getDomainLabel, getDomainIcon } from '../config/domains';

interface EnhancedSearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onClear: () => void;
  loading?: boolean;
  className?: string;
  showAdvancedFilters?: boolean;
  initialFilters?: Partial<SearchFilters>;
}

interface SearchFilters {
  query?: string;
  domain?: string;
  issuer?: string;
  level?: string;
  minRating?: number;
  maxCost?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

const LEVELS = ['Foundational', 'Associate', 'Professional', 'Expert', 'Specialty'] as const;
const POPULAR_ISSUERS = [
  'Amazon Web Services (AWS)', 'Microsoft', 'Google', 'Oracle', 'Cisco',
  'CompTIA', 'PMI', 'FINRA', 'NREMT', 'NCCER'
];

const SORT_OPTIONS = [
  { value: 'ranking-asc', label: 'Best Ranked' },
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'cost-asc', label: 'Lowest Cost' },
  { value: 'job_postings-desc', label: 'Most In-Demand' },
  { value: 'name-asc', label: 'Name (A-Z)' }
];

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  onSearch,
  onClear,
  loading = false,
  className = '',
  showAdvancedFilters = true,
  initialFilters = {}
}) => {
  const [query, setQuery] = useState(initialFilters.query || '');
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load statistics on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await enhancedDataService.getStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('Failed to load statistics:', error);
      }
    };
    loadStats();
  }, []);

  // Update active filters when filters change
  useEffect(() => {
    const active = Object.entries(filters)
      .filter(([_key, value]) => value !== undefined && value !== '' && value !== 0)
      .map(([key, value]) => {
        switch (key) {
          case 'domain':
            return `Domain: ${getDomainLabel(value as any) || value}`;
          case 'issuer':
            return `Issuer: ${value}`;
          case 'level':
            return `Level: ${value}`;
          case 'minRating':
            return `Rating: ${value}+ stars`;
          case 'maxCost':
            return `Max Cost: $${value}`;
          default:
            return `${key}: ${value}`;
        }
      });
    setActiveFilters(active);
  }, [filters]);

  // Debounced search suggestions
  const debouncedGetSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const results = await enhancedDataService.getSearchSuggestions(searchQuery, 8);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Failed to get suggestions:', error);
        setSuggestions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedGetSuggestions(query);
  }, [query, debouncedGetSuggestions]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    const searchFilters = { ...filters };
    if (query.trim()) {
      searchFilters.query = query.trim();
    }
    onSearch(query.trim(), searchFilters);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setQuery('');
    setFilters({});
    setSuggestions([]);
    setShowSuggestions(false);
    onClear();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setTimeout(() => handleSearch(), 100);
  };

  const updateFilter = (key: keyof SearchFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const removeFilter = (filterKey: string) => {
    const key = filterKey.split(':')[0].toLowerCase().replace(' ', '') as keyof SearchFilters;
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex flex-col sm:flex-row gap-4" role="search" aria-label="Enhanced certification search">
        <div className="flex-1 relative">
          <label htmlFor="enhanced-search" className="sr-only">
            Search certifications by name, issuer, skills, or domain
          </label>
          <Input
            id="enhanced-search"
            ref={searchRef}
            type="text"
            placeholder="Search 1,380+ certifications..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            leftIcon={<Search className="w-4 h-4" aria-hidden="true" />}
            className="pr-20"
          />
          
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
              role="listbox"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 flex items-center gap-2"
                  role="option"
                >
                  <Search className="w-3 h-3 text-gray-400" aria-hidden="true" />
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {showAdvancedFilters && (
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" aria-hidden="true" />
              <span>Filters</span>
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {activeFilters.length}
                </Badge>
              )}
              <ChevronDown className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')} aria-hidden="true" />
            </Button>
          )}

          <Button
            onClick={handleSearch}
            loading={loading}
            disabled={!query.trim() && activeFilters.length === 0}
          >
            Search
          </Button>

          {(query || activeFilters.length > 0) && (
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="flex items-center space-x-1">
              <span>{filter}</span>
              <button
                onClick={() => removeFilter(filter)}
                className="ml-1 hover:text-destructive"
                aria-label={`Remove ${filter} filter`}
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {showAdvancedFilters && showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label htmlFor="domain-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Domain
              </label>
              <select
                id="domain-filter"
                value={filters.domain || ''}
                onChange={(e) => updateFilter('domain', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Domains</option>
                {ALL_DOMAIN_SLUGS.map((domain) => (
                  <option key={domain} value={domain}>
                    {React.createElement(getDomainIcon(domain), { className: "w-4 h-4" })} {getDomainLabel(domain)}
                    {statistics && ` (${statistics.byDomain[domain] || 0})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="issuer-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Issuer
              </label>
              <select
                id="issuer-filter"
                value={filters.issuer || ''}
                onChange={(e) => updateFilter('issuer', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Issuers</option>
                {POPULAR_ISSUERS.map((issuer) => (
                  <option key={issuer} value={issuer}>
                    {issuer}
                    {statistics && statistics.byIssuer[issuer] && ` (${statistics.byIssuer[issuer]})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="level-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                id="level-filter"
                value={filters.level || ''}
                onChange={(e) => updateFilter('level', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Levels</option>
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                    {statistics && statistics.byLevel[level] && ` (${statistics.byLevel[level]})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="rating-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Min Rating
              </label>
              <select
                id="rating-filter"
                value={filters.minRating || ''}
                onChange={(e) => updateFilter('minRating', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>

            <div>
              <label htmlFor="sort-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                id="sort-filter"
                value={`${filters.sortBy || 'ranking'}-${filters.sortOrder || 'asc'}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  updateFilter('sortBy', sortBy);
                  updateFilter('sortOrder', sortOrder as 'asc' | 'desc');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {statistics && (
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" aria-hidden="true" />
                  <span>{statistics.totalCertifications.toLocaleString()} certifications</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>{statistics.averageRating.toFixed(1)} avg rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" aria-hidden="true" />
                  <span>${Math.round(statistics.averageCost)} avg cost</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;