import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../utils/cn';

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onClear: () => void;
  loading?: boolean;
  className?: string;
}

interface SearchFilters {
  domain?: string;
  issuer?: string;
  level?: string;
  minRating?: number;
  maxCost?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  onClear, 
  loading = false, 
  className 
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const domains = [
    'Cloud Computing',
    'Cybersecurity',
    'Data Science',
    'Software Development',
    'DevOps',
    'AI/ML',
    'Project Management',
    'Networking'
  ];

  const issuers = [
    'AWS',
    'Microsoft',
    'Google',
    'Cisco',
    'CompTIA',
    'ISACA',
    'PMI',
    'Red Hat'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  useEffect(() => {
    const newActiveFilters = Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${key}: ${value}`);
    setActiveFilters(newActiveFilters);
  }, [filters]);

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleClear = () => {
    setQuery('');
    setFilters({});
    onClear();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const removeFilter = (key: keyof SearchFilters) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4" role="search" aria-label="Search certifications">
        <div className="flex-1 relative">
          <label htmlFor="main-search" className="sr-only">
            Search certifications by name, issuer, or domain
          </label>
          <Input
            id="main-search"
            ref={searchRef}
            type="text"
            placeholder="Search certifications..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            leftIcon={<Search className="w-4 h-4" aria-hidden="true" />}
            className="pr-20"
            aria-describedby="search-help"
          />
          <div id="search-help" className="sr-only">
            Search by certification name, issuer, or domain. Press Enter to search.
          </div>
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2" role="group" aria-label="Search controls">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-expanded={showFilters}
            aria-controls="advanced-filters"
            aria-label={showFilters ? "Hide advanced filters" : "Show advanced filters"}
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
            <span>Filters</span>
            <ChevronDown className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')} aria-hidden="true" />
          </Button>
          
          <Button 
            onClick={handleSearch} 
            loading={loading} 
            disabled={!query.trim()}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Search certifications"
          >
            Search
          </Button>
          
          {(query || activeFilters.length > 0) && (
            <Button 
              variant="outline" 
              onClick={handleClear}
              className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Clear all search criteria"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Active filters">
          <span className="sr-only">Active filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="flex items-center space-x-1">
              <span>{filter}</span>
              <button
                onClick={() => {
                  const key = filter.split(':')[0] as keyof SearchFilters;
                  removeFilter(key);
                }}
                className="ml-1 hover:text-destructive focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                aria-label={`Remove ${filter} filter`}
              >
                <X className="w-3 h-3" aria-hidden="true" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div 
          id="advanced-filters" 
          className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4"
          role="group"
          aria-label="Advanced search filters"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Domain Filter */}
            <div>
              <label htmlFor="domain-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Domain
              </label>
              <select
                id="domain-filter"
                value={filters.domain || ''}
                onChange={(e) => updateFilter('domain', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-describedby="domain-filter-help"
              >
                <option value="">All Domains</option>
                {domains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
              <div id="domain-filter-help" className="sr-only">
                Filter certifications by technology domain
              </div>
            </div>

            {/* Issuer Filter */}
            <div>
              <label htmlFor="issuer-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Issuer
              </label>
              <select
                id="issuer-filter"
                value={filters.issuer || ''}
                onChange={(e) => updateFilter('issuer', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-describedby="issuer-filter-help"
              >
                <option value="">All Issuers</option>
                {issuers.map((issuer) => (
                  <option key={issuer} value={issuer}>
                    {issuer}
                  </option>
                ))}
              </select>
              <div id="issuer-filter-help" className="sr-only">
                Filter certifications by certification provider
              </div>
            </div>

            {/* Level Filter */}
            <div>
              <label htmlFor="level-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                id="level-filter"
                value={filters.level || ''}
                onChange={(e) => updateFilter('level', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-describedby="level-filter-help"
              >
                <option value="">All Levels</option>
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <div id="level-filter-help" className="sr-only">
                Filter certifications by difficulty level
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label htmlFor="rating-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Min Rating
              </label>
              <select
                id="rating-filter"
                value={filters.minRating || ''}
                onChange={(e) => updateFilter('minRating', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-describedby="rating-filter-help"
              >
                <option value="">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
              <div id="rating-filter-help" className="sr-only">
                Filter certifications by minimum rating
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
