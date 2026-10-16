# minicreditos-sv
Sitio de pre-aprobación de minicréditos - El Salvador

## Cloudflare Pages

Nuevo flujo D1 - POST /api/solicitudes guarda en Cloudflare D1, sin docx.

- `GET /api/solicitudes?key=ADMIN_KEY` lista las solicitudes.
- Variables opcionales: `ADMIN_KEY`, `TUTA_EMAIL`, `MAILCHANNELS_FROM_EMAIL`.
- Crear la base: `npx wrangler d1 create minicreditos_db` y aplicar `schema.sql` con `npx wrangler d1 execute minicreditos_db --remote --file=schema.sql`.
