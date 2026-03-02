/**
 * ══════════════════════════════════════════════════
 *  FUTURE MIRROR  –  Scoring Engine
 *  Maps 20 habits → 5 master scores (0-100)
 *  Detects dangerous compounded risk clusters
 * ══════════════════════════════════════════════════
 */

/* ── Habit Definitions & Weight Matrix ──────────── */
const HABITS = [
  // Physical Health (1-6)
  { key: 'sleepDuration',    label: 'Sleep Duration',         group: 'physical', min: 0, max: 12, optimal: [7, 9],   weights: { health: 0.40, cognitive: 0.20, financial: 0.00, social: 0.00, risk: 0.10 } },
  { key: 'sleepConsistency', label: 'Sleep Consistency',      group: 'physical', min: 0, max: 10, optimal: [7, 10],  weights: { health: 0.25, cognitive: 0.15, financial: 0.00, social: 0.00, risk: 0.08 } },
  { key: 'exerciseFreq',     label: 'Exercise Frequency',     group: 'physical', min: 0, max: 7,  optimal: [4, 6],   weights: { health: 0.35, cognitive: 0.15, financial: 0.00, social: 0.05, risk: 0.10 } },
  { key: 'junkFood',         label: 'Junk Food Intake',       group: 'physical', min: 0, max: 14, optimal: [0, 2],   weights: { health: 0.30, cognitive: 0.05, financial: 0.05, social: 0.00, risk: 0.12 }, inverse: true },
  { key: 'waterIntake',      label: 'Water Intake',           group: 'physical', min: 0, max: 5,  optimal: [2.5, 4], weights: { health: 0.20, cognitive: 0.10, financial: 0.00, social: 0.00, risk: 0.05 } },
  { key: 'substanceUse',     label: 'Substance Use',          group: 'physical', min: 0, max: 10, optimal: [0, 1],   weights: { health: 0.35, cognitive: 0.10, financial: 0.10, social: 0.05, risk: 0.20 }, inverse: true },

  // Mental & Cognitive (7-12)
  { key: 'screenTime',       label: 'Screen Time',            group: 'mental',   min: 0, max: 16, optimal: [1, 4],   weights: { health: 0.05, cognitive: 0.25, financial: 0.00, social: 0.10, risk: 0.10 }, inverse: true },
  { key: 'deepFocus',        label: 'Deep Focus Hours',       group: 'mental',   min: 0, max: 10, optimal: [3, 6],   weights: { health: 0.00, cognitive: 0.35, financial: 0.15, social: 0.00, risk: 0.05 } },
  { key: 'reading',          label: 'Reading / Knowledge',    group: 'mental',   min: 0, max: 10, optimal: [5, 10],  weights: { health: 0.00, cognitive: 0.30, financial: 0.10, social: 0.05, risk: 0.03 } },
  { key: 'stressMgmt',       label: 'Stress Management',      group: 'mental',   min: 0, max: 10, optimal: [6, 10],  weights: { health: 0.15, cognitive: 0.20, financial: 0.05, social: 0.10, risk: 0.15 } },
  { key: 'meditation',       label: 'Meditation / Reflection',group: 'mental',   min: 0, max: 10, optimal: [5, 10],  weights: { health: 0.10, cognitive: 0.20, financial: 0.00, social: 0.05, risk: 0.10 } },
  { key: 'skillDev',         label: 'Skill Development',      group: 'mental',   min: 0, max: 10, optimal: [5, 10],  weights: { health: 0.00, cognitive: 0.30, financial: 0.20, social: 0.00, risk: 0.05 } },

  // Financial & Discipline (13-16)
  { key: 'savingPct',        label: 'Monthly Saving %',       group: 'financial', min: 0, max: 100, optimal: [20, 50], weights: { health: 0.00, cognitive: 0.05, financial: 0.40, social: 0.00, risk: 0.10 } },
  { key: 'impulseSpend',     label: 'Impulse Spending',       group: 'financial', min: 0, max: 10,  optimal: [0, 2],   weights: { health: 0.00, cognitive: 0.05, financial: 0.35, social: 0.00, risk: 0.12 }, inverse: true },
  { key: 'weeklyPlanning',   label: 'Weekly Planning',        group: 'financial', min: 0, max: 10,  optimal: [6, 10],  weights: { health: 0.00, cognitive: 0.15, financial: 0.20, social: 0.05, risk: 0.08 } },
  { key: 'timeMgmt',         label: 'Time Management',        group: 'financial', min: 0, max: 10,  optimal: [6, 10],  weights: { health: 0.05, cognitive: 0.20, financial: 0.20, social: 0.05, risk: 0.08 } },

  // Social & Environment (17-20)
  { key: 'socialQuality',    label: 'Social Interaction Quality', group: 'social', min: 0, max: 10, optimal: [6, 10], weights: { health: 0.05, cognitive: 0.05, financial: 0.00, social: 0.35, risk: 0.08 } },
  { key: 'familyTime',       label: 'Family Engagement',         group: 'social', min: 0, max: 10, optimal: [5, 10], weights: { health: 0.05, cognitive: 0.00, financial: 0.00, social: 0.35, risk: 0.08 } },
  { key: 'digitalDistract',  label: 'Digital Distraction',       group: 'social', min: 0, max: 10, optimal: [0, 3],  weights: { health: 0.05, cognitive: 0.15, financial: 0.05, social: 0.15, risk: 0.12 }, inverse: true },
  { key: 'envResponsibility',label: 'Environmental Responsibility',group:'social', min: 0, max: 10, optimal: [5, 10], weights: { health: 0.05, cognitive: 0.05, financial: 0.00, social: 0.20, risk: 0.03 } },
];

/* ── Risk Clusters ──────────────────────────────── */
const RISK_CLUSTERS = [
  {
    name: 'Burnout Accelerator',
    habits: ['sleepDuration', 'screenTime', 'exerciseFreq', 'stressMgmt'],
    condition: (vals) => vals.sleepDuration < 5 && vals.screenTime > 8 && vals.exerciseFreq < 2 && vals.stressMgmt < 4,
    severity: 'critical',
    message: '⚠ High Burnout Risk Cluster Detected — Low sleep + high screen time + no exercise + poor stress management.',
  },
  {
    name: 'Financial Spiral',
    habits: ['savingPct', 'impulseSpend', 'weeklyPlanning'],
    condition: (vals) => vals.savingPct < 5 && vals.impulseSpend > 6 && vals.weeklyPlanning < 3,
    severity: 'critical',
    message: '⚠ Financial Instability Cluster — No savings + high impulse spending + no planning.',
  },
  {
    name: 'Cognitive Decline',
    habits: ['screenTime', 'deepFocus', 'reading', 'skillDev'],
    condition: (vals) => vals.screenTime > 10 && vals.deepFocus < 2 && vals.reading < 3 && vals.skillDev < 2,
    severity: 'high',
    message: '⚠ Cognitive Decline Risk — Excessive screen time with minimal focus, reading, or learning.',
  },
  {
    name: 'Social Isolation',
    habits: ['socialQuality', 'familyTime', 'digitalDistract'],
    condition: (vals) => vals.socialQuality < 3 && vals.familyTime < 3 && vals.digitalDistract > 7,
    severity: 'high',
    message: '⚠ Social Isolation Risk — Low social quality + low family time + high digital distraction.',
  },
  {
    name: 'Health Deterioration',
    habits: ['sleepDuration', 'exerciseFreq', 'junkFood', 'substanceUse', 'waterIntake'],
    condition: (vals) => vals.sleepDuration < 5 && vals.exerciseFreq < 2 && vals.junkFood > 7 && vals.substanceUse > 5,
    severity: 'critical',
    message: '⚠ Severe Health Risk — Multiple physical habits in danger zone.',
  },
];

/* ── Score a single habit → 0-100 ───────────────── */
function scoreHabit(habit, value) {
  const [optLow, optHigh] = habit.optimal;
  let raw;

  if (habit.inverse) {
    // Lower is better
    if (value <= optLow) raw = 100;
    else if (value >= habit.max) raw = 0;
    else raw = Math.max(0, 100 - ((value - optLow) / (habit.max - optLow)) * 100);
  } else {
    // Higher (within range) is better
    if (value >= optLow && value <= optHigh) raw = 100;
    else if (value < optLow) raw = Math.max(0, (value / optLow) * 100);
    else raw = Math.max(0, 100 - ((value - optHigh) / (habit.max - optHigh)) * 50);
  }
  return Math.round(Math.min(100, Math.max(0, raw)));
}

/* ── Compute 5 Master Scores ────────────────────── */
function computeScores(habitValues) {
  const totals = { health: 0, cognitive: 0, financial: 0, social: 0, risk: 0 };
  const weightSums = { health: 0, cognitive: 0, financial: 0, social: 0, risk: 0 };

  const habitScores = {};

  for (const habit of HABITS) {
    const val = habitValues[habit.key];
    if (val === undefined || val === null) continue;

    const score = scoreHabit(habit, val);
    habitScores[habit.key] = score;

    for (const [dim, w] of Object.entries(habit.weights)) {
      if (w > 0) {
        totals[dim] += score * w;
        weightSums[dim] += w;
      }
    }
  }

  // Normalize
  const masterScores = {};
  for (const dim of Object.keys(totals)) {
    masterScores[dim] = weightSums[dim] > 0
      ? Math.round(totals[dim] / weightSums[dim])
      : 0;
  }

  // Invert risk: high score = low risk
  masterScores.risk = 100 - masterScores.risk;

  return { masterScores, habitScores };
}

/* ── Detect Compounded Risk Clusters ────────────── */
function detectRiskClusters(habitValues) {
  const detected = [];
  for (const cluster of RISK_CLUSTERS) {
    if (cluster.condition(habitValues)) {
      detected.push({
        name: cluster.name,
        severity: cluster.severity,
        message: cluster.message,
        involvedHabits: cluster.habits,
      });
    }
  }
  return detected;
}

/* ── Stability Index ────────────────────────────── */
function stabilityIndex(masterScores) {
  const vals = Object.values(masterScores);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const variance = vals.reduce((a, b) => a + (b - avg) ** 2, 0) / vals.length;
  const stdDev = Math.sqrt(variance);
  // Low std dev = stable, scaled 0-100
  return Math.round(Math.max(0, 100 - stdDev * 2));
}

module.exports = { HABITS, computeScores, detectRiskClusters, stabilityIndex, scoreHabit };
