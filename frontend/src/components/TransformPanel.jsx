import React, { useState } from "react";

export default function TransformPanel({ backend, recording, onJob }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState('');
  const [flow, setFlow] = useState(''); // <- NUEVO ESTADO PARA EL FLUJO

  // SOLO UNA FUNCIÓN transform() - ESTA ES LA CORRECTA:
  async function transform() {
    // Si recording es un array (múltiples grabaciones)
    if (!recording || recording.length === 0) {
      alert('❌ Primero carga al menos una grabación válida');
      return;
    }

    // Validación de URL (obligatoria)
    if (!url || url.trim() === '') {
      alert('❌ La URL Base de la Aplicación es obligatoria.');
      return;
    }

    try {
      new URL(url);
    } catch (e) {
      alert('❌ URL inválida. Por favor, ingresa una URL válida');
      return;
    }

    setLoading(true);
    try {
      // PARA MÚLTIPLES GRABACIONES - USAR ESTE PAYLOAD:
      const payload = {
        recordings: recording, // Array de grabaciones (plural)
        url: url,
        testData: testData ? JSON.parse(testData) : {},
        flow: flow || "Multi-Flow Automation"
      };

      // USAR LA RUTA PARA MÚLTIPLES GRABACIONES:
      const resp = await fetch(`${backend}/api/transform-recordings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await resp.json();

      if (resp.ok && json.jobId) {
        onJob(json);
        alert(`✅ Proyecto generado exitosamente con ${recording.length} flujo(s)`);
      } else {
        alert('❌ Error: ' + (json.error || 'Error desconocido'));
      }
    } catch (e) {
      alert('❌ Error de conexión: ' + e.message);
      console.error('Network error:', e);
    } finally {
      setLoading(false);
    }
  }
  // ¡AQUÍ TERMINA LA FUNCIÓN transform()! NO HAY MÁS CÓDIGO DEBAJO

  return (
    <div className="transform-panel">
      <h3>🛠️ Generar Proyecto de Automatización Web</h3>

      {/* CAMPO DE FLUJO */}
      <div className="form-group">
        <label>📝 Nombre del Flujo (opcional)</label>
        <input
          value={flow}
          onChange={e => setFlow(e.target.value)}
          placeholder="Ej: Login de usuario, Registro, Compra"
        />
      </div>

      {/* === CAMPO DE URL MODIFICADO - AHORA ES OBLIGATORIO === */}
      <div className="form-group">
        <label>
          🌐 URL Base de la Aplicación <span style={{ color: 'red' }}>*</span>
          <span style={{
            fontSize: '12px',
            color: '#666',
            marginLeft: '8px',
            fontWeight: 'normal'
          }}>
            (obligatorio)
          </span>
        </label>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://tu-aplicacion.com"
          required
          style={{
            borderColor: url.trim() === '' ? '#e74c3c' : '#ddd',
            borderWidth: url.trim() === '' ? '2px' : '1px'
          }}
        />
        <small style={{
          display: 'block',
          color: '#666',
          fontSize: '12px',
          marginTop: '5px'
        }}>
          Ingresa la URL completa de la aplicación web que deseas automatizar
        </small>
      </div>

      <div className="form-group">
        <label>📊 Datos de Prueba (JSON opcional)</label>
        <textarea
          value={testData}
          onChange={e => setTestData(e.target.value)}
          placeholder='{"usuario": "test", "password": "test123"}'
        />
      </div>

      <div className="action-section">
        <button
          onClick={transform}
          disabled={loading || !recording}
          className="generate-button"
        >
          {loading ? '⏳ Generando...' : '👉 Generar Proyecto Serenity (.zip)'}
        </button>

        {!recording && (
          <p className="warning-text">
            ⚠️ Primero carga una grabación desde la pestaña "Subir Grabación"
          </p>
        )}

        {recording && !url.trim() && (
          <p className="warning-text" style={{ color: '#e74c3c' }}>
            ⚠️ Debes ingresar la URL Base de la Aplicación para generar el proyecto
          </p>
        )}

        {recording && url.trim() && (
          <p className="info-text">
            📝 Listo para generar proyecto con {recording.length} pasos grabados
          </p>
        )}
      </div>
    </div>
  );
}