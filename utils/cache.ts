// 缓存管理工具
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private cache: Map<string, CacheItem<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 默认5分钟

  // 设置缓存
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  // 获取缓存
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  // 删除缓存
  delete(key: string): void {
    this.cache.delete(key);
  }

  // 清空缓存
  clear(): void {
    this.cache.clear();
  }

  // 检查缓存是否存在且有效
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // 获取或设置缓存
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }

  // 使缓存失效（通过模式匹配）
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // 获取缓存统计信息
  getStats(): {
    size: number;
    keys: string[];
    memoryUsage: string;
  } {
    const keys = Array.from(this.cache.keys());
    const size = this.cache.size;
    
    // 估算内存使用（简化版）
    let totalBytes = 0;
    this.cache.forEach((item) => {
      totalBytes += JSON.stringify(item).length * 2; // UTF-16
    });

    return {
      size,
      keys,
      memoryUsage: `${(totalBytes / 1024).toFixed(2)} KB`,
    };
  }
}

// 创建单例实例
export const cache = new CacheManager();

// API请求缓存包装器
export async function cachedFetch<T>(
  url: string,
  options?: RequestInit,
  ttl?: number
): Promise<T> {
  const cacheKey = `fetch:${url}:${JSON.stringify(options || {})}`;

  return cache.getOrSet(
    cacheKey,
    async () => {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    ttl
  );
}

// 预加载数据
export function preloadData(urls: string[]): void {
  urls.forEach(url => {
    // 在后台预加载数据
    cachedFetch(url).catch(console.error);
  });
}

// React Hook - 使用缓存的数据获取
import { useState, useEffect } from 'react';

interface UseCachedDataOptions {
  ttl?: number;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCachedDataOptions = {}
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { ttl, onError, enabled = true } = options;

  const fetchData = async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);
      const result = await cache.getOrSet(key, fetcher, ttl);
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [key, enabled]);

  const refetch = async () => {
    cache.delete(key);
    await fetchData();
  };

  return { data, loading, error, refetch };
}

// 批量请求优化
export async function batchFetch<T>(
  requests: Array<{
    url: string;
    options?: RequestInit;
    ttl?: number;
  }>
): Promise<T[]> {
  return Promise.all(
    requests.map(({ url, options, ttl }) =>
      cachedFetch<T>(url, options, ttl)
    )
  );
}

// 请求去重
const pendingRequests = new Map<string, Promise<any>>();

export async function deduplicatedFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const key = `${url}:${JSON.stringify(options || {})}`;
  
  // 如果已有相同请求在进行中，返回现有的Promise
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)!;
  }

  // 创建新请求
  const promise = fetch(url, options)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .finally(() => {
      // 请求完成后清理
      pendingRequests.delete(key);
    });

  pendingRequests.set(key, promise);
  return promise;
} 