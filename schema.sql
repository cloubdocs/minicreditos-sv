DROP TABLE IF EXISTS solicitudes;
CREATE TABLE solicitudes (id TEXT PRIMARY KEY, nombre TEXT, ciudad TEXT, correo TEXT, ingreso TEXT, para_que TEXT, como_paga TEXT, extra TEXT, creado DATETIME DEFAULT CURRENT_TIMESTAMP, ip_hash TEXT);
