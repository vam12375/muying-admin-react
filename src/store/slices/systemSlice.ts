import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getRedisInfo,
  getRedisKeys,
  getRedisKeyValue,
  setRedisValue as apiSetRedisValue,
  deleteRedisKey as apiDeleteRedisKey,
  clearRedisDb as apiClearRedisDb,
  getSystemLogs,
  getSystemConfig,
  getLogDetail,
  getSystemConfigs,
  updateSystemConfig as apiUpdateSystemConfig,
  createSystemConfig as apiCreateSystemConfig
} from '@/api/system';

// Redis键数据类型
export interface RedisKeyData {
  key: string;
  type: string;
  ttl: number;
  size: number;
}

// Redis信息数据类型
export interface RedisInfoData {
  version: string;
  mode: string;
  os: string;
  connectedClients: string;
  uptime: string;
  uptimeInDays: string;
  usedMemory: string;
  usedMemoryHuman: string;
  usedMemoryPeakHuman: string;
  totalCommands: string;
  keyspaceHits: string;
  keyspaceMisses: string;
  keyspaceHitRate: string;
  totalKeys: number;
  keyspaceStats: {
    [key: string]: {
      keys: string;
      expires: string;
      avg_ttl: string;
    };
  };
}

// Redis键值数据类型
export interface RedisValueData {
  key: string;
  type: string;
  ttl: number;
  size: number;
  value: any;
}

// 系统日志数据类型
export interface SystemLogData {
  id: number;
  type: string;
  level: string;
  content: string;
  operator: string;
  ip: string;
  userAgent: string;
  createTime: string;
}

// 系统配置数据类型
export interface SystemConfigData {
  id: number;
  key: string;
  value: string;
  description: string;
  group: string;
  type: string;
  createTime: string;
  updateTime: string;
}

// 定义系统状态类型
interface SystemState {
  redisInfo: RedisInfoData | null;
  redisKeys: RedisKeyData[];
  redisValue: RedisValueData | null;
  systemLogs: SystemLogData[];
  logDetail: SystemLogData | null;
  configList: SystemConfigData[];
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
  redisValue: null,
  systemLogs: [],
  logDetail: null,
  configList: [],
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
      // 确保使用与Vue版本一致的参数格式
      const apiParams = {
        ...params,
        // 使用size作为每页条数参数(Vue版本使用size)
        size: params.pageSize || params.size || 10,
        pattern: params.pattern || '*'
      };

      // 删除pageSize参数，避免同时发送两个参数
      if (apiParams.pageSize) {
        delete apiParams.pageSize;
      }

      const response = await getRedisKeys(apiParams);
      return response;
    } catch (error: any) {
      // 特殊处理类加载错误
      if (error.message && (
        error.message.includes('NoClassDefFoundError') || 
        error.message.includes('ResultCode') ||
        error.message.includes('后端服务')
      )) {
        return rejectWithValue('后端服务出现类加载错误: NoClassDefFoundError: com/muyingmall/common/result/ResultCode');
      }
      return rejectWithValue(error.message || 'Failed to fetch Redis keys');
    }
  }
);

// 异步Action: 获取Redis键值
export const getRedisValue = createAsyncThunk(
  'system/getRedisValue',
  async (key: string, { rejectWithValue }) => {
    try {
      const response = await getRedisKeyValue(key);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch Redis key value');
    }
  }
);

// 异步Action: 设置Redis键值
export const setRedisValue = createAsyncThunk(
  'system/setRedisValue',
  async (data: { key: string; value: any; ttl?: number }, { rejectWithValue }) => {
    try {
      const response = await apiSetRedisValue(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to set Redis key value');
    }
  }
);

// 异步Action: 删除Redis键
export const deleteRedisKey = createAsyncThunk(
  'system/deleteRedisKey',
  async (key: string | string[], { rejectWithValue }) => {
    try {
      const response = await apiDeleteRedisKey(key);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete Redis key');
    }
  }
);

// 异步Action: 清空Redis数据库
export const clearRedisDb = createAsyncThunk(
  'system/clearRedisDb',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClearRedisDb();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to clear Redis database');
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

// 异步Action: 获取日志详情
export const fetchLogDetail = createAsyncThunk(
  'system/fetchLogDetail',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getLogDetail(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch log detail');
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

// 异步Action: 获取系统配置列表
export const fetchSystemConfigs = createAsyncThunk(
  'system/fetchSystemConfigs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSystemConfigs();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch system configs');
    }
  }
);

// 异步Action: 更新系统配置
export const updateSystemConfig = createAsyncThunk(
  'system/updateSystemConfig',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiUpdateSystemConfig(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update system config');
    }
  }
);

// 异步Action: 创建系统配置
export const createSystemConfig = createAsyncThunk(
  'system/createSystemConfig',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiCreateSystemConfig(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create system config');
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
      state.redisValue = null;
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
      state.redisKeys = action.payload.data?.items || [];
      state.pagination.total = action.payload.data?.total || 0;
    });
    builder.addCase(fetchRedisKeys.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取Redis键值
    builder.addCase(getRedisValue.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getRedisValue.fulfilled, (state, action) => {
      state.loading = false;
      state.redisValue = action.payload.data;
    });
    builder.addCase(getRedisValue.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理设置Redis键值
    builder.addCase(setRedisValue.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(setRedisValue.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(setRedisValue.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理删除Redis键
    builder.addCase(deleteRedisKey.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteRedisKey.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(deleteRedisKey.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理清空Redis数据库
    builder.addCase(clearRedisDb.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(clearRedisDb.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(clearRedisDb.rejected, (state, action) => {
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
      state.systemLogs = action.payload.data.records || [];
      state.pagination.total = action.payload.data.total || 0;
    });
    builder.addCase(fetchSystemLogs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取日志详情
    builder.addCase(fetchLogDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchLogDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.logDetail = action.payload.data;
    });
    builder.addCase(fetchLogDetail.rejected, (state, action) => {
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

    // 处理获取系统配置列表
    builder.addCase(fetchSystemConfigs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSystemConfigs.fulfilled, (state, action) => {
      state.loading = false;
      state.configList = action.payload.data || [];
    });
    builder.addCase(fetchSystemConfigs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理更新系统配置
    builder.addCase(updateSystemConfig.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateSystemConfig.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(updateSystemConfig.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理创建系统配置
    builder.addCase(createSystemConfig.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createSystemConfig.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(createSystemConfig.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

// 导出Actions
export const { setPagination, clearRedisKeyValue } = systemSlice.actions;

// 导出Reducer
export default systemSlice.reducer; 