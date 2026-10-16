const SPAM = ["prueba", "test", "jaja", "xxx", "juego"];
const BUENAS = ["empleo fijo", "salario", "remesa", "negocio"];
const MAX_MONTO = 20;
const MAILCHANNELS_URL = "https://api.mailchannels.net/tx/v1/send";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function isEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function onRequestPost({ request, env }) {
  let application;
  try {
    application = await request.json();
  } catch {
    return jsonResponse({ error: "El cuerpo debe ser JSON válido." }, 400);
  }

  if (!application || typeof application !== "object" || Array.isArray(application)) {
    return jsonResponse({ error: "La solicitud no tiene un formato válido." }, 400);
  }

  const { nombre, monto, ingresos, motivo } = application;
  if (
    typeof nombre !== "string" || !nombre.trim() || nombre.length > 120 ||
    typeof ingresos !== "string" || !ingresos.trim() || ingresos.length > 120 ||
    typeof motivo !== "string" || !motivo.trim() || motivo.length > 2000 ||
    typeof monto !== "number" || !Number.isFinite(monto) || monto <= 0
  ) {
    return jsonResponse({ error: "Completa los campos requeridos con valores válidos." }, 400);
  }

  if (monto > MAX_MONTO) {
    return jsonResponse({ error: "El monto inicial máximo es $20." }, 400);
  }

  const text = normalize(`${nombre}\n${ingresos}\n${motivo}`);
  const spamMatches = SPAM.filter((keyword) => text.includes(keyword)).length;
  const goodMatches = BUENAS.filter((keyword) => text.includes(keyword)).length;
  const score = goodMatches - (spamMatches * 2);

  if (spamMatches > 0 || score < 1) {
    return jsonResponse({ status: "rejected" });
  }

  const recipients = [env.TUTA_EMAIL, env.BACKUP_EMAIL];
  const configuredEmails = [...recipients, env.MAILCHANNELS_FROM_EMAIL];
  if (configuredEmails.some((email) => !isEmail(email))) {
    return jsonResponse({ error: "El servicio de envío no está configurado." }, 500);
  }

  let mailResponse;
  try {
    mailResponse = await fetch(MAILCHANNELS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{
          to: recipients.map((email) => ({ email })),
        }],
        from: { email: env.MAILCHANNELS_FROM_EMAIL, name: "Minicreditos SV" },
        subject: "Nueva solicitud para revisión automática",
        content: [{
          type: "text/plain",
          value: [
            `Nombre: ${nombre.trim()}`,
            `Monto solicitado: $${monto.toFixed(2)} USD`,
            `Ingresos: ${ingresos.trim()}`,
            `Motivo y forma de pago:`,
            motivo.trim(),
          ].join("\n"),
        }],
      }),
    });
  } catch {
    return jsonResponse({ error: "No se pudo conectar con el servicio de correo." }, 502);
  }

  if (!mailResponse.ok) {
    return jsonResponse({ error: "El servicio de correo no pudo aceptar la solicitud." }, 502);
  }

  return jsonResponse({ status: "accepted" });
}
