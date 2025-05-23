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
  Tag,
  Tabs,
  Modal,
  Statistic,
  Row,
  Col,
  Divider
} from 'antd';
import { SearchOutlined, ReloadOutlined, BarChartOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import { 
  fetchPointsHistoryList, 
  fetchPointsOperationLogs,
  fetchPointsStats,
  setPagination 
} from '@/store/slices/pointsSlice';
import { formatDateTime } from '@/utils/dateUtils';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

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

// 定义积分操作日志数据类型
interface PointsOperationData {
  id: number;
  userId: number;
  username: string;
  operationType: string;
  pointsChange: number;
  currentBalance: number;
  description: string;
  relatedOrderId: string;
  createTime: string;
}

const PointsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  
  // 从Redux获取状态
  const { historyList, operationList, statsData, pagination, loading } = useSelector((state: RootState) => state.points);
  
  // 本地状态
  const [activeTab, setActiveTab] = useState<string>('history');
  const [statsModalVisible, setStatsModalVisible] = useState<boolean>(false);
  
  // 初始加载
  useEffect(() => {
    fetchData();
  }, [dispatch, pagination.current, pagination.pageSize, activeTab]);
  
  // 获取数据
  const fetchData = () => {
    const values = form.getFieldsValue();
    const params = {
      page: pagination.current,
      size: pagination.pageSize,
      ...values,
      // 处理日期范围
      startDate: values.timeRange && values.timeRange[0] ? values.timeRange[0].format('YYYY-MM-DD') : undefined,
      endDate: values.timeRange && values.timeRange[1] ? values.timeRange[1].format('YYYY-MM-DD') : undefined
    };
    
    // 移除timeRange字段
    if (params.timeRange) {
      delete params.timeRange;
    }
    
    if (activeTab === 'history') {
      dispatch(fetchPointsHistoryList(params));
    } else {
      dispatch(fetchPointsOperationLogs(params));
    }
  };
  
  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    dispatch(setPagination({ current: 1 }));
  };
  
  // 处理搜索
  const handleSearch = () => {
    dispatch(setPagination({ current: 1 }));
    fetchData();
  };
  
  // 重置查询
  const resetQuery = () => {
    form.resetFields();
    dispatch(setPagination({ current: 1 }));
    fetchData();
  };
  
  // 处理页码变化
  const handlePageChange = (page: number, pageSize?: number) => {
    dispatch(setPagination({ current: page, pageSize }));
  };
  
  // 处理每页条数变化
  const handleSizeChange = (current: number, size: number) => {
    dispatch(setPagination({ current: 1, pageSize: size }));
  };
  
  // 打开统计数据弹窗
  const showStatsModal = () => {
    dispatch(fetchPointsStats({}));
    setStatsModalVisible(true);
  };
  
  // 导出Excel
  const exportExcel = () => {
    // 实现导出Excel功能
    console.log('Export Excel');
  };
  
  // 获取积分类型标签
  const getPointsTypeTag = (type: string) => {
    switch (type) {
      case 'earn':
      case 'increase':
        return <Tag color="success">增加</Tag>;
      case 'spend':
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
      case 'signin':
      case 'sign_in':
        return '签到';
      case 'review':
        return '评论';
      case 'register':
        return '注册';
      case 'exchange':
        return '积分兑换';
      case 'admin':
        return '管理员操作';
      case 'activity':
        return '活动';
      default:
        return sourceType;
    }
  };
  
  // 获取操作类型标签
  const getOperationTypeTag = (type: string) => {
    switch (type) {
      case 'SIGN_IN':
        return <Tag color="success">签到</Tag>;
      case 'ORDER_REWARD':
        return <Tag color="processing">订单奖励</Tag>;
      case 'EXCHANGE_PRODUCT':
        return <Tag color="warning">商品兑换</Tag>;
      case 'ADMIN_ADJUSTMENT':
        return <Tag color="default">管理员调整</Tag>;
      case 'EVENT_REWARD':
        return <Tag color="success">活动奖励</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };
  
  // 积分历史表格列定义
  const historyColumns: ColumnsType<PointsHistoryData> = [
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
  
  // 积分操作日志表格列定义
  const operationColumns: ColumnsType<PointsOperationData> = [
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
      title: '操作类型',
      dataIndex: 'operationType',
      key: 'operationType',
      width: 150,
      render: (type) => getOperationTypeTag(type)
    },
    {
      title: '积分变动',
      dataIndex: 'pointsChange',
      key: 'pointsChange',
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
      title: '当前余额',
      dataIndex: 'currentBalance',
      key: 'currentBalance',
      width: 120
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200
    },
    {
      title: '关联订单',
      dataIndex: 'relatedOrderId',
      key: 'relatedOrderId',
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
              <Option value="earn">增加</Option>
              <Option value="spend">减少</Option>
            </Select>
          </Form.Item>
          <Form.Item name="sourceType" label="来源类型">
            <Select placeholder="来源类型" style={{ width: 120 }} allowClear>
              <Option value="order">订单</Option>
              <Option value="signin">签到</Option>
              <Option value="review">评论</Option>
              <Option value="register">注册</Option>
              <Option value="exchange">积分兑换</Option>
              <Option value="admin">管理员操作</Option>
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
              <Button icon={<BarChartOutlined />} onClick={showStatsModal}>
                统计
              </Button>
              <Button icon={<FileExcelOutlined />} onClick={exportExcel}>
                导出
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      
      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="积分历史记录" key="history">
            <Table<PointsHistoryData>
              columns={historyColumns}
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
            />
          </TabPane>
          <TabPane tab="积分操作日志" key="operation">
            <Table<PointsOperationData>
              columns={operationColumns}
              dataSource={operationList}
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
            />
          </TabPane>
        </Tabs>
      </Card>
      
      {/* 积分统计弹窗 */}
      <Modal
        title="积分统计"
        visible={statsModalVisible}
        onCancel={() => setStatsModalVisible(false)}
        footer={null}
        width={800}
      >
        {statsData && (
          <>
            <Row gutter={24}>
              <Col span={6}>
                <Statistic title="今日积分发放" value={statsData.todayEarned || 0} />
              </Col>
              <Col span={6}>
                <Statistic title="今日积分消费" value={statsData.todaySpent || 0} />
              </Col>
              <Col span={6}>
                <Statistic title="总积分发放" value={statsData.totalEarned || 0} />
              </Col>
              <Col span={6}>
                <Statistic title="总积分消费" value={statsData.totalSpent || 0} />
              </Col>
            </Row>
            <Divider />
            <Row gutter={24}>
              <Col span={8}>
                <Statistic title="签到积分发放" value={statsData.signinPoints || 0} />
              </Col>
              <Col span={8}>
                <Statistic title="订单积分发放" value={statsData.orderPoints || 0} />
              </Col>
              <Col span={8}>
                <Statistic title="兑换积分消费" value={statsData.exchangePoints || 0} />
              </Col>
            </Row>
          </>
        )}
      </Modal>
    </div>
  );
};

export default PointsList; 