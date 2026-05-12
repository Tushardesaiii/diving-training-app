import { TableRound, TrainingTable, PersonalizedPlan, WeeklyPlan, WeeklySession } from '../types/app';

// ─── Time formatting ──────────────────────────────────────────────────────────

export function secondsToMMSS(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, '0')}`;
}

export function parseMMSS(input: string): number | null {
  const parts = input.trim().split(':');
  if (parts.length === 2) {
    const m = parseInt(parts[0], 10);
    const s = parseInt(parts[1], 10);
    if (isNaN(m) || isNaN(s) || s >= 60) return null;
    return m * 60 + s;
  }
  if (parts.length === 1) {
    const val = parseInt(parts[0], 10);
    if (isNaN(val)) return null;
    return val;
  }
  return null;
}

// ─── CO2 table generator ──────────────────────────────────────────────────────
// Pattern: hold constant at ~50% PB, rest decreases from ~70% to ~30% PB

export function generateCO2Table(pbSeconds: number): TableRound[] {
  const ROUNDS = 8;
  const holdDuration = Math.max(30, Math.round(pbSeconds * 0.5));
  const restStart = Math.max(90, Math.round(pbSeconds * 0.7));
  const restEnd = Math.max(30, Math.round(pbSeconds * 0.3));
  const step = Math.round((restStart - restEnd) / (ROUNDS - 2));

  return Array.from({ length: ROUNDS }, (_, i) => ({
    round: i + 1,
    holdDuration,
    restDuration: i < ROUNDS - 1 ? Math.max(restEnd, restStart - step * i) : 0,
  }));
}

// ─── O2 table generator ───────────────────────────────────────────────────────
// Pattern: hold increases by ~5% PB per round, rest constant at 2:00

export function generateO2Table(pbSeconds: number): TableRound[] {
  const ROUNDS = 8;
  const holdStart = Math.max(20, Math.round(pbSeconds * 0.45));
  const holdStep = Math.max(10, Math.round(pbSeconds * 0.05));
  const maxHold = Math.round(pbSeconds * 0.9);
  const restDuration = 120;

  return Array.from({ length: ROUNDS }, (_, i) => ({
    round: i + 1,
    holdDuration: Math.min(holdStart + holdStep * i, maxHold),
    restDuration: i < ROUNDS - 1 ? restDuration : 0,
  }));
}

// ─── Max hold session generator ───────────────────────────────────────────────

export function generateMaxHoldSession(pbSeconds: number): TableRound[] {
  return [
    {
      round: 1,
      holdDuration: pbSeconds,  // target is PB; actual may exceed
      restDuration: 0,
    },
  ];
}

// ─── Spearfishing table generator ─────────────────────────────────────────────

export function generateSpearoTable(holdSeconds: number, surfaceInterval: number, rounds: number): TableRound[] {
  return Array.from({ length: rounds }, (_, i) => ({
    round: i + 1,
    holdDuration: holdSeconds,
    restDuration: i < rounds - 1 ? surfaceInterval : 0,
  }));
}

// ─── Table metadata ───────────────────────────────────────────────────────────

export function calcTableDuration(rounds: TableRound[]): number {
  return rounds.reduce((total, r) => total + r.holdDuration + r.restDuration, 0);
}

export function calcTotalHoldTime(rounds: TableRound[]): number {
  return rounds.reduce((total, r) => total + r.holdDuration, 0);
}

export function buildCO2TrainingTable(pbSeconds: number, id: string): TrainingTable {
  const rounds = generateCO2Table(pbSeconds);
  return {
    id,
    mode: 'CO2',
    label: `CO₂ Table (PB ${secondsToMMSS(pbSeconds)})`,
    rounds,
    totalDuration: calcTableDuration(rounds),
    isPersonalized: true,
    basedOnPB: pbSeconds,
  };
}

export function buildO2TrainingTable(pbSeconds: number, id: string): TrainingTable {
  const rounds = generateO2Table(pbSeconds);
  return {
    id,
    mode: 'O2',
    label: `O₂ Table (PB ${secondsToMMSS(pbSeconds)})`,
    rounds,
    totalDuration: calcTableDuration(rounds),
    isPersonalized: true,
    basedOnPB: pbSeconds,
  };
}

export function buildMaxHoldTable(pbSeconds: number, id: string): TrainingTable {
  const rounds = generateMaxHoldSession(pbSeconds);
  return {
    id,
    mode: 'MAX',
    label: 'Max Hold Attempt',
    rounds,
    totalDuration: 120 + pbSeconds,  // breathe-up + hold
    isPersonalized: true,
    basedOnPB: pbSeconds,
  };
}

// ─── 8-week personalized plan generator ──────────────────────────────────────

export function generatePersonalizedPlan(
  basePB: number,
  targetImprovement: number = 0.2
): PersonalizedPlan {
  const targetPB = Math.round(basePB * (1 + targetImprovement));
  const id = `plan_${Date.now()}`;

  const weeks: WeeklyPlan[] = Array.from({ length: 8 }, (_, weekIndex) => {
    const week = weekIndex + 1;
    // Linear interpolation: week 1 starts at basePB, week 8 approaches targetPB
    const weekProgressFraction = weekIndex / 7;
    const weekPB = Math.round(basePB + (targetPB - basePB) * weekProgressFraction);

    const sessions: WeeklySession[] = [
      {
        day: 1,
        type: 'CO2',
        table: buildCO2TrainingTable(weekPB, `${id}_w${week}_d1`),
        description: 'CO₂ Tolerance — build comfort with buildup',
      },
      {
        day: 3,
        type: 'O2',
        table: buildO2TrainingTable(weekPB, `${id}_w${week}_d2`),
        description: 'O₂ Efficiency — progressive hold increases',
      },
      {
        day: 5,
        type: 'MAX',
        table: buildMaxHoldTable(weekPB, `${id}_w${week}_d3`),
        description: 'Max Hold — test your limit safely',
      },
    ];

    return {
      week,
      sessions,
      projectedPB: weekPB,
      isUnlocked: week === 1,
      isCurrentWeek: week === 1,
    };
  });

  return {
    id,
    basePB,
    targetPB,
    targetImprovement,
    weeks,
    generatedAt: Date.now(),
    currentWeek: 1,
    currentDayIndex: 0,
  };
}

// ─── Effort-based adaptation ──────────────────────────────────────────────────
// Adjusts projected PB for remaining weeks based on perceived effort score

export function adaptPlanAfterSession(
  plan: PersonalizedPlan,
  effortScore: number,  // 1–5
  completedWeek: number
): PersonalizedPlan {
  if (effortScore <= 0 || completedWeek >= 8) return plan;

  // 1 = very easy (increase difficulty faster), 5 = max effort (ease off)
  const adjustFactor = effortScore <= 2 ? 1.05 : effortScore >= 4 ? 0.97 : 1.0;

  const updatedWeeks = plan.weeks.map((w) => {
    if (w.week <= completedWeek) return w;

    const adjustedPB = Math.round(w.projectedPB * adjustFactor);
    const weekId = `plan_adapted_${Date.now()}_w${w.week}`;
    return {
      ...w,
      projectedPB: adjustedPB,
      sessions: w.sessions.map((session, di) => {
        const tableId = `${weekId}_d${di + 1}`;
        let table;
        if (session.type === 'CO2') table = buildCO2TrainingTable(adjustedPB, tableId);
        else if (session.type === 'O2') table = buildO2TrainingTable(adjustedPB, tableId);
        else table = buildMaxHoldTable(adjustedPB, tableId);
        return { ...session, table };
      }),
    };
  });

  return { ...plan, weeks: updatedWeeks, lastAdaptedAt: Date.now() };
}

// ─── Progress utilities ───────────────────────────────────────────────────────

export function calcPBGrowthPercent(start: number, current: number): number {
  if (start === 0) return 0;
  return Math.round(((current - start) / start) * 100 * 10) / 10;
}

export function getNextPlanSession(
  plan: PersonalizedPlan
): { week: WeeklyPlan; session: WeeklySession } | null {
  const currentWeek = plan.weeks.find((w) => w.isCurrentWeek);
  if (!currentWeek) return null;

  const nextSession = currentWeek.sessions.find((s) => !s.isComplete);
  if (!nextSession) {
    const nextWeek = plan.weeks.find((w) => w.week === currentWeek.week + 1);
    if (!nextWeek) return null;
    return { week: nextWeek, session: nextWeek.sessions[0] };
  }

  return { week: currentWeek, session: nextSession };
}
