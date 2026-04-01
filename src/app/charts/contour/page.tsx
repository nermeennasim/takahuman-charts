'use client';

import { useState, useMemo } from 'react';
import PlotlyChart from '@/components/PlotlyChart';
import ChartCard from '@/components/ChartCard';
import ParamSlider from '@/components/ParamSlider';
import { generateContourData } from '@/lib/drug-data';

export default function ContourPlotsPage() {
  const [gridSize, setGridSize] = useState(50);
  const [threshold, setThreshold] = useState(0.45);
  const [colorscale, setColorscale] = useState<string>('Blues');
  const contour = useMemo(() => generateContourData(gridSize), [gridSize]);

  // Second contour: filled vs line contour
  const [contourType, setContourType] = useState<'fill' | 'lines' | 'heatmap'>('fill');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contour Plots</h1>
        <p className="text-gray-500 mt-1">Molecular property landscapes and drug-likeness scoring</p>
      </div>

      <div className="grid gap-8">
        {/* 1. Filled Contour Plot */}
        <ChartCard
          title="Contour Plot — Drug-Likeness Landscape"
          description="Lipinski-inspired drug-likeness score as a function of hydrophobicity (logP) and molecular weight."
          useCases={['Molecular property optimization', 'Chemical space visualization', 'Lead compound selection']}
          controls={
            <div className="flex items-center gap-4 flex-wrap">
              <ParamSlider label="Grid" value={gridSize} min={20} max={80} step={10} onChange={setGridSize} />
              <ParamSlider label="Threshold" value={threshold} min={0.1} max={0.9} step={0.05} onChange={setThreshold} />
              <select
                value={colorscale}
                onChange={(e) => setColorscale(e.target.value)}
                className="text-sm border rounded-md px-2 py-1 bg-white"
              >
                <option value="Blues">Blues</option>
                <option value="Viridis">Viridis</option>
                <option value="Hot">Hot</option>
                <option value="Portland">Portland</option>
                <option value="Earth">Earth</option>
              </select>
            </div>
          }
        >
          <PlotlyChart
            data={[
              {
                x: contour.x,
                y: contour.y,
                z: contour.z,
                type: 'contour',
                colorscale: colorscale,
                contours: {
                  coloring: 'fill',
                  showlines: true,
                  showlabels: true,
                  labelfont: { size: 10, color: 'white' },
                },
                colorbar: { title: 'Score', titleside: 'right' },
                line: { smoothing: 0.85, width: 0.5 },
                hovertemplate: 'logP: %{x:.2f}<br>MW: %{y:.0f} Da<br>Score: %{z:.3f}<extra></extra>',
              },
              // Threshold contour line
              {
                x: contour.x,
                y: contour.y,
                z: contour.z,
                type: 'contour',
                contours: {
                  start: threshold,
                  end: threshold,
                  size: 0,
                  coloring: 'lines',
                },
                line: { color: 'black', width: 3, dash: 'dash' },
                showscale: false,
                hoverinfo: 'skip',
              },
            ]}
            layout={{
              height: 520,
              margin: { t: 20, b: 60, l: 70, r: 100 },
              xaxis: { title: 'Hydrophobicity (log P)', gridcolor: '#e2e8f0' },
              yaxis: { title: 'Molecular Weight (Da)', gridcolor: '#e2e8f0' },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              annotations: [
                {
                  x: 2,
                  y: 750,
                  text: `Threshold ${threshold}`,
                  showarrow: false,
                  font: { color: '#000', size: 12, family: 'monospace' },
                  bgcolor: 'rgba(255,255,255,0.8)',
                },
              ],
            }}
          />
        </ChartCard>

        {/* 2. Contour comparison — Different rendering modes */}
        <ChartCard
          title="Contour Rendering Modes — Binding Affinity Surface"
          description="Same data shown in different contour rendering modes. Toggle between fill, lines, and heatmap."
          useCases={['Binding affinity landscapes', 'Structure-activity relationships', 'Parameter optimization']}
          controls={
            <div className="flex items-center gap-2">
              {(['fill', 'lines', 'heatmap'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setContourType(mode)}
                  className={`px-3 py-1 text-xs rounded-full border transition-all capitalize ${
                    contourType === mode
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-500 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          }
        >
          <PlotlyChart
            data={[
              contourType === 'heatmap'
                ? {
                    x: contour.x,
                    y: contour.y,
                    z: contour.z,
                    type: 'heatmap' as const,
                    colorscale: 'Blues',
                    colorbar: { title: 'Score' },
                    hovertemplate: 'logP: %{x:.2f}<br>MW: %{y:.0f}<br>Score: %{z:.3f}<extra></extra>',
                  }
                : {
                    x: contour.x,
                    y: contour.y,
                    z: contour.z,
                    type: 'contour' as const,
                    colorscale: 'Blues',
                    contours: {
                      coloring: contourType === 'lines' ? 'lines' : 'fill',
                      showlabels: true,
                      labelfont: { size: 10, color: contourType === 'lines' ? '#1e40af' : 'white' },
                    },
                    colorbar: { title: 'Score' },
                    line: { width: contourType === 'lines' ? 2 : 0.5 },
                    hovertemplate: 'logP: %{x:.2f}<br>MW: %{y:.0f}<br>Score: %{z:.3f}<extra></extra>',
                  },
            ]}
            layout={{
              height: 520,
              margin: { t: 20, b: 60, l: 70, r: 100 },
              xaxis: { title: 'Hydrophobicity (log P)', gridcolor: '#e2e8f0' },
              yaxis: { title: 'Molecular Weight (Da)', gridcolor: '#e2e8f0' },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
            }}
          />
        </ChartCard>
      </div>
    </div>
  );
}
