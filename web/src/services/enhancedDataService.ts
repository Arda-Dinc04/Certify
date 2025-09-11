/**
 * Enhanced Data Service for CertRank Platform
 * Handles large-scale certification data with caching, pagination, and advanced filtering
 */

import type { 
  Certification, 
  SearchFilters, 
  ApiResponse 
} from '../types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface SearchIndex {
  certifications: Certification[];
  byDomain: Map<string, Certification[]>;
  byIssuer: Map<string, Certification[]>;
  byLevel: Map<string, Certification[]>;
  skillsIndex: Map<string, Set<string>>; // skill -> cert slugs
}

class EnhancedDataService {
  private cache = new Map<string, CacheEntry<any>>();
  private searchIndex: SearchIndex | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;

  /**
   * Get data with intelligent caching
   */
  private async getCachedData<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    const data = await fetcher();
    
    // Implement LRU cache eviction
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + this.CACHE_TTL
    });

    return data;
  }

  /**
   * Initialize search index for fast filtering
   */
  private async initializeSearchIndex(): Promise<SearchIndex> {
    if (this.searchIndex) return this.searchIndex;

    console.log('🔍 Building search index...');
    const startTime = performance.now();

    const allCertifications = await this.getAllCertifications();
    
    const index: SearchIndex = {
      certifications: allCertifications,
      byDomain: new Map(),
      byIssuer: new Map(), 
      byLevel: new Map(),
      skillsIndex: new Map()
    };

    // Build domain index
    allCertifications.forEach(cert => {
      if (!index.byDomain.has(cert.domain)) {
        index.byDomain.set(cert.domain, []);
      }
      index.byDomain.get(cert.domain)!.push(cert);
    });

    // Build issuer index
    allCertifications.forEach(cert => {
      if (!index.byIssuer.has(cert.issuer)) {
        index.byIssuer.set(cert.issuer, []);
      }
      index.byIssuer.get(cert.issuer)!.push(cert);
    });

    // Build level index
    allCertifications.forEach(cert => {
      if (!index.byLevel.has(cert.level)) {
        index.byLevel.set(cert.level, []);
      }
      index.byLevel.get(cert.level)!.push(cert);
    });

    // Build skills index
    allCertifications.forEach(cert => {
      if (cert.skills) {
        cert.skills.forEach(skill => {
          if (!index.skillsIndex.has(skill.toLowerCase())) {
            index.skillsIndex.set(skill.toLowerCase(), new Set());
          }
          index.skillsIndex.get(skill.toLowerCase())!.add(cert.slug);
        });
      }
    });

    this.searchIndex = index;
    
    const endTime = performance.now();
    console.log(`✅ Search index built in ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`📊 Indexed ${allCertifications.length} certifications`);

    return index;
  }

  /**
   * Get all certifications from all domain shards
   */
  async getAllCertifications(): Promise<Certification[]> {
    return this.getCachedData('all-certifications', async () => {
      const manifest = await this.getManifest();
      const domains = Object.keys(manifest.shards);
      
      const certPromises = domains.map(async domain => {
        try {
          const response = await fetch(`/data/certifications/${domain}.json`);
          if (!response.ok) throw new Error(`Failed to fetch ${domain} certifications`);
          return await response.json();
        } catch (error) {
          console.warn(`Failed to load certifications for domain: ${domain}`, error);
          return [];
        }
      });

      const certArrays = await Promise.all(certPromises);
      return certArrays.flat();
    });
  }

  /**
   * Get manifest with caching
   */
  async getManifest() {
    return this.getCachedData('manifest', async () => {
      const response = await fetch('/data/manifest.json');
      if (!response.ok) throw new Error('Failed to fetch manifest');
      return response.json();
    });
  }

  /**
   * Advanced certification search with multiple filters
   */
  async searchCertifications(
    filters: SearchFilters,
    page: number = 1,
    pageSize: number = 12
  ): Promise<ApiResponse<Certification[]>> {
    const index = await this.initializeSearchIndex();
    let results = [...index.certifications];

    // Apply domain filter
    if (filters.domain) {
      results = index.byDomain.get(filters.domain) || [];
    }

    // Apply issuer filter
    if (filters.issuer) {
      const issuerCerts = index.byIssuer.get(filters.issuer) || [];
      results = results.filter(cert => issuerCerts.includes(cert));
    }

    // Apply level filter
    if (filters.level) {
      const levelCerts = index.byLevel.get(filters.level) || [];
      results = results.filter(cert => levelCerts.includes(cert));
    }

    // Apply rating filter
    if (filters.minRating && filters.minRating > 0) {
      results = results.filter(cert => cert.rating >= filters.minRating!);
    }

    // Apply cost filter
    if (filters.maxCost && filters.maxCost < 10000) {
      results = results.filter(cert => cert.cost <= filters.maxCost!);
    }

    // Apply text search
    if (filters.query && filters.query.trim()) {
      const query = filters.query.toLowerCase().trim();
      results = results.filter(cert => {
        const searchableText = [
          cert.name,
          cert.issuer,
          cert.description || '',
          ...(cert.skills || [])
        ].join(' ').toLowerCase();
        
        return searchableText.includes(query);
      });
    }

    // Sort results
    const sortBy = filters.sortBy || 'ranking';
    const sortOrder = filters.sortOrder || 'asc';
    
    results.sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'rating':
          aVal = a.rating;
          bVal = b.rating;
          break;
        case 'cost':
          aVal = a.cost;
          bVal = b.cost;
          break;
        case 'job_postings':
          aVal = a.job_postings || 0;
          bVal = b.job_postings || 0;
          break;
        case 'ranking':
        default:
          aVal = a.ranking || 999;
          bVal = b.ranking || 999;
          break;
      }
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = results.slice(startIndex, endIndex);

    return {
      data: paginatedResults,
      pagination: {
        page,
        pageSize,
        total: results.length,
        totalPages: Math.ceil(results.length / pageSize)
      }
    };
  }

  /**
   * Get certification by slug with enhanced data
   */
  async getCertificationBySlug(slug: string): Promise<Certification | null> {
    const index = await this.initializeSearchIndex();
    return index.certifications.find(cert => cert.slug === slug) || null;
  }

  /**
   * Get related certifications based on domain, issuer, and skills
   */
  async getRelatedCertifications(slug: string, limit: number = 6): Promise<Certification[]> {
    const cert = await this.getCertificationBySlug(slug);
    if (!cert) return [];

    const index = await this.initializeSearchIndex();
    const scores = new Map<string, number>();

    // Score based on domain match (high weight)
    const domainCerts = index.byDomain.get(cert.domain) || [];
    domainCerts.forEach(relatedCert => {
      if (relatedCert.slug !== slug) {
        scores.set(relatedCert.slug, (scores.get(relatedCert.slug) || 0) + 3);
      }
    });

    // Score based on issuer match (medium weight)
    const issuerCerts = index.byIssuer.get(cert.issuer) || [];
    issuerCerts.forEach(relatedCert => {
      if (relatedCert.slug !== slug) {
        scores.set(relatedCert.slug, (scores.get(relatedCert.slug) || 0) + 2);
      }
    });

    // Score based on skill overlap (low weight)
    if (cert.skills) {
      cert.skills.forEach(skill => {
        const skillCerts = index.skillsIndex.get(skill.toLowerCase()) || new Set();
        skillCerts.forEach(certSlug => {
          if (certSlug !== slug) {
            scores.set(certSlug, (scores.get(certSlug) || 0) + 1);
          }
        });
      });
    }

    // Get top related certifications
    const sortedRelated = Array.from(scores.entries())
      .sort(([,scoreA], [,scoreB]) => scoreB - scoreA)
      .slice(0, limit)
      .map(([certSlug]) => index.certifications.find(c => c.slug === certSlug))
      .filter(Boolean) as Certification[];

    return sortedRelated;
  }

  /**
   * Get certification statistics
   */
  async getStatistics() {
    return this.getCachedData('statistics', async () => {
      const index = await this.initializeSearchIndex();
      
      const stats = {
        totalCertifications: index.certifications.length,
        byDomain: Object.fromEntries(
          Array.from(index.byDomain.entries()).map(([domain, certs]) => [domain, certs.length])
        ),
        byIssuer: Object.fromEntries(
          Array.from(index.byIssuer.entries()).map(([issuer, certs]) => [issuer, certs.length])
        ),
        byLevel: Object.fromEntries(
          Array.from(index.byLevel.entries()).map(([level, certs]) => [level, certs.length])
        ),
        averageRating: index.certifications.reduce((sum, cert) => sum + cert.rating, 0) / index.certifications.length,
        averageCost: index.certifications.reduce((sum, cert) => sum + cert.cost, 0) / index.certifications.length,
        totalJobPostings: index.certifications.reduce((sum, cert) => sum + (cert.job_postings || 0), 0),
        topSkills: this.getTopSkills(index),
        priceRanges: this.getPriceRanges(index)
      };

      return stats;
    });
  }

  /**
   * Get top skills across all certifications
   */
  private getTopSkills(index: SearchIndex, limit: number = 20) {
    const skillCounts = new Map<string, number>();
    
    Array.from(index.skillsIndex.entries()).forEach(([skill, certSlugs]) => {
      skillCounts.set(skill, certSlugs.size);
    });

    return Array.from(skillCounts.entries())
      .sort(([,countA], [,countB]) => countB - countA)
      .slice(0, limit)
      .map(([skill, count]) => ({ skill, count }));
  }

  /**
   * Get price distribution data
   */
  private getPriceRanges(index: SearchIndex) {
    const ranges = {
      'Under $100': 0,
      '$100-$300': 0,  
      '$300-$500': 0,
      '$500-$1000': 0,
      'Over $1000': 0
    };

    index.certifications.forEach(cert => {
      const cost = cert.cost;
      if (cost < 100) ranges['Under $100']++;
      else if (cost < 300) ranges['$100-$300']++;
      else if (cost < 500) ranges['$300-$500']++;
      else if (cost < 1000) ranges['$500-$1000']++;
      else ranges['Over $1000']++;
    });

    return ranges;
  }

  /**
   * Search suggestions based on partial input
   */
  async getSearchSuggestions(query: string, limit: number = 10): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const index = await this.initializeSearchIndex();
    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    // Add certification names
    index.certifications.forEach(cert => {
      if (cert.name.toLowerCase().includes(queryLower)) {
        suggestions.add(cert.name);
      }
    });

    // Add issuers
    Array.from(index.byIssuer.keys()).forEach(issuer => {
      if (issuer.toLowerCase().includes(queryLower)) {
        suggestions.add(issuer);
      }
    });

    // Add skills
    Array.from(index.skillsIndex.keys()).forEach(skill => {
      if (skill.includes(queryLower)) {
        suggestions.add(skill);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.cache.clear();
    this.searchIndex = null;
    console.log('🧹 Cache cleared');
  }
}

// Export singleton instance
export const enhancedDataService = new EnhancedDataService();
export default enhancedDataService;