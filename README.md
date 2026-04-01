# TakaHuman — Drug Simulation Analytics Dashboard

Interactive visualization dashboard for AI-driven drug simulation and pharmacokinetic analysis. Built as a frontend engineering demo showcasing **22 interactive charts** across 7 categories, all with real-time parameter adjustment.

## Live Features

### Chart Categories (22 charts total)

| Category | Charts | Key Interactions |
|----------|--------|-----------------|
| **Bar Charts** (5) | Classic, Horizontal, Grouped, Waterfall, Tornado | Sort order, top-N filter, threshold toggle, patient count, parameter count |
| **Box Plots** (3) | Standard, Grouped, Violin | Show/hide data points, safety threshold slider, violin side toggle |
| **Scatter Plots** (4) | Classic, Regression, Confidence Band, Observed vs Predicted | Data point count, CI band toggle, 2-fold error bounds, subject count |
| **Line Charts** (4) | Classic PK, Sigmoid, Dual-Axis, Semi-log | Dose selection, CI band, scatter overlay, risk zones, dose markers, AUC shading |
| **Contour Plots** (2) | Filled contour, Multi-mode (fill/lines/heatmap) | Grid resolution, threshold slider, colorscale picker, rendering mode |
| **Heatmaps** (2) | Gene expression, Spatial thermal | Colorscale, show values, time evolution slider |
| **3D Charts** (2) | Surface (drug synergy), Scatter (molecular space) | Grid size, colorscale, floor contour, compound count, marker size |

### Dashboard Home
- 5 KPI cards (MAU, DAU, Retention, Simulations, Error Rate) with trend indicators
- Chart category navigator with counts
- Preview visualizations (PK curve + feature adoption)

### Interactivity Highlights
- **Parameter sliders** — adjust data generation parameters in real-time
- **Toggle controls** — show/hide overlays (CI bands, threshold lines, risk zones)
- **Sort & filter** — reorder data, show top-N items
- **Colorscale picker** — switch between Viridis, Blues, Hot, Portland, etc.
- **3D rotation** — full orbit, zoom, pan on 3D surface and scatter plots
- **Hover tooltips** — contextual data on every chart element

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Plotly.js** via `react-plotly.js` — all charts, including 3D
- **Tailwind CSS** — utility-first styling
- **Lucide React** — icons

## Data Domain

All charts use realistic pharmacokinetic / pharmacodynamic mock data:
- One-compartment PK models (concentration-time)
- Emax dose-response curves
- Lipinski drug-likeness scoring (contour)
- Bliss independence drug synergy (3D surface)
- Molecular property space (logP, MW, PSA)
- Gene expression heatmaps
- Battery cell thermal grids (TakaHuman energy vertical)

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_REPO)

Or manually:
```bash
npm i -g vercel
vercel
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Dashboard home with KPIs
│   └── charts/
│       ├── bar/page.tsx          # 5 bar chart variants
│       ├── box/page.tsx          # 3 box/violin plots
│       ├── scatter/page.tsx      # 4 scatter plot variants
│       ├── line/page.tsx         # 4 line chart variants
│       ├── contour/page.tsx      # 2 contour plots
│       ├── heatmap/page.tsx      # 2 heatmap variants
│       └── three-d/page.tsx      # 2 3D charts (surface + scatter)
├── components/
│   ├── PlotlyChart.tsx           # Dynamic Plotly wrapper (SSR-safe)
│   ├── ChartCard.tsx             # Chart container with info/controls
│   ├── ParamSlider.tsx           # Reusable parameter slider
│   └── Sidebar.tsx               # Navigation sidebar
└── lib/
    └── drug-data.ts              # All data generators (PK, PD, molecular)
```

## Architecture Notes

- **SSR-safe Plotly**: Plotly.js is loaded via `next/dynamic` with `ssr: false` to avoid WebGL issues during server rendering
- **Memoized data**: All chart data is generated via `useMemo` to prevent unnecessary recalculations
- **Collocated state**: Each chart page manages its own interactive state — no global store needed for this demo scope
- **Type-safe data generators**: All mock data functions are typed and parameterized for easy customization

See [DECISIONS.md](./DECISIONS.md) for detailed architecture decisions, tradeoffs, and scalability notes.

## Author

Built by **Nermeen Nasim** — Frontend Engineer & Technical Consultant
