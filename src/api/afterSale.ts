import request from '@/utils/request';

/**
 * 售后管理API
 */

/**
 * 获取退款申请列表
 * @param params 查询参数
 */
export const getRefundList = (params: any) => {
  return request({
    url: '/admin/refund/list',
    method: 'get',
    params
  });
};

/**
 * 获取退款详情
 * @param refundId 退款ID
 */
export const getRefundDetail = (refundId: number | string) => {
  return request({
    url: `/admin/refund/${refundId}`,
    method: 'get'
  });
};

/**
 * 审核退款申请
 * @param refundId 退款ID
 * @param approved 是否批准
 * @param rejectReason 拒绝原因（拒绝时必填）
 * @param adminId 管理员ID
 * @param adminName 管理员名称
 */
export const reviewRefund = (
  refundId: number | string,
  approved: boolean,
  adminId: number,
  adminName: string,
  rejectReason?: string
) => {
  console.log(`请求审核退款, refundId=${refundId}`);
  return request({
    url: '/admin/refund/review',
    method: 'post',
    data: {
      refundId,
      approved,
      rejectReason,
      adminId,
      adminName
    }
  });
};

/**
 * 处理退款
 * @param refundId 退款ID
 * @param refundChannel 退款渠道
 * @param refundAccount 退款账户（可选）
 * @param adminId 管理员ID
 * @param adminName 管理员名称
 */
export const processRefund = (
  refundId: number | string,
  refundChannel: string,
  adminId: number,
  adminName: string,
  refundAccount?: string
) => {
  return request({
    url: '/admin/refund/process',
    method: 'post',
    data: {
      refundId,
      refundChannel,
      refundAccount,
      adminId,
      adminName
    }
  });
};

/**
 * 完成退款
 * @param refundId 退款ID
 * @param transactionId 交易ID
 * @param adminId 管理员ID
 * @param adminName 管理员名称
 */
export const completeRefund = (
  refundId: number | string,
  transactionId: string,
  adminId: number,
  adminName: string
) => {
  return request({
    url: '/admin/refund/complete',
    method: 'post',
    data: {
      refundId,
      transactionId,
      adminId,
      adminName
    }
  });
};

/**
 * 标记退款失败
 * @param refundId 退款ID
 * @param reason 失败原因
 * @param adminId 管理员ID
 * @param adminName 管理员名称
 */
export const failRefund = (
  refundId: number | string,
  reason: string,
  adminId: number,
  adminName: string
) => {
  return request({
    url: '/admin/refund/fail',
    method: 'post',
    data: {
      refundId,
      reason,
      adminId,
      adminName
    }
  });
};

/**
 * 获取退款统计数据
 * @param startTime 开始时间（可选）
 * @param endTime 结束时间（可选）
 */
export const getRefundStatistics = (startTime?: string, endTime?: string) => {
  return request({
    url: '/admin/refund/statistics',
    method: 'get',
    params: {
      startTime,
      endTime
    }
  });
};

/**
 * 获取待处理的退款数量
 */
export const getPendingRefundCount = () => {
  return request({
    url: '/admin/refund/pending/count',
    method: 'get'
  });
}; 