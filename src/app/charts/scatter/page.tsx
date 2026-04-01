'use client';

import { useState, useMemo } from 'react';
import PlotlyChart from '@/components/PlotlyChart';
import ChartCard from '@/components/ChartCard';
import ParamSlider from '@/components/ParamSlider';
import {
  generateDoseResponse,
  generateScatterWithRegression,
  generateObservedVsPredicted,
} from '@/lib/drug-data';

export default function ScatterPlotsPage() {
  // Classic scatter
  const [nPoints, setNPoints] = useState(80);
  const scatterData = useMemo(() => generateScatterWithRegression(nPoints), [nPoints]);

  // Dose response
  const doseResp = useMemo(() => generateDoseResponse(60), []);

  // Obs vs Pred
  const [obsN, setObsN] = useState(60);
  const ovp = useMemo(() => generateObservedVsPredicted(obsN), [obsN]);
  const [showErrorBounds, setShowErrorBounds] = useState(true);

  // Confidence band
  const [showCI, setShowCI] = useState(true);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Scatter Plots</h1>
        <p className="text-gray-500 mt-1">Exposure-response relationships and model diagnostics</p>
      </div>

      <div className="grid gap-8">
        {/* 1. Classic Scatter */}
        <ChartCard
          title="Classic Scatter Plot — Biomarker vs Exposure"
          description="Exploratory relationship between drug exposure (AUC) and biomarker response."
          useCases={['Exploratory relationship', 'Raw biomarker vs exposure', 'Covariate inspection']}
          controls={
            <ParamSlider label="Data points" value={nPoints} min={20} max={200} onChange={setNPoints} />
          }
        >
          <PlotlyChart
            data={[
              {
                x: scatterData.x,
                y: scatterData.y,
                mode: 'markers',
                type: 'scatter',
                name: 'Observed',
                marker: { color: '#2563eb', opacity: 0.6, size: 7 },
                hovertemplate: 'AUC: %{x:.1f} h·ng/mL<br>Response: %{y:.1f}<extra></extra>',
              },
            ]}
            layout={{
              height: 440,
              margin: { t: 20, b: 60, l: 60, r: 20 },
              xaxis: { title: 'AUC₀₋₂₄ (h·ng/mL)', gridcolor: '#f1f5f9' },
              yaxis: { title: 'Biomarker Response', gridcolor: '#f1f5f9' },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
            }}
          />
        </ChartCard>

        {/* 2. Scatter with Regression Line */}
        <ChartCard
          title="Scatter with Regression Line — Exposure-Response"
          description="Linear regression fit to exposure-response data with optional confidence interval."
          useCases={['Exposure-Response', 'Dose proportionality', 'QTc modeling', 'Allometric scaling']}
          controls={
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={showCI} onChange={(e) => setShowCI(e.target.checked)} className="accent-blue-600" />
              Show CI band
            </label>
          }
        >
          <PlotlyChart
            data={[
              {
                x: scatterData.x,
                y: scatterData.y,
                mode: 'markers',
                type: 'scatter',
                name: 'Observed',
                marker: { color: '#2563eb', opacity: 0.6, size: 7 },
              },
              {
                x: [...scatterData.x].sort((a, b) => a - b),
                y: [...scatterData.x].sort((a, b) => a - b).map((xi) => 3.2 * xi + 10),
                mode: 'lines',
                type: 'scatter',
                name: 'Regression',
                line: { color: '#1e40af', width: 2 },
              },
              ...(showCI
                ? [
                    {
                      x: [...scatterData.x].sort((a, b) => a - b),
                      y: [...scatterData.x].sort((a, b) => a - b).map((xi) => 3.2 * xi + 22),
                      mode: 'lines' as const,
                      type: 'scatter' as const,
                      name: 'CI Upper',
                      line: { color: 'transparent' },
                      showlegend: false,
                    },
                    {
                      x: [...scatterData.x].sort((a, b) => a - b),
                      y: [...scatterData.x].sort((a, b) => a - b).map((xi) => 3.2 * xi - 2),
                      mode: 'lines' as const,
                      type: 'scatter' as const,
                      name: 'CI Lower',
                      fill: 'tonexty' as const,
                      fillcolor: 'rgba(37, 99, 235, 0.12)',
                      line: { color: 'transparent' },
                      showlegend: false,
                    },
                  ]
                : []),
            ]}
            layout={{
              height: 440,
              margin: { t: 20, b: 60, l: 60, r: 20 },
              xaxis: { title: 'AUC₀₋₂₄ (h·ng/mL)', gridcolor: '#f1f5f9' },
              yaxis: { title: 'Response (%)', gridcolor: '#f1f5f9' },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              legend: { orientation: 'h', y: -0.2 },
            }}
          />
        </ChartCard>

        {/* 3. Scatter with Confidence Band — Dose Response */}
        <ChartCard
          title="Scatter with Confidence Band — Sigmoid Dose-Response"
          description="Emax model fit with 90% confidence interval for dose-response relationship."
          useCases={['Modeled exposure-response', 'Probability curves', 'Regulatory model outputs']}
        >
          <PlotlyChart
            data={[
              {
                x: doseResp.doses,
                y: doseResp.response,
                mode: 'markers',
                type: 'scatter',
                name: 'Observed',
                marker: { color: '#2563eb', opacity: 0.6, size: 6 },
              },
              {
                x: doseResp.doses,
                y: doseResp.predicted,
                mode: 'lines',
                type: 'scatter',
                name: 'Emax Model',
                line: { color: '#1e40af', width: 2.5 },
              },
              {
                x: doseResp.doses,
                y: doseResp.predicted.map((p) => p + 10),
                mode: 'lines',
                type: 'scatter',
                showlegend: false,
                line: { color: 'transparent' },
              },
              {
                x: doseResp.doses,
                y: doseResp.predicted.map((p) => Math.max(0, p - 10)),
                mode: 'lines',
                type: 'scatter',
                name: '90% CI',
                fill: 'tonexty',
                fillcolor: 'rgba(37, 99, 235, 0.1)',
                line: { color: 'transparent' },
              },
            ]}
            layout={{
              height: 440,
              margin: { t: 20, b: 60, l: 60, r: 20 },
              xaxis: { title: 'Dose (mg)', type: 'log', gridcolor: '#f1f5f9' },
              yaxis: { title: 'Effect (%)', gridcolor: '#f1f5f9' },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              legend: { orientation: 'h', y: -0.2 },
            }}
          />
        </ChartCard>

        {/* 4. Observed vs Predicted */}
        <ChartCard
          title="Observed vs Predicted Scatter"
          description="Model diagnostic plot comparing observed drug concentrations to model predictions."
          useCases={['PK validation', 'Translational checks', 'Model diagnostics']}
          controls={
            <div className="flex items-center gap-4">
              <ParamSlider label="Subjects" value={obsN} min={20} max={120} onChange={setObsN} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showErrorBounds} onChange={(e) => setShowErrorBounds(e.target.checked)} className="accent-blue-600" />
                2-fold bounds
              </label>
            </div>
          }
        >
          <PlotlyChart
            data={[
              {
                x: ovp.predicted,
                y: ovp.observed,
                mode: 'markers',
                type: 'scatter',
                name: 'Data',
                marker: { color: '#2563eb', opacity: 0.6, size: 8 },
                hovertemplate: 'Predicted: %{x:.1f}<br>Observed: %{y:.1f}<extra></extra>',
              },
              {
                x: [0, 100],
                y: [0, 100],
                mode: 'lines',
                type: 'scatter',
                name: 'Unity (y=x)',
                line: { color: '#333', width: 2 },
              },
              ...(showErrorBounds
                ? [
                    {
                      x: [0, 100] as number[],
                      y: [0, 200] as number[],
                      mode: 'lines' as const,
                      type: 'scatter' as const,
                      name: '2-fold upper',
                      line: { color: '#94a3b8', dash: 'dash' as const, width: 1 },
                    },
                    {
                      x: [0, 100] as number[],
                      y: [0, 50] as number[],
                      mode: 'lines' as const,
                      type: 'scatter' as const,
                      name: '2-fold lower',
                      line: { color: '#94a3b8', dash: 'dash' as const, width: 1 },
                    },
                  ]
                : []),
            ]}
            layout={{
              height: 450,
              margin: { t: 20, b: 60, l: 60, r: 20 },
              xaxis: { title: 'Population Predicted (ng/mL)', gridcolor: '#f1f5f9', range: [-5, 110] },
              yaxis: { title: 'Observed (ng/mL)', gridcolor: '#f1f5f9', range: [-5, 130] },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              legend: { orientation: 'h', y: -0.2 },
            }}
          />
        </ChartCard>
      </div>
    </div>
  );
}
