import request from '@/utils/request';

/**
 * 优惠券相关API
 */

/**
 * 获取优惠券列表
 * @param params 查询参数
 */
export const getCouponList = (params: any) => {
  return request({
    url: '/coupons',
    method: 'get',
    params
  });
};

/**
 * 获取优惠券详情
 * @param id 优惠券ID
 */
export const getCouponDetail = (id: number | string) => {
  return request({
    url: `/coupons/${id}`,
    method: 'get'
  });
};

/**
 * 创建优惠券
 * @param data 优惠券数据
 */
export const createCoupon = (data: any) => {
  return request({
    url: '/coupons',
    method: 'post',
    data
  });
};

/**
 * 更新优惠券
 * @param id 优惠券ID
 * @param data 更新数据
 */
export const updateCoupon = (id: number | string, data: any) => {
  return request({
    url: `/coupons/${id}`,
    method: 'put',
    data
  });
};

/**
 * 删除优惠券
 * @param id 优惠券ID
 */
export const deleteCoupon = (id: number | string) => {
  return request({
    url: `/coupons/${id}`,
    method: 'delete'
  });
};

/**
 * 获取优惠券批次列表
 * @param params 查询参数
 */
export const getCouponBatchList = (params: any) => {
  return request({
    url: '/coupons/batches',
    method: 'get',
    params
  });
};

/**
 * 创建优惠券批次
 * @param data 批次数据
 */
export const createCouponBatch = (data: any) => {
  return request({
    url: '/coupons/batches',
    method: 'post',
    data
  });
};

/**
 * 获取优惠券规则列表
 * @param params 查询参数
 */
export const getCouponRuleList = (params: any) => {
  return request({
    url: '/coupons/rules',
    method: 'get',
    params
  });
};

/**
 * 创建优惠券规则
 * @param data 规则数据
 */
export const createCouponRule = (data: any) => {
  return request({
    url: '/coupons/rules',
    method: 'post',
    data
  });
};

/**
 * 更新优惠券规则
 * @param id 规则ID
 * @param data 更新数据
 */
export const updateCouponRule = (id: number | string, data: any) => {
  return request({
    url: `/coupons/rules/${id}`,
    method: 'put',
    data
  });
};

/**
 * 删除优惠券规则
 * @param id 规则ID
 */
export const deleteCouponRule = (id: number | string) => {
  return request({
    url: `/coupons/rules/${id}`,
    method: 'delete'
  });
}; 