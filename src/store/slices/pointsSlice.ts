import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getPointsHistoryList, 
  getUserPointsList, 
  getPointsRuleList, 
  getPointsProductList,
  getPointsProductDetail,
  getPointsOperationLogs,
  getPointsExchangeList,
  getPointsStats
} from '@/api/points';

// 定义积分状态类型
interface PointsState {
  historyList: any[];
  operationList: any[];
  userPointsList: any[];
  ruleList: any[];
  productList: any[];
  exchangeList: any[];
  productDetail: any | null;
  statsData: any | null;
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
  operationList: [],
  userPointsList: [],
  ruleList: [],
  productList: [],
  exchangeList: [],
  productDetail: null,
  statsData: null,
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

// 异步Action: 获取积分操作日志列表
export const fetchPointsOperationLogs = createAsyncThunk(
  'points/fetchPointsOperationLogs',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getPointsOperationLogs(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch points operation logs');
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

// 异步Action: 获取积分兑换记录列表
export const fetchPointsExchangeList = createAsyncThunk(
  'points/fetchPointsExchangeList',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getPointsExchangeList(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch points exchange list');
    }
  }
);

// 异步Action: 获取积分统计数据
export const fetchPointsStats = createAsyncThunk(
  'points/fetchPointsStats',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getPointsStats(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch points stats');
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
    },
    // 清除积分统计数据
    clearPointsStats: (state) => {
      state.statsData = null;
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
      state.historyList = action.payload.data.records || [];
      state.pagination.total = action.payload.data.total || 0;
    });
    builder.addCase(fetchPointsHistoryList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取积分操作日志列表
    builder.addCase(fetchPointsOperationLogs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPointsOperationLogs.fulfilled, (state, action) => {
      state.loading = false;
      state.operationList = action.payload.data.records || [];
      state.pagination.total = action.payload.data.total || 0;
    });
    builder.addCase(fetchPointsOperationLogs.rejected, (state, action) => {
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
      state.userPointsList = action.payload.data.records || [];
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
      state.ruleList = action.payload.data.records || [];
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
      state.productList = action.payload.data.records || [];
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

    // 处理获取积分兑换记录列表
    builder.addCase(fetchPointsExchangeList.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPointsExchangeList.fulfilled, (state, action) => {
      state.loading = false;
      state.exchangeList = action.payload.data.records || [];
      state.pagination.total = action.payload.data.total || 0;
    });
    builder.addCase(fetchPointsExchangeList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取积分统计数据
    builder.addCase(fetchPointsStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPointsStats.fulfilled, (state, action) => {
      state.loading = false;
      state.statsData = action.payload.data;
    });
    builder.addCase(fetchPointsStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

// 导出Actions
export const { setPagination, clearPointsProductDetail, clearPointsStats } = pointsSlice.actions;

// 导出Reducer
export default pointsSlice.reducer; 