export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  if (!webhookUrl) {
    return json({ ok: false, error: "MAKE_WEBHOOK_URL_not_configured" }, 500);
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  if (!payload.nome || !payload.telefone || !payload.cidade) {
    return json({ ok: false, error: "missing_required_fields" }, 400);
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("Make webhook error", response.status, text);
      return json({ ok: false, error: "make_webhook_error" }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    console.error("Lead function error", error);
    return json({ ok: false, error: "lead_function_error" }, 502);
  }
}

function json(data, statusCode = 200) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(data),
  };
}
