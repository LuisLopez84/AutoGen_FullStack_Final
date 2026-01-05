import React, { useState } from "react";
import ApiKeyConfig from "./ApiKeyConfig.jsx"; // AGREGAR ESTA LÍNEA

export default function PerformanceAnalyzerSpanish() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState(null);
  const [error, setError] = useState(null);
  const [modo, setModo] = useState("desktop");
  const [pestanaActiva, setPestanaActiva] = useState("resumen");

  const analizarUrl = async () => {
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
    setResultados(null);

    try {
      const respuesta = await fetch("http://localhost:3000/api/analyze-performance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          strategy: modo
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        if (respuesta.status === 429) {
          setError("Límite de solicitudes alcanzado. Configura una API Key para análisis ilimitados.");
        } else {
          throw new Error(datos.error || "Error al analizar la URL");
        }
      } else {
        setResultados(datos);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error en análisis:", err);
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIONES DE RENDERIZADO EN ESPAÑOL ==========

  const renderizarResumen = () => {
    if (!resultados) return null;

    const { categories, summary } = resultados;

    return (
      <div className="seccion-resumen">
        {/* TARJETAS DE PUNTUACIÓN */}
        <div className="grid-puntuaciones">
          {Object.values(categories || {}).map((categoria) => {
            const color = obtenerColorPuntuacion(categoria.score);
            return (
              <div key={categoria.id} className="tarjeta-puntuacion" style={{ borderColor: color }}>
                <div className="categoria">{categoria.title}</div>
                <div className="puntuacion" style={{ color: color }}>
                  {categoria.score}
                </div>
                <div className="etiqueta" style={{ background: color }}>
                  {categoria.label || obtenerEtiquetaPuntuacion(categoria.score)}
                </div>
                <div className="descripcion">{categoria.description}</div>
                {categoria.detailedDescription && (
                  <div className="detalle">{categoria.detailedDescription}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* ESTADÍSTICAS RÁPIDAS */}
        <div className="estadisticas-rapidas">
          <h4>📊 Estadísticas del Análisis</h4>
          <div className="grid-estadisticas">
            <div className="estadistica">
              <div className="valor">{summary?.totalAudits || 0}</div>
              <div className="nombre">Auditorías Totales</div>
            </div>
            <div className="estadistica">
              <div className="valor">{summary?.passedAudits || 0}</div>
              <div className="nombre">Aprobadas</div>
            </div>
            <div className="estadistica">
              <div className="valor">{summary?.opportunities || 0}</div>
              <div className="nombre">Oportunidades</div>
            </div>
            <div className="estadistica">
              <div className="valor">{summary?.diagnosticsCount || 0}</div>
              <div className="nombre">Diagnósticos</div>
            </div>
          </div>
        </div>

        {/* WEB VITALS */}
        <div className="web-vitals">
          <h4>🌐 Core Web Vitals (Métricas Esenciales)</h4>
          <div className="grid-vitals">
            {['largest-contentful-paint', 'cumulative-layout-shift', 'interaction-to-next-paint'].map((key) => {
              const metrica = resultados.metrics?.performance?.[key];
              if (!metrica) return null;

              return (
                <div key={key} className="tarjeta-vital">
                  <div className="titulo-vital">{metrica.title}</div>
                  <div className="valor-vital">{metrica.displayValue || 'No disponible'}</div>
                  <div className="descripcion-vital">{metrica.description}</div>
                  {metrica.score !== null && (
                    <div className="puntuacion-vital">
                      Puntuación: {Math.round(metrica.score * 100)}/100
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderizarMetricas = () => {
    if (!resultados?.metrics?.performance) return null;

    const metricas = resultados.metrics.performance;

    return (
      <div className="seccion-metricas">
        <h4>📈 Métricas de Rendimiento Detalladas</h4>

        <div className="categorias-metricas">
          {/* Métricas Esenciales */}
          <div className="grupo-metricas">
            <h5>⭐ Métricas Esenciales (Core Web Vitals)</h5>
            {renderizarListaMetricas([
              'largest-contentful-paint',
              'cumulative-layout-shift',
              'interaction-to-next-paint',
              'total-blocking-time'
            ])}
          </div>

          {/* Métricas de Carga */}
          <div className="grupo-metricas">
            <h5>⚡ Métricas de Carga</h5>
            {renderizarListaMetricas([
              'first-contentful-paint',
              'speed-index',
              'first-meaningful-paint',
              'server-response-time'
            ])}
          </div>

          {/* Otras Métricas */}
          <div className="grupo-metricas">
            <h5>📊 Otras Métricas Importantes</h5>
            {renderizarListaMetricas([
              'max-potential-fid',
              'estimated-input-latency'
            ])}
          </div>
        </div>
      </div>
    );
  };

  const renderizarListaMetricas = (claves) => {
    return claves.map(clave => {
      const metrica = resultados.metrics.performance[clave];
      if (!metrica) return null;

      const color = obtenerColorScore(metrica.score);

      return (
        <div key={clave} className="detalle-metrica">
          <div className="encabezado-metrica">
            <span className="nombre-metrica">{metrica.title}</span>
            {metrica.score !== null && (
              <span className="score-metrica" style={{ color }}>
                {Math.round(metrica.score * 100)}/100
              </span>
            )}
          </div>
          <div className="valor-metrica">{metrica.displayValue || 'No disponible'}</div>
          {metrica.description && (
            <div className="descripcion-metrica">{metrica.description}</div>
          )}
          {metrica.numericValue !== undefined && (
            <div className="valor-numerico">
              Valor: {metrica.numericValue} {metrica.numericUnit || ''}
            </div>
          )}
        </div>
      );
    }).filter(Boolean);
  };

  const renderizarAuditorias = () => {
    if (!resultados?.audits) return null;

    const { passed, opportunities, informational } = resultados.audits;

    return (
      <div className="seccion-auditorias">
        <div className="pestanas-auditorias">
          <button
            className={pestanaActiva === 'oportunidades' ? 'activa' : ''}
            onClick={() => setPestanaActiva('oportunidades')}
          >
            Oportunidades ({Object.keys(opportunities || {}).length})
          </button>
          <button
            className={pestanaActiva === 'aprobadas' ? 'activa' : ''}
            onClick={() => setPestanaActiva('aprobadas')}
          >
            Aprobadas ({Object.keys(passed || {}).length})
          </button>
          <button
            className={pestanaActiva === 'informativas' ? 'activa' : ''}
            onClick={() => setPestanaActiva('informativas')}
          >
            Informativas ({Object.keys(informational || {}).length})
          </button>
        </div>

        <div className="lista-auditorias">
          {pestanaActiva === 'oportunidades' && renderizarListaAuditorias(opportunities, 'oportunidad')}
          {pestanaActiva === 'aprobadas' && renderizarListaAuditorias(passed, 'aprobada')}
          {pestanaActiva === 'informativas' && renderizarListaAuditorias(informational, 'informativa')}
        </div>
      </div>
    );
  };

  const renderizarListaAuditorias = (auditorias, tipo) => {
    if (!auditorias || Object.keys(auditorias).length === 0) {
      return <div className="sin-auditorias">No hay auditorías {tipo}s en esta categoría</div>;
    }

    return Object.entries(auditorias).map(([clave, auditoria]) => (
      <div key={clave} className={`item-auditoria ${tipo}`}>
        <div className="encabezado-auditoria">
          <span className="titulo-auditoria">{auditoria.title}</span>
          {auditoria.score !== null && (
            <span className="score-auditoria" style={{ color: obtenerColorScore(auditoria.score) }}>
              {Math.round(auditoria.score * 100)}
            </span>
          )}
        </div>
        {auditoria.displayValue && (
          <div className="valor-auditoria">{auditoria.displayValue}</div>
        )}
        {auditoria.description && (
          <div className="descripcion-auditoria">{auditoria.description}</div>
        )}
        {auditoria.explanation && (
          <div className="explicacion-auditoria">
            <strong>Explicación:</strong> {auditoria.explanation}
          </div>
        )}
        {auditoria.details && auditoria.details.items && (
          <div className="detalles-auditoria">
            <details>
              <summary>
                Ver detalles (
                {Array.isArray(auditoria.details.items)
                  ? auditoria.details.items.length
                  : 1}
                )
              </summary>
              <ul>
                {(() => {
                  const items = Array.isArray(auditoria.details.items)
                    ? auditoria.details.items
                    : [auditoria.details.items];

                  return items.slice(0, 3).map((item, idx) => (
                    <li key={idx}>
                      {typeof item === 'object'
                        ? JSON.stringify(item, null, 2)
                            .replace(/[{}"]/g, '')
                            .replace(/,/g, ', ')
                            .substring(0, 100) + '...'
                        : String(item).substring(0, 100)}
                    </li>
                  ));
                })()}
              </ul>
            </details>
          </div>
        )}
      </div>
    ));
  };

  const renderizarDiagnosticos = () => {
      if (!resultados?.diagnostics || resultados.diagnostics.length === 0) {
        return <div className="sin-diagnosticos">No se encontraron diagnósticos específicos</div>;
      }

      return (
        <div className="seccion-diagnosticos">
          <h4>🔍 Diagnósticos de Rendimiento</h4>

          <div className="lista-diagnosticos">
            {resultados.diagnostics.map((diagnostico, idx) => (
              <div key={idx} className="item-diagnostico">
                <div className="encabezado-diagnostico">
                  <span className="titulo-diagnostico">{diagnostico.title}</span>
                  <span className={`severidad severidad-${diagnostico.severity}`}>
                    {diagnostico.severity?.toUpperCase() || 'MEDIO'}
                  </span>
                </div>
                <div className="valor-diagnostico">{diagnostico.displayValue}</div>
                <div className="descripcion-diagnostico">{diagnostico.description}</div>

                {diagnostico.numericValue && (
                  <div className="ahorro-diagnostico">
                    <strong>Ahorro estimado:</strong> {diagnostico.displayValue}
                    {diagnostico.numericUnit && ` (${diagnostico.numericValue} ${diagnostico.numericUnit})`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };

    const renderizarRecomendaciones = () => {
      if (!resultados?.recommendations) return null;

      const altaPrioridad = resultados.recommendations.filter(r => r.priority === 'ALTA');
      const mediaPrioridad = resultados.recommendations.filter(r => r.priority === 'MEDIA');
      const bajaPrioridad = resultados.recommendations.filter(r => r.priority === 'BAJA');

      const renderizarListaPrioridad = (items, titulo, color) => {
        if (items.length === 0) return null;

        return (
          <div className="grupo-prioridad">
            <h5 style={{ color }}>{titulo} ({items.length})</h5>
            {items.map((rec, idx) => (
              <div key={idx} className="item-recomendacion">
                <div className="titulo-recomendacion">{rec.title}</div>
                <div className="descripcion-recomendacion">{rec.description}</div>
                {rec.impact && (
                  <div className="impacto-recomendacion">
                    <strong>Impacto:</strong> {rec.impact}
                  </div>
                )}
                {rec.action && (
                  <div className="accion-recomendacion">
                    <strong>Acción recomendada:</strong> {rec.action}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      };

      return (
        <div className="seccion-recomendaciones">
          <h4>💡 Recomendaciones para Mejorar</h4>

          <div className="grid-recomendaciones">
            {renderizarListaPrioridad(altaPrioridad, '🔥 Alta Prioridad', '#e74c3c')}
            {renderizarListaPrioridad(mediaPrioridad, '⚠️ Prioridad Media', '#f39c12')}
            {renderizarListaPrioridad(bajaPrioridad, '📋 Prioridad Baja', '#3498db')}
          </div>
        </div>
      );
    };

    const renderizarExperienciaCarga = () => {
      if (!resultados?.loadingExperience) return null;

      const exp = resultados.loadingExperience;

      return (
        <div className="seccion-experiencia">
          <h4>📱 Experiencia de Carga Real de Usuarios</h4>

          <div className="tarjeta-experiencia">
            <div className="categoria-experiencia">
              <strong>Categoría General:</strong> {exp.overall_category}
            </div>

            {exp.metrics && (
              <div className="metricas-experiencia">
                <h5>Métricas de Campo (Datos Reales)</h5>
                <div className="grid-metricas-experiencia">
                  {Object.entries(exp.metrics).map(([clave, metrica]) => (
                    <div key={clave} className="metrica-experiencia">
                      <div className="nombre-metrica">{clave.replace(/-/g, ' ')}</div>
                      <div className="categoria-metrica">{metrica.category}</div>
                      {metrica.percentile && (
                        <div className="percentil">Percentil: {metrica.percentile}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };

 // ========== FUNCIONES AUXILIARES ==========
  const obtenerColorPuntuacion = (score) => {
    if (score >= 90) return "#27ae60";
    if (score >= 70) return "#f39c12";
    if (score >= 50) return "#e67e22";
    return "#e74c3c";
  };

  const obtenerEtiquetaPuntuacion = (score) => {
    if (score >= 90) return "Excelente";
    if (score >= 70) return "Bueno";
    if (score >= 50) return "Regular";
    return "Necesita Mejora";
  };

  const obtenerColorScore = (score) => {
    if (score >= 0.9) return "#27ae60";
    if (score >= 0.5) return "#f39c12";
    return "#e74c3c";
  };

  const abrirEnPageSpeed = () => {
    if (!url.trim()) {
      setError("Ingresa una URL primero para abrir en PageSpeed");
      return;
    }
    const pageSpeedUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}&form_factor=${modo}`;
    window.open(pageSpeedUrl, "_blank");
  };

  // ========== RENDER PRINCIPAL ==========
  return (
    <div className="analizador-performance">
      <h2>⚡ Analizador de Performance Aplicativos Web</h2>

      {/* SECCIÓN DE ENTRADA */}
      <div className="seccion-entrada">
        <div className="entrada-url">
          <label>🌐 URL para Analizar</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ejemplo.com"
          />
          <small>Ingresa la URL completa de la página web que deseas analizar</small>
        </div>

        <div className="selector-modo">
          <label>📱 Dispositivo para Análisis</label>
          <div className="botones-modo">
            <button
              className={modo === "mobile" ? "activo" : ""}
              onClick={() => setModo("mobile")}
            >
              📱 Móvil
            </button>
            <button
              className={modo === "desktop" ? "activo" : ""}
              onClick={() => setModo("desktop")}
            >
              🖥️ Escritorio
            </button>
          </div>
        </div>

        <div className="botones-accion">
          <button
            onClick={analizarUrl}
            disabled={loading || !url}
            className="boton-analizar"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Analizando...
              </>
            ) : (
              "🔍 Analizar Performance"
            )}
          </button>
          <button
            onClick={abrirEnPageSpeed}
            disabled={!url.trim()}
            className="boton-externo"
          >
            📊 Abrir en PageSpeed
          </button>
        </div>

        {error && (
          <div className="mensaje-error">
            {error}
          </div>
        )}
      </div>

      {/* RESULTADOS */}
      {resultados && (
        <div className="contenedor-resultados">
          {/* PESTAÑAS DE NAVEGACIÓN */}
          <div className="pestanas-resultados">
            <button
              className={pestanaActiva === "resumen" ? "activa" : ""}
              onClick={() => setPestanaActiva("resumen")}
            >
              📊 Resumen
            </button>
            <button
              className={pestanaActiva === "metricas" ? "activa" : ""}
              onClick={() => setPestanaActiva("metricas")}
            >
              📈 Métricas
            </button>
            <button
              className={pestanaActiva === "auditorias" ? "activa" : ""}
              onClick={() => setPestanaActiva("auditorias")}
            >
              📋 Auditorías
            </button>
            <button
              className={pestanaActiva === "diagnosticos" ? "activa" : ""}
              onClick={() => setPestanaActiva("diagnosticos")}
            >
              🔍 Diagnósticos
            </button>
            <button
              className={pestanaActiva === "recomendaciones" ? "activa" : ""}
              onClick={() => setPestanaActiva("recomendaciones")}
            >
              💡 Recomendaciones
            </button>
            {resultados.loadingExperience && (
              <button
                className={pestanaActiva === "experiencia" ? "activa" : ""}
                onClick={() => setPestanaActiva("experiencia")}
              >
                📱 Experiencia Real
              </button>
            )}
          </div>

   {/* CONTENIDO DE PESTAÑAS */}
            <div className="contenido-resultados">
              {pestanaActiva === "resumen" && renderizarResumen()}
              {pestanaActiva === "metricas" && renderizarMetricas()}
              {pestanaActiva === "auditorias" && renderizarAuditorias()}
              {pestanaActiva === "diagnosticos" && renderizarDiagnosticos()}
              {pestanaActiva === "recomendaciones" && renderizarRecomendaciones()}
              {pestanaActiva === "experiencia" && renderizarExperienciaCarga()}
            </div>

            {/* INFORMACIÓN DEL ANÁLISIS */}
            <div className="info-analisis">
              <div className="item-info">
                <span>URL analizada:</span>
                <span className="valor-info">{resultados.url}</span>
              </div>
              <div className="item-info">
                <span>Dispositivo:</span>
                <span className="valor-info">
                  {resultados.strategyLabel || (resultados.strategy === "mobile" ? "📱 Móvil" : "🖥️ Escritorio")}
                </span>
              </div>
              <div className="item-info">
                <span>Fecha del análisis:</span>
                <span className="valor-info">{resultados.fecha}</span>
              </div>
              <div className="item-info">
                <span>Puntuación Rendimiento:</span>
                <span className="valor-info" style={{ color: obtenerColorPuntuacion(resultados.summary?.performanceScore || 0) }}>
                  {resultados.summary?.performanceScore || 0}/100
                </span>
              </div>
            </div>
          </div>
        )}

          {/* CONFIGURACIÓN DE API KEY - AGREGAR ESTO */}
          <ApiKeyConfig onApiKeySet={() => {
            // Recargar la página o mostrar mensaje
            window.location.reload();
          }} />

        {/* ESTILOS */}
        <style jsx>{`
          .analizador-performance {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
            font-family: 'Segoe UI', 'Roboto', sans-serif;
          }

          h2 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #3498db;
            padding-bottom: 15px;
          }

          /* SECCIÓN DE ENTRADA */
          .seccion-entrada {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 30px;
            border: 2px solid #dee2e6;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }

          .entrada-url label,
          .selector-modo label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #2c3e50;
            font-size: 16px;
          }

          .entrada-url input {
            width: 100%;
            padding: 14px;
            border: 2px solid #3498db;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
            background: white;
          }

          .entrada-url input:focus {
            outline: none;
            border-color: #2980b9;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
          }

          .entrada-url small {
            display: block;
            margin-top: 6px;
            color: #666;
            font-size: 14px;
          }

          .botones-modo {
            display: flex;
            gap: 12px;
            margin-top: 10px;
          }

          .botones-modo button {
            flex: 1;
            padding: 14px;
            border: 2px solid #ddd;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 15px;
            font-weight: 500;
          }

          .botones-modo button.activo {
            background: #3498db;
            color: white;
            border-color: #3498db;
            transform: scale(1.02);
          }

          .botones-accion {
            display: flex;
            gap: 15px;
            margin-top: 20px;
          }

          .boton-analizar {
            flex: 2;
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            border: none;
            padding: 16px;
            border-radius: 8px;
            font-size: 17px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }
       .boton-analizar:disabled {
                background: #95a5a6;
                cursor: not-allowed;
                opacity: 0.7;
              }

              .boton-analizar:not(:disabled):hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(39, 174, 96, 0.3);
              }

              .boton-externo {
                flex: 1;
                background: linear-gradient(135deg, #9b59b6, #8e44ad);
                color: white;
                border: none;
                padding: 16px;
                border-radius: 8px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
              }

              .boton-externo:disabled {
                background: #bdc3c7;
                cursor: not-allowed;
              }

              .boton-externo:not(:disabled):hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(155, 89, 182, 0.3);
              }

              .spinner {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid rgba(255,255,255,.3);
                border-radius: 50%;
                border-top-color: white;
                animation: girar 1s ease-in-out infinite;
              }

              @keyframes girar {
                to { transform: rotate(360deg); }
              }

              .mensaje-error {
                margin-top: 15px;
                padding: 14px;
                background: linear-gradient(135deg, #ffe6e6, #ffcccc);
                color: #c0392b;
                border-radius: 8px;
                border: 2px solid #e74c3c;
                font-weight: 500;
              }

              /* RESULTADOS */
              .contenedor-resultados {
                background: white;
                border-radius: 12px;
                border: 2px solid #dee2e6;
                overflow: hidden;
                margin-bottom: 30px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              }

              .pestanas-resultados {
                display: flex;
                background: linear-gradient(135deg, #2c3e50, #34495e);
                overflow-x: auto;
                padding: 5px;
              }

              .pestanas-resultados button {
                padding: 16px 24px;
                background: none;
                border: none;
                color: #ecf0f1;
                cursor: pointer;
                border-bottom: 3px solid transparent;
                white-space: nowrap;
                font-size: 15px;
                font-weight: 500;
                transition: all 0.3s;
                flex: 1;
                min-width: 140px;
              }

              .pestanas-resultados button.activa {
                background: rgba(255,255,255,0.1);
                border-bottom-color: #3498db;
                font-weight: 600;
                color: white;
                transform: translateY(-2px);
              }

              .pestanas-resultados button:hover:not(.activa) {
                background: rgba(255,255,255,0.05);
                color: white;
              }

              .contenido-resultados {
                padding: 30px;
                min-height: 500px;
                background: #f8f9fa;
              }

              /* RESUMEN */
              .grid-puntuaciones {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 25px;
                margin-bottom: 40px;
              }

              .tarjeta-puntuacion {
                padding: 25px;
                border: 3px solid;
                border-radius: 12px;
                text-align: center;
                background: white;
                transition: transform 0.3s, box-shadow 0.3s;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              }

              .tarjeta-puntuacion:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.15);
              }

              .categoria {
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 15px;
                color: #2c3e50;
              }

              .puntuacion {
                font-size: 56px;
                font-weight: 800;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
              }
             .etiqueta {
                       display: inline-block;
                       padding: 6px 18px;
                       border-radius: 25px;
                       color: white;
                       font-size: 14px;
                       font-weight: 700;
                       margin-bottom: 15px;
                       text-transform: uppercase;
                       letter-spacing: 0.5px;
                     }

                     .descripcion {
                       font-size: 14px;
                       color: #666;
                       margin-top: 12px;
                       line-height: 1.5;
                     }

                     .detalle {
                       font-size: 13px;
                       color: #888;
                       margin-top: 8px;
                       font-style: italic;
                     }

                     .estadisticas-rapidas {
                       margin-bottom: 40px;
                     }

                     .estadisticas-rapidas h4 {
                       color: #2c3e50;
                       margin-bottom: 20px;
                       font-size: 20px;
                       border-left: 4px solid #3498db;
                       padding-left: 12px;
                     }

                     .grid-estadisticas {
                       display: grid;
                       grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                       gap: 20px;
                     }

                     .estadistica {
                       padding: 25px;
                       background: white;
                       border-radius: 10px;
                       text-align: center;
                       border: 2px solid #e9ecef;
                       transition: all 0.3s;
                     }

                     .estadistica:hover {
                       border-color: #3498db;
                       transform: translateY(-3px);
                     }

                     .estadistica .valor {
                       font-size: 42px;
                       font-weight: 800;
                       color: #3498db;
                       margin-bottom: 8px;
                     }

                     .estadistica .nombre {
                       font-size: 16px;
                       color: #666;
                       font-weight: 500;
                     }

                     .web-vitals {
                       margin-bottom: 40px;
                     }

                     .web-vitals h4 {
                       color: #2c3e50;
                       margin-bottom: 20px;
                       font-size: 20px;
                       border-left: 4px solid #27ae60;
                       padding-left: 12px;
                     }

                     .grid-vitals {
                       display: grid;
                       grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                       gap: 20px;
                     }

                     .tarjeta-vital {
                       padding: 20px;
                       background: white;
                       border-radius: 10px;
                       border: 2px solid #e9ecef;
                       transition: all 0.3s;
                     }

                     .tarjeta-vital:hover {
                       border-color: #27ae60;
                       transform: translateY(-3px);
                     }

                     .titulo-vital {
                       font-weight: 700;
                       color: #2c3e50;
                       margin-bottom: 10px;
                       font-size: 16px;
                     }

                     .valor-vital {
                       font-size: 24px;
                       font-weight: 800;
                       color: #2c3e50;
                       margin-bottom: 10px;
                     }

                     .descripcion-vital {
                       font-size: 14px;
                       color: #666;
                       margin-bottom: 10px;
                       line-height: 1.5;
                     }

                     .puntuacion-vital {
                       font-size: 13px;
                       color: #888;
                       font-weight: 500;
                     }

                     /* MÉTRICAS DETALLADAS */
                     .seccion-metricas {
                       background: white;
                       padding: 25px;
                       border-radius: 10px;
                       box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                     }

                     .seccion-metricas h4 {
                       color: #2c3e50;
                       margin-bottom: 25px;
                       padding-bottom: 12px;
                       border-bottom: 2px solid #3498db;
                     }

                     .categorias-metricas {
                       display: grid;
                       gap: 30px;
                     }

                     .grupo-metricas h5 {
                       color: #2c3e50;
                       margin-bottom: 18px;
                       padding-left: 12px;
                       border-left: 4px solid;
                       font-size: 18px;
                     }
                 .grupo-metricas h5:first-child {
                           border-left-color: #27ae60;
                         }

                         .grupo-metricas h5:nth-child(2) {
                           border-left-color: #3498db;
                         }

                         .grupo-metricas h5:nth-child(3) {
                           border-left-color: #9b59b6;
                         }

                         .detalle-metrica {
                           background: #f8f9fa;
                           padding: 18px;
                           border-radius: 8px;
                           margin-bottom: 12px;
                           border: 1px solid #e9ecef;
                           transition: all 0.3s;
                         }

                         .detalle-metrica:hover {
                           background: white;
                           border-color: #3498db;
                           box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                         }

                         .encabezado-metrica {
                           display: flex;
                           justify-content: space-between;
                           align-items: center;
                           margin-bottom: 12px;
                         }

                         .nombre-metrica {
                           font-weight: 600;
                           color: #2c3e50;
                           font-size: 16px;
                         }

                         .score-metrica {
                           font-weight: 700;
                           font-size: 16px;
                         }

                         .valor-metrica {
                           font-size: 20px;
                           font-weight: 700;
                           color: #2c3e50;
                           margin-bottom: 8px;
                         }

                         .descripcion-metrica {
                           font-size: 14px;
                           color: #666;
                           line-height: 1.5;
                           margin-bottom: 8px;
                         }

                         .valor-numerico {
                           font-size: 13px;
                           color: #888;
                           font-weight: 500;
                         }

                         /* AUDITORÍAS */
                         .pestanas-auditorias {
                           display: flex;
                           gap: 12px;
                           margin-bottom: 25px;
                           flex-wrap: wrap;
                         }

                         .pestanas-auditorias button {
                           padding: 14px 24px;
                           background: #f8f9fa;
                           border: 2px solid #ddd;
                           border-radius: 8px;
                           cursor: pointer;
                           font-weight: 500;
                           transition: all 0.3s;
                           font-size: 15px;
                         }

                         .pestanas-auditorias button.activa {
                           background: #3498db;
                           color: white;
                           border-color: #3498db;
                           transform: scale(1.05);
                         }

                         .item-auditoria {
                           background: white;
                           padding: 20px;
                           border-radius: 8px;
                           margin-bottom: 15px;
                           border: 2px solid;
                           transition: all 0.3s;
                         }

                         .item-auditoria.oportunidad {
                           border-color: #ffeaa7;
                           background: #fff3cd;
                         }

                         .item-auditoria.aprobada {
                           border-color: #d4edda;
                           background: #e8f6f3;
                         }

                         .item-auditoria.informativa {
                           border-color: #cce7ff;
                           background: #e8f4fd;
                         }

                         .item-auditoria:hover {
                           transform: translateX(5px);
                         }

                         .encabezado-auditoria {
                           display: flex;
                           justify-content: space-between;
                           align-items: center;
                           margin-bottom: 12px;
                         }

                         .titulo-auditoria {
                           font-weight: 600;
                           color: #2c3e50;
                           font-size: 16px;
                           flex: 1;
                         }

                         .score-auditoria {
                           font-weight: 700;
                           font-size: 18px;
                           min-width: 40px;
                           text-align: center;
                         }

                         .valor-auditoria {
                           font-size: 18px;
                           font-weight: 700;
                           color: #2c3e50;
                           margin-bottom: 10px;
                         }

                         .descripcion-auditoria {
                           font-size: 14px;
                           color: #666;
                           line-height: 1.5;
                           margin-bottom: 10px;
                         }

                         .explicacion-auditoria {
                           font-size: 13px;
                           color: #888;
                           background: rgba(0,0,0,0.03);
                           padding: 10px;
                           border-radius: 6px;
                           margin-bottom: 10px;
                         }

                         .detalles-auditoria {
                           margin-top: 10px;
                         }
                     .detalles-auditoria summary {
                               font-size: 13px;
                               color: #3498db;
                               cursor: pointer;
                               font-weight: 500;
                             }

                             .detalles-auditoria ul {
                               margin-top: 10px;
                               padding-left: 20px;
                               font-size: 12px;
                               color: #666;
                             }

                             /* DIAGNÓSTICOS */
                             .item-diagnostico {
                               background: white;
                               padding: 20px;
                               border-radius: 8px;
                               margin-bottom: 15px;
                               border: 2px solid #ffeaa7;
                               background: #fff3cd;
                             }

                             .encabezado-diagnostico {
                               display: flex;
                               justify-content: space-between;
                               align-items: center;
                               margin-bottom: 12px;
                             }

                             .titulo-diagnostico {
                               font-weight: 600;
                               color: #856404;
                               font-size: 16px;
                               flex: 1;
                             }

                             .severidad {
                               padding: 4px 12px;
                               border-radius: 20px;
                               font-size: 12px;
                               font-weight: 700;
                               text-transform: uppercase;
                             }

                             .severidad-alto {
                               background: #e74c3c;
                               color: white;
                             }

                             .severidad-medio {
                               background: #f39c12;
                               color: white;
                             }

                             .severidad-bajo {
                               background: #27ae60;
                               color: white;
                             }

                             .valor-diagnostico {
                               font-size: 18px;
                               font-weight: 700;
                               color: #856404;
                               margin-bottom: 10px;
                             }

                             .descripcion-diagnostico {
                               font-size: 14px;
                               color: #856404;
                               line-height: 1.5;
                               margin-bottom: 10px;
                             }

                             .ahorro-diagnostico {
                               font-size: 13px;
                               color: #856404;
                               background: rgba(0,0,0,0.05);
                               padding: 8px 12px;
                               border-radius: 6px;
                               margin-top: 10px;
                             }

                             /* RECOMENDACIONES */
                             .grid-recomendaciones {
                               display: grid;
                               gap: 25px;
                               margin-top: 20px;
                             }

                             .grupo-prioridad h5 {
                               padding: 15px;
                               background: linear-gradient(135deg, #f8f9fa, #e9ecef);
                               border-radius: 8px;
                               margin-bottom: 15px;
                               font-size: 18px;
                               border-left: 5px solid;
                             }

                             .item-recomendacion {
                               background: white;
                               padding: 20px;
                               border-radius: 8px;
                               margin-bottom: 15px;
                               border: 1px solid #e9ecef;
                               transition: all 0.3s;
                             }

                             .item-recomendacion:hover {
                               transform: translateX(5px);
                               box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                             }

                             .titulo-recomendacion {
                               font-weight: 600;
                               color: #2c3e50;
                               font-size: 16px;
                               margin-bottom: 8px;
                             }

                             .descripcion-recomendacion {
                               font-size: 14px;
                               color: #666;
                               line-height: 1.5;
                               margin-bottom: 10px;
                             }

                             .impacto-recomendacion,
                             .accion-recomendacion {
                               font-size: 13px;
                               color: #888;
                               margin-top: 8px;
                             }

                             /* EXPERIENCIA DE CARGA */
                             .tarjeta-experiencia {
                               background: white;
                               padding: 25px;
                               border-radius: 10px;
                               border: 2px solid #3498db;
                             }

                             .categoria-experiencia {
                               font-size: 18px;
                               color: #2c3e50;
                               margin-bottom: 20px;
                               padding-bottom: 15px;
                               border-bottom: 2px solid #f1f3f4;
                             }

                             .grid-metricas-experiencia {
                               display: grid;
                               grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                               gap: 15px;
                               margin-top: 15px;
                             }

                             .metrica-experiencia {
                               padding: 15px;
                               background: #f8f9fa;
                               border-radius: 8px;
                               border: 1px solid #e9ecef;
                             }

                             .nombre-metrica {
                               font-weight: 600;
                               color: #2c3e50;
                               font-size: 14px;
                               text-transform: capitalize;
                             }

                             .categoria-metrica {
                               font-size: 18px;
                               font-weight: 700;
                               color: #3498db;
                               margin: 8px 0;
                             }
                         /* INFORMACIÓN DEL ANÁLISIS */
                                 .info-analisis {
                                   background: linear-gradient(135deg, #2c3e50, #34495e);
                                   padding: 20px;
                                   display: grid;
                                   grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                                   gap: 20px;
                                   color: white;
                                 }

                                 .item-info {
                                   display: flex;
                                   flex-direction: column;
                                   gap: 6px;
                                 }

                                 .item-info span:first-child {
                                   font-size: 13px;
                                   color: #bdc3c7;
                                   font-weight: 500;
                                 }

                                 .valor-info {
                                   font-size: 16px;
                                   font-weight: 600;
                                   color: white;
                                 }

                                 /* RESPONSIVE */
                                 @media (max-width: 768px) {
                                   .grid-puntuaciones {
                                     grid-template-columns: 1fr;
                                   }

                                   .grid-estadisticas {
                                     grid-template-columns: repeat(2, 1fr);
                                   }

                                   .grid-vitals {
                                     grid-template-columns: 1fr;
                                   }

                                   .pestanas-resultados {
                                     flex-wrap: wrap;
                                   }

                                   .pestanas-resultados button {
                                     flex: 1 0 45%;
                                     margin-bottom: 5px;
                                   }

                                   .botones-accion {
                                     flex-direction: column;
                                   }

                                   .botones-modo {
                                     flex-direction: column;
                                   }
                                 }

                                 @media (max-width: 480px) {
                                   .grid-estadisticas {
                                     grid-template-columns: 1fr;
                                   }

                                   .pestanas-resultados button {
                                     flex: 1 0 100%;
                                   }
                                 }
                               `}</style>
                             </div>
                           );
                         }