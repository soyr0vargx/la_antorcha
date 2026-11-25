# Voces Jóvenes contra la Guerra

Aplicación educativa y editorial para explorar conflictos armados, experiencias, historias y fuentes, y para generar informes documentales con referencias verificables.

## Requisitos

- Node.js compatible con Next.js 16
- npm
- Claves de Tavily y Gemini para usar la investigación con proveedores reales

## Desarrollo

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>. Para ejecutar las comprobaciones:

```bash
npm test
npm run lint
npm run build
```

## Configuración de investigación

Define `TAVILY_API_KEY` y `GEMINI_API_KEY` en `.env.local` para habilitar la búsqueda y el análisis. No incluyas sus valores en registros, capturas ni respuestas del navegador. La ruta `POST /api/research` valida la consulta antes de iniciar una investigación.

El flujo realiza una búsqueda Tavily básica con contenido de página y analiza los resultados con Gemini (`gemini-3.6-flash`), un modelo comprobado con la clave configurada y el formato JSON que consume la aplicación. Ante errores de modelo no disponible (400/404), cuota o disponibilidad temporal (429/500/502/503/504) o timeout, prueba `gemini-3-flash-preview`. La disponibilidad y las cuotas dependen del proyecto y pueden variar. Cada llamada a un modelo tiene un límite de 18 segundos y el análisis completo un límite de 44 segundos. El informe apunta a 500-800 palabras y limita la cantidad de afirmaciones por sección para reducir respuestas truncadas y acelerar la generación. Puede procesar hasta diez documentos admitidos, con un presupuesto equilibrado de 30.000 caracteres para que las primeras fuentes no desplacen a las demás. Cada afirmación debe citar identificadores proporcionados por el servidor; las fechas y cifras se contrastan con los extractos recuperados. Si el primer informe llega truncado o con JSON inválido, intenta una vez con el modelo alternativo. Si la evidencia no permite validar un informe completo o Gemini no está disponible, `/investigar` muestra el error y las fuentes recuperadas, claramente marcadas como evidencia sin analizar.

Cada afirmación puede citar hasta dos fuentes. Si la validación detecta referencias, fechas o cifras no respaldadas, se intenta una sola regeneración acotada; si el segundo borrador tampoco pasa la verificación, la solicitud devuelve un error en lugar de mostrar afirmaciones no verificadas.

Los registros de diagnóstico de investigación contienen solo cantidades agregadas de resultados aceptados, descartados y citados; no registran consultas, extractos, URLs ni credenciales. La búsqueda y el análisis tienen límites de tiempo y tokens. Si la búsqueda termina pero Gemini falla, la interfaz conserva y muestra las fuentes para que no se pierda la evidencia recuperada.

## Despliegue gratuito

Vercel Hobby es la opción recomendada para publicar esta aplicación Next.js con un enlace público. Su plan gratuito está dirigido a proyectos personales y no comerciales; revisa sus condiciones y límites vigentes antes de usarlo para una organización o actividad comercial. La ruta de investigación solicita hasta 60 segundos de ejecución para cubrir el tiempo máximo del flujo.

1. Conecta el repositorio del proyecto en Vercel y despliega con el preset Next.js.
2. En la configuración del proyecto, agrega `TAVILY_API_KEY` y `GEMINI_API_KEY` como variables de entorno del servidor para los entornos que vayas a publicar.
3. Vuelve a desplegar después de guardar las variables y prueba `/investigar` en el enlace generado.

No agregues estas claves a Git ni uses el prefijo `NEXT_PUBLIC_`. Antes de difundir ampliamente el enlace, configura un límite de solicitudes para `/api/research` y `/api/news`: usan servicios externos y las rutas todavía no aplican un límite por visitante.

## Funciones interactivas

- La portada consulta al abrirse extractos de noticias del último mes. `/api/news` usa Tavily, filtra los resultados a dominios reconocidos y muestra el enlace y la fecha disponible; el botón permite actualizar o cambiar la región. Esta consulta automática consume una solicitud externa por visita a la portada.
- El asistente de preguntas reutiliza la investigación de `/api/research` y enlaza las fuentes de cada respuesta. Necesita las mismas claves de Tavily y Gemini que el formulario.
- El mapa de `/conflictos` incluye fichas ampliadas de Sudán, Ucrania y Gaza basadas en informes de UNICEF publicados en 2026. Las cifras se muestran con el período de referencia y un enlace a la fuente; se agregan acontecimientos fechados sobre educación, ataques a infraestructura, desplazamiento y acceso a ayuda. Los actores o fechas de inicio que estos documentos no permiten confirmar se identifican explícitamente, en lugar de inventarse. Un país sin ficha no se clasifica como pacífico.
- El selector de apariencia ofrece ocho paletas y una mira de cursor opcional en pantallas con puntero. Las preferencias se guardan en el navegador.
- El mural comunitario no está habilitado: requiere almacenamiento compartido y moderación antes de publicar aportes. No se copiaron las publicaciones de muestra del prototipo.
- La sección `/fuentes` incluye los informes que respaldan las tres fichas iniciales. `/historias` no muestra testimonios por ahora, porque requiere historias publicadas por fuentes identificables y verificadas; no se generan testimonios ficticios.

## Rutas principales

- `/`: portada
- `/conflictos`: exploración de conflictos y mapa
- `/experiencia`: experiencias
- `/historias`: historias
- `/fuentes`: fuentes
- `/investigar`: formulario e informes de investigación
- `/literatura`: literatura
- `/nuestra-voz`: espacio editorial
- `/api/research`: API de investigación

El contenido editorial depende de los datos disponibles en el proyecto; las secciones sin registros conservan sus estados vacíos, en lugar de presentar contenido no verificado.

## Interfaz

La aplicación mantiene sus rutas y componentes React/TypeScript y adapta la identidad visual de la maqueta de referencia: papel sepia, tinta oscura, acentos rojos, tipografía editorial, modo noche, progreso de lectura y control para volver al inicio. Los controles son globales y el diseño se adapta a pantallas estrechas.
