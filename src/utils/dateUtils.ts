/**
 * 日期工具函数
 */

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 设置dayjs使用中文
dayjs.locale('zh-cn');

// 启用相对时间插件
dayjs.extend(relativeTime);

/**
 * 格式化日期时间
 * @param date 日期时间
 * @param format 格式化模板
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTime = (date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

/**
 * 格式化日期
 * @param date 日期
 * @param format 格式化模板
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date | string | number, format: string = 'YYYY-MM-DD'): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

/**
 * 格式化时间
 * @param date 时间
 * @param format 格式化模板
 * @returns 格式化后的时间字符串
 */
export const formatTime = (date: Date | string | number, format: string = 'HH:mm:ss'): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

/**
 * 获取相对时间（如：5分钟前、1小时前、昨天等）
 * @param date 日期时间
 * @returns 相对时间字符串
 */
export const formatTimeToNow = (date: Date | string | number): string => {
  if (!date) return '-';
  return dayjs(date).fromNow();
};

/**
 * 判断日期是否过期
 * @param date 日期
 * @returns 是否过期
 */
export const isExpired = (date: Date | string | number): boolean => {
  if (!date) return false;
  return dayjs(date).isBefore(dayjs());
};

/**
 * 计算两个日期之间的天数差
 * @param date1 日期1
 * @param date2 日期2
 * @returns 天数差
 */
export const getDaysDiff = (date1: Date | string | number, date2: Date | string | number): number => {
  return dayjs(date1).diff(dayjs(date2), 'day');
};

/**
 * 获取指定日期的开始时间
 * @param date 日期
 * @returns 开始时间
 */
export const getStartOfDay = (date: Date | string | number = new Date()): Date => {
  return dayjs(date).startOf('day').toDate();
};

/**
 * 获取指定日期的结束时间
 * @param date 日期
 * @returns 结束时间
 */
export const getEndOfDay = (date: Date | string | number = new Date()): Date => {
  return dayjs(date).endOf('day').toDate();
};

/**
 * 将秒数转换为可读的时间格式
 * @param seconds 秒数
 * @returns 格式化后的时间字符串（如 "2小时30分钟"）
 */
export const formatDuration = (seconds: number): string => {
  if (seconds === -1) {
    return '永不过期';
  }
  
  if (seconds === -2) {
    return '已过期';
  }
  
  if (seconds < 0) {
    return '未知';
  }
  
  if (seconds < 60) {
    return `${seconds}秒`;
  }
  
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const remainingSeconds = seconds % 60;
  
  const parts = [];
  
  if (days > 0) {
    parts.push(`${days}天`);
  }
  
  if (hours > 0) {
    parts.push(`${hours}小时`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes}分钟`);
  }
  
  if (remainingSeconds > 0 && parts.length === 0) {
    parts.push(`${remainingSeconds}秒`);
  }
  
  return parts.join(' ');
}; 