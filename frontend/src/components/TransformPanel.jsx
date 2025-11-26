import React, { useState } from "react";

export default function TransformPanel({ backend, recording, onJob }){
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [testData, setTestData] = useState('');

  async function transform(){
    if(!recording || recording.length === 0) {
      alert('❌ Primero carga una grabación válida');
      return;
    }

    setLoading(true);
    try{
      const payload = {
        recording,
        url: url || "https://ejemplo.com",
        testData: testData ? JSON.parse(testData) : {}
      };

      const resp = await fetch(`${backend}/api/transform-recording`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await resp.json();

      if(resp.ok && json.jobId){
        onJob(json);
        alert('✅ Proyecto generado exitosamente: ' + json.jobId);
      } else {
        alert('❌ Error: ' + (json.error || 'Error desconocido'));
        console.error('Transform error:', json);
      }
    } catch(e){
      alert('❌ Error de conexión: ' + e.message);
      console.error('Network error:', e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="transform-panel">
      <h3>🛠️ Generar Proyecto de Automatización</h3>

      <div className="form-group">
        <label>🌐 URL Base de la Aplicación</label>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://tu-aplicacion.com"
        />
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
          {loading ? '⏳ Generando...' : '🚀 Generar Proyecto Serenity (.zip)'}
        </button>

        {!recording && (
          <p className="warning-text">
            ⚠️ Primero carga una grabación desde la pestaña "Subir Grabación"
          </p>
        )}

        {recording && (
          <p className="info-text">
            📝 Listo para generar proyecto con {recording.length} pasos grabados
          </p>
        )}
      </div>
    </div>
  );
}