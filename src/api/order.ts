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
    url: '/api/admin/orders',
    method: 'get',
    params
  });
};

/**
 * 获取最近订单
 * @param limit 获取的订单数量，默认为5条
 */
export const getRecentOrders = (limit: number = 5) => {
  return request({
    url: '/api/admin/orders',
    method: 'get',
    params: { 
      pageSize: limit,
      pageNum: 1,
      sortField: 'createTime',
      sortOrder: 'desc'
    }
  });
};

/**
 * 获取订单详情
 * @param id 订单ID
 */
export const getOrderDetail = (id: number | string) => {
  return request({
    url: `/api/admin/orders/${id}`,
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
    url: `/api/admin/orders/${id}/status`,
    method: 'put',
    data
  });
};

/**
 * 订单发货
 * @param id 订单ID
 * @param companyId 物流公司ID
 * @param trackingNo 物流单号，可选，不传则自动生成
 * @param receiverName 收件人姓名，可选，不传则使用订单收件人
 * @param receiverPhone 收件人电话，可选，不传则使用订单收件人电话
 * @param receiverAddress 收件人地址，可选，不传则使用订单收件人地址
 */
export const shipOrder = (
  id: number | string, 
  companyId: number, 
  trackingNo?: string, 
  receiverName?: string, 
  receiverPhone?: string, 
  receiverAddress?: string
) => {
  return request({
    url: `/api/admin/orders/${id}/ship`,
    method: 'put',
    params: {
      companyId,
      trackingNo,
      receiverName,
      receiverPhone,
      receiverAddress
    }
  });
};

/**
 * 取消订单
 * @param id 订单ID
 * @param data 取消原因
 */
export const cancelOrder = (id: number | string, data: any) => {
  return request({
    url: `/api/admin/orders/${id}/cancel`,
    method: 'post',
    data
  });
};

/**
 * 获取订单统计数据
 */
export const getOrderStatistics = () => {
  return request({
    url: '/api/admin/orders/statistics',
    method: 'get'
  });
};

/**
 * 导出订单
 * @param params 查询参数
 */
export const exportOrders = (params: any) => {
  return request({
    url: '/api/admin/orders/export',
    method: 'get',
    params,
    responseType: 'blob'
  });
}; 