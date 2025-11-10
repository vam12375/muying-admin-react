import React, { useState, useEffect, useCallback } from 'react';
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
  Upload,
  Image,
  Alert,
  Tabs,
  Checkbox,
  TreeSelect,
  Tag,
  Tooltip,
  Progress,
  Steps
} from 'antd';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
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
import {
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Step } = Steps;

// 优惠券表单数据接口
interface CouponFormData {
  name: string;
  description?: string;
  type: string;
  batchId?: number;
  ruleId?: number;
  value: number;
  maxDiscount?: number;
  minSpend: number;
  totalQuantity: number;
  userLimit: number;
  isStackable: number;
  validDate?: [dayjs.Dayjs, dayjs.Dayjs];
  startTime?: string;
  endTime?: string;
  categoryIds: string[];
  brandIds: string[];
  productIds: string[];
  status: string;
  image?: string;
  tags?: string[];
  priority?: number;
  autoReceive?: boolean;
  receiveStartTime?: string;
  receiveEndTime?: string;
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
  const location = useLocation();
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
  const [currentStep, setCurrentStep] = useState(0);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState('');
  const [inputVisible, setInputVisible] = useState(false);

  const { couponDetail } = useSelector((state: RootState) => state.coupon);

  // 表单初始值
  const initialValues = useCallback((): CouponFormData => ({
    name: '',
    description: '',
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
    status: 'ACTIVE',
    image: '',
    tags: [],
    priority: 1,
    autoReceive: false
  }), []);

  // 处理复制模式
  useEffect(() => {
    if (location.state?.copyFrom) {
      const copyData = location.state.copyFrom;
      const formData = {
        ...copyData,
        name: location.state.name || `${copyData.name}_副本`,
        id: undefined, // 清除ID
        totalQuantity: 0,
        usedQuantity: 0,
        receivedQuantity: 0,
        status: 'INACTIVE' // 复制的优惠券默认为未激活状态
      };
      form.setFieldsValue(formData);
      setCouponType(copyData.type || 'FIXED');
    }
  }, [location.state, form]);

  // 加载分类、品牌、规则和批次数据
  useEffect(() => {
    fetchOptions();
  }, []);

  // 判断是否为编辑模式
  useEffect(() => {
    if (id) {
      setIsEdit(true);
      console.log('编辑模式，优惠券ID:', id);
      fetchCouponData(id);
    } else {
      console.log('创建模式');
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
      console.log('设置表单数据:', couponDetail);

      // 处理日期范围
      let validDateRange = undefined;
      if (couponDetail.startTime && couponDetail.endTime) {
        validDateRange = [
          dayjs(couponDetail.startTime),
          dayjs(couponDetail.endTime)
        ];
      }

      // 处理分类和品牌ID
      const categoryIds = couponDetail.categoryIds ?
        (typeof couponDetail.categoryIds === 'string' ?
          couponDetail.categoryIds.split(',').filter(id => id).map(id => parseInt(id)) :
          couponDetail.categoryIds) :
        [];

      const brandIds = couponDetail.brandIds ?
        (typeof couponDetail.brandIds === 'string' ?
          couponDetail.brandIds.split(',').filter(id => id).map(id => parseInt(id)) :
          couponDetail.brandIds) :
        [];

      const productIds = couponDetail.productIds ?
        (typeof couponDetail.productIds === 'string' ?
          couponDetail.productIds.split(',').filter(id => id).map(id => parseInt(id)) :
          couponDetail.productIds) :
        [];

      // 设置表单值
      const formData = {
        name: couponDetail.name || '',
        type: couponDetail.type || 'FIXED',
        value: couponDetail.value || 0,
        maxDiscount: couponDetail.maxDiscount || 0,
        minSpend: couponDetail.minSpend || 0,
        totalQuantity: couponDetail.totalQuantity || 0,
        userLimit: couponDetail.userLimit || 1,
        isStackable: couponDetail.isStackable ? 1 : 0,
        validDate: validDateRange,
        categoryIds,
        brandIds,
        productIds,
        status: couponDetail.status || 'ACTIVE',
        batchId: couponDetail.batchId,
        ruleId: couponDetail.ruleId
      };

      console.log('表单数据:', formData);
      form.setFieldsValue(formData);
      setCouponType(couponDetail.type || 'FIXED');
    }
  }, [couponDetail, isEdit, form]);

  // 获取优惠券详情
  const fetchCouponData = async (couponId: string) => {
    setLoading(true);
    try {
      console.log('获取优惠券详情，ID:', couponId);
      await dispatch(fetchCouponDetail(parseInt(couponId)));
    } catch (error) {
      console.error('获取优惠券详情失败', error);
      message.error('获取优惠券详情失败');
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
  const handleSubmit = async (values: CouponFormData) => {
    setLoading(true);
    try {
      const couponData = { ...values };

      // 处理有效期 - 使用后端期望的格式
      if (couponData.validDate && couponData.validDate.length === 2) {
        couponData.startTime = couponData.validDate[0].format('YYYY-MM-DD HH:mm:ss');
        couponData.endTime = couponData.validDate[1].format('YYYY-MM-DD HH:mm:ss');
      }
      delete couponData.validDate;

      // 处理分类、品牌和商品ID
      if (couponData.categoryIds && Array.isArray(couponData.categoryIds) && couponData.categoryIds.length > 0) {
        (couponData as any).categoryIds = couponData.categoryIds.join(',');
      } else {
        (couponData as any).categoryIds = '';
      }

      if (couponData.brandIds && Array.isArray(couponData.brandIds) && couponData.brandIds.length > 0) {
        (couponData as any).brandIds = couponData.brandIds.join(',');
      } else {
        (couponData as any).brandIds = '';
      }

      if (couponData.productIds && Array.isArray(couponData.productIds) && couponData.productIds.length > 0) {
        (couponData as any).productIds = couponData.productIds.join(',');
      } else {
        (couponData as any).productIds = '';
      }

      // 提交表单
      if (isEdit && id) {
        await updateCoupon(id, couponData);
        message.success('更新成功');
      } else {
        await createCoupon(couponData);
        message.success('创建成功');
      }

      // 返回列表页
      navigate('/coupon/list');

    } catch (error) {
      message.error(isEdit ? '更新失败' : '创建失败');
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
  const onFinishFailed = (errorInfo: any) => {
    message.error('请检查表单填写是否正确');
    console.error('表单错误:', errorInfo);
  };

  // 优惠券类型变更处理
  const handleTypeChange = useCallback((e: any) => {
    setCouponType(e.target.value);

    // 如果切换到固定金额类型，清除最大折扣金额
    if (e.target.value === 'FIXED') {
      form.setFieldsValue({ maxDiscount: 0 });
    }
  }, [form]);

  // 处理图片上传
  const handleImageUpload = async (file: File) => {
    setUploadLoading(true);
    try {
      // 这里应该调用实际的上传API
      // const response = await uploadImage(file);
      // setImageUrl(response.data.url);

      // 模拟上传
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result as string);
        form.setFieldsValue({ image: reader.result as string });
      };
      reader.readAsDataURL(file);

      message.success('图片上传成功');
    } catch (error) {
      message.error('图片上传失败');
    } finally {
      setUploadLoading(false);
    }
  };

  // 处理标签添加
  const handleTagAdd = () => {
    if (inputTag && !tags.includes(inputTag)) {
      const newTags = [...tags, inputTag];
      setTags(newTags);
      form.setFieldsValue({ tags: newTags });
      setInputTag('');
    }
    setInputVisible(false);
  };

  // 处理标签删除
  const handleTagRemove = (removedTag: string) => {
    const newTags = tags.filter(tag => tag !== removedTag);
    setTags(newTags);
    form.setFieldsValue({ tags: newTags });
  };

  // 步骤验证
  const validateCurrentStep = async () => {
    try {
      const fieldsToValidate = getFieldsForStep(currentStep);
      await form.validateFields(fieldsToValidate);
      return true;
    } catch (error) {
      return false;
    }
  };

  // 获取当前步骤需要验证的字段
  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 0:
        return ['name', 'description', 'type', 'value', 'minSpend'];
      case 1:
        return ['totalQuantity', 'userLimit', 'validDate'];
      case 2:
        return [];
      default:
        return [];
    }
  };

  // 下一步
  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  // 上一步
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
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

        <Spin spinning={loading || fetchingOptions} tip={loading ? "加载优惠券数据中..." : "加载选项数据中..."}>
          {/* 步骤指示器 */}
          <Steps current={currentStep} style={{ marginBottom: 24 }}>
            <Step title="基本信息" description="设置优惠券基本信息" icon={<InfoCircleOutlined />} />
            <Step title="使用规则" description="配置使用条件和限制" icon={<ExclamationCircleOutlined />} />
            <Step title="高级设置" description="图片、标签等高级配置" icon={<CheckCircleOutlined />} />
          </Steps>

          <Form
            form={form}
            layout="vertical"
            initialValues={initialValues()}
            onFinish={handleSubmit}
            onFinishFailed={onFinishFailed}
            requiredMark="optional"
          >
            {/* 步骤1: 基本信息 */}
            {currentStep === 0 && (
              <Card title="基本信息" style={{ marginBottom: 16 }}>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="优惠券名称"
                      rules={[
                        { required: true, message: '请输入优惠券名称' },
                        { min: 2, max: 50, message: '优惠券名称长度应在2-50个字符之间' }
                      ]}
                    >
                      <Input placeholder="请输入优惠券名称" maxLength={50} showCount />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="status"
                      label="优惠券状态"
                      rules={[{ required: true, message: '请选择优惠券状态' }]}
                    >
                      <Select placeholder="请选择优惠券状态">
                        <Option value="ACTIVE">生效中</Option>
                        <Option value="INACTIVE">未生效</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item
                      name="description"
                      label="优惠券描述"
                      rules={[{ max: 200, message: '描述长度不能超过200个字符' }]}
                    >
                      <TextArea
                        rows={3}
                        placeholder="请输入优惠券描述信息，将显示给用户"
                        showCount
                        maxLength={200}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col span={24}>
                    <Form.Item
                      name="type"
                      label="优惠券类型"
                      rules={[{ required: true, message: '请选择优惠券类型' }]}
                    >
                      <Radio.Group onChange={handleTypeChange}>
                        <Radio value="FIXED">
                          <div>
                            <div>固定金额</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              减免固定金额，如减10元
                            </div>
                          </div>
                        </Radio>
                        <Radio value="PERCENTAGE">
                          <div>
                            <div>折扣比例</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              按比例折扣，如9.5折
                            </div>
                          </div>
                        </Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="value"
                      label={couponType === 'FIXED' ? '优惠金额' : '折扣比例'}
                      rules={[
                        { required: true, message: '请输入优惠值' },
                        {
                          validator: (_, value) => {
                            if (couponType === 'FIXED' && value <= 0) {
                              return Promise.reject('固定金额必须大于0');
                            }
                            if (couponType === 'PERCENTAGE' && (value <= 0 || value > 10)) {
                              return Promise.reject('折扣比例必须在0-10之间');
                            }
                            return Promise.resolve();
                          }
                        }
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={couponType === 'PERCENTAGE' ? 10 : undefined}
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
                      rules={[
                        { required: true, message: '请输入最低消费金额' },
                        {
                          validator: (_, value) => {
                            const couponValue = form.getFieldValue('value');
                            if (couponType === 'FIXED' && value > 0 && value <= couponValue) {
                              return Promise.reject('最低消费金额应大于优惠金额');
                            }
                            return Promise.resolve();
                          }
                        }
                      ]}
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
              </Card>
            )}

            {/* 步骤2: 使用规则 */}
            {currentStep === 1 && (
              <Card title="使用规则" style={{ marginBottom: 16 }}>
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
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
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
                      name="priority"
                      label="优先级"
                      tooltip="数字越大优先级越高，影响优惠券的排序和推荐"
                    >
                      <InputNumber
                        min={1}
                        max={10}
                        style={{ width: '100%' }}
                        placeholder="请输入优先级(1-10)"
                      />
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
                        showTime
                        style={{ width: '100%' }}
                        placeholder={['开始时间', '结束时间']}
                        format="YYYY-MM-DD HH:mm:ss"
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      name="isStackable"
                      label="是否可叠加使用"
                      rules={[{ required: true, message: '请选择是否可叠加使用' }]}
                      tooltip="允许与其他优惠券同时使用"
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
                      name="autoReceive"
                      label="自动发放"
                      tooltip="满足条件时自动发放给用户"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
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
                        key={`date-picker-${isEdit ? id : 'create'}`}
                        style={{ width: '100%' }}
                        showTime={{
                          format: 'HH:mm:ss',
                        }}
                        format="YYYY-MM-DD HH:mm:ss"
                        placeholder={['开始时间', '结束时间']}
                        allowClear
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
                
            {/* 步骤导航按钮 */}
            <Divider />
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Space size="large">
                {currentStep > 0 && (
                  <Button onClick={prevStep}>
                    上一步
                  </Button>
                )}

                {currentStep < 2 ? (
                  <Button type="primary" onClick={nextStep}>
                    下一步
                  </Button>
                ) : (
                  <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                    {isEdit ? '保存修改' : '创建优惠券'}
                  </Button>
                )}

                <Button onClick={goBack} icon={<CloseOutlined />}>
                  取消
                </Button>
              </Space>
            </div>
              </Form>
            </Spin>
          </Card>
        </div>
  );
};

export default CouponForm; 