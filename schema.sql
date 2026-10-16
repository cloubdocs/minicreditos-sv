CREATE TABLE IF NOT EXISTS solicitudes (
 id TEXT PRIMARY KEY,
 nombre TEXT,
 ciudad TEXT,
 correo TEXT,
 ingreso TEXT,
 para_que TEXT,
 como_paga TEXT,
 extra TEXT,
 creado DATETIME DEFAULT CURRENT_TIMESTAMP,
 ip_hash TEXT
);

-- Limpieza semanal (ejecutar manualmente):
-- DELETE FROM solicitudes WHERE creado < datetime('now','-7 days');
