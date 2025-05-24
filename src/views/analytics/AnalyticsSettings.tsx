import React from 'react';
import { Card, Typography, Alert, Form, Input, Select, Switch, Button, Divider, Space, Collapse } from 'antd';
import { SettingOutlined, SaveOutlined, RollbackOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

/**
 * 分析设置页面（占位符）
 * 实际功能将在后续开发
 */
const AnalyticsSettings: React.FC = () => {
  return (
    <div className="analytics-settings-container">
      <Title level={4}>分析设置</Title>
      
      <Alert
        message="功能开发中"
        description="分析设置功能正在开发中，目前仅展示模拟界面，敬请期待完整功能！"
        type="info"
        showIcon
        className="mb-4"
      />
      
      <Form layout="vertical">
        <Card title="基本设置" className="mb-4">
          <Form.Item label="默认数据范围" name="defaultTimeRange">
            <Select defaultValue="month">
              <Option value="today">今日</Option>
              <Option value="yesterday">昨日</Option>
              <Option value="week">本周</Option>
              <Option value="month">本月</Option>
              <Option value="quarter">本季度</Option>
              <Option value="year">本年</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="刷新频率" name="refreshInterval">
            <Select defaultValue="0">
              <Option value="0">不自动刷新</Option>
              <Option value="30">每30秒</Option>
              <Option value="60">每分钟</Option>
              <Option value="300">每5分钟</Option>
              <Option value="600">每10分钟</Option>
              <Option value="1800">每30分钟</Option>
              <Option value="3600">每小时</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="默认导出格式" name="defaultExportFormat">
            <Select defaultValue="excel">
              <Option value="excel">Excel</Option>
              <Option value="pdf">PDF</Option>
              <Option value="csv">CSV</Option>
            </Select>
          </Form.Item>
        </Card>
        
        <Card title="显示设置" className="mb-4">
          <Form.Item label="默认图表主题" name="chartTheme">
            <Select defaultValue="light">
              <Option value="light">明亮</Option>
              <Option value="dark">暗黑</Option>
              <Option value="colorful">多彩</Option>
              <Option value="vintage">复古</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="数据表格密度" name="tableDensity">
            <Select defaultValue="medium">
              <Option value="small">紧凑</Option>
              <Option value="medium">标准</Option>
              <Option value="large">宽松</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="显示网格线" name="showGridLines" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
          
          <Form.Item label="显示数据标签" name="showDataLabels" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
        </Card>
        
        <Collapse className="mb-4">
          <Panel header="高级设置" key="1">
            <Form.Item label="指标别名设置" extra="自定义报表中显示的指标名称">
              <Card size="small">
                <Form.Item label="销售额" name="aliasGmv">
                  <Input placeholder="自定义销售额的显示名称" />
                </Form.Item>
                
                <Form.Item label="订单数" name="aliasOrderCount">
                  <Input placeholder="自定义订单数的显示名称" />
                </Form.Item>
                
                <Form.Item label="用户数" name="aliasUserCount">
                  <Input placeholder="自定义用户数的显示名称" />
                </Form.Item>
                
                <Form.Item label="转化率" name="aliasConversionRate">
                  <Input placeholder="自定义转化率的显示名称" />
                </Form.Item>
              </Card>
            </Form.Item>
            
            <Form.Item label="数据缓存时间" name="dataCacheTtl">
              <Select defaultValue="300">
                <Option value="0">不缓存</Option>
                <Option value="60">1分钟</Option>
                <Option value="300">5分钟</Option>
                <Option value="600">10分钟</Option>
                <Option value="1800">30分钟</Option>
                <Option value="3600">1小时</Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="报表最大行数" name="maxReportRows">
              <Select defaultValue="1000">
                <Option value="100">100行</Option>
                <Option value="500">500行</Option>
                <Option value="1000">1000行</Option>
                <Option value="5000">5000行</Option>
                <Option value="10000">10000行</Option>
                <Option value="-1">不限制</Option>
              </Select>
            </Form.Item>
          </Panel>
        </Collapse>
        
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SaveOutlined />}>
              保存设置
            </Button>
            <Button icon={<RollbackOutlined />}>
              恢复默认
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AnalyticsSettings; 