import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Form,
  Modal,
  message,
  Typography,
  Select,
  DatePicker,
  Tag,
  Tooltip,
  Popconfirm,
  Badge
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import type { AppDispatch, RootState } from '@/store';
import {
  fetchMessageList,
  fetchMessageDetail,
  deleteMessage,
  sendMessage,
  setPagination
} from '@/store/slices/messageSlice';
import { formatDateTime } from '@/utils/dateUtils';
import './list.css';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// 定义消息数据类型
interface MessageData {
  messageId: string;
  title: string;
  content: string;
  type: string;
  status: string;
  recipient: string;
  recipientType: string;
  createTime: string;
  sendTime: string;
}

const MessageList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();

  // 从Redux获取状态
  const { messageList, messageDetail, pagination, loading } = useSelector((state: RootState) => state.message);

  // 本地状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [messageForm] = Form.useForm();

  // 初始加载
  useEffect(() => {
    fetchMessages();
  }, [dispatch, pagination.current, pagination.pageSize]);

  // 获取消息列表
  const fetchMessages = () => {
    const values = form.getFieldsValue();
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...values,
      // 处理日期范围
      startTime: values.timeRange && values.timeRange[0] ? values.timeRange[0].format('YYYY-MM-DD HH:mm:ss') : undefined,
      endTime: values.timeRange && values.timeRange[1] ? values.timeRange[1].format('YYYY-MM-DD HH:mm:ss') : undefined
    };

    // 移除timeRange字段
    if (params.timeRange) {
      delete params.timeRange;
    }

    dispatch(fetchMessageList(params));
  };

  // 处理搜索
  const handleSearch = () => {
    dispatch(setPagination({ current: 1 }));
    fetchMessages();
  };

  // 重置查询
  const resetQuery = () => {
    form.resetFields();
    dispatch(setPagination({ current: 1 }));
    fetchMessages();
  };

  // 处理页码变化
  const handlePageChange = (page: number, pageSize?: number) => {
    dispatch(setPagination({ current: page, pageSize }));
  };

  // 处理每页条数变化
  const handleSizeChange = (_current: number, size: number) => {
    dispatch(setPagination({ current: 1, pageSize: size }));
  };

  // 查看消息详情
  const viewMessageDetail = async (messageId: string) => {
    setDetailModalVisible(true);
    try {
      await dispatch(fetchMessageDetail(messageId));
    } catch (error) {
      message.error('获取消息详情失败');
      console.error('获取消息详情失败:', error);
    }
  };

  // 删除消息
  const handleDelete = async (messageId: string) => {
    try {
      await dispatch(deleteMessage(messageId));
      message.success('删除成功');
      fetchMessages();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 打开创建消息对话框
  const openCreateModal = () => {
    messageForm.resetFields();
    setCreateModalVisible(true);
  };

  // 创建并发送消息
  const handleCreateMessage = async () => {
    try {
      const values = await messageForm.validateFields();
      const hide = message.loading('正在发送...', 0);

      try {
        await dispatch(sendMessage(values));
        hide();
        message.success('发送成功');
        setCreateModalVisible(false);
        fetchMessages();
      } catch (error) {
        hide();
        message.error('发送失败');
      }
    } catch (error) {
      // 表单验证失败
    }
  };

  // 获取消息类型标签
  const getTypeTag = (type: string) => {
    switch (type) {
      case 'system':
        return <Tag color="blue">系统消息</Tag>;
      case 'order':
        return <Tag color="green">订单消息</Tag>;
      case 'promotion':
        return <Tag color="orange">促销消息</Tag>;
      case 'notification':
        return <Tag color="purple">通知</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };

  // 获取消息状态标签
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge status="success" text="已发送" />;
      case 'pending':
        return <Badge status="processing" text="待发送" />;
      case 'failed':
        return <Badge status="error" text="发送失败" />;
      case 'draft':
        return <Badge status="default" text="草稿" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  // 获取接收者类型文本
  const getRecipientTypeText = (type: string) => {
    switch (type) {
      case 'user':
        return '用户';
      case 'admin':
        return '管理员';
      case 'all':
        return '所有用户';
      case 'group':
        return '用户组';
      default:
        return type;
    }
  };

  // 表格列定义
  const columns: ColumnsType<MessageData> = [
    {
      title: '消息信息',
      key: 'messageInfo',
      width: 280,
      fixed: 'left' as const,
      render: (_, record) => (
        <div>
          <Tooltip title={record.title}>
            <div className="font-medium text-sm mb-1 line-clamp-1">
              {record.title}
            </div>
          </Tooltip>
          <div className="flex items-center gap-2">
            {getTypeTag(record.type)}
            {getStatusTag(record.status)}
          </div>
        </div>
      )
    },
    {
      title: '接收者',
      key: 'recipientInfo',
      width: 150,
      render: (_, record) => (
        <div>
          <div className="text-sm mb-1">
            {record.recipientType === 'all' ? '所有用户' : (record.recipient || '-')}
          </div>
          <div className="text-xs text-gray-500">
            {getRecipientTypeText(record.recipientType)}
          </div>
        </div>
      )
    },
    {
      title: '时间信息',
      key: 'timeInfo',
      width: 160,
      render: (_, record) => (
        <div className="text-xs">
          <div className="mb-1">
            创建: {record.createTime ? formatDateTime(record.createTime).substring(5, 16) : '-'}
          </div>
          {record.sendTime && (
            <div className="text-gray-500">
              发送: {formatDateTime(record.sendTime).substring(5, 16)}
            </div>
          )}
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => viewMessageDetail(record.messageId)}
            className="action-btn"
          >
            详情
          </Button>
          <Popconfirm
            title="确定要删除此消息吗？"
            onConfirm={() => handleDelete(record.messageId)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              className="action-more-btn"
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="message-list-container">
      <Title level={2}>消息管理</Title>

      <Card className="filter-container" style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item name="title" label="标题">
            <Input placeholder="消息标题" allowClear />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Select placeholder="消息类型" style={{ width: 120 }} allowClear>
              <Option value="">全部</Option>
              <Option value="system">系统消息</Option>
              <Option value="order">订单消息</Option>
              <Option value="promotion">促销消息</Option>
              <Option value="notification">通知</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="消息状态" style={{ width: 120 }} allowClear>
              <Option value="">全部</Option>
              <Option value="sent">已发送</Option>
              <Option value="pending">待发送</Option>
              <Option value="failed">发送失败</Option>
              <Option value="draft">草稿</Option>
            </Select>
          </Form.Item>
          <Form.Item name="timeRange" label="时间范围">
            <RangePicker style={{ width: 240 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                查询
              </Button>
              <Button icon={<ReloadOutlined />} onClick={resetQuery}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            发送消息
          </Button>
        </div>

        <Table<MessageData>
          columns={columns}
          dataSource={messageList}
          rowKey="messageId"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: handlePageChange,
            onShowSizeChange: handleSizeChange
          }}
          scroll={{ x: 900 }}
          size="small"
        />
      </Card>

      {/* 消息详情对话框 */}
      <Modal
        title="消息详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
        className="message-detail-modal"
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Space direction="vertical" size="middle">
              <div className="loading-spinner" />
              <span>加载中...</span>
            </Space>
          </div>
        ) : messageDetail ? (
          <div className="message-detail-content">
            {/* 消息标题 */}
            <div className="detail-section">
              <Title level={4} style={{ marginBottom: 16 }}>
                {messageDetail.title}
              </Title>
            </div>

            {/* 消息信息 */}
            <div className="detail-section">
              <Card size="small" title="消息信息" style={{ marginBottom: 16 }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div className="detail-item">
                    <span className="detail-label">消息类型：</span>
                    {getTypeTag(messageDetail.type)}
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">消息状态：</span>
                    {getStatusTag(messageDetail.status)}
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">接收者类型：</span>
                    <span className="detail-value">{getRecipientTypeText(messageDetail.recipientType)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">接收者：</span>
                    <span className="detail-value">
                      {messageDetail.recipientType === 'all' ? '所有用户' : messageDetail.recipient || '-'}
                    </span>
                  </div>
                </Space>
              </Card>
            </div>

            {/* 时间信息 */}
            <div className="detail-section">
              <Card size="small" title="时间信息" style={{ marginBottom: 16 }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div className="detail-item">
                    <span className="detail-label">创建时间：</span>
                    <span className="detail-value">{formatDateTime(messageDetail.createTime)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">发送时间：</span>
                    <span className="detail-value">
                      {messageDetail.sendTime ? formatDateTime(messageDetail.sendTime) : '未发送'}
                    </span>
                  </div>
                </Space>
              </Card>
            </div>

            {/* 消息内容 */}
            <div className="detail-section">
              <Card size="small" title="消息内容">
                <div className="message-content">
                  {messageDetail.content || '暂无内容'}
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Space direction="vertical" size="middle">
              <ExclamationCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />
              <span>暂无数据</span>
            </Space>
          </div>
        )}
      </Modal>

      {/* 创建消息对话框 */}
      <Modal
        title="发送消息"
        open={createModalVisible}
        onOk={handleCreateMessage}
        onCancel={() => setCreateModalVisible(false)}
        width={700}
      >
        <Form
          form={messageForm}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="消息标题"
            rules={[
              { required: true, message: '请输入消息标题' },
              { max: 100, message: '标题不能超过100个字符' }
            ]}
          >
            <Input placeholder="请输入消息标题" />
          </Form.Item>

          <Form.Item
            name="type"
            label="消息类型"
            rules={[{ required: true, message: '请选择消息类型' }]}
          >
            <Select placeholder="请选择消息类型">
              <Option value="system">系统消息</Option>
              <Option value="order">订单消息</Option>
              <Option value="promotion">促销消息</Option>
              <Option value="notification">通知</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="recipientType"
            label="接收者类型"
            rules={[{ required: true, message: '请选择接收者类型' }]}
          >
            <Select
              placeholder="请选择接收者类型"
              onChange={(value) => {
                // 如果选择所有用户，清空接收者字段
                if (value === 'all') {
                  messageForm.setFieldsValue({ recipient: '' });
                }
              }}
            >
              <Option value="user">用户</Option>
              <Option value="admin">管理员</Option>
              <Option value="all">所有用户</Option>
              <Option value="group">用户组</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            dependencies={['recipientType']}
          >
            {({ getFieldValue }) => {
              const recipientType = getFieldValue('recipientType');
              return recipientType && recipientType !== 'all' ? (
                <Form.Item
                  name="recipient"
                  label="接收者"
                  rules={[{ required: true, message: '请输入接收者' }]}
                >
                  <Input placeholder="请输入接收者ID，多个ID用逗号分隔" />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>

          <Form.Item
            name="content"
            label="消息内容"
            rules={[
              { required: true, message: '请输入消息内容' },
              { max: 2000, message: '内容不能超过2000个字符' }
            ]}
          >
            <TextArea rows={6} placeholder="请输入消息内容" />
          </Form.Item>

          <Form.Item
            name="sendNow"
            valuePropName="checked"
            initialValue={true}
          >
            <Select
              placeholder="发送选项"
              defaultValue="now"
            >
              <Option value="now">立即发送</Option>
              <Option value="schedule">定时发送</Option>
              <Option value="draft">保存为草稿</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            dependencies={['sendNow']}
          >
            {({ getFieldValue }) => {
              const sendOption = getFieldValue('sendNow');
              return sendOption === 'schedule' ? (
                <Form.Item
                  name="scheduledTime"
                  label="定时发送时间"
                  rules={[{ required: true, message: '请选择发送时间' }]}
                >
                  <DatePicker
                    showTime
                    style={{ width: '100%' }}
                    placeholder="选择发送时间"
                  />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MessageList; 