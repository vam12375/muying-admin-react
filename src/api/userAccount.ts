import request from '@/utils/request'
import type { AxiosPromise } from 'axios'

/**
 * 分页获取用户账户列表
 * @param {number} page 页码
 * @param {number} size 每页数量
 * @param {string} keyword 搜索关键字
 * @param {number} status 账户状态：0-冻结，1-正常
 * @returns {Promise} 请求结果
 */
export function getUserAccountPage(page = 1, size = 10, keyword?: string, status?: number): AxiosPromise {
  return request({
    url: '/admin/user-accounts/page',
    method: 'get',
    params: {
      page,
      size,
      keyword,
      status
    }
  })
}

/**
 * 获取用户账户详情
 * @param {number} userId 用户ID
 * @returns {Promise} 请求结果
 */
export function getUserAccountByUserId(userId: number): AxiosPromise {
  return request({
    url: `/admin/user-accounts/${userId}`,
    method: 'get'
  })
}

/**
 * 管理员给用户充值
 * @param {object} data 充值数据
 * @returns {Promise} 请求结果
 */
export function rechargeUserAccount(data: {
  userId: number,
  amount: number,
  paymentMethod: string,
  description?: string,
  remark?: string
}): AxiosPromise {
  return request({
    url: '/admin/user-accounts/recharge',
    method: 'post',
    data
  })
}

/**
 * 管理员调整用户余额
 * @param {number} userId 用户ID
 * @param {number} amount 调整金额
 * @param {string} reason 调整原因
 * @returns {Promise} 请求结果
 */
export function adjustUserBalance(userId: number, amount: number, reason: string): AxiosPromise {
  return request({
    url: `/admin/user-accounts/${userId}/balance`,
    method: 'put',
    params: {
      amount,
      reason
    }
  })
}

/**
 * 更改用户账户状态（冻结/解冻）
 * @param {number} userId 用户ID
 * @param {number} status 账户状态：0-冻结，1-正常
 * @param {string} reason 操作原因
 * @returns {Promise} 请求结果
 */
export function toggleUserAccountStatus(userId: number, status: number, reason?: string): AxiosPromise {
  return request({
    url: `/admin/user-accounts/${userId}/status`,
    method: 'put',
    params: {
      status,
      reason
    }
  })
}

/**
 * 分页获取交易记录列表
 * @param {number} page 页码
 * @param {number} size 每页数量
 * @param {object} query 查询条件
 * @returns {Promise} 请求结果
 */
export function getTransactionPage(page = 1, size = 10, query: {
  userId?: number,
  type?: number,
  status?: number,
  paymentMethod?: string,
  transactionNo?: string,
  startTime?: string,
  endTime?: string,
  keyword?: string
} = {}): AxiosPromise {
  return request({
    url: '/admin/user-accounts/transactions/page',
    method: 'get',
    params: {
      page,
      size,
      ...query
    }
  })
}

/**
 * 获取交易记录详情
 * @param {number} transactionId 交易记录ID
 * @returns {Promise} 请求结果
 */
export function getTransactionDetail(transactionId: number): AxiosPromise {
  return request({
    url: `/admin/user-accounts/transactions/${transactionId}`,
    method: 'get'
  })
} 