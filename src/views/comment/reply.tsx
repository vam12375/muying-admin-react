import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, List, Avatar, Typography, Spin, message, Divider, Image } from 'antd';
import { 
  MessageOutlined, 
  DeleteOutlined, 
  SendOutlined,
  UserOutlined
} from '@ant-design/icons';
import { 
  getCommentDetail, 
  getCommentReplies, 
  createCommentReply, 
  deleteCommentReply,
  getReplyTemplates,
  type Comment,
  type CommentReply
} from '@/api/comment';
import { formatImageUrl } from '@/utils/imageUtils';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

// 定义API响应类型
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

const { TextArea } = Input;
const { Title, Text } = Typography;

interface CommentReplyModalProps {
  visible: boolean;
  commentId: number;
  productName?: string;
  onClose: (needRefresh?: boolean) => void;
}

/**
 * 评价回复模态框组件
 */
const CommentReplyModal: React.FC<CommentReplyModalProps> = ({
  visible,
  commentId,
  productName,
  onClose
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState<Comment | null>(null);
  const [replies, setReplies] = useState<CommentReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [templates, setTemplates] = useState<{templateId: number, templateContent: string, templateName?: string}[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // 获取评价详情
  useEffect(() => {
    if (commentId && visible) {
      setLoading(true);
      getCommentDetail(commentId)
        .then(res => {
          // 使用类型断言处理响应
          const response = res as unknown as ApiResponse<Comment>;
          if (response.success && response.data) {
            setComment(response.data);
          }
        })
        .catch(error => {
          console.error('获取评价详情失败:', error);
          message.error('获取评价详情失败');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [commentId, visible]);

  // 获取评价回复
  useEffect(() => {
    if (commentId && visible) {
      setLoadingReplies(true);
      getCommentReplies(commentId)
        .then(res => {
          // 使用类型断言
          const response = res as unknown as ApiResponse<CommentReply[]>;
          if (response.success) {
            setReplies(response.data || []);
          } else {
            setReplies([]);
          }
        })
        .catch(error => {
          console.error('获取评价回复失败:', error);
          message.error('获取评价回复失败');
          setReplies([]);
        })
        .finally(() => {
          setLoadingReplies(false);
        });
    }
  }, [commentId, visible]);

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
          // 使用类型断言
          const response = res as unknown as ApiResponse<{templateId: number, templateContent: string, templateName?: string}[]>;
          if (response.success) {
            // 确保设置模板或默认空数组
            setTemplates(response.data || []);
          } else {
            // 当API成功但结果不成功时，设置空数组
            setTemplates([]);
          }
        })
        .catch(error => {
          console.error('获取回复模板失败:', error);
          // 出错时也设置空数组，确保组件不会崩溃
          setTemplates([]);
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
      
      // 使用类型断言
      const response = res as unknown as ApiResponse<boolean>;
      if (response.success) {
        message.success('回复成功');
        form.resetFields();
        
        try {
          // 重新获取回复列表
          const repliesRes = await getCommentReplies(commentId);
          // 使用类型断言
          const repliesResponse = repliesRes as unknown as ApiResponse<CommentReply[]>; 
          if (repliesResponse.success) {
            setReplies(repliesResponse.data || []);
          }
        } catch (error) {
          console.error('刷新回复列表失败:', error);
          // 即使刷新回复列表失败也继续处理
        } finally {
          // 通知父组件刷新评价列表 - 移到finally确保总是执行
          onClose(true);
        }
      } else {
        message.error(response.message || '提交回复失败');
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
      // 使用类型断言
      const response = res as unknown as ApiResponse<boolean>;
      if (response.success) {
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

  // 辅助函数：从用户名中移除数字后缀
  const cleanUserName = (name: string | undefined | null): string => {
    if (!name) return '';
    
    // 更高效的方式：直接使用正则表达式去除末尾的数字
    return name.replace(/\d+$/, '');
  };

  return (
    <Modal
      title={`回复评价 - ${productName || '商品'}`}
      open={visible}
      onCancel={() => onClose(true)}
      footer={null}
      width={700}
      destroyOnClose
    >
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      ) : comment ? (
        <div className="comment-reply-modal">
          {/* 评价详情 */}
          <div className="comment-detail mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <Avatar 
                src={comment.userAvatar} 
                icon={!comment.userAvatar ? <UserOutlined /> : undefined} 
                className="mr-3"
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <Text strong>
                      {(() => {
                        // 获取显示名称
                        const displayName = comment.userNickname || comment.userName || (comment.isAnonymous ? '匿名用户' : '用户');
                        return cleanUserName(displayName);
                      })()}
                    </Text>
                    <Text type="secondary" className="ml-2">
                      {dayjs(comment.createTime).format('YYYY-MM-DD HH:mm')}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary">评分：</Text>
                    <Text strong className={
                      comment.rating >= 4 ? 'text-green-500' : 
                      comment.rating >= 3 ? 'text-blue-500' : 
                      'text-red-500'
                    }>
                      {comment.rating}分
                    </Text>
                  </div>
                </div>
                <div className="mt-2">
                  <Text>{comment.content}</Text>
                </div>
                {comment.images && comment.images.length > 0 && (
                  <div className="flex mt-3 space-x-2">
                    {comment.images.map((img, index) => (
                      <Image 
                        key={index} 
                        src={formatImageUrl(img)} 
                        alt={`评价图片${index + 1}`} 
                        width={64}
                        height={64}
                        className="object-cover rounded"
                        fallback="https://via.placeholder.com/64?text=No+Image"
                        onError={() => {
                          console.error('Review image load error:', img);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 回复列表 */}
          <div className="comment-replies mb-4">
            <Title level={5} className="mb-4">
              <MessageOutlined className="mr-2" />
              回复记录 ({replies.length})
            </Title>
            
            {loadingReplies ? (
              <div className="flex justify-center py-4">
                <Spin size="small" />
              </div>
            ) : replies.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <List
                  itemLayout="horizontal"
                  dataSource={replies}
                  renderItem={(reply) => (
                    <List.Item
                      key={reply.replyId}
                      actions={[
                        <Button 
                          key="delete" 
                          type="text" 
                          danger 
                          icon={<DeleteOutlined />} 
                          onClick={() => handleDeleteReply(reply.replyId)}
                        >
                          删除
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} />}
                        title={
                          <div>
                            <Text strong>
                              {reply.replyType === 1 ? '商家回复' : reply.replyUserName || '用户追评'}
                            </Text>
                            <Text type="secondary" className="ml-2" style={{ fontSize: '12px' }}>
                              {dayjs(reply.createTime).format('YYYY-MM-DD HH:mm')}
                            </Text>
                          </div>
                        }
                        description={reply.content}
                      />
                    </List.Item>
                  )}
                />
              </motion.div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                暂无回复记录
              </div>
            )}
          </div>
          
          {/* 回复模板 - 增强健壮性 */}
          {templates && templates.length > 0 && (
            <div className="reply-templates mb-4">
              <Divider orientation="left">推荐回复模板</Divider>
              <div className="flex flex-wrap gap-2">
                {loadingTemplates ? (
                  <Spin size="small" />
                ) : (
                  templates.map((template, index) => (
                    <Button 
                      key={index} 
                      size="small"
                      onClick={() => handleUseTemplate(template.templateContent || '')}
                      className="mb-2"
                    >
                      {template.templateContent && template.templateContent.length > 20
                        ? `${template.templateContent.substring(0, 18)}...`
                        : template.templateContent || '空模板'}
                    </Button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 回复表单 */}
          <Form form={form} onFinish={handleSubmit}>
            <Form.Item
              name="content"
              rules={[{ required: true, message: '请输入回复内容' }]}
            >
              <TextArea 
                placeholder="请输入回复内容..." 
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </Form.Item>
            <Form.Item className="mb-0 text-right">
              <Button onClick={() => onClose(true)} className="mr-2">
                取消
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                icon={<SendOutlined />}
              >
                提交回复
              </Button>
            </Form.Item>
          </Form>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          评价信息加载失败
        </div>
      )}
    </Modal>
  );
};

export default CommentReplyModal;
