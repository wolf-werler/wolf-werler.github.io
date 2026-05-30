(function () {
  /*
   * Style 04 overrides the global "Sie" tone with a first-person, "Du"-form
   * voice — documented divergence from the comparison-wide copy. Only the
   * sections where voice matters most are overridden; service body copy stays
   * descriptive (works for both registers).
   */
  const OVERRIDES = {
    hero: {
      kicker: 'Wir sind zu dritt · und nehmen neue Projekte an',
      sub: 'Hi, wir sind Levin, Paul und Isaac. Wir entwerfen, hosten und pflegen Websites für kleine Schweizer Betriebe — direkt, ohne Verkaufstrichter, ohne Standortwechsel.',
      cta: 'Schreib uns',
      ctaSecondary: 'Was wir machen',
    },
    about: {
      headline: 'Drei Menschen. Direkt erreichbar.',
      body: 'Statt sechs Standorten und drei Übergaben bekommst du die drei Personen, die deine Website tatsächlich bauen. Wir mögen kleine Teams, klare Briefings und Projekte, bei denen wir uns mit dir auf einen Espresso treffen können.',
    },
    form: {
      headline: 'Erzähl uns von deinem Projekt.',
      sub: 'Wir melden uns innerhalb von zwei Werktagen — direkt, ohne Auto-Reply-Geplänkel.',
      fields: {
        nameLabel: 'Wie heisst du?',
        emailLabel: 'Wo erreichen wir dich?',
        companyLabel: 'Für wen?',
        messageLabel: 'Was hast du vor?',
        submit: 'Ab die Post',
      },
      privacy: 'Mit dem Senden bestätigst du, dass wir deine Angaben zur Bearbeitung verwenden dürfen. Mehr in der Datenschutzerklärung.',
    },
  };

  function init() {
    if (typeof window.applyContent === 'function') {
      window.applyContent(OVERRIDES);
    }
    document.documentElement.dataset.styleReady = '1';
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
