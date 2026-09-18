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

const screens = [...document.querySelectorAll('.screen')];
const navigationItems = [...document.querySelectorAll('.navigation-item')];
const nextWorkoutContainer = document.querySelector('#next-workout');
const weekListContainer = document.querySelector('#week-list');
const appState = window.appState;
const workoutService = window.workoutService;
const sessionState = window.sessionState;

const stateElements = {
  homeWeekProgressLabel: document.querySelector('#home-week-progress-label'),
  homeCompletedCount: document.querySelector('#home-completed-count'),
  homeTotalTime: document.querySelector('#home-total-time'),
  homeAverageRpe: document.querySelector('#home-average-rpe'),
  planProgressLabel: document.querySelector('#plan-progress-label'),
  progressCompletedCount: document.querySelector('#progress-completed-count'),
  progressCurrentWeek: document.querySelector('#progress-current-week'),
  progressTotalTime: document.querySelector('#progress-total-time'),
  progressAverageRpe: document.querySelector('#progress-average-rpe'),
  agendaForm: document.querySelector('#agenda-form'),
  agendaDays: [...document.querySelectorAll('[name="agenda-day"]')],
  agendaStartDate: document.querySelector('#agenda-start-date'),
  agendaStreak: document.querySelector('#agenda-streak'),
  agendaNextLabel: document.querySelector('#agenda-next-label'),
  agendaFormMessage: document.querySelector('#agenda-form-message'),
  backupFileInput: document.querySelector('#backup-file-input'),
  backupMessage: document.querySelector('#backup-message'),
  historyEmptyState: document.querySelector('#history-empty-state'),
  historyList: document.querySelector('#history-list'),
  sessionMeta: document.querySelector('#session-meta'),
  sessionTitle: document.querySelector('#session-title'),
  timerPhase: document.querySelector('#timer-phase'),
  timerValue: document.querySelector('#timer-value'),
  timerNext: document.querySelector('#timer-next'),
  sessionToggle: document.querySelector('#session-toggle'),
  sessionElapsed: document.querySelector('#session-elapsed'),
  sessionProgress: document.querySelector('.session-progress-fill'),
  completeMeta: document.querySelector('#complete-meta'),
  completeDuration: document.querySelector('#complete-duration'),
  completeRunDuration: document.querySelector('#complete-run-duration'),
  completeIntervalCount: document.querySelector('#complete-interval-count'),
  saveSession: document.querySelector('#save-session'),
  rpeOptions: [...document.querySelectorAll('[data-rpe]')],
  progressBars: [...document.querySelectorAll('.progress-bar')],
};

let timerInterval = null;
let selectedRpe = null;

const formatDuration = window.timeUtils.formatDuration;

function formatMinutes(totalSeconds) {
  const minutes = Math.ceil(totalSeconds / 60);
  return `${minutes} min`;
}

function getWeeks() {
  return [...new Set(window.trainingPlan.map((session) => session.week))];
}

function getTodayDateKey() {
  return window.datesUtils.toDateKey(new Date());
}

function renderAgenda(state) {
  const { agenda } = state;
  const isConfigured = agenda.days.length === 3 && agenda.startDate;
  const nextWorkout = workoutService.getNextSession(state);
  const nextIndex = nextWorkout ? window.trainingPlan.indexOf(nextWorkout) : -1;
  const nextDate = isConfigured && nextIndex >= 0
    ? window.datesUtils.getSessionScheduledDate(agenda, nextIndex)
    : null;

  stateElements.agendaDays.forEach((input) => {
    input.checked = agenda.days.includes(Number(input.value));
  });
  updateAgendaDayAvailability();
  stateElements.agendaStartDate.value = agenda.startDate || '';
  const streak = isConfigured ? window.datesUtils.getStreak(agenda, state.history) : 0;
  stateElements.agendaStreak.textContent = `${streak} ${streak === 1 ? 'dia' : 'dias'}`;

  if (!isConfigured) {
    stateElements.agendaNextLabel.textContent = 'Configura tres dias para organizar tus sesiones.';
  } else if (!nextDate) {
    stateElements.agendaNextLabel.textContent = 'Plan completado. Puedes mantener la rutina repitiendo sesiones.';
  } else {
    const overdue = nextDate.dateKey < getTodayDateKey();
    stateElements.agendaNextLabel.textContent = overdue
      ? `Sesion atrasada desde el ${window.metricsUtils.formatDateLabel(nextDate.dateKey)}.`
      : `Proxima sesion programada: ${window.metricsUtils.formatDateLabel(nextDate.dateKey)}.`;
  }
}

function updateAgendaDayAvailability() {
  const selectedCount = stateElements.agendaDays.filter((input) => input.checked).length;
  stateElements.agendaDays.forEach((input) => {
    input.disabled = selectedCount >= 3 && !input.checked;
  });
}

function renderStats(state) {
  const metrics = window.metricsUtils.getStateMetrics(state, workoutService, 24);
  const completedCount = metrics.completedUnique;

  if (stateElements.homeWeekProgressLabel) {
    stateElements.homeWeekProgressLabel.textContent = `${metrics.currentWeekCount}/3 sesiones`;
  }
  if (stateElements.homeCompletedCount) {
    stateElements.homeCompletedCount.innerHTML = `${completedCount} <span>/ 24</span>`;
  }
  if (stateElements.homeTotalTime) {
    stateElements.homeTotalTime.textContent = metrics.totalSeconds ? formatMinutes(metrics.totalSeconds) : '--';
  }
  if (stateElements.homeAverageRpe) {
    stateElements.homeAverageRpe.innerHTML = metrics.averageRpe ? `${metrics.averageRpe} <span>/ 10</span>` : '-- <span>/ 10</span>';
  }
  if (stateElements.planProgressLabel) {
    stateElements.planProgressLabel.textContent = `${completedCount}/24 sesiones`;
  }
  if (stateElements.progressCompletedCount) {
    stateElements.progressCompletedCount.innerHTML = `${completedCount} <span>/ 24</span>`;
  }
  if (stateElements.progressCurrentWeek) {
    stateElements.progressCurrentWeek.innerHTML = `${metrics.currentWeek} <span>/ 8</span>`;
  }
  if (stateElements.progressTotalTime) {
    stateElements.progressTotalTime.innerHTML = `${Math.floor(metrics.totalSeconds / 60)} <span>min</span>`;
  }
  if (stateElements.progressAverageRpe) {
    stateElements.progressAverageRpe.textContent = metrics.averageRpe || '--';
  }
  stateElements.progressBars.forEach((progressBar, index) => {
    const maximum = Number(progressBar.getAttribute('aria-valuemax'));
    const value = index === 0 ? metrics.currentWeekCount : completedCount;
    const percentage = maximum ? Math.min((value / maximum) * 100, 100) : 0;
    const fill = progressBar.querySelector('.progress-bar-fill');

    progressBar.setAttribute('aria-valuenow', value.toString());
    progressBar.setAttribute('aria-valuetext', `${percentage.toFixed(0)}%`);
    if (fill) {
      fill.style.width = `${percentage}%`;
    }
  });

  const history = metrics.history;
  const showHistoryEmpty = history.length === 0;
  const isPlanCompleted = completedCount >= 24;

  if (stateElements.historyEmptyState) {
    stateElements.historyEmptyState.hidden = !showHistoryEmpty && !isPlanCompleted;
    stateElements.historyEmptyState.textContent = showHistoryEmpty
      ? 'Aun no hay sesiones registradas.'
      : 'Plan completado. Puedes repetir cualquier sesion desde el plan.';
  }

  if (stateElements.historyList) {
    stateElements.historyList.innerHTML = history.map((entry) => {
      const session = window.trainingPlan.find((current) => (
        workoutService.getSessionKey(current) === entry.sessionKey
      ));
      const sessionTitle = session ? `${session.week}-${session.day} · ${session.title}` : entry.sessionKey;
      const rpeLabel = Number.isInteger(entry.rpe) ? `RPE ${entry.rpe}` : 'Sin RPE';
      const dateLabel = window.metricsUtils.formatDateLabel(entry.completedAt);

      return `
        <article class="history-entry">
          <div class="history-entry-header">
            <strong>${dateLabel}</strong>
            <span>${rpeLabel}</span>
          </div>
          <div class="history-entry-body">
            <span>${sessionTitle}</span>
            <span>${formatMinutes(entry.duration || 0)}</span>
          </div>
        </article>
      `;
    }).join('');
  }
}

function renderNextWorkout(state) {
  if (!nextWorkoutContainer) {
    return;
  }

  const nextWorkout = workoutService.getNextSession(state);

  if (!nextWorkout) {
    nextWorkoutContainer.innerHTML = `
      <p class="status-label">Plan completado</p>
      <h2 id="next-workout-title">Has llegado a los 5 km.</h2>
      <p>Has completado todas las sesiones del plan. Puedes repetir cualquier entrenamiento desde la vista del plan.</p>
    `;
    return;
  }

  const totalDuration = window.trainingPlanUtils.getTotalDuration(nextWorkout);
  const runDuration = window.trainingPlanUtils.getRunDuration(nextWorkout);
  const nextIndex = window.trainingPlan.indexOf(nextWorkout);
  const scheduledDate = state.agenda.days.length === 3
    ? window.datesUtils.getSessionScheduledDate(state.agenda, nextIndex)
    : null;
  const scheduledLabel = scheduledDate
    ? `<p class="agenda-next-label">Sesion programada: ${window.metricsUtils.formatDateLabel(scheduledDate.dateKey)}</p>`
    : '';

  nextWorkoutContainer.innerHTML = `
    <div class="card-header">
      <p class="status-label">Siguiente sesion</p>
      <p class="workout-meta">Semana ${nextWorkout.week} · Dia ${nextWorkout.day}</p>
    </div>
    <h2 id="next-workout-title">${nextWorkout.title}</h2>
    <p>${nextWorkout.description}</p>
    ${scheduledLabel}
    <dl class="workout-summary">
      <div>
        <dt>Duracion</dt>
        <dd>${formatMinutes(totalDuration)}</dd>
      </div>
      <div>
        <dt>Intervalos</dt>
        <dd>${nextWorkout.intervals.length}</dd>
      </div>
      <div>
        <dt>Tiempo de carrera</dt>
        <dd>${formatDuration(runDuration)}</dd>
      </div>
    </dl>
    <button class="button button-primary" type="button" data-session-key="${nextWorkout.week}-${nextWorkout.day}">
      Iniciar sesion
    </button>
  `;
}

function renderActiveSession(state) {
  const session = window.trainingPlan.find((current) => (
    workoutService.getSessionKey(current) === state.activeSessionKey
  ));

  if (!session) {
    return;
  }

  stateElements.sessionMeta.textContent = `Semana ${session.week} · Dia ${session.day}`;
  stateElements.sessionTitle.textContent = session.title;
}

function getActiveSession() {
  const activeSessionKey = appState.getState().activeSessionKey;
  return window.trainingPlan.find((session) => (
    workoutService.getSessionKey(session) === activeSessionKey
  )) || null;
}

function renderSessionState(timerState) {
  const session = getActiveSession();

  if (!session || !stateElements.timerValue) {
    return;
  }

  const currentInterval = timerState.currentInterval;
  const nextInterval = timerState.nextInterval;
  const phaseLabel = currentInterval ? currentInterval.label : 'Sesion completada';
  const nextLabel = nextInterval
    ? `Siguiente: ${nextInterval.label.toLowerCase()} · ${formatDuration(nextInterval.duration)}`
    : 'Has completado todos los intervalos.';
  const buttonLabels = {
    idle: 'Iniciar sesion',
    running: 'Pausar sesion',
    paused: 'Reanudar sesion',
    completed: 'Sesion completada',
  };

  stateElements.timerPhase.textContent = phaseLabel;
  stateElements.timerPhase.dataset.phase = currentInterval ? currentInterval.type : 'completed';
  stateElements.timerValue.textContent = formatDuration(timerState.remainingSeconds);
  stateElements.timerValue.dateTime = `PT${timerState.remainingSeconds}S`;
  stateElements.timerNext.textContent = nextLabel;
  stateElements.sessionProgress.style.width = `${timerState.progress * 100}%`;
  stateElements.sessionElapsed.textContent = `Tiempo transcurrido: ${formatDuration(timerState.elapsedSeconds)} / ${formatMinutes(timerState.totalDuration)}`;
  stateElements.sessionToggle.textContent = buttonLabels[timerState.phase];
  stateElements.sessionToggle.dataset.phase = timerState.phase;
  stateElements.sessionToggle.dataset.action = timerState.phase === 'completed'
    ? 'completed-session'
    : timerState.phase === 'running'
      ? 'pause-session'
      : timerState.phase === 'paused'
        ? 'resume-session'
        : 'start-session';
  stateElements.sessionToggle.disabled = timerState.phase === 'completed';

  if (timerState.phase === sessionState.phases.COMPLETED && window.location.hash !== '#complete') {
    renderCompletion(timerState);
    window.location.hash = 'complete';
  }
}

function renderCompletion(timerState) {
  const session = window.trainingPlan.find((current) => (
    workoutService.getSessionKey(current) === timerState.sessionKey
  ));

  if (!session) {
    return;
  }

  selectedRpe = null;
  stateElements.completeMeta.textContent = `Semana ${session.week} · Dia ${session.day} · ${session.title}`;
  stateElements.completeDuration.textContent = formatDuration(timerState.elapsedSeconds);
  stateElements.completeRunDuration.textContent = formatDuration(window.trainingPlanUtils.getRunDuration(session));
  stateElements.completeIntervalCount.textContent = session.intervals.length.toString();
  stateElements.saveSession.disabled = true;
  stateElements.rpeOptions.forEach((option) => option.setAttribute('aria-pressed', 'false'));
}

function handleRpeSelection(trigger) {
  selectedRpe = Number(trigger.dataset.rpe);
  stateElements.rpeOptions.forEach((option) => {
    option.setAttribute('aria-pressed', option === trigger ? 'true' : 'false');
  });
  stateElements.saveSession.disabled = false;
}

function saveCompletedSession() {
  const timerState = sessionState.getState();
  const session = window.trainingPlan.find((current) => (
    workoutService.getSessionKey(current) === timerState.sessionKey
  ));

  if (!session || timerState.phase !== sessionState.phases.COMPLETED || selectedRpe === null) {
    return;
  }

  appState.completeSession(timerState.sessionKey, {
    duration: timerState.elapsedSeconds,
    runDuration: window.trainingPlanUtils.getRunDuration(session),
    rpe: selectedRpe,
  });
  sessionState.reset();
  selectedRpe = null;
  window.location.hash = 'progress';
}

function syncTimerLoop(timerState) {
  if (timerState.phase === sessionState.phases.RUNNING && timerInterval === null) {
    timerInterval = window.setInterval(() => sessionState.tick(), 250);
  }

  if (timerState.phase !== sessionState.phases.RUNNING && timerInterval !== null) {
    window.clearInterval(timerInterval);
    timerInterval = null;
  }
}

function renderIntervalTimeline(session) {
  return session.intervals.map((current) => (
    `<span class="interval interval-${current.type}" title="${current.label}: ${formatDuration(current.duration)}"></span>`
  )).join('');
}

function renderWorkout(session, state, isCurrent, isLocked) {
  const longestRun = window.trainingPlanUtils.getLongestRun(session);
  const currentClass = isCurrent ? ' workout-row-current' : '';
  const sessionKey = workoutService.getSessionKey(session);
  const isCompleted = state.completedSessions.includes(sessionKey);
  const nextLabel = isCurrent ? ' · Siguiente' : '';
  const buttonLabel = isLocked ? 'Bloqueada' : isCompleted ? 'Repetir' : isCurrent ? 'Comenzar' : 'Ver sesion';
  const disabled = isLocked ? ' disabled' : '';

  return `
    <article class="workout-row${currentClass}">
      <div class="workout-row-content">
        <p class="workout-day">Dia ${session.day}${nextLabel}</p>
        <h3>${session.title}</h3>
        <p>${formatMinutes(window.trainingPlanUtils.getTotalDuration(session))} · Carrera mas larga: ${formatDuration(longestRun)}</p>
        <div class="interval-timeline" aria-label="Intervalos de ${session.title}">
          ${renderIntervalTimeline(session)}
        </div>
      </div>
      <button class="button button-secondary" type="button" data-session-key="${sessionKey}"${disabled}>
        ${buttonLabel}
      </button>
    </article>
  `;
}

function renderWeeks(state) {
  if (!weekListContainer) {
    return;
  }

  const weeks = getWeeks();
  weekListContainer.innerHTML = weeks.map((week) => {
    const sessions = window.trainingPlan.filter((session) => session.week === week);
    const weekStatus = workoutService.getWeekStatus(week, state);
    const isCurrent = weekStatus.current;
    const isLocked = !weekStatus.unlocked;
    const cardClass = [
      'week-card',
      isCurrent ? 'week-card-current' : '',
      isLocked ? 'week-card-locked' : '',
    ].filter(Boolean).join(' ');
    const status = isLocked
      ? `Disponible al completar la semana ${week - 1}`
      : isCurrent
        ? `${weekStatus.completed}/3 completadas · En curso`
        : `${weekStatus.completed}/3 completadas`;

    return `
      <details class="${cardClass}"${isCurrent ? ' open' : ''}>
        <summary class="week-card-toggle">
          <span class="week-number">${week}</span>
          <span class="week-card-title">
            <strong>Semana ${week}</strong>
            <small>${status}</small>
          </span>
          <span class="week-card-indicator" aria-hidden="true"></span>
        </summary>
        <div class="week-sessions">
          ${sessions.map((session, index) => renderWorkout(session, state, isCurrent && index === 0, isLocked)).join('')}
        </div>
      </details>
    `;
  }).join('');
}

function showScreen(screenId) {
  const requestedId = screens.some((screen) => screen.id === screenId) ? screenId : 'home';
  const targetId = requestedId === 'session' && !appState.getState().activeSessionKey ? 'home' : requestedId;

  screens.forEach((screen) => {
    const isVisible = screen.id === targetId;
    screen.hidden = !isVisible;
  });

  navigationItems.forEach((item) => {
    const isActive = item.getAttribute('href') === `#${targetId}`;
    item.classList.toggle('navigation-item-active', isActive);
    item.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

function handleRouteChange() {
  showScreen(window.location.hash.slice(1));
}

function handleSessionSelection(event) {
  const trigger = event.target.closest('[data-session-key]');

  if (!trigger || trigger.disabled) {
    return;
  }

  const session = window.trainingPlan.find((current) => (
    workoutService.getSessionKey(current) === trigger.dataset.sessionKey
  ));

  if (!session) {
    return;
  }

  appState.setActiveSession(trigger.dataset.sessionKey);
  sessionState.configure(trigger.dataset.sessionKey, session.intervals);
  window.location.hash = 'session';
}

function showBackupMessage(message, isError = false) {
  if (!stateElements.backupMessage) {
    return;
  }

  stateElements.backupMessage.hidden = !message;
  stateElements.backupMessage.textContent = message;
  stateElements.backupMessage.dataset.status = isError ? 'error' : 'success';
}

function exportBackup() {
  const content = window.storageService.serializeBackup(appState.getState());
  if (!content) {
    showBackupMessage('No se pudo preparar el respaldo.', true);
    return;
  }

  const today = window.datesUtils.toDateKey(new Date());
  const blob = new Blob([content], { type: 'application/json' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `running-app-0-to-5k-backup-${today}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
  showBackupMessage('Respaldo exportado correctamente.');
}

function getBackupErrorMessage(errorCode) {
  const messages = {
    json: 'El archivo no contiene un JSON valido.',
    backupVersion: 'El archivo no es un respaldo compatible.',
    version: 'La version del estado no es compatible.',
    completedSessions: 'El respaldo contiene sesiones invalidas.',
    history: 'El respaldo contiene un historial invalido.',
    agenda: 'El respaldo contiene una agenda invalida.',
  };
  return messages[errorCode] || 'No se pudo validar el respaldo.';
}

async function importBackup(file) {
  if (!file) {
    return;
  }

  try {
    const result = window.storageService.parseBackup(await file.text());
    if (!result.valid) {
      showBackupMessage(getBackupErrorMessage(result.error), true);
      return;
    }

    if (!window.confirm('El respaldo reemplazara el progreso actual. Esta accion no se puede deshacer.')) {
      showBackupMessage('Importacion cancelada.');
      return;
    }

    sessionState.reset();
    if (!appState.restore(result.state)) {
      showBackupMessage('No se pudo restaurar el respaldo.', true);
      return;
    }

    showBackupMessage('Respaldo importado correctamente.');
    window.location.hash = 'progress';
  } catch (error) {
    showBackupMessage('No se pudo leer el archivo de respaldo.', true);
  } finally {
    stateElements.backupFileInput.value = '';
  }
}

function handleSessionAction(event) {
  const trigger = event.target.closest('[data-action]');

  if (!trigger) {
    return;
  }

  const action = trigger.dataset.action;

  if (action === 'select-rpe') {
    handleRpeSelection(trigger);
  } else if (action === 'save-session') {
    saveCompletedSession();
  } else if (action === 'export-backup') {
    exportBackup();
  } else if (action === 'import-backup') {
    stateElements.backupFileInput.click();
  } else if (action === 'reset-progress') {
    if (window.confirm('Se borrara todo el progreso y el historial. Esta accion no se puede deshacer.')) {
      sessionState.reset();
      appState.reset();
      window.location.hash = 'home';
    }
  } else if (action === 'exit-session') {
    sessionState.reset();
    appState.setActiveSession(null);
    window.location.hash = 'home';
  } else if (action === 'start-session') {
    sessionState.start();
  } else if (action === 'pause-session') {
    sessionState.pause();
  } else if (action === 'resume-session') {
    sessionState.resume();
  }
}

function handleAgendaSubmit(event) {
  if (event.target !== stateElements.agendaForm) {
    return;
  }

  event.preventDefault();
  const days = stateElements.agendaDays
    .filter((input) => input.checked)
    .map((input) => Number(input.value));
  const startDate = stateElements.agendaStartDate.value;
  const message = stateElements.agendaFormMessage;

  if (days.length !== 3 || !window.datesUtils.parseDateKey(startDate)) {
    message.hidden = false;
    message.textContent = 'Selecciona exactamente tres dias y una fecha de inicio valida.';
    return;
  }

  appState.setAgenda(days, startDate);
  message.hidden = true;
}

function handleAgendaDayChange(event) {
  if (event.target.matches('[name="agenda-day"]')) {
    updateAgendaDayAvailability();
  }
}

function handleBackupFileChange(event) {
  if (event.target === stateElements.backupFileInput) {
    importBackup(event.target.files[0]);
  }
}

function render(state) {
  renderStats(state);
  renderAgenda(state);
  renderNextWorkout(state);
  renderWeeks(state);
  renderActiveSession(state);
}

document.addEventListener('click', handleSessionSelection);
document.addEventListener('click', handleSessionAction);
document.addEventListener('change', handleAgendaDayChange);
document.addEventListener('change', handleBackupFileChange);
document.addEventListener('submit', handleAgendaSubmit);
appState.subscribe(render);
sessionState.subscribe((timerState) => {
  renderSessionState(timerState);
  syncTimerLoop(timerState);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .catch(() => {
        // PWA support is optional; the application remains usable without it.
      });
  });
}
render(appState.getState());
renderSessionState(sessionState.getState());
window.addEventListener('hashchange', handleRouteChange);
handleRouteChange();
