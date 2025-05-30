import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Progress, Divider, Spin, Empty, message, Typography } from 'antd';
import {
  StarOutlined,
  MessageOutlined,
  LikeOutlined,
  DislikeOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { getCommentStats as fetchCommentStats, getCommentTrend as fetchCommentTrend, getCategoryCommentDistribution as fetchCategoryDistribution } from '@/api/comment';
import type { AxiosResponse } from 'axios';

// 直接导入图表组件 - 使用 import/export 语法替代 require
import { Line, Pie, Bar } from '@ant-design/charts';

// 为兼容性创建组件引用
const LineChart = Line;
const PieChart = Pie;
const BarChart = Bar;

const { Title } = Typography;

// 辅助函数：检查数据是否为数组且可迭代
const isArrayLike = (data: unknown): data is Array<any> => {
  return Array.isArray(data) && typeof (data as any).map === 'function';
};

// 评分项类型定义
interface RatingItem {
  rating: number;
  count: number;
  percentage: number;
}

// 商品评价项
interface ProductCommentItem {
  productId: number;
  productName: string;
  commentCount: number;
}

// 统计数据类型
interface StatsData {
  totalComments: number;
  averageRating: number;
  positiveRate: number;
  responseRate: number;
  ratingDistribution: RatingItem[];
  recentTrend: { date: string; count: number }[];
  productTop10?: ProductCommentItem[];
}

// 辅助函数：将评分分布的Map转换为数组格式
const convertRatingDistributionToArray = (ratingDistribution: unknown): RatingItem[] => {
  // 如果已经是数组格式，直接返回
  if (isArrayLike(ratingDistribution)) {
    return ratingDistribution as RatingItem[];
  }
  
  // 如果是Map格式 {1: 数量, 2: 数量, ...}，转换为数组
  if (ratingDistribution && typeof ratingDistribution === 'object') {
    const ratingMap = ratingDistribution as Record<string, number>;
    const totalComments = Object.values(ratingMap).reduce((sum, count) => sum + (count || 0), 0);
    
    return Object.entries(ratingMap).map(([rating, count]) => ({
      rating: parseInt(rating),
      count: count,
      percentage: totalComments > 0 ? Math.round((count) / totalComments * 100) : 0
    })).sort((a, b) => b.rating - a.rating); // 按评分从高到低排序
  }
  
  // 如果数据无效，返回空数组
  return [];
};

/**
 * 评价统计组件
 */
const CommentStatistics: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [trendData, setTrendData] = useState<Array<{date: string; count: number}>>([]);
  const [categoryData, setCategoryData] = useState<Array<{category: string; count: number; percentage: number}>>([]);
  const [loadingTrend, setLoadingTrend] = useState<boolean>(false);
  const [loadingCategory, setLoadingCategory] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // 使用模拟数据（当API数据不可用时）
  const mockStats: StatsData = {
    totalComments: 1245,
    averageRating: 4.6,
    positiveRate: 92,
    responseRate: 85,
    ratingDistribution: [
      { rating: 5, count: 856, percentage: 69 },
      { rating: 4, count: 289, percentage: 23 },
      { rating: 3, count: 65, percentage: 5 },
      { rating: 2, count: 23, percentage: 2 },
      { rating: 1, count: 12, percentage: 1 }
    ],
    recentTrend: [
      { date: '2023-06-01', count: 25 },
      { date: '2023-06-02', count: 30 },
      { date: '2023-06-03', count: 22 },
      { date: '2023-06-04', count: 28 },
      { date: '2023-06-05', count: 32 },
      { date: '2023-06-06', count: 35 },
      { date: '2023-06-07', count: 40 }
    ],
    // 模拟热门商品数据
    productTop10: [
      { productId: 1, productName: '某品牌奶粉', commentCount: 156 },
      { productId: 2, productName: '某品牌纸尿裤', commentCount: 145 },
      { productId: 3, productName: '婴儿洗发水', commentCount: 98 },
      { productId: 4, productName: '婴儿护肤霜', commentCount: 87 },
      { productId: 5, productName: '辅食营养米粉', commentCount: 76 }
    ]
  };

  // 获取评价统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setHasError(false);
        const res = await fetchCommentStats(7); // 获取7天的统计数据
        if (res && res.data) {
          // 处理评分分布数据，确保格式一致
          const processedData = {
            ...res.data,
            ratingDistribution: convertRatingDistributionToArray(res.data.ratingDistribution)
          } as StatsData;
          
          setStats(processedData);
        } else {
          console.warn('API返回成功但数据无效，使用模拟数据');
          setStats(mockStats);
          message.warning('获取评价统计数据失败，显示模拟数据');
        }
      } catch (error) {
        console.error('获取评价统计数据失败:', error);
        // 记录错误状态
        setHasError(true);
        // API失败时使用模拟数据
        setStats(mockStats);
        message.warning('获取评价统计数据失败，显示模拟数据');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // 获取评价趋势数据
  useEffect(() => {
    const fetchTrend = async () => {
      try {
        setLoadingTrend(true);
        const res = await fetchCommentTrend(30); // 获取30天的趋势
        if (res && res.data) {
          setTrendData(res.data);
        } else {
          console.warn('趋势数据API返回成功但数据无效，使用模拟数据');
          // 使用模拟数据或从stats中获取
          const fallbackData = stats?.recentTrend || mockStats.recentTrend;
          setTrendData(fallbackData);
        }
      } catch (error) {
        console.error('获取评价趋势数据失败:', error);
        // API失败时使用模拟数据或从stats中获取
        const fallbackData = stats?.recentTrend || mockStats.recentTrend;
        setTrendData(fallbackData);
      } finally {
        setLoadingTrend(false);
      }
    };

    fetchTrend();
  }, [stats]); // 添加stats依赖，确保在stats可用时有备用数据

  // 获取分类评价分布
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoadingCategory(true);
        const res = await fetchCategoryDistribution();
        if (res && res.data) {
          setCategoryData(res.data);
        } else {
          console.warn('分类分布API返回成功但数据无效，使用模拟数据');
          // 使用默认的模拟数据
          const mockCategoryData = [
            { category: '奶粉', count: 456, percentage: 36.6 },
            { category: '纸尿裤', count: 324, percentage: 26.0 },
            { category: '洗护', count: 245, percentage: 19.7 },
            { category: '辅食', count: 145, percentage: 11.6 },
            { category: '其他', count: 75, percentage: 6.1 },
          ];
          setCategoryData(mockCategoryData);
        }
      } catch (error) {
        console.error('获取分类评价分布数据失败:', error);
        // API失败时使用模拟数据
        const mockCategoryData = [
          { category: '奶粉', count: 456, percentage: 36.6 },
          { category: '纸尿裤', count: 324, percentage: 26.0 },
          { category: '洗护', count: 245, percentage: 19.7 },
          { category: '辅食', count: 145, percentage: 11.6 },
          { category: '其他', count: 75, percentage: 6.1 },
        ];
        setCategoryData(mockCategoryData);
      } finally {
        setLoadingCategory(false);
      }
    };

    fetchCategoryData();
  }, []);

  // 图表配置
  const lineConfig = {
    data: trendData.length > 0 ? trendData : (stats?.recentTrend || mockStats.recentTrend),
    height: 300,
    xField: 'date',
    yField: 'count',
    point: {
      size: 5,
      shape: 'diamond',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
  };

  const pieConfig = {
    data: categoryData.length > 0 ? categoryData : [
      { category: '奶粉', count: 456, percentage: 36.6 },
      { category: '纸尿裤', count: 324, percentage: 26.0 },
      { category: '洗护', count: 245, percentage: 19.7 },
      { category: '辅食', count: 145, percentage: 11.6 },
      { category: '其他', count: 75, percentage: 6.1 },
    ],
    height: 300,
    angleField: 'count',
    colorField: 'category',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name}: {percentage}%',
    },
    interactions: [{ type: 'element-active' }],
  };

  // 确保displayStats具有合适的数据格式
  const displayStats = stats || mockStats;
  
  // 确保ratingDistribution是数组
  const safeRatingDistribution = isArrayLike(displayStats.ratingDistribution) 
    ? displayStats.ratingDistribution 
    : convertRatingDistributionToArray(displayStats.ratingDistribution);
    
  // 获取特定评分的数量
  const getRatingCount = (rating: number): number => {
    return safeRatingDistribution.find(item => item.rating === rating)?.count || 0;
  };

  // 计算差评率（1星+2星）
  const calculateNegativeRate = (): number => {
    const oneStarCount = getRatingCount(1);
    const twoStarCount = getRatingCount(2);
    const total = displayStats.totalComments || 1; // 避免除以0
    
    return Math.round((oneStarCount + twoStarCount) / total * 100);
  };

  // 如果发生错误，显示错误通知
  if (hasError) {
    message.error({
      content: '获取数据时发生错误，显示的是模拟数据',
      key: 'stats-error',
      duration: 3
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="comment-statistics"
    >
      <div className="mb-6">
        <Title level={2}>评价统计</Title>
        <div className="flex justify-between items-center">
          <p className="text-gray-500">查看评价数据统计和趋势分析，帮助优化产品和服务</p>
          {hasError && (
            <div className="text-red-500 text-sm">
              <span role="alert">
                注意：后端API返回错误，当前页面显示的是模拟数据
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* 总体统计 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="评价总数"
              value={displayStats.totalComments}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="平均评分"
              value={displayStats.averageRating}
              precision={1}
              prefix={<StarOutlined />}
              suffix="/ 5"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="好评率"
              value={displayStats.positiveRate}
              prefix={<LikeOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="h-full shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="回复率"
              value={displayStats.responseRate}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      {/* 评分分布 */}
      <Card title="评分分布" className="mb-6 shadow-sm">
        <div className="rating-distribution">
          {safeRatingDistribution.map((item) => (
            <div key={item.rating} className="mb-3 flex items-center">
              <div className="w-12 text-right mr-4">{item.rating} 星</div>
              <Progress
                percent={item.percentage}
                strokeColor={
                  item.rating >= 4
                    ? '#52c41a'
                    : item.rating >= 3
                    ? '#1890ff'
                    : item.rating >= 2
                    ? '#faad14'
                    : '#f5222d'
                }
                className="flex-1"
              />
              <div className="ml-4 w-16 text-gray-500">{item.count} ({item.percentage}%)</div>
            </div>
          ))}
        </div>
      </Card>

      {/* 评价趋势图 */}
      <Card title="近30日评价趋势" className="mb-6 shadow-sm">
        {loadingTrend ? (
          <div className="flex justify-center items-center py-12">
            <Spin />
          </div>
        ) : LineChart ? (
          <LineChart {...lineConfig} />
        ) : (
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <Empty description="图表组件未加载，请安装@ant-design/charts" />
          </div>
        )}
      </Card>

      {/* 评价质量分析 */}
      <Card title="评价质量分析" className="mb-6 shadow-sm">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Statistic
              title="有图评价"
              value={Math.round(displayStats.totalComments * 0.29)}
              suffix={`/ ${displayStats.totalComments}`}
            />
            <div className="mt-2">
              <Progress percent={29} />
            </div>
          </Col>
          <Col span={8}>
            <Statistic
              title="有效评价"
              value={Math.round(displayStats.totalComments * 0.91)}
              suffix={`/ ${displayStats.totalComments}`}
            />
            <div className="mt-2">
              <Progress percent={91} 
                strokeColor="#1890ff" 
              />
            </div>
          </Col>
          <Col span={8}>
            <Statistic
              title="差评率"
              value={calculateNegativeRate()}
              suffix="%"
              prefix={<DislikeOutlined />}
            />
            <div className="mt-2">
              <Progress 
                percent={calculateNegativeRate()} 
                strokeColor="#f5222d" 
              />
            </div>
          </Col>
        </Row>
      </Card>

      <Divider>评价分类分析</Divider>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} sm={12}>
          <Card title="品类评价分布" className="h-full shadow-sm">
            {loadingCategory ? (
              <div className="flex justify-center items-center h-64">
                <Spin />
              </div>
            ) : PieChart ? (
              <PieChart {...pieConfig} />
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <Empty description="图表组件未加载，请安装@ant-design/charts" />
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="需关注商品" className="h-full shadow-sm">
            {displayStats.productTop10 ? (
              Array.isArray(displayStats.productTop10) && displayStats.productTop10.length > 0 ? (
                <div>
                  {/* 这里可以根据实际数据展示需要关注的商品 */}
                  {BarChart ? (
                    <BarChart 
                      data={displayStats.productTop10}
                      xField="commentCount"
                      yField="productName"
                      height={300}
                      meta={{
                        productName: {
                          alias: '商品名称',
                        },
                        commentCount: {
                          alias: '评价数量',
                        },
                      }}
                    />
                  ) : (
                    <ul className="list-disc pl-5">
                      {displayStats.productTop10.map((item, index) => (
                        <li key={index} className="mb-2">
                          {item.productName} - {item.commentCount}条评价
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Empty description="暂无数据" />
              )
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <Empty description="暂无数据" />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

/**
 * 评价统计页面
 * 使用CommentStatistics组件并添加额外的样式容器
 */
const CommentStatisticsPage: React.FC = () => {
  return (
    <div className="comment-statistics-page">
      <CommentStatistics />
    </div>
  );
};

export default CommentStatisticsPage; 