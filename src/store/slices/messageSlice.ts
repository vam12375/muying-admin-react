import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getMessageList,
  getMessageDetail,
  getUnreadCount,
  getMessageStatistics
} from '@/api/message';

// 定义消息状态类型
interface MessageState {
  messageList: any[];
  messageDetail: any | null;
  unreadCount: number;
  statistics: any | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: MessageState = {
  messageList: [],
  messageDetail: null,
  unreadCount: 0,
  statistics: null,
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0
  },
  loading: false,
  error: null
};

// 异步Action: 获取消息列表
export const fetchMessageList = createAsyncThunk(
  'message/fetchMessageList',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getMessageList(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch message list');
    }
  }
);

// 异步Action: 获取消息详情
export const fetchMessageDetail = createAsyncThunk(
  'message/fetchMessageDetail',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await getMessageDetail(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch message detail');
    }
  }
);

// 异步Action: 获取未读消息数量
export const fetchUnreadCount = createAsyncThunk(
  'message/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUnreadCount();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch unread count');
    }
  }
);

// 异步Action: 获取消息统计数据
export const fetchMessageStatistics = createAsyncThunk(
  'message/fetchMessageStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMessageStatistics();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch message statistics');
    }
  }
);

// 创建Slice
const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    // 设置分页信息
    setPagination: (state, action: PayloadAction<{ current?: number; pageSize?: number; total?: number }>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    // 清除消息详情
    clearMessageDetail: (state) => {
      state.messageDetail = null;
    },
    // 更新未读消息数量
    updateUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    }
  },
  extraReducers: (builder) => {
    // 处理获取消息列表
    builder.addCase(fetchMessageList.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMessageList.fulfilled, (state, action) => {
      state.loading = false;
      state.messageList = action.payload.data.list || [];
      state.pagination.total = action.payload.data.total || 0;
    });
    builder.addCase(fetchMessageList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取消息详情
    builder.addCase(fetchMessageDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMessageDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.messageDetail = action.payload.data;
    });
    builder.addCase(fetchMessageDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取未读消息数量
    builder.addCase(fetchUnreadCount.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.loading = false;
      state.unreadCount = action.payload.data || 0;
    });
    builder.addCase(fetchUnreadCount.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取消息统计数据
    builder.addCase(fetchMessageStatistics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMessageStatistics.fulfilled, (state, action) => {
      state.loading = false;
      state.statistics = action.payload.data;
    });
    builder.addCase(fetchMessageStatistics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

// 导出Actions
export const { setPagination, clearMessageDetail, updateUnreadCount } = messageSlice.actions;

// 导出Reducer
export default messageSlice.reducer; 