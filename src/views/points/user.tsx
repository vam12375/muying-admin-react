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
  Select
} from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import { 
  fetchUserPointsList, 
  setPagination 
} from '@/store/slices/pointsSlice';
import { getUserPointsDetail, adjustUserPoints } from '@/api/points';
import { formatDateTime } from '@/utils/dateUtils';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 定义用户积分数据类型
interface UserPointsData {
  userId: number;
  username: string;
  totalPoints: number;
  availablePoints: number;
  usedPoints: number;
  expiredPoints: number;
  lastUpdateTime: string;
}

const UserPointsManage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [adjustForm] = Form.useForm();
  
  // 从Redux获取状态
  const { userPointsList, pagination, loading } = useSelector((state: RootState) => state.points);
  
  // 本地状态
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserPointsData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
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
  
  // 打开积分调整对话框
  const openAdjustModal = async (record: UserPointsData) => {
    setCurrentUser(record);
    setDetailLoading(true);
    
    try {
      // 获取用户积分详情
      const response = await getUserPointsDetail(record.userId);
      const userDetail = response.data;
      
      // 设置表单初始值
      adjustForm.setFieldsValue({
        userId: userDetail.userId,
        username: userDetail.username,
        currentPoints: userDetail.availablePoints,
        adjustType: 'increase',
        points: 0,
        reason: ''
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
          reason: values.reason
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
  
  // 表格列定义
  const columns: ColumnsType<UserPointsData> = [
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
      title: '总积分',
      dataIndex: 'totalPoints',
      key: 'totalPoints',
      width: 100
    },
    {
      title: '可用积分',
      dataIndex: 'availablePoints',
      key: 'availablePoints',
      width: 100
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
      width: 120,
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EditOutlined />} 
          onClick={() => openAdjustModal(record)}
        >
          调整积分
        </Button>
      )
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
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                查询
              </Button>
              <Button onClick={resetQuery}>重置</Button>
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
          scroll={{ x: 1000 }}
        />
      </Card>
      
      {/* 调整积分对话框 */}
      <Modal
        title="调整用户积分"
        open={adjustModalVisible}
        onOk={confirmAdjust}
        onCancel={() => setAdjustModalVisible(false)}
        width={500}
        confirmLoading={detailLoading}
      >
        <Form
          form={adjustForm}
          layout="vertical"
        >
          <Form.Item label="用户ID">
            <span>{currentUser?.userId}</span>
          </Form.Item>
          <Form.Item label="用户名">
            <span>{currentUser?.username}</span>
          </Form.Item>
          <Form.Item label="当前可用积分">
            <span>{currentUser?.availablePoints}</span>
          </Form.Item>
          <Form.Item
            name="adjustType"
            label="调整类型"
            rules={[{ required: true, message: '请选择调整类型' }]}
          >
            <Select placeholder="请选择调整类型">
              <Option value="increase">增加</Option>
              <Option value="decrease">减少</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="points"
            label="调整积分"
            rules={[
              { required: true, message: '请输入调整积分' },
              { type: 'number', min: 1, message: '积分必须大于0' }
            ]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="请输入调整积分" />
          </Form.Item>
          <Form.Item
            name="reason"
            label="调整原因"
            rules={[{ required: true, message: '请输入调整原因' }]}
          >
            <TextArea rows={3} placeholder="请输入调整原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserPointsManage; 