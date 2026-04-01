'use client';

import { useState, useMemo } from 'react';
import PlotlyChart from '@/components/PlotlyChart';
import ChartCard from '@/components/ChartCard';
import ParamSlider from '@/components/ParamSlider';
import { generateBiomarkerData } from '@/lib/drug-data';

export default function BoxPlotsPage() {
  const biomarkerData = useMemo(() => generateBiomarkerData(300), []);
  const [showPoints, setShowPoints] = useState(true);
  const [threshold, setThreshold] = useState(65);

  // For grouped box plot - generate two timepoints
  const groupedData = useMemo(() => {
    const baseline = generateBiomarkerData(200);
    const week12 = baseline.map((g) => ({
      ...g,
      values: g.values.map((v) => v + (g.group !== 'Placebo' ? 15 + Math.random() * 10 : Math.random() * 5)),
    }));
    return { baseline, week12 };
  }, []);

  // Violin plot state
  const [violinSide, setViolinSide] = useState<'both' | 'positive' | 'negative'>('both');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Box Plots</h1>
        <p className="text-gray-500 mt-1">Distribution analysis for pharmacokinetic parameters and biomarkers</p>
      </div>

      <div className="grid gap-8">
        {/* 1. Standard Box Plot */}
        <ChartCard
          title="Standard Box Plot — Biomarker by Dose Group"
          description="Distribution of plasma biomarker levels across treatment arms."
          useCases={['Exposure distribution', 'PK parameter variability', 'Population spread (median, quartiles)']}
          controls={
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showPoints} onChange={(e) => setShowPoints(e.target.checked)} className="accent-blue-600" />
                Show points
              </label>
              <ParamSlider label="Safety threshold" value={threshold} min={40} max={100} onChange={setThreshold} />
            </div>
          }
        >
          <PlotlyChart
            data={biomarkerData.map((group, i) => ({
              y: group.values,
              type: 'box' as const,
              name: group.group,
              boxpoints: showPoints ? ('all' as const) : (false as const),
              jitter: 0.4,
              pointpos: -1.5,
              marker: { opacity: 0.5, size: 3 },
              line: { width: 2 },
            }))}
            layout={{
              height: 450,
              margin: { t: 20, b: 60, l: 60, r: 20 },
              yaxis: { title: 'Biomarker Level (ng/mL)', gridcolor: '#f1f5f9' },
              xaxis: { title: 'Dose Group' },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              showlegend: false,
              shapes: [
                {
                  type: 'line',
                  y0: threshold,
                  y1: threshold,
                  x0: -0.5,
                  x1: biomarkerData.length - 0.5,
                  line: { color: '#ef4444', dash: 'dash', width: 1.5 },
                },
              ],
              annotations: [
                {
                  x: biomarkerData.length - 1,
                  y: threshold,
                  text: `Safety threshold (${threshold})`,
                  showarrow: false,
                  yshift: 15,
                  font: { color: '#ef4444', size: 11 },
                },
              ],
            }}
          />
        </ChartCard>

        {/* 2. Grouped Box Plot */}
        <ChartCard
          title="Grouped Box Plot — Baseline vs Week 12"
          description="Compare biomarker distributions across dose groups at two timepoints."
          useCases={['Covariate comparison (sex, genotype, renal class)', 'Dose group comparison', 'Population subgroup variability']}
        >
          <PlotlyChart
            data={[
              ...groupedData.baseline.map((group) => ({
                y: group.values,
                type: 'box' as const,
                name: `${group.group} (Baseline)`,
                legendgroup: 'Baseline',
                marker: { color: '#93c5fd' },
                line: { color: '#2563eb' },
              })),
              ...groupedData.week12.map((group) => ({
                y: group.values,
                type: 'box' as const,
                name: `${group.group} (Week 12)`,
                legendgroup: 'Week 12',
                marker: { color: '#c4b5fd' },
                line: { color: '#7c3aed' },
              })),
            ]}
            layout={{
              height: 480,
              margin: { t: 20, b: 60, l: 60, r: 20 },
              yaxis: { title: 'Biomarker Level (ng/mL)', gridcolor: '#f1f5f9' },
              boxmode: 'group',
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              legend: { orientation: 'h', y: -0.2 },
            }}
          />
        </ChartCard>

        {/* 3. Violin Plot */}
        <ChartCard
          title="Violin Plot — PK Exposure Distribution"
          description="Density distribution visualization showing the full shape of exposure data per dose."
          useCases={['Density distribution visualization', 'Population variability exploration', 'Comparing distribution shapes between groups']}
          controls={
            <select
              value={violinSide}
              onChange={(e) => setViolinSide(e.target.value as 'both' | 'positive' | 'negative')}
              className="text-sm border rounded-md px-2 py-1 bg-white"
            >
              <option value="both">Both sides</option>
              <option value="positive">Right only</option>
              <option value="negative">Left only</option>
            </select>
          }
        >
          <PlotlyChart
            data={biomarkerData.map((group) => ({
              y: group.values,
              type: 'violin' as const,
              name: group.group,
              box: { visible: true },
              meanline: { visible: true },
              side: violinSide,
              points: 'all' as const,
              jitter: 0.3,
              pointpos: violinSide === 'positive' ? -0.5 : violinSide === 'negative' ? 0.5 : 0,
              marker: { opacity: 0.3, size: 3 },
              line: { width: 2 },
            }))}
            layout={{
              height: 480,
              margin: { t: 20, b: 60, l: 60, r: 20 },
              yaxis: { title: 'AUC₀₋₂₄ (ng·h/mL)', gridcolor: '#f1f5f9' },
              xaxis: { title: 'Dose Group' },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              showlegend: false,
              violinmode: 'group',
            }}
          />
        </ChartCard>
      </div>
    </div>
  );
}
