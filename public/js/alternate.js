document.addEventListener('DOMContentLoaded', async () => {
  const results = getResults();
  const habits = getAssessment();
  if (!results) { document.getElementById('alt-content').innerHTML = '<div class="card" style="text-align:center;padding:3rem"><h2>No Data</h2><a href="assessment.html" class="btn btn-primary">🔮 Assess</a></div>'; return; }

  let alternates = await apiCall('/alternate', { masterScores: results.masterScores, habits });
  if (!alternates) {
    const ms = results.masterScores;
    const imp = {}; const wor = {};
    for (const k of Object.keys(ms)) { imp[k] = Math.min(100, ms[k]+15); wor[k] = Math.max(0, ms[k]-20); }
    alternates = {
      continue: { scores: ms, probabilities: results.probabilities },
      improved: { scores: imp, probabilities: clientComputeProbabilities(imp) },
      worsened: { scores: wor, probabilities: clientComputeProbabilities(wor) },
    };
  }

  const grid = document.getElementById('universes');
  const configs = [
    { key:'continue', cls:'continue', icon:'🔵', title:'Current Path', subtitle:'If you continue your current habits' },
    { key:'improved', cls:'improved', icon:'🟢', title:'Improved Path', subtitle:'If you improve your top habits by 30%' },
    { key:'worsened', cls:'worsened', icon:'🔴', title:'Worsened Path', subtitle:'If your habits decline over time' },
  ];

  configs.forEach(cfg => {
    const u = alternates[cfg.key];
    const card = document.createElement('div');
    card.className = `card universe-card universe-card--${cfg.cls}`;
    card.innerHTML = `<div class="universe-card__icon">${cfg.icon}</div>
      <div class="universe-card__title">${cfg.title}</div>
      <div class="universe-card__subtitle">${cfg.subtitle}</div>
      <div class="universe-card__scores">${Object.entries(u.probabilities).map(([k,v]) =>
        `<div class="universe-card__score-item"><span>${k.replace(/([A-Z])/g,' $1')}</span><span style="font-weight:700;color:${k==='careerSuccess'?getScoreColor(v):getScoreColor(100-v)}">${v}%</span></div>`
      ).join('')}</div>`;
    grid.appendChild(card);
  });

  // Comparison radar
  new ApexCharts(document.getElementById('alt-radar'), {
    series: configs.map(c => ({ name: c.title, data: Object.values(alternates[c.key].scores) })),
    chart: { type:'radar', height:400, background:'transparent', toolbar:{show:false} },
    xaxis: { categories: ['Health','Cognitive','Financial','Social','Risk'] },
    yaxis: { show:false, max:100 },
    stroke: { width:2 },
    colors: ['#3b82f6','#10b981','#ef4444'],
    theme: { mode: document.documentElement.getAttribute('data-theme')==='light'?'light':'dark' },
    legend: { position:'top' },
  }).render();
});
