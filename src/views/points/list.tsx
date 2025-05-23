import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Input, 
  Space, 
  Form, 
  Select, 
  DatePicker, 
  Typography,
  Tag
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import { 
  fetchPointsHistoryList, 
  setPagination 
} from '@/store/slices/pointsSlice';
import { formatDateTime } from '@/utils/dateUtils';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 定义积分历史数据类型
interface PointsHistoryData {
  id: number;
  userId: number;
  username: string;
  points: number;
  type: string;
  description: string;
  sourceType: string;
  sourceId: string;
  createTime: string;
}

const PointsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  
  // 从Redux获取状态
  const { historyList, pagination, loading } = useSelector((state: RootState) => state.points);
  
  // 初始加载
  useEffect(() => {
    fetchHistoryData();
  }, [dispatch, pagination.current, pagination.pageSize]);
  
  // 获取积分历史列表
  const fetchHistoryData = () => {
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
    
    dispatch(fetchPointsHistoryList(params));
  };
  
  // 处理搜索
  const handleSearch = () => {
    dispatch(setPagination({ current: 1 }));
    fetchHistoryData();
  };
  
  // 重置查询
  const resetQuery = () => {
    form.resetFields();
    dispatch(setPagination({ current: 1 }));
    fetchHistoryData();
  };
  
  // 处理页码变化
  const handlePageChange = (page: number, pageSize?: number) => {
    dispatch(setPagination({ current: page, pageSize }));
  };
  
  // 处理每页条数变化
  const handleSizeChange = (current: number, size: number) => {
    dispatch(setPagination({ current: 1, pageSize: size }));
  };
  
  // 获取积分类型标签
  const getPointsTypeTag = (type: string) => {
    switch (type) {
      case 'increase':
        return <Tag color="success">增加</Tag>;
      case 'decrease':
        return <Tag color="error">减少</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };
  
  // 获取积分来源类型文本
  const getSourceTypeText = (sourceType: string) => {
    switch (sourceType) {
      case 'order':
        return '订单';
      case 'sign_in':
        return '签到';
      case 'activity':
        return '活动';
      case 'admin':
        return '管理员操作';
      case 'exchange':
        return '积分兑换';
      default:
        return sourceType;
    }
  };
  
  // 表格列定义
  const columns: ColumnsType<PointsHistoryData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150
    },
    {
      title: '积分变动',
      dataIndex: 'points',
      key: 'points',
      width: 100,
      render: (points) => {
        const isIncrease = points > 0;
        return (
          <span style={{ color: isIncrease ? '#52c41a' : '#f5222d' }}>
            {isIncrease ? '+' : ''}{points}
          </span>
        );
      }
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => getPointsTypeTag(type)
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200
    },
    {
      title: '来源类型',
      dataIndex: 'sourceType',
      key: 'sourceType',
      width: 120,
      render: (sourceType) => getSourceTypeText(sourceType)
    },
    {
      title: '来源ID',
      dataIndex: 'sourceId',
      key: 'sourceId',
      width: 120
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time) => formatDateTime(time)
    }
  ];
  
  return (
    <div className="points-list-container">
      <Title level={2}>积分历史</Title>
      
      <Card className="filter-container" style={{ marginBottom: 16 }}>
        <Form 
          form={form} 
          layout="inline" 
          onFinish={handleSearch}
        >
          <Form.Item name="userId" label="用户ID">
            <Input placeholder="用户ID" allowClear />
          </Form.Item>
          <Form.Item name="username" label="用户名">
            <Input placeholder="用户名" allowClear />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Select placeholder="类型" style={{ width: 120 }} allowClear>
              <Option value="">全部</Option>
              <Option value="increase">增加</Option>
              <Option value="decrease">减少</Option>
            </Select>
          </Form.Item>
          <Form.Item name="sourceType" label="来源类型">
            <Select placeholder="来源类型" style={{ width: 120 }} allowClear>
              <Option value="">全部</Option>
              <Option value="order">订单</Option>
              <Option value="sign_in">签到</Option>
              <Option value="activity">活动</Option>
              <Option value="admin">管理员操作</Option>
              <Option value="exchange">积分兑换</Option>
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
        <Table<PointsHistoryData>
          columns={columns}
          dataSource={historyList}
          rowKey="id"
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
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default PointsList; 