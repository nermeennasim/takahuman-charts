'use client';

import { useState, useMemo, useCallback } from 'react';
import PlotlyChart from '@/components/PlotlyChart';
import ChartCard from '@/components/ChartCard';
import ParamSlider from '@/components/ParamSlider';
import { generateHeatmapData, generateSpatialHeatmap } from '@/lib/drug-data';
import { useApiData } from '@/lib/hooks/use-api-data';
import type { CompoundProperty } from '@/lib/api/pubchem';

// Transform PubChem properties into a drug-property heatmap
function transformToHeatmap(raw: { properties: CompoundProperty[] }) {
  const props = raw.properties.filter(
    (p) => p.XLogP != null && p.MolecularWeight != null && p.TPSA != null && p.drugName
  );
  if (props.length < 10) throw new Error('Insufficient data');

  const drugs = props.slice(0, 20);
  const genes = drugs.map((d) => d.drugName!);
  const samples = ['MW', 'logP', 'TPSA', 'HBD', 'HBA'];

  // Normalize each property to z-score-like values (-3 to 3 range)
  const mwMean = drugs.reduce((s, d) => s + d.MolecularWeight, 0) / drugs.length;
  const mwStd = Math.sqrt(drugs.reduce((s, d) => s + Math.pow(d.MolecularWeight - mwMean, 2), 0) / drugs.length) || 1;
  const logPMean = drugs.reduce((s, d) => s + d.XLogP, 0) / drugs.length;
  const logPStd = Math.sqrt(drugs.reduce((s, d) => s + Math.pow(d.XLogP - logPMean, 2), 0) / drugs.length) || 1;
  const tpsaMean = drugs.reduce((s, d) => s + d.TPSA, 0) / drugs.length;
  const tpsaStd = Math.sqrt(drugs.reduce((s, d) => s + Math.pow(d.TPSA - tpsaMean, 2), 0) / drugs.length) || 1;

  const z = drugs.map((d) => [
    +((d.MolecularWeight - mwMean) / mwStd).toFixed(2),
    +((d.XLogP - logPMean) / logPStd).toFixed(2),
    +((d.TPSA - tpsaMean) / tpsaStd).toFixed(2),
    +((d.HBondDonorCount - 2) / 1.5).toFixed(2),
    +((d.HBondAcceptorCount - 5) / 3).toFixed(2),
  ]);

  return { genes, samples, z };
}

export default function HeatmapPage() {
  // Heatmap — LIVE from PubChem
  const transformHM = useCallback(transformToHeatmap, []);
  const { data: heatmap, isLive: heatmapLive } = useApiData(
    '/api/pubchem/properties?limit=20',
    () => generateHeatmapData(),
    transformHM
  );

  const [heatColorscale, setHeatColorscale] = useState<string>('RdBu');
  const [showValues, setShowValues] = useState(false);

  // Spatial heatmap — stays mock
  const spatial = useMemo(() => generateSpatialHeatmap(), []);
  const [timeStep, setTimeStep] = useState(0);

  const spatialAtTime = useMemo(() => {
    const factor = 1 + timeStep * 0.15;
    return {
      ...spatial,
      z: spatial.z.map((row) => row.map((v) => +(v * factor * (0.9 + Math.random() * 0.2)).toFixed(1))),
    };
  }, [spatial, timeStep]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Heatmaps</h1>
        <p className="text-gray-500 mt-1">Gene expression profiling and spatial thermal analysis</p>
      </div>

      <div className="grid gap-8">
        {/* 1. Heatmap — LIVE */}
        <ChartCard
          title={heatmapLive ? 'Heatmap — Drug Molecular Property Profile (PubChem)' : 'Heatmap — Gene Expression Profile'}
          description={heatmapLive
            ? 'Z-score normalized molecular properties for real FDA-approved drugs from PubChem. Columns: MW, logP, TPSA, H-bond donors, H-bond acceptors.'
            : 'Differential expression of drug target genes across patient samples. Values are log₂ fold-change.'
          }
          useCases={['Gene expression', 'Continuous variable matrices', 'Parameter relationships']}
          dataSource={heatmapLive ? 'live' : 'mock'}
          controls={
            <div className="flex items-center gap-4">
              <select
                value={heatColorscale}
                onChange={(e) => setHeatColorscale(e.target.value)}
                className="text-sm border rounded-md px-2 py-1 bg-white"
              >
                <option value="RdBu">Red-Blue (diverging)</option>
                <option value="Blues">Blues</option>
                <option value="Viridis">Viridis</option>
                <option value="YlOrRd">Yellow-Red</option>
                <option value="Picnic">Picnic</option>
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showValues} onChange={(e) => setShowValues(e.target.checked)} className="accent-blue-600" />
                Show values
              </label>
            </div>
          }
        >
          <PlotlyChart
            data={[
              {
                x: heatmap.samples,
                y: heatmap.genes,
                z: heatmap.z,
                type: 'heatmap',
                colorscale: heatColorscale,
                zmid: 0,
                colorbar: { title: heatmapLive ? 'Z-score' : 'log₂ FC', titleside: 'right' },
                hovertemplate: heatmapLive
                  ? 'Drug: %{y}<br>Property: %{x}<br>Z-score: %{z:.2f}<extra></extra>'
                  : 'Gene: %{y}<br>Sample: %{x}<br>log₂FC: %{z:.2f}<extra></extra>',
                ...(showValues
                  ? {
                      text: heatmap.z.map((row) => row.map((v) => v.toFixed(1))),
                      texttemplate: '%{text}',
                      textfont: { size: 9 },
                    }
                  : {}),
              },
            ]}
            layout={{
              height: 480,
              margin: { t: 20, b: 60, l: heatmapLive ? 140 : 100, r: 100 },
              xaxis: { title: heatmapLive ? 'Property' : 'Sample', tickfont: { size: 10 } },
              yaxis: { title: heatmapLive ? 'Drug' : 'Gene', tickfont: { size: 11 } },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
            }}
          />
        </ChartCard>

        {/* 2. Spatial Heatmap with Time Slider */}
        <ChartCard
          title="Spatial Heatmap — Battery Cell Temperature Distribution"
          description="Temperature distribution across cell/module grid at different time steps. Simulating thermal evolution during charge cycle."
          useCases={['Battery thermal management', 'Cell-module grid monitoring', 'Spatial pattern analysis']}
          controls={
            <ParamSlider label="Time step" value={timeStep} min={0} max={10} unit=" min" onChange={setTimeStep} />
          }
        >
          <PlotlyChart
            data={[
              {
                x: spatialAtTime.modules,
                y: spatialAtTime.cells,
                z: spatialAtTime.z,
                type: 'heatmap',
                colorscale: 'YlOrRd',
                colorbar: { title: '°C', titleside: 'right' },
                hovertemplate: 'Module: %{x}<br>Cell: %{y}<br>Temp: %{z:.1f}°C<extra></extra>',
                text: spatialAtTime.z.map((row) => row.map((v) => v.toFixed(1))),
                texttemplate: '%{text}',
                textfont: { size: 10, color: '#333' },
              },
            ]}
            layout={{
              height: 420,
              margin: { t: 30, b: 60, l: 60, r: 100 },
              xaxis: { title: 'Module (M)', tickfont: { size: 11 } },
              yaxis: { title: 'Cell (C)', tickfont: { size: 11 } },
              plot_bgcolor: 'white',
              paper_bgcolor: 'white',
              title: {
                text: `Temperature Distribution at t = ${timeStep} min`,
                font: { size: 14, color: '#374151' },
                x: 0.05,
                xanchor: 'left',
              },
              shapes: [
                {
                  type: 'rect',
                  x0: 2.5,
                  x1: 7.5,
                  y0: 1.5,
                  y1: 5.5,
                  line: { color: '#ef4444', width: 2, dash: 'dot' },
                  fillcolor: 'transparent',
                },
              ],
              annotations: [
                {
                  x: 5,
                  y: 7.5,
                  text: 'Hot zone',
                  showarrow: true,
                  arrowhead: 2,
                  ay: -30,
                  font: { color: '#ef4444', size: 11 },
                },
              ],
            }}
          />
        </ChartCard>
      </div>
    </div>
  );
}
