/**
 * 性能优化工具函数
 */

/**
 * 防抖函数
 * @param func 需要防抖的函数
 * @param wait 等待时间（毫秒）
 * @param immediate 是否立即执行
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
}

/**
 * 节流函数
 * @param func 需要节流的函数
 * @param limit 时间限制（毫秒）
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      lastResult = func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };
}

/**
 * RequestAnimationFrame 节流
 * 确保函数在每一帧最多执行一次
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;

  return function executedFunction(...args: Parameters<T>) {
    if (rafId) return;

    rafId = requestAnimationFrame(() => {
      func(...args);
      rafId = null;
    });
  };
}

/**
 * 延迟执行
 * @param ms 延迟时间（毫秒）
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * 批量执行任务
 * @param tasks 任务数组
 * @param batchSize 每批次大小
 * @param delayMs 批次间延迟
 */
export async function batchExecute<T>(
  tasks: Array<() => Promise<T>>,
  batchSize: number = 5,
  delayMs: number = 100
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((task) => task()));
    results.push(...batchResults);
    
    if (i + batchSize < tasks.length) {
      await delay(delayMs);
    }
  }
  
  return results;
}

/**
 * 内存化函数
 * 缓存函数结果
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * 检查是否支持 IntersectionObserver
 */
export const supportsIntersectionObserver = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    'IntersectionObserver' in window &&
    'IntersectionObserverEntry' in window &&
    'intersectionRatio' in window.IntersectionObserverEntry.prototype
  );
};

/**
 * 懒加载图片
 */
export function lazyLoadImage(
  imgElement: HTMLImageElement,
  src: string,
  options?: IntersectionObserverInit
): () => void {
  if (!supportsIntersectionObserver()) {
    imgElement.src = src;
    return () => {};
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        imgElement.src = src;
        observer.unobserve(imgElement);
      }
    });
  }, options);

  observer.observe(imgElement);

  return () => observer.disconnect();
}

/**
 * 虚拟滚动辅助函数
 * 计算可见区域的项目范围
 */
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const end = Math.min(totalItems, start + visibleCount + overscan * 2);

  return { start, end };
}

/**
 * 检测设备性能
 * 返回性能等级: low, medium, high
 */
export function detectDevicePerformance(): 'low' | 'medium' | 'high' {
  if (typeof window === 'undefined') return 'medium';

  // 检查硬件并发数
  const cores = navigator.hardwareConcurrency || 2;
  
  // 检查设备内存（如果支持）
  const memory = (navigator as any).deviceMemory || 4;
  
  // 检查连接速度
  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType || '4g';

  // 综合评分
  let score = 0;
  
  if (cores >= 8) score += 3;
  else if (cores >= 4) score += 2;
  else score += 1;
  
  if (memory >= 8) score += 3;
  else if (memory >= 4) score += 2;
  else score += 1;
  
  if (effectiveType === '4g') score += 2;
  else if (effectiveType === '3g') score += 1;

  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

/**
 * 监控性能指标
 */
export function measurePerformance(markName: string): () => number {
  const startMark = `${markName}-start`;
  const endMark = `${markName}-end`;
  
  performance.mark(startMark);
  
  return () => {
    performance.mark(endMark);
    performance.measure(markName, startMark, endMark);
    
    const measure = performance.getEntriesByName(markName)[0];
    const duration = measure.duration;
    
    // 清理标记
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(markName);
    
    return duration;
  };
}

/**
 * 空闲回调执行
 * 在浏览器空闲时执行任务
 */
export function runWhenIdle(
  callback: () => void,
  options?: IdleRequestOptions
): number {
  if ('requestIdleCallback' in window) {
    return requestIdleCallback(callback, options);
  }
  
  // 降级方案
  return setTimeout(callback, 1) as any;
}

/**
 * 取消空闲回调
 */
export function cancelIdle(id: number): void {
  if ('cancelIdleCallback' in window) {
    cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}

/**
 * Web Worker 辅助函数
 * 在 Worker 中执行耗时任务
 */
export function runInWorker<T>(
  workerFunction: (...args: any[]) => T,
  ...args: any[]
): Promise<T> {
  return new Promise((resolve, reject) => {
    const workerCode = `
      self.onmessage = function(e) {
        const result = (${workerFunction.toString()})(...e.data);
        self.postMessage(result);
      }
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    
    worker.onmessage = (e) => {
      resolve(e.data);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
    
    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
    
    worker.postMessage(args);
  });
}

/**
 * 格式化字节大小
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 数字格式化（千分位）
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 简单的对象深拷贝（性能优化版）
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as any;
  if (obj instanceof Object) {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  
  return obj;
}

