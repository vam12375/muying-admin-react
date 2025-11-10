import request from '@/utils/request';

/**
 * 系统监控API
 */

// 获取完整的系统监控指标
export const getSystemMetrics = () => {
  return request.get('/admin/system/monitor/metrics');
};

// 获取系统健康状态
export const getSystemHealth = () => {
  return request.get('/admin/system/monitor/health');
};

// 获取服务器性能指标
export const getServerPerformance = () => {
  return request.get('/admin/system/monitor/server');
};

// 获取数据库监控指标
export const getDatabaseMetrics = () => {
  return request.get('/admin/system/monitor/database');
};

// 获取Redis监控指标
export const getRedisMetrics = () => {
  return request.get('/admin/system/monitor/redis');
};

// 获取API调用统计
export const getApiStatistics = () => {
  return request.get('/admin/system/monitor/api-statistics');
};

// 重置API统计数据
export const resetApiStatistics = () => {
  return request.post('/admin/system/monitor/api-statistics/reset');
};

// 获取数据库版本信息
export const getDatabaseVersion = () => {
  return request.get('/admin/system/monitor/database/version');
};

// 检查Redis连接状态
export const pingRedis = () => {
  return request.get('/admin/system/monitor/redis/ping');
};
