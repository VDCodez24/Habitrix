/**
 * ══════════════════════════════════════════════════
 *  FUTURE MIRROR — Client-side Scoring
 *  Mirrors backend scoringEngine.js for offline use
 * ══════════════════════════════════════════════════
 */

const HABIT_DEFS = [
  { key:'sleepDuration',    label:'Sleep Duration',          group:'physical', min:0, max:12, optimal:[7,9],   unit:'hrs/day', emojis:['😴','😐','😊','💪'], inverse:false },
  { key:'sleepConsistency', label:'Sleep Consistency',       group:'physical', min:0, max:10, optimal:[7,10],  unit:'rating',  emojis:['😴','😐','😊','💪'], inverse:false },
  { key:'exerciseFreq',     label:'Exercise Frequency',      group:'physical', min:0, max:7,  optimal:[4,6],   unit:'days/wk', emojis:['🛋️','😐','🏃','💪'], inverse:false },
  { key:'junkFood',         label:'Junk Food Intake',        group:'physical', min:0, max:14, optimal:[0,2],   unit:'times/wk',emojis:['💪','😊','😐','🍔'], inverse:true },
  { key:'waterIntake',      label:'Water Intake',            group:'physical', min:0, max:5,  optimal:[2.5,4], unit:'L/day',   emojis:['🏜️','😐','💧','💪'], inverse:false },
  { key:'substanceUse',     label:'Substance Use',           group:'physical', min:0, max:10, optimal:[0,1],   unit:'freq',    emojis:['💪','😊','😐','⚠️'], inverse:true },

  { key:'screenTime',       label:'Screen Time',             group:'mental',   min:0, max:16, optimal:[1,4],   unit:'hrs/day', emojis:['💪','😊','😐','📱'], inverse:true },
  { key:'deepFocus',        label:'Deep Focus Hours',        group:'mental',   min:0, max:10, optimal:[3,6],   unit:'hrs/day', emojis:['😴','😐','🧠','💪'], inverse:false },
  { key:'reading',          label:'Reading / Knowledge',     group:'mental',   min:0, max:10, optimal:[5,10],  unit:'rating',  emojis:['😴','😐','📚','💪'], inverse:false },
  { key:'stressMgmt',       label:'Stress Management',       group:'mental',   min:0, max:10, optimal:[6,10],  unit:'rating',  emojis:['😰','😐','😌','💪'], inverse:false },
  { key:'meditation',       label:'Meditation / Reflection', group:'mental',   min:0, max:10, optimal:[5,10],  unit:'rating',  emojis:['😐','🙂','🧘','💪'], inverse:false },
  { key:'skillDev',         label:'Skill Development',       group:'mental',   min:0, max:10, optimal:[5,10],  unit:'rating',  emojis:['😴','😐','📈','💪'], inverse:false },

  { key:'savingPct',        label:'Monthly Saving %',        group:'financial', min:0, max:100,optimal:[20,50], unit:'%',       emojis:['💸','😐','💰','💪'], inverse:false },
  { key:'impulseSpend',     label:'Impulse Spending',        group:'financial', min:0, max:10, optimal:[0,2],   unit:'freq',    emojis:['💪','😊','😐','💸'], inverse:true },
  { key:'weeklyPlanning',   label:'Weekly Planning',         group:'financial', min:0, max:10, optimal:[6,10],  unit:'rating',  emojis:['😴','😐','📋','💪'], inverse:false },
  { key:'timeMgmt',         label:'Time Management',         group:'financial', min:0, max:10, optimal:[6,10],  unit:'rating',  emojis:['😴','😐','⏰','💪'], inverse:false },

  { key:'socialQuality',    label:'Social Interaction Quality',group:'social',  min:0, max:10, optimal:[6,10],  unit:'rating',  emojis:['😔','😐','😊','💪'], inverse:false },
  { key:'familyTime',       label:'Family Engagement',       group:'social',   min:0, max:10, optimal:[5,10],  unit:'rating',  emojis:['😔','😐','👨‍👩‍👧','💪'], inverse:false },
  { key:'digitalDistract',  label:'Digital Distraction',     group:'social',   min:0, max:10, optimal:[0,3],   unit:'level',   emojis:['💪','😊','😐','📱'], inverse:true },
  { key:'envResponsibility',label:'Environmental Responsibility',group:'social',min:0, max:10, optimal:[5,10],  unit:'rating',  emojis:['😐','🙂','🌱','💪'], inverse:false },
];

const WEIGHTS = {
  sleepDuration:    { health:0.40, cognitive:0.20, financial:0.00, social:0.00, risk:0.10 },
  sleepConsistency: { health:0.25, cognitive:0.15, financial:0.00, social:0.00, risk:0.08 },
  exerciseFreq:     { health:0.35, cognitive:0.15, financial:0.00, social:0.05, risk:0.10 },
  junkFood:         { health:0.30, cognitive:0.05, financial:0.05, social:0.00, risk:0.12 },
  waterIntake:      { health:0.20, cognitive:0.10, financial:0.00, social:0.00, risk:0.05 },
  substanceUse:     { health:0.35, cognitive:0.10, financial:0.10, social:0.05, risk:0.20 },
  screenTime:       { health:0.05, cognitive:0.25, financial:0.00, social:0.10, risk:0.10 },
  deepFocus:        { health:0.00, cognitive:0.35, financial:0.15, social:0.00, risk:0.05 },
  reading:          { health:0.00, cognitive:0.30, financial:0.10, social:0.05, risk:0.03 },
  stressMgmt:       { health:0.15, cognitive:0.20, financial:0.05, social:0.10, risk:0.15 },
  meditation:       { health:0.10, cognitive:0.20, financial:0.00, social:0.05, risk:0.10 },
  skillDev:         { health:0.00, cognitive:0.30, financial:0.20, social:0.00, risk:0.05 },
  savingPct:        { health:0.00, cognitive:0.05, financial:0.40, social:0.00, risk:0.10 },
  impulseSpend:     { health:0.00, cognitive:0.05, financial:0.35, social:0.00, risk:0.12 },
  weeklyPlanning:   { health:0.00, cognitive:0.15, financial:0.20, social:0.05, risk:0.08 },
  timeMgmt:         { health:0.05, cognitive:0.20, financial:0.20, social:0.05, risk:0.08 },
  socialQuality:    { health:0.05, cognitive:0.05, financial:0.00, social:0.35, risk:0.08 },
  familyTime:       { health:0.05, cognitive:0.00, financial:0.00, social:0.35, risk:0.08 },
  digitalDistract:  { health:0.05, cognitive:0.15, financial:0.05, social:0.15, risk:0.12 },
  envResponsibility:{ health:0.05, cognitive:0.05, financial:0.00, social:0.20, risk:0.03 },
};

const GROUP_META = {
  physical:  { icon: '🏥', label: 'Physical Health Habits' },
  mental:    { icon: '🧠', label: 'Mental & Cognitive Habits' },
  financial: { icon: '💰', label: 'Financial & Discipline Habits' },
  social:    { icon: '🌍', label: 'Social & Environment Habits' },
};

function clientScoreHabit(habit, value) {
  const [optLow, optHigh] = habit.optimal;
  let raw;
  if (habit.inverse) {
    if (value <= optLow) raw = 100;
    else if (value >= habit.max) raw = 0;
    else raw = Math.max(0, 100 - ((value - optLow) / (habit.max - optLow)) * 100);
  } else {
    if (value >= optLow && value <= optHigh) raw = 100;
    else if (value < optLow) raw = Math.max(0, (value / optLow) * 100);
    else raw = Math.max(0, 100 - ((value - optHigh) / (habit.max - optHigh)) * 50);
  }
  return Math.round(Math.min(100, Math.max(0, raw)));
}

function clientComputeScores(habitValues) {
  const totals = { health:0, cognitive:0, financial:0, social:0, risk:0 };
  const weightSums = { health:0, cognitive:0, financial:0, social:0, risk:0 };
  const habitScores = {};

  for (const habit of HABIT_DEFS) {
    const val = habitValues[habit.key];
    if (val === undefined) continue;
    const score = clientScoreHabit(habit, val);
    habitScores[habit.key] = score;
    const w = WEIGHTS[habit.key];
    for (const dim of Object.keys(totals)) {
      if (w[dim] > 0) { totals[dim] += score * w[dim]; weightSums[dim] += w[dim]; }
    }
  }

  const masterScores = {};
  for (const dim of Object.keys(totals)) {
    masterScores[dim] = weightSums[dim] > 0 ? Math.round(totals[dim] / weightSums[dim]) : 0;
  }
  masterScores.risk = 100 - masterScores.risk;
  return { masterScores, habitScores };
}

/* Sigmoid for probability */
function sigmoid(score, mid = 50, steep = 0.08) {
  return 1 / (1 + Math.exp(-steep * (score - mid)));
}

function clientComputeProbabilities(ms) {
  return {
    careerSuccess:  Math.round((sigmoid(ms.cognitive,45,0.07)*0.35+sigmoid(ms.financial,50,0.06)*0.25+sigmoid(ms.health,55,0.05)*0.15+sigmoid(ms.social,45,0.06)*0.15+sigmoid(ms.risk,50,0.04)*0.10)*100),
    burnoutRisk:    Math.round(100-(sigmoid(ms.health,50,0.07)*0.30+sigmoid(ms.cognitive,45,0.06)*0.25+sigmoid(ms.risk,50,0.08)*0.25+sigmoid(ms.social,50,0.05)*0.20)*100),
    healthDecline:  Math.round(100-(sigmoid(ms.health,50,0.08)*0.50+sigmoid(ms.cognitive,50,0.04)*0.15+sigmoid(ms.risk,50,0.06)*0.25+sigmoid(ms.social,50,0.04)*0.10)*100),
    financialInstability: Math.round(100-(sigmoid(ms.financial,50,0.08)*0.50+sigmoid(ms.cognitive,50,0.04)*0.15+sigmoid(ms.risk,50,0.05)*0.20+sigmoid(ms.health,50,0.03)*0.15)*100),
    socialIsolation: Math.round(100-(sigmoid(ms.social,50,0.08)*0.50+sigmoid(ms.health,50,0.04)*0.15+sigmoid(ms.cognitive,50,0.04)*0.15+sigmoid(ms.risk,50,0.05)*0.20)*100),
    productivityStagnation: Math.round(100-(sigmoid(ms.cognitive,50,0.07)*0.40+sigmoid(ms.financial,50,0.05)*0.20+sigmoid(ms.health,50,0.05)*0.20+sigmoid(ms.risk,50,0.05)*0.20)*100),
  };
}
