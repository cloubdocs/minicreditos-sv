# minicreditos-sv
Sitio informativo de solicitudes preliminares de minicréditos con pagos semanales - El Salvador

## Cloudflare Pages

La Function `functions/api/filtrar.js` recibe las solicitudes en `POST /api/filtrar`. Configura `TUTA_EMAIL`, `BACKUP_EMAIL` y `MAILCHANNELS_FROM_EMAIL` como variables de entorno privadas de Pages; el remitente debe estar autorizado para enviar mediante MailChannels. La función aplica el filtro de palabras y rechaza montos superiores a $20.

Al enviar el formulario, el navegador genera y descarga un resumen `.docx` antes de enviarlo para revisión automática. El generador DOCX (docx 8.5.0) se carga desde un CDN.
