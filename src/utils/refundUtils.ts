/**
 * 退款相关工具函数
 */

/**
 * 翻译退款原因
 * @param reason 退款原因（英文或中文）
 * @returns 中文退款原因
 */
export const translateRefundReason = (reason: string): string => {
  const reasonMap: { [key: string]: string } = {
    'quality': '商品质量问题',
    'description': '商品与描述不符',
    'damaged': '收到商品破损',
    'unwanted': '不想要了',
    'other': '其他原因'
  };
  
  return reasonMap[reason] || reason;
};

/**
 * 退款状态映射
 */
export const refundStatusMap: { [key: string]: string } = {
  'PENDING': '待审核',
  'APPROVED': '已批准',
  'REJECTED': '已拒绝',
  'PROCESSING': '处理中',
  'COMPLETED': '已完成',
  'FAILED': '已失败'
};

/**
 * 翻译退款状态
 * @param status 退款状态
 * @returns 中文退款状态
 */
export const translateRefundStatus = (status: string): string => {
  return refundStatusMap[status] || status;
};

/**
 * 退款状态颜色映射
 */
export const refundStatusColors: { [key: string]: string } = {
  'PENDING': 'orange',
  'APPROVED': 'blue',
  'REJECTED': 'red',
  'PROCESSING': 'cyan',
  'COMPLETED': 'green',
  'FAILED': 'red'
};

/**
 * 获取退款状态颜色
 * @param status 退款状态
 * @returns 状态颜色
 */
export const getRefundStatusColor = (status: string): string => {
  return refundStatusColors[status] || 'default';
};
