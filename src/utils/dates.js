(function createDatesUtils(global) {
  const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

  function toDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseDateKey(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return null;
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
      ? date
      : null;
  }

  function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  }

  function getScheduledDates(agenda, fromDate = new Date(), count = 14) {
    const startDate = parseDateKey(agenda?.startDate);
    const days = Array.isArray(agenda?.days) ? agenda.days : [];

    if (!startDate || days.length !== 3 || count <= 0) {
      return [];
    }

    const dates = [];
    const cursor = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    const firstDate = cursor < startDate ? startDate : cursor;

    for (let offset = 0; dates.length < count && offset < 366; offset += 1) {
      const date = addDays(firstDate, offset);
      if (days.includes(date.getDay())) {
        dates.push({ date, dateKey: toDateKey(date), day: date.getDay() });
      }
    }

    return dates;
  }

  function getSessionScheduledDate(agenda, sessionIndex) {
    const startDate = parseDateKey(agenda?.startDate);
    const days = Array.isArray(agenda?.days) ? [...agenda.days].sort((left, right) => left - right) : [];

    if (!startDate || days.length !== 3 || !Number.isInteger(sessionIndex) || sessionIndex < 0) {
      return null;
    }

    let occurrence = 0;
    for (let offset = 0; offset < 3660; offset += 1) {
      const date = addDays(startDate, offset);
      if (days.includes(date.getDay())) {
        if (occurrence === sessionIndex) {
          return { date, dateKey: toDateKey(date), day: date.getDay() };
        }
        occurrence += 1;
      }
    }

    return null;
  }

  function getCompletedDateKeys(history) {
    return new Set((Array.isArray(history) ? history : []).map((entry) => {
      const date = new Date(entry.completedAt);
      return Number.isNaN(date.getTime()) ? null : toDateKey(date);
    }).filter(Boolean));
  }

  function getStreak(agenda, history, today = new Date()) {
    const startDate = parseDateKey(agenda?.startDate);
    const days = Array.isArray(agenda?.days) ? agenda.days : [];
    if (!startDate || days.length !== 3) {
      return 0;
    }

    const completedDateKeys = getCompletedDateKeys(history);
    const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let streak = 0;
    let cursor = currentDate < startDate ? startDate : currentDate;

    while (cursor >= startDate) {
      if (days.includes(cursor.getDay())) {
        if (!completedDateKeys.has(toDateKey(cursor))) {
          break;
        }
        streak += 1;
      }
      cursor = addDays(cursor, -1);
    }

    return streak;
  }

  function getDayName(day) {
    return Number.isInteger(day) && day >= 0 && day <= 6 ? DAY_NAMES[day] : '';
  }

  const api = Object.freeze({
    DAY_NAMES,
    toDateKey,
    parseDateKey,
    getScheduledDates,
    getSessionScheduledDate,
    getStreak,
    getDayName,
  });

  global.datesUtils = api;

  if (typeof module !== 'undefined') {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);