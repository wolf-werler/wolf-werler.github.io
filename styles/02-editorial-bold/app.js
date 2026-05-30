(function () {
  function init() {
    if (typeof window.applyContent === 'function') {
      window.applyContent();
    }
    document.documentElement.dataset.styleReady = '1';
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
