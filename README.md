# Praecor

**AI-Powered Predictive Patient Deterioration System**

A Next.js prototype demonstrating how real-time vital sign analysis can detect early signs of clinical deterioration (sepsis, cardiac arrest) before traditional monitoring systems trigger alerts.

---

## Features

### 🏥 Live Dashboard
- Real-time vital sign simulation with ECG waveforms
- Heart Rate, Blood Pressure, and O2 Saturation monitoring
- Predictive risk scoring with visual alerts

### 🧠 Interactive Architecture Visualization
An educational, interactive simulation of the backend intelligence pipeline:

| Stage | Technology | Function |
|-------|------------|----------|
| **Data Ingestion** | Kafka Stream | Buffers 100Hz sensor data via FHIR |
| **Normalization** | Kalman Filter | Removes sensor noise, estimates true physiological state |
| **Temporal Analysis** | Drift Detection | Computes vital sign velocity over sliding windows |
| **Risk Engine** | Bayesian Inference | Calculates posterior probability of sepsis |
| **Clinical Action** | Sepsis Protocol | Triggers EMR alerts when risk exceeds threshold |

**Interactive Features:**
- **Scenario Toggle**: Switch between "Stable Patient" and "Sepsis Onset" simulations
- **Live Data Flow**: Watch data packets traverse the pipeline with real-time processing
- **Hover Insights**: Educational tooltips explain each algorithm's logic
- **Global Alert System**: Screen visuals shift from calm blue → amber warning → red critical

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd av_project

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
app/
├── architecture/        # Interactive pipeline visualization
│   └── page.tsx
├── components/          # Reusable UI components
│   ├── Dashboard.tsx
│   ├── Navbar.tsx
│   ├── PredictiveMonitor.tsx
│   └── ShowcaseNarrator.tsx
├── data/
│   └── patient_scenarios.ts   # Deterministic vital sign datasets
├── hooks/
│   └── useVitalSimulator.ts   # Real-time data simulation hook
├── lib/
│   └── algorithms.ts          # Kalman Filter, Bayesian Network, Drift Detector
└── page.tsx             # Main dashboard
```

---

## Algorithms

### Kalman Filter
Recursive state estimation that separates true physiological signals from sensor noise (movement artifacts, electrical interference).

### Bayesian Inference
Computes the posterior probability of sepsis using:
- Prior probability (baseline population risk)
- Likelihood functions for HR and MAP given health state
- Combines evidence from multiple vital sign channels

### Drift Detection
Calculates the slope of vital signs over a sliding window to detect subtle physiological drift before absolute thresholds are breached.

---

## Current Phase: Prototype v0.1.0

This is a **demonstration prototype** intended for:
- Stakeholder presentations
- Investor pitches
- Technical architecture education

**Not intended for clinical use.**

---

## License

Proprietary - All Rights Reserved

---

## Author

Built by Rafi
