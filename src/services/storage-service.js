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

(function createStorageService(global) {
  const STORAGE_KEY = 'running-app-0-to-5k-state';
  const VERSION = 1;
  const BACKUP_VERSION = 1;

  function createEmptyState() {
    return {
      version: VERSION,
      completedSessions: [],
      history: [],
      agenda: { days: [], startDate: null },
      activeSessionKey: null,
    };
  }

  function getValidSessionKeys() {
    return new Set(global.trainingPlan.map((session) => `${session.week}-${session.day}`));
  }

  function isValidDate(value) {
    return typeof value === 'string' && !Number.isNaN(Date.parse(value));
  }

  function isValidDateKey(value) {
    return typeof value === 'string'
      && /^\d{4}-\d{2}-\d{2}$/.test(value)
      && !Number.isNaN(Date.parse(`${value}T00:00:00`));
  }

  function validateState(candidate) {
    if (!candidate || candidate.version !== VERSION) {
      return null;
    }

    const validSessionKeys = getValidSessionKeys();
    const completedSessions = Array.isArray(candidate.completedSessions)
      ? candidate.completedSessions.filter((key) => validSessionKeys.has(key))
      : null;
    const history = Array.isArray(candidate.history)
      ? candidate.history.filter((entry) => (
        entry
        && validSessionKeys.has(entry.sessionKey)
        && isValidDate(entry.completedAt)
        && Number.isFinite(entry.duration)
        && entry.duration >= 0
        && Number.isFinite(entry.runDuration)
        && entry.runDuration >= 0
        && Number.isInteger(entry.rpe)
        && entry.rpe >= 1
        && entry.rpe <= 10
      ))
      : null;
    const agenda = candidate.agenda;
    const days = agenda && Array.isArray(agenda.days)
      ? [...new Set(agenda.days)].filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
      : null;

    if (!completedSessions || !history || !days || (days.length !== 0 && days.length !== 3)) {
      return null;
    }

    const startDate = agenda.startDate === null || isValidDateKey(agenda.startDate) ? agenda.startDate : null;
    if (days.length === 3 && !startDate) {
      return null;
    }

    return {
      version: VERSION,
      completedSessions: [...new Set(completedSessions)],
      history,
      agenda: {
        days,
        startDate,
      },
      activeSessionKey: null,
    };
  }

  function validateImportedState(candidate) {
    if (!candidate || candidate.version !== VERSION) {
      return { valid: false, error: 'version' };
    }

    const validSessionKeys = getValidSessionKeys();
    if (!Array.isArray(candidate.completedSessions)
      || candidate.completedSessions.some((key) => !validSessionKeys.has(key))) {
      return { valid: false, error: 'completedSessions' };
    }

    if (!Array.isArray(candidate.history) || candidate.history.some((entry) => (
      !entry
      || !validSessionKeys.has(entry.sessionKey)
      || !isValidDate(entry.completedAt)
      || !Number.isFinite(entry.duration)
      || entry.duration < 0
      || !Number.isFinite(entry.runDuration)
      || entry.runDuration < 0
      || !Number.isInteger(entry.rpe)
      || entry.rpe < 1
      || entry.rpe > 10
    ))) {
      return { valid: false, error: 'history' };
    }

    const agenda = candidate.agenda;
    if (!agenda || !Array.isArray(agenda.days)
      || new Set(agenda.days).size !== agenda.days.length
      || agenda.days.some((day) => !Number.isInteger(day) || day < 0 || day > 6)
      || (agenda.days.length !== 0 && agenda.days.length !== 3)
      || !(agenda.startDate === null || isValidDateKey(agenda.startDate))
      || (agenda.days.length === 3 && !agenda.startDate)) {
      return { valid: false, error: 'agenda' };
    }

    return { valid: true, state: validateState(candidate) };
  }

  function createBackup(state) {
    const validatedState = validateState(state);
    if (!validatedState) {
      return null;
    }

    return {
      backupVersion: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      state: validatedState,
    };
  }

  function serializeBackup(state) {
    const backup = createBackup(state);
    return backup ? JSON.stringify(backup, null, 2) : null;
  }

  function parseBackup(rawBackup) {
    let candidate;

    try {
      candidate = typeof rawBackup === 'string' ? JSON.parse(rawBackup) : rawBackup;
    } catch (error) {
      return { valid: false, error: 'json' };
    }

    if (!candidate || candidate.backupVersion !== BACKUP_VERSION || !isValidDate(candidate.exportedAt)) {
      return { valid: false, error: 'backupVersion' };
    }

    const result = validateImportedState(candidate.state);
    return result.valid ? { valid: true, state: result.state } : result;
  }

  function load() {
    try {
      const rawState = global.localStorage.getItem(STORAGE_KEY);
      return rawState ? validateState(JSON.parse(rawState)) || createEmptyState() : createEmptyState();
    } catch (error) {
      return createEmptyState();
    }
  }

  function save(state) {
    try {
      const validatedState = validateState({ ...state, activeSessionKey: null });
      if (!validatedState) {
        return false;
      }
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(validatedState));
      return true;
    } catch (error) {
      return false;
    }
  }

  function clear() {
    try {
      global.localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      return false;
    }
  }

  global.storageService = Object.freeze({
    STORAGE_KEY,
    VERSION,
    BACKUP_VERSION,
    createEmptyState,
    validateState,
    validateImportedState,
    createBackup,
    serializeBackup,
    parseBackup,
    load,
    save,
    clear,
  });
})(window);