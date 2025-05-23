import request from '@/utils/request';
import type { AxiosPromise } from 'axios';

/**
 * 管理员登录接口
 * @param admin_name 管理员用户名
 * @param admin_pass 管理员密码
 * @returns 包含token和用户信息的Promise
 */
export function adminLogin(data: { admin_name: string; admin_pass: string }): AxiosPromise {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  });
}

/**
 * 获取当前管理员信息接口
 * @returns 包含管理员用户信息的Promise
 */
export function getUserInfo(): AxiosPromise {
  return request({
    url: '/admin/info',
    method: 'get'
  });
}

/**
 * 管理员登出接口
 * @returns 登出结果的Promise
 */
export function logout(): AxiosPromise {
  return request({
    url: '/admin/logout',
    method: 'post'
  });
}

/**
 * 统一API响应格式
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  success?: boolean;
}

/**
 * 登录响应数据格式
 */
export interface LoginResponseData {
  token: string;
  user: {
    id: number;
    username: string;
    nickname: string;
    avatar: string;
    role: string;
  };
} 