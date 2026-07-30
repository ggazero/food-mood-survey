import crypto from "node:crypto";

export default function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  let body;
  try {
    body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
  } catch {
    return response.status(400).json({ ok: false, error: "INVALID_JSON" });
  }
  const allowedEvents = new Set([
    "page_view", "field_started", "field_completed",
    "form_submitted", "page_exit"
  ]);

  if (!body || !allowedEvents.has(body.event) || !body.session_id) {
    return response.status(400).json({ ok: false, error: "INVALID_EVENT" });
  }

  const receipt = {
    receipt_id: crypto.randomUUID(),
    received_at: new Date().toISOString()
  };

  console.log(JSON.stringify({
    stream: "SURVEY_BEHAVIOR",
    ...receipt,
    ...body
  }));

  return response.status(200).json({ ok: true, ...receipt });
}
