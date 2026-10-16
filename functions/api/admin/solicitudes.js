export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) {
    return new Response('No autorizado', {status: 401});
  }
  const { results } = await env.DB.prepare("SELECT id, nombre, ciudad, correo, ingreso, para_que, como_paga, extra, creado FROM solicitudes ORDER BY creado DESC LIMIT 200").all();
  return Response.json(results);
}
