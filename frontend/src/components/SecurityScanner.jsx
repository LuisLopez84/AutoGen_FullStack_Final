import React, { useState } from 'react';
import axios from 'axios'; // Asegúrate de tener axios instalado en frontend también

const SecurityScanner = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleScan = async () => {
    if (!url) {
      setError('Por favor ingresa una URL válida (ej: http://mi-sitio.com)');
      return;
    }

    setLoading(true);
    setError('');
    setScanResults(null);

    try {
      const response = await axios.post(`${API_URL}/api/zap/scan`, { url });
      setScanResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al conectar con el servidor de escaneo. Asegúrate de que ZAP está corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    if (!scanResults) return;

    try {
      const response = await axios.post(
        `${API_URL}/api/zap/export/${type}`,
        { alerts: scanResults.alerts, url: url },
        { responseType: 'blob' }
      );

      // Crear link de descarga
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `zap_scan_${type}.${type}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Error al exportar archivo');
    }
  };

  // Contadores para el dashboard
  const getRiskCounts = () => {
    if (!scanResults) return {};
    return scanResults.alerts.reduce((acc, alert) => {
      acc[alert.risk] = (acc[alert.risk] || 0) + 1;
      return acc;
    }, {});
  };

  const riskCounts = getRiskCounts();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🛡️ Security Scanner (OWASP ZAP)</h2>

      {/* Panel de Control */}
      <div style={styles.inputPanel}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://ejemplo.com"
          style={styles.input}
          disabled={loading}
        />
        <button
          onClick={handleScan}
          disabled={loading}
          style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
        >
          {loading ? 'Escaneando... (Esto puede tomar minutos)' : 'Iniciar Escaneo'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Dashboard de Resultados */}
      {scanResults && (
        <div style={styles.resultsContainer}>

          {/* Resumen */}
          <div style={styles.summaryGrid}>
            <div style={{...styles.card, borderColor: '#c0392b'}}>
              <h3>Alto</h3>
              <p style={{fontSize: '2rem', color: '#c0392b'}}>{riskCounts.High || 0}</p>
            </div>
            <div style={{...styles.card, borderColor: '#e67e22'}}>
              <h3>Medio</h3>
              <p style={{fontSize: '2rem', color: '#e67e22'}}>{riskCounts.Medium || 0}</p>
            </div>
            <div style={{...styles.card, borderColor: '#f1c40f'}}>
              <h3>Bajo</h3>
              <p style={{fontSize: '2rem', color: '#f1c40f'}}>{riskCounts.Low || 0}</p>
            </div>
            <div style={{...styles.card, borderColor: '#3498db'}}>
              <h3>Informativo</h3>
              <p style={{fontSize: '2rem', color: '#3498db'}}>{riskCounts.Informational || 0}</p>
            </div>
          </div>

          {/* Botones de Exportación */}
          <div style={styles.exportPanel}>
            <button onClick={() => handleExport('pdf')} style={styles.exportBtn}>📄 Descargar PDF</button>
            <button onClick={() => handleExport('csv')} style={styles.exportBtn}>📊 Descargar CSV</button>
          </div>

          {/* Lista de Alertas */}
          <h3>Detalles de Vulnerabilidades ({scanResults.total})</h3>
          <div style={styles.alertList}>
            {scanResults.alerts.map((alert, index) => (
              <div key={index} style={styles.alertItem(alert.risk)}>
                <div style={styles.alertHeader}>
                  <span style={styles.riskBadge(alert.risk)}>{alert.risk}</span>
                  <h4 style={styles.alertTitle}>{alert.name}</h4>
                </div>
                <p><strong>URL:</strong> <a href={alert.url} target="_blank" rel="noreferrer">{alert.url}</a></p>
                <p><strong>Descripción:</strong> {alert.description}</p>
                {alert.solution && <p><strong>Solución:</strong> {alert.solution}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos en línea para facilitar el ejemplo y mantener consistencia
const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' },
  title: { marginBottom: '20px', color: '#2c3e50' },
  inputPanel: { display: 'flex', gap: '10px', marginBottom: '20px' },
  input: { flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' },
  button: { padding: '10px 20px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' },
  buttonDisabled: { backgroundColor: '#95a5a6', cursor: 'not-allowed' },
  error: { color: 'red', marginBottom: '20px', padding: '10px', backgroundColor: '#fadbd8', borderRadius: '5px' },
  resultsContainer: { marginTop: '30px' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' },
  card: { padding: '20px', borderRadius: '8px', border: '2px solid #ddd', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  exportPanel: { marginBottom: '30px', textAlign: 'right' },
  exportBtn: { padding: '10px 20px', marginLeft: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  alertList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  alertItem: (risk) => ({
    padding: '15px',
    borderRadius: '5px',
    backgroundColor: '#f8f9fa',
    borderLeft: `5px solid ${risk === 'High' ? '#c0392b' : risk === 'Medium' ? '#e67e22' : risk === 'Low' ? '#f1c40f' : '#3498db'}`
  }),
  alertHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  riskBadge: (risk) => ({
    padding: '5px 10px',
    borderRadius: '3px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: risk === 'High' ? '#c0392b' : risk === 'Medium' ? '#e67e22' : risk === 'Low' ? '#f1c40f' : '#3498db'
  }),
  alertTitle: { margin: 0, color: '#2c3e50' }
};

export default SecurityScanner;