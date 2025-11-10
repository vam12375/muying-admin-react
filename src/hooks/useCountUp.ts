import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  easingFn?: (t: number, b: number, c: number, d: number) => number;
}

/**
 * 高性能数字滚动动画 Hook
 * 使用 requestAnimationFrame 实现流畅的数字递增效果
 */
export const useCountUp = ({
  start = 0,
  end,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  easingFn = easeOutExpo
}: UseCountUpOptions) => {
  const [count, setCount] = useState<string>(formatNumber(start, decimals, separator, prefix, suffix));
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const startValueRef = useRef<number>(start);

  useEffect(() => {
    startValueRef.current = start;
    startTimeRef.current = undefined;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);

      const currentValue = easingFn(
        percentage,
        startValueRef.current,
        end - startValueRef.current,
        1
      );

      setCount(formatNumber(currentValue, decimals, separator, prefix, suffix));

      if (percentage < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(formatNumber(end, decimals, separator, prefix, suffix));
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration, decimals, separator, prefix, suffix]);

  return count;
};

/**
 * 格式化数字
 */
function formatNumber(
  num: number,
  decimals: number,
  separator: string,
  prefix: string,
  suffix: string
): string {
  const fixed = num.toFixed(decimals);
  const parts = fixed.split('.');

  // 添加千分位分隔符
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return prefix + parts.join('.') + suffix;
}

/**
 * 缓动函数 - 指数衰减
 */
function easeOutExpo(t: number, b: number, c: number, d: number): number {
  return c * (-Math.pow(2, -10 * t / d) + 1) + b;
}

/**
 * 缓动函数 - 三次方缓出
 */
export function easeOutCubic(t: number, b: number, c: number, d: number): number {
  return c * ((t = t / d - 1) * t * t + 1) + b;
}

/**
 * 缓动函数 - 弹性效果
 */
export function easeOutElastic(t: number, b: number, c: number, d: number): number {
  const s = 1.70158;
  const p = d * 0.3;
  const a = c;

  if (t === 0) return b;
  if ((t /= d) === 1) return b + c;

  const postFix = a * Math.pow(2, -10 * t);
  return postFix * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
}

/**
 * 缓动函数 - 线性
 */
export function linear(t: number, b: number, c: number, d: number): number {
  return c * t / d + b;
}
