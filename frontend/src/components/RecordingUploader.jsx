import React, { useState } from "react";

export default function RecordingUploader({ onLoad }){
  const [text, setText] = useState('');
  const loadFromText = ()=>{
    try{
      const j = JSON.parse(text);
      onLoad(j);
      alert('Recording loaded');
    }catch(e){ alert('Invalid JSON'); }
  };
  const onFile = async (e)=>{
    const f = e.target.files?.[0]; if(!f) return;
    const txt = await f.text();
    try{ const j = JSON.parse(txt); onLoad(j); alert('Loaded file'); } catch(e){ alert('Invalid JSON file'); }
  };
  return (
    <div style={{marginTop:12, padding:12, background:'#fff', borderRadius:8}}>
      <h3>Subir/Pegar grabación JSON</h3>
      <textarea style={{width:'100%',height:160}} value={text} onChange={e=>setText(e.target.value)} placeholder='Pegar JSON generado desde la grabadora'></textarea>
      <div style={{marginTop:8}}>
        <button onClick={loadFromText}>Cargar grabación</button>
        <input type='file' accept='.json' onChange={onFile} style={{marginLeft:8}} />
      </div>
    </div>
  )
}
