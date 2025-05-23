import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Input, 
  Space, 
  Form, 
  Modal, 
  Typography,
  Select,
  DatePicker,
  Tag,
  Tooltip
} from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import { 
  fetchSystemLogs, 
  fetchLogDetail,
  setPagination 
} from '@/store/slices/systemSlice';
import { formatDateTime } from '@/utils/dateUtils';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

// 定义日志数据类型
interface SystemLogData {
  id: number;
  type: string;
  level: string;
  content: string;
  operator: string;
  ip: string;
  userAgent: string;
  createTime: string;
}

const SystemLog: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  
  // 从Redux获取状态
  const { logList, logDetail, pagination, loading } = useSelector((state: RootState) => state.system);
  
  // 本地状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  
  // 初始加载
  useEffect(() => {
    fetchLogs();
  }, [dispatch, pagination.current, pagination.pageSize]);
  
  // 获取日志列表
  const fetchLogs = () => {
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
    
    dispatch(fetchSystemLogs(params));
  };
  
  // 处理搜索
  const handleSearch = () => {
    dispatch(setPagination({ current: 1 }));
    fetchLogs();
  };
  
  // 重置查询
  const resetQuery = () => {
    form.resetFields();
    dispatch(setPagination({ current: 1 }));
    fetchLogs();
  };
  
  // 处理页码变化
  const handlePageChange = (page: number, pageSize?: number) => {
    dispatch(setPagination({ current: page, pageSize }));
  };
  
  // 处理每页条数变化
  const handleSizeChange = (current: number, size: number) => {
    dispatch(setPagination({ current: 1, pageSize: size }));
  };
  
  // 查看日志详情
  const viewLogDetail = (id: number) => {
    dispatch(fetchLogDetail(id));
    setDetailModalVisible(true);
  };
  
  // 获取日志级别标签
  const getLevelTag = (level: string) => {
    switch (level.toLowerCase()) {
      case 'info':
        return <Tag color="blue">信息</Tag>;
      case 'warning':
        return <Tag color="orange">警告</Tag>;
      case 'error':
        return <Tag color="red">错误</Tag>;
      case 'debug':
        return <Tag color="green">调试</Tag>;
      default:
        return <Tag>{level}</Tag>;
    }
  };
  
  // 获取日志类型文本
  const getTypeText = (type: string) => {
    switch (type) {
      case 'login':
        return '登录';
      case 'operation':
        return '操作';
      case 'system':
        return '系统';
      case 'error':
        return '错误';
      default:
        return type;
    }
  };
  
  // 表格列定义
  const columns: ColumnsType<SystemLogData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '日志类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => getTypeText(type)
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level) => getLevelTag(level)
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: 300,
      render: (content) => (
        <Tooltip title={content}>
          <div style={{ 
            maxWidth: 300, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap' 
          }}>
            {content}
          </div>
        </Tooltip>
      )
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 120
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 140
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time) => formatDateTime(time)
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />} 
          onClick={() => viewLogDetail(record.id)}
        >
          详情
        </Button>
      )
    }
  ];
  
  return (
    <div className="system-log-container">
      <Title level={2}>系统日志</Title>
      
      <Card className="filter-container" style={{ marginBottom: 16 }}>
        <Form 
          form={form} 
          layout="inline" 
          onFinish={handleSearch}
        >
          <Form.Item name="type" label="日志类型">
            <Select placeholder="日志类型" style={{ width: 120 }} allowClear>
              <Option value="">全部</Option>
              <Option value="login">登录</Option>
              <Option value="operation">操作</Option>
              <Option value="system">系统</Option>
              <Option value="error">错误</Option>
            </Select>
          </Form.Item>
          <Form.Item name="level" label="级别">
            <Select placeholder="级别" style={{ width: 120 }} allowClear>
              <Option value="">全部</Option>
              <Option value="info">信息</Option>
              <Option value="warning">警告</Option>
              <Option value="error">错误</Option>
              <Option value="debug">调试</Option>
            </Select>
          </Form.Item>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="内容关键词" allowClear />
          </Form.Item>
          <Form.Item name="operator" label="操作人">
            <Input placeholder="操作人" allowClear />
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
        <Table<SystemLogData>
          columns={columns}
          dataSource={logList}
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
      
      {/* 日志详情对话框 */}
      <Modal
        title="日志详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {logDetail ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <p><strong>ID:</strong> {logDetail.id}</p>
              <p><strong>日志类型:</strong> {getTypeText(logDetail.type)}</p>
              <p><strong>级别:</strong> {getLevelTag(logDetail.level)}</p>
              <p><strong>操作人:</strong> {logDetail.operator}</p>
              <p><strong>IP地址:</strong> {logDetail.ip}</p>
              <p><strong>User Agent:</strong> {logDetail.userAgent}</p>
              <p><strong>创建时间:</strong> {formatDateTime(logDetail.createTime)}</p>
            </div>
            
            <div>
              <p><strong>日志内容:</strong></p>
              <TextArea 
                value={logDetail.content} 
                rows={10} 
                readOnly 
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>加载中...</div>
        )}
      </Modal>
    </div>
  );
};

export default SystemLog; 