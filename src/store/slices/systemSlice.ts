import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getRedisInfo,
  getRedisKeys,
  getRedisKeyValue,
  getSystemLogs,
  getSystemConfig
} from '@/api/system';

// 定义系统状态类型
interface SystemState {
  redisInfo: any | null;
  redisKeys: string[];
  redisKeyValue: any | null;
  systemLogs: any[];
  systemConfig: any | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: SystemState = {
  redisInfo: null,
  redisKeys: [],
  redisKeyValue: null,
  systemLogs: [],
  systemConfig: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0
  },
  loading: false,
  error: null
};

// 异步Action: 获取Redis信息
export const fetchRedisInfo = createAsyncThunk(
  'system/fetchRedisInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRedisInfo();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch Redis info');
    }
  }
);

// 异步Action: 获取Redis键列表
export const fetchRedisKeys = createAsyncThunk(
  'system/fetchRedisKeys',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getRedisKeys(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch Redis keys');
    }
  }
);

// 异步Action: 获取Redis键值
export const fetchRedisKeyValue = createAsyncThunk(
  'system/fetchRedisKeyValue',
  async (key: string, { rejectWithValue }) => {
    try {
      const response = await getRedisKeyValue(key);
      return { key, response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch Redis key value');
    }
  }
);

// 异步Action: 获取系统日志
export const fetchSystemLogs = createAsyncThunk(
  'system/fetchSystemLogs',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getSystemLogs(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch system logs');
    }
  }
);

// 异步Action: 获取系统配置
export const fetchSystemConfig = createAsyncThunk(
  'system/fetchSystemConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSystemConfig();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch system config');
    }
  }
);

// 创建Slice
const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    // 设置分页信息
    setPagination: (state, action: PayloadAction<{ current?: number; pageSize?: number; total?: number }>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    // 清除Redis键值
    clearRedisKeyValue: (state) => {
      state.redisKeyValue = null;
    }
  },
  extraReducers: (builder) => {
    // 处理获取Redis信息
    builder.addCase(fetchRedisInfo.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRedisInfo.fulfilled, (state, action) => {
      state.loading = false;
      state.redisInfo = action.payload.data;
    });
    builder.addCase(fetchRedisInfo.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取Redis键列表
    builder.addCase(fetchRedisKeys.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRedisKeys.fulfilled, (state, action) => {
      state.loading = false;
      state.redisKeys = action.payload.data || [];
    });
    builder.addCase(fetchRedisKeys.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取Redis键值
    builder.addCase(fetchRedisKeyValue.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRedisKeyValue.fulfilled, (state, action) => {
      state.loading = false;
      state.redisKeyValue = action.payload.response.data;
    });
    builder.addCase(fetchRedisKeyValue.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取系统日志
    builder.addCase(fetchSystemLogs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSystemLogs.fulfilled, (state, action) => {
      state.loading = false;
      state.systemLogs = action.payload.data.list || [];
      state.pagination.total = action.payload.data.total || 0;
    });
    builder.addCase(fetchSystemLogs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取系统配置
    builder.addCase(fetchSystemConfig.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSystemConfig.fulfilled, (state, action) => {
      state.loading = false;
      state.systemConfig = action.payload.data;
    });
    builder.addCase(fetchSystemConfig.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

// 导出Actions
export const { setPagination, clearRedisKeyValue } = systemSlice.actions;

// 导出Reducer
export default systemSlice.reducer; 