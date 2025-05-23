import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getCouponList, 
  getCouponDetail, 
  getCouponBatchList, 
  getCouponRuleList 
} from '@/api/coupon';

// 定义优惠券状态类型
interface CouponState {
  couponList: any[];
  couponDetail: any | null;
  batchList: any[];
  ruleList: any[];
  pagination: {
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
  pagination: {
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
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getCouponList(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch coupon list');
    }
  }
);

// 异步Action: 获取优惠券详情
export const fetchCouponDetail = createAsyncThunk(
  'coupon/fetchCouponDetail',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await getCouponDetail(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch coupon detail');
    }
  }
);

// 异步Action: 获取优惠券批次列表
export const fetchCouponBatchList = createAsyncThunk(
  'coupon/fetchCouponBatchList',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getCouponBatchList(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch coupon batch list');
    }
  }
);

// 异步Action: 获取优惠券规则列表
export const fetchCouponRuleList = createAsyncThunk(
  'coupon/fetchCouponRuleList',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getCouponRuleList(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch coupon rule list');
    }
  }
);

// 创建Slice
const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    // 设置分页信息
    setPagination: (state, action: PayloadAction<{ current?: number; pageSize?: number; total?: number }>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    // 清除优惠券详情
    clearCouponDetail: (state) => {
      state.couponDetail = null;
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
      state.couponList = action.payload.data.list || [];
      state.pagination.total = action.payload.data.total || 0;
    });
    builder.addCase(fetchCouponList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取优惠券详情
    builder.addCase(fetchCouponDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCouponDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.couponDetail = action.payload.data;
    });
    builder.addCase(fetchCouponDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取优惠券批次列表
    builder.addCase(fetchCouponBatchList.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCouponBatchList.fulfilled, (state, action) => {
      state.loading = false;
      state.batchList = action.payload.data.list || [];
    });
    builder.addCase(fetchCouponBatchList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取优惠券规则列表
    builder.addCase(fetchCouponRuleList.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCouponRuleList.fulfilled, (state, action) => {
      state.loading = false;
      state.ruleList = action.payload.data.list || [];
    });
    builder.addCase(fetchCouponRuleList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

// 导出Actions
export const { setPagination, clearCouponDetail } = couponSlice.actions;

// 导出Reducer
export default couponSlice.reducer; 