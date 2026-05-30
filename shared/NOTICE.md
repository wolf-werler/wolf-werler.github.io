# shared/NOTICE.md

This `shared/` folder is a comparison-phase artefact.

## Why it exists

The repo currently contains **five parallel design explorations** under
`styles/0N-*/`, each sharing the same placeholder copy (`shared/content.js`),
the same portrait silhouettes (`shared/portraits/`), and the same portfolio
icons (`shared/portfolio/`). This lets us compare visuals without copy
differences confounding the review.

## After the user picks a winner

1. Promote the winning style's HTML/CSS/JS to the repo root.
2. Delete the four losing folders: `rm -rf styles/0{losers}-*`.
3. Decide whether `shared/` still earns its keep:
   - If portrait and portfolio SVGs are still used → keep them, move out of
     `shared/` into the root structure (e.g. `assets/portraits/`).
   - If `content.js` is no longer needed as a runtime source → inline copy
     directly into the HTML pages and delete `shared/content.js`.
4. Delete this `NOTICE.md`.
5. Update `MEMORY.md` to record the chosen style and the cleanup.

Until then, **leave the structure intact** — every style depends on it.
