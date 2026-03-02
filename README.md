# 🌌 Future Mirror — Behavioral Future Simulation Engine

A preventive behavioral risk detection platform that evaluates 20 daily habits and simulates probable future outcomes using structured scoring, probability modeling, and AI-powered projections.

## Quick Start

### 1. Install dependencies
```bash
cd server
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your API keys (optional - app works without them)
```

### 3. Run the server
```bash
npm run dev
```
Open http://localhost:3000

### Alternative: Use VS Code Live Server
Open any HTML file in `/public/` with Live Server extension. Frontend works standalone (backend adds AI features).

## Project Structure
- `server/` — Node.js + Express backend (scoring engine, probability engine, AI API)
- `public/` — Frontend HTML, CSS, JS (10 pages)
- `public/css/` — Separated stylesheets per page
- `public/js/` — Separated scripts per page

## Pages
| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Landing page with Three.js sphere |
| Assessment | `assessment.html` | 20 habit cards with sliders |
| Dashboard | `dashboard.html` | Radar chart, scores, AI summary |
| Timeline | `timeline.html` | 3mo / 1yr / 5-10yr projections |
| Alternate | `alternate.html` | 3 parallel future universes |
| Comparison | `comparison.html` | Peer benchmark charts |
| Divergence | `divergence.html` | Live probability shift slider |
| Blueprint | `blueprint.html` | 30-day intervention plan |
| Problems | `problems.html` | Problem → Solution showcase |
| Aging | `aging.html` | Visual aging effect simulation |

## Tech Stack
HTML, Tailwind CSS (CDN), Vanilla JS, Three.js, ApexCharts, GSAP, Lenis, Node.js + Express, OpenAI API, Supabase
