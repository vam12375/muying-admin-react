import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Input, 
  Space, 
  Form, 
  Select, 
  Modal, 
  message, 
  Typography,
  Tag,
  DatePicker,
  Popconfirm,
  Row,
  Col,
  Statistic,
  App
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  StopOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import { 
  fetchCouponList, 
  setPagination,
  fetchCouponStats
} from '@/store/slices/couponSlice';
import { deleteCoupon, updateCouponStatus, CouponData } from '@/api/coupon';
import { formatDateTime } from '@/utils/dateUtils';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CouponList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const { message: contextMessage } = App.useApp(); // 使用App上下文中的message
  
  // 从Redux获取状态
  const { couponList, pagination, loading, stats } = useSelector((state: RootState) => state.coupon);
  
  // 初始加载
  useEffect(() => {
    fetchCoupons();
    dispatch(fetchCouponStats());
  }, [dispatch, pagination.current, pagination.pageSize]);
  
  // 获取优惠券列表
  const fetchCoupons = () => {
    const values = form.getFieldsValue();
    const params = {
      page: pagination.current,
      size: pagination.pageSize,
      ...values,
      // 处理日期范围
      startTime: values.timeRange && values.timeRange[0] ? values.timeRange[0].format('YYYY-MM-DD HH:mm:ss') : undefined,
      endTime: values.timeRange && values.timeRange[1] ? values.timeRange[1].format('YYYY-MM-DD HH:mm:ss') : undefined
    };
    
    // 移除timeRange字段
    if (params.timeRange) {
      delete params.timeRange;
    }
    
    dispatch(fetchCouponList(params));
  };
  
  // 处理搜索
  const handleSearch = () => {
    dispatch(setPagination({ current: 1 }));
    fetchCoupons();
  };
  
  // 重置查询
  const resetQuery = () => {
    form.resetFields();
    dispatch(setPagination({ current: 1 }));
    fetchCoupons();
  };
  
  // 处理页码变化
  const handlePageChange = (page: number, pageSize?: number) => {
    dispatch(setPagination({ current: page, pageSize }));
  };
  
  // 处理每页条数变化
  const handleSizeChange = (current: number, size: number) => {
    dispatch(setPagination({ current: 1, pageSize: size }));
  };
  
  // 添加优惠券
  const handleAdd = () => {
    navigate('/coupon/create');
  };
  
  // 编辑优惠券
  const handleEdit = (record: CouponData) => {
    navigate(`/coupon/edit/${record.id}`);
  };
  
  // 删除优惠券
  const handleDelete = async (id: number) => {
    try {
      const hide = contextMessage.loading('正在删除...', 0);
      await deleteCoupon(id);
      hide();
      contextMessage.success('删除成功');
      fetchCoupons();
    } catch (error) {
      contextMessage.error('删除失败');
    }
  };
  
  // 更新优惠券状态
  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const hide = contextMessage.loading('正在更新状态...', 0);
      await updateCouponStatus(id, status);
      hide();
      contextMessage.success('状态更新成功');
      fetchCoupons();
    } catch (error) {
      contextMessage.error('状态更新失败');
    }
  };
  
  // 确认删除
  const confirmDelete = (record: CouponData) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除优惠券 "${record.name}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => handleDelete(record.id)
    });
  };
  
  // 查看详情
  const viewDetail = (record: CouponData) => {
    navigate(`/coupon/detail/${record.id}`);
  };
  
  // 获取优惠券类型标签
  const getCouponTypeTag = (type: string) => {
    switch (type) {
      case 'FIXED':
        return <Tag color="blue">固定金额</Tag>;
      case 'PERCENTAGE':
        return <Tag color="green">折扣比例</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };
  
  // 获取优惠券状态标签
  const getCouponStatusTag = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Tag color="success">生效中</Tag>;
      case 'INACTIVE':
        return <Tag color="default">未生效</Tag>;
      case 'EXPIRED':
        return <Tag color="error">已过期</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };
  
  // 表格列定义
  const columns: ColumnsType<CouponData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '优惠券名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text) => <a>{text}</a>
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => getCouponTypeTag(type)
    },
    {
      title: '面值/折扣',
      dataIndex: 'value',
      key: 'value',
      width: 120,
      render: (value, record) => {
        if (record.type === 'FIXED') {
          return `¥${value.toFixed(2)}`;
        } else if (record.type === 'PERCENTAGE') {
          return `${value}折`;
        }
        return value;
      }
    },
    {
      title: '最低消费',
      dataIndex: 'minSpend',
      key: 'minSpend',
      width: 120,
      render: (value) => value ? `¥${value.toFixed(2)}` : '无限制'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getCouponStatusTag(status)
    },
    {
      title: '总数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 100,
      render: (value) => value === 0 ? '不限量' : value
    },
    {
      title: '已领取/已使用',
      key: 'usage',
      width: 150,
      render: (_, record) => (
        <span>
          {record.receivedQuantity || 0}/{record.usedQuantity || 0}
        </span>
      )
    },
    {
      title: '有效期',
      key: 'validPeriod',
      width: 280,
      render: (_, record) => (
        <span>
          {record.startTime ? formatDateTime(record.startTime) : '无限制'} ~ 
          {record.endTime ? formatDateTime(record.endTime) : '无限制'}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => viewDetail(record)}
          >
            查看
          </Button>
          <Button 
            type="text" 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status === 'ACTIVE' ? (
            <Button 
              type="text" 
              size="small" 
              danger
              icon={<StopOutlined />} 
              onClick={() => handleUpdateStatus(record.id, 'INACTIVE')}
            >
              停用
            </Button>
          ) : (
            <Button 
              type="text" 
              size="small" 
              icon={<ReloadOutlined />} 
              onClick={() => handleUpdateStatus(record.id, 'ACTIVE')}
            >
              启用
            </Button>
          )}
          <Popconfirm
            title="确定要删除此优惠券吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="text" 
              size="small"
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
    <App> {/* 使用App组件作为上下文提供者 */}
      <div className="coupon-list-container" style={{ padding: '24px' }}>
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={24}>
            <Col span={6}>
              <Statistic
                title="优惠券总数"
                value={stats?.totalCoupons || 0}
                suffix="张"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="已领取优惠券"
                value={stats?.receivedCount || 0}
                suffix="张"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="已使用优惠券"
                value={stats?.usedCoupons || 0}
                suffix="张"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="已过期优惠券"
                value={stats?.expiredCoupons || 0}
                suffix="张"
              />
            </Col>
          </Row>
        </Card>
        
        <Card>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
            <Title level={4}>优惠券列表</Title>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加优惠券
            </Button>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <Form
              form={form}
              layout="inline"
              onFinish={handleSearch}
            >
              <Form.Item name="name">
                <Input placeholder="优惠券名称" allowClear />
              </Form.Item>
              
              <Form.Item name="type">
                <Select placeholder="优惠券类型" allowClear style={{ width: 120 }}>
                  <Option value="FIXED">固定金额</Option>
                  <Option value="PERCENTAGE">折扣比例</Option>
                </Select>
              </Form.Item>
              
              <Form.Item name="status">
                <Select placeholder="优惠券状态" allowClear style={{ width: 120 }}>
                  <Option value="ACTIVE">生效中</Option>
                  <Option value="INACTIVE">未生效</Option>
                  <Option value="EXPIRED">已过期</Option>
                </Select>
              </Form.Item>
              
              <Form.Item name="timeRange">
                <RangePicker placeholder={['开始日期', '结束日期']} />
              </Form.Item>
              
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    搜索
                  </Button>
                  <Button onClick={resetQuery}>重置</Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
          
          <Table
            rowKey="id"
            columns={columns}
            dataSource={couponList}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: handlePageChange,
              onShowSizeChange: handleSizeChange
            }}
            loading={loading}
            scroll={{ x: 1500 }}
          />
        </Card>
      </div>
    </App>
  );
};

export default CouponList; 