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
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import { 
  fetchCouponList, 
  setPagination 
} from '@/store/slices/couponSlice';
import { deleteCoupon } from '@/api/coupon';
import { formatDateTime } from '@/utils/dateUtils';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 定义优惠券数据类型
interface CouponData {
  id: number;
  name: string;
  code: string;
  type: string;
  value: number;
  minAmount: number;
  startTime: string;
  endTime: string;
  status: string;
  quantity: number;
  usedCount: number;
  createTime: string;
}

const CouponList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  
  // 从Redux获取状态
  const { couponList, pagination, loading } = useSelector((state: RootState) => state.coupon);
  
  // 初始加载
  useEffect(() => {
    fetchCoupons();
  }, [dispatch, pagination.current, pagination.pageSize]);
  
  // 获取优惠券列表
  const fetchCoupons = () => {
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
      const hide = message.loading('正在删除...', 0);
      await deleteCoupon(id);
      hide();
      message.success('删除成功');
      fetchCoupons();
    } catch (error) {
      message.error('删除失败');
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
  
  // 获取优惠券类型标签
  const getCouponTypeTag = (type: string) => {
    switch (type) {
      case 'fixed':
        return <Tag color="blue">固定金额</Tag>;
      case 'percentage':
        return <Tag color="green">折扣比例</Tag>;
      case 'free_shipping':
        return <Tag color="purple">免运费</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };
  
  // 获取优惠券状态标签
  const getCouponStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag color="success">生效中</Tag>;
      case 'inactive':
        return <Tag color="default">未生效</Tag>;
      case 'expired':
        return <Tag color="error">已过期</Tag>;
      case 'depleted':
        return <Tag color="warning">已领完</Tag>;
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
      width: 200
    },
    {
      title: '优惠券代码',
      dataIndex: 'code',
      key: 'code',
      width: 150
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => getCouponTypeTag(type)
    },
    {
      title: '优惠值',
      dataIndex: 'value',
      key: 'value',
      width: 120,
      render: (value, record) => {
        if (record.type === 'fixed') {
          return `¥${value.toFixed(2)}`;
        } else if (record.type === 'percentage') {
          return `${value}%`;
        } else {
          return '-';
        }
      }
    },
    {
      title: '最低消费',
      dataIndex: 'minAmount',
      key: 'minAmount',
      width: 120,
      render: (minAmount) => minAmount > 0 ? `¥${minAmount.toFixed(2)}` : '无限制'
    },
    {
      title: '有效期',
      key: 'validPeriod',
      width: 240,
      render: (_, record) => (
        <span>
          {formatDateTime(record.startTime, 'YYYY-MM-DD')} 至 {formatDateTime(record.endTime, 'YYYY-MM-DD')}
        </span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getCouponStatusTag(status)
    },
    {
      title: '数量/已使用',
      key: 'usage',
      width: 120,
      render: (_, record) => (
        <span>
          {record.quantity === -1 ? '无限' : record.quantity}/{record.usedCount}
        </span>
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
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此优惠券吗？"
            onConfirm={() => handleDelete(record.id)}
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
    <div className="coupon-list-container">
      <Title level={2}>优惠券管理</Title>
      
      <Card className="filter-container" style={{ marginBottom: 16 }}>
        <Form 
          form={form} 
          layout="inline" 
          onFinish={handleSearch}
        >
          <Form.Item name="name" label="优惠券名称">
            <Input placeholder="优惠券名称" allowClear />
          </Form.Item>
          <Form.Item name="code" label="优惠券代码">
            <Input placeholder="优惠券代码" allowClear />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Select placeholder="类型" style={{ width: 120 }} allowClear>
              <Option value="">全部</Option>
              <Option value="fixed">固定金额</Option>
              <Option value="percentage">折扣比例</Option>
              <Option value="free_shipping">免运费</Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="状态" style={{ width: 120 }} allowClear>
              <Option value="">全部</Option>
              <Option value="active">生效中</Option>
              <Option value="inactive">未生效</Option>
              <Option value="expired">已过期</Option>
              <Option value="depleted">已领完</Option>
            </Select>
          </Form.Item>
          <Form.Item name="timeRange" label="有效期">
            <RangePicker style={{ width: 240 }} />
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
        <div style={{ marginBottom: 16 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            添加优惠券
          </Button>
        </div>
        
        <Table<CouponData>
          columns={columns}
          dataSource={couponList}
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
          scroll={{ x: 1500 }}
        />
      </Card>
    </div>
  );
};

export default CouponList; 