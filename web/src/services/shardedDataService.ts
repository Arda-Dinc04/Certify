/**
 * Sharded data service for scalable certification loading
 * Supports both sharded and legacy single-file modes
 */

// Import fallback data for local development
import certificationsData from '../data/certifications.json';

interface ShardInfo {
  file: string;
  letters: string;
  count: number;
  size_bytes: number;
}

interface ShardMap {
  shards: ShardInfo[];
  deprecated_files?: string[];
}

interface CertificationCache {
  [shardFile: string]: any[];
}

class ShardedDataService {
  private shardMap: ShardMap | null = null;
  private shardCache: CertificationCache = {};
  private isShardingEnabled = false;

  /**
   * Initialize the sharding system by fetching the shard map
   */
  async initialize(): Promise<void> {
    try {
      const res = await fetch('/data/certifications/index.map.json', { 
        cache: 'force-cache' // Cache shard map aggressively
      });
      
      if (res.ok) {
        this.shardMap = await res.json();
        this.isShardingEnabled = true;
        console.log(`🗂️ Sharding enabled: ${this.shardMap?.shards?.length || 0} shards available`);
      } else {
        console.log('📄 Using legacy single-file mode');
        this.isShardingEnabled = false;
      }
    } catch (error) {
      console.log('📄 Sharding unavailable, using legacy mode:', error);
      this.isShardingEnabled = false;
    }
  }

  /**
   * Get all certifications (loads all shards if needed)
   */
  async getAllCertifications(): Promise<any[]> {
    if (!this.isShardingEnabled || !this.shardMap) {
      return this.getLegacyCertifications();
    }

    // Load all shards in parallel
    const shardPromises = this.shardMap.shards.map(shard => 
      this.loadShard(shard.file)
    );

    const shardResults = await Promise.all(shardPromises);
    return shardResults.flat();
  }

  /**
   * Get certifications by search query (loads relevant shards only)
   */
  async getCertificationsByQuery(query: string): Promise<any[]> {
    if (!this.isShardingEnabled || !this.shardMap) {
      const allCerts = await this.getLegacyCertifications();
      return this.filterByQuery(allCerts, query);
    }

    // For search, we might need to load multiple shards
    // For now, load all shards, but this can be optimized with a search index
    const allCerts = await this.getAllCertifications();
    return this.filterByQuery(allCerts, query);
  }

  /**
   * Get certifications by first letter (loads specific shard only)
   */
  async getCertificationsByLetter(letter: string): Promise<any[]> {
    if (!this.isShardingEnabled || !this.shardMap) {
      const allCerts = await this.getLegacyCertifications();
      return allCerts.filter(cert => 
        cert.name.toLowerCase().startsWith(letter.toLowerCase())
      );
    }

    const targetLetter = letter.toLowerCase();
    const shard = this.shardMap.shards.find(s => 
      s.letters === targetLetter || s.letters.includes(targetLetter)
    );

    if (!shard) {
      console.warn(`No shard found for letter: ${letter}`);
      return [];
    }

    return this.loadShard(shard.file);
  }

  /**
   * Get certification by slug (loads relevant shard only)
   */
  async getCertificationBySlug(slug: string): Promise<any | null> {
    if (!this.isShardingEnabled || !this.shardMap) {
      const allCerts = await this.getLegacyCertifications();
      return allCerts.find(cert => cert.slug === slug) || null;
    }

    // We need to determine which shard contains this cert
    // For now, check all shards, but this can be optimized with an index
    for (const shard of this.shardMap.shards) {
      const certs = await this.loadShard(shard.file);
      const cert = certs.find(c => c.slug === slug);
      if (cert) {
        return cert;
      }
    }

    return null;
  }

  /**
   * Load a specific shard with caching
   */
  private async loadShard(shardFile: string): Promise<any[]> {
    if (this.shardCache[shardFile]) {
      return this.shardCache[shardFile];
    }

    try {
      const res = await fetch(shardFile, { 
        cache: 'force-cache' // Cache shards aggressively
      });
      
      if (!res.ok) {
        throw new Error(`Failed to load shard: ${shardFile}`);
      }

      const data = await res.json();
      this.shardCache[shardFile] = data;
      return data;
    } catch (error) {
      console.error(`Error loading shard ${shardFile}:`, error);
      return [];
    }
  }

  /**
   * Fallback to legacy single-file loading
   */
  private async getLegacyCertifications(): Promise<any[]> {
    try {
      const res = await fetch('/data/certifications/index.json', { cache: 'no-cache' });
      if (!res.ok) {
        // Local fallback for dev
        return certificationsData;
      }
      return res.json();
    } catch (error) {
      console.error('Error loading legacy certifications:', error);
      return certificationsData;
    }
  }

  /**
   * Filter certifications by search query
   */
  private filterByQuery(certs: any[], query: string): any[] {
    if (!query) return certs;
    
    const searchTerms = query.toLowerCase().split(' ');
    return certs.filter(cert => {
      const searchText = `${cert.name} ${cert.issuer} ${cert.domain}`.toLowerCase();
      return searchTerms.every(term => searchText.includes(term));
    });
  }

  /**
   * Get shard statistics
   */
  getShardInfo(): { enabled: boolean; shardCount: number; totalSize: number } | null {
    if (!this.shardMap) {
      return null;
    }

    return {
      enabled: this.isShardingEnabled,
      shardCount: this.shardMap.shards.length,
      totalSize: this.shardMap.shards.reduce((sum, shard) => sum + shard.size_bytes, 0)
    };
  }

  /**
   * Clear cache (useful for development)
   */
  clearCache(): void {
    this.shardCache = {};
    console.log('🗑️ Shard cache cleared');
  }
}

// Create singleton instance
export const shardedDataService = new ShardedDataService();

// Auto-initialize on first import
shardedDataService.initialize().catch(console.error);

export default shardedDataService;