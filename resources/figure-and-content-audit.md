# Carrot & Stick Websites: Content Update Spec (Final Draft, Sept 2, 2026)

Working reference for the VS Code update of both sites. Sources: the two live sites
plus the final draft "When Redevelopment Transforms the Housing Stock: Carrot & Stick
Policy and the Affordability Puzzle" (Lebret, Liu, Valentin).

Paper structure this maps to: S1 Motivating Facts, S2 Model (2.1 developer rule, 2.2
market clearing, 2.3 rental income), S3 Parcel-level policy effects, S4 Quantification,
S5 Baseline + Validation, S6 Counterfactuals, S7 Incidence + cost of mandated units,
S8 When the replacement effect dominates, S9 Conclusion.

---

## PART 1. WHAT CHANGED IN THE PAPER (the reframe)

1. New title and new lead concept: the **redevelopment margin**. Housing supply in
   mature cities is the aggregation of parcel-level redevelop decisions, not movement
   along an aggregate supply curve. Both sites should lead with this.

2. Explicit positioning against quantitative urban models (QUMs). QUMs resolve
   household/firm location finely but treat supply through one aggregate elasticity,
   so they cannot separate housing created by expansion from housing created by
   replacement. That gap is the paper's contribution. Good for a one-line "why this
   is new" on both sites.

3. New empirical Section 1 (Motivating Facts) with Figures 1 and 2. This is the
   "section zero" the discussants asked for. Add it as a new early section on both
   sites (see architecture).

4. Spatial equilibrium / market clearing is now explicit (S2.2): the rent process each
   developer takes as given is itself the equilibrium outcome of the redevelopment the
   policy induces (a fixed point). This answers the Berkeley demand-side-clearing point.

5. Section 8 gives the boundary condition: the replacement effect is strongest in
   mature cities (new build requires demolition) and weak in expanding cities (vacant
   land). This is the honest "when does our result hold" section and is worth a short
   block on both sites.

---

## PART 2. STALE CONTENT AUDIT (fix or remove)

### Numbers that are now wrong

- Replacement vs supply, per unit per month: sites/dev say $90 vs $25. Final draft:
  approximately **$60** (replacement) vs approximately **$25** ($24 in the abstract),
  under upzoning. Fix the dev-site "$90 / $25" line.
- Cost per mandated affordable unit: policy site says ~$65,000; dev site says ~$60,000
  (density) / ~$64,000 (fiscal). Final draft: **$59,900** under density incentive
  zoning, **$61,200** under fiscal incentive zoning. The density/fiscal gap is now
  small ($1,300), not ~$4,000. Round headline: "about $60,000 per affordable unit."
- Cost split still holds: density ~50/50 (~$30k landowner via capitalization, ~$30k
  public via foregone tax); fiscal up to ~90% public. Keep, but re-anchor to the new
  per-unit numbers.
- Voluntary adoption (dev site): 46% / 46% / 74%. Final draft (Table D1): about
  **45%** density, about **45%** fiscal, **72.1%** combined. Also usable: about 12% of
  adopters differ across the two single-instrument bundles; 26.7% switch from
  non-adoption to adoption once fiscal is added to density.
- Parcel count: sites say 765,000. Exact in final draft is **765,305**. Either is fine;
  pick one and use it consistently.

### Sections that no longer match the draft

- **Targeting tables (both sites).** The current three-group x three-bundle tables
  (High-Demand / High-Obsolescence / High-Unused-Capacity, with Density Incentive,
  Fiscal Incentive, All Policies, showing +31,430, +120,729, etc.) do not appear in the
  final draft. The final targeted exercise (Appendix D.3, Table D2) reports only two
  unilateral policies, upzoning and tax exemption, applied to three targeted subsets,
  with these results (10-year, vs baseline):
    - Upzoning, all parcels: supply +1.37% (sq ft), net units +55,008, rent +1.31%.
    - Upzoning, most expensive: +0.87%, +38,159 units, rent +1.19%.
    - Upzoning, most obsolete: +0.38%, +16,918 units, rent +0.59%.
    - Upzoning, least utilized: +0.72%, +27,490 units, rent +0.23%.
    - Tax exemption, all parcels: +1.92%, +77,877 units, rent +1.21%.
    - Tax exemption, most expensive: +0.86%, +40,341 units, rent +1.28%.
    - Tax exemption, most obsolete: +0.52%, +22,501 units, rent +0.66%.
    - Tax exemption, least utilized: +1.51%, +60,827 units, rent +0.28%.
  Key takeaways that survive: density bonuses deliver most where land is valuable
  (upzoning gets 63% of citywide floor-space when targeted at the top 20% by value);
  tax exemptions deliver most on underbuilt parcels (79% of citywide production when
  targeted at least-utilized parcels); targeting least-utilized parcels produces the
  smallest rent rise, the paper's cleanest internal check on the replacement effect,
  because vacant-ish lots expand rather than replace. REBUILD both targeting sections
  around Table D2. Drop the invented three-bundle tables.

- **Renovation (dev site Section 06).** Now Appendix E, a model extension, not a
  headline result. In the final draft renovation is preferred on many parcels but has
  limited aggregate effect because those parcels were unlikely to redevelop anyway;
  total net production is roughly unchanged. The specific 75% / 85% / 95% capacity
  thresholds and the "30% mandate raises renovation share by ~8pp" claim are not in the
  final text. RECOMMEND: demote renovation to a short "model extension" aside, or cut
  the section. Do not present the old thresholds as findings without re-deriving them.

### Fix the CTAs on both sites

Both sites still say "Working Paper (coming soon)" / "available on request" and have a
dead "Download Policy Brief" link. The draft is complete and submitted. Update the hero
button and footer to point at the actual PDF, and either wire up or remove the policy
brief button.

---

## PART 3. FIGURE MANIFEST

Final-draft figure numbering (use these labels on both sites):

- Fig 1  Residential Permits and Built Environment (A: unused density, B: building age)
- Fig 2  Residential Permits and Rent Dynamics (A: rent level, B: expected rent growth)
- Fig 3  Effects of Policy Instruments on Property Value and Development Probability
         (panels for alpha mandate, phi density, tau tax)
- Fig 4  Local effects of a nearby building completion on supply and rents
- Fig 5  Model Validation (A: value, B: construction activity)
- Fig 6  Policy Counterfactuals, Housing Production (affordable vs market-rate scatter)
- Fig 7  Policy Counterfactuals, Housing Production Heterogeneity (maps + decile heatmaps)
- Fig 8  Affordability Levels and Voluntary Policy Interventions (A: total, B: affordable)
- Fig 9  Counterfactual Results, Expected Rents (four-way decomposition, stacked bars)
- Fig 10 Citywide Demand Elasticity and Average Expected Rents
- Fig 11 Continuous Policy Outcomes, Density Incentive Zoning (A: units, B: rent heatmaps)
- Fig 12 Cost of Mandated Affordable Housing (A: incentives, B: cost/unit, C: public
         share, D: rent quintiles)

Tables: T1 Elasticities/Parameters; T2 Summary stats; T3 Baseline + robustness;
T4 Change in rent distribution; T5 Costs of interventions; D2 Targeted counterfactuals.

### Asset-file remap (what each existing image should become)

Existing files live under `/assets/figures/`. Map current file -> new label/use:

- `figure-1-policy-instruments1.png` (alpha)  -> Fig 3, affordable mandate panel
- `figure-1-policy-instruments2.png` (phi)    -> Fig 3, density bonus panel
- `figure-1-policy-instruments3.png` (tau)    -> Fig 3, tax exemption panel
- `figure-2-production-scatter.png`           -> Fig 6 (production scatter)
- `figure-3-rent-decomposition.png`           -> Fig 9 (rent decomposition). Update
                                                 caption: replacement ~$60 vs supply
                                                 ~$25, four components not two.
- `figure-4-spatial-maps1.png` (tax)          -> Fig 7, tax exemption map panel
- `figure-4-spatial-maps2.png` (upzoning)     -> Fig 7, upzoning map panel
- `figure-5-cost-per-unit1..4.png`            -> Fig 12 panels A-D
- `figure-6-unit-size-trend.png`              -> now Appendix D.7 (unit-size robustness);
                                                 keep only if you keep the size caveat.
- `figure-7-targeted-parcels.png`             -> maps to Fig D5 (targeted parcels).
- `figure-affordability-levelsA/B.png`        -> Fig 8 panels A/B
- `figure-c5-panel-a.png` (dev)               -> appendix (C); or replace with Fig 1B
- `figure-c4-panel-a.png` (dev)               -> appendix (C); or replace with Fig 7 map
- `figure-e1-renovation.png` (dev)            -> Appendix E; demote or cut

### New figures to export from the draft and add

- Fig 1 (built environment bars) and Fig 2 (rent-dynamics scatters): NEW, needed for the
  motivating-facts section on both sites. Highest priority new exports.
- Fig 5 (validation): NEW, strong credibility asset. Add "correlation 0.89 on values;
  predicted 211,521 vs 199,992 actual net units, 2016-2025" as caption support.
- Fig 4 (local spillover), Fig 10 (demand-elasticity robustness), Fig 11 (continuous
  DIZ heatmaps): optional depth; Fig 10 is a good honesty asset ("even at credible
  elasticities the result holds; only a closed-city elasticity of -1.43 flips it").

### Figure checklist to produce in VS Code

Priority 1 (must): Fig 1, Fig 2, Fig 5, updated caption on Fig 9, rebuilt targeting
around Table D2.
Priority 2 (should): Fig 7 relabel, Fig 6 relabel, Fig 12 relabel, Fig 8 relabel + new
adoption numbers.
Priority 3 (nice): Fig 4, Fig 10, Fig 11; demote Fig E1.

---

## PART 4. NEW SITE ARCHITECTURE

### Policy site (planners, housing directors)

0. Hero (new title, new subhead, live PDF button)
1. The Puzzle (production up, rents up) + NEW motivating facts (Fig 1, Fig 2)
2. The Mechanism: the replacement effect and the redevelopment margin (Fig 9)
3. Why existing models miss this (short QUM contrast) [NEW, optional but recommended]
4. Carrots: tax exemptions vs density bonuses (Fig 3, Fig 7)
5. Sticks: what mandates actually deliver (Fig 6, Fig 8)
6. The Cost: who pays per affordable unit (Fig 12)
7. Where to Target: rebuilt from Table D2 (Fig D5)
8. When this holds: mature vs expanding cities [NEW, short]
9. Policy implications (three takeaways)
10. Footer (authors, live PDF, contact)

### Developer site (real estate professionals)

0. Hero
1. Who redevelops and when (Fig 1, Fig 2 as the pipeline predictor; Fig 5 validation)
2. The Puzzle: more units, higher rents
3. The Mechanism: the replacement effect and your pro forma (Fig 9)
4. Carrots: what each instrument does to your deal (Fig 3, Fig 6, Fig 7)
5. Sticks: what a mandate costs your project (Fig 3 alpha panel, Fig 8, adoption %)
6. The Cost: who pays, and negotiating with the city (Fig 12)
7. Where to Target: rebuilt from Table D2
8. (Optional) Renovation as a model extension: short aside, not a headline
9. Implications (three takeaways)
10. Footer (with cross-link to policy site)

---

## PART 5. READY-TO-PASTE COPY

Style: straightforward, fact-focused, no em-dashes. Numbers are from the final draft.
Where a number carries an internal-consistency flag, it is marked [inference--check].

### ============ POLICY SITE ============

**HERO**

Eyebrow: CORNELL UNIVERSITY, HOUSING POLICY RESEARCH

Title: When Redevelopment Transforms the Housing Stock: Why Building More Does Not
Always Lower Rents in NYC

Subhead: New research on how housing incentives and affordability mandates work through
the redevelopment of existing buildings, what each policy costs, and who pays.

Byline: Daniel Lebret, Crocker H. Liu & Maxence Valentin, Cornell University & ETH
Zurich, 2026

Buttons: Read the Working Paper (live PDF) | Download Policy Brief (wire up or remove)

**01, THE PUZZLE (with motivating facts)**

Heading: Housing production is up. So are rents. Why?

New York City has added tens of thousands of units over the past decade, yet rents keep
climbing. The standard story, that more supply lowers prices, looks like it is failing.
It is not failing. It is incomplete.

In a mature city there is no empty margin to build on. Between 2023 and 2025, roughly
two-thirds of private residential permits were filed on parcels that already carried a
building. Only on Staten Island, where vacant land remains, does that share fall, to
about 34%. New housing in New York is mostly redevelopment: tearing down older,
depreciated stock and replacing it with newer, taller, higher-rent construction.

The parcels that redevelop are predictable. Buildings over 100 years old redevelop at
roughly 2.5 times the rate of buildings under 40, and they rent for about 14% less.
Parcels with unused zoning capacity redevelop far more often than those built to their
limit: about 4.0% of parcels with more than 75% of their allowable density unused filed
a permit. Rents pull development too. A 10% higher rent per square foot is associated
with 7.1% more permitted units, and a one point higher expected rent growth with 39%
more. Development follows old buildings, unused capacity, high rents, and expected rent
growth.

[Fig 1: Residential Permits and Built Environment]
[Fig 2: Residential Permits and Rent Dynamics]

**02, THE MECHANISM**

Heading: Replacement, not expansion: the redevelopment margin

When a developer tears down a rent-discounted walk-up and builds a new 12-story
building, what looks like a supply increase is also a composition shift. The new units
enter without accumulated depreciation, at higher rents than what they replaced. More
units, but higher average rents. We call this the replacement effect.

Housing supply here is not a curve that policy slides along. It is the sum of individual
parcel decisions about whether, when, and how intensively to redevelop. That is the
redevelopment margin, and it is what policy actually moves. Because each decision is
made parcel by parcel, policy changes not only how much housing exists but what kind.

Within our calibration, policies that raise construction raise average rents, because
the replacement effect dominates the downward pull of added supply. Under a
representative upzoning counterfactual, expected supply rises about 1.76% and average
rent rises about 1.58%. [inference--check: Figure 9 reports the upzoning rent rise as
1.31% and Section 6.2.3 as "roughly 1.5%"; confirm which figure the site should lead
with.] Per unit, replacement adds about $60 per month while added supply subtracts about
$25. The net is positive because the mix of the stock shifts toward newer, higher-rent
units.

This is not an argument against building. It sharpens the question from "build more or
less" to which parcels redevelop, when, at what density, and under what conditions.
Those are exactly the levers housing policy controls.

[Fig 9: Expected Rent Decomposition]

**03, WHY EXISTING MODELS MISS THIS (optional, short)**

Heading: Why standard models do not see the replacement effect

The dominant tools for studying urban housing, quantitative spatial models, resolve
where households and firms locate in fine detail but represent housing supply with a
single aggregate elasticity. In that setup, a unit added by expanding the stock looks
the same as a unit added by replacing an older building. The composition shift that
drives rents in a mature city is invisible by construction. Modeling supply as
parcel-level redevelopment decisions is what lets this framework separate the two.

**04, CARROTS**

Heading: Tax exemptions and density bonuses are not interchangeable

NYC's incentive toolkit has two main instruments: property tax exemptions (like the
former 421-a) and density bonuses (upzoning, higher allowable FAR). Both expand supply.
They do not work the same way.

Tax exemptions work on timing. By cutting post-construction tax liability, they make
redevelopment profitable sooner and pull forward projects that would otherwise sit on
the margin. The response is broad, concentrated in areas with older buildings and unused
density. Western Brooklyn and Queens respond most. The tradeoff is fiscal: the city
gives up tax revenue during the exemption window (aggregate tax revenue falls about
4.55% under a 20-year exemption).

Density bonuses work on scale. Allowing taller buildings raises the value of
redevelopment but also raises the value of waiting. A developer who can build 15 stories
instead of 10 may rationally hold off until rents justify the larger project. So density
bonuses can delay construction on parcels near the redevelopment threshold even as they
raise the size of projects that do get built. High-value locations gain most; some
marginal parcels see lower near-term redevelopment.

The two are not substitutes. Tax incentives act on the extensive margin (whether and
when a parcel redevelops); density bonuses act on the intensive margin (how big). A city
that uses only one leaves a lever untouched. Stacking both produces the largest supply
expansion.

[Fig 3: policy-instrument panels, tax and density]
[Fig 7: spatial heterogeneity maps and decile heatmaps]

Where each instrument concentrates development: tax exemptions produce a broad, diffuse
response across older neighborhoods citywide; upzoning concentrates in a narrower set of
high-value locations. Choosing between them is a choice about which neighborhoods
benefit, not only how much gets built.

**05, STICKS**

Heading: What affordability mandates actually deliver

Mandates, requirements that a share of new units rent below market, are the most direct
tool for producing affordable units and the most misunderstood.

What they do: they reallocate access to new construction. A 30% mandate produces roughly
42,000 affordable units that genuinely reach households otherwise priced out of new
buildings.

What they do not do: they do not expand the bottom of the rent distribution. Those same
42,000 affordable units come with about 58,000 fewer market-rate units, because a
mandate lowers the return to redevelopment and some marginal parcels no longer pencil
out. And because redevelopment with a mandate is only profitable where rents are already
high, mandated affordable units land in the middle of the distribution, not the bottom.
The share of units in the lowest rent quintile barely moves. The cheapest housing in NYC
keeps coming from the aging existing stock, not from mandated units in new buildings.

This is why mandates work best paired with incentives: the carrot offsets the
supply-dampening effect of the stick.

[Fig 6: Housing Production scatter. Only the combined policy expands both affordable and
market-rate units; standalone mandates fall below the 45-degree line.]
[Fig 8: Affordability levels and voluntary adoption]

**06, THE COST**

Heading: Who pays for each mandated affordable unit?

Below-market housing is not privately profitable, so a mandate opens a gap between
private return and public objective. Someone absorbs it. Holding total supply fixed,
each affordable unit substituted for a market-rate unit costs about $59,900 under
density incentive zoning and about $61,200 under fiscal incentive zoning. Call it about
$60,000 per unit. The instrument decides who pays.

Under tax exemptions paired with mandates, up to about 90% of the cost falls on the
public sector through foregone tax revenue. Landowners are largely held harmless.

Under density bonuses paired with mandates, the cost splits roughly evenly. Landowners
absorb about $30,000 per unit through lower land value; the public sector absorbs a
comparable amount.

Fiscal instruments are easier to pass because landowners support them, but they are
expensive for city budgets. Regulatory instruments protect public revenue but draw
stronger opposition from property owners. And across policies that expand supply, more
than 90% of parcels see their present value fall while a small set of redeveloping
parcels capture large gains, a distribution that maps directly onto the political
economy of these programs.

[Fig 12: panels A-D. Note Panel D: the bottom-quintile share never rises past about
20.06% even as mandated units climb.]

**07, WHERE TO TARGET (rebuilt from Table D2)**

Heading: Not all neighborhoods respond the same way

The same instrument produces very different outcomes depending on where it is applied.
We re-run the two unilateral incentives, upzoning and a 20-year tax exemption, on three
targeted subsets: the 20% of parcels with the highest rent potential, the 20% most
obsolete by age, and the 20% least utilized by FAR. These groups barely overlap
spatially: high-value parcels sit in Manhattan, western Brooklyn, and Queens; the most
obsolete in Brooklyn; the least utilized in the Bronx.

Two rules come out of it. Density bonuses deliver most where land is already valuable:
targeted at the top 20% by value, upzoning captures about 63% of citywide floor-space
production. Tax exemptions deliver most on underbuilt parcels: targeted at the least
utilized parcels, a tax exemption captures about 79% of citywide production. Match the
instrument to the parcel.

Targeting the least-utilized parcels also produces the smallest rent increase of any
scenario. That is the cleanest confirmation of the replacement effect: those parcels are
closer to vacant, so redevelopment there expands the stock rather than replacing it, and
the upward rent pressure that defines dense-city redevelopment is largely absent.

[Table D2 summarized. Suggested slimmed table for the site, upzoning vs tax exemption,
by target group: net new units and rent change.]

| Target group        | Upzoning: net units / rent | Tax exemption: net units / rent |
| ------------------- | -------------------------- | ------------------------------- |
| All parcels         | +55,008 / +1.31%           | +77,877 / +1.21%                |
| Most valuable (20%) | +38,159 / +1.19%           | +40,341 / +1.28%                |
| Most obsolete (20%) | +16,918 / +0.59%           | +22,501 / +0.66%                |
| Least utilized (20%)| +27,490 / +0.23%           | +60,827 / +0.28%                |

[Fig D5: targeted parcels by criterion]

**08, WHEN THIS HOLDS (new, short)**

Heading: Mature cities versus expanding cities

The replacement effect is strong where new construction requires demolishing existing
buildings, which is the defining feature of a mature city like New York. It weakens
where development happens on vacant or underused land, because there is little
lower-rent stock to replace. It also weakens when housing demand is more elastic, though
across the credible range of demand elasticities the replacement effect still dominates;
only a closed-city elasticity produces a net rent decline. This is the honest scope of
the result: it is a statement about redevelopment-driven housing markets, not about every
city.

**09, IMPLICATIONS**

01 Stack the tools. The largest gains in both market-rate and affordable units come from
combining tax exemptions, density bonuses, and mandates. Each acts on a different margin.

02 Design for the margin. Parcels near their threshold respond to tax incentives but
weakly to density bonuses; high-value parcels respond to density bonuses. Target the
right instrument at the right parcel.

03 Do not expect mandates to reach the lowest-rent households. Mandated units cluster in
new buildings on higher-value sites, above the bottom quintile. Reaching the lowest
incomes means preserving and improving the aging stock, not only mandating affordability
in new construction.

---

### ============ DEVELOPER SITE ============

**HERO**

Eyebrow: CORNELL UNIVERSITY, HOUSING POLICY RESEARCH

Title: What NYC Housing Policy Actually Does to Your Projects

Subhead: Findings from a forward-looking spatial model calibrated to 765,305 NYC
residential parcels, translated for development professionals.

Byline + buttons: as policy site, with live PDF and cross-link to the policy version.

**01, WHO REDEVELOPS AND WHEN**

Heading: The model predicts your pipeline, and it validates out of sample

Before asking what policy does, know which sites the model expects to redevelop. It is
calibrated to every residential parcel in NYC, and the highest-probability sites share
three traits: old buildings, significant unused density relative to the zoning envelope,
and strong rent potential. That profile is familiar to anyone sourcing sites here. A
1960s walk-up in Astoria at 30% of allowable FAR in a rising submarket is exactly what
the model flags. A recently renovated Bronx building already at its zoning limit is not.

The data behind this is direct. Between 2023 and 2025, about two-thirds of private
permits were on already-built parcels. Buildings over 100 years old redevelop at roughly
2.5 times the rate of those under 40. About 4.0% of parcels with more than 75% of their
allowable density unused pulled a permit. A 10% higher rent per square foot lines up with
7.1% more permitted units, and a one point higher expected rent growth with 39% more.

The model does not just rationalize this after the fact. It reproduces observed property
values across community districts with a correlation of 0.89, and predicts 211,521 net
new units citywide against 199,992 actually built from 2016 to 2025. If your pipeline
sits in outer-borough submarkets with aging, underbuilt stock, this is calibrated to
your deal flow.

[Fig 1, Fig 2 as pipeline predictors]
[Fig 5: model validation]

**02, THE PUZZLE**

Heading: More units, higher rents. Why that is not a contradiction.

NYC has added stock for a decade and rents keep rising. In a built-out city new supply
does not arrive on an empty margin. Every new building replaces something, usually older,
depreciated stock renting at a discount. Demolish a six-story walk-up for a 20-story
tower and you are not adding 14 stories of net new supply, you are removing discounted
units and replacing them with undepreciated units at full current rents.

The net effect on average rents depends on which force wins: downward pressure from more
units, or upward pressure from the shift toward higher-quality stock. In NYC, at
calibrated elasticities, the composition shift wins. Your new development is not competing
mainly with the building you demolished. It enters a market whose average rent is being
pulled up by the same redevelopment activity driving your project.

**03, THE MECHANISM**

Heading: The replacement effect and your pro forma

The replacement effect is the reason markets with heavy redevelopment tend to see
stronger rent growth than markets where stock turns over slowly. It runs through three
channels: your new building commands full market rent from day one rather than the
discounted rent of the structure it replaced; nearby new construction raises local
amenity value; and citywide supply exerts a smaller downward pull. Under upzoning, the
replacement channel adds about $60 per unit per month while the supply channel subtracts
about $25.

Practical implication: in markets where redevelopment is accelerating, your stabilized
rents are likely to outperform projections anchored to current comparables, because the
comparables themselves are being pulled upward by the same activity driving your project.

[Fig 9: Expected Rent Decomposition. Update the caption from "$90 vs $25" to "about $60
vs about $25," and from two effects to the four-way decomposition.]

**04, CARROTS**

Heading: Tax exemptions and density bonuses do different things to your deal

Tax exemptions work on your go/no-go threshold. Cutting post-construction tax liability
lets a project pencil at a lower stabilized rent and pulls forward marginal deals. The
response is broad, concentrated on older, underbuilt parcels.

Density bonuses work on your optimal scale, and may make you wait. A bonus raises the
value of the option by allowing a bigger building, but it also raises the rent threshold
that justifies building, because the larger project needs higher rents to cover convex
construction costs. If you are near your threshold today, a density bonus can rationally
push you to wait for rents that support the taller building.

Site-selection implication: in Western Brooklyn or Queens, older and underbuilt, tax
exemptions are the stronger tool. In high-value Manhattan-adjacent submarkets where rents
support height, density bonuses add more. Stacking both is the only policy that expands
affordable and market-rate units at once: the exemption pulls timing forward, the bonus
raises scale.

[Fig 3: policy-instrument panels]
[Fig 6: production counterfactuals. Only the combined policy lands in the
expand-both quadrant; all mandate-only policies fall below the 45-degree line.]
[Fig 7: spatial heterogeneity]

**05, STICKS**

Heading: What an affordability mandate costs your project

A mandate cuts net rental income by forcing a share of units below market, which raises
the rent level at which redevelopment is optimal. The bite is largest on high-demand
parcels, where the discount is a bigger absolute dollar amount, and on parcels near
their threshold.

What a mandate does not do: the units it produces do not reach the bottom of the
distribution. They appear in new buildings on higher-value parcels, because those are the
only deals that still pencil. At a moderate discount, your mandated units typically sit
above the median rent of the existing stock in lower-income neighborhoods. Citywide, a
30% mandate yields about 42,000 affordable units while cutting market-rate construction
by about 58,000.

The voluntary-adoption margin. If the incentive is voluntary, developers opt in only
when it raises parcel value. About 45% of parcels would opt into a voluntary density
incentive program and about 45% into a fiscal incentive program at moderate affordability
levels, with roughly 12% of adopters differing between the two. Combine both incentives
and adoption rises to about 72%, as about 27% of parcels switch in once the fiscal
incentive is added. As requirements deepen, single-instrument adoption collapses; only
the combined policy sustains participation.

[Fig 3, affordable-mandate panel]
[Fig 8: affordability levels, mandatory vs voluntary]

**06, THE COST**

Heading: Who pays per affordable unit, and how to read a term sheet

Every mandated affordable unit is a gap between private return and social objective, and
the instrument decides who absorbs it. Holding total supply fixed, each affordable unit
costs about $59,900 under density incentive zoning and about $61,200 under fiscal
incentive zoning.

Under tax exemptions paired with mandates, up to about 90% of the cost falls on the
public sector. From your seat this is the most favorable structure: the city carries the
affordability cost through its tax base, not through your land value.

Under density bonuses paired with mandates, the cost splits roughly evenly. Landowners
absorb about $30,000 per unit through lower land value; the public sector absorbs a
comparable amount.

Negotiating implication: the instrument matters as much as the mandate share. A 30%
mandate with a 20-year tax exemption is a different deal from a 30% mandate with a 50%
density bonus even if both produce the same affordable-unit count citywide. The first
concentrates cost on the city; the second shares it with landowners.

[Fig 12: panels A-D]

**07, WHERE TO TARGET (rebuilt from Table D2)**

Heading: Match your site-selection strategy to the instrument

Use the same two-instrument, three-target grid as the policy site (Table D2). For a
developer the read is: density bonuses pay off most on high-value parcels; tax exemptions
pay off most on underbuilt parcels; obsolete-only targeting produces limited output
across both. Include the slimmed upzoning-vs-tax table by target group.

[Table D2 slimmed, same as policy site]
[Fig D5]

**08, RENOVATION AS A MODEL EXTENSION (optional, demoted)**

Heading: Renovation versus redevelopment

The model can be extended to let developers renovate rather than rebuild (Appendix E).
Renovation is preferred on many parcels, but it has limited effect on aggregate supply
because those parcels were unlikely to redevelop in the first place, and total net
production is roughly unchanged. Treat renovation as an underwriting alternative on sites
already near their FAR limit, not as a driver of citywide supply. Do not republish the
prior 75/85/95% thresholds or the renovation-share claim without re-deriving them from
the final draft.

**09, IMPLICATIONS**

01 Stack the tools. The combined program is the only one that expands both market-rate
and affordable units. If you can participate in a combined program, the model says it
dominates any single-instrument program.

02 Match the instrument to the site. Tax exemptions on older, underbuilt outer-borough
sites near but below the threshold; density bonuses on high-demand sites where height
pays. A density bonus on a marginal, lower-demand site can delay a project that would
otherwise proceed.

03 Do not expect mandates to reach the lowest incomes. Your mandated units sit above the
bottom quintile, on higher-value sites. Bottom-of-market affordability comes from
preserving the aging stock, not from new construction.

---

## PART 6. OPEN DECISIONS FOR YOU

1. Upzoning headline: lead with 1.58% (abstract) or 1.31% (Fig 9)? Reconcile before
   publishing. [inference--check]
2. Keep the "why existing models miss this" QUM block on the policy site, or is it too
   inside-baseball for planners?
3. Developer site: demote renovation to the short aside above, or cut it entirely?
4. Policy brief: produce one and wire the button, or remove the button?
5. Parcel count wording: 765,305 exact, or 765,000 round, sitewide.
