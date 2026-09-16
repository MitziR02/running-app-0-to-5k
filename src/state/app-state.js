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

  let state = createState();
  const subscribers = new Set();

  function createState() {
    return {
      ...initialState,
      completedSessions: [],
      history: [],
      agenda: { ...initialState.agenda },
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
    notify();
  }

  function reset() {
    state = createState();
    notify();
  }

  global.appState = Object.freeze({
    getState,
    subscribe,
    setActiveSession,
    completeSession,
    reset,
  });
})(window);
