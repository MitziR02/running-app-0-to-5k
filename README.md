# running-app-0-to-5k

Aplicacion web para acompanarte desde los primeros intervalos de carrera hasta completar 5 km. El entrenamiento se organiza en sesiones progresivas de carrera y caminata, con control por tiempo y registro de esfuerzo percibido.

## Objetivo

El proyecto busca ofrecer una experiencia de entrenamiento sencilla, usable y autosuficiente para personas que comienzan a correr. La app prioriza:

- Un plan progresivo de 8 semanas.
- Sesiones guiadas por intervalos de tiempo.
- Calentamiento, carrera, caminata y enfriamiento.
- Seguimiento del esfuerzo percibido (RPE).
- Progreso guardado localmente en el dispositivo.

## Estado actual

La aplicacion funciona sin API, base de datos ni datos externos de entrenamiento. El plan inicial esta definido en el propio frontend y las sesiones completadas se guardan en `localStorage` del navegador.

Esto permite ejecutar la app sin cuentas, autenticacion o configuracion de backend. El progreso no se sincroniza entre dispositivos y puede perderse al borrar los datos del navegador.

## Tecnologias (sujetas a cambios)

- HTML5
- CSS3
- JavaScript estandar (ES6+)
- `localStorage` del navegador para guardar el progreso

## Estructura conceptual del proyecto (sujeta a cambios)

La aplicacion se organizara de forma modular utilizando HTML, CSS y JavaScript estandar. La siguiente propuesta busca separar la interfaz, la logica de entrenamiento y la persistencia para facilitar el mantenimiento y las futuras ampliaciones:

```
running-app-0-to-5k/
	index.html                    # Documento HTML principal
	src/
		app.js                      # Inicio de la aplicacion y enrutamiento de pantallas
		data/
			training-plan.js          # Plan de entrenamiento de 0 a 5 km
			rpe-labels.js              # Etiquetas y descripciones del esfuerzo percibido
		screens/
			home-screen.js             # Resumen, siguiente sesion y estadisticas principales
			plan-screen.js             # Vista completa del plan de entrenamiento
			session-screen.js          # Temporizador y controles de la sesion activa
			complete-screen.js         # Resumen y registro al finalizar una sesion
			progress-screen.js         # Progreso, historial y tendencias de esfuerzo
		components/
			bottom-navigation.js       # Navegacion principal
			workout-card.js            # Tarjeta de una sesion
			week-card.js               # Resumen desplegable de una semana
			progress-ring.js            # Indicador circular de progreso
			interval-timeline.js        # Representacion visual de los intervalos
			rpe-selector.js             # Selector de esfuerzo percibido
			session-controls.js         # Acciones de iniciar, pausar, reanudar y salir
		services/
			storage-service.js          # Lectura y escritura del progreso en localStorage
			workout-service.js          # Consulta y calculo de sesiones y progreso
		state/
			app-state.js                # Estado compartido de la aplicacion
			session-state.js             # Estado del temporizador y la sesion activa
		utils/
			time.js                     # Formateo y calculos de duracion
			dates.js                    # Fechas, rachas y ordenamiento del historial
			metrics.js                  # Estadisticas y carga de entrenamiento
		styles/
			variables.css               # Colores, tipografia y variables globales
			base.css                    # Reset y estilos generales
			components.css              # Estilos reutilizables de componentes
			screens.css                 # Estilos propios de cada pantalla
	tests/                          # Pruebas de logica y comportamiento
	README.md
	LICENSE
```

### Criterios de modularidad

- Las pantallas coordinaran la vista, pero no concentraran toda la logica del negocio.
- Los componentes se reutilizaran cuando una interfaz aparezca en mas de una pantalla.
- El plan de entrenamiento se mantendra separado de la presentacion.
- La persistencia se gestionara desde `services/storage-service.js` para evitar acceder directamente a `localStorage` desde cualquier componente.
- Las funciones de tiempo, fechas y metricas seran independientes del DOM para poder probarlas con facilidad.
- La aplicacion continuara funcionando sin API, backend ni base de datos.

## Alcance y siguientes pasos

La version actual esta pensada para validar la experiencia principal sin depender de datos persistidos fuera del navegador. Algunas evoluciones posibles son:

- Permitir configurar el perfil y el objetivo de cada persona.
- Añadir respaldo o sincronizacion del progreso.
- Incorporar pruebas para el plan, el temporizador y el calculo de carga.
- Separar el plan de entrenamiento de la interfaz para facilitar su mantenimiento.
- Añadir accesibilidad, notificaciones y soporte para diferentes ritmos.

## Licencia

Este proyecto se distribuye bajo una licencia de software no comercial. Se permite usar, estudiar, copiar y modificar el software, pero queda prohibido utilizarlo, redistribuirlo, integrarlo, sublicenciarlo o venderlo con fines comerciales o de monetizacion.

Consulta [LICENSE](LICENSE) para conocer los terminos completos, las restricciones de uso y la ausencia de garantia.

## Aviso de responsabilidad

Esta aplicacion se creo como una herramienta informativa y de acompanamiento para un proceso de entrenamiento basado en el principio de incremento progresivo de la carga de carrera, mediante la alternancia de intervalos de carrera y caminata. La metodologia y el contenido no constituyen asesoramiento medico, fisioterapeutico ni deportivo personalizado, y no garantizan resultados concretos.

La decision de utilizar la aplicacion, seguir el plan o modificarlo corresponde exclusivamente a cada persona usuaria. Antes de comenzar cualquier programa de ejercicio, especialmente si existen lesiones, enfermedades, factores de riesgo o dudas sobre la condicion fisica, se recomienda consultar con un profesional cualificado. Quien utilice la aplicacion debe detener la actividad ante dolor, mareo, dificultad respiratoria inusual u otras señales de alarma.

El uso de esta aplicacion se realiza bajo responsabilidad de la persona usuaria. En la maxima medida permitida por la legislacion aplicable, la propietaria y autora del proyecto no asumen responsabilidad por lesiones, daños, perdidas, perjuicios o reclamaciones derivadas del uso, la interpretacion o la imposibilidad de utilizar la aplicacion o el plan de entrenamiento. El contenido puede modificarse, quedar desactualizado o contener errores, por lo que debe evaluarse con criterio propio y no sustituye la supervision de un profesional.
