import React from "react";

const BOOKMARKLET = `javascript:(function(){window.__AUTOGEN_RECORDER=true;window.__AUTOGEN_steps=[];function sel(e){ if(!e) return ''; let s=''; if(e.id) return '#'+e.id; if(e.className) s = e.tagName.toLowerCase()+'.'+e.className.split(' ').join('.'); else s = e.tagName.toLowerCase(); return s;}function handler(ev){ try{ const t=ev.target; const rect=t.getBoundingClientRect(); const step={action: ev.type, selector: sel(t), value: t.value||null, x: rect.x, y: rect.y, tag: t.tagName}; window.__AUTOGEN_steps.push(step);}catch(e){} }['click','change','input'].forEach(evt=>document.addEventListener(evt, handler, true)); alert('Recorder active. Perform actions. When finished, run: copy(JSON.stringify(window.__AUTOGEN_steps)) in console to copy JSON.');})();`;

export default function RecorderGuide(){
  return (
    <div style={{padding:12, background:'#fff', borderRadius:8}}>
      <h3>Grabación del Flujo Web</h3>
      <ol>
        <li>Graba tu flujo desde el complemento de Chrome AutoGen QA Recorder.</li>
        <li>Descarga el .json del recorder.</li>
        <li>Ingresa a la pestaña Subir Grabación.</li>
        <li>Selecciona tu archivo de Recorder con extensión .json.</li>
        <li>Da clic en el botón Aceptar de popup Archivo Cargado.</li>
        <li>Ingrese la url de la aplicación web.</li>
        <li>De click en el botón Generar Proyecto Serenity Screenplay (.zip).</li>
        <li>Descarga el Proyecto Serenity Screenplay (.zip).</li>
      </ol>
    </div>
  )
}
