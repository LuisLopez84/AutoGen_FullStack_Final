import React, { useState } from "react";

export default function RecordingUploader({ onLoad }) {
  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const txt = await f.text();
    try {
      const j = JSON.parse(txt);
      onLoad(j);
      alert('✅ Archivo de grabación cargado exitosamente');
    } catch (e) {
      alert('❌ Error: Archivo JSON inválido');
    }
  };

  return (
    <div style={{
      marginTop: 12,
      padding: 30,
      background: '#fff',
      borderRadius: 8,
      maxWidth: 600,
      margin: "20px auto",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{
        color: "#2c3e50",
        marginBottom: 10,
        textAlign: "center",
        fontSize: "24px"
      }}>
        📤 Cargar Grabación
      </h2>

      <p style={{
        textAlign: "center",
        color: "#666",
        marginBottom: 30,
        lineHeight: 1.5
      }}>
        Selecciona el archivo JSON generado por el complemento AutoGen QA Recorder
      </p>

      <div style={{
        border: "2px dashed #3498db",
        borderRadius: 8,
        padding: 40,
        textAlign: "center",
        backgroundColor: "#f8f9fa",
        transition: "all 0.3s ease"
      }}>
        <div style={{
          fontSize: 48,
          marginBottom: 15,
          color: "#3498db"
        }}>
          📄
        </div>

        <h3 style={{
          color: "#2c3e50",
          marginBottom: 10
        }}>
          Subir archivo .json
        </h3>

        <p style={{
          color: "#666",
          marginBottom: 20,
          fontSize: "14px"
        }}>
          Arrastra y suelta tu archivo JSON o haz clic para seleccionarlo
        </p>

        <label style={{
          display: "inline-block",
          padding: "12px 24px",
          backgroundColor: "#3498db",
          color: "white",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: "500",
          transition: "background-color 0.3s ease"
        }}>
          📂 Seleccionar archivo JSON
          <input
            type="file"
            accept=".json"
            onChange={onFile}
            style={{
              display: "none"
            }}
          />
        </label>

        <p style={{
          marginTop: 15,
          fontSize: "12px",
          color: "#999"
        }}>
          Formatos aceptados: .json | Tamaño máximo: 10MB
        </p>
      </div>

      {/* Información adicional */}
      <div style={{
        marginTop: 30,
        padding: 20,
        backgroundColor: "#e8f4fd",
        borderRadius: 8,
        border: "1px solid #3498db"
      }}>
        <h4 style={{
          color: "#2c3e50",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          💡 Información importante
        </h4>
        <ul style={{
          color: "#555",
          lineHeight: 1.6,
          paddingLeft: 20,
          fontSize: "14px"
        }}>
          <li>Asegúrate de que el archivo JSON fue generado por el complemento AutoGen QA Recorder</li>
          <li>El archivo debe contener los pasos grabados de tu flujo de prueba</li>
          <li>Después de cargar el archivo, podrás generar tu proyecto de automatización</li>
        </ul>
      </div>
    </div>
  );
}