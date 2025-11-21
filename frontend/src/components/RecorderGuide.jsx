import React from "react";

const BOOKMARKLET = `javascript:(function(){window.__AUTOGEN_RECORDER=true;window.__AUTOGEN_steps=[];function sel(e){ if(!e) return ''; let s=''; if(e.id) return '#'+e.id; if(e.className) s = e.tagName.toLowerCase()+'.'+e.className.split(' ').join('.'); else s = e.tagName.toLowerCase(); return s;}function handler(ev){ try{ const t=ev.target; const rect=t.getBoundingClientRect(); const step={action: ev.type, selector: sel(t), value: t.value||null, x: rect.x, y: rect.y, tag: t.tagName}; window.__AUTOGEN_steps.push(step);}catch(e){} }['click','change','input'].forEach(evt=>document.addEventListener(evt, handler, true)); alert('Recorder active. Perform actions. When finished, run: copy(JSON.stringify(window.__AUTOGEN_steps)) in console to copy JSON.');})();`;

export default function RecorderGuide(){
  return (
    <div style={{padding:12, background:'#fff', borderRadius:8}}>
      <h3>Grabadora (bookmarklet)</h3>
      <p>Arrastra este enlace a tu barra de marcadores.: <a href={BOOKMARKLET}>AutoGen Recorder</a></p>
      <ol>
        <li>Abre la aplicación de destino en una nueva pestaña.</li>
        <li>Haz clic en el bookmarklet (marcador) desde tu barra de favoritos/marcadores — esto activará un grabador en esa página.</li>
        <li>Realiza los pasos que quieres grabar (clics, entradas/datos).</li>
        <li>Cuando termines, abre la consola del navegador y ejecuta: <code>copy(JSON.stringify(window.__AUTOGEN_steps))</code> para copiar el JSON.</li>
        <li>Vuelve aquí y pega/sube el JSON.</li>
      </ol>
    </div>
  )
}
