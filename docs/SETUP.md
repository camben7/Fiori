# Configuración inicial de Fiori

## 1. Requisitos del entorno

Usa Node.js 22.12 o superior, npm 10 o superior y Git. Comprueba las versiones con `node -v`, `npm -v` y `git --version`.

## 2. Instalar dependencias

Abre dos terminales:

```bash
cd frontend
npm install
```

```bash
cd backend
npm install
```

## 3. Configurar Supabase

1. Crea un proyecto nuevo en Supabase.
2. Abre SQL Editor y ejecuta el contenido de `supabase/schema.sql`.
3. En Authentication, crea tu usuario con correo y contraseña.
4. En SQL Editor, asigna el rol admin a ese usuario usando el UUID que aparece en Authentication > Users:

```sql
update public.profiles
set role = 'admin'
where id = 'UUID-REAL-DE-TU-USUARIO';
```

5. Copia la URL y la clave pública/anon del proyecto en `frontend/.env.local`.
6. Copia la URL y la clave `service_role` en `backend/.env`. La `service_role` jamás se copia al frontend ni a GitHub.

## 4. Variables del frontend

Copia `frontend/.env.example` como `frontend/.env.local` y completa:

```env
VITE_API_URL=http://localhost:4000
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
VITE_WHATSAPP_NUMBER=573018062359
VITE_INSTAGRAM_URL=https://instagram.com/fioribaq
```

## 5. Variables del backend

Copia `backend/.env.example` como `backend/.env` y completa:

```env
PORT=4000
NODE_ENV=development
FRONTEND_ORIGINS=http://localhost:5173,http://localhost:4173
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
OPENAI_API_KEY=
OPENAI_MODEL=gpt-6-astra
```

La API de IA es opcional. Sin `OPENAI_API_KEY`, el asistente responde mediante un recomendador local de demostración.

## 6. Ejecutar en local

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Abre `http://localhost:5173`. La salud de la API puede verificarse en `http://localhost:4000/api/health`.

## 7. Cargar el catálogo real

Entra en `http://localhost:5173/?admin=1` con el usuario que tenga rol `admin`. Carga los nombres, las descripciones, los precios confirmados y las fotografías reales de Fiori. El catálogo de demostración del frontend no se copia automáticamente a la base de datos.

## 8. Datos de contacto

El número y el perfil de Instagram incluidos son los datos comerciales que se habían compartido para Fiori. Actualízalos en las variables `VITE_WHATSAPP_NUMBER` y `VITE_INSTAGRAM_URL` si cambian.
