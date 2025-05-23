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
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  UploadOutlined 
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
  deletePointsProduct 
} from '@/api/points';
import { formatDateTime } from '@/utils/dateUtils';
import { getThumbnailUrl } from '@/utils/imageUtils';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

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
  startTime: string;
  endTime: string;
  createTime: string;
  updateTime: string;
}

const PointsProduct: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  
  // 从Redux获取状态
  const { productList, productDetail, pagination, loading } = useSelector((state: RootState) => state.points);
  
  // 本地状态
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('添加积分商品');
  const [currentProduct, setCurrentProduct] = useState<PointsProductData | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  
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
      ...values
    };
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
      stock: 100
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
      startTime: record.startTime ? new Date(record.startTime) : null,
      endTime: record.endTime ? new Date(record.endTime) : null
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
  
  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const hide = message.loading('正在保存...', 0);
      
      // 构建提交数据
      const submitData = {
        ...values,
        // 处理图片
        image: fileList.length > 0 ? fileList[0].url || fileList[0].response?.url : ''
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
  
  // 获取商品状态标签
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <span style={{ color: '#52c41a' }}>上架中</span>;
      case 'inactive':
        return <span style={{ color: '#999' }}>已下架</span>;
      case 'soldout':
        return <span style={{ color: '#f5222d' }}>已售罄</span>;
      default:
        return <span>{status}</span>;
    }
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
        <img 
          src={getThumbnailUrl(image)} 
          alt="商品图片" 
          style={{ width: 50, height: 50, objectFit: 'cover' }} 
        /> : 
        '无图片'
      )
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '所需积分',
      dataIndex: 'points',
      key: 'points',
      width: 100
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status)
    },
    {
      title: '兑换限制',
      dataIndex: 'exchangeLimit',
      key: 'exchangeLimit',
      width: 100,
      render: (limit) => `${limit}次/人`
    },
    {
      title: '有效期',
      key: 'validPeriod',
      width: 200,
      render: (_, record) => (
        <span>
          {record.startTime ? formatDateTime(record.startTime, 'YYYY-MM-DD') : '无限制'} 至 
          {record.endTime ? formatDateTime(record.endTime, 'YYYY-MM-DD') : '无限制'}
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
      width: 200,
      render: (_, record) => (
        <Space size="middle">
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
          <Popconfirm
            title="确定要删除此商品吗？"
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
              <Option value="">全部</Option>
              <Option value="active">上架中</Option>
              <Option value="inactive">已下架</Option>
              <Option value="soldout">已售罄</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
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
            添加积分商品
          </Button>
        </div>
        
        <Table<PointsProductData>
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
          scroll={{ x: 1300 }}
        />
      </Card>
      
      {/* 添加/编辑商品对话框 */}
      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="商品名称"
            rules={[
              { required: true, message: '请输入商品名称' },
              { max: 100, message: '商品名称不能超过100个字符' }
            ]}
          >
            <Input placeholder="请输入商品名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="商品描述"
            rules={[
              { max: 500, message: '商品描述不能超过500个字符' }
            ]}
          >
            <TextArea rows={4} placeholder="请输入商品描述" />
          </Form.Item>
          
          <Form.Item
            label="商品图片"
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleImageChange}
              beforeUpload={beforeUpload}
              maxCount={1}
              action="/api/upload" // 实际上传地址
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="points"
            label="所需积分"
            rules={[
              { required: true, message: '请输入所需积分' },
              { type: 'number', min: 1, message: '积分必须大于0' }
            ]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              min={1} 
              placeholder="请输入所需积分" 
            />
          </Form.Item>
          
          <Form.Item
            name="stock"
            label="库存数量"
            rules={[
              { required: true, message: '请输入库存数量' },
              { type: 'number', min: 0, message: '库存不能小于0' }
            ]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              min={0} 
              placeholder="请输入库存数量" 
            />
          </Form.Item>
          
          <Form.Item
            name="exchangeLimit"
            label="兑换限制(每人)"
            rules={[
              { required: true, message: '请输入兑换限制' },
              { type: 'number', min: 1, message: '兑换限制必须大于0' }
            ]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              min={1} 
              placeholder="请输入每人兑换限制次数" 
            />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="商品状态"
            rules={[{ required: true, message: '请选择商品状态' }]}
          >
            <Select placeholder="请选择商品状态">
              <Option value="active">上架中</Option>
              <Option value="inactive">已下架</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="validPeriod"
            label="有效期"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item name="startTime" noStyle>
                <DatePicker 
                  placeholder="开始日期" 
                  style={{ width: '100%' }} 
                />
              </Form.Item>
              <Form.Item name="endTime" noStyle>
                <DatePicker 
                  placeholder="结束日期" 
                  style={{ width: '100%' }} 
                />
              </Form.Item>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 商品详情对话框 */}
      <Modal
        title="积分商品详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {productDetail ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              {productDetail.image && (
                <img 
                  src={getThumbnailUrl(productDetail.image)} 
                  alt={productDetail.name} 
                  style={{ maxWidth: '100%', maxHeight: 300 }} 
                />
              )}
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>{productDetail.name}</Title>
              <div>所需积分: <span style={{ color: '#f5222d', fontWeight: 'bold' }}>{productDetail.points}</span> 积分</div>
              <div>商品状态: {getStatusTag(productDetail.status)}</div>
              <div>库存数量: {productDetail.stock}</div>
              <div>兑换限制: {productDetail.exchangeLimit}次/人</div>
              <div>有效期: {productDetail.startTime ? formatDateTime(productDetail.startTime) : '无限制'} 至 {productDetail.endTime ? formatDateTime(productDetail.endTime) : '无限制'}</div>
              <div>创建时间: {formatDateTime(productDetail.createTime)}</div>
              <div>更新时间: {formatDateTime(productDetail.updateTime)}</div>
            </div>
            
            <div>
              <Title level={5}>商品描述</Title>
              <p>{productDetail.description || '暂无描述'}</p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>加载中...</div>
        )}
      </Modal>
    </div>
  );
};

export default PointsProduct; 