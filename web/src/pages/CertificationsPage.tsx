// src/pages/Certifications.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Filter as FilterIcon,
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon,
} from "lucide-react";

import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import CertificationCard from "../components/CertificationCard";
import { ALL_DOMAIN_SLUGS, getDomainLabel, getDomainIcon } from "../config/domains";

import { dataService } from "../services/dataService";
import type { Certification, SearchFilters } from "../types";
import { useCertificationFilters } from "../hooks/useUrlState";

const LEVELS = ["Foundational", "Associate", "Professional", "Specialty", "Expert"] as const;

const CertificationsPage: React.FC = () => {
  const { state: filters, setState: setFilters, resetState: resetFilters } = useCertificationFilters();

  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
  });

  // current filters from URL state
  const currentFilters: SearchFilters = {
    query: filters.query || undefined,
    domain: filters.domain || undefined,
    issuer: filters.issuer || undefined,
    level: filters.level || undefined,
    minRating: filters.minRating > 0 ? filters.minRating : undefined,
    maxCost: filters.maxCost < 10000 ? filters.maxCost : undefined,
  };

  // Fetch data whenever filters change
  useEffect(() => {
    fetchCertifications();
  }, [filters]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [filters.page]);

  const fetchCertifications = async () => {
    try {
      setLoading(true);

      const resp = await dataService.getCertifications(
        currentFilters,
        filters.page,
        filters.pageSize
      );

      const items: Certification[] = resp.data || [];
      
      // Sort on client side
      const sortedItems = [...items].sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (filters.sortBy) {
          case 'name':
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          case 'rating':
            aVal = a.rating;
            bVal = b.rating;
            break;
          case 'cost':
            aVal = a.cost;
            bVal = b.cost;
            break;
          case 'ranking':
          default:
            aVal = a.ranking || 999;
            bVal = b.ranking || 999;
            break;
        }
        
        if (aVal < bVal) return filters.sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      setCertifications(sortedItems);

      if (resp.pagination) {
        setPagination(resp.pagination);
      } else {
        setPagination((p) => ({
          ...p,
          total: items.length,
          totalPages: Math.ceil(items.length / filters.pageSize) || 1,
        }));
      }
    } catch (err) {
      console.error("Error fetching certifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setFilters({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle clear filters
  const handleClear = () => {
    resetFilters();
  };

  // Visible range text ("Showing 1 - 21 of 192") - ensures 3 cards per row
  const rangeText = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize + 1;
    const end = Math.min(pagination.page * pagination.pageSize, pagination.total || 0);
    if (!pagination.total) return "Loading…";
    return `Showing ${start.toLocaleString()} - ${end.toLocaleString()} of ${pagination.total.toLocaleString()} certifications`;
  }, [pagination]);

  // Pagination buttons (centered, compact)
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
    let end = Math.min(pagination.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <nav role="navigation" aria-label="Pagination">
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </Button>

          {pages.map((p) => (
            <Button
              key={p}
              variant={p === pagination.page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(p)}
              className="w-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Go to page ${p}`}
              aria-current={p === pagination.page ? 'page' : undefined}
            >
              {p}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Go to next page"
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1200px]">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Certifications</h1>

        {/* Search Bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <label htmlFor="cert-search" className="sr-only">
              Search certifications
            </label>
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
            <input
              id="cert-search"
              type="text"
              placeholder="Search certifications..."
              value={currentFilters.query || ''}
              onChange={(e) => {
                const query = e.target.value;
                setFilters({ query, page: 1 });
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
              aria-describedby="search-help"
            />
            <div id="search-help" className="sr-only">
              Search by certification name, issuer, or domain
            </div>
          </div>
          <Button 
            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            type="submit"
            aria-label="Search certifications"
          >
            Search
          </Button>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Sidebar filters */}
          <aside className="xl:w-64 xl:flex-shrink-0" aria-label="Filter certifications">
            <div className="bg-white rounded-2xl p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClear}
                  className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  aria-label="Clear all filters"
                >
                  Clear All
                </Button>
              </div>

              <form role="search" aria-label="Filter options">
                <div className="space-y-8">
                  {/* Domain */}
                  <fieldset>
                    <legend className="font-medium mb-4 text-gray-900">Domain</legend>
                    <div className="space-y-3 max-h-64 overflow-y-auto" role="radiogroup" aria-labelledby="domain-legend">
                      {ALL_DOMAIN_SLUGS.map((domainSlug) => (
                        <label key={domainSlug} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="radio"
                            name="domain"
                            value={domainSlug}
                            className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300"
                            checked={currentFilters.domain === domainSlug}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters({ domain: domainSlug, page: 1 });
                              } else {
                                setFilters({ domain: '', page: 1 });
                              }
                            }}
                            aria-describedby={`domain-${domainSlug}-desc`}
                          />
                          <span className="text-sm text-gray-700 flex items-center gap-2">
                            {React.createElement(getDomainIcon(domainSlug), { className: "w-4 h-4", "aria-hidden": "true" })}
                            {getDomainLabel(domainSlug)}
                          </span>
                          <span id={`domain-${domainSlug}-desc`} className="sr-only">
                            Filter by {getDomainLabel(domainSlug)} domain
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {/* Level */}
                  <fieldset>
                    <legend className="font-medium mb-4 text-gray-900">Level</legend>
                    <div className="space-y-3" role="radiogroup" aria-labelledby="level-legend">
                      {LEVELS.map((lvl) => (
                        <label key={lvl} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="radio"
                            name="level"
                            value={lvl}
                            className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300"
                            checked={currentFilters.level === lvl}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters({ level: lvl, page: 1 });
                              } else {
                                setFilters({ level: '', page: 1 });
                              }
                            }}
                            aria-describedby={`level-${lvl.toLowerCase()}-desc`}
                          />
                          <span className="text-sm text-gray-700">{lvl}</span>
                          <span id={`level-${lvl.toLowerCase()}-desc`} className="sr-only">
                            Filter by {lvl} level certifications
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {/* Popular Issuers */}
                  <fieldset>
                    <legend className="font-medium mb-4 text-gray-900">Popular Issuers</legend>
                    <div className="space-y-3" role="radiogroup" aria-labelledby="issuer-legend">
                      {['AWS', 'Microsoft', 'FINRA'].map((issuer) => (
                        <label key={issuer} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="radio"
                            name="issuer"
                            value={issuer.toLowerCase()}
                            className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300"
                            checked={currentFilters.issuer === issuer.toLowerCase()}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters({ issuer: issuer.toLowerCase(), page: 1 });
                              } else {
                                setFilters({ issuer: '', page: 1 });
                              }
                            }}
                            aria-describedby={`issuer-${issuer.toLowerCase()}-desc`}
                          />
                          <span className="text-sm text-gray-700">{issuer}</span>
                          <span id={`issuer-${issuer.toLowerCase()}-desc`} className="sr-only">
                            Filter by {issuer} certifications
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </form>
            </div>
          </aside>

          {/* Main column */}
          <section className="flex-1" aria-label="Certification results">
            {/* Results header row */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-gray-600 text-sm" aria-live="polite" aria-atomic="true">
                  {loading ? "Loading…" : rangeText}
                </p>
              </div>

              {/* Sort control */}
              <div className="flex items-center gap-3">
                <label htmlFor="sort-select" className="text-sm text-gray-600 font-medium">
                  Sort by
                </label>
                <select
                  id="sort-select"
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setFilters({ sortBy: field, sortOrder: order as 'asc' | 'desc', page: 1 });
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white min-w-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  aria-label="Sort certifications by"
                >
                  <option value="ranking-asc">Rank (Best First)</option>
                  <option value="rating-desc">Rating (Highest First)</option>
                  <option value="cost-asc">Price (Lowest First)</option>
                  <option value="name-asc">Name (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Grid / Skeleton / Empty */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                        <div className="h-10 bg-gray-200 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : certifications.length > 0 ? (
              <div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                role="grid" 
                aria-label="Certification results"
                aria-rowcount={Math.ceil(certifications.length / 3)}
              >
                {/* Ensure exactly 3 cards per row on large screens with proper spacing */}
                {certifications.map((c, index) => (
                  <div 
                    key={c.slug} 
                    role="gridcell"
                    aria-rowindex={Math.floor(index / 3) + 1}
                    aria-colindex={(index % 3) + 1}
                  >
                    <CertificationCard 
                      certification={c} 
                      showRanking={false}
                      rank={(pagination.page - 1) * pagination.pageSize + index + 1}
                      showCompareButton={true}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <FilterIcon className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No certifications found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button onClick={handleClear}>Clear Filters</Button>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {renderPagination()}
          </section>
        </div>
      </div>
    </div>
  );
};

export default CertificationsPage;
