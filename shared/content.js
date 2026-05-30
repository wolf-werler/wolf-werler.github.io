/*
 * shared/content.js
 *
 * Single source of placeholder copy for all 5 style explorations.
 * Each style's app.js reads `CONTENT` and injects strings into the page via
 * `data-content="dotted.path"` attributes. Keeping copy identical across
 * styles is intentional — the comparison is about visuals, not wording.
 *
 * Styles that need to diverge (style 04 uses first-person "Du" throughout)
 * declare a local `CONTENT_OVERRIDES` object in their own app.js BEFORE this
 * file's deepGet runs. See styles/04-playful-founder/app.js.
 *
 * data-content key list (canonical — keep in sync across styles):
 *   hero.kicker, hero.headline, hero.sub, hero.cta
 *   services.0.title|kicker|body|bullets
 *   services.1.title|kicker|body|bullets
 *   services.2.title|kicker|body|bullets
 *   portfolio.0..5.name|category|year
 *   team.0..2.name|role|bio
 *   footer.tagline|email|imprintLink|privacyLink|year
 *   form.fields.name|email|company|message|submit|success
 */

window.CONTENT = {
  brand: {
    name: 'wolf-werler',
    tld: '.ch',
  },
  nav: {
    home: 'Start',
    services: 'Leistungen',
    contact: 'Kontakt',
  },
  hero: {
    kicker: 'Digitalagentur · Schweiz',
    headline: 'Websites & digitale Präsenz für Schweizer KMU.',
    sub: 'Wir gestalten, hosten und pflegen die Seiten, die deine Kundinnen und Kunden zuerst sehen — präzise, schnell, ohne Umwege.',
    cta: 'Projekt besprechen',
    ctaSecondary: 'Was wir machen',
  },
  services: [
    {
      number: '01',
      title: 'Design',
      kicker: 'Sichtbar werden.',
      body: 'Wir entwerfen Websites, die Ihr Unternehmen klar positionieren und Besuchende zu Kundschaft machen. Vom Erstgespräch über Wireframes bis zur fertigen Seite — durchdacht, schnell, schweizerisch präzise.',
      bullets: [
        'Discovery & Strategie',
        'Visuelles Konzept',
        'UI- & UX-Design',
        'Inhalte & Texte',
      ],
    },
    {
      number: '02',
      title: 'Hosting',
      kicker: 'Schnell und sorgenfrei.',
      body: 'Wir betreiben Ihre Website auf moderner, sicherer Infrastruktur. Schnelle Ladezeiten in der ganzen Schweiz, automatische Backups, SSL inklusive — Sie müssen sich um nichts kümmern.',
      bullets: [
        'Globale CDN-Auslieferung',
        'SSL & Sicherheit inklusive',
        'Automatische Backups',
        '99,9 % Verfügbarkeit',
      ],
    },
    {
      number: '03',
      title: 'Verwaltung',
      kicker: 'Immer aktuell.',
      body: 'Eine Website ist nie fertig. Wir kümmern uns um laufende Anpassungen, Inhaltsaktualisierungen, technische Updates und kleine Optimierungen — damit Ihre digitale Präsenz mit Ihnen mitwächst.',
      bullets: [
        'Inhalts-Updates',
        'Technische Wartung',
        'SEO-Pflege',
        'Monatliche Reports',
      ],
    },
  ],
  portfolio: [
    { name: 'Bäckerei Müller',         category: 'Bäckerei',        year: '2025' },
    { name: 'Trattoria Bellini',       category: 'Restaurant',      year: '2025' },
    { name: 'Sanitär Brunner AG',      category: 'Sanitär',         year: '2024' },
    { name: 'Praxis Dr. Keller',       category: 'Zahnmedizin',     year: '2024' },
    { name: 'Treuhand Lehmann',        category: 'Treuhand',        year: '2024' },
    { name: 'Atelier Schmid',          category: 'Boutique',        year: '2023' },
  ],
  team: [
    {
      name: 'Levin Wolf',
      role: 'Design & Frontend',
      bio: 'Verantwortet die visuelle Sprache jeder Seite, die wir bauen. Findet Spass an Typografie-Details, mit denen sich sonst niemand aufhält. Liest Briefings am liebsten zwischen den Zeilen.',
    },
    {
      name: 'Paul Ernst Werler',
      role: 'Strategie & Inhalt',
      bio: 'Übersetzt Geschäftsmodelle in klare Botschaften. Bringt Ordnung in komplizierte Sachverhalte und sorgt dafür, dass jede Seite das Richtige sagt. Findet, die meisten Websites haben einen Satz zu viel.',
    },
    {
      name: 'Isaac Lins',
      role: 'Engineering & Hosting',
      bio: 'Sorgt dafür, dass alles schnell läuft, sicher bleibt und auch in zwei Jahren noch zuverlässig funktioniert. Glaubt an einfache Stacks, klare Logs und nächtliche Backups. Lieblingswort: idempotent.',
    },
  ],
  about: {
    kicker: 'Über uns',
    headline: 'Drei Personen. Klare Rollen. Eine Website nach der anderen.',
    body: 'Wir sind ein kleines Team aus Design, Strategie und Engineering. Statt sechs Standorten und einem Verkaufstrichter bekommen Sie die drei Personen, die Ihre Seite tatsächlich machen — direkt, ansprechbar, am gleichen Tisch.',
  },
  form: {
    headline: 'Erzählen Sie uns von Ihrem Projekt.',
    sub: 'Wir melden uns innerhalb von zwei Werktagen mit einem Vorschlag, wie wir weitermachen könnten.',
    fields: {
      nameLabel: 'Name',
      namePlaceholder: 'Anna Beispiel',
      emailLabel: 'E-Mail',
      emailPlaceholder: 'anna@firma.ch',
      companyLabel: 'Unternehmen',
      companyPlaceholder: 'Firma AG',
      messageLabel: 'Worum geht es?',
      messagePlaceholder: 'Eine neue Website, Hosting wechseln, etwas anpassen — beschreiben Sie kurz, was Sie vorhaben.',
      submit: 'Anfrage senden',
    },
    privacy: 'Mit dem Absenden bestätigen Sie, dass wir Ihre Angaben zur Bearbeitung Ihrer Anfrage verwenden dürfen. Details in der Datenschutzerklärung.',
    success: 'Demo — der Worker ist noch nicht aktiv. Ihre Eingaben wurden nicht gesendet.',
  },
  footer: {
    tagline: 'Websites für Schweizer KMU.',
    email: 'hallo@wolf-werler.ch',
    location: 'Schweiz',
    imprintLink: 'Impressum',
    privacyLink: 'Datenschutz',
    year: new Date().getFullYear(),
  },
};

/* Tiny resolver used by every style's app.js. Reads dot-notation paths.
   Numeric segments index arrays. Returns '' for missing paths so the layout
   doesn't break if a key is renamed. */
window.resolveContent = function (path, source) {
  const root = source || window.CONTENT;
  return path.split('.').reduce((acc, key) => {
    if (acc == null) return '';
    const next = acc[key];
    return next == null ? '' : next;
  }, root);
};

/* Apply content to the document. Called by each style's app.js after DOM
   ready. Honours an optional `overrides` object for style-specific copy. */
window.applyContent = function (overrides) {
  const merged = overrides
    ? mergeDeep(structuredClone(window.CONTENT), overrides)
    : window.CONTENT;

  document.querySelectorAll('[data-content]').forEach((node) => {
    const path = node.getAttribute('data-content');
    const value = window.resolveContent(path, merged);
    if (Array.isArray(value)) {
      node.textContent = value.join(' · ');
    } else if (typeof value === 'object') {
      // Skip — caller wanted a branch, not a leaf. The page templates
      // shouldn't bind to non-leaf paths.
    } else {
      node.textContent = String(value);
    }
  });

  document.querySelectorAll('[data-placeholder-source]').forEach((node) => {
    const path = node.getAttribute('data-placeholder-source');
    const value = window.resolveContent(path, merged);
    if (value) node.setAttribute('placeholder', String(value));
  });

  document.querySelectorAll('[data-aria-source]').forEach((node) => {
    const path = node.getAttribute('data-aria-source');
    const value = window.resolveContent(path, merged);
    if (value) node.setAttribute('aria-label', String(value));
  });

  // Form action / honeypot / submit interception are wired here too so every
  // style gets the same demo behaviour without re-implementing it.
  const form = document.querySelector('form[data-contact-form]');
  if (form) {
    form.setAttribute('action', 'https://api.wolf-werler.ch/contact');
    form.setAttribute('method', 'POST');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const notice = form.querySelector('[data-form-notice]');
      if (notice) {
        notice.textContent = merged.form.success;
        notice.hidden = false;
        notice.setAttribute('role', 'status');
      }
    });
  }
};

function mergeDeep(target, source) {
  for (const key of Object.keys(source)) {
    const sv = source[key];
    if (sv && typeof sv === 'object' && !Array.isArray(sv)) {
      target[key] = mergeDeep(target[key] || {}, sv);
    } else {
      target[key] = sv;
    }
  }
  return target;
}
