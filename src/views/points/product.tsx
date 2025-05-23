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
  Switch,
  Upload,
  Popconfirm,
  DatePicker,
  Tooltip,
  Tag,
  Drawer,
  Radio,
  Image,
  Divider,
  Badge,
  Descriptions
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  UploadOutlined,
  ReloadOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  StockOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import { AppDispatch, RootState } from '@/store';
import { 
  fetchPointsProductList, 
  fetchPointsProductDetail,
  clearPointsProductDetail,
  setPagination 
} from '@/store/slices/pointsSlice';
import { 
  createPointsProduct, 
  updatePointsProduct, 
  deletePointsProduct, 
  updatePointsProductStatus
} from '@/api/points';
import { formatDateTime } from '@/utils/dateUtils';
import { getThumbnailUrl } from '@/utils/imageUtils';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// 定义积分商品数据类型
interface PointsProductData {
  id: number;
  name: string;
  description: string;
  points: number;
  stock: number;
  image: string;
  status: string;
  exchangeLimit: number;
  limitPerDay: number;
  startTime: string;
  endTime: string;
  createTime: string;
  updateTime: string;
  exchangeCount: number;
  virtual: boolean;
  category: string;
  tags: string[];
}

const PointsProduct: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [stockForm] = Form.useForm();
  
  // 从Redux获取状态
  const { productList, productDetail, pagination, loading } = useSelector((state: RootState) => state.points);
  
  // 本地状态
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加积分商品');
  const [currentProduct, setCurrentProduct] = useState<PointsProductData | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchAction, setBatchAction] = useState<string>('');
  
  // 初始加载
  useEffect(() => {
    fetchProducts();
    
    // 组件卸载时清除商品详情
    return () => {
      dispatch(clearPointsProductDetail());
    };
  }, [dispatch, pagination.current, pagination.pageSize]);
  
  // 获取积分商品列表
  const fetchProducts = () => {
    const values = searchForm.getFieldsValue();
    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...values,
      // 处理日期范围
      startDate: values.timeRange && values.timeRange[0] ? values.timeRange[0].format('YYYY-MM-DD') : undefined,
      endDate: values.timeRange && values.timeRange[1] ? values.timeRange[1].format('YYYY-MM-DD') : undefined
    };
    
    // 移除timeRange字段
    if (params.timeRange) {
      delete params.timeRange;
    }
    
    dispatch(fetchPointsProductList(params));
  };
  
  // 处理搜索
  const handleSearch = () => {
    dispatch(setPagination({ current: 1 }));
    fetchProducts();
  };
  
  // 重置查询
  const resetQuery = () => {
    searchForm.resetFields();
    dispatch(setPagination({ current: 1 }));
    fetchProducts();
  };
  
  // 处理页码变化
  const handlePageChange = (page: number, pageSize?: number) => {
    dispatch(setPagination({ current: page, pageSize }));
  };
  
  // 处理每页条数变化
  const handleSizeChange = (current: number, size: number) => {
    dispatch(setPagination({ current: 1, pageSize: size }));
  };
  
  // 添加商品
  const handleAdd = () => {
    setModalTitle('添加积分商品');
    setCurrentProduct(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'active',
      exchangeLimit: 1,
      limitPerDay: 0,
      stock: 100,
      virtual: false,
      category: 'other'
    });
    setFileList([]);
    setModalVisible(true);
  };
  
  // 编辑商品
  const handleEdit = (record: PointsProductData) => {
    setModalTitle('编辑积分商品');
    setCurrentProduct(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      points: record.points,
      stock: record.stock,
      status: record.status,
      exchangeLimit: record.exchangeLimit,
      limitPerDay: record.limitPerDay || 0,
      startTime: record.startTime ? new Date(record.startTime) : null,
      endTime: record.endTime ? new Date(record.endTime) : null,
      virtual: record.virtual || false,
      category: record.category || 'other',
      tags: record.tags || []
    });
    
    // 设置图片
    if (record.image) {
      setFileList([{
        uid: '-1',
        name: 'image.png',
        status: 'done',
        url: getThumbnailUrl(record.image)
      }]);
    } else {
      setFileList([]);
    }
    
    setModalVisible(true);
  };
  
  // 查看商品详情
  const handleViewDetail = (id: number) => {
    dispatch(fetchPointsProductDetail(id));
    setDetailModalVisible(true);
  };
  
  // 打开库存管理弹窗
  const handleStockManage = (record: PointsProductData) => {
    setCurrentProduct(record);
    stockForm.setFieldsValue({
      stock: record.stock,
      stockAction: 'set',
      stockChange: record.stock
    });
    setStockModalVisible(true);
  };
  
  // 处理库存调整
  const handleStockAdjust = async () => {
    try {
      if (!currentProduct) return;
      
      const values = await stockForm.validateFields();
      let newStock = currentProduct.stock;
      
      // 根据不同操作计算库存
      switch (values.stockAction) {
        case 'set':
          newStock = values.stockChange;
          break;
        case 'add':
          newStock = currentProduct.stock + values.stockChange;
          break;
        case 'subtract':
          newStock = Math.max(0, currentProduct.stock - values.stockChange);
          break;
      }
      
      const hide = message.loading('正在调整库存...', 0);
      try {
        await updatePointsProduct(currentProduct.id, {
          stock: newStock
        });
        hide();
        message.success('库存调整成功');
        setStockModalVisible(false);
        fetchProducts();
      } catch (error) {
        hide();
        message.error('库存调整失败');
      }
    } catch (error) {
      // 表单验证失败
    }
  };
  
  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const hide = message.loading('正在保存...', 0);
      
      // 构建提交数据
      const submitData = {
        ...values,
        // 处理图片
        image: fileList.length > 0 ? fileList[0].url || fileList[0].response?.url : '',
        // 处理日期
        startTime: values.startTime ? values.startTime.toISOString() : null,
        endTime: values.endTime ? values.endTime.toISOString() : null
      };
      
      try {
        if (currentProduct) {
          // 更新
          await updatePointsProduct(currentProduct.id, submitData);
          hide();
          message.success('更新成功');
        } else {
          // 添加
          await createPointsProduct(submitData);
          hide();
          message.success('添加成功');
        }
        
        setModalVisible(false);
        fetchProducts();
      } catch (error) {
        hide();
        message.error('操作失败');
      }
    } catch (error) {
      // 表单验证失败
    }
  };
  
  // 删除商品
  const handleDelete = async (id: number) => {
    const hide = message.loading('正在删除...', 0);
    try {
      await deletePointsProduct(id);
      hide();
      message.success('删除成功');
      fetchProducts();
    } catch (error) {
      hide();
      message.error('删除失败');
    }
  };
  
  // 更新商品状态
  const handleUpdateStatus = async (id: number, status: string) => {
    const hide = message.loading('正在更新状态...', 0);
    try {
      await updatePointsProductStatus(id, status);
      hide();
      message.success('状态更新成功');
      fetchProducts();
    } catch (error) {
      hide();
      message.error('状态更新失败');
    }
  };
  
  // 批量操作处理
  const handleBatchAction = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请至少选择一个商品');
      return;
    }
    
    if (!batchAction) {
      message.warning('请选择批量操作类型');
      return;
    }
    
    const hide = message.loading(`正在批量${batchAction === 'delete' ? '删除' : '更新状态'}...`, 0);
    try {
      const promises = selectedRowKeys.map(id => {
        if (batchAction === 'delete') {
          return deletePointsProduct(id as number);
        } else {
          return updatePointsProductStatus(id as number, batchAction);
        }
      });
      
      await Promise.all(promises);
      hide();
      message.success(`批量${batchAction === 'delete' ? '删除' : '更新状态'}成功`);
      setSelectedRowKeys([]);
      setBatchAction('');
      fetchProducts();
    } catch (error) {
      hide();
      message.error(`批量${batchAction === 'delete' ? '删除' : '更新状态'}失败`);
    }
  };
  
  // 处理图片上传
  const handleImageChange = (info: any) => {
    let fileList = [...info.fileList];
    // 限制只能上传一张图片
    fileList = fileList.slice(-1);
    
    // 处理上传状态
    fileList = fileList.map(file => {
      if (file.response) {
        // 组件会将 file.url 作为链接地址
        file.url = file.response.url;
      }
      return file;
    });
    
    setFileList(fileList);
  };
  
  // 上传前校验
  const beforeUpload = (file: any) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件!');
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过2MB!');
    }
    
    return isImage && isLt2M;
  };
  
  // 获取状态标签
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag color="success">上架中</Tag>;
      case 'inactive':
        return <Tag color="default">已下架</Tag>;
      case 'coming_soon':
        return <Tag color="processing">即将上架</Tag>;
      case 'sold_out':
        return <Tag color="error">已售罄</Tag>;
      case 'expired':
        return <Tag color="warning">已过期</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };
  
  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys)
  };
  
  // 表格列定义
  const columns: ColumnsType<PointsProductData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '商品图片',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image) => (
        image ? 
        <Image 
          src={getThumbnailUrl(image)} 
          alt="商品图片" 
          width={60} 
          height={60}
          style={{ objectFit: 'cover' }}
          preview={{
            mask: <EyeOutlined />
          }}
        /> : 
        <div style={{ width: 60, height: 60, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          无图片
        </div>
      )
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      width: 100
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      render: (stock, record) => (
        <Space>
          <span className={stock <= 10 ? 'text-red-500 font-bold' : ''}>{stock}</span>
          {record.virtual && <Tag size="small">虚拟</Tag>}
          <Button 
            type="link" 
            size="small" 
            icon={<StockOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleStockManage(record);
            }}
          />
        </Space>
      )
    },
    {
      title: '兑换限制',
      dataIndex: 'exchangeLimit',
      key: 'exchangeLimit',
      width: 120,
      render: (limit, record) => (
        <Space direction="vertical" size="small" style={{ lineHeight: '1.2' }}>
          <span>每人: {limit}次</span>
          {record.limitPerDay > 0 && <span>每日: {record.limitPerDay}次</span>}
        </Space>
      )
    },
    {
      title: '兑换量',
      dataIndex: 'exchangeCount',
      key: 'exchangeCount',
      width: 100
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => {
        const categoryMap: Record<string, string> = {
          'physical': '实物商品',
          'virtual': '虚拟商品',
          'coupon': '优惠券',
          'vip': '会员特权',
          'other': '其它',
        };
        return categoryMap[category] || category;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => getStatusTag(status)
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
      width: 250,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record.id)}
          >
            详情
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            onClick={() => {
              const newStatus = record.status === 'active' ? 'inactive' : 'active';
              handleUpdateStatus(record.id, newStatus);
            }}
          >
            {record.status === 'active' ? '下架' : '上架'}
          </Button>
          <Popconfirm
            title="确定要删除该商品吗？"
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
    <div className="points-product-container">
      <Title level={2}>积分商品管理</Title>
      
      <Card className="filter-container" style={{ marginBottom: 16 }}>
        <Form 
          form={searchForm} 
          layout="inline" 
          onFinish={handleSearch}
        >
          <Form.Item name="name" label="商品名称">
            <Input placeholder="商品名称" allowClear />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="状态" style={{ width: 120 }} allowClear>
              <Option value="active">上架中</Option>
              <Option value="inactive">已下架</Option>
              <Option value="coming_soon">即将上架</Option>
              <Option value="sold_out">已售罄</Option>
              <Option value="expired">已过期</Option>
            </Select>
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Select placeholder="分类" style={{ width: 120 }} allowClear>
              <Option value="physical">实物商品</Option>
              <Option value="virtual">虚拟商品</Option>
              <Option value="coupon">优惠券</Option>
              <Option value="vip">会员特权</Option>
              <Option value="other">其它</Option>
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
        <div style={{ marginBottom: 16 }} className="flex justify-between">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加积分商品
          </Button>
          
          <Space>
            <Select 
              placeholder="批量操作" 
              style={{ width: 150 }} 
              value={batchAction || undefined}
              onChange={(value) => setBatchAction(value)}
            >
              <Option value="active">批量上架</Option>
              <Option value="inactive">批量下架</Option>
              <Option value="delete">批量删除</Option>
            </Select>
            <Button 
              onClick={handleBatchAction} 
              disabled={!batchAction || selectedRowKeys.length === 0}
            >
              执行
            </Button>
            {selectedRowKeys.length > 0 && (
              <span style={{ marginLeft: 8 }}>
                已选择 <Badge count={selectedRowKeys.length} style={{ backgroundColor: '#108ee9' }} /> 项
              </span>
            )}
          </Space>
        </div>
        
        <Table<PointsProductData>
          rowSelection={rowSelection}
          columns={columns}
          dataSource={productList}
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
      
      {/* 商品表单弹窗 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={800}
        maskClosable={false}
      >
        <Form 
          form={form} 
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
          >
            <Input placeholder="请输入商品名称" maxLength={50} />
          </Form.Item>
          
          <Form.Item
            name="points"
            label="积分价格"
            rules={[{ required: true, message: '请输入积分价格' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="stock"
            label="库存数量"
            rules={[{ required: true, message: '请输入库存数量' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="category"
            label="商品分类"
            rules={[{ required: true, message: '请选择商品分类' }]}
          >
            <Select placeholder="请选择商品分类">
              <Option value="physical">实物商品</Option>
              <Option value="virtual">虚拟商品</Option>
              <Option value="coupon">优惠券</Option>
              <Option value="vip">会员特权</Option>
              <Option value="other">其它</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="virtual"
            valuePropName="checked"
            label="虚拟商品"
            tooltip="虚拟商品无需物流配送，如电子券、会员等"
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="image"
            label="商品图片"
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleImageChange}
              beforeUpload={beforeUpload}
              action="/api/upload"  // 替换为实际的上传接口
              maxCount={1}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="商品描述"
          >
            <TextArea rows={4} placeholder="请输入商品描述" maxLength={500} />
          </Form.Item>
          
          <Form.Item
            name="exchangeLimit"
            label="兑换限制"
            tooltip="每个用户最多可兑换的总次数，0表示不限制"
            rules={[{ required: true, message: '请输入兑换限制' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="limitPerDay"
            label="每日兑换限制"
            tooltip="每个用户每日最多可兑换的次数，0表示不限制"
            rules={[{ required: true, message: '请输入每日兑换限制' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item 
            name="status"
            label="商品状态"
            rules={[{ required: true, message: '请选择商品状态' }]}
          >
            <Select placeholder="请选择商品状态">
              <Option value="active">上架中</Option>
              <Option value="inactive">已下架</Option>
              <Option value="coming_soon">即将上架</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="商品标签"
          >
            <Select mode="tags" placeholder="请输入标签，回车确认" style={{ width: '100%' }}>
              <Option value="热门">热门</Option>
              <Option value="新品">新品</Option>
              <Option value="限量">限量</Option>
              <Option value="特惠">特惠</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="有效期"
            tooltip="商品兑换的有效期，不设置则长期有效"
          >
            <Space style={{ width: '100%' }}>
              <Form.Item name="startTime" noStyle>
                <DatePicker showTime placeholder="开始时间" />
              </Form.Item>
              <span>至</span>
              <Form.Item name="endTime" noStyle>
                <DatePicker showTime placeholder="结束时间" />
              </Form.Item>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 商品详情弹窗 */}
      <Drawer
        title="积分商品详情"
        placement="right"
        width={600}
        onClose={() => setDetailModalVisible(false)}
        open={detailModalVisible}
      >
        {productDetail && (
          <>
            <div className="mb-4">
              {productDetail.image && (
                <Image 
                  src={productDetail.image} 
                  alt={productDetail.name}
                  style={{ maxWidth: '100%', maxHeight: 300 }}
                />
              )}
            </div>
            
            <Descriptions bordered column={1}>
              <Descriptions.Item label="商品ID">{productDetail.id}</Descriptions.Item>
              <Descriptions.Item label="商品名称">{productDetail.name}</Descriptions.Item>
              <Descriptions.Item label="积分价格">{productDetail.points}</Descriptions.Item>
              <Descriptions.Item label="库存数量">{productDetail.stock}</Descriptions.Item>
              <Descriptions.Item label="兑换数量">{productDetail.exchangeCount || 0}</Descriptions.Item>
              <Descriptions.Item label="商品状态">{getStatusTag(productDetail.status)}</Descriptions.Item>
              <Descriptions.Item label="商品类型">
                {productDetail.virtual ? '虚拟商品' : '实物商品'}
              </Descriptions.Item>
              <Descriptions.Item label="兑换限制">
                <div>每人总计：{productDetail.exchangeLimit || '不限'} 次</div>
                <div>每人每日：{productDetail.limitPerDay ? `${productDetail.limitPerDay} 次` : '不限'}</div>
              </Descriptions.Item>
              <Descriptions.Item label="有效期">
                {productDetail.startTime && productDetail.endTime ? 
                  `${formatDateTime(productDetail.startTime)} 至 ${formatDateTime(productDetail.endTime)}` : 
                  '长期有效'}
              </Descriptions.Item>
              <Descriptions.Item label="商品描述">
                {productDetail.description || '无'}
              </Descriptions.Item>
              <Descriptions.Item label="标签">
                {(productDetail.tags && productDetail.tags.length > 0) ? 
                  productDetail.tags.map(tag => <Tag key={tag}>{tag}</Tag>) : 
                  '无'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {formatDateTime(productDetail.createTime)}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {formatDateTime(productDetail.updateTime)}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Space>
              <Button type="primary" onClick={() => handleEdit(productDetail)}>
                编辑
              </Button>
              <Button 
                onClick={() => {
                  const newStatus = productDetail.status === 'active' ? 'inactive' : 'active';
                  handleUpdateStatus(productDetail.id, newStatus);
                  setDetailModalVisible(false);
                }}
              >
                {productDetail.status === 'active' ? '下架' : '上架'}
              </Button>
              <Popconfirm
                title="确定要删除该商品吗？"
                onConfirm={() => {
                  handleDelete(productDetail.id);
                  setDetailModalVisible(false);
                }}
                okText="确定"
                cancelText="取消"
              >
                <Button danger>
                  删除
                </Button>
              </Popconfirm>
            </Space>
          </>
        )}
      </Drawer>
      
      {/* 库存管理弹窗 */}
      <Modal
        title="库存管理"
        open={stockModalVisible}
        onCancel={() => setStockModalVisible(false)}
        onOk={handleStockAdjust}
        maskClosable={false}
      >
        {currentProduct && (
          <Form 
            form={stockForm} 
            layout="vertical"
          >
            <Form.Item
              label="当前库存"
            >
              <InputNumber 
                value={currentProduct.stock} 
                disabled 
                style={{ width: '100%' }} 
              />
            </Form.Item>
            
            <Form.Item
              name="stockAction"
              label="操作类型"
              rules={[{ required: true, message: '请选择操作类型' }]}
            >
              <Radio.Group>
                <Radio value="set">设置库存</Radio>
                <Radio value="add">增加库存</Radio>
                <Radio value="subtract">减少库存</Radio>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item
              name="stockChange"
              label="库存变更"
              rules={[{ required: true, message: '请输入库存变更值' }]}
              dependencies={['stockAction']}
            >
              <InputNumber 
                min={0} 
                style={{ width: '100%' }} 
                placeholder={stockForm.getFieldValue('stockAction') === 'set' ? '设置库存值' : '变更数量'}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default PointsProduct; 