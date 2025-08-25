import type { Contractor, ContractorAnalytics } from '../types/contractor';

/**
 * ContractorCache - Client-side caching for contractor data
 * Provides offline support and performance optimization
 */
export class ContractorCache {
  private static readonly CACHE_KEYS = {
    CONTRACTORS: 'contractor_data_cache',
    ANALYTICS: 'contractor_analytics_cache',
    LAST_FETCH: 'contractor_last_fetch',
    CACHE_VERSION: 'contractor_cache_version'
  } as const;

  private static CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private static readonly CACHE_VERSION = '1.0.0';

  /**
   * Save contractor data to cache
   */
  static saveContractors(contractors: Contractor[]): void {
    try {
      const cacheData = {
        data: contractors,
        timestamp: Date.now(),
        version: this.CACHE_VERSION
      };

      localStorage.setItem(this.CACHE_KEYS.CONTRACTORS, JSON.stringify(cacheData));
      localStorage.setItem(this.CACHE_KEYS.LAST_FETCH, Date.now().toString());
      
      console.log(`Cached ${contractors.length} contractors`);
    } catch (error) {
      console.warn('Failed to save contractors to cache:', error);
      this.clearExpiredCache(); // Try to free up space
    }
  }

  /**
   * Get contractor data from cache
   */
  static getContractors(): Contractor[] | null {
    try {
      const cachedData = localStorage.getItem(this.CACHE_KEYS.CONTRACTORS);
      if (!cachedData) return null;

      const parsed = JSON.parse(cachedData);
      
      // Check cache version
      if (parsed.version !== this.CACHE_VERSION) {
        console.log('Cache version mismatch, clearing cache');
        this.clearCache();
        return null;
      }

      // Check if cache is expired
      if (this.isCacheExpired(parsed.timestamp)) {
        console.log('Contractor cache expired');
        return null;
      }

      console.log(`Retrieved ${parsed.data.length} contractors from cache`);
      return parsed.data;
    } catch (error) {
      console.warn('Failed to retrieve contractors from cache:', error);
      this.clearCache();
      return null;
    }
  }

  /**
   * Save analytics data to cache
   */
  static saveAnalytics(analytics: ContractorAnalytics): void {
    try {
      const cacheData = {
        data: analytics,
        timestamp: Date.now(),
        version: this.CACHE_VERSION
      };

      localStorage.setItem(this.CACHE_KEYS.ANALYTICS, JSON.stringify(cacheData));
      localStorage.setItem(this.CACHE_KEYS.LAST_FETCH, Date.now().toString());
      console.log('Cached contractor analytics');
    } catch (error) {
      console.warn('Failed to save analytics to cache:', error);
    }
  }

  /**
   * Get analytics data from cache
   */
  static getAnalytics(): ContractorAnalytics | null {
    try {
      const cachedData = localStorage.getItem(this.CACHE_KEYS.ANALYTICS);
      if (!cachedData) return null;

      const parsed = JSON.parse(cachedData);
      
      // Check cache version
      if (parsed.version !== this.CACHE_VERSION) {
        return null;
      }

      // Check if cache is expired
      if (this.isCacheExpired(parsed.timestamp)) {
        return null;
      }

      console.log('Retrieved contractor analytics from cache');
      return parsed.data;
    } catch (error) {
      console.warn('Failed to retrieve analytics from cache:', error);
      return null;
    }
  }

  /**
   * Update a single contractor in cache
   */
  static updateContractorInCache(updatedContractor: Contractor): void {
    try {
      const contractors = this.getContractors();
      if (!contractors) return;

      const index = contractors.findIndex(c => c.id === updatedContractor.id);
      if (index !== -1) {
        contractors[index] = updatedContractor;
        this.saveContractors(contractors);
        console.log(`Updated contractor ${updatedContractor.id} in cache`);
      }
    } catch (error) {
      console.warn('Failed to update contractor in cache:', error);
    }
  }

  /**
   * Add a new contractor to cache
   */
  static addContractorToCache(newContractor: Contractor): void {
    try {
      const contractors = this.getContractors() || [];
      contractors.unshift(newContractor); // Add to beginning
      this.saveContractors(contractors);
      console.log(`Added contractor ${newContractor.id} to cache`);
    } catch (error) {
      console.warn('Failed to add contractor to cache:', error);
    }
  }

  /**
   * Remove a contractor from cache
   */
  static removeContractorFromCache(contractorId: number): void {
    try {
      const contractors = this.getContractors();
      if (!contractors) return;

      const filteredContractors = contractors.filter(c => c.id !== contractorId);
      this.saveContractors(filteredContractors);
      console.log(`Removed contractor ${contractorId} from cache`);
    } catch (error) {
      console.warn('Failed to remove contractor from cache:', error);
    }
  }

  /**
   * Check if cache is expired
   */
  static isCacheExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.CACHE_DURATION;
  }

  /**
   * Check if cache exists and is valid
   */
  static isCacheValid(): boolean {
    try {
      const lastFetch = localStorage.getItem(this.CACHE_KEYS.LAST_FETCH);
      if (!lastFetch) return false;

      return !this.isCacheExpired(parseInt(lastFetch));
    } catch {
      return false;
    }
  }

  /**
   * Get cache age in minutes
   */
  static getCacheAge(): number {
    try {
      const lastFetch = localStorage.getItem(this.CACHE_KEYS.LAST_FETCH);
      if (!lastFetch) return -1;

      const ageMs = Date.now() - parseInt(lastFetch);
      return Math.floor(ageMs / (1000 * 60));
    } catch {
      return -1;
    }
  }

  /**
   * Test helper: set cache duration (ms)
   */
  static __setCacheDurationForTests(durationMs: number): void {
    this.CACHE_DURATION = durationMs;
  }

  /**
   * Clear all contractor cache
   */
  static clearCache(): void {
    try {
      Object.values(this.CACHE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('Cleared contractor cache');
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Clear expired cache entries
   */
  static clearExpiredCache(): void {
    try {
      const contractors = localStorage.getItem(this.CACHE_KEYS.CONTRACTORS);
      const analytics = localStorage.getItem(this.CACHE_KEYS.ANALYTICS);

      if (contractors) {
        const parsed = JSON.parse(contractors);
        if (this.isCacheExpired(parsed.timestamp)) {
          localStorage.removeItem(this.CACHE_KEYS.CONTRACTORS);
        }
      }

      if (analytics) {
        const parsed = JSON.parse(analytics);
        if (this.isCacheExpired(parsed.timestamp)) {
          localStorage.removeItem(this.CACHE_KEYS.ANALYTICS);
        }
      }
    } catch (error) {
      console.warn('Failed to clear expired cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    contractorsCount: number;
    hasAnalytics: boolean;
    cacheAge: number;
    isValid: boolean;
    size: string;
  } {
    const contractors = this.getContractors();
    const analytics = this.getAnalytics();
    const cacheAge = this.getCacheAge();
    const isValid = this.isCacheValid();

    // Calculate approximate cache size
    let size = '0 KB';
    try {
      const contractorData = localStorage.getItem(this.CACHE_KEYS.CONTRACTORS) || '';
      const analyticsData = localStorage.getItem(this.CACHE_KEYS.ANALYTICS) || '';
      const totalSize = contractorData.length + analyticsData.length;
      size = `${Math.round(totalSize / 1024)} KB`;
    } catch {
      // Ignore size calculation errors
    }

    return {
      contractorsCount: contractors?.length || 0,
      hasAnalytics: !!analytics,
      cacheAge,
      isValid,
      size
    };
  }

  /**
   * Preload cache with fresh data
   */
  static async preloadCache(
    fetchContractors: () => Promise<Contractor[]>,
    fetchAnalytics: () => Promise<ContractorAnalytics>
  ): Promise<void> {
    try {
      console.log('Preloading contractor cache...');
      
      const [contractors, analytics] = await Promise.all([
        fetchContractors(),
        fetchAnalytics()
      ]);

      this.saveContractors(contractors);
      this.saveAnalytics(analytics);
      
      console.log('Cache preloaded successfully');
    } catch (error) {
      console.warn('Failed to preload cache:', error);
    }
  }

  /**
   * Smart cache refresh - only refresh if needed
   */
  static shouldRefreshCache(): boolean {
    return !this.isCacheValid() || this.getCacheAge() > 15; // Refresh if older than 15 minutes
  }

  /**
   * Invalidate cache based on data changes
   */
  static invalidateCache(reason: 'data_change' | 'user_action' | 'time_based' | 'manual'): void {
    console.log(`Cache invalidated: ${reason}`);
    this.clearCache();
  }

  /**
   * Selective cache invalidation
   */
  static invalidateContractorCache(contractorId?: number): void {
    if (contractorId) {
      // Remove specific contractor from cache
      this.removeContractorFromCache(contractorId);
      console.log(`Invalidated cache for contractor ${contractorId}`);
    } else {
      // Clear all contractor cache
      localStorage.removeItem(this.CACHE_KEYS.CONTRACTORS);
      console.log('Invalidated all contractor cache');
    }
  }

  /**
   * Cache warming - preload frequently accessed data
   */
  static async warmCache(
    fetchContractors: () => Promise<Contractor[]>,
    fetchAnalytics: () => Promise<ContractorAnalytics>
  ): Promise<void> {
    try {
      console.log('Warming contractor cache...');
      
      // Preload in background without blocking UI
      setTimeout(async () => {
        try {
          const [contractors, analytics] = await Promise.all([
            fetchContractors(),
            fetchAnalytics()
          ]);

          this.saveContractors(contractors);
          this.saveAnalytics(analytics);
          
          console.log('Cache warmed successfully');
        } catch (error) {
          console.warn('Cache warming failed:', error);
        }
      }, 100);
    } catch (error) {
      console.warn('Failed to start cache warming:', error);
    }
  }

  /**
   * Cache compression for large datasets
   */
  static compressCache(): void {
    try {
      const contractors = this.getContractors();
      if (!contractors || contractors.length === 0) return;

      // Remove unnecessary fields for display-only cache
      const compressedContractors = contractors.map(contractor => ({
        id: contractor.id,
        contractor_name: contractor.contractor_name,
        service_provided: contractor.service_provided,
        status: contractor.status,
        contract_type: contractor.contract_type,
        end_date: contractor.end_date,
        contract_yearly_amount: contractor.contract_yearly_amount,
        updated_at: contractor.updated_at
      }));

      // Save compressed version
      const cacheData = {
        data: compressedContractors,
        timestamp: Date.now(),
        version: this.CACHE_VERSION,
        compressed: true
      };

      localStorage.setItem(this.CACHE_KEYS.CONTRACTORS, JSON.stringify(cacheData));
      console.log(`Compressed cache: ${contractors.length} → ${compressedContractors.length} fields per item`);
    } catch (error) {
      console.warn('Failed to compress cache:', error);
    }
  }

  /**
   * Export cache data for debugging
   */
  static exportCacheData(): any {
    try {
      return {
        contractors: this.getContractors(),
        analytics: this.getAnalytics(),
        stats: this.getCacheStats(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to export cache data:', error);
      return null;
    }
  }

  /**
   * Import cache data (for testing or data migration)
   */
  static importCacheData(data: any): boolean {
    try {
      if (data.contractors) {
        this.saveContractors(data.contractors);
      }
      if (data.analytics) {
        this.saveAnalytics(data.analytics);
      }
      console.log('Cache data imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import cache data:', error);
      return false;
    }
  }
}