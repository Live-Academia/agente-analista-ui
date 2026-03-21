// Tipos TypeScript para a API do Deep Agent

export interface AnalysisResult {
  data_summary: DataSummary;
  statistical_analysis: StatisticalAnalysis;
  patterns: string[];
  insights: string[];
  source_name: string;
  error?: string | null;
}

export interface DataSummary {
  shape: { rows: number; columns: number };
  columns: Record<string, string>;
  numeric_columns: string[];
  categorical_columns: string[];
  null_counts: Record<string, number>;
  null_pct: Record<string, number>;
  head: Record<string, unknown>[];
  describe: Record<string, Record<string, unknown>>;
  unique_counts: Record<string, number>;
}

export interface StatisticalAnalysis {
  high_correlations?: Array<{ col1: string; col2: string; value: number }>;
  outliers?: Record<string, OutlierInfo | number>;
  distributions?: Record<string, Record<string, number>>;
  numeric_profile?: Record<string, NumericProfile>;
  temporal?: TemporalAnalysis | null;
  segments?: Record<string, SegmentInfo>;
  business_metrics?: BusinessMetrics;
}

export interface OutlierInfo {
  count: number;
  lower_bound: number;
  upper_bound: number;
  min_outlier: number;
  max_outlier: number;
}

export interface NumericProfile {
  mean: number;
  median: number;
  std: number;
  skewness: number;
  kurtosis: number;
  cv: number;
}

export interface TemporalAnalysis {
  date_column: string;
  period_count: number;
  date_range: string;
  period_totals: Record<string, Record<string, number>>;
  growth: Record<string, GrowthInfo>;
}

export interface GrowthInfo {
  trend: "crescente" | "decrescente" | "estavel";
  avg_growth_pct: number;
}

export interface SegmentInfo {
  unique_values: number;
  aggregation: Record<string, Record<string, number>>;
}

export interface BusinessMetrics {
  total_vendas?: number;
  total_lucro?: number;
  margem_lucro_pct?: number;
  ticket_medio?: number;
  [key: string]: number | undefined;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type DataSourceType = "file" | "google-sheets" | "supabase" | "bigquery";
