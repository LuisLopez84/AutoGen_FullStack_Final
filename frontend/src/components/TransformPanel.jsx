import React, { useState } from "react";

export default function TransformPanel({ backend, recording, onJob }){
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function transform(){
    if(!recording) return alert('Load a recording first');
    setLoading(true);
    try{
      const resp = await fetch(`${backend}/api/transform-recording`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ recording, url })
      });
      const json = await resp.json();
      if(json.jobId){ onJob(json); alert('Project generated: '+json.jobId); }
      else alert('Error: '+JSON.stringify(json));
    }catch(e){ alert('Error: '+e.message); }
    finally{ setLoading(false); }
  }

  return (
    <div style={{padding:12, background:'#fff', borderRadius:8}}>
      <h3>Transformar grabación → Guion de Serenity</h3>
      <label>Base URL (opcional)</label>
      <input style={{width:'100%'}} value={url} onChange={e=>setUrl(e.target.value)} placeholder='https://...' />
      <div style={{marginTop:8}}>
        <button onClick={transform} disabled={loading}>{loading?'Generando...':'Generar proyecto automatizado Java (.zip)'}</button>
      </div>
    </div>
  )
}
