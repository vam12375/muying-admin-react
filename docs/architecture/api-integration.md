# 母婴商城管理后台API集成

本文档详细介绍母婴商城管理后台(muying-admin-react)与后端API的集成方式，包括请求封装、数据处理、错误处理等内容。

## API架构概述

母婴商城管理后台通过以下方式与后端API进行交互：

1. **基础HTTP客户端**：基于Axios封装
2. **RTK Query**：用于数据获取和缓存
3. **服务层封装**：按业务功能组织API调用
4. **TypeScript类型支持**：提供完整的类型定义

## 核心组件

### 1. API客户端封装

我们使用Axios作为基础HTTP客户端，并进行了统一封装：

```typescript
// api/apiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { store } from '@/store';
import { logout } from '@/store/slices/authThunks';
import { message } from 'antd';

// 创建Axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = store.getState().auth.token;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 统一提取响应数据
    if (response.data && response.data.code === 200) {
      return response.data.data;
    }
    
    // 处理业务错误
    const errorMessage = response.data?.message || '操作失败';
    message.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
  },
  async (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // 处理401错误（未授权）
      if (status === 401) {
        // 清除认证状态，重定向到登录页
        store.dispatch(logout());
        message.error('登录已过期，请重新登录');
      } 
      // 处理403错误（权限不足）
      else if (status === 403) {
        message.error('您没有权限执行此操作');
      } 
      // 处理其他错误
      else {
        const errorMessage = (data as any)?.message || '请求失败';
        message.error(errorMessage);
      }
    } else {
      message.error('网络错误，请检查您的网络连接');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 2. API服务层

API服务按业务功能进行组织，每个业务模块有自己的API服务：

```typescript
// api/auth/index.ts
import apiClient from '../apiClient';
import { LoginRequest, RegisterRequest, LoginResponse, UserInfo } from './types';

export const authAPI = {
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post('/auth/login', data);
  },
  
  register: (data: RegisterRequest): Promise<void> => {
    return apiClient.post('/auth/register', data);
  },
  
  getUserInfo: (): Promise<UserInfo> => {
    return apiClient.get('/auth/user-info');
  },
  
  logout: (): Promise<void> => {
    return apiClient.post('/auth/logout');
  },
  
  refreshToken: (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    return apiClient.post('/auth/refresh-token', { refreshToken });
  },
};
```

```typescript
// api/products/index.ts
import apiClient from '../apiClient';
import { 
  ProductListParams, 
  ProductListResponse, 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest 
} from './types';

export const productAPI = {
  getProducts: (params: ProductListParams): Promise<ProductListResponse> => {
    return apiClient.get('/products', { params });
  },
  
  getProductById: (id: string): Promise<Product> => {
    return apiClient.get(`/products/${id}`);
  },
  
  createProduct: (data: CreateProductRequest): Promise<Product> => {
    return apiClient.post('/products', data);
  },
  
  updateProduct: (id: string, data: UpdateProductRequest): Promise<Product> => {
    return apiClient.put(`/products/${id}`, data);
  },
  
  deleteProduct: (id: string): Promise<void> => {
    return apiClient.delete(`/products/${id}`);
  },
  
  batchDeleteProducts: (ids: string[]): Promise<void> => {
    return apiClient.post('/products/batch-delete', { ids });
  },
};
```

### 3. RTK Query集成

对于更复杂的数据获取和缓存需求，我们使用RTK Query：

```typescript
// store/rtk-query/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/store';

// 创建基础API
export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
    // 解析响应以统一处理业务状态码
    responseHandler: (response) => {
      if (!response.ok) {
        return Promise.reject(response);
      }
      return response.json().then((data: any) => {
        if (data.code === 200) {
          return data.data;
        }
        return Promise.reject(data);
      });
    },
  }),
  // 全局端点设置
  endpoints: () => ({}),
});
```

```typescript
// store/rtk-query/productApi.ts
import { api } from './api';
import { 
  ProductListParams, 
  ProductListResponse, 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest 
} from '@/types/product';

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<ProductListResponse, ProductListParams>({
      query: (params) => ({
        url: '/products',
        params,
      }),
      providesTags: (result) => 
        result
          ? [
              ...result.content.map(({ id }) => ({ type: 'Products' as const, id })),
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }],
    }),
    
    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    
    createProduct: builder.mutation<Product, CreateProductRequest>({
      query: (data) => ({
        url: '/products',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),
    
    updateProduct: builder.mutation<Product, { id: string; data: UpdateProductRequest }>({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Products', id: 'LIST' },
        { type: 'Product', id },
      ],
    }),
    
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
```

## 类型定义

为确保类型安全，我们为每个API请求和响应定义了TypeScript类型：

```typescript
// types/api.ts (通用API类型)
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
  requestId: string;
}

export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
}

export interface PaginationResult<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      direction: 'ASC' | 'DESC';
      property: string;
    }[];
  };
  totalElements: number;
  totalPages: number;
}
```

```typescript
// api/products/types.ts (产品模块API类型)
import { PaginationParams, PaginationResult } from '@/types/api';

export interface ProductCategory {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  sort: number;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface ProductImage {
  id: string;
  url: string;
  sort: number;
  isMain: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  stock: number;
  sales: number;
  categoryId: string;
  category?: ProductCategory;
  brandId: string;
  brandName?: string;
  images: ProductImage[];
  attributes: ProductAttribute[];
  status: 0 | 1; // 0-下架 1-上架
  isHot: boolean;
  isNew: boolean;
  isRecommend: boolean;
  createTime: string;
  updateTime: string;
}

export interface ProductListParams extends PaginationParams {
  keyword?: string;
  categoryId?: string;
  brandId?: string;
  priceMin?: number;
  priceMax?: number;
  status?: number;
  isHot?: boolean;
  isNew?: boolean;
  isRecommend?: boolean;
}

export type ProductListResponse = PaginationResult<Product>;

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  stock: number;
  categoryId: string;
  brandId: string;
  images: Omit<ProductImage, 'id'>[];
  attributes: ProductAttribute[];
  status: 0 | 1;
  isHot: boolean;
  isNew: boolean;
  isRecommend: boolean;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;
```

## 使用模式

### 1. 直接使用API服务

```typescript
import { useEffect, useState } from 'react';
import { productAPI } from '@/api/products';
import { Product, ProductListParams } from '@/api/products/types';
import { message } from 'antd';

const ProductListPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [params, setParams] = useState<ProductListParams>({
    page: 1,
    size: 10,
  });
  
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await productAPI.getProducts(params);
      setProducts(result.content);
      setTotal(result.totalElements);
    } catch (error) {
      message.error('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
  }, [params]);
  
  // ... 渲染逻辑
};
```

### 2. 使用RTK Query Hook

```typescript
import { useState } from 'react';
import { useGetProductsQuery, useDeleteProductMutation } from '@/store/rtk-query/productApi';
import { ProductListParams } from '@/types/product';

const ProductListPage = () => {
  const [params, setParams] = useState<ProductListParams>({
    page: 1,
    size: 10,
  });
  
  const { 
    data, 
    isLoading, 
    isFetching, 
    refetch 
  } = useGetProductsQuery(params);
  
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  
  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id).unwrap();
      message.success('删除成功');
    } catch (error) {
      // 错误已由拦截器处理
    }
  };
  
  // ... 渲染逻辑
};
```

### 3. 自定义Hook封装

```typescript
// hooks/useProductList.ts
import { useState } from 'react';
import { useGetProductsQuery } from '@/store/rtk-query/productApi';
import { ProductListParams } from '@/types/product';

export const useProductList = (initialParams: Partial<ProductListParams> = {}) => {
  const [params, setParams] = useState<ProductListParams>({
    page: 1,
    size: 10,
    ...initialParams,
  });
  
  const { 
    data,
    isLoading,
    isFetching,
    refetch,
  } = useGetProductsQuery(params);
  
  const handlePageChange = (page: number, pageSize?: number) => {
    setParams(prev => ({
      ...prev,
      page,
      size: pageSize || prev.size,
    }));
  };
  
  const handleFiltersChange = (filters: Partial<ProductListParams>) => {
    setParams(prev => ({
      ...prev,
      page: 1, // 重置到第一页
      ...filters,
    }));
  };
  
  return {
    products: data?.content || [],
    pagination: {
      current: params.page,
      pageSize: params.size,
      total: data?.totalElements || 0,
      onChange: handlePageChange,
    },
    filters: params,
    isLoading: isLoading || isFetching,
    refetch,
    handleFiltersChange,
  };
};
```

使用自定义Hook：

```typescript
import { useProductList } from '@/hooks/useProductList';
import { Table, Button, Input } from 'antd';

const ProductListPage = () => {
  const { 
    products, 
    pagination, 
    filters, 
    isLoading, 
    handleFiltersChange 
  } = useProductList();
  
  const handleSearch = (keyword: string) => {
    handleFiltersChange({ keyword });
  };
  
  // ... 渲染逻辑
};
```

## 文件上传处理

对于文件上传，我们封装了专门的服务：

```typescript
// api/upload/index.ts
import apiClient from '../apiClient';
import { UploadResponse } from './types';

export const uploadAPI = {
  uploadImage: (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  uploadMultipleImages: (files: File[]): Promise<UploadResponse[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    return apiClient.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
```

使用示例：

```typescript
import { UploadProps, Upload, message } from 'antd';
import { uploadAPI } from '@/api/upload';

const ImageUploader = ({ value, onChange }) => {
  const handleUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      const response = await uploadAPI.uploadImage(file as File);
      onSuccess?.(response, undefined);
      onChange?.([...value, response]);
    } catch (error) {
      onError?.(error as any);
    }
  };
  
  // ... 渲染逻辑
};
```

## 错误处理策略

我们采用多层次的错误处理策略：

1. **拦截器级别**：处理常见错误（401、403等）
2. **服务级别**：处理特定业务错误
3. **组件级别**：处理UI相关错误

```typescript
// 组件级别错误处理示例
const handleSubmit = async (values) => {
  setSubmitting(true);
  try {
    await productAPI.createProduct(values);
    message.success('创建成功');
    navigate('/products');
  } catch (error) {
    // 特定业务错误处理（通用错误已由拦截器处理）
    if (error?.response?.status === 409) {
      message.error('商品名称已存在');
    }
  } finally {
    setSubmitting(false);
  }
};
```

## API文档集成

为方便开发，我们在开发环境集成了Swagger UI文档：

```typescript
// api/docs.ts
export const openApiDocs = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const docsUrl = `${apiBaseUrl}/swagger-ui.html`;
  window.open(docsUrl, '_blank');
};
```

## 高级功能

### 请求取消

使用Axios的取消令牌处理取消请求：

```typescript
// hooks/useCancelToken.ts
import { useRef, useEffect } from 'react';
import axios, { CancelTokenSource } from 'axios';

export const useCancelToken = () => {
  const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);
  
  useEffect(() => {
    return () => {
      // 组件卸载时取消正在进行的请求
      if (cancelTokenSourceRef.current) {
        cancelTokenSourceRef.current.cancel('组件卸载');
      }
    };
  }, []);
  
  const getCancelToken = () => {
    // 如果已存在，先取消旧的请求
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel('新请求开始');
    }
    
    // 创建新的取消令牌
    cancelTokenSourceRef.current = axios.CancelToken.source();
    return cancelTokenSourceRef.current.token;
  };
  
  return { getCancelToken };
};
```

使用示例：

```typescript
const SearchComponent = () => {
  const { getCancelToken } = useCancelToken();
  
  const handleSearch = async (keyword) => {
    try {
      const result = await apiClient.get('/search', { 
        params: { keyword },
        cancelToken: getCancelToken(),
      });
      setSearchResults(result);
    } catch (error) {
      if (!axios.isCancel(error)) {
        message.error('搜索失败');
      }
    }
  };
  
  // ...
};
```

### 请求重试

针对网络不稳定场景的请求重试机制：

```typescript
// utils/retryRequest.ts
import apiClient from '@/api/apiClient';
import { AxiosRequestConfig } from 'axios';

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryStatusCodes: number[];
}

export const retryRequest = async <T>(
  config: AxiosRequestConfig, 
  retryConfig: Partial<RetryConfig> = {}
): Promise<T> => {
  const { 
    maxRetries = 3, 
    retryDelay = 1000, 
    retryStatusCodes = [408, 500, 502, 503, 504] 
  } = retryConfig;
  
  let retries = 0;
  
  const executeRequest = async (): Promise<T> => {
    try {
      return await apiClient.request<T>(config);
    } catch (error: any) {
      if (
        retries < maxRetries && 
        error.response && 
        retryStatusCodes.includes(error.response.status)
      ) {
        retries++;
        // 指数退避策略
        const delay = retryDelay * Math.pow(2, retries - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeRequest();
      }
      throw error;
    }
  };
  
  return executeRequest();
};
```

## API Mock和开发

在早期开发或后端API不可用时，我们使用Mock服务：

```typescript
// api/mock/handlers.ts
import { rest } from 'msw';
import { mockProducts } from './data/products';

export const handlers = [
  rest.get('/api/v1/products', (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page')) || 1;
    const size = Number(req.url.searchParams.get('size')) || 10;
    
    const start = (page - 1) * size;
    const end = start + size;
    const paginatedData = mockProducts.slice(start, end);
    
    return res(
      ctx.status(200),
      ctx.json({
        code: 200,
        message: 'success',
        data: {
          content: paginatedData,
          pageable: {
            pageNumber: page,
            pageSize: size,
            sort: [],
          },
          totalElements: mockProducts.length,
          totalPages: Math.ceil(mockProducts.length / size),
        },
        timestamp: Date.now(),
        requestId: `mock-${Date.now()}`,
      })
    );
  }),
  
  // 其他模拟接口...
];
```

```typescript
// main.tsx 集成Mock
import { worker } from './api/mock/browser';

// 只在开发环境启用Mock
if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true') {
  worker.start();
}
```

## 最佳实践

1. **请求抽象层**：不要在组件中直接使用Axios，始终通过API服务或RTK Query
2. **类型安全**：为所有请求和响应定义TypeScript接口
3. **统一错误处理**：大部分错误在拦截器中处理，特殊错误在业务代码中处理
4. **加载状态管理**：使用全局或局部加载状态，提供良好的用户体验
5. **缓存策略**：合理使用RTK Query的缓存机制，避免不必要的请求
6. **取消请求**：在组件卸载或条件变化时取消不必要的请求
7. **权限检查**：根据用户权限控制API调用和UI展示

## 相关资源

- [Axios官方文档](https://axios-http.com/docs/intro)
- [RTK Query文档](https://redux-toolkit.js.org/rtk-query/overview)
- [TypeScript文档](https://www.typescriptlang.org/docs/)
- [项目架构概述](overview.md)
- [状态管理设计](state-management.md) 