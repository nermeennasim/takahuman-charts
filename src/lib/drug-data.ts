// ============================================================
// TakaHuman Drug Simulation Data Generator
// Realistic pharmacokinetic & pharmacodynamic mock data
// ============================================================

export function generatePKConcentrationTime(doses: number[] = [10, 25, 50, 100]) {
  const timePoints = Array.from({ length: 49 }, (_, i) => i * 0.5); // 0 to 24h
  return doses.map((dose) => ({
    dose,
    time: timePoints,
    concentration: timePoints.map((t) => {
      const ka = 1.5; // absorption rate
      const ke = 0.15 + Math.random() * 0.05; // elimination rate
      const Vd = 50; // volume of distribution
      const F = 0.85; // bioavailability
      const C = ((F * dose * ka) / (Vd * (ka - ke))) * (Math.exp(-ke * t) - Math.exp(-ka * t));
      return Math.max(0, C + (Math.random() - 0.5) * C * 0.1);
    }),
  }));
}

export function generateDoseResponse(nPoints = 50) {
  const doses = Array.from({ length: nPoints }, (_, i) => Math.pow(10, -2 + (i / nPoints) * 5));
  const emax = 95;
  const ec50 = 100;
  const hill = 1.8;
  return {
    doses,
    response: doses.map(
      (d) => (emax * Math.pow(d, hill)) / (Math.pow(ec50, hill) + Math.pow(d, hill)) + (Math.random() - 0.5) * 8
    ),
    predicted: doses.map((d) => (emax * Math.pow(d, hill)) / (Math.pow(ec50, hill) + Math.pow(d, hill))),
  };
}

export function generateBiomarkerData(nSubjects = 200) {
  const groups = ['Placebo', '10mg', '25mg', '50mg', '100mg'];
  return groups.map((group) => {
    const baseEffect = groups.indexOf(group) * 12;
    const n = nSubjects / groups.length;
    return {
      group,
      values: Array.from({ length: n }, () => {
        const base = 45 + Math.random() * 20;
        return base + baseEffect + (Math.random() - 0.5) * 25;
      }),
    };
  });
}

export function generateWaterfallData(nPatients = 30) {
  return Array.from({ length: nPatients }, (_, i) => ({
    patient: `PT-${String(i + 1).padStart(3, '0')}`,
    change: -60 + Math.random() * 120,
    group: Math.random() > 0.5 ? 'Treatment' : 'Control',
  })).sort((a, b) => a.change - b.change);
}

export function generateTornadoData() {
  const parameters = [
    'Clearance (CL)',
    'Volume (Vd)',
    'Absorption Rate (Ka)',
    'Bioavailability (F)',
    'Half-life (t½)',
    'Body Weight',
    'Renal Function',
    'Age',
    'Sex',
    'Genotype',
  ];
  return parameters.map((param) => {
    const low = -(Math.random() * 40 + 5);
    const high = Math.random() * 40 + 5;
    return { parameter: param, low, high };
  }).sort((a, b) => (Math.abs(b.high) + Math.abs(b.low)) - (Math.abs(a.high) + Math.abs(a.low)));
}

export function generateScatterWithRegression(n = 80) {
  const x = Array.from({ length: n }, () => Math.random() * 24);
  const slope = 3.2;
  const intercept = 10;
  const y = x.map((xi) => slope * xi + intercept + (Math.random() - 0.5) * 20);
  const predicted = x.map((xi) => slope * xi + intercept);
  const ciUpper = predicted.map((p) => p + 12);
  const ciLower = predicted.map((p) => p - 12);
  return { x, y, predicted, ciUpper, ciLower };
}

export function generateObservedVsPredicted(n = 60) {
  const predicted = Array.from({ length: n }, () => Math.random() * 100);
  const observed = predicted.map((p) => p + (Math.random() - 0.5) * 30);
  return { predicted, observed };
}

export function generateSigmoidData() {
  const x = Array.from({ length: 100 }, (_, i) => i * 0.25);
  const ec50 = 12;
  const hill = 2.5;
  const emax = 100;
  return {
    x,
    y: x.map((xi) => (emax * Math.pow(xi, hill)) / (Math.pow(ec50, hill) + Math.pow(xi, hill))),
    ciUpper: x.map(
      (xi) => (emax * Math.pow(xi, hill)) / (Math.pow(ec50, hill) + Math.pow(xi, hill)) + 8
    ),
    ciLower: x.map(
      (xi) => Math.max(0, (emax * Math.pow(xi, hill)) / (Math.pow(ec50, hill) + Math.pow(xi, hill)) - 8)
    ),
    scatterX: Array.from({ length: 30 }, () => Math.random() * 25),
    scatterY: Array.from({ length: 30 }, () => Math.random() * 100),
  };
}

export function generateDualAxisData() {
  const time = Array.from({ length: 25 }, (_, i) => i);
  return {
    time,
    efficacy: time.map((t) => Math.min(90, 20 + t * 4 + (Math.random() - 0.5) * 10)),
    toxicity: time.map((t) => Math.min(80, 5 + t * 2.5 + (Math.random() - 0.5) * 8)),
  };
}

export function generateSemiLogData() {
  const time = Array.from({ length: 49 }, (_, i) => i * 0.5);
  return {
    time,
    concentration: time.map((t) => {
      const cmax = 120;
      const ka = 1.8;
      const ke = 0.2;
      return Math.max(0.1, cmax * (Math.exp(-ke * t) - Math.exp(-ka * t)));
    }),
    doseMarkers: [0, 8, 16],
  };
}

export function generateContourData(gridSize = 50) {
  const x = Array.from({ length: gridSize }, (_, i) => -2 + (i / (gridSize - 1)) * 8); // Hydrophobicity logP
  const y = Array.from({ length: gridSize }, (_, i) => 100 + (i / (gridSize - 1)) * 700); // Molecular weight
  const z: number[][] = [];
  for (let j = 0; j < gridSize; j++) {
    const row: number[] = [];
    for (let i = 0; i < gridSize; i++) {
      const logP = x[i];
      const mw = y[j];
      // Lipinski-like drug-likeness score
      const score =
        Math.exp(-0.1 * Math.pow(logP - 2, 2)) *
        Math.exp(-0.00001 * Math.pow(mw - 400, 2)) *
        (1 + 0.05 * Math.sin(logP * mw * 0.01));
      row.push(score);
    }
    z.push(row);
  }
  return { x, y, z };
}

export function generateHeatmapData() {
  const genes = ['BRCA1', 'TP53', 'EGFR', 'HER2', 'KRAS', 'BRAF', 'PIK3CA', 'PTEN', 'MYC', 'CDK4'];
  const samples = Array.from({ length: 24 }, (_, i) => `S${i + 1}`);
  const z = genes.map(() => samples.map(() => -3 + Math.random() * 6));
  return { genes, samples, z };
}

export function generateSpatialHeatmap() {
  const cells = Array.from({ length: 8 }, (_, i) => `C0${i + 1}`);
  const modules = Array.from({ length: 10 }, (_, i) => `M${String(i + 1).padStart(2, '0')}`);
  const z = cells.map((_, ci) =>
    modules.map((_, mi) => {
      const base = 25 + ci * 1.5 + mi * 1.2;
      const peak = ci >= 2 && ci <= 5 && mi >= 3 && mi <= 7 ? 15 : 0;
      return +(base + peak + (Math.random() - 0.5) * 5).toFixed(1);
    })
  );
  return { cells, modules, z };
}

export function generate3DSurfaceData(gridSize = 40) {
  const x = Array.from({ length: gridSize }, (_, i) => (i / (gridSize - 1)) * 100); // Dose A
  const y = Array.from({ length: gridSize }, (_, i) => (i / (gridSize - 1)) * 100); // Dose B
  const z: number[][] = [];
  for (let j = 0; j < gridSize; j++) {
    const row: number[] = [];
    for (let i = 0; i < gridSize; i++) {
      const doseA = x[i];
      const doseB = y[j];
      // Bliss independence model with synergy
      const eA = 90 * doseA / (doseA + 20);
      const eB = 85 * doseB / (doseB + 15);
      const synergy = 0.002 * doseA * doseB;
      const effect = Math.min(100, eA + eB - (eA * eB) / 100 + synergy);
      row.push(+effect.toFixed(1));
    }
    z.push(row);
  }
  return { x, y, z };
}

export function generate3DScatterData(n = 200) {
  return Array.from({ length: n }, () => {
    const logP = -2 + Math.random() * 8;
    const mw = 100 + Math.random() * 700;
    const psa = 20 + Math.random() * 140;
    const drugLikeness =
      (logP > 0 && logP < 5 ? 1 : 0.3) *
      (mw < 500 ? 1 : 0.4) *
      (psa < 140 ? 1 : 0.5);
    return { logP, mw, psa, drugLikeness, label: drugLikeness > 0.5 ? 'Drug-like' : 'Non drug-like' };
  });
}

export function generateGroupedBarData() {
  const timepoints = ['Baseline', 'Week 4', 'Week 8', 'Week 12', 'Week 24'];
  return {
    timepoints,
    treatment: timepoints.map((_, i) => 50 + i * 8 + (Math.random() - 0.5) * 5),
    placebo: timepoints.map((_, i) => 48 + i * 2 + (Math.random() - 0.5) * 5),
    threshold: 55,
  };
}

export function generateFeatureAdoptionBar() {
  return [
    { feature: 'PK Modeling', users: 892, category: 'Core' },
    { feature: 'Dose Simulation', users: 756, category: 'Core' },
    { feature: 'Biomarker Analysis', users: 634, category: 'Analysis' },
    { feature: 'Population PK', users: 521, category: 'Advanced' },
    { feature: 'Drug Interaction', users: 445, category: 'Advanced' },
    { feature: 'PBPK Model', users: 389, category: 'Specialist' },
    { feature: 'Safety Scoring', users: 312, category: 'Analysis' },
    { feature: 'Report Export', users: 278, category: 'Utility' },
  ];
}

// KPI data for the dashboard
export const kpiData = {
  monthlyActiveUsers: { value: 2847, change: 12.3, trend: 'up' as const },
  dailyActiveUsers: { value: 891, change: 5.7, trend: 'up' as const },
  retentionRate: { value: 78.4, change: -2.1, trend: 'down' as const },
  conversionRate: { value: 14.2, change: 3.8, trend: 'up' as const },
  errorRate: { value: 0.34, change: -0.12, trend: 'down' as const },
  simulationsRun: { value: 15420, change: 22.1, trend: 'up' as const },
};
