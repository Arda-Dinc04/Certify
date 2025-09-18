import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, ArrowRight, Star, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import CertificationCard from '../components/CertificationCard';
import { dataService } from '../services/dataService';
import type { Certification } from '../types';
import { useCompare } from '../context/CompareContext';

const ComparePage: React.FC = () => {
  const { compareItems, addToCompare, removeFromCompare, clearCompare, isInCompare } = useCompare();
  const [searchResults, setSearchResults] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSearch, setActiveSearch] = useState<number | null>(null);

  const maxCompareItems = 4;

  const handleSearch = async (query: string, slotIndex: number) => {
    if (!query.trim()) {
      setSearchResults([]);
      setActiveSearch(null);
      return;
    }
    
    try {
      setLoading(true);
      setActiveSearch(slotIndex);
      const response = await dataService.searchCertifications(query, {});
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCertification = (certification: Certification) => {
    addToCompare(certification);
    setSearchResults([]);
    setActiveSearch(null);
  };

  const clearAll = () => {
    clearCompare();
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
      id: item.id,
      value: getComparisonValue(item, field)
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
            Select up to {maxCompareItems} certifications to compare side by side
          </p>
        </div>

        {/* Selection Slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: maxCompareItems }, (_, index) => {
            const certification = compareItems[index];
            return (
              <Card key={index} className="p-4 min-h-[150px]">
                {certification ? (
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900 text-xs line-clamp-2">
                        {certification.name}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCompare(certification.id)}
                        className="ml-2 p-1 h-5 w-5"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{certification.issuer}</p>
                    <Badge variant="outline" className="text-xs px-2 py-1">{certification.domain}</Badge>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <h3 className="font-medium text-gray-900 mb-3 text-sm">
                      Certification #{index + 1}
                    </h3>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search for certification..."
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onChange={(e) => handleSearch(e.target.value, index)}
                      />
                      {activeSearch === index && loading && (
                        <div className="absolute right-3 top-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Search Results */}
        {activeSearch !== null && searchResults.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search Results - Click to Select</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl">
                  {searchResults.map((certification) => (
                    <div
                      key={certification.id}
                      className="relative cursor-pointer"
                      onClick={() => handleSelectCertification(certification)}
                    >
                      <div className="transform scale-90 origin-top">
                        <CertificationCard
                          certification={certification}
                          showCompareButton={false}
                        />
                      </div>
                      {isInCompare(certification.id) && (
                        <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-2xl flex items-center justify-center z-10">
                          <div className="text-green-800 text-sm font-medium bg-white px-4 py-2 rounded-lg shadow-md">
                            Already Selected
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-900">
                          Certification
                        </th>
                        {compareItems.map((item) => (
                          <th key={item.id} className="px-4 py-3 text-center text-xs font-medium text-gray-900 min-w-48">
                            <div className="flex flex-col items-center space-y-2">
                              <div className="flex items-center justify-between w-full">
                                <span className="flex-1 text-center font-semibold text-sm leading-tight">
                                  {item.name}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromCompare(item.id)}
                                  className="ml-2 p-1 h-6 w-6 flex-shrink-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {/* Basic Info */}
                      <tr>
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">Issuer</td>
                        {compareItems.map((item) => (
                          <td key={item.id} className="px-4 py-3 text-xs text-gray-900 text-center">
                            {item.issuer}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">Domain</td>
                        {compareItems.map((item) => (
                          <td key={item.id} className="px-4 py-3 text-xs text-gray-900 text-center">
                            <Badge variant="outline">{item.domain}</Badge>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">Level</td>
                        {compareItems.map((item) => (
                          <td key={item.id} className="px-4 py-3 text-xs text-gray-900 text-center">
                            <Badge variant="secondary">{item.level}</Badge>
                          </td>
                        ))}
                      </tr>

                      {/* Rating */}
                      <tr>
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">Rating</td>
                        {compareItems.map((item) => {
                          const isBest = getBestValue('rating') === item.id;
                          return (
                            <td key={item.id} className={`px-4 py-3 text-xs text-gray-900 text-center ${isBest ? 'bg-green-50' : ''}`}>
                              <div className="flex items-center justify-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  {renderStars(item.rating)}
                                </div>
                                <span className="font-medium">{item.rating.toFixed(1)}</span>
                                {isBest && <Award className="w-4 h-4 text-green-600" />}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                ({item.reviewCount.toLocaleString()} reviews)
                              </div>
                            </td>
                          );
                        })}
                      </tr>

                      {/* Cost */}
                      <tr>
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">Cost</td>
                        {compareItems.map((item) => {
                          const isBest = getBestValue('cost') === item.id;
                          return (
                            <td key={item.id} className={`px-4 py-3 text-xs text-gray-900 text-center ${isBest ? 'bg-green-50' : ''}`}>
                              <div className="flex items-center justify-center space-x-2">
                                <span className="font-medium">
                                  {formatCost(item.cost, item.currency)}
                                </span>
                                {isBest && <Award className="w-4 h-4 text-green-600" />}
                              </div>
                            </td>
                          );
                        })}
                      </tr>

                      {/* Duration */}
                      <tr>
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">Duration</td>
                        {compareItems.map((item) => (
                          <td key={item.id} className="px-4 py-3 text-xs text-gray-900 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{item.duration}</span>
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Difficulty */}
                      <tr>
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">Difficulty</td>
                        {compareItems.map((item) => {
                          const isBest = getBestValue('difficulty') === item.id;
                          return (
                            <td key={item.id} className={`px-4 py-3 text-xs text-gray-900 text-center ${isBest ? 'bg-green-50' : ''}`}>
                              <div className="flex items-center justify-center space-x-2">
                                <span className="font-medium">{item.difficulty}/5</span>
                                {isBest && <Award className="w-4 h-4 text-green-600" />}
                              </div>
                            </td>
                          );
                        })}
                      </tr>

                      {/* Tags */}
                      <tr>
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">Tags</td>
                        {compareItems.map((item) => (
                          <td key={item.id} className="px-4 py-3 text-xs text-gray-900 text-center">
                            <div className="flex flex-wrap justify-center gap-1">
                              {item.tags.slice(0, 3).map((tag) => (
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
                        <td className="px-4 py-3 text-xs font-medium text-gray-900">Actions</td>
                        {compareItems.map((item) => (
                          <td key={item.id} className="px-4 py-3 text-xs text-gray-900 text-center">
                            <Link to={`/certifications/${item.slug}`}>
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
              <Button onClick={() => setActiveSearch(0)}>
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
