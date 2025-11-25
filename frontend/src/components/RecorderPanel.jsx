// frontend/src/components/RecorderPanel.jsx
import React, { useEffect, useState, useRef } from "react";

/**
 * RecorderPanel
 * - startRecording(): añade listeners de captura (click, input, change)
 * - stopRecording(): elimina listeners
 * - downloadRecording(): descarga JSON
 * - saveToBackend(): POST /api/record
 *
 * Nota: este recorder fue diseñado para ejecutarse en la página que quieres grabar.
 * Si vas a probarlo en la misma app frontend, OK; si vas a grabar otra web,
 * abre esa web en otra pestaña, abre la consola y pega el contenido del handler (ver README de uso abajo).
 */

function computeSelector(el) {
  if (!el) return "";
  if (el.id) return `#${el.id}`;
  // prefer unique class-based selector
  if (el.className && typeof el.className === "string" && el.className.trim()) {
    const classes = el.className.trim().split(/\s+/).join(".");
    return `${el.tagName.toLowerCase()}.${classes}`;
  }
  // fallback to tag + nth-child
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

  useEffect(() => {
    // keep window.__AUTOGEN_steps in sync so it's accessible if user copies from console
    window.__AUTOGEN_steps = steps;
  }, [steps]);

  function createHandler() {
    return function handler(ev) {
      try {
        const t = ev.target;
        // ignore if the element is the recorder UI itself (if recording inside same page)
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
        // push to state
        setSteps(prev => {
          const next = [...prev, step];
          // keep a copy on window for console usage
          window.__AUTOGEN_steps = next;
          setStepsCount(next.length);
          return next;
        });
      } catch (e) {
        // ignore errors from 읽
      }
    };
  }

  function startRecording() {
    if (recording) return;
    // init
    setSteps([]);
    setStepsCount(0);
    window.__AUTOGEN_steps = [];

    const h = createHandler();
    handlersRef.current = { handler: h };
    // use capture phase to catch events before page handlers
    ["click", "change", "input"].forEach(evt => document.addEventListener(evt, h, true));
    setRecording(true);
    // provide a global flag so the console snippet can interact
    window.__AUTOGEN_RECORDER = true;
    alert("Recorder active. Perform actions on the page. When finished use Stop and Download.");



    // Inicializar soporte para Shadow DOM
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
    alert(`Recording stopped. ${stepsCount} steps captured.`);
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
  }

  async function saveToBackend() {
    try {
      const resp = await fetch(`${backend}/api/record`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(steps),
      });
      const j = await resp.json();
      if (resp.ok) {
        alert(`Saved to backend: ${j.id || "ok"}. Path: ${j.path || ""}`);
      } else {
        alert(`Error saving: ${JSON.stringify(j)}`);
      }
    } catch (e) {
      alert("Error saving to backend: " + e.message);
    }
  }

  function clear() {
    if (recording) stopRecording();
    setSteps([]);
    setStepsCount(0);
    window.__AUTOGEN_steps = [];
  }

  return (
    <div data-autogen-recorder-ignore style={{ padding: 12, background: "#fff", borderRadius: 8 }}>
      <h3>Recorder (in-page)</h3>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={startRecording} disabled={recording} title="Start recording">
          <span style={{ display: "inline-block", width: 12, height: 12, marginRight: 8, borderRadius: 6, background: recording ? "red" : "#ccc" }} />
          Start
        </button>
        <button onClick={stopRecording} disabled={!recording} title="Stop recording">Stop</button>
        <button onClick={downloadRecording} disabled={stepsCount === 0}>Download (.json)</button>
        <button onClick={saveToBackend} disabled={stepsCount === 0}>Save to backend</button>
        <button onClick={clear}>Clear</button>
        <div style={{ marginLeft: "auto", fontSize: 14 }}>
          <strong>{stepsCount}</strong> steps
        </div>
      </div>
      <p style={{ marginTop: 8, fontSize: 13 }}>
        Nota: Este recorder funciona **pegado en la misma página** que quieras grabar.
        Si vas a grabar otra web, abre esa web en otra pestaña, abre la consola y pega:
      </p>
      <pre style={{ fontSize: 11, background: "#f6f6f6", padding: 8, borderRadius: 4, overflowX: "auto" }}>
{`/* === INICIAR RECORDER MANUAL === */
  window.__AUTOGEN_steps = [];

  function sel(e){
    if(!e) return '';
    if(e.id) return '#'+e.id;
    if(e.className && typeof e.className === 'string' && e.className.trim()){
      return e.tagName.toLowerCase() + '.' + e.className.trim().split(/\s+/).join('.');
    }
    return e.tagName.toLowerCase();
  }

  function handler(ev){
    try{
      const t = ev.target;
      if(!t) return;
      const rect = t.getBoundingClientRect ? t.getBoundingClientRect() : { x: 0, y:0 };
      const step = {
        ts: new Date().toISOString(),
        action: ev.type,
        selector: sel(t),
        tag: t.tagName,
        value: (t.value !== undefined ? t.value : null),
        x: rect.x || 0,
        y: rect.y || 0
      };
      window.__AUTOGEN_steps.push(step);
    }catch(e){}
  }

  ['click','change','input'].forEach(evt =>
    document.addEventListener(evt, handler, true)
  );

  alert("Recorder active! When done, run saveRecording()");

  /* === FUNCIÓN DE DESCARGA === */
  function saveRecording(){
    const data = JSON.stringify(window.__AUTOGEN_steps, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "autogen_recording_" + Date.now() + ".json";
    a.click();
    URL.revokeObjectURL(url);
    alert("Grabación descargada en tu carpeta Descargas!");
  }

`}
      </pre>
    </div>
  );
}
