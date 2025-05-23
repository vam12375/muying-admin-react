import axios from 'axios';

// 商品接口类型
export interface ProductData {
  productId: number;
  categoryId: number;
  brandId: number;
  name?: string;           // 兼容旧代码
  productName: string;     // 后端实际字段
  productSn: string;
  image?: string;          // 兼容旧代码
  productImg: string;      // 后端实际字段
  productDetail: string;
  price?: number;          // 兼容旧代码
  priceNew: number;        // 后端实际字段
  originalPrice?: number;  // 兼容旧代码
  priceOld: number;        // 后端实际字段
  stock: number;
  sales: number;
  support: number;
  rating: number;
  reviewCount: number;
  status?: number;         // 兼容旧代码
  productStatus: string;   // 后端实际字段
  isHot: number;
  isNew: number;
  isRecommend: number;
  createTime: string;
  updateTime: string;
  images: string[] | null;
  specsList: any[] | null;
  categoryName: string;
  brandName: string;
  description?: string;    // 兼容旧代码
}

// 品牌接口类型
export interface BrandData {
  brandId: number;
  name: string;
  logo: string;
  description: string;
  status: number;
  sort: number;
  createTime: string;
  productCount?: number;
}

// 分类接口类型
export interface CategoryData {
  categoryId: number;
  name: string;
  parentId: number;
  level: number;
  sort: number;
  status: number;
  icon?: string;
  description?: string;
  createTime: string;
  children?: CategoryData[];
  productCount?: number;
}

// 商品分析数据接口
export interface ProductAnalysisData {
  totalProducts: number;
  newProducts: number;
  outOfStock: number;
  totalSales: number;
  topCategories: { name: string, count: number }[];
  topBrands: { name: string, count: number }[];
}

// 分页结果接口
export interface PageResult<T> {
  list?: T[];      // 兼容原有代码
  records?: T[];   // 后端返回的字段
  pageNum?: number; // 兼容原有代码
  current?: number; // 后端返回的字段
  pageSize?: number; // 兼容原有代码
  size?: number;    // 后端返回的字段
  total: number;
  totalPage?: number; // 兼容原有代码
  pages?: number;    // 后端返回的字段
}

// 通用响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 商品管理API
export const productApi = {
  // 获取商品分页列表
  getProductPage: async (
    page: number = 1,
    size: number = 10,
    keyword?: string,
    categoryId?: number,
    brandId?: number,
    status?: number
  ): Promise<PageResult<ProductData>> => {
    try {
      const params = { page, size, keyword, categoryId, brandId, status };
      console.log('发送商品列表请求参数:', params);
      const response = await axios.get('/admin/products/page', { params });
      console.log('商品列表API原始响应:', response);
      
      // 获取后端返回的数据
      const responseData = response.data.data;
      console.log('商品列表API数据结构:', JSON.stringify(responseData, null, 2));
      
      // 检查记录中的字段
      if (responseData.records && responseData.records.length > 0) {
        console.log('第一条记录字段:', Object.keys(responseData.records[0]));
        console.log('第一条记录内容:', responseData.records[0]);
      }
      
      // 处理记录，映射字段名
      const processedRecords = responseData.records ? responseData.records.map((item: any) => ({
        ...item,
        // 添加兼容字段
        name: item.productName,
        image: item.productImg,
        price: item.priceNew,
        originalPrice: item.priceOld,
        status: item.productStatus === '上架' ? 1 : 0
      })) : [];
      
      // 返回统一的数据结构，同时保留原始字段
      return {
        list: processedRecords,  // 将处理后的记录映射为 list
        records: responseData.records,
        pageNum: responseData.current,
        current: responseData.current,
        pageSize: responseData.size,
        size: responseData.size,
        total: responseData.total,
        totalPage: responseData.pages,
        pages: responseData.pages
      };
    } catch (error) {
      console.error('获取商品列表失败', error);
      throw error;
    }
  },

  // 获取商品详情
  getProductDetail: async (id: number): Promise<ProductData> => {
    try {
      const response = await axios.get(`/admin/products/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('获取商品详情失败', error);
      throw error;
    }
  },

  // 创建商品
  createProduct: async (product: Partial<ProductData>): Promise<boolean> => {
    try {
      const response = await axios.post('/admin/products', product);
      return response.data.data;
    } catch (error) {
      console.error('创建商品失败', error);
      throw error;
    }
  },

  // 更新商品
  updateProduct: async (id: number, product: Partial<ProductData>): Promise<boolean> => {
    try {
      const response = await axios.put(`/admin/products/${id}`, product);
      return response.data.data;
    } catch (error) {
      console.error('更新商品失败', error);
      throw error;
    }
  },

  // 删除商品
  deleteProduct: async (id: number): Promise<boolean> => {
    try {
      const response = await axios.delete(`/admin/products/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('删除商品失败', error);
      throw error;
    }
  },

  // 更新商品状态
  updateProductStatus: async (id: number, status: number): Promise<boolean> => {
    try {
      const response = await axios.put(`/admin/products/${id}/status`, null, {
        params: { status }
      });
      return response.data.data;
    } catch (error) {
      console.error('更新商品状态失败', error);
      throw error;
    }
  },

  // 获取商品分析数据
  getProductAnalysis: async (timeRange: string = 'week', startDate?: string, endDate?: string): Promise<ProductAnalysisData> => {
    try {
      const params = { timeRange, startDate, endDate };
      const response = await axios.get('/admin/products/analysis', { params });
      return response.data.data;
    } catch (error) {
      console.error('获取商品分析数据失败', error);
      throw error;
    }
  }
};

// 品牌管理API
export const brandApi = {
  // 获取品牌分页列表
  getBrandPage: async (
    page: number = 1,
    size: number = 10,
    keyword?: string
  ): Promise<PageResult<BrandData>> => {
    try {
      const params = { page, size, keyword };
      const response = await axios.get('/admin/brands', { params });
      console.log('品牌列表API原始响应:', response.data);
      
      // 获取后端返回的数据
      const responseData = response.data.data;
      
      // 确保同时存在list和records字段，统一数据结构
      const brandList = responseData.records || responseData.list || [];
      
      // 处理品牌数据，确保同时包含id和brandId字段
      const processedBrandList = brandList.map(brand => ({
        ...brand,
        brandId: brand.brandId || brand.id,  // 优先使用brandId，如果不存在则使用id
        id: brand.id || brand.brandId,       // 优先使用id，如果不存在则使用brandId
        status: brand.status !== undefined ? brand.status : brand.showStatus,  // 优先使用status，如果不存在则使用showStatus
        showStatus: brand.showStatus !== undefined ? brand.showStatus : brand.status  // 优先使用showStatus，如果不存在则使用status
      }));
      
      console.log('处理后的品牌列表数据:', processedBrandList);
      
      // 如果处理后的数据中仍然没有正确的status字段，输出警告
      if (processedBrandList.length > 0 && processedBrandList.some(brand => brand.status === undefined)) {
        console.warn('警告：处理后的品牌数据中仍然存在status字段为undefined的记录');
      }
      
      // 返回统一的数据结构
      return {
        list: processedBrandList,
        records: processedBrandList,
        pageNum: responseData.current || responseData.pageNum,
        current: responseData.current || responseData.pageNum,
        pageSize: responseData.size || responseData.pageSize,
        size: responseData.size || responseData.pageSize,
        total: responseData.total,
        totalPage: responseData.pages || responseData.totalPage,
        pages: responseData.pages || responseData.totalPage
      };
    } catch (error) {
      console.error('获取品牌列表失败', error);
      throw error;
    }
  },

  // 获取所有品牌
  getAllBrands: async (): Promise<BrandData[]> => {
    try {
      console.log('正在获取所有品牌列表');
      const response = await axios.get('/admin/brands/all');
      console.log('获取品牌列表成功:', response.data);
      return response.data.data || [];
    } catch (error) {
      console.error('获取所有品牌失败', error);
      // 返回空数组而不是抛出错误，避免UI组件崩溃
      return [];
    }
  },

  // 获取品牌详情
  getBrandDetail: async (id: number): Promise<BrandData> => {
    try {
      // 检查id是否有效
      if (id === undefined || id === null) {
        console.error('获取品牌详情失败: 无效的品牌ID undefined');
        throw new Error('无效的品牌ID');
      }
      
      if (isNaN(Number(id))) {
        console.error(`获取品牌详情失败: 品牌ID不是有效数字 "${id}"`);
        throw new Error(`无效的品牌ID: ${id} 不是有效数字`);
      }
      
      console.log(`正在获取品牌详情, ID: ${id}`);
      const response = await axios.get(`/admin/brands/${id}`);
      console.log('获取品牌详情成功:', response.data);
      
      // 处理品牌详情数据，确保同时包含id和brandId字段
      const brandData = response.data.data;
      const processedBrandData = {
        ...brandData,
        brandId: brandData.brandId || brandData.id,  // 优先使用brandId，如果不存在则使用id
        id: brandData.id || brandData.brandId,       // 优先使用id，如果不存在则使用brandId
        status: brandData.status !== undefined ? brandData.status : brandData.showStatus,  // 优先使用status，如果不存在则使用showStatus
        showStatus: brandData.showStatus !== undefined ? brandData.showStatus : brandData.status  // 优先使用showStatus，如果不存在则使用status
      };
      
      console.log('处理后的品牌详情数据:', processedBrandData);
      
      // 如果处理后的数据中仍然没有正确的status字段，输出警告
      if (processedBrandData.status === undefined) {
        console.warn('警告：处理后的品牌详情数据中status字段为undefined');
      }
      
      return processedBrandData;
    } catch (error) {
      console.error('获取品牌详情失败', error);
      throw error;
    }
  },

  // 创建品牌
  createBrand: async (brand: Partial<BrandData>): Promise<boolean> => {
    try {
      const response = await axios.post('/admin/brands', brand);
      return response.data.data;
    } catch (error) {
      console.error('创建品牌失败', error);
      throw error;
    }
  },

  // 更新品牌
  updateBrand: async (id: number, brand: Partial<BrandData>): Promise<boolean> => {
    try {
      const response = await axios.put(`/admin/brands/${id}`, brand);
      return response.data.data;
    } catch (error) {
      console.error('更新品牌失败', error);
      throw error;
    }
  },

  // 删除品牌
  deleteBrand: async (id: number): Promise<boolean> => {
    try {
      const response = await axios.delete(`/admin/brands/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('删除品牌失败', error);
      throw error;
    }
  }
};

// 分类管理API
export const categoryApi = {
  // 获取所有分类（树形结构）
  getAllCategories: async (): Promise<CategoryData[]> => {
    try {
      const response = await axios.get('/admin/categories');
      return response.data.data;
    } catch (error) {
      console.error('获取分类树失败', error);
      throw error;
    }
  },

  // 获取所有分类（平铺结构）
  getAllCategoriesFlat: async (): Promise<CategoryData[]> => {
    try {
      console.log('正在获取所有分类列表');
      const response = await axios.get('/admin/categories/list');
      console.log('获取分类列表成功:', response.data);
      return response.data.data || [];
    } catch (error) {
      console.error('获取分类列表失败', error);
      // 返回空数组而不是抛出错误，避免UI组件崩溃
      return [];
    }
  },

  // 获取分类详情
  getCategoryDetail: async (id: number): Promise<CategoryData> => {
    try {
      // 检查id是否有效
      if (id === undefined || id === null || isNaN(Number(id))) {
        console.error('获取分类详情失败: 无效的分类ID', id);
        throw new Error('无效的分类ID');
      }
      
      const response = await axios.get(`/admin/categories/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('获取分类详情失败', error);
      throw error;
    }
  },

  // 创建分类
  createCategory: async (category: Partial<CategoryData>): Promise<boolean> => {
    try {
      const response = await axios.post('/admin/categories', category);
      return response.data.data;
    } catch (error) {
      console.error('创建分类失败', error);
      throw error;
    }
  },

  // 更新分类
  updateCategory: async (id: number, category: Partial<CategoryData>): Promise<boolean> => {
    try {
      const response = await axios.put(`/admin/categories/${id}`, category);
      return response.data.data;
    } catch (error) {
      console.error('更新分类失败', error);
      throw error;
    }
  },

  // 删除分类
  deleteCategory: async (id: number): Promise<boolean> => {
    try {
      const response = await axios.delete(`/admin/categories/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('删除分类失败', error);
      throw error;
    }
  },

  // 更新分类状态
  updateCategoryStatus: async (id: number, status: number): Promise<boolean> => {
    try {
      const response = await axios.put(`/admin/categories/${id}/status`, null, {
        params: { status }
      });
      return response.data.data;
    } catch (error) {
      console.error('更新分类状态失败', error);
      throw error;
    }
  },

  // 获取分类下的商品数量
  getCategoryProductCount: async (id: number): Promise<number> => {
    try {
      const response = await axios.get(`/admin/categories/${id}/product-count`);
      return response.data.data;
    } catch (error) {
      console.error('获取分类商品数量失败', error);
      throw error;
    }
  }
}; 