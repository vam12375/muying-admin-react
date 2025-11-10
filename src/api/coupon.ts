import request from '@/utils/request';

/**
 * 优惠券相关API类型定义
 */

export interface CouponParams {
  page?: number;
  size?: number;
  name?: string;
  type?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
}

export interface CouponData {
  id: number;
  name: string;
  batchId?: number;
  ruleId?: number;
  type: string;
  value: number;
  minSpend?: number;
  maxDiscount?: number;
  status: string;
  categoryIds?: string;
  brandIds?: string;
  productIds?: string;
  isStackable?: number;
  totalQuantity?: number;
  usedQuantity?: number;
  receivedQuantity?: number;
  userLimit?: number;
  startTime?: string;
  endTime?: string;
  createTime?: string;
  updateTime?: string;
  isReceived?: boolean;
}

export interface CouponBatchParams {
  page?: number;
  size?: number;
  couponName?: string;
}

export interface CouponBatchData {
  batchId: number;
  couponName: string;
  ruleId: number;
  totalCount: number;
  assignCount: number;
  createTime: string;
  updateTime: string;
  couponRule?: CouponRuleData;
}

export interface CouponRuleParams {
  page?: number;
  size?: number;
  name?: string;
}

export interface CouponRuleData {
  ruleId: number;
  name: string;
  type: number;
  ruleContent: string;
  createTime: string;
  updateTime: string;
}

export interface UserCouponData {
  id: number;
  userId: number;
  couponId: number;
  batchId: number;
  status: string;
  useTime?: string;
  orderId?: number;
  receiveTime: string;
  expireTime: string;
  createTime: string;
  updateTime: string;
  coupon?: CouponData;
}

/**
 * 优惠券相关API
 */

/**
 * 获取优惠券列表
 * @param params 查询参数
 */
export const getCouponList = (params: CouponParams) => {
  return request({
    url: 'admin/coupon/list',
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
    url: `admin/coupon/${id}`,
    method: 'get'
  });
};

/**
 * 创建优惠券
 * @param data 优惠券数据
 */
export const createCoupon = (data: Partial<CouponData>) => {
  return request({
    url: 'admin/coupon',
    method: 'post',
    data
  });
};

/**
 * 更新优惠券
 * @param id 优惠券ID
 * @param data 更新数据
 */
export const updateCoupon = (id: number | string, data: Partial<CouponData>) => {
  return request({
    url: `admin/coupon/${id}`,
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
    url: `admin/coupon/${id}`,
    method: 'delete'
  });
};

/**
 * 删除优惠券规则
 * @param id 规则ID
 */
export const deleteCouponRule = (id: number | string) => {
  return request({
    url: `admin/coupon/rule/${id}`,
    method: 'delete'
  });
};

/**
 * 更新优惠券状态
 * @param id 优惠券ID
 * @param status 状态值
 */
export const updateCouponStatus = (id: number | string, status: string) => {
  return request({
    url: `admin/coupon/${id}/status`,
    method: 'put',
    params: { status }
  });
};

/**
 * 获取优惠券批次列表
 * @param params 查询参数
 */
export const getCouponBatchList = (params: CouponBatchParams) => {
  return request({
    url: 'admin/coupon/batch/list',
    method: 'get',
    params
  });
};

/**
 * 获取优惠券批次详情
 * @param batchId 批次ID
 */
export const getCouponBatchDetail = (batchId: number | string) => {
  return request({
    url: `admin/coupon/batch/${batchId}`,
    method: 'get'
  });
};

/**
 * 创建优惠券批次
 * @param data 批次数据
 */
export const createCouponBatch = (data: Partial<CouponBatchData>) => {
  return request({
    url: 'admin/coupon/batch',
    method: 'post',
    data
  });
};

/**
 * 获取优惠券规则列表
 * @param params 查询参数
 */
export const getCouponRuleList = (params: CouponRuleParams) => {
  return request({
    url: 'admin/coupon/rule/list',
    method: 'get',
    params
  });
};

/**
 * 创建优惠券规则
 * @param data 规则数据
 */
export const createCouponRule = (data: Partial<CouponRuleData>) => {
  return request({
    url: 'admin/coupon/rule',
    method: 'post',
    data
  });
};

/**
 * 更新优惠券规则
 * @param ruleId 规则ID
 * @param data 更新数据
 */
export const updateCouponRule = (ruleId: number | string, data: Partial<CouponRuleData>) => {
  return request({
    url: `admin/coupon/rule/${ruleId}`,
    method: 'put',
    data
  });
};

/**
 * 获取优惠券使用统计数据
 */
export const getCouponStats = () => {
  return request({
    url: 'admin/coupon/stats',
    method: 'get'
  });
};

/**
 * 查询用户优惠券列表
 * @param userId 用户ID
 * @param status 状态（可选）
 */
export const getUserCoupons = (userId: number | string, status: string = 'all') => {
  return request({
    url: `admin/user/${userId}/coupons`,
    method: 'get',
    params: { status }
  });
}; 