import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import SearchBar from '../components/SearchBar';
import CertificationCard from '../components/CertificationCard';
import { dataService } from '../services/dataService';
import type { Certification, SearchFilters, Domain, Issuer } from '../types';

const CertificationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0
  });
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'cost' | 'popularity'>('popularity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const currentFilters: SearchFilters = {
    query: searchParams.get('query') || undefined,
    domain: searchParams.get('domain') || undefined,
    issuer: searchParams.get('issuer') || undefined,
    level: searchParams.get('level') || undefined,
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
    maxCost: searchParams.get('maxCost') ? Number(searchParams.get('maxCost')) : undefined,
  };

  useEffect(() => {
    fetchCertifications();
    fetchFilters();
  }, [searchParams, sortBy, sortOrder]);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const response = await dataService.getCertifications(
        currentFilters,
        pagination.page,
        pagination.pageSize
      );
      
      setCertifications(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [domainsData, issuersData] = await Promise.all([
        dataService.getDomains(),
        dataService.getIssuers()
      ]);
      setDomains(domainsData);
      setIssuers(issuersData);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleSearch = (query: string, filters: SearchFilters) => {
    const params = new URLSearchParams();
    
    if (query) params.set('query', query);
    if (filters.domain) params.set('domain', filters.domain);
    if (filters.issuer) params.set('issuer', filters.issuer);
    if (filters.level) params.set('level', filters.level);
    if (filters.minRating) params.set('minRating', filters.minRating.toString());
    if (filters.maxCost) params.set('maxCost', filters.maxCost.toString());
    
    setSearchParams(params);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClear = () => {
    setSearchParams({});
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === pagination.page ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="w-10"
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          Previous
        </Button>
        {pages}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Certifications
          </h1>
          <SearchBar
            onSearch={handleSearch}
            onClear={handleClear}
            loading={loading}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-gray-600"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <Button variant="outline" className="w-full text-sm text-gray-600">
                  Clear All
                </Button>

                {/* Domain Filter */}
                <div>
                  <h4 className="font-medium mb-3 text-gray-900">Domain</h4>
                  <div className="space-y-2">
                    {domains.map((domain) => (
                      <label key={domain.id} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="domain"
                          checked={currentFilters.domain === domain.slug}
                          onChange={(e) => {
                            const newFilters = { ...currentFilters };
                            if (e.target.checked) {
                              newFilters.domain = domain.slug;
                            } else {
                              delete newFilters.domain;
                            }
                            handleSearch(currentFilters.query || '', newFilters);
                          }}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{domain.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Level Filter */}
                <div>
                  <h4 className="font-medium mb-3 text-gray-900">Level</h4>
                  <div className="space-y-2">
                    {['Foundational', 'Associate', 'Professional', 'Specialty', 'Expert'].map((level) => (
                      <label key={level} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="level"
                          checked={currentFilters.level === level.toLowerCase()}
                          onChange={(e) => {
                            const newFilters = { ...currentFilters };
                            if (e.target.checked) {
                              newFilters.level = level.toLowerCase();
                            } else {
                              delete newFilters.level;
                            }
                            handleSearch(currentFilters.query || '', newFilters);
                          }}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Popular Issuers Filter */}
                <div>
                  <h4 className="font-medium mb-3 text-gray-900">Popular Issuers</h4>
                  <div className="space-y-2">
                    {issuers.slice(0, 7).map((issuer) => (
                      <label key={issuer.id} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="issuer"
                          checked={currentFilters.issuer === issuer.slug}
                          onChange={(e) => {
                            const newFilters = { ...currentFilters };
                            if (e.target.checked) {
                              newFilters.issuer = issuer.slug;
                            } else {
                              delete newFilters.issuer;
                            }
                            handleSearch(currentFilters.query || '', newFilters);
                          }}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{issuer.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse Certifications</h1>
            <p className="text-gray-600">
              {loading ? 'Loading...' : `Showing 1 - ${Math.min(20, pagination.total)} of ${pagination.total.toLocaleString()} certifications`}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select 
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as typeof sortBy);
                  setSortOrder(order as typeof sortOrder);
                }}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="popularity-desc">Rank</option>
                <option value="rating-desc">Rating</option>
                <option value="cost-asc">Price</option>
                <option value="name-asc">Name</option>
              </select>
            </div>
          </div>
        </div>

            {/* Results Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : certifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certifications.map((certification) => (
                  <CertificationCard
                    key={certification.id}
                    certification={certification}
                    showRanking={true}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Filter className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No certifications found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button onClick={handleClear}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && renderPagination()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationsPage;
