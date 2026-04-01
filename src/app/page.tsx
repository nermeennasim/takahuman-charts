'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import PlotlyChart from '@/components/PlotlyChart';
import {
  BarChart3,
  BoxSelect,
  ScatterChart,
  LineChart,
  Layers,
  Grid3X3,
  Box,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { kpiData, generatePKConcentrationTime, generateFeatureAdoptionBar } from '@/lib/drug-data';

const chartPages = [
  { href: '/charts/bar', label: 'Bar Charts', icon: BarChart3, count: 5, color: 'from-blue-500 to-blue-600' },
  { href: '/charts/box', label: 'Box Plots', icon: BoxSelect, count: 3, color: 'from-violet-500 to-violet-600' },
  { href: '/charts/scatter', label: 'Scatter Plots', icon: ScatterChart, count: 4, color: 'from-cyan-500 to-cyan-600' },
  { href: '/charts/line', label: 'Line Charts', icon: LineChart, count: 4, color: 'from-emerald-500 to-emerald-600' },
  { href: '/charts/contour', label: 'Contour Plots', icon: Layers, count: 2, color: 'from-amber-500 to-amber-600' },
  { href: '/charts/heatmap', label: 'Heatmaps', icon: Grid3X3, count: 2, color: 'from-rose-500 to-rose-600' },
  { href: '/charts/three-d', label: '3D Charts', icon: Box, count: 2, color: 'from-indigo-500 to-indigo-600' },
];

const kpis = [
  { label: 'Monthly Active Users', ...kpiData.monthlyActiveUsers, icon: Users, format: (v: number) => v.toLocaleString() },
  { label: 'Daily Active Users', ...kpiData.dailyActiveUsers, icon: Activity, format: (v: number) => v.toLocaleString() },
  { label: 'Retention Rate', ...kpiData.retentionRate, icon: Zap, format: (v: number) => `${v}%` },
  { label: 'Simulations Run', ...kpiData.simulationsRun, icon: TrendingUp, format: (v: number) => v.toLocaleString() },
  { label: 'Error Rate', ...kpiData.errorRate, icon: AlertTriangle, format: (v: number) => `${v}%` },
];

export default function DashboardPage() {
  const pkPreview = useMemo(() => generatePKConcentrationTime([25, 50, 100]), []);
  const barPreview = useMemo(() => generateFeatureAdoptionBar().slice(0, 6), []);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Drug Simulation Analytics</h1>
        <p className="text-gray-500 mt-1">
          Interactive chart explorer for pharmacokinetic modeling, biomarker analysis, and drug discovery
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <kpi.icon size={18} className="text-gray-400" />
              <span
                className={`text-xs font-medium flex items-center gap-1 ${
                  kpi.trend === 'up'
                    ? kpi.label === 'Error Rate'
                      ? 'text-red-500'
                      : 'text-emerald-600'
                    : kpi.label === 'Error Rate'
                      ? 'text-emerald-600'
                      : 'text-red-500'
                }`}
              >
                {kpi.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(kpi.change)}%
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{kpi.format(kpi.value)}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Chart Type Navigator */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Chart Explorer</h2>
      <p className="text-sm text-gray-500 mb-4">
        22 interactive charts across 7 categories — each with adjustable parameters, axis controls, and drug simulation data. Click any card to explore.
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {chartPages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="group bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all"
          >
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${page.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
            >
              <page.icon size={20} className="text-white" />
            </div>
            <div className="font-semibold text-gray-900">{page.label}</div>
            <div className="text-xs text-gray-500 mt-1">{page.count} interactive charts</div>
          </Link>
        ))}
      </div>

      {/* Preview Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">PK Concentration-Time Preview</h3>
          <PlotlyChart
            data={pkPreview.map((d, i) => ({
              x: d.time,
              y: d.concentration,
              type: 'scatter' as const,
              mode: 'lines' as const,
              name: `${d.dose}mg`,
              line: { width: 2 },
            }))}
            layout={{
              height: 280,
              margin: { t: 10, b: 40, l: 50, r: 10 },
              xaxis: { title: 'Time (h)', gridcolor: '#f1f5f9' },
              yaxis: { title: 'Conc (ng/mL)', gridcolor: '#f1f5f9' },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              legend: { orientation: 'h', y: -0.3 },
              showlegend: true,
            }}
          />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Feature Adoption Overview</h3>
          <PlotlyChart
            data={[
              {
                y: barPreview.map((d) => d.feature).reverse(),
                x: barPreview.map((d) => d.users).reverse(),
                type: 'bar',
                orientation: 'h',
                marker: { color: '#3b82f6' },
                text: barPreview.map((d) => `${d.users}`).reverse(),
                textposition: 'auto',
              },
            ]}
            layout={{
              height: 280,
              margin: { t: 10, b: 40, l: 120, r: 10 },
              xaxis: { title: 'Users', gridcolor: '#f1f5f9' },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              showlegend: false,
            }}
          />
        </div>
      </div>
    </div>
  );
}
