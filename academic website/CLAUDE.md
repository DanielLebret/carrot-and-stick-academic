# CLAUDE.md, academic/ (Carrot & Stick academic site)

Context for building the canonical academic website for the paper "When Redevelopment
Transforms the Housing Stock: Carrot & Stick Policy and the Affordability Puzzle"
(Lebret, Liu, Valentin, 2026). Read `../CLAUDE.md` first (root, cross-site rules and the
shared resources/ folder), then this file. The full section-by-section copy lives in
`content-draft.md`, in this same folder. The figure manifest and stale-content audit
live in `../resources/figure-and-content-audit.md` (shared reference, applies to all
three sites).

## Where this site's files live

Everything for this site lives in `website/academic/`: `index.html`, `styles.css`, and
this CLAUDE.md and content-draft.md. Shared assets are pulled in by relative path from
`website/resources/`:
- `../resources/explorer/` for the interactive policy explorer (JS/CSS/data)
- `../resources/figures/` for figure images, named by final figure number
- `../resources/tokens.css` for the shared color/type/layout tokens, imported at the top
  of this site's own styles.css

Do not copy resources/ files into academic/. Reference them by relative path so a
change made in resources/ (a new figure export, an explorer fix, a token update)
reaches all three sites without duplication.

## What this site is

The canonical, citable landing page for an academic audience (referees, editors, seminar
and conference audiences, researchers who may cite or extend). It is the hub; the existing
policy site and developer site are spokes. Practitioners get direct links to the spokes
and are not routed through here. This site links out to both spokes; each spoke carries a
quiet link back here.

Register: restrained, findings-first, no persuasion-site language. This is not the policy
or developer site. Do not add "what this means for you," urgency, or marketing tone.

## Tech and constraints

- Pure HTML/CSS/JS. No framework, no build step. Deploys as static files on GitHub Pages
  from this academic/ folder as its own site.
- `index.html` and `styles.css` live in this folder. `styles.css` imports
  `../resources/tokens.css` then `../resources/base.css`, in that order, then adds
  this site's own layout and section styling on top. base.css gives the header/nav,
  footer, buttons, and figure-placeholder pattern already used by the policy and
  developer sites; use it as-is rather than rebuilding it. Do not use the
  policy/developer persuasion components (shadowed cards, colored highlight boxes,
  pill badges); see root CLAUDE.md for the full list of what is deliberately excluded.
- The explorer is not built in this folder. It lives once in `../resources/explorer/`
  and is embedded here via a script/link tag pointing at the relative path, with a small
  config object (in this site's own index.html or a short academic-explorer-config.js
  here) controlling which labels and readouts this site foregrounds.
- No localStorage/sessionStorage.
- Must be responsive to mobile, keyboard-accessible, visible focus states, and respect
  prefers-reduced-motion.

## Design system

Shared tokens (color, type, 860px column) come from `../resources/tokens.css`, see root
CLAUDE.md. This site's own register on top of those tokens:
- Keep it quiet. One memorable element (the hero figure and the explorer); everything
  else disciplined. Avoid the generated-page tells: no tracked-out all-caps eyebrows on
  every heading, no meta strings joined with middle dots, no em dashes anywhere (hard
  rule for this project), no "->" appended to links, no identical rounded cards with the
  same soft shadow everywhere.

## Page structure (order is fixed)

1. Hero: title, subtitle, one-sentence contribution, author line, primary button (Read the
   Working Paper), secondary buttons (Online Appendix, Slides). Hero exhibit: Figure 9,
   the rent decomposition.
2. The idea: the redevelopment margin, and what is new. Copy hews to the paper's intro
   paragraphs 2 and 3. Real options is only the mechanism inside a parcel's decision, not
   the framing.
3. Three findings, each with its figure:
   - Finding 1: instruments that deliver similar supply work through different margins
     (Fig 3; supporting Fig 7).
   - Finding 2: the replacement effect, more construction can raise average rents
     (Fig 9). Upzoning rent figure is +1.31%. Keep the "rents across the occupied stock,
     not quality-adjusted prices, not household-level" scope line.
   - Finding 3: mandates crowd out market-rate construction (Fig 6; supporting Fig 12).
4. The model in brief: decision rule, equilibrium, policy instruments, in prose.
5. Calibration and validation: 765,305 parcels; motivating permit facts; the named
   local-elasticity result (citywide -0.66 from demand theory, local -0.01 from a
   Callaway-Sant'Anna event study, Fig 4); the two validation checks (0.89 value
   correlation; 211,521 predicted vs 199,992 actual construction; Fig 5).
6. Interactive policy explorer (see below).
7. Scope and boundary conditions: mature vs expanding cities; least-utilized targeting is
   the internal check; only a closed-city elasticity flips the sign. Optional Fig 10.
8. Resources: Working Paper, Online Appendix, Slides (label "Purdue, [month]" once dated),
   BibTeX copy block. One line: "Data and replication code will be posted upon
   publication." Cross-links to policy and developer sites.
9. Authors and dissemination: affiliations, venues (Purdue upcoming), NOPV data credit to
   NYU Furman Center (Rohun Iyer), contact.

Exact copy for every section is in content-draft.md (this folder). Use it verbatim unless
it reads awkwardly in place, and flag any change.

## Interactive policy explorer

Centerpiece interactive, reused across all three sites later, so build it as a
self-contained module with a small config object at the top (labels, which readout leads).
This site's wrapper: percentages foregrounded, plus the supply-neutral contour if data
allows.

Design (two-slice, the safe assumption pending confirmation):
- Mode toggle: Density Incentive Zoning (mandate + density bonus) | Fiscal Incentive
  Zoning (mandate + tax exemption).
- Two sliders per mode: DIZ = alpha (affordable share) + phi (density bonus); FIZ = alpha
  + tau (tax-exemption years). Sliders clamp to the simulated support; bilinear
  interpolation inside the grid, never extrapolate past the edges.
- Readouts: net new units split into affordable and market-rate; average expected rent
  change (% vs baseline). Show absolute levels beside percentages using baseline levels.
- If the grid carries value and tax-revenue columns: add a "who pays" split (landowner vs
  public). If not, link that panel to the static Figure 12 numbers.

DATA IS PENDING. Max is sending a CSV exported from the simulation grid. Until it arrives:
- Build the full UI and interpolation engine now, in `../resources/explorer/`.
- Read data from `../resources/explorer/grid-diz.csv` and, if separate,
  `../resources/explorer/grid-fiz.csv`. Ship a small clearly-labeled PLACEHOLDER grid so
  the UI is interactive for coauthor review, and put a visible banner on the explorer:
  "Illustrative data, pending final simulation grid."
- When the real CSV lands, it drops into `../resources/explorer/` and replaces the
  placeholder with no code change if it matches the contract, and the fix is
  automatically live on all three sites once each embeds the shared module.

Data contract (one row per policy point, header row, values noted as level or % vs
baseline):
- DIZ file columns: alpha, phi, d_units_net, d_units_affordable, d_units_market,
  d_rent_pct [, d_pv_pct, d_tax_pct].
- FIZ file columns: alpha, tau, d_units_net, d_units_affordable, d_units_market,
  d_rent_pct [, d_pv_pct, d_tax_pct].
- A small baseline record: baseline_net_units, baseline_rent_per_unit.
- Ranges and step per instrument (so sliders match the computed support).
- Open question that changes only this module: is the grid a full 3-D cube (alpha x phi x
  tau) or two 2-D slices? If a cube arrives, add a third "Combined" mode with three
  sliders as a fast-follow. The two-mode design ships either way.

Anchor points for the placeholder surface (real, from the draft), so it behaves
believably: baseline (alpha=0, phi=0, tau=0) = 0 net, 0% rent. Upzoning (phi=0.5, alpha=0)
= +55,008 net, +1.31% rent. Tax exemption (tau=20, alpha=0) = +77,877 net, +1.21% rent.
30% mandate alone (alpha=0.3) = about +42,000 affordable and about -58,000 market-rate,
net about -16,000, rent slightly negative. Label clearly as illustrative.

## Figures

Final-draft numbering and the asset remap are in
`../resources/figure-and-content-audit.md`. Figure image files live in
`../resources/figures/`, named by final figure number, e.g.
`figure-09-rent-decomposition.png`. Key points for this build:
- Hero = Figure 9 (rent decomposition). The decomposition is now FOUR components
  (affordable-share, citywide supply, local supply, replacement). Do not reuse the old
  two-effect image from the live site as final. Placeholder OK for review; flag it.
- New figures needed, not on the live sites yet: Fig 1 (permits by unused density and
  age), Fig 2 (permits and rent dynamics), Fig 4 (local spillover event study), Fig 5
  (model validation). Use labeled placeholders in `../resources/figures/` until Daniel
  exports the real versions.
- Figures that map from existing assets can be referenced provisionally, but copy final
  exports into `../resources/figures/` locally rather than hotlink another repo, since
  developer/ and policy/ will need the same files later.
- Every figure needs a caption using the final-draft numbers.

## Pending items (do not block the build on these)

1. Max's CSV grid (explorer data) and whether it is 2-D slices or a 3-D cube.
2. Final figure exports for Fig 1, 2, 4, 5, and a re-exported Fig 9.
3. Slides link, live after the Purdue presentation.
4. Working Paper and Online Appendix PDF URLs, confirm final locations.

## First-pass goal

A deployable site the coauthors can open at a URL and interact with, including a working
(placeholder-data) explorer, with clearly flagged provisional figures and pending items.
Best foot forward, not final.
