import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { getCompaniesByDomain, getCompanyRecommendations } from '../services/dataService';
import { Building2, Users, TrendingUp, Award } from 'lucide-react';
import { useCompanyFilters } from '../hooks/useUrlState';
import { getDomainLabel, getDomainIcon } from '../config/domains';

interface Company {
  company_id: number;
  slug: string;
  name: string;
  postings_30d: number;
  top_roles: Record<string, number>;
}

interface CompanyRecommendation {
  slug: string;
  fit_score: number;
  signals: {
    role_alignment: number;
    global_rank_norm: number;
    cost_penalty: number;
    mention_count?: number;
    mention_z?: number;
  };
}

interface CompaniesData {
  [domain: string]: Company[];
}

interface RecommendationsData {
  [domain: string]: {
    [company_slug: string]: CompanyRecommendation[];
  };
}

export default function CompaniesPage() {
  const { state: filters, setState: setFilters } = useCompanyFilters();
  const [companies, setCompanies] = useState<CompaniesData>({});
  const [recommendations, setRecommendations] = useState<RecommendationsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [companiesData, recommendationsData] = await Promise.all([
          getCompaniesByDomain(),
          getCompanyRecommendations()
        ]);
        
        setCompanies(companiesData);
        setRecommendations(recommendationsData);
        
        // Set first available domain as selected if not already set
        const firstDomain = Object.keys(companiesData)[0];
        if (firstDomain && !selectedDomain) {
          setSelectedDomain(firstDomain);
          setFilters({ domain: firstDomain });
        }
      } catch (err) {
        setError('Failed to load companies data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedDomain, setFilters]);

  // Sync URL state with local state
  useEffect(() => {
    if (filters.domain && filters.domain !== selectedDomain) {
      setSelectedDomain(filters.domain);
    }
  }, [filters.domain, selectedDomain]);

  const domains = Object.keys(companies);
  const selectedCompanies = companies[selectedDomain] || [];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Top Companies by Domain</h1>
          <p className="text-lg text-gray-600">
            Discover which companies are hiring for each domain and their recommended certifications.
          </p>
        </div>
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-label="Loading companies data"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Top Companies by Domain</h1>
        <p className="text-lg text-gray-600">
          Discover which companies are hiring for each domain and their recommended certifications.
        </p>
      </div>

      {/* Domain Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pb-px" aria-label="Domains" style={{ scrollbarWidth: 'thin' }}>
            {domains.map((domain) => (
              <button
                key={domain}
                onClick={() => {
                  setSelectedDomain(domain);
                  setFilters({ domain });
                }}
                className={`py-2 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 transition-colors ${
                  selectedDomain === domain
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center space-x-1">
                  {React.createElement(getDomainIcon(domain as any), { className: "w-4 h-4" })}
                  <span>{getDomainLabel(domain as any) || domain.charAt(0).toUpperCase() + domain.slice(1)}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {selectedCompanies.map((company) => {
          const companyRecommendations = recommendations[selectedDomain]?.[company.slug] || [];
          const topRole = Object.entries(company.top_roles)[0] || ['', 0];

          return (
            <Card key={company.slug} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>{company.postings_30d} openings (30 days)</span>
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">#{company.company_id}</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Top Role */}
                {topRole[0] && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        Top Role: {topRole[0]}
                      </span>
                    </div>
                    <Badge variant="outline">{topRole[1]} openings</Badge>
                  </div>
                )}

                {/* Top Recommendations */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Award className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-900">
                      Top Cert Recommendations
                    </span>
                  </div>
                  <div className="space-y-2">
                    {companyRecommendations.slice(0, 3).map((rec, index) => (
                      <div
                        key={rec.slug}
                        className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg"
                      >
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            #{index + 1} {rec.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            Role Match: {Math.round(rec.signals.role_alignment * 100)}% • 
                            Global Rank: {Math.round(rec.signals.global_rank_norm * 100)}%
                          </div>
                        </div>
                        <Badge 
                          variant={rec.fit_score > 0.5 ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {Math.round(rec.fit_score * 100)}% fit
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* All Roles */}
                <div>
                  <span className="text-sm font-medium text-gray-900 mb-2 block">
                    All Hiring Roles
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(company.top_roles).slice(0, 4).map(([role, count]) => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role} ({count})
                      </Badge>
                    ))}
                    {Object.keys(company.top_roles).length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{Object.keys(company.top_roles).length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedCompanies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No companies data available for {selectedDomain}.</p>
        </div>
      )}
    </div>
  );
}