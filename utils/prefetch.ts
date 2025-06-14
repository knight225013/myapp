// 数据预取策略
import { cache } from './cache';

// 预取配置
interface PrefetchConfig {
  url: string;
  ttl?: number;
  priority?: 'high' | 'low';
  dependencies?: string[];
}

class PrefetchManager {
  private queue: PrefetchConfig[] = [];
  private isProcessing = false;
  private observer: IntersectionObserver | null = null;

  constructor() {
    // 初始化 Intersection Observer 用于视口检测
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const element = entry.target as HTMLElement;
              const prefetchData = element.dataset.prefetch;
              if (prefetchData) {
                try {
                  const config = JSON.parse(prefetchData);
                  this.prefetch(config);
                } catch (error) {
                  console.error('Invalid prefetch config:', error);
                }
              }
            }
          });
        },
        { rootMargin: '50px' }
      );
    }
  }

  // 添加预取任务
  prefetch(config: PrefetchConfig | PrefetchConfig[]): void {
    const configs = Array.isArray(config) ? config : [config];
    
    configs.forEach(cfg => {
      // 检查是否已缓存
      if (!cache.has(`fetch:${cfg.url}:{}`)) {
        this.queue.push(cfg);
      }
    });

    this.processQueue();
  }

  // 处理预取队列
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    // 按优先级排序
    this.queue.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return 0;
    });

    // 使用 requestIdleCallback 在空闲时处理
    if ('requestIdleCallback' in window) {
      requestIdleCallback(
        (deadline) => {
          while (deadline.timeRemaining() > 0 && this.queue.length > 0) {
            const config = this.queue.shift()!;
            this.executePrefetch(config);
          }
          this.isProcessing = false;
          if (this.queue.length > 0) {
            this.processQueue();
          }
        },
        { timeout: 2000 }
      );
    } else {
      // 降级方案
      const config = this.queue.shift()!;
      await this.executePrefetch(config);
      this.isProcessing = false;
      if (this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 100);
      }
    }
  }

  // 执行预取
  private async executePrefetch(config: PrefetchConfig): Promise<void> {
    try {
      const response = await fetch(config.url);
      if (response.ok) {
        const data = await response.json();
        cache.set(`fetch:${config.url}:{}`, data, config.ttl);
      }
    } catch (error) {
      console.error('Prefetch failed:', config.url, error);
    }
  }

  // 观察元素进入视口
  observe(element: HTMLElement): void {
    this.observer?.observe(element);
  }

  // 停止观察
  unobserve(element: HTMLElement): void {
    this.observer?.unobserve(element);
  }

  // 清理
  disconnect(): void {
    this.observer?.disconnect();
  }
}

// 创建单例
export const prefetchManager = new PrefetchManager();

// React Hook - 预取数据
import { useEffect, useRef } from 'react';

export function usePrefetch(
  config: PrefetchConfig | PrefetchConfig[] | null,
  dependencies: any[] = []
): void {
  useEffect(() => {
    if (config) {
      prefetchManager.prefetch(config);
    }
  }, dependencies);
}

// React Hook - 视口预取
export function useViewportPrefetch(
  config: PrefetchConfig
): (element: HTMLElement | null) => void {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return () => {
      if (elementRef.current) {
        prefetchManager.unobserve(elementRef.current);
      }
    };
  }, []);

  return (element: HTMLElement | null) => {
    if (elementRef.current) {
      prefetchManager.unobserve(elementRef.current);
    }

    if (element) {
      element.dataset.prefetch = JSON.stringify(config);
      prefetchManager.observe(element);
      elementRef.current = element;
    }
  };
}

// 路由预取
export function prefetchRoute(route: string): void {
  const routeConfigs: Record<string, PrefetchConfig[]> = {
    '/waybill': [
      { url: 'http://localhost:4000/api/waybills?page=1&limit=30&type=FBA', ttl: 300000 },
      { url: 'http://localhost:4000/api/waybills/status-counts', ttl: 60000 },
      { url: 'http://localhost:4000/api/channels', ttl: 600000 },
    ],
    '/channels': [
      { url: '/api/channels', ttl: 300000 },
    ],
    '/finance': [
      { url: '/api/finance/overview', ttl: 300000 },
      { url: '/api/finance/recent-transactions', ttl: 60000 },
    ],
  };

  const configs = routeConfigs[route];
  if (configs) {
    prefetchManager.prefetch(configs);
  }
}

// 智能预取 - 基于用户行为
export class SmartPrefetch {
  private userPatterns: Map<string, number> = new Map();
  private threshold = 3; // 访问次数阈值

  // 记录用户访问
  recordVisit(route: string): void {
    const count = this.userPatterns.get(route) || 0;
    this.userPatterns.set(route, count + 1);

    // 如果访问频繁，自动预取
    if (count + 1 >= this.threshold) {
      prefetchRoute(route);
    }
  }

  // 预测下一个可能访问的路由
  predictNextRoute(currentRoute: string): string[] {
    const routeTransitions: Record<string, string[]> = {
      '/': ['/waybill', '/finance'],
      '/waybill': ['/waybill/create', '/channels'],
      '/channels': ['/channels/price-maintenance', '/waybill'],
      '/finance': ['/finance/invoices', '/finance/reports'],
    };

    return routeTransitions[currentRoute] || [];
  }

  // 预取可能的下一个路由
  prefetchPredicted(currentRoute: string): void {
    const predictedRoutes = this.predictNextRoute(currentRoute);
    predictedRoutes.forEach(route => {
      // 延迟预取，避免影响当前页面
      setTimeout(() => prefetchRoute(route), 1000);
    });
  }
}

export const smartPrefetch = new SmartPrefetch();

// 网络状态感知预取
export function adaptivePrefetch(config: PrefetchConfig): void {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    
    // 只在良好网络条件下预取
    if (
      connection.effectiveType === '4g' ||
      connection.effectiveType === 'wifi' ||
      !connection.saveData
    ) {
      prefetchManager.prefetch(config);
    }
  } else {
    // 降级方案：总是预取
    prefetchManager.prefetch(config);
  }
} 