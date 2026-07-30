(() => {
  const endpoint = "/api/events";
  const sessionId = globalThis.crypto?.randomUUID?.()
    ?? `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const openedAt = Date.now();
  const fieldStarts = new Map();
  const completedFields = new Set();
  let submitted = false;

  const base = () => ({
    session_id: sessionId,
    page: location.pathname,
    page_title: document.title,
    client_at: new Date().toISOString()
  });

  function send(event, detail = {}, beacon = false) {
    const payload = JSON.stringify({ event, ...base(), ...detail });
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
      return;
    }
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true
    })
      .then(response => {
        if (!response.ok) {
          console.warn(`[survey tracker] ${event} 전송 실패: ${response.status}`);
        }
      })
      .catch(error => {
        console.warn(`[survey tracker] ${event} 전송 오류`, error);
      });
  }

  send("page_view", {
    referrer: document.referrer || null,
    viewport_width: innerWidth,
    viewport_height: innerHeight,
    language: navigator.language
  });

  document.addEventListener("focusin", event => {
    const field = event.target;
    if (!field.matches("input[name], select[name], textarea[name]")) return;
    if (field.type === "password") return;
    fieldStarts.set(field, Date.now());
    send("field_started", {
      field_name: field.name,
      field_type: field.type || field.tagName.toLowerCase()
    });
  });

  document.addEventListener("focusout", event => {
    const field = event.target;
    if (!field.matches("input[name], select[name], textarea[name]")) return;
    if (field.type === "password") return;
    const started = fieldStarts.get(field);
    if (!started) return;
    const answered = field.type === "checkbox" || field.type === "radio"
      ? field.checked
      : String(field.value || "").trim().length > 0;
    completedFields.add(field.name);
    send("field_completed", {
      field_name: field.name,
      field_type: field.type || field.tagName.toLowerCase(),
      duration_ms: Date.now() - started,
      answered
    });
    fieldStarts.delete(field);
  });

  function trackSubmission(form) {
    if (submitted) return;

    const answers = {};
    for (const [name, value] of new FormData(form).entries()) {
      const field = form.elements.namedItem(name);

      // 비밀번호는 수집하지 않는다.
      if (field && field.type === "password") continue;

      if (answers[name] === undefined) {
        answers[name] = value;
      } else if (Array.isArray(answers[name])) {
        answers[name].push(value);
      } else {
        answers[name] = [answers[name], value];
      }
    }

    const totalFields = new Set(
      [...form.elements]
        .filter(el => el.name && el.type !== "password")
        .map(el => el.name)
    ).size;
    send("form_submitted", {
      elapsed_ms: Date.now() - openedAt,
      completed_field_count: completedFields.size,
      total_field_count: totalFields,
      answers
    });
    submitted = true;
  }

  document.addEventListener("submit", event => {
    if (!(event.target instanceof HTMLFormElement)) return;
    trackSubmission(event.target);
  }, true);
  document.addEventListener("survey:submitted", event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    trackSubmission(form);
  });

  addEventListener("pagehide", () => {
    send("page_exit", {
      elapsed_ms: Date.now() - openedAt,
      submitted,
      completed_field_count: completedFields.size
    }, true);
  });
  
})();
