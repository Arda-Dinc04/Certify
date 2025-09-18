import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, DollarSign, Award, Users, ExternalLink, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { dataService } from '../services/dataService';
import { useCompare } from '../context/CompareContext';
import type { Certification, Review } from '../types';

const CertificationDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCompare, isInCompare, canAddToCompare } = useCompare();
  const [certification, setCertification] = useState<Certification | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchCertification();
    }
  }, [slug]);

  const fetchCertification = async () => {
    try {
      setLoading(true);
      const cert = await dataService.getCertification(slug!);
      setCertification(cert);
      
      // Fetch reviews
      setReviewsLoading(true);
      const reviewsResponse = await dataService.getCertificationReviews(cert.id, 1, 5);
      setReviews(reviewsResponse.data);
    } catch (error) {
      console.error('Error fetching certification:', error);
    } finally {
      setLoading(false);
      setReviewsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatCost = (cost: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cost);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-600 bg-green-100';
    if (difficulty <= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const handleAddToCompare = () => {
    if (certification) {
      addToCompare(certification);
      navigate('/compare');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!certification) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Certification not found
            </h2>
            <p className="text-gray-600 mb-4">
              The certification you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/certifications">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Certifications
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/certifications" className="mb-6 inline-block">
          <Button variant="ghost">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Certifications
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      {certification.logoUrl && (
                        <img
                          src={certification.logoUrl}
                          alt={certification.issuer}
                          className="w-12 h-12 rounded-lg"
                        />
                      )}
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                          {certification.name}
                        </h1>
                        <p className="text-lg text-gray-600">{certification.issuer}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-1">
                        {renderStars(certification.rating)}
                      </div>
                      <span className="text-lg font-semibold">{certification.rating.toFixed(1)}</span>
                      <span className="text-gray-600">
                        ({certification.reviewCount.toLocaleString()} reviews)
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{certification.domain}</Badge>
                      <Badge variant="outline">{certification.level}</Badge>
                      {certification.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {certification.description}
                </p>
              </CardContent>
            </Card>

            {/* Key Information */}
            <Card>
              <CardHeader>
                <CardTitle>Key Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">Duration</div>
                        <div className="text-gray-600">{certification.duration}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">Cost</div>
                        <div className="text-gray-600">
                          {formatCost(certification.cost, certification.currency)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">Difficulty</div>
                        <div className="text-gray-600">{certification.difficulty}/5</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">Exam Format</div>
                        <div className="text-gray-600">{certification.examFormat}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">Validity Period</div>
                        <div className="text-gray-600">{certification.validityPeriod}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">Renewal Required</div>
                        <div className="text-gray-600">
                          {certification.renewalRequired ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prerequisites */}
            {certification.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {certification.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Skills Covered */}
            {certification.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills Covered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {certification.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="space-y-1">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {review.userName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{review.userName}</div>
                            <div className="flex items-center space-x-1">
                              {renderStars(review.rating)}
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <h4 className="font-semibold mb-1">{review.title}</h4>
                        <p className="text-gray-700">{review.content}</p>
                        {review.pros.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm font-medium text-green-700 mb-1">Pros:</div>
                            <ul className="text-sm text-gray-600">
                              {review.pros.map((pro, index) => (
                                <li key={index}>• {pro}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No reviews available yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="lg">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Start Learning
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleAddToCompare}
                  disabled={!canAddToCompare || (certification && isInCompare(certification.id))}
                >
                  {certification && isInCompare(certification.id) 
                    ? "Already in Compare" 
                    : canAddToCompare 
                    ? "Add to Compare" 
                    : "Compare Full (4/4)"
                  }
                </Button>
                {certification.websiteUrl && (
                  <a href={certification.websiteUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Official Site
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{certification.rating.toFixed(1)}</span>
                      <div className="flex items-center space-x-1">
                        {renderStars(certification.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Reviews</span>
                    <span className="font-semibold">{certification.reviewCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Difficulty</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getDifficultyColor(certification.difficulty)}`}>
                      {certification.difficulty}/5
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Popularity</span>
                    <span className="font-semibold">{certification.popularity}/100</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Certifications */}
            <Card>
              <CardHeader>
                <CardTitle>Related Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm">
                  Related certifications will be shown here based on domain and issuer.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationDetailPage;
