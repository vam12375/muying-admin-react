import { configureStore } from '@reduxjs/toolkit'
import userReducer from './slices/userSlice'
import orderReducer from './slices/orderSlice'
import logisticsReducer from './slices/logisticsSlice'
import couponReducer from './slices/couponSlice'
import pointsReducer from './slices/pointsSlice'
import systemReducer from './slices/systemSlice'
import messageReducer from './slices/messageSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    order: orderReducer,
    logistics: logisticsReducer,
    coupon: couponReducer,
    points: pointsReducer,
    system: systemReducer,
    message: messageReducer,
  },
})

// 从store本身推断出RootState和AppDispatch类型
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 