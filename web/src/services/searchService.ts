import Fuse from 'fuse.js';

interface SearchIndexItem {
  slug: string;
  t: string; // Combined search text
}

interface SearchResult {
  item: SearchIndexItem;
  score?: number;
  matches?: Fuse.FuseResultMatch[];
}

class SearchService {
  private fuse: Fuse<SearchIndexItem> | null = null;
  private isInitialized = false;

  /**
   * Initialize the search index
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      const response = await fetch('/data/search/index.jsonl', { 
        cache: 'force-cache' 
      });

      if (!response.ok) {
        throw new Error(`Failed to load search index: ${response.statusText}`);
      }

      const text = await response.text();
      const searchItems: SearchIndexItem[] = text
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));

      // Configure Fuse.js for optimal search performance
      const fuseOptions: Fuse.IFuseOptions<SearchIndexItem> = {
        keys: [
          {
            name: 't',
            weight: 1.0
          }
        ],
        threshold: 0.3, // Lower = more strict matching
        distance: 100,   // Maximum distance for fuzzy matching
        minMatchCharLength: 2,
        includeScore: true,
        includeMatches: true,
        ignoreLocation: true, // Don't weight matches by position
        findAllMatches: false,
        shouldSort: true
      };

      this.fuse = new Fuse(searchItems, fuseOptions);
      this.isInitialized = true;
      
      console.log(`🔍 Search index initialized with ${searchItems.length} items`);
    } catch (error) {
      console.error('Failed to initialize search index:', error);
      // Continue without search functionality
    }
  }

  /**
   * Search for certifications
   */
  search(query: string, limit: number = 20): SearchResult[] {
    if (!this.fuse || !query.trim()) {
      return [];
    }

    // Perform the search
    const results = this.fuse.search(query.trim(), { limit });
    
    return results.map(result => ({
      item: result.item,
      score: result.score,
      matches: result.matches
    }));
  }

  /**
   * Get search suggestions based on partial query
   */
  getSuggestions(query: string, limit: number = 5): string[] {
    if (!this.fuse || query.length < 2) {
      return [];
    }

    const results = this.fuse.search(query, { limit: limit * 2 });
    const suggestions = new Set<string>();

    results.forEach(result => {
      const searchText = result.item.t.toLowerCase();
      const queryLower = query.toLowerCase();
      
      // Extract words that start with the query
      const words = searchText.split(/\s+/);
      words.forEach(word => {
        if (word.startsWith(queryLower) && word !== queryLower && word.length > query.length) {
          suggestions.add(word);
        }
      });

      // Add partial matches from certification names
      if (result.matches) {
        result.matches.forEach(match => {
          if (match.key === 't' && match.indices) {
            match.indices.forEach(([start, end]) => {
              const matchedText = result.item.t.substring(start, end + 1);
              if (matchedText.toLowerCase().includes(queryLower)) {
                // Find word boundaries around the match
                const beforeMatch = result.item.t.substring(0, start);
                const afterMatch = result.item.t.substring(end + 1);
                const lastSpaceBefore = Math.max(0, beforeMatch.lastIndexOf(' ') + 1);
                const firstSpaceAfter = afterMatch.indexOf(' ');
                const wordEnd = firstSpaceAfter === -1 ? result.item.t.length : end + 1 + firstSpaceAfter;
                
                const fullWord = result.item.t.substring(lastSpaceBefore, wordEnd);
                if (fullWord.toLowerCase().includes(queryLower)) {
                  suggestions.add(fullWord.trim());
                }
              }
            });
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Highlight search matches in text
   */
  highlightMatches(text: string, matches?: Fuse.FuseResultMatch[]): string {
    if (!matches || matches.length === 0) {
      return text;
    }

    let highlightedText = text;
    let offset = 0;

    // Sort matches by start position
    const sortedMatches = matches
      .flatMap(match => match.indices || [])
      .sort(([a], [b]) => a - b);

    sortedMatches.forEach(([start, end]) => {
      const before = highlightedText.substring(0, start + offset);
      const matched = highlightedText.substring(start + offset, end + 1 + offset);
      const after = highlightedText.substring(end + 1 + offset);
      
      const highlighted = `<mark class="bg-yellow-200 text-yellow-900 font-medium">${matched}</mark>`;
      highlightedText = before + highlighted + after;
      
      // Update offset for next match
      offset += highlighted.length - matched.length;
    });

    return highlightedText;
  }

  /**
   * Check if search is available
   */
  isAvailable(): boolean {
    return this.isInitialized && this.fuse !== null;
  }

  /**
   * Get search statistics
   */
  getStats(): { itemCount: number; isInitialized: boolean } {
    return {
      itemCount: this.fuse?.getIndex().size || 0,
      isInitialized: this.isInitialized
    };
  }
}

// Create singleton instance
export const searchService = new SearchService();

// Auto-initialize
searchService.initialize().catch(console.error);

export default searchService;