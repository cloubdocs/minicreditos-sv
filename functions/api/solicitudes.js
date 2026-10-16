export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) return new Response(JSON.stringify({error: "DB no bindeada"}), {status: 500, headers: {"Content-Type":"application/json"}});
    const data = await request.json();
    const id = crypto.randomUUID();
    await env.DB.prepare(`INSERT INTO solicitudes (id, nombre, ciudad, correo, ingreso, para_que, como_paga, extra, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, data.nombre||'', data.ciudad||'', data.correo||'', data.ingreso||'', data.para_que||'', data.como_paga||'', data.extra||'', (request.headers.get('cf-connecting-ip')||'').slice(0,20)).run();
    return new Response(JSON.stringify({ok:true, id}), {headers: {"Content-Type":"application/json"}});
  } catch (e) {
    return new Response(JSON.stringify({error: e.message}), {status: 500, headers: {"Content-Type":"application/json"}});
  }
}
