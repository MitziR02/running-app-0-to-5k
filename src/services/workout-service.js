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

(function createWorkoutService(global) {
  function getSessionKey(session) {
    return `${session.week}-${session.day}`;
  }

  function getCompletedKeys(state) {
    return new Set(state.completedSessions);
  }

  function getCompletedCountForWeek(week, state) {
    const completedKeys = getCompletedKeys(state);
    return global.trainingPlan.filter((session) => session.week === week)
      .filter((session) => completedKeys.has(getSessionKey(session))).length;
  }

  function getUnlockedWeek(state) {
    const weeks = [...new Set(global.trainingPlan.map((session) => session.week))];
    return weeks.find((week) => getCompletedCountForWeek(week, state) < 3) || weeks[weeks.length - 1];
  }

  function isWeekUnlocked(week, state) {
    return week <= getUnlockedWeek(state);
  }

  function getNextSession(state) {
    const completedKeys = getCompletedKeys(state);
    return global.trainingPlan.find((session) => (
      isWeekUnlocked(session.week, state) && !completedKeys.has(getSessionKey(session))
    )) || null;
  }

  function isSessionAvailable(session, state) {
    if (!session || !isWeekUnlocked(session.week, state)) {
      return false;
    }

    const completedKeys = getCompletedKeys(state);
    if (completedKeys.has(getSessionKey(session))) {
      return true;
    }

    const previousSession = global.trainingPlan.find((candidate) => (
      candidate.week === session.week && candidate.day === session.day - 1
    ));

    return !previousSession || completedKeys.has(getSessionKey(previousSession));
  }

  function getWeekStatus(week, state) {
    const completed = getCompletedCountForWeek(week, state);
    const unlocked = isWeekUnlocked(week, state);
    const current = week === getUnlockedWeek(state);

    return { completed, unlocked, current };
  }

  global.workoutService = Object.freeze({
    getSessionKey,
    getCompletedCountForWeek,
    getUnlockedWeek,
    isWeekUnlocked,
    getNextSession,
    isSessionAvailable,
    getWeekStatus,
  });
})(window);
