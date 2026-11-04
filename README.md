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

El flujo realiza una búsqueda Tavily y analiza los resultados con Gemini (`gemini-3.5-flash-lite`). Puede procesar hasta diez documentos admitidos por la política de fuentes. Cada afirmación debe citar identificadores proporcionados por el servidor; las fechas y cifras se contrastan con los extractos recuperados. Los informes distinguen contexto histórico, cronología, cifras, impacto humanitario y en la infancia, respuesta internacional, incertidumbres y conclusiones documentales. Las secciones sin evidencia suficiente se explicitan en la respuesta.

Los registros de diagnóstico de investigación contienen solo cantidades agregadas de resultados aceptados, descartados y citados; no registran consultas, extractos, URLs ni credenciales. La generación puede tardar hasta 40 segundos y está limitada por presupuestos de caracteres y tokens.

## Despliegue gratuito

Vercel Hobby es la opción recomendada para publicar esta aplicación Next.js con un enlace público. Su plan gratuito está dirigido a proyectos personales y no comerciales; revisa sus condiciones y límites vigentes antes de usarlo para una organización o actividad comercial. La ruta de investigación solicita hasta 60 segundos de ejecución para cubrir el tiempo máximo del flujo.

1. Conecta el repositorio del proyecto en Vercel y despliega con el preset Next.js.
2. En la configuración del proyecto, agrega `TAVILY_API_KEY` y `GEMINI_API_KEY` como variables de entorno del servidor para los entornos que vayas a publicar.
3. Vuelve a desplegar después de guardar las variables y prueba `/investigar` en el enlace generado.

No agregues estas claves a Git ni uses el prefijo `NEXT_PUBLIC_`. Antes de difundir ampliamente el enlace, configura un límite de solicitudes para `/api/research`: cada llamada usa servicios externos y la ruta todavía no aplica un límite por visitante.

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
