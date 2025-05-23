import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, List, Avatar, Button, Empty, Spin, Divider, Tooltip, message } from 'antd';
import { 
  BellOutlined, 
  CheckOutlined, 
  InfoCircleOutlined, 
  WarningOutlined, 
  ExclamationCircleOutlined,
  RightOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '@/store';
import { fetchUnreadCount, fetchLatestMessages, markAllMessagesAsRead } from '@/store/slices/messageSlice';
import { markAsRead } from '@/api/message';
import { formatTimeToNow } from '@/utils/dateUtils';
import './style.css';

// 消息类型定义
interface Message {
  id: number;
  title: string;
  content: string;
  type: string;
  isRead: number;
  createTime: string;
  typeDesc?: string;
}

// 获取消息类型的图标
const getMessageIcon = (type: string) => {
  switch (type) {
    case 'system':
      return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    case 'warning':
      return <WarningOutlined style={{ color: '#faad14' }} />;
    case 'error':
      return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
    case 'shipping_reminder':
      return <WarningOutlined style={{ color: '#722ed1' }} />;
    default:
      return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
  }
};

// 获取消息类型的描述
const getMessageTypeDesc = (type: string) => {
  switch (type) {
    case 'system':
      return '系统通知';
    case 'warning':
      return '警告';
    case 'error':
      return '错误';
    case 'shipping_reminder':
      return '催发货提醒';
    default:
      return '消息';
  }
};

// 根据消息类型分组
const groupMessagesByCategory = (messages: Message[]) => {
  const categories = {
    system: {
      title: '系统通知',
      count: 0,
      messages: [] as Message[]
    },
    order: {
      title: '订单提醒',
      count: 0,
      messages: [] as Message[]
    },
    inventory: {
      title: '库存预警',
      count: 0, 
      messages: [] as Message[]
    }
  };

  messages.forEach(msg => {
    if (msg.type === 'shipping_reminder') {
      categories.order.messages.push(msg);
      if (msg.isRead === 0) categories.order.count++;
    } else if (msg.type === 'inventory_warning') {
      categories.inventory.messages.push(msg);
      if (msg.isRead === 0) categories.inventory.count++;
    } else {
      // 默认系统消息
      categories.system.messages.push(msg);
      if (msg.isRead === 0) categories.system.count++;
    }
  });

  return categories;
};

const MessageCenter: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { unreadCount, latestMessages, loading, error } = useSelector((state: RootState) => state.message);
  
  // 添加本地loading状态
  const [localLoading, setLocalLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 初始加载
  useEffect(() => {
    // 获取未读消息数量和最新消息
    loadMessages();
    
    // 设置定时刷新
    const timer = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 60000); // 每分钟刷新一次
    
    return () => {
      clearInterval(timer);
    };
  }, [dispatch]);

  // 加载消息函数
  const loadMessages = async () => {
    setLocalLoading(true);
    setLoadError(null);
    
    try {
      // 获取未读消息数量
      await dispatch(fetchUnreadCount());
      
      // 获取最新消息
      await dispatch(fetchLatestMessages({ page: 1, size: 5 }));
    } catch (err) {
      console.error('加载消息失败:', err);
      setLoadError('加载消息失败，请重试');
    } finally {
      setLocalLoading(false);
    }
  };
  
  // 处理标记消息为已读
  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead([id]);
      message.success('已标记为已读');
      dispatch(fetchUnreadCount());
      dispatch(fetchLatestMessages({ page: 1, size: 5 }));
    } catch (error) {
      message.error('标记已读失败，请重试');
      console.error('标记已读失败:', error);
    }
  };
  
  // 处理标记所有消息为已读
  const handleMarkAllAsRead = async () => {
    try {
      if (!latestMessages || latestMessages.length === 0) return;
      
      await dispatch(markAllMessagesAsRead());
      message.success('已全部标记为已读');
    } catch (error) {
      message.error('标记全部已读失败，请重试');
      console.error('标记全部已读失败:', error);
    }
  };
  
  // 查看所有消息
  const viewAllMessages = () => {
    navigate('/message/list');
  };
  
  // 处理消息点击
  const handleMessageClick = (msg: Message) => {
    // 如果消息未读，标记为已读
    if (msg.isRead === 0) {
      handleMarkAsRead(msg.id);
    }
    
    // 根据消息类型进行不同的处理
    if (msg.type === 'shipping_reminder') {
      // 尝试通过正则表达式提取订单号，如果失败则使用默认导航
      const orderId = msg.content.match(/订单号：(\d+)/)?.[1];
      if (orderId) {
        navigate(`/order/detail/${orderId}`);
      } else {
        // 如果无法提取订单ID，就导航到消息详情页
        navigate(`/message/detail/${msg.id}`);
      }
    } else {
      // 导航到消息详情
      navigate(`/message/detail/${msg.id}`);
    }
  };

  // 重新加载消息
  const handleRetry = () => {
    loadMessages();
  };

  // 准备消息分类数据
  const categories = latestMessages ? groupMessagesByCategory(latestMessages) : {
    system: { title: '系统通知', count: 0, messages: [] },
    order: { title: '订单提醒', count: 0, messages: [] },
    inventory: { title: '库存预警', count: 0, messages: [] }
  };

  // 下拉菜单内容
  const dropdownContent = (
    <div className="message-dropdown">
      <div className="message-header">
        <h3>通知中心</h3>
        <div>
          {unreadCount > 0 && (
            <Button 
              type="text" 
              size="small" 
              icon={<CheckOutlined />} 
              onClick={handleMarkAllAsRead}
            >
              全部已读
            </Button>
          )}
          <Button 
            type="text" 
            size="small" 
            icon={<SyncOutlined />} 
            onClick={handleRetry}
          />
        </div>
      </div>
      
      <Divider style={{ margin: '0' }} />
      
      <div className="message-body">
        {localLoading || loading ? (
          <div className="message-loading">
            <Spin size="small" />
            <span>加载中...</span>
          </div>
        ) : loadError || error ? (
          <div className="message-error">
            <ExclamationCircleOutlined style={{ fontSize: 24, color: '#ff4d4f', marginBottom: 8 }} />
            <span>{loadError || '加载消息失败'}</span>
            <Button 
              type="primary" 
              size="small" 
              onClick={handleRetry}
              style={{ marginTop: 8 }}
            >
              重试
            </Button>
          </div>
        ) : !latestMessages || latestMessages.length === 0 ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="暂无消息" 
            className="message-empty"
          />
        ) : (
          <List
            className="message-list"
            itemLayout="horizontal"
            dataSource={latestMessages}
            renderItem={(item) => (
              <List.Item
                className={`message-item ${item.isRead === 0 ? 'message-unread' : ''}`}
                onClick={() => handleMessageClick(item)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={getMessageIcon(item.type)} 
                      className={`message-avatar message-type-${item.type}`} 
                    />
                  }
                  title={
                    <div className="message-title">
                      <span className="message-text">{item.title}</span>
                      {item.isRead === 0 && <Badge status="error" />}
                    </div>
                  }
                  description={
                    <div className="message-description">
                      <div className="message-content">{item.content}</div>
                      <div className="message-meta">
                        <span>{getMessageTypeDesc(item.type)}</span>
                        <span>·</span>
                        <span>{formatTimeToNow(item.createTime)}</span>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
      
      <Divider style={{ margin: '0' }} />
      
      <div className="message-footer" onClick={viewAllMessages}>
        <span>查看全部</span>
        <RightOutlined />
      </div>
    </div>
  );
  
  return (
    <Dropdown 
      overlay={dropdownContent} 
      placement="bottomRight" 
      arrow 
      trigger={['click']}
      dropdownRender={(menu) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
          {React.cloneElement(menu as React.ReactElement)}
        </div>
      )}
    >
      <div className="message-trigger">
        <Tooltip title="消息通知">
          <Badge count={unreadCount} overflowCount={99}>
            <Button 
              type="text" 
              icon={<BellOutlined />}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:bg-opacity-50 dark:hover:bg-opacity-50 rounded-lg"
              size="large"
            />
          </Badge>
        </Tooltip>
      </div>
    </Dropdown>
  );
};

export default MessageCenter; 