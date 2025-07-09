# API 文档

## 📋 API 概览

母婴商城管理后台的 API 接口文档，包含认证、用户管理、商品管理、订单管理等核心功能的接口说明。

### 基础信息
- **Base URL**: `https://api.muying.com`
- **API 版本**: `v1`
- **数据格式**: `JSON`
- **字符编码**: `UTF-8`

### 通用响应格式
```typescript
interface ApiResponse<T = any> {
  code: number        // 状态码：200 成功，其他为错误
  message: string     // 响应消息
  data: T            // 响应数据
  timestamp: number   // 时间戳
}

// 分页响应格式
interface PaginatedResponse<T> {
  code: number
  message: string
  data: {
    items: T[]        // 数据列表
    total: number     // 总数量
    page: number      // 当前页码
    pageSize: number  // 每页大小
    totalPages: number // 总页数
  }
  timestamp: number
}
```

## 🔐 认证授权

### 登录认证
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123",
  "captcha": "1234",
  "captchaId": "uuid-string"
}
```

**响应示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh-token-string",
    "expiresIn": 7200,
    "userInfo": {
      "id": 1,
      "username": "admin",
      "name": "管理员",
      "avatar": "https://example.com/avatar.jpg",
      "role": "admin",
      "permissions": ["user:view", "product:manage"]
    }
  },
  "timestamp": 1703123456789
}
```

### 刷新令牌
```http
POST /api/auth/refresh
Authorization: Bearer <refresh-token>
```

### 退出登录
```http
POST /api/auth/logout
Authorization: Bearer <access-token>
```

## 👥 用户管理 API

### 获取用户列表
```http
GET /api/users?page=1&pageSize=20&keyword=&status=&startDate=&endDate=
Authorization: Bearer <access-token>
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页大小，默认 20 |
| keyword | string | 否 | 搜索关键词（姓名、邮箱） |
| status | string | 否 | 用户状态：active, inactive |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "张三",
        "email": "zhangsan@example.com",
        "phone": "13800138000",
        "avatar": "https://example.com/avatar.jpg",
        "status": "active",
        "lastLoginAt": "2023-12-01T10:30:00Z",
        "createdAt": "2023-11-01T08:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  },
  "timestamp": 1703123456789
}
```

### 获取用户详情
```http
GET /api/users/{id}
Authorization: Bearer <access-token>
```

### 创建用户
```http
POST /api/users
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "李四",
  "email": "lisi@example.com",
  "phone": "13900139000",
  "password": "password123",
  "role": "user",
  "status": "active"
}
```

### 更新用户
```http
PUT /api/users/{id}
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "李四",
  "email": "lisi@example.com",
  "phone": "13900139000",
  "status": "active"
}
```

### 删除用户
```http
DELETE /api/users/{id}
Authorization: Bearer <access-token>
```

## 🛍️ 商品管理 API

### 获取商品列表
```http
GET /api/products?page=1&pageSize=20&categoryId=&brandId=&status=&keyword=
Authorization: Bearer <access-token>
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页大小 |
| categoryId | number | 否 | 分类ID |
| brandId | number | 否 | 品牌ID |
| status | string | 否 | 商品状态：active, inactive, draft |
| keyword | string | 否 | 搜索关键词 |

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "婴儿奶粉",
        "sku": "MP001",
        "price": 299.00,
        "originalPrice": 399.00,
        "stock": 100,
        "images": ["https://example.com/image1.jpg"],
        "categoryId": 1,
        "categoryName": "奶粉",
        "brandId": 1,
        "brandName": "品牌A",
        "status": "active",
        "createdAt": "2023-11-01T08:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3
  },
  "timestamp": 1703123456789
}
```

### 创建商品
```http
POST /api/products
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "婴儿奶粉",
  "description": "高品质婴儿奶粉",
  "sku": "MP001",
  "categoryId": 1,
  "brandId": 1,
  "price": 299.00,
  "originalPrice": 399.00,
  "stock": 100,
  "minStock": 10,
  "images": ["https://example.com/image1.jpg"],
  "specifications": [
    {
      "name": "规格",
      "value": "900g"
    }
  ],
  "status": "active"
}
```

### 更新商品
```http
PUT /api/products/{id}
Authorization: Bearer <access-token>
Content-Type: application/json
```

### 删除商品
```http
DELETE /api/products/{id}
Authorization: Bearer <access-token>
```

### 批量操作商品
```http
POST /api/products/batch
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "action": "updateStatus", // updateStatus, delete
  "ids": [1, 2, 3],
  "data": {
    "status": "inactive"
  }
}
```

## 📦 订单管理 API

### 获取订单列表
```http
GET /api/orders?page=1&pageSize=20&status=&startDate=&endDate=
Authorization: Bearer <access-token>
```

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "items": [
      {
        "id": 1,
        "orderNo": "ORD202312010001",
        "userId": 1,
        "userName": "张三",
        "totalAmount": 598.00,
        "status": "paid",
        "paymentMethod": "alipay",
        "items": [
          {
            "productId": 1,
            "productName": "婴儿奶粉",
            "price": 299.00,
            "quantity": 2,
            "subtotal": 598.00
          }
        ],
        "shippingAddress": {
          "name": "张三",
          "phone": "13800138000",
          "address": "北京市朝阳区xxx街道xxx号"
        },
        "createdAt": "2023-12-01T10:30:00Z"
      }
    ],
    "total": 200,
    "page": 1,
    "pageSize": 20,
    "totalPages": 10
  },
  "timestamp": 1703123456789
}
```

### 获取订单详情
```http
GET /api/orders/{id}
Authorization: Bearer <access-token>
```

### 更新订单状态
```http
PUT /api/orders/{id}/status
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "status": "shipped",
  "remark": "订单已发货"
}
```

## 🎫 优惠券管理 API

### 获取优惠券列表
```http
GET /api/coupons?page=1&pageSize=20&status=&type=
Authorization: Bearer <access-token>
```

### 创建优惠券
```http
POST /api/coupons
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "新用户专享",
  "type": "discount", // discount, amount
  "value": 0.1, // 折扣值或金额
  "minAmount": 100, // 最低消费金额
  "maxDiscount": 50, // 最大优惠金额
  "quantity": 1000, // 发放数量
  "startDate": "2023-12-01T00:00:00Z",
  "endDate": "2023-12-31T23:59:59Z",
  "status": "active"
}
```

## 📊 数据统计 API

### 获取仪表盘数据
```http
GET /api/dashboard/stats
Authorization: Bearer <access-token>
```

**响应示例**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "overview": {
      "totalUsers": 10000,
      "totalOrders": 5000,
      "totalRevenue": 1000000,
      "totalProducts": 500
    },
    "todayStats": {
      "newUsers": 50,
      "newOrders": 100,
      "revenue": 20000
    },
    "charts": {
      "salesTrend": [
        { "date": "2023-12-01", "amount": 10000 },
        { "date": "2023-12-02", "amount": 12000 }
      ],
      "userGrowth": [
        { "date": "2023-12-01", "count": 100 },
        { "date": "2023-12-02", "count": 150 }
      ]
    }
  },
  "timestamp": 1703123456789
}
```

## 📁 文件上传 API

### 上传单个文件
```http
POST /api/upload/single
Authorization: Bearer <access-token>
Content-Type: multipart/form-data

file: <binary-data>
```

**响应示例**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://cdn.muying.com/uploads/2023/12/01/image.jpg",
    "filename": "image.jpg",
    "size": 102400,
    "mimeType": "image/jpeg"
  },
  "timestamp": 1703123456789
}
```

### 上传多个文件
```http
POST /api/upload/multiple
Authorization: Bearer <access-token>
Content-Type: multipart/form-data

files: <binary-data>[]
```

## ❌ 错误码说明

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 200 | 成功 | - |
| 400 | 请求参数错误 | 检查请求参数格式和必填项 |
| 401 | 未授权 | 检查 token 是否有效 |
| 403 | 权限不足 | 检查用户权限 |
| 404 | 资源不存在 | 检查请求路径和资源ID |
| 422 | 数据验证失败 | 检查数据格式和业务规则 |
| 429 | 请求频率限制 | 降低请求频率 |
| 500 | 服务器内部错误 | 联系技术支持 |

## 🔧 请求示例

### JavaScript/TypeScript
```typescript
// 使用 axios
import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.muying.com',
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // 处理未授权
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 使用示例
const getUserList = async (params: UserListParams) => {
  return await api.get('/api/users', { params })
}
```

### cURL
```bash
# 登录
curl -X POST https://api.muying.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# 获取用户列表
curl -X GET "https://api.muying.com/api/users?page=1&pageSize=20" \
  -H "Authorization: Bearer <access-token>"
```

---

*本文档提供了完整的 API 接口说明，为前端开发和第三方集成提供参考。*
