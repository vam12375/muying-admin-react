import request from '@/utils/request'
import type { AxiosPromise } from 'axios'

/**
 * 分页获取用户列表
 * @param {number} page 页码
 * @param {number} size 每页数量
 * @param {string} keyword 搜索关键字
 * @param {string} status 状态筛选
 * @param {string} role 角色筛选
 * @returns {Promise} 请求结果
 */
export function getUserPage(page = 1, size = 10, keyword?: string, status?: string, role?: string): AxiosPromise {
  return request({
    url: '/admin/users/page',
    method: 'get',
    params: {
      page,
      size,
      keyword,
      status,
      role
    }
  })
}

/**
 * 获取用户详情
 * @param {number} id 用户ID
 * @returns {Promise} 请求结果
 */
export function getUserById(id: number): AxiosPromise {
  return request({
    url: `/admin/users/${id}`,
    method: 'get'
  })
}

/**
 * 添加用户
 * @param {object} data 用户数据
 * @returns {Promise} 请求结果
 */
export function addUser(data: any): AxiosPromise {
  return request({
    url: '/admin/users',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 * @param {number} id 用户ID
 * @param {object} data 用户数据
 * @returns {Promise} 请求结果
 */
export function updateUser(id: number, data: any): AxiosPromise {
  return request({
    url: `/admin/users/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除用户
 * @param {number} id 用户ID
 * @returns {Promise} 请求结果
 */
export function deleteUser(id: number): AxiosPromise {
  return request({
    url: `/admin/users/${id}`,
    method: 'delete'
  })
}

/**
 * 修改用户状态
 * @param {number} id 用户ID
 * @param {number} status 状态值：0-禁用，1-正常
 * @returns {Promise} 请求结果
 */
export function toggleUserStatus(id: number, status: number): AxiosPromise {
  return request({
    url: `/admin/users/${id}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 修改用户角色
 * @param {number} id 用户ID
 * @param {string} role 角色值：admin-管理员，user-普通用户
 * @returns {Promise} 请求结果
 */
export function updateUserRole(id: number, role: string): AxiosPromise {
  return request({
    url: `/admin/users/${id}/role`,
    method: 'put',
    params: { role }
  })
} 