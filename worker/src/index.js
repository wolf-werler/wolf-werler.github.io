import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

const ALLOWED_ORIGINS = new Set([
  "https://wolf-werler.ch",
  "https://www.wolf-werler.ch",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

// Rate limit — fixed window per CF-Connecting-IP.
const RATE_LIMIT = 5;            // submissions
const RATE_WINDOW = 600;         // seconds (10 min)

// Time-trap — minimum dwell time from form load to submit.
const MIN_DWELL_MS = 2000;

const MAX_NAME = 200;
const MAX_EMAIL = 200;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method === "GET" && new URL(request.url).pathname === "/health") {
      return json({ ok: true }, 200, cors);
    }
    if (request.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405, cors);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "invalid_json" }, 400, cors);
    }

    // Honeypot — bots fill all visible inputs including hidden ones.
    if (payload.website) {
      return json({ ok: true }, 200, cors);
    }

    // Time-trap — reject submissions faster than a human could realistically type.
    // Silent 200 so bots can't probe.
    const t = Number(payload.t);
    if (Number.isFinite(t) && Date.now() - t < MIN_DWELL_MS) {
      return json({ ok: true }, 200, cors);
    }

    // Per-IP rate limit.
    const ip = request.headers.get("CF-Connecting-IP") || "";
    const rl = await checkRateLimit(env.RATE_LIMIT, ip);
    if (!rl.ok) {
      return json(
        { error: "rate_limited", retryAfter: rl.retryAfter },
        429,
        { ...cors, "Retry-After": String(rl.retryAfter) }
      );
    }

    const name    = clean(payload.name,    MAX_NAME);
    const email   = clean(payload.email,   MAX_EMAIL);
    const subject = clean(payload.subject, MAX_SUBJECT);
    const message = String(payload.message ?? "")
      .replace(/\0/g, "")        // strip NULL bytes; keep newlines in body
      .trim()
      .slice(0, MAX_MESSAGE);

    if (!name || !email || !message) {
      return json({ error: "missing_fields" }, 400, cors);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "invalid_email" }, 400, cors);
    }

    // Destinations come from env (comma-separated), so they aren't hardcoded in source.
    const destinations = (env.DESTINATIONS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!destinations.length) {
      console.error("DESTINATIONS env not set");
      return json({ error: "misconfigured" }, 500, cors);
    }

    const meta = {
      ip,
      country: request.cf?.country || "",
      ua: request.headers.get("User-Agent") || "",
      ts: new Date().toISOString(),
    };

    const tasks = [
      sendDiscord(env.DISCORD_WEBHOOK_URL, { name, email, subject, message, meta }),
      ...destinations.map((to) =>
        sendEmail(env.SEND_EMAIL, env.SENDER_ADDRESS, env.SENDER_NAME, to, {
          name, email, subject, message, meta,
        })
      ),
    ];

    const results = await Promise.allSettled(tasks);
    const failures = results
      .map((r, i) => ({ r, label: ["discord", ...destinations][i] }))
      .filter((x) => x.r.status === "rejected");

    for (const f of failures) {
      console.error(`delivery_failed[${f.label}]`, f.r.reason?.message || f.r.reason);
    }

    if (failures.length === results.length) {
      return json({ error: "delivery_failed" }, 502, cors);
    }

    return json(
      { ok: true, delivered: results.length - failures.length, total: results.length },
      200,
      cors
    );
  },
};

// Strip CR/LF/NULL so user input can never inject mail headers (Reply-To / Subject).
function clean(v, max) {
  return (v == null ? "" : String(v))
    .replace(/[\r\n\t\0]+/g, " ")
    .trim()
    .slice(0, max);
}

// Fixed-window rate limit. The "reset" timestamp is encoded in the value so
// flooding the key can't roll the window forward.
async function checkRateLimit(kv, ip) {
  if (!kv || !ip) return { ok: true };
  const key = `rl:${ip}`;
  const now = Math.floor(Date.now() / 1000);

  let count = 0;
  let reset = now + RATE_WINDOW;

  const raw = await kv.get(key);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.reset > now) {
        count = parsed.count;
        reset = parsed.reset;
      }
    } catch {}
  }

  if (count >= RATE_LIMIT) {
    return { ok: false, retryAfter: reset - now };
  }

  const ttl = Math.max(60, reset - now);
  await kv.put(key, JSON.stringify({ count: count + 1, reset }), { expirationTtl: ttl });
  return { ok: true };
}

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "https://wolf-werler.ch";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
  });
}

async function sendDiscord(url, { name, email, subject, message, meta }) {
  if (!url) throw new Error("DISCORD_WEBHOOK_URL not set");

  const body = {
    username: "wolf-werler.ch",
    embeds: [
      {
        title: subject ? truncate(subject, 240) : "Neue Anfrage",
        description: truncate(message, 3800),
        color: 0x111111,
        fields: [
          { name: "Name",   value: truncate(name, 1024),  inline: true },
          { name: "E-Mail", value: truncate(email, 1024), inline: true },
          { name: "Land",   value: meta.country || "—",   inline: true },
        ],
        footer: { text: truncate(`${meta.ip || "?"} · ${meta.ts}`, 2048) },
      },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`discord ${res.status}: ${text.slice(0, 200)}`);
  }
}

async function sendEmail(binding, fromAddr, fromName, to, { name, email, subject, message, meta }) {
  if (!binding) throw new Error("SEND_EMAIL binding missing");
  if (!fromAddr) throw new Error("SENDER_ADDRESS not set");

  const msg = createMimeMessage();
  msg.setSender({ name: fromName || "wolf-werler.ch", addr: fromAddr });
  msg.setRecipient(to);
  msg.setSubject(`[wolf-werler.ch] ${subject || "Neue Anfrage von " + name}`);
  msg.setHeader("Reply-To", `${name} <${email}>`);
  msg.setHeader("X-Entity-Ref-ID", crypto.randomUUID());
  msg.addMessage({
    contentType: "text/plain",
    data: [
      "Neue Anfrage über wolf-werler.ch",
      "",
      `Name:    ${name}`,
      `E-Mail:  ${email}`,
      `Betreff: ${subject || "—"}`,
      "",
      "— Nachricht —",
      message,
      "",
      "— Metadaten —",
      `IP:    ${meta.ip || "—"}`,
      `Land:  ${meta.country || "—"}`,
      `Zeit:  ${meta.ts}`,
      `UA:    ${meta.ua}`,
      "",
    ].join("\n"),
  });

  const emailMessage = new EmailMessage(fromAddr, to, msg.asRaw());
  await binding.send(emailMessage);
}

function truncate(s, n) {
  s = String(s ?? "");
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}
