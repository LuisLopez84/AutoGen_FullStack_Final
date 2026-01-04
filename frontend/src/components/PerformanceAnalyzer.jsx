import React, { useState } from "react";
import ApiKeyConfig from "./ApiKeyConfig.jsx"; // Importar el componente

export default function PerformanceAnalyzer() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("mobile"); // 'mobile' o 'desktop'

  const analyzeUrl = async () => {
    if (!url || !url.trim()) {
      setError("Por favor ingresa una URL válida");
      return;
    }

    // Validar formato de URL
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
      // Intentar con el endpoint principal primero
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
        // Si es error 429 (rate limit), usar método alternativo
        if (response.status === 429) {
          console.log("Usando método alternativo por límite de API...");

          const altResponse = await fetch("http://localhost:3000/api/analyze-performance-alt", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: url.trim(),
              strategy: mode
            }),
          });

          const altData = await altResponse.json();

          if (altResponse.ok) {
            // Agregar nota de que son datos de ejemplo
            altData._isFallback = true;
            setResults(altData);
            setError("⚠️ Mostrando datos de ejemplo (API limitada). Para datos reales, configura una API Key.");
          } else {
            throw new Error(altData.error || "Error en método alternativo");
          }
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

  const formatScore = (score) => {
    if (score >= 90) return { color: "#27ae60", label: "Excelente" };
    if (score >= 70) return { color: "#f39c12", label: "Bueno" };
    if (score >= 50) return { color: "#e67e22", label: "Regular" };
    return { color: "#e74c3c", label: "Bajo" };
  };

  const openInPageSpeed = () => {
    if (!url.trim()) {
      setError("Ingresa una URL primero para abrir en PageSpeed");
      return;
    }
    const pageSpeedUrl = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}`;
    window.open(pageSpeedUrl, "_blank");
  };

  // Función para renderizar resultados
  const renderResults = () => {
    if (!results) return null;

    // Verificar si son datos reales o de ejemplo
    const isFallbackData = results._isFallback;

    // Ajustar acceso a datos según el tipo
    const categories = results.categories || results.lighthouseResult?.categories;
    const audits = results.audits || results.lighthouseResult?.audits;

    return (
      <div style={{
        background: "white",
        borderRadius: "10px",
        border: "1px solid #dee2e6",
        overflow: "hidden",
        marginBottom: "20px"
      }}>
        {/* Header de resultados */}
        <div style={{
          background: "#2c3e50",
          color: "white",
          padding: "15px 25px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h3 style={{ margin: 0, fontSize: "18px" }}>
            📊 Resultados del Análisis
          </h3>
          <div style={{
            padding: "5px 10px",
            background: mode === "mobile" ? "#3498db" : "#9b59b6",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: "600"
          }}>
            {mode === "mobile" ? "📱 Móvil" : "🖥️ Escritorio"}
          </div>
        </div>

        {/* Banner para datos de ejemplo */}
        {isFallbackData && (
          <div style={{
            padding: "15px",
            background: "linear-gradient(135deg, #fff3cd, #ffeaa7)",
            borderBottom: "2px solid #f39c12",
            color: "#856404"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "20px" }}>⚠️</span>
              <h4 style={{ margin: 0, fontSize: "16px" }}>Datos de Ejemplo</h4>
            </div>
            <p style={{ marginBottom: "10px", fontSize: "14px" }}>
              La API de PageSpeed Insights está limitada. Estos son datos simulados para demostración.
            </p>
          </div>
        )}

        {/* Scores principales */}
        {categories && (
          <div style={{
            padding: "25px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px"
          }}>
            {Object.entries(categories).map(([key, category]) => {
              const score = typeof category.score === 'number' ? category.score : Math.round(category.score * 100);
              const scoreInfo = formatScore(score);

              return (
                <div key={key} style={{
                  background: "#f8f9fa",
                  padding: "20px",
                  borderRadius: "8px",
                  textAlign: "center",
                  border: `2px solid ${scoreInfo.color}`
                }}>
                  <div style={{
                    fontSize: "14px",
                    color: "#666",
                    marginBottom: "10px",
                    fontWeight: "600"
                  }}>
                    {category.title || key}
                  </div>
                  <div style={{
                    fontSize: "42px",
                    fontWeight: "700",
                    color: scoreInfo.color,
                    marginBottom: "5px"
                  }}>
                    {score}
                  </div>
                  <div style={{
                    padding: "4px 10px",
                    background: scoreInfo.color,
                    color: "white",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "600",
                    display: "inline-block"
                  }}>
                    {scoreInfo.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Métricas clave */}
        {audits && (
          <div style={{ padding: "0 25px 25px" }}>
            <h4 style={{ color: "#2c3e50", marginBottom: "15px" }}>📈 Métricas Clave</h4>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "15px"
            }}>
              {['first-contentful-paint', 'largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time']
                .filter(key => audits[key])
                .map((key) => {
                  const audit = audits[key];
                  const score = audit.score || 0.5;

                  return (
                    <div key={key} style={{
                      background: "#f8f9fa",
                      padding: "15px",
                      borderRadius: "6px",
                      borderLeft: `4px solid ${score >= 0.9 ? "#27ae60" : score >= 0.5 ? "#f39c12" : "#e74c3c"}`
                    }}>
                      <div style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#2c3e50",
                        marginBottom: "5px"
                      }}>
                        {audit.title || key}
                      </div>
                      <div style={{
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#2c3e50"
                      }}>
                        {audit.displayValue || "N/A"}
                      </div>
                      {audit.description && (
                        <div style={{
                          fontSize: "12px",
                          color: "#666",
                          marginTop: "5px"
                        }}>
                          {audit.description}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      padding: "30px",
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      maxWidth: "1200px",
      margin: "0 auto"
    }}>
      <h2 style={{
        color: "#2c3e50",
        marginBottom: "25px",
        textAlign: "center",
        fontSize: "28px",
        borderBottom: "2px solid #3498db",
        paddingBottom: "15px"
      }}>
        ⚡ Analizador de Performance Web
      </h2>

      {/* Input y controles */}
      <div style={{
        background: "#f8f9fa",
        padding: "25px",
        borderRadius: "10px",
        marginBottom: "30px",
        border: "1px solid #dee2e6"
      }}>
        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "600",
            color: "#2c3e50"
          }}>
            🌐 URL para Analizar
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://ejemplo.com"
            style={{
              width: "100%",
              padding: "12px 15px",
              border: "2px solid #3498db",
              borderRadius: "8px",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.3s",
              backgroundColor: "#fff"
            }}
            onFocus={(e) => e.target.style.borderColor = "#2980b9"}
            onBlur={(e) => e.target.style.borderColor = "#3498db"}
          />
          <small style={{ display: "block", marginTop: "5px", color: "#666", fontSize: "14px" }}>
            Ingresa la URL completa de la página web que deseas analizar
          </small>
        </div>

        {/* Selector de modo */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "600",
            color: "#2c3e50"
          }}>
            📱 Dispositivo a Analizar
          </label>
          <div style={{ display: "flex", gap: "15px" }}>
            <button
              onClick={() => setMode("mobile")}
              style={{
                flex: 1,
                padding: "12px",
                background: mode === "mobile" ? "#3498db" : "#ecf0f1",
                color: mode === "mobile" ? "white" : "#2c3e50",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.3s",
                fontSize: "14px"
              }}
              onMouseEnter={(e) => {
                if (mode !== "mobile") e.target.style.background = "#d5dbdb";
              }}
              onMouseLeave={(e) => {
                if (mode !== "mobile") e.target.style.background = "#ecf0f1";
              }}
            >
              📱 Móvil
            </button>
            <button
              onClick={() => setMode("desktop")}
              style={{
                flex: 1,
                padding: "12px",
                background: mode === "desktop" ? "#9b59b6" : "#ecf0f1",
                color: mode === "desktop" ? "white" : "#2c3e50",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                transition: "all 0.3s",
                fontSize: "14px"
              }}
              onMouseEnter={(e) => {
                if (mode !== "desktop") e.target.style.background = "#d5dbdb";
              }}
              onMouseLeave={(e) => {
                if (mode !== "desktop") e.target.style.background = "#ecf0f1";
              }}
            >
              🖥️ Escritorio
            </button>
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{ display: "flex", gap: "15px" }}>
          <button
            onClick={analyzeUrl}
            disabled={loading || !url}
            style={{
              flex: 2,
              padding: "15px",
              background: loading ? "#95a5a6" : "#27ae60",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "16px",
              transition: "all 0.3s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px"
            }}
            onMouseEnter={(e) => {
              if (!loading && url) e.target.style.background = "#219653";
            }}
            onMouseLeave={(e) => {
              if (!loading && url) e.target.style.background = "#27ae60";
            }}
          >
            {loading ? (
              <>
                <span style={{
                  display: "inline-block",
                  width: "20px",
                  height: "20px",
                  border: "3px solid rgba(255,255,255,.3)",
                  borderRadius: "50%",
                  borderTopColor: "white",
                  animation: "spin 1s ease-in-out infinite"
                }}></span>
                Analizando...
              </>
            ) : (
              "🔍 Analizar Performance"
            )}
          </button>
          <button
            onClick={openInPageSpeed}
            disabled={!url.trim()}
            style={{
              flex: 1,
              padding: "15px",
              background: !url.trim() ? "#bdc3c7" : "#9b59b6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: !url.trim() ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "16px",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              if (url.trim()) e.target.style.background = "#8e44ad";
            }}
            onMouseLeave={(e) => {
              if (url.trim()) e.target.style.background = "#9b59b6";
            }}
          >
            📊 Abrir en PageSpeed
          </button>
        </div>

        {error && (
          <div style={{
            marginTop: "15px",
            padding: "12px",
            background: error.includes("⚠️") ? "#fff3cd" : "#ffe6e6",
            border: error.includes("⚠️") ? "1px solid #ffeaa7" : "1px solid #ffcccc",
            borderRadius: "6px",
            color: error.includes("⚠️") ? "#856404" : "#e74c3c",
            fontSize: "14px"
          }}>
            {error.includes("⚠️") ? "⚠️ " : "❌ "}{error.replace("⚠️ ", "").replace("❌ ", "")}
          </div>
        )}
      </div>

      {/* Mostrar resultados */}
      {renderResults()}

      {/* Componente de configuración de API Key */}
      <ApiKeyConfig />

      {/* Información adicional */}
      <div style={{
        marginTop: "30px",
        padding: "20px",
        background: "#f8f9fa",
        borderRadius: "10px",
        border: "1px solid #dee2e6"
      }}>
        <h4 style={{ color: "#2c3e50", marginBottom: "10px", fontSize: "18px" }}>
          ℹ️ ¿Cómo funciona?
        </h4>
        <p style={{ color: "#555", lineHeight: "1.6", marginBottom: "15px", fontSize: "14px" }}>
          Esta herramienta utiliza la API de Google PageSpeed Insights para analizar el performance de tu página web.
          Proporciona métricas clave como:
        </p>
        <ul style={{ color: "#555", paddingLeft: "20px", lineHeight: "1.6", fontSize: "14px" }}>
          <li><strong>Performance Score:</strong> Puntuación general del 0-100</li>
          <li><strong>First Contentful Paint:</strong> Tiempo hasta que se pinta el primer contenido</li>
          <li><strong>Largest Contentful Paint:</strong> Tiempo hasta que se pinta el contenido más grande</li>
          <li><strong>Cumulative Layout Shift:</strong> Estabilidad visual de la página</li>
          <li><strong>Total Blocking Time:</strong> Tiempo total que el hilo principal está bloqueado</li>
        </ul>
      </div>

      {/* Estilos CSS inline para spinner */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}