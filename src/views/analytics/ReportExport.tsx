import React from 'react';
import { Card, Typography, Alert, Tabs, Table, Button, Space, Select, DatePicker, Form, Radio } from 'antd';
import { FileExcelOutlined, FilePdfOutlined, FileTextOutlined, HistoryOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

/**
 * 报表导出页面（占位符）
 * 实际功能将在后续开发
 */
const ReportExport: React.FC = () => {
  // 模拟的报表模板数据
  const mockTemplates = [
    {
      id: '1',
      name: '销售概览报表',
      description: '展示销售额、订单数等关键指标的概览报表',
      type: 'sales',
    },
    {
      id: '2',
      name: '用户增长报表',
      description: '展示用户注册、活跃等数据的报表',
      type: 'users',
    },
    {
      id: '3',
      name: '商品销量报表',
      description: '展示各商品销量、库存等数据的报表',
      type: 'products',
    }
  ];
  
  // 模拟的导出历史数据
  const mockExportHistory = [
    {
      id: '1',
      reportId: '1',
      reportName: '销售概览报表',
      exportedBy: 'admin',
      exportedAt: '2023-05-20T10:30:00Z',
      format: 'excel',
      status: 'success',
      downloadUrl: '#'
    },
    {
      id: '2',
      reportId: '2',
      reportName: '用户增长报表',
      exportedBy: 'admin',
      exportedAt: '2023-05-19T15:45:00Z',
      format: 'pdf',
      status: 'success',
      downloadUrl: '#'
    },
    {
      id: '3',
      reportId: '3',
      reportName: '商品销量报表',
      exportedBy: 'admin',
      exportedAt: '2023-05-18T09:15:00Z',
      format: 'csv',
      status: 'failed',
      errorMessage: '导出过程中出现错误'
    }
  ];
  
  // 导出历史表格列定义
  const historyColumns = [
    {
      title: '报表名称',
      dataIndex: 'reportName',
      key: 'reportName',
    },
    {
      title: '导出者',
      dataIndex: 'exportedBy',
      key: 'exportedBy',
    },
    {
      title: '导出时间',
      dataIndex: 'exportedAt',
      key: 'exportedAt',
      render: (text: string) => {
        const date = new Date(text);
        return date.toLocaleString();
      }
    },
    {
      title: '格式',
      dataIndex: 'format',
      key: 'format',
      render: (text: string) => {
        switch (text) {
          case 'excel':
            return <Space><FileExcelOutlined style={{ color: '#217346' }} /> Excel</Space>;
          case 'pdf':
            return <Space><FilePdfOutlined style={{ color: '#ff0000' }} /> PDF</Space>;
          case 'csv':
            return <Space><FileTextOutlined style={{ color: '#1890ff' }} /> CSV</Space>;
          default:
            return text;
        }
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text: string, record: any) => {
        if (text === 'success') {
          return <span style={{ color: 'green' }}>成功</span>;
        }
        return <span style={{ color: 'red' }} title={record.errorMessage}>失败</span>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: any) => (
        <Space size="middle">
          {record.status === 'success' && (
            <Button 
              type="link" 
              icon={<DownloadOutlined />} 
              onClick={() => console.log('Download', record.id)}
            >
              下载
            </Button>
          )}
        </Space>
      ),
    }
  ];
  
  return (
    <div className="report-export-container">
      <Title level={4}>报表导出</Title>
      
      <Alert
        message="功能开发中"
        description="报表导出功能正在开发中，目前仅展示模拟界面，敬请期待完整功能！"
        type="info"
        showIcon
        className="mb-4"
      />
      
      <Tabs defaultActiveKey="export">
        <TabPane 
          tab={<span><DownloadOutlined />导出报表</span>} 
          key="export"
        >
          <Card>
            <Form layout="vertical">
              <Form.Item label="选择报表模板" required>
                <Select
                  placeholder="请选择报表模板"
                  style={{ width: '100%' }}
                  options={mockTemplates.map(template => ({
                    label: template.name,
                    value: template.id,
                    title: template.description
                  }))}
                />
              </Form.Item>
              
              <Form.Item label="导出格式" required>
                <Radio.Group defaultValue="excel">
                  <Radio.Button value="excel">
                    <Space><FileExcelOutlined /> Excel</Space>
                  </Radio.Button>
                  <Radio.Button value="pdf">
                    <Space><FilePdfOutlined /> PDF</Space>
                  </Radio.Button>
                  <Radio.Button value="csv">
                    <Space><FileTextOutlined /> CSV</Space>
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item label="时间范围">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item label="附加选项">
                <Card size="small">
                  <Form.Item label="输出页面大小" style={{ marginBottom: 8 }}>
                    <Select
                      defaultValue="A4"
                      style={{ width: 200 }}
                      options={[
                        { label: 'A4', value: 'A4' },
                        { label: 'A3', value: 'A3' },
                        { label: 'Letter', value: 'Letter' },
                        { label: 'Legal', value: 'Legal' },
                      ]}
                    />
                  </Form.Item>
                  
                  <Form.Item label="页面方向" style={{ marginBottom: 0 }}>
                    <Radio.Group defaultValue="portrait">
                      <Radio value="portrait">纵向</Radio>
                      <Radio value="landscape">横向</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Card>
              </Form.Item>
              
              <Form.Item>
                <Button type="primary">
                  导出报表
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane 
          tab={<span><HistoryOutlined />导出历史</span>} 
          key="history"
        >
          <Card>
            <Table 
              columns={historyColumns} 
              dataSource={mockExportHistory}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ReportExport; 