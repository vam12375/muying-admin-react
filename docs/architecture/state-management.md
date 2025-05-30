# 母婴商城管理后台状态管理设计

本文档详细介绍母婴商城管理后台(muying-admin-react)的状态管理设计，包括Redux Toolkit的使用方式、状态组织结构、异步处理方案等内容。

## 状态管理概述

母婴商城管理后台使用Redux Toolkit作为状态管理方案，相比传统Redux，具有以下优势：

1. **简化的API**：减少样板代码，提高开发效率
2. **内置不可变性**：通过Immer处理不可变状态更新
3. **默认中间件**：预配置了Redux Thunk等中间件
4. **RTK Query**：内置的数据获取和缓存解决方案

## 状态设计原则

在设计状态管理时，我们遵循以下原则：

1. **按领域划分状态**：状态根据业务领域进行拆分
2. **最小化存储**：只在Redux中存储需要全局共享的状态
3. **规范化数据**：避免嵌套，扁平化数据结构
4. **单一数据源**：相同的数据不在多个地方存储
5. **懒加载状态**：按需加载状态模块

## Redux Store结构

### 核心状态模块

```
store/
├── slices/
│   ├── authSlice.ts        # 认证相关状态
│   ├── appSlice.ts         # 应用全局状态
│   ├── userSlice.ts        # 用户相关状态
│   ├── productSlice.ts     # 商品相关状态
│   ├── orderSlice.ts       # 订单相关状态
│   └── uiSlice.ts          # UI相关状态（模态框、抽屉等）
└── rtk-query/              # RTK Query API定义
```

### 状态示例

```typescript
// 认证状态示例
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: string[];
}

// 应用状态示例
interface AppState {
  theme: 'light' | 'dark';
  sidebar: {
    collapsed: boolean;
    width: number;
  };
  notifications: Notification[];
  currentLanguage: string;
  systemSettings: SystemSettings;
}

// UI状态示例
interface UIState {
  modals: {
    [key: string]: {
      isOpen: boolean;
      data?: any;
    };
  };
  drawers: {
    [key: string]: {
      isOpen: boolean;
      data?: any;
    };
  };
  loading: {
    [key: string]: boolean;
  };
  alerts: Alert[];
}
```

## Redux Slice设计模式

每个Redux Slice遵循以下结构：

```typescript
// authSlice.ts 示例
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { login, logout, refreshToken } from './authThunks';

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  permissions: [],
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // 处理登录
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.permissions = action.payload.permissions;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // 其他异步操作处理...
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
```

## 异步处理

### 使用createAsyncThunk

```typescript
// authThunks.ts 示例
import { createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '@api/auth';

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      // 在本地存储令牌
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '登录失败');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      // 清除本地存储令牌
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || '退出失败');
    }
  }
);

// 其他异步操作...
```

### RTK Query集成

对于数据获取和缓存，我们使用RTK Query：

```typescript
// productApi.ts 示例
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@store/index';

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // 从状态中获取令牌
      const token = (getState() as RootState).auth.token;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['Products', 'Product'],
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, ProductQueryParams>({
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
    
    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (product) => ({
        url: '/products',
        method: 'POST',
        body: product,
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),
    
    updateProduct: builder.mutation<Product, { id: string; product: Partial<Product> }>({
      query: ({ id, product }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: product,
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
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
```

## Store配置

```typescript
// store/index.ts 示例
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import appReducer from './slices/appSlice';
import uiReducer from './slices/uiSlice';
import { productApi } from './rtk-query/productApi';
import { orderApi } from './rtk-query/orderApi';
import { userApi } from './rtk-query/userApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
    ui: uiReducer,
    [productApi.reducerPath]: productApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      productApi.middleware,
      orderApi.middleware,
      userApi.middleware
    ),
});

// 启用refetchOnFocus等功能
setupListeners(store.dispatch);

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## 自定义Hooks

为了简化组件中的状态访问，我们创建了自定义Hook：

```typescript
// store/hooks.ts 示例
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// 在整个应用中使用，而不是使用普通的useDispatch和useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

使用示例：

```typescript
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { logout } from '@store/slices/authThunks';

const Header = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  // ...
};
```

## 状态选择器 (Selectors)

为了优化性能并封装状态访问逻辑，我们使用选择器模式：

```typescript
// store/selectors/authSelectors.ts 示例
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@store/index';

export const selectAuth = (state: RootState) => state.auth;

export const selectCurrentUser = createSelector(
  selectAuth,
  (auth) => auth.user
);

export const selectIsAuthenticated = createSelector(
  selectAuth,
  (auth) => auth.isAuthenticated
);

export const selectUserPermissions = createSelector(
  selectAuth,
  (auth) => auth.permissions
);

export const selectHasPermission = (permission: string) =>
  createSelector(
    selectUserPermissions,
    (permissions) => permissions.includes(permission)
  );
```

使用选择器：

```typescript
import { selectCurrentUser, selectHasPermission } from '@store/selectors/authSelectors';

const ProfilePage = () => {
  const user = useAppSelector(selectCurrentUser);
  const canEditProducts = useAppSelector(selectHasPermission('products:edit'));
  
  // ...
};
```

## 状态持久化

对于需要持久化的状态，我们使用redux-persist：

```typescript
// store/index.ts 带持久化配置
import { configureStore } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import appReducer from './slices/appSlice';
import uiReducer from './slices/uiSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth', 'app'], // 只持久化这些reducer
};

const rootReducer = combineReducers({
  auth: authReducer,
  app: appReducer,
  ui: uiReducer,
  // RTK Query APIs...
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      // RTK Query中间件...
    ),
});

export const persistor = persistStore(store);
```

## 开发工具集成

Redux DevTools集成已经内置在Redux Toolkit中，无需额外配置即可在开发环境使用Redux DevTools扩展进行调试。

## 状态管理最佳实践

1. **组件本地状态vs全局状态**
   - 只有需要在多个组件间共享的状态才放入Redux
   - 组件特有的状态使用React的useState/useReducer管理

2. **避免过度使用选择器**
   - 选择器有助于性能优化，但过度使用会增加复杂性
   - 简单状态访问可直接使用useAppSelector

3. **精细化订阅状态**
   - 只订阅组件所需的最小状态集
   - 避免整个状态树的订阅

4. **避免冗余派生数据**
   - 使用createSelector缓存计算结果
   - 避免在多个地方重复计算相同的派生数据

5. **合理拆分状态模块**
   - 按业务领域拆分，而不是按UI组件
   - 功能相关的状态放在一起

## 相关资源

- [Redux Toolkit官方文档](https://redux-toolkit.js.org/)
- [RTK Query文档](https://redux-toolkit.js.org/rtk-query/overview)
- [Redux最佳实践](https://redux.js.org/style-guide/style-guide)
- [项目架构概述](overview.md)
- [API集成](api-integration.md) 