import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getOrderList, getOrderDetail, getOrderStatistics, getRecentOrders, shipOrder as apiShipOrder } from '@/api/order';

// 定义订单状态类型
interface OrderState {
  orderList: any[];
  orderDetail: any | null;
  recentOrders: any[];
  statistics: {
    total: number;
    pending_payment: number;
    pending_shipment: number;
    shipped: number;
    completed: number;
    cancelled: number;
  };
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: OrderState = {
  orderList: [],
  orderDetail: null,
  recentOrders: [],
  statistics: {
    total: 0,
    pending_payment: 0,
    pending_shipment: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0
  },
  pagination: {
    current: 1,
    pageSize: 10,
    total: 0
  },
  loading: false,
  error: null
};

// 异步Action: 获取订单列表
export const fetchOrderList = createAsyncThunk(
  'order/fetchOrderList',
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await getOrderList(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch order list');
    }
  }
);

// 异步Action: 获取订单详情
export const fetchOrderDetail = createAsyncThunk(
  'order/fetchOrderDetail',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await getOrderDetail(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch order detail');
    }
  }
);

// 异步Action: 获取订单统计数据
export const fetchOrderStatistics = createAsyncThunk(
  'order/fetchOrderStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getOrderStatistics();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch order statistics');
    }
  }
);

// 异步Action: 获取最近订单
export const fetchRecentOrders = createAsyncThunk(
  'order/fetchRecentOrders',
  async (limit: number = 5, { rejectWithValue }) => {
    try {
      const response = await getRecentOrders(limit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch recent orders');
    }
  }
);

// 异步Action: 订单发货
export const shipOrder = createAsyncThunk(
  'order/shipOrder',
  async ({ id, data }: { id: number | string; data: any }, { rejectWithValue, dispatch }) => {
    try {
      const { companyId, trackingNo, receiverName, receiverPhone, receiverAddress } = data;
      
      const response = await apiShipOrder(
        id, 
        companyId, 
        trackingNo, 
        receiverName, 
        receiverPhone, 
        receiverAddress
      );
      
      // 发货成功后，重新获取订单详情
      if (response.code === 200) {
        dispatch(fetchOrderDetail(id));
      }
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to ship order');
    }
  }
);

// 创建Slice
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // 设置分页信息
    setPagination: (state, action: PayloadAction<{ current?: number; pageSize?: number; total?: number }>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    // 清除订单详情
    clearOrderDetail: (state) => {
      state.orderDetail = null;
    }
  },
  extraReducers: (builder) => {
    // 处理获取订单列表
    builder.addCase(fetchOrderList.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrderList.fulfilled, (state, action) => {
      state.loading = false;
      state.orderList = action.payload.data.list || [];
      state.pagination.total = action.payload.data.total || 0;
    });
    builder.addCase(fetchOrderList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取订单详情
    builder.addCase(fetchOrderDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrderDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.orderDetail = action.payload.data;
    });
    builder.addCase(fetchOrderDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取订单统计数据
    builder.addCase(fetchOrderStatistics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrderStatistics.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.code === 200 && action.payload.data) {
        state.statistics = action.payload.data;
      }
    });
    builder.addCase(fetchOrderStatistics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // 处理获取最近订单
    builder.addCase(fetchRecentOrders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRecentOrders.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload && action.payload.data && action.payload.code === 200) {
        console.log('Orders API response:', action.payload);
        if (action.payload.data.list) {
          state.recentOrders = action.payload.data.list;
        } else {
          state.recentOrders = action.payload.data;
        }
      } else {
        state.error = action.payload.message || '获取数据格式错误';
      }
    });
    builder.addCase(fetchRecentOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string || '获取最近订单失败';
    });

    // 处理订单发货
    builder.addCase(shipOrder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(shipOrder.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(shipOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

// 导出Actions
export const { setPagination, clearOrderDetail } = orderSlice.actions;

// 导出Reducer
export default orderSlice.reducer; 