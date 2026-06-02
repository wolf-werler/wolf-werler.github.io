/* Wolf · Werler — shared client-side glue.
   Loaded on every page. Each block self-skips if its targets aren't present. */

// Self-hosted fonts (replaces the Google Fonts <link> tags).
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource/manrope/300.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";

(function () {
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
