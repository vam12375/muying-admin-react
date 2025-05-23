import { ReactNode } from 'react'
import { Table, TableProps, Input, Button, Tooltip } from 'antd'
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons'
import Card from '../Card'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { useTheme } from '@/theme/useTheme'

interface DataTableProps<RecordType> extends Omit<TableProps<RecordType>, 'title'> {
  title?: string
  extra?: ReactNode
  search?: {
    placeholder?: string
    onSearch: (value: string) => void
    searchValue: string
    onChange?: (value: string) => void
  }
  toolbar?: {
    reload?: {
      onClick: () => void
      loading?: boolean
    }
    create?: {
      onClick: () => void
      text?: string
    }
    extra?: ReactNode
  }
  card?: boolean
  cardProps?: {
    shadow?: 'none' | 'sm' | 'md' | 'lg'
    className?: string
  }
}

/**
 * 数据表格组件
 * 包装Ant Design表格，添加搜索、刷新、创建按钮等功能
 */
function DataTable<RecordType extends object = any>({
  title,
  columns = [],
  dataSource = [],
  loading = false,
  pagination = { position: ['bottomRight'] },
  rowKey = 'id',
  extra,
  search,
  toolbar,
  card = true,
  cardProps,
  ...restProps
}: DataTableProps<RecordType>) {
  const { isDark } = useTheme()

  // 表格顶部操作栏
  const renderToolbar = () => {
    if (!search && !toolbar && !title && !extra) return null

    return (
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* 左侧标题 */}
        {title && (
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 m-0">
            {title}
          </h2>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 ml-auto">
          {/* 搜索框 */}
          {search && (
            <Input
              placeholder={search.placeholder || '搜索...'}
              value={search.searchValue}
              onChange={e => search.onChange && search.onChange(e.target.value)}
              onPressEnter={e => search.onSearch((e.target as HTMLInputElement).value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-full sm:w-64"
              allowClear
            />
          )}

          {/* 工具栏按钮 */}
          {toolbar && (
            <div className="flex items-center gap-2">
              {toolbar.reload && (
                <Tooltip title="刷新">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={toolbar.reload.onClick}
                    loading={toolbar.reload.loading}
                  />
                </Tooltip>
              )}

              {toolbar.create && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={toolbar.create.onClick}
                >
                  {toolbar.create.text || '新建'}
                </Button>
              )}

              {toolbar.extra}
            </div>
          )}

          {/* 额外内容 */}
          {extra && (
            <div className="ml-2">
              {extra}
            </div>
          )}
        </div>
      </div>
    )
  }

  // 表格内容
  const table = (
    <>
      {renderToolbar()}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Table<RecordType>
          rowKey={rowKey}
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={pagination}
          scroll={{ x: 'max-content' }}
          className={clsx(
            'custom-table',
            isDark && 'table-dark'
          )}
          {...restProps}
        />
      </motion.div>
    </>
  )

  // 根据card属性决定是否使用Card组件包装
  if (card) {
    return (
      <Card 
        className={cardProps?.className}
        shadow={cardProps?.shadow || 'sm'}
        bordered
      >
        {table}
      </Card>
    )
  }

  return table
}

export default DataTable 