# Fiori — flores eternas, detalles que permanecen

Aplicación web full stack para el emprendimiento Fiori, especializado en flores eternas artesanales, ramos y productos de temporada.

## Arquitectura

- **Frontend:** React, TypeScript y Vite. Publicación estática en GitHub Pages.
- **Backend:** Node.js, Express y TypeScript. Despliegue recomendado en Render.
- **Datos, autenticación e imágenes:** Supabase (PostgreSQL, Auth y Storage).
- **Asistente:** OpenAI Responses API desde el backend. Incluye un modo de demostración sin clave.
- **Versionamiento:** Git con commits atómicos y descriptivos.

GitHub Pages no ejecuta código de servidor. Por eso el frontend y la API se despliegan por separado y se comunican mediante HTTPS.

## Estructura

```text
fiori/
├── frontend/       # Aplicación pública y panel de administración
├── backend/        # API REST, validaciones e integración de IA
├── assets/         # Recursos de marca y fotografías locales
├── docs/           # Guías técnicas y checklist de lanzamiento
├── supabase/       # Esquema SQL y políticas RLS/Storage
└── .github/        # Automatización de GitHub Pages
```

## Requisitos

- Node.js 22.12 o superior (recomendado).
- npm 10 o superior.
- Git.
- Proyecto de Supabase para persistencia, autenticación y almacenamiento.

## Desarrollo local

1. Copia `frontend/.env.example` como `frontend/.env.local` y configura las variables públicas de Supabase y la URL de la API.
2. Copia `backend/.env.example` como `backend/.env` y completa las variables privadas.
3. Instala las dependencias desde cada carpeta con `npm install`.
4. Ejecuta `npm run dev` dentro de `backend/` y `frontend/` en terminales separadas.

Consulta [docs/SETUP.md](docs/SETUP.md) para la configuración paso a paso y [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) para el despliegue.

## Datos de demostración

El catálogo contiene productos, imágenes y precios ilustrativos para que la interfaz pueda probarse sin conectar Supabase. Deben reemplazarse por fotografías, descripciones y precios autorizados por Fiori antes de publicar el catálogo comercial. Los datos de demostración no se guardan automáticamente en la base de datos.

## Seguridad

- Nunca publiques secretos, tokens ni claves `service_role` en el frontend.
- El frontend solo utiliza la clave pública/anon o publishable de Supabase.
- Las operaciones administrativas están protegidas mediante autenticación y políticas Row Level Security (RLS).
- El backend valida solicitudes, limita la frecuencia de contacto y mantiene las claves de IA en variables de entorno.

## Estado

La entrega local incluye 15 commits en el historial Git. Para pasar a producción, sigue `docs/SETUP.md` y `docs/DEPLOYMENT.md`; las cuentas externas y sus credenciales se configuran desde sus paneles oficiales.
