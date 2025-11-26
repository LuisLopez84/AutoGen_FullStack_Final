// frontend/src/components/RecorderPanel.jsx
import React, { useEffect, useState, useRef } from "react";

function computeSelector(el) {
  if (!el) return "";
  if (el.id) return `#${el.id}`;
  if (el.className && typeof el.className === "string" && el.className.trim()) {
    const classes = el.className.trim().split(/\s+/).join(".");
    return `${el.tagName.toLowerCase()}.${classes}`;
  }
  let path = el.tagName.toLowerCase();
  if (el.parentElement) {
    const siblings = Array.from(el.parentElement.children).filter(c => c.tagName === el.tagName);
    if (siblings.length > 1) {
      const idx = siblings.indexOf(el) + 1;
      path += `:nth-of-type(${idx})`;
    }
  }
  return path;
}

export default function RecorderPanel({ backend = "http://localhost:3000" }) {
  const [recording, setRecording] = useState(false);
  const [stepsCount, setStepsCount] = useState(0);
  const [steps, setSteps] = useState([]);
  const handlersRef = useRef({});

  // Textos editables para cada elemento
  const [textos, setTextos] = useState({
    titulo: "AutoGen QA Recorder",
    estado: "Grabación Detenida",
    pasos: "Pasos grabados: 0",
    iniciar: "Iniciar Grabación",
    detener: "Detener Grabación",
    descargar: "Descargar JSON",
    version: "Versión 1.1 - Shadow DOM Support"
  });

  useEffect(() => {
    window.__AUTOGEN_steps = steps;
    // Actualizar contador de pasos
    setTextos(prev => ({
      ...prev,
      pasos: `Pasos grabados: ${steps.length}`
    }));
  }, [steps]);

  function createHandler() {
    return function handler(ev) {
      try {
        const t = ev.target;
        if (!t) return;
        if (t.closest && t.closest("[data-autogen-recorder-ignore]")) return;

        const rect = t.getBoundingClientRect ? t.getBoundingClientRect() : { x: 0, y: 0 };
        const step = {
          ts: new Date().toISOString(),
          action: ev.type,
          selector: computeSelector(t),
          tag: t.tagName,
          value: (t.value !== undefined ? t.value : null),
          x: rect.x || 0,
          y: rect.y || 0,
        };
        setSteps(prev => {
          const next = [...prev, step];
          window.__AUTOGEN_steps = next;
          setStepsCount(next.length);
          return next;
        });
      } catch (e) {}
    };
  }

  function startRecording() {
    if (recording) return;
    setSteps([]);
    setStepsCount(0);
    window.__AUTOGEN_steps = [];

    const h = createHandler();
    handlersRef.current = { handler: h };
    ["click", "change", "input"].forEach(evt => document.addEventListener(evt, h, true));
    setRecording(true);
    window.__AUTOGEN_RECORDER = true;

    // Actualizar estado
    setTextos(prev => ({
      ...prev,
      estado: "🔴 Grabando...",
      pasos: "Pasos grabados: 0"
    }));

    alert("Grabador activo. Realiza acciones en la página.");

    // Shadow DOM support (mantener funcionalidad existente)
    (function(){
      if (window.__SHADOW_RECORDER__INIT) return;
      window.__SHADOW_RECORDER__INIT = true;

      const EVENTS = ["click", "change", "input"];
      const processedRoots = new WeakSet();

      function attachListeners(root) {
        if (!root || processedRoots.has(root)) return;
        processedRoots.add(root);
        EVENTS.forEach(evt => root.addEventListener(evt, shadowRootHandler, true));
      }

      function shadowRootHandler(ev) {
        try {
          const t = ev.target;
          const rect = t.getBoundingClientRect ? t.getBoundingClientRect() : { x: 0, y: 0 };
          const step = {
            ts: new Date().toISOString(),
            action: ev.type,
            selector: computeShadowSelector(t),
            tag: t.tagName,
            value: t.value !== undefined ? t.value : null,
            x: rect.x || 0,
            y: rect.y || 0,
            shadow: true
          };
          window.__AUTOGEN_steps.push(step);
          setSteps(prev => [...prev, step]);
        } catch (err) {}
      }

      function computeShadowSelector(el) {
        if (!el) return "";
        let path = [];
        let current = el;

        while (current) {
          const part = selectorFor(current);
          path.unshift(part);
          const root = current.getRootNode();
          if (root && root.host) current = root.host;
          else current = current.parentElement;
        }
        return path.join(" >> ");
      }

      function selectorFor(el) {
        if (el.id) return `#${el.id}`;
        if (el.className && typeof el.className === "string" && el.className.trim()) {
          return el.tagName.toLowerCase() + "." + el.className.trim().split(/\s+/).join(".");
        }
        return el.tagName.toLowerCase();
      }

      function scanForShadowRoots(node) {
        if (!node) return;
        if (node.shadowRoot) {
          attachListeners(node.shadowRoot);
          scanForShadowRoots(node.shadowRoot);
        }
        if (node.children && node.children.length > 0) {
          [...node.children].forEach(child => scanForShadowRoots(child));
        }
      }

      const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
          m.addedNodes.forEach(node => scanForShadowRoots(node));
        }
      });

      observer.observe(document.documentElement, { childList: true, subtree: true });
      attachListeners(document);
      scanForShadowRoots(document.documentElement);
    })();
  }

  function stopRecording() {
    if (!recording) return;
    const h = handlersRef.current.handler;
    if (h) {
      ["click", "change", "input"].forEach(evt => document.removeEventListener(evt, h, true));
    }
    handlersRef.current = {};
    setRecording(false);
    window.__AUTOGEN_RECORDER = false;

    setTextos(prev => ({
      ...prev,
      estado: "Grabación Detenida"
    }));

    alert(`Grabación detenida. ${stepsCount} pasos capturados.`);
  }

  function downloadRecording() {
    const data = JSON.stringify(steps, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const filename = `autogen_recording_${Date.now()}.json`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    alert("Grabación descargada exitosamente!");
  }

  // Manejar cambios en los textos editables
  const handleTextChange = (campo, valor) => {
    setTextos(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  return (
    <div className="recorder-panel-simple" data-autogen-recorder-ignore>
      {/* Título */}
      <div className="recorder-title">
        <input
          type="text"
          value={textos.titulo}
          onChange={(e) => handleTextChange('titulo', e.target.value)}
          className="editable-field title-field"
        />
      </div>

      {/* Estado */}
      <div className="recorder-status">
        <strong>
          <input
            type="text"
            value={textos.estado}
            onChange={(e) => handleTextChange('estado', e.target.value)}
            className="editable-field status-field"
          />
        </strong>
      </div>

      {/* Contador de pasos */}
      <div className="steps-info">
        <input
          type="text"
          value={textos.pasos}
          onChange={(e) => handleTextChange('pasos', e.target.value)}
          className="editable-field steps-field"
          readOnly // No editable porque se actualiza automáticamente
        />
      </div>

      {/* Botones */}
      <div className="recorder-buttons">
        <div className="button-item">
          <button
            onClick={startRecording}
            disabled={recording}
            className="recorder-btn start-btn"
          >
            <span className="btn-indicator"></span>
            <input
              type="text"
              value={textos.iniciar}
              onChange={(e) => handleTextChange('iniciar', e.target.value)}
              className="editable-field btn-text"
            />
          </button>
        </div>

        <div className="button-item">
          <button
            onClick={stopRecording}
            disabled={!recording}
            className="recorder-btn stop-btn"
          >
            <input
              type="text"
              value={textos.detener}
              onChange={(e) => handleTextChange('detener', e.target.value)}
              className="editable-field btn-text"
            />
          </button>
        </div>

        <div className="button-item">
          <button
            onClick={downloadRecording}
            disabled={stepsCount === 0}
            className="recorder-btn download-btn"
          >
            <input
              type="text"
              value={textos.descargar}
              onChange={(e) => handleTextChange('descargar', e.target.value)}
              className="editable-field btn-text"
            />
          </button>
        </div>
      </div>

      {/* Versión */}
      <div className="recorder-version">
        <input
          type="text"
          value={textos.version}
          onChange={(e) => handleTextChange('version', e.target.value)}
          className="editable-field version-field"
        />
      </div>

      {/* Información adicional (oculta visualmente pero funcional) */}
      <div style={{ display: 'none' }}>
        <button onClick={() => setSteps([])}>Clear</button>
        <button onClick={async () => {
          try {
            const resp = await fetch(`${backend}/api/record`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(steps),
            });
            const j = await resp.json();
            if (resp.ok) {
              alert(`Saved to backend: ${j.id || "ok"}`);
            }
          } catch (e) {
            alert("Error saving to backend: " + e.message);
          }
        }} disabled={stepsCount === 0}>Save to backend</button>
      </div>
    </div>
  );
}