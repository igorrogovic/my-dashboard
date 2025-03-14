// pages/index.tsx or app/page.tsx
'use client';
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import StatCard from './components/StatCard'
import DateRangeCard from './components/DateRangeCard'
import { LineChart, XAxis, YAxis, Line, Tooltip, ResponsiveContainer } from 'recharts'

// Define types
type MetricType = 'cost' | 'impressions' | 'clicks' | 'ctr' | 'conversions' | 
                 'value' | 'cvr' | 'cpa' | 'roas' | 'aov';

type DateRangeType = '7' | '30' | '90';
interface MetricConfig {
  color: string;
  title: string;
  format: (value: number) => string;
}

interface DataPoint {
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

// CSV URL configuration
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT4HJd_4HWo3oS9SeuqZHISLpT-_rMmDE6_YwYGWLCsdbe-40YDUVQ2YUhNF0Ym6WKWlAAWg8RtoF0a/pub?output=csv';

export default function Home() {
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>([]);
  const [data, setData] = useState<DataPoint[]>([]);
  const [dateRange, setDateRange] = useState<DateRangeType>('30');
  const [filteredData, setFilteredData] = useState<DataPoint[]>([]);

  // Function to filter data based on date range
  const filterDataByDateRange = (fullData: DataPoint[], days: number) => {
    const today = new Date();
    const startDate = new Date(today.setDate(today.getDate() - days));
    
    return fullData.filter(item => {
      const itemDate = new Date(item.name);
      return itemDate >= startDate;
    });
  };

  // Calculate metrics for the selected date range
  const calculateMetrics = (data: DataPoint[]) => {
    const sumMetrics = data.reduce((acc, curr) => ({
      cost: acc.cost + curr.cost,
      impressions: acc.impressions + curr.impressions,
      clicks: acc.clicks + curr.clicks,
      conversions: acc.conversions + curr.conversions,
      value: acc.value + curr.value,
    }), {
      cost: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      value: 0,
    });

    // Calculate derived metrics
    const ctr = sumMetrics.clicks / sumMetrics.impressions;
    const cvr = sumMetrics.conversions / sumMetrics.clicks;
    const cpa = sumMetrics.cost / sumMetrics.conversions;
    const roas = sumMetrics.value / sumMetrics.cost;
    const aov = sumMetrics.value / sumMetrics.conversions;

    return {
      ...sumMetrics,
      ctr,
      cvr,
      cpa,
      roas,
      aov,
    };
  };

  // Fetch and process CSV data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(SHEET_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const csvText = await response.text();
        const rows = csvText
          .split('\n')
          .map(row => row.split(','))
          .filter(row => row.length > 1);
    
        if (rows.length === 0) {
          return;
        }

        const parseNumber = (value: string): number => {
          if (!value || value.trim() === '') return 0;
          
          // Remove any quotes and spaces
          let cleanValue = value.trim().replace(/"/g, '');
          
          // Handle percentage values
          if (cleanValue.includes('%')) {
            return Number(cleanValue.replace('%', '').replace(/,/g, '')) / 100;
          }
          
          // Handle currency values
          if (cleanValue.startsWith('$')) {
            cleanValue = cleanValue.substring(1);
          }
          
          // Remove commas and convert to number
          const number = Number(cleanValue.replace(/,/g, ''));
          return isNaN(number) ? 0 : number;
        };

        // Convert data rows to DataPoint objects (skip header row)
        const parsedData: DataPoint[] = rows.slice(1).map(row => ({
          name: row[0]?.trim() || '',
          cost: parseNumber(row[1]),
          impressions: parseNumber(row[2]),
          clicks: parseNumber(row[3]),
          ctr: parseNumber(row[4]),
          conversions: parseNumber(row[5]),
          value: parseNumber(row[6]),
          cvr: parseNumber(row[7]),
          cpa: parseNumber(row[8]),
          roas: parseNumber(row[9]),
          aov: parseNumber(row[10]),
        }));

        // Filter out invalid entries
        const validData = parsedData.filter(entry => 
          entry.name && 
          !isNaN(entry.cost) && 
          !isNaN(entry.impressions) && 
          !isNaN(entry.clicks) &&
          !isNaN(entry.conversions) &&
          !isNaN(entry.value) &&
          !isNaN(entry.cvr) &&
          !isNaN(entry.cpa) &&
          !isNaN(entry.roas) &&
          !isNaN(entry.aov) &&
          !isNaN(entry.ctr)
        );

        setData(validData);
        const filtered = filterDataByDateRange(validData, parseInt(dateRange));
        setFilteredData(filtered);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data.length) {
      const filtered = filterDataByDateRange(data, parseInt(dateRange));
      setFilteredData(filtered);
    }
  }, [dateRange, data]);

  // Configuration for different metrics
  const metricConfig: Record<MetricType, MetricConfig> = {
    cost: { 
      color: '#3b82f6', 
      title: 'Cost',
      format: (value) => `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    impressions: { 
      color: '#10b981', 
      title: 'Impressions',
      format: (value) => value.toLocaleString()
    },
    clicks: { 
      color: '#f59e0b', 
      title: 'Clicks',
      format: (value) => value.toLocaleString()
    },
    ctr: { 
      color: '#6366f1', 
      title: 'CTR',
      format: (value) => `${(value * 100).toFixed(2)}%`
    },
    conversions: { 
      color: '#dc2626', 
      title: 'Conversions',
      format: (value) => value.toLocaleString()
    },
    value: { 
      color: '#059669', 
      title: 'Value',
      format: (value) => `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    cvr: { 
      color: '#7c3aed', 
      title: 'CVR',
      format: (value) => `${(value * 100).toFixed(2)}%`
    },
    cpa: { 
      color: '#db2777', 
      title: 'CPA',
      format: (value) => `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    },
    roas: { 
      color: '#2563eb', 
      title: 'ROAS',
      format: (value) => `${value.toFixed(2)}x`
    },
    aov: { 
      color: '#9333ea', 
      title: 'AOV',
      format: (value) => `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
  };

  const handleStatCardClick = (metric: MetricType): void => {
    setSelectedMetrics(prev => {
      // If metric is already selected, remove it
      if (prev.includes(metric)) {
        return prev.filter(m => m !== metric);
      }
      // If we already have 2 metrics, remove the first one
      if (prev.length === 2) {
        return [...prev.slice(1), metric];
      }
      // Add the new metric
      return [...prev, metric];
    });
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          
          {/* Date Range Selector Cards */}
          <div className="flex gap-4">
            <DateRangeCard
              days="7"
              label="Last 7 Days"
              isSelected={dateRange === '7'}
              onClick={() => setDateRange('7')}
            />
            <DateRangeCard
              days="30"
              label="Last 30 Days"
              isSelected={dateRange === '30'}
              onClick={() => setDateRange('30')}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(metricConfig).map(([metric, config]) => {
            const metrics = calculateMetrics(filteredData);
            const metricIndex = selectedMetrics.indexOf(metric as MetricType);
            const isSelected = metricIndex !== -1;
            const isSecondSelected = metricIndex === 1;

            return (
              <div 
                key={metric}
                onClick={() => handleStatCardClick(metric as MetricType)} 
                className="cursor-pointer"
              >
                <StatCard 
                  title={config.title}
                  value={config.format(metrics[metric as keyof typeof metrics])}
                  icon={`fa-${metric}`}
                  isSelected={isSelected}
                  isSecondSelected={isSecondSelected}
                />
              </div>
            );
          })}
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            {selectedMetrics.length > 0 
              ? selectedMetrics.map(m => metricConfig[m].title).join(' vs ') + ' Trend'
              : 'Select up to 2 metrics'}
          </h3>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={filteredData}
                margin={{ top: 5, right: 60, left: 20, bottom: 80 }}
              >
                <XAxis 
                  dataKey="name" 
                  angle={-75}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{fontSize: 12}}
                />
                {selectedMetrics[0] && (
                  <YAxis
                    yAxisId="left"
                    tick={{fontSize: 12}}
                    tickFormatter={(value) => metricConfig[selectedMetrics[0]].format(value)}
                    stroke="#3b82f6" // Fixed blue color for first metric
                  />
                )}
                {selectedMetrics[1] && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{fontSize: 12}}
                    tickFormatter={(value) => metricConfig[selectedMetrics[1]].format(value)}
                    stroke="#7c3aed" // Fixed purple color for second metric
                  />
                )}
                <Tooltip 
                  formatter={(value, name) => {
                    const metric = name as MetricType;
                    return [
                      metricConfig[metric].format(value as number),
                      metricConfig[metric].title
                    ];
                  }}
                />
                {selectedMetrics.map((metric, index) => (
                  <Line 
                    key={metric}
                    type="monotone" 
                    dataKey={metric}
                    name={metric}
                    yAxisId={index === 0 ? "left" : "right"}
                    stroke={index === 0 ? "#3b82f6" : "#7c3aed"} // Fixed colors: blue for first, purple for second
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}