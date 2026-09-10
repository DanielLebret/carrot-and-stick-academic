# Academic Site: Content Draft for Coauthor Review

Paper: "When Redevelopment Transforms the Housing Stock: Carrot & Stick Policy and the
Affordability Puzzle" (Lebret, Liu, Valentin, 2026).

Purpose of this site: the canonical, citable landing page for the field. Full
contribution, model in brief, calibration and validation, the interactive explorer, and
the resources rail (paper, appendix, slides). The policy and developer sites are spokes;
practitioners get direct links to them and are not routed through here. This page links
out to both spokes; each spoke carries a quiet link back here for readers who want the
full paper.

Audience: referees/editors, seminar and conference audiences, researchers who may cite
or extend. Register: restrained, findings-first, no persuasion-site language. Numbers are
from the final draft. Upzoning rent figure is +1.31% (Figure 9 / Section 6.2.1), decided.

Section order: Hero -> The idea (redevelopment margin, what is new) -> Three findings
(each with its figure) -> Model in brief -> Calibration and validation -> Interactive
policy explorer -> Scope and boundary conditions -> Resources -> Authors and dissemination.

Rationale note: the explorer sits AFTER the three static findings so the reader knows what
the axes mean before touching sliders. Everything above the explorer is stable regardless
of the grid's shape; only the explorer section depends on Max's CSV.

================================================================================
HERO
================================================================================

Eyebrow: CORNELL UNIVERSITY & ETH ZURICH

Title: When Redevelopment Transforms the Housing Stock

Subtitle: Carrot & Stick Policy and the Affordability Puzzle

One-sentence contribution:
A forward-looking spatial model in which housing supply emerges from parcel-level
redevelopment decisions, showing why policies that increase construction can raise
average rents, and who bears the cost of affordable-housing mandates.

Byline: Daniel Lebret (Cornell) . Crocker H. Liu (Cornell) . Maxence Valentin (ETH Zurich)
Date line: Working paper, 2026

Primary button: Read the Working Paper (PDF)
Secondary buttons: Online Appendix . Slides (label "Slides (Purdue, [month])" once dated)

Hero exhibit: Figure 9, Counterfactual Results, Expected Rents (the four-way
decomposition). This is the hero because it makes the counterintuitive result legible in
one look: the replacement effect (red) standing above the supply effect across policies.
Caption under the hero figure:
"Average expected rent change under each counterfactual, decomposed into the affordable-
share, citywide-supply, local-supply, and replacement effects. Policies that raise
construction raise average rents because the replacement effect dominates the supply
effect."

================================================================================
1. THE IDEA: THE REDEVELOPMENT MARGIN
================================================================================

Heading: Housing supply as the sum of redevelopment decisions

NOTE ON WORDING: this block hews closely to intro paragraphs 2 and 3, the punchiest
framing we have. Real options is treated as the mechanism inside each parcel's decision
(the option value of waiting), not as the paper's contribution. The contribution is the
reframing of supply itself: parcel-level redevelopment, in direct opposition to the
homogeneous aggregate supply of quantitative urban models.

Body, paragraph 1 (the puzzle, stated in data before the model):
In mature cities, new housing arrives almost entirely through redevelopment. In New York
City between 2023 and 2025, roughly two-thirds of private residential permits were filed
on parcels that already carried a building. New construction therefore means replacing
older, depreciated, lower-rent structures with newer, taller, higher-rent ones. The
supply that policy seeks to encourage is also the mechanism by which the cheapest units
disappear.

Body, paragraph 2 (the gap, close to intro para 2):
Quantitative urban models, the dominant tools for studying urban housing markets, are not
built to capture this. They resolve household and firm location choices finely but treat
housing supply through an aggregate elasticity, with no individual parcel choosing when
and how densely to redevelop. In that setting, housing created by expanding the stock
cannot be distinguished from housing created by replacing existing structures, so these
models do not explain why policies that stimulate construction simultaneously reduce the
stock of inexpensive housing. We address this gap by modeling housing supply as the
aggregation of parcel-level redevelopment decisions. We call these decisions the
redevelopment margin.

Body, paragraph 3 (the model, close to intro para 3):
In our model, developers decide whether, when, and how intensively to redevelop
individual parcels, including development on empty parcels, by comparing the value of
immediate redevelopment with the option value of waiting. The parcel-specific rent
process each developer takes as given must be consistent with the collective
redevelopment decisions of all developers. This fixed point defines a spatial equilibrium
in which the market clears through redevelopment, and the timing, intensity, and location
of redevelopment, and hence housing supply, emerge endogenously. Housing policies that
incentivize development (Carrots), such as density bonuses and tax exemptions, and
affordability mandates (Sticks), affect supply not by shifting an exogenous aggregate
supply curve but by changing individual redevelopment decisions. Because these decisions
are made parcel by parcel, policy changes not only the quantity of housing but also its
composition, because redeveloped units enter the stock without the depreciation carried
by the units they replace.

Callout: What is new (compressed statement of the distinct contributions, for the
scroll-stopper. Order = punchiness, not academic ordering.)
  - The reframing. Housing supply is not an aggregate curve that policy shifts. It is the
    sum of thousands of parcel-level redevelopment decisions, each a timed choice under
    uncertainty about whether a specific building is torn down, when, and how big its
    replacement is. That is the redevelopment margin, and the whole paper is built on it.
  - A model that does what neither existing approach can. Quantitative urban models
    resolve location finely but treat supply as a smooth aggregate; the city-growth
    literature models renewal coarsely, without an individual parcel making a timed,
    density decision under uncertainty. This framework does both, embedded in a spatial
    equilibrium where the citywide and local rent effects those decisions produce feed
    back into the rent process each developer is reacting to.
  - The counterintuitive result it makes visible. Because redevelopment replaces
    depreciated stock with new stock, more construction can raise average rents, not
    despite standard supply and demand but alongside it. See Finding 2.
  - Grounded in data, not assumed. The dominance of redevelopment is shown in NYC permit
    records before the model appears. See paragraph 1 and Calibration.

[Optional inline exhibit here: Figure 1 (permits by unused density and building age) as
visual support for paragraph 1. Optional because Figure 1 also anchors the calibration
section; use it in whichever section reads better and reference it in the other.]

================================================================================
2. THREE FINDINGS
================================================================================

Intro line:
The calibrated model delivers three central results.

--------------------------------------------------------------------------------
Finding 1: Instruments that deliver similar supply work through different margins
--------------------------------------------------------------------------------
Tax incentives and density bonuses can produce similar aggregate supply, but through
different channels. Tax exemptions act on the extensive margin: by raising post-
construction returns they lower the redevelopment threshold and pull projects forward,
accelerating redevelopment across a broad set of parcels. Density bonuses act on the
intensive margin: they raise the value of redevelopment by permitting height, but they
also raise the option value of waiting, so they can delay redevelopment on parcels near
their threshold even as they increase the size of projects that do proceed. Parcels near
their threshold (older, underbuilt) respond most to fiscal incentives; high-rent
locations respond most to density bonuses. Because parcels differ, uniform policy
produces heterogeneous effects across space.

Figure: Figure 3, Effects of Policy Instruments on Property Value and Development
Probability (panels for the mandate, the density bonus, and the tax exemption).
Supporting figure: Figure 7, Housing Production Heterogeneity (maps plus decile heatmaps),
showing tax exemptions concentrating in older, underbuilt areas and upzoning concentrating
in high-value ones.

--------------------------------------------------------------------------------
Finding 2: The replacement effect. More construction, higher average rents.
--------------------------------------------------------------------------------
Because production occurs through replacement, policies that raise construction shift both
the quantity and the composition of the stock. New units enter without the depreciation
carried by the units they replace, so average rents rise. We call this compositional shift
and its consequences for the rent distribution the replacement effect.

Within our calibration the replacement effect dominates the supply effect. Under upzoning,
average expected rent rises by about 1.31% over the model's 10-year projection horizon,
even as supply expands. Decomposed per unit,
replacement adds about $60 per month while additional supply subtracts about $25. The
result holds across the credible range of demand elasticities; only a closed-city
elasticity would let the supply effect win.

Important scope line (keep, it is the honest reading):
These are rents across the occupied stock, not quality-adjusted prices and not household-
level outcomes. Controlling for quality, prices fall as supply expands. The average rises
because redevelopment shifts the composition of the stock toward newer, higher-rent units,
not because any given tenant necessarily pays more.

Figure: Figure 9 (also the hero). If the hero already carries it, reference it here rather
than repeat, or show the square-foot robustness panel (Appendix D6) as the companion to
preempt the unit-normalization objection.

--------------------------------------------------------------------------------
Finding 3: Mandates produce affordable units mainly by crowding out market-rate ones
--------------------------------------------------------------------------------
Affordability mandates raise affordable production, but primarily by displacing market-
rate construction rather than by growing the stock. Over the model's 10-year projection
horizon, a 30% mandate yields roughly 42,000 affordable units while reducing market-rate
construction by about 58,000. Because
redevelopment under a mandate is only profitable where rents are already high, the new
affordable units expand the middle of the rent distribution and leave the bottom quintile
largely unchanged. Mandated units are also costly: holding total supply fixed, each
affordable unit substituted for a market-rate unit costs about $59,900 under density
incentive zoning and about $61,200 under fiscal incentive zoning. The incidence depends on
the paired instrument. Density bonuses split the burden roughly evenly between landowners
and the city; tax exemptions place almost all of it on the public sector.

Figure: Figure 6, Housing Production counterfactuals (affordable vs market-rate scatter);
only the combined incentive policy expands both. Supporting: Figure 12, Cost of Mandated
Affordable Housing (four panels).

================================================================================
3. THE MODEL IN BRIEF
================================================================================

Heading: The model in brief

Purpose: give a referee the mechanics without opening the PDF. Keep it to the decision
rule, the equilibrium, and the policy instruments. Prose with minimal notation; link to
the relevant paper sections.

Body:
Each developer holds a parcel with a current structure and an option to redevelop.
Redevelopment requires irreversible demolition and construction while future rents follow
a parcel-specific stochastic process, so the developer does not build the moment
redevelopment turns marginally profitable. Investment occurs only once expected rent
crosses a threshold that compensates for the value of waiting (Propositions 1 to 3). The
developer chooses both timing and density.

The three policy instruments enter this decision directly. A mandate (alpha) lowers post-
development rental income and raises the threshold. A density bonus (phi) raises the value
of building and the optimal density, but also the threshold. A tax exemption (tau) raises
post-construction returns and lowers the threshold.

Individual decisions aggregate to citywide supply, which feeds back into rents through two
estimated channels: a citywide supply effect that lowers rent growth everywhere, and a
local spillover that changes rents near new construction. The rent process each developer
faces must be consistent with everyone's decisions, and that fixed point is the spatial
equilibrium. Expected rental income at each horizon is then aggregated for policy
evaluation (Corollary 1).

Link row: Full model, Section 2 . Policy instruments, Section 3 . Calibration, Section 4.

================================================================================
4. CALIBRATION AND VALIDATION
================================================================================

Heading: Calibrated to New York City, validated out of sample

Body:
We calibrate the model to 765,305 New York City residential parcels using parcel-level
density and building age, rents from the American Community Survey, and neighborhood rent
dynamics from CoStar. Rental income falls with building age and rises with height.
Demolition costs exhibit increasing returns to scale and construction costs are convex in
height.

The empirical patterns that motivate the model are visible directly in the permit data.
Redevelopment concentrates on parcels with unused density and on older buildings: about
4.0% of parcels with more than 75% of their allowable density unused filed a permit, and
buildings over 100 years old redevelop at roughly 2.5 times the rate of those under 40,
renting for about 14% less. Development also tracks rents: a 10% higher rent per square
foot is associated with 7.1% more permitted units, and a one-point higher expected rent
growth with 39% more.

--------------------------------------------------------------------------------
Named result: separating the citywide and local effects of supply on rents
(featured on the landing page: this is a clean answer to an actively debated question)
--------------------------------------------------------------------------------
How new supply feeds back into rents runs through two distinct channels that the
literature has often conflated, and we separate them. The citywide channel governs how
aggregate supply moves rents everywhere; we derive it from household demand theory
(migration plus floorspace consumption) rather than borrow a reduced-form number, giving
an inverse demand elasticity of -0.66, robust across -0.91 to -0.43.

The local channel is the one under debate, because nearby construction pushes rents two
ways at once: new units compete with the incumbent stock and pull rents down, while they
can raise local amenities and pull rents up. The sign is therefore an empirical question,
and we estimate it directly. Using building-level rental income from NYC Notices of
Property Value and a staggered difference-in-differences event study (Callaway and
Sant'Anna, 2021), we compare buildings that experience a nearby completion of a 50-plus
unit building within 500 feet against otherwise similar buildings not yet exposed, so
identification comes from the timing of completion rather than proximity to redevelopment.
A completion raises the surrounding stock by about 10% (ATT 0.102, significant at 1%) and
holds it there, a large and durable local supply shock, yet rents do not respond
significantly at any horizon. The implied local elasticity is essentially zero (-0.01),
robust across radii, samples, and specifications. The near-zero is not a modeling
convenience: it reflects local competition and local amenity gains roughly offsetting.

Figure: Figure 4, Local effects of a nearby building completion on supply and rents
(Panel A: neighboring supply rises about 10%; Panel B: rents flat). This is the exhibit
for this result and should be shown here.

Two validation checks (own subsection, this is half the argument for referees):
The calibrated model reproduces cross-neighborhood property values with a correlation of
0.89 against CoStar transactions, and predicts out-of-sample construction: 211,521 net new
units citywide against 199,992 actually built between 2016 and 2025, matching the cross-
sectional distribution across community districts.

Figures: Figure 1 and Figure 2 (motivating patterns) if not used above; Figure 5, Model
Validation (values in Panel A, construction in Panel B). Figure 5 is the credibility
anchor and should be shown here.

================================================================================
5. INTERACTIVE POLICY EXPLORER  [depends on Max's CSV]
================================================================================

Heading: Explore the policy space

Framing line (academic register):
Move the instruments and see how the model's outcomes respond across the policy space. The
tool reads the same simulation grid behind the counterfactuals; the printed figures are
points on these surfaces.

DESIGN (built to the two-slice assumption; widen to 3-D if Max's file is a full cube):

Mode toggle: Density Incentive Zoning (mandate + density bonus) | Fiscal Incentive Zoning
(mandate + tax exemption). Two live sliders per mode:
  - DIZ: alpha (affordable share) and phi (density bonus)
  - FIZ: alpha (affordable share) and tau (tax-exemption years)
Slider ranges clamp to the support Max actually simulated; interpolate (bilinear) only
inside the grid, never extrapolate past the edges.

Readouts at each policy point:
  - Net new units, split into affordable and market-rate (the headline payoff: raise the
    mandate and watch market-rate fall while affordable rises and the net contracts; add
    the incentive and watch it recover)
  - Average expected rent change (% vs baseline)
  - If the grid carries value and tax-revenue changes: the "who pays" split (landowner vs
    public share). If not, this panel links to the static Figure 12 numbers instead.
Show absolute levels beside percentages using the baseline levels from the CSV.

Nice-to-have if the data supports it: overlay the supply-neutral contour (net units =
baseline, the dotted line in Figure 11) so the "hold supply fixed" experiment is visible.

Optional companion (cheap, 1-D): a single mandate slider along the supply-neutral locus
animating cost per affordable unit, public-cost share, and bottom-quintile share, for
density vs fiscal (the Figure 12 series). Ship if the second CSV is easy; otherwise defer.

Build note: one self-contained module (HTML/CSS/JS + the JSON/CSV grids), embedded
byte-identical in all three sites, with a small config object at the top controlling
labels and which readout leads. Academic wrapper: percentages and the supply-neutral
contour foregrounded. Practitioner wrappers: plainer labels and the who-pays readout
foregrounded. Same engine, three wrappers.

STATUS: awaiting Max's CSV. Open question that changes only this section: is the grid a
full 3-D cube (alpha x phi x tau) or two 2-D slices? If a cube, add a third "Combined"
mode with three sliders as a fast-follow; the two-mode design above ships either way.

================================================================================
6. SCOPE AND BOUNDARY CONDITIONS
================================================================================

Heading: When the replacement effect dominates

Body (preempts the obvious referee objection, signals honesty):
The replacement effect is a feature of mature housing markets, where new construction
requires demolishing existing structures. It weakens where development occurs on vacant or
underused land, because there is little lower-rent stock to replace. In the model,
targeting the least-utilized parcels produces the smallest rent increase of any scenario,
the cleanest internal check on the mechanism. The effect also weakens when housing demand
is more elastic, though across the empirically credible range the replacement effect still
dominates; only a closed-city elasticity of about -1.43 flips the sign. And because
redevelopment and rents are jointly determined, the parameter regions that would deliver a
dominant supply effect are the same ones that weaken redevelopment, so no region lets
developers build without regard to the rents their construction will support. The result
is a statement about redevelopment-driven markets, not about every city.

Figure (optional): Figure 10, Citywide Demand Elasticity and Average Expected Rents.

================================================================================
7. RESOURCES
================================================================================

Heading: Paper and materials

- Working Paper (PDF), primary
- Online Appendix (PDF)
- Slides, "Purdue, [month]" once presented (~2-3 weeks out)
- BibTeX, copy-to-clipboard block

One quiet line, standard for a working-paper site:
"Data and replication code will be posted upon publication."
(Recommended over a greyed-out button; reads as normal practice rather than unfinished.)

Cross-links: "For policy audiences" -> policy site . "For development professionals" ->
developer site.

BibTeX (fill in once you settle year/institution series):
@techreport{LebretLiuValentin2026,
  author = {Lebret, Daniel and Liu, Crocker H. and Valentin, Maxence},
  title  = {When Redevelopment Transforms the Housing Stock: Carrot \& Stick Policy and
            the Affordability Puzzle},
  year   = {2026},
  type   = {Working Paper}
}

================================================================================
8. AUTHORS AND DISSEMINATION
================================================================================

- Authors with affiliations and links: Daniel Lebret (Cornell), Crocker H. Liu (Cornell),
  Maxence Valentin (ETH Zurich).
- Presented at / forthcoming: list venues (Purdue upcoming; plus the workshops and
  seminars from the acknowledgments if you want the credibility signal). For the field
  this is a signal, not vanity, but keep it a plain list.
- Acknowledgments and data credit: NYU Furman Center (Rohun Iyer) for the NOPV data.
- Contact: corresponding author email.

Footer: title, authors, Cornell/ETH, 2026, working paper under review.

================================================================================
OPEN DECISIONS
================================================================================
Resolved: hero = Figure 9 (rent decomposition); upzoning rent = 1.31%; "what is new"
hews to intro paras 2-3, real options demoted to mechanism; local-elasticity result
featured on the landing page inside Calibration as a named result.

Still open:
1. Figure 1 placement: in "The idea" as motivation, or in "Calibration"? (Currently
   suggested for calibration, referenced in the idea section.)
2. Local-elasticity result: does the placement inside Calibration give it enough
   prominence, or should it be pulled up into its own top-level beat given the debate?
   (My lean: named result inside Calibration is right; a fourth top-level section would
   over-weight it relative to the three headline findings.)
3. Dissemination list: full venue list from acknowledgments, or Purdue only for now?
4. "Data and replication upon publication" line: include, or say nothing until ready?
5. Explorer companion (1-D incidence slider): in v1 or fast-follow?
6. Finding 2 companion/robustness panel: show the square-foot version (D6) alongside, or
   leave single?
