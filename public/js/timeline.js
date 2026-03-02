document.addEventListener('DOMContentLoaded', async () => {
  const results = getResults();
  if (!results) { document.getElementById('timeline-content').innerHTML = '<div class="card" style="text-align:center;padding:3rem"><h2>No Data</h2><p style="color:var(--text-secondary);margin:1rem 0">Take the assessment first.</p><a href="assessment.html" class="btn btn-primary">🔮 Assess</a></div>'; return; }

  const probs = results.probabilities;
  const tl = results.timelines || {};
  const phases = [
    { key:'current', cls:'current', icon:'📍', title:'Current State', probs: tl.current || probs },
    { key:'threeMonths', cls:'3mo', icon:'📅', title:'3 Months', probs: tl.threeMonths || shiftProbs(probs,0.05) },
    { key:'oneYear', cls:'1yr', icon:'📆', title:'1 Year', probs: tl.oneYear || shiftProbs(probs,0.18) },
    { key:'fiveToTenYears', cls:'5yr', icon:'🔮', title:'5–10 Years', probs: tl.fiveToTenYears || shiftProbs(probs,0.4) },
  ];

  const container = document.getElementById('phases');
  phases.forEach(p => {
    const card = document.createElement('div');
    card.className = `card phase-card phase-card--${p.cls}`;
    card.innerHTML = `<div class="phase-card__icon">${p.icon}</div><div class="phase-card__title">${p.title}</div>
      <div class="phase-card__probs">${Object.entries(p.probs).map(([k,v]) => `<div class="phase-card__prob-item"><span class="phase-card__prob-label">${formatLabel(k)}</span><span class="phase-card__prob-value" style="color:${k==='careerSuccess'?getScoreColor(v):getScoreColor(100-v)}">${v}%</span></div>`).join('')}</div>`;
    container.appendChild(card);
  });

  // Trend line chart
  renderTrendChart(phases);
});

function shiftProbs(probs, factor) {
  const r = {};
  for (const [k,v] of Object.entries(probs)) {
    const isRisk = k !== 'careerSuccess';
    r[k] = Math.max(0, Math.min(100, Math.round(v + (isRisk ? v*factor : -v*factor*0.5))));
  }
  return r;
}

function formatLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

function renderTrendChart(phases) {
  const keys = Object.keys(phases[0].probs);
  const series = keys.map(k => ({ name: formatLabel(k), data: phases.map(p => p.probs[k]) }));
  new ApexCharts(document.getElementById('trend-chart'), {
    series, chart: { type:'line', height:350, background:'transparent', toolbar:{show:false} },
    xaxis: { categories: phases.map(p => p.title) },
    stroke: { width:2, curve:'smooth' },
    yaxis: { min:0, max:100 },
    theme: { mode: document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark' },
    legend: { position: 'top' },
  }).render();
}
