/**
 * 日期工具函数
 */

/**
 * 格式化日期时间
 * @param date 日期对象或日期字符串或时间戳
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export const formatDateTime = (
  date: Date | string | number | undefined | null,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string => {
  if (!date) return '-';
  
  const d = typeof date === 'object' ? date : new Date(date);
  
  if (isNaN(d.getTime())) {
    return '-';
  }
  
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();
  
  const formatMap: Record<string, number> = {
    'YYYY': year,
    'MM': month,
    'DD': day,
    'HH': hours,
    'mm': minutes,
    'ss': seconds
  };
  
  let result = format;
  
  Object.entries(formatMap).forEach(([key, value]) => {
    result = result.replace(key, value < 10 ? `0${value}` : `${value}`);
  });
  
  return result;
};

/**
 * 格式化日期
 * @param date 日期对象或日期字符串或时间戳
 * @returns 格式化后的日期字符串 (YYYY-MM-DD)
 */
export const formatDate = (date: Date | string | number | undefined | null): string => {
  return formatDateTime(date, 'YYYY-MM-DD');
}; 