import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Star, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge, RankingBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { dataService } from '../services/dataService';
import type { Ranking, Domain } from '../types';

const RankingsPage: React.FC = () => {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedDomain]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rankingsData, domainsData] = await Promise.all([
        selectedDomain === 'all' 
          ? dataService.getTopRankings(undefined, 50)
          : dataService.getDomainRankings(selectedDomain),
        dataService.getDomains()
      ]);
      
      setRankings(rankingsData);
      setDomains(domainsData);
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-100';
    if (score >= 80) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    if (score >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-12 h-12 text-gray-900 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">
              Certification Rankings
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the top-rated certifications based on market demand, 
            difficulty, and professional value
          </p>
        </div>

        {/* Domain Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedDomain === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedDomain('all')}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span>All Domains</span>
            </Button>
            {domains.map((domain) => {
              const DomainIcon = domain.icon;
              return (
                <Button
                  key={domain.id}
                  variant={selectedDomain === domain.slug ? 'default' : 'outline'}
                  onClick={() => setSelectedDomain(domain.slug)}
                  className="flex items-center space-x-2"
                >
                  <DomainIcon className="w-4 h-4" />
                  <span>{domain.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Rankings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-gray-900" />
              <span>
                {selectedDomain === 'all' ? 'Top Certifications' : `${domains.find(d => d.slug === selectedDomain)?.name} Rankings`}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8">
                <div className="space-y-4">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border-b animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                      </div>
                      <div className="w-16 h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {rankings.map((ranking) => (
                  <div key={ranking.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-6">
                      {/* Ranking Position */}
                      <div className="flex-shrink-0">
                        <RankingBadge position={ranking.position} />
                      </div>

                      {/* Certification Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              <Link 
                                to={`/certifications/${ranking.certification.slug}`}
                                className="hover:text-gray-900 transition-colors"
                              >
                                {ranking.certification.name}
                              </Link>
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <span className="flex items-center space-x-1">
                                <span>{ranking.certification.issuer}</span>
                              </span>
                              <span>•</span>
                              <span>{ranking.certification.domain}</span>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span>{ranking.certification.rating.toFixed(1)}</span>
                                <span>({ranking.certification.reviewCount.toLocaleString()})</span>
                              </span>
                            </div>
                            
                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" size="sm">
                                {ranking.certification.level}
                              </Badge>
                              {ranking.certification.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" size="sm">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Score */}
                          <div className="flex-shrink-0 text-right">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getScoreBgColor(ranking.score)} ${getScoreColor(ranking.score)}`}>
                              {ranking.score.toFixed(1)}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Score</p>
                          </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{ranking.criteria.popularity.toFixed(1)}</div>
                            <div className="text-gray-500">Popularity</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{ranking.criteria.difficulty.toFixed(1)}</div>
                            <div className="text-gray-500">Difficulty</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{ranking.criteria.rating.toFixed(1)}</div>
                            <div className="text-gray-500">Rating</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{ranking.criteria.marketDemand.toFixed(1)}</div>
                            <div className="text-gray-500">Market Demand</div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-gray-900">{ranking.criteria.salaryImpact.toFixed(1)}</div>
                            <div className="text-gray-500">Salary Impact</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Methodology */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-6 h-6 text-gray-900" />
                <span>Ranking Methodology</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Popularity (20%)</h4>
                  <p className="text-sm text-gray-600">
                    Based on enrollment numbers and community engagement
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Difficulty (15%)</h4>
                  <p className="text-sm text-gray-600">
                    Exam complexity and preparation time required
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Rating (25%)</h4>
                  <p className="text-sm text-gray-600">
                    User reviews and satisfaction scores
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Market Demand (25%)</h4>
                  <p className="text-sm text-gray-600">
                    Job market requirements and industry trends
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Trophy className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Salary Impact (15%)</h4>
                  <p className="text-sm text-gray-600">
                    Average salary increase after certification
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RankingsPage;
