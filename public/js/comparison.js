let radarChart, barChart;
const benchmarks = {
  ageGroup: { health:62, cognitive:55, financial:48, social:58, risk:45 },
  productivityFocused: { health:70, cognitive:78, financial:65, social:52, risk:60 },
  healthFocused: { health:85, cognitive:65, financial:55, social:62, risk:72 },
};
let activeBenchmark = 'ageGroup';

document.addEventListener('DOMContentLoaded', async () => {
  const results = getResults();
  if (!results) { document.getElementById('comp-content').innerHTML = '<div class="card" style="text-align:center;padding:3rem"><h2>No Data</h2><a href="assessment.html" class="btn btn-primary">🔮 Assess</a></div>'; return; }

  const remote = await apiCall('/compare', {});
  if (remote) Object.assign(benchmarks, remote);

  renderCharts(results.masterScores);
  document.querySelectorAll('.benchmark-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.benchmark-btn.active')?.classList.remove('active');
      btn.classList.add('active');
      activeBenchmark = btn.dataset.group;
      updateCharts(results.masterScores);
    });
  });
});

function renderCharts(scores) {
  const cats = ['Health','Cognitive','Financial','Social','Risk'];
  const userVals = [scores.health, scores.cognitive, scores.financial, scores.social, scores.risk];
  const benchVals = Object.values(benchmarks[activeBenchmark]);
  const mode = document.documentElement.getAttribute('data-theme')==='light'?'light':'dark';

  radarChart = new ApexCharts(document.getElementById('comp-radar'), {
    series: [{ name:'You', data:userVals }, { name:'Benchmark', data:benchVals }],
    chart: { type:'radar', height:350, background:'transparent', toolbar:{show:false} },
    xaxis: { categories:cats }, yaxis: { show:false, max:100 },
    stroke: { width:2 }, colors:['#7c3aed','#06b6d4'],
    theme: { mode }, legend: { position:'top' },
  });
  radarChart.render();

  barChart = new ApexCharts(document.getElementById('comp-bar'), {
    series: [{ name:'You', data:userVals }, { name:'Benchmark', data:benchVals }],
    chart: { type:'bar', height:350, background:'transparent', toolbar:{show:false} },
    plotOptions: { bar: { horizontal:false, columnWidth:'55%', borderRadius:4 } },
    xaxis: { categories:cats }, yaxis: { max:100 },
    colors:['#7c3aed','#06b6d4'], theme: { mode },
  });
  barChart.render();
}

function updateCharts(scores) {
  const userVals = [scores.health, scores.cognitive, scores.financial, scores.social, scores.risk];
  const benchVals = Object.values(benchmarks[activeBenchmark]);
  radarChart.updateSeries([{ name:'You', data:userVals }, { name:'Benchmark', data:benchVals }]);
  barChart.updateSeries([{ name:'You', data:userVals }, { name:'Benchmark', data:benchVals }]);
}
