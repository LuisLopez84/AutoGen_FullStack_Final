import PDFDocument from 'pdfkit';
import { createObjectCsvWriter } from 'csv-writer';

// ========== FUNCIÓN PARA EXPORTAR A PDF ==========
export function generatePDF(data, language = 'es') {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Configuración inicial
      doc.fontSize(20).font('Helvetica-Bold').text('📊 INFORME DE ANÁLISIS WEB', { align: 'center' });
      doc.moveDown();

      // Información básica
      doc.fontSize(12).font('Helvetica');
      doc.text(`URL: ${data.url}`);
      doc.text(`Dispositivo: ${data.strategyLabel || (data.strategy === 'mobile' ? 'Móvil' : 'Escritorio')}`);
      doc.text(`Fecha: ${data.fecha || new Date().toLocaleDateString('es-ES')}`);
      doc.moveDown();

      // Puntuaciones por categoría
      doc.fontSize(16).font('Helvetica-Bold').text('📈 PUNTUACIONES POR CATEGORÍA');
      doc.moveDown();

      if (data.categories) {
        Object.values(data.categories).forEach(cat => {
          const scoreColor = cat.score >= 90 ? '#27ae60' : cat.score >= 70 ? '#f39c12' : '#e74c3c';
          doc.fontSize(12).font('Helvetica-Bold').text(cat.title, { continued: true });
          doc.font('Helvetica').text(`: ${cat.score}/100`, { color: scoreColor });
          doc.fontSize(10).font('Helvetica').text(cat.description, { indent: 20 });
          doc.moveDown(0.5);
        });
      }

      // Core Web Vitals
      doc.addPage();
      doc.fontSize(16).font('Helvetica-Bold').text('🌐 CORE WEB VITALS');
      doc.moveDown();

      if (data.metrics?.performance) {
        const vitals = ['largest-contentful-paint', 'cumulative-layout-shift', 'interaction-to-next-paint'];
        vitals.forEach(key => {
          const metric = data.metrics.performance[key];
          if (metric) {
            doc.fontSize(12).font('Helvetica-Bold').text(metric.title);
            doc.fontSize(11).font('Helvetica').text(`Valor: ${metric.displayValue || 'N/A'}`);
            doc.fontSize(10).text(metric.description, { indent: 20 });
            doc.moveDown(0.5);
          }
        });
      }

      // Auditorías
      doc.addPage();
      doc.fontSize(16).font('Helvetica-Bold').text('📋 AUDITORÍAS');
      doc.moveDown();

      if (data.audits?.opportunities) {
        doc.fontSize(14).font('Helvetica-Bold').text('🔴 Oportunidades de Mejora');
        Object.entries(data.audits.opportunities).slice(0, 10).forEach(([key, audit]) => {
          doc.fontSize(11).font('Helvetica-Bold').text(`• ${audit.title}`);
          doc.fontSize(10).text(audit.description, { indent: 20 });
          if (audit.displayValue) {
            doc.fontSize(10).text(`Ahorro: ${audit.displayValue}`, { indent: 20, color: '#e74c3c' });
          }
          doc.moveDown(0.3);
        });
      }

      // Recomendaciones
      if (data.recommendations?.length > 0) {
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold').text('💡 RECOMENDACIONES');
        doc.moveDown();

        data.recommendations.slice(0, 15).forEach(rec => {
          const priorityColor = rec.priority === 'ALTA' ? '#e74c3c' : rec.priority === 'MEDIA' ? '#f39c12' : '#3498db';
          doc.fontSize(12).font('Helvetica-Bold').text(`[${rec.priority}] ${rec.title}`, { color: priorityColor });
          doc.fontSize(10).font('Helvetica').text(rec.description, { indent: 20 });
          if (rec.impact) doc.fontSize(10).text(`Impacto: ${rec.impact}`, { indent: 20 });
          if (rec.action) doc.fontSize(10).text(`Acción: ${rec.action}`, { indent: 20 });
          doc.moveDown(0.5);
        });
      }

      // Pie de página
      doc.fontSize(8).text(`Generado por AutoGen Performance Analyzer • ${new Date().toLocaleString('es-ES')}`, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// ========== FUNCIÓN PARA EXPORTAR A CSV ==========
export function generateCSV(data) {
  return new Promise((resolve, reject) => {
    try {
      // Preparar datos para CSV
      const csvData = [];

      // 1. Información general
      csvData.push(['SECCIÓN', 'CAMPO', 'VALOR', 'UNIDAD', 'PUNTUACIÓN']);
      csvData.push(['INFORMACIÓN GENERAL', 'URL', data.url, '', '']);
      csvData.push(['INFORMACIÓN GENERAL', 'Dispositivo', data.strategyLabel || data.strategy, '', '']);
      csvData.push(['INFORMACIÓN GENERAL', 'Fecha', data.fecha, '', '']);
      csvData.push(['INFORMACIÓN GENERAL', 'Puntuación Total', data.summary?.performanceScore || 0, '', '']);
      csvData.push([]);

      // 2. Categorías
      csvData.push(['CATEGORÍAS', 'Nombre', 'Puntuación', 'Estado', 'Descripción']);
      if (data.categories) {
        Object.values(data.categories).forEach(cat => {
          const estado = cat.score >= 90 ? 'EXCELENTE' : cat.score >= 70 ? 'BUENO' : cat.score >= 50 ? 'REGULAR' : 'MEJORABLE';
          csvData.push(['CATEGORÍAS', cat.title, cat.score, estado, cat.description]);
        });
      }
      csvData.push([]);

      // 3. Core Web Vitals
      csvData.push(['CORE WEB VITALS', 'Métrica', 'Valor', 'Unidad', 'Score']);
      if (data.metrics?.performance) {
        const vitals = [
          'first-contentful-paint',
          'largest-contentful-paint',
          'cumulative-layout-shift',
          'interaction-to-next-paint',
          'total-blocking-time'
        ];

        vitals.forEach(key => {
          const metric = data.metrics.performance[key];
          if (metric) {
            csvData.push([
              'CORE WEB VITALS',
              metric.title,
              metric.numericValue || '',
              metric.numericUnit || '',
              metric.score ? Math.round(metric.score * 100) : ''
            ]);
          }
        });
      }
      csvData.push([]);

      // 4. Auditorías críticas (oportunidades)
      csvData.push(['OPORTUNIDADES', 'Auditoría', 'Descripción', 'Ahorro Estimado', 'Severidad']);
      if (data.audits?.opportunities) {
        Object.entries(data.audits.opportunities).slice(0, 20).forEach(([key, audit]) => {
          const severidad = audit.score >= 0.9 ? 'BAJA' : audit.score >= 0.5 ? 'MEDIA' : 'ALTA';
          csvData.push([
            'OPORTUNIDADES',
            audit.title,
            audit.description?.substring(0, 100) || '',
            audit.displayValue || '',
            severidad
          ]);
        });
      }
      csvData.push([]);

      // 5. Recomendaciones
      csvData.push(['RECOMENDACIONES', 'Prioridad', 'Título', 'Descripción', 'Impacto']);
      if (data.recommendations) {
        data.recommendations.slice(0, 15).forEach(rec => {
          csvData.push([
            'RECOMENDACIONES',
            rec.priority,
            rec.title,
            rec.description,
            rec.impact || ''
          ]);
        });
      }

      // Convertir a string CSV
      const csvContent = csvData.map(row =>
        row.map(cell => {
          // Escapar comillas y comas
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