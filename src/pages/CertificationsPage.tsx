// src/pages/Certifications.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Filter as FilterIcon,
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon,
} from "lucide-react";

import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import CertificationCard from "../components/CertificationCard";

import { dataService } from "../services/dataService";
import type { Certification, SearchFilters } from "../types";
import { useCompare } from "../context/CompareContext";

const LEVELS = ["Foundational", "Associate", "Professional", "Specialty", "Expert"] as const;

const CertificationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCompare, isInCompare } = useCompare();

  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 21,
    total: 0,
    totalPages: 0,
  });

  const [sortBy, setSortBy] = useState<"name" | "rating" | "cost" | "popularity">(
    (searchParams.get("sortBy") as any) || "popularity"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as any) || "desc"
  );


  // current filters derived from URL
  const currentFilters: SearchFilters = {
    query: searchParams.get("query") || undefined,
    domain: searchParams.get("domain") || undefined,
    issuer: searchParams.get("issuer") || undefined,
    level: searchParams.get("level") || undefined,
    minRating: searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined,
    maxCost: searchParams.get("maxCost") ? Number(searchParams.get("maxCost")) : undefined,
  };

  // Fetch data whenever URL filters, sort, or page changes
  useEffect(() => {
    fetchCertifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, sortBy, sortOrder, pagination.page, pagination.pageSize]);

  const fetchCertifications = async () => {
    try {
      setLoading(true);

      // If your dataService supports sort, pass it here.
      // Otherwise, it can read from searchParams, or you can sort client-side.
      const resp = await dataService.getCertifications(
        currentFilters,
        pagination.page,
        pagination.pageSize,
        // @ts-expect-error (ok if your service ignores extras)
        { sortBy, sortOrder }
      );

      const items: Certification[] = resp.data || [];
      setCertifications(items);

      if (resp.pagination) {
        setPagination(resp.pagination);
      } else {
        // fallback pagination if service doesn't supply it
        setPagination((p) => ({
          ...p,
          total: items.length,
          totalPages: Math.ceil(items.length / p.pageSize) || 1,
        }));
      }
    } catch (err) {
      console.error("Error fetching certifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    const params = new URLSearchParams();
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    setSearchParams(params);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {pages.map((p) => (
          <Button
            key={p}
            variant={p === pagination.page ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(p)}
            className="w-10"
          >
            {p}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
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
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search certifications..."
              value={currentFilters.query || ''}
              onChange={(e) => {
                const query = e.target.value;
                const params = new URLSearchParams(searchParams);
                if (query) {
                  params.set("query", query);
                } else {
                  params.delete("query");
                }
                setSearchParams(params);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl">
            Search
          </Button>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* Sidebar filters */}
          <aside className="xl:w-64 xl:flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClear}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Clear All
                </Button>
              </div>

              <div className="space-y-8">
                {/* Domain */}
                <div>
                  <h4 className="font-medium mb-4 text-gray-900">Domain</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {[
                      { name: 'CS/IT', emoji: '💻' },
                      { name: 'Finance', emoji: '💰' },
                      { name: 'Food Service', emoji: '🍽️' },
                      { name: 'Legal', emoji: '⚖️' },
                      { name: 'DevOps/Cloud', emoji: '☁️' },
                      { name: 'Design & Creative', emoji: '🎨' },
                      { name: 'Supply Chain', emoji: '🚛' },
                      { name: 'Language', emoji: '🌍' },
                      { name: 'Aviation', emoji: '✈️' },
                      { name: 'Engineering / Quality', emoji: '⚙️' },
                      { name: 'Audio Engineering', emoji: '🎧' },
                      { name: 'Healthcare', emoji: '🏥' },
                      { name: 'Hospitality', emoji: '🏨' },
                      { name: 'Maritime', emoji: '⚓' },
                      { name: 'Sustainability', emoji: '🌱' },
                      { name: 'Fitness & Wellness', emoji: '💪' },
                      { name: 'Audio Production', emoji: '🎵' },
                      { name: 'Engineering', emoji: '🔧' },
                      { name: 'Data Protection', emoji: '🔒' },
                      { name: 'Math (Actuarial)', emoji: '📊' },
                      { name: 'IT Service Management', emoji: '🖥️' },
                      { name: 'Project Management', emoji: '📋' },
                      { name: 'Government/Defense', emoji: '🏛️' },
                      { name: 'Engineering / Business', emoji: '⚙️' },
                      { name: 'Energy', emoji: '⚡' },
                      { name: 'Legal/Compliance', emoji: '📋' },
                      { name: 'Cybersecurity', emoji: '🛡️' },
                      { name: 'Education', emoji: '🎓' },
                      { name: 'Privacy', emoji: '🔐' },
                      { name: 'Compliance', emoji: '✅' },
                      { name: 'IT Governance', emoji: '🏛️' },
                      { name: 'Culinary', emoji: '👨‍🍳' },
                      { name: 'Enterprise Architecture', emoji: '🏗️' }
                    ].map((domain) => (
                      <label key={domain.name} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="domain"
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          checked={currentFilters.domain === domain.name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '')}
                          onChange={(e) => {
                            const params = new URLSearchParams(searchParams);
                            if (e.target.checked) {
                              params.set("domain", domain.name.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ''));
                            } else {
                              params.delete("domain");
                            }
                            setSearchParams(params);
                            setPagination(prev => ({ ...prev, page: 1 }));
                          }}
                        />
                        <span className="text-sm text-gray-700 flex items-center gap-2">
                          <span>{domain.emoji}</span>
                          {domain.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Level */}
                <div>
                  <h4 className="font-medium mb-4 text-gray-900">Level</h4>
                  <div className="space-y-3">
                    {LEVELS.map((lvl) => (
                      <label key={lvl} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="level"
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          checked={currentFilters.level === lvl.toLowerCase()}
                          onChange={(e) => {
                            const params = new URLSearchParams(searchParams);
                            if (e.target.checked) {
                              params.set("level", lvl.toLowerCase());
                            } else {
                              params.delete("level");
                            }
                            setSearchParams(params);
                            setPagination(prev => ({ ...prev, page: 1 }));
                          }}
                        />
                        <span className="text-sm text-gray-700">{lvl}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Popular Issuers */}
                <div>
                  <h4 className="font-medium mb-4 text-gray-900">Popular Issuers</h4>
                  <div className="space-y-3">
                    {['AWS', 'Microsoft', 'FINRA'].map((issuer) => (
                      <label key={issuer} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="issuer"
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          checked={currentFilters.issuer === issuer.toLowerCase()}
                          onChange={(e) => {
                            const params = new URLSearchParams(searchParams);
                            if (e.target.checked) {
                              params.set("issuer", issuer.toLowerCase());
                            } else {
                              params.delete("issuer");
                            }
                            setSearchParams(params);
                            setPagination(prev => ({ ...prev, page: 1 }));
                          }}
                        />
                        <span className="text-sm text-gray-700">{issuer}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main column */}
          <section className="flex-1">
            {/* Results header row */}
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-gray-600 text-sm">{loading ? "Loading…" : rangeText}</p>
              </div>

              {/* Sort control */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium">Sort by Rank</span>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field as typeof sortBy);
                    setSortOrder(order as typeof sortOrder);

                    // keep sort in URL (so refresh keeps it)
                    const params = new URLSearchParams(searchParams);
                    params.set("sortBy", field);
                    params.set("sortOrder", order);
                    setSearchParams(params);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white min-w-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="popularity-desc">Sort by Rank</option>
                  <option value="rating-desc">Rating</option>
                  <option value="cost-asc">Price</option>
                  <option value="name-asc">Name</option>
                </select>
              </div>
            </div>

            {/* Grid / Skeleton / Empty */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                {/* Ensure exactly 3 cards per row on large screens with proper spacing */}
                {certifications.map((c, index) => (
                  <CertificationCard 
                    key={c.id} 
                    certification={c} 
                    showRanking 
                    rank={(pagination.page - 1) * pagination.pageSize + index + 1}
                    showCompareButton={true}
                    onAddToCompare={addToCompare}
                    isInCompare={isInCompare(c.id)}
                  />
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
