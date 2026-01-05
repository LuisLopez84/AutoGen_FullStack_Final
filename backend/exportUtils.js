import PDFDocument from 'pdfkit';
import { createObjectCsvWriter } from 'csv-writer';

// ========== FUNCIÓN PARA EXPORTAR A PDF MEJORADA ==========
export function generatePDF(data, language = 'es') {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        font: 'Helvetica'
      });

      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ========== PORTADA ==========
      doc.rect(0, 0, doc.page.width, doc.page.height)
         .fill('#2c3e50');

      doc.fillColor('#ffffff')
         .fontSize(36)
         .font('Helvetica-Bold')
         .text('📊 INFORME COMPLETO', 50, 150, {
           align: 'center',
           width: doc.page.width - 100
         });

      doc.fontSize(24)
         .text('ANÁLISIS DE PERFORMANCE WEB', 50, 220, {
           align: 'center',
           width: doc.page.width - 100,
           color: '#3498db'
         });

      // Información básica en portada
      doc.fontSize(14)
         .font('Helvetica')
         .fillColor('#ecf0f1')
         .text('URL Analizada:', 50, 320, { continued: true });

      doc.font('Helvetica-Bold')
         .text(` ${data.url}`, { color: '#3498db' });

      doc.font('Helvetica')
         .text(`Dispositivo: ${data.strategyLabel || (data.strategy === 'mobile' ? '📱 Móvil' : '🖥️ Escritorio')}`, 50, 350);

      doc.text(`Fecha del Análisis: ${data.fecha || new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, 50, 380);

      doc.text(`Generado por: AutoGen Performance Analyzer v2.0`, 50, 410);

      // ========== PÁGINA 2: RESUMEN EJECUTIVO ==========
      doc.addPage();
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text('📊 RESUMEN EJECUTIVO', 50, 50, {
           width: doc.page.width - 100,
           align: 'center'
         });
      doc.moveDown(2);

      // Puntuaciones por categoría con barras de progreso
      if (data.categories) {
        doc.moveDown();
        doc.fontSize(16).font('Helvetica-Bold').text('PUNTUACIONES POR CATEGORÍA');
        doc.moveDown(0.5);

        Object.values(data.categories).forEach((cat, index) => {
          const y = doc.y;
          const scoreColor = getScoreColor(cat.score);

          // Nombre de la categoría
          doc.fontSize(12).font('Helvetica-Bold').text(cat.title, 50, y);

          // Puntuación numérica
          doc.text(`${cat.score}/100`, 400, y, { align: 'right' });

          // Barra de progreso
          const barWidth = 300;
          const barHeight = 15;
          const fillWidth = (cat.score / 100) * barWidth;

          // Fondo de la barra
          doc.rect(50, y + 20, barWidth, barHeight)
             .fill('#ecf0f1');

          // Relleno según puntuación
          doc.rect(50, y + 20, fillWidth, barHeight)
             .fill(scoreColor);

          // Etiqueta de calidad
          const qualityLabel = getQualityLabel(cat.score);
          doc.fontSize(10).font('Helvetica-Bold')
             .fillColor('#ffffff')
             .text(qualityLabel, 50 + fillWidth/2 - 20, y + 22, { width: 40, align: 'center' });

          // Descripción
          doc.fillColor('#666666')
             .fontSize(10).font('Helvetica')
             .text(cat.description || '', 50, y + 45, {
               width: 400,
               indent: 20
             });

          doc.moveDown(2);
        });
      }

      // ========== PÁGINA 3: MÉTRICAS DETALLADAS ==========
      doc.addPage();
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text('📈 MÉTRICAS DETALLADAS', 50, 50, {
           width: doc.page.width - 100,
           align: 'center'
         });
      doc.moveDown(2);


      if (data.metrics?.performance) {
        const vitalMetrics = ['largest-contentful-paint', 'cumulative-layout-shift', 'interaction-to-next-paint'];

        vitalMetrics.forEach((key, index) => {
          const metric = data.metrics.performance[key];
          if (!metric) return;

          const y = doc.y;
          const rowColor = index % 2 === 0 ? '#f8f9fa' : '#ffffff';

          // Fondo de fila
          doc.rect(50, y - 10, doc.page.width - 100, 80)
             .fill(rowColor);

          // Título de métrica
          doc.fontSize(14).font('Helvetica-Bold')
             .fillColor('#2c3e50')
             .text(metric.title, 60, y);

          // Valor de métrica
          if (metric.displayValue) {
            doc.fontSize(16).font('Helvetica-Bold')
               .fillColor('#3498db')
               .text(metric.displayValue, 400, y, { align: 'right' });
          }

          // Puntuación con icono
          if (metric.score !== null) {
            const scorePercent = Math.round(metric.score * 100);
            const scoreColor = getScoreColor(scorePercent);
            const scoreIcon = getScoreIcon(scorePercent);

            doc.fontSize(12)
               .fillColor(scoreColor)
               .text(`${scoreIcon} ${scorePercent}/100`, 450, y + 5);
          }

          // Descripción
          doc.fontSize(10).font('Helvetica')
             .fillColor('#666666')
             .text(metric.description || '', 60, y + 25, {
               width: 400
             });

          // Valor numérico si existe
          if (metric.numericValue) {
            doc.fontSize(10)
               .fillColor('#7f8c8d')
               .text(`Valor: ${metric.numericValue} ${metric.numericUnit || ''}`, 60, y + 45);
          }

          doc.moveDown(4);
        });

        // Tabla de todas las métricas
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold')
           .fillColor('#2c3e50')
           .text('TABLA COMPLETA DE MÉTRICAS', 50, doc.y);
        doc.moveDown();

        // Encabezados de tabla
        const tableTop = doc.y;
        const headers = ['Métrica', 'Valor', 'Puntuación', 'Estado'];
        const colWidths = [250, 100, 80, 100];

        // Encabezados
        doc.fontSize(11).font('Helvetica-Bold')
           .fillColor('#ffffff')
           .rect(50, tableTop, doc.page.width - 100, 25)
           .fill('#3498db');

        let xPos = 50;
        headers.forEach((header, i) => {
          doc.text(header, xPos + 10, tableTop + 8, {
            width: colWidths[i],
            align: 'left'
          });
          xPos += colWidths[i];
        });

        // Filas de datos
        let currentY = tableTop + 25;
        Object.entries(data.metrics.performance).forEach(([key, metric]) => {
          if (currentY > doc.page.height - 100) {
            doc.addPage();
            currentY = 50;
          }

          // Fondo alternado
          const rowIndex = Object.keys(data.metrics.performance).indexOf(key);
          const rowBg = rowIndex % 2 === 0 ? '#f8f9fa' : '#ffffff';

          doc.rect(50, currentY, doc.page.width - 100, 25)
             .fill(rowBg);

          // Contenido
          xPos = 50;

          // Nombre de métrica
          doc.fontSize(10).font('Helvetica')
             .fillColor('#2c3e50')
             .text(metric.title.substring(0, 40) + (metric.title.length > 40 ? '...' : ''),
                   xPos + 5, currentY + 8, { width: colWidths[0] - 10 });
          xPos += colWidths[0];

          // Valor
          doc.text(metric.displayValue || 'N/A', xPos + 5, currentY + 8, { width: colWidths[1] - 10 });
          xPos += colWidths[1];

          // Puntuación
          const score = metric.score !== null ? Math.round(metric.score * 100) : 'N/A';
          const scoreColor = getScoreColor(score);
          doc.fillColor(scoreColor)
             .text(score !== 'N/A' ? `${score}/100` : 'N/A', xPos + 5, currentY + 8, { width: colWidths[2] - 10 });
          xPos += colWidths[2];

          // Estado
          const status = getQualityLabel(score);
          const statusColor = getStatusColor(status);
          doc.fillColor(statusColor)
             .text(status, xPos + 5, currentY + 8, { width: colWidths[3] - 10 });

          currentY += 25;
          doc.y = currentY;
        });
      }

      // ========== PÁGINA 4: AUDITORÍAS ==========
      doc.addPage();
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text('📋 AUDITORÍAS DETALLADAS', 50, 50, {
           width: doc.page.width - 100,
           align: 'center'
         });
      doc.moveDown(2);


      if (data.audits) {
        const { passed, opportunities, informational } = data.audits;

        // Oportunidades de mejora (CRÍTICAS)
        doc.fontSize(16).font('Helvetica-Bold')
           .fillColor('#e74c3c')
           .text('🔴 OPORTUNIDADES DE MEJORA', 50, doc.y);
        doc.moveDown(0.5);

        if (opportunities && Object.keys(opportunities).length > 0) {
          Object.entries(opportunities).slice(0, 10).forEach(([key, audit], index) => {
            renderAuditItem(doc, audit, index, 'oportunidad');
          });
        } else {
          doc.fontSize(12).font('Helvetica')
             .fillColor('#27ae60')
             .text('✅ No se encontraron oportunidades críticas de mejora', 50, doc.y);
          doc.moveDown();
        }

        // Auditorías aprobadas
        if (passed && Object.keys(passed).length > 0) {
          doc.addPage();
          doc.fontSize(16).font('Helvetica-Bold')
             .fillColor('#27ae60')
             .text('✅ AUDITORÍAS APROBADAS', 50, doc.y);
          doc.moveDown(0.5);

          Object.entries(passed).slice(0, 15).forEach(([key, audit], index) => {
            renderAuditItem(doc, audit, index, 'aprobada');
          });
        }
      }

      // ========== PÁGINA 5: DIAGNÓSTICOS ==========
            doc.addPage();
            doc.fontSize(24)
               .font('Helvetica-Bold')
               .fillColor('#2c3e50')
               .text('🔍 DIAGNÓSTICOS ESPECÍFICOS', 50, 50, {
                 width: doc.page.width - 100,
                 align: 'center'
               });
            doc.moveDown(2);


      if (data.diagnostics && data.diagnostics.length > 0) {
        data.diagnostics.slice(0, 10).forEach((diag, index) => {
          const y = doc.y;
          const severityColor = getSeverityColor(diag.severity);

          // Tarjeta de diagnóstico
          doc.roundedRect(50, y - 10, doc.page.width - 100, 90, 5)
             .lineWidth(2)
             .stroke(severityColor)
             .fill('#fff9e6');

          // Encabezado
          doc.fontSize(14).font('Helvetica-Bold')
             .fillColor('#2c3e50')
             .text(diag.title, 60, y);

          // Severidad
          doc.fontSize(11)
             .fillColor('#ffffff')
             .rect(doc.page.width - 150, y - 5, 80, 20, 10)
             .fill(severityColor);

          doc.text(diag.severity?.toUpperCase() || 'MEDIA',
                   doc.page.width - 150 + 10, y, { width: 60, align: 'center' });

          // Valor
          if (diag.displayValue) {
            doc.fontSize(12).font('Helvetica-Bold')
               .fillColor('#e67e22')
               .text(diag.displayValue, 60, y + 25);
          }

          // Descripción
          if (diag.description) {
            doc.fontSize(10).font('Helvetica')
               .fillColor('#666666')
               .text(diag.description.substring(0, 200) +
                     (diag.description.length > 200 ? '...' : ''),
                     60, y + 45, { width: doc.page.width - 160 });
                               }

                               doc.moveDown(5);
                             });
                           }

                           // ========== PÁGINA 6: RECOMENDACIONES ==========
                                       doc.addPage();
                                       doc.fontSize(24)
                                          .font('Helvetica-Bold')
                                          .fillColor('#2c3e50')
                                          .text('💡 RECOMENDACIONES PRIORIZADAS', 50, 50, {
                                            width: doc.page.width - 100,
                                            align: 'center'
                                          });
                                       doc.moveDown(2);


                           if (data.recommendations && data.recommendations.length > 0) {
                             // Agrupar por prioridad
                             const highPriority = data.recommendations.filter(r => r.priority === 'ALTA' || r.priority === 'HIGH');
                             const mediumPriority = data.recommendations.filter(r => r.priority === 'MEDIA' || r.priority === 'MEDIUM');
                             const lowPriority = data.recommendations.filter(r => r.priority === 'BAJA' || r.priority === 'LOW');

                             // Alta Prioridad
                             if (highPriority.length > 0) {
                               doc.fontSize(16).font('Helvetica-Bold')
                                  .fillColor('#e74c3c')
                                  .text('🔥 ALTA PRIORIDAD', 50, doc.y);
                               doc.moveDown(0.5);

                               highPriority.slice(0, 5).forEach((rec, index) => {
                                 renderRecommendationItem(doc, rec, index, 'alta');
                               });
                             }

                             // Media Prioridad
                             if (mediumPriority.length > 0) {
                               doc.addPage();
                               doc.fontSize(16).font('Helvetica-Bold')
                                  .fillColor('#f39c12')
                                  .text('⚠️ PRIORIDAD MEDIA', 50, doc.y);
                               doc.moveDown(0.5);

                               mediumPriority.slice(0, 5).forEach((rec, index) => {
                                 renderRecommendationItem(doc, rec, index, 'media');
                               });
                             }

                             // Baja Prioridad
                             if (lowPriority.length > 0) {
                               doc.addPage();
                               doc.fontSize(16).font('Helvetica-Bold')
                                  .fillColor('#3498db')
                                  .text('📋 PRIORIDAD BAJA', 50, doc.y);
                               doc.moveDown(0.5);

                               lowPriority.slice(0, 5).forEach((rec, index) => {
                                 renderRecommendationItem(doc, rec, index, 'baja');
                               });
                             }
                           }

                           // ========== PÁGINA 7: EXPERIENCIA DE CARGA REAL ==========
                           if (data.loadingExperience) {
                                                                  doc.addPage();
                                                                  doc.fontSize(24)
                                                                     .font('Helvetica-Bold')
                                                                     .fillColor('#2c3e50')
                                                                     .text('📱 EXPERIENCIA REAL DE USUARIOS', 50, 50, {
                                                                       width: doc.page.width - 100,
                                                                       align: 'center'
                                                                     });
                                                                  doc.moveDown(2);


                             const exp = data.loadingExperience;

                             // Tarjeta principal
                             doc.roundedRect(50, doc.y, doc.page.width - 100, 150, 10)
                                .fill('#e8f4fd');

                             doc.fontSize(18).font('Helvetica-Bold')
                                .fillColor('#2c3e50')
                                .text('Métricas de Campo (Datos Reales)', 70, doc.y + 20);

                             if (exp.overall_category) {
                               const categoryColor = getCategoryColor(exp.overall_category);
                               doc.fontSize(14)
                                  .fillColor(categoryColor)
                                  .text(`Categoría General: ${exp.overall_category}`, 70, doc.y + 50);
                             }

                             if (exp.metrics) {
                               let metricY = doc.y + 80;
                               Object.entries(exp.metrics).slice(0, 3).forEach(([key, metric]) => {
                                 const metricName = key.replace(/-/g, ' ').toUpperCase();
                                 doc.fontSize(12).font('Helvetica-Bold')
                                    .fillColor('#2c3e50')
                                    .text(`• ${metricName}:`, 70, metricY);

                                 doc.fontSize(11).font('Helvetica')
                                    .fillColor(getCategoryColor(metric.category))
                                    .text(metric.category, 200, metricY);

                                 metricY += 20;
                               });
                             }

                             doc.moveDown(8);
                           }

                           // ========== PIE DE PÁGINA ==========
                           /*
                           const totalPages = doc.bufferedPageRange().count;
                           for (let i = 0; i < totalPages; i++) {
                             doc.switchToPage(i);

                             // Pie de página
                             doc.fontSize(8)
                                .fillColor('#7f8c8d')
                                .text(
                                  `Página ${i + 1} de ${totalPages} • Generado por AutoGen Performance Analyzer • ${new Date().toLocaleString('es-ES')}`,
                                  50,
                                  doc.page.height - 30,
                                  { align: 'center', width: doc.page.width - 100 }
                                );
                           }
                           */

                           doc.end();

                         } catch (error) {
                           reject(error);
                         }
                       });
                     }

  // ========== FUNCIONES AUXILIARES PARA PDF ==========

  function addSectionHeader(doc, title) {
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text(title, 50, 50, {
         width: doc.page.width - 100,
         align: 'center'
       });

    doc.moveDown();
  }

  function getScoreColor(score) {
    if (score >= 90) return "#27ae60";
    if (score >= 70) return "#f39c12";
    if (score >= 50) return "#e67e22";
    return "#e74c3c";
  }

  function getQualityLabel(score) {
    if (score >= 90) return "Excelente";
    if (score >= 70) return "Bueno";
    if (score >= 50) return "Regular";
    return "Mejorable";
  }

  function getScoreIcon(score) {
    if (score >= 90) return "✅";
    if (score >= 70) return "⚠️";
    return "❌";
  }

  function getStatusColor(status) {
    switch(status.toLowerCase()) {
      case 'excelente': return '#27ae60';
      case 'bueno': return '#f39c12';
      case 'regular': return '#e67e22';
      case 'mejorable': return '#e74c3c';
      default: return '#7f8c8d';
    }
  }

  function getSeverityColor(severity) {
    switch((severity || '').toLowerCase()) {
      case 'alta':
      case 'high': return '#e74c3c';
      case 'media':
      case 'medium': return '#f39c12';
      case 'baja':
      case 'low': return '#3498db';
      default: return '#95a5a6';
    }
  }

  function getCategoryColor(category) {
    switch((category || '').toUpperCase()) {
      case 'FAST':
      case 'RÁPIDO': return '#27ae60';
      case 'AVERAGE':
      case 'PROMEDIO': return '#f39c12';
      case 'SLOW':
      case 'LENTO': return '#e74c3c';
      default: return '#95a5a6';
    }
  }

  function renderAuditItem(doc, audit, index, type) {
    const y = doc.y;
    const rowColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
    const borderColor = type === 'oportunidad' ? '#e74c3c' :
                       type === 'aprobada' ? '#27ae60' : '#3498db';

    // Tarjeta de auditoría
    doc.roundedRect(50, y - 10, doc.page.width - 100, 70, 5)
       .lineWidth(1)
       .stroke(borderColor)
       .fill(rowColor);

    // Título
    doc.fontSize(12).font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text(audit.title, 60, y, {
         width: doc.page.width - 200,
         ellipsis: true
       });

    // Puntuación
    if (audit.score !== null) {
      const scorePercent = Math.round(audit.score * 100);
      const scoreColor = getScoreColor(scorePercent);

      doc.fontSize(11)
         .fillColor(scoreColor)
         .text(`${scorePercent}/100`, doc.page.width - 120, y, { align: 'right' });
    }

    // Valor mostrado
    if (audit.displayValue) {
      doc.fontSize(10).font('Helvetica')
         .fillColor('#e67e22')
         .text(audit.displayValue, 60, y + 20);
    }

    // Descripción (truncada)
    if (audit.description) {
      doc.fontSize(9)
         .fillColor('#666666')
         .text(audit.description.substring(0, 150) +
               (audit.description.length > 150 ? '...' : ''),
               60, y + 35, {
                 width: doc.page.width - 160
               });
    }

    doc.moveDown(3.5);
  }

  function renderRecommendationItem(doc, recommendation, index, priority) {
    const y = doc.y;
    const priorityColors = {
      alta: '#ffe6e6',
      media: '#fff3cd',
      baja: '#e8f4fd'
    };

    const bgColor = priorityColors[priority] || '#f8f9fa';

    // Tarjeta de recomendación
    doc.roundedRect(50, y - 10, doc.page.width - 100, 90, 8)
       .fill(bgColor);

    // Título con icono de prioridad
    const priorityIcons = {
      alta: '🔥',
      media: '⚠️',
      baja: '📋'
    };

    doc.fontSize(14).font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text(`${priorityIcons[priority]} ${recommendation.title}`, 60, y);

    // Descripción
    if (recommendation.description) {
      doc.fontSize(10).font('Helvetica')
         .fillColor('#666666')
         .text(recommendation.description, 60, y + 25, {
           width: doc.page.width - 160,
           ellipsis: true
         });
    }

    // Impacto
    if (recommendation.impact) {
      doc.fontSize(10).font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text(`Impacto: ${recommendation.impact}`, 60, y + 50);
    }

    // Acción recomendada
    if (recommendation.action) {
      doc.fontSize(9).font('Helvetica')
         .fillColor('#27ae60')
         .text(`Acción: ${recommendation.action.substring(0, 80)}...`, 60, y + 65);
    }

    doc.moveDown(4);
  }

// ========== FUNCIÓN PARA EXPORTAR A CSV MEJORADA ==========
export function generateCSV(data) {
  return new Promise((resolve, reject) => {
    try {
      const csvData = [];

      // 1. METADATOS DEL ANÁLISIS
      csvData.push(['SECCIÓN', 'CAMPO', 'VALOR', 'UNIDAD', 'PUNTUACIÓN', 'ESTADO']);
      csvData.push(['INFORMACIÓN GENERAL', 'URL', data.url, '', '', '']);
      csvData.push(['INFORMACIÓN GENERAL', 'Dispositivo', data.strategyLabel || data.strategy, '', '', '']);
      csvData.push(['INFORMACIÓN GENERAL', 'Fecha', data.fecha, '', '', '']);
      csvData.push(['INFORMACIÓN GENERAL', 'Puntuación Total', data.summary?.performanceScore || 0, '', '', '']);
      csvData.push([]);

      // 2. CATEGORÍAS COMPLETAS
      csvData.push(['CATEGORÍAS', 'Nombre', 'Puntuación', 'Estado', 'Descripción', 'Prioridad']);
      if (data.categories) {
        Object.values(data.categories).forEach(cat => {
          const estado = cat.score >= 90 ? 'EXCELENTE' :
                        cat.score >= 70 ? 'BUENO' :
                        cat.score >= 50 ? 'REGULAR' : 'MEJORABLE';
          csvData.push(['CATEGORÍAS', cat.title, cat.score, estado, cat.description, 'ALTA']);
        });
      }
      csvData.push([]);

      // 3. TODAS LAS MÉTRICAS
      csvData.push(['MÉTRICAS', 'Nombre', 'Valor', 'Unidad', 'Score', 'Estado']);
      if (data.metrics?.performance) {
        Object.entries(data.metrics.performance).forEach(([key, metric]) => {
          const estado = metric.score >= 0.9 ? 'EXCELENTE' :
                        metric.score >= 0.5 ? 'BUENO' : 'MEJORABLE';
          csvData.push([
            'MÉTRICAS',
            metric.title,
            metric.numericValue || '',
            metric.numericUnit || '',
            metric.score ? Math.round(metric.score * 100) : '',
            estado
          ]);
        });
      }
      csvData.push([]);

      // 4. AUDITORÍAS DETALLADAS
      csvData.push(['AUDITORÍAS', 'Tipo', 'Título', 'Descripción', 'Ahorro', 'Score', 'Severidad']);

      // Oportunidades
      if (data.audits?.opportunities) {
        Object.entries(data.audits.opportunities).forEach(([key, audit]) => {
          csvData.push([
            'AUDITORÍAS',
            'OPORTUNIDAD',
            audit.title,
            audit.description?.substring(0, 200) || '',
            audit.displayValue || '',
            audit.score ? Math.round(audit.score * 100) : '',
            'ALTA'
          ]);
        });
      }

      // Aprobadas
      if (data.audits?.passed) {
        Object.entries(data.audits.passed).forEach(([key, audit]) => {
          csvData.push([
            'AUDITORÍAS',
            'APROBADA',
            audit.title,
            audit.description?.substring(0, 200) || '',
            '',
            audit.score ? Math.round(audit.score * 100) : '',
            'BAJA'
          ]);
        });
      }
      csvData.push([]);

      // 5. DIAGNÓSTICOS
      csvData.push(['DIAGNÓSTICOS', 'Título', 'Descripción', 'Valor', 'Severidad', 'Impacto']);
      if (data.diagnostics) {
        data.diagnostics.forEach(diag => {
          csvData.push([
            'DIAGNÓSTICOS',
            diag.title,
            diag.description?.substring(0, 150) || '',
            diag.displayValue || '',
            diag.severity || 'MEDIA',
            'ALTO'
          ]);
        });
      }
      csvData.push([]);

      // 6. RECOMENDACIONES PRIORIZADAS
      csvData.push(['RECOMENDACIONES', 'Prioridad', 'Título', 'Descripción', 'Impacto', 'Acción']);
      if (data.recommendations) {
        data.recommendations.forEach(rec => {
          csvData.push([
            'RECOMENDACIONES',
            rec.priority,
            rec.title,
            rec.description,
            rec.impact || '',
            rec.action || ''
          ]);
        });
      }
      csvData.push([]);

      // 7. EXPERIENCIA DE CARGA
      if (data.loadingExperience) {
        csvData.push(['EXPERIENCIA CARGA', 'Métrica', 'Categoría', 'Percentil', 'Estado']);
        if (data.loadingExperience.metrics) {
          Object.entries(data.loadingExperience.metrics).forEach(([key, metric]) => {
            csvData.push([
              'EXPERIENCIA CARGA',
              key,
              metric.category || '',
              metric.percentile || '',
              metric.category === 'FAST' ? 'BUENO' : 'MEJORABLE'
            ]);
          });
        }
      }

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