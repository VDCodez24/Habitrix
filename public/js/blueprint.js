document.addEventListener('DOMContentLoaded', async () => {
  const results = getResults();
  if (!results) { document.getElementById('bp-content').innerHTML = '<div class="card" style="text-align:center;padding:3rem"><h2>No Data</h2><a href="assessment.html" class="btn btn-primary">🔮 Assess</a></div>'; return; }

  showLoading('Generating your 30-day blueprint...');
  let plan = await apiCall('/blueprint', { masterScores: results.masterScores, habitScores: results.habitScores, riskClusters: results.riskClusters });
  hideLoading();

  if (!plan || !plan.weeks) {
    // Fallback
    plan = {
      weeks: [
        { week:1, theme:'Foundation Reset', dailyActions:['Sleep 7+ hours','Drink 2.5L water','15 min walk'], expectedImprovement:5 },
        { week:2, theme:'Building Momentum', dailyActions:['30 min exercise','Reduce screen 1hr','10 min meditation'], expectedImprovement:10 },
        { week:3, theme:'Deep Optimization', dailyActions:['Track spending','2hr deep focus','Read 30 min'], expectedImprovement:15 },
        { week:4, theme:'Integration & Lock', dailyActions:['Weekly review','Quality social time','Full routine'], expectedImprovement:20 },
      ],
      priorityRanking: [{ habit:'sleepDuration', priority:1, reason:'Highest impact' },{ habit:'exerciseFreq', priority:2, reason:'Compounds benefits' },{ habit:'screenTime', priority:3, reason:'Reduces cognitive drain' }],
      estimatedOverallImprovement: 18,
      keyInsight: 'Focus on sleep first — it multiplies benefits across all dimensions.',
    };
  }

  // Render weeks
  const grid = document.getElementById('weeks');
  plan.weeks.forEach(w => {
    const card = document.createElement('div');
    card.className = 'card week-card';
    card.innerHTML = `<div class="week-card__header"><span class="week-card__number">W${w.week}</span><span class="week-card__improvement">+${w.expectedImprovement}%</span></div>
      <div class="week-card__theme">${w.theme}</div>
      <ul class="week-card__actions">${w.dailyActions.map(a => `<li>${a}</li>`).join('')}</ul>`;
    grid.appendChild(card);
  });

  // Priority list
  if (plan.priorityRanking) {
    const list = document.getElementById('priorities');
    plan.priorityRanking.forEach(p => {
      const item = document.createElement('div');
      item.className = 'card priority-item';
      item.innerHTML = `<div class="priority-rank">${p.priority}</div><div class="priority-info"><div class="priority-habit">${p.habit}</div><div class="priority-reason">${p.reason}</div></div>`;
      list.appendChild(item);
    });
  }

  // Key insight
  if (plan.keyInsight) {
    document.getElementById('insight').innerHTML = `<h3>💡 Key Insight</h3><p>${plan.keyInsight}</p><p style="margin-top:0.75rem;font-weight:700;color:var(--success)">Estimated improvement: +${plan.estimatedOverallImprovement || 18}%</p>`;
  }
});
