import request from '@/utils/request';

/**
 * 评价管理 API
 */

// 评价类型定义
export interface Comment {
  commentId: number;
  userId: number;
  userName?: string;
  userAvatar?: string;
  userNickname?: string;
  productId: number;
  productName?: string;
  productImage?: string;
  orderId: number;
  content: string;
  rating: number;
  images: string[] | null;
  isAnonymous: boolean;
  status: number;
  createTime: string;
  updateTime: string;
  replies?: CommentReply[];
  tags?: CommentTag[];
  hasReplied?: boolean; // 是否已回复
}

// 评价回复类型定义
export interface CommentReply {
  replyId: number;
  commentId: number;
  content: string;
  replyType: number; // 1-商家回复，2-用户追评
  replyUserId: number;
  replyUserName?: string;
  replyUserNickname?: string;
  createTime: string;
  updateTime: string;
}

// 评价标签类型定义
export interface CommentTag {
  tagId: number;
  name: string;
  category?: string;
  count?: number; // 使用次数
}

// 评价统计数据类型
export interface CommentStats {
  totalComments: number;
  averageRating: number;
  positiveRate: number;
  responseRate: number;
  ratingDistribution: { rating: number; count: number; percentage: number }[];
  recentTrend: { date: string; count: number }[];
  categoryDistribution?: { category: string; count: number; percentage: number }[];
  productTop10?: { productId: number; productName: string; commentCount: number }[];
}

// 评价查询参数类型
export interface CommentQueryParams {
  page?: number;
  size?: number;
  productId?: number;
  categoryId?: number;
  userId?: number;
  minRating?: number;
  maxRating?: number;
  status?: number;
  orderId?: number;
  hasReply?: boolean;
  hasReplied?: boolean; // 是否已回复状态筛选
  startDate?: string;
  endDate?: string;
  keyword?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

// 评价回复创建参数
export interface CommentReplyCreateParams {
  commentId: number;
  content: string;
  replyType?: number;
  replyUserId: number;
}

/**
 * 获取评价列表
 */
export async function getCommentList(params: CommentQueryParams) {
  return request({
    url: '/admin/comments/page',
    method: 'get',
    params
  });
}

/**
 * 获取评价统计数据
 */
export async function getCommentStats(days: number = 7) {
  return request({
    url: '/admin/comments/stats',
    method: 'get',
    params: { days }
  });
}

/**
 * 更新评价状态
 */
export async function updateCommentStatus(commentId: number, status: number) {
  return request({
    url: `/admin/comments/${commentId}/status`,
    method: 'put',
    params: { status }
  });
}

/**
 * 删除评价
 */
export async function deleteComment(commentId: number) {
  return request({
    url: `/admin/comments/${commentId}`,
    method: 'delete'
  });
}

/**
 * 批量删除评价
 */
export async function batchDeleteComments(commentIds: number[]) {
  return request({
    url: `/admin/comments/batch/delete`,
    method: 'delete',
    data: { commentIds }
  });
}

/**
 * 获取评价详情
 */
export async function getCommentDetail(commentId: number) {
  return request({
    url: `/admin/comments/${commentId}`,
    method: 'get'
  });
}

/**
 * 获取评价回复列表
 */
export async function getCommentReplies(commentId: number) {
  return request({
    url: `/admin/comments/${commentId}/replies`,
    method: 'get'
  });
}

/**
 * 创建评价回复
 */
export async function createCommentReply(data: CommentReplyCreateParams) {
  return request({
    url: '/admin/comments/reply',
    method: 'post',
    data
  });
}

/**
 * 删除评价回复
 */
export async function deleteCommentReply(replyId: number) {
  return request({
    url: `/admin/comments/reply/${replyId}`,
    method: 'delete'
  });
}

/**
 * 更新评价回复
 */
export async function updateCommentReply(replyId: number, data: {
  content: string;
}) {
  return request({
    url: `/admin/comments/reply/${replyId}`,
    method: 'put',
    data
  });
}

/**
 * 批量回复评价
 */
export async function batchReplyComments(data: {
  commentIds: number[];
  content: string;
  replyUserId: number;
}) {
  return request({
    url: `/admin/comments/batch/reply`,
    method: 'post',
    data
  });
}

/**
 * 获取评价的关键词分析
 */
export async function getCommentKeywords(params: {
  productId?: number;
  minRating?: number;
  maxRating?: number;
  limit?: number;
}) {
  return request({
    url: '/admin/comments/keywords',
    method: 'get',
    params
  });
}

/**
 * 获取评价情感分析数据
 */
export async function getCommentSentimentAnalysis(params: {
  productId?: number;
  days?: number;
}) {
  return request({
    url: '/admin/comments/sentiment-analysis',
    method: 'get',
    params
  });
}

/**
 * 获取热门标签列表
 */
export async function getHotTags(limit: number = 10) {
  return request({
    url: '/admin/comments/tags/hot',
    method: 'get',
    params: { limit }
  });
}

/**
 * 为评价添加标签
 */
export async function addCommentTags(commentId: number, tagIds: number[]) {
  return request({
    url: `/admin/comments/${commentId}/tags`,
    method: 'post',
    data: tagIds
  });
}

/**
 * 获取评价标签
 */
export async function getCommentTags(commentId: number) {
  return request({
    url: `/admin/comments/${commentId}/tags`,
    method: 'get'
  });
}

/**
 * 获取推荐回复模板
 */
export async function getReplyTemplates(params: {
  productId?: number;
  rating?: number;
  limit?: number;
}) {
  return request({
    url: `/admin/comments/templates/recommended`,
    method: 'get',
    params
  });
}

/**
 * 导出评价数据
 */
export async function exportComments(params: CommentQueryParams) {
  return request({
    url: '/admin/comments/export',
    method: 'get',
    params,
    responseType: 'blob'
  });
}

/**
 * 获取每日评价趋势
 */
export async function getCommentTrend(days: number = 30) {
  return request({
    url: '/admin/comments/trend',
    method: 'get',
    params: { days }
  });
}

/**
 * 获取品类评价分布
 */
export async function getCategoryCommentDistribution() {
  return request({
    url: '/admin/comments/category/distribution',
    method: 'get'
  });
} 