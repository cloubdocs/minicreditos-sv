# minicreditos-sv

Sitio informativo de solicitudes preliminares de minicréditos con pagos semanales - 【entity-El Salvador¦canonical_name=El Salvador】

**PRUEBA PILOTO - CUPOS LIMITADOS ESTE MES**
Estamos probando el servicio con comerciantes pequeños y población en vulnerabilidad de 【entity-El Salvador¦canonical_name=El Salvador】. Proceso de pre-aprobación 100% gratis.

## Cloudflare Pages

Nuevo flujo D1 - POST /api/solicitudes guarda en Cloudflare D1, sin docx.

- La Function es `functions/api/solicitudes.js`
- Guarda en D1 tabla `solicitudes`
- No genera docx, no descarga nada
