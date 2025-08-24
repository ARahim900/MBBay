import type { Contractor, ContractorAnalytics, ContractorFilters } from '../types/contractor';

/**
 * Advanced request management for contractor API calls
 * Implements request deduplication, batching, and intelligent caching
 */

// ==================== REQUEST DEDUPLICATION ====================

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
  requestKey: string;
}

interface RequestConfig {
  timeout: number;
  retries: number;
  deduplicationWindow: number; // ms
  batchWindow: number; // ms
  maxBatchSize: number;
}

/**
 * Request deduplication manager
 */
export class ContractorRequestManager {
  private static readonly DEFAULT_CONFIG: RequestConfig = {
    timeout: 30000, // 30 seconds
    retries: 3,
    deduplicationWindow: 5000, // 5 seconds
    batchWindow: 100, // 100ms
    maxBatchSize: 10
  };

  private static pendingRequests = new Map<string, PendingRequest<any>>();
  private static batchQueue = new Map<string, {
    requests: Array<{ resolve: Function; reject: Function; params: any }>;
    timer: NodeJS.Timeout;
  }>();
  private static config = this.DEFAULT_CONFIG;

  /**
   * Generate request key for deduplication
   */
  private static generateRequestKey(
    endpoint: string,
    params?: Record<string, any>
  ): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}_${paramString}`;
  }

  /**
   * Configure request manager
   */
  static configure(newConfig: Partial<RequestConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Request manager configured:', this.config);
  }

  /**
   * Execute request with deduplication
   */
  static async executeRequest<T>(
    requestKey: string,
    requestFn: () => Promise<T>,
    skipDeduplication: boolean = false
  ): Promise<T> {
    // Check for existing pending request
    if (!skipDeduplication && this.pendingRequests.has(requestKey)) {
      const pending = this.pendingRequests.get(requestKey)!;
      
      // Check if request is still within deduplication window
      if (Date.now() - pending.timestamp < this.config.deduplicationWindow) {
        console.log(`Deduplicating request: ${requestKey}`);
        return pending.promise as Promise<T>;
      } else {
        // Remove expired request
        this.pendingRequests.delete(requestKey);
      }
    }

    // Create new request
    const promise = this.executeWithRetry(requestFn);
    
    // Store pending request for deduplication
    if (!skipDeduplication) {
      this.pendingRequests.set(requestKey, {
        promise,
        timestamp: Date.now(),
        requestKey
      });
    }

    try {
      const result = await promise;
      
      // Clean up successful request
      this.pendingRequests.delete(requestKey);
      
      return result;
    } catch (error) {
      // Clean up failed request
      this.pendingRequests.delete(requestKey);
      throw error;
    }
  }

  /**
   * Execute request with retry logic
   */
  private static async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      // Add timeout wrapper
      return await Promise.race([
        requestFn(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), this.config.timeout)
        )
      ]);
    } catch (error) {
      if (attempt < this.config.retries) {
        console.log(`Request failed, retrying (${attempt}/${this.config.retries}):`, error);
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.executeWithRetry(requestFn, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Batch multiple requests together
   */
  static async batchRequest<T>(
    batchKey: string,
    params: any,
    batchExecutor: (batchParams: any[]) => Promise<T[]>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // Get or create batch queue
      if (!this.batchQueue.has(batchKey)) {
        this.batchQueue.set(batchKey, {
          requests: [],
          timer: setTimeout(() => this.executeBatch(batchKey, batchExecutor), this.config.batchWindow)
        });
      }

      const batch = this.batchQueue.get(batchKey)!;
      batch.requests.push({ resolve, reject, params });

      // Execute immediately if batch is full
      if (batch.requests.length >= this.config.maxBatchSize) {
        clearTimeout(batch.timer);
        this.executeBatch(batchKey, batchExecutor);
      }
    });
  }

  /**
   * Execute batched requests
   */
  private static async executeBatch<T>(
    batchKey: string,
    batchExecutor: (batchParams: any[]) => Promise<T[]>
  ): Promise<void> {
    const batch = this.batchQueue.get(batchKey);
    if (!batch) return;

    // Remove batch from queue
    this.batchQueue.delete(batchKey);

    try {
      console.log(`Executing batch: ${batchKey} with ${batch.requests.length} requests`);
      
      const batchParams = batch.requests.map(req => req.params);
      const results = await batchExecutor(batchParams);

      // Resolve individual requests
      batch.requests.forEach((request, index) => {
        if (results[index] !== undefined) {
          request.resolve(results[index]);
        } else {
          request.reject(new Error(`Batch result missing for index ${index}`));
        }
      });
    } catch (error) {
      console.error(`Batch execution failed for ${batchKey}:`, error);
      
      // Reject all requests in batch
      batch.requests.forEach(request => {
        request.reject(error);
      });
    }
  }

  /**
   * Clear all pending requests and batches
   */
  static clearAll(): void {
    this.pendingRequests.clear();
    
    // Clear batch timers
    this.batchQueue.forEach(batch => {
      clearTimeout(batch.timer);
    });
    this.batchQueue.clear();
    
    console.log('Cleared all pending requests and batches');
  }

  /**
   * Get request manager statistics
   */
  static getStats(): {
    pendingRequests: number;
    pendingBatches: number;
    config: RequestConfig;
  } {
    return {
      pendingRequests: this.pendingRequests.size,
      pendingBatches: this.batchQueue.size,
      config: this.config
    };
  }
}

// ==================== INTELLIGENT CACHING ====================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  priority: number;
}

interface CacheConfig {
  maxSize: number; // Maximum cache size in MB
  maxEntries: number;
  defaultTTL: number; // Time to live in ms
  cleanupInterval: number; // Cleanup interval in ms
}

/**
 * Intelligent caching with LRU eviction and size management
 */
export class ContractorIntelligentCache {
  private static readonly DEFAULT_CONFIG: CacheConfig = {
    maxSize: 50, // 50MB
    maxEntries: 1000,
    defaultTTL: 30 * 60 * 1000, // 30 minutes
    cleanupInterval: 5 * 60 * 1000 // 5 minutes
  };

  private static cache = new Map<string, CacheEntry<any>>();
  private static config = this.DEFAULT_CONFIG;
  private static cleanupTimer: NodeJS.Timeout | null = null;
  private static currentSize = 0; // Current cache size in bytes

  /**
   * Initialize cache with cleanup timer
   */
  static initialize(config?: Partial<CacheConfig>): void {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Start cleanup timer
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);

    console.log('Intelligent cache initialized:', this.config);
  }

  /**
   * Calculate approximate size of data
   */
  private static calculateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch {
      // Fallback estimation
      return JSON.stringify(data).length * 2; // Rough estimate
    }
  }

  /**
   * Calculate cache priority (higher = more important)
   */
  private static calculatePriority(entry: CacheEntry<any>): number {
    const age = Date.now() - entry.timestamp;
    const recency = Date.now() - entry.lastAccessed;
    const frequency = entry.accessCount;

    // Priority formula: frequency / (age + recency)
    return frequency / (age + recency + 1);
  }

  /**
   * Set cache entry with intelligent eviction
   */
  static set<T>(
    key: string,
    data: T,
    ttl: number = this.config.defaultTTL
  ): void {
    const size = this.calculateSize(data);
    const maxSizeBytes = this.config.maxSize * 1024 * 1024;

    // Check if single entry is too large
    if (size > maxSizeBytes * 0.1) { // Don't cache items larger than 10% of max size
      console.warn(`Cache entry too large: ${key} (${size} bytes)`);
      return;
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessed: Date.now(),
      size,
      priority: 1
    };

    // Remove existing entry if it exists
    if (this.cache.has(key)) {
      const existing = this.cache.get(key)!;
      this.currentSize -= existing.size;
    }

    // Evict entries if necessary
    while (
      (this.currentSize + size > maxSizeBytes || 
       this.cache.size >= this.config.maxEntries) &&
      this.cache.size > 0
    ) {
      this.evictLeastImportant();
    }

    // Add new entry
    this.cache.set(key, entry);
    this.currentSize += size;

    console.log(`Cached: ${key} (${size} bytes, total: ${this.currentSize} bytes)`);
  }

  /**
   * Get cache entry with access tracking
   */
  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.config.defaultTTL) {
      this.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    entry.priority = this.calculatePriority(entry);

    console.log(`Cache hit: ${key} (access count: ${entry.accessCount})`);
    return entry.data as T;
  }

  /**
   * Delete cache entry
   */
  static delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.currentSize -= entry.size;

    console.log(`Cache deleted: ${key}`);
    return true;
  }

  /**
   * Check if key exists and is not expired
   */
  static has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() - entry.timestamp > this.config.defaultTTL) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Evict least important entry based on priority
   */
  private static evictLeastImportant(): void {
    if (this.cache.size === 0) return;

    let leastImportantKey = '';
    let lowestPriority = Infinity;

    // Find entry with lowest priority
    for (const [key, entry] of this.cache.entries()) {
      const priority = this.calculatePriority(entry);
      if (priority < lowestPriority) {
        lowestPriority = priority;
        leastImportantKey = key;
      }
    }

    if (leastImportantKey) {
      console.log(`Evicting least important: ${leastImportantKey} (priority: ${lowestPriority})`);
      this.delete(leastImportantKey);
    }
  }

  /**
   * Cleanup expired entries
   */
  private static cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.config.defaultTTL) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.delete(key));

    if (expiredKeys.length > 0) {
      console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Clear all cache entries
   */
  static clear(): void {
    this.cache.clear();
    this.currentSize = 0;
    console.log('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  static getStats(): {
    entries: number;
    sizeBytes: number;
    sizeMB: number;
    hitRate: number;
    averageAccessCount: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    if (this.cache.size === 0) {
      return {
        entries: 0,
        sizeBytes: 0,
        sizeMB: 0,
        hitRate: 0,
        averageAccessCount: 0,
        oldestEntry: 0,
        newestEntry: 0
      };
    }

    const entries = Array.from(this.cache.values());
    const totalAccess = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const averageAccessCount = totalAccess / entries.length;

    const timestamps = entries.map(entry => entry.timestamp);
    const oldestEntry = Math.min(...timestamps);
    const newestEntry = Math.max(...timestamps);

    // Calculate hit rate (approximation based on access counts)
    const hitRate = averageAccessCount > 1 ? ((averageAccessCount - 1) / averageAccessCount) * 100 : 0;

    return {
      entries: this.cache.size,
      sizeBytes: this.currentSize,
      sizeMB: this.currentSize / (1024 * 1024),
      hitRate,
      averageAccessCount,
      oldestEntry,
      newestEntry
    };
  }

  /**
   * Destroy cache and cleanup
   */
  static destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
    console.log('Intelligent cache destroyed');
  }
}

// ==================== OPTIMIZED API CALLS ====================

/**
 * Optimized contractor API calls with request management
 */
export class OptimizedContractorAPI {
  /**
   * Get all contractors with deduplication and caching
   */
  static async getAllContractors(useCache: boolean = true): Promise<Contractor[]> {
    const cacheKey = 'contractors_all';
    
    // Check intelligent cache first
    if (useCache) {
      const cached = ContractorIntelligentCache.get<Contractor[]>(cacheKey);
      if (cached) {
        console.log('Using intelligent cache for all contractors');
        return cached;
      }
    }

    // Use request deduplication
    const requestKey = 'get_all_contractors';
    
    const result = await ContractorRequestManager.executeRequest(
      requestKey,
      async () => {
        const response = await fetch(
          'https://jpqkoyxnsdzorsadpdvs.supabase.co/rest/v1/contractor_tracker?select=*&order=created_at.desc',
          {
            method: 'GET',
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcWtveXhuc2R6b3JzYWRwZHZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODMwNjcsImV4cCI6MjA3MTA1OTA2N30.6D0kMEPyZVeDi1nUpk_XE8xPIKr6ylHyfjmjG4apPWY',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcWtveXhuc2R6b3JzYWRwZHZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODMwNjcsImV4cCI6MjA3MTA1OTA2N30.6D0kMEPyZVeDi1nUpk_XE8xPIKr6ylHyfjmjG4apPWY',
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      }
    );

    // Cache the result
    if (useCache) {
      ContractorIntelligentCache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Get analytics with batching
   */
  static async getAnalytics(useCache: boolean = true): Promise<ContractorAnalytics> {
    const cacheKey = 'contractor_analytics';
    
    // Check intelligent cache first
    if (useCache) {
      const cached = ContractorIntelligentCache.get<ContractorAnalytics>(cacheKey);
      if (cached) {
        console.log('Using intelligent cache for analytics');
        return cached;
      }
    }

    // Batch analytics requests together
    const batchKey = 'analytics_batch';
    
    const result = await ContractorRequestManager.batchRequest(
      batchKey,
      { type: 'analytics' },
      async (batchParams) => {
        // Execute all analytics requests in parallel
        const [summary, expiring, byService] = await Promise.all([
          this.fetchSummary(),
          this.fetchExpiringContracts(),
          this.fetchContractsByService()
        ]);

        const analytics: ContractorAnalytics = {
          summary,
          expiring,
          byService
        };

        // Return array for batch processing (even though we only have one result)
        return [analytics];
      }
    );

    // Cache the result
    if (useCache) {
      ContractorIntelligentCache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Search contractors with optimized filtering
   */
  static async searchContractors(
    filters: ContractorFilters,
    useCache: boolean = true
  ): Promise<Contractor[]> {
    const cacheKey = `search_${JSON.stringify(filters)}`;
    
    // Check intelligent cache first
    if (useCache) {
      const cached = ContractorIntelligentCache.get<Contractor[]>(cacheKey);
      if (cached) {
        console.log('Using intelligent cache for search');
        return cached;
      }
    }

    // For complex filters, get all data and filter client-side
    if (this.shouldFilterClientSide(filters)) {
      const allContractors = await this.getAllContractors(useCache);
      const filtered = this.filterClientSide(allContractors, filters);
      
      // Cache filtered results
      if (useCache) {
        ContractorIntelligentCache.set(cacheKey, filtered);
      }
      
      return filtered;
    }

    // Use server-side filtering for simple filters
    const requestKey = `search_${JSON.stringify(filters)}`;
    
    const result = await ContractorRequestManager.executeRequest(
      requestKey,
      async () => {
        const url = this.buildSearchURL(filters);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcWtveXhuc2R6b3JzYWRwZHZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODMwNjcsImV4cCI6MjA3MTA1OTA2N30.6D0kMEPyZVeDi1nUpk_XE8xPIKr6ylHyfjmjG4apPWY',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcWtveXhuc2R6b3JzYWRwZHZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0ODMwNjcsImV4cCI6MjA3MTA1OTA2N30.6D0kMEPyZVeDi1nUpk_XE8xPIKr6ylHyfjmjG4apPWY',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      }
    );

    // Cache the result
    if (useCache) {
      ContractorIntelligentCache.set(cacheKey, result);
    }

    return result;
  }

  // Helper methods
  private static async fetchSummary() {
    // Implementation for fetching summary
    return {
      total_contracts: 0,
      active_contracts: 0,
      expired_contracts: 0,
      pending_contracts: 0,
      total_yearly_value: 0,
      average_contract_duration: 0
    };
  }

  private static async fetchExpiringContracts() {
    // Implementation for fetching expiring contracts
    return [];
  }

  private static async fetchContractsByService() {
    // Implementation for fetching contracts by service
    return [];
  }

  private static shouldFilterClientSide(filters: ContractorFilters): boolean {
    // Use client-side filtering for complex searches
    return !!(filters.search || filters.dateRange || filters.serviceCategory);
  }

  private static filterClientSide(contractors: Contractor[], filters: ContractorFilters): Contractor[] {
    // Implement client-side filtering logic
    return contractors.filter(contractor => {
      // Add filtering logic here
      return true;
    });
  }

  private static buildSearchURL(filters: ContractorFilters): string {
    // Build Supabase query URL with filters
    let url = 'https://jpqkoyxnsdzorsadpdvs.supabase.co/rest/v1/contractor_tracker?select=*';
    
    if (filters.status !== 'all') {
      url += `&status=eq.${filters.status}`;
    }
    
    if (filters.contractType !== 'all') {
      url += `&contract_type=eq.${filters.contractType}`;
    }
    
    url += '&order=created_at.desc';
    
    return url;
  }
}

// Initialize intelligent cache on module load
ContractorIntelligentCache.initialize();