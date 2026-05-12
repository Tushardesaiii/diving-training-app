import { useState, useEffect, useRef, useCallback } from 'react';
import { TrainingTable, TrainingPhase, CompletedRound } from '../types/app';
import {
  hapticPhaseHold,
  hapticPhaseRest,
  hapticPhaseBreathe,
  hapticSessionComplete,
} from '../utils/haptics';
import { BREATHE_UP_DURATION } from '../constants/training';

export type SessionTimerStatus = 'idle' | 'running' | 'paused' | 'complete';

export interface SessionTimerState {
  status: SessionTimerStatus;
  phase: TrainingPhase;
  currentRound: number;         // 1-indexed
  totalRounds: number;
  timeRemaining: number;        // seconds
  phaseDuration: number;        // total seconds for current phase
  completedRounds: CompletedRound[];
  totalElapsed: number;         // seconds
  totalHoldTime: number;        // seconds accumulated
  isMaxHold: boolean;
}

export interface SessionTimerControls {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skipPhase: () => void;
}

export function useSessionTimer(table: TrainingTable): [SessionTimerState, SessionTimerControls] {
  const isMaxHold = table.mode === 'MAX';

  function buildInitialState(): SessionTimerState {
    const firstRound = table.rounds[0];
    // MAX hold has a breathe-up phase first; tables go straight to hold
    const initPhase: TrainingPhase = isMaxHold ? 'breathe' : 'hold';
    const initDuration = isMaxHold ? BREATHE_UP_DURATION : firstRound.holdDuration;

    return {
      status: 'idle',
      phase: initPhase,
      currentRound: 1,
      totalRounds: table.rounds.length,
      timeRemaining: initDuration,
      phaseDuration: initDuration,
      completedRounds: [],
      totalElapsed: 0,
      totalHoldTime: 0,
      isMaxHold,
    };
  }

  const [timerState, setTimerState] = useState<SessionTimerState>(buildInitialState);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(timerState);
  stateRef.current = timerState;

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ─── Phase transition logic ─────────────────────────────────────────────────

  const advancePhase = useCallback((currentState: SessionTimerState): SessionTimerState => {
    const { phase, currentRound, totalRounds, completedRounds, totalHoldTime, totalElapsed } = currentState;
    const roundData = table.rounds[currentRound - 1];

    if (phase === 'breathe') {
      // breathe-up → hold (MAX hold mode)
      hapticPhaseHold();
      return {
        ...currentState,
        phase: 'hold',
        timeRemaining: roundData.holdDuration,
        phaseDuration: roundData.holdDuration,
      };
    }

    if (phase === 'hold') {
      const completedRound: CompletedRound = {
        round: currentRound,
        holdDuration: roundData.holdDuration,
        actualHoldDuration: roundData.holdDuration,
        restDuration: roundData.restDuration,
        completedAt: Date.now(),
      };
      const newCompleted = [...completedRounds, completedRound];
      const newTotalHold = totalHoldTime + roundData.holdDuration;

      // Last round or no rest — session complete
      if (currentRound >= totalRounds || roundData.restDuration === 0) {
        hapticSessionComplete();
        return {
          ...currentState,
          status: 'complete',
          phase: 'complete',
          timeRemaining: 0,
          phaseDuration: 0,
          completedRounds: newCompleted,
          totalHoldTime: newTotalHold,
        };
      }

      // Transition to rest
      hapticPhaseRest();
      return {
        ...currentState,
        phase: 'rest',
        timeRemaining: roundData.restDuration,
        phaseDuration: roundData.restDuration,
        completedRounds: newCompleted,
        totalHoldTime: newTotalHold,
      };
    }

    if (phase === 'rest') {
      const nextRound = currentRound + 1;
      const nextRoundData = table.rounds[nextRound - 1];
      hapticPhaseHold();
      return {
        ...currentState,
        phase: 'hold',
        currentRound: nextRound,
        timeRemaining: nextRoundData.holdDuration,
        phaseDuration: nextRoundData.holdDuration,
      };
    }

    return currentState;
  }, [table]);

  // ─── Tick ───────────────────────────────────────────────────────────────────

  const startTick = useCallback(() => {
    clearTick();
    intervalRef.current = setInterval(() => {
      setTimerState((prev) => {
        if (prev.status !== 'running') return prev;

        const newElapsed = prev.totalElapsed + 1;

        if (prev.timeRemaining <= 1) {
          return advancePhase({ ...prev, timeRemaining: 0, totalElapsed: newElapsed });
        }

        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
          totalElapsed: newElapsed,
        };
      });
    }, 1000);
  }, [clearTick, advancePhase]);

  // ─── Controls ───────────────────────────────────────────────────────────────

  const start = useCallback(() => {
    setTimerState((prev) => {
      if (prev.status !== 'idle') return prev;
      if (isMaxHold) hapticPhaseBreathe();
      else hapticPhaseHold();
      return { ...prev, status: 'running' };
    });
    startTick();
  }, [isMaxHold, startTick]);

  const pause = useCallback(() => {
    clearTick();
    setTimerState((prev) => {
      if (prev.status !== 'running') return prev;
      return { ...prev, status: 'paused' };
    });
  }, [clearTick]);

  const resume = useCallback(() => {
    setTimerState((prev) => {
      if (prev.status !== 'paused') return prev;
      return { ...prev, status: 'running' };
    });
    startTick();
  }, [startTick]);

  const reset = useCallback(() => {
    clearTick();
    setTimerState(buildInitialState());
  }, [clearTick]);

  const skipPhase = useCallback(() => {
    setTimerState((prev) => {
      if (prev.status === 'idle' || prev.status === 'complete') return prev;
      return advancePhase({ ...prev, timeRemaining: 0 });
    });
  }, [advancePhase]);

  // ─── Cleanup ────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => clearTick();
  }, [clearTick]);

  // ─── Auto-stop tick when complete ───────────────────────────────────────────

  useEffect(() => {
    if (timerState.status === 'complete') {
      clearTick();
    }
  }, [timerState.status, clearTick]);

  const controls: SessionTimerControls = { start, pause, resume, reset, skipPhase };

  return [timerState, controls];
}
