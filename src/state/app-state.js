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

(function createAppState(global) {
  const initialState = {
    version: 1,
    completedSessions: [],
    history: [],
    agenda: {
      days: [],
      startDate: null,
    },
    activeSessionKey: null,
  };

  let state = createState(global.storageService ? global.storageService.load() : null);
  const subscribers = new Set();

  function createState(savedState = null) {
    return {
      ...initialState,
      completedSessions: savedState ? [...savedState.completedSessions] : [],
      history: savedState ? [...savedState.history] : [],
      agenda: savedState
        ? { ...savedState.agenda, days: [...savedState.agenda.days] }
        : { ...initialState.agenda },
    };
  }

  function cloneState() {
    return {
      ...state,
      completedSessions: [...state.completedSessions],
      history: [...state.history],
      agenda: { ...state.agenda, days: [...state.agenda.days] },
    };
  }

  function notify() {
    const snapshot = cloneState();
    subscribers.forEach((subscriber) => subscriber(snapshot));
  }

  function persist() {
    if (global.storageService) {
      global.storageService.save(state);
    }
  }

  function getState() {
    return cloneState();
  }

  function subscribe(subscriber) {
    subscribers.add(subscriber);
    return () => subscribers.delete(subscriber);
  }

  function setActiveSession(sessionKey) {
    state = { ...state, activeSessionKey: sessionKey };
    notify();
  }

  function setAgenda(days, startDate) {
    const uniqueDays = Array.isArray(days)
      ? [...new Set(days)].sort((left, right) => left - right)
      : [];
    if (
      uniqueDays.length !== 3
      || uniqueDays.some((day) => !Number.isInteger(day) || day < 0 || day > 6)
      || !global.datesUtils.parseDateKey(startDate)
    ) {
      return false;
    }

    state = {
      ...state,
      agenda: { days: uniqueDays, startDate },
    };
    persist();
    notify();
    return true;
  }

  function completeSession(sessionKey, details) {
    const completedSessions = state.completedSessions.includes(sessionKey)
      ? state.completedSessions
      : [...state.completedSessions, sessionKey];
    const entry = { sessionKey, completedAt: new Date().toISOString(), ...details };

    state = {
      ...state,
      completedSessions,
      history: [...state.history, entry],
      activeSessionKey: null,
    };
    persist();
    notify();
  }

  function restore(savedState) {
    const validatedState = global.storageService
      ? global.storageService.validateState(savedState)
      : null;

    if (!validatedState) {
      return false;
    }

    state = createState(validatedState);
    persist();
    notify();
    return true;
  }

  function reset() {
    state = createState();
    if (global.storageService) {
      global.storageService.clear();
    }
    notify();
  }

  global.appState = Object.freeze({
    getState,
    subscribe,
    setActiveSession,
    setAgenda,
    completeSession,
    restore,
    reset,
  });
})(window);
