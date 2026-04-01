'use client';

import { useState, useMemo } from 'react';
import PlotlyChart from '@/components/PlotlyChart';
import ChartCard from '@/components/ChartCard';
import ParamSlider from '@/components/ParamSlider';
import { generate3DSurfaceData, generate3DScatterData } from '@/lib/drug-data';

export default function ThreeDChartsPage() {
  // 3D Surface state
  const [surfaceGrid, setSurfaceGrid] = useState(40);
  const [surfaceColorscale, setSurfaceColorscale] = useState<string>('Viridis');
  const [showContour, setShowContour] = useState(true);
  const surface = useMemo(() => generate3DSurfaceData(surfaceGrid), [surfaceGrid]);

  // 3D Scatter state
  const [scatterN, setScatterN] = useState(200);
  const scatter3d = useMemo(() => generate3DScatterData(scatterN), [scatterN]);
  const [markerSize, setMarkerSize] = useState(5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">3D Charts</h1>
        <p className="text-gray-500 mt-1">Three-dimensional drug combination surfaces and molecular property spaces</p>
      </div>

      <div className="grid gap-8">
        {/* 1. 3D Surface Plot */}
        <ChartCard
          title="3D Surface — Drug Combination Synergy Map"
          description="Bliss independence model showing combined effect of two drugs. Peaks indicate synergistic combinations."
          useCases={['Drug combination analysis', 'Synergy mapping', 'Dose optimization']}
          controls={
            <div className="flex items-center gap-4 flex-wrap">
              <ParamSlider label="Grid" value={surfaceGrid} min={20} max={60} step={5} onChange={setSurfaceGrid} />
              <select
                value={surfaceColorscale}
                onChange={(e) => setSurfaceColorscale(e.target.value)}
                className="text-sm border rounded-md px-2 py-1 bg-white"
              >
                <option value="Viridis">Viridis</option>
                <option value="Plasma">Plasma</option>
                <option value="Hot">Hot</option>
                <option value="Blues">Blues</option>
                <option value="Portland">Portland</option>
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showContour} onChange={(e) => setShowContour(e.target.checked)} className="accent-blue-600" />
                Floor contour
              </label>
            </div>
          }
        >
          <PlotlyChart
            data={[
              {
                x: surface.x,
                y: surface.y,
                z: surface.z,
                type: 'surface',
                colorscale: surfaceColorscale,
                colorbar: { title: 'Effect %', titleside: 'right', len: 0.6 },
                contours: showContour
                  ? {
                      z: {
                        show: true,
                        usecolormap: true,
                        highlightcolor: '#fff',
                        project: { z: true },
                      },
                    }
                  : undefined,
                hovertemplate: 'Drug A: %{x:.0f}mg<br>Drug B: %{y:.0f}mg<br>Effect: %{z:.1f}%<extra></extra>',
                lighting: {
                  ambient: 0.6,
                  diffuse: 0.7,
                  specular: 0.3,
                  roughness: 0.5,
                },
              },
            ]}
            layout={{
              height: 600,
              margin: { t: 20, b: 20, l: 20, r: 20 },
              scene: {
                xaxis: { title: 'Drug A Dose (mg)', gridcolor: '#e2e8f0' },
                yaxis: { title: 'Drug B Dose (mg)', gridcolor: '#e2e8f0' },
                zaxis: { title: 'Combined Effect (%)', gridcolor: '#e2e8f0' },
                camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } },
                bgcolor: 'white',
              },
              paper_bgcolor: 'white',
            }}
          />
        </ChartCard>

        {/* 2. 3D Scatter Plot */}
        <ChartCard
          title="3D Scatter — Molecular Property Space"
          description="Three-dimensional visualization of compound library. Each point represents a molecule plotted by logP, molecular weight, and polar surface area."
          useCases={['Chemical space exploration', 'Drug-likeness classification', 'Lead optimization']}
          controls={
            <div className="flex items-center gap-4 flex-wrap">
              <ParamSlider label="Compounds" value={scatterN} min={50} max={500} step={50} onChange={setScatterN} />
              <ParamSlider label="Marker size" value={markerSize} min={2} max={12} onChange={setMarkerSize} />
            </div>
          }
        >
          <PlotlyChart
            data={[
              {
                x: scatter3d.filter((d) => d.label === 'Drug-like').map((d) => d.logP),
                y: scatter3d.filter((d) => d.label === 'Drug-like').map((d) => d.mw),
                z: scatter3d.filter((d) => d.label === 'Drug-like').map((d) => d.psa),
                mode: 'markers',
                type: 'scatter3d',
                name: 'Drug-like',
                marker: {
                  size: markerSize,
                  color: '#2563eb',
                  opacity: 0.7,
                  line: { width: 0.5, color: '#1e40af' },
                },
                hovertemplate: 'logP: %{x:.2f}<br>MW: %{y:.0f} Da<br>PSA: %{z:.0f} Å²<extra>Drug-like</extra>',
              },
              {
                x: scatter3d.filter((d) => d.label === 'Non drug-like').map((d) => d.logP),
                y: scatter3d.filter((d) => d.label === 'Non drug-like').map((d) => d.mw),
                z: scatter3d.filter((d) => d.label === 'Non drug-like').map((d) => d.psa),
                mode: 'markers',
                type: 'scatter3d',
                name: 'Non drug-like',
                marker: {
                  size: markerSize,
                  color: '#f97316',
                  opacity: 0.5,
                  line: { width: 0.5, color: '#c2410c' },
                },
                hovertemplate: 'logP: %{x:.2f}<br>MW: %{y:.0f} Da<br>PSA: %{z:.0f} Å²<extra>Non drug-like</extra>',
              },
            ]}
            layout={{
              height: 600,
              margin: { t: 20, b: 20, l: 20, r: 20 },
              scene: {
                xaxis: { title: 'Hydrophobicity (logP)' },
                yaxis: { title: 'Molecular Weight (Da)' },
                zaxis: { title: 'Polar Surface Area (Å²)' },
                camera: { eye: { x: 1.8, y: 1.2, z: 1.0 } },
                bgcolor: 'white',
              },
              paper_bgcolor: 'white',
              legend: { orientation: 'h', y: -0.05 },
            }}
          />
        </ChartCard>
      </div>
    </div>
  );
}
