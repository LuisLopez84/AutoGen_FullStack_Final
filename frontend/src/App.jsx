import React, { useState } from "react";
import RecorderGuide from "./components/RecorderGuide.jsx";
import RecordingUploader from "./components/RecordingUploader.jsx";
import TransformPanel from "./components/TransformPanel.jsx";

const BACKEND = import.meta.env.VITE_BACKEND_BASE || "http://localhost:3000";

export default function App(){
  const [recording, setRecording] = useState(null);
  const [job, setJob] = useState(null);

  return (
    <div style={{fontFamily:'Inter, Arial', padding:20}}>
      <h1>AutoGen — Grabador & Generador de Automatizaciones Serenity Screenplay</h1>
      <div style={{display:'flex', gap:20}}>
        <div style={{flex:1}}>
          <RecorderGuide />
          <RecordingUploader onLoad={r=>setRecording(r)} />
        </div>
        <aside style={{width:420}}>
          <TransformPanel backend={BACKEND} recording={recording} onJob={(j)=>setJob(j)} />
          {job && <div style={{marginTop:12}}><a href={`${BACKEND}${job.download}`} target='_blank'>Descargar ZIP</a></div>}
        </aside>
      </div>
    </div>
  );
}
