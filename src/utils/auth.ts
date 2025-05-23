/**
 * Token工具模块
 * 处理用户token的存储、获取和删除
 */

const TOKEN_KEY = 'muying_admin_token';
const USER_KEY = 'muying_admin_user';

/**
 * 保存token到localStorage
 * @param {string} token 
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * 从localStorage获取token
 * @returns {string | null} token
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * 从localStorage删除token
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * 保存用户信息到localStorage
 * @param {any} user 用户信息
 */
export function setUser(user: any): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * 用户信息保存的别名方法（兼容性）
 * @param {any} userInfo 用户信息
 */
export function setUserInfo(userInfo: any): void {
  setUser(userInfo);
}

/**
 * 从localStorage获取用户信息
 * @returns {any | null} 用户信息
 */
export function getUser(): any | null {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

/**
 * 从localStorage删除用户信息
 */
export function removeUser(): void {
  localStorage.removeItem(USER_KEY);
}

/**
 * 清除所有认证相关的存储
 */
export function clearAuth(): void {
  removeToken();
  removeUser();
}

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export function isLoggedIn(): boolean {
  return !!getToken();
}

/**
 * 检查是否为管理员
 * @returns {boolean} 是否为管理员
 */
export function isAdmin(): boolean {
  const userInfo = getUser();
  return userInfo && userInfo.role === 'admin';
}

/**
 * 登出操作
 */
export function logout(): void {
  removeToken();
  removeUser();
  // 可以在这里添加其他登出操作，如清除其他本地存储等
} 