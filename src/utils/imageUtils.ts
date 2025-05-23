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

  // 处理商品图片特殊路径
  if (url.includes('muying-web/public/products') || url.includes('/products/')) {
    const fileName = url.split('/').pop(); // 获取文件名
    return `http://localhost:5173/products/${fileName}`;
  }
  
  // 如果是相对路径，则添加基础URL
  // 这里假设API服务器和前端服务器在同一域名下
  return `/api${url.startsWith('/') ? url : `/${url}`}`;
};

/**
 * 获取品牌图片URL
 * 处理品牌图片的特殊路径，确保指向正确的位置
 * @param url 原始图片URL或文件名
 * @returns 格式化后的品牌图片URL
 */
export const getBrandImageUrl = (url: string | undefined | null): string => {
  if (!url) {
    return 'https://via.placeholder.com/60?text=No+Logo';
  }
  
  // 如果是完整的URL，则直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // 如果已经包含brands路径，则使用正确的前缀
  if (url.includes('/brands/') || url.startsWith('brands/')) {
    const fileName = url.split('/').pop(); // 获取文件名部分
    return `http://localhost:5173/brands/${fileName}`;
  }
  
  // 如果只是文件名，则添加品牌图片路径前缀
  if (!url.includes('/')) {
    return `http://localhost:5173/brands/${url}`;
  }
  
  // 其他情况，返回默认图片
  return 'https://via.placeholder.com/60?text=No+Logo';
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
  
  // 处理从商品图片路径获取缩略图
  if (baseUrl.includes('/products/')) {
    return baseUrl; // 直接返回商品图片路径，不添加额外参数
  }
  
  // 这里假设后端支持通过查询参数来获取缩略图
  // 实际实现可能需要根据后端API进行调整
  return `${baseUrl}?width=${width}&height=${height}`;
}; 