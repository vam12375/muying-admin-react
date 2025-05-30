/**
 * 数据适配器工具
 * 用于处理前后端数据格式不匹配的问题
 */

/**
 * 适配管理员数据，将后端返回的数据结构转换为前端期望的格式
 * @param backendData 后端返回的原始数据
 * @returns 适配后的管理员数据
 */
export function adaptAdminData(backendData: Record<string, any>): Record<string, any> {
  if (!backendData) return {};
  
  // 获取最可能包含管理员信息的对象
  // 尝试多种可能的路径
  const rawData = 
    backendData.data || // {data: {...}}
    backendData.admin || // {admin: {...}}
    backendData.adminInfo || // {adminInfo: {...}}
    backendData.userInfo || // {userInfo: {...}}
    backendData || // 直接使用传入的数据
    {};

  // 映射字段名称
  return {
    id: rawData.id || rawData.adminId || rawData.userId || '',
    username: rawData.username || rawData.account || rawData.name || rawData.userName || '',
    nickname: rawData.nickname || rawData.displayName || rawData.realName || rawData.nickName || rawData.username || '',
    avatar: rawData.avatar || rawData.avatarUrl || rawData.profileImage || rawData.headImg || '',
    email: rawData.email || rawData.mail || rawData.emailAddress || '',
    phone: rawData.phone || rawData.mobile || rawData.phoneNumber || rawData.mobileNumber || '',
    role: rawData.role || rawData.roleName || (rawData.roles && rawData.roles[0]) || 'admin',
    status: typeof rawData.status !== 'undefined' ? rawData.status : (rawData.accountStatus || rawData.isActive || 1),
    createTime: rawData.createTime || rawData.createdAt || rawData.registerTime || rawData.createDate || '',
    lastLogin: rawData.lastLogin || rawData.lastLoginTime || rawData.lastLoginAt || '',
    loginCount: rawData.loginCount || rawData.loginTimes || rawData.loginNum || 0
  };
}

/**
 * 适配管理员日志数据
 * @param backendData 后端返回的原始日志数据
 * @returns 适配后的日志数据数组
 */
export function adaptAdminLogs(backendData: Record<string, any>): Record<string, any>[] {
  if (!backendData) return [];
  
  // 获取日志列表数据
  const logsList = 
    backendData.list || 
    backendData.data?.list || 
    backendData.logs || 
    backendData.data?.logs || 
    backendData.items ||
    backendData.data?.items ||
    [];
  
  // 如果不是数组，返回空数组
  if (!Array.isArray(logsList)) return [];
  
  // 映射每条日志的字段
  return logsList.map(log => ({
    id: log.id || log.logId || '',
    operation: log.operation || log.actionName || log.action || log.description || '',
    module: log.module || log.moduleName || log.type || '',
    ip: log.ip || log.ipAddress || '',
    createTime: log.createTime || log.createdAt || log.operateTime || log.time || '',
    detail: log.detail || log.content || log.message || ''
  }));
} 