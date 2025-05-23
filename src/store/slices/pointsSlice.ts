import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getPointsHistoryList, 
  getUserPointsList, 
  getPointsRuleList, 
  getPointsProductList,
  getPointsProductDetail 
} from '@/api/points';

// 定义积分状态类型
interface PointsState {
  historyList: any[];
  userPointsList: any[];
  ruleList: any[];
  productList: any[];
  productDetail: any | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: PointsState = {
  historyList: [],
  userPointsList: [],
  ruleList: [],
  productList: [],
  productDetail: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0
  },
  loading: false,
  error: null
};

// 异步Action: 获取积分历史列表
export const fetchPointsHistoryList = createAsyncThunk(
  'points/fetchPointsHistoryList',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getPointsHistoryList(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch points history list');
    }
  }
);

// 异步Action: 获取用户积分列表
export const fetchUserPointsList = createAsyncThunk(
  'points/fetchUserPointsList',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getUserPointsList(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user points list');
    }
  }
);

// 异步Action: 获取积分规则列表
export const fetchPointsRuleList = createAsyncThunk(
  'points/fetchPointsRuleList',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getPointsRuleList(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch points rule list');
    }
  }
);

// 异步Action: 获取积分商品列表
export const fetchPointsProductList = createAsyncThunk(
  'points/fetchPointsProductList',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getPointsProductList(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch points product list');
    }
  }
);

// 异步Action: 获取积分商品详情
export const fetchPointsProductDetail = createAsyncThunk(
  'points/fetchPointsProductDetail',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await getPointsProductDetail(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch points product detail');
    }
  }
);

// 创建Slice
const pointsSlice = createSlice({
  name: 'points',
  initialState,
  reducers: {
    // 设置分页信息
    setPagination: (state, action: PayloadAction<{ current?: number; pageSize?: number; total?: number }>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    // 清除积分商品详情
    clearPointsProductDetail: (state) => {
      state.productDetail = null;
    }
  },
  extraReducers: (builder) => {
    // 处理获取积分历史列表
    builder.addCase(fetchPointsHistoryList.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPointsHistoryList.fulfilled, (state, action) => {
      state.loading = false;
      state.historyList = action.payload.data.list || [];
      state.pagination.total = action.payload.data.total || 0;
    });
    builder.addCase(fetchPointsHistoryList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取用户积分列表
    builder.addCase(fetchUserPointsList.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUserPointsList.fulfilled, (state, action) => {
      state.loading = false;
      state.userPointsList = action.payload.data.list || [];
      state.pagination.total = action.payload.data.total || 0;
    });
    builder.addCase(fetchUserPointsList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取积分规则列表
    builder.addCase(fetchPointsRuleList.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPointsRuleList.fulfilled, (state, action) => {
      state.loading = false;
      state.ruleList = action.payload.data.list || [];
    });
    builder.addCase(fetchPointsRuleList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取积分商品列表
    builder.addCase(fetchPointsProductList.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPointsProductList.fulfilled, (state, action) => {
      state.loading = false;
      state.productList = action.payload.data.list || [];
      state.pagination.total = action.payload.data.total || 0;
    });
    builder.addCase(fetchPointsProductList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取积分商品详情
    builder.addCase(fetchPointsProductDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPointsProductDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.productDetail = action.payload.data;
    });
    builder.addCase(fetchPointsProductDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

// 导出Actions
export const { setPagination, clearPointsProductDetail } = pointsSlice.actions;

// 导出Reducer
export default pointsSlice.reducer; 