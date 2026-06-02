/* Wolf · Werler — shared client-side glue.
   Loaded on every page. Each block self-skips if its targets aren't present.
   Fonts are loaded via /fonts.css linked from each page's <head> so this
   script stays plain ES (no bare-specifier imports that break without a
   bundler). */

(function () {
  /* ───── 0. Mobile menu — inject toggle, slide-down panel ────── */
  var navInner = document.querySelector(".nav__inner");
  if (navInner) {
    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "nav__toggle";
    toggle.setAttribute("aria-label", "Menü öffnen");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = '<span></span><span></span><span></span>';
    navInner.appendChild(toggle);

    // The bottom CTA in the menu panel doubles as the close button while
    // the menu is open. We swap its text + href and intercept the click.
    var ctaLink = document.querySelector(".nav__cta .btn");
    var ctaOriginalText = ctaLink ? ctaLink.textContent.trim() : "";
    var ctaOriginalHref = ctaLink ? ctaLink.getAttribute("href") : "";

    function setOpen(open) {
      document.body.dataset.navOpen = open ? "true" : "false";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Menü schliessen" : "Menü öffnen");
      if (ctaLink) {
        if (open) {
          ctaLink.textContent = "Schliessen";
          ctaLink.setAttribute("href", "#");
          ctaLink.setAttribute("aria-label", "Menü schliessen");
          ctaLink.dataset.navClose = "true";
        } else {
          ctaLink.textContent = ctaOriginalText;
          ctaLink.setAttribute("href", ctaOriginalHref);
          ctaLink.removeAttribute("aria-label");
          delete ctaLink.dataset.navClose;
        }
      }
    }

    // Click-catcher backdrop for the open menu — tap anywhere outside
    // the panels (in the visible gap) to dismiss.
    var backdrop = document.createElement("div");
    backdrop.className = "nav__backdrop";
    backdrop.setAttribute("aria-hidden", "true");
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", function () { setOpen(false); });

    toggle.addEventListener("click", function () {
      setOpen(document.body.dataset.navOpen !== "true");
    });

    // Nav links: close the panel after the navigation triggers.
    document.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });

    // CTA: when in close-mode, swallow the click and just close.
    // Otherwise navigate to /kontakt/ and close the panel.
    if (ctaLink) {
      ctaLink.addEventListener("click", function (e) {
        if (ctaLink.dataset.navClose === "true") {
          e.preventDefault();
          setOpen(false);
          return;
        }
        setOpen(false);
      });
    }

    // Close on Escape for keyboard users.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.dataset.navOpen === "true") {
        setOpen(false);
      }
    });

    // On mobile the menu becomes a full-height overlay panel. Because .nav
    // carries a backdrop-filter — which makes it the containing block for
    // any fixed-positioned descendant in iOS Safari / Chrome — a panel left
    // inside .nav would be sized against the ~70px header box instead of the
    // viewport, collapsing it to a sliver and letting the page bleed through.
    // We sidestep that by hoisting the panel up to <body> on mobile, where
    // the viewport is the containing block (same trick as .nav__backdrop).
    // The CTA rides along inside the panel so "Schliessen" sits right after
    // the last link. On desktop everything goes back into .nav__inner so the
    // centered grid layout is unchanged.
    var navEl = document.querySelector(".nav");
    var navLinksEl = document.querySelector(".nav__links");
    var navCtaEl = document.querySelector(".nav__cta");

    function syncMenuPlacement(isMobile) {
      if (!navLinksEl) return;
      if (isMobile) {
        if (navLinksEl.parentNode !== document.body) document.body.appendChild(navLinksEl);
        if (navCtaEl && navCtaEl.parentNode !== navLinksEl) navLinksEl.appendChild(navCtaEl);
      } else {
        if (navLinksEl.parentNode !== navInner) navInner.appendChild(navLinksEl);
        if (navCtaEl && navCtaEl.parentNode !== navInner) navInner.appendChild(navCtaEl);
      }
    }

    // The overlay starts flush under the header, whose height shifts with the
    // iOS status-bar safe-area inset. Measure it instead of hard-coding a
    // magic number, and expose it to CSS as --nav-h.
    function setNavHeight() {
      if (navEl) {
        document.documentElement.style.setProperty("--nav-h", navEl.offsetHeight + "px");
      }
    }

    // If the viewport grows past mobile, reset state + reparent everything.
    var mq = window.matchMedia("(min-width: 761px)");
    syncMenuPlacement(!mq.matches);
    setNavHeight();
    function onResize() {
      if (mq.matches) setOpen(false);
      syncMenuPlacement(!mq.matches);
      setNavHeight();
    }
    window.addEventListener("resize", setNavHeight);
    window.addEventListener("orientationchange", setNavHeight);
    window.addEventListener("load", setNavHeight);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onResize);
    } else if (typeof mq.addListener === "function") {
      mq.addListener(onResize);
    }
  }

  /* ───── 1. Copy-to-clipboard buttons on /kontakt/ ──────────── */
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    var label = btn.querySelector(".copy-btn__state");
    var defaultLabel = label ? label.textContent : "";

    function flash(text) {
      if (label) label.textContent = text;
      btn.dataset.copied = "true";
      setTimeout(function () {
        if (label) label.textContent = defaultLabel;
        btn.dataset.copied = "false";
        // Drop focus so the button stops looking "active" on touch devices.
        if (typeof btn.blur === "function") btn.blur();
      }, 1600);
    }

    btn.addEventListener("click", function () {
      var text = btn.dataset.copy;
      if (!text) return;

      // Reset any lingering state so a fresh tap shows the flash again.
      btn.dataset.copied = "false";

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          flash("Kopiert");
        }).catch(fallback);
      } else {
        fallback();
      }

      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); flash("Kopiert"); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });

  /* ───── 2. "Dein Projekt?" on /referenzen/ → /kontakt/?msg= ──── */
  var prefillBtn = document.querySelector("[data-refs-prefill]");
  if (prefillBtn) {
    prefillBtn.addEventListener("click", function () {
      var input = document.querySelector("[data-refs-input]");
      var msg = input ? input.value.trim() : "";
      var url = "/kontakt/" + (msg ? "?msg=" + encodeURIComponent(msg) : "");
      window.location.href = url;
    });
  }

  /* ───── 3. /kontakt/ prefill from ?msg= URL param ─────────── */
  var msgField = document.getElementById("site-msg");
  if (msgField) {
    var params = new URLSearchParams(window.location.search);
    var incoming = params.get("msg");
    if (incoming) {
      msgField.value = incoming;
      setTimeout(function () {
        msgField.focus({ preventScroll: true });
      }, 80);
    }
  }

  /* ───── 4. /kontakt/ form: time-trap timestamp + submit handler ── */
  var form = document.getElementById("contactForm");
  if (form) {
    var tField = form.querySelector('[name="t"]');
    if (tField) tField.value = String(Date.now());

    var ENDPOINT = "https://api.wolf-werler.ch/";
    var FETCH_TIMEOUT_MS = 15000;
    var btn = document.getElementById("contactSubmit");
    var status = document.getElementById("contactStatus");
    var notice = form.querySelector(".contact__notice");
    if (!btn || !status) return;

    var label = btn.querySelector("span");
    var prevLabel = label ? label.textContent : "";
    var idleStatus = status.textContent;

    function setStatus(text, tone) {
      status.textContent = text;
      if (tone === "error") status.style.color = "#a04848";
      else if (tone === "ok") status.style.color = "var(--ink)";
      else status.style.color = "var(--mist)";
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (btn.disabled) return;

      var fd = new FormData(form);
      var payload = {
        name:    (fd.get("name")    || "").toString().trim(),
        email:   (fd.get("email")   || "").toString().trim(),
        subject: (fd.get("subject") || "").toString().trim(),
        message: (fd.get("message") || "").toString().trim(),
        website: (fd.get("website") || "").toString(),
        t:       Number(fd.get("t")) || 0,
      };

      if (!payload.name || !payload.email || !payload.message) {
        setStatus("Bitte Name, Mail und Nachricht ausfüllen.", "error");
        return;
      }

      btn.disabled = true;
      if (label) label.textContent = "Sende …";
      setStatus("", null);
      if (notice) notice.hidden = true;

      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, FETCH_TIMEOUT_MS);

      try {
        var res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (!res.ok) {
          var data = await res.json().catch(function () { return {}; });
          throw new Error(data.error || ("HTTP " + res.status));
        }

        form.reset();
        // Re-stamp the time field since reset() clears it.
        var tFieldReset = form.querySelector('[name="t"]');
        if (tFieldReset) tFieldReset.value = String(Date.now());

        // Show the persistent thanks panel, scroll it into view, and
        // mute the small status label (the panel carries the message).
        if (notice) {
          notice.hidden = false;
          if (typeof notice.scrollIntoView === "function") {
            notice.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
        setStatus("", null);
        if (label) label.textContent = "Gesendet";
        setTimeout(function () {
          if (label) label.textContent = prevLabel;
          setStatus(idleStatus, null);
          btn.disabled = false;
        }, 2800);
      } catch (err) {
        clearTimeout(timer);
        console.error("contact submit failed", err);
        if (err && err.name === "AbortError") {
          setStatus("Zeitüberschreitung. Bitte direkt per Mail.", "error");
        } else {
          setStatus("Konnte nicht gesendet werden. Bitte direkt per Mail.", "error");
        }
        if (label) label.textContent = prevLabel;
        btn.disabled = false;
      }
    });
  }
})();
