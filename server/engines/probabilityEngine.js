/**
 * ══════════════════════════════════════════════════
 *  FUTURE MIRROR  –  Probability Engine
 *  Converts 5 master scores → future probabilities
 *  Projects across 4 timelines
 * ══════════════════════════════════════════════════
 */

/* ── Probability Calculations ───────────────────── */

/**
 * Sigmoid-like mapping: score 0-100 → probability 0-1
 * Steepness controls how quickly probability transitions
 */
function sigmoidMap(score, midpoint = 50, steepness = 0.08) {
  return 1 / (1 + Math.exp(-steepness * (score - midpoint)));
}

/**
 * Compute future outcome probabilities from master scores
 * Returns object with probability for each outcome (0-100%)
 */
function computeProbabilities(masterScores) {
  const { health, cognitive, financial, social, risk } = masterScores;

  return {
    careerSuccess: Math.round(
      (sigmoidMap(cognitive, 45, 0.07) * 0.35 +
       sigmoidMap(financial, 50, 0.06) * 0.25 +
       sigmoidMap(health, 55, 0.05) * 0.15 +
       sigmoidMap(social, 45, 0.06) * 0.15 +
       sigmoidMap(risk, 50, 0.04) * 0.10) * 100
    ),

    burnoutRisk: Math.round(
      (100 - (
        sigmoidMap(health, 50, 0.07) * 0.30 +
        sigmoidMap(cognitive, 45, 0.06) * 0.25 +
        sigmoidMap(risk, 50, 0.08) * 0.25 +
        sigmoidMap(social, 50, 0.05) * 0.20
      ) * 100)
    ),

    healthDecline: Math.round(
      (100 - (
        sigmoidMap(health, 50, 0.08) * 0.50 +
        sigmoidMap(cognitive, 50, 0.04) * 0.15 +
        sigmoidMap(risk, 50, 0.06) * 0.25 +
        sigmoidMap(social, 50, 0.04) * 0.10
      ) * 100)
    ),

    financialInstability: Math.round(
      (100 - (
        sigmoidMap(financial, 50, 0.08) * 0.50 +
        sigmoidMap(cognitive, 50, 0.04) * 0.15 +
        sigmoidMap(risk, 50, 0.05) * 0.20 +
        sigmoidMap(health, 50, 0.03) * 0.15
      ) * 100)
    ),

    socialIsolation: Math.round(
      (100 - (
        sigmoidMap(social, 50, 0.08) * 0.50 +
        sigmoidMap(health, 50, 0.04) * 0.15 +
        sigmoidMap(cognitive, 50, 0.04) * 0.15 +
        sigmoidMap(risk, 50, 0.05) * 0.20
      ) * 100)
    ),

    productivityStagnation: Math.round(
      (100 - (
        sigmoidMap(cognitive, 50, 0.07) * 0.40 +
        sigmoidMap(financial, 50, 0.05) * 0.20 +
        sigmoidMap(health, 50, 0.05) * 0.20 +
        sigmoidMap(risk, 50, 0.05) * 0.20
      ) * 100)
    ),
  };
}

/**
 * Project probabilities across time horizons
 * Applies decay/amplification factors
 */
function projectTimeline(currentProbs) {
  const timelines = {};

  // Current State
  timelines.current = { ...currentProbs };

  // 3 Months — minor shifts (5-10%)
  timelines.threeMonths = {};
  for (const [key, val] of Object.entries(currentProbs)) {
    const isRisk = key !== 'careerSuccess';
    const shift = isRisk
      ? Math.round(val * 0.05) // risks slightly amplify
      : Math.round(val * -0.03); // success slightly decays
    timelines.threeMonths[key] = clamp(val + shift);
  }

  // 1 Year — noticeable impact (15-25%)
  timelines.oneYear = {};
  for (const [key, val] of Object.entries(currentProbs)) {
    const isRisk = key !== 'careerSuccess';
    const shift = isRisk
      ? Math.round(val * 0.18)
      : Math.round(val * -0.12);
    timelines.oneYear[key] = clamp(val + shift);
  }

  // 5-10 Years — major trajectory (30-50%)
  timelines.fiveToTenYears = {};
  for (const [key, val] of Object.entries(currentProbs)) {
    const isRisk = key !== 'careerSuccess';
    const shift = isRisk
      ? Math.round(val * 0.40)
      : Math.round(val * -0.25);
    timelines.fiveToTenYears[key] = clamp(val + shift);
  }

  return timelines;
}

/**
 * Simulate alternate universes
 */
function simulateAlternates(masterScores, habitValues, topHabitsToImprove) {
  // Universe 1: Continue current habits (same as current probabilities)
  const current = computeProbabilities(masterScores);

  // Universe 2: Improve top 3 habits by 30%
  const improved = { ...masterScores };
  for (const dim of Object.keys(improved)) {
    improved[dim] = clamp(improved[dim] + 15);
  }
  const improvedProbs = computeProbabilities(improved);

  // Universe 3: Habits worsen by 30%
  const worsened = { ...masterScores };
  for (const dim of Object.keys(worsened)) {
    worsened[dim] = clamp(worsened[dim] - 20);
  }
  const worsenedProbs = computeProbabilities(worsened);

  return {
    continue: { scores: masterScores, probabilities: current },
    improved: { scores: improved, probabilities: improvedProbs },
    worsened: { scores: worsened, probabilities: worsenedProbs },
  };
}

/**
 * Compute divergence — how much probabilities shift when habits change
 */
function computeDivergence(originalScores, modifiedScores) {
  const origProbs = computeProbabilities(originalScores);
  const modProbs = computeProbabilities(modifiedScores);
  const deltas = {};

  for (const key of Object.keys(origProbs)) {
    deltas[key] = modProbs[key] - origProbs[key];
  }

  return { original: origProbs, modified: modProbs, deltas };
}

/* ── Helper ─────────────────────────────────────── */
function clamp(val, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(val)));
}

module.exports = {
  computeProbabilities,
  projectTimeline,
  simulateAlternates,
  computeDivergence,
};
