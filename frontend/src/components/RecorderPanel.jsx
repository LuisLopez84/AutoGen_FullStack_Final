import React from "react";

export default function RecorderPanel() {
  return (
    <div data-autogen-recorder-ignore style={{
      padding: 20,
      background: "#fff",
      borderRadius: 8,
      maxWidth: 1200,
      margin: "0 auto"
    }}>
      <h2 style={{
        color: "#2c3e50",
        marginBottom: 20,
        textAlign: "center",
        fontSize: "24px"
      }}>
        AutoGen QA Recorder - Complemento de Chrome
      </h2>

      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 30
      }}>
        {/* Imagen del complemento */}
        <div style={{
          border: "2px solid #e0e0e0",
          borderRadius: 8,
          padding: 10,
          backgroundColor: "#f8f9fa",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}>
          <img
            src="/1000132641.png"
            alt="AutoGen QA Recorder Chrome Extension"
            style={{
              maxWidth: "100%",
              height: "auto",
              borderRadius: 4,
              display: "block"
            }}
          />
        </div>

        {/* Información del complemento */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 30,
          width: "100%"
        }}>
          {/* Columna izquierda - Instalación */}
          <div style={{
            padding: 20,
            backgroundColor: "#f8f9fa",
            borderRadius: 8,
            border: "1px solid #e0e0e0"
          }}>
            <h3 style={{
              color: "#2c3e50",
              marginBottom: 15,
              fontSize: "18px"
            }}>
              📥 Instalación del Complemento
            </h3>
            <p style={{
              lineHeight: 1.6,
              marginBottom: 15,
              color: "#555"
            }}>
              El complemento de Chrome llamado <strong>AutoGen QA Recorder</strong> es el complemento que permite realizar la grabación del flujo web que desea automatizar con Serenity BDD Screenplay.
            </p>
            <p style={{
              lineHeight: 1.6,
              color: "#555"
            }}>
              Para usarlo debe instalarlo desde <code style={{
                backgroundColor: "#e9ecef",
                padding: "2px 6px",
                borderRadius: 3,
                fontSize: "14px"
              }}>chrome://extensions/</code> habilitando la opción de <strong>Modo desarrollador</strong> y <strong>Cargando la Extensión sin Empaquetar</strong>. Una vez hecho esto debe aparecer el ID del complemento con el service worker <strong>Activo</strong> y ya podrá hacer uso de la grabadora.
            </p>
          </div>

          {/* Columna derecha - Uso */}
          <div style={{
            padding: 20,
            backgroundColor: "#f8f9fa",
            borderRadius: 8,
            border: "1px solid #e0e0e0"
          }}>
            <h3 style={{
              color: "#2c3e50",
              marginBottom: 15,
              fontSize: "18px"
            }}>
              🎯 Uso del Complemento
            </h3>
            <p style={{
              lineHeight: 1.6,
              marginBottom: 15,
              color: "#555"
            }}>
              Su uso es bastante sencillo:
            </p>
            <ol style={{
              lineHeight: 1.8,
              paddingLeft: 20,
              color: "#555"
            }}>
              <li><strong style={{color: "#27ae60"}}>Botón verde</strong> inicia la grabación del sitio web.</li>
              <li><strong style={{color: "#e74c3c"}}>Botón rojo</strong> detiene la grabación del flujo.</li>
              <li><strong style={{color: "#3498db"}}>Botón azul</strong> descarga la grabación en formato .json</li>
            </ol>
            <p style={{
              lineHeight: 1.6,
              color: "#555",
              marginTop: 15
            }}>
              El complemento indica cuántos pasos fueron grabados e indica si la grabación fue iniciada o detenida; también realiza grabación de elementos dentro de componentes <strong>shadow root</strong>.
            </p>
          </div>
        </div>

        {/* Características técnicas */}
        <div style={{
          padding: 20,
          backgroundColor: "#e8f4fd",
          borderRadius: 8,
          border: "1px solid #3498db",
          width: "100%"
        }}>
          <h3 style={{
            color: "#2c3e50",
            marginBottom: 10,
            fontSize: "16px",
            textAlign: "center"
          }}>
            🚀 Características Técnicas
          </h3>
          <div style={{
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: 15,
            marginTop: 15
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                backgroundColor: "#27ae60",
                color: "white",
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px"
              }}>✓</div>
              <span style={{ fontSize: "14px", color: "#555" }}>Soporte Shadow DOM</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{
                backgroundColor: "#3498db",
                color: "white",
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px"
              }}>✓</div>
              <span style={{ fontSize: "14px", color: "#555" }}>Exporta Formato JSON</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{
                backgroundColor: "#9b59b6",
                color: "white",
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px"
              }}>✓</div>
              <span style={{ fontSize: "14px", color: "#555" }}>Seguimiento de Pasos</span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{
                backgroundColor: "#e67e22",
                color: "white",
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 8px"
              }}>✓</div>
              <span style={{ fontSize: "14px", color: "#555" }}>Grabación en tiempo real</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}