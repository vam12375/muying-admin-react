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
    url: '/points/history',
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
    url: '/points/users',
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
    url: `/points/users/${userId}`,
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
    url: `/points/users/${userId}/adjust`,
    method: 'post',
    data
  });
};

/**
 * 获取积分规则列表
 * @param params 查询参数
 */
export const getPointsRuleList = (params: any) => {
  return request({
    url: '/points/rules',
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
    url: '/points/rules',
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
    url: `/points/rules/${id}`,
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
    url: `/points/rules/${id}`,
    method: 'delete'
  });
};

/**
 * 获取积分商品列表
 * @param params 查询参数
 */
export const getPointsProductList = (params: any) => {
  return request({
    url: '/points/products',
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
    url: `/points/products/${id}`,
    method: 'get'
  });
};

/**
 * 创建积分商品
 * @param data 商品数据
 */
export const createPointsProduct = (data: any) => {
  return request({
    url: '/points/products',
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
    url: `/points/products/${id}`,
    method: 'put',
    data
  });
};

/**
 * 删除积分商品
 * @param id 商品ID
 */
export const deletePointsProduct = (id: number | string) => {
  return request({
    url: `/points/products/${id}`,
    method: 'delete'
  });
}; 