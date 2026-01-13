import PDFDocument from 'pdfkit';
import fs from 'fs';

// ==========================================
// FUNCIONES AUXILIARES (COMUNES)
// ==========================================

function getScoreColor(score) {
  if (score >= 90) return '#27ae60'; // Green
  if (score >= 50) return '#f39c12'; // Orange
  return '#c0392b'; // Red
}

function getQualityLabel(score) {
  if (score >= 90) return 'Bueno';
  if (score >= 50) return 'Necesita mejora';
  return 'Pobre';
}

// Función de limpieza mejorada para PDF
function cleanTextForPDF(text) {
  if (!text) return '';

  let str = String(text);

  // 1. Eliminar caracteres basura específicos de tus traducciones
  str = str.replace(/Ø=Ü/g, '');
  str = str.replace(/Ø=Üñ/g, '');
  str = str.replace(/Ø=ÜÊ/g, '');
  str = str.replace(/Ø=Ü¡/g, '');
  str = str.replace(/Ø=Üë/g, '');
  str = str.replace(/&¡/g, ''); // Eliminar combinaciones problemáticas

  // 2. Reemplazar caracteres no estándar que rompen PDFKit (pero mantener acentos básicos)
  // Permitimos ASCII (20-7E) y Latín-1 Extendido (C0-FF) para español (á, é, ñ, ¿)
  str = str.replace(/[^\x20-\x7E\u00C0-\u00FF]/g, ' ');

  return str;
}

// ==========================================
// EXPORTACIONES ZAP (SEGURIDAD)
// ==========================================
export function generateZapPDF(alerts, url) {
  return new Promise((resolve, reject) => {
    try {
      console.log('🛠️ (PDFKit) Creando documento...');
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        console.log('✅ (PDFKit) Stream finalizado.');
        resolve(Buffer.concat(chunks));
      });

      // Capturar errores de PDFKit
      doc.on('error', (err) => {
        console.error('❌ (PDFKit) Error interno:', err);
        reject(err);
      });

      // --- PORTADA ---
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#2c3e50');
      doc.fillColor('#ffffff').fontSize(32).text('INFORME DE SEGURIDAD', 50, 200, { align: 'center' });
      doc.fontSize(18).text('Analisis OWASP ZAP', 50, 250, { align: 'center' });
      doc.fontSize(12).fillColor('#bdc3c7').text(`Objetivo: ${url}`, 50, 300, { align: 'center' });
      doc.text(`Fecha: ${new Date().toLocaleString('es-ES')}`, 50, 320, { align: 'center' });

      // --- PÁGINA 1: RESUMEN ---
      doc.addPage();
      doc.fillColor('#2c3e50').fontSize(20).text('RESUMEN DE RIESGOS', 50, 50);

      const summary = { High: 0, Medium: 0, Low: 0, Informational: 0 };

      // Conteo seguro
      alerts.forEach(a => {
        if (a && a.risk && summary[a.risk] !== undefined) {
          summary[a.risk]++;
        }
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

      // --- PÁGINA 2: DETALLES (CON BUCLE SEGURO) ---
      doc.addPage();
      doc.fillColor('#2c3e50').fontSize(20).text('DETALLE DE VULNERABILIDADES', 50, 50);
      yPos = 80;

      // Recorremos las alertas con try/catch individual para que una mala no rompa el PDF
      alerts.forEach((alert, index) => {
        try {
          if (yPos > 700) { doc.addPage(); yPos = 50; }

          // Validar datos de la alerta
          if (!alert) return;

          const risk = alert.risk || 'Unknown';
          const color = risk === 'High' ? '#c0392b' :
                       risk === 'Medium' ? '#e67e22' :
                       risk === 'Low' ? '#f1c40f' : '#3498db';

          // Caja de la alerta
          doc.rect(50, yPos, doc.page.width - 100, 80).lineWidth(1).stroke(color);

          // Nombre
          const name = cleanTextForPDF(alert.name || 'Sin nombre');
          doc.fillColor(color).fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${name}`, 60, yPos + 5);

          // URL
          const urlAlert = alert.url || 'N/A';
          doc.fillColor('#333').fontSize(10).font('Helvetica')
             .text(`URL: ${urlAlert}`, 60, yPos + 20, { width: doc.page.width - 120, ellipsis: true });

          // Descripción (Limpieza doble por seguridad)
          if (alert.description) {
              const desc = cleanTextForPDF(String(alert.description)).substring(0, 150);
              doc.text(`Desc: ${desc}...`, 60, yPos + 35, { width: doc.page.width - 120 });
          }

          // Solución
          if (alert.solution) {
              const sol = cleanTextForPDF(String(alert.solution)).substring(0, 100);
              doc.fillColor('#2980b9').text(`Sol: ${sol}...`, 60, yPos + 50, { width: doc.page.width - 120 });
          }

          yPos += 90;
        } catch (e) {
          console.error(`⚠️ Error dibujando alerta ${index}, saltando...`, e.message);
          // No hacemos reject, solo saltamos esta alerta
        }
      });

      doc.end();
    } catch (error) {
      console.error('❌ Error critico en generateZapPDF:', error);
      reject(error);
    }
  });
}




export function generateZapCSV(alerts) {
  return new Promise((resolve, reject) => {
    try {
      const header = ['RIESGO', 'NOMBRE', 'CONFIDENZA', 'URL', 'DESCRIPCION', 'SOLUCION'];

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
        ].join(',');
      });

      const csvContent = [header.join(','), ...rows].join('\n');
      resolve(Buffer.from(csvContent, 'utf-8'));
    } catch (error) {
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

      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // --- PORTADA ---
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ecf0f1');
      doc.fillColor('#2c3e50').fontSize(36).text('INFORME RENDIMIENTO', 50, 150, { align: 'center' });
      doc.fontSize(24).fillColor('#3498db').text('Analisis Web Performance', 50, 200, { align: 'center' });
      doc.fontSize(14).fillColor('#7f8c8d').text(`URL: ${data.url || 'N/A'}`, 50, 300, { align: 'center' });
      doc.text(`Estrategia: ${data.strategy === 'mobile' ? 'Movil' : 'Escritorio'}`, 50, 320, { align: 'center' });
      doc.text(`Fecha: ${new Date().toLocaleString('es-ES')}`, 50, 340, { align: 'center' });

      // --- PÁGINA 1: RESUMEN ---
      doc.addPage();
      doc.fillColor('#2c3e50').fontSize(24).text('RESUMEN EJECUTIVO', 50, 50);

      let y = 100;

      // Categorías
      if (data.categories) {
        Object.values(data.categories).forEach(cat => {
          // Barra de fondo
          doc.rect(50, y, 400, 20).fill('#ecf0f1');
          // Barra de progreso
          const width = (cat.score / 100) * 400;
          doc.rect(50, y, width, 20).fill(getScoreColor(cat.score));

          // Texto (con limpieza)
          const titleClean = cleanTextForPDF(cat.title);
          doc.fillColor('#2c3e50').fontSize(12).text(`${titleClean}: ${Math.round(cat.score)}/100`, 50, y - 15);
          y += 50;
        });
      }

      // --- PÁGINA 2: MÉTRICAS CORE ---
      doc.addPage();
      doc.fillColor('#2c3e50').fontSize(24).text('METRICAS PRINCIPALES', 50, 50);

      y = 100;
      const coreMetrics = ['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time', 'first-contentful-paint'];

      if (data.metrics?.performance?.items) {
        data.metrics.performance.items
          .filter(m => coreMetrics.includes(m.id))
          .forEach(m => {
            // Fila de métrica
            doc.rect(50, y - 10, doc.page.width - 100, 60).fill('#fff').stroke('#ddd');

            const titleClean = cleanTextForPDF(m.title);
            const descClean = cleanTextForPDF(m.description);

            doc.fillColor('#2c3e50').fontSize(12).font('Helvetica-Bold').text(titleClean, 60, y);
            doc.fillColor('#7f8c8d').fontSize(10).text(descClean, 60, y + 20, { width: 300 });

            // Valor numérico
            const displayValue = m.displayValue || 'N/A';
            const score = m.score !== null ? Math.round(m.score * 100) : 0;

            doc.fillColor('#3498db').fontSize(14).font('Helvetica-Bold').text(displayValue, 400, y);
            doc.fillColor(getScoreColor(score)).fontSize(10).text(`Score: ${score}%`, 400, y + 20);

            y += 70;
          });
      }

      // --- PÁGINA 3: OPORTUNIDADES DE MEJORA ---
      doc.addPage();
      doc.fillColor('#c0392b').fontSize(24).text('OPORTUNIDADES DE MEJORA', 50, 50);

      y = 100;
      const opportunities = data.audits?.opportunities?.items || [];

      if (opportunities.length === 0) {
        doc.fillColor('#27ae60').text('No se encontraron oportunidades criticas.', 50, 100);
      } else {
        opportunities.slice(0, 10).forEach(audit => {
          if (y > 700) { doc.addPage(); y = 50; }

          doc.rect(50, y - 5, doc.page.width - 100, 5).fill('#c0392b');

          const titleClean = cleanTextForPDF(audit.title);
          const descClean = cleanTextForPDF(audit.description);

          doc.fillColor('#2c3e50').fontSize(11).font('Helvetica-Bold').text(titleClean, 50, y + 5);

          if (audit.displayValue) {
             doc.fillColor('#c0392b').fontSize(10).text(`Ahorro: ${audit.displayValue}`, 400, y + 5);
          }

          doc.fillColor('#555').fontSize(9).text(descClean, 50, y + 25, { width: doc.page.width - 120 });
          y += 60;
        });
      }

      // --- PÁGINA 4: AUDITORÍAS APROBADAS ---
      doc.addPage();
      doc.fillColor('#27ae60').fontSize(24).text('AUDITORIAS APROBADAS', 50, 50);

      y = 100;
      const passed = data.audits?.passed?.items || [];

      passed.slice(0, 20).forEach(audit => {
        if (y > 750) { doc.addPage(); y = 50; }
        const titleClean = cleanTextForPDF(audit.title);
        doc.fontSize(9).fillColor('#2c3e50').text(`- ${titleClean}`, 50, y);
        y += 15;
      });

      doc.end();

    } catch (error) {
      console.error('Error generando PDF:', error);
      reject(error);
    }
  });
}

// ==========================================
// FUNCIÓN GENERAR CSV PAGESPEED (RESTAURADA)
// ==========================================
export function generateCSV(data) {
  return new Promise((resolve, reject) => {
    try {
      const csvData = [];

      // 1. METADATOS DEL ANÁLISIS
      csvData.push(['SECCIÓN', 'CAMPO', 'VALOR', 'UNIDAD', 'PUNTUACIÓN', 'ESTADO']);
      csvData.push(['INFORMACIÓN GENERAL', 'URL', data.url || '', '', '', '']);
      csvData.push(['INFORMACIÓN GENERAL', 'Dispositivo', data.strategyLabel || data.strategy || '', '', '', '']);
      csvData.push(['INFORMACIÓN GENERAL', 'Fecha', new Date().toLocaleDateString('es-ES'), '', '', '']);
      csvData.push([]);

      // 2. CATEGORÍAS COMPLETAS
      csvData.push(['CATEGORÍAS', 'Nombre', 'Puntuación', 'Estado', 'Descripción', 'Prioridad']);
      if (data.categories) {
        Object.values(data.categories).forEach(cat => {
          const estado = cat.score >= 90 ? 'EXCELENTE' :
                        cat.score >= 70 ? 'BUENO' :
                        cat.score >= 50 ? 'REGULAR' : 'MEJORABLE';

          const cleanTitle = cleanTextForPDF(cat.title);
          const cleanDesc = cleanTextForPDF(cat.description);

          csvData.push(['CATEGORÍAS', cleanTitle, cat.score, estado, cleanDesc, 'ALTA']);
        });
      }
      csvData.push([]);

      // 3. TODAS LAS MÉTRICAS
      csvData.push(['MÉTRICAS', 'Nombre', 'Valor', 'Unidad', 'Score', 'Estado']);

      if (data.metrics?.performance) {
        const metricsItems = Array.isArray(data.metrics?.performance?.items)
          ? data.metrics.performance.items
          : Object.values(data.metrics?.performance || {});

        metricsItems.forEach(metric => {
          const estado =
            metric.score >= 0.9 ? 'EXCELENTE' :
            metric.score >= 0.5 ? 'BUENO' :
            'MEJORABLE';

          const cleanTitle = cleanTextForPDF(metric.title);

          csvData.push([
            'MÉTRICAS',
            cleanTitle,
            metric.numericValue || '',
            metric.numericUnit || '',
            metric.score != null ? Math.round(metric.score * 100) : '',
            estado
          ]);
        });
      }

      csvData.push([]);

      // 4. AUDITORÍAS DETALLADAS
      csvData.push(['AUDITORÍAS', 'Tipo', 'Título', 'Descripción', 'Ahorro', 'Score', 'Severidad']);

      // Oportunidades
      if (data.audits?.opportunities) {
        const opportunityItems = Array.isArray(data.audits?.opportunities?.items)
          ? data.audits.opportunities.items
          : Object.values(data.audits?.opportunities || {});

        opportunityItems.forEach(audit => {
          const cleanTitle = cleanTextForPDF(audit.title);
          const cleanDesc = cleanTextForPDF(audit.description);

          csvData.push([
            'AUDITORÍAS',
            'OPORTUNIDAD',
            cleanTitle,
            cleanDesc?.substring(0, 200) || '',
            audit.displayValue || '',
            audit.score ? Math.round(audit.score * 100) : '',
            'ALTA'
          ]);
        });
      }

      // Aprobadas
      if (data.audits?.passed) {
        const passedItems = Array.isArray(data.audits?.passed?.items)
          ? data.audits.passed.items
          : Object.values(data.audits?.passed || {});

        passedItems.forEach(audit => {
           const cleanTitle = cleanTextForPDF(audit.title);

          csvData.push([
            'AUDITORÍAS',
            'APROBADA',
            cleanTitle,
            cleanTextForPDF(audit.description)?.substring(0, 200) || '',
            '',
            audit.score ? Math.round(audit.score * 100) : '',
            'BAJA'
          ]);
        });
      }
      csvData.push([]);

     // 5. DIAGNÓSTICOS COMPLETOS
     csvData.push(['DIAGNÓSTICOS', 'ID', 'Título', 'Descripción', 'Valor', 'Severidad', 'Impacto', 'Score']);

     const diagnostics = Array.isArray(data.diagnostics)
       ? data.diagnostics
       : Object.values(data.diagnostics || {});

     diagnostics.forEach(diag => {
       const cleanTitle = cleanTextForPDF(diag.title);
       const cleanDesc = cleanTextForPDF(diag.description);

       csvData.push([
         'DIAGNÓSTICOS',
         diag.id || 'N/A',
         cleanTitle,
         cleanDesc.substring(0, 200).replace(/"/g, '""'),
         diag.displayValue || 'N/A',
         diag.severity || 'MEDIA',
         diag.impact || 'ALTO',
         diag.score !== undefined ? Math.round(diag.score * 100) : 'N/A'
       ]);
     });

     csvData.push([]);

      // 6. RECOMENDACIONES COMPLETAS
      csvData.push(['RECOMENDACIONES', 'Prioridad', 'Título', 'Descripción', 'Impacto', 'Acción', 'AuditID', 'Ahorro Estimado']);

      const recommendations = Array.isArray(data.recommendations)
        ? data.recommendations
        : Object.values(data.recommendations || {});

      recommendations.forEach(rec => {
        const cleanTitle = cleanTextForPDF(rec.title);
        const cleanDesc = cleanTextForPDF(rec.description);

        csvData.push([
          'RECOMENDACIONES',
          rec.priority || 'MEDIA',
          cleanTitle,
          cleanDesc.substring(0, 150).replace(/"/g, '""'),
          rec.impact || '',
          rec.action || '',
          rec.auditId || '',
          rec.estimatedSavings || ''
        ]);
      });

      csvData.push([]);

      // Convertir a string CSV
      const csvContent = csvData.map(row =>
        row.map(cell => {
          const cellStr = String(cell || '');
          return `"${cellStr.replace(/"/g, '""')}"`;
        }).join(',')
      ).join('\n');

      resolve(csvContent);
    } catch (error) {
      reject(error);
    }
  });
}