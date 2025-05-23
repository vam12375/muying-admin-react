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
  Tabs,
  Tooltip,
  Popconfirm,
  Statistic,
  Row,
  Col,
  Divider
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  EditOutlined,
  ClearOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import { 
  fetchRedisKeys, 
  fetchRedisInfo,
  getRedisValue,
  setRedisValue,
  deleteRedisKey,
  clearRedisDb,
  setPagination 
} from '@/store/slices/systemSlice';
import { formatDateTime, formatDuration } from '@/utils/dateUtils';

const { Title } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Search } = Input;
const { confirm } = Modal;

// 定义Redis键数据类型
interface RedisKeyData {
  key: string;
  type: string;
  ttl: number;
  size: number;
}

// 定义Redis信息数据类型
interface RedisInfoData {
  version: string;
  uptime: number;
  connectedClients: number;
  usedMemory: number;
  usedMemoryPeak: number;
  totalKeys: number;
  dbSize: number;
  lastSave: number;
}

const RedisManage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  
  // 从Redux获取状态
  const { redisKeys, redisInfo, redisValue, pagination, loading } = useSelector((state: RootState) => state.system);
  
  // 本地状态
  const [valueModalVisible, setValueModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentKey, setCurrentKey] = useState('');
  const [valueForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('keys');
  
  // 初始加载
  useEffect(() => {
    if (activeTab === 'keys') {
      fetchKeys();
    } else if (activeTab === 'info') {
      fetchInfo();
    }
  }, [dispatch, activeTab, pagination.current, pagination.pageSize]);
  
  // 获取Redis键列表
  const fetchKeys = () => {
    const values = form.getFieldsValue();
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      pattern: values.pattern || '*'
    };
    dispatch(fetchRedisKeys(params));
  };
  
  // 获取Redis信息
  const fetchInfo = () => {
    dispatch(fetchRedisInfo());
  };
  
  // 处理搜索
  const handleSearch = () => {
    dispatch(setPagination({ current: 1 }));
    fetchKeys();
  };
  
  // 重置查询
  const resetQuery = () => {
    form.resetFields();
    dispatch(setPagination({ current: 1 }));
    fetchKeys();
  };
  
  // 处理页码变化
  const handlePageChange = (page: number, pageSize?: number) => {
    dispatch(setPagination({ current: page, pageSize }));
  };
  
  // 处理每页条数变化
  const handleSizeChange = (current: number, size: number) => {
    dispatch(setPagination({ current: 1, pageSize: size }));
  };
  
  // 查看键值
  const viewValue = async (key: string) => {
    setCurrentKey(key);
    try {
      await dispatch(getRedisValue(key));
      setValueModalVisible(true);
    } catch (error) {
      message.error('获取键值失败');
    }
  };
  
  // 编辑键值
  const editValue = async (key: string) => {
    setCurrentKey(key);
    try {
      await dispatch(getRedisValue(key));
      valueForm.setFieldsValue({
        value: redisValue,
        ttl: -1
      });
      setEditModalVisible(true);
    } catch (error) {
      message.error('获取键值失败');
    }
  };
  
  // 保存键值
  const saveValue = async () => {
    try {
      const values = await valueForm.validateFields();
      const hide = message.loading('正在保存...', 0);
      
      try {
        await dispatch(setRedisValue({
          key: currentKey,
          value: values.value,
          ttl: values.ttl
        }));
        hide();
        message.success('保存成功');
        setEditModalVisible(false);
        fetchKeys();
      } catch (error) {
        hide();
        message.error('保存失败');
      }
    } catch (error) {
      // 表单验证失败
    }
  };
  
  // 删除键
  const deleteKey = async (key: string) => {
    try {
      await dispatch(deleteRedisKey(key));
      message.success('删除成功');
      fetchKeys();
    } catch (error) {
      message.error('删除失败');
    }
  };
  
  // 清空数据库
  const confirmClearDb = () => {
    confirm({
      title: '确定要清空Redis数据库吗?',
      icon: <ExclamationCircleOutlined />,
      content: '此操作将清空所有数据，且不可恢复',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await dispatch(clearRedisDb());
          message.success('清空成功');
          fetchKeys();
          fetchInfo();
        } catch (error) {
          message.error('清空失败');
        }
      }
    });
  };
  
  // 刷新信息
  const refreshInfo = () => {
    fetchInfo();
    message.success('刷新成功');
  };
  
  // 格式化TTL显示
  const formatTTL = (ttl: number) => {
    if (ttl === -1) {
      return '永不过期';
    } else if (ttl === -2) {
      return '已过期';
    } else {
      return formatDuration(ttl);
    }
  };
  
  // 格式化内存大小
  const formatSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };
  
  // 处理Tab切换
  const handleTabChange = (activeKey: string) => {
    setActiveTab(activeKey);
  };
  
  // 表格列定义
  const columns: ColumnsType<RedisKeyData> = [
    {
      title: '键名',
      dataIndex: 'key',
      key: 'key',
      width: 300,
      render: (key) => (
        <Tooltip title={key}>
          <div style={{ 
            maxWidth: 300, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {key}
          </div>
        </Tooltip>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100
    },
    {
      title: '过期时间',
      dataIndex: 'ttl',
      key: 'ttl',
      width: 150,
      render: (ttl) => formatTTL(ttl)
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (size) => formatSize(size)
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => viewValue(record.key)}
          >
            查看
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => editValue(record.key)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此键吗？"
            onConfirm={() => deleteKey(record.key)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];
  
  return (
    <div className="redis-manage-container">
      <Title level={2}>Redis管理</Title>
      
      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="键值管理" key="keys">
            <div style={{ marginBottom: 16 }}>
              <Form 
                form={form} 
                layout="inline" 
                onFinish={handleSearch}
              >
                <Form.Item name="pattern" label="键名模式">
                  <Input 
                    placeholder="支持通配符，如: user:*" 
                    allowClear 
                    style={{ width: 250 }}
                    defaultValue="*"
                  />
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
                      查询
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={resetQuery}>
                      重置
                    </Button>
                    <Popconfirm
                      title="确定要清空所有数据吗？"
                      onConfirm={confirmClearDb}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button danger icon={<ClearOutlined />}>
                        清空数据库
                      </Button>
                    </Popconfirm>
                  </Space>
                </Form.Item>
              </Form>
            </div>
            
            <Table<RedisKeyData>
              columns={columns}
              dataSource={redisKeys}
              rowKey="key"
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
          </TabPane>
          
          <TabPane tab="Redis信息" key="info">
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={refreshInfo}
              >
                刷新信息
              </Button>
            </div>
            
            {redisInfo ? (
              <div>
                <Row gutter={16}>
                  <Col span={8}>
                    <Card>
                      <Statistic title="Redis版本" value={redisInfo.version} />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic 
                        title="运行时间" 
                        value={formatDuration(redisInfo.uptime)} 
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic 
                        title="连接数" 
                        value={redisInfo.connectedClients} 
                      />
                    </Card>
                  </Col>
                </Row>
                
                <Divider />
                
                <Row gutter={16}>
                  <Col span={8}>
                    <Card>
                      <Statistic 
                        title="内存使用" 
                        value={formatSize(redisInfo.usedMemory)} 
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic 
                        title="内存峰值" 
                        value={formatSize(redisInfo.usedMemoryPeak)} 
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card>
                      <Statistic title="键总数" value={redisInfo.totalKeys} />
                    </Card>
                  </Col>
                </Row>
                
                <Divider />
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Card>
                      <Statistic title="数据库大小" value={redisInfo.dbSize} />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card>
                      <Statistic 
                        title="最后保存时间" 
                        value={formatDateTime(redisInfo.lastSave * 1000)} 
                      />
                    </Card>
                  </Col>
                </Row>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>加载中...</div>
            )}
          </TabPane>
        </Tabs>
      </Card>
      
      {/* 查看键值对话框 */}
      <Modal
        title={`查看键值 - ${currentKey}`}
        open={valueModalVisible}
        onCancel={() => setValueModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setValueModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        <TextArea 
          value={redisValue} 
          rows={15} 
          readOnly 
        />
      </Modal>
      
      {/* 编辑键值对话框 */}
      <Modal
        title={`编辑键值 - ${currentKey}`}
        open={editModalVisible}
        onOk={saveValue}
        onCancel={() => setEditModalVisible(false)}
        width={700}
      >
        <Form
          form={valueForm}
          layout="vertical"
        >
          <Form.Item
            name="value"
            label="键值"
            rules={[{ required: true, message: '请输入键值' }]}
          >
            <TextArea rows={10} placeholder="请输入键值" />
          </Form.Item>
          
          <Form.Item
            name="ttl"
            label="过期时间(秒)"
            tooltip="设置为-1表示永不过期，设置为0表示立即过期"
            rules={[{ required: true, message: '请输入过期时间' }]}
          >
            <Input type="number" placeholder="请输入过期时间" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RedisManage; 