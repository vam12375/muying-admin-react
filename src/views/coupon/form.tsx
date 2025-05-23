import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Radio, 
  InputNumber, 
  Switch, 
  DatePicker, 
  Select, 
  message, 
  Space, 
  Typography,
  Divider,
  Spin,
  Row,
  Col,
  App
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { 
  getCouponDetail, 
  createCoupon, 
  updateCoupon, 
  CouponData, 
  getCouponRuleList,
  getCouponBatchList
} from '@/api/coupon';
import { AppDispatch, RootState } from '@/store';
import { fetchCouponDetail, clearCouponDetail } from '@/store/slices/couponSlice';
import { ArrowLeftOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 优惠券表单数据接口
interface CouponFormData {
  name: string;
  type: string;
  batchId?: number;
  ruleId?: number;
  value: number;
  maxDiscount?: number;
  minSpend: number;
  totalQuantity: number;
  userLimit: number;
  isStackable: number;
  validDate?: [moment.Moment, moment.Moment];
  startTime?: string;
  endTime?: string;
  categoryIds: string[];
  brandIds: string[];
  productIds: string[];
  status: string;
}

// 商品分类接口
interface Category {
  id: number;
  name: string;
}

// 品牌接口
interface Brand {
  id: number;
  name: string;
}

// 商品接口
interface Product {
  id: number;
  name: string;
}

const CouponForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [couponType, setCouponType] = useState<string>('FIXED');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [rules, setRules] = useState<{ruleId: number, name: string}[]>([]);
  const [batches, setBatches] = useState<{batchId: number, couponName: string}[]>([]);
  const [fetchingOptions, setFetchingOptions] = useState(false);

  const { couponDetail } = useSelector((state: RootState) => state.coupon);

  // 表单初始值
  const initialValues: CouponFormData = {
    name: '',
    type: 'FIXED',
    value: 0,
    maxDiscount: 0,
    minSpend: 0,
    totalQuantity: 0,
    userLimit: 1,
    isStackable: 0,
    categoryIds: [],
    brandIds: [],
    productIds: [],
    status: 'ACTIVE'
  };

  // 加载分类、品牌、规则和批次数据
  useEffect(() => {
    fetchOptions();
  }, []);

  // 判断是否为编辑模式
  useEffect(() => {
    if (id) {
      setIsEdit(true);
      fetchCouponData(id);
    }
    
    // 组件卸载时清除优惠券详情
    return () => {
      dispatch(clearCouponDetail());
    };
  }, [id, dispatch]);

  // 监听优惠券类型变化
  useEffect(() => {
    const type = form.getFieldValue('type');
    if (type) {
      setCouponType(type);
    }
  }, [form]);

  // 监听Redux中的优惠券详情变化
  useEffect(() => {
    if (couponDetail && isEdit) {
      // 处理日期范围
      let validDateRange = undefined;
      if (couponDetail.startTime && couponDetail.endTime) {
        validDateRange = [
          moment(couponDetail.startTime),
          moment(couponDetail.endTime)
        ];
      }
      
      // 处理分类和品牌ID
      const categoryIds = couponDetail.categoryIds ? 
        (typeof couponDetail.categoryIds === 'string' ? 
          couponDetail.categoryIds.split(',').map(id => parseInt(id)) : 
          couponDetail.categoryIds) : 
        [];
      
      const brandIds = couponDetail.brandIds ? 
        (typeof couponDetail.brandIds === 'string' ? 
          couponDetail.brandIds.split(',').map(id => parseInt(id)) : 
          couponDetail.brandIds) : 
        [];
        
      const productIds = couponDetail.productIds ? 
        (typeof couponDetail.productIds === 'string' ? 
          couponDetail.productIds.split(',').map(id => parseInt(id)) : 
          couponDetail.productIds) : 
        [];
      
      // 设置表单值
      form.setFieldsValue({
        ...couponDetail,
        validDate: validDateRange,
        categoryIds,
        brandIds,
        productIds
      });
      
      setCouponType(couponDetail.type);
    }
  }, [couponDetail, isEdit, form]);

  // 获取优惠券详情
  const fetchCouponData = async (couponId: string) => {
    setLoading(true);
    try {
      dispatch(fetchCouponDetail(parseInt(couponId)));
    } catch (error) {
      console.error('获取优惠券详情失败', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取所有选项数据
  const fetchOptions = async () => {
    setFetchingOptions(true);
    try {
      // 获取分类列表
      try {
        // 这里应该调用真实的分类API
        // 示例: const categoryResponse = await getCategoryList();
        // 临时使用一些示例数据
        setCategories([
          { id: 1, name: '母婴用品' },
          { id: 2, name: '食品' },
          { id: 3, name: '玩具' },
          { id: 4, name: '服装' }
        ]);
      } catch (error) {
        console.error('获取分类列表失败', error);
      }
      
      // 获取品牌列表
      try {
        // 这里应该调用真实的品牌API
        // 示例: const brandResponse = await getBrandList();
        // 临时使用一些示例数据
        setBrands([
          { id: 1, name: '品牌1' },
          { id: 2, name: '品牌2' },
          { id: 3, name: '品牌3' },
          { id: 4, name: '品牌4' }
        ]);
      } catch (error) {
        console.error('获取品牌列表失败', error);
      }
      
      // 获取商品列表
      try {
        // 这里应该调用真实的商品API
        // 示例: const productResponse = await getProductList();
        // 临时使用一些示例数据
        setProducts([
          { id: 1, name: '商品1' },
          { id: 2, name: '商品2' },
          { id: 3, name: '商品3' }
        ]);
      } catch (error) {
        console.error('获取商品列表失败', error);
      }
      
      // 获取规则列表
      try {
        const ruleResponse = await getCouponRuleList({ page: 1, size: 100 });
        if (ruleResponse && ruleResponse.data && ruleResponse.data.records) {
          setRules(ruleResponse.data.records.map((rule: any) => ({
            ruleId: rule.ruleId,
            name: rule.name
          })));
        }
      } catch (error) {
        console.error('获取规则列表失败', error);
      }
      
      // 获取批次列表
      try {
        const batchResponse = await getCouponBatchList({ page: 1, size: 100 });
        if (batchResponse && batchResponse.data && batchResponse.data.records) {
          setBatches(batchResponse.data.records.map((batch: any) => ({
            batchId: batch.batchId,
            couponName: batch.couponName
          })));
        }
      } catch (error) {
        console.error('获取批次列表失败', error);
      }
      
    } finally {
      setFetchingOptions(false);
    }
  };

  // 提交表单
  const handleSubmit = async (values: CouponFormData, context: any) => {
    setLoading(true);
    try {
      const couponData = { ...values };
      
      // 处理有效期
      if (couponData.validDate && couponData.validDate.length === 2) {
        couponData.startTime = couponData.validDate[0].format('YYYY-MM-DD HH:mm:ss');
        couponData.endTime = couponData.validDate[1].format('YYYY-MM-DD HH:mm:ss');
      }
      delete couponData.validDate;
      
      // 处理分类、品牌和商品ID
      if (couponData.categoryIds && couponData.categoryIds.length > 0) {
        couponData.categoryIds = couponData.categoryIds.join(',');
      } else {
        couponData.categoryIds = '';
      }
      
      if (couponData.brandIds && couponData.brandIds.length > 0) {
        couponData.brandIds = couponData.brandIds.join(',');
      } else {
        couponData.brandIds = '';
      }
      
      if (couponData.productIds && couponData.productIds.length > 0) {
        couponData.productIds = couponData.productIds.join(',');
      } else {
        couponData.productIds = '';
      }
      
      // 提交表单
      if (isEdit && id) {
        await updateCoupon(id, couponData);
        context.message.success('更新成功');
      } else {
        await createCoupon(couponData);
        context.message.success('创建成功');
      }
      
      // 返回列表页
      navigate('/coupon/list');
      
    } catch (error) {
      context.message.error(isEdit ? '更新失败' : '创建失败');
      console.error('提交表单失败', error);
    } finally {
      setLoading(false);
    }
  };

  // 返回列表页
  const goBack = () => {
    navigate('/coupon/list');
  };

  // 表单验证不通过处理
  const onFinishFailed = (errorInfo: any, context: any) => {
    context.message.error('请检查表单填写是否正确');
    console.error('表单错误:', errorInfo);
  };

  // 优惠券类型变更处理
  const handleTypeChange = (e: any) => {
    setCouponType(e.target.value);
  };

  return (
    <App> {/* 使用App组件作为上下文提供者 */}
      {(context) => (
        <div className="app-container" style={{ padding: 24 }}>
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
                  返回
                </Button>
                <Title level={4} style={{ margin: 0 }}>
                  {isEdit ? '编辑优惠券' : '新建优惠券'}
                </Title>
              </Space>
            </div>
            
            <Divider />
            
            <Spin spinning={loading || fetchingOptions}>
              <Form
                form={form}
                layout="vertical"
                initialValues={initialValues}
                onFinish={(values) => handleSubmit(values, context)}
                onFinishFailed={(errorInfo) => onFinishFailed(errorInfo, context)}
                requiredMark="optional"
              >
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="优惠券名称"
                      rules={[{ required: true, message: '请输入优惠券名称' }]}
                    >
                      <Input placeholder="请输入优惠券名称" maxLength={50} />
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      name="type"
                      label="优惠券类型"
                      rules={[{ required: true, message: '请选择优惠券类型' }]}
                    >
                      <Radio.Group onChange={handleTypeChange}>
                        <Radio value="FIXED">固定金额</Radio>
                        <Radio value="PERCENTAGE">折扣比例</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="value"
                      label={couponType === 'FIXED' ? '优惠金额' : '折扣比例'}
                      rules={[{ required: true, message: '请输入优惠值' }]}
                    >
                      <InputNumber
                        min={0}
                        precision={couponType === 'FIXED' ? 2 : 1}
                        style={{ width: '100%' }}
                        placeholder={couponType === 'FIXED' ? '请输入优惠金额' : '请输入折扣比例，如9.5代表9.5折'}
                        addonBefore={couponType === 'FIXED' ? '¥' : ''}
                        addonAfter={couponType === 'PERCENTAGE' ? '折' : ''}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      name="minSpend"
                      label="最低消费金额"
                      rules={[{ required: true, message: '请输入最低消费金额' }]}
                      tooltip="设置为0表示无限制"
                    >
                      <InputNumber
                        min={0}
                        precision={2}
                        style={{ width: '100%' }}
                        placeholder="请输入最低消费金额，0表示无限制"
                        addonBefore="¥"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                {couponType === 'PERCENTAGE' && (
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        name="maxDiscount"
                        label="最大折扣金额"
                        tooltip="折扣优惠券可使用的最大优惠金额，设置为0表示无限制"
                      >
                        <InputNumber
                          min={0}
                          precision={2}
                          style={{ width: '100%' }}
                          placeholder="请输入最大折扣金额，0表示无限制"
                          addonBefore="¥"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item
                      name="totalQuantity"
                      label="发行总量"
                      rules={[{ required: true, message: '请输入发行总量' }]}
                      tooltip="设置为0表示不限量"
                    >
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="请输入发行总量，0表示不限量"
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col span={8}>
                    <Form.Item
                      name="userLimit"
                      label="每用户领取限制"
                      rules={[{ required: true, message: '请输入每用户领取限制' }]}
                      tooltip="设置为0表示不限制每个用户可领取的数量"
                    >
                      <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        placeholder="请输入每用户领取限制，0表示不限制"
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col span={8}>
                    <Form.Item
                      name="isStackable"
                      label="是否可叠加使用"
                      rules={[{ required: true, message: '请选择是否可叠加使用' }]}
                      tooltip="是否允许与其他优惠券同时使用"
                    >
                      <Radio.Group>
                        <Radio value={1}>可叠加</Radio>
                        <Radio value={0}>不可叠加</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="validDate"
                      label="有效期"
                      rules={[{ required: true, message: '请选择有效期' }]}
                    >
                      <RangePicker
                        style={{ width: '100%' }}
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder={['开始时间', '结束时间']}
                      />
                    </Form.Item>
                  </Col>
                  
                  <Col span={12}>
                    <Form.Item
                      name="status"
                      label="状态"
                      rules={[{ required: true, message: '请选择状态' }]}
                    >
                      <Radio.Group>
                        <Radio value="ACTIVE">启用</Radio>
                        <Radio value="INACTIVE">禁用</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Divider orientation="left">适用范围</Divider>
                
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item
                      name="categoryIds"
                      label="适用分类"
                      tooltip="不选择则表示适用于所有分类"
                    >
                      <Select
                        mode="multiple"
                        placeholder="请选择适用分类"
                        allowClear
                        style={{ width: '100%' }}
                      >
                        {categories.map(category => (
                          <Option key={category.id} value={category.id}>{category.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col span={8}>
                    <Form.Item
                      name="brandIds"
                      label="适用品牌"
                      tooltip="不选择则表示适用于所有品牌"
                    >
                      <Select
                        mode="multiple"
                        placeholder="请选择适用品牌"
                        allowClear
                        style={{ width: '100%' }}
                      >
                        {brands.map(brand => (
                          <Option key={brand.id} value={brand.id}>{brand.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  
                  <Col span={8}>
                    <Form.Item
                      name="productIds"
                      label="适用商品"
                      tooltip="不选择则表示适用于所有商品"
                    >
                      <Select
                        mode="multiple"
                        placeholder="请选择适用商品"
                        allowClear
                        style={{ width: '100%' }}
                      >
                        {products.map(product => (
                          <Option key={product.id} value={product.id}>{product.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                
                {isEdit && (
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        name="batchId"
                        label="关联批次"
                      >
                        <Select
                          placeholder="请选择关联批次"
                          allowClear
                          style={{ width: '100%' }}
                        >
                          {batches.map(batch => (
                            <Option key={batch.batchId} value={batch.batchId}>{batch.couponName}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                      <Form.Item
                        name="ruleId"
                        label="关联规则"
                      >
                        <Select
                          placeholder="请选择关联规则"
                          allowClear
                          style={{ width: '100%' }}
                        >
                          {rules.map(rule => (
                            <Option key={rule.ruleId} value={rule.ruleId}>{rule.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                
                <Divider />
                
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                      {isEdit ? '保存修改' : '创建优惠券'}
                    </Button>
                    <Button onClick={goBack} icon={<CloseOutlined />}>取消</Button>
                  </Space>
                </Form.Item>
              </Form>
            </Spin>
          </Card>
        </div>
      )}
    </App>
  );
};

export default CouponForm; 