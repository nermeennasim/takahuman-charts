'use client';

import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface PlotlyChartProps {
  data: any[];
  layout?: any;
  config?: any;
  className?: string;
  style?: React.CSSProperties;
  useResizeHandler?: boolean;
}

export default function PlotlyChart({ className, data, layout, config, style }: PlotlyChartProps) {
  return (
    <div className={className}>
      <Plot
        data={data}
        layout={layout}
        config={{
          responsive: true,
          displayModeBar: true,
          modeBarButtonsToRemove: ['lasso2d', 'select2d'],
          displaylogo: false,
          ...config,
        }}
        useResizeHandler
        style={{ width: '100%', height: '100%', ...style }}
      />
    </div>
  );
}
