import React from "react";

const BOOKMARKLET = `javascript:(function(){window.__AUTOGEN_RECORDER=true;window.__AUTOGEN_steps=[];function sel(e){ if(!e) return ''; let s=''; if(e.id) return '#'+e.id; if(e.className) s = e.tagName.toLowerCase()+'.'+e.className.split(' ').join('.'); else s = e.tagName.toLowerCase(); return s;}function handler(ev){ try{ const t=ev.target; const rect=t.getBoundingClientRect(); const step={action: ev.type, selector: sel(t), value: t.value||null, x: rect.x, y: rect.y, tag: t.tagName}; window.__AUTOGEN_steps.push(step);}catch(e){} }['click','change','input'].forEach(evt=>document.addEventListener(evt, handler, true)); alert('Recorder active. Perform actions. When finished, run: copy(JSON.stringify(window.__AUTOGEN_steps)) in console to copy JSON.');})();`;

export default function RecorderGuide(){
  return (
    <div style={{
      padding: '30px',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      borderRadius: '12px',
      border: '1px solid #e0e0e0',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #3498db'
      }}>
        <h2 style={{
          color: '#2c3e50',
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #3498db, #2c3e50)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Guía Completa Generación de Automatización Desde Grabación</span>
        </h2>
        <p style={{
          color: '#666',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
          Sigue estos pasos para generar tu proyecto de automatización Serenity BDD + Screenplay
        </p>
      </div>

      {/* Steps Section */}
      <div style={{
        display: 'grid',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {[
          {
            step: 1,
            icon: '🎯',
            title: 'Grabar el Flujo',
            description: 'Graba tu flujo desde el complemento de Chrome AutoGen QA Recorder.',
            color: '#3498db'
          },
          {
            step: 2,
            icon: '📥',
            title: 'Descargar JSON',
            description: 'Descarga el archivo .json generado por el recorder.',
            color: '#27ae60'
          },
          {
            step: 3,
            icon: '📤',
            title: 'Subir Grabación',
            description: 'Ingresa a la pestaña Subir Grabación.',
            color: '#e67e22'
          },
          {
            step: 4,
            icon: '📄',
            title: 'Seleccionar Archivo',
            description: 'Selecciona tu archivo de Recorder con extensión .json.',
            color: '#9b59b6'
          },
          {
            step: 5,
            icon: '✅',
            title: 'Confirmar Carga',
            description: 'Da clic en el botón Aceptar del popup "Archivo Cargado".',
            color: '#2ecc71'
          },
          {
            step: 6,
            icon: '🌐',
            title: 'Ingresar URL',
            description: 'Ingresa la URL de la aplicación web a automatizar.',
            color: '#e74c3c'
          },
          {
            step: 7,
            icon: '⚡',
            title: 'Generar Proyecto',
            description: 'Haz click en el botón "Generar Proyecto Serenity Screenplay (.zip)".',
            color: '#f39c12'
          },
          {
            step: 8,
            icon: '📦',
            title: 'Descargar Proyecto',
            description: 'Descarga el Proyecto Serenity Screenplay (.zip) generado.',
            color: '#34495e'
          }
        ].map((item, index) => (
          <div key={item.step} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '20px',
            padding: '20px',
            background: 'white',
            borderRadius: '10px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          }}>
            {/* Step Number */}
            <div style={{
              width: '50px',
              height: '50px',
              background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px',
              boxShadow: `0 4px 8px ${item.color}40`
            }}>
              {item.step}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '24px' }}>{item.icon}</span>
                <h3 style={{
                  color: '#2c3e50',
                  fontSize: '18px',
                  fontWeight: '600',
                  margin: 0
                }}>
                  {item.title}
                </h3>
              </div>
              <p style={{
                color: '#666',
                lineHeight: '1.6',
                margin: 0,
                fontSize: '15px'
              }}>
                {item.description}
              </p>
            </div>

            {/* Arrow */}
            <div style={{
              color: '#bdc3c7',
              fontSize: '20px',
              fontWeight: 'bold',
              alignSelf: 'center',
              flexShrink: 0
            }}>
              →
            </div>
          </div>
        ))}
      </div>

      {/* Additional Information */}
      <div style={{
        background: 'linear-gradient(135deg, #e8f4fd, #d6eaf8)',
        padding: '25px',
        borderRadius: '10px',
        border: '1px solid #3498db',
        marginTop: '20px'
      }}>
        <h4 style={{
          color: '#2c3e50',
          marginBottom: '15px',
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          💡 Información Adicional
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <h5 style={{ color: '#3498db', marginBottom: '8px', fontSize: '14px' }}>🛠️ Tecnologías Incluidas</h5>
            <ul style={{ color: '#555', fontSize: '14px', lineHeight: '1.5', margin: 0, paddingLeft: '20px' }}>
              <li>Serenity BDD 3.0+</li>
              <li>Patrón Screenplay</li>
              <li>Cucumber 7+</li>
              <li>JUnit 5</li>
              <li>Soporte Shadow DOM</li>
            </ul>
          </div>
          <div>
            <h5 style={{ color: '#27ae60', marginBottom: '8px', fontSize: '14px' }}>✅ Beneficios</h5>
            <ul style={{ color: '#555', fontSize: '14px', lineHeight: '1.5', margin: 0, paddingLeft: '20px' }}>
              <li>Generación automática</li>
              <li>Código mantenible</li>
              <li>Estructura profesional</li>
              <li>Configuración predefinida</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        padding: '20px',
        background: 'linear-gradient(135deg, #2c3e50, #34495e)',
        borderRadius: '10px',
        color: 'white'
      }}>
        <h4 style={{ marginBottom: '10px', fontSize: '18px' }}>
          ¿Listo para comenzar?
        </h4>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
          Sigue los pasos anteriores y genera tu primer proyecto de automatización en minutos
        </p>
      </div>
    </div>
  );
}