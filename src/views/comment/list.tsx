import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, Card, Input, Button, Space, Select, Tag, Rate, Avatar, 
  Image, Tooltip, Modal, DatePicker, Form, message, Typography, Dropdown
} from 'antd';
import { 
  DeleteOutlined, MessageOutlined, 
  EyeOutlined, ExportOutlined, ReloadOutlined, 
  ExclamationCircleOutlined, FileTextOutlined, MoreOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { TableProps } from 'antd/es/table';
import dayjs from 'dayjs';
import { 
  getCommentList, 
  updateCommentStatus, 
  deleteComment, 
  batchDeleteComments, 
  exportComments,
  type CommentQueryParams,
  type Comment
} from '@/api/comment';
import { formatImageUrl } from '@/utils/imageUtils';
import CommentReplyModal from './reply';
import './list.css';

// API响应类型定义
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;
const { Title } = Typography;

/**
 * 评价列表组件
 */
const CommentList: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [queryParams, setQueryParams] = useState<CommentQueryParams>({
    page: 1,
    size: 10,
    sortField: 'createTime',
    sortOrder: 'desc'
  });
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [replyModal, setReplyModal] = useState<{
    visible: boolean;
    commentId: number | null;
    productName?: string;
  }>({ visible: false, commentId: null });

  // 获取评价列表
  const fetchComments = useCallback(async (params: CommentQueryParams = { ...queryParams }) => {
    try {
      setLoading(true);
      const res = await getCommentList(params) as unknown as ApiResponse<{
        records: Comment[];
        total: number;
        current: number;
        pages: number;
      }>;
      if (res.success) {
        setComments(res.data.records || []);
        setPagination({
          current: params.page || 1,
          pageSize: params.size || 10,
          total: res.data.total || 0,
        });
      }
    } catch (error) {
      console.error('获取评价列表失败:', error);
      message.error('获取评价列表失败');
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  // 组件挂载时获取评价列表
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 处理表格变化事件
  const handleTableChange: TableProps<Comment>['onChange'] = (pagination, filters, sorter) => {
    const newParams: CommentQueryParams = {
      ...queryParams,
      page: pagination.current,
      size: pagination.pageSize,
    };
    
    // 添加排序字段
    if (sorter && 'field' in sorter && 'order' in sorter) {
      newParams.sortField = sorter.field as string;
      newParams.sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
    }
    
    // 添加筛选
    if (filters) {
      // 处理显示状态过滤
      if (filters.status && filters.status.length) {
        const statusValue = filters.status[0];
        if (statusValue === 'replied' || statusValue === 'not_replied') {
          newParams.hasReplied = statusValue === 'replied';
        } else {
          newParams.status = Number(filters.status[0]);
        }
      }
    }
    
    setQueryParams(newParams);
    fetchComments(newParams);
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchText(value);
    const newParams = {
      ...queryParams,
      page: 1, // 搜索时重置到第一页
      keyword: value,
    };
    setQueryParams(newParams);
    fetchComments(newParams);
  };

  // 处理评分筛选
  const handleRatingFilter = (value: number | null) => {
    setFilterRating(value);
    const newParams = {
      ...queryParams,
      page: 1,
      minRating: value,
      maxRating: value,
    };
    // @ts-expect-error - 忽略 CommentQueryParams 类型校验错误
    setQueryParams(newParams);
    // @ts-expect-error - 忽略 CommentQueryParams 类型校验错误
    fetchComments(newParams);
  };

  // 处理日期范围筛选
  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setDateRange(dates || [null, null]);
    
    const newParams = {
      ...queryParams,
      page: 1,
      startDate: dates && dates[0] ? dates[0].format('YYYY-MM-DD') : undefined,
      endDate: dates && dates[1] ? dates[1].format('YYYY-MM-DD') : undefined,
    };
    
    setQueryParams(newParams);
    fetchComments(newParams);
  };

  // 处理重置筛选
  const handleReset = () => {
    setSearchText('');
    setFilterRating(null);
    setDateRange([null, null]);
    
    const newParams = {
      page: 1,
      size: 10,
    };
    
    setQueryParams(newParams);
    fetchComments(newParams);
  };

  // 处理评价删除
  const handleDelete = async (commentId: number) => {
    try {
      const res = await deleteComment(commentId) as unknown as ApiResponse<boolean>;
      if (res.success) {
        message.success('评价删除成功');
        fetchComments(); // 重新加载列表
      }
    } catch (error) {
      console.error('删除评价失败:', error);
      message.error('删除评价失败');
    }
  };

  // 批量删除评价
  const handleBatchDelete = async () => {
    if (!selectedRowKeys.length) {
      message.warning('请选择要删除的评价');
      return;
    }

    confirm({
      title: '确认删除选中的评价吗？',
      icon: <ExclamationCircleOutlined />,
      content: '删除后将无法恢复，请谨慎操作',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await batchDeleteComments(selectedRowKeys as number[]) as unknown as ApiResponse<boolean>;
          if (res.success) {
            message.success(`成功删除${selectedRowKeys.length}条评价`);
            setSelectedRowKeys([]);
            fetchComments();
          }
        } catch (error) {
          console.error('批量删除评价失败:', error);
          message.error('批量删除评价失败');
        }
      },
    });
  };

  // 处理评价状态更新
  const handleStatusChange = async (commentId: number, status: number) => {
    try {
      const res = await updateCommentStatus(commentId, status) as unknown as ApiResponse<boolean>;
      if (res.success) {
        message.success(`评价${status === 1 ? '显示' : '隐藏'}成功`);
        // 更新本地数据
        setComments(comments.map(comment => 
          comment.commentId === commentId ? { ...comment, status } : comment
        ));
      }
    } catch (error) {
      console.error('更新评价状态失败:', error);
      message.error('更新评价状态失败');
    }
  };

  // 打开回复模态框
  const handleOpenReplyModal = (commentId: number, productName?: string) => {
    setReplyModal({
      visible: true,
      commentId,
      productName
    });
  };

  // 处理关闭回复模态框
  const handleCloseReplyModal = (_needRefresh: boolean = false) => {
    setReplyModal({ visible: false, commentId: null });
    // 无论是否提交回复成功，都刷新列表，确保状态更新
    fetchComments();
  };

  // 处理导出评价
  const handleExportComments = async () => {
    try {
      message.loading('正在导出数据，请稍候...');
      const res = await exportComments(queryParams);
      
      // 创建下载链接
      const blob = new Blob([res as unknown as BlobPart]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `评价数据_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('导出成功');
    } catch (error) {
      console.error('导出评价数据失败:', error);
      message.error('导出评价数据失败');
    }
  };

  const columns = [
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
      fixed: 'left' as const,
      render: (_: string, record: Comment) => {
        // 辅助函数：从用户名中移除数字后缀
        const cleanUserName = (name: string | undefined | null): string => {
          if (!name) return '';
          return name.replace(/\d+$/, '');
        };
        
        const displayName = record.userNickname || record.userName || (record.isAnonymous ? '匿名用户' : '未知用户');
        
        return (
          <div className="flex items-center space-x-2">
            <Avatar size="small" src={record.userAvatar} />
            <Tooltip title={cleanUserName(displayName)}>
              <span className="truncate max-w-[60px]">
                {cleanUserName(displayName)}
              </span>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: '商品信息',
      dataIndex: 'productName',
      key: 'productName',
      width: 200,
      ellipsis: true,
      render: (name: string, record: Comment) => (
        <div className="flex items-center gap-2">
          {record.productImage && (
            <Image 
              src={formatImageUrl(record.productImage)} 
              width={32} 
              height={32}
              className="object-cover rounded flex-shrink-0"
              preview={false}
              fallback="https://via.placeholder.com/32?text=No+Image"
            />
          )}
          <Tooltip title={name}>
            <span className="line-clamp-1 text-sm">{name}</span>
          </Tooltip>
        </div>
      ),
    },
    {
      title: '评价内容',
      dataIndex: 'content',
      key: 'content',
      width: 280,
      ellipsis: true,
      render: (content: string, record: Comment) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Rate disabled defaultValue={record.rating} style={{ fontSize: 14 }} />
            <span className="text-xs text-gray-500">
              {dayjs(record.createTime).format('MM-DD HH:mm')}
            </span>
          </div>
          <Tooltip title={content}>
            <div className="text-sm line-clamp-2">{content}</div>
          </Tooltip>
          {record.images && record.images.length > 0 && (
            <div className="flex gap-1 mt-1">
              {record.images.slice(0, 3).map((img, index) => (
                <Image
                  key={index}
                  src={formatImageUrl(img)}
                  width={32}
                  height={32}
                  className="object-cover rounded"
                  preview={{
                    mask: <EyeOutlined />,
                  }}
                  fallback="https://via.placeholder.com/32?text=No+Image"
                />
              ))}
              {record.images.length > 3 && (
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                  +{record.images.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      width: 100,
      render: (status: number, record: Comment) => (
        <div className="space-y-1">
          <Tag color={record.hasReplied ? 'green' : 'orange'} className="m-0">
            {record.hasReplied ? '已回复' : '未回复'}
          </Tag>
          <Tag color={status === 1 ? 'blue' : 'default'} className="m-0">
            {status === 1 ? '显示' : '隐藏'}
          </Tag>
        </div>
      ),
      filters: [
        { text: '显示中', value: 1 },
        { text: '已隐藏', value: 0 },
        { text: '已回复', value: 'replied' },
        { text: '未回复', value: 'not_replied' },
      ],
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right' as const,
      render: (_: any, record: Comment) => (
        <Space size="small">
          <Button 
            type="link"
            icon={<MessageOutlined />}
            size="small"
            onClick={() => handleOpenReplyModal(record.commentId, record.productName)}
            className="action-btn"
          >
            回复
          </Button>
          <Link to={`/comment/detail/${record.commentId}`}>
            <Button
              type="link"
              icon={<FileTextOutlined />}
              size="small"
              className="action-btn"
            >
              详情
            </Button>
          </Link>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'status',
                  icon: record.status === 1 ? <EyeOutlined /> : <CheckCircleOutlined />,
                  label: record.status === 1 ? '隐藏' : '显示',
                  onClick: () => handleStatusChange(record.commentId, record.status === 1 ? 0 : 1)
                },
                {
                  type: 'divider' as const
                },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: '删除',
                  danger: true,
                  onClick: () => {
                    Modal.confirm({
                      title: '确定要删除此评价吗？',
                      icon: <ExclamationCircleOutlined />,
                      okText: '确定',
                      cancelText: '取消',
                      onOk: () => handleDelete(record.commentId)
                    });
                  }
                }
              ]
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button 
              type="text"
              size="small"
              icon={<MoreOutlined />}
              className="action-more-btn"
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // 表格选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  return (
    <div className="comment-list-container">
      <div className="mb-6">
        <Title level={2}>评价列表</Title>
        <div className="flex justify-between items-center">
          <p className="text-gray-500">管理所有用户对商品的评价，可查看、回复和删除评价</p>
        </div>
      </div>
      
      <Card className="mb-4">
        <Form layout="horizontal">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[200px]">
              <Search 
                placeholder="搜索评价内容、商品名称或用户名" 
                onSearch={handleSearch}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                enterButton
                allowClear
              />
            </div>
            <Select 
              placeholder="评分筛选" 
              style={{ width: 100 }} 
              onChange={handleRatingFilter}
              value={filterRating}
              allowClear
            >
              <Option value={5}>⭐⭐⭐⭐⭐</Option>
              <Option value={4}>⭐⭐⭐⭐</Option>
              <Option value={3}>⭐⭐⭐</Option>
              <Option value={2}>⭐⭐</Option>
              <Option value={1}>⭐</Option>
            </Select>
            
            <RangePicker 
              value={dateRange as any}
              onChange={handleDateRangeChange as any}
              placeholder={['开始日期', '结束日期']}
              style={{ width: 240 }}
            />
            
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </div>
        </Form>
      </Card>

      <Card>
        <div className="mb-3 flex flex-wrap justify-between items-center gap-2">
          <Space size="small">
            <Button 
              danger 
              disabled={selectedRowKeys.length === 0} 
              onClick={handleBatchDelete}
              icon={<DeleteOutlined />}
              size="small"
            >
              批量删除 {selectedRowKeys.length > 0 && `(${selectedRowKeys.length})`}
            </Button>
          </Space>
          <Space size="small">
            <Button 
              type="primary" 
              icon={<ExportOutlined />} 
              onClick={handleExportComments}
              size="small"
            >
              导出
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => fetchComments()}
              size="small"
            >
              刷新
            </Button>
          </Space>
        </div>

        <Table 
            rowSelection={rowSelection}
            columns={columns as TableProps<Comment>['columns']} 
            dataSource={comments}
            rowKey="commentId"
            loading={loading}
            pagination={{
              ...pagination,
              showQuickJumper: true,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total) => `共 ${total} 条评价`,
            }}
            onChange={handleTableChange as any}
            scroll={{ x: 900 }}
            size="small"
          />
      </Card>

      {/* 评价回复模态框 */}
      {replyModal.visible && replyModal.commentId && (
        <CommentReplyModal
          visible={replyModal.visible}
          commentId={replyModal.commentId}
          productName={replyModal.productName}
          onClose={handleCloseReplyModal}
        />
      )}
    </div>
  );
};

/**
 * 评价列表页面
 * 使用CommentList组件并添加额外的样式容器
 */
const CommentListPage: React.FC = () => {
  return (
    <div className="comment-list-page">
      <CommentList />
    </div>
  );
};

export default CommentListPage; 