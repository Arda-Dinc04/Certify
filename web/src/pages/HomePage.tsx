import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Award, BookOpen, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import SearchBar from '../components/SearchBar';
import CertificationCard from '../components/CertificationCard';
import { dataService } from '../services/dataService';
import type { Certification, Domain, Stats } from '../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [trendingCertifications, setTrendingCertifications] = useState<Certification[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [trending, domainsData, statsData] = await Promise.all([
          dataService.getTrendingCertifications(8),
          dataService.getDomains(),
          dataService.getStats()
        ]);
        
        setTrendingCertifications(trending);
        setDomains(domainsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/certifications?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleClear = () => {
    // Clear functionality can be handled by the SearchBar component
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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold">Welcome to Certify! 🎉</h2>
          <p className="text-sm opacity-90">Your gateway to professional certification success</p>
        </div>
      </div>

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
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 px-4 sm:px-0">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="animate-pulse flex-shrink-0 w-72 sm:w-80">
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
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide px-4 sm:px-0">
                {trendingCertifications.slice(0, 6).map((certification) => (
                  <div key={certification.id} className="flex-shrink-0 w-72 sm:w-80">
                    <CertificationCard
                      certification={certification}
                    />
                  </div>
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {domains.map((domain) => (
              <Link
                key={domain.id}
                to={`/certifications?domain=${domain.slug}`}
                className="group"
              >
                <Card className="text-center p-4 card-hover hover:shadow-lg transition-all duration-200 hover:scale-105 w-full max-w-[220px] mx-auto h-[180px] flex flex-col">
                  <CardContent className="pt-2 flex-grow flex flex-col justify-between">
                    <div 
                      className="w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center text-white shadow-lg"
                      style={{ 
                        backgroundColor: domain.color,
                        minWidth: '56px',
                        minHeight: '56px',
                        width: '56px',
                        height: '56px'
                      }}
                    >
                      {(() => {
                        const IconComponent = domain.icon;
                        return <IconComponent className="w-7 h-7" />;
                      })()}
                    </div>
                    <div className="flex-grow flex flex-col justify-center items-center">
                      <h3 className="font-semibold text-sm group-hover:text-blue-600 transition-colors mb-1 text-center leading-tight">
                        {domain.name}
                      </h3>
                      <p className="text-xs text-gray-500 text-center">
                        {domain.certificationCount} certifications
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
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
              <Button 
                size="lg" 
                variant="secondary"
                className="text-white hover:text-white hover:scale-105 transition-all duration-200"
              >
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
