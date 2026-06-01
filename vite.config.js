import { defineConfig } from 'vite';

// Multi-page setup: every /<section>/index.html is its own entry so Vite knows
// which HTML files to process for both dev and build.
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main:        'index.html',
        leistungen:  'leistungen/index.html',
        referenzen:  'referenzen/index.html',
        ueber:       'ueber/index.html',
        kontakt:     'kontakt/index.html',
        impressum:   'impressum/index.html',
        datenschutz: 'datenschutz/index.html',
        agb:         'agb/index.html',
      },
    },
  },
});
