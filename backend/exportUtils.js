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

function cleanTextForPDF(text) {
  if (!text) return '';
  // Limpieza básica de caracteres raros
  return text.toString().replace(/[\u{0080}-\u{FFFF}]/gu, '');
}

// ==========================================
// EXPORTACIONES ZAP (SEGURIDAD)
// ==========================================

export function generateZapPDF(alerts, url) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // --- PORTADA ---
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#2c3e50');
      doc.fillColor('#ffffff').fontSize(32).text('🛡️ INFORME DE SEGURIDAD', 50, 200, { align: 'center' });
      doc.fontSize(18).text('Análisis OWASP ZAP', 50, 250, { align: 'center' });
      doc.fontSize(12).fillColor('#bdc3c7').text(`Objetivo: ${url}`, 50, 300, { align: 'center' });
      doc.text(`Fecha: ${new Date().toLocaleString('es-ES')}`, 50, 320, { align: 'center' });

      // --- PÁGINA 1: RESUMEN ---
      doc.addPage();
      doc.fillColor('#2c3e50').fontSize(20).text('RESUMEN DE RIESGOS', 50, 50);

      const summary = { High: 0, Medium: 0, Low: 0, Informational: 0 };
      alerts.forEach(a => { if (summary[a.risk] !== undefined) summary[a.risk]++; });

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
      yPos = 80;

      alerts.forEach((alert, index) => {
        if (yPos > 700) { doc.addPage(); yPos = 50; }

        const color = alert.risk === 'High' ? '#c0392b' : alert.risk === 'Medium' ? '#e67e22' : alert.risk === 'Low' ? '#f1c40f' : '#3498db';

        // Caja de la alerta
        doc.rect(50, yPos, doc.page.width - 100, 80).lineWidth(1).stroke(color);

        doc.fillColor(color).fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${alert.name}`, 60, yPos + 5);
        doc.fillColor('#333').fontSize(10).font('Helvetica')
           .text(`URL: ${alert.url}`, 60, yPos + 20, { width: doc.page.width - 120, ellipsis: true });

        if (alert.description) {
            doc.text(`Descripción: ${cleanTextForPDF(alert.description).substring(0, 150)}...`, 60, yPos + 35, { width: doc.page.width - 120 });
        }

        if (alert.solution) {
            doc.fillColor('#2980b9').text(`Solución: ${cleanTextForPDF(alert.solution).substring(0, 100)}...`, 60, yPos + 50, { width: doc.page.width - 120 });
        }

        yPos += 90;
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function generateZapCSV(alerts) {
  return new Promise((resolve, reject) => {
    try {
      // Generamos el CSV manualmente en memoria para evitar errores de escritura en disco
      const header = ['RIESGO', 'NOMBRE', 'CONFIDENZA', 'URL', 'DESCRIPCION', 'SOLUCION'];

      const rows = alerts.map(alert => {
        // Escapar comillas dobles para formato CSV válido
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
      doc.fillColor('#2c3e50').fontSize(36).text('⚡ Informe Rendimiento', 50, 150, { align: 'center' });
      doc.fontSize(24).fillColor('#3498db').text('Análisis Web Performance', 50, 200, { align: 'center' });
      doc.fontSize(14).fillColor('#7f8c8d').text(`URL: ${data.url || 'N/A'}`, 50, 300, { align: 'center' });
      doc.text(`Estrategia: ${data.strategy === 'mobile' ? 'Móvil' : 'Escritorio'}`, 50, 320, { align: 'center' });
      doc.text(`Fecha: ${new Date().toLocaleString('es-ES')}`, 50, 340, { align: 'center' });

      // --- PÁGINA 1: RESUMEN ---
      doc.addPage();
      doc.fillColor('#2c3e50').fontSize(24).text('📊 Resumen Ejecutivo', 50, 50);

      let y = 100;

      // Categorías
      if (data.categories) {
        Object.values(data.categories).forEach(cat => {
          // Barra de fondo
          doc.rect(50, y, 400, 20).fill('#ecf0f1');
          // Barra de progreso
          const width = (cat.score / 100) * 400;
          doc.rect(50, y, width, 20).fill(getScoreColor(cat.score));

          // Texto
          doc.fillColor('#2c3e50').fontSize(12).text(`${cleanTextForPDF(cat.title)}: ${Math.round(cat.score)}/100`, 50, y - 15);
          y += 50;
        });
      }

      // --- PÁGINA 2: MÉTRICAS CORE ---
      doc.addPage();
      doc.fillColor('#2c3e50').fontSize(24).text('📈 Métricas Principales (Core Web Vitals)', 50, 50);

      y = 100;
      const coreMetrics = ['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time', 'first-contentful-paint'];

      if (data.metrics?.performance?.items) {
        data.metrics.performance.items
          .filter(m => coreMetrics.includes(m.id))
          .forEach(m => {
            // Fila de métrica
            doc.rect(50, y - 10, doc.page.width - 100, 60).fill('#fff').stroke('#ddd');

            doc.fillColor('#2c3e50').fontSize(12).font('Helvetica-Bold').text(cleanTextForPDF(m.title), 60, y);
            doc.fillColor('#7f8c8d').fontSize(10).text(cleanTextForPDF(m.description), 60, y + 20, { width: 300 });

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
      doc.fillColor('#c0392b').fontSize(24).text('🔴 Oportunidades de Mejora', 50, 50);

      y = 100;
      const opportunities = data.audits?.opportunities?.items || [];

      if (opportunities.length === 0) {
        doc.fillColor('#27ae60').text('✅ No se encontraron oportunidades críticas.', 50, 100);
      } else {
        opportunities.slice(0, 10).forEach(audit => {
          if (y > 700) { doc.addPage(); y = 50; }

          doc.rect(50, y - 5, doc.page.width - 100, 5).fill('#c0392b'); // Barra roja superior
          doc.fillColor('#2c3e50').fontSize(11).font('Helvetica-Bold').text(cleanTextForPDF(audit.title), 50, y + 5);

          if (audit.displayValue) {
             doc.fillColor('#c0392b').fontSize(10).text(`Ahorro: ${audit.displayValue}`, 400, y + 5);
          }

          doc.fillColor('#555').fontSize(9).text(cleanTextForPDF(audit.description), 50, y + 25, { width: doc.page.width - 120 });
          y += 60;
        });
      }

      // --- PÁGINA 4: AUDITORÍAS APROBADAS ---
      doc.addPage();
      doc.fillColor('#27ae60').fontSize(24).text('✅ Auditorías Aprobadas', 50, 50);

      y = 100;
      const passed = data.audits?.passed?.items || [];

      // Tabla simple para passed audits
      passed.slice(0, 20).forEach(audit => {
        if (y > 750) { doc.addPage(); y = 50; }
        doc.fontSize(9).fillColor('#2c3e50').text(`• ${cleanTextForPDF(audit.title)}`, 50, y);
        y += 15;
      });

      doc.end();

    } catch (error) {
      console.error('Error generando PDF:', error);
      reject(error);
    }
  });
}