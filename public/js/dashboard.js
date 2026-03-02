/**
 * ══════════════════════════════════════════════════
 *  FUTURE MIRROR — Dashboard
 * ══════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', async () => {
  const results = getResults();
  if (!results) {
    document.getElementById('dashboard-content').innerHTML =
      '<div class="card" style="text-align:center;padding:3rem"><h2>No Assessment Data</h2><p style="color:var(--text-secondary);margin:1rem 0">Complete the assessment first to see your dashboard.</p><a href="assessment.html" class="btn btn-primary">🔮 Take Assessment</a></div>';
    return;
  }

  renderScoreCards(results.masterScores);
  renderRadarChart(results.masterScores);
  renderRiskAlerts(results.riskClusters);
  renderProbabilities(results.probabilities);

  // Fetch AI narrative
  const narrative = await apiCall('/predict', {
    masterScores: results.masterScores,
    probabilities: results.probabilities,
    timelines: results.timelines,
    riskClusters: results.riskClusters,
  });

  if (narrative) {
    renderNarrative(narrative);
  }
});

function renderScoreCards(scores) {
  const container = document.getElementById('score-cards');
  const labels = {
    health: { label: 'Health Score', icon: '🏥' },
    cognitive: { label: 'Cognitive Score', icon: '🧠' },
    financial: { label: 'Financial Score', icon: '💰' },
    social: { label: 'Social Score', icon: '🌍' },
    risk: { label: 'Risk Index', icon: '⚡' },
  };

  for (const [key, val] of Object.entries(scores)) {
    const meta = labels[key];
    const color = getScoreColor(val);
    const card = document.createElement('div');
    card.className = 'card score-card';
    card.innerHTML = `
      <div class="score-card__header">
        <span class="score-card__label">${meta.icon} ${meta.label}</span>
        <span class="score-card__value" style="color:${color}" data-target="${val}">0</span>
      </div>
      <div class="score-card__bar">
        <div class="score-card__bar-fill" style="width:0%;background:${color}"></div>
      </div>`;
    container.appendChild(card);

    // Animate
    setTimeout(() => {
      animateNumber(card.querySelector('.score-card__value'), val, 1200);
      card.querySelector('.score-card__bar-fill').style.width = `${val}%`;
    }, 300);
  }
}

function renderRadarChart(scores) {
  const chart = new ApexCharts(document.getElementById('radar-chart'), {
    series: [{ name: 'Your Scores', data: [scores.health, scores.cognitive, scores.financial, scores.social, scores.risk] }],
    chart: { type: 'radar', height: 350, background: 'transparent', toolbar: { show: false } },
    xaxis: { categories: ['Health', 'Cognitive', 'Financial', 'Social', 'Risk Index'] },
    yaxis: { show: false, max: 100 },
    stroke: { width: 2, colors: ['#7c3aed'] },
    fill: { opacity: 0.2, colors: ['#7c3aed'] },
    markers: { size: 4, colors: ['#7c3aed'] },
    plotOptions: { radar: { polygons: { strokeColors: 'rgba(255,255,255,0.08)', fill: { colors: ['transparent'] } } } },
    theme: { mode: document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark' },
  });
  chart.render();
}

function renderRiskAlerts(clusters) {
  const container = document.getElementById('risk-alerts');
  if (!clusters || clusters.length === 0) {
    container.innerHTML = '<div class="card" style="padding:1.5rem;text-align:center;color:var(--success)">✅ No critical risk clusters detected. Keep up your habits!</div>';
    return;
  }

  clusters.forEach(c => {
    const div = document.createElement('div');
    div.className = `risk-alert risk-alert--${c.severity}`;
    div.innerHTML = `
      <div class="risk-alert__icon">${c.severity === 'critical' ? '🚨' : '⚠️'}</div>
      <div>
        <div class="risk-alert__title">${c.name}</div>
        <div class="risk-alert__text">${c.message}</div>
      </div>`;
    container.appendChild(div);
  });
}

function renderProbabilities(probs) {
  const container = document.getElementById('probabilities');
  const labels = {
    careerSuccess: { label: 'Career Success', good: true },
    burnoutRisk: { label: 'Burnout Risk', good: false },
    healthDecline: { label: 'Health Decline', good: false },
    financialInstability: { label: 'Financial Instability', good: false },
    socialIsolation: { label: 'Social Isolation', good: false },
    productivityStagnation: { label: 'Productivity Stagnation', good: false },
  };

  for (const [key, val] of Object.entries(probs)) {
    const meta = labels[key];
    if (!meta) continue;
    const color = meta.good ? getScoreColor(val) : getScoreColor(100 - val);
    const card = document.createElement('div');
    card.className = 'card prob-card';
    card.innerHTML = `
      <div class="prob-card__value" style="color:${color}">${val}%</div>
      <div class="prob-card__label">${meta.label}</div>`;
    container.appendChild(card);
  }
}

function renderNarrative(narrative) {
  const container = document.getElementById('narrative');
  container.innerHTML = `
    <h3>🤖 AI Analysis</h3>
    <div class="summary-text">
      <p><strong>Summary:</strong> ${narrative.summary || 'No narrative available.'}</p>
      <p><strong>Current State:</strong> ${narrative.currentState || ''}</p>
      ${narrative.topRisks?.length ? `<p><strong>Top Risks:</strong> ${narrative.topRisks.join(', ')}</p>` : ''}
      ${narrative.urgentActions?.length ? `<p><strong>Urgent Actions:</strong> ${narrative.urgentActions.join(' → ')}</p>` : ''}
    </div>`;
}
