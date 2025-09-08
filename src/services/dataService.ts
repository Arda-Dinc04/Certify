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
import certificationsData from '../data/certifications.json';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
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
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Transform JSON data to match our Certification interface
const transformCertification = (item: any): Certification => ({
  id: item.id.toString(),
  name: item.name,
  slug: item.slug,
  description: `${item.name} certification from ${item.issuer}`,
  issuer: item.issuer,
  issuerSlug: item.issuer.toLowerCase().replace(/\s+/g, '-'),
  domain: item.domain,
  domainSlug: item.domain.toLowerCase().replace(/\s+/g, '-'),
  level: item.level,
  duration: `${item.recommended_hours_min}-${item.recommended_hours_max} hours`,
  cost: item.exam_fee_usd,
  currency: item.price_currency,
  rating: item.score,
  reviewCount: Math.floor(Math.random() * 1000) + 100, // Mock review count
  difficulty: Math.min(5, Math.max(1, Math.round(item.score))),
  popularity: Math.floor(Math.random() * 100),
  ranking: item.rank,
  tags: [item.domain, item.level, ...(item.job_roles || [])],
  prerequisites: item.prerequisites ? [item.prerequisites] : [],
  skills: item.job_roles || [],
  examFormat: item.format,
  validityPeriod: `${item.validity_years} years`,
  renewalRequired: !!item.renewal_requirements,
  websiteUrl: item.url,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

export const dataService = {
  // Certifications
  async getCertifications(filters: SearchFilters = {}, page = 1, pageSize = 12): Promise<ApiResponse<Certification[]>> {
    // Use local data for now
    let filteredData = certificationsData.map(transformCertification);
    
    // Apply filters
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filteredData = filteredData.filter(cert => 
        cert.name.toLowerCase().includes(query) ||
        cert.issuer.toLowerCase().includes(query) ||
        cert.domain.toLowerCase().includes(query)
      );
    }
    
    if (filters.domain) {
      filteredData = filteredData.filter(cert => 
        cert.domain.toLowerCase().includes(filters.domain!.toLowerCase())
      );
    }
    
    if (filters.issuer) {
      filteredData = filteredData.filter(cert => 
        cert.issuer.toLowerCase().includes(filters.issuer!.toLowerCase())
      );
    }
    
    if (filters.level) {
      filteredData = filteredData.filter(cert => 
        cert.level.toLowerCase() === filters.level!.toLowerCase()
      );
    }
    
    if (filters.minRating) {
      filteredData = filteredData.filter(cert => cert.rating >= filters.minRating!);
    }
    
    if (filters.maxCost) {
      filteredData = filteredData.filter(cert => cert.cost <= filters.maxCost!);
    }
    
    // Sort by rank
    filteredData.sort((a, b) => (a.ranking || 0) - (b.ranking || 0));
    
    // Pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      pagination: {
        page,
        pageSize,
        total: filteredData.length,
        totalPages: Math.ceil(filteredData.length / pageSize)
      },
      success: true
    };
  },

  async getCertification(slug: string): Promise<Certification> {
    const cert = certificationsData.find(item => item.slug === slug);
    if (!cert) throw new Error('Certification not found');
    return transformCertification(cert);
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
    let data = certificationsData.map(transformCertification);
    
    if (domain) {
      data = data.filter(cert => 
        cert.domain.toLowerCase().includes(domain.toLowerCase())
      );
    }
    
    data.sort((a, b) => (a.ranking || 0) - (b.ranking || 0));
    
    return data.slice(0, limit).map(cert => ({
      id: cert.id,
      certificationId: cert.id,
      certification: cert,
      domain: cert.domain,
      position: cert.ranking || 0,
      score: cert.rating * 100,
      criteria: {
        popularity: cert.popularity,
        difficulty: cert.difficulty * 20,
        rating: cert.rating * 20,
        marketDemand: Math.floor(Math.random() * 100),
        salaryImpact: Math.floor(Math.random() * 100)
      },
      lastUpdated: new Date().toISOString()
    }));
  },

  async getDomainRankings(domainSlug: string): Promise<Ranking[]> {
    return this.getTopRankings(domainSlug, 50);
  },

  // Domains
  async getDomains(): Promise<Domain[]> {
    const domains = [...new Set(certificationsData.map(item => item.domain))];
    return domains.map((domain, index) => ({
      id: (index + 1).toString(),
      name: domain,
      slug: domain.toLowerCase().replace(/\s+/g, '-'),
      description: `${domain} certifications`,
      icon: domain === 'CS/IT' ? '💻' : domain === 'Finance' ? '💰' : '📊',
      color: domain === 'CS/IT' ? '#3B82F6' : domain === 'Finance' ? '#10B981' : '#8B5CF6',
      certificationCount: certificationsData.filter(item => item.domain === domain).length,
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
    const issuers = [...new Set(certificationsData.map(item => item.issuer))];
    return issuers.map((issuer, index) => ({
      id: (index + 1).toString(),
      name: issuer,
      slug: issuer.toLowerCase().replace(/\s+/g, '-'),
      description: `${issuer} certifications`,
      website: 'https://example.com',
      logoUrl: '/images/logos/default-logo.png',
      certificationCount: certificationsData.filter(item => item.issuer === issuer).length,
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
    const totalCertifications = certificationsData.length;
    const domains = [...new Set(certificationsData.map(item => item.domain))];
    const issuers = [...new Set(certificationsData.map(item => item.issuer))];
    const averageRating = certificationsData.reduce((sum, item) => sum + item.score, 0) / totalCertifications;
    
    return {
      totalCertifications,
      totalIssuers: issuers.length,
      totalDomains: domains.length,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: totalCertifications * 50, // Mock
      mostPopularDomain: domains[0] || 'CS/IT',
      mostPopularIssuer: issuers[0] || 'AWS',
      trendingCertifications: certificationsData.slice(0, 8).map(transformCertification)
    };
  },

  // News
  async getNews(_limit = 5): Promise<NewsArticle[]> {
    return []; // Mock
  },

  // Compare
  async compareCertifications(certificationIds: string[]): Promise<Certification[]> {
    return certificationsData
      .filter(item => certificationIds.includes(item.id.toString()))
      .map(transformCertification);
  },

  // Trending
  async getTrendingCertifications(limit = 8): Promise<Certification[]> {
    return certificationsData
      .slice(0, limit)
      .map(transformCertification);
  },

  // Recommendations
  async getRecommendations(_userId?: string, _domain?: string): Promise<Certification[]> {
    return this.getTrendingCertifications(8);
  }
};

export default dataService;
