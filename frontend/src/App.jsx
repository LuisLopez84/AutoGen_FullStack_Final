import React, { useState } from "react";
import RecorderGuide from "./components/RecorderGuide.jsx";
import RecordingUploader from "./components/RecordingUploader.jsx";
import TransformPanel from "./components/TransformPanel.jsx";
import RecorderPanel from "./components/RecorderPanel.jsx";
import PerformanceAnalyzer from "./components/PerformanceAnalyzer.jsx"; // <-- NUEVO IMPORT
import "./App.css";

const BACKEND = import.meta.env.VITE_BACKEND_BASE || "http://localhost:3000";

export default function App(){
  const [recording, setRecording] = useState(null);
  const [job, setJob] = useState(null);
  const [activeTab, setActiveTab] = useState("guide");

  return (
    <div className="app">
      <header className="app-header">
        <h1>AutoGen - Generador de Automatización WEB Inteligente</h1>
        <p>Convierte grabaciones web en proyectos base con Serenity BDD + Screenplay en minutos</p>
      </header>

      <div className="app-container">
        <nav className="tabs">
          <button
            className={activeTab === "guide" ? "tab-active" : "tab"}
            onClick={() => setActiveTab("guide")}
          >
            📋 Guía
          </button>
          <button
            className={activeTab === "recorder" ? "tab-active" : "tab"}
            onClick={() => setActiveTab("recorder")}
          >
            ⏺️ Grabador
          </button>
          <button
            className={activeTab === "upload" ? "tab-active" : "tab"}
            onClick={() => setActiveTab("upload")}
          >
            📤 Subir Grabación
          </button>
          {/* NUEVA PESTAÑA */}
          <button
            className={activeTab === "performance" ? "tab-active" : "tab"}
            onClick={() => setActiveTab("performance")}
          >
            ⚡ Performance
          </button>
        </nav>

        <div className="content">
          <div className="main-content">
            {activeTab === "guide" && <RecorderGuide />}
            {activeTab === "recorder" && <RecorderPanel backend={BACKEND} />}
            {activeTab === "upload" && <RecordingUploader onLoad={r => setRecording(r)} />}
            {activeTab === "performance" && <PerformanceAnalyzer />} {/* NUEVO COMPONENTE */}
          </div>

          <aside className="sidebar">
            <div className="status-card">
              <h3>📊 Estado Actual</h3>
              <div className="status-info">
                <div className="status-item">
                  <span className="label">Grabación cargada:</span>
                  <span className={recording ? "value success" : "value error"}>
                    {recording ? "✅ Sí" : "❌ No"}
                  </span>
                </div>
                {recording && (
                  <div className="status-item">
                    <span className="label">Flujos cargados:</span>
                    <span className="value info">{recording.length}</span>
                  </div>
                )}
                {job && (
                  <div className="status-item">
                    <span className="label">Proyecto generado:</span>
                    <span className="value success">✅ Listo</span>
                  </div>
                )}
              </div>
            </div>

            <TransformPanel
              backend={BACKEND}
              recording={recording}
              onJob={(j) => setJob(j)}
            />

            {job && (
              <div className="download-card">
                <h3>📦 Descargar Proyecto</h3>
                <a
                  href={`${BACKEND}${job.download}`}
                  className="download-button"
                  target='_blank'
                  rel="noreferrer"
                >
                  ⬇️ Descargar ZIP del Proyecto
                </a>
                <p className="download-info">
                  Proyecto base Serenity BDD + Screenplay generado automáticamente
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}