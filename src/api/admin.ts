import request from '@/utils/request';
import type { AxiosPromise } from 'axios';

/**
 * 管理员信息接口
 */
interface AdminInfo {
  id?: number;
  username?: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: number;
  createTime?: string;
  lastLogin?: string;
  loginCount?: number;
  [key: string]: any; // 允许其他未明确定义的属性
}

/**
 * 查询参数接口
 */
interface QueryParams {
  page?: number;
  size?: number;
  keyword?: string;
  startTime?: string;
  endTime?: string;
  type?: string;
  [key: string]: any; // 允许其他查询参数
}

/**
 * 获取当前管理员信息接口
 * @returns 包含管理员用户信息的Promise
 */
export function getAdminInfo(): AxiosPromise {
  return request({
    url: '/admin/info',
    method: 'get'
  });
}

/**
 * 更新管理员信息接口
 * @param data 要更新的信息
 * @returns 更新结果的Promise
 */
export function updateAdminInfo(data: AdminInfo): AxiosPromise {
  return request({
    url: '/admin/update',
    method: 'put',
    data
  });
}

/**
 * 更新管理员密码
 * @param data 包含旧密码和新密码的数据
 * @returns 更新结果的Promise
 */
export function updatePassword(data: { oldPassword: string; newPassword: string }): AxiosPromise {
  return request({
    url: '/admin/password',
    method: 'put',
    data
  });
}

/**
 * 上传管理员头像
 * @param formData 包含头像文件的表单数据
 * @returns 上传结果的Promise
 */
export function uploadAvatar(formData: FormData): AxiosPromise {
  return request({
    url: '/admin/avatar/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * 获取管理员操作日志
 * @param params 查询参数
 * @returns 日志数据的Promise
 */
export function getAdminLogs(params: QueryParams): AxiosPromise {
  return request({
    url: '/admin/logs',
    method: 'get',
    params
  });
} 