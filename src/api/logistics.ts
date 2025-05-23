import request from '@/utils/request';

/**
 * 物流相关API
 */

/**
 * 获取物流列表
 * @param params 查询参数
 */
export const getLogisticsList = (params: any) => {
  return request({
    url: '/logistics',
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
    url: `/logistics/${id}`,
    method: 'get'
  });
};

/**
 * 更新物流信息
 * @param id 物流ID
 * @param data 更新数据
 */
export const updateLogistics = (id: number | string, data: any) => {
  return request({
    url: `/logistics/${id}`,
    method: 'put',
    data
  });
};

/**
 * 获取物流公司列表
 * @param params 查询参数
 */
export const getLogisticsCompanies = (params?: any) => {
  return request({
    url: '/logistics/companies',
    method: 'get',
    params
  });
};

/**
 * 添加物流公司
 * @param data 物流公司数据
 */
export const addLogisticsCompany = (data: any) => {
  return request({
    url: '/logistics/companies',
    method: 'post',
    data
  });
};

/**
 * 更新物流公司
 * @param id 物流公司ID
 * @param data 更新数据
 */
export const updateLogisticsCompany = (id: number | string, data: any) => {
  return request({
    url: `/logistics/companies/${id}`,
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
    url: `/logistics/companies/${id}`,
    method: 'delete'
  });
};

/**
 * 查询物流轨迹
 * @param trackingNumber 物流单号
 * @param company 物流公司代码
 */
export const queryLogisticsTrack = (trackingNumber: string, company: string) => {
  return request({
    url: '/logistics/track',
    method: 'get',
    params: { trackingNumber, company }
  });
}; 