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

(function createMetricsUtils(global) {
  function normalizeHistory(history) {
    return Array.isArray(history) ? history.filter((entry) => entry && entry.completedAt) : [];
  }

  function sortHistoryByDate(history) {
    return [...normalizeHistory(history)].sort((left, right) => (
      new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime()
    ));
  }

  function formatDateLabel(value) {
    if (!value) {
      return 'Sin fecha';
    }

    const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00`)
      : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Sin fecha';
    }

    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  function getStateMetrics(state, workoutService = global.workoutService, totalSessions = 24) {
    const completedSessions = Array.isArray(state.completedSessions) ? state.completedSessions : [];
    const uniqueCompleted = new Set(completedSessions).size;
    const history = sortHistoryByDate(state.history);
    const totalHistorySessions = history.length;
    const totalSeconds = history.reduce((total, entry) => total + Number(entry.duration || 0), 0);
    const rpeValues = history
      .map((entry) => Number(entry.rpe))
      .filter((value) => Number.isFinite(value) && value >= 1 && value <= 10);
    const averageRpe = rpeValues.length
      ? Number((rpeValues.reduce((total, current) => total + current, 0) / rpeValues.length).toFixed(1))
      : null;

    const currentWeek = typeof workoutService?.getUnlockedWeek === 'function'
      ? workoutService.getUnlockedWeek(state)
      : 1;
    const currentWeekCount = typeof workoutService?.getCompletedCountForWeek === 'function'
      ? workoutService.getCompletedCountForWeek(currentWeek, state)
      : Math.min(uniqueCompleted, 3);
    const totalProgressPercent = totalSessions > 0
      ? Math.min(Math.round((uniqueCompleted / totalSessions) * 100), 100)
      : 0;
    const currentWeekPercent = 3 > 0
      ? Math.min(Math.round((currentWeekCount / 3) * 100), 100)
      : 0;

    return {
      completedUnique: uniqueCompleted,
      totalHistorySessions,
      totalSeconds,
      averageRpe,
      currentWeek,
      currentWeekCount,
      totalProgressPercent,
      currentWeekPercent,
      history,
    };
  }

  const api = Object.freeze({
    formatDateLabel,
    sortHistoryByDate,
    getStateMetrics,
  });

  global.metricsUtils = api;

  if (typeof module !== 'undefined') {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
