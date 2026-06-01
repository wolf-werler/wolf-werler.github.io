# wolf-werler-contact

Cloudflare Worker that receives contact-form submissions from `wolf-werler.ch`
and fans them out to:

- Discord webhook (channel notification)
- Email to `contact@isaaclins.com`
- Email to `Levin.wolf@icloud.com`

It listens at `https://api.wolf-werler.ch/` (custom domain on the
`wolf-werler.ch` zone).

## Wire diagram

```
  Browser (kontakt/) ──POST JSON──▶ api.wolf-werler.ch (Worker)
                                          │
                          ┌───────────────┼────────────────┐
                          ▼               ▼                ▼
                   Discord webhook   send_email →    send_email →
                                     contact@…      Levin.wolf@…
```

## One-time setup

### 1. Cloudflare zone

The `wolf-werler.ch` zone must already be on the Cloudflare account you're
deploying with. The `api` subdomain does **not** need a manual DNS record —
Wrangler creates it when the custom domain route is provisioned on first deploy.

### 2. Enable Email Routing on the zone

Cloudflare dashboard → `wolf-werler.ch` → **Email** → **Email Routing** →
**Get started**. Accept the MX/SPF/DKIM records it offers and let it provision
them.

This is what unlocks the `send_email` binding.

### 3. Verify destination addresses

Email Routing → **Destination addresses** → **Add destination address** for
each of:

- `contact@isaaclins.com`
- `Levin.wolf@icloud.com`

Cloudflare emails each address a verification link; both must be clicked
before the Worker can send to them. Until verified, `binding.send(...)`
returns an "address not verified" error.

> The destinations are also listed in `wrangler.toml` under
> `[[send_email]].destination_addresses` — the Worker can only send to
> addresses that appear in **both** places.

### 4. Make sure a sender mailbox/route exists

The Worker sends `From: kontakt@wolf-werler.ch` (see
`SENDER_ADDRESS` in `wrangler.toml`). The address itself does not need to be a
real mailbox for the `send_email` binding to work — the MX/DKIM records from
step 2 are what make outgoing mail deliverable. If you'd rather use a
different sender, edit `SENDER_ADDRESS` and redeploy.

### 5. Install dependencies

```sh
cd worker
npm install
```

### 6. Set the Discord webhook secret

```sh
npx wrangler secret put DISCORD_WEBHOOK_URL
# paste the webhook URL when prompted
```

### 7. Deploy

```sh
npx wrangler deploy
```

On first deploy Wrangler will:

- Upload the Worker
- Bind `SEND_EMAIL`
- Create the `api.wolf-werler.ch` custom-domain record on the zone

After deploy, hit it:

```sh
curl https://api.wolf-werler.ch/health
# → {"ok":true}
```

## Local dev

```sh
npx wrangler dev
```

`send_email` is mocked locally — calls log to the terminal instead of sending
real mail. Discord webhooks fire for real if `DISCORD_WEBHOOK_URL` is set in
your local `.dev.vars`:

```
# worker/.dev.vars   (gitignored)
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
```

## Request contract

```http
POST / HTTP/1.1
Content-Type: application/json

{
  "name":    "Jane Example",
  "email":   "jane@example.ch",
  "subject": "Neue Webseite",
  "message": "Wir suchen …",
  "website": ""            // honeypot — leave empty
}
```

Responses:

| Status | Body                                | Meaning                            |
|--------|-------------------------------------|------------------------------------|
| 200    | `{ "ok": true, "delivered": N, "total": 3 }` | At least one channel succeeded |
| 200    | `{ "ok": true }`                    | Honeypot tripped, silently accepted |
| 400    | `{ "error": "missing_fields" }`     | name / email / message missing      |
| 400    | `{ "error": "invalid_email" }`      | Email failed the basic regex        |
| 400    | `{ "error": "invalid_json" }`       | Body wasn't JSON                    |
| 405    | `{ "error": "method_not_allowed" }` | Wrong HTTP method                   |
| 502    | `{ "error": "delivery_failed" }`    | All three deliveries threw          |

## Logs

```sh
npx wrangler tail
```

Failed deliveries log as `delivery_failed[<channel>] <reason>` so you can see
which of the three (`discord` / `contact@…` / `Levin.wolf@…`) is broken
without losing the others.
