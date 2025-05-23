import request from '@/utils/request';

/**
 * 系统相关API
 */

/**
 * 获取Redis缓存信息
 */
export const getRedisInfo = () => {
  return request({
    url: '/admin/system/redis/info',
    method: 'get'
  }).catch(error => {
    // 处理后端类加载错误
    if (error.message && (error.message.includes('NoClassDefFoundError') || 
                          error.message.includes('ResultCode') ||
                          error.message.includes('后端服务'))) {
      console.error('后端类加载错误:', error);
      return Promise.reject({
        message: '后端服务出现类加载错误，请联系管理员检查 ResultCode 类是否正确配置'
      });
    }
    return Promise.reject(error);
  });
};

/**
 * 获取Redis键列表
 * @param params 查询参数
 */
export const getRedisKeys = (params: any) => {
  // 确保参数格式与Vue版本一致
  const apiParams = {
    ...params,
    // 如果传入了pageSize，将其转换为size
    size: params.pageSize || params.size || 10,
  };
  
  // 删除pageSize参数，避免同时发送两个参数
  if (apiParams.pageSize) {
    delete apiParams.pageSize;
  }
  
  return request({
    url: '/admin/system/redis/keys',
    method: 'get',
    params: apiParams
  }).catch(error => {
    // 处理后端类加载错误
    if (error.message && (error.message.includes('NoClassDefFoundError') || 
                         error.message.includes('ResultCode') ||
                         error.message.includes('后端服务'))) {
      console.error('后端类加载错误:', error);
      return Promise.reject({
        message: '后端服务出现类加载错误，请联系管理员检查 ResultCode 类是否正确配置'
      });
    }
    return Promise.reject(error);
  });
};

/**
 * 获取Redis键值
 * @param key 键名
 */
export const getRedisKeyValue = (key: string) => {
  return request({
    url: '/admin/system/redis/key',
    method: 'get',
    params: { key }
  }).catch(error => {
    // 处理后端类加载错误
    if (error.message && (error.message.includes('NoClassDefFoundError') || 
                         error.message.includes('ResultCode') ||
                         error.message.includes('后端服务'))) {
      console.error('后端类加载错误:', error);
      return Promise.reject({
        message: '后端服务出现类加载错误，请联系管理员检查 ResultCode 类是否正确配置'
      });
    }
    return Promise.reject(error);
  });
};

/**
 * 设置Redis键值
 * @param data 键值数据 { key, value, ttl }
 */
export const setRedisValue = (data: { key: string; value: any; ttl?: number }) => {
  return request({
    url: '/admin/system/redis/set',
    method: 'post',
    data
  });
};

/**
 * 删除Redis键
 * @param keys 键名或键名数组
 */
export const deleteRedisKey = (keys: string | string[]) => {
  return request({
    url: '/admin/system/redis/delete',
    method: 'post',
    data: { keys: Array.isArray(keys) ? keys : [keys] }
  });
};

/**
 * 清空Redis缓存
 */
export const flushRedis = () => {
  return request({
    url: '/admin/system/redis/flush',
    method: 'post'
  });
};

/**
 * 清空Redis数据库
 */
export const clearRedisDb = () => {
  return request({
    url: '/admin/system/redis/clear',
    method: 'post'
  });
};

/**
 * 获取系统日志
 * @param params 查询参数
 */
export const getSystemLogs = (params: any) => {
  return request({
    url: '/admin/system/logs',
    method: 'get',
    params
  });
};

/**
 * 获取日志详情
 * @param id 日志ID
 */
export const getLogDetail = (id: number) => {
  return request({
    url: `/admin/system/logs/${id}`,
    method: 'get'
  });
};

/**
 * 获取系统配置
 */
export const getSystemConfig = () => {
  return request({
    url: '/admin/system/config',
    method: 'get'
  });
};

/**
 * 获取系统配置列表
 */
export const getSystemConfigs = () => {
  return request({
    url: '/admin/system/configs',
    method: 'get'
  });
};

/**
 * 更新系统配置
 * @param data 配置数据
 */
export const updateSystemConfig = (data: any) => {
  return request({
    url: '/admin/system/config',
    method: 'put',
    data
  });
};

/**
 * 创建系统配置
 * @param data 配置数据
 */
export const createSystemConfig = (data: any) => {
  return request({
    url: '/admin/system/config',
    method: 'post',
    data
  });
}; 