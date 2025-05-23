import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并类名工具函数
 * 结合clsx和tailwind-merge，用于合并和处理类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化价格显示
 * @param price - 价格数值
 * @param options - 格式化配置
 * @returns 格式化后的价格字符串
 */
export const formatPrice = (
  price: number,
  options: {
    currency?: 'CNY' | 'USD' | 'EUR' | 'GBP' | 'JPY'
    notation?: Intl.NumberFormatOptions['notation']
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {}
) => {
  const {
    currency = 'CNY',
    notation = 'standard',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price

  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency,
    notation,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numericPrice)
}

/**
 * 格式化日期
 * @param date - 日期对象或可转换为日期的字符串/数字
 * @param options - 格式化配置
 * @returns 格式化后的日期字符串
 */
export const formatDate = (
  date: Date | string | number,
  options: {
    format?: 'short' | 'medium' | 'long' | 'full'
    includeTime?: boolean
  } = {}
) => {
  const { format = 'medium', includeTime = false } = options
  
  const dateObj = date instanceof Date ? date : new Date(date)
  
  const dateOptions: Intl.DateTimeFormatOptions = {
    dateStyle: format,
    ...(includeTime && { timeStyle: format }),
  }
  
  return new Intl.DateTimeFormat('zh-CN', dateOptions).format(dateObj)
}

/**
 * 格式化数字
 * @param number - 需要格式化的数字
 * @param options - 格式化配置
 * @returns 格式化后的数字字符串
 */
export const formatNumber = (
  number: number,
  options: {
    notation?: Intl.NumberFormatOptions['notation']
    compactDisplay?: Intl.NumberFormatOptions['compactDisplay']
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {}
) => {
  const {
    notation = 'standard',
    compactDisplay = 'short',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options

  return new Intl.NumberFormat('zh-CN', {
    notation,
    compactDisplay,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(number)
}

/**
 * 截断文本并添加省略号
 * @param text - 需要截断的文本
 * @param maxLength - 最大长度
 * @returns 截断后的文本
 */
export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * 获取文件大小的可读文本
 * @param bytes - 字节数
 * @param decimals - 小数位数
 * @returns 格式化后的文件大小
 */
export const formatFileSize = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

/**
 * 深度合并对象
 * @param target - 目标对象
 * @param source - 源对象
 * @returns 合并后的对象
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Record<string, any>[]): T {
  if (!sources.length) return target;
  
  const source = sources.shift();
  if (source === undefined) return target;

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

// 辅助函数：检查值是否为对象
function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * 防抖函数
 * @param callback - 回调函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖处理后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay = 300
) => {
  let timer: ReturnType<typeof setTimeout> | null = null
  
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    
    timer = setTimeout(() => {
      callback(...args)
      timer = null
    }, delay)
  }) as (...args: Parameters<T>) => void
}

/**
 * 节流函数
 * @param callback - 回调函数
 * @param delay - 延迟时间（毫秒）
 * @returns 节流处理后的函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  callback: T,
  delay = 300
) => {
  let lastCall = 0
  
  return ((...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastCall >= delay) {
      lastCall = now
      return callback(...args)
    }
  }) as (...args: Parameters<T>) => ReturnType<T> | undefined
}

/**
 * 随机生成唯一ID
 * @returns 唯一ID字符串
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 10)
}

/**
 * 休眠函数（异步延迟）
 * @param ms - 毫秒数
 * @returns Promise
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 检测是否为移动设备
 * @returns 是否为移动设备
 */
export const isMobile = () => {
  if (typeof window === 'undefined') return false
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
} 