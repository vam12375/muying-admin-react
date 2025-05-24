import React, { useState } from 'react';
import { Tabs, Typography, Breadcrumb, Spin } from 'antd';
import { 
  LineChartOutlined, 
  BarChartOutlined, 
  PieChartOutlined, 
  TableOutlined,
  ExportOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

// 将会导入的子页面组件
const AnalyticsDashboard = React.lazy(() => import('./Dashboard'));
const MultiDimensionAnalysis = React.lazy(() => import('./MultiDimensionAnalysis'));
const CustomReports = React.lazy(() => import('./CustomReports'));
const ReportExport = React.lazy(() => import('./ReportExport'));
const AnalyticsSettings = React.lazy(() => import('./AnalyticsSettings'));

const { Title } = Typography;
const { TabPane } = Tabs;

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // 从路径中提取活动标签
  React.useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && path !== 'analytics') {
      setActiveTab(path);
    } else {
      setActiveTab('dashboard');
    }
  }, [location]);
  
  // 处理标签切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    navigate(`/analytics/${key === 'dashboard' ? '' : key}`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="analytics-container p-6"
    >
      {/* 面包屑导航 */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item>首页</Breadcrumb.Item>
        <Breadcrumb.Item>数据分析</Breadcrumb.Item>
        <Breadcrumb.Item>
          {activeTab === 'dashboard' && '仪表盘'}
          {activeTab === 'multi-dimension' && '多维分析'}
          {activeTab === 'custom-reports' && '自定义报表'}
          {activeTab === 'export' && '报表导出'}
          {activeTab === 'settings' && '分析设置'}
        </Breadcrumb.Item>
      </Breadcrumb>
      
      {/* 页面标题 */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="m-0">数据分析</Title>
      </div>
      
      {/* 标签导航 */}
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange}
        className="analytics-tabs"
        type="card"
      >
        <TabPane 
          tab={<span><LineChartOutlined />仪表盘</span>} 
          key="dashboard"
        >
          <React.Suspense fallback={<div className="py-12 flex justify-center"><Spin size="large" /></div>}>
            <AnalyticsDashboard />
          </React.Suspense>
        </TabPane>
        
        <TabPane 
          tab={<span><BarChartOutlined />多维分析</span>} 
          key="multi-dimension"
        >
          <React.Suspense fallback={<div className="py-12 flex justify-center"><Spin size="large" /></div>}>
            <MultiDimensionAnalysis />
          </React.Suspense>
        </TabPane>
        
        <TabPane 
          tab={<span><PieChartOutlined />自定义报表</span>} 
          key="custom-reports"
        >
          <React.Suspense fallback={<div className="py-12 flex justify-center"><Spin size="large" /></div>}>
            <CustomReports />
          </React.Suspense>
        </TabPane>
        
        <TabPane 
          tab={<span><ExportOutlined />报表导出</span>} 
          key="export"
        >
          <React.Suspense fallback={<div className="py-12 flex justify-center"><Spin size="large" /></div>}>
            <ReportExport />
          </React.Suspense>
        </TabPane>
        
        <TabPane 
          tab={<span><SettingOutlined />分析设置</span>} 
          key="settings"
        >
          <React.Suspense fallback={<div className="py-12 flex justify-center"><Spin size="large" /></div>}>
            <AnalyticsSettings />
          </React.Suspense>
        </TabPane>
      </Tabs>
    </motion.div>
  );
};

export default Analytics; 