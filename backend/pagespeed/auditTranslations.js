export const AUDIT_TRANSLATIONS = {
  // Categorías
  'Performance': 'Rendimiento',
  'Accessibility': 'Accesibilidad',
  'Best Practices': 'Mejores prácticas',
  'SEO': 'SEO',

  // Métricas comunes
  'First Contentful Paint': 'Primera pintura con contenido',
  'Largest Contentful Paint': 'Mayor elemento con contenido',
  'Total Blocking Time': 'Tiempo total de bloqueo',
  'Cumulative Layout Shift': 'Cambio de diseño acumulado',
  'Speed Index': 'Índice de velocidad',

  // Auditorías
  'Reduce unused JavaScript': 'Reduce JavaScript no utilizado',
  'Serve images in next-gen formats': 'Sirve imágenes en formatos de nueva generación',
  'Eliminate render-blocking resources': 'Elimina recursos que bloquean el renderizado',
  'Minimize main-thread work': 'Minimiza el trabajo del hilo principal',

    // Categorías
    'performance': 'Rendimiento',
    'accessibility': 'Accesibilidad',
    'best-practices': 'Mejores Prácticas',
    'seo': 'SEO',
    'pwa': 'PWA',

    // Títulos de métricas
    'First Contentful Paint': 'Primer Pintado de Contenido (FCP)',
    'Largest Contentful Paint': 'Pintado de Contenido Más Grande (LCP)',
    'First Meaningful Paint': 'Primer Pintado Significativo',
    'Speed Index': 'Índice de Velocidad',
    'Total Blocking Time': 'Tiempo Total de Bloqueo (TBT)',
    'Cumulative Layout Shift': 'Cambio Acumulativo de Diseño (CLS)',
    'Time to Interactive': 'Tiempo para Interactividad',
    'Max Potential FID': 'FID Potencial Máximo',
    'Server response time': 'Tiempo de Respuesta del Servidor (TTFB)',
    'Estimated Input Latency': 'Latencia de Entrada Estimada',
    'Interaction to Next Paint': 'Interacción al Siguiente Pintado (INP)',

    // Descripciones de métricas
    'First Contentful Paint marks the time at which the first text or image is painted.':
      'Marca el tiempo en el que se pinta el primer texto o imagen.',
    'Largest Contentful Paint marks the time at which the largest text or image is painted.':
      'Marca el tiempo en el que se pinta el texto o imagen más grande.',
    'Speed Index shows how quickly the contents of a page are visibly populated.':
      'Muestra qué tan rápido se llena visiblemente el contenido de una página.',
    'Total Blocking Time measures the total amount of time that a page is blocked from responding to user input.':
      'Mide la cantidad total de tiempo que una página está bloqueada para responder a la entrada del usuario.',
    'Cumulative Layout Shift measures the movement of visible elements within the viewport.':
      'Mide el movimiento de elementos visibles dentro del viewport.',

    // Títulos de auditorías comunes
    'Avoid enormous network payloads': 'Evitar cargas útiles de red enormes',
    'Avoid long main-thread tasks': 'Evitar tareas largas en el hilo principal',
    'Avoid non-composited animations': 'Evitar animaciones no compuestas',
    'Defer offscreen images': 'Diferir imágenes fuera de pantalla',
    'Eliminate render-blocking resources': 'Eliminar recursos que bloquean el renderizado',
    'Enable text compression': 'Habilitar compresión de texto',
    'Ensure text remains visible during webfont load': 'Asegurar que el texto sea visible durante la carga de webfonts',
    'Image elements have explicit width and height': 'Los elementos de imagen tienen ancho y alto explícitos',
    'Keep request counts low and transfer sizes small': 'Mantener recuentos de solicitudes bajos y tamaños de transferencia pequeños',
    'Lazy load offscreen images': 'Carga diferida de imágenes fuera de pantalla',
    'Minimize main-thread work': 'Minimizar el trabajo del hilo principal',
    'Preconnect to required origins': 'Preconectar a orígenes requeridos',
    'Preload key requests': 'Precargar solicitudes clave',
    'Properly size images': 'Dimensionar correctamente las imágenes',
    'Reduce JavaScript execution time': 'Reducir el tiempo de ejecución de JavaScript',
    'Reduce the impact of third-party code': 'Reducir el impacto del código de terceros',
    'Remove unused CSS': 'Eliminar CSS no utilizado',
    'Remove unused JavaScript': 'Eliminar JavaScript no utilizado',
    'Serve images in next-gen formats': 'Servir imágenes en formatos de última generación',
    'Serve static assets with an efficient cache policy': 'Servir activos estáticos con una política de caché eficiente',
    'Use video formats for animated content': 'Usar formatos de video para contenido animado',
      'Avoid chaining critical requests': 'Evitar encadenar solicitudes críticas',
      'Avoid document.write()': 'Evitar document.write()',
      'Avoid enormous network payloads': 'Evitar cargas útiles de red enormes',
      'Avoid large layout shifts': 'Evitar grandes cambios de diseño',
      'Avoid long main-thread tasks': 'Evitar tareas largas en el hilo principal',
      'Avoid multiple page redirects': 'Evitar múltiples redirecciones de página',
      'Avoid non-composited animations': 'Evitar animaciones no compuestas',
      'Avoid serving legacy JavaScript to modern browsers': 'Evitar servir JavaScript legado a navegadores modernos',
      'Avoids an excessive DOM size': 'Evitar un tamaño excesivo del DOM',
      'Back/forward cache': 'Caché de retroceso/avance',
      'Browser errors logged to the console': 'Errores del navegador registrados en la consola',
      'CSS': 'CSS',
      'Content is sized correctly for the viewport': 'El contenido tiene el tamaño correcto para el viewport',
      'Critical Request Chains': 'Cadenas de solicitudes críticas',
      'Defer offscreen images': 'Diferir imágenes fuera de pantalla',
      'Displays images with correct aspect ratio': 'Muestra imágenes con la relación de aspecto correcta',
      'Document uses plugins': 'El documento usa plugins',
      'DOM Size': 'Tamaño del DOM',
      'Does not use HTTP/2 for all of its resources': 'No usa HTTP/2 para todos sus recursos',
      'Eliminate render-blocking resources': 'Eliminar recursos que bloquean el renderizado',
      'Enable text compression': 'Habilitar compresión de texto',
      'Ensure text remains visible during webfont load': 'Asegurar que el texto sea visible durante la carga de webfonts',
      'Errors in console': 'Errores en la consola',
      'First CPU Idle': 'Primera CPU inactiva',
      'First Meaningful Paint': 'Primer pintado significativo',
      'Font display': 'Visualización de fuentes',
      'Has a <meta name="viewport"> tag with width or initial-scale': 'Tiene una etiqueta <meta name="viewport"> con width o initial-scale',
      'HTTP/2': 'HTTP/2',
      'Image elements have explicit width and height': 'Los elementos de imagen tienen ancho y alto explícitos',
      'Indexable by search engines': 'Indexable por motores de búsqueda',
      'Interactive': 'Interactivo',
      'JavaScript': 'JavaScript',
      'Keep request counts low and transfer sizes small': 'Mantener recuentos de solicitudes bajos y tamaños de transferencia pequeños',
      'Labels': 'Etiquetas',
      'Largest Contentful Paint element': 'Elemento de pintado de contenido más grande',
      'Lazy load offscreen images': 'Carga diferida de imágenes fuera de pantalla',
      'Link text': 'Texto del enlace',
      'Links have descriptive text': 'Los enlaces tienen texto descriptivo',
      'Main thread work': 'Trabajo del hilo principal',
      'Maintainability': 'Mantenibilidad',
      'Manifest has theme color': 'El manifiesto tiene color de tema',
      'Manifest has valid icons': 'El manifiesto tiene iconos válidos',
      'Manifest loaded': 'Manifiesto cargado',
      'Metrics': 'Métricas',
      'Minimize main-thread work': 'Minimizar el trabajo del hilo principal',
      'Mobile-friendly': 'Optimizado para móviles',
      'Network requests': 'Solicitudes de red',
      'Network round trip times': 'Tiempos de ida y vuelta de la red',
      'No browser errors logged to the console': 'No hay errores del navegador registrados en la consola',
      'No document.write()': 'No hay document.write()',
      'No friendly 404 page': 'No hay página 404 amigable',
      'No misconfigured CORS headers': 'No hay encabezados CORS mal configurados',
      'No redirects': 'Sin redirecciones',
      'No unload listeners': 'Sin listeners de unload',
      'No unsafe cross-origin links': 'Sin enlaces cross-origin inseguros',
      'No vulnerable libraries': 'Sin librerías vulnerables',
      'Non-composited animations': 'Animaciones no compuestas',
      'Not readable with JavaScript disabled': 'No es legible con JavaScript deshabilitado',
      'Offscreen images': 'Imágenes fuera de pantalla',
      'Opportunities': 'Oportunidades',
      'Page transitions': 'Transiciones de página',
      'Passed audits': 'Auditorías aprobadas',
      'Perceptual Speed Index': 'Índice de velocidad perceptual',
      'Performance budget': 'Presupuesto de rendimiento',
      'Preconnect to required origins': 'Preconectar a orígenes requeridos',
      'Preload key requests': 'Precargar solicitudes clave',
      'Properly size images': 'Dimensionar correctamente las imágenes',
      'Redirects': 'Redirecciones',
      'Reduce JavaScript execution time': 'Reducir el tiempo de ejecución de JavaScript',
      'Reduce render-blocking stylesheets': 'Reducir hojas de estilo que bloquean el renderizado',
      'Reduce the impact of third-party code': 'Reducir el impacto del código de terceros',
      'Remove unused CSS': 'Eliminar CSS no utilizado',
      'Remove unused JavaScript': 'Eliminar JavaScript no utilizado',
      'Resource Summary': 'Resumen de recursos',
      'Response compression': 'Compresión de respuesta',
      'Serve images in next-gen formats': 'Servir imágenes en formatos de última generación',
      'Serve static assets with an efficient cache policy': 'Servir activos estáticos con una política de caché eficiente',
      'Server Backend Latencies': 'Latencia del backend del servidor',
      'Server response time': 'Tiempo de respuesta del servidor',
      'Speed Index': 'Índice de velocidad',
      'Structured Data': 'Datos estructurados',
      'Tables': 'Tablas',
      'Tags': 'Etiquetas',
      'Third-party code': 'Código de terceros',
      'Third-party Summary': 'Resumen de terceros',
      'Time to First Byte': 'Tiempo hasta el primer byte',
      'Timing': 'Cronometraje',
      'Total Blocking Time': 'Tiempo total de bloqueo',
      'Total byte weight': 'Peso total en bytes',
      'Uncached': 'No cacheados',
      'Unminified CSS': 'CSS no minificado',
      'Unminified JavaScript': 'JavaScript no minificado',
      'Unused CSS rules': 'Reglas CSS no utilizadas',
      'Unused JavaScript': 'JavaScript no utilizado',
      'User Timing marks and measures': 'Marcas y medidas de tiempo del usuario',
      'Use video formats for animated content': 'Usar formatos de video para contenido animado',
      'Uses efficient cache policy on static assets': 'Usa política de caché eficiente en activos estáticos',
      'Uses HTTP/2 for its own resources': 'Usa HTTP/2 para sus propios recursos',
      'Uses responsive images': 'Usa imágenes responsivas',
      'Uses video formats for animated content': 'Usa formatos de video para contenido animado',
      'Valid source maps': 'Mapas de fuente válidos',
      'Viewport': 'Viewport',
      'Warnings': 'Advertencias',

      // Descripciones comunes
      'These checks highlight opportunities to improve the accessibility of your web app.':
        'Estas comprobaciones destacan oportunidades para mejorar la accesibilidad de tu aplicación web.',
      'These checks highlight opportunities to improve the performance of your web app.':
        'Estas comprobaciones destacan oportunidades para mejorar el rendimiento de tu aplicación web.',
      'These checks highlight opportunities to improve the SEO of your web app.':
        'Estas comprobaciones destacan oportunidades para mejorar el SEO de tu aplicación web.',

      // Textos de PageSpeed Insights
      'Diagnostics': 'Diagnósticos',
      'Opportunities': 'Oportunidades de mejora',
      'Passed audits': 'Auditorías aprobadas',
      'Metrics': 'Métricas esenciales',
      'View trace': 'Ver traza',
      'Learn more': 'Aprender más',
      'View Treemap': 'Ver mapa de árbol',
      'View Details': 'Ver detalles',
      'Show All': 'Mostrar todo',
      'Hide All': 'Ocultar todo',
      'Expand All': 'Expandir todo',
      'Collapse All': 'Contraer todo',

      // Categorías de métricas
      'good': 'bueno',
      'needs improvement': 'necesita mejora',
      'poor': 'pobre',
      'fast': 'rápido',
      'average': 'promedio',
      'slow': 'lento',

      // Textos de displayValue
      'Potential savings': 'Ahorro potencial',
      'Possible savings': 'Posible ahorro',
      'Estimated savings': 'Ahorro estimado',
      'Total savings': 'Ahorro total',
      'ms': 'milisegundos',
      'KB': 'kilobytes',
      'MB': 'megabytes',
      's': 'segundos',

      // Recomendaciones comunes
      'Consider reducing': 'Considera reducir',
      'Consider removing': 'Considera eliminar',
      'Consider optimizing': 'Considera optimizar',
      'Consider implementing': 'Considera implementar',
      'Consider using': 'Considera usar',
      'Consider adding': 'Considera agregar',

      // Errores comunes
      'Failed to fetch': 'Error al obtener datos',
      'Network error': 'Error de red',
      'Timeout': 'Tiempo de espera agotado',
      'Invalid URL': 'URL inválida',
      'Rate limited': 'Límite de solicitudes alcanzado',


    // Categorías de experiencia de carga
    'FAST': 'RÁPIDO',
    'AVERAGE': 'PROMEDIO',
    'SLOW': 'LENTO',

    // Unidades de medida
    's': 'segundos',
    'ms': 'milisegundos',
    'unitless': 'sin unidad',
    'bytes': 'bytes',
    'KB': 'KB',
    'MB': 'MB',

      // NUEVAS TRADUCCIONES PARA CORREGIR LOS ERRORES

      // Textos de auditorías específicas
      'Image elements do not have [alt] attributes': 'Los elementos de imagen no tienen atributos [alt]',
      'These checks highlight opportunities to improve the accessibility of your web app.':
        'Estas verificaciones destacan oportunidades para mejorar la accesibilidad de tu aplicación web.',
      'Automatic detection can only detect a subset of issues and does not guarantee the accessibility of your web app, so manual testing is also encouraged':
        'La detección automática solo puede identificar un subconjunto de problemas y no garantiza la accesibilidad de tu aplicación web, por lo que también se recomienda realizar pruebas manuales.',

      // Textos de métricas con links
      'Largest Contentful Paint marks the time at which the largest text or image is painted.':
        'Largest Contentful Paint marca el tiempo en el que se pinta el texto o imagen más grande.',
      'Learn more about the Largest Contentful Paint metric':
        'Más información sobre la métrica Largest Contentful Paint',
      'developer.chrome.com/docs/lighthouse/accessibility/':
        'Consulte la documentación oficial de accesibilidad.',
      'web.dev/articles/how-to-review':
        'Consulte las guías de revisión manual.',

      // Textos de diagnóstico
      'Image elements do not have `[alt]` attributes':
        'Los elementos de imagen no tienen atributos `[alt]`',

      // Encabezados de secciones (para corregir Ø=Ü)
      '📊 RESUMEN EJECUTIVO': '📊 RESUMEN EJECUTIVO',
      '📈 MÉTRICAS DETALLADAS': '📈 MÉTRICAS DETALLADAS',
      '📋 AUDITORÍAS DETALLADAS': '📋 AUDITORÍAS DETALLADAS',
      '🔍 DIAGNÓSTICOS ESPECÍFICOS': '🔍 DIAGNÓSTICOS ESPECÍFICOS',
      '💡 RECOMENDACIONES PRIORIZADAS': '💡 RECOMENDACIONES PRIORIZADAS',
      '📱 EXPERIENCIA REAL DE USUARIOS': '📱 EXPERIENCIA REAL DE USUARIOS'
};
