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
  adminId: number;
  adminName: string;
  operation: string;
  module: string;
  operationType: string;
  targetType: string;
  targetId: string;
  requestMethod: string;
  requestUrl: string;
  requestParams: string;
  responseStatus: number;
  ipAddress: string;
  userAgent: string;
  operationResult: string;
  errorMessage: string;
  executionTimeMs: number;
  description: string;
  createTime: string;
}

const SystemLog: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  
  // 从Redux获取状态
  const { systemLogs, logDetail, pagination, loading } = useSelector((state: RootState) => state.system);
  
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
      dataIndex: 'operationType',
      key: 'operationType',
      width: 100,
      render: (operationType) => {
        const typeMap: { [key: string]: { text: string; color: string } } = {
          'READ': { text: '查看', color: 'blue' },
          'CREATE': { text: '新增', color: 'green' },
          'UPDATE': { text: '更新', color: 'orange' },
          'DELETE': { text: '删除', color: 'red' },
          'LOGIN': { text: '登录', color: 'purple' },
          'LOGOUT': { text: '登出', color: 'gray' },
          'EXPORT': { text: '导出', color: 'cyan' },
          'IMPORT': { text: '导入', color: 'magenta' }
        };
        const typeInfo = typeMap[operationType] || { text: operationType, color: 'default' };
        return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
      }
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 120
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: 150,
      render: (operation) => (
        <Tooltip title={operation}>
          <div style={{
            maxWidth: 150,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {operation}
          </div>
        </Tooltip>
      )
    },
    {
      title: '操作人',
      dataIndex: 'adminName',
      key: 'adminName',
      width: 120
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 140
    },
    {
      title: '操作结果',
      dataIndex: 'operationResult',
      key: 'operationResult',
      width: 100,
      render: (result) => (
        <Tag color={result === 'success' ? 'green' : 'red'}>
          {result === 'success' ? '成功' : '失败'}
        </Tag>
      )
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
          <Form.Item name="operationType" label="操作类型">
            <Select placeholder="操作类型" style={{ width: 120 }} allowClear>
              <Option value="">全部</Option>
              <Option value="READ">查看</Option>
              <Option value="CREATE">新增</Option>
              <Option value="UPDATE">更新</Option>
              <Option value="DELETE">删除</Option>
              <Option value="LOGIN">登录</Option>
              <Option value="LOGOUT">登出</Option>
              <Option value="EXPORT">导出</Option>
              <Option value="IMPORT">导入</Option>
            </Select>
          </Form.Item>
          <Form.Item name="module" label="模块">
            <Select placeholder="模块" style={{ width: 120 }} allowClear>
              <Option value="">全部</Option>
              <Option value="管理员管理">管理员管理</Option>
              <Option value="用户管理">用户管理</Option>
              <Option value="商品管理">商品管理</Option>
              <Option value="订单管理">订单管理</Option>
              <Option value="系统管理">系统管理</Option>
            </Select>
          </Form.Item>
          <Form.Item name="operationResult" label="操作结果">
            <Select placeholder="操作结果" style={{ width: 120 }} allowClear>
              <Option value="">全部</Option>
              <Option value="success">成功</Option>
              <Option value="failed">失败</Option>
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
        <Table<SystemLogData>
          columns={columns}
          dataSource={systemLogs}
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
          scroll={{ x: 900 }}
          size="small"
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
              <p><strong>管理员:</strong> {logDetail.adminName} (ID: {logDetail.adminId})</p>
              <p><strong>操作:</strong> {logDetail.operation}</p>
              <p><strong>模块:</strong> {logDetail.module}</p>
              <p><strong>操作类型:</strong> {logDetail.operationType}</p>
              <p><strong>目标类型:</strong> {logDetail.targetType}</p>
              <p><strong>目标ID:</strong> {logDetail.targetId}</p>
              <p><strong>请求方法:</strong> {logDetail.requestMethod}</p>
              <p><strong>请求URL:</strong> {logDetail.requestUrl}</p>
              <p><strong>响应状态:</strong> {logDetail.responseStatus}</p>
              <p><strong>IP地址:</strong> {logDetail.ipAddress}</p>
              <p><strong>User Agent:</strong> {logDetail.userAgent}</p>
              <p><strong>操作结果:</strong>
                <Tag color={logDetail.operationResult === 'success' ? 'green' : 'red'}>
                  {logDetail.operationResult === 'success' ? '成功' : '失败'}
                </Tag>
              </p>
              <p><strong>执行时间:</strong> {logDetail.executionTimeMs}ms</p>
              <p><strong>创建时间:</strong> {formatDateTime(logDetail.createTime)}</p>
            </div>

            {logDetail.requestParams && (
              <div style={{ marginBottom: 16 }}>
                <p><strong>请求参数:</strong></p>
                <TextArea
                  value={logDetail.requestParams}
                  rows={4}
                  readOnly
                  style={{ marginTop: 8 }}
                />
              </div>
            )}

            {logDetail.description && (
              <div style={{ marginBottom: 16 }}>
                <p><strong>操作描述:</strong></p>
                <TextArea
                  value={logDetail.description}
                  rows={3}
                  readOnly
                  style={{ marginTop: 8 }}
                />
              </div>
            )}

            {logDetail.errorMessage && (
              <div>
                <p><strong>错误信息:</strong></p>
                <TextArea
                  value={logDetail.errorMessage}
                  rows={4}
                  readOnly
                  style={{ marginTop: 8, backgroundColor: '#fff2f0' }}
                />
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>加载中...</div>
        )}
      </Modal>
    </div>
  );
};

export default SystemLog; 