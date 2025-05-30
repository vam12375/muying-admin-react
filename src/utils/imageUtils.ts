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
  // 控制台记录输入的URL，便于调试
  console.log('Input image URL:', url);
  
  if (!url) {
    return 'https://via.placeholder.com/80';
  }
  
  // 删除URL中的空白字符
  const trimmedUrl = url.trim();
  
  // 如果是完整的URL，则直接返回
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    console.log('Complete URL, returning as-is:', trimmedUrl);
    return trimmedUrl;
  }

  // 处理商品图片路径
  // 强化识别各种路径格式，并对后端API返回的特定格式进行处理
  if (
    trimmedUrl.includes('products/') || 
    trimmedUrl.includes('product/') || 
    trimmedUrl.includes('商品/') || 
    trimmedUrl.includes('muying-web/public/products/') ||
    // 特殊情况：如果URL是简单的文件名，假设它是一个商品图片
    !trimmedUrl.includes('/')
  ) {
    // 提取文件名，处理可能存在的路径情况
    const fileName = trimmedUrl.includes('/') ? trimmedUrl.split('/').pop() : trimmedUrl;
    
    // 确保文件名存在
    if (!fileName) {
      console.log('Invalid file name, returning placeholder');
      return 'https://via.placeholder.com/80?text=Invalid+Image';
    }
    
    // 构建完整图片URL
    const formattedUrl = `http://localhost:5173/products/${fileName}`;
    console.log('Formatted product URL:', formattedUrl);
    return formattedUrl;
  }
  
  // 如果是相对路径，则添加基础URL
  const apiBaseUrl = `/api${trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`}`;
  console.log('API base URL added:', apiBaseUrl);
  return apiBaseUrl;
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
  
  // 删除URL中的空白字符
  const trimmedUrl = url.trim();
  
  // 如果是完整的URL，则直接返回
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }
  
  // 如果已经包含brands路径，则使用正确的前缀
  if (trimmedUrl.includes('/brands/') || trimmedUrl.startsWith('brands/')) {
    const fileName = trimmedUrl.split('/').pop(); // 获取文件名部分
    if (!fileName) {
      return 'https://via.placeholder.com/60?text=No+Logo';
    }
    return `http://localhost:5173/brands/${fileName}`;
  }
  
  // 如果只是文件名，则添加品牌图片路径前缀
  if (!trimmedUrl.includes('/')) {
    return `http://localhost:5173/brands/${trimmedUrl}`;
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