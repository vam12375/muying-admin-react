import React, { useState } from 'react';
import { Card, Typography, Alert, Calendar, Badge, Segmented, Button, Modal, Form, Input, Select, DatePicker, Radio, Space, Tooltip } from 'antd';
import { PlusOutlined, CalendarOutlined, UnorderedListOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { Moment } from 'moment';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import type { Content } from '@/api/content';
import { contentApi } from '@/api/content';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * 内容日历页面（占位符）
 * 实际功能将在后续开发
 */
const ContentCalendar: React.FC = () => {
  // 状态定义
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [contentItems, setContentItems] = useState<Content[]>([]);
  const [form] = Form.useForm();
  
  // 模拟内容数据
  const mockContentItems: Content[] = [
    {
      id: '1',
      title: '新品上线: 有机奶粉',
      type: 'article',
      status: 'published',
      content: '这是关于新品上线的文章内容...',
      author: 'admin',
      createdAt: '2023-05-10T10:00:00Z',
      updatedAt: '2023-05-10T10:00:00Z',
      publishedAt: '2023-05-10T10:00:00Z'
    },
    {
      id: '2',
      title: '618活动预告',
      type: 'article',
      status: 'scheduled',
      content: '这是关于618活动的预告文章...',
      author: 'admin',
      createdAt: '2023-05-15T10:00:00Z',
      updatedAt: '2023-05-15T10:00:00Z',
      scheduledAt: '2023-06-01T00:00:00Z'
    },
    {
      id: '3',
      title: '夏季母婴护理指南',
      type: 'article',
      status: 'draft',
      content: '这是关于夏季母婴护理的指南文章...',
      author: 'admin',
      createdAt: '2023-05-20T10:00:00Z',
      updatedAt: '2023-05-20T10:00:00Z'
    }
  ];
  
  // 获取内容数据
  React.useEffect(() => {
    // 使用模拟数据
    setContentItems(mockContentItems);
  }, []);
  
  // 打开创建内容弹窗
  const showCreateModal = (date?: dayjs.Dayjs) => {
    setSelectedDate(date || null);
    
    // 如果有选中日期，设置表单的预设发布日期
    if (date) {
      form.setFieldsValue({
        scheduledAt: date
      });
    }
    
    setIsModalVisible(true);
  };
  
  // 关闭弹窗
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };
  
  // 提交创建内容表单
  const handleSubmit = () => {
    form.validateFields().then(values => {
      console.log('创建内容:', values);
      
      // 这里只是模拟创建成功
      const newContent: Content = {
        id: `temp-${Date.now()}`,
        title: values.title,
        type: values.type,
        status: values.status,
        content: values.content || '',
        author: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scheduledAt: values.status === 'scheduled' ? values.scheduledAt.toISOString() : undefined,
        publishedAt: values.status === 'published' ? new Date().toISOString() : undefined
      };
      
      // 更新状态，添加新内容
      setContentItems([...contentItems, newContent]);
      
      // 关闭弹窗
      setIsModalVisible(false);
      form.resetFields();
    });
  };
  
  // 日期单元格渲染
  const dateCellRender = (date: Moment) => {
    const dateStr = date.format('YYYY-MM-DD');
    
    // 过滤出当天的内容
    const items = contentItems.filter(item => {
      const itemDate = item.scheduledAt || item.publishedAt || item.createdAt;
      return itemDate.substring(0, 10) === dateStr;
    });
    
    return (
      <ul className="events p-0 m-0 list-none">
        {items.map(item => (
          <li key={item.id} className="mb-1">
            <Badge
              status={
                item.status === 'published' ? 'success' :
                item.status === 'scheduled' ? 'processing' :
                item.status === 'draft' ? 'default' : 'warning'
              }
              text={
                <Tooltip title={item.title}>
                  <Text ellipsis style={{ maxWidth: '100%' }}>{item.title}</Text>
                </Tooltip>
              }
            />
          </li>
        ))}
      </ul>
    );
  };
  
  // 日期头部渲染
  const dateFullCellRender = (date: Moment) => {
    return (
      <div className="calendar-date-cell">
        <div className="date-header p-1">
          <div className="date-number">{date.date()}</div>
        </div>
        <div className="date-content p-1">
          {dateCellRender(date)}
        </div>
      </div>
    );
  };
  
  // 日期选择处理
  const onDateSelect = (date: Moment) => {
    showCreateModal(dayjs(date.toISOString()));
  };
  
  return (
    <div className="content-calendar-container">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-4 flex justify-between items-center">
          <Title level={4} className="m-0">内容日历</Title>
          
          <Space>
            <Segmented
              options={[
                {
                  value: 'calendar',
                  icon: <CalendarOutlined />,
                  label: '日历视图'
                },
                {
                  value: 'list',
                  icon: <UnorderedListOutlined />,
                  label: '列表视图'
                }
              ]}
              value={viewMode}
              onChange={(value) => setViewMode(value as 'calendar' | 'list')}
            />
            
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => showCreateModal()}
            >
              创建内容
            </Button>
          </Space>
        </div>
        
        <Alert
          message="功能开发中"
          description="内容日历功能正在开发中，目前仅展示基础界面和模拟数据，敬请期待完整功能！"
          type="info"
          showIcon
          className="mb-4"
        />
        
        {/* 日历视图 */}
        {viewMode === 'calendar' && (
          <Card>
            <Calendar 
              dateCellRender={dateCellRender}
              onSelect={onDateSelect}
            />
          </Card>
        )}
        
        {/* 列表视图 - 占位 */}
        {viewMode === 'list' && (
          <Card>
            <div className="flex justify-center items-center py-12">
              <Text type="secondary">列表视图正在开发中...</Text>
            </div>
          </Card>
        )}
        
        {/* 创建内容弹窗 */}
        <Modal
          title="创建内容"
          open={isModalVisible}
          onCancel={handleCancel}
          onOk={handleSubmit}
          width={700}
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="title"
              label="标题"
              rules={[{ required: true, message: '请输入标题' }]}
            >
              <Input placeholder="请输入内容标题" />
            </Form.Item>
            
            <Form.Item
              name="type"
              label="内容类型"
              rules={[{ required: true, message: '请选择内容类型' }]}
              initialValue="article"
            >
              <Select>
                <Option value="article">文章</Option>
                <Option value="banner">Banner</Option>
                <Option value="page">页面</Option>
                <Option value="product_description">商品描述</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
              initialValue="draft"
            >
              <Radio.Group>
                <Radio value="draft">草稿</Radio>
                <Radio value="published">已发布</Radio>
                <Radio value="scheduled">定时发布</Radio>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item
              name="scheduledAt"
              label="计划发布时间"
              dependencies={['status']}
              rules={[
                ({ getFieldValue }) => ({
                  required: getFieldValue('status') === 'scheduled',
                  message: '请选择计划发布时间'
                })
              ]}
            >
              <DatePicker showTime />
            </Form.Item>
            
            <Form.Item
              name="content"
              label="内容摘要"
            >
              <TextArea rows={4} placeholder="请输入内容摘要" />
            </Form.Item>
          </Form>
        </Modal>
      </motion.div>
    </div>
  );
};

export default ContentCalendar; 