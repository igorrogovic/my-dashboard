'use client';

import { LineChart, XAxis, YAxis, Line, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

interface ChartProps {
  data: any[];
  selectedMetrics: string[]; // Changed to array to handle two metrics
  metricConfig: any;
}

const Chart = ({ data, selectedMetrics, metricConfig }: ChartProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-[400px] flex items-center justify-center">Loading chart...</div>;
  }

  const [primaryMetric, secondaryMetric] = selectedMetrics;

  return (
    <div className="w-full h-[400px] px-5">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 60, left: 20, bottom: 80 }}>
          <XAxis 
            dataKey="name" 
            angle={-75}
            textAnchor="end"
            height={80}
            interval={0}
            tick={{fontSize: 12}}
          />
          {/* Left Y-axis for primary metric */}
          <YAxis
            yAxisId="left"
            tick={{fontSize: 12}}
            tickFormatter={(value) => metricConfig[primaryMetric].format(value)}
          />
          {/* Right Y-axis for secondary metric */}
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{fontSize: 12}}
            tickFormatter={(value) => metricConfig[secondaryMetric].format(value)}
          />
          <Tooltip 
            formatter={(value, name) => {
              const metric = name as string;
              return metricConfig[metric].format(value as number);
            }}
          />
          {/* Line for primary metric */}
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey={primaryMetric}
            stroke={metricConfig[primaryMetric].color}
            strokeWidth={4}
            dot={{ r: 2 }}
          />
          {/* Line for secondary metric */}
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey={secondaryMetric}
            stroke={metricConfig[secondaryMetric].color}
            strokeWidth={4}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;