# Fiori Frontend

SPA construida con React + TypeScript + Vite. La entrada es `src/main.tsx` y la configuración de Vite detecta el nombre del repositorio durante GitHub Actions para generar rutas estáticas compatibles con GitHub Pages.

```bash
npm install
npm run dev
npm run build
```

El frontend utiliza únicamente credenciales públicas de Supabase. Las claves privadas pertenecen al backend.
