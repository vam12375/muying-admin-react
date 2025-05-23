import request from '@/utils/request';

/**
 * 物流状态枚举
 */
export enum LogisticsStatus {
  CREATED = 'CREATED',  // 已创建
  SHIPPING = 'SHIPPING', // 运输中
  DELIVERED = 'DELIVERED', // 已送达
  EXCEPTION = 'EXCEPTION' // 异常
}

/**
 * 物流实体接口定义
 */
export interface Logistics {
  id: number;
  orderId: number;
  companyId: number;
  trackingNo: string;
  status: LogisticsStatus;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  shippingTime: string | null;
  deliveryTime: string | null;
  remark: string | null;
  createTime: string;
  updateTime: string;
  company?: LogisticsCompany;
  tracks?: LogisticsTrack[];
  order?: any;
}

/**
 * 物流公司接口定义
 */
export interface LogisticsCompany {
  id: number;
  code: string;
  name: string;
  contact: string | null;
  phone: string | null;
  address: string | null;
  status: number;
  logo: string | null;
  sortOrder: number;
  createTime: string;
  updateTime: string;
}

/**
 * 物流轨迹接口定义
 */
export interface LogisticsTrack {
  id: number;
  logisticsId: number;
  trackingTime: string;
  location: string | null;
  status: string;
  content: string;
  operator: string | null;
  createTime: string;
  detailsJson?: Record<string, any>;
}

/**
 * 物流查询参数接口
 */
export interface LogisticsParams {
  page?: number;
  pageSize?: number;
  status?: string;
  keyword?: string;
}

/**
 * 物流公司查询参数接口
 */
export interface LogisticsCompanyParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

/**
 * 物流轨迹创建参数接口
 */
export interface LogisticsTrackParams {
  trackingTime?: string;
  location?: string;
  status: string;
  content: string;
  operator?: string;
  detailsJson?: Record<string, any>;
}

/**
 * 物流相关API
 */

/**
 * 获取物流列表
 * @param params 查询参数
 */
export const getLogisticsList = (params: LogisticsParams) => {
  return request({
    url: '/api/admin/logistics',
    method: 'get',
    params
  });
};

/**
 * 获取物流详情
 * @param id 物流ID
 */
export const getLogisticsDetail = (id: number | string) => {
  return request({
    url: `/api/admin/logistics/${id}`,
    method: 'get'
  });
};

/**
 * 根据订单ID获取物流信息
 * @param orderId 订单ID
 */
export const getLogisticsByOrderId = (orderId: number | string) => {
  return request({
    url: `/api/admin/logistics/order/${orderId}`,
    method: 'get'
  });
};

/**
 * 更新物流状态
 * @param id 物流ID
 * @param status 物流状态
 * @param remark 备注
 */
export const updateLogisticsStatus = (
  id: number | string, 
  status: string, 
  remark?: string
) => {
  return request({
    url: `/api/admin/logistics/${id}/status`,
    method: 'put',
    params: { status, remark }
  });
};

/**
 * 获取物流公司列表
 * @param params 查询参数
 */
export const getLogisticsCompanies = (params?: LogisticsCompanyParams) => {
  return request({
    url: '/api/admin/logistics/companies',
    method: 'get',
    params
  });
};

/**
 * 获取所有启用的物流公司
 */
export const getEnabledLogisticsCompanies = () => {
  return request({
    url: '/api/admin/logistics/companies/enabled',
    method: 'get'
  });
};

/**
 * 添加物流公司
 * @param data 物流公司数据
 */
export const addLogisticsCompany = (data: Partial<LogisticsCompany>) => {
  return request({
    url: '/api/admin/logistics/companies',
    method: 'post',
    data
  });
};

/**
 * 更新物流公司
 * @param id 物流公司ID
 * @param data 更新数据
 */
export const updateLogisticsCompany = (id: number | string, data: Partial<LogisticsCompany>) => {
  return request({
    url: `/api/admin/logistics/companies/${id}`,
    method: 'put',
    data
  });
};

/**
 * 删除物流公司
 * @param id 物流公司ID
 */
export const deleteLogisticsCompany = (id: number | string) => {
  return request({
    url: `/api/admin/logistics/companies/${id}`,
    method: 'delete'
  });
};

/**
 * 获取物流轨迹列表
 * @param logisticsId 物流ID
 */
export const getLogisticsTracks = (logisticsId: number | string) => {
  return request({
    url: `/api/admin/logistics/${logisticsId}/tracks`,
    method: 'get'
  });
};

/**
 * 添加物流轨迹
 * @param logisticsId 物流ID
 * @param track 轨迹信息
 */
export const addLogisticsTrack = (logisticsId: number | string, track: LogisticsTrackParams) => {
  console.log(`准备添加物流轨迹，物流ID: ${logisticsId}，轨迹信息:`, track);
  
  // 确保trackingTime字段格式正确
  if (track.trackingTime && typeof track.trackingTime === 'object') {
    track.trackingTime = (track.trackingTime as any).format('YYYY-MM-DD HH:mm:ss');
  }
  
  return request({
    url: `/api/admin/logistics/${logisticsId}/tracks`,
    method: 'post',
    data: track,
    // 添加额外配置以确保请求成功
    timeout: 10000, // 增加超时时间到10秒
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // 在请求出错时不要自动转为Promise.reject，允许错误处理函数处理
    validateStatus: (status) => {
      // 允许任何状态码，我们会在拦截器中处理
      console.log(`物流轨迹API响应状态码: ${status}`);
      return true;
    }
  }).catch(error => {
    // 增强错误日志记录
    console.error('物流轨迹API请求失败:', error);
    if (error.response) {
      console.error('错误响应:', error.response.data);
    }
    // 重新抛出错误以便上层捕获
    throw error;
  });
};

/**
 * 生成物流单号
 * @param companyCode 物流公司代码
 */
export const generateTrackingNo = (companyCode: string) => {
  return request({
    url: '/api/admin/logistics/generateTrackingNo',
    method: 'get',
    params: { companyCode }
  });
};

/**
 * 批量添加物流轨迹
 * @param logisticsId 物流ID
 * @param tracks 轨迹列表
 */
export const batchAddLogisticsTracks = (logisticsId: number | string, tracks: LogisticsTrackParams[]) => {
  console.log(`准备批量添加物流轨迹，物流ID: ${logisticsId}，轨迹数量: ${tracks.length}`);
  
  // 确保每个轨迹中trackingTime字段格式正确
  const processedTracks = tracks.map(track => {
    const processedTrack = {...track};
    if (processedTrack.trackingTime && typeof processedTrack.trackingTime === 'object') {
      processedTrack.trackingTime = (processedTrack.trackingTime as any).format('YYYY-MM-DD HH:mm:ss');
    }
    return processedTrack;
  });
  
  return request({
    url: `/api/admin/logistics/${logisticsId}/batch-tracks`,
    method: 'post',
    data: processedTracks,
    // 添加额外配置以确保请求成功
    timeout: 30000, // 增加超时时间到30秒
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }).catch(error => {
    // 增强错误日志记录
    console.error('批量添加物流轨迹API请求失败:', error);
    if (error.response) {
      console.error('错误响应:', error.response.data);
    }
    // 重新抛出错误以便上层捕获
    throw error;
  });
}; 