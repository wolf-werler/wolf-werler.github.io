# TODO

Outstanding work before going live, ordered by priority.

## Block launch

- [ ] **Provision the rate-limit KV namespace.**
  Run `pnpm --filter ./worker exec wrangler kv namespace create RATE_LIMIT`
  (or `cd worker && wrangler kv namespace create RATE_LIMIT`),
  then paste the returned `id` into `worker/wrangler.toml` in place of
  `REPLACE_WITH_KV_NAMESPACE_ID`. Without this the worker still runs but
  there is no per-IP throttle on the contact form.

- [ ] **Fill the legal page placeholders.**
  Bracketed fields in `/impressum/`, `/datenschutz/`, `/agb/` need real
  values: Rechtsform, Geschäftsadresse, UID, verantwortliche Person,
  date stamps. Have a Swiss lawyer review before publishing — the
  templates are structurally correct but not legally vetted.

- [ ] **Set the worker secrets in Cloudflare.**
  `wrangler secret put DISCORD_WEBHOOK_URL` (the Discord webhook).
  Optional but recommended: `wrangler secret put DESTINATIONS` if you
  prefer the recipient emails not to live in `wrangler.toml` source.

- [ ] **Verify the Galaxy-Nails reference link resolves.**
  `https://wolf-werler.ch/Galaxy-Nails-frontend/` is linked from
  `/referenzen/` but that path isn't in this repo. Confirm it's actually
  served (probably from a sibling GitHub Pages repo) before launch.

## Should do soon

- [ ] **Add Cloudflare Turnstile to the contact form.**
  The KV rate limit + time-trap + honeypot stop dumb bots, but
  Turnstile is the proper anti-abuse layer. Free, no UX friction.
  Add the widget client-side, verify the token in the worker before
  any send.

- [ ] **Move GitHub Pages source to `dist/` via a Pages workflow.**
  Right now the repo root is served, so `package.json`, `vite.config.js`,
  `worker/`, etc. are publicly fetchable (harmless but noisy). A
  `.github/workflows/pages.yml` that runs `pnpm build` and publishes
  `dist/` is the clean fix. Note: this means anything not declared as a
  Vite entry won't be deployed — re-check before flipping the switch.

- [ ] **Set HSTS preload on the custom domain.**
  In Cloudflare SSL/TLS → Edge Certificates, enable HSTS with a long
  max-age and preload. Verify wolf-werler.ch is on the HSTS preload
  list (hstspreload.org) once the policy has bedded in.

## Nice to have

- [ ] **Strip inline `style="…"` attributes from HTML** so the CSP can
  drop `'unsafe-inline'` from `style-src`. Move them into CSS classes
  in `styles.css`.

- [ ] **Test whether `nodejs_compat` is still needed** in `worker/wrangler.toml`.
  `mimetext` may or may not require it; if not, remove the flag for a
  smaller runtime surface.

- [ ] **Self-host a favicon** at `/favicon.ico` and `/favicon.svg`.
  Currently every page request causes a 404 for the favicon. Not a
  security issue but visible in DevTools and slightly chatty.

- [ ] **Email obfuscation** — `hallo@wolf-werler.ch` is plaintext in HTML.
  Scraping is inevitable; either accept the spam or JS-obfuscate. Not
  worth fighting hard.

- [ ] **Decide on Impressum link in nav vs footer only.**
  Currently legal pages are footer-only. Some Swiss case law expects
  a `Kontakt`/`Impressum` link reachable from every page — the footer
  satisfies that, but worth a second look.

## Done (this session)

- ✅ Header injection in worker (`clean()` strips CR/LF/TAB/NUL).
- ✅ KV-backed per-IP rate limiting in worker.
- ✅ Time-trap honeypot.
- ✅ Tightened CORS allowlist.
- ✅ Inline kontakt script extracted, fetch wrapped in AbortController.
- ✅ Self-hosted fonts via `@fontsource`.
- ✅ CSP + Referrer-Policy + Permissions-Policy meta on every page.
- ✅ `rel="noreferrer"` on outbound refs links.
- ✅ Impressum / Datenschutz / AGB stub pages wired into footer.
- ✅ `MEMORY.md` untracked.
