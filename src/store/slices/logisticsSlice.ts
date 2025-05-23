import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { 
  getLogisticsList, 
  getLogisticsDetail, 
  getLogisticsCompanies,
  getLogisticsByOrderId,
  getLogisticsTracks,
  getEnabledLogisticsCompanies,
  updateLogisticsStatus,
  addLogisticsTrack,
  batchAddLogisticsTracks,
  type Logistics,
  type LogisticsCompany,
  type LogisticsTrack,
  type LogisticsParams,
  type LogisticsCompanyParams,
  type LogisticsTrackParams
} from '@/api/logistics';
import { message } from 'antd';

// 定义物流状态类型
interface LogisticsState {
  logisticsList: Logistics[];
  logisticsDetail: Logistics | null;
  companies: LogisticsCompany[];
  enabledCompanies: LogisticsCompany[];
  tracks: LogisticsTrack[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  companyPagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  loading: {
    list: boolean;
    detail: boolean;
    companies: boolean;
    tracks: boolean;
    action: boolean;
  };
  error: string | null;
}

// 初始状态
const initialState: LogisticsState = {
  logisticsList: [],
  logisticsDetail: null,
  companies: [],
  enabledCompanies: [],
  tracks: [],
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0
  },
  companyPagination: {
    current: 1,
    pageSize: 10,
    total: 0
  },
  loading: {
    list: false,
    detail: false,
    companies: false,
    tracks: false,
    action: false
  },
  error: null
};

// 异步Action: 获取物流列表
export const fetchLogisticsList = createAsyncThunk(
  'logistics/fetchLogisticsList',
  async (params: LogisticsParams, { rejectWithValue }) => {
    try {
      const response = await getLogisticsList(params);
      if (response.code === 200) {
        return response.data;
      }
      return rejectWithValue(response.message || '获取物流列表失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '获取物流列表失败');
    }
  }
);

// 异步Action: 获取物流详情
export const fetchLogisticsDetail = createAsyncThunk(
  'logistics/fetchLogisticsDetail',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await getLogisticsDetail(id);
      if (response.code === 200) {
        return response.data;
      }
      return rejectWithValue(response.message || '获取物流详情失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '获取物流详情失败');
    }
  }
);

// 异步Action: 根据订单ID获取物流信息
export const fetchLogisticsByOrderId = createAsyncThunk(
  'logistics/fetchLogisticsByOrderId',
  async (orderId: number | string, { rejectWithValue }) => {
    try {
      const response = await getLogisticsByOrderId(orderId);
      if (response.code === 200) {
        return response.data;
      }
      return rejectWithValue(response.message || '获取订单物流信息失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '获取订单物流信息失败');
    }
  }
);

// 异步Action: 获取物流公司列表
export const fetchLogisticsCompanies = createAsyncThunk(
  'logistics/fetchLogisticsCompanies',
  async (params: LogisticsCompanyParams = {}, { rejectWithValue }) => {
    try {
      const response = await getLogisticsCompanies(params);
      if (response.code === 200) {
        return response.data;
      }
      return rejectWithValue(response.message || '获取物流公司列表失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '获取物流公司列表失败');
    }
  }
);

// 异步Action: 获取启用的物流公司列表
export const fetchEnabledLogisticsCompanies = createAsyncThunk(
  'logistics/fetchEnabledLogisticsCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getEnabledLogisticsCompanies();
      if (response.code === 200) {
        return response.data;
      }
      return rejectWithValue(response.message || '获取启用的物流公司失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '获取启用的物流公司失败');
    }
  }
);

// 异步Action: 获取物流轨迹
export const fetchLogisticsTracks = createAsyncThunk(
  'logistics/fetchLogisticsTracks',
  async (logisticsId: number | string, { rejectWithValue }) => {
    try {
      const response = await getLogisticsTracks(logisticsId);
      if (response.code === 200) {
        return response.data;
      }
      return rejectWithValue(response.message || '获取物流轨迹失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '获取物流轨迹失败');
    }
  }
);

// 异步Action: 更新物流状态
export const updateLogisticsStatusAction = createAsyncThunk(
  'logistics/updateLogisticsStatus',
  async ({ id, status, remark }: { id: number | string; status: string; remark?: string }, { rejectWithValue }) => {
    try {
      const response = await updateLogisticsStatus(id, status, remark);
      if (response.code === 200) {
        return { id, status, remark };
      }
      return rejectWithValue(response.message || '更新物流状态失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '更新物流状态失败');
    }
  }
);

// 异步Action: 添加物流轨迹
export const addLogisticsTrackAction = createAsyncThunk(
  'logistics/addLogisticsTrack',
  async ({ logisticsId, track }: { logisticsId: number | string; track: LogisticsTrackParams }, { rejectWithValue }) => {
    try {
      const response = await addLogisticsTrack(logisticsId, track);
      if (response.code === 200) {
        return response.data;
      }
      return rejectWithValue(response.message || '添加物流轨迹失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '添加物流轨迹失败');
    }
  }
);

// 异步Action: 批量添加物流轨迹
export const batchAddLogisticsTracksAction = createAsyncThunk(
  'logistics/batchAddLogisticsTracks',
  async ({ logisticsId, tracks }: { logisticsId: number | string; tracks: LogisticsTrackParams[] }, { rejectWithValue }) => {
    try {
      const response = await batchAddLogisticsTracks(logisticsId, tracks);
      if (response.code === 200) {
        // 添加成功后，获取最新的轨迹列表
        const tracksResponse = await getLogisticsTracks(logisticsId);
        if (tracksResponse.code === 200) {
          return tracksResponse.data;
        }
        return [];
      }
      return rejectWithValue(response.message || '批量添加物流轨迹失败');
    } catch (error: any) {
      return rejectWithValue(error.message || '批量添加物流轨迹失败');
    }
  }
);

// 创建Slice
const logisticsSlice = createSlice({
  name: 'logistics',
  initialState,
  reducers: {
    // 设置物流分页信息
    setPagination: (state, action: PayloadAction<{ current?: number; pageSize?: number; total?: number }>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    // 设置物流公司分页信息
    setCompanyPagination: (state, action: PayloadAction<{ current?: number; pageSize?: number; total?: number }>) => {
      state.companyPagination = { ...state.companyPagination, ...action.payload };
    },
    // 清除物流详情
    clearLogisticsDetail: (state) => {
      state.logisticsDetail = null;
      state.tracks = [];
    },
    // 清除物流轨迹
    clearLogisticsTracks: (state) => {
      state.tracks = [];
    },
    // 清除错误信息
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // 处理获取物流列表
    builder.addCase(fetchLogisticsList.pending, (state) => {
      state.loading.list = true;
      state.error = null;
    });
    builder.addCase(fetchLogisticsList.fulfilled, (state, action) => {
      state.loading.list = false;
      state.logisticsList = action.payload.list || [];
      state.pagination.total = action.payload.total || 0;
    });
    builder.addCase(fetchLogisticsList.rejected, (state, action) => {
      state.loading.list = false;
      state.error = action.payload as string;
      message.error(state.error || '获取物流列表失败');
    });

    // 处理获取物流详情
    builder.addCase(fetchLogisticsDetail.pending, (state) => {
      state.loading.detail = true;
      state.error = null;
    });
    builder.addCase(fetchLogisticsDetail.fulfilled, (state, action) => {
      state.loading.detail = false;
      state.logisticsDetail = action.payload;
      // 如果物流详情包含轨迹信息，更新轨迹状态
      if (action.payload && action.payload.tracks) {
        state.tracks = action.payload.tracks;
      }
    });
    builder.addCase(fetchLogisticsDetail.rejected, (state, action) => {
      state.loading.detail = false;
      state.error = action.payload as string;
      message.error(state.error || '获取物流详情失败');
    });

    // 处理根据订单ID获取物流信息
    builder.addCase(fetchLogisticsByOrderId.pending, (state) => {
      state.loading.detail = true;
      state.error = null;
    });
    builder.addCase(fetchLogisticsByOrderId.fulfilled, (state, action) => {
      state.loading.detail = false;
      state.logisticsDetail = action.payload;
      // 如果物流详情包含轨迹信息，更新轨迹状态
      if (action.payload && action.payload.tracks) {
        state.tracks = action.payload.tracks;
      }
    });
    builder.addCase(fetchLogisticsByOrderId.rejected, (state, action) => {
      state.loading.detail = false;
      state.error = action.payload as string;
      message.error(state.error || '获取订单物流信息失败');
    });

    // 处理获取物流公司列表
    builder.addCase(fetchLogisticsCompanies.pending, (state) => {
      state.loading.companies = true;
      state.error = null;
    });
    builder.addCase(fetchLogisticsCompanies.fulfilled, (state, action) => {
      state.loading.companies = false;
      state.companies = action.payload.list || [];
      state.companyPagination.total = action.payload.total || 0;
    });
    builder.addCase(fetchLogisticsCompanies.rejected, (state, action) => {
      state.loading.companies = false;
      state.error = action.payload as string;
      message.error(state.error || '获取物流公司列表失败');
    });

    // 处理获取启用的物流公司列表
    builder.addCase(fetchEnabledLogisticsCompanies.pending, (state) => {
      state.loading.companies = true;
      state.error = null;
    });
    builder.addCase(fetchEnabledLogisticsCompanies.fulfilled, (state, action) => {
      state.loading.companies = false;
      state.enabledCompanies = action.payload || [];
    });
    builder.addCase(fetchEnabledLogisticsCompanies.rejected, (state, action) => {
      state.loading.companies = false;
      state.error = action.payload as string;
      message.error(state.error || '获取启用的物流公司列表失败');
    });

    // 处理获取物流轨迹
    builder.addCase(fetchLogisticsTracks.pending, (state) => {
      state.loading.tracks = true;
      state.error = null;
    });
    builder.addCase(fetchLogisticsTracks.fulfilled, (state, action) => {
      state.loading.tracks = false;
      state.tracks = action.payload || [];
    });
    builder.addCase(fetchLogisticsTracks.rejected, (state, action) => {
      state.loading.tracks = false;
      state.error = action.payload as string;
      message.error(state.error || '获取物流轨迹失败');
    });

    // 处理更新物流状态
    builder.addCase(updateLogisticsStatusAction.pending, (state) => {
      state.loading.action = true;
      state.error = null;
    });
    builder.addCase(updateLogisticsStatusAction.fulfilled, (state, action) => {
      state.loading.action = false;
      // 更新物流详情中的状态
      if (state.logisticsDetail && state.logisticsDetail.id === Number(action.payload.id)) {
        state.logisticsDetail.status = action.payload.status as any;
        state.logisticsDetail.remark = action.payload.remark || state.logisticsDetail.remark;
      }
      message.success('更新物流状态成功');
    });
    builder.addCase(updateLogisticsStatusAction.rejected, (state, action) => {
      state.loading.action = false;
      state.error = action.payload as string;
      message.error(state.error || '更新物流状态失败');
    });

    // 处理添加物流轨迹
    builder.addCase(addLogisticsTrackAction.pending, (state) => {
      state.loading.action = true;
      state.error = null;
    });
    builder.addCase(addLogisticsTrackAction.fulfilled, (state, action) => {
      state.loading.action = false;
      // 将新轨迹添加到轨迹列表
      state.tracks = [action.payload, ...state.tracks];
      message.success('添加物流轨迹成功');
    });
    builder.addCase(addLogisticsTrackAction.rejected, (state, action) => {
      state.loading.action = false;
      state.error = action.payload as string;
      message.error(state.error || '添加物流轨迹失败');
    });

    // 处理批量添加物流轨迹
    builder.addCase(batchAddLogisticsTracksAction.pending, (state) => {
      state.loading.action = true;
      state.error = null;
    });
    builder.addCase(batchAddLogisticsTracksAction.fulfilled, (state, action) => {
      state.loading.action = false;
      // 使用服务器返回的最新轨迹列表更新状态
      state.tracks = action.payload || [];
      message.success('批量添加物流轨迹成功');
    });
    builder.addCase(batchAddLogisticsTracksAction.rejected, (state, action) => {
      state.loading.action = false;
      state.error = action.payload as string;
      message.error(state.error || '批量添加物流轨迹失败');
    });
  }
});

export const { 
  setPagination, 
  setCompanyPagination, 
  clearLogisticsDetail, 
  clearLogisticsTracks,
  clearError
} = logisticsSlice.actions;

export default logisticsSlice.reducer; 