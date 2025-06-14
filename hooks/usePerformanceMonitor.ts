import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;

    // 只在开发环境记录性能数据
    if (process.env.NODE_ENV === 'development') {
      const metrics: PerformanceMetrics = {
        renderTime,
        componentName,
        timestamp: Date.now(),
      };

      // 记录到控制台（可以替换为发送到监控服务）
      if (renderTime > 16) { // 超过一帧的时间
        console.warn(`🐌 Slow render detected in ${componentName}:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          renderCount: renderCount.current,
          threshold: '16ms',
        });
      }

      // 存储到 sessionStorage 用于调试
      const existingMetrics = JSON.parse(
        sessionStorage.getItem('performance-metrics') || '[]'
      );
      existingMetrics.push(metrics);
      
      // 只保留最近100条记录
      if (existingMetrics.length > 100) {
        existingMetrics.splice(0, existingMetrics.length - 100);
      }
      
      sessionStorage.setItem('performance-metrics', JSON.stringify(existingMetrics));
    }
  });

  return {
    renderCount: renderCount.current,
  };
}

// 获取性能指标的工具函数
export function getPerformanceMetrics(): PerformanceMetrics[] {
  if (typeof window === 'undefined') return [];
  
  try {
    return JSON.parse(sessionStorage.getItem('performance-metrics') || '[]');
  } catch {
    return [];
  }
}

// 清除性能指标
export function clearPerformanceMetrics(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('performance-metrics');
  }
} 