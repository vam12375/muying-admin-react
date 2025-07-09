import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { 
  getCouponList, 
  getCouponDetail, 
  getCouponBatchList, 
  getCouponRuleList,
  getCouponStats,
  getUserCoupons,
} from '@/api/coupon';
import type {
  CouponData,
  CouponParams,
  CouponBatchParams,
  CouponRuleParams,
  CouponBatchData,
  CouponRuleData,
  UserCouponData
} from '@/api/coupon';

// 定义优惠券状态类型
interface CouponState {
  couponList: CouponData[];
  couponDetail: CouponData | null;
  batchList: CouponBatchData[];
  ruleList: CouponRuleData[];
  userCoupons: UserCouponData[];
  stats: Record<string, any> | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  batchPagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  rulePagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: CouponState = {
  couponList: [],
  couponDetail: null,
  batchList: [],
  ruleList: [],
  userCoupons: [],
  stats: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0
  },
  batchPagination: {
    current: 1,
    pageSize: 10,
    total: 0
  },
  rulePagination: {
    current: 1,
    pageSize: 10,
    total: 0
  },
  loading: false,
  error: null
};

// 异步Action: 获取优惠券列表
export const fetchCouponList = createAsyncThunk(
  'coupon/fetchCouponList',
  async (params: CouponParams, { rejectWithValue }) => {
    try {
      const response = await getCouponList(params);
      return response.data;
    } catch (error: any) {
      console.error('获取优惠券列表失败', error);
      return rejectWithValue(error.message || '获取优惠券列表失败');
    }
  }
);

// 异步Action: 获取优惠券详情
export const fetchCouponDetail = createAsyncThunk(
  'coupon/fetchCouponDetail',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await getCouponDetail(id);
      return response.data;
    } catch (error: any) {
      console.error('获取优惠券详情失败', error);
      return rejectWithValue(error.message || '获取优惠券详情失败');
    }
  }
);

// 异步Action: 获取优惠券批次列表
export const fetchCouponBatchList = createAsyncThunk(
  'coupon/fetchCouponBatchList',
  async (params: CouponBatchParams, { rejectWithValue }) => {
    try {
      const response = await getCouponBatchList(params);
      return response.data;
    } catch (error: any) {
      console.error('获取优惠券批次列表失败', error);
      return rejectWithValue(error.message || '获取优惠券批次列表失败');
    }
  }
);

// 异步Action: 获取优惠券规则列表
export const fetchCouponRuleList = createAsyncThunk(
  'coupon/fetchCouponRuleList',
  async (params: CouponRuleParams, { rejectWithValue }) => {
    try {
      const response = await getCouponRuleList(params);
      return response.data;
    } catch (error: any) {
      console.error('获取优惠券规则列表失败', error);
      return rejectWithValue(error.message || '获取优惠券规则列表失败');
    }
  }
);

// 异步Action: 获取优惠券统计数据
export const fetchCouponStats = createAsyncThunk(
  'coupon/fetchCouponStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCouponStats();
      console.log('优惠券统计数据响应:', response);
      return response.data;
    } catch (error: any) {
      console.error('获取优惠券统计数据失败', error);
      return rejectWithValue(error.message || '获取优惠券统计数据失败');
    }
  }
);

// 异步Action: 获取用户优惠券列表
export const fetchUserCoupons = createAsyncThunk(
  'coupon/fetchUserCoupons',
  async ({ userId, status }: { userId: number | string; status?: string }, { rejectWithValue }) => {
    try {
      const response = await getUserCoupons(userId, status);
      return response.data;
    } catch (error: any) {
      console.error('获取用户优惠券列表失败', error);
      return rejectWithValue(error.message || '获取用户优惠券列表失败');
    }
  }
);

// 创建Slice
const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    // 设置优惠券分页信息
    setPagination: (state, action: PayloadAction<{ current?: number; pageSize?: number; total?: number }>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    // 设置优惠券批次分页信息
    setBatchPagination: (state, action: PayloadAction<{ current?: number; pageSize?: number; total?: number }>) => {
      state.batchPagination = { ...state.batchPagination, ...action.payload };
    },
    // 设置优惠券规则分页信息
    setRulePagination: (state, action: PayloadAction<{ current?: number; pageSize?: number; total?: number }>) => {
      state.rulePagination = { ...state.rulePagination, ...action.payload };
    },
    // 清除优惠券详情
    clearCouponDetail: (state) => {
      state.couponDetail = null;
    },
    // 清除用户优惠券列表
    clearUserCoupons: (state) => {
      state.userCoupons = [];
    }
  },
  extraReducers: (builder) => {
    // 处理获取优惠券列表
    builder.addCase(fetchCouponList.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCouponList.fulfilled, (state, action) => {
      state.loading = false;
      // 兼容不同的响应数据结构
      if (Array.isArray(action.payload)) {
        state.couponList = action.payload;
        state.pagination.total = action.payload.length;
      } else if (action.payload && action.payload.records) {
        state.couponList = action.payload.records;
        state.pagination.total = action.payload.total || 0;
      } else if (action.payload && Array.isArray(action.payload.list)) {
        // 兼容 { list: [], total: number } 格式
        state.couponList = action.payload.list;
        state.pagination.total = action.payload.total || 0;
      } else {
        console.warn('优惠券列表数据格式不符合预期', action.payload);
        state.couponList = [];
        state.pagination.total = 0;
      }
    });
    builder.addCase(fetchCouponList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.error('获取优惠券列表失败', action.payload);
    });

    // 处理获取优惠券详情
    builder.addCase(fetchCouponDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCouponDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.couponDetail = action.payload;
      console.log('Redux: 优惠券详情已更新:', action.payload);
    });
    builder.addCase(fetchCouponDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.error('获取优惠券详情失败', action.payload);
    });

    // 处理获取优惠券批次列表
    builder.addCase(fetchCouponBatchList.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCouponBatchList.fulfilled, (state, action) => {
      state.loading = false;
      // 兼容不同的响应数据结构
      if (Array.isArray(action.payload)) {
        state.batchList = action.payload;
        state.batchPagination.total = action.payload.length;
      } else if (action.payload && action.payload.records) {
        state.batchList = action.payload.records;
        state.batchPagination.total = action.payload.total || 0;
      } else if (action.payload && Array.isArray(action.payload.list)) {
        // 兼容 { list: [], total: number } 格式
        state.batchList = action.payload.list;
        state.batchPagination.total = action.payload.total || 0;
      } else {
        console.warn('优惠券批次列表数据格式不符合预期', action.payload);
        state.batchList = [];
        state.batchPagination.total = 0;
      }
    });
    builder.addCase(fetchCouponBatchList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.error('获取优惠券批次列表失败', action.payload);
    });

    // 处理获取优惠券规则列表
    builder.addCase(fetchCouponRuleList.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCouponRuleList.fulfilled, (state, action) => {
      state.loading = false;
      // 兼容不同的响应数据结构
      if (Array.isArray(action.payload)) {
        state.ruleList = action.payload;
        state.rulePagination.total = action.payload.length;
      } else if (action.payload && action.payload.records) {
        state.ruleList = action.payload.records;
        state.rulePagination.total = action.payload.total || 0;
      } else if (action.payload && Array.isArray(action.payload.list)) {
        // 兼容 { list: [], total: number } 格式
        state.ruleList = action.payload.list;
        state.rulePagination.total = action.payload.total || 0;
      } else {
        console.warn('优惠券规则列表数据格式不符合预期', action.payload);
        state.ruleList = [];
        state.rulePagination.total = 0;
      }
    });
    builder.addCase(fetchCouponRuleList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.error('获取优惠券规则列表失败', action.payload);
    });
    
    // 处理获取优惠券统计数据
    builder.addCase(fetchCouponStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCouponStats.fulfilled, (state, action) => {
      state.loading = false;
      state.stats = action.payload;
      console.log('优惠券统计数据已更新:', action.payload);
    });
    builder.addCase(fetchCouponStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.error('获取优惠券统计数据失败', action.payload);
    });
    
    // 处理获取用户优惠券列表
    builder.addCase(fetchUserCoupons.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUserCoupons.fulfilled, (state, action) => {
      state.loading = false;
      state.userCoupons = Array.isArray(action.payload) ? action.payload : [];
    });
    builder.addCase(fetchUserCoupons.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      console.error('获取用户优惠券列表失败', action.payload);
    });
  }
});

// 导出Actions
export const { 
  setPagination, 
  setBatchPagination,
  setRulePagination,
  clearCouponDetail,
  clearUserCoupons
} = couponSlice.actions;

// 导出Reducer
export default couponSlice.reducer; 