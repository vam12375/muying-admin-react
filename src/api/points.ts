import request from '@/utils/request';

/**
 * 积分相关API
 */

/**
 * 获取积分历史列表
 * @param params 查询参数
 */
export const getPointsHistoryList = (params: any) => {
  return request({
    url: '/admin/points/history/list',
    method: 'get',
    params
  });
};

/**
 * 获取积分操作日志列表
 * @param params 查询参数
 */
export const getPointsOperationLogs = (params: any) => {
  return request({
    url: '/admin/points/operation/list',
    method: 'get',
    params
  });
};

/**
 * 获取用户积分列表
 * @param params 查询参数
 */
export const getUserPointsList = (params: any) => {
  return request({
    url: '/admin/points/user/list',
    method: 'get',
    params
  });
};

/**
 * 获取用户积分详情
 * @param userId 用户ID
 */
export const getUserPointsDetail = (userId: number | string) => {
  return request({
    url: `/admin/points/user/${userId}`,
    method: 'get'
  });
};

/**
 * 手动调整用户积分
 * @param userId 用户ID
 * @param data 调整数据
 */
export const adjustUserPoints = (userId: number | string, data: any) => {
  return request({
    url: `/admin/points/user/${userId}/adjust`,
    method: 'post',
    params: {
      points: data.type === 'increase' ? data.points : -data.points,
      description: data.reason
    }
  });
};

/**
 * 获取积分规则列表
 * @param params 查询参数
 */
export const getPointsRuleList = (params: any) => {
  return request({
    url: '/admin/points/rule/list',
    method: 'get',
    params
  });
};

/**
 * 创建积分规则
 * @param data 规则数据
 */
export const createPointsRule = (data: any) => {
  return request({
    url: '/admin/points/rule',
    method: 'post',
    data
  });
};

/**
 * 更新积分规则
 * @param id 规则ID
 * @param data 更新数据
 */
export const updatePointsRule = (id: number | string, data: any) => {
  return request({
    url: `/admin/points/rule/${id}`,
    method: 'put',
    data
  });
};

/**
 * 删除积分规则
 * @param id 规则ID
 */
export const deletePointsRule = (id: number | string) => {
  return request({
    url: `/admin/points/rule/${id}`,
    method: 'delete'
  });
};

/**
 * 获取积分商品列表
 * @param params 查询参数
 */
export const getPointsProductList = (params: any) => {
  return request({
    url: '/admin/points/product/list',
    method: 'get',
    params
  });
};

/**
 * 获取积分商品详情
 * @param id 商品ID
 */
export const getPointsProductDetail = (id: number | string) => {
  return request({
    url: `/admin/points/product/${id}`,
    method: 'get'
  });
};

/**
 * 创建积分商品
 * @param data 商品数据
 */
export const createPointsProduct = (data: any) => {
  return request({
    url: '/admin/points/product',
    method: 'post',
    data
  });
};

/**
 * 更新积分商品
 * @param id 商品ID
 * @param data 更新数据
 */
export const updatePointsProduct = (id: number | string, data: any) => {
  return request({
    url: `/admin/points/product/${id}`,
    method: 'put',
    data
  });
};

/**
 * 更新积分商品状态
 * @param id 商品ID
 * @param status 状态值
 */
export const updatePointsProductStatus = (id: number | string, status: string) => {
  return request({
    url: `/admin/points/product/${id}/status`,
    method: 'put',
    params: { status }
  });
};

/**
 * 删除积分商品
 * @param id 商品ID
 */
export const deletePointsProduct = (id: number | string) => {
  return request({
    url: `/admin/points/product/${id}`,
    method: 'delete'
  });
};

/**
 * 获取积分兑换记录列表
 * @param params 查询参数
 */
export const getPointsExchangeList = (params: any) => {
  return request({
    url: '/admin/points/exchange/list',
    method: 'get',
    params
  });
};

/**
 * 更新积分兑换状态
 * @param id 兑换记录ID
 * @param status 状态
 */
export const updateExchangeStatus = (id: number | string, status: string) => {
  return request({
    url: `/admin/points/exchange/${id}/status`,
    method: 'put',
    params: { status }
  });
};

/**
 * 积分兑换发货
 * @param id 兑换记录ID
 * @param data 发货数据
 */
export const shipExchange = (id: number | string, data: any) => {
  return request({
    url: `/admin/points/exchange/${id}/ship`,
    method: 'post',
    data
  });
};

/**
 * 获取积分兑换详情
 * @param id 兑换记录ID
 */
export const getExchangeDetail = (id: number | string) => {
  return request({
    url: `/admin/points/exchange/${id}`,
    method: 'get'
  });
};

/**
 * 获取积分统计数据
 * @param params 查询参数
 */
export const getPointsStats = (params: any) => {
  return request({
    url: '/admin/points/stats',
    method: 'get',
    params
  });
}; 