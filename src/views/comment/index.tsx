import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, Typography, Tabs, Spin, Avatar, Row, Col, Tag, Rate, Divider,
  Timeline, Image, List, Input, Form, message, Descriptions, Breadcrumb,
  Button
} from 'antd';
import { 
  UserOutlined, ShopOutlined, MessageOutlined, RollbackOutlined,
  SendOutlined, DeleteOutlined, EyeOutlined
} from '@ant-design/icons';
import {
  getCommentDetail,
  getCommentReplies,
  createCommentReply,
  deleteCommentReply,
  getReplyTemplates,
  Comment,
  CommentReply
} from '@/api/comment';
import { formatImageUrl } from '@/utils/imageUtils';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import CommentList from './list';
import CommentStatistics from './statistics';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * 评价管理模块主页面
 */
const CommentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('list');

  // 处理Tab切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // 定义标签页内容
  const getTabContent = () => {
    switch (activeTab) {
      case 'list':
        return (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CommentList />
          </motion.div>
        );
      case 'statistics':
        return (
          <motion.div
            key="statistics"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CommentStatistics />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <Title level={2}>评价管理</Title>
        <div className="flex justify-between items-center">
          <p className="text-gray-500">管理所有用户对商品的评价，可查看、回复和删除评价</p>
          <div className="text-sm text-blue-500">
            共处理评价和回复数千条，平台满意度持续提升
          </div>
        </div>
      </div>

      <Card className="shadow-md">
        <div className="mb-4">
          <Tabs 
            activeKey={activeTab} 
            onChange={handleTabChange}
            className="comment-management-tabs"
            type="card"
            items={[
              { key: 'list', label: '评价列表' },
              { key: 'statistics', label: '评价统计' },
            ]}
          />
        </div>
        {getTabContent()}
      </Card>
    </motion.div>
  );
};

/**
 * 评价详情页面组件
 * 展示单个评价的详细信息、回复历史和交互功能
 */
const CommentDetail: React.FC = () => {
  // 获取评价ID参数
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const commentId = Number(id);
  
  // 表单实例
  const [form] = Form.useForm();
  
  // 状态管理
  const [loading, setLoading] = useState<boolean>(true);
  const [comment, setComment] = useState<Comment | null>(null);
  const [replies, setReplies] = useState<CommentReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [templates, setTemplates] = useState<{content: string, id: number}[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);
  
  // 回复区域引用，用于滚动定位
  const replyFormRef = useRef<HTMLDivElement>(null);

  // 获取评价详情
  useEffect(() => {
    if (commentId) {
      setLoading(true);
      getCommentDetail(commentId)
        .then(res => {
          if (res.success && res.data) {
            setComment(res.data);
          } else {
            message.error('评价不存在或已被删除');
            navigate('/comment/list');
          }
        })
        .catch(error => {
          console.error('获取评价详情失败:', error);
          message.error('获取评价详情失败');
          navigate('/comment/list');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [commentId, navigate]);

  // 获取评价回复
  useEffect(() => {
    if (commentId) {
      setLoadingReplies(true);
      getCommentReplies(commentId)
        .then(res => {
          // 修复AxiosResponse类型问题
          const data = res.data;
          if (data && data.success) {
            setReplies(data.data || []);
          }
        })
        .catch(error => {
          console.error('获取评价回复失败:', error);
          message.error('获取评价回复失败');
        })
        .finally(() => {
          setLoadingReplies(false);
        });
    }
  }, [commentId]);

  // 获取回复模板
  useEffect(() => {
    if (comment) {
      setLoadingTemplates(true);
      getReplyTemplates({
        productId: comment.productId,
        rating: comment.rating,
        limit: 5
      })
        .then(res => {
          // 修复AxiosResponse类型问题
          const data = res.data;
          if (data && data.success) {
            setTemplates(data.data || []);
          }
        })
        .catch(error => {
          console.error('获取回复模板失败:', error);
        })
        .finally(() => {
          setLoadingTemplates(false);
        });
    }
  }, [comment]);

  // 处理回复提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!values.content.trim()) {
        message.warning('回复内容不能为空');
        return;
      }
      
      setSubmitting(true);
      
      const res = await createCommentReply({
        commentId,
        content: values.content,
        replyType: 1, // 商家回复
        replyUserId: 1 // 假设当前登录的管理员ID为1，实际应该从全局状态或上下文中获取
      });
      
      // 修复AxiosResponse类型问题
      const data = res.data;
      if (data && data.success) {
        message.success('回复成功');
        form.resetFields();
        
        // 重新获取回复列表
        const repliesRes = await getCommentReplies(commentId);
        const repliesData = repliesRes.data;
        if (repliesData && repliesData.success) {
          setReplies(repliesData.data || []);
        }
      }
    } catch (error) {
      console.error('提交回复失败:', error);
      message.error('提交回复失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 处理回复删除
  const handleDeleteReply = async (replyId: number) => {
    try {
      const res = await deleteCommentReply(replyId);
      // 修复AxiosResponse类型问题
      const data = res.data;
      if (data && data.success) {
        message.success('删除回复成功');
        // 从列表中移除已删除的回复
        setReplies(replies.filter(reply => reply.replyId !== replyId));
      }
    } catch (error) {
      console.error('删除回复失败:', error);
      message.error('删除回复失败');
    }
  };

  // 使用模板
  const handleUseTemplate = (content: string) => {
    form.setFieldsValue({ content });
  };

  // 滚动到回复区域
  const scrollToReplyForm = () => {
    replyFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 返回列表页
  const handleGoBack = () => {
    navigate('/comment/list');
  };

  // 加载状态
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Spin size="large" tip="加载评价详情中..." />
      </div>
    );
  }

  // 评价不存在
  if (!comment) {
    return (
      <div className="text-center py-16">
        <Title level={4}>评价不存在或已被删除</Title>
        <Button type="primary" onClick={handleGoBack} className="mt-4">
          返回评价列表
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="comment-detail-page"
    >
      {/* 面包屑导航 */}
      <Breadcrumb 
        className="mb-4" 
        items={[
          { title: '评价管理', href: '/comment' },
          { title: '评价列表', href: '/comment/list' },
          { title: '评价详情' }
        ]}
      />

      {/* 页面标题 */}
      <div className="mb-5 flex justify-between items-center">
        <Title level={2}>评价详情</Title>
        <Button 
          type="primary" 
          icon={<RollbackOutlined />}
          onClick={handleGoBack}
        >
          返回列表
        </Button>
      </div>

      {/* 评价信息卡片 */}
      <Card className="mb-6 shadow-md">
        <Row gutter={[24, 24]}>
          {/* 评价基本信息 */}
          <Col xs={24} md={16}>
            <div className="mb-4">
              <div className="flex items-center mb-4">
                <Avatar 
                  size={64} 
                  src={comment.userAvatar} 
                  icon={!comment.userAvatar ? <UserOutlined /> : undefined}
                  className="mr-4"
                />
                <div>
                  <div className="flex items-center">
                    <Text strong className="text-lg">
                      {(() => {
                        // 辅助函数：从用户名中移除数字后缀
                        const cleanUserName = (name: string | undefined | null): string => {
                          if (!name) return '';
                          
                          // 更高效的方式：直接使用正则表达式去除末尾的数字
                          return name.replace(/\d+$/, '');
                        };
                        
                        // 获取显示名称
                        const displayName = comment.userNickname || comment.userName || (comment.isAnonymous ? '匿名用户' : '用户');
                        return cleanUserName(displayName);
                      })()}
                    </Text>
                    {comment.isAnonymous && <Tag className="ml-2">匿名</Tag>}
                  </div>
                  <Text type="secondary">
                    用户ID: {comment.userId}
                  </Text>
                </div>
              </div>

              <div className="mb-4">
                <div className="mb-2 flex justify-between items-center">
                  <div className="flex items-center">
                    <Text type="secondary" className="mr-2">评分：</Text>
                    <Rate disabled defaultValue={comment.rating} />
                    <Text 
                      strong 
                      className={`ml-2 ${
                        comment.rating >= 4 ? 'text-green-500' :
                        comment.rating >= 3 ? 'text-blue-500' :
                        'text-red-500'
                      }`}
                    >
                      {comment.rating}分
                    </Text>
                  </div>
                  <Text type="secondary">
                    {dayjs(comment.createTime).format('YYYY-MM-DD HH:mm:ss')}
                  </Text>
                </div>
                
                <Paragraph className="text-lg whitespace-pre-wrap">
                  {comment.content}
                </Paragraph>
                
                {comment.images && comment.images.length > 0 && (
                  <div className="mt-4">
                    <Text type="secondary" className="mb-2 block">评价图片：</Text>
                    <div className="flex flex-wrap gap-2">
                      {comment.images.map((img, index) => (
                        <Image 
                          key={index} 
                          src={formatImageUrl(img)} 
                          alt={`评价图片${index + 1}`} 
                          width={120}
                          height={120}
                          className="object-cover rounded"
                          placeholder={
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Spin />
                            </div>
                          }
                          preview={{
                            mask: <EyeOutlined />,
                          }}
                          fallback="https://via.placeholder.com/120?text=No+Image"
                          onError={() => {
                            console.error('Review image load error:', img);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Col>

          {/* 商品信息 */}
          <Col xs={24} md={8}>
            <Card title="商品信息" className="h-full">
              <div className="flex items-start">
                {comment.productImage && (
                  <Image 
                    src={formatImageUrl(comment.productImage)} 
                    alt={comment.productName || '商品图片'} 
                    width={100}
                    height={100}
                    className="object-cover rounded mr-4"
                    fallback="https://via.placeholder.com/100?text=No+Image"
                    onError={() => {
                      console.error('Product image load error:', comment.productImage);
                    }}
                  />
                )}
                <div>
                  <Text strong>{comment.productName}</Text>
                  <Text type="secondary">商品ID: {comment.productId}</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </motion.div>
  );
};

export default CommentManagement;
export { CommentDetail }; 