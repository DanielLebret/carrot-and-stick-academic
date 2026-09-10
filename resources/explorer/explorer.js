/*
  Carrot & Stick interactive policy explorer.
  One engine, reused across the academic, developer, and policy sites. Do not fork
  this file per site; site-specific framing goes through the config object passed
  to CarrotStickExplorer.init().

  Data contract (see academic/CLAUDE.md and resources/explorer/grid-diz.csv,
  grid-fiz.csv):
    DIZ grid columns: alpha, phi, d_units_net, d_units_affordable, d_units_market,
      d_rent_pct
    FIZ grid columns: alpha, tau, d_units_net, d_units_affordable, d_units_market,
      d_rent_pct
  All d_* values are deltas versus the no-policy baseline (alpha=0, phi=0, tau=0),
  which is 0 net units and 0% rent change by construction.

  STATUS: real simulation output from Max, as of 2026-09-03, replacing the
  earlier illustrative placeholder grid. Alpha/phi/tau now natively cover the
  same 0-75%/0-100%/0-30yr range as the heatmap figures below (see
  ALPHA_UI_MAX etc.), so the slider caps and the interpolate() clamp are no
  longer masking any gap between the grid and the sliders; they're kept as
  defensive floors in case a future grid update is narrower again.

  Heatmap panels (top of the explorer, above the mode toggle): these are the
  real paper figures (11a/b for Density Incentive Zoning, D10a/b for Fiscal
  Incentive Zoning), read from config.figuresPath. Each is a static
  2400x1350 image with a marker overlaid at the current slider position via
  a fixed pixel calibration (HEATMAP_CONFIG / Y_CALIBRATION below),
  converted to percentages of image width/height so it tracks correctly
  regardless of the image's rendered size.
*/

(function (global) {
  "use strict";

  var IMG_WIDTH = 2400;
  var IMG_HEIGHT = 1350;

  // Shared y-axis (alpha, mandate share) calibration, identical across all
  // four heatmap images. alpha is a fraction (0.25 = 25%); the calibration
  // itself is expressed in percentage points because that's how the paper
  // labeled the axis. Linear, extrapolated beyond the alpha=60% anchor for
  // the slider's 75% max.
  var Y_CALIBRATION = { alpha0Pct: 0, y0: 1130, alpha1Pct: 60, y1: 289 };

  var ALPHA_UI_MAX = 0.75; // was 0.4 (placeholder grid's max); see explorer.js header comment
  var PHI_UI_MAX = 1.0;    // was 0.6
  var TAU_UI_MAX = 30;     // was 25

  // axisMax must be in the same unit as the slider value it pairs with
  // (phi is a 0-1 fraction, tau is already in years), so value/axisMax is a
  // plain 0-1 ratio regardless of which unit is in play.
  var HEATMAP_CONFIG = {
    diz: {
      axisMax: PHI_UI_MAX,
      units: { file: "figure-11a-explorer-phi-units.png", x0: 294, x1: 1930 },
      rent: { file: "figure-11b-explorer-phi-rent.png", x0: 292, x1: 1890 }
    },
    fiz: {
      axisMax: TAU_UI_MAX,
      units: { file: "figure-d10a-explorer-tau-units.png", x0: 294, x1: 1930 },
      rent: { file: "figure-d10b-explorer-tau-rent.png", x0: 292, x1: 1890 }
    }
  };

  function calibratedPixel(x0, x1, value, axisMax) {
    return x0 + (value / axisMax) * (x1 - x0);
  }

  function alphaToYPercent(alpha) {
    var alphaPct = alpha * 100;
    var t = (alphaPct - Y_CALIBRATION.alpha0Pct) / (Y_CALIBRATION.alpha1Pct - Y_CALIBRATION.alpha0Pct);
    var yPx = Y_CALIBRATION.y0 + t * (Y_CALIBRATION.y1 - Y_CALIBRATION.y0);
    return (yPx / IMG_HEIGHT) * 100;
  }

  function xValueToXPercent(x0, x1, value, axisMax) {
    var xPx = calibratedPixel(x0, x1, value, axisMax);
    return (xPx / IMG_WIDTH) * 100;
  }

  function parseCSV(text) {
    var lines = text.trim().split(/\r?\n/);
    var headers = lines[0].split(",").map(function (h) { return h.trim(); });
    return lines.slice(1).filter(Boolean).map(function (line) {
      var cells = line.split(",");
      var row = {};
      headers.forEach(function (h, i) {
        row[h] = parseFloat(cells[i]);
      });
      return row;
    });
  }

  function uniqueSorted(values) {
    var seen = {};
    var out = [];
    values.forEach(function (v) {
      var key = String(v);
      if (!seen[key]) {
        seen[key] = true;
        out.push(v);
      }
    });
    out.sort(function (a, b) { return a - b; });
    return out;
  }

  /*
    Builds a lookup grid keyed by rounded (a, b) coordinates plus the sorted axis
    values, so bilinear interpolation can find the four surrounding grid points for
    any (a, b) inside the simulated support.
  */
  function buildGrid(rows, aKey, bKey, valueKeys) {
    var aVals = uniqueSorted(rows.map(function (r) { return r[aKey]; }));
    var bVals = uniqueSorted(rows.map(function (r) { return r[bKey]; }));
    var lookup = {};
    rows.forEach(function (r) {
      lookup[r[aKey] + "|" + r[bKey]] = r;
    });
    return {
      aVals: aVals,
      bVals: bVals,
      aMin: aVals[0],
      aMax: aVals[aVals.length - 1],
      bMin: bVals[0],
      bMax: bVals[bVals.length - 1],
      valueKeys: valueKeys,
      get: function (a, b) {
        return lookup[a + "|" + b];
      }
    };
  }

  function neighborBounds(axisVals, x) {
    var lo = axisVals[0];
    var hi = axisVals[axisVals.length - 1];
    for (var i = 0; i < axisVals.length - 1; i++) {
      if (x >= axisVals[i] && x <= axisVals[i + 1]) {
        lo = axisVals[i];
        hi = axisVals[i + 1];
        break;
      }
    }
    return [lo, hi];
  }

  /* Bilinear interpolation, clamped to the grid's support (never extrapolates). */
  function interpolate(grid, a, b) {
    var ca = Math.min(Math.max(a, grid.aMin), grid.aMax);
    var cb = Math.min(Math.max(b, grid.bMin), grid.bMax);

    var aBounds = neighborBounds(grid.aVals, ca);
    var bBounds = neighborBounds(grid.bVals, cb);
    var a0 = aBounds[0], a1 = aBounds[1];
    var b0 = bBounds[0], b1 = bBounds[1];

    var q11 = grid.get(a0, b0);
    var q21 = grid.get(a1, b0);
    var q12 = grid.get(a0, b1);
    var q22 = grid.get(a1, b1);

    var tA = a1 === a0 ? 0 : (ca - a0) / (a1 - a0);
    var tB = b1 === b0 ? 0 : (cb - b0) / (b1 - b0);

    var result = {};
    grid.valueKeys.forEach(function (key) {
      var top = q11[key] + (q21[key] - q11[key]) * tA;
      var bottom = q12[key] + (q22[key] - q12[key]) * tA;
      result[key] = top + (bottom - top) * tB;
    });
    return result;
  }

  function fmtUnits(n) {
    var sign = n > 0 ? "+" : n < 0 ? "−" : "";
    return sign + Math.abs(Math.round(n)).toLocaleString("en-US");
  }

  function fmtPct(n) {
    var sign = n > 0 ? "+" : n < 0 ? "−" : "";
    return sign + Math.abs(n).toFixed(2) + "%";
  }

  function signClass(n) {
    if (n > 0) return "positive";
    if (n < 0) return "negative";
    return "";
  }

  var VALUE_KEYS = ["d_units_net", "d_units_affordable", "d_units_market", "d_rent_pct"];

  /*
    Housing production tradeoff scatter (below the controls/readouts grid),
    styled to match the static Figure 6 (resources/figures/figure-06-
    production-counterfactuals.png): a solid net-zero reference line with
    the "net decrease" region shaded below/left of it, labeled reference
    points as filled diamonds (numbered to match the paper's Table D3), and
    a live marker tracking the sliders.

    X = d_units_affordable, Y = d_units_market. The domain is fixed and
    shared across DIZ/FIZ (never rescales on mode switch), verified against
    both grids' extremes: DIZ affordable 0-139,654, market -115,128 to
    88,935; FIZ affordable 0-169,249, market -129,516 to 96,280.

    Deliberately no background point cloud (a full parameter sweep); this is
    a clean chart matching Figure 6's register rather than the 961-row grid.

    Reference-point coordinates are exact grid points (alpha, phi/tau) so
    grid.get() returns real rows, never an interpolated or invented value;
    if a future grid update removes one of these exact points, that
    reference point is silently skipped rather than approximated. All five
    grid-derived points below are verified exact matches against the paper's
    Table D3 (dist=0.0 in all cases).
  */
  var SCATTER_DOMAIN_X = { min: -5000, max: 175000 };   // d_units_affordable
  var SCATTER_DOMAIN_Y = { min: -135000, max: 100000 }; // d_units_market

  // Margins reserve room for axis titles and tick labels around the plot
  // area. The plot area's own width:height ratio is fixed at 2.04:1,
  // matching Figure 6's own proportions, not derived from the data domain's
  // range ratio (235,000 tall vs 180,000 wide) the way the previous build
  // did; Figure 6 itself doesn't preserve true geometric angles either, so
  // the net-zero diagonal here is stretched the same way Figure 6's is.
  var SCATTER_MARGIN = { left: 70, right: 20, top: 20, bottom: 55 };
  var SCATTER_PLOT_WIDTH = 700;
  var SCATTER_PLOT_HEIGHT = 343; // 700 / 343 = 2.04

  var SCATTER_VIEWBOX = {
    width: SCATTER_PLOT_WIDTH + SCATTER_MARGIN.left + SCATTER_MARGIN.right,
    height: SCATTER_PLOT_HEIGHT + SCATTER_MARGIN.top + SCATTER_MARGIN.bottom
  };

  var SCATTER_PLOT = {
    left: SCATTER_MARGIN.left,
    right: SCATTER_MARGIN.left + SCATTER_PLOT_WIDTH,
    top: SCATTER_MARGIN.top,
    bottom: SCATTER_MARGIN.top + SCATTER_PLOT_HEIGHT
  };

  // (1) and (2) are single-instrument points that only exist on their own
  // grid (phi belongs to DIZ, tau to FIZ); (3) is identical on both grids
  // (phi=0/tau=0 is the same underlying no-incentive-instrument scenario);
  // (4)/(5) are the paper's named DIZ/FIZ scenarios, replacing the
  // previous build's arbitrary alpha=0.2 "Combined policy" point. (6) All
  // Policies is added separately below as a static, mode-independent point
  // (see buildScatterAllPoliciesMarkup), since it isn't on either 2-D grid.
  var SCATTER_REF_POINTS = {
    diz: [
      { label: "(1) Upzoning", a: 0.0, b: 0.5 },
      { label: "(3) Affordability mandate", a: 0.3, b: 0.0 },
      { label: "(4) Density Incentive Zoning", a: 0.3, b: 0.5 }
    ],
    fiz: [
      { label: "(2) Tax exemption", a: 0.0, b: 20.0 },
      { label: "(3) Affordability mandate", a: 0.3, b: 0.0 },
      { label: "(5) Fiscal Incentive Zoning", a: 0.3, b: 20.0 }
    ]
  };

  // Table D3's reported "All Policies" scenario: net=152,897,
  // affordable=121,681, so market = 152,897 - 121,681 = 31,216. Not on
  // either 2-D grid (it requires all three instruments at once), so this is
  // a static point plotted from the paper's reported value directly, not a
  // grid.get() lookup, and it doesn't change with the mode toggle.
  var SCATTER_ALL_POLICIES_POINT = { label: "(6) All Policies", affordable: 121681, market: 31216 };

  function scatterXPixel(value) {
    var d = SCATTER_DOMAIN_X;
    var t = (value - d.min) / (d.max - d.min);
    return SCATTER_PLOT.left + t * SCATTER_PLOT_WIDTH;
  }

  function scatterYPixel(value) {
    var d = SCATTER_DOMAIN_Y;
    var t = (value - d.min) / (d.max - d.min);
    return SCATTER_PLOT.top + (1 - t) * SCATTER_PLOT_HEIGHT;
  }

  function diamondPoints(cx, cy, r) {
    return cx + "," + (cy - r) + " " + (cx + r) + "," + cy + " " +
      cx + "," + (cy + r) + " " + (cx - r) + "," + cy;
  }

  // Ticks at every multiple of `step` inside the domain, e.g. [0, 50000,
  // 100000, 150000] for SCATTER_DOMAIN_X with step 50000.
  function scatterTicks(domain, step) {
    var start = Math.ceil(domain.min / step) * step;
    var ticks = [];
    for (var v = start; v <= domain.max + 1e-6; v += step) {
      ticks.push(Math.round(v));
    }
    return ticks;
  }

  // Matches Figure 6's number formatting: a space as thousands separator,
  // e.g. 100000 -> "100 000", -50000 -> "-50 000".
  function fmtScatterTick(n) {
    var sign = n < 0 ? "-" : "";
    var digits = String(Math.abs(n));
    var groups = [];
    while (digits.length > 3) {
      groups.unshift(digits.slice(-3));
      digits = digits.slice(0, -3);
    }
    groups.unshift(digits);
    return sign + groups.join(" ");
  }

  // Light gray gridlines plus tick labels, every 50,000 units on both axes.
  function buildScatterGridMarkup() {
    var markup = "";

    scatterTicks(SCATTER_DOMAIN_X, 50000).forEach(function (v) {
      var x = scatterXPixel(v);
      markup += '<line class="explorer-scatter-gridline" x1="' + x + '" y1="' + SCATTER_PLOT.top +
        '" x2="' + x + '" y2="' + SCATTER_PLOT.bottom + '"></line>';
      markup += '<text class="explorer-scatter-tick explorer-scatter-tick-x" x="' + x +
        '" y="' + (SCATTER_PLOT.bottom + 16) + '">' + fmtScatterTick(v) + "</text>";
    });

    scatterTicks(SCATTER_DOMAIN_Y, 50000).forEach(function (v) {
      var y = scatterYPixel(v);
      markup += '<line class="explorer-scatter-gridline" x1="' + SCATTER_PLOT.left + '" y1="' + y +
        '" x2="' + SCATTER_PLOT.right + '" y2="' + y + '"></line>';
      markup += '<text class="explorer-scatter-tick explorer-scatter-tick-y" x="' + (SCATTER_PLOT.left - 8) +
        '" y="' + (y + 3.5) + '">' + fmtScatterTick(v) + "</text>";
    });

    return markup;
  }

  // Axis titles, matching Figure 6's wording exactly.
  function buildScatterAxisTitlesMarkup() {
    var xTitleX = (SCATTER_PLOT.left + SCATTER_PLOT.right) / 2;
    var xTitleY = SCATTER_VIEWBOX.height - 6;
    var yTitleX = 14;
    var yTitleY = (SCATTER_PLOT.top + SCATTER_PLOT.bottom) / 2;

    return '<text class="explorer-scatter-axis-title" x="' + xTitleX + '" y="' + xTitleY + '">' +
      "Change in affordable units</text>" +
      '<text class="explorer-scatter-axis-title" x="' + yTitleX + '" y="' + yTitleY +
      '" transform="rotate(-90 ' + yTitleX + " " + yTitleY + ')">Change in market-rate units</text>';
  }

  /*
    The net-zero reference line (d_units_affordable + d_units_market = 0,
    i.e. y = -x) and the "net decrease" shading below/left of it, clipped to
    the fixed domain rectangle. For this specific domain the line enters
    through the left edge (x = xMin) and exits through the bottom edge
    (y = yMin); this is verified against the SCATTER_DOMAIN_X/Y constants
    above, not a general-purpose line-clipping routine.
  */
  function buildScatterDecreaseRegionMarkup() {
    var xMin = SCATTER_DOMAIN_X.min, xMax = SCATTER_DOMAIN_X.max;
    var yMin = SCATTER_DOMAIN_Y.min, yMax = SCATTER_DOMAIN_Y.max;

    var lineTop = { x: xMin, y: Math.min(-xMin, yMax) };
    var lineBottom = { x: Math.min(-yMin, xMax), y: yMin };

    var p1x = scatterXPixel(lineTop.x), p1y = scatterYPixel(lineTop.y);
    var p2x = scatterXPixel(lineBottom.x), p2y = scatterYPixel(lineBottom.y);
    var blx = scatterXPixel(xMin), bly = scatterYPixel(yMin);

    var polygonPts = p1x + "," + p1y + " " + p2x + "," + p2y + " " + blx + "," + bly;

    // Placed well inside the shaded triangle, lower-left, matching Figure
    // 6's placement of its "Net decrease in units" label.
    var labelX = scatterXPixel(15000);
    var labelY = scatterYPixel(-100000);

    return '<polygon class="explorer-scatter-decrease-fill" points="' + polygonPts + '"></polygon>' +
      '<line class="explorer-scatter-diagonal" x1="' + p1x + '" y1="' + p1y +
      '" x2="' + p2x + '" y2="' + p2y + '"></line>' +
      '<text class="explorer-scatter-decrease-label" x="' + labelX + '" y="' + labelY + '">Net decrease in units</text>';
  }

  // Baseline (alpha=0, phi=0, tau=0), which is exactly (0, 0) by
  // construction, so it needs no grid lookup and is drawn once as static
  // markup rather than as a mode-dependent reference point. Dashed
  // crosshair guide lines from the plot edges to the origin, matching
  // Figure 6.
  function buildScatterBaselineMarkup() {
    var ox = scatterXPixel(0), oy = scatterYPixel(0);

    return '<line class="explorer-scatter-baseline-guide" x1="' + ox + '" y1="' + SCATTER_PLOT.top +
      '" x2="' + ox + '" y2="' + SCATTER_PLOT.bottom + '"></line>' +
      '<line class="explorer-scatter-baseline-guide" x1="' + SCATTER_PLOT.left + '" y1="' + oy +
      '" x2="' + SCATTER_PLOT.right + '" y2="' + oy + '"></line>' +
      '<polygon class="explorer-scatter-refpoint" points="' + diamondPoints(ox, oy, 5) + '"></polygon>' +
      '<text class="explorer-scatter-reflabel explorer-scatter-baseline-label" x="' + (ox - 8) +
      '" y="' + (oy + 16) + '">Baseline</text>';
  }

  // (6) All Policies: a static point (not a grid.get() lookup, see the
  // SCATTER_ALL_POLICIES_POINT comment above), shown in both modes since
  // it's the same fixed value either way. Styled distinctly (muted fill,
  // dashed outline, asterisked label) so it doesn't read as a sixth
  // live-grid point.
  function buildScatterAllPoliciesMarkup() {
    var ref = SCATTER_ALL_POLICIES_POINT;
    var cx = scatterXPixel(ref.affordable), cy = scatterYPixel(ref.market);

    return '<polygon class="explorer-scatter-static-point" points="' + diamondPoints(cx, cy, 6) + '"></polygon>' +
      '<text class="explorer-scatter-reflabel explorer-scatter-static-label" x="' + (cx + 9) +
      '" y="' + (cy - 9) + '">' + ref.label + "*</text>";
  }

  function buildScatterStaticMarkup() {
    return buildScatterGridMarkup() +
      buildScatterDecreaseRegionMarkup() +
      buildScatterBaselineMarkup() +
      buildScatterAllPoliciesMarkup() +
      buildScatterAxisTitlesMarkup();
  }

  var SVG_NS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  function init(container, config) {
    config = config || {};
    var dataPath = config.dataPath || "./";
    var figuresPath = config.figuresPath || "./";
    var labels = Object.assign({
      diz: "Density Incentive Zoning",
      fiz: "Fiscal Incentive Zoning",
      alpha: "Affordable share (mandate)",
      phi: "Density bonus",
      tau: "Tax exemption (years)",
      netUnits: "Net new units",
      rentChange: "Average expected rent change",
      whoPays: "Public / landowner cost split",
      costSplitNote: "The public/landowner cost split (Figure 12) is not part " +
        "of this grid yet; see Finding 3 above for the reported per-unit " +
        "cost and incidence."
    }, config.labels || {});

    container.innerHTML =
      /* Hidden unless a data-load error occurs (see the fetch .catch below);
         no default "illustrative data" text now that real data backs this. */
      '<div class="explorer-banner" role="note" hidden></div>' +
      '<div class="explorer-modes" role="tablist" aria-label="Policy mode">' +
      '<button type="button" class="explorer-mode-btn" data-mode="diz" ' +
      'role="tab" aria-pressed="true">' + labels.diz + "</button>" +
      '<button type="button" class="explorer-mode-btn" data-mode="fiz" ' +
      'role="tab" aria-pressed="false">' + labels.fiz + "</button>" +
      "</div>" +
      '<div class="explorer-heatmaps">' +
      heatmapPanel("units", "Net new units") +
      heatmapPanel("rent", "Average expected rent change") +
      "</div>" +
      '<p class="explorer-heatmap-caption" data-out="heatmap-caption">—</p>' +
      '<div class="explorer-controls-row">' +
      '<fieldset data-fieldset="diz">' +
      /* The mode toggle above already shows which mode is active; the
         legend stays for screen readers (fieldset semantics) without
         repeating the heading visually. */
      '<legend class="sr-only">' + labels.diz + '</legend>' +
      sliderRow("alpha-diz", labels.alpha) +
      sliderRow("phi", labels.phi) +
      "</fieldset>" +
      '<fieldset data-fieldset="fiz" hidden>' +
      '<legend class="sr-only">' + labels.fiz + '</legend>' +
      sliderRow("alpha-fiz", labels.alpha) +
      sliderRow("tau", labels.tau) +
      "</fieldset>" +
      "</div>" +
      '<div class="explorer-readouts-row" aria-live="polite">' +
      '<div class="explorer-readout">' +
      '<div class="explorer-readout-label">' + labels.netUnits + '</div>' +
      '<div class="explorer-readout-value" data-out="net">—</div>' +
      '<div class="explorer-split-bar" data-out="split-bar">' +
      '<span class="affordable" data-out="split-affordable"></span>' +
      '<span class="market" data-out="split-market"></span>' +
      "</div>" +
      '<div class="explorer-legend">' +
      '<span><span class="dot affordable"></span>Affordable, <span data-out="affordable-num">—</span></span>' +
      '<span><span class="dot market"></span>Market-rate, <span data-out="market-num">—</span></span>' +
      "</div>" +
      "</div>" +
      '<div class="explorer-readout">' +
      '<div class="explorer-readout-label">' + labels.rentChange + '</div>' +
      '<div class="explorer-readout-value" data-out="rent">—</div>' +
      "</div>" +
      '<div class="explorer-note">' + labels.costSplitNote + "</div>" +
      "</div>" +
      '<div class="explorer-scatter">' +
      '<svg class="explorer-scatter-svg" viewBox="0 0 ' + SCATTER_VIEWBOX.width + " " + SCATTER_VIEWBOX.height + '" ' +
      'role="img" aria-label="Change in affordable versus market-rate units for the current policy, against the paper\'s named reference scenarios">' +
      buildScatterStaticMarkup() +
      '<g data-el="ref-points"></g>' +
      '<circle class="explorer-scatter-marker" data-el="live-marker" r="6" visibility="hidden"></circle>' +
      "</svg>" +
      "</div>" +
      '<p class="explorer-scatter-caption">X-axis is the change in affordable units, y-axis is the change in market-rate units; the diagonal marks where total units are unchanged from baseline; the shaded area is a net decrease.</p>' +
      '<p class="explorer-scatter-note">*All Policies is shown using the paper\'s reported value; a live version will be added once the full three-instrument grid is available.</p>';

    function sliderRow(key, label) {
      return '<div class="explorer-slider-row" data-slider-row="' + key + '">' +
        '<label for="explorer-' + key + '">' + label +
        ' <output id="explorer-' + key + '-out">—</output></label>' +
        '<input type="range" id="explorer-' + key + '" />' +
        "</div>";
    }

    function heatmapPanel(kind, label) {
      return '<div class="explorer-heatmap">' +
        '<img data-heatmap="' + kind + '" alt="' + label + ', by mandate share and policy instrument" />' +
        '<div class="explorer-heatmap-marker" data-marker="' + kind + '">' +
        '<span class="line-h"></span><span class="line-v"></span><span class="dot"></span>' +
        "</div>" +
        "</div>";
    }

    function currentGrid() {
      return state.mode === "diz" ? state.dizGrid : state.fizGrid;
    }

    // The mode's three labeled reference points (a single-instrument point,
    // the affordability mandate, and the paper's named DIZ/FIZ scenario),
    // replotted whenever the mode changes (the fixed domain itself never
    // changes). Looked up by exact (a, b) grid coordinate via grid.get(),
    // so the plotted values are real simulated output, not an
    // interpolation. Styled as filled diamonds, matching Figure 6.
    function renderScatterRefPoints() {
      var grid = currentGrid();
      var refGroup = container.querySelector('[data-el="ref-points"]');
      refGroup.textContent = "";
      if (!grid) return;

      SCATTER_REF_POINTS[state.mode].forEach(function (ref) {
        var row = grid.get(ref.a, ref.b);
        if (!row) return;
        var cx = scatterXPixel(row.d_units_affordable);
        var cy = scatterYPixel(row.d_units_market);

        refGroup.appendChild(svgEl("polygon", {
          class: "explorer-scatter-refpoint",
          points: diamondPoints(cx, cy, 6)
        }));

        var text = svgEl("text", {
          class: "explorer-scatter-reflabel",
          x: cx + 9, y: cy - 9
        });
        text.textContent = ref.label;
        refGroup.appendChild(text);
      });
    }

    // Updates only the live marker; called on every render(), same
    // frequency as the heatmap marker and the readouts. A hollow outlined
    // circle, deliberately distinct from the two solid reference diamonds.
    function renderScatterMarker(dAffordable, dMarket) {
      var marker = container.querySelector('[data-el="live-marker"]');
      marker.setAttribute("cx", scatterXPixel(dAffordable));
      marker.setAttribute("cy", scatterYPixel(dMarket));
      marker.removeAttribute("visibility");
    }

    var state = {
      mode: "diz",
      dizGrid: null, fizGrid: null
    };

    var modeButtons = container.querySelectorAll(".explorer-mode-btn");
    var dizFieldset = container.querySelector('[data-fieldset="diz"]');
    var fizFieldset = container.querySelector('[data-fieldset="fiz"]');

    function setupSlider(id, axisVals, step, maxOverride) {
      var input = container.querySelector("#explorer-" + id);
      input.min = axisVals[0];
      input.max = maxOverride != null ? maxOverride : axisVals[axisVals.length - 1];
      input.step = step;
      input.value = axisVals[0];
      return input;
    }

    function axisStep(axisVals) {
      if (axisVals.length < 2) return 1;
      var diffs = [];
      for (var i = 1; i < axisVals.length; i++) {
        diffs.push(Math.abs(axisVals[i] - axisVals[i - 1]));
      }
      return Math.min.apply(null, diffs);
    }

    function renderHeatmaps(alpha, xValue) {
      var cfg = HEATMAP_CONFIG[state.mode];
      var yPercent = alphaToYPercent(alpha);

      ["units", "rent"].forEach(function (kind) {
        var panelCfg = cfg[kind];
        var img = container.querySelector('[data-heatmap="' + kind + '"]');
        if (img.dataset.file !== panelCfg.file) {
          img.src = figuresPath + panelCfg.file;
          img.dataset.file = panelCfg.file;
        }
        var xPercent = xValueToXPercent(panelCfg.x0, panelCfg.x1, xValue, cfg.axisMax);
        var marker = container.querySelector('[data-marker="' + kind + '"]');
        marker.style.left = xPercent + "%";
        marker.style.top = yPercent + "%";
      });

      var captionEl = container.querySelector('[data-out="heatmap-caption"]');
      var alphaText = "α = " + Math.round(alpha * 100) + "%";
      var xText = state.mode === "diz"
        ? "φ = " + Math.round(xValue * 100) + "%"
        : "τ = " + Math.round(xValue) + " years";
      captionEl.textContent = alphaText + ", " + xText;
    }

    function render() {
      // switchMode("diz") below runs synchronously, before the CSV fetch
      // resolves; skip until both grids are actually built (the fetch's own
      // .then() calls render() again once they are).
      if (!state.dizGrid || !state.fizGrid) return;

      var out;
      var alpha, xValue;
      if (state.mode === "diz") {
        alpha = parseFloat(container.querySelector("#explorer-alpha-diz").value);
        xValue = parseFloat(container.querySelector("#explorer-phi").value);
        container.querySelector("#explorer-alpha-diz-out").textContent = alpha.toFixed(2);
        container.querySelector("#explorer-phi-out").textContent = xValue.toFixed(2);
        out = interpolate(state.dizGrid, alpha, xValue);
      } else {
        alpha = parseFloat(container.querySelector("#explorer-alpha-fiz").value);
        xValue = parseFloat(container.querySelector("#explorer-tau").value);
        container.querySelector("#explorer-alpha-fiz-out").textContent = alpha.toFixed(2);
        container.querySelector("#explorer-tau-out").textContent = xValue.toFixed(0) + " yrs";
        out = interpolate(state.fizGrid, alpha, xValue);
      }

      renderHeatmaps(alpha, xValue);
      renderScatterMarker(out.d_units_affordable, out.d_units_market);

      var netEl = container.querySelector('[data-out="net"]');
      netEl.textContent = fmtUnits(out.d_units_net);
      netEl.className = "explorer-readout-value " + signClass(out.d_units_net);

      var rentEl = container.querySelector('[data-out="rent"]');
      rentEl.textContent = fmtPct(out.d_rent_pct);
      rentEl.className = "explorer-readout-value " + signClass(out.d_rent_pct);

      container.querySelector('[data-out="affordable-num"]').textContent =
        fmtUnits(out.d_units_affordable);
      container.querySelector('[data-out="market-num"]').textContent =
        fmtUnits(out.d_units_market);

      var total = Math.abs(out.d_units_affordable) + Math.abs(out.d_units_market);
      var affPct = total === 0 ? 0 : (Math.abs(out.d_units_affordable) / total) * 100;
      container.querySelector('[data-out="split-affordable"]').style.width = affPct + "%";
      container.querySelector('[data-out="split-market"]').style.width = (100 - affPct) + "%";
    }

    function switchMode(mode) {
      state.mode = mode;
      modeButtons.forEach(function (btn) {
        btn.setAttribute("aria-pressed", btn.dataset.mode === mode ? "true" : "false");
      });
      dizFieldset.hidden = mode !== "diz";
      fizFieldset.hidden = mode !== "fiz";
      renderScatterRefPoints();
      render();
    }

    modeButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchMode(btn.dataset.mode);
      });
    });

    Promise.all([
      fetch(dataPath + "grid-diz.csv").then(function (r) { return r.text(); }),
      fetch(dataPath + "grid-fiz.csv").then(function (r) { return r.text(); })
    ]).then(function (results) {
      var dizRows = parseCSV(results[0]);
      var fizRows = parseCSV(results[1]);

      state.dizGrid = buildGrid(dizRows, "alpha", "phi", VALUE_KEYS);
      state.fizGrid = buildGrid(fizRows, "alpha", "tau", VALUE_KEYS);

      // Sliders are capped to ALPHA_UI_MAX/PHI_UI_MAX/TAU_UI_MAX, matching
      // the heatmap figures' plotted range; the real grid now covers that
      // same range natively (state.*Grid.aVals/bVals), so this cap and
      // interpolate()'s own clamp-to-grid-edge are just defensive floors,
      // not live constraints, unless a future grid update is narrower.
      var dizAlphaInput = setupSlider("alpha-diz", state.dizGrid.aVals, axisStep(state.dizGrid.aVals), ALPHA_UI_MAX);
      var phiInput = setupSlider("phi", state.dizGrid.bVals, axisStep(state.dizGrid.bVals), PHI_UI_MAX);
      var fizAlphaInput = setupSlider("alpha-fiz", state.fizGrid.aVals, axisStep(state.fizGrid.aVals), ALPHA_UI_MAX);
      var tauInput = setupSlider("tau", state.fizGrid.bVals, axisStep(state.fizGrid.bVals), TAU_UI_MAX);

      // Start on an illustrative non-baseline point so the readouts are legible
      // immediately rather than showing an all-zero baseline on load.
      dizAlphaInput.value = 0;
      phiInput.value = state.dizGrid.bVals[Math.floor(state.dizGrid.bVals.length / 2)];
      fizAlphaInput.value = 0;
      tauInput.value = state.fizGrid.bVals[Math.floor(state.fizGrid.bVals.length / 2)];

      [dizAlphaInput, phiInput, fizAlphaInput, tauInput].forEach(function (input) {
        input.addEventListener("input", render);
      });

      renderScatterRefPoints();
      render();
    }).catch(function (err) {
      var banner = container.querySelector(".explorer-banner");
      banner.hidden = false;
      banner.textContent =
        "Explorer data failed to load (" + err.message + "). If you opened this " +
        "file directly, serve the site over http:// instead of file:// so the " +
        "CSV grids can be fetched.";
    });

    switchMode("diz");
  }

  global.CarrotStickExplorer = {
    init: init
  };
})(window);
