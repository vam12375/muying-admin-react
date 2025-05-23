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
  InputNumber,
  Select,
  Tabs,
  Badge,
  Tag,
  Drawer,
  Descriptions,
  Divider,
  Alert,
  Radio,
  DatePicker,
  Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  HistoryOutlined, 
  InfoCircleOutlined,
  ReloadOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import { 
  fetchUserPointsList, 
  fetchPointsHistoryList,
  setPagination 
} from '@/store/slices/pointsSlice';
import { getUserPointsDetail, adjustUserPoints } from '@/api/points';
import { formatDateTime } from '@/utils/dateUtils';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// 定义用户积分数据类型
interface UserPointsData {
  userId: number;
  username: string;
  totalPoints: number;
  availablePoints: number;
  usedPoints: number;
  expiredPoints: number;
  lastUpdateTime: string;
  nextExpirePoints?: number;
  nextExpireDate?: string;
  registerDate?: string;
  level?: number;
  levelName?: string;
  levelPoints?: number;
  nextLevelPoints?: number;
}

// 定义用户积分历史记录类型
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
  expiryDate?: string;
}

const UserPointsManage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [adjustForm] = Form.useForm();
  
  // 从Redux获取状态
  const { userPointsList, historyList, pagination, loading } = useSelector((state: RootState) => state.points);
  
  // 本地状态
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserPointsData | null>(null);
  const [userPointsDetail, setUserPointsDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [historyPagination, setHistoryPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  
  // 初始加载
  useEffect(() => {
    fetchUserPoints();
  }, [dispatch, pagination.current, pagination.pageSize]);
  
  // 获取用户积分列表
  const fetchUserPoints = () => {
    const values = form.getFieldsValue();
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...values
    };
    dispatch(fetchUserPointsList(params));
  };
  
  // 获取用户积分历史
  const fetchUserPointsHistory = (userId: number) => {
    dispatch(fetchPointsHistoryList({
      userId,
      page: historyPagination.current,
      size: historyPagination.pageSize
    }));
  };
  
  // 处理搜索
  const handleSearch = () => {
    dispatch(setPagination({ current: 1 }));
    fetchUserPoints();
  };
  
  // 重置查询
  const resetQuery = () => {
    form.resetFields();
    dispatch(setPagination({ current: 1 }));
    fetchUserPoints();
  };
  
  // 处理页码变化
  const handlePageChange = (page: number, pageSize?: number) => {
    dispatch(setPagination({ current: page, pageSize }));
  };
  
  // 处理每页条数变化
  const handleSizeChange = (current: number, size: number) => {
    dispatch(setPagination({ current: 1, pageSize: size }));
  };
  
  // 打开积分历史抽屉
  const openHistoryDrawer = (record: UserPointsData) => {
    setCurrentUser(record);
    setHistoryDrawerVisible(true);
    
    // 重置历史分页并获取历史记录
    setHistoryPagination({
      ...historyPagination,
      current: 1
    });
    fetchUserPointsHistory(record.userId);
  };
  
  // 打开积分调整对话框
  const openAdjustModal = async (record: UserPointsData) => {
    setCurrentUser(record);
    setDetailLoading(true);
    
    try {
      // 获取用户积分详情
      const response = await getUserPointsDetail(record.userId);
      const userDetail = response.data;
      setUserPointsDetail(userDetail);
      
      // 设置表单初始值
      adjustForm.setFieldsValue({
        userId: userDetail.userId,
        username: userDetail.username,
        currentPoints: userDetail.availablePoints,
        adjustType: 'increase',
        points: 0,
        reason: '',
        expireDate: null
      });
      
      setAdjustModalVisible(true);
    } catch (error) {
      message.error('获取用户积分详情失败');
    } finally {
      setDetailLoading(false);
    }
  };
  
  // 确认调整积分
  const confirmAdjust = async () => {
    try {
      const values = await adjustForm.validateFields();
      if (!currentUser) return;
      
      const hide = message.loading('正在调整积分...', 0);
      try {
        await adjustUserPoints(currentUser.userId, {
          type: values.adjustType,
          points: values.points,
          reason: values.reason,
          expireDate: values.expireDate ? values.expireDate.format('YYYY-MM-DD') : undefined
        });
        hide();
        message.success('积分调整成功');
        setAdjustModalVisible(false);
        fetchUserPoints();
      } catch (error) {
        hide();
        message.error('积分调整失败');
      }
    } catch (error) {
      // 表单验证失败
    }
  };
  
  // 处理历史记录分页变化
  const handleHistoryPageChange = (page: number, pageSize?: number) => {
    const newPagination = {
      ...historyPagination,
      current: page,
      pageSize: pageSize || historyPagination.pageSize
    };
    setHistoryPagination(newPagination);
    
    if (currentUser) {
      fetchUserPointsHistory(currentUser.userId);
    }
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
  
  // 获取会员等级标签
  const getLevelTag = (level: number) => {
    const levelColors = ['default', 'blue', 'cyan', 'green', 'gold', 'orange'];
    const color = level <= 5 ? levelColors[level] : 'purple';
    return <Tag color={color}>Lv.{level}</Tag>;
  };
  
  // 表格列定义
  const columns: ColumnsType<UserPointsData> = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 80
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (text, record) => (
        <Space>
          <UserOutlined />
          {text}
          {record.level && getLevelTag(record.level)}
        </Space>
      )
    },
    {
      title: '总积分',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      width: 100
    },
    {
      title: '可用积分',
      dataIndex: 'availablePoints',
      key: 'availablePoints',
      width: 100,
      render: (points) => <span className="font-bold">{points}</span>
    },
    {
      title: '已使用积分',
      dataIndex: 'usedPoints',
      key: 'usedPoints',
      width: 100
    },
    {
      title: '已过期积分',
      dataIndex: 'expiredPoints',
      key: 'expiredPoints',
      width: 100
    },
    {
      title: '即将过期',
      key: 'expiring',
      width: 120,
      render: (_, record) => (
        record.nextExpirePoints && record.nextExpireDate ? (
          <Tooltip title={`将于 ${record.nextExpireDate} 过期`}>
            <Badge color="orange" text={`${record.nextExpirePoints}积分`} />
          </Tooltip>
        ) : '-'
      )
    },
    {
      title: '最后更新时间',
      dataIndex: 'lastUpdateTime',
      key: 'lastUpdateTime',
      width: 180,
      render: (time) => formatDateTime(time)
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => openAdjustModal(record)}
          >
            调整积分
          </Button>
          <Button 
            type="link" 
            icon={<HistoryOutlined />}
            onClick={() => openHistoryDrawer(record)}
          >
            积分历史
          </Button>
        </Space>
      )
    }
  ];
  
  // 积分历史表格列定义
  const historyColumns: ColumnsType<PointsHistoryData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
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
      title: '来源',
      dataIndex: 'sourceType',
      key: 'sourceType',
      width: 120,
      render: (sourceType, record) => (
        <span>
          {sourceType}
          {record.sourceId && <span> (ID: {record.sourceId})</span>}
        </span>
      )
    },
    {
      title: '时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time) => formatDateTime(time)
    },
    {
      title: '过期时间',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date) => date ? date : '永不过期'
    }
  ];
  
  return (
    <div className="user-points-container">
      <Title level={2}>用户积分管理</Title>
      
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
          <Form.Item name="minPoints" label="最低积分">
            <InputNumber placeholder="最低积分" min={0} />
          </Form.Item>
          <Form.Item name="level" label="会员等级">
            <Select placeholder="会员等级" style={{ width: 120 }} allowClear>
              <Option value="1">Lv.1</Option>
              <Option value="2">Lv.2</Option>
              <Option value="3">Lv.3</Option>
              <Option value="4">Lv.4</Option>
              <Option value="5">Lv.5</Option>
            </Select>
          </Form.Item>
          <Form.Item name="hasExpiring" label="即将过期" valuePropName="checked">
            <Select placeholder="即将过期" style={{ width: 120 }} allowClear>
              <Option value="true">有过期积分</Option>
            </Select>
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
        <Table<UserPointsData>
          columns={columns}
          dataSource={userPointsList}
          rowKey="userId"
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
      
      {/* 积分调整弹窗 */}
      <Modal
        title="积分调整"
        open={adjustModalVisible}
        onCancel={() => setAdjustModalVisible(false)}
        onOk={confirmAdjust}
        confirmLoading={detailLoading}
        maskClosable={false}
        width={600}
      >
        <Form 
          form={adjustForm} 
          layout="vertical"
        >
          <div className="user-info mb-4">
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="用户ID" span={1}>
                {userPointsDetail?.userId}
              </Descriptions.Item>
              <Descriptions.Item label="用户名" span={1}>
                {userPointsDetail?.username}
              </Descriptions.Item>
              <Descriptions.Item label="当前积分" span={2}>
                <span className="text-xl font-bold">
                  {userPointsDetail?.availablePoints || 0}
                </span>
              </Descriptions.Item>
              {userPointsDetail?.level && (
                <Descriptions.Item label="会员等级" span={2}>
                  {getLevelTag(userPointsDetail.level)}
                  <span className="ml-2">{userPointsDetail.levelName}</span>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
          
          <Divider />
          
          <Form.Item
            name="adjustType"
            label="调整类型"
            rules={[{ required: true, message: '请选择调整类型' }]}
          >
            <Radio.Group>
              <Radio value="increase">增加积分</Radio>
              <Radio value="decrease">减少积分</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="points"
            label="调整积分"
            rules={[
              { required: true, message: '请输入调整积分' },
              { type: 'number', min: 1, message: '调整积分必须大于0' }
            ]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              placeholder="请输入调整积分数量"
              min={1}
            />
          </Form.Item>
          
          <Form.Item
            name="reason"
            label="调整原因"
            rules={[{ required: true, message: '请输入调整原因' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="请输入积分调整原因" 
              maxLength={200}
            />
          </Form.Item>
          
          <Form.Item
            name="expireDate"
            label="过期时间"
            tooltip="如果设置，则这批积分将在指定日期过期，不设置则永不过期"
          >
            <DatePicker 
              placeholder="请选择过期时间（可选）" 
              style={{ width: '100%' }} 
            />
          </Form.Item>
          
          <Alert 
            message="积分调整说明" 
            description={
              <>
                <p>1. 减少积分时，若用户可用积分不足，则操作将失败</p>
                <p>2. 积分调整会记录在用户的积分历史中</p>
                <p>3. 可以设置积分过期时间，如不设置则永不过期</p>
              </>
            }
            type="info" 
            showIcon 
          />
        </Form>
      </Modal>
      
      {/* 积分历史抽屉 */}
      <Drawer
        title={currentUser ? `${currentUser.username} 的积分历史` : '积分历史'}
        placement="right"
        width={800}
        onClose={() => setHistoryDrawerVisible(false)}
        open={historyDrawerVisible}
      >
        {currentUser && (
          <>
            <div className="mb-4">
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="用户ID">{currentUser.userId}</Descriptions.Item>
                <Descriptions.Item label="用户名">{currentUser.username}</Descriptions.Item>
                <Descriptions.Item label="可用积分">{currentUser.availablePoints}</Descriptions.Item>
                <Descriptions.Item label="总积分">{currentUser.totalPoints}</Descriptions.Item>
              </Descriptions>
            </div>
            
            <Table<PointsHistoryData>
              columns={historyColumns}
              dataSource={historyList}
              rowKey="id"
              loading={loading}
              pagination={{
                current: historyPagination.current,
                pageSize: historyPagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条记录`,
                onChange: handleHistoryPageChange
              }}
              scroll={{ x: 1000, y: 500 }}
            />
          </>
        )}
      </Drawer>
    </div>
  );
};

export default UserPointsManage; 