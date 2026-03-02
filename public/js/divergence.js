let divChart;
document.addEventListener('DOMContentLoaded', () => {
  const results = getResults();
  if (!results) { document.getElementById('div-content').innerHTML = '<div class="card" style="text-align:center;padding:3rem"><h2>No Data</h2><a href="assessment.html" class="btn btn-primary">🔮 Assess</a></div>'; return; }

  const ms = { ...results.masterScores };
  const modified = { ...ms };
  const dims = ['health','cognitive','financial','social','risk'];
  const labels = { health:'Health',cognitive:'Cognitive',financial:'Financial',social:'Social',risk:'Risk Index' };

  // Render sliders
  const panel = document.getElementById('sliders');
  dims.forEach(dim => {
    const div = document.createElement('div');
    div.className = 'div-slider-group';
    div.innerHTML = `<label>${labels[dim]} <span class="div-slider-value" id="val-${dim}">${ms[dim]}</span></label>
      <input type="range" min="0" max="100" value="${ms[dim]}" id="slider-${dim}">`;
    panel.appendChild(div);
    div.querySelector('input').addEventListener('input', e => {
      modified[dim] = parseInt(e.target.value);
      document.getElementById(`val-${dim}`).textContent = modified[dim];
      updateDivergence(ms, modified);
    });
  });

  // Initial chart
  const origProbs = clientComputeProbabilities(ms);
  renderDivChart(origProbs, origProbs);
});

function updateDivergence(original, modified) {
  const origProbs = clientComputeProbabilities(original);
  const modProbs = clientComputeProbabilities(modified);

  // Update chart
  const keys = Object.keys(origProbs);
  divChart.updateSeries([
    { name:'Original', data: keys.map(k => origProbs[k]) },
    { name:'Modified', data: keys.map(k => modProbs[k]) },
  ]);

  // Update deltas
  const container = document.getElementById('deltas');
  container.innerHTML = '';
  keys.forEach(k => {
    const delta = modProbs[k] - origProbs[k];
    const card = document.createElement('div');
    card.className = 'card delta-card';
    card.innerHTML = `<span class="delta-label">${k.replace(/([A-Z])/g,' $1')}</span>
      <span class="delta-value ${delta >= 0 ? (k==='careerSuccess'?'delta-positive':'delta-negative') : (k==='careerSuccess'?'delta-negative':'delta-positive')}">${delta >= 0 ? '+' : ''}${delta}%</span>`;
    container.appendChild(card);
  });
}

function renderDivChart(origProbs, modProbs) {
  const keys = Object.keys(origProbs);
  divChart = new ApexCharts(document.getElementById('div-chart'), {
    series: [
      { name:'Original', data: keys.map(k => origProbs[k]) },
      { name:'Modified', data: keys.map(k => modProbs[k]) },
    ],
    chart: { type:'bar', height:350, background:'transparent', toolbar:{show:false} },
    plotOptions: { bar: { horizontal:true, borderRadius:4 } },
    xaxis: { max:100 }, yaxis: { categories: keys.map(k => k.replace(/([A-Z])/g,' $1')) },
    colors: ['#7c3aed','#06b6d4'],
    theme: { mode: document.documentElement.getAttribute('data-theme')==='light'?'light':'dark' },
  });
  divChart.render();
}
