import request from '@/utils/request';

/**
 * 系统相关API
 */

/**
 * 获取Redis缓存信息
 */
export const getRedisInfo = () => {
  return request({
    url: '/system/redis/info',
    method: 'get'
  });
};

/**
 * 获取Redis键列表
 * @param params 查询参数
 */
export const getRedisKeys = (params: any) => {
  return request({
    url: '/system/redis/keys',
    method: 'get',
    params
  });
};

/**
 * 获取Redis键值
 * @param key 键名
 */
export const getRedisKeyValue = (key: string) => {
  return request({
    url: '/system/redis/keys/value',
    method: 'get',
    params: { key }
  });
};

/**
 * 删除Redis键
 * @param key 键名
 */
export const deleteRedisKey = (key: string) => {
  return request({
    url: '/system/redis/keys',
    method: 'delete',
    params: { key }
  });
};

/**
 * 清空Redis缓存
 */
export const flushRedis = () => {
  return request({
    url: '/system/redis/flush',
    method: 'post'
  });
};

/**
 * 获取系统日志
 * @param params 查询参数
 */
export const getSystemLogs = (params: any) => {
  return request({
    url: '/system/logs',
    method: 'get',
    params
  });
};

/**
 * 获取系统配置
 */
export const getSystemConfig = () => {
  return request({
    url: '/system/config',
    method: 'get'
  });
};

/**
 * 更新系统配置
 * @param data 配置数据
 */
export const updateSystemConfig = (data: any) => {
  return request({
    url: '/system/config',
    method: 'put',
    data
  });
}; 