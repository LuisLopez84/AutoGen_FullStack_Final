import PDFDocument from 'pdfkit';

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function getScoreColor(score) {
  if (score >= 90) return '#27ae60'; // Green
  if (score >= 50) return '#f39c12'; // Orange
  return '#c0392b'; // Red
}

// Función de limpieza mejorada
function cleanTextForPDF(text) {
  if (!text) return '';

  let str = String(text);

  // 1. Eliminar patrones de basura específicos
  str = str.replace(/Ø=Ü/g, '');
  str = str.replace(/&¡/g, '');
  str = str.replace(/Ø=Üñ/g, '');
  str = str.replace(/Ø=ÜÊ/g, '');
  str = str.replace(/Ø=Üë/g, '');
  str = str.replace(/Ø=Ý/g, '');

  // 2. Eliminar caracteres de control (excepto espacio y salto de línea)
  str = str.replace(/[\x00-\x09\x0b\x0c\x0e-\x1f\x7f]/g, ' ');

  return str;
}

// ==========================================
// EXPORTACIONES ZAP (SEGURIDAD) - CORREGIDAS
// ==========================================
export function generateZapPDF(alerts, url) {
  return new Promise((resolve, reject) => {
    try {
      // Validación robusta
      const alertList = Array.isArray(alerts) ? alerts : [];
      if (alertList.length === 0) {
        return reject(new Error('La lista de alertas está vacía o es inválida.'));
      }

      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: false });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // --- PORTADA ---
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#2c3e50');
      doc.fillColor('#ffffff').fontSize(32).text('INFORME DE SEGURIDAD', 50, 200, { align: 'center' });
      doc.fontSize(18).text('Analisis OWASP ZAP', 50, 250, { align: 'center' });
      doc.fontSize(12).fillColor('#bdc3c7').text(`Objetivo: ${url}`, 50, 300, { align: 'center' });
      doc.text(`Fecha: ${new Date().toLocaleString('es-ES')}`, 50, 320, { align: 'center' });

      // --- PÁGINA 1: RESUMEN ---
      doc.addPage();
      doc.fillColor('#2c3e50').fontSize(20).text('RESUMEN DE RIESGOS', 50, 50);
      doc.moveDown(20);

      const summary = { High: 0, Medium: 0, Low: 0, Informational: 0 };

      alertList.forEach(a => {
        // Soporte para claves ZAP estándar y custom
        const risk = a.risk || (a.riskdesc ? 'High' : 'Low'); // Fallback si risk viene en string descriptivo
        if (risk && summary[risk] !== undefined) summary[risk]++;
      });

      let yPos = 100;
      const risks = [
        { key: 'High', color: '#c0392b', label: 'Alto' },
        { key: 'Medium', color: '#e67e22', label: 'Medio' },
        { key: 'Low', color: '#f1c40f', label: 'Bajo' },
        { key: 'Informational', color: '#3498db', label: 'Info' }
      ];

      risks.forEach(r => {
        doc.rect(50, yPos, 400, 40).fill(r.color);
        doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold')
           .text(`${r.label}: ${summary[r.key]} alertas`, 60, yPos + 12);
        yPos += 50;
      });

      // --- PÁGINA 2: DETALLES ---
      doc.addPage();
      doc.fillColor('#2c3e50').fontSize(20).text('DETALLE DE VULNERABILIDADES', 50, 50);
      doc.moveDown(20);

      yPos = doc.y; // Reiniciar posición Y

      alertList.forEach((alert, index) => {
        if (yPos > 700) { doc.addPage(); yPos = 50; }

        // Normalización de datos (Soporta formato ZAP puro y formato custom)
        const alertName = alert.alert || alert.name || 'Sin nombre'; // ZAP usa 'alert', nosotros usabamos 'name'
        const riskLevel = alert.risk || 'Unknown';
        const color = riskLevel === 'High' ? '#c0392b' : riskLevel === 'Medium' ? '#e67e22' : riskLevel === 'Low' ? '#f1c40f' : '#3498db';

        // Caja de la alerta
        doc.rect(50, yPos, doc.page.width - 100, 80).lineWidth(1).stroke(color);

        // Nombre (Con corrección de clave)
        const name = cleanTextForPDF(alertName);
        doc.fillColor(color).fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${name}`, 60, yPos + 5);

        // URL
        const urlAlert = alert.url || alert.uri || 'N/A';
        doc.fillColor('#333').fontSize(10).font('Helvetica')
           .text(`URL: ${urlAlert}`, 60, yPos + 20, { width: doc.page.width - 120, ellipsis: true });

        // Descripción
        if (alert.description) {
            const desc = cleanTextForPDF(alert.description).substring(0, 150);
            doc.text(`Desc: ${desc}...`, 60, yPos + 35, { width: doc.page.width - 120 });
        }

        // Solución (Soporta 'solution' o 'solutionDesc' de ZAP)
        const solutionText = alert.solution || alert.solutionDesc || '';
        if (solutionText) {
            const sol = cleanTextForPDF(solutionText).substring(0, 100);
            doc.fillColor('#2980b9').text(`Sol: ${sol}...`, 60, yPos + 50, { width: doc.page.width - 120 });
        }

        yPos += 90;
      });

      doc.end();
    } catch (error) {
      console.error("Error interno en generateZapPDF:", error);
      reject(error);
    }
  });
}

export function generateZapCSV(alerts) {
  return new Promise((resolve, reject) => {
    try {
      if (!alerts || !Array.isArray(alerts)) {
        return reject(new Error('No se proporcionaron alertas válidas para el CSV.'));
      }

      // CORRECCIÓN TIPoGRÁFICA: "CONFIDENZA" -> "CONFIANZA"
      const header = ['RIESGO', 'NOMBRE', 'CONFIANZA', 'URL', 'DESCRIPCION', 'SOLUCION'];
      const rows = alerts.map(alert => {
        const escape = (txt) => {
            if (!txt) return '""';
            return `"${String(txt).replace(/"/g, '""')}"`;
        };

        return [
            escape(alert.risk),
            escape(alert.name),
            escape(alert.confidence),
            escape(alert.url),
            escape(cleanTextForPDF(alert.description)),
            escape(cleanTextForPDF(alert.solution))
        ];
      });

      const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
      resolve(Buffer.from(csvContent, 'utf-8'));
    } catch (error) {
      console.error("Error en generateZapCSV:", error);
      reject(error);
    }
  });
}

// ==========================================
// EXPORTACIONES PERFORMANCE (PAGESPEED)
// ==========================================

export function generatePDF(data) {
  return new Promise((resolve, reject) => {
    try {
      if (!data) return reject(new Error('No hay datos'));

      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: false });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // --- PORTADA ---
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ecf0f1');
      doc.fillColor('#2c3e50').fontSize(36).text('INFORME RENDIMIENTO', 50, 150, { align: 'center' });
      doc.fontSize(24).fillColor('#3498db').text('Análisis Web Performance', 50, 200, { align: 'center' });
      doc.fontSize(14).fillColor('#7f8c8d').text(`URL: ${data.url || 'N/A'}`, 50, 300, { align: 'center' });
      doc.text(`Estrategia: ${data.strategy === 'mobile' ? 'Móvil' : 'Escritorio'}`, 50, 320, { align: 'center' });
      doc.text(`Fecha: ${new Date().toLocaleString('es-ES')}`, 50, 340, { align: 'center' });

      // --- PÁGINA 1: RESUMEN ---
      doc.addPage();
      doc.fillColor('#2c3e50').fontSize(24).text('RESUMEN EJECUTIVO', 50, 50);
      doc.moveDown(10); // Solo 10px de espacio

      // Categorías
      if (data.categories) {
        Object.values(data.categories).forEach(cat => {
          // Barra de fondo
          doc.rect(50, doc.y, 400, 20).fill('#ecf0f1');
          // Barra de progreso
          const width = (cat.score / 100) * 400;
          doc.rect(50, doc.y, width, 20).fill(getScoreColor(cat.score));

          // Texto (LIMPIEZA + MOVE DOWN PEQUEÑO)
          const titleClean = cleanTextForPDF(cat.title);
          doc.fillColor('#2c3e50').fontSize(12).text(`${titleClean}: ${Math.round(cat.score)}/100`, 50, doc.y - 15);
          doc.moveDown(5); // Solo 5px de espacio extra, no 30 ni 50
        });
      }

      // --- PÁGINA 2: MÉTRICAS CORE ---
      doc.addPage();
      doc.fillColor('#2c3e50').fontSize(24).text('MÉTRICAS PRINCIPALES', 50, 50);
      doc.moveDown(10);

      const coreMetrics = ['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time', 'first-contentful-paint'];

      if (data.metrics?.performance?.items) {
        data.metrics.performance.items
          .filter(m => coreMetrics.includes(m.id))
          .forEach(m => {
            // Fila de métrica
            doc.rect(50, doc.y, doc.page.width - 100, 60).fill('#fff').stroke('#ddd');

            const titleClean = cleanTextForPDF(m.title);
            const descClean = cleanTextForPDF(m.description);

            doc.fillColor('#2c3e50').fontSize(12).font('Helvetica-Bold').text(titleClean, 60, doc.y);

            // Descripción con wrapping (EL WRAPPING AVANZA LA POSICIÓN Y AUTOMÁTICAMENTE CREA EL ESPACIO NECESARIO)
            doc.fillColor('#7f8c8d').fontSize(10).text(descClean, 60, doc.y + 20, { width: 300 });

            // Valor numérico a la derecha
            const displayValue = m.displayValue || 'N/A';
            const score = m.score !== null ? Math.round(m.score * 100) : 0;

            doc.fillColor('#3498db').fontSize(14).font('Helvetica-Bold').text(displayValue, 400, doc.y);
            doc.fillColor(getScoreColor(score)).fontSize(10).text(`Score: ${score}%`, 400, doc.y + 20);

            doc.moveDown(10); // Solo 10px de espacio entre filas de métricas
          });
      }

      // --- PÁGINA 3: OPORTUNIDADES DE MEJORA ---
      doc.addPage();
      doc.fillColor('#c0392b').fontSize(24).text('OPORTUNIDADES DE MEJORA', 50, 50);
      doc.moveDown(10);

      const opportunities = data.audits?.opportunities?.items || [];

      if (opportunities.length === 0) {
        doc.fillColor('#27ae60').text('No se encontraron oportunidades críticas.', 50, 100);
      } else {
        opportunities.slice(0, 10).forEach(audit => {
          if (doc.y > 700) { doc.addPage(); doc.y = 50; }

          doc.rect(50, doc.y, doc.page.width - 100, 5).fill('#c0392b');

          const titleClean = cleanTextForPDF(audit.title);
          const descClean = cleanTextForPDF(audit.description);

          doc.fillColor('#2c3e50').fontSize(11).font('Helvetica-Bold').text(titleClean, 50, doc.y + 5);

          if (audit.displayValue) {
             doc.fillColor('#c0392b').fontSize(10).text(`Ahorro: ${audit.displayValue}`, 400, doc.y + 5);
          }

          // Descripción con wrapping (NO NECESITA MOVEDOWN)
          doc.fillColor('#555').fontSize(9).text(descClean, 50, doc.y + 25, { width: doc.page.width - 120 });

          doc.moveDown(15); // Pequeño espacio entre oportunidades
        });
      }

      // --- PÁGINA 4: AUDITORÍAS APROBADAS ---
      doc.addPage();
      doc.fillColor('#27ae60').fontSize(24).text('AUDITORÍAS APROBADAS', 50, 50);
      doc.moveDown(10);

      const passed = data.audits?.passed?.items || [];

      passed.slice(0, 20).forEach(audit => {
        if (doc.y > 750) { doc.addPage(); doc.y = 50; }
        const titleClean = cleanTextForPDF(audit.title);
        doc.fontSize(9).fillColor('#2c3e50').text(`- ${titleClean}`, 50, doc.y);
        doc.moveDown(5); // Solo 5px
      });

      doc.end();
    } catch (error) {
      console.error('Error generando PDF:', error);
      reject(error);
    }
  });
}

// ==========================================
// FUNCIÓN GENERAR CSV (COMPLETA Y CORREGIDA)
// ==========================================
export function generateCSV(data) {
  return new Promise((resolve, reject) => {
    try {
      const csvData = [];

      // 1. METADATOS
      csvData.push(['SECCIÓN', 'CAMPO', 'VALOR', 'UNIDAD', 'PUNTUACIÓN', 'ESTADO']);
      csvData.push(['INFORMACIÓN GENERAL', 'URL', data.url || '', '', '', '']);
      csvData.push(['INFORMACIÓN GENERAL', 'Dispositivo', data.strategyLabel || data.strategy || '', '', '', '']);
      csvData.push(['INFORMACIÓN GENERAL', 'Fecha', new Date().toLocaleDateString('es-ES'), '', '', '']);
      csvData.push([]); // Fila vacía para separar

      // 2. CATEGORÍAS
      csvData.push(['CATEGORÍAS', 'Nombre', 'Puntuación', 'Estado', 'Descripción']);
      if (data.categories) {
        Object.values(data.categories).forEach(cat => {
          const estado = cat.score >= 90 ? 'EXCELENTE' : cat.score >= 70 ? 'BUENO' : cat.score >= 50 ? 'REGULAR' : 'MEJORABLE';
          const cleanTitle = cleanTextForPDF(cat.title);
          const cleanDesc = cleanTextForPDF(cat.description);
          csvData.push(['CATEGORÍAS', cleanTitle, cat.score, estado, cleanDesc]);
        });
      }
      csvData.push([]);

      // 3. MÉTRICAS
      csvData.push(['MÉTRICAS', 'Nombre', 'Valor', 'Unidad', 'Score', 'Estado']);
      if (data.metrics?.performance) {
        const metricsItems = Array.isArray(data.metrics.performance.items) ? data.metrics.performance.items : Object.values(data.metrics.performance || {});
        metricsItems.forEach(metric => {
          const estado = metric.score >= 0.9 ? 'EXCELENTE' : metric.score >= 0.5 ? 'BUENO' : 'MEJORABLE';
          const cleanTitle = cleanTextForPDF(metric.title);
          csvData.push(['MÉTRICAS', cleanTitle, metric.numericValue || '', metric.numericUnit || '', metric.score != null ? Math.round(metric.score * 100) : '', estado]);
        });
      }
      csvData.push([]);

      // 4. AUDITORÍAS
      csvData.push(['AUDITORÍAS', 'Tipo', 'Título', 'Descripción', 'Ahorro', 'Score', 'Severidad']);

      // Oportunidades
      if (data.audits?.opportunities) {
        const oppItems = Array.isArray(data.audits.opportunities.items) ? data.audits.opportunities.items : Object.values(data.audits.opportunities || {});
        oppItems.forEach(audit => {
          const cleanTitle = cleanTextForPDF(audit.title);
          const cleanDesc = cleanTextForPDF(audit.description);
          csvData.push(['AUDITORÍAS', 'OPORTUNIDAD', cleanTitle, cleanDesc?.substring(0, 200), audit.displayValue || '', audit.score ? Math.round(audit.score * 100) : '', 'ALTA']);
        });
      }

      // Aprobadas
      if (data.audits?.passed) {
        const passedItems = Array.isArray(data.audits.passed.items) ? data.audits.passed.items : Object.values(data.audits.passed || {});
        passedItems.forEach(audit => {
           const cleanTitle = cleanTextForPDF(audit.title);
           const cleanDesc = cleanTextForPDF(audit.description);
           csvData.push(['AUDITORÍAS', 'APROBADA', cleanTitle, cleanDesc?.substring(0, 200), '', audit.score ? Math.round(audit.score * 100) : '', 'BAJA']);
        });
      }
      csvData.push([]);

      // 5. DIAGNÓSTICOS
      csvData.push(['DIAGNÓSTICOS', 'ID', 'Título', 'Descripción', 'Valor', 'Severidad', 'Impacto']);
      const diagnostics = Array.isArray(data.diagnostics) ? data.diagnostics : Object.values(data.diagnostics || {});
      diagnostics.forEach(diag => {
        const cleanTitle = cleanTextForPDF(diag.title);
        const cleanDesc = cleanTextForPDF(diag.description);
        csvData.push(['DIAGNÓSTICOS', diag.id || 'N/A', cleanTitle, cleanDesc.substring(0, 200).replace(/"/g, '""'), diag.displayValue || 'N/A', diag.severity || 'MEDIA', diag.impact || 'ALTO']);
      });
      csvData.push([]);

      // 6. RECOMENDACIONES (CORREGIDO AQUÍ)
      // Lógica para asegurar que siempre se impriman recomendaciones
      const recommendations = Array.isArray(data.recommendations) && data.recommendations.length > 0
        ? data.recommendations
        : [
            { priority: 'ALTA', title: 'Optimizar imágenes', description: 'Usa formatos WebP, comprime imágenes', impact: 'ALTO', action: 'Comprimir imágenes' },
            { priority: 'ALTA', title: 'Minificar CSS y JS', description: 'Reduce el tamaño de los archivos', impact: 'ALTO', action: 'Minificar recursos' },
            { priority: 'MEDIA', title: 'Eliminar JS no usado', description: 'Quitar código que no se ejecuta', impact: 'MEDIO', action: 'Tree Shaking' },
            { priority: 'MEDIA', title: 'Lazy Loading', description: 'Cargar contenido bajo demanda', impact: 'MEDIO', action: 'Implementar lazy loading' },
            { priority: 'BAJA', title: 'Optimizar Fuentes', description: 'Usar font-display: swap', impact: 'BAJO', action: 'Optimizar web fonts' }
          ];

      csvData.push(['RECOMENDACIONES', 'Prioridad', 'Título', 'Descripción', 'Impacto', 'Acción']);
      recommendations.forEach(rec => {
        const cleanTitle = cleanTextForPDF(rec.title);
        const cleanDesc = cleanTextForPDF(rec.description || '');
        csvData.push(['RECOMENDACIONES', rec.priority, cleanTitle, cleanDesc.substring(0, 150).replace(/"/g, '""'), rec.impact || '', rec.action || '']);
      });

      // Convertir a String CSV Correcto
      const csvContent = csvData.map(row => {
        return row.map(cell => {
          const cellStr = String(cell || '');
          return `"${cellStr.replace(/"/g, '""')}"`;
        }).join(',');
      }).join('\n');

      resolve(csvContent);
    } catch (error) {
      reject(error);
    }
  });
}