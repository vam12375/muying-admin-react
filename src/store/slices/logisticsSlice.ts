import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getLogisticsList, getLogisticsDetail, getLogisticsCompanies } from '@/api/logistics';

// 定义物流状态类型
interface LogisticsState {
  logisticsList: any[];
  logisticsDetail: any | null;
  companies: any[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: LogisticsState = {
  logisticsList: [],
  logisticsDetail: null,
  companies: [],
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0
  },
  loading: false,
  error: null
};

// 异步Action: 获取物流列表
export const fetchLogisticsList = createAsyncThunk(
  'logistics/fetchLogisticsList',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getLogisticsList(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch logistics list');
    }
  }
);

// 异步Action: 获取物流详情
export const fetchLogisticsDetail = createAsyncThunk(
  'logistics/fetchLogisticsDetail',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await getLogisticsDetail(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch logistics detail');
    }
  }
);

// 异步Action: 获取物流公司列表
export const fetchLogisticsCompanies = createAsyncThunk(
  'logistics/fetchLogisticsCompanies',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await getLogisticsCompanies(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch logistics companies');
    }
  }
);

// 创建Slice
const logisticsSlice = createSlice({
  name: 'logistics',
  initialState,
  reducers: {
    // 设置分页信息
    setPagination: (state, action: PayloadAction<{ current?: number; pageSize?: number; total?: number }>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    // 清除物流详情
    clearLogisticsDetail: (state) => {
      state.logisticsDetail = null;
    }
  },
  extraReducers: (builder) => {
    // 处理获取物流列表
    builder.addCase(fetchLogisticsList.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchLogisticsList.fulfilled, (state, action) => {
      state.loading = false;
      state.logisticsList = action.payload.data.list || [];
      state.pagination.total = action.payload.data.total || 0;
    });
    builder.addCase(fetchLogisticsList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取物流详情
    builder.addCase(fetchLogisticsDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchLogisticsDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.logisticsDetail = action.payload.data;
    });
    builder.addCase(fetchLogisticsDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取物流公司列表
    builder.addCase(fetchLogisticsCompanies.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchLogisticsCompanies.fulfilled, (state, action) => {
      state.loading = false;
      state.companies = action.payload.data || [];
    });
    builder.addCase(fetchLogisticsCompanies.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

// 导出Actions
export const { setPagination, clearLogisticsDetail } = logisticsSlice.actions;

// 导出Reducer
export default logisticsSlice.reducer; 