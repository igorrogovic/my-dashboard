export interface DataPoint {
    name: string;
    cost: number;
    impressions: number;
    clicks: number;
    ctr: number;
    conversions: number;
    value: number;
    cvr: number;
    cpa: number;
    roas: number;
    aov: number;
  }
  
  export type MetricType = keyof Omit<DataPoint, 'name'>;
  
  export interface MetricConfig {
    color: string;
    title: string;
    format: (value: number) => string;
  }