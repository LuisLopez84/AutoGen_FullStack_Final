AutoGen — Fullstack final 2
========================


Este paquete incluye un backend y un frontend que permiten grabar flujos web de usuario (mediante un bookmarklet),
cargar el JSON de la grabación, transformarlo en un proyecto Serenity+Screenplay Java Maven utilizando OpenAI,
y descargar el ZIP resultante listo para importar en IntelliJ.

Inicio rápido (desarrollo local sin Docker):
1. cd backend && npm install
2. cd ../frontend && npm install
3. Crear .env in root: OPENAI_API_KEY=sk-...
4. Start backend: cd ../backend && node server.js
5. Start frontend: cd ../frontend && npx vite --host
6. Abrir frontend desde http://localhost:5173


Grabadora:
- Arrastra el enlace "AutoGen Recorder" que aparece en la interfaz de usuario a tu barra de marcadores.
- Abre el sitio web de destino, haz clic en el marcador, sigue los pasos y, a continuación, ejecuta en la consola:
  copiar(JSON.stringify(window.__AUTOGEN_steps))
- Pegue/cargue el archivo JSON en la interfaz de usuario del frontend y pulse Generar.

Docker:
- Crée .env with OPENAI_API_KEY
- docker compose up --build
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

Notas:
- La solicitud de OpenAI espera que el modelo devuelva un objeto JSON que asocie las rutas de los archivos con su contenido. 
- Es posible que deba modificar prompts/prompts/generateProjectPrompt.js para que coincidan con la estructura de proyecto que prefiera.

generate-sample.sh: script rápido para llamar al punto final de transformación con una grabación de muestra.
