/**
 * 图片工具函数
 */

/**
 * 格式化图片URL
 * 如果图片URL是相对路径，则添加基础URL
 * @param url 图片URL
 * @returns 格式化后的图片URL
 */
export const formatImageUrl = (url: string | undefined | null): string => {
  if (!url) {
    return 'https://via.placeholder.com/80';
  }
  
  // 如果是完整的URL，则直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 如果是相对路径，则添加基础URL
  // 这里假设API服务器和前端服务器在同一域名下
  return `/api${url.startsWith('/') ? url : `/${url}`}`;
};

/**
 * 获取图片缩略图URL
 * @param url 原始图片URL
 * @param width 缩略图宽度
 * @param height 缩略图高度
 * @returns 缩略图URL
 */
export const getThumbnailUrl = (
  url: string | undefined | null,
  width: number = 80,
  height: number = 80
): string => {
  const baseUrl = formatImageUrl(url);
  
  // 如果是placeholder图片，直接返回带尺寸的URL
  if (baseUrl.includes('via.placeholder.com')) {
    return `https://via.placeholder.com/${width}x${height}`;
  }
  
  // 这里假设后端支持通过查询参数来获取缩略图
  // 实际实现可能需要根据后端API进行调整
  return `${baseUrl}?width=${width}&height=${height}`;
}; 