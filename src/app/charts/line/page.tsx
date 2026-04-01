'use client';

import { useState, useMemo } from 'react';
import PlotlyChart from '@/components/PlotlyChart';
import ChartCard from '@/components/ChartCard';
import ParamSlider from '@/components/ParamSlider';
import {
  generatePKConcentrationTime,
  generateSigmoidData,
  generateDualAxisData,
  generateSemiLogData,
} from '@/lib/drug-data';

const DOSE_COLORS = ['#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a'];

export default function LineChartsPage() {
  // Classic Line Chart state
  const [selectedDoses, setSelectedDoses] = useState([10, 25, 50, 100]);
  const pkData = useMemo(() => generatePKConcentrationTime(selectedDoses), [selectedDoses]);

  // Sigmoid state
  const sigmoid = useMemo(() => generateSigmoidData(), []);
  const [showCIBand, setShowCIBand] = useState(true);
  const [showScatter, setShowScatter] = useState(true);

  // Dual axis state
  const dualAxis = useMemo(() => generateDualAxisData(), []);
  const [showRiskZones, setShowRiskZones] = useState(true);

  // Semi-log state
  const semiLog = useMemo(() => generateSemiLogData(), []);
  const [showDoseMarkers, setShowDoseMarkers] = useState(true);
  const [showAUCShading, setShowAUCShading] = useState(false);

  const toggleDose = (dose: number) => {
    setSelectedDoses((prev) =>
      prev.includes(dose) ? prev.filter((d) => d !== dose) : [...prev, dose].sort((a, b) => a - b)
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Line Charts</h1>
        <p className="text-gray-500 mt-1">Pharmacokinetic concentration-time profiles and exposure modeling</p>
      </div>

      <div className="grid gap-8">
        {/* 1. Classic Line Chart — PK Concentration-Time */}
        <ChartCard
          title="Classic Line Chart — PK Concentration-Time Profile"
          description="One-compartment PK model showing drug concentration over time for multiple dose levels."
          useCases={['Sensitivity curves', 'Parameter trends', 'Basic exposure curves']}
          controls={
            <div className="flex items-center gap-2">
              {[10, 25, 50, 100].map((dose) => (
                <button
                  key={dose}
                  onClick={() => toggleDose(dose)}
                  className={`px-3 py-1 text-xs rounded-full border transition-all ${
                    selectedDoses.includes(dose)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-500 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {dose}mg
                </button>
              ))}
            </div>
          }
        >
          <PlotlyChart
            data={pkData.map((d, i) => ({
              x: d.time,
              y: d.concentration,
              type: 'scatter' as const,
              mode: 'lines' as const,
              name: `${d.dose}mg`,
              line: { color: DOSE_COLORS[i % DOSE_COLORS.length], width: 2.5 },
              fill: 'tozeroy',
              fillcolor: `${DOSE_COLORS[i % DOSE_COLORS.length]}15`,
              hovertemplate: `${d.dose}mg<br>Time: %{x:.1f}h<br>Conc: %{y:.2f} ng/mL<extra></extra>`,
            }))}
            layout={{
              height: 440,
              margin: { t: 20, b: 60, l: 70, r: 20 },
              xaxis: { title: 'Time (hours)', gridcolor: '#f1f5f9' },
              yaxis: { title: 'Concentration (ng/mL)', gridcolor: '#f1f5f9' },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              legend: { orientation: 'h', y: -0.2 },
              shapes: [
                {
                  type: 'line',
                  y0: 1.5,
                  y1: 1.5,
                  x0: 0,
                  x1: 24,
                  line: { color: '#ef4444', dash: 'dash', width: 1 },
                },
              ],
              annotations: [
                {
                  x: 22,
                  y: 1.5,
                  text: 'MEC',
                  showarrow: false,
                  yshift: 12,
                  font: { color: '#ef4444', size: 10 },
                },
              ],
            }}
          />
        </ChartCard>

        {/* 2. Sigmoid Line Chart */}
        <ChartCard
          title="Sigmoid Line Chart — Exposure-Response Curve"
          description="Emax model showing the sigmoidal relationship between drug exposure and pharmacological effect."
          useCases={['Exposure-Response', 'Probability curves', 'Effect modeling']}
          controls={
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showCIBand} onChange={(e) => setShowCIBand(e.target.checked)} className="accent-blue-600" />
                CI Band
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showScatter} onChange={(e) => setShowScatter(e.target.checked)} className="accent-blue-600" />
                Scatter Overlay
              </label>
            </div>
          }
        >
          <PlotlyChart
            data={[
              ...(showCIBand
                ? [
                    {
                      x: sigmoid.x,
                      y: sigmoid.ciUpper,
                      type: 'scatter' as const,
                      mode: 'lines' as const,
                      line: { color: 'transparent' },
                      showlegend: false,
                      hoverinfo: 'skip' as const,
                    },
                    {
                      x: sigmoid.x,
                      y: sigmoid.ciLower,
                      type: 'scatter' as const,
                      mode: 'lines' as const,
                      fill: 'tonexty' as const,
                      fillcolor: 'rgba(37, 99, 235, 0.12)',
                      line: { color: 'transparent' },
                      name: '90% CI',
                    },
                  ]
                : []),
              {
                x: sigmoid.x,
                y: sigmoid.y,
                type: 'scatter' as const,
                mode: 'lines' as const,
                name: 'Emax Model',
                line: { color: '#1e40af', width: 3 },
              },
              ...(showScatter
                ? [
                    {
                      x: sigmoid.scatterX,
                      y: sigmoid.scatterY,
                      type: 'scatter' as const,
                      mode: 'markers' as const,
                      name: 'Observed',
                      marker: { color: '#2563eb', opacity: 0.5, size: 8 },
                    },
                  ]
                : []),
            ]}
            layout={{
              height: 440,
              margin: { t: 20, b: 60, l: 60, r: 20 },
              xaxis: { title: 'Drug Exposure (AUC)', gridcolor: '#f1f5f9' },
              yaxis: { title: 'Effect (%)', gridcolor: '#f1f5f9', range: [-5, 110] },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              legend: { orientation: 'h', y: -0.2 },
              shapes: [
                {
                  type: 'line',
                  y0: 50,
                  y1: 50,
                  x0: 0,
                  x1: 25,
                  line: { color: '#94a3b8', dash: 'dot', width: 1 },
                },
              ],
              annotations: [
                { x: 24, y: 50, text: 'EC₅₀', showarrow: false, yshift: 12, font: { color: '#64748b', size: 10 } },
              ],
            }}
          />
        </ChartCard>

        {/* 3. Dual-Axis Line Chart */}
        <ChartCard
          title="Dual-Axis Line Chart — Efficacy vs Toxicity"
          description="Benefit-risk analysis showing efficacy and toxicity on separate Y axes over treatment duration."
          useCases={['Benefit-Risk', 'Dose decision', 'Therapeutic window analysis']}
          controls={
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={showRiskZones} onChange={(e) => setShowRiskZones(e.target.checked)} className="accent-blue-600" />
              Risk Zones
            </label>
          }
        >
          <PlotlyChart
            data={[
              {
                x: dualAxis.time,
                y: dualAxis.efficacy,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Efficacy',
                line: { color: '#2563eb', width: 2.5 },
                marker: { size: 5 },
              },
              {
                x: dualAxis.time,
                y: dualAxis.toxicity,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Toxicity',
                yaxis: 'y2',
                line: { color: '#ef4444', width: 2.5 },
                marker: { size: 5 },
              },
            ]}
            layout={{
              height: 440,
              margin: { t: 20, b: 60, l: 60, r: 60 },
              xaxis: { title: 'Week', gridcolor: '#f1f5f9' },
              yaxis: { title: 'Efficacy Score', gridcolor: '#f1f5f9', titlefont: { color: '#2563eb' }, tickfont: { color: '#2563eb' } },
              yaxis2: { title: 'Toxicity Grade', overlaying: 'y', side: 'right', titlefont: { color: '#ef4444' }, tickfont: { color: '#ef4444' } },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              legend: { orientation: 'h', y: -0.2 },
              shapes: showRiskZones
                ? [
                    {
                      type: 'rect',
                      y0: 60,
                      y1: 100,
                      x0: 0,
                      x1: 24,
                      fillcolor: 'rgba(34, 197, 94, 0.08)',
                      line: { width: 0 },
                    },
                    {
                      type: 'line',
                      y0: 60,
                      y1: 60,
                      x0: 0,
                      x1: 24,
                      line: { color: '#22c55e', dash: 'dash', width: 1 },
                    },
                  ]
                : [],
              annotations: showRiskZones
                ? [{ x: 2, y: 95, text: 'Therapeutic Window', showarrow: false, font: { color: '#16a34a', size: 10 } }]
                : [],
            }}
          />
        </ChartCard>

        {/* 4. Semi-log Line Chart */}
        <ChartCard
          title="Semi-Log Line Chart — PK Terminal Phase"
          description="Concentration-time curve on semi-logarithmic scale revealing terminal elimination phase."
          useCases={['PK terminal phase', 'Concentration-time curves', 'Half-life determination']}
          controls={
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showDoseMarkers} onChange={(e) => setShowDoseMarkers(e.target.checked)} className="accent-blue-600" />
                Dose markers
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showAUCShading} onChange={(e) => setShowAUCShading(e.target.checked)} className="accent-blue-600" />
                AUC shading
              </label>
            </div>
          }
        >
          <PlotlyChart
            data={[
              {
                x: semiLog.time,
                y: semiLog.concentration,
                type: 'scatter',
                mode: 'lines',
                name: 'Concentration',
                line: { color: '#1e40af', width: 2.5 },
                ...(showAUCShading ? { fill: 'tozeroy', fillcolor: 'rgba(37, 99, 235, 0.08)' } : {}),
              },
            ]}
            layout={{
              height: 440,
              margin: { t: 20, b: 60, l: 70, r: 20 },
              xaxis: { title: 'Time (hours)', gridcolor: '#f1f5f9' },
              yaxis: { title: 'Concentration (ng/mL)', type: 'log', gridcolor: '#f1f5f9' },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              legend: { orientation: 'h', y: -0.2 },
              shapes: [
                ...(showDoseMarkers
                  ? semiLog.doseMarkers.map((t) => ({
                      type: 'line' as const,
                      x0: t,
                      x1: t,
                      y0: 0,
                      y1: 1,
                      yref: 'paper' as const,
                      line: { color: '#94a3b8', dash: 'dot' as const, width: 1 },
                    }))
                  : []),
                {
                  type: 'line' as const,
                  y0: 10,
                  y1: 10,
                  x0: 0,
                  x1: 24,
                  line: { color: '#ef4444', dash: 'dash' as const, width: 1 },
                },
              ],
              annotations: [
                ...(showDoseMarkers
                  ? semiLog.doseMarkers.map((t) => ({
                      x: t,
                      y: 1,
                      yref: 'paper' as const,
                      text: `Dose ${t}h`,
                      showarrow: false,
                      yshift: 10,
                      font: { color: '#64748b', size: 9 },
                    }))
                  : []),
                {
                  x: 20,
                  y: Math.log10(10),
                  text: 'MEC',
                  showarrow: false,
                  yshift: 12,
                  font: { color: '#ef4444', size: 10 },
                },
              ],
            }}
          />
        </ChartCard>
      </div>
    </div>
  );
}
