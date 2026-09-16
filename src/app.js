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

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatMinutes(totalSeconds) {
  const minutes = Math.ceil(totalSeconds / 60);
  return `${minutes} min`;
}

function getWeeks() {
  return [...new Set(window.trainingPlan.map((session) => session.week))];
}

function renderNextWorkout() {
  if (!nextWorkoutContainer) {
    return;
  }

  const nextWorkout = window.trainingPlan[0];
  const totalDuration = window.trainingPlanUtils.getTotalDuration(nextWorkout);
  const runDuration = window.trainingPlanUtils.getRunDuration(nextWorkout);

  nextWorkoutContainer.innerHTML = `
    <div class="card-header">
      <p class="status-label">Siguiente sesion</p>
      <p class="workout-meta">Semana ${nextWorkout.week} · Dia ${nextWorkout.day}</p>
    </div>
    <h2 id="next-workout-title">${nextWorkout.title}</h2>
    <p>${nextWorkout.description}</p>
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

function renderIntervalTimeline(session) {
  return session.intervals.map((current) => (
    `<span class="interval interval-${current.type}" title="${current.label}: ${formatDuration(current.duration)}"></span>`
  )).join('');
}

function renderWorkout(session, isCurrent) {
  const longestRun = window.trainingPlanUtils.getLongestRun(session);
  const currentClass = isCurrent ? ' workout-row-current' : '';
  const nextLabel = isCurrent ? ' · Siguiente' : '';

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
      <button class="button button-secondary" type="button" data-session-key="${session.week}-${session.day}">
        ${isCurrent ? 'Comenzar' : 'Ver sesion'}
      </button>
    </article>
  `;
}

function renderWeeks() {
  if (!weekListContainer) {
    return;
  }

  const weeks = getWeeks();
  const firstSession = window.trainingPlan[0];

  weekListContainer.innerHTML = weeks.map((week) => {
    const sessions = window.trainingPlan.filter((session) => session.week === week);
    const isCurrent = week === firstSession.week;
    const isLocked = week > 4;
    const cardClass = [
      'week-card',
      isCurrent ? 'week-card-current' : '',
      isLocked ? 'week-card-locked' : '',
    ].filter(Boolean).join(' ');
    const status = isCurrent ? '0/3 completadas · En curso' : isLocked ? `Disponible al completar la semana ${week - 1}` : '0/3 completadas';

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
          ${sessions.map((session, index) => renderWorkout(session, isCurrent && index === 0)).join('')}
        </div>
      </details>
    `;
  }).join('');
}

function showScreen(screenId) {
  const targetId = screens.some((screen) => screen.id === screenId) ? screenId : 'home';

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

renderNextWorkout();
renderWeeks();
window.addEventListener('hashchange', handleRouteChange);
handleRouteChange();
