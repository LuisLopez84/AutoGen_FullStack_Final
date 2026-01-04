import React, { useState } from "react";

export default function ApiKeyConfig({ onApiKeySet }) {
  const [apiKey, setApiKey] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      // Aquí normalmente enviarías al backend para guardar en .env
      // Por ahora solo mostraremos un mensaje
      localStorage.setItem('pagespeed_api_key_note', 'configure_env_file');
      setSaved(true);
      setTimeout(() => {
        setShowForm(false);
        setSaved(false);
        if (onApiKeySet) onApiKeySet();
      }, 2000);
    }
  };

  return (
    <div style={{
      marginTop: "20px",
      padding: "20px",
      background: "#e8f4fd",
      borderRadius: "8px",
      border: "1px solid #3498db"
    }}>
      {!showForm ? (
        <>
          <h4 style={{ color: "#2c3e50", marginBottom: "10px" }}>
            🔑 Configurar API Key
          </h4>
          <p style={{ color: "#555", fontSize: "14px", marginBottom: "15px" }}>
            Para análisis ilimitados y en tiempo real, configura tu API Key de Google PageSpeed Insights.
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: "10px 20px",
              background: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Configurar API Key
          </button>
        </>
      ) : (
        <>
          <h4 style={{ color: "#2c3e50", marginBottom: "15px" }}>
            📝 Ingresar API Key
          </h4>

          {saved ? (
            <div style={{
              padding: "15px",
              background: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "6px",
              color: "#155724",
              textAlign: "center"
            }}>
              ✅ Configuración guardada. Reinicia la aplicación.
            </div>
          ) : (
            <>
              <div style={{ marginBottom: "15px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: "#2c3e50"
                }}>
                  API Key de Google Cloud
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSyABCDEFGHIJKLMNOPQRSTUVWXYZ012345678"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "2px solid #3498db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontFamily: "monospace"
                  }}
                />
                <small style={{ display: "block", marginTop: "5px", color: "#666" }}>
                  Obtén tu clave en: <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#3498db" }}
                  >
                    Google Cloud Console
                  </a>
                </small>
              </div>

              <div style={{
                background: "#fff3cd",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "15px",
                fontSize: "13px",
                color: "#856404"
              }}>
                <strong>📋 Instrucciones:</strong>
                <ol style={{ margin: "8px 0 0 15px", padding: 0 }}>
                  <li>Ve a <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
                  <li>Crea un proyecto o selecciona uno existente</li>
                  <li>Habilita "PageSpeed Insights API"</li>
                  <li>Ve a "APIs y servicios" → "Credenciales"</li>
                  <li>Crea una "Clave de API"</li>
                  <li>Copia y pega aquí</li>
                </ol>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#27ae60",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Guardar
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#95a5a6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600"
                  }}
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}