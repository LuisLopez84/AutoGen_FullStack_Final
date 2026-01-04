# Configurar API Key de PageSpeed Insights

## Pasos para obtener API Key gratuita:

1. \*\*Crear cuenta/proyecto:\*\*

   - Ve a [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Haz clic en "Seleccionar un proyecto" → "Nuevo proyecto"
   - Nombre: "AutoGen-PageSpeed" → Crear
2. \*\*Habilitar la API:\*\*

   - En el menú izquierdo: "APIs y servicios" → "Biblioteca"
   - Buscar "PageSpeed Insights API"
   - Hacer clic en "Habilitar"
3. \*\*Crear credenciales:\*\*

   - "APIs y servicios" → "Credenciales"
   - "Crear credenciales" → "Clave de API"
   - Copiar la clave generada
4. \*\*Configurar en el proyecto:\*\*

   - Editar archivo \`.env\` en la raíz del proyecto
   - Agregar: \`PAGESPEED\_API\_KEY=tu\_clave\_aqui\`
   - Sin comillas
5. \*\*Reiniciar aplicación:\*\*

   \`\`\`bash

   docker-compose down

   docker-compose up --build
