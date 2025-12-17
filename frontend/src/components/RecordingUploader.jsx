import React, { useState } from "react";

export default function RecordingUploader({ onLoad }) {
  const [files, setFiles] = useState([]);
  const [fileNames, setFileNames] = useState([]);

  const onFile = async (e) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const validRecordings = [];
    const validFileNames = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const f = selectedFiles[i];
      try {
        const txt = await f.text();
        const j = JSON.parse(txt);

        if (j.steps && Array.isArray(j.steps)) {
          validRecordings.push({
            data: j,
            name: f.name.replace('.json', ''),
            fileName: f.name
          });
          validFileNames.push(f.name);
        } else {
          console.warn(`Archivo ${f.name} no tiene estructura válida de grabación`);
        }
      } catch (e) {
        console.error(`Error procesando ${f.name}:`, e);
      }
    }

    if (validRecordings.length > 0) {
      setFiles(validRecordings);
      setFileNames(validFileNames);
      onLoad(validRecordings);
      alert(`✅ ${validRecordings.length} grabación(es) cargada(s) exitosamente`);
    } else {
      alert('❌ Error: Ningún archivo JSON válido encontrado');
    }
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    const newFileNames = [...fileNames];
    newFiles.splice(index, 1);
    newFileNames.splice(index, 1);
    setFiles(newFiles);
    setFileNames(newFileNames);
    onLoad(newFiles);
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
        📤 Cargar Múltiples Grabaciones
      </h2>

      <p style={{
        textAlign: "center",
        color: "#666",
        marginBottom: 30,
        lineHeight: 1.5
      }}>
        Selecciona múltiples archivos JSON generados por el complemento AutoGen QA Recorder
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
          📂
        </div>

        <h3 style={{
          color: "#2c3e50",
          marginBottom: 10
        }}>
          Subir múltiples archivos .json
        </h3>

        <p style={{
          color: "#666",
          marginBottom: 20,
          fontSize: "14px"
        }}>
          Arrastra y suelta tus archivos JSON o haz clic para seleccionar múltiples
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
          📂 Seleccionar archivos JSON
          <input
            type="file"
            accept=".json"
            onChange={onFile}
            multiple
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
          Selecciona múltiples .json | Máx 10 archivos | Tamaño máximo por archivo: 10MB
        </p>
      </div>

      {/* Lista de archivos cargados */}
      {files.length > 0 && (
        <div style={{
          marginTop: 30,
          padding: 20,
          backgroundColor: "#f8f9fa",
          borderRadius: 8,
          border: "1px solid #dee2e6"
        }}>
          <h4 style={{
            color: "#2c3e50",
            marginBottom: 15,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            📋 Archivos Cargados ({files.length})
          </h4>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {files.map((file, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: 'white',
                borderRadius: '5px',
                border: '1px solid #e9ecef'
              }}>
                <div>
                  <span style={{ fontWeight: 'bold' }}>{file.name}</span>
                  <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
                    ({file.data.steps?.length || 0} pasos)
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  style={{
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
          <li>Puedes cargar múltiples grabaciones de un mismo portal web</li>
          <li>Cada grabación generará su propio archivo .feature y clases Java asociadas</li>
          <li>Los nombres de las clases se generarán automáticamente basados en el nombre del archivo</li>
          <li>Todos los archivos compartirán la misma URL base y configuración</li>
        </ul>
      </div>
    </div>
  );
}