// Global API request cache to prevent duplicate requests
// This cache stores ongoing promises to prevent duplicate requests with the same parameters

interface CacheEntry {
  promise: Promise<any>;
  timestamp: number;
}

class APICache {
  private cache: Map<string, CacheEntry> = new Map();
  private cacheTimeout = 1000; // 1 second - requests within 1 second are considered duplicates

  generateKey(url: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${url}?${sortedParams}`;
  }

  async get(key: string, fetcher: () => Promise<any>): Promise<any> {
    const now = Date.now();
    const existing = this.cache.get(key);

    // If there's a cached request that's still fresh, return it
    if (existing && (now - existing.timestamp) < this.cacheTimeout) {
      console.log(`🔄 Using cached request for: ${key}`);
      return existing.promise;
    }

    // Otherwise, create a new request
    console.log(`🆕 Making new request for: ${key}`);
    const promise = fetcher();
    
    this.cache.set(key, {
      promise,
      timestamp: now
    });

    // Clean up after the promise resolves
    promise
      .then(() => {
        setTimeout(() => {
          this.cache.delete(key);
        }, this.cacheTimeout);
      })
      .catch(() => {
        // Remove immediately on error
        this.cache.delete(key);
      });

    return promise;
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new APICache();

