const express = require('express');
const router = express.Router();
const { computeScores, detectRiskClusters, stabilityIndex, HABITS } = require('../engines/scoringEngine');
const { computeProbabilities, projectTimeline, simulateAlternates, computeDivergence } = require('../engines/probabilityEngine');

/* ── Optional: OpenAI ───────────────────────────── */
let openai = null;
try {
  const OpenAI = require('openai');
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (_) { /* openai not installed or no key */ }

/* ── Optional: Supabase ─────────────────────────── */
let supabase = null;
try {
  const { createClient } = require('@supabase/supabase-js');
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  }
} catch (_) { /* supabase not configured */ }

/* ═══════════════════════════════════════════════════
   POST /api/score
   Body: { habits: { sleepDuration: 6, ... } }
   Returns: masterScores, habitScores, riskClusters, stability
   ═══════════════════════════════════════════════════ */
router.post('/score', (req, res) => {
  try {
    const { habits } = req.body;
    if (!habits) return res.status(400).json({ error: 'Missing habits data' });

    const { masterScores, habitScores } = computeScores(habits);
    const riskClusters = detectRiskClusters(habits);
    const stability = stabilityIndex(masterScores);
    const probabilities = computeProbabilities(masterScores);
    const timelines = projectTimeline(probabilities);

    res.json({
      masterScores,
      habitScores,
      riskClusters,
      stability,
      probabilities,
      timelines,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ═══════════════════════════════════════════════════
   POST /api/predict
   Body: { masterScores, probabilities, habits }
   Returns: AI-generated future narratives
   ═══════════════════════════════════════════════════ */
router.post('/predict', async (req, res) => {
  try {
    const { masterScores, probabilities, timelines, riskClusters } = req.body;

    if (!openai) {
      // Fallback: generate structured narrative without AI
      return res.json(generateFallbackNarrative(masterScores, probabilities, timelines, riskClusters));
    }

    const prompt = buildPredictionPrompt(masterScores, probabilities, timelines, riskClusters);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a behavioral analyst AI for Future Mirror. Generate insightful, specific future projections based on behavioral data. Be direct, evidence-based, and empowering. Output valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const narrative = JSON.parse(completion.choices[0].message.content);
    res.json(narrative);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ═══════════════════════════════════════════════════
   POST /api/aging
   Body: { masterScores, healthScore }
   Returns: AI description of visual aging effect
   ═══════════════════════════════════════════════════ */
router.post('/aging', async (req, res) => {
  try {
    const { masterScores } = req.body;
    const healthScore = masterScores?.health || 50;

    if (!openai) {
      return res.json(generateFallbackAging(healthScore, masterScores));
    }

    const prompt = `Based on these behavioral health scores, describe the visual aging effect on a person.
Health Score: ${healthScore}/100
Cognitive Score: ${masterScores.cognitive}/100
Overall Risk: ${masterScores.risk}/100

Return JSON with:
{
  "skinCondition": "description",
  "energyLevel": "description",
  "eyeCondition": "description",
  "overallAppearance": "description",
  "agingAcceleration": number (0-10, where 0 = aging well, 10 = rapid aging),
  "cssEffects": {
    "skinGlow": number (0-100),
    "darkCircles": number (0-100),
    "energyAura": "color hex",
    "brightness": number (0.5-1.5),
    "saturation": number (0.5-1.5)
  },
  "recommendations": ["string"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a health visualization AI. Generate realistic aging effect descriptions based on lifestyle data. Output valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ═══════════════════════════════════════════════════
   POST /api/blueprint
   Body: { masterScores, habitScores, riskClusters }
   Returns: 30-day intervention plan
   ═══════════════════════════════════════════════════ */
router.post('/blueprint', async (req, res) => {
  try {
    const { masterScores, habitScores, riskClusters } = req.body;

    if (!openai) {
      return res.json(generateFallbackBlueprint(masterScores, habitScores, riskClusters));
    }

    const prompt = `Create a 30-day intervention blueprint based on these scores.
Master Scores: ${JSON.stringify(masterScores)}
Weakest Habits: ${JSON.stringify(getWeakestHabits(habitScores, 5))}
Risk Clusters: ${JSON.stringify(riskClusters?.map(c => c.name) || [])}

Return JSON:
{
  "weeks": [
    {
      "week": 1,
      "theme": "string",
      "dailyActions": ["string"],
      "targetHabits": ["string"],
      "expectedImprovement": number
    }
  ],
  "priorityRanking": [{ "habit": "string", "priority": number, "reason": "string" }],
  "estimatedOverallImprovement": number,
  "keyInsight": "string"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a behavioral change specialist. Create actionable, realistic 30-day plans. Output valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ═══════════════════════════════════════════════════
   POST /api/alternate
   Body: { masterScores, habits }
   Returns: 3 alternate universe projections
   ═══════════════════════════════════════════════════ */
router.post('/alternate', (req, res) => {
  try {
    const { masterScores, habits } = req.body;
    const alternates = simulateAlternates(masterScores, habits);
    res.json(alternates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ═══════════════════════════════════════════════════
   POST /api/divergence
   Body: { originalScores, modifiedScores }
   Returns: probability deltas
   ═══════════════════════════════════════════════════ */
router.post('/divergence', (req, res) => {
  try {
    const { originalScores, modifiedScores } = req.body;
    const result = computeDivergence(originalScores, modifiedScores);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ═══════════════════════════════════════════════════
   POST /api/compare
   Returns: peer benchmark data
   ═══════════════════════════════════════════════════ */
router.post('/compare', async (req, res) => {
  try {
    // Static benchmarks (used when Supabase is not configured)
    const benchmarks = {
      ageGroup: { health: 62, cognitive: 55, financial: 48, social: 58, risk: 45 },
      productivityFocused: { health: 70, cognitive: 78, financial: 65, social: 52, risk: 60 },
      healthFocused: { health: 85, cognitive: 65, financial: 55, social: 62, risk: 72 },
    };

    if (supabase) {
      // Try to fetch real benchmark data
      const { data, error } = await supabase
        .from('benchmarks')
        .select('*')
        .limit(1)
        .single();

      if (data && !error) {
        return res.json(data);
      }
    }

    res.json(benchmarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ═══════════════════════════════════════════════════
   POST /api/save
   Body: { habits, scores, userId? }
   Saves assessment to Supabase
   ═══════════════════════════════════════════════════ */
router.post('/save', async (req, res) => {
  try {
    if (!supabase) {
      return res.json({ saved: false, message: 'Database not configured. Data saved locally.' });
    }

    const { habits, scores, userId } = req.body;
    const { data, error } = await supabase
      .from('assessments')
      .insert([{ habits, scores, user_id: userId || 'anonymous', created_at: new Date().toISOString() }]);

    if (error) throw error;
    res.json({ saved: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ═══════════════════════════════════════════════════
   GET /api/habits
   Returns habit definitions for frontend
   ═══════════════════════════════════════════════════ */
router.get('/habits', (_req, res) => {
  res.json(HABITS.map(h => ({
    key: h.key,
    label: h.label,
    group: h.group,
    min: h.min,
    max: h.max,
    optimal: h.optimal,
    inverse: !!h.inverse,
  })));
});

/* ── Fallback generators (no AI API) ────────────── */

function buildPredictionPrompt(masterScores, probabilities, timelines, riskClusters) {
  return `Analyze these behavioral scores and generate future predictions.

MASTER SCORES: ${JSON.stringify(masterScores)}
CURRENT PROBABILITIES: ${JSON.stringify(probabilities)}
TIMELINE PROJECTIONS: ${JSON.stringify(timelines)}
RISK CLUSTERS: ${JSON.stringify(riskClusters?.map(c => c.name) || [])}

Return JSON:
{
  "summary": "2-3 sentence overview",
  "currentState": "detailed current assessment",
  "threeMonths": "3-month projection narrative",
  "oneYear": "1-year projection narrative",
  "fiveToTenYears": "5-10 year projection narrative",
  "topRisks": ["risk1", "risk2", "risk3"],
  "topOpportunities": ["opportunity1", "opportunity2"],
  "urgentActions": ["action1", "action2", "action3"]
}`;
}

function generateFallbackNarrative(masterScores, probabilities, timelines, riskClusters) {
  const avg = Object.values(masterScores).reduce((a, b) => a + b, 0) / 5;
  const level = avg > 70 ? 'strong' : avg > 45 ? 'moderate' : 'concerning';

  return {
    summary: `Your behavioral profile shows ${level} patterns across key life dimensions. ${riskClusters?.length ? `${riskClusters.length} risk cluster(s) detected.` : 'No critical risk clusters detected.'}`,
    currentState: `Health: ${masterScores.health}/100 | Cognitive: ${masterScores.cognitive}/100 | Financial: ${masterScores.financial}/100 | Social: ${masterScores.social}/100 | Risk Index: ${masterScores.risk}/100`,
    threeMonths: `With current habits, expect ${probabilities.burnoutRisk > 60 ? 'increasing fatigue and stress signals' : 'stable patterns with minor fluctuations'}. Career trajectory: ${probabilities.careerSuccess}% success probability.`,
    oneYear: `${probabilities.healthDecline > 50 ? 'Health markers may show measurable decline.' : 'Health trajectory remains stable.'} Financial outlook: ${probabilities.financialInstability > 50 ? 'growing instability risk' : 'positive trend'}.`,
    fiveToTenYears: `Long-term trajectory points to ${avg > 60 ? 'sustainable growth with opportunities' : 'significant risks that require immediate intervention'}. ${probabilities.burnoutRisk > 70 ? 'Burnout is a major concern.' : ''}`,
    topRisks: Object.entries(probabilities).filter(([k, v]) => v > 50 && k !== 'careerSuccess').map(([k]) => k),
    topOpportunities: Object.entries(masterScores).filter(([k, v]) => v > 60).map(([k]) => `Strong ${k} foundation`),
    urgentActions: riskClusters?.map(c => `Address ${c.name}`) || ['Maintain current positive habits'],
  };
}

function generateFallbackAging(healthScore, masterScores) {
  const overall = (healthScore + (masterScores?.cognitive || 50)) / 2;
  return {
    skinCondition: overall > 70 ? 'Healthy, vibrant skin with good elasticity' : overall > 40 ? 'Some signs of fatigue, minor dullness' : 'Visible fatigue, dull complexion, premature lines',
    energyLevel: overall > 70 ? 'High energy, vibrant presence' : overall > 40 ? 'Moderate energy with occasional dips' : 'Low energy, visible exhaustion',
    eyeCondition: overall > 70 ? 'Bright, alert eyes' : overall > 40 ? 'Slightly tired eyes' : 'Dark circles, tired appearance',
    overallAppearance: overall > 70 ? 'Youthful and energetic' : overall > 40 ? 'Average for age' : 'Premature aging signs visible',
    agingAcceleration: Math.round(10 - (overall / 10)),
    cssEffects: {
      skinGlow: Math.round(overall),
      darkCircles: Math.round(100 - overall),
      energyAura: overall > 70 ? '#00ff88' : overall > 40 ? '#ffaa00' : '#ff4444',
      brightness: 0.5 + (overall / 100),
      saturation: 0.5 + (overall / 100) * 0.5,
    },
    recommendations: overall > 70
      ? ['Maintain current habits', 'Focus on consistency']
      : ['Improve sleep quality', 'Increase physical activity', 'Reduce screen time', 'Hydrate more'],
  };
}

function generateFallbackBlueprint(masterScores, habitScores, riskClusters) {
  const weakest = getWeakestHabits(habitScores, 5);
  return {
    weeks: [
      { week: 1, theme: 'Foundation Reset', dailyActions: ['Sleep 7+ hours', 'Drink 2.5L water', '15 min walk'], targetHabits: weakest.slice(0, 2).map(h => h.key), expectedImprovement: 5 },
      { week: 2, theme: 'Building Momentum', dailyActions: ['30 min exercise', 'Reduce screen by 1hr', '10 min meditation'], targetHabits: weakest.slice(1, 3).map(h => h.key), expectedImprovement: 10 },
      { week: 3, theme: 'Deep Optimization', dailyActions: ['Track spending daily', '2 hours deep focus', 'Read 30 min'], targetHabits: weakest.slice(2, 4).map(h => h.key), expectedImprovement: 15 },
      { week: 4, theme: 'Integration & Habit Lock', dailyActions: ['Review weekly plan', 'Quality social time', 'Full routine execution'], targetHabits: weakest.slice(3, 5).map(h => h.key), expectedImprovement: 20 },
    ],
    priorityRanking: weakest.map((h, i) => ({ habit: h.key, priority: i + 1, reason: `Score: ${h.score}/100` })),
    estimatedOverallImprovement: 18,
    keyInsight: `Focus on ${weakest[0]?.key || 'your weakest habits'} first — it has the highest impact multiplier.`,
  };
}

function getWeakestHabits(habitScores, count = 5) {
  if (!habitScores) return [];
  return Object.entries(habitScores)
    .map(([key, score]) => ({ key, score }))
    .sort((a, b) => a.score - b.score)
    .slice(0, count);
}

module.exports = router;
