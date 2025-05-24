import React from 'react';
import { Card, Typography, Alert, Button, List, Space, Tag } from 'antd';
import { PlusOutlined, FileOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

/**
 * 自定义报表页面（占位符）
 * 实际功能将在后续开发
 */
const CustomReports: React.FC = () => {
  // 模拟的报表列表数据
  const mockReports = [
    {
      id: '1',
      name: '销售概览报表',
      description: '展示销售额、订单数等关键指标的概览报表',
      type: 'sales',
      createdBy: 'admin',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: '用户增长报表',
      description: '展示用户注册、活跃等数据的报表',
      type: 'users',
      createdBy: 'admin',
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z'
    },
    {
      id: '3',
      name: '商品销量报表',
      description: '展示各商品销量、库存等数据的报表',
      type: 'products',
      createdBy: 'admin',
      createdAt: '2023-01-03T00:00:00Z',
      updatedAt: '2023-01-03T00:00:00Z'
    }
  ];
  
  // 根据报表类型获取标签颜色
  const getTagColor = (type: string) => {
    switch (type) {
      case 'sales':
        return 'blue';
      case 'users':
        return 'purple';
      case 'products':
        return 'green';
      case 'custom':
        return 'orange';
      default:
        return 'default';
    }
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  return (
    <div className="custom-reports-container">
      <div className="mb-4 flex justify-between items-center">
        <Title level={4} className="m-0">自定义报表</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          创建报表
        </Button>
      </div>
      
      <Alert
        message="功能开发中"
        description="自定义报表功能正在开发中，目前仅展示模拟数据，敬请期待完整功能！"
        type="info"
        showIcon
        className="mb-4"
      />
      
      <Card>
        <List
          itemLayout="horizontal"
          dataSource={mockReports}
          renderItem={item => (
            <List.Item
              actions={[
                <Button type="text" icon={<EditOutlined />}>编辑</Button>,
                <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
              ]}
            >
              <List.Item.Meta
                avatar={<FileOutlined style={{ fontSize: 24 }} />}
                title={
                  <Space>
                    {item.name}
                    <Tag color={getTagColor(item.type)}>
                      {{
                        'sales': '销售',
                        'users': '用户',
                        'products': '商品',
                        'custom': '自定义'
                      }[item.type] || '其他'}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical">
                    <span>{item.description}</span>
                    <Space size="large">
                      <span>创建人: {item.createdBy}</span>
                      <span>创建时间: {formatDate(item.createdAt)}</span>
                      <span>更新时间: {formatDate(item.updatedAt)}</span>
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
      
      <div className="mt-6">
        <Card>
          <Title level={5}>自定义报表功能说明</Title>
          <Paragraph>
            自定义报表功能将支持以下特性：
          </Paragraph>
          
          <ul className="list-disc pl-8 space-y-2">
            <li>拖拽式报表设计器，可视化配置报表</li>
            <li>多种图表类型支持，包括折线图、柱状图、饼图等</li>
            <li>自定义指标计算和数据筛选</li>
            <li>报表模板保存和复用</li>
            <li>报表导出为Excel、PDF、CSV等格式</li>
            <li>定时生成报表并自动推送</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default CustomReports; 