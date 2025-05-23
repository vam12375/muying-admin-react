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
  Typography 
} from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { getCouponDetail, createCoupon, updateCoupon } from '@/api/coupon';
import { AppDispatch, RootState } from '@/store';
import { fetchCouponDetail, clearCouponDetail } from '@/store/slices/couponSlice';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 模拟数据 - 实际项目中应从API获取
const mockCategories = [
  { id: 1, name: '母婴用品' },
  { id: 2, name: '食品' },
  { id: 3, name: '玩具' },
  { id: 4, name: '服装' }
];

const mockBrands = [
  { id: 1, name: '品牌1' },
  { id: 2, name: '品牌2' },
  { id: 3, name: '品牌3' },
  { id: 4, name: '品牌4' }
];

interface CouponFormData {
  name: string;
  type: 'FIXED' | 'PERCENTAGE';
  value: number;
  maxDiscount?: number;
  minSpend: number;
  totalQuantity: number;
  userLimit: number;
  isStackable: 0 | 1;
  validDate?: [moment.Moment, moment.Moment];
  startTime?: string;
  endTime?: string;
  categoryIds: string[];
  brandIds: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

const CouponForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [categories, setCategories] = useState(mockCategories);
  const [brands, setBrands] = useState(mockBrands);

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
    status: 'ACTIVE'
  };

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

  // 获取优惠券详情
  const fetchCouponData = async (couponId: string) => {
    setLoading(true);
    try {
      const response = await getCouponDetail(couponId);
      const couponData = response.data;
      
      // 处理日期范围
      let validDateRange = undefined;
      if (couponData.startTime && couponData.endTime) {
        validDateRange = [
          moment(couponData.startTime),
          moment(couponData.endTime)
        ];
      }
      
      // 处理分类和品牌ID
      const categoryIds = couponData.categoryIds ? 
        (typeof couponData.categoryIds === 'string' ? 
          couponData.categoryIds.split(',') : 
          couponData.categoryIds) : 
        [];
      
      const brandIds = couponData.brandIds ? 
        (typeof couponData.brandIds === 'string' ? 
          couponData.brandIds.split(',') : 
          couponData.brandIds) : 
        [];
      
      // 设置表单值
      form.setFieldsValue({
        ...couponData,
        validDate: validDateRange,
        categoryIds,
        brandIds
      });
      
    } catch (error) {
      message.error('获取优惠券详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取分类列表 - 实际项目中应从API获取
  const fetchCategories = () => {
    // 此处使用模拟数据，实际项目中应调用API
    setCategories(mockCategories);
  };

  // 获取品牌列表 - 实际项目中应从API获取
  const fetchBrands = () => {
    // 此处使用模拟数据，实际项目中应调用API
    setBrands(mockBrands);
  };

  // 提交表单
  const handleSubmit = async (values: CouponFormData) => {
    setLoading(true);
    try {
      const couponData = { ...values };
      
      // 处理有效期
      if (couponData.validDate && couponData.validDate.length === 2) {
        couponData.startTime = couponData.validDate[0].format('YYYY-MM-DD HH:mm:ss');
        couponData.endTime = couponData.validDate[1].format('YYYY-MM-DD HH:mm:ss');
      }
      delete couponData.validDate;
      
      // 处理分类和品牌
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Card title={isEdit ? '编辑优惠券' : '新建优惠券'}>
        <Form
          form={form}
          initialValues={initialValues}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="name"
            label="优惠券名称"
            rules={[
              { required: true, message: '请输入优惠券名称' },
              { min: 2, max: 20, message: '长度在 2 到 20 个字符' }
            ]}
          >
            <Input placeholder="请输入优惠券名称" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="优惠券类型"
            rules={[{ required: true, message: '请选择优惠券类型' }]}
          >
            <Radio.Group>
              <Radio value="FIXED">固定金额</Radio>
              <Radio value="PERCENTAGE">百分比折扣</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) => {
              const couponType = getFieldValue('type');
              return (
                <Form.Item
                  name="value"
                  label={couponType === 'FIXED' ? '优惠金额' : '折扣比例'}
                  rules={[{ required: true, message: '请输入优惠券面值' }]}
                >
                  <InputNumber
                    min={0}
                    precision={couponType === 'FIXED' ? 2 : 0}
                    step={couponType === 'FIXED' ? 1 : 5}
                    max={couponType === 'FIXED' ? 10000 : 100}
                    placeholder={couponType === 'FIXED' ? '请输入优惠金额' : '请输入折扣比例（1-100）'}
                    addonAfter={couponType === 'FIXED' ? '元' : '%'}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) => {
              return getFieldValue('type') === 'PERCENTAGE' ? (
                <Form.Item
                  name="maxDiscount"
                  label="最大折扣金额"
                >
                  <InputNumber
                    min={0}
                    precision={2}
                    step={10}
                    placeholder="请输入最大折扣金额"
                    addonAfter="元"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>
          
          <Form.Item
            name="minSpend"
            label="使用门槛"
            tooltip="0表示无使用门槛"
          >
            <InputNumber
              min={0}
              precision={2}
              step={10}
              placeholder="请输入使用门槛金额"
              addonAfter="元"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="totalQuantity"
            label="优惠券数量"
            tooltip="0表示不限制数量"
          >
            <InputNumber
              min={0}
              step={100}
              placeholder="请输入优惠券数量"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="userLimit"
            label="每人限领"
            tooltip="0表示不限制"
          >
            <InputNumber
              min={0}
              max={10}
              placeholder="请输入每人限领数量"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="isStackable"
            label="是否可叠加"
            tooltip="开启后，可与其他优惠券同时使用"
            valuePropName="checked"
            getValueFromEvent={(checked) => checked ? 1 : 0}
          >
            <Switch />
          </Form.Item>
          
          <Form.Item
            name="validDate"
            label="有效期"
            rules={[{ required: true, message: '请选择有效期' }]}
          >
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="categoryIds"
            label="适用分类"
            tooltip="不选择表示适用于所有分类"
          >
            <Select
              mode="multiple"
              placeholder="请选择适用分类"
              style={{ width: '100%' }}
              allowClear
            >
              {categories.map(category => (
                <Option key={category.id} value={category.id.toString()}>{category.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="brandIds"
            label="适用品牌"
            tooltip="不选择表示适用于所有品牌"
          >
            <Select
              mode="multiple"
              placeholder="请选择适用品牌"
              style={{ width: '100%' }}
              allowClear
            >
              {brands.map(brand => (
                <Option key={brand.id} value={brand.id.toString()}>{brand.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
          >
            <Radio.Group>
              <Radio value="ACTIVE">可用</Radio>
              <Radio value="INACTIVE">不可用</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                提交
              </Button>
              <Button onClick={() => navigate('/coupon/list')}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CouponForm; 