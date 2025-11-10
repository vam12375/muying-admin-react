import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Card, Row, Col, Space, Button, Badge, Tooltip, Segmented, Alert } from 'antd';
import {
  DashboardOutlined,
  CloudServerOutlined,
  ReloadOutlined,
  FireOutlined,
  FullscreenOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getSystemHealth, 
  getServerPerformance, 
  getDatabaseMetrics, 
  getRedisMetrics, 
  getApiStatistics 
} from '../../api/monitor';
import RealtimeChart from '../../components/monitor/RealtimeChart';
import EnhancedMetricCard from '../../components/monitor/EnhancedMetricCard';
import SystemHealthPanel from '../../components/monitor/SystemHealthPanel';
import DatabasePanel from '../../components/monitor/DatabasePanel';
import RedisPanel from '../../components/monitor/RedisPanel';
import ApiStatisticsPanel from '../../components/monitor/ApiStatisticsPanel';
import SkeletonLoader from '../../components/monitor/SkeletonLoader';
import './monitor.css';

// 数据接口定义
interface SystemHealth {
  status: string;
  timestamp: number;
  components: {
    [key: string]: {
      status: string;
      message: string;
      details?: any;
    };
  };
}

interface ServerPerformance {
  cpuUsage: number;
  cpuCores: number;
  systemLoadAverage: number;
  totalMemory: number;
  usedMemory: number;
  freeMemory: number;
  memoryUsage: number;
  jvmTotalMemory: number;
  jvmUsedMemory: number;
  jvmFreeMemory: number;
  jvmMemoryUsage: number;
  threadCount: number;
  peakThreadCount: number;
  totalDiskSpace: number;
  usedDiskSpace: number;
  freeDiskSpace: number;
  diskUsage: number;
  uptime: number;
  uptimeFormatted: string;
}

interface DatabaseMetrics {
  status: string;
  activeConnections: number;
  idleConnections: number;
  maxConnections: number;
  connectionUsage: number;
  totalQueries: number;
  slowQueries: number;
  avgQueryTime: number;
  databaseSize: number;
  tableSizes: { [key: string]: number };
}

interface RedisMetrics {
  status: string;
  version: string;
  connectedClients: number;
  usedMemory: number;
  usedMemoryHuman: string;
  memFragmentationRatio: number;
  totalCommandsProcessed: number;
  opsPerSec: number;
  keyspaceHits: number;
  keyspaceMisses: number;
  hitRate: number;
  totalKeys: number;
  expiredKeys: number;
  evictedKeys: number;
}

interface ApiStatistics {
  totalRequests: number;
  successRequests: number;
  failedRequests: number;
  successRate: number;
  avgResponseTime: number;
  requestsByEndpoint: { [key: string]: number };
  requestsByMethod: { [key: string]: number };
  requestsByStatus: { [key: number]: number };
  slowestApis: Array<{
    endpoint: string;
    method: string;
    avgResponseTime: number;
    maxResponseTime: number;
    requestCount: number;
  }>;
  mostFrequentApis: Array<{
    endpoint: string;
    method: string;
    requestCount: number;
    avgResponseTime: number;
  }>;
}

// 历史数据存储
interface HistoricalData {
  cpu: number[];
  memory: number[];
  disk: number[];
  jvm: number[];
  timestamps: number[];
}

const SystemMonitor: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval] = useState(5000); // 5秒
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // 数据状态
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [serverPerformance, setServerPerformance] = useState<ServerPerformance | null>(null);
  const [databaseMetrics, setDatabaseMetrics] = useState<DatabaseMetrics | null>(null);
  const [redisMetrics, setRedisMetrics] = useState<RedisMetrics | null>(null);
  const [apiStatistics, setApiStatistics] = useState<ApiStatistics | null>(null);
  
  // 历史数据（用于图表）
  const [historicalData, setHistoricalData] = useState<HistoricalData>({
    cpu: [],
    memory: [],
    disk: [],
    jvm: [],
    timestamps: []
  });

  // 获取监控数据
  const fetchMonitorData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    try {
      const [healthRes, serverRes, dbRes, redisRes, apiRes] = await Promise.all([
        getSystemHealth(),
        getServerPerformance(),
        getDatabaseMetrics(),
        getRedisMetrics(),
        getApiStatistics()
      ]);

      const healthData = healthRes.data;
      const serverData = serverRes.data;
      const dbData = dbRes.data;
      const redisData = redisRes.data;
      const apiData = apiRes.data;

      setHealth(healthData);
      setServerPerformance(serverData);
      setDatabaseMetrics(dbData);
      setRedisMetrics(redisData);
      setApiStatistics(apiData);

      // 更新历史数据
      setHistoricalData(prev => {
        const maxDataPoints = 50;
        const newTimestamp = Date.now();
        
        return {
          cpu: [...prev.cpu, serverData.cpuUsage].slice(-maxDataPoints),
          memory: [...prev.memory, serverData.memoryUsage].slice(-maxDataPoints),
          disk: [...prev.disk, serverData.diskUsage].slice(-maxDataPoints),
          jvm: [...prev.jvm, serverData.jvmMemoryUsage].slice(-maxDataPoints),
          timestamps: [...prev.timestamps, newTimestamp].slice(-maxDataPoints)
        };
      });
    } catch (error) {
      console.error('获取监控数据失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 初始加载和自动刷新
  useEffect(() => {
    fetchMonitorData(true);

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(() => fetchMonitorData(false), refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, fetchMonitorData]);

  // 手动刷新
  const handleRefresh = useCallback(() => {
    fetchMonitorData(false);
  }, [fetchMonitorData]);

  // 切换自动刷新
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  // 全屏切换
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // 系统状态
  const systemStatus = useMemo(() => {
    if (!health) return { status: 'unknown', color: '#999', text: '未知' };
    
    const isHealthy = health.status === 'UP';
    const hasWarning = serverPerformance && (
      serverPerformance.cpuUsage > 80 ||
      serverPerformance.memoryUsage > 80 ||
      serverPerformance.diskUsage > 80
    );

    if (!isHealthy) return { status: 'error', color: '#ff4d4f', text: '异常' };
    if (hasWarning) return { status: 'warning', color: '#faad14', text: '警告' };
    return { status: 'success', color: '#52c41a', text: '正常' };
  }, [health, serverPerformance]);

  // 渲染页面头部
  const renderHeader = () => (
    <motion.div
      className="monitor-header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="header-left">
        <motion.div
          className="header-icon"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <DashboardOutlined />
        </motion.div>
        <div className="header-title-group">
          <h1 className="header-title">系统监控中心</h1>
          <div className="header-subtitle">实时性能监控与分析</div>
        </div>
        <Badge
          status={systemStatus.status as any}
          text={systemStatus.text}
          style={{ marginLeft: 24, fontSize: 14 }}
        />
      </div>

      <Space size="middle">
        <Segmented
          value={viewMode}
          onChange={(value) => setViewMode(value as any)}
          options={[
            { label: '总览', value: 'overview' },
            { label: '详细', value: 'detailed' }
          ]}
        />
        
        <Tooltip title={autoRefresh ? '关闭自动刷新' : '开启自动刷新'}>
          <Button
            type={autoRefresh ? 'primary' : 'default'}
            icon={<FireOutlined />}
            onClick={toggleAutoRefresh}
            className={autoRefresh ? 'btn-auto-refresh-active' : ''}
          >
            {autoRefresh ? '自动刷新' : '手动模式'}
          </Button>
        </Tooltip>

        <Tooltip title="立即刷新">
          <Button
            icon={<ReloadOutlined spin={refreshing} />}
            onClick={handleRefresh}
            loading={refreshing}
          >
            刷新
          </Button>
        </Tooltip>

        <Tooltip title="全屏显示">
          <Button icon={<FullscreenOutlined />} onClick={toggleFullscreen} />
        </Tooltip>

        <Tooltip title="设置">
          <Button icon={<SettingOutlined />} />
        </Tooltip>
      </Space>
    </motion.div>
  );

  // 渲染服务器性能指标
  const renderServerMetrics = () => {
    if (!serverPerformance) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-card metrics-card" title={
          <Space>
            <CloudServerOutlined style={{ color: '#1890ff' }} />
            <span>服务器性能</span>
          </Space>
        }>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <EnhancedMetricCard
                title="CPU使用率"
                value={serverPerformance.cpuUsage}
                suffix="%"
                icon="cpu"
                color="#1890ff"
                thresholdWarning={70}
                thresholdDanger={85}
                delay={0}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <EnhancedMetricCard
                title="内存使用率"
                value={serverPerformance.memoryUsage}
                suffix="%"
                icon="memory"
                color="#52c41a"
                thresholdWarning={70}
                thresholdDanger={85}
                delay={0.1}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <EnhancedMetricCard
                title="JVM内存"
                value={serverPerformance.jvmMemoryUsage}
                suffix="%"
                icon="java"
                color="#722ed1"
                thresholdWarning={70}
                thresholdDanger={85}
                delay={0.2}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <EnhancedMetricCard
                title="磁盘使用率"
                value={serverPerformance.diskUsage}
                suffix="%"
                icon="disk"
                color="#fa8c16"
                thresholdWarning={70}
                thresholdDanger={85}
                delay={0.3}
              />
            </Col>
          </Row>

          {/* 实时图表 */}
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24} lg={12}>
              <RealtimeChart
                title="CPU & 内存趋势"
                data={[
                  { name: 'CPU', data: historicalData.cpu, color: '#1890ff' },
                  { name: '内存', data: historicalData.memory, color: '#52c41a' }
                ]}
                height={200}
              />
            </Col>
            <Col xs={24} lg={12}>
              <RealtimeChart
                title="磁盘 & JVM趋势"
                data={[
                  { name: '磁盘', data: historicalData.disk, color: '#fa8c16' },
                  { name: 'JVM', data: historicalData.jvm, color: '#722ed1' }
                ]}
                height={200}
              />
            </Col>
          </Row>

          {/* 详细信息 */}
          {viewMode === 'detailed' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ marginTop: 24 }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={8} lg={4}>
                  <div className="detail-stat">
                    <div className="detail-stat-label">CPU核心</div>
                    <div className="detail-stat-value">{serverPerformance.cpuCores} 核</div>
                  </div>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                  <div className="detail-stat">
                    <div className="detail-stat-label">系统负载</div>
                    <div className="detail-stat-value">{serverPerformance.systemLoadAverage.toFixed(2)}</div>
                  </div>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                  <div className="detail-stat">
                    <div className="detail-stat-label">线程数</div>
                    <div className="detail-stat-value">{serverPerformance.threadCount}</div>
                  </div>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                  <div className="detail-stat">
                    <div className="detail-stat-label">峰值线程</div>
                    <div className="detail-stat-value">{serverPerformance.peakThreadCount}</div>
                  </div>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                  <div className="detail-stat">
                    <div className="detail-stat-label">运行时间</div>
                    <div className="detail-stat-value">{serverPerformance.uptimeFormatted}</div>
                  </div>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                  <div className="detail-stat">
                    <div className="detail-stat-label">总内存</div>
                    <div className="detail-stat-value">
                      {(serverPerformance.totalMemory / 1024 / 1024 / 1024).toFixed(1)} GB
                    </div>
                  </div>
                </Col>
              </Row>
            </motion.div>
          )}
        </Card>
      </motion.div>
    );
  };

  // 主渲染
  if (loading && !health) {
    return <SkeletonLoader />;
  }

  return (
    <div className="system-monitor-page">
      {renderHeader()}

      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="monitor-content"
        >
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {/* 系统健康状态 */}
            {health && <SystemHealthPanel health={health} />}

            {/* 服务器性能指标 */}
            {renderServerMetrics()}

            {/* 数据库和Redis监控 */}
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                {databaseMetrics && (
                  <DatabasePanel 
                    metrics={databaseMetrics} 
                    viewMode={viewMode}
                  />
                )}
              </Col>
              <Col xs={24} lg={12}>
                {redisMetrics && (
                  <RedisPanel 
                    metrics={redisMetrics}
                    viewMode={viewMode}
                  />
                )}
              </Col>
            </Row>

            {/* API统计 */}
            {apiStatistics && (
              <ApiStatisticsPanel 
                statistics={apiStatistics}
                viewMode={viewMode}
              />
            )}

            {/* 刷新提示 */}
            {autoRefresh && (
              <Alert
                message={`自动刷新已启用，每 ${refreshInterval / 1000} 秒更新一次数据`}
                type="info"
                showIcon
                closable
                style={{ marginTop: 16 }}
              />
            )}
          </Space>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default memo(SystemMonitor);
