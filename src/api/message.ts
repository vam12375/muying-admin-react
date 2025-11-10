import request from '@/utils/request';

/**
 * 消息相关API
 */

/**
 * 获取消息列表
 * @param params 查询参数
 */
export const getMessageList = (params: any) => {
  return request({
    url: '/admin/message/list',
    method: 'get',
    params
  });
};

/**
 * 获取消息详情
 * @param id 消息ID
 */
export const getMessageDetail = (id: number | string) => {
  return request({
    url: `/admin/message/${id}`,
    method: 'get'
  });
};

/**
 * 创建消息
 * @param data 消息数据
 */
export const createMessage = (data: any) => {
  return request({
    url: '/admin/message/system',
    method: 'post',
    params: data
  });
};

/**
 * 更新消息
 * @param id 消息ID
 * @param data 更新数据
 */
export const updateMessage = (id: number | string, data: any) => {
  return request({
    url: `/admin/message/${id}`,
    method: 'put',
    data
  });
};

/**
 * 删除消息
 * @param id 消息ID
 */
export const deleteMessage = (id: number | string) => {
  return request({
    url: `/admin/message/${id}`,
    method: 'delete'
  });
};

/**
 * 发送消息
 * @param id 消息ID
 */
export const sendMessage = (id: number | string) => {
  return request({
    url: `/admin/message/${id}/send`,
    method: 'post'
  });
};

/**
 * 获取未读消息数量
 */
export const getUnreadCount = () => {
  return request({
    url: '/admin/message/unread/count',
    method: 'get'
  });
};

/**
 * 标记消息为已读
 * @param ids 消息ID数组
 */
export const markAsRead = (ids: (number | string)[]) => {
  return request({
    url: '/admin/message/read',
    method: 'put',
    params: { id: Array.isArray(ids) ? ids[0] : ids }
  });
};

/**
 * 标记所有消息为已读
 */
export const markAllRead = () => {
  return request({
    url: '/admin/message/readAll',
    method: 'put'
  });
};

/**
 * 获取消息统计数据
 */
export const getMessageStatistics = () => {
  return request({
    url: '/admin/message/statistics',
    method: 'get'
  });
};

/**
 * 获取消息模板列表
 * @param params 查询参数
 */
export const getMessageTemplateList = (params: any) => {
  return request({
    url: '/admin/message/template/list',
    method: 'get',
    params
  });
};

/**
 * 获取消息模板详情
 * @param id 模板ID
 */
export const getMessageTemplateDetail = (id: number | string) => {
  return request({
    url: `/admin/message/template/${id}`,
    method: 'get'
  });
};

/**
 * 创建消息模板
 * @param data 模板数据
 */
export const createMessageTemplate = (data: any) => {
  return request({
    url: '/admin/message/template',
    method: 'post',
    data
  });
};

/**
 * 更新消息模板
 * @param id 模板ID
 * @param data 更新数据
 */
export const updateMessageTemplate = (id: number | string, data: any) => {
  return request({
    url: `/admin/message/template/${id}`,
    method: 'put',
    data
  });
};

/**
 * 删除消息模板
 * @param id 模板ID
 */
export const deleteMessageTemplate = (id: number | string) => {
  return request({
    url: `/admin/message/template/${id}`,
    method: 'delete'
  });
}; 