// 时间范围类型
export type TimeRange = 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

// 图表类型
export type ChartType = 
  | 'line' 
  | 'bar' 
  | 'pie' 
  | 'column' 
  | 'area' 
  | 'scatter' 
  | 'heatmap' 
  | 'radar' 
  | 'funnel'
  | 'gauge'
  | 'sunburst'
  | 'treemap'
  | 'sankey'
  | 'table';

// 数据维度
export interface Dimension {
  id: string;
  name: string;
  field: string;
  type: 'category' | 'time' | 'value';
}

// 数据指标
export interface Metric {
  id: string;
  name: string;
  field: string;
  type: 'count' | 'sum' | 'avg' | 'max' | 'min';
  format?: 'number' | 'currency' | 'percent' | 'date';
  description?: string;
}

// 过滤条件
export interface Filter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'between' | 'contains';
  value: any;
}

// 排序配置
export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

// 图表配置
export interface ChartConfig {
  id: string;
  name: string;
  type: ChartType;
  dimensions: string[]; // 维度ID列表
  metrics: string[];    // 指标ID列表
  filters?: Filter[];
  sort?: SortConfig;
  limit?: number;
  options?: Record<string, any>; // 图表特定配置
}

// 报表组件类型
export interface ReportComponent {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'text';
  title?: string;
  description?: string;
  config: ChartConfig | Record<string, any>;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

// 报表配置
export interface ReportConfig {
  components: ReportComponent[];
  layout: {
    width: number;
    height: number;
  };
  theme?: 'light' | 'dark' | 'custom';
  customTheme?: Record<string, any>;
}

// 报表导出配置
export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv' | 'image';
  includeComponents?: string[]; // 组件ID列表，为空则包含全部
  filename?: string;
  sheetName?: string; // 仅Excel
  pageSize?: 'A4' | 'A3' | 'Letter' | 'Legal'; // 仅PDF
  orientation?: 'portrait' | 'landscape'; // 仅PDF
  quality?: number; // 仅图片
}

// 计划报表
export interface ScheduledReport {
  id: string;
  reportId: string;
  name: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    day?: number; // 每月的第几天或每周的第几天
    time: string; // HH:MM格式
    timezone?: string;
  };
  exportOptions: ExportOptions;
  recipients: {
    emails: string[];
    notifyUsers: string[]; // 用户ID列表
  };
  active: boolean;
  lastRun?: string;
  nextRun?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 多维分析配置
export interface CrossAnalysisConfig {
  rows: Dimension[];
  columns: Dimension[];
  values: Metric[];
  filters?: Filter[];
  sort?: SortConfig[];
}

// 分析结果数据
export type AnalysisResult = Record<string, any>[];

// 导出历史记录
export interface ExportHistory {
  id: string;
  reportId: string;
  reportName: string;
  exportedBy: string;
  exportedAt: string;
  format: 'excel' | 'pdf' | 'csv' | 'image';
  status: 'success' | 'failed' | 'processing';
  downloadUrl?: string;
  errorMessage?: string;
} 