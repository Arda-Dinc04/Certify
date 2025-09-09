import axios from 'axios';
import {
  Monitor,
  DollarSign as FinanceIcon,
  Utensils,
  Scale,
  Cloud,
  Palette,
  Truck,
  Globe,
  Plane,
  Headphones,
  Heart,
  Building,
  Anchor,
  Recycle,
  Dumbbell,
  Music,
  Settings,
  Lock,
  BarChart3,
  Building2,
  Zap,
  Shield,
  GraduationCap,
  CheckCircle,
  ChefHat
} from 'lucide-react';
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
// Helper function to get banner image based on issuer
const getBannerImage = (issuer: string): string | undefined => {
  const issuerLower = issuer.toLowerCase();
  
  // AWS/Amazon
  if (issuerLower.includes('amazon') || issuerLower.includes('aws')) {
    return '/src/assets/aws.jpeg';
  }
  // Microsoft
  else if (issuerLower.includes('microsoft')) {
    return '/src/assets/microsoft.jpg';
  }
  // Google
  else if (issuerLower.includes('google')) {
    return '/src/assets/Google-Logo-PNG.png';
  }
  // Oracle
  else if (issuerLower.includes('oracle')) {
    return '/src/assets/oracle.png';
  }
  // Adobe
  else if (issuerLower.includes('adobe')) {
    return '/src/assets/adobe.png';
  }
  // Docker
  else if (issuerLower.includes('docker')) {
    return '/src/assets/docker.png';
  }
  // FINRA
  else if (issuerLower.includes('finra')) {
    return '/src/assets/finra.png';
  }
  // CAIA Association
  else if (issuerLower.includes('caia')) {
    return '/src/assets/CAIA Association .png';
  }
  // NCEES
  else if (issuerLower.includes('ncees')) {
    return '/src/assets/NCEES.png';
  }
  // Snowflake
  else if (issuerLower.includes('snowflake')) {
    return '/src/assets/Snowflake.png';
  }
  // CFA
  else if (issuerLower.includes('cfa')) {
    return '/src/assets/cfa.jpg';
  }
  // FAA
  else if (issuerLower.includes('faa') || issuerLower.includes('federal aviation')) {
    return '/src/assets/faa.svg';
  }
  // FMCSA
  else if (issuerLower.includes('fmcsa')) {
    return '/src/assets/FMCSA.png';
  }
  // CompTIA
  else if (issuerLower.includes('comptia')) {
    return '/src/assets/comptia.jpeg';
  }
  // For other issuers, we'll use a default or no banner
  // You can add more mappings here as you add more logos
  
  return undefined;
};

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
  bannerImage: getBannerImage(item.issuer),
  logoUrl: getBannerImage(item.issuer),
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
      // Handle domain filtering with proper transformation
      const domainFilter = filters.domain.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '');
      filteredData = filteredData.filter(cert => {
        const certDomain = cert.domain.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '');
        return certDomain.includes(domainFilter);
      });
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
    
    // Helper function to get domain icon component
    const getDomainIcon = (domainName: string) => {
      const domainLower = domainName.toLowerCase();
      if (domainLower.includes('cs') || domainLower.includes('it')) return Monitor;
      if (domainLower.includes('finance')) return FinanceIcon;
      if (domainLower.includes('food')) return Utensils;
      if (domainLower.includes('legal') && !domainLower.includes('compliance')) return Scale;
      if (domainLower.includes('devops') || domainLower.includes('cloud')) return Cloud;
      if (domainLower.includes('design') || domainLower.includes('creative')) return Palette;
      if (domainLower.includes('supply')) return Truck;
      if (domainLower.includes('language')) return Globe;
      if (domainLower.includes('aviation')) return Plane;
      if (domainLower.includes('audio') && domainLower.includes('engineering')) return Headphones;
      if (domainLower.includes('healthcare')) return Heart;
      if (domainLower.includes('hospitality')) return Building;
      if (domainLower.includes('maritime')) return Anchor;
      if (domainLower.includes('sustainability')) return Recycle;
      if (domainLower.includes('fitness') || domainLower.includes('wellness')) return Dumbbell;
      if (domainLower.includes('audio') && domainLower.includes('production')) return Music;
      if (domainLower.includes('engineering') && !domainLower.includes('audio')) return Settings;
      if (domainLower.includes('data') && domainLower.includes('protection')) return Lock;
      if (domainLower.includes('math') || domainLower.includes('actuarial')) return BarChart3;
      if (domainLower.includes('service') && domainLower.includes('management')) return Settings;
      if (domainLower.includes('project') && domainLower.includes('management')) return BarChart3;
      if (domainLower.includes('government') || domainLower.includes('defense')) return Building2;
      if (domainLower.includes('energy')) return Zap;
      if (domainLower.includes('compliance')) return CheckCircle;
      if (domainLower.includes('cybersecurity')) return Shield;
      if (domainLower.includes('education')) return GraduationCap;
      if (domainLower.includes('privacy')) return Lock;
      if (domainLower.includes('culinary')) return ChefHat;
      if (domainLower.includes('architecture')) return Building2;
      if (domainLower.includes('governance')) return Building2;
      return BarChart3; // default icon
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
      name: domain,
      slug: domain.toLowerCase().replace(/\s+/g, '-'),
      description: `${domain} certifications`,
      icon: getDomainIcon(domain),
      color: getDomainColor(domain),
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
