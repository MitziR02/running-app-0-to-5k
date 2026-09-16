/**
 * ============================================================================
 * PROPIEDAD INTELECTUAL Y TÉRMINOS DE USO NO COMERCIAL
 * ============================================================================
 * Copyright (c) 2026 Mitzi Rios. Todos los derechos reservados.
 * 
 * Este código fuente se proporciona exclusivamente con fines educativos,
 * demostrativos y de consulta personal.
 * 
 * QUEDA ESTRICTAMENTE PROHIBIDO:
 * - El uso comercial, venta, sublicenciamiento o monetización de este código.
 * - La inclusión de este código en aplicaciones o servicios con fines de lucro.
 * 
 * NON-COMMERCIAL LICENSE NOTICE:
 * This source code is provided strictly for educational and portfolio purposes.
 * Commercial use, monetization, or distribution for financial gain is NOT allowed.
 * ============================================================================
 */

(function createSessionState(global) {
  const IDLE = 'idle';
  const RUNNING = 'running';
  const PAUSED = 'paused';
  const COMPLETED = 'completed';

  let state = createEmptyState();
  const subscribers = new Set();

  function createEmptyState() {
    return {
      phase: IDLE,
      sessionKey: null,
      intervals: [],
      currentIndex: 0,
      elapsedMilliseconds: 0,
      totalDuration: 0,
      lastUpdatedAt: null,
    };
  }

  function cloneState() {
    return { ...state, intervals: [...state.intervals] };
  }

  function getState() {
    const snapshot = cloneState();
    const currentInterval = snapshot.intervals[snapshot.currentIndex] || null;
    const elapsedSeconds = Math.floor(snapshot.elapsedMilliseconds / 1000);
    const elapsedBeforeCurrent = snapshot.intervals
      .slice(0, snapshot.currentIndex)
      .reduce((total, interval) => total + interval.duration, 0);
    const elapsedInCurrent = Math.max(0, elapsedSeconds - elapsedBeforeCurrent);

    return {
      ...snapshot,
      currentInterval,
      nextInterval: snapshot.intervals[snapshot.currentIndex + 1] || null,
      elapsedSeconds,
      remainingSeconds: currentInterval
        ? Math.max(0, currentInterval.duration - elapsedInCurrent)
        : 0,
      progress: snapshot.totalDuration
        ? Math.min(elapsedSeconds / snapshot.totalDuration, 1)
        : 0,
    };
  }

  function notify() {
    const snapshot = getState();
    subscribers.forEach((subscriber) => subscriber(snapshot));
  }

  function subscribe(subscriber) {
    subscribers.add(subscriber);
    return () => subscribers.delete(subscriber);
  }

  function advance(now) {
    if (state.phase !== RUNNING || state.lastUpdatedAt === null) {
      return;
    }

    state = {
      ...state,
      elapsedMilliseconds: state.elapsedMilliseconds + Math.max(0, now - state.lastUpdatedAt),
      lastUpdatedAt: now,
    };

    if (state.elapsedMilliseconds >= state.totalDuration * 1000) {
      state = {
        ...state,
        phase: COMPLETED,
        elapsedMilliseconds: state.totalDuration * 1000,
        currentIndex: state.intervals.length,
        lastUpdatedAt: null,
      };
      return;
    }

    const elapsedSeconds = Math.floor(state.elapsedMilliseconds / 1000);
    let elapsedBeforeInterval = 0;
    let currentIndex = 0;

    while (
      currentIndex < state.intervals.length
      && elapsedSeconds >= elapsedBeforeInterval + state.intervals[currentIndex].duration
    ) {
      elapsedBeforeInterval += state.intervals[currentIndex].duration;
      currentIndex += 1;
    }

    state = { ...state, currentIndex };
  }

  function configure(sessionKey, intervals) {
    state = {
      ...createEmptyState(),
      sessionKey,
      intervals: intervals.map((interval) => ({ ...interval })),
      totalDuration: intervals.reduce((total, interval) => total + interval.duration, 0),
    };
    notify();
  }

  function start(now = Date.now()) {
    if (state.phase !== IDLE) {
      return;
    }
    state = { ...state, phase: RUNNING, lastUpdatedAt: now };
    notify();
  }

  function pause(now = Date.now()) {
    if (state.phase !== RUNNING) {
      return;
    }
    advance(now);
    if (state.phase === RUNNING) {
      state = { ...state, phase: PAUSED, lastUpdatedAt: null };
    }
    notify();
  }

  function resume(now = Date.now()) {
    if (state.phase !== PAUSED) {
      return;
    }
    state = { ...state, phase: RUNNING, lastUpdatedAt: now };
    notify();
  }

  function tick(now = Date.now()) {
    if (state.phase !== RUNNING) {
      return;
    }
    advance(now);
    notify();
  }

  function reset() {
    state = createEmptyState();
    notify();
  }

  global.sessionState = Object.freeze({
    phases: Object.freeze({ IDLE, RUNNING, PAUSED, COMPLETED }),
    getState,
    subscribe,
    configure,
    start,
    pause,
    resume,
    tick,
    reset,
  });
})(window);