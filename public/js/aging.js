document.addEventListener('DOMContentLoaded', async () => {
  const results = getResults();
  if (!results) { document.getElementById('aging-content').innerHTML = '<div class="card" style="text-align:center;padding:3rem"><h2>No Data</h2><a href="assessment.html" class="btn btn-primary">🔮 Assess</a></div>'; return; }

  showLoading('Generating visual aging analysis...');
  let agingData = await apiCall('/aging', { masterScores: results.masterScores });
  hideLoading();

  if (!agingData) {
    // Client-side fallback
    const h = results.masterScores.health || 50;
    const overall = (h + (results.masterScores.cognitive || 50)) / 2;
    agingData = {
      skinCondition: overall > 70 ? 'Healthy, vibrant skin' : overall > 40 ? 'Some signs of fatigue' : 'Visible fatigue, dull complexion',
      energyLevel: overall > 70 ? 'High energy' : overall > 40 ? 'Moderate energy' : 'Low energy',
      eyeCondition: overall > 70 ? 'Bright, alert eyes' : overall > 40 ? 'Slightly tired' : 'Dark circles visible',
      overallAppearance: overall > 70 ? 'Youthful and energetic' : overall > 40 ? 'Average for age' : 'Premature aging',
      agingAcceleration: Math.round(10 - overall/10),
      cssEffects: { skinGlow: Math.round(overall), darkCircles: Math.round(100-overall), energyAura: overall > 70 ? '#00ff88' : overall > 40 ? '#ffaa00' : '#ff4444', brightness: 0.5+overall/100, saturation: 0.5+overall/200 },
      recommendations: overall > 70 ? ['Maintain current habits','Focus on consistency'] : ['Improve sleep','Increase exercise','Reduce screen time','Hydrate more'],
    };
  }

  applyAgingEffect(agingData);
  renderAgingDetails(agingData);
});

function applyAgingEffect(data) {
  const effects = data.cssEffects || {};
  const face = document.querySelector('.face-base');
  const aura = document.querySelector('.energy-aura');
  const darkCircleEls = document.querySelectorAll('.dark-circle');
  const container = document.querySelector('.face-container');

  // Skin glow (brightness/saturation)
  const brightness = effects.brightness || 1;
  const saturation = effects.saturation || 1;
  face.style.filter = `brightness(${brightness}) saturate(${saturation})`;

  // Skin color based on glow
  const glow = effects.skinGlow || 50;
  if (glow < 30) face.style.background = 'linear-gradient(135deg, #c9a882, #a8876a)';
  else if (glow < 60) face.style.background = 'linear-gradient(135deg, #e8c99b, #d4a87c)';
  else face.style.background = 'linear-gradient(135deg, #ffe0b2, #ffcc80)';

  // Dark circles
  const dc = effects.darkCircles || 0;
  darkCircleEls.forEach(el => {
    el.style.background = `rgba(80, 40, 80, ${dc / 200})`;
  });

  // Energy aura color
  const auraColor = effects.energyAura || '#00ff88';
  aura.style.background = `radial-gradient(circle, transparent 60%, ${auraColor}22)`;
  container.style.boxShadow = `0 0 ${30 + glow/2}px ${auraColor}44`;

  // Mouth expression
  const mouth = document.querySelector('.mouth');
  if (glow > 70) { mouth.style.borderRadius = '0 0 50% 50%'; mouth.style.height = '20px'; }
  else if (glow > 40) { mouth.style.borderRadius = '0'; mouth.style.height = '3px'; }
  else { mouth.style.borderRadius = '50% 50% 0 0'; mouth.style.height = '15px'; mouth.style.borderBottom = 'none'; mouth.style.borderTop = '3px solid #c0392b'; }
}

function renderAgingDetails(data) {
  const details = document.getElementById('aging-details');
  const items = [
    { label: '🧴 Skin Condition', value: data.skinCondition },
    { label: '⚡ Energy Level', value: data.energyLevel },
    { label: '👁️ Eye Condition', value: data.eyeCondition },
    { label: '🪞 Overall Appearance', value: data.overallAppearance },
  ];

  details.innerHTML = items.map(i =>
    `<div class="aging-detail-item"><div class="aging-detail-item__label">${i.label}</div><div class="aging-detail-item__value">${i.value}</div></div>`
  ).join('');

  // Aging meter
  const meter = document.getElementById('aging-meter-fill');
  const val = data.agingAcceleration || 5;
  const color = val <= 3 ? 'var(--success)' : val <= 6 ? 'var(--warning)' : 'var(--danger)';
  meter.style.width = `${val * 10}%`;
  meter.style.background = color;
  document.getElementById('aging-meter-value').textContent = `${val}/10`;
  document.getElementById('aging-meter-value').style.color = color;

  // Recommendations
  const recList = document.getElementById('recommendations');
  if (data.recommendations) {
    recList.innerHTML = data.recommendations.map(r => `<li>${r}</li>`).join('');
  }
}
