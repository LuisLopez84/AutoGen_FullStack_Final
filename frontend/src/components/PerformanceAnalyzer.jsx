import React, { useState } from "react";
import ApiKeyConfig from "./ApiKeyConfig.jsx";

export default function PerformanceAnalyzer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("desktop");
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'metrics', 'audits', 'diagnostics'

  const analyzeUrl = async () => {
    if (!url || !url.trim()) {
      setError("Por favor ingresa una URL válida");
      return;
    }

    try {
      new URL(url);
    } catch (e) {
      setError("URL inválida. Debe comenzar con http:// o https://");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("http://localhost:3000/api/analyze-performance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          strategy: mode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError("Límite de solicitudes alcanzado. Configura una API Key para análisis ilimitados.");
        } else {
          throw new Error(data.error || "Error al analizar la URL");
        }
      } else {
        setResults(data);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error en análisis:", err);
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIONES DE RENDERIZADO ==========

  const renderOverview = () => {
    if (!results) return null;

    const { categories, metrics } = results;

    return (
      <div className="overview-section">
        {/* SCORES PRINCIPALES */}
        <div className="scores-grid">
          {Object.values(categories || {}).map((category) => {
            const scoreInfo = getScoreInfo(category.score);
            return (
              <div key={category.id} className="score-card" style={{ borderColor: scoreInfo.color }}>
                <div className="score-category">{category.title}</div>
                <div className="score-value" style={{ color: scoreInfo.color }}>
                  {category.score}
                </div>
                <div className="score-label" style={{ background: scoreInfo.color }}>
                  {scoreInfo.label}
                </div>
                <div className="score-description">{category.description}</div>
              </div>
            );
          })}
        </div>

        {/* CORE WEB VITALS */}
        <div className="metrics-section">
          <h4>🌐 Core Web Vitals</h4>
          <div className="metrics-grid">
            {['largest-contentful-paint', 'cumulative-layout-shift', 'interaction-to-next-paint'].map((key) => {
              const metric = metrics?.performance?.[key];
              if (!metric) return null;

              return (
                <div key={key} className="metric-card">
                  <div className="metric-title">{metric.title}</div>
                  <div className="metric-value">{metric.displayValue || 'N/A'}</div>
                  <div className="metric-description">{metric.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RESUMEN DE AUDITORÍAS */}
        <div className="audits-summary">
          <h4>📋 Resumen de Auditorías</h4>
          <div className="summary-stats">
            <div className="stat-card">
              <div className="stat-value">{Object.keys(results.audits?.passed || {}).length}</div>
              <div className="stat-label">Aprobadas</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{Object.keys(results.audits?.opportunities || {}).length}</div>
              <div className="stat-label">Oportunidades</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{results.diagnostics?.length || 0}</div>
              <div className="stat-label">Diagnósticos</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMetrics = () => {
    if (!results?.metrics?.performance) return null;

    const metrics = results.metrics.performance;

    return (
      <div className="metrics-detail-section">
        <h4>📈 Métricas Detalladas</h4>

        <div className="metrics-categories">
          {/* Core Web Vitals */}
          <div className="category-group">
            <h5>⭐ Core Web Vitals</h5>
            {renderMetricList(['largest-contentful-paint', 'cumulative-layout-shift', 'interaction-to-next-paint', 'total-blocking-time'])}
          </div>

          {/* Métricas de Carga */}
          <div className="category-group">
            <h5>⚡ Métricas de Carga</h5>
            {renderMetricList(['first-contentful-paint', 'speed-index', 'first-meaningful-paint', 'time-to-first-byte'])}
          </div>

          {/* Otras Métricas */}
          <div className="category-group">
            <h5>📊 Otras Métricas</h5>
            {renderMetricList(['max-potential-fid', 'estimated-input-latency'])}
          </div>
        </div>
      </div>
    );
  };

  const renderMetricList = (keys) => {
    return keys.map(key => {
      const metric = results.metrics.performance[key];
      if (!metric) return null;

      return (
        <div key={key} className="metric-detail">
          <div className="metric-header">
            <span className="metric-name">{metric.title}</span>
            <span className="metric-score" style={{ color: getScoreColor(metric.score) }}>
              {metric.score !== null ? `${Math.round(metric.score * 100)}/100` : 'N/A'}
            </span>
          </div>
          <div className="metric-display">{metric.displayValue || 'No disponible'}</div>
          {metric.description && (
            <div className="metric-description">{metric.description}</div>
          )}
          {metric.numericValue && (
            <div className="metric-numeric">
              Valor: {metric.numericValue} {metric.numericUnit || ''}
            </div>
          )}
        </div>
      );
    }).filter(Boolean);
  };

  const renderAudits = () => {
    if (!results?.audits) return null;

    const { passed, opportunities, informational } = results.audits;

    return (
      <div className="audits-section">
        <div className="audits-tabs">
          <button
            className={activeTab === 'opportunities' ? 'active' : ''}
            onClick={() => setActiveTab('opportunities')}
          >
            Oportunidades ({Object.keys(opportunities || {}).length})
          </button>
          <button
            className={activeTab === 'passed' ? 'active' : ''}
            onClick={() => setActiveTab('passed')}
          >
            Aprobadas ({Object.keys(passed || {}).length})
          </button>
          <button
            className={activeTab === 'informational' ? 'active' : ''}
            onClick={() => setActiveTab('informational')}
          >
            Informativas ({Object.keys(informational || {}).length})
          </button>
        </div>

        <div className="audits-list">
          {activeTab === 'opportunities' && renderAuditList(opportunities)}
          {activeTab === 'passed' && renderAuditList(passed)}
          {activeTab === 'informational' && renderAuditList(informational)}
        </div>
      </div>
    );
  };

  const renderAuditList = (audits) => {
    if (!audits || Object.keys(audits).length === 0) {
      return <div className="no-audits">No hay auditorías en esta categoría</div>;
    }

    return Object.entries(audits).map(([key, audit]) => (
      <div key={key} className="audit-item">
        <div className="audit-header">
          <span className="audit-title">{audit.title}</span>
          {audit.score !== null && (
            <span className="audit-score" style={{ color: getScoreColor(audit.score) }}>
              {Math.round(audit.score * 100)}
            </span>
          )}
        </div>
        {audit.displayValue && (
          <div className="audit-value">{audit.displayValue}</div>
        )}
        {audit.description && (
          <div className="audit-description">{audit.description}</div>
        )}
        {audit.details && audit.details.items && audit.details.items.length > 0 && (
          <div className="audit-details">
            <details>
              <summary>Ver detalles ({audit.details.items.length})</summary>
              <ul>
                {audit.details.items.slice(0, 5).map((item, idx) => (
                  <li key={idx}>{JSON.stringify(item)}</li>
                ))}
              </ul>
            </details>
          </div>
        )}
      </div>
    ));
  };

  const renderDiagnostics = () => {
    if (!results?.diagnostics || results.diagnostics.length === 0) {
      return <div className="no-diagnostics">No hay diagnósticos disponibles</div>;
    }

    return (
      <div className="diagnostics-section">
        <h4>🔍 Diagnósticos Detallados</h4>

        <div className="diagnostics-list">
          {results.diagnostics.map((diag, idx) => (
            <div key={idx} className="diagnostic-item">
              <div className="diagnostic-header">
                <span className="diagnostic-title">{diag.title}</span>
                <span className="diagnostic-score" style={{ color: getScoreColor(diag.score) }}>
                  {Math.round(diag.score * 100)}/100
                </span>
              </div>
              <div className="diagnostic-value">{diag.displayValue}</div>
              <div className="diagnostic-description">{diag.description}</div>

              {diag.details && diag.details.items && (
                <div className="diagnostic-savings">
                  <strong>Ahorro estimado:</strong> {diag.displayValue}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!results?.recommendations) return null;

    const highPriority = results.recommendations.filter(r => r.priority === 'HIGH');
    const mediumPriority = results.recommendations.filter(r => r.priority === 'MEDIUM');
    const lowPriority = results.recommendations.filter(r => r.priority === 'LOW');

    const renderPriorityList = (items, title) => {
      if (items.length === 0) return null;

      return (
        <div className="priority-group">
          <h5>{title} ({items.length})</h5>
          {items.map((rec, idx) => (
            <div key={idx} className="recommendation-item">
              <div className="rec-title">{rec.title}</div>
              <div className="rec-description">{rec.description}</div>
              {rec.estimatedSavings && (
                <div className="rec-savings">💾 {rec.estimatedSavings}</div>
              )}
            </div>
          ))}
        </div>
      );
    };

    return (
      <div className="recommendations-section">
        <h4>💡 Recomendaciones</h4>

        <div className="recommendations-grid">
          {renderPriorityList(highPriority, '🔥 Alta Prioridad')}
          {renderPriorityList(mediumPriority, '⚠️ Prioridad Media')}
          {renderPriorityList(lowPriority, '📋 Prioridad Baja')}
        </div>
      </div>
    );
  };

  // ========== FUNCIONES AUXILIARES ==========
  const getScoreInfo = (score) => {
    if (score >= 90) return { color: "#27ae60", label: "Excelente" };
    if (score >= 70) return { color: "#f39c12", label: "Bueno" };
    if (score >= 50) return { color: "#e67e22", label: "Regular" };
    return { color: "#e74c3c", label: "Bajo" };
  };

  const getScoreColor = (score) => {
    if (score >= 0.9) return "#27ae60";
    if (score >= 0.5) return "#f39c12";
    return "#e74c3c";
  };

  const openInPageSpeed = () => {
    if (!url.trim()) {
      setError("Ingresa una URL primero para abrir en PageSpeed");
      return;
    }
    const pageSpeedUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}&form_factor=${mode}`;
    window.open(pageSpeedUrl, "_blank");
  };

  // ========== RENDER PRINCIPAL ==========
  return (
    <div className="performance-analyzer">
      <h2>⚡ Analizador de Performance Web (Completo)</h2>

      {/* ENTRADA DE URL */}
      <div className="input-section">
        <div className="url-input">
          <label>🌐 URL para Analizar</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ejemplo.com"
          />
        </div>

        <div className="mode-selector">
          <label>📱 Dispositivo</label>
          <div className="mode-buttons">
            <button
              className={mode === "mobile" ? "active" : ""}
              onClick={() => setMode("mobile")}
            >
              📱 Móvil
            </button>
            <button
              className={mode === "desktop" ? "active" : ""}
              onClick={() => setMode("desktop")}
            >
              🖥️ Escritorio
            </button>
          </div>
        </div>

        <div className="action-buttons">
          <button
            onClick={analyzeUrl}
            disabled={loading || !url}
            className="analyze-button"
          >
            {loading ? "⏳ Analizando..." : "🔍 Analizar Performance"}
          </button>
          <button
            onClick={openInPageSpeed}
            disabled={!url.trim()}
            className="external-button"
          >
            📊 Abrir en PageSpeed
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      {/* RESULTADOS */}
      {results && (
        <div className="results-container">
          {/* PESTAÑAS DE NAVEGACIÓN */}
          <div className="results-tabs">
            <button
              className={activeTab === "overview" ? "active" : ""}
              onClick={() => setActiveTab("overview")}
            >
              📊 Resumen
            </button>
            <button
              className={activeTab === "metrics" ? "active" : ""}
              onClick={() => setActiveTab("metrics")}
            >
              📈 Métricas
            </button>
            <button
              className={activeTab === "audits" ? "active" : ""}
              onClick={() => setActiveTab("audits")}
            >
              📋 Auditorías
            </button>
            <button
              className={activeTab === "diagnostics" ? "active" : ""}
              onClick={() => setActiveTab("diagnostics")}
            >
              🔍 Diagnósticos
            </button>
            <button
              className={activeTab === "recommendations" ? "active" : ""}
              onClick={() => setActiveTab("recommendations")}
            >
              💡 Recomendaciones
            </button>
          </div>

          {/* CONTENIDO DE PESTAÑAS */}
          <div className="results-content">
            {activeTab === "overview" && renderOverview()}
            {activeTab === "metrics" && renderMetrics()}
            {activeTab === "audits" && renderAudits()}
            {activeTab === "diagnostics" && renderDiagnostics()}
            {activeTab === "recommendations" && renderRecommendations()}
          </div>

          {/* INFORMACIÓN DEL ANÁLISIS */}
          <div className="analysis-info">
            <div className="info-item">
              <span>URL:</span>
              <span>{results.url}</span>
            </div>
            <div className="info-item">
              <span>Dispositivo:</span>
              <span>{results.strategy === "mobile" ? "📱 Móvil" : "🖥️ Escritorio"}</span>
            </div>
            <div className="info-item">
              <span>Fecha:</span>
              <span>{new Date(results.fetchTime).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* CONFIGURACIÓN DE API KEY */}
      <ApiKeyConfig />

      {/* ESTILOS INLINE */}
      <style jsx>{`
        .performance-analyzer {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        h2 {
          color: #2c3e50;
          text-align: center;
          margin-bottom: 30px;
        }

        .input-section {
          background: #f8f9fa;
          padding: 25px;
          border-radius: 10px;
          margin-bottom: 30px;
          display: grid;
          gap: 20px;
        }

        .url-input label,
        .mode-selector label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2c3e50;
        }

        .url-input input {
          width: 100%;
          padding: 12px;
          border: 2px solid #3498db;
          border-radius: 8px;
          font-size: 16px;
        }

        .mode-buttons {
          display: flex;
          gap: 10px;
        }

        .mode-buttons button {
          flex: 1;
          padding: 12px;
          border: 2px solid #ddd;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .mode-buttons button.active {
          background: #3498db;
          color: white;
          border-color: #3498db;
        }

        .action-buttons {
          display: flex;
          gap: 15px;
        }

        .analyze-button {
          flex: 2;
          background: #27ae60;
          color: white;
          border: none;
          padding: 15px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }

        .analyze-button:disabled {
          background: #95a5a6;
          cursor: not-allowed;
        }

        .external-button {
          flex: 1;
          background: #9b59b6;
          color: white;
          border: none;
          padding: 15px;
          border-radius: 8px;
          cursor: pointer;
        }

        .error-message {
          background: #ffe6e6;
          color: #e74c3c;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #ffcccc;
        }

        /* RESULTADOS */
        .results-container {
          background: white;
          border-radius: 10px;
          border: 1px solid #dee2e6;
          overflow: hidden;
          margin-bottom: 30px;
        }

        .results-tabs {
          display: flex;
          background: #2c3e50;
          overflow-x: auto;
        }

        .results-tabs button {
          padding: 15px 20px;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          white-space: nowrap;
        }

        .results-tabs button.active {
          background: #34495e;
          border-bottom-color: #3498db;
        }

        .results-content {
          padding: 25px;
          min-height: 400px;
        }

        /* OVERVIEW */
        .scores-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .score-card {
          padding: 20px;
          border: 3px solid;
          border-radius: 10px;
          text-align: center;
          background: #f8f9fa;
        }
       .score-category {
           font-size: 16px;
           font-weight: 600;
           margin-bottom: 10px;
           color: #2c3e50;
        }

               .score-value {
                 font-size: 48px;
                 font-weight: 700;
                 margin-bottom: 5px;
               }

               .score-label {
                 display: inline-block;
                 padding: 4px 12px;
                 border-radius: 20px;
                 color: white;
                 font-size: 12px;
                 font-weight: 600;
                 margin-bottom: 10px;
               }

               .score-description {
                 font-size: 13px;
                 color: #666;
                 margin-top: 10px;
               }

               .metrics-section,
               .audits-summary {
                 margin-bottom: 30px;
               }

               .metrics-grid {
                 display: grid;
                 grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                 gap: 15px;
                 margin-top: 15px;
               }

               .metric-card {
                 padding: 15px;
                 background: #f8f9fa;
                 border-radius: 8px;
                 border-left: 4px solid #3498db;
               }

               .metric-title {
                 font-weight: 600;
                 color: #2c3e50;
                 margin-bottom: 5px;
               }

               .metric-value {
                 font-size: 18px;
                 font-weight: 700;
                 color: #2c3e50;
                 margin-bottom: 5px;
               }

               .summary-stats {
                 display: flex;
                 gap: 20px;
                 margin-top: 15px;
               }

               .stat-card {
                 flex: 1;
                 padding: 20px;
                 background: #f8f9fa;
                 border-radius: 8px;
                 text-align: center;
               }

               .stat-value {
                 font-size: 36px;
                 font-weight: 700;
                 color: #3498db;
               }

               .stat-label {
                 font-size: 14px;
                 color: #666;
               }

               /* MÉTRICAS DETALLADAS */
               .metrics-detail-section {
                 background: #f8f9fa;
                 padding: 20px;
                 border-radius: 8px;
               }

               .metrics-categories {
                 display: grid;
                 gap: 25px;
                 margin-top: 20px;
               }

               .category-group h5 {
                 color: #2c3e50;
                 margin-bottom: 15px;
                 padding-bottom: 8px;
                 border-bottom: 2px solid #3498db;
               }

               .metric-detail {
                 background: white;
                 padding: 15px;
                 border-radius: 6px;
                 margin-bottom: 10px;
                 border: 1px solid #e9ecef;
               }

               .metric-header {
                 display: flex;
                 justify-content: space-between;
                 align-items: center;
                 margin-bottom: 8px;
               }

               .metric-name {
                 font-weight: 600;
                 color: #2c3e50;
               }

               .metric-score {
                 font-weight: 700;
                 font-size: 14px;
               }

               .metric-display {
                 font-size: 18px;
                 font-weight: 700;
                 color: #2c3e50;
                 margin-bottom: 5px;
               }

               /* AUDITORÍAS */
               .audits-tabs {
                 display: flex;
                 gap: 10px;
                 margin-bottom: 20px;
                 flex-wrap: wrap;
               }

               .audits-tabs button {
                 padding: 10px 20px;
                 background: #f8f9fa;
                 border: 1px solid #ddd;
                 border-radius: 6px;
                 cursor: pointer;
               }

               .audits-tabs button.active {
                 background: #3498db;
                 color: white;
                 border-color: #3498db;
               }

               .audit-item {
                 background: #f8f9fa;
                 padding: 15px;
                 border-radius: 6px;
                 margin-bottom: 10px;
                 border-left: 4px solid #3498db;
               }

               .audit-header {
                 display: flex;
                 justify-content: space-between;
                 align-items: center;
                 margin-bottom: 8px;
               }

               .audit-title {
                 font-weight: 600;
                 color: #2c3e50;
               }

               .audit-score {
                 font-weight: 700;
                 font-size: 16px;
               }
                /* DIAGNÓSTICOS */
                       .diagnostic-item {
                         background: #fff3cd;
                         padding: 15px;
                         border-radius: 6px;
                         margin-bottom: 10px;
                         border: 1px solid #ffeaa7;
                       }

                       .diagnostic-header {
                         display: flex;
                         justify-content: space-between;
                         align-items: center;
                         margin-bottom: 8px;
                       }

                       .diagnostic-title {
                         font-weight: 600;
                         color: #856404;
                       }

                       /* RECOMENDACIONES */
                       .recommendations-grid {
                         display: grid;
                         gap: 20px;
                         margin-top: 20px;
                       }

                       .priority-group h5 {
                         padding: 10px;
                         background: #e8f4fd;
                         border-radius: 6px;
                         color: #2c3e50;
                       }

                       .recommendation-item {
                         background: white;
                         padding: 15px;
                         border-radius: 6px;
                         margin-bottom: 10px;
                         border: 1px solid #e9ecef;
                       }

                       .rec-title {
                         font-weight: 600;
                         color: #2c3e50;
                         margin-bottom: 5px;
                       }

                       .rec-savings {
                         background: #d4edda;
                         padding: 5px 10px;
                         border-radius: 4px;
                         margin-top: 8px;
                         font-size: 12px;
                         color: #155724;
                       }

                       /* INFORMACIÓN DEL ANÁLISIS */
                       .analysis-info {
                         background: #f8f9fa;
                         padding: 15px;
                         border-top: 1px solid #dee2e6;
                         display: grid;
                         grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                         gap: 15px;
                       }

                       .info-item {
                         display: flex;
                         justify-content: space-between;
                         font-size: 14px;
                         color: #666;
                       }

                       @media (max-width: 768px) {
                         .scores-grid {
                           grid-template-columns: 1fr;
                         }

                         .summary-stats {
                           flex-direction: column;
                         }

                         .metrics-grid {
                           grid-template-columns: 1fr;
                         }

                         .results-tabs {
                           flex-wrap: wrap;
                         }

                         .results-tabs button {
                           flex: 1;
                           min-width: 120px;
                         }
                       }
                     `}</style>
                   </div>
                 );
               }