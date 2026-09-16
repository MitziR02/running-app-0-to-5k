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

(function createTrainingPlan(global) {
  function interval(type, duration, label) {
    return { type, duration, label };
  }

  function wrap(core) {
    return [
      interval('warmup', 300, 'Calentamiento'),
      ...core,
      interval('cooldown', 300, 'Enfriamiento'),
    ];
  }

  function repetitions(count, runDuration, walkDuration) {
    const intervals = [];

    for (let index = 0; index < count; index += 1) {
      intervals.push(interval('run', runDuration, 'Carrera'));

      if (index < count - 1) {
        intervals.push(interval('walk', walkDuration, 'Caminata'));
      }
    }

    return intervals;
  }

  function continuous(duration, label) {
    return [interval('run', duration, label || 'Carrera')];
  }

  function mixedWeekThree() {
    return [
      interval('run', 90, 'Carrera'),
      interval('walk', 90, 'Caminata'),
      interval('run', 180, 'Carrera'),
      interval('walk', 180, 'Caminata'),
      interval('run', 90, 'Carrera'),
      interval('walk', 90, 'Caminata'),
      interval('run', 180, 'Carrera'),
    ];
  }

  function mixedWeekFour() {
    return [
      interval('run', 180, 'Carrera'),
      interval('walk', 90, 'Caminata'),
      interval('run', 300, 'Carrera'),
      interval('walk', 150, 'Caminata'),
      interval('run', 180, 'Carrera'),
      interval('walk', 90, 'Caminata'),
      interval('run', 300, 'Carrera'),
    ];
  }

  function createSession(week, day, title, description, intervals) {
    return { week, day, title, description, intervals: wrap(intervals) };
  }

  const trainingPlan = [
    createSession(1, 1, 'Primeros pasos', '8 intervalos cortos de carrera con recuperaciones caminando.', repetitions(8, 60, 90)),
    createSession(1, 2, 'Encontrar el ritmo', 'Repite la estructura y encuentra un ritmo que te permita hablar.', repetitions(8, 60, 90)),
    createSession(1, 3, 'Semana 1 completa', 'Tres sesiones hechas. Mantén la respiracion y la constancia.', repetitions(8, 60, 90)),

    createSession(2, 1, 'Zancadas mas largas', 'Los intervalos de carrera se extienden a 90 segundos.', repetitions(6, 90, 120)),
    createSession(2, 2, 'Construir resistencia', 'Mismo esfuerzo y ritmo controlado. La constancia es la clave.', repetitions(6, 90, 120)),
    createSession(2, 3, 'Semana 2 completa', 'Dos semanas de adaptacion y una base aerobica mas solida.', repetitions(6, 90, 120)),

    createSession(3, 1, 'Bloques de tres minutos', 'Combina bloques cortos y largos para ampliar tu resistencia.', mixedWeekThree()),
    createSession(3, 2, 'Esfuerzo constante', 'Confia en el plan y mantén un esfuerzo conversacional.', mixedWeekThree()),
    createSession(3, 3, 'Cierre de la semana 3', 'Tus piernas y tu respiracion ya estan aprendiendo el patron.', mixedWeekThree()),

    createSession(4, 1, 'Cinco minutos', 'Primeros bloques continuos de cinco minutos.', mixedWeekFour()),
    createSession(4, 2, 'Repetir el desafio', 'Repite la estructura y deja que el esfuerzo se sienta mas familiar.', mixedWeekFour()),
    createSession(4, 3, 'Un mes en movimiento', 'Cuatro semanas de constancia y un nuevo nivel de resistencia.', mixedWeekFour()),

    createSession(5, 1, 'Tres bloques de cinco', 'Tres carreras de cinco minutos con recuperacion activa.', [
      interval('run', 300, 'Carrera'), interval('walk', 180, 'Caminata'),
      interval('run', 300, 'Carrera'), interval('walk', 180, 'Caminata'),
      interval('run', 300, 'Carrera'),
    ]),
    createSession(5, 2, 'Bloques de ocho minutos', 'Dos carreras de ocho minutos para ampliar la capacidad aerobica.', [
      interval('run', 480, 'Carrera'), interval('walk', 300, 'Caminata'),
      interval('run', 480, 'Carrera'),
    ]),
    createSession(5, 3, 'Primera carrera de 20 minutos', 'Tu primera carrera continua de 20 minutos.', continuous(1200, 'Carrera de 20 minutos')),

    createSession(6, 1, 'Volver a los intervalos', 'Una variacion de intervalos para seguir construyendo resistencia.', [
      interval('run', 300, 'Carrera'), interval('walk', 180, 'Caminata'),
      interval('run', 480, 'Carrera'), interval('walk', 180, 'Caminata'),
      interval('run', 300, 'Carrera'),
    ]),
    createSession(6, 2, 'Bloques de diez minutos', 'Dos carreras de diez minutos a ritmo facil.', [
      interval('run', 600, 'Carrera'), interval('walk', 180, 'Caminata'),
      interval('run', 600, 'Carrera'),
    ]),
    createSession(6, 3, 'Carrera de 22 minutos', 'Una carrera continua y controlada de 22 minutos.', continuous(1320, 'Carrera de 22 minutos')),

    createSession(7, 1, '25 minutos', 'Mantén un ritmo que puedas sostener con comodidad.', continuous(1500, 'Carrera de 25 minutos')),
    createSession(7, 2, '25 minutos otra vez', 'Repite la distancia y deja que la constancia haga su trabajo.', continuous(1500, 'Carrera de 25 minutos')),
    createSession(7, 3, 'Los ultimos 25', 'Ya puedes sentir el ultimo tramo hacia los 5 km.', continuous(1500, 'Carrera de 25 minutos')),

    createSession(8, 1, '28 minutos', 'La meta esta cerca. Confia en todo lo que has construido.', continuous(1680, 'Carrera de 28 minutos')),
    createSession(8, 2, 'Penultima sesion', 'Relaja los hombros y disfruta de tu resistencia.', continuous(1680, 'Carrera de 28 minutos')),
    createSession(8, 3, '5 km · Lo conseguiste', 'Completa 30 minutos continuos y celebra el resultado.', continuous(1800, 'Carrera de 30 minutos')),
  ];

  function getTotalDuration(session) {
    return session.intervals.reduce((total, current) => total + current.duration, 0);
  }

  function getRunDuration(session) {
    return session.intervals
      .filter((current) => current.type === 'run')
      .reduce((total, current) => total + current.duration, 0);
  }

  function getLongestRun(session) {
    return Math.max(...session.intervals
      .filter((current) => current.type === 'run')
      .map((current) => current.duration));
  }

  global.trainingPlan = Object.freeze(trainingPlan);
  global.trainingPlanUtils = Object.freeze({
    getTotalDuration,
    getRunDuration,
    getLongestRun,
  });
})(window);
