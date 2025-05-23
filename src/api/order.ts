import request from '@/utils/request';

/**
 * 订单相关API
 */

/**
 * 获取订单列表
 * @param params 查询参数
 */
export const getOrderList = (params: any) => {
  return request({
    url: '/orders',
    method: 'get',
    params
  });
};

/**
 * 获取订单详情
 * @param id 订单ID
 */
export const getOrderDetail = (id: number | string) => {
  return request({
    url: `/orders/${id}`,
    method: 'get'
  });
};

/**
 * 更新订单状态
 * @param id 订单ID
 * @param data 更新数据
 */
export const updateOrderStatus = (id: number | string, data: any) => {
  return request({
    url: `/orders/${id}/status`,
    method: 'put',
    data
  });
};

/**
 * 订单发货
 * @param id 订单ID
 * @param data 发货数据
 */
export const shipOrder = (id: number | string, data: any) => {
  return request({
    url: `/orders/${id}/ship`,
    method: 'post',
    data
  });
};

/**
 * 取消订单
 * @param id 订单ID
 * @param data 取消原因
 */
export const cancelOrder = (id: number | string, data: any) => {
  return request({
    url: `/orders/${id}/cancel`,
    method: 'post',
    data
  });
};

/**
 * 获取订单统计数据
 */
export const getOrderStatistics = () => {
  return request({
    url: '/orders/statistics',
    method: 'get'
  });
};

/**
 * 导出订单
 * @param params 查询参数
 */
export const exportOrders = (params: any) => {
  return request({
    url: '/orders/export',
    method: 'get',
    params,
    responseType: 'blob'
  });
}; 