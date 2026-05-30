# MEMORY.md

Running planning doc for the project. Updated every time a decision is made or
new information surfaces. Source of truth for context between sessions.

## Project

- **Working name:** `wolf-werler.ch` (placeholder, not finalised — domain may change)
- **What it is:** Static marketing / CTA website for a small services outfit
- **Audience:** Swiss KMU (SMBs) — primarily German-speaking, some English reach
- **What the business does:** Web design, hosting, and ongoing site management
  ("Verwaltung") for SMB clients
- **What the site does:**
  - Lets prospects find and read about the business (services, past work, team)
  - Captures inbound leads through a contact form
  - Acts as the place to send people during outbound conversations

## Team

| Name | Role | Bio |
| --- | --- | --- |
| Levin Wolf | Design & Frontend | placeholder bio (2–3 sentences in `shared/content.js`) |
| Paul Ernst Werler | Strategie & Inhalt | placeholder bio |
| Isaac Lins | Engineering & Hosting | placeholder bio |

Each gets a full corporate portrait + short bio underneath on every layout.
Portraits are silhouette placeholders (`shared/portraits/*.svg`) until real
photos arrive.

## Stack & infrastructure

| Area | Choice | Notes |
| --- | --- | --- |
| Frontend | Plain HTML / CSS / JS | No build step, hand-crafted, design-led |
| Site hosting | GitHub Pages | Static deploy via `git push` |
| Form backend | Cloudflare Worker | Receives form POST, sends email |
| Mail provider | Resend | HTTP API, free tier (3k/mo), API key in Worker secret |
| Worker URL | `api.wolf-werler.ch` | Custom subdomain on Cloudflare DNS |
| Domain | Cloudflare DNS | apex CNAME → GH Pages |
| Email inbox | Hostpoint | Existing mailbox(es) at Hostpoint, used as recipient |
| GitHub | New account, being set up | Created once Cloudflare email is wired |

External accounts in play: Cloudflare and Hostpoint (both from friend), GitHub (new).

## Content scope (final site, v1 pages)

Home · Leistungen · Referenzen · Über uns · Kontakt · Impressum · Datenschutz.

This phase ships only **Home · Leistungen · Kontakt** in each style. The other
pages get built once a style is picked.

## Languages

- **Primary:** German (default routes, no prefix)
- **Secondary:** English under `/en/` (deferred until style is picked)
- Tone: `Sie` everywhere by default. Style 04 uses `Du` throughout — documented
  divergence (it's a brand-voice choice, not a copy bug).

## Visual identity — comparison in progress

Five complete design explorations under `styles/0N-*/`. User picks one; the
other four are deleted. The shared chooser at the repo root (`index.html`)
links to all five.

| № | Style | Type system | Palette | Notes |
| --- | --- | --- | --- | --- |
| 01 | swiss-minimal | Switzer | ink + paper + red accent | grid, restraint, no motion |
| 02 | editorial-bold | Fraunces + IBM Plex Sans | warm off-white + ochre | drop caps, oversized italic display, magazine pacing |
| 03 | corporate-trust | Cabinet Grotesk + Synonym | navy + blue accent | sticky nav, trust strip, card-heavy |
| 04 | playful-founder | Bricolage Grotesque + Caveat | cream + terracotta + sage | rotated cards, wavy underline, signatures, Du-form |
| 05 | boutique-warm | Boska + General Sans | cream + brass | thin rules, small-caps, "labelled plates", italic serif |

## Architecture of the comparison

- `shared/content.js` — single source of placeholder copy. Every style reads
  it via `data-content="dotted.path"` attributes. Identical wording across
  styles keeps the comparison about visuals.
- `shared/portraits/*.svg`, `shared/portfolio/*.svg` — silhouette + icon
  placeholders, currentColor so each palette re-tints them.
- `shared/favicon.svg`, `shared/NOTICE.md` — favicon + cleanup instructions
  for after the pick.
- `styles/0N-*/{index,leistungen,kontakt}.html + style.css + app.js` —
  per-style implementation. Each self-contained, deletable in one command.
- Root `index.html` — neutral monospace chooser sheet linking to the five.

### Documented per-style divergences

- **Style 02** hero `<h1>` is hardcoded with an italic `<em>Präsenz</em>` so
  the accent can render (the global content.js wires `data-content` as
  textContent, which strips child nodes).
- **Style 03** hero `<h1>` is hardcoded with a coloured `<span class="accent">`
  for the same reason.
- **Style 04** hero `<h1>` is hardcoded with multi-colour spans and a
  scribble-underline span. Style 04 *also* overrides hero/about/form copy to
  Du-form via `CONTENT_OVERRIDES` in `app.js`. Documented brand-voice choice.
- **Style 05** hero `<h1>` is hardcoded with an italic `<em>` for the brass
  accent.

The non-hero copy stays identical across all five styles.

## Contact form — safety model (will apply when Worker is built)

The form lives on a static origin (GH Pages) and submits to a Cloudflare Worker.
In the comparison phase, the form `action` points to `api.wolf-werler.ch/contact`
but `app.js` intercepts submit and shows an inline German notice — no real
network request fires.

Required protections when the Worker is built:

1. **Cloudflare Turnstile** widget on the form (invisible, free) — server-side
   verifies the token before sending. Layout already reserves a placeholder.
2. **CORS** in the Worker locked to the site origin only.
3. **API key** for Resend stored as a Worker secret (`wrangler secret put`),
   never in the repo or client code.
4. **Hardcoded recipient** in the Worker — user input never controls the `to:`
   address (prevents the Worker becoming an open relay).
5. **Input validation** — length caps, type checks, strip CR/LF from any value
   that could enter a mail header (subject, name).
6. **Per-IP rate limit** in the Worker (Cloudflare KV or Durable Object) plus a
   honeypot field (`name="website"`) rejected on the server. Layouts already
   include the honeypot.
7. **No PII logging** — log counts/errors, not message bodies.

## How to view the comparison

```sh
python3 -m http.server 8765 --bind 127.0.0.1
# then open http://127.0.0.1:8765/
```

The chooser at `/` links to each style's home. From there, every page links to
Leistungen and Kontakt. `file://` opens also work but DNS-based font CDNs may
behave differently — prefer the local server.

## After the user picks a winner

1. Promote the winning style's HTML/CSS/JS to the repo root.
2. Delete the four losing folders: `rm -rf styles/0{losers}-*`.
3. Re-evaluate `shared/` per `shared/NOTICE.md`.
4. Delete `shared/NOTICE.md`.
5. Update this `MEMORY.md` to record the choice and the cleanup.
6. Proceed to next phase: real Impressum, Worker code, EN translation, deploy.

## Open decisions (still to lock)

- Final domain — currently treating `wolf-werler.ch` as a placeholder.
- DNS — registrar, where the apex points (assume Cloudflare DNS).
- Recipient inbox address for contact-form mail (currently `hallo@wolf-werler.ch`).
- Visual identity — pending five-way comparison.
- Real Impressum data — legal entity type (Einzelfirma / GmbH?), registered
  address, responsible person.
- Pricing — transparent prices vs "auf Anfrage".
- Analytics — Cloudflare Web Analytics / Plausible / none.
- Cookie banner — depends on analytics + jurisdiction (CH nFADP).

## Out of scope (for now)

- CMS — content lives in the repo
- Auth, accounts, dashboards
- Blog
- E-commerce / payments

## Process rules

- No further implementation until the user picks a winning style.
- Commits only when the user explicitly asks.
- Update this file the moment a decision changes — it is the single source of
  truth for what we've agreed on.
