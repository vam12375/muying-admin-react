import axios from 'axios';

// 商品接口类型
export interface ProductData {
  productId: number;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  stock: number;
  status: number;
  createTime: string;
  description?: string;
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

// 分页结果接口
export interface PageResult<T> {
  list: T[];
  pageNum: number;
  pageSize: number;
  total: number;
  totalPage: number;
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
      const response = await axios.get('/admin/products/page', { params });
      return response.data.data;
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
      return response.data.data;
    } catch (error) {
      console.error('获取品牌列表失败', error);
      throw error;
    }
  },

  // 获取所有品牌
  getAllBrands: async (): Promise<BrandData[]> => {
    try {
      const response = await axios.get('/admin/brands/all');
      return response.data.data;
    } catch (error) {
      console.error('获取所有品牌失败', error);
      throw error;
    }
  },

  // 获取品牌详情
  getBrandDetail: async (id: number): Promise<BrandData> => {
    try {
      const response = await axios.get(`/admin/brands/${id}`);
      return response.data.data;
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
      const response = await axios.get('/admin/categories/list');
      return response.data.data;
    } catch (error) {
      console.error('获取分类列表失败', error);
      throw error;
    }
  },

  // 获取分类详情
  getCategoryDetail: async (id: number): Promise<CategoryData> => {
    try {
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