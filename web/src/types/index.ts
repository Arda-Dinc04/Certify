import React from 'react';

export interface Certification {
  id: string;
  name: string;
  slug: string;
  description: string;
  issuer: string;
  issuerSlug: string;
  domain: string;
  domainSlug: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  duration: string;
  cost: number;
  currency: string;
  rating: number;
  reviewCount: number;
  difficulty: number;
  popularity: number;
  ranking: number;
  tags: string[];
  prerequisites: string[];
  skills: string[];
  examFormat: string;
  validityPeriod: string;
  renewalRequired: boolean;
  bannerImage?: string;
  logoUrl?: string;
  websiteUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Issuer {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  logoUrl: string;
  bannerImage?: string;
  certificationCount: number;
  averageRating: number;
  establishedYear: number;
  headquarters: string;
  specialties: string[];
}

export interface Domain {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  certificationCount: number;
  averageRating: number;
  trending: boolean;
}

export interface Ranking {
  id: string;
  certificationId: string;
  certification: Certification;
  domain: string;
  position: number;
  score: number;
  criteria: {
    popularity: number;
    difficulty: number;
    rating: number;
    marketDemand: number;
    salaryImpact: number;
  };
  lastUpdated: string;
}

export interface SearchFilters {
  query?: string;
  domain?: string;
  issuer?: string;
  level?: string;
  minRating?: number;
  maxCost?: number;
  duration?: string;
  tags?: string[];
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: PaginationParams;
  message?: string;
  success: boolean;
}

export interface CompareItem {
  certification: Certification;
  isSelected: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  certifications: string[];
  interests: string[];
  createdAt: string;
}

export interface Review {
  id: string;
  certificationId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  difficulty: number;
  wouldRecommend: boolean;
  examPassed: boolean;
  studyTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  imageUrl?: string;
  tags: string[];
  category: string;
  featured: boolean;
}

export interface Stats {
  totalCertifications: number;
  totalIssuers: number;
  totalDomains: number;
  averageRating: number;
  totalReviews: number;
  mostPopularDomain: string;
  mostPopularIssuer: string;
  trendingCertifications: Certification[];
}
