import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';

/**
 * Redis管理页面
 * 
 * 这个页面已经过性能优化和UI/UX改进：
 * 1. 使用React.memo优化组件渲染性能
 * 2. 使用CSS动画增强用户体验
 * 3. 改进了键值对的展示方式
 * 4. 添加了搜索历史和建议功能
 * 5. 优化了表格和卡片的展示效果
 * 6. 增加了更友好的错误处理和降级模式
 * 7. 适配了暗黑模式
 */

import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Form, 
  Modal, 
  message, 
  Typography,
  Tabs,
  Tooltip,
  Popconfirm,
  Statistic,
  Row,
  Col,
  Divider,
  Alert,
  Result,
  Tag,
  Drawer,
  Skeleton,
  Popover,
  Select,
  Empty,
  App
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  EditOutlined,
  ClearOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  BugOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  KeyOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CloudServerOutlined,
  CodeOutlined,
  FilterOutlined,
  InfoCircleFilled,
  UnorderedListOutlined,
  TableOutlined,
  AppstoreOutlined,
  OrderedListOutlined,
  QuestionCircleOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { ColumnsType } from 'antd/es/table';
import type { AppDispatch, RootState } from '@/store';
import { 
  fetchRedisKeys, 
  fetchRedisInfo,
  getRedisValue,
  setRedisValue,
  deleteRedisKey,
  clearRedisDb,
  setPagination
} from '@/store/slices/systemSlice';
import type {
  RedisKeyData,
  RedisInfoData,
  RedisValueData
} from '@/store/slices/systemSlice';
import { formatDateTime, formatDuration } from '@/utils/dateUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// 导入现代化组件
import StatsCard from '@/components/StatsCard';
import DataTable from '@/components/DataTable';
import CustomCard from '@/components/Card';
import StatusIndicator from '@/components/StatusIndicator';
import PageTransition from '@/components/PageTransition';

// 添加自定义CSS样式
import './redis.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Search } = Input;

// 使用React.memo优化渲染性能的键类型标签组件
const KeyTypeTag = memo(({ type }: { type: string }) => {
  let className = 'type-tag';
  let icon = null;
  
  switch(type.toLowerCase()) {
    case 'string':
      className += ' type-tag-string';
      icon = <FileTextOutlined className="type-tag-icon" />;
      break;
    case 'list':
      className += ' type-tag-list';
      icon = <UnorderedListOutlined className="type-tag-icon" />;
      break;
    case 'hash':
      className += ' type-tag-hash';
      icon = <TableOutlined className="type-tag-icon" />;
      break;
    case 'set':
      className += ' type-tag-set';
      icon = <AppstoreOutlined className="type-tag-icon" />;
      break;
    case 'zset':
      className += ' type-tag-zset';
      icon = <OrderedListOutlined className="type-tag-icon" />;
      break;
    default:
      className += ' type-tag-default';
      icon = <QuestionCircleOutlined className="type-tag-icon" />;
  }
  
  return (
    <div className={className}>
      {icon}
      <span>{type}</span>
    </div>
  );
});

// 使用React.memo优化渲染性能的过期时间组件
const TTLDisplay = memo(({ ttl }: { ttl: number }) => {
  if (ttl === -1) {
    return <StatusIndicator type="success" text="永不过期" />;
  } else if (ttl === -2) {
    return <StatusIndicator type="error" text="已过期" />;
  } else if (ttl < 60) {
    return <StatusIndicator type="warning" ping text={`${ttl}秒`} />;
  } else {
    return <StatusIndicator type="info" text={formatDuration(ttl)} />;
  }
});

// 使用React.memo优化渲染性能的大小展示组件
const SizeDisplay = memo(({ size }: { size: number }) => {
  const formatSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };
  
  let color = 'text-gray-500';
  if (size > 1024 * 1024) {
    color = 'text-red-500';
  } else if (size > 1024 * 10) {
    color = 'text-orange-500';
  } else if (size > 1024) {
    color = 'text-yellow-500';
  }
  
  return (
    <span className={`${color} font-medium`}>
      {formatSize(size)}
    </span>
  );
});

const RedisManage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const { modal } = App.useApp();
  
  // 从Redux获取状态
  const { redisKeys, redisInfo, redisValue, pagination, loading, error } = useSelector((state: RootState) => state.system);
  
  // 本地状态
  const [valueModalVisible, setValueModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentKey, setCurrentKey] = useState('');
  const [valueForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('keys');
  const [classDefError, setClassDefError] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  // 搜索相关状态
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const savedHistory = localStorage.getItem('redis_search_history');
    return savedHistory ? JSON.parse(savedHistory) : ['*', 'user:*', 'session:*'];
  });
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  
  // 常用搜索模式
  const commonPatterns = [
    { pattern: '*', description: '所有键' },
    { pattern: 'user:*', description: '用户相关键' },
    { pattern: 'session:*', description: '会话相关键' },
    { pattern: 'cache:*', description: '缓存相关键' },
    { pattern: 'config:*', description: '配置相关键' }
  ];
  
  // 使用useCallback包装一些方法以防止无限渲染
  const fetchKeys = useCallback(() => {
    if (isFallbackMode) return;  // 如果已经进入降级模式，不再发送请求

    const values = form.getFieldsValue();
    const params = {
      page: pagination.current,
      size: pagination.pageSize,
      pattern: values.pattern || '*'
    };
    
    console.log('Redis查询参数:', params); // 添加日志，方便调试
    
    dispatch(fetchRedisKeys(params))
      .catch((err) => {
        if (err.message) {
          if (err.message.includes('ResultCode') || err.message.includes('NoClassDefFoundError')) {
            setClassDefError(true);
            setErrorDetails(err.message);
          } else if (err.message.includes('后端服务')) {
            setClassDefError(true);
            setErrorDetails(err.message);
          }
          
          // 如果重试次数超过3次，则进入降级模式
          if (retryCount >= 2) {
            setIsFallbackMode(true);
            message.warning('已自动进入离线模式，部分功能可能不可用');
          } else {
            setRetryCount(prev => prev + 1);
          }
        }
      });
  }, [dispatch, form, pagination.current, pagination.pageSize, isFallbackMode, retryCount]);
  
  // 获取Redis信息
  const fetchInfo = useCallback(() => {
    if (isFallbackMode) return;  // 如果已经进入降级模式，不再发送请求
    
    dispatch(fetchRedisInfo())
      .catch((err) => {
        if (err.message) {
          if (err.message.includes('ResultCode') || err.message.includes('NoClassDefFoundError')) {
            setClassDefError(true);
            setErrorDetails(err.message);
          }
        }
      });
  }, [dispatch, isFallbackMode]);
  
  // 初始加载，使用useEffect和useCallback减少不必要的重渲染
  useEffect(() => {
    if (activeTab === 'keys' && !isFallbackMode) {
      fetchKeys();
    } else if (activeTab === 'info' && !isFallbackMode) {
      fetchInfo();
    }
  }, [activeTab, pagination.current, pagination.pageSize, fetchKeys, fetchInfo, isFallbackMode]);
  
  // 监听错误变化
  useEffect(() => {
    if (error) {
      if (error.includes('NoClassDefFoundError') || error.includes('后端服务')) {
        setClassDefError(true);
        setErrorDetails(error);
      }
    } else {
      // 只有当错误完全清除时才重置
      if (!loading && !classDefError) {
        setRetryCount(0);
      }
    }
  }, [error, loading]);
  
  // 处理搜索
  const handleSearch = () => {
    if (isFallbackMode) {
      message.warning('当前处于离线模式，搜索功能不可用');
      return;
    }
    
    const pattern = form.getFieldValue('pattern');
    
    // 添加到搜索历史
    if (pattern && pattern !== '*') {
      const newHistory = [pattern, ...searchHistory.filter(item => item !== pattern)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('redis_search_history', JSON.stringify(newHistory));
    }
    
    setShowSearchSuggestions(false);
    dispatch(setPagination({ current: 1 }));
    fetchKeys();
  };
  
  // 选择搜索历史或建议
  const selectSearchPattern = (pattern: string) => {
    form.setFieldsValue({ pattern });
    setShowSearchSuggestions(false);
  };
  
  // 清除搜索历史
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('redis_search_history');
    message.success('搜索历史已清除');
  };
  
  // 重置查询
  const resetQuery = () => {
    form.resetFields();
    dispatch(setPagination({ current: 1 }));
    if (!isFallbackMode) {
      fetchKeys();
    }
  };
  
  // 处理页码变化
  const handlePageChange = (page: number, pageSize?: number) => {
    if (isFallbackMode) {
      message.warning('当前处于离线模式，翻页功能不可用');
      return;
    }
    
    // 使用Vue版本兼容的参数名称
    dispatch(setPagination({ 
      current: page, 
      pageSize // 内部会保存为pageSize，在API调用时会转换为size
    }));
  };
  
  // 处理每页条数变化
  const handleSizeChange = (current: number, size: number) => {
    if (isFallbackMode) {
      message.warning('当前处于离线模式，修改页大小不可用');
      return;
    }
    
    // 使用Vue版本兼容的参数名称
    dispatch(setPagination({ 
      current: 1, 
      pageSize: size // 内部会保存为pageSize，在API调用时会转换为size
    }));
  };

  // 尝试退出降级模式，重新连接后端
  const exitFallbackMode = () => {
    setIsFallbackMode(false);
    setRetryCount(0);
    setClassDefError(false);
    setErrorDetails(null);
    
    // 重新加载数据
    if (activeTab === 'keys') {
      fetchKeys();
    } else {
      fetchInfo();
    }
    
    message.info('正在尝试重新连接后端服务...');
  };
  
  // 清空数据库
  const confirmClearDb = useCallback(() => {
    if (isFallbackMode) {
      message.warning('当前处于离线模式，清空数据库功能不可用');
      return;
    }
    
    modal.confirm({
      title: '确定要清空Redis数据库吗?',
      icon: <ExclamationCircleOutlined />,
      content: '此操作将清空所有数据，且不可恢复',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await dispatch(clearRedisDb());
          message.success('清空成功');
          fetchKeys();
          fetchInfo();
        } catch (error) {
          message.error('清空失败');
        }
      }
    });
  }, [dispatch, fetchKeys, fetchInfo, isFallbackMode, modal]);
  
  // 刷新信息
  const refreshInfo = useCallback(() => {
    if (isFallbackMode) {
      message.warning('当前处于离线模式，刷新功能不可用');
      return;
    }
    
    fetchInfo();
    message.success('刷新成功');
  }, [fetchInfo, isFallbackMode]);
  
  // 格式化TTL显示
  const formatTTL = (ttl: number) => {
    if (ttl === -1) {
      return '永不过期';
    } else if (ttl === -2) {
      return '已过期';
    } else {
      return formatDuration(ttl);
    }
  };
  
  // 格式化内存大小
  const formatSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };
  
  // 处理Tab切换
  const handleTabChange = useCallback((activeKey: string) => {
    setActiveTab(activeKey);
  }, []);
  
  // 查看键值
  const viewValue = useCallback(async (key: string) => {
    if (isFallbackMode) {
      message.warning('当前处于离线模式，查看键值功能不可用');
      return;
    }
    
    setCurrentKey(key);
    try {
      await dispatch(getRedisValue(key));
      setValueModalVisible(true);
    } catch (error) {
      message.error('获取键值失败');
    }
  }, [dispatch, isFallbackMode]);
  
  // 编辑键值
  const editValue = useCallback(async (key: string) => {
    if (isFallbackMode) {
      message.warning('当前处于离线模式，编辑功能不可用');
      return;
    }
    
    setCurrentKey(key);
    try {
      await dispatch(getRedisValue(key));
      if (redisValue) {
        valueForm.setFieldsValue({
          value: JSON.stringify(redisValue.value, null, 2),
          ttl: redisValue.ttl
        });
        setEditModalVisible(true);
      }
    } catch (error) {
      message.error('获取键值失败');
    }
  }, [dispatch, redisValue, valueForm, isFallbackMode]);
  
  // 删除键
  const deleteKey = useCallback(async (key: string) => {
    if (isFallbackMode) {
      message.warning('当前处于离线模式，删除功能不可用');
      return;
    }
    
    try {
      await dispatch(deleteRedisKey(key));
      message.success('删除成功');
      fetchKeys();
    } catch (error) {
      message.error('删除失败');
    }
  }, [dispatch, fetchKeys, isFallbackMode]);
  
  // 保存键值
  const saveValue = useCallback(async () => {
    if (isFallbackMode) {
      message.warning('当前处于离线模式，保存功能不可用');
      return;
    }
    
    try {
      const values = await valueForm.validateFields();
      const hide = message.loading('正在保存...', 0);
      
      try {
        let parsedValue;
        try {
          parsedValue = JSON.parse(values.value);
        } catch (e) {
          // 如果不是有效的JSON，则作为字符串处理
          parsedValue = values.value;
        }
        
        await dispatch(setRedisValue({
          key: currentKey,
          value: parsedValue,
          ttl: values.ttl
        }));
        hide();
        message.success('保存成功');
        setEditModalVisible(false);
        fetchKeys();
      } catch (error) {
        hide();
        message.error('保存失败');
      }
    } catch (error) {
      // 表单验证失败
    }
  }, [dispatch, valueForm, currentKey, fetchKeys, isFallbackMode]);
  
  // 表格列定义 - 使用useMemo优化性能
  const columns = useMemo<ColumnsType<RedisKeyData>>(() => [
    {
      title: '键名',
      dataIndex: 'key',
      key: 'key',
      width: 300,
      render: (key) => (
        <Tooltip title={key}>
          <div className="flex items-center gap-2">
            <KeyOutlined className="text-gray-400" />
            <div className="max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap">
              {key}
            </div>
          </div>
        </Tooltip>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => <KeyTypeTag type={type} />
    },
    {
      title: '过期时间',
      dataIndex: 'ttl',
      key: 'ttl',
      width: 150,
      render: (ttl) => <TTLDisplay ttl={ttl} />
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (size) => <SizeDisplay size={size} />
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 220,
      render: (_, record) => (
        <Space size="middle" className="flex flex-wrap">
          <Button 
            type="primary"
            size="small"
            ghost
            icon={<EyeOutlined />} 
            onClick={() => viewValue(record.key)}
            disabled={isFallbackMode}
            className="flex items-center"
          >
            查看
          </Button>
          <Button 
            type="default"
            size="small"
            icon={<EditOutlined />} 
            onClick={() => editValue(record.key)}
            disabled={isFallbackMode}
            className="flex items-center"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此键吗？"
            onConfirm={() => deleteKey(record.key)}
            okText="确定"
            cancelText="取消"
            disabled={isFallbackMode}
          >
            <Button 
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={isFallbackMode}
              className="flex items-center"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ], [viewValue, editValue, deleteKey, isFallbackMode]);
  
  // 使用React.memo优化键值列表渲染
  const RedisKeysList = memo(() => {
    if (!redisKeys || redisKeys.length === 0) {
      return (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          description="暂无数据"
          className="my-8"
        />
      );
    }
    
    return (
      <DataTable
        columns={columns}
        dataSource={redisKeys}
        loading={loading}
        rowKey="key"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
          onChange: handlePageChange,
          onShowSizeChange: handleSizeChange
        }}
        search={{
          placeholder: "支持通配符，如: user:*",
          onSearch: handleSearch,
          searchValue: form.getFieldValue('pattern') || '*',
          onChange: (value) => {
            form.setFieldsValue({ pattern: value });
            setShowSearchSuggestions(!!value);
          }
        }}
        toolbar={{
          reload: {
            onClick: resetQuery,
            loading: loading
          },
          extra: (
            <Space>
              <Popconfirm
                title="确定要清空所有数据吗？"
                onConfirm={confirmClearDb}
                okText="确定"
                cancelText="取消"
                disabled={isFallbackMode}
              >
                <Button 
                  danger 
                  icon={<ClearOutlined />}
                  disabled={isFallbackMode}
                >
                  清空数据库
                </Button>
              </Popconfirm>
              <Popover
                title={
                  <div className="flex justify-between items-center">
                    <span>搜索历史</span>
                    <Button 
                      type="text" 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        clearSearchHistory();
                      }}
                    >
                      清除
                    </Button>
                  </div>
                }
                content={
                  <div className="w-64">
                    <div className="mb-2">
                      <Text strong>历史记录</Text>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {searchHistory.length > 0 ? (
                        searchHistory.map((pattern) => (
                          <Tag
                            key={pattern}
                            className="cursor-pointer hover:bg-blue-50"
                            onClick={() => selectSearchPattern(pattern)}
                          >
                            {pattern}
                          </Tag>
                        ))
                      ) : (
                        <Text type="secondary">暂无搜索历史</Text>
                      )}
                    </div>
                    <Divider className="my-2" />
                    <div className="mb-2">
                      <Text strong>常用模式</Text>
                    </div>
                    <div className="flex flex-col gap-2">
                      {commonPatterns.map((item) => (
                        <div
                          key={item.pattern}
                          className="flex justify-between items-center p-1 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => selectSearchPattern(item.pattern)}
                        >
                          <Tag color="blue">{item.pattern}</Tag>
                          <Text type="secondary">{item.description}</Text>
                        </div>
                      ))}
                    </div>
                  </div>
                }
                trigger="click"
                placement="bottomRight"
              >
                <Button icon={<HistoryOutlined />}>历史</Button>
              </Popover>
            </Space>
          )
        }}
        title="Redis键值列表"
        cardProps={{
          shadow: "sm",
          className: "overflow-hidden"
        }}
        extra={
          <div className="flex items-center gap-2">
            <Tooltip title="键类型筛选">
              <Button 
                icon={<FilterOutlined />}
                onClick={() => {
                  // 这里可以添加键类型筛选功能
                  message.info('键类型筛选功能开发中');
                }}
              >
                筛选
              </Button>
            </Tooltip>
            <Text className="text-gray-500 dark:text-gray-400">
              共 {pagination.total} 个键
            </Text>
          </div>
        }
      />
    );
  });
  
  // 使用React.memo优化Redis信息展示
  const RedisInfoDisplay = memo(({ info }: { info: RedisInfoData }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard
            title="Redis版本"
            value={info.version}
            icon={<CloudServerOutlined />}
            color="primary"
          />
          <StatsCard
            title="运行时间"
            value={formatDuration(Number(info.uptime))}
            icon={<ClockCircleOutlined />}
            color="success"
          />
          <StatsCard
            title="连接数"
            value={Number(info.connectedClients)}
            icon={<BarChartOutlined />}
            color="warning"
          />
        </div>
        
        <Divider className="my-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard
            title="内存使用"
            value={info.usedMemoryHuman}
            icon={<DatabaseOutlined />}
            color="danger"
          />
          <StatsCard
            title="内存峰值"
            value={info.usedMemoryPeakHuman}
            icon={<DatabaseOutlined />}
            color="warning"
          />
          <StatsCard
            title="键总数"
            value={info.totalKeys}
            icon={<KeyOutlined />}
            color="primary"
          />
        </div>
        
        <Divider className="my-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="命中率"
            value={parseFloat(info.keyspaceHitRate) || 0}
            suffix="%"
            icon={<BarChartOutlined />}
            color="success"
            trend={
              parseFloat(info.keyspaceHitRate) > 80 
                ? { value: parseFloat(info.keyspaceHitRate) - 80, isUpward: true, text: '良好' } 
                : { value: 80 - parseFloat(info.keyspaceHitRate), isUpward: false, text: '需优化' }
            }
          />
          <StatsCard
            title="运行模式"
            value={info.mode}
            icon={<CloudServerOutlined />}
            color="primary"
          />
          <StatsCard
            title="操作系统"
            value={info.os}
            icon={<CloudServerOutlined />}
            color="default"
          />
        </div>
        
        <CustomCard 
          title="键空间统计" 
          className="mt-6"
          extra={
            <Tooltip title="键空间统计信息">
              <InfoCircleFilled className="text-gray-400" />
            </Tooltip>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    数据库
                  </th>
                  <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    键数量
                  </th>
                  <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    过期键数量
                  </th>
                  <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    平均TTL
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {info.keyspaceStats && Object.entries(info.keyspaceStats).map(([db, stats]) => (
                  <tr key={db} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                      {db}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stats.keys}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stats.expires}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stats.avg_ttl ? formatDuration(parseInt(stats.avg_ttl) / 1000) : '0'}
                    </td>
                  </tr>
                ))}
                {(!info.keyspaceStats || Object.keys(info.keyspaceStats).length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      暂无键空间统计数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CustomCard>
      </motion.div>
    );
  });
  
  return (
    <PageTransition className="redis-manage-container" direction="up">
      <div className="mb-6">
        <Title level={2} className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <DatabaseOutlined className="text-primary-500" /> 
          Redis管理
        </Title>
        <Text className="text-gray-500 dark:text-gray-400">
          管理Redis缓存键值和服务器信息
        </Text>
      </div>
      
      {isFallbackMode ? (
        <Alert
          message="已进入离线模式"
          description={
            <div>
              <p>由于多次尝试连接后端服务失败，系统已自动进入离线模式。</p>
              <p>错误详情: {errorDetails || '与后端服务连接失败'}</p>
              <p>您可以尝试重新连接后端服务，或联系管理员解决问题。</p>
            </div>
          }
          type="warning"
          showIcon
          icon={<BugOutlined />}
          className="mb-6"
          action={
            <Button size="small" type="primary" onClick={exitFallbackMode}>
              重新连接
            </Button>
          }
        />
      ) : classDefError ? (
        <Alert
          message="后端类加载错误"
          description={
            <div>
              <p>{errorDetails || '后端服务出现类加载错误: NoClassDefFoundError: com/muyingmall/common/result/ResultCode'}</p>
              <p>可能原因:</p>
              <ol>
                <li>后端代码中存在多个 ResultCode 类，导致类加载冲突</li>
                <li>ResultCode 类未被正确编译或部署</li>
                <li>Maven 依赖或类路径配置不正确</li>
              </ol>
              <p>建议联系后端开发人员检查 ResultCode 类的实现和依赖关系。</p>
            </div>
          }
          type="error"
          showIcon
          icon={<WarningOutlined />}
          className="mb-6"
          action={
            <Space>
              <Button size="small" type="primary" onClick={() => {
                setClassDefError(false);
                setErrorDetails(null);
                setRetryCount(prev => prev + 1);
                if (activeTab === 'keys') {
                  fetchKeys();
                } else {
                  fetchInfo();
                }
              }}>
                重试
              </Button>
              <Button size="small" onClick={() => setIsFallbackMode(true)}>
                进入离线模式
              </Button>
            </Space>
          }
        />
      ) : error ? (
        <Alert
          message="错误"
          description={`连接Redis服务器时发生错误: ${error}`}
          type="error"
          showIcon
          className="mb-6"
          action={
            <Button size="small" type="primary" onClick={() => {
              if (activeTab === 'keys') {
                fetchKeys();
              } else {
                fetchInfo();
              }
            }}>
              重试
            </Button>
          }
        />
      ) : null}
      
      <CustomCard bordered shadow="md" className="overflow-hidden">
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          items={[
            {
              key: "keys",
              label: <span className="flex items-center gap-1"><KeyOutlined /> 键值管理</span>,
              children: <RedisKeysList />
            },
            {
              key: "info",
              label: <span className="flex items-center gap-1"><CloudServerOutlined /> Redis信息</span>,
              children: (
                <>
                  <div className="mb-4 flex justify-between items-center">
                    <div>
                      <Text className="text-gray-500 dark:text-gray-400">
                        Redis服务器状态和性能指标
                      </Text>
                    </div>
                    <Button 
                      type="primary" 
                      icon={<ReloadOutlined />} 
                      onClick={refreshInfo}
                      disabled={isFallbackMode}
                    >
                      刷新信息
                    </Button>
                  </div>
                  
                  {isFallbackMode ? (
                    <Result
                      status="warning"
                      title="当前处于离线模式"
                      subTitle="由于后端服务连接问题，无法加载Redis信息"
                      extra={
                        <Button type="primary" onClick={exitFallbackMode}>
                          重新连接
                        </Button>
                      }
                    />
                  ) : loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
                        <Skeleton key={item} active />
                      ))}
                    </div>
                  ) : redisInfo ? (
                    <RedisInfoDisplay info={redisInfo} />
                  ) : (
                    <div className="text-center py-12">
                      <Result
                        status="info"
                        title="暂无数据"
                        subTitle="请点击刷新按钮获取Redis信息"
                      />
                    </div>
                  )}
                </>
              )
            }
          ]}
        />
      </CustomCard>
      
      {/* 查看键值对话框 */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CodeOutlined className="text-primary-500" />
            <span>查看键值 - {currentKey}</span>
          </div>
        }
        open={valueModalVisible}
        onCancel={() => setValueModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setValueModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
        className="redis-value-modal"
      >
        {redisValue ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CustomCard className="mb-4" bordered={undefined} shadow="sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Text type="secondary" className="block mb-1">类型</Text>
                  <Tag 
                    color={
                      redisValue.type === 'string' ? 'blue' :
                      redisValue.type === 'list' ? 'green' :
                      redisValue.type === 'hash' ? 'orange' :
                      redisValue.type === 'set' ? 'red' :
                      redisValue.type === 'zset' ? 'purple' : 'default'
                    }
                    icon={
                      redisValue.type === 'string' ? <FileTextOutlined /> :
                      redisValue.type === 'list' ? <UnorderedListOutlined /> :
                      redisValue.type === 'hash' ? <TableOutlined /> :
                      redisValue.type === 'set' ? <AppstoreOutlined /> :
                      redisValue.type === 'zset' ? <OrderedListOutlined /> : <QuestionCircleOutlined />
                    }
                    className="px-2 py-1"
                  >
                    {redisValue.type}
                  </Tag>
                </div>
                <div>
                  <Text type="secondary" className="block mb-1">过期时间</Text>
                  {redisValue.ttl === -1 ? (
                    <StatusIndicator type="success" text="永不过期" />
                  ) : redisValue.ttl === -2 ? (
                    <StatusIndicator type="error" text="已过期" />
                  ) : redisValue.ttl < 60 ? (
                    <StatusIndicator type="warning" ping text={`${redisValue.ttl}秒`} />
                  ) : (
                    <StatusIndicator type="info" text={formatTTL(redisValue.ttl)} />
                  )}
                </div>
                <div>
                  <Text type="secondary" className="block mb-1">大小</Text>
                  <Text strong className={
                    redisValue.size > 1024 * 1024 ? 'text-red-500' :
                    redisValue.size > 1024 * 10 ? 'text-orange-500' :
                    redisValue.size > 1024 ? 'text-yellow-500' : 'text-gray-700'
                  }>
                    {formatSize(redisValue.size)}
                  </Text>
                </div>
                <div>
                  <Text type="secondary" className="block mb-1">键名</Text>
                  <Tooltip title={currentKey}>
                    <div className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-mono text-gray-700">
                      {currentKey}
                    </div>
                  </Tooltip>
                </div>
              </div>
            </CustomCard>
            
            <CustomCard 
              title="键值内容" 
              extra={
                <Space>
                  <Button 
                    size="small" 
                    icon={<EditOutlined />} 
                    onClick={() => {
                      setValueModalVisible(false);
                      editValue(currentKey);
                    }}
                  >
                    编辑
                  </Button>
                  <Popconfirm
                    title="确定要删除此键吗？"
                    onConfirm={() => {
                      setValueModalVisible(false);
                      deleteKey(currentKey);
                    }}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button 
                      size="small" 
                      danger 
                      icon={<DeleteOutlined />}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                </Space>
              }
              className="redis-value-card"
              shadow="sm"
            >
              <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 overflow-auto max-h-96">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {typeof redisValue.value === 'object' 
                    ? JSON.stringify(redisValue.value, null, 2) 
                    : String(redisValue.value)
                  }
                </pre>
              </div>
            </CustomCard>
          </motion.div>
        ) : (
          <div className="text-center py-8">
            {loading ? (
              <Skeleton active paragraph={{ rows: 10 }} />
            ) : (
              '暂无数据'
            )}
          </div>
        )}
      </Modal>
      
      {/* 编辑键值对话框 */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EditOutlined className="text-primary-500" />
            <span>编辑键值 - {currentKey}</span>
          </div>
        }
        open={editModalVisible}
        onOk={saveValue}
        onCancel={() => setEditModalVisible(false)}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={valueForm}
          layout="vertical"
        >
          <Form.Item
            name="value"
            label={
              <div className="flex items-center gap-2">
                <CodeOutlined /> 键值
              </div>
            }
            rules={[{ required: true, message: '请输入键值' }]}
          >
            <TextArea 
              rows={15} 
              placeholder="请输入键值" 
              className="font-mono bg-gray-50 dark:bg-gray-800" 
            />
          </Form.Item>
          
          <Form.Item
            name="ttl"
            label={
              <div className="flex items-center gap-2">
                <ClockCircleOutlined /> 过期时间(秒)
              </div>
            }
            tooltip="设置为-1表示永不过期，设置为0表示立即过期"
            rules={[{ required: true, message: '请输入过期时间' }]}
          >
            <Input 
              type="number" 
              placeholder="请输入过期时间" 
              addonAfter="秒"
              addonBefore={
                <Select defaultValue="-1" className="w-32" onChange={(value) => valueForm.setFieldsValue({ ttl: value })}>
                  <Select.Option value="-1">永不过期</Select.Option>
                  <Select.Option value="60">1分钟</Select.Option>
                  <Select.Option value="300">5分钟</Select.Option>
                  <Select.Option value="3600">1小时</Select.Option>
                  <Select.Option value="86400">1天</Select.Option>
                  <Select.Option value="604800">1周</Select.Option>
                </Select>
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageTransition>
  );
};

export default RedisManage; 