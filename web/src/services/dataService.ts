import React from 'react';
import axios from 'axios';
import type { 
  Certification, 
  Issuer, 
  Domain, 
  Ranking, 
  SearchFilters, 
  ApiResponse,
  Stats,
  Review,
  NewsArticle
} from '../types';
import { getDomainIcon, getDomainMeta } from '../config/domains';
// Import fallback data for local development (keep for potential use)
// import certificationsData from '../data/certifications.json';

// Data fetching utilities for static JSON endpoints
export async function getManifest() {
  const res = await fetch('/data/manifest.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('manifest fetch failed');
  return res.json();
}

export async function getRankingsToday() {
  const res = await fetch('/data/rankings/today.json', { cache: 'no-cache' });
  if (!res.ok) return [];
  return res.json();
}

export async function getTrends() {
  const res = await fetch('/data/rankings/trends.json', { cache: 'no-cache' });
  if (!res.ok) return {};
  return res.json();
}

export async function getCertIndex() {
  // Import sharded service dynamically to avoid circular dependencies
  const { shardedDataService } = await import('./shardedDataService');
  return shardedDataService.getAllCertifications();
}

export async function getCompaniesByDomain() {
  const res = await fetch('/data/companies/by_domain.json', { cache: 'no-cache' });
  if (!res.ok) return {};
  return res.json();
}

export async function getCompanyRecommendations() {
  const res = await fetch('/data/companies/recommendations.json', { cache: 'no-cache' });
  if (!res.ok) return {};
  return res.json();
}

export async function getDemandMetrics() {
  const res = await fetch('/data/demand/metrics.json', { cache: 'no-cache' });
  if (!res.ok) return [];
  return res.json();
}

export async function getRoleSalaries() {
  const res = await fetch('/data/salaries/role_salaries.json', { cache: 'no-cache' });
  if (!res.ok) return {};
  return res.json();
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_BASE_URL || ''
  : import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging (only in development)
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// Transform JSON data to match our Certification interface
const transformCertification = (item: any): Certification => ({
  id: item.slug, // Use slug as the ID since our data doesn't have numeric IDs
  name: item.name,
  slug: item.slug,
  description: `${item.name} certification from ${item.issuer}`,
  issuer: item.issuer,
  issuerSlug: item.issuer.toLowerCase().replace(/\s+/g, '-'),
  domain: item.domain,
  domainSlug: item.domain.toLowerCase().replace(/\s+/g, '-'),
  level: item.level || 'Associate',
  duration: item.recommended_hours_min && item.recommended_hours_max 
    ? `${item.recommended_hours_min}-${item.recommended_hours_max} hours`
    : 'Variable duration',
  cost: item.exam_fee_usd || 0,
  currency: 'USD', // Default currency since our data doesn't include this
  rating: Math.random() * 2 + 3, // Generate rating between 3-5 since we don't have this in our data
  reviewCount: Math.floor(Math.random() * 1000) + 100, // Mock review count
  difficulty: Math.min(5, Math.max(1, Math.round(Math.random() * 2 + 3))), // Generate difficulty 3-5
  popularity: Math.floor(Math.random() * 100),
  ranking: item.rank, // This will be set when we have ranking data
  tags: [item.domain, item.level].filter(Boolean),
  prerequisites: [],
  skills: [],
  examFormat: item.format || 'Multiple choice',
  validityPeriod: item.validity_years ? `${item.validity_years} years` : 'Lifetime',
  renewalRequired: item.validity_years ? item.validity_years < 10 : false,
  websiteUrl: item.url,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const dataService = {
  // Certifications
  async getCertifications(filters: SearchFilters = {}, page = 1, pageSize = 12): Promise<ApiResponse<Certification[]>> {
    // Use enhanced data service for better performance with massive dataset
    const { enhancedDataService } = await import('./enhancedDataService');
    const result = await enhancedDataService.searchCertifications(filters, page, pageSize);
    
    // Transform enhanced service data to match our interface
    const transformedData = result.data.map((item: any): Certification => ({
      id: item.slug,
      name: item.name,
      slug: item.slug,
      description: item.description || `${item.name} certification from ${item.issuer}`,
      issuer: item.issuer,
      issuerSlug: item.issuer.toLowerCase().replace(/\s+/g, '-'),
      domain: item.domain,
      domainSlug: item.domain.toLowerCase().replace(/\s+/g, '-'),
      level: item.level,
      duration: item.duration,
      cost: item.cost,
      currency: item.currency || 'USD',
      rating: item.rating,
      reviewCount: item.total_reviews || 100,
      difficulty: ['Beginner', 'Intermediate', 'Advanced'].indexOf(item.difficulty) + 1 || 3,
      popularity: item.job_postings || 0,
      ranking: item.ranking,
      tags: [item.domain, item.level].filter(Boolean),
      prerequisites: item.prerequisites || [],
      skills: item.skills || [],
      examFormat: item.exam_format || 'Multiple choice',
      validityPeriod: item.validity_years ? `${item.validity_years} years` : 'Lifetime',
      renewalRequired: item.validity_years ? item.validity_years < 10 : false,
      websiteUrl: '',
      createdAt: item.created_at || new Date().toISOString(),
      updatedAt: item.updated_at || new Date().toISOString()
    }));
    
    return {
      data: transformedData,
      pagination: result.pagination,
      success: true
    };
  },

  async getCertification(slug: string): Promise<Certification> {
    // Use enhanced data service for better performance
    const { enhancedDataService } = await import('./enhancedDataService');
    const cert = await enhancedDataService.getCertificationBySlug(slug);
    if (!cert) throw new Error('Certification not found');
    
    // Transform enhanced service data to match our interface
    return {
      id: cert.slug,
      name: cert.name,
      slug: cert.slug,
      description: cert.description || `${cert.name} certification from ${cert.issuer}`,
      issuer: cert.issuer,
      issuerSlug: cert.issuer.toLowerCase().replace(/\s+/g, '-'),
      domain: cert.domain,
      domainSlug: cert.domain.toLowerCase().replace(/\s+/g, '-'),
      level: cert.level,
      duration: cert.duration,
      cost: cert.cost,
      currency: cert.currency || 'USD',
      rating: cert.rating,
      reviewCount: cert.reviewCount || 100,
      difficulty: typeof cert.difficulty === 'string' ? ['Beginner', 'Intermediate', 'Advanced'].indexOf(cert.difficulty) + 1 || 3 : 3,
      popularity: cert.popularity || 0,
      ranking: cert.ranking,
      tags: [cert.domain, cert.level].filter(Boolean),
      prerequisites: cert.prerequisites || [],
      skills: cert.skills || [],
      examFormat: cert.examFormat || 'Multiple choice',
      validityPeriod: cert.validityPeriod ? `${cert.validityPeriod} years` : 'Lifetime',
      renewalRequired: cert.renewalRequired || false,
      websiteUrl: '',
      createdAt: cert.createdAt || new Date().toISOString(),
      updatedAt: cert.updatedAt || new Date().toISOString()
    };
  },

  async getCertificationReviews(_certificationId: string, page = 1, pageSize = 10): Promise<ApiResponse<Review[]>> {
    // Mock reviews for now
    return {
      data: [],
      pagination: { page, pageSize, total: 0, totalPages: 0 },
      success: true
    };
  },

  // Rankings
  async getTopRankings(domain?: string, limit = 10): Promise<Ranking[]> {
    const rankingsData = await getRankingsToday();
    
    // Load all certification data from domain files
    const allCerts = await this.loadAllDomainCertifications();
    
    // Create cert lookup
    const certLookup = Object.fromEntries(
      allCerts.map((cert: any) => [cert.slug, cert])
    );
    
    let filteredRankings = rankingsData;
    
    if (domain && domain !== 'all') {
      filteredRankings = rankingsData.filter((ranking: any) => 
        ranking.domain === domain
      );
    }
    
    const rankingPromises = filteredRankings.slice(0, limit).map(async (ranking: any) => {
      const cert = certLookup[ranking.slug];
      if (!cert) {
        console.warn(`Certificate not found for ranking slug: ${ranking.slug}`);
        return null;
      }
      
      const transformedCert = transformCertification(cert);
      const salaryScore = await this.getSalaryScore(cert.domain, cert);
      
      return {
        id: ranking.slug,
        certificationId: ranking.slug,
        certification: {
          ...transformedCert,
          rating: ranking.rating || transformedCert.rating,
          reviewCount: ranking.job_postings * 10 || transformedCert.reviewCount
        },
        domain: ranking.domain,
        position: ranking.rank,
        score: ranking.score * 20, // Use actual ranking score
        criteria: {
          popularity: Math.min(100, Math.round((ranking.job_postings || 0) / 50)), // Scale job postings to 0-100
          difficulty: this.getDifficultyScore(cert.level),
          rating: Math.round((ranking.rating || 4) * 20),
          marketDemand: Math.min(100, Math.round((ranking.job_postings || 0) / 30)), // Different scaling for market demand
          salaryImpact: salaryScore
        },
        lastUpdated: new Date().toISOString()
      };
    });
    
    const results = await Promise.all(rankingPromises);
    return results.filter(Boolean);
  },

  // Helper method to load all certifications from domain files
  async loadAllDomainCertifications(): Promise<any[]> {
    const manifest = await getManifest();
    const domainFiles = Object.keys(manifest.shards || {}).map(domain => 
      `/data/certifications/${domain}.json`
    );
    
    const certPromises = domainFiles.map(async (file) => {
      try {
        const res = await fetch(file, { cache: 'no-cache' });
        if (!res.ok) return [];
        return await res.json();
      } catch (error) {
        console.warn(`Failed to load ${file}:`, error);
        return [];
      }
    });
    
    const certArrays = await Promise.all(certPromises);
    return certArrays.flat();
  },

  // Helper method to get difficulty score based on level
  getDifficultyScore(level: string): number {
    const difficultyMap: { [key: string]: number } = {
      'Foundational': 20,
      'Associate': 40, 
      'Professional': 60,
      'Expert': 80,
      'Specialty': 70
    };
    return difficultyMap[level] || 40;
  },

  // Helper method to get salary impact score
  async getSalaryScore(domain: string, _cert: any): Promise<number> {
    try {
      const salaryData = await getRoleSalaries();
      
      // Map domains to relevant roles
      const domainRoleMap: { [key: string]: string[] } = {
        'cs-it': ['Cloud Engineer', 'DevOps Engineer', 'Software Engineer', 'Security Analyst'],
        'cybersecurity': ['Security Analyst', 'Information Security Manager', 'Cybersecurity Specialist'],
        'cloud-computing': ['Cloud Engineer', 'Cloud Architect', 'DevOps Engineer'],
        'data-science': ['Data Scientist', 'Machine Learning Engineer', 'Data Analyst'],
        'finance': ['Financial Analyst', 'Risk Manager', 'Investment Analyst']
      };
      
      const relevantRoles = domainRoleMap[domain] || [];
      if (relevantRoles.length === 0) return 50; // Default score
      
      // Get median salaries for relevant roles
      const salaries = relevantRoles
        .map(role => salaryData[role]?.median_usd)
        .filter(Boolean);
      
      if (salaries.length === 0) return 50;
      
      const avgSalary = salaries.reduce((sum, salary) => sum + salary, 0) / salaries.length;
      
      // Convert salary to 0-100 scale (assuming 50k-200k range)
      return Math.min(100, Math.max(0, Math.round((avgSalary - 50000) / 1500)));
    } catch (error) {
      console.warn('Error calculating salary score:', error);
      return 50; // Default fallback
    }
  },

  async getDomainRankings(domainSlug: string): Promise<Ranking[]> {
    return this.getTopRankings(domainSlug, 50);
  },

  // Domains
  async getDomains(): Promise<Domain[]> {
    // Use the manifest for accurate domain data
    const manifest = await getManifest();
    return Object.entries(manifest.domains_meta).map(([slug, meta]: [string, any]) => ({
      id: slug,
      name: meta.label,
      slug: slug,
      description: `${meta.label} certifications`,
      icon: getDomainIcon(slug),
      emoji: meta.emoji,
      color: getDomainMeta(slug)?.color || '#3B82F6', // Use domain color from config
      certificationCount: meta.certification_count,
      averageRating: 4.1, // Use manifest data later
      trending: meta.job_market_strength === 'Growing'
    }));
  },

  async getDomains_old(): Promise<Domain[]> {
    const rawData = await getCertIndex();
    const domains = [...new Set(rawData.map((item: any) => item.domain))];
    
    // Helper function to get domain emoji
    const getDomainEmoji = (domainName: string) => {
      const domainLower = domainName.toLowerCase();
      if (domainLower.includes('cs') || domainLower.includes('it')) return '💻';
      if (domainLower.includes('finance')) return '💰';
      if (domainLower.includes('food')) return '🍽️';
      if (domainLower.includes('legal') && !domainLower.includes('compliance')) return '⚖️';
      if (domainLower.includes('devops') || domainLower.includes('cloud')) return '☁️';
      if (domainLower.includes('design') || domainLower.includes('creative')) return '🎨';
      if (domainLower.includes('supply')) return '🚛';
      if (domainLower.includes('language')) return '🌍';
      if (domainLower.includes('aviation')) return '✈️';
      if (domainLower.includes('audio') && domainLower.includes('engineering')) return '🎧';
      if (domainLower.includes('healthcare')) return '🏥';
      if (domainLower.includes('hospitality')) return '🏨';
      if (domainLower.includes('maritime')) return '⚓';
      if (domainLower.includes('sustainability')) return '🌱';
      if (domainLower.includes('fitness') || domainLower.includes('wellness')) return '💪';
      if (domainLower.includes('audio') && domainLower.includes('production')) return '🎵';
      if (domainLower.includes('engineering') && !domainLower.includes('audio')) return '⚙️';
      if (domainLower.includes('data') && domainLower.includes('protection')) return '🔒';
      if (domainLower.includes('math') || domainLower.includes('actuarial')) return '📊';
      if (domainLower.includes('service') && domainLower.includes('management')) return '🖥️';
      if (domainLower.includes('project') && domainLower.includes('management')) return '📋';
      if (domainLower.includes('government') || domainLower.includes('defense')) return '🏛️';
      if (domainLower.includes('energy')) return '⚡';
      if (domainLower.includes('compliance')) return '✅';
      if (domainLower.includes('cybersecurity')) return '🛡️';
      if (domainLower.includes('education')) return '🎓';
      if (domainLower.includes('privacy')) return '🔐';
      if (domainLower.includes('culinary')) return '👨‍🍳';
      if (domainLower.includes('architecture')) return '🏗️';
      if (domainLower.includes('governance')) return '🏛️';
      return '📊'; // default emoji
    };

    // Helper function to get domain color
    const getDomainColor = (domainName: string) => {
      const domainLower = domainName.toLowerCase();
      if (domainLower.includes('cs') || domainLower.includes('it')) return '#3B82F6'; // Blue
      if (domainLower.includes('finance')) return '#10B981'; // Emerald
      if (domainLower.includes('food')) return '#F59E0B'; // Amber
      if (domainLower.includes('legal') && !domainLower.includes('compliance')) return '#7C3AED'; // Violet
      if (domainLower.includes('devops') || domainLower.includes('cloud')) return '#06B6D4'; // Cyan
      if (domainLower.includes('design') || domainLower.includes('creative')) return '#EC4899'; // Pink
      if (domainLower.includes('supply')) return '#8B5CF6'; // Purple
      if (domainLower.includes('language')) return '#14B8A6'; // Teal
      if (domainLower.includes('aviation')) return '#0EA5E9'; // Sky
      if (domainLower.includes('audio') && domainLower.includes('engineering')) return '#F97316'; // Orange
      if (domainLower.includes('healthcare')) return '#DC2626'; // Red
      if (domainLower.includes('hospitality')) return '#C026D3'; // Fuchsia
      if (domainLower.includes('maritime')) return '#1D4ED8'; // Blue-700
      if (domainLower.includes('sustainability')) return '#16A34A'; // Green
      if (domainLower.includes('fitness') || domainLower.includes('wellness')) return '#EA580C'; // Orange-600
      if (domainLower.includes('audio') && domainLower.includes('production')) return '#BE185D'; // Rose-700
      if (domainLower.includes('engineering') && !domainLower.includes('audio')) return '#374151'; // Gray-700
      if (domainLower.includes('data') && domainLower.includes('protection')) return '#991B1B'; // Red-800
      if (domainLower.includes('math') || domainLower.includes('actuarial')) return '#1E40AF'; // Blue-800
      if (domainLower.includes('service') && domainLower.includes('management')) return '#059669'; // Emerald-600
      if (domainLower.includes('project') && domainLower.includes('management')) return '#7C2D12'; // Orange-900
      if (domainLower.includes('government') || domainLower.includes('defense')) return '#1F2937'; // Gray-800
      if (domainLower.includes('energy')) return '#FBBF24'; // Yellow-400
      if (domainLower.includes('compliance')) return '#16A34A'; // Green-600
      if (domainLower.includes('cybersecurity')) return '#DC2626'; // Red-600
      if (domainLower.includes('education')) return '#2563EB'; // Blue-600
      if (domainLower.includes('privacy')) return '#7C3AED'; // Violet-600
      if (domainLower.includes('culinary')) return '#F59E0B'; // Amber-500
      if (domainLower.includes('architecture')) return '#6B7280'; // Gray-500
      if (domainLower.includes('governance')) return '#374151'; // Gray-700
      return '#8B5CF6'; // Default purple
    };

    return domains.map((domain, index) => ({
      id: (index + 1).toString(),
      name: domain as string,
      slug: (domain as string).toLowerCase().replace(/\s+/g, '-'),
      description: `${domain} certifications`,
      icon: () => React.createElement('span', null, getDomainEmoji(domain as string)),
      emoji: getDomainEmoji(domain as string),
      color: getDomainColor(domain as string),
      certificationCount: rawData.filter((item: any) => item.domain === domain).length,
      averageRating: 4.3,
      trending: true
    }));
  },

  async getDomain(slug: string): Promise<Domain> {
    const domains = await this.getDomains();
    const domain = domains.find(d => d.slug === slug);
    if (!domain) throw new Error('Domain not found');
    return domain;
  },

  // Issuers
  async getIssuers(): Promise<Issuer[]> {
    const rawData = await getCertIndex();
    const issuers = [...new Set(rawData.map((item: any) => item.issuer))];
    return issuers.map((issuer, index) => ({
      id: (index + 1).toString(),
      name: issuer as string,
      slug: (issuer as string).toLowerCase().replace(/\s+/g, '-'),
      description: `${issuer} certifications`,
      website: 'https://example.com',
      logoUrl: '/images/logos/default-logo.png',
      certificationCount: rawData.filter((item: any) => item.issuer === issuer).length,
      averageRating: 4.3,
      establishedYear: 2000,
      headquarters: 'Global',
      specialties: ['Technology']
    }));
  },

  async getIssuer(slug: string): Promise<Issuer> {
    const issuers = await this.getIssuers();
    const issuer = issuers.find(i => i.slug === slug);
    if (!issuer) throw new Error('Issuer not found');
    return issuer;
  },

  // Search
  async searchCertifications(query: string, filters: SearchFilters = {}): Promise<ApiResponse<Certification[]>> {
    return this.getCertifications({ ...filters, query });
  },

  // Stats
  async getStats(): Promise<Stats> {
    // Use enhanced data service for better performance and accurate stats
    const { enhancedDataService } = await import('./enhancedDataService');
    const stats = await enhancedDataService.getStatistics();
    
    return {
      totalCertifications: stats.totalCertifications,
      totalIssuers: Object.keys(stats.byIssuer).length,
      totalDomains: Object.keys(stats.byDomain).length,
      averageRating: Math.round(stats.averageRating * 10) / 10,
      totalReviews: stats.totalCertifications * 50, // Mock
      mostPopularDomain: Object.keys(stats.byDomain).sort((a, b) => stats.byDomain[b] - stats.byDomain[a])[0] || 'CS/IT',
      mostPopularIssuer: Object.keys(stats.byIssuer).sort((a, b) => stats.byIssuer[b] - stats.byIssuer[a])[0] || 'AWS',
      trendingCertifications: [] // Will be populated by getTrendingCertifications
    };
  },

  // News
  async getNews(_limit = 5): Promise<NewsArticle[]> {
    return []; // Mock
  },

  // Compare
  async compareCertifications(certificationIds: string[]): Promise<Certification[]> {
    const rawData = await getCertIndex();
    return rawData
      .filter((item: any) => certificationIds.includes(item.slug))
      .map(transformCertification);
  },

  // Trending
  async getTrendingCertifications(limit = 8): Promise<Certification[]> {
    // Use enhanced data service to get top certifications by ranking
    const { enhancedDataService } = await import('./enhancedDataService');
    const result = await enhancedDataService.searchCertifications({ sortBy: 'ranking', sortOrder: 'asc' }, 1, limit);
    
    // Transform enhanced service data to match our interface
    return result.data.map((item: any) => ({
      id: item.slug,
      name: item.name,
      slug: item.slug,
      description: item.description || `${item.name} certification from ${item.issuer}`,
      issuer: item.issuer,
      issuerSlug: item.issuer.toLowerCase().replace(/\s+/g, '-'),
      domain: item.domain,
      domainSlug: item.domain.toLowerCase().replace(/\s+/g, '-'),
      level: item.level,
      duration: item.duration,
      cost: item.cost,
      currency: item.currency || 'USD',
      rating: item.rating,
      reviewCount: item.total_reviews || 100,
      difficulty: ['Beginner', 'Intermediate', 'Advanced'].indexOf(item.difficulty) + 1 || 3,
      popularity: item.job_postings || 0,
      ranking: item.ranking,
      tags: [item.domain, item.level].filter(Boolean),
      prerequisites: item.prerequisites || [],
      skills: item.skills || [],
      examFormat: item.exam_format || 'Multiple choice',
      validityPeriod: item.validity_years ? `${item.validity_years} years` : 'Lifetime',
      renewalRequired: item.validity_years ? item.validity_years < 10 : false,
      websiteUrl: '',
      createdAt: item.created_at || new Date().toISOString(),
      updatedAt: item.updated_at || new Date().toISOString()
    }));
  },

  // Recommendations
  async getRecommendations(_userId?: string, _domain?: string): Promise<Certification[]> {
    return this.getTrendingCertifications(8);
  }
};

export default dataService;
