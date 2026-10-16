const MAILCHANNELS_URL = "https://api.mailchannels.net/tx/v1/send";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function isEmail(v) {
  return typeof v === "string" && v.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function clean(v, max) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function onRequestPost({ request, env, waitUntil }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "JSON inválido" }, 400);
  }

  const s = {
    nombre: clean(body.nombre, 120),
    ciudad: clean(body.ciudad, 120),
    correo: clean(body.correo, 200),
    ingreso: clean(body.ingreso, 50),
    para_que: clean(body.para_que, 2000),
    como_paga: clean(body.como_paga, 2000),
    extra: clean(body.extra, 2000),
  };

  if (!s.nombre || !s.ciudad || !s.ingreso || !s.como_paga || s.para_que.length < 10 || !isEmail(s.correo)) {
    return json({ ok: false, error: "Datos inválidos" }, 400);
  }

  const ip = request.headers.get("CF-Connecting-IP") || "";
  const id = crypto.randomUUID();

  try {
    const ipHash = await sha256Hex(ip);
    await env.DB.prepare(
      "INSERT INTO solicitudes (id, nombre, ciudad, correo, ingreso, para_que, como_paga, extra, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
      .bind(id, s.nombre, s.ciudad, s.correo, s.ingreso, s.para_que, s.como_paga, s.extra, ipHash)
      .run();
  } catch (err) {
    return json({ ok: false, error: "Error al guardar" }, 500);
  }

  if (env.TUTA_EMAIL) {
    const aviso = fetch(MAILCHANNELS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: env.TUTA_EMAIL }] }],
        from: { email: env.MAILCHANNELS_FROM_EMAIL || `no-reply@${new URL(request.url).hostname}`, name: "Minicreditos SV" },
        subject: "Nueva solicitud de pre-aprobación",
        content: [{
          type: "text/plain",
          value: [
            `ID: ${id}`,
            `Nombre: ${s.nombre}`,
            `Ciudad: ${s.ciudad}`,
            `Correo: ${s.correo}`,
            `Ingreso: ${s.ingreso}`,
            `Para qué: ${s.para_que}`,
            `Cómo paga: ${s.como_paga}`,
            `Extra: ${s.extra}`,
          ].join("\n"),
        }],
      }),
    }).catch(() => {});
    if (typeof waitUntil === "function") waitUntil(aviso);
  }

  return json({ ok: true });
}

export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get("key");
  if (!env.ADMIN_KEY || !key || key !== env.ADMIN_KEY) {
    return json({ ok: false, error: "No autorizado" }, 401);
  }
  try {
    const { results } = await env.DB.prepare("SELECT * FROM solicitudes ORDER BY creado DESC").all();
    return json(results);
  } catch {
    return json({ ok: false, error: "Error al leer" }, 500);
  }
}
