import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Award, BookOpen, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import SearchBar from '../components/SearchBar';
import CertificationCard from '../components/CertificationCard';
import { dataService } from '../services/dataService';
import type { Certification, Domain, Stats } from '../types';
import { useDataPreload } from '../components/PreloadHints';
import { ALL_DOMAIN_SLUGS, getDomainMeta, getDomainLabel, getDomainEmoji } from '../config/domains';

const HomePage: React.FC = () => {
  const [trendingCertifications, setTrendingCertifications] = useState<Certification[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Preload critical data for better performance
  useDataPreload();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get trending certifications and stats
        const [trending, statsData] = await Promise.all([
          dataService.getTrendingCertifications(8),
          dataService.getStats()
        ]);
        
        // Load manifest to get certification counts per domain
        const manifestResponse = await fetch('/data/manifest.json');
        const manifest = await manifestResponse.json();
        
        // Create domain objects with certification counts from manifest
        const allDomains: Domain[] = ALL_DOMAIN_SLUGS.map(slug => {
          const domainMeta = getDomainMeta(slug);
          const manifestDomain = manifest.domains_meta[slug];
          
          return {
            id: slug,
            slug: slug,
            name: getDomainLabel(slug),
            icon: getDomainEmoji(slug),
            color: domainMeta?.color || '#3B82F6',
            certificationCount: manifestDomain?.certification_count || 0,
            description: `Professional certifications in ${getDomainLabel(slug)}`
          };
        }).sort((a, b) => b.certificationCount - a.certificationCount); // Sort by certification count
        
        setTrendingCertifications(trending);
        setDomains(allDomains);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (query: string, filters: any) => {
    // This would typically navigate to the certifications page with search params
    console.log('Search:', query, filters);
  };

  const handleClear = () => {
    console.log('Clear search');
  };

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Comprehensive Database",
      description: "Access thousands of certifications from top providers worldwide"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Smart Rankings",
      description: "Find the best certifications based on market demand and ratings"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Reviews",
      description: "Read real experiences from certified professionals"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Career Guidance",
      description: "Get personalized recommendations for your career path"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your Perfect
              <span className="gradient-text block">Certification</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover, compare, and choose from thousands of professional certifications 
              to advance your career with confidence.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar
                onSearch={handleSearch}
                onClear={handleClear}
                loading={loading}
              />
            </div>

            {/* Quick Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.totalCertifications.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Certifications</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.totalIssuers}</div>
                  <div className="text-sm text-gray-600">Issuers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.totalDomains}</div>
                  <div className="text-sm text-gray-600">Domains</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.averageRating.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Certify?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make it easy to find the right certification for your career goals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 card-hover">
                <CardContent className="pt-6">
                  <div className="text-blue-600 mb-4 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

        {/* Trending Certifications */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Browse Certifications
                </h2>
                <p className="text-lg text-gray-600">
                  Discover the top-rated certifications
                </p>
              </div>
              <Link to="/certifications" className="flex items-center space-x-2">
                <Button variant="outline">
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingCertifications.slice(0, 6).map((certification) => (
                  <CertificationCard
                    key={certification.id}
                    certification={certification}
                    showRanking={true}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

      {/* Domains Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore by Domain
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find certifications in your area of expertise
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {Array.from({ length: 32 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4 h-32">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-200 rounded-lg"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {domains.map((domain) => (
                <Link
                  key={domain.id}
                  to={`/certifications?domain=${domain.slug}`}
                  className="group"
                >
                  <Card className="text-center card-hover h-full">
                    <CardContent className="p-4 h-32 flex flex-col justify-center">
                      <div 
                        className="w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center text-white text-2xl"
                        style={{ backgroundColor: domain.color }}
                      >
                        {domain.icon}
                      </div>
                      <h3 className="font-semibold text-sm group-hover:text-blue-600 transition-colors leading-tight mb-1">
                        {domain.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {domain.certificationCount} certs
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Advance Your Career?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of professionals who have found their perfect certification
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/certifications">
              <Button size="lg" variant="secondary">
                Browse Certifications
              </Button>
            </Link>
            <Link to="/rankings">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-indigo-600">
                View Rankings
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
