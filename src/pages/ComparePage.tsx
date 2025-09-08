import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, ArrowRight, Star, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import SearchBar from '../components/SearchBar';
import CertificationCard from '../components/CertificationCard';
import { dataService } from '../services/dataService';
import type { Certification, CompareItem } from '../types';

const ComparePage: React.FC = () => {
  const [compareItems, setCompareItems] = useState<CompareItem[]>([]);
  const [searchResults, setSearchResults] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const maxCompareItems = 4;

  const handleSearch = async (query: string, filters: any) => {
    if (!query.trim()) return;
    
    try {
      setLoading(true);
      const response = await dataService.searchCertifications(query, filters);
      setSearchResults(response.data);
      setShowSearch(true);
    } catch (error) {
      console.error('Error searching certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchResults([]);
    setShowSearch(false);
  };


  const removeFromCompare = (certificationId: string) => {
    setCompareItems(prev => prev.filter(item => item.certification.id !== certificationId));
  };

  const clearAll = () => {
    setCompareItems([]);
  };

  const formatCost = (cost: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cost);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getComparisonValue = (cert: Certification, field: string) => {
    switch (field) {
      case 'rating':
        return cert.rating;
      case 'cost':
        return cert.cost;
      case 'difficulty':
        return cert.difficulty;
      case 'duration':
        return cert.duration;
      default:
        return '';
    }
  };

  const getBestValue = (field: string) => {
    if (compareItems.length === 0) return null;
    
    const values = compareItems.map(item => ({
      id: item.certification.id,
      value: getComparisonValue(item.certification, field)
    }));

    if (field === 'cost') {
      // For cost, lower is better
      const best = values.reduce((min, current) => 
        current.value < min.value ? current : min
      );
      return best.id;
    } else {
      // For other fields, higher is better
      const best = values.reduce((max, current) => 
        current.value > max.value ? current : max
      );
      return best.id;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Compare Certifications
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Compare up to {maxCompareItems} certifications side by side to make the best choice
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <SearchBar
              onSearch={handleSearch}
              onClear={handleClear}
              loading={loading}
            />
          </div>
        </div>

        {/* Search Results */}
        {showSearch && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((certification) => (
                  <div key={certification.id} className="relative">
                    <CertificationCard
                      certification={certification}
                    />
                    {compareItems.length >= maxCompareItems && 
                     !compareItems.some(item => item.certification.id === certification.id) && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                        <p className="text-white text-sm font-medium">
                          Maximum {maxCompareItems} items
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Compare Section */}
        {compareItems.length > 0 ? (
          <div className="space-y-6">
            {/* Compare Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Comparing {compareItems.length} Certification{compareItems.length !== 1 ? 's' : ''}
              </h2>
              <Button variant="outline" onClick={clearAll}>
                Clear All
              </Button>
            </div>

            {/* Comparison Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                          Certification
                        </th>
                        {compareItems.map((item) => (
                          <th key={item.certification.id} className="px-6 py-4 text-center text-sm font-medium text-gray-900 min-w-64">
                            <div className="flex items-center justify-between">
                              <span className="truncate">{item.certification.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCompare(item.certification.id)}
                                className="ml-2 p-1 h-6 w-6"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {/* Basic Info */}
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Issuer</td>
                        {compareItems.map((item) => (
                          <td key={item.certification.id} className="px-6 py-4 text-sm text-gray-900 text-center">
                            {item.certification.issuer}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Domain</td>
                        {compareItems.map((item) => (
                          <td key={item.certification.id} className="px-6 py-4 text-sm text-gray-900 text-center">
                            <Badge variant="outline">{item.certification.domain}</Badge>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Level</td>
                        {compareItems.map((item) => (
                          <td key={item.certification.id} className="px-6 py-4 text-sm text-gray-900 text-center">
                            <Badge variant="secondary">{item.certification.level}</Badge>
                          </td>
                        ))}
                      </tr>

                      {/* Rating */}
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Rating</td>
                        {compareItems.map((item) => {
                          const isBest = getBestValue('rating') === item.certification.id;
                          return (
                            <td key={item.certification.id} className={`px-6 py-4 text-sm text-gray-900 text-center ${isBest ? 'bg-green-50' : ''}`}>
                              <div className="flex items-center justify-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  {renderStars(item.certification.rating)}
                                </div>
                                <span className="font-medium">{item.certification.rating.toFixed(1)}</span>
                                {isBest && <Award className="w-4 h-4 text-green-600" />}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                ({item.certification.reviewCount.toLocaleString()} reviews)
                              </div>
                            </td>
                          );
                        })}
                      </tr>

                      {/* Cost */}
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Cost</td>
                        {compareItems.map((item) => {
                          const isBest = getBestValue('cost') === item.certification.id;
                          return (
                            <td key={item.certification.id} className={`px-6 py-4 text-sm text-gray-900 text-center ${isBest ? 'bg-green-50' : ''}`}>
                              <div className="flex items-center justify-center space-x-2">
                                <span className="font-medium">
                                  {formatCost(item.certification.cost, item.certification.currency)}
                                </span>
                                {isBest && <Award className="w-4 h-4 text-green-600" />}
                              </div>
                            </td>
                          );
                        })}
                      </tr>

                      {/* Duration */}
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Duration</td>
                        {compareItems.map((item) => (
                          <td key={item.certification.id} className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{item.certification.duration}</span>
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Difficulty */}
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Difficulty</td>
                        {compareItems.map((item) => {
                          const isBest = getBestValue('difficulty') === item.certification.id;
                          return (
                            <td key={item.certification.id} className={`px-6 py-4 text-sm text-gray-900 text-center ${isBest ? 'bg-green-50' : ''}`}>
                              <div className="flex items-center justify-center space-x-2">
                                <span className="font-medium">{item.certification.difficulty}/5</span>
                                {isBest && <Award className="w-4 h-4 text-green-600" />}
                              </div>
                            </td>
                          );
                        })}
                      </tr>

                      {/* Tags */}
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Tags</td>
                        {compareItems.map((item) => (
                          <td key={item.certification.id} className="px-6 py-4 text-sm text-gray-900 text-center">
                            <div className="flex flex-wrap justify-center gap-1">
                              {item.certification.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" size="sm">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Actions */}
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Actions</td>
                        {compareItems.map((item) => (
                          <td key={item.certification.id} className="px-6 py-4 text-sm text-gray-900 text-center">
                            <Link to={`/certifications/${item.certification.slug}`}>
                              <Button size="sm">
                                View Details
                                <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                            </Link>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Empty State */
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Plus className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No certifications to compare
              </h3>
              <p className="text-gray-600 mb-6">
                Search for certifications above to start comparing
              </p>
              <Button onClick={() => setShowSearch(true)}>
                Start Comparing
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ComparePage;
