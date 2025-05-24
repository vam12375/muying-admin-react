import axios from 'axios';

// 通用分析响应类型
export interface AnalyticsResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 仪表盘汇总数据类型
export interface DashboardSummary {
  // 销售相关
  totalSales: number;
  dailySales: number;
  monthlySales: number;
  salesGrowth: number;
  
  // 订单相关
  totalOrders: number;
  dailyOrders: number;
  monthlyOrders: number;
  orderGrowth: number;
  
  // 用户相关
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  userGrowth: number;
  
  // 商品相关
  totalProducts: number;
  outOfStockProducts: number;
  productGrowth: number;
}

// 销售趋势数据类型
export interface SalesTrend {
  date: string;
  sales: number;
  orders: number;
}

// 分类销售数据类型
export interface CategorySales {
  category: string;
  sales: number;
  percentage: number;
}

// 用户地域分布数据类型
export interface UserRegion {
  region: string;
  users: number;
  percentage: number;
}

// 报表类型
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'dashboard' | 'sales' | 'users' | 'products' | 'custom';
  config: any; // 报表配置
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 分析模块API
export const analyticsApi = {
  // 获取仪表盘汇总数据
  getDashboardSummary: async (
    timeRange: string = 'today',
    startDate?: string,
    endDate?: string
  ): Promise<DashboardSummary> => {
    try {
      const params = { timeRange, startDate, endDate };
      const response = await axios.get('/admin/analytics/dashboard-summary', { params });
      console.log('获取仪表盘汇总数据成功:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('获取仪表盘汇总数据失败', error);
      // 返回模拟数据以便前端开发
      return {
        totalSales: 268452.65,
        dailySales: 12680.54,
        monthlySales: 86452.32,
        salesGrowth: 12.5,
        
        totalOrders: 8426,
        dailyOrders: 186,
        monthlyOrders: 1245,
        orderGrowth: 8.2,
        
        totalUsers: 3254,
        newUsers: 28,
        activeUsers: 452,
        userGrowth: 5.3,
        
        totalProducts: 1256,
        outOfStockProducts: 32,
        productGrowth: 2.1
      };
    }
  },
  
  // 获取销售趋势数据
  getSalesTrend: async (
    timeRange: string = 'week',
    startDate?: string,
    endDate?: string
  ): Promise<SalesTrend[]> => {
    try {
      const params = { timeRange, startDate, endDate };
      const response = await axios.get('/admin/analytics/sales-trend', { params });
      console.log('获取销售趋势数据成功:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('获取销售趋势数据失败', error);
      // 返回模拟数据
      return Array(timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 12).fill(null).map((_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (timeRange === 'week' ? index : index));
        return {
          date: date.toISOString().split('T')[0],
          sales: 5000 + Math.random() * 10000,
          orders: 50 + Math.random() * 100
        };
      }).reverse();
    }
  },
  
  // 获取分类销售数据
  getCategorySales: async (
    timeRange: string = 'month'
  ): Promise<CategorySales[]> => {
    try {
      const params = { timeRange };
      const response = await axios.get('/admin/analytics/category-sales', { params });
      console.log('获取分类销售数据成功:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('获取分类销售数据失败', error);
      // 返回模拟数据
      return [
        { category: '奶粉', sales: 68452.32, percentage: 28 },
        { category: '尿布', sales: 52145.65, percentage: 22 },
        { category: '玩具', sales: 35624.78, percentage: 15 },
        { category: '辅食', sales: 28945.12, percentage: 12 },
        { category: '童装', sales: 26321.45, percentage: 11 },
        { category: '洗护', sales: 18745.23, percentage: 8 },
        { category: '其它', sales: 9562.15, percentage: 4 }
      ];
    }
  },
  
  // 获取用户地域分布
  getUserRegions: async (): Promise<UserRegion[]> => {
    try {
      const response = await axios.get('/admin/analytics/user-regions');
      console.log('获取用户地域分布成功:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('获取用户地域分布失败', error);
      // 返回模拟数据
      return [
        { region: '华东', users: 1245, percentage: 32 },
        { region: '华南', users: 986, percentage: 25 },
        { region: '华北', users: 756, percentage: 19 },
        { region: '西南', users: 452, percentage: 12 },
        { region: '东北', users: 325, percentage: 8 },
        { region: '西北', users: 156, percentage: 4 }
      ];
    }
  },
  
  // 获取报表模板列表
  getReportTemplates: async (): Promise<ReportTemplate[]> => {
    try {
      const response = await axios.get('/admin/analytics/report-templates');
      console.log('获取报表模板列表成功:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('获取报表模板列表失败', error);
      // 返回模拟数据
      return [
        {
          id: '1',
          name: '销售概览报表',
          description: '展示销售额、订单数等关键指标的概览报表',
          type: 'sales',
          config: {},
          createdBy: 'admin',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: '用户增长报表',
          description: '展示用户注册、活跃等数据的报表',
          type: 'users',
          config: {},
          createdBy: 'admin',
          createdAt: '2023-01-02T00:00:00Z',
          updatedAt: '2023-01-02T00:00:00Z'
        },
        {
          id: '3',
          name: '商品销量报表',
          description: '展示各商品销量、库存等数据的报表',
          type: 'products',
          config: {},
          createdBy: 'admin',
          createdAt: '2023-01-03T00:00:00Z',
          updatedAt: '2023-01-03T00:00:00Z'
        }
      ];
    }
  },
  
  // 创建报表模板
  createReportTemplate: async (template: Partial<ReportTemplate>): Promise<ReportTemplate> => {
    try {
      const response = await axios.post('/admin/analytics/report-templates', template);
      console.log('创建报表模板成功:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('创建报表模板失败', error);
      throw error;
    }
  },
  
  // 更新报表模板
  updateReportTemplate: async (id: string, template: Partial<ReportTemplate>): Promise<ReportTemplate> => {
    try {
      const response = await axios.put(`/admin/analytics/report-templates/${id}`, template);
      console.log('更新报表模板成功:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('更新报表模板失败', error);
      throw error;
    }
  },
  
  // 删除报表模板
  deleteReportTemplate: async (id: string): Promise<boolean> => {
    try {
      const response = await axios.delete(`/admin/analytics/report-templates/${id}`);
      console.log('删除报表模板成功:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('删除报表模板失败', error);
      throw error;
    }
  },
  
  // 导出报表
  exportReport: async (
    templateId: string, 
    format: 'excel' | 'pdf' | 'csv', 
    params: Record<string, any>
  ): Promise<Blob> => {
    try {
      const response = await axios.get(
        `/admin/analytics/export-report/${templateId}`, 
        { 
          params: { format, ...params },
          responseType: 'blob'
        }
      );
      console.log('导出报表成功');
      return response.data;
    } catch (error) {
      console.error('导出报表失败', error);
      throw error;
    }
  }
}; 