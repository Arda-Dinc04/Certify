import React, { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  loading?: boolean;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  onClear, 
  loading = false, 
  className 
}) => {
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onClear();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Main Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Input
            ref={searchRef}
            type="text"
            placeholder="Search certifications..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            leftIcon={<Search className="w-4 h-4" />}
            className="pr-20"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleSearch} 
            loading={loading} 
            disabled={!query.trim()}
            className="hover:scale-105 transition-transform duration-200"
          >
            Search
          </Button>
          
          {query && (
            <Button 
              variant="outline" 
              onClick={handleClear}
              className="hover:scale-105 transition-transform duration-200"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
