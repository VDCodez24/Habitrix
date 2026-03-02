/**
 * ══════════════════════════════════════════════════
 *  FUTURE MIRROR — Assessment Page Logic
 *  Dynamic habit cards, sliders, emoji, submit
 * ══════════════════════════════════════════════════
 */

const habitValues = {};
let interactedCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  renderHabitCards();
  updateProgress();
});

function renderHabitCards() {
  const container = document.getElementById('habits-container');
  const groups = ['physical', 'mental', 'financial', 'social'];

  groups.forEach(group => {
    const meta = GROUP_META[group];
    const groupHabits = HABIT_DEFS.filter(h => h.group === group);

    // Group heading
    const heading = document.createElement('div');
    heading.className = 'group-title';
    heading.innerHTML = `<span class="group-icon">${meta.icon}</span> ${meta.label}`;
    container.appendChild(heading);

    // Grid
    const grid = document.createElement('div');
    grid.className = 'habits-grid';

    groupHabits.forEach(habit => {
      const defaultVal = habit.inverse
        ? Math.round((habit.max - habit.min) * 0.3 + habit.min)
        : Math.round((habit.optimal[0] + habit.optimal[1]) / 2);
      habitValues[habit.key] = defaultVal;

      const card = createHabitCard(habit, defaultVal);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  });
}

function createHabitCard(habit, defaultVal) {
  const card = document.createElement('div');
  card.className = 'habit-card';
  card.id = `card-${habit.key}`;

  const score = clientScoreHabit(habit, defaultVal);
  const level = score >= 70 ? 'optimal' : score >= 40 ? 'moderate' : 'risk';
  card.setAttribute('data-level', level);

  const step = habit.max <= 10 ? 0.5 : (habit.max <= 20 ? 1 : 5);

  card.innerHTML = `
    <div class="habit-card__header">
      <span class="habit-card__label">${habit.label}</span>
      <span class="habit-card__emoji" id="emoji-${habit.key}">${getHabitEmoji(habit, defaultVal)}</span>
    </div>
    <div class="habit-card__slider-wrap">
      <input type="range" class="habit-card__slider" id="slider-${habit.key}"
        min="${habit.min}" max="${habit.max}" value="${defaultVal}" step="${step}">
    </div>
    <div class="habit-card__value-row">
      <span>${habit.min} ${habit.unit}</span>
      <span class="habit-card__value" id="value-${habit.key}">${defaultVal} ${habit.unit}</span>
      <span>${habit.max} ${habit.unit}</span>
    </div>
    <div class="risk-meter">
      <div class="risk-meter__fill" id="meter-${habit.key}" style="width:${score}%;background:${getScoreColor(score)}"></div>
    </div>
  `;

  // Slider event
  const slider = card.querySelector(`#slider-${habit.key}`);
  slider.addEventListener('input', () => {
    const val = parseFloat(slider.value);
    habitValues[habit.key] = val;
    updateCard(habit, val);

    if (!card.dataset.interacted) {
      card.dataset.interacted = 'true';
      interactedCount++;
      updateProgress();
    }
  });

  return card;
}

function updateCard(habit, value) {
  const score = clientScoreHabit(habit, value);
  const level = score >= 70 ? 'optimal' : score >= 40 ? 'moderate' : 'risk';
  const card = document.getElementById(`card-${habit.key}`);

  card.setAttribute('data-level', level);
  document.getElementById(`emoji-${habit.key}`).textContent = getHabitEmoji(habit, value);
  document.getElementById(`value-${habit.key}`).textContent = `${value} ${habit.unit}`;

  const meter = document.getElementById(`meter-${habit.key}`);
  meter.style.width = `${score}%`;
  meter.style.background = getScoreColor(score);
}

function getHabitEmoji(habit, value) {
  const pct = (value - habit.min) / (habit.max - habit.min);
  const idx = habit.inverse
    ? Math.min(3, Math.floor(pct * 4))
    : Math.min(3, Math.floor(pct * 4));
  return habit.emojis[idx] || '😐';
}

function updateProgress() {
  const total = HABIT_DEFS.length;
  const pct = Math.round((interactedCount / total) * 100);
  const fill = document.getElementById('progress-fill');
  const text = document.getElementById('progress-text');
  if (fill) fill.style.width = `${pct}%`;
  if (text) text.textContent = `${interactedCount}/${total} habits rated`;
}

async function submitAssessment() {
  showLoading('Analyzing your behavioral patterns...');

  // Save habits to localStorage
  saveAssessment(habitValues);

  // Try backend first, fallback to client-side
  let results = await apiCall('/score', { habits: habitValues });

  if (!results) {
    // Client-side fallback
    const { masterScores, habitScores } = clientComputeScores(habitValues);
    const probabilities = clientComputeProbabilities(masterScores);
    results = {
      masterScores,
      habitScores,
      probabilities,
      riskClusters: [],
      stability: 70,
      timelines: { current: probabilities },
    };
  }

  saveResults(results);

  // Try to save to database
  apiCall('/save', { habits: habitValues, scores: results });

  hideLoading();
  window.location.href = 'dashboard.html';
}
