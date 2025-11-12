import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Form,
  Typography,
  Tag,
  Statistic,
  Row,
  Col,
  Modal,
  message
} from 'antd';
import { SearchOutlined, ReloadOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getUserPointsList, adjustUserPoints, type UserPointsData } from '@/api/points';
import { formatDateTime } from '@/utils/dateUtils';

const { Title } = Typography;

const UserPointsManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [adjustForm] = Form.useForm();

  // 状态管理
  const [dataSource, setDataSource] = useState<UserPointsData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [adjustModalVisible, setAdjustModalVisible] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserPointsData | null>(null);

  // 初始加载
  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);

  // 获取数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const params = {
        page: pagination.current,
        size: pagination.pageSize,
        userId: values.userId || undefined
      };

      const response = await getUserPointsList(params);

      if (response.code === 200 && response.data) {
        setDataSource(response.data.records || []);
        setPagination({
          ...pagination,
          total: response.data.total || 0
        });
      }
    } catch (error) {
      console.error('获取用户积分列表失败:', error);
      message.error('获取用户积分列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchData();
  };

  // 重置查询
  const resetQuery = () => {
    form.resetFields();
    setPagination({ ...pagination, current: 1 });
    fetchData();
  };

  // 处理页码变化
  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize: pageSize || pagination.pageSize
    });
  };

  // 打开调整积分弹窗
  const showAdjustModal = (record: UserPointsData) => {
    setSelectedUser(record);
    adjustForm.resetFields();
    setAdjustModalVisible(true);
  };

  // 处理积分调整
  const handleAdjustPoints = async () => {
    try {
      const values = await adjustForm.validateFields();

      if (!selectedUser) {
        return;
      }

      await adjustUserPoints(selectedUser.userId, values);

      message.success('积分调整成功');
      setAdjustModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('调整积分失败:', error);
      message.error('调整积分失败');
    }
  };

  // 获取会员等级标签
  const getLevelTag = (level: string) => {
    const levelMap: Record<string, { color: string; text: string }> = {
      '普通会员': { color: 'default', text: '普通' },
      '银牌会员': { color: 'processing', text: '银牌' },
      '金牌会员': { color: 'warning', text: '金牌' },
      '钻石会员': { color: 'success', text: '钻石' }
    };

    const levelInfo = levelMap[level] || { color: 'default', text: level };
    return <Tag color={levelInfo.color}>{levelInfo.text}</Tag>;
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
      dataIndex: ['user', 'username'],
      key: 'username',
      width: 150,
      render: (_, record) => record.user?.username || '-'
    },
    {
      title: '会员等级',
      dataIndex: 'level',
      key: 'level',
      width: 120,
      render: (level) => getLevelTag(level)
    },
    {
      title: '总积分',
      dataIndex: 'points',
      key: 'points',
      width: 100,
      render: (points) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          {points || 0}
        </span>
      )
    },
    {
      title: '可用积分',
      dataIndex: 'availablePoints',
      key: 'availablePoints',
      width: 100,
      render: (availablePoints) => (
        <span style={{ color: '#52c41a' }}>
          {availablePoints || 0}
        </span>
      )
    },
    {
      title: '已获得',
      dataIndex: 'totalEarned',
      key: 'totalEarned',
      width: 100,
      render: (totalEarned) => (
        <span style={{ color: '#52c41a' }}>
          +{totalEarned || 0}
        </span>
      )
    },
    {
      title: '已使用',
      dataIndex: 'totalUsed',
      key: 'totalUsed',
      width: 100,
      render: (totalUsed) => (
        <span style={{ color: '#ff4d4f' }}>
          -{totalUsed || 0}
        </span>
      )
    },
    {
      title: '已过期',
      dataIndex: 'expiredPoints',
      key: 'expiredPoints',
      width: 100,
      render: (expiredPoints) => (
        <span style={{ color: '#999' }}>
          {expiredPoints || 0}
        </span>
      )
    },
    {
      title: '即将过期',
      dataIndex: 'expiringSoonPoints',
      key: 'expiringSoonPoints',
      width: 100,
      render: (expiringSoonPoints) => {
        const points = expiringSoonPoints || 0;
        return (
          <span style={{ color: points > 0 ? '#faad14' : '#999' }}>
            {points}
          </span>
        );
      }
    },
    {
      title: '最后更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
      render: (time) => formatDateTime(time)
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => showAdjustModal(record)}
          >
            调整
          </Button>
        </Space>
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
            <Input placeholder="请输入用户ID" allowClear style={{ width: 200 }} />
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
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          size="small"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: handlePageChange,
            onShowSizeChange: handlePageChange
          }}
        />
      </Card>

      {/* 调整积分弹窗 */}
      <Modal
        title="调整用户积分"
        open={adjustModalVisible}
        onOk={handleAdjustPoints}
        onCancel={() => setAdjustModalVisible(false)}
        width={600}
      >
        {selectedUser && (
          <>
            <Row gutter={24} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Statistic
                  title="用户名"
                  value={selectedUser.user?.username || '-'}
                  valueStyle={{ fontSize: 16 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="当前积分"
                  value={selectedUser.points || 0}
                  valueStyle={{ fontSize: 16, color: '#1890ff' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="会员等级"
                  value={selectedUser.level || '-'}
                  valueStyle={{ fontSize: 16 }}
                />
              </Col>
            </Row>

            <Form
              form={adjustForm}
              layout="vertical"
            >
              <Form.Item
                name="type"
                label="调整类型"
                rules={[{ required: true, message: '请选择调整类型' }]}
              >
                <Space>
                  <Button
                    type={adjustForm.getFieldValue('type') === 'increase' ? 'primary' : 'default'}
                    onClick={() => adjustForm.setFieldsValue({ type: 'increase' })}
                  >
                    增加积分
                  </Button>
                  <Button
                    type={adjustForm.getFieldValue('type') === 'decrease' ? 'primary' : 'default'}
                    onClick={() => adjustForm.setFieldsValue({ type: 'decrease' })}
                  >
                    减少积分
                  </Button>
                </Space>
              </Form.Item>

              <Form.Item
                name="points"
                label="积分数量"
                rules={[
                  { required: true, message: '请输入积分数量' },
                  { type: 'number', min: 1, message: '积分数量必须大于0' }
                ]}
              >
                <Input type="number" placeholder="请输入积分数量" />
              </Form.Item>

              <Form.Item
                name="reason"
                label="调整原因"
                rules={[{ required: true, message: '请输入调整原因' }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="请输入调整原因，如：活动奖励、订单补偿等"
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default UserPointsManagement;
