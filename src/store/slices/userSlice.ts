import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// 定义用户状态接口
interface UserState {
  token: string | null
  userInfo: {
    id?: number
    admin_name?: string
    role?: string
    avatar?: string
    [key: string]: any
  } | null
  isLoggedIn: boolean
}

// 初始状态
const initialState: UserState = {
  token: localStorage.getItem('muying_admin_token'),
  userInfo: JSON.parse(localStorage.getItem('muying_admin_user') || 'null'),
  isLoggedIn: !!localStorage.getItem('muying_admin_token')
}

// 创建slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 登录成功，设置token和用户信息
    setCredentials: (state, action: PayloadAction<{ token: string, user: any }>) => {
      const { token, user } = action.payload
      state.token = token
      state.userInfo = user
      state.isLoggedIn = true
      
      // 保存到localStorage
      localStorage.setItem('muying_admin_token', token)
      localStorage.setItem('muying_admin_user', JSON.stringify(user))
    },
    
    // 退出登录
    logout: (state) => {
      state.token = null
      state.userInfo = null
      state.isLoggedIn = false
      
      // 清除localStorage
      localStorage.removeItem('muying_admin_token')
      localStorage.removeItem('muying_admin_user')
    },
    
    // 更新用户信息
    updateUserInfo: (state, action: PayloadAction<any>) => {
      state.userInfo = { ...state.userInfo, ...action.payload }
      localStorage.setItem('muying_admin_user', JSON.stringify(state.userInfo))
    }
  }
})

// 导出actions
export const { setCredentials, logout, updateUserInfo } = userSlice.actions

// 导出reducer
export default userSlice.reducer 