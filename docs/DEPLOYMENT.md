# Despliegue de Fiori

## Publicar el repositorio en GitHub

Crea un repositorio vacío llamado `fiori` en tu cuenta. Después, desde la carpeta del proyecto, conecta el remoto y sube el historial local completo:

```bash
git remote add origin https://github.com/USUARIO/fiori.git
git push -u origin main
```

Sustituye `USUARIO` por tu usuario de GitHub. No inicialices el repositorio remoto con README o licencia para evitar conflictos con el historial existente.

## Frontend — GitHub Pages

1. En el repositorio, abre Settings > Pages y selecciona `GitHub Actions` como fuente.
2. En Settings > Secrets and variables > Actions > Variables, configura:
   - `VITE_API_URL`: URL HTTPS del backend desplegado.
   - `VITE_SUPABASE_URL`: URL del proyecto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: clave pública/anon.
   - `VITE_WHATSAPP_NUMBER`: número con código de país y solo dígitos.
   - `VITE_INSTAGRAM_URL`: URL del perfil de Instagram.
3. Ejecuta el workflow `Deploy Fiori frontend to GitHub Pages` o haz push a `main`.
4. Vite detecta el nombre del repositorio en GitHub Actions y ajusta `base` automáticamente.

Los valores prefijados `VITE_` son públicos y quedan embebidos en los archivos descargables del navegador. Nunca uses una clave privada en ellas.

## Backend — Render

1. Crea un Web Service conectado al repositorio y selecciona el blueprint `render.yaml`.
2. Configura `FRONTEND_ORIGINS` con el origen de GitHub Pages, por ejemplo `https://USUARIO.github.io` (sin la ruta del repositorio).
3. Completa `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
4. Opcionalmente configura `OPENAI_API_KEY` y `OPENAI_MODEL`.
5. Despliega y verifica `https://TU-API.onrender.com/api/health`.
6. Actualiza la variable de GitHub `VITE_API_URL` con esa URL HTTPS y vuelve a ejecutar el workflow.

## Limitación de GitHub Pages

GitHub Pages solo aloja el frontend estático; no puede ejecutar Express, mantener secretos de servidor, almacenar consultas ni ejecutar la API de IA. El backend debe vivir en Render u otro servicio compatible.

## Lista previa a producción

- Reemplazar fotos de demostración por fotos originales autorizadas de Fiori.
- Registrar precios y descripciones correctos.
- Verificar el número WhatsApp, Instagram y horarios/condiciones comerciales.
- Configurar Supabase Auth, el rol administrador y RLS.
- Configurar `FRONTEND_ORIGINS` y probar CORS con el dominio final.
- Comprobar el formulario guardando un mensaje real en `contact_messages`.
- Probar login, subida de imágenes, edición y eliminación desde el panel.
- Configurar una clave de IA y confirmar el modelo permitido en la cuenta; de lo contrario, mantener el modo de demostración.
- Revisar el almacenamiento, las cuotas y las políticas de privacidad aplicables.
