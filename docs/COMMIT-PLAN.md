# Plan de commits de Fiori

| N.º | Mensaje | Alcance |
|---:|---|---|
| 1 | `chore: initialize Fiori repository` | Documentación y estructura base |
| 2 | `build(frontend): scaffold React TypeScript application` | Vite, React y configuración frontend |
| 3 | `build(backend): initialize Express API` | Express y API base |
| 4 | `feat(ui): establish Fiori design system` | Tokens, tipografía, botones y utilidades |
| 5 | `feat(home): implement landing page` | Hero, historia y secciones de marca |
| 6 | `feat(ui): add responsive navigation and animations` | Navegación móvil y transiciones |
| 7 | `feat(catalog): implement product data model` | Tipos, datos demo y servicios |
| 8 | `feat(catalog): build product cards and filters` | Catálogo, filtros y tarjetas |
| 9 | `feat(catalog): integrate product image management` | Subida y gestión de fotografías |
| 10 | `feat(contact): implement contact API` | API y persistencia de solicitudes |
| 11 | `feat(contact): add form validation and feedback` | Validación, estados y errores |
| 12 | `feat(auth): implement administrator authentication` | Login y ruta protegida |
| 13 | `feat(admin): build protected product dashboard` | CRUD de productos |
| 14 | `feat(ai): integrate Fiori intelligent assistant` | Chatbot y recomendador |
| 15 | `chore(deploy): add CI checks and deployment configuration` | SQL/RLS, GitHub Actions, Render y documentación de publicación |

Los 15 commits se registran en el historial local. Un commit no publica por sí solo el repositorio remoto ni despliega servicios: para ello se requiere conectar una cuenta de GitHub y configurar las variables de Supabase/Render/OpenAI según `docs/DEPLOYMENT.md`.
