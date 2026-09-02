# CLAUDE.md, website root (shared context for all three Carrot & Stick sites)

This is the root of a monorepo-style folder holding three related but separately
deployed static sites, plus a shared resources folder. Read this file first for any
work in this folder, then read the CLAUDE.md inside the specific site subfolder you are
building.

## Folder architecture

```
website/
  CLAUDE.md              <- this file, cross-site rules
  resources/
    explorer/            <- the shared interactive policy explorer, one copy, embedded
                            in all three sites
    figures/             <- shared figure exports (paper Figures 1-12, named by figure
                            number, e.g. figure-09-rent-decomposition.png)
    papers/              <- Working Paper PDF, Online Appendix PDF, Slides PDF
    tokens.css           <- shared design tokens: color, type, spacing scale. Real
                            values taken from the existing policy/developer sites.
    base.css             <- shared chrome: header/nav, footer, buttons, the
                            figure-placeholder pattern. Import after tokens.css.
    reference-policy-styles.css, reference-developer-styles.css
                         <- the original stylesheets from the live policy and
                            developer sites, kept for reference when those two
                            sites are rebuilt later. Not imported by any site.
  academic/               <- canonical/academic site (build first)
    CLAUDE.md
    content-draft.md
    index.html
    styles.css
  developer/              <- developer-facing site (build second)
    CLAUDE.md (to be written when this site is built)
    ...
  policy/                 <- policy-maker-facing site (build third)
    CLAUDE.md (to be written when this site is built)
    ...
```

Each of academic/, developer/, policy/ deploys as its own GitHub Pages site (separate
repos or separate Pages sources). Do not assume they share a server or build step; they
are static files that happen to live in one folder on disk during development and get
copied out at deploy time.

## What is genuinely shared, and how

- **The policy explorer** (`resources/explorer/`). One engine, reused with different
  framing per site. It is a self-contained module (its own JS/CSS, reads its own CSV
  data files) with a small config object at the top of the embedding page controlling
  labels and which readout leads (academic: percentages and the supply-neutral contour
  foregrounded; policy/developer: plainer labels, the who-pays readout foregrounded).
  Each site's index.html includes it via a relative path, e.g. from academic/index.html:
  `../resources/explorer/explorer.js`. Do not fork the engine per site. If a change is
  needed for one site's framing, extend the config object rather than copying the file.

- **Figures** (`resources/figures/`). Name files by the paper's final figure number,
  not by which site first used them, e.g. `figure-09-rent-decomposition.png`, so all
  three sites reference the same files without renaming.

- **Design tokens** (`resources/tokens.css`). Color (Cornell carnelian #B31B1B as the
  accent), the type scale (Inter, 18px base, 1.7 line-height), and the 860px
  content-column width. Values are taken directly from the existing policy and
  developer sites, not approximated. Each site's own styles.css imports this and
  layers site-specific layout on top.

- **Shared chrome** (`resources/base.css`). Header/nav, footer, buttons, and the
  figure-placeholder pattern (dashed border, gray fill, centered label, used for any
  figure not yet exported from the final draft). Import this after tokens.css. These
  components are visually identical across all three sites and should not be forked.

  Deliberately NOT shared, and not to be copied into the academic site: the
  policy/developer sites' persuasion-register components (.key-finding highlight
  boxes, .implication-card and .targeting-card shadowed cards, .section-badge pill
  labels, .quote-block). The academic site's register is restrained and
  findings-first; where it needs a similar structural device (e.g. calling out a
  scope caveat), use a plain rule or border from the tokens, not a colored box or
  drop shadow. Site-specific styling like this lives in each site's own styles.css,
  never in tokens.css or base.css.

## Cross-site rules

- No em dashes anywhere, in any of the three sites.
- Each site links to the other two: academic site cross-links to policy and developer;
  policy and developer each carry a quiet link back to the academic site's full paper
  and technical appendix. Practitioners get direct links to policy/developer without
  being routed through academic.
- Numbers must agree across all three sites where they overlap (e.g. cost per affordable
  unit, upzoning rent effect). If you are building one site and notice it would state a
  shared number differently than another site already does, flag it, do not silently
  pick one.
- Pending, cross-site: Max's simulation-grid CSV for the explorer (format documented in
  resources/explorer/, once created), and final figure exports for Figures 1, 2, 4, 5,
  and a re-exported Figure 9 (four-component decomposition, not the old two-effect
  version from the original live sites).

## Build order

1. Academic site first (this is the canonical reference; get its copy and structure
   right, since developer and policy reuse its numbers and the same explorer engine).
2. Developer site.
3. Policy site.

Each site's own CLAUDE.md, inside its subfolder, has that site's specific content plan,
copy, and figure list.
