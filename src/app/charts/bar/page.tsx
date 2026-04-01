'use client';

import { useState, useMemo } from 'react';
import PlotlyChart from '@/components/PlotlyChart';
import ChartCard from '@/components/ChartCard';
import ParamSlider from '@/components/ParamSlider';
import {
  generateFeatureAdoptionBar,
  generateGroupedBarData,
  generateWaterfallData,
  generateTornadoData,
} from '@/lib/drug-data';

export default function BarChartsPage() {
  // Classic Bar Chart state
  const [barSortOrder, setBarSortOrder] = useState<'asc' | 'desc' | 'default'>('desc');
  const barData = useMemo(() => {
    const raw = generateFeatureAdoptionBar();
    if (barSortOrder === 'asc') return [...raw].sort((a, b) => a.users - b.users);
    if (barSortOrder === 'desc') return [...raw].sort((a, b) => b.users - a.users);
    return raw;
  }, [barSortOrder]);

  // Horizontal Bar Chart state
  const [topN, setTopN] = useState(6);

  // Grouped Bar Chart state
  const grouped = useMemo(() => generateGroupedBarData(), []);
  const [showThreshold, setShowThreshold] = useState(true);

  // Waterfall state
  const [nPatients, setNPatients] = useState(25);
  const waterfall = useMemo(() => generateWaterfallData(nPatients), [nPatients]);

  // Tornado state
  const tornado = useMemo(() => generateTornadoData(), []);
  const [tornadoTopN, setTornadoTopN] = useState(8);

  const colorMap: Record<string, string> = {
    Core: '#2563eb',
    Analysis: '#0891b2',
    Advanced: '#6366f1',
    Specialist: '#8b5cf6',
    Utility: '#64748b',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bar Charts</h1>
        <p className="text-gray-500 mt-1">Drug simulation feature adoption & clinical trial analysis</p>
      </div>

      <div className="grid gap-8">
        {/* 1. Classic Bar Chart */}
        <ChartCard
          title="Classic Bar Chart — Feature Adoption"
          description="Vertical bar chart showing platform feature usage across TakaHuman simulation tools."
          useCases={['Feature adoption tracking', 'Usage comparison', 'Product analytics']}
          controls={
            <select
              value={barSortOrder}
              onChange={(e) => setBarSortOrder(e.target.value as 'asc' | 'desc' | 'default')}
              className="text-sm border rounded-md px-2 py-1 bg-white"
            >
              <option value="desc">Sort: High → Low</option>
              <option value="asc">Sort: Low → High</option>
              <option value="default">Default Order</option>
            </select>
          }
        >
          <PlotlyChart
            data={[
              {
                x: barData.map((d) => d.feature),
                y: barData.map((d) => d.users),
                type: 'bar',
                marker: {
                  color: barData.map((d) => colorMap[d.category] || '#2563eb'),
                },
                text: barData.map((d) => `${d.users} users`),
                textposition: 'auto',
                hovertemplate: '<b>%{x}</b><br>Users: %{y}<extra></extra>',
              },
            ]}
            layout={{
              height: 420,
              margin: { t: 20, b: 100, l: 60, r: 20 },
              xaxis: { title: 'Feature', tickangle: -30 },
              yaxis: { title: 'Active Users', gridcolor: '#f1f5f9' },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              shapes: [
                {
                  type: 'line',
                  y0: 500,
                  y1: 500,
                  x0: -0.5,
                  x1: barData.length - 0.5,
                  line: { color: '#ef4444', dash: 'dash', width: 1.5 },
                },
              ],
              annotations: [
                {
                  x: barData.length - 1,
                  y: 500,
                  text: 'Adoption threshold',
                  showarrow: false,
                  yshift: 15,
                  font: { color: '#ef4444', size: 11 },
                },
              ],
            }}
          />
        </ChartCard>

        {/* 2. Horizontal Bar Chart */}
        <ChartCard
          title="Horizontal Bar Chart — Top Features by Usage"
          description="Horizontal bars for easy label readability on longer category names."
          useCases={['Ranked comparisons', 'Category analysis', 'Subgroup exposure']}
          controls={
            <ParamSlider label="Show top" value={topN} min={3} max={8} onChange={setTopN} />
          }
        >
          <PlotlyChart
            data={[
              {
                y: barData.slice(0, topN).map((d) => d.feature).reverse(),
                x: barData.slice(0, topN).map((d) => d.users).reverse(),
                type: 'bar',
                orientation: 'h',
                marker: {
                  color: barData.slice(0, topN).map((d) => colorMap[d.category] || '#2563eb').reverse(),
                },
                text: barData.slice(0, topN).map((d) => `${d.users}`).reverse(),
                textposition: 'auto',
                hovertemplate: '<b>%{y}</b><br>Users: %{x}<extra></extra>',
              },
            ]}
            layout={{
              height: 400,
              margin: { t: 20, b: 40, l: 140, r: 40 },
              xaxis: { title: 'Active Users', gridcolor: '#f1f5f9' },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
            }}
          />
        </ChartCard>

        {/* 3. Grouped Bar Chart */}
        <ChartCard
          title="Grouped Bar Chart — Treatment vs Placebo Response"
          description="Compare treatment arms across timepoints in a clinical trial."
          useCases={['Covariate comparison', 'Dose comparisons', 'Subgroup exposure']}
          controls={
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showThreshold}
                onChange={(e) => setShowThreshold(e.target.checked)}
                className="accent-blue-600"
              />
              Threshold line
            </label>
          }
        >
          <PlotlyChart
            data={[
              {
                x: grouped.timepoints,
                y: grouped.treatment,
                type: 'bar',
                name: 'Treatment (50mg)',
                marker: { color: '#2563eb' },
              },
              {
                x: grouped.timepoints,
                y: grouped.placebo,
                type: 'bar',
                name: 'Placebo',
                marker: { color: '#94a3b8' },
              },
            ]}
            layout={{
              height: 420,
              margin: { t: 20, b: 60, l: 60, r: 20 },
              barmode: 'group',
              xaxis: { title: 'Visit' },
              yaxis: { title: 'Response Score', gridcolor: '#f1f5f9' },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              legend: { orientation: 'h', y: -0.2 },
              shapes: showThreshold
                ? [
                    {
                      type: 'line',
                      y0: grouped.threshold,
                      y1: grouped.threshold,
                      x0: -0.5,
                      x1: grouped.timepoints.length - 0.5,
                      line: { color: '#ef4444', dash: 'dash', width: 1.5 },
                    },
                  ]
                : [],
            }}
          />
        </ChartCard>

        {/* 4. Waterfall Chart */}
        <ChartCard
          title="Waterfall Chart — Tumor Response (%)"
          description="Individual patient tumor size change from baseline. Sorted by response magnitude."
          useCases={['Tumor response', 'Individual change', 'RECIST criteria']}
          controls={
            <ParamSlider label="Patients" value={nPatients} min={10} max={40} onChange={setNPatients} />
          }
        >
          <PlotlyChart
            data={[
              {
                x: waterfall.map((d) => d.patient),
                y: waterfall.map((d) => d.change),
                type: 'bar',
                marker: {
                  color: waterfall.map((d) =>
                    d.change < -30 ? '#16a34a' : d.change < 0 ? '#86efac' : d.change < 20 ? '#fbbf24' : '#ef4444'
                  ),
                },
                hovertemplate: '<b>%{x}</b><br>Change: %{y:.1f}%<extra></extra>',
              },
            ]}
            layout={{
              height: 420,
              margin: { t: 20, b: 80, l: 60, r: 20 },
              xaxis: { title: 'Patient ID', tickangle: -60, tickfont: { size: 9 } },
              yaxis: { title: 'Change from Baseline (%)', gridcolor: '#f1f5f9', zeroline: true, zerolinecolor: '#333', zerolinewidth: 2 },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              shapes: [
                { type: 'line', y0: -30, y1: -30, x0: -0.5, x1: waterfall.length - 0.5, line: { color: '#2563eb', dash: 'dash', width: 1 } },
                { type: 'line', y0: 20, y1: 20, x0: -0.5, x1: waterfall.length - 0.5, line: { color: '#ef4444', dash: 'dash', width: 1 } },
              ],
              annotations: [
                { x: 0, y: -30, text: 'PR (-30%)', showarrow: false, xshift: 40, font: { color: '#2563eb', size: 10 } },
                { x: 0, y: 20, text: 'PD (+20%)', showarrow: false, xshift: 40, font: { color: '#ef4444', size: 10 } },
              ],
            }}
          />
        </ChartCard>

        {/* 5. Tornado Chart */}
        <ChartCard
          title="Tornado Chart — Sensitivity Analysis"
          description="One-at-a-time parameter sensitivity on AUC. Shows which PK parameters most influence exposure."
          useCases={['Exploratory relationship', 'Covariate inspection', 'Raw biomarker vs exposure']}
          controls={
            <ParamSlider label="Parameters" value={tornadoTopN} min={4} max={10} onChange={setTornadoTopN} />
          }
        >
          <PlotlyChart
            data={[
              {
                y: tornado.slice(0, tornadoTopN).map((d) => d.parameter).reverse(),
                x: tornado.slice(0, tornadoTopN).map((d) => d.low).reverse(),
                type: 'bar',
                orientation: 'h',
                name: 'Low (-20%)',
                marker: { color: '#1e40af' },
                hovertemplate: '%{y}: %{x:.1f}%<extra></extra>',
              },
              {
                y: tornado.slice(0, tornadoTopN).map((d) => d.parameter).reverse(),
                x: tornado.slice(0, tornadoTopN).map((d) => d.high).reverse(),
                type: 'bar',
                orientation: 'h',
                name: 'High (+20%)',
                marker: { color: '#60a5fa' },
                hovertemplate: '%{y}: %{x:.1f}%<extra></extra>',
              },
            ]}
            layout={{
              height: 450,
              margin: { t: 20, b: 40, l: 160, r: 40 },
              barmode: 'relative',
              xaxis: { title: '% Change in AUC', gridcolor: '#f1f5f9', zeroline: true, zerolinecolor: '#333' },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              legend: { orientation: 'h', y: -0.15 },
            }}
          />
        </ChartCard>
      </div>
    </div>
  );
}
