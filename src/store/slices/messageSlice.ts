import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getMessageList,
  getMessageDetail,
  getUnreadCount,
  getMessageStatistics,
  deleteMessage as apiDeleteMessage,
  sendMessage as apiSendMessage,
  createMessage as apiCreateMessage,
  markAllRead as apiMarkAllRead
} from '@/api/message';

// 定义消息状态类型
interface MessageState {
  messageList: any[];
  messageDetail: any | null;
  unreadCount: number;
  latestMessages: any[];
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
  latestMessages: [],
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

// 异步Action: 获取最新消息列表（通知中心使用）
export const fetchLatestMessages = createAsyncThunk(
  'message/fetchLatestMessages',
  async (params: { page: number; size: number }, { rejectWithValue }) => {
    try {
      const response = await getMessageList({
        ...params,
        sortBy: 'createTime',
        sortOrder: 'desc'
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch latest messages');
    }
  }
);

// 异步Action: 删除消息
export const deleteMessage = createAsyncThunk(
  'message/deleteMessage',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await apiDeleteMessage(id);
      return { id, response };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete message');
    }
  }
);

// 异步Action: 发送消息
export const sendMessage = createAsyncThunk(
  'message/sendMessage',
  async (data: any, { rejectWithValue }) => {
    try {
      // 如果是发送现有消息
      if (typeof data === 'number' || typeof data === 'string') {
        const response = await apiSendMessage(data);
        return response;
      } 
      // 如果是创建并发送新消息
      else {
        const response = await apiCreateMessage(data);
        return response;
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

// 异步Action: 标记所有消息为已读
export const markAllMessagesAsRead = createAsyncThunk(
  'message/markAllMessagesAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiMarkAllRead();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark all messages as read');
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
    },
    // 清除最新消息
    clearLatestMessages: (state) => {
      state.latestMessages = [];
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
      state.messageList = action.payload.data.records || action.payload.data.list || [];
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
    
    // 处理获取最新消息
    builder.addCase(fetchLatestMessages.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchLatestMessages.fulfilled, (state, action) => {
      state.loading = false;
      state.latestMessages = action.payload.data.records || action.payload.data.list || [];
    });
    builder.addCase(fetchLatestMessages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理删除消息
    builder.addCase(deleteMessage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteMessage.fulfilled, (state, action) => {
      state.loading = false;
      // 从列表中移除被删除的消息
      if (action.payload.id) {
        state.messageList = state.messageList.filter(msg => msg.id !== action.payload.id);
      }
    });
    builder.addCase(deleteMessage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理发送消息
    builder.addCase(sendMessage.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(sendMessage.fulfilled, (state) => {
      state.loading = false;
      // 发送成功后不需要特别更新状态，通常会重新获取消息列表
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // 处理标记所有消息为已读
    builder.addCase(markAllMessagesAsRead.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(markAllMessagesAsRead.fulfilled, (state) => {
      state.loading = false;
      state.unreadCount = 0;
      // 更新所有消息为已读
      state.latestMessages = state.latestMessages.map(msg => ({
        ...msg,
        isRead: 1
      }));
    });
    builder.addCase(markAllMessagesAsRead.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

// 导出Actions
export const { setPagination, clearMessageDetail, updateUnreadCount, clearLatestMessages } = messageSlice.actions;

// 导出Reducer
export default messageSlice.reducer; 