import React, { useState } from 'react';

const PlaywrightBDD = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleDownloadClick = () => {
    setShowModal(true);
  };

  const confirmDownload = async () => {
    setShowModal(false);
    setIsGenerating(true);
    setStatusMessage('Conectando con OpenAI y generando estructura Java...');

    try {
      const response = await fetch('http://localhost:3000/api/generate-playwright-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error en el servidor al generar el proyecto');
      }

      setStatusMessage('Proyecto generado. Comprimiendo y descargando...');

      // Crear un blob desde la respuesta y descargarlo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Playwright_BDD_Template_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      setStatusMessage('¡Descarga completada con éxito!');
      setTimeout(() => setStatusMessage(''), 5000);

    } catch (error) {
      console.error('Error:', error);
      setStatusMessage('Hubo un error al generar el proyecto. Intenta nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>Playwright BDD POM Generator</h2>
          <p style={styles.subtitle}>
            Generador de plantillas Java Maven con Playwright, Cucumber y Allure
          </p>
        </div>

        <div style={styles.content}>
          <div style={styles.infoSection}>
            <h3 style={styles.infoTitle}>🚀 Características del Template</h3>
            <ul style={styles.list}>
              <li>✅ Estructura Screenplay / Page Object Model</li>
              <li>✅ Integración completa con Cucumber y Gherkin</li>
              <li>✅ Configuración de Hooks para Videos y Screenshots</li>
              <li>✅ Reporting con Allure</li>
              <li>✅ Gestión de configuraciones multi-navegador</li>
            </ul>
          </div>

          <div style={styles.actionSection}>
            <button
              onClick={handleDownloadClick}
              disabled={isGenerating}
              style={{
                ...styles.button,
                ...(isGenerating ? styles.buttonDisabled : {})
              }}
            >
              {isGenerating ? 'Procesando...' : '⬇️ Descargar Plantilla Java'}
            </button>

            {statusMessage && (
              <div style={styles.statusMessage}>
                {statusMessage}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Confirmar Generación</h3>
            <p style={styles.modalText}>
              Este proceso utilizará la API de OpenAI para construir el código fuente del proyecto
              basado en las mejores prácticas de automatización.
            </p>
            <p style={styles.modalText}>
              <strong>¿Deseas continuar y descargar el .zip?</strong>
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setShowModal(false)}
                style={styles.buttonSecondary}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDownload}
                style={styles.buttonPrimary}
              >
                Sí, Generar y Descargar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos en línea para asegurar consistencia visual
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f8f9fa',
    minHeight: '80vh'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    border: '1px solid #e1e4e8'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '2rem',
    color: '#fff'
  },
  title: {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: '600'
  },
  subtitle: {
    margin: '0.5rem 0 0',
    opacity: 0.9,
    fontSize: '1rem'
  },
  content: {
    padding: '2rem',
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap'
  },
  infoSection: {
    flex: '2',
    minWidth: '300px'
  },
  infoTitle: {
    color: '#2d3748',
    borderBottom: '2px solid #667eea',
    paddingBottom: '0.5rem',
    marginBottom: '1rem'
  },
  list: {
    lineHeight: '1.8',
    color: '#4a5568',
    paddingLeft: '1.2rem'
  },
  actionSection: {
    flex: '1',
    minWidth: '250px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7fafc',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '1px dashed #cbd5e0'
  },
  button: {
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#48bb78',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 5px rgba(72, 187, 120, 0.3)'
  },
  buttonDisabled: {
    backgroundColor: '#a0aec0',
    cursor: 'not-allowed',
    boxShadow: 'none'
  },
  statusMessage: {
    marginTop: '1rem',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '0.9rem',
    textAlign: 'center',
    backgroundColor: '#ebf8ff',
    color: '#2c5282',
    border: '1px solid '#bee3f8'
  },
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    textAlign: 'center'
  },
  modalTitle: {
    marginTop: 0,
    color: '#2d3748'
  },
  modalText: {
    color: '#4a5568',
    lineHeight: '1.6'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginTop: '2rem'
  },
  buttonSecondary: {
    padding: '10px 20px',
    backgroundColor: '#cbd5e0',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#2d3748',
    fontWeight: '500'
  },
  buttonPrimary: {
    padding: '10px 20px',
    backgroundColor: '#667eea',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#fff',
    fontWeight: '500'
  }
};

export default PlaywrightBDD;