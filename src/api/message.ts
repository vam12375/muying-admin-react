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
    url: '/messages',
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
    url: `/messages/${id}`,
    method: 'get'
  });
};

/**
 * 创建消息
 * @param data 消息数据
 */
export const createMessage = (data: any) => {
  return request({
    url: '/messages',
    method: 'post',
    data
  });
};

/**
 * 更新消息
 * @param id 消息ID
 * @param data 更新数据
 */
export const updateMessage = (id: number | string, data: any) => {
  return request({
    url: `/messages/${id}`,
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
    url: `/messages/${id}`,
    method: 'delete'
  });
};

/**
 * 发送消息
 * @param id 消息ID
 */
export const sendMessage = (id: number | string) => {
  return request({
    url: `/messages/${id}/send`,
    method: 'post'
  });
};

/**
 * 获取未读消息数量
 */
export const getUnreadCount = () => {
  return request({
    url: '/messages/unread/count',
    method: 'get'
  });
};

/**
 * 标记消息为已读
 * @param ids 消息ID数组
 */
export const markAsRead = (ids: (number | string)[]) => {
  return request({
    url: '/messages/read',
    method: 'post',
    data: { ids }
  });
};

/**
 * 获取消息统计数据
 */
export const getMessageStatistics = () => {
  return request({
    url: '/messages/statistics',
    method: 'get'
  });
}; 