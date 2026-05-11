# Dashboard Structure & Design System: Benefícios Socioassistenciais

This document outlines the architectural patterns, UX principles, and visual design system implemented for the **Benefícios Socioassistenciais** dashboard. This structure is the benchmark for all monitoring modules in the application.

## 1. UX Principles
- **Clutter-Free Information**: Prioritize key metrics (KPIs) at the top left to ensure immediate visibility of core data.
- **Visual Hierarchy**: Use a split-layout where metrics are stacked on the left and complex visualizations (charts) occupy the larger right area.
- **Contextual Insights**: Each chart must be accompanied by a clear header, subtitle, and primary value highlight.
- **Progressive Disclosure**: Detailed data variations (percentage change) are shown only when comparisons are available.

## 2. Layout Structure
The dashboard follows a responsive grid system:

### A. Metrics Stack (Left Column)
- **KPI Cards**: Modern, white-background cards with subtle shadows.
- **Icon Circles**: 48px circles with distinct background tints and contrasting icons.
- **Status Variations**: Small badges indicating growth (Positive/Negative) using trending icons.
- **Typography**: 
  - Labels: 11px font, uppercase, heavy weight (800+).
  - Values: 38px (originally 48px, optimized for no-scroll), extra-bold.

### B. Charts Stack (Right Column)
- **Top Row (Dual Charts)**: Two line charts for temporal evolution (e.g., Families BPF, Pessoas Cadastradas).
- **Full-Width Section**: A large bar chart for categorical distribution (e.g., Visitas Domiciliares).
- **Highlight Badges**: Top-performing categories are highlighted with a special "Award" badge.

## 3. Color Palette & Theming
Curated HSL-derived colors are used for semantic categorization:

| Category | Color | CSS Class | Use Case |
| :--- | :--- | :--- | :--- |
| **Inclusão** | Blue (`#3b82f6`) | `accent-blue` | Primary growth indicators |
| **Atualização** | Cyan (`#06b6d4`) | `accent-cyan` | Secondary operational data |
| **Pró-Pão** | Amber (`#f59e0b`) | `accent-amber` | Essential supplies/kits |
| **Cesta Básica** | Emerald (`#10b981`) | `accent-emerald` | Social assistance delivery |
| **Background** | Slate 200 (`#e2e8f0`) | `body-bg` | Main layout contrast |

## 4. Technical Implementation
- **Container Height**: Charts are restricted to `270px` (line) and `360px` (bar) to ensure a single-screen, non-scrolling UX.
- **Chart.js Config**: 
  - `datalabels` plugin enabled for instant value reading.
  - Border radius on bars: `8px`.
  - Grid lines: Only horizontal, low opacity (`0.05`).
  - Tooltips: Minimalist dark/white mode depending on theme.

## 5. Chart Fit & Readability Rules
- **Canvas Containment**: Every chart must live inside a dedicated wrapper (`monitoring-chart-wrap`) with explicit height, so the canvas never overflows or breaks outside the card.
- **Line Chart Safety Margin**: Line charts must reserve extra top padding to prevent high-value datalabels from being clipped.
- **Month Labels Always Visible**: The X axis for monthly dashboards must keep all month labels visible (`autoSkip: false`, no rotation) whenever the chart is designed around Jan-Dec tracking.
- **Readable Datalabels**: Line datalabels should use `clamp: true` and `clip: false` so labels remain visible inside the card while still respecting the layout.
- **Horizontal Bar Breathing Room**: Horizontal bar charts must reserve right padding and a suggested max on the hidden X axis to ensure the last category label/value pair does not get cut off.
- **Wrapper Variants**:
  - `monitoring-chart-wrap-line`: compact line/area chart height for dashboard cards.
  - `monitoring-chart-wrap-bar`: horizontal bar wrapper with extra right-side breathing room.
  - `monitoring-chart-wrap-bar-beneficios`: tuned variant for BenefÃ­cios, where long labels and percentage suffixes need more horizontal space.

## 6. Replication Rule For New Directorates
- New dashboards must inherit the BenefÃ­cios visual contract first, then adapt the data and chart types for the specific directorate.
- When reproducing another directorate, preserve:
  - KPI stack on the left.
  - contextual chart headers on the right.
  - chart wrappers with explicit heights.
  - month labels and datalabel visibility rules.
  - management cards and selectbox filters styled as premium controls.
