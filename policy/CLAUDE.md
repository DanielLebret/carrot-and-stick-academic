# CLAUDE.md, policy/ (Carrot & Stick policy site)

Context for building the policy-audience site for "When Redevelopment Transforms the
Housing Stock: Carrot & Stick Policy and the Affordability Puzzle" (Lebret, Liu,
Valentin, 2026). Read `../CLAUDE.md` first (root, cross-site rules and the shared
resources/ folder), then this file. The full section-by-section copy lives in
`content-draft.md`, in this same folder.

## Who this site is for, and how that changes the build

Planners, housing directors, commissioners, policy staff. NOT the academic audience.
Concretely this means:

- No literature positioning, no "quantitative urban models" framing, no naming of
  academic traditions. State results, not the paper's place in a field.
- No model-in-brief / decision-rule-in-prose section. A planner does not need the
  option-value mechanics; they need "what happens if we do X."
- No calibration/validation section as its own beat. Credibility here comes from
  concrete numbers and the interactive tool, not from a correlation coefficient.
- The explorer and incidence widget are the centerpiece, not a supporting feature.
  Foreground them earlier in the page than the academic site does.
- Register: direct, concrete, "here is what this costs and who pays," never hedged
  academic caveating. Still factual and evidence-based, just not written for a referee.

## What's reused vs. what's new here

Reused, do not rebuild:
- `../resources/tokens.css`, `../resources/base.css` (design system, chrome, buttons,
  figure-placeholder pattern). Same import order as academic: tokens.css then base.css
  then this site's own styles.css.
- `../resources/explorer/` — the same engine (explorer.js/css, grid-diz.csv,
  grid-fiz.csv, incidence-diz.csv, incidence-fiz.csv). This is REAL data (Max's grid),
  not placeholder, already verified against the paper's own reported anchors. Embed it
  with policy-appropriate framing: plainer labels, the "who pays" / public-share readout
  foregrounded over the percentage/supply-neutral-contour framing academic uses. Do not
  fork the engine; extend its config object for this site's labels only.
- Most figures already exist in `../resources/figures/` from the academic build: Figures
  1a/1b, 2a/2b, 3a/3b/3c, 4a/4b, 5a/5b, 6, 9, 10, 12a/12b/12c/12d. Reference them
  directly, no re-export needed.

New for this site:
- Figure 7 (Housing Production Heterogeneity), two files, NEW for this site (academic
  site does not use Figure 7): `figure-07a-upzoning.png` (Panel A, map and heatmap
  combined in one image), `figure-07b-tax-exemption.png` (Panel B, map and heatmap
  combined in one image). Pending upload as of this writing; use the standard
  figure-placeholder pattern from base.css if not yet present in
  `../resources/figures/`.
- Figure D5 (targeted parcels by criterion), `figure-d5-targeted-parcels.png`, supports
  the "Where to Target" section. NOT YET READY — Daniel has flagged this needs a fresh
  export to match the corrected three-group targeting numbers. Use a labeled placeholder
  ("Figure D5, targeted parcels map, pending export") until the real file lands.

## Page structure (order matters, differs from academic)

1. Hero: title, subhead pitched at planners, byline, Working Paper + Appendix links
   (same PDF, same page=61 appendix jump, reuse from academic's resources/papers/).
2. The Puzzle (with the same motivating facts as academic — Figs 1, 2 — the permit-data
   opening works for any audience, keep it).
3. The Mechanism (the replacement effect, Fig 9). Keep concrete and short. Do NOT add
   the "why existing models miss this" / QUM section — deliberately cut for this
   audience from the very start of this project.
4. Carrots: tax exemptions vs. density bonuses (Fig 3 a/b/c, Fig 7a/7b spatial maps).
5. Sticks: what mandates actually deliver (Fig 6).
6. **Designing the mandate: three choices that matter** — a dedicated section, not a
   footnote, grouping the three levers that determine whether a mandate actually works:
   (a) affordability depth (how deep the discount runs), (b) mandatory vs. voluntary
   participation, (c) the renovation escape hatch (paper's Appendix E). Fig 8a/8b
   supports (a) and (b) jointly; Fig E1 supports (c). This groups every "how mandate
   design actually plays out" finding in one place before the reader reaches the
   explorer, so they carry all three considerations into it.
7. **Explore the policy space** — the shared explorer, policy-framed.
8. The Cost: who pays (Fig 12 panels, plus the **incidence widget** reused from
   academic — "Explore the incidence" — same real data, policy framing).
9. Where to Target: the rebuilt Table D2 targeting table (see content-draft.md for the
   exact numbers, already verified against Max's raw CSV), Fig D5.
10. Policy implications (three takeaways).
11. Footer: authors, PDF links, cross-link to academic site ("full paper and technical
    appendix") and to developer site once built.

Do not include: model-in-brief, calibration/validation, scope/boundary-conditions
(mature vs. expanding cities), authors/dissemination venue list. Those are academic-site
content. If a planner wants that depth, the footer cross-link to the academic site
covers it.

## Numbers, already resolved, use these directly

- Upzoning rent effect: 1.31% (confirmed correct in the published draft, not 1.58%; no
  inference-check flag needed, this was an old open item, now closed).
- Cost per mandated affordable unit: $59,900 (density incentive zoning), $61,200
  (fiscal incentive zoning) — from the paper's Finding 3 text, matches Max's real
  incidence data closely at the relevant alpha.
- Public-cost share (from Max's real incidence-diz.csv / incidence-fiz.csv, use these
  over the old draft's rough "~50% vs ~95%"): density ≈46% public / ≈54% landowner;
  fiscal ≈89-91% public. Use "about 46%" and "about 90%" rather than false precision.
- Targeting table (Table D2, all four rows independently verified against Max's raw
  CSV for the "all parcels" row; the three 20%-subset rows are from the paper's own
  Table D2 and were not affected by the abstract's typo fix):

| Target group          | Upzoning: net units / rent | Tax exemption: net units / rent |
|------------------------|-----------------------------|-----------------------------------|
| All parcels            | +55,008 / +1.31%            | +77,877 / +1.21%                  |
| Most valuable (20%)    | +38,159 / +1.19%            | +40,341 / +1.28%                  |
| Most obsolete (20%)    | +16,918 / +0.59%            | +22,501 / +0.66%                  |
| Least utilized (20%)   | +27,490 / +0.23%            | +60,827 / +0.28%                  |

This REPLACES the live site's current invented three-bundle table (High-Demand /
High-Obsolescence / High-Unused-Capacity × Density Incentive / Fiscal Incentive / All
Policies with numbers like +31,430 units) — those numbers do not match the paper and
must not be carried over.

## Analytics

Same Umami property as academic (`data-website-id="394d1bdc-4a93-44ba-962a-d291e82db58c"`),
same script tag in `<head>`. Prefix all custom events `policy_` (matching academic's
`academic_` convention), e.g. `policy_download_working_paper`,
`policy_view_explorer`, `policy_explorer_interaction`. Section-view events should match
this site's actual section list (see Page Structure above), not academic's.

## Pending items (do not block the build on these)

1. Figures 7, D5, D7, E1 — all READY, confirmed live on the site
   (figure-07a-upzoning.png, figure-07b-tax-exemption.png,
   figure-d5-targeted-parcels.png, figure-d7-unit-size-trend.png,
   figure-e1-renovation-probability.png).
2. Developer site cross-link — points to the old standalone developer site for now
   (https://daniellebret.github.io/carrot-and-stick-developer) until it's rebuilt in
   this repo's developer/ folder.
3. Once Max's 3D grid (joint alpha/phi/tau) lands, a "Combined" explorer mode is planned
   for the ACADEMIC site only (wireframe-cube slice locator + real 2D heatmap), not this
   site. Do not build anything for that here.
4. Section 5 ("Designing the mandate: three choices that matter") is a NEW section this
   session, restructured from a single "renovation" aside under Sticks into a full
   section with three subsections: 5a depth, 5b mandatory/voluntary, 5c renovation.
   New figures needed: `figure-08a-affordability-levels-total.png` and
   `figure-08b-affordability-levels-affordable.png` (Figure 8 from the paper,
   supporting 5a and 5b jointly). Not blocking — both subsections read fine as
   text-plus-numbers alone if these aren't placed yet.
5. Deliberately excluded from this site: a borough-level unit-size breakdown chart
   (real data, but not something the paper explains or tests, and using it risked an
   unsupported claim). Do not add it if it surfaces later.

## First-pass goal

A deployable policy-site page the coauthors can review, reusing the explorer/incidence
widget with real data from day one (no placeholder banner needed, unlike academic's
early builds), correct current numbers throughout, the rebuilt targeting table, and a
dedicated section covering all three levers that determine whether a mandate actually
produces the affordable units it's meant to.
