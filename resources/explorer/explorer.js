/*
  Carrot & Stick interactive policy explorer.
  One engine, reused across the academic, developer, and policy sites. Do not fork
  this file per site; site-specific framing goes through the config object passed
  to CarrotStickExplorer.init().

  Data contract (see academic/CLAUDE.md and resources/explorer/grid-full.csv):
    Full factorial grid columns (as of 2026-09-21): alpha, phi, tau, Aff, Apt,
    AptNet, AptNet_market, E_apt, Erent, Tax, PV, Density, Q1-Q5, Erent_chg,
    Erent_chg_perc, AptNet_chg, Aff_chg, Density_chg, Tax_chg, PV_chg.
    16 alpha levels (0-0.75, step 0.05) x 21 phi levels (0-1.0, step 0.05) x 13
    tau levels (0-30, step 2.5) = 4,368 rows, one row per exact combination.
    This module reads Aff_chg (affordable units, level change vs. the
    alpha=phi=tau=0 baseline), AptNet_chg (net units, level change),
    Erent_chg_perc (fractional rent change), Tax_chg (fractional tax revenue
    change), and PV_chg (fractional landowner property value change) directly
    off each row; market-rate units change is derived as AptNet_chg - Aff_chg.
    Tax_chg/PV_chg match Table 5's fractional-change convention, so they are
    formatted as percentages the same way Erent_chg_perc is.

    Sliders snap to the grid's exact discrete levels (index-based, no
    interpolation in any of the three dimensions) since the grid is a full
    factorial cube, not a pair of 2-D slices to interpolate across.

  STATUS: as of 2026-09-21, replaced the earlier two-slice DIZ/FIZ design
  (separate grid-diz.csv/grid-fiz.csv, bilinear interpolation, a DIZ/FIZ mode
  toggle) with a full 3-D cube view. The top switch now toggles which outcome
  (net units vs. rent) colors the cube slice and heatmap, not which policy
  grid is active; alpha, phi, and tau are all always live together via three
  sliders. See resources/explorer/explorer.css for the cube/heatmap panel
  styling and academic/CLAUDE.md's former "Open question" note (now
  resolved: the grid is a full cube).

  The scatter panel below the readouts (production tradeoff, styled after
  Figure 6) sources all six named reference points, including "All
  Policies", directly from grid-full.csv via exact (alpha, phi, tau)
  coordinate lookups, rendered once at init; none are hardcoded static
  values any more.
*/

(function (global) {
  "use strict";

  function parseCSV(text) {
    var lines = text.trim().split(/\r?\n/);
    var headers = lines[0].split(",").map(function (h) { return h.trim().replace(/^"|"$/g, ""); });
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

  /* ------------------------------------------------------------------ */
  /* 3-D grid: exact index lookups, no interpolation                     */
  /* ------------------------------------------------------------------ */

  function indexMap(levels) {
    var m = {};
    levels.forEach(function (v, i) { m[v.toFixed(4)] = i; });
    return m;
  }

  function buildGrid3D(rows, alphaLevels, phiLevels, tauLevels) {
    var aMap = indexMap(alphaLevels), pMap = indexMap(phiLevels), tMap = indexMap(tauLevels);
    var grid = [];
    for (var i = 0; i < alphaLevels.length; i++) {
      grid.push([]);
      for (var j = 0; j < phiLevels.length; j++) {
        grid[i].push(new Array(tauLevels.length));
      }
    }
    rows.forEach(function (r) {
      r.marketChg = r.AptNet_chg - r.Aff_chg;
      r.rentPct = r.Erent_chg_perc * 100;
      r.taxPct = r.Tax_chg * 100;
      r.pvPct = r.PV_chg * 100;
      var ai = aMap[r.alpha.toFixed(4)], pj = pMap[r.phi.toFixed(4)], tk = tMap[r.tau.toFixed(4)];
      grid[ai][pj][tk] = r;
    });
    return grid;
  }

  function globalAbsMax(rows, key) {
    var m = 0;
    rows.forEach(function (r) {
      var v = Math.abs(r[key]);
      if (v > m) m = v;
    });
    return m;
  }

  /* Cell boundaries for a heatmap tiling: N grid points -> N cells -> N+1
     edges in normalized [0,1] axis space, midpoint-split between adjacent
     points and extended to the true 0/1 ends so the tiling covers the full
     plane with no gaps. */
  function cellEdges(n) {
    var e = [0];
    for (var i = 1; i < n; i++) e.push((i - 0.5) / (n - 1));
    e.push(1);
    return e;
  }

  var METRICS = {
    production: { key: "AptNet_chg", fmt: fmtUnits, legendTitle: "Chg. Units", panelTitle: "Change in Units" },
    rent: { key: "rentPct", fmt: fmtPct, legendTitle: "Chg E. Rent", panelTitle: "Change in Rent" }
  };

  function colorRGB(v, maxAbs) {
    if (!maxAbs) return [255, 255, 255];
    var t = Math.max(-1, Math.min(1, v / maxAbs));
    var white = [255, 255, 255], red = [179, 27, 27], gray = [85, 85, 85];
    return t >= 0 ? lerpColor(white, red, t) : lerpColor(white, gray, -t);
  }

  function colorForValue(v, maxAbs) {
    var c = colorRGB(v, maxAbs);
    return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
  }

  function lerpColor(a, b, t) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t)
    ];
  }

  /* Marching squares over a 16x21-ish scalar grid, tracing the v=0 contour.
     proj(aiFrac, pjFrac) maps fractional grid-index coordinates to a screen
     point; the caller supplies whatever projection (flat heatmap or a
     tau-offset cube slice) applies. */
  function marchingSquaresZero(values, proj) {
    var segs = [];
    var nA = values.length, nP = values[0].length;

    function crossing(vA, vB, aA, pA, aB, pB) {
      if (vA === vB) return null;
      if ((vA < 0 && vB < 0) || (vA > 0 && vB > 0)) return null;
      var t = vA / (vA - vB);
      return proj(aA + (aB - aA) * t, pA + (pB - pA) * t);
    }

    for (var ai = 0; ai < nA - 1; ai++) {
      for (var pj = 0; pj < nP - 1; pj++) {
        var v00 = values[ai][pj], v10 = values[ai + 1][pj], v01 = values[ai][pj + 1], v11 = values[ai + 1][pj + 1];
        var pts = [];
        var c1 = crossing(v00, v10, ai, pj, ai + 1, pj);
        var c2 = crossing(v10, v11, ai + 1, pj, ai + 1, pj + 1);
        var c3 = crossing(v11, v01, ai + 1, pj + 1, ai, pj + 1);
        var c4 = crossing(v01, v00, ai, pj + 1, ai, pj);
        if (c1) pts.push(c1);
        if (c2) pts.push(c2);
        if (c3) pts.push(c3);
        if (c4) pts.push(c4);
        if (pts.length === 2) {
          segs.push({ x1: pts[0].x, y1: pts[0].y, x2: pts[1].x, y2: pts[1].y });
        } else if (pts.length === 4) {
          var center = (v00 + v10 + v01 + v11) / 4;
          if (center >= 0) {
            segs.push({ x1: pts[0].x, y1: pts[0].y, x2: pts[1].x, y2: pts[1].y });
            segs.push({ x1: pts[2].x, y1: pts[2].y, x2: pts[3].x, y2: pts[3].y });
          } else {
            segs.push({ x1: pts[0].x, y1: pts[0].y, x2: pts[3].x, y2: pts[3].y });
            segs.push({ x1: pts[1].x, y1: pts[1].y, x2: pts[2].x, y2: pts[2].y });
          }
        }
      }
    }
    return segs;
  }

  /* ------------------------------------------------------------------ */
  /* Housing production tradeoff scatter: all six named reference points  */
  /* (including "All Policies") are exact grid-derived (alpha, phi, tau)  */
  /* lookups against grid-full.csv; see file header comment.              */
  /* ------------------------------------------------------------------ */

  var SCATTER_DOMAIN_X = { min: -5000, max: 175000 };   // affordable units change
  var SCATTER_DOMAIN_Y = { min: -135000, max: 100000 }; // market-rate units change

  var SCATTER_MARGIN = { left: 70, right: 20, top: 20, bottom: 55 };
  var SCATTER_PLOT_WIDTH = 700;
  var SCATTER_PLOT_HEIGHT = 343; // 700 / 343 = 2.04, matching Figure 6's proportions

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

  // All six named policy points are exact (alpha, phi, tau) grid
  // coordinates looked up directly from grid-full.csv, never interpolated.
  // "All Policies" was previously a static hardcoded value but is a real
  // grid point like the other five (Aff_chg=121,680.6, AptNet_chg=152,896.8,
  // matching the paper's reported figure exactly).
  var SCATTER_REF_POINTS = [
    { label: "(1) Upzoning", alpha: 0.0, phi: 0.5, tau: 0.0 },
    { label: "(2) Tax exemption", alpha: 0.0, phi: 0.0, tau: 20.0 },
    { label: "(3) Affordability mandate", alpha: 0.3, phi: 0.0, tau: 0.0 },
    { label: "(4) Density Incentive Zoning", alpha: 0.3, phi: 0.5, tau: 0.0 },
    { label: "(5) Fiscal Incentive Zoning", alpha: 0.3, phi: 0.0, tau: 20.0 },
    { label: "(6) All Policies", alpha: 0.3, phi: 0.5, tau: 20.0 }
  ];

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

  function scatterTicks(domain, step) {
    var start = Math.ceil(domain.min / step) * step;
    var ticks = [];
    for (var v = start; v <= domain.max + 1e-6; v += step) ticks.push(Math.round(v));
    return ticks;
  }

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

  function buildScatterDecreaseRegionMarkup() {
    var xMin = SCATTER_DOMAIN_X.min, xMax = SCATTER_DOMAIN_X.max;
    var yMin = SCATTER_DOMAIN_Y.min, yMax = SCATTER_DOMAIN_Y.max;
    var lineTop = { x: xMin, y: Math.min(-xMin, yMax) };
    var lineBottom = { x: Math.min(-yMin, xMax), y: yMin };
    var p1x = scatterXPixel(lineTop.x), p1y = scatterYPixel(lineTop.y);
    var p2x = scatterXPixel(lineBottom.x), p2y = scatterYPixel(lineBottom.y);
    var blx = scatterXPixel(xMin), bly = scatterYPixel(yMin);
    var polygonPts = p1x + "," + p1y + " " + p2x + "," + p2y + " " + blx + "," + bly;
    var labelX = scatterXPixel(15000);
    var labelY = scatterYPixel(-100000);
    return '<polygon class="explorer-scatter-decrease-fill" points="' + polygonPts + '"></polygon>' +
      '<line class="explorer-scatter-diagonal" x1="' + p1x + '" y1="' + p1y +
      '" x2="' + p2x + '" y2="' + p2y + '"></line>' +
      '<text class="explorer-scatter-decrease-label" x="' + labelX + '" y="' + labelY + '">Net decrease in units</text>';
  }

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

  function buildScatterStaticMarkup() {
    return buildScatterGridMarkup() +
      buildScatterDecreaseRegionMarkup() +
      buildScatterBaselineMarkup() +
      buildScatterAxisTitlesMarkup();
  }

  var SVG_NS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  /* ------------------------------------------------------------------ */
  /* Heatmap panel: 16x21 alpha/phi color surface at the current tau,    */
  /* redrawn whenever tau or the metric changes. viewBox keeps the exact */
  /* 16:9 aspect ratio the old static figure images used (2400x1350),    */
  /* just at a smaller, arbitrary SVG scale, so the panel's rendered      */
  /* pixel size is unchanged from before (same CSS grid column, same     */
  /* width:100%/height:auto mechanics).                                  */
  /* ------------------------------------------------------------------ */

  // Left/bottom margins carry dedicated rows for full axis titles (see
  // addHeatmapAxisLabels) in addition to the tick-value labels; the viewBox
  // grows by the same amount so the plotted surface area itself (HEATMAP_PLOT)
  // is unchanged from the original 356x193.
  var HEATMAP_VIEWBOX = { width: 426, height: 243 };
  var HEATMAP_MARGIN = { left: 60, right: 10, top: 10, bottom: 40 };
  var HEATMAP_PLOT = {
    x0: HEATMAP_MARGIN.left,
    y0: HEATMAP_VIEWBOX.height - HEATMAP_MARGIN.bottom,
    w: HEATMAP_VIEWBOX.width - HEATMAP_MARGIN.left - HEATMAP_MARGIN.right,
    h: HEATMAP_VIEWBOX.height - HEATMAP_MARGIN.top - HEATMAP_MARGIN.bottom
  };

  function heatmapProjector() {
    return function (aT, pT) {
      return { x: HEATMAP_PLOT.x0 + pT * HEATMAP_PLOT.w, y: HEATMAP_PLOT.y0 - aT * HEATMAP_PLOT.h };
    };
  }

  /* ------------------------------------------------------------------ */
  /* Cube panel: isometric-style projection, alpha vertical, phi          */
  /* horizontal, tau receding diagonally (30 degrees) toward the upper    */
  /* right. Since alpha and phi are both screen-orthogonal axes and only  */
  /* tau is skewed, a fixed-tau slice is a plain axis-aligned rectangle   */
  /* translated by a constant tau offset, so the same cell/contour        */
  /* drawing code as the heatmap panel applies, just with that offset.    */
  /* ------------------------------------------------------------------ */

  // Plot/tau dimensions are ~10% larger than the cube's original 270x324/80x46
  // footprint, within the same overall viewBox (so the panel's rendered size
  // is unchanged but the cube fills more of it). Margins shrink to make room,
  // which is affordable now that the depth-axis tick labels below render
  // horizontally instead of needing room for a rotated diagonal run.
  var CUBE_VIEWBOX = { width: 480, height: 460 };
  var CUBE_MARGIN = { left: 52, right: 43, top: 18, bottom: 35 };
  var CUBE_TAU_DX = 88;
  var CUBE_TAU_DY = Math.round(88 * Math.tan(30 * Math.PI / 180)); // 30deg receding depth
  var CUBE_PLOT = {
    x0: CUBE_MARGIN.left,
    y0: CUBE_VIEWBOX.height - CUBE_MARGIN.bottom,
    w: CUBE_VIEWBOX.width - CUBE_MARGIN.left - CUBE_MARGIN.right - CUBE_TAU_DX,
    h: CUBE_VIEWBOX.height - CUBE_MARGIN.top - CUBE_MARGIN.bottom - CUBE_TAU_DY
  };

  function cubeProjector() {
    return function (aT, pT, tT) {
      tT = tT || 0;
      return {
        x: CUBE_PLOT.x0 + pT * CUBE_PLOT.w + tT * CUBE_TAU_DX,
        y: CUBE_PLOT.y0 - aT * CUBE_PLOT.h - tT * CUBE_TAU_DY
      };
    };
  }

  // Plain "+" concatenation of three 0/1 numbers is not safe here: JS adds
  // adjacent numeric operands arithmetically before ever reaching a string
  // (e.g. a+p+"0" sums a+p numerically first), so a dedicated string-join
  // avoids silently wrong/undefined corner lookups.
  function cornerKey(a, p, t) {
    return String(a) + String(p) + String(t);
  }

  function cubeCorners(project) {
    var c = {};
    [0, 1].forEach(function (a) {
      [0, 1].forEach(function (p) {
        [0, 1].forEach(function (t) {
          c[cornerKey(a, p, t)] = project(a, p, t);
        });
      });
    });
    return c;
  }

  function buildWireframeEdges(c) {
    var edges = [];
    [0, 1].forEach(function (p) { [0, 1].forEach(function (t) { edges.push([c[cornerKey(0, p, t)], c[cornerKey(1, p, t)]]); }); });
    [0, 1].forEach(function (a) { [0, 1].forEach(function (t) { edges.push([c[cornerKey(a, 0, t)], c[cornerKey(a, 1, t)]]); }); });
    [0, 1].forEach(function (a) { [0, 1].forEach(function (p) { edges.push([c[cornerKey(a, p, 0)], c[cornerKey(a, p, 1)]]); }); });
    return edges;
  }

  /* Surface color is rendered as a single raster image sampled once per real
     grid point (one canvas pixel per alpha/phi level, exactly matching the
     grid's own even spacing), then stretched to the plot rectangle. Letting
     the browser's own image scaling do the resampling gives a continuous
     bilinear-interpolated gradient between real grid values instead of
     flat-filled discrete cells, with no change to the underlying data or any
     interaction logic (still the same values2D grid feeding both the color
     and the marching-squares contour below). */
  function buildSurfaceImageHref(values2D, maxAbs) {
    var nA = values2D.length, nP = values2D[0].length;
    var canvas = document.createElement("canvas");
    canvas.width = nP;
    canvas.height = nA;
    var ctx = canvas.getContext("2d");
    var imgData = ctx.createImageData(nP, nA);
    for (var ai = 0; ai < nA; ai++) {
      // Flip vertically: canvas row 0 is the image top, but alpha increases
      // upward on screen (higher alpha = smaller y), so the top row must
      // hold the highest-alpha values.
      var destRow = nA - 1 - ai;
      for (var pj = 0; pj < nP; pj++) {
        var rgb = colorRGB(values2D[ai][pj], maxAbs);
        var idx = (destRow * nP + pj) * 4;
        imgData.data[idx] = rgb[0];
        imgData.data[idx + 1] = rgb[1];
        imgData.data[idx + 2] = rgb[2];
        imgData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL();
  }

  function renderSurface(group, values2D, maxAbs, x, y, w, h) {
    group.textContent = "";
    var href = buildSurfaceImageHref(values2D, maxAbs);
    var img = svgEl("image", {
      x: x, y: y, width: w, height: h,
      preserveAspectRatio: "none"
    });
    img.setAttribute("href", href);
    img.setAttributeNS("http://www.w3.org/1999/xlink", "href", href);
    group.appendChild(img);
  }

  function renderContour(group, values2D, project, tT) {
    group.textContent = "";
    var nA = values2D.length, nP = values2D[0].length;
    var segments = marchingSquaresZero(values2D, function (aiF, pjF) {
      return project(aiF / (nA - 1), pjF / (nP - 1), tT);
    });
    var frag = document.createDocumentFragment();
    segments.forEach(function (s) {
      frag.appendChild(svgEl("line", { x1: s.x1, y1: s.y1, x2: s.x2, y2: s.y2, class: "explorer-contour-line" }));
    });
    group.appendChild(frag);
  }

  function fmtAlpha(v) { return Math.round(v * 100) + "%"; }
  function fmtPhi(v) { return Math.round(v * 100) + "%"; }
  function fmtTau(v) { return Math.round(v) + "y"; }

  function addHeatmapAxisLabels(group, alphaLevels, phiLevels, project) {
    group.textContent = "";
    var frag = document.createDocumentFragment();
    [0, 0.5, 1].forEach(function (t) {
      var alphaIdx = Math.round(t * (alphaLevels.length - 1));
      var p = project(alphaIdx / (alphaLevels.length - 1), 0);
      frag.appendChild(svgEl("text", {
        x: HEATMAP_MARGIN.left - 5, y: p.y + 3, class: "explorer-heatmap-axislabel", "text-anchor": "end"
      })).textContent = fmtAlpha(alphaLevels[alphaIdx]);
    });
    [0, 0.5, 1].forEach(function (t) {
      var phiIdx = Math.round(t * (phiLevels.length - 1));
      var p = project(0, phiIdx / (phiLevels.length - 1));
      frag.appendChild(svgEl("text", {
        x: p.x, y: HEATMAP_PLOT.y0 + 14, class: "explorer-heatmap-axislabel", "text-anchor": "middle"
      })).textContent = fmtPhi(phiLevels[phiIdx]);
    });

    // Full descriptive axis titles (matching the original static heatmaps),
    // each on its own dedicated row/column separated from the tick values
    // rather than a bare Greek letter crammed into a plot corner.
    var yTitleX = 14, yTitleY = HEATMAP_MARGIN.top + HEATMAP_PLOT.h / 2;
    frag.appendChild(svgEl("text", {
      x: yTitleX, y: yTitleY, class: "explorer-heatmap-axistitle", "text-anchor": "middle",
      transform: "rotate(-90 " + yTitleX + " " + yTitleY + ")"
    })).textContent = "Affordable mandate share (alpha)";

    var xTitleX = HEATMAP_MARGIN.left + HEATMAP_PLOT.w / 2, xTitleY = HEATMAP_VIEWBOX.height - 6;
    frag.appendChild(svgEl("text", {
      x: xTitleX, y: xTitleY, class: "explorer-heatmap-axistitle", "text-anchor": "middle"
    })).textContent = "Density bonuses (phi)";
    group.appendChild(frag);
  }

  function addCubeAxisLabels(group, alphaLevels, phiLevels, tauLevels, project) {
    group.textContent = "";
    var frag = document.createDocumentFragment();

    [0, 0.5, 1].forEach(function (t) {
      var idx = Math.round(t * (alphaLevels.length - 1));
      var p = project(idx / (alphaLevels.length - 1), 0, 0);
      var txt = svgEl("text", { x: p.x - 8, y: p.y + 4, class: "explorer-cube-ticklabel", "text-anchor": "end" });
      txt.textContent = fmtAlpha(alphaLevels[idx]);
      frag.appendChild(txt);
    });
    [0, 0.5, 1].forEach(function (t) {
      var idx = Math.round(t * (phiLevels.length - 1));
      var p = project(0, idx / (phiLevels.length - 1), 0);
      var txt = svgEl("text", { x: p.x, y: p.y + 16, class: "explorer-cube-ticklabel", "text-anchor": "middle" });
      txt.textContent = fmtPhi(phiLevels[idx]);
      frag.appendChild(txt);
    });
    // Depth (tau) tick labels: rendered horizontally rather than following
    // the receding diagonal, each offset to the right of its point on the
    // axis, with dedicated room (the wider right margin above) so the
    // top-most tick and the axis title below don't collide.
    var tauLabelPositions = [];
    [0, 0.5, 1].forEach(function (t) {
      var idx = Math.round(t * (tauLevels.length - 1));
      var p = project(0, 0, idx / (tauLevels.length - 1));
      var lx = p.x + 8, ly = p.y + 3;
      var txt = svgEl("text", { x: lx, y: ly, class: "explorer-cube-ticklabel", "text-anchor": "start" });
      txt.textContent = fmtTau(tauLevels[idx]);
      frag.appendChild(txt);
      tauLabelPositions.push({ x: lx, y: ly });
    });

    var aTop = project(1, 0, 0);
    frag.appendChild(svgEl("text", { x: aTop.x - 8, y: aTop.y - 10, class: "explorer-cube-axistitle", "text-anchor": "end" })).textContent = "α";
    var pRight = project(0, 1, 0);
    frag.appendChild(svgEl("text", { x: pRight.x, y: pRight.y + 30, class: "explorer-cube-axistitle", "text-anchor": "middle" })).textContent = "φ";
    var topTauLabel = tauLabelPositions[tauLabelPositions.length - 1];
    frag.appendChild(svgEl("text", {
      x: topTauLabel.x, y: topTauLabel.y + 16, class: "explorer-cube-axistitle", "text-anchor": "start"
    })).textContent = "τ";

    group.appendChild(frag);
  }

  /* ------------------------------------------------------------------ */

  function init(container, config) {
    config = config || {};
    var dataPath = config.dataPath || "./";
    var labels = Object.assign({
      metricProduction: "Production",
      metricRent: "Rent",
      alpha: "Affordable share (mandate)",
      phi: "Density bonus",
      tau: "Tax exemption (years)",
      netUnits: "Net new units",
      rentChange: "Average expected rent change",
      whoPays: "Public / landowner cost split",
      taxImpact: "Tax revenue impact",
      landownerImpact: "Landowner property value impact",
      tauNote: "Set by New York State; density bonuses and mandate share are " +
        "the levers a city planner controls.",
      heatmapHint: "Click or drag on the heatmap to set a policy directly.",
      costSplitNote: "Reflects the full fiscal and property-value effect of " +
        "this policy, including any change in total production; not the " +
        "same as a per-unit incidence analysis that holds total production " +
        "fixed."
    }, config.labels || {});

    container.innerHTML =
      '<div class="explorer-banner" role="note" hidden></div>' +
      '<div class="explorer-modes" role="tablist" aria-label="Colored outcome">' +
      '<button type="button" class="explorer-mode-btn" data-metric="production" ' +
      'role="tab" aria-pressed="true">' + labels.metricProduction + "</button>" +
      '<button type="button" class="explorer-mode-btn" data-metric="rent" ' +
      'role="tab" aria-pressed="false">' + labels.metricRent + "</button>" +
      "</div>" +
      '<div class="explorer-cube-row">' +
      '<div class="explorer-cube-panel">' +
      '<div class="explorer-panel-title">Policy space</div>' +
      '<svg class="explorer-cube-svg" viewBox="0 0 ' + CUBE_VIEWBOX.width + " " + CUBE_VIEWBOX.height + '" ' +
      'role="img" aria-label="Three-dimensional view of the policy space, alpha vertical, phi horizontal, tau receding">' +
      '<g data-el="cube-wire"></g>' +
      '<g data-el="cube-surface"></g>' +
      '<g data-el="cube-contour"></g>' +
      '<g data-el="cube-axis-wire"></g>' +
      '<g data-el="cube-labels"></g>' +
      '<g data-el="cube-guides"></g>' +
      '<circle data-el="cube-marker" r="5" class="explorer-cube-marker" visibility="hidden"></circle>' +
      "</svg>" +
      "</div>" +
      '<div class="explorer-right-col">' +
      '<div class="explorer-tau-slot">' +
      sliderRow("tau", labels.tau) +
      '<p class="explorer-tau-note">' + labels.tauNote + "</p>" +
      "</div>" +
      '<div class="explorer-heatmap-panel">' +
      '<div class="explorer-panel-title" data-out="heatmap-title">—</div>' +
      '<svg class="explorer-heatmap-svg" viewBox="0 0 ' + HEATMAP_VIEWBOX.width + " " + HEATMAP_VIEWBOX.height + '" ' +
      'role="img" aria-label="Heatmap of the selected outcome across affordable share and density bonus at the current tax exemption" ' +
      'data-el="heatmap-svg">' +
      '<g data-el="heatmap-surface"></g>' +
      '<g data-el="heatmap-contour"></g>' +
      '<g data-el="heatmap-labels"></g>' +
      '<g data-el="heatmap-marker"></g>' +
      "</svg>" +
      '<div class="explorer-heatmap-legend">' +
      '<div class="explorer-heatmap-legend-title" data-out="legend-title">—</div>' +
      '<div class="explorer-heatmap-legend-scale">' +
      '<span class="explorer-heatmap-legend-label" data-out="legend-min">—</span>' +
      '<div class="explorer-heatmap-legend-bar-wrap">' +
      '<span class="explorer-heatmap-legend-bar"></span>' +
      '<span class="explorer-heatmap-legend-zero-tick"></span>' +
      "</div>" +
      '<span class="explorer-heatmap-legend-label" data-out="legend-max">—</span>' +
      "</div>" +
      "</div>" +
      '<p class="explorer-heatmap-hint">' + labels.heatmapHint + "</p>" +
      "</div>" +
      "</div>" +
      "</div>" +
      '<p class="explorer-heatmap-caption" data-out="heatmap-caption">—</p>' +
      '<div class="explorer-controls-row">' +
      '<fieldset>' +
      '<legend class="sr-only">Policy instruments</legend>' +
      sliderRow("alpha", labels.alpha) +
      sliderRow("phi", labels.phi) +
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
      '<div class="explorer-readout">' +
      '<div class="explorer-readout-label">' + labels.taxImpact + '</div>' +
      '<div class="explorer-readout-value" data-out="tax">—</div>' +
      "</div>" +
      '<div class="explorer-readout">' +
      '<div class="explorer-readout-label">' + labels.landownerImpact + '</div>' +
      '<div class="explorer-readout-value" data-out="pv">—</div>' +
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
      '<p class="explorer-scatter-caption">X-axis is the change in affordable units, y-axis is the change in market-rate units; the diagonal marks where total units are unchanged from baseline; the shaded area is a net decrease.</p>';

    function sliderRow(key, label) {
      return '<div class="explorer-slider-row" data-slider-row="' + key + '">' +
        '<label for="explorer-' + key + '">' + label +
        ' <output id="explorer-' + key + '-out">—</output></label>' +
        '<input type="range" id="explorer-' + key + '" />' +
        "</div>";
    }

    var state = {
      metric: "production",
      alphaIdx: 0, phiIdx: 0, tauIdx: 0,
      alphaLevels: null, phiLevels: null, tauLevels: null,
      alphaEdges: null, phiEdges: null,
      grid3D: null,
      domain: { production: 0, rent: 0 }
    };

    var heatProject = heatmapProjector();
    var cubeProject = cubeProjector();

    var modeButtons = container.querySelectorAll(".explorer-mode-btn");
    var alphaInput = container.querySelector("#explorer-alpha");
    var phiInput = container.querySelector("#explorer-phi");
    var tauInput = container.querySelector("#explorer-tau");

    function currentRow() {
      return state.grid3D[state.alphaIdx][state.phiIdx][state.tauIdx];
    }

    function sliceValues(tauIdx, metricKey) {
      var out = [];
      for (var ai = 0; ai < state.alphaLevels.length; ai++) {
        var row = [];
        for (var pj = 0; pj < state.phiLevels.length; pj++) {
          row.push(state.grid3D[ai][pj][tauIdx][METRICS[metricKey].key]);
        }
        out.push(row);
      }
      return out;
    }

    function renderSlice() {
      var metric = METRICS[state.metric];
      var maxAbs = state.domain[state.metric];
      var values = sliceValues(state.tauIdx, state.metric);
      var tT = state.tauIdx / (state.tauLevels.length - 1);

      container.querySelector('[data-out="legend-min"]').textContent = metric.fmt(-maxAbs);
      container.querySelector('[data-out="legend-max"]').textContent = metric.fmt(maxAbs);
      container.querySelector('[data-out="legend-title"]').textContent = metric.legendTitle;
      container.querySelector('[data-out="heatmap-title"]').textContent = metric.panelTitle;

      renderSurface(
        container.querySelector('[data-el="heatmap-surface"]'),
        values, maxAbs,
        HEATMAP_PLOT.x0, HEATMAP_PLOT.y0 - HEATMAP_PLOT.h, HEATMAP_PLOT.w, HEATMAP_PLOT.h
      );
      renderContour(container.querySelector('[data-el="heatmap-contour"]'), values, heatProject, 0);
      addHeatmapAxisLabels(container.querySelector('[data-el="heatmap-labels"]'), state.alphaLevels, state.phiLevels, heatProject);

      var cubeSliceX = CUBE_PLOT.x0 + tT * CUBE_TAU_DX;
      var cubeSliceY = CUBE_PLOT.y0 - tT * CUBE_TAU_DY - CUBE_PLOT.h;
      renderSurface(
        container.querySelector('[data-el="cube-surface"]'),
        values, maxAbs,
        cubeSliceX, cubeSliceY, CUBE_PLOT.w, CUBE_PLOT.h
      );
      renderContour(container.querySelector('[data-el="cube-contour"]'), values, cubeProject, tT);
    }

    function renderWireframe() {
      var corners = cubeCorners(cubeProject);
      var wireGroup = container.querySelector('[data-el="cube-wire"]');
      wireGroup.textContent = "";
      var frag = document.createDocumentFragment();
      buildWireframeEdges(corners).forEach(function (e) {
        frag.appendChild(svgEl("line", { x1: e[0].x, y1: e[0].y, x2: e[1].x, y2: e[1].y, class: "explorer-cube-wire" }));
      });
      wireGroup.appendChild(frag);

      var axisGroup = container.querySelector('[data-el="cube-axis-wire"]');
      axisGroup.textContent = "";
      var origin = cubeProject(0, 0, 0);
      var aAxis = svgEl("line", { x1: origin.x, y1: origin.y, x2: cubeProject(1, 0, 0).x, y2: cubeProject(1, 0, 0).y, class: "explorer-cube-axis" });
      var pAxis = svgEl("line", { x1: origin.x, y1: origin.y, x2: cubeProject(0, 1, 0).x, y2: cubeProject(0, 1, 0).y, class: "explorer-cube-axis" });
      var tAxis = svgEl("line", { x1: origin.x, y1: origin.y, x2: cubeProject(0, 0, 1).x, y2: cubeProject(0, 0, 1).y, class: "explorer-cube-axis" });
      axisGroup.appendChild(aAxis);
      axisGroup.appendChild(pAxis);
      axisGroup.appendChild(tAxis);

      addCubeAxisLabels(container.querySelector('[data-el="cube-labels"]'), state.alphaLevels, state.phiLevels, state.tauLevels, cubeProject);
    }

    function renderMarker() {
      var aT = state.alphaIdx / (state.alphaLevels.length - 1);
      var pT = state.phiIdx / (state.phiLevels.length - 1);
      var tT = state.tauIdx / (state.tauLevels.length - 1);

      var hp = heatProject(aT, pT, 0);
      var heatMarkerGroup = container.querySelector('[data-el="heatmap-marker"]');
      heatMarkerGroup.textContent = "";
      heatMarkerGroup.appendChild(svgEl("line", { x1: HEATMAP_PLOT.x0, y1: hp.y, x2: HEATMAP_PLOT.x0 + HEATMAP_PLOT.w, y2: hp.y, class: "explorer-heatmap-guide" }));
      heatMarkerGroup.appendChild(svgEl("line", { x1: hp.x, y1: HEATMAP_PLOT.y0 - HEATMAP_PLOT.h, x2: hp.x, y2: HEATMAP_PLOT.y0, class: "explorer-heatmap-guide" }));
      heatMarkerGroup.appendChild(svgEl("circle", { cx: hp.x, cy: hp.y, r: 4, class: "explorer-heatmap-marker-dot" }));

      var cp = cubeProject(aT, pT, tT);
      var floorP = cubeProject(0, pT, tT);
      var axisP = cubeProject(0, 0, tT);
      var guideGroup = container.querySelector('[data-el="cube-guides"]');
      guideGroup.textContent = "";
      guideGroup.appendChild(svgEl("line", { x1: cp.x, y1: cp.y, x2: floorP.x, y2: floorP.y, class: "explorer-cube-guide" }));
      guideGroup.appendChild(svgEl("line", { x1: floorP.x, y1: floorP.y, x2: axisP.x, y2: axisP.y, class: "explorer-cube-guide" }));

      var marker = container.querySelector('[data-el="cube-marker"]');
      marker.setAttribute("cx", cp.x);
      marker.setAttribute("cy", cp.y);
      marker.removeAttribute("visibility");
    }

    function renderScatterMarker(row) {
      var marker = container.querySelector('[data-el="live-marker"]');
      marker.setAttribute("cx", scatterXPixel(row.Aff_chg));
      marker.setAttribute("cy", scatterYPixel(row.marketChg));
      marker.removeAttribute("visibility");
    }

    function renderReadouts(row) {
      var netEl = container.querySelector('[data-out="net"]');
      netEl.textContent = fmtUnits(row.AptNet_chg);
      netEl.className = "explorer-readout-value " + signClass(row.AptNet_chg);

      var rentEl = container.querySelector('[data-out="rent"]');
      rentEl.textContent = fmtPct(row.rentPct);
      rentEl.className = "explorer-readout-value " + signClass(row.rentPct);

      var taxEl = container.querySelector('[data-out="tax"]');
      taxEl.textContent = fmtPct(row.taxPct);
      taxEl.className = "explorer-readout-value " + signClass(row.taxPct);

      var pvEl = container.querySelector('[data-out="pv"]');
      pvEl.textContent = fmtPct(row.pvPct);
      pvEl.className = "explorer-readout-value " + signClass(row.pvPct);

      container.querySelector('[data-out="affordable-num"]').textContent = fmtUnits(row.Aff_chg);
      container.querySelector('[data-out="market-num"]').textContent = fmtUnits(row.marketChg);

      var total = Math.abs(row.Aff_chg) + Math.abs(row.marketChg);
      var affPct = total === 0 ? 0 : (Math.abs(row.Aff_chg) / total) * 100;
      container.querySelector('[data-out="split-affordable"]').style.width = affPct + "%";
      container.querySelector('[data-out="split-market"]').style.width = (100 - affPct) + "%";
    }

    function renderCaption() {
      var alpha = state.alphaLevels[state.alphaIdx];
      var phi = state.phiLevels[state.phiIdx];
      var tau = state.tauLevels[state.tauIdx];
      container.querySelector('[data-out="heatmap-caption"]').textContent =
        "α = " + fmtAlpha(alpha) + ", φ = " + fmtPhi(phi) + ", τ = " + Math.round(tau) + " years";
    }

    function render() {
      if (!state.grid3D) return;
      alphaInput.value = state.alphaIdx;
      phiInput.value = state.phiIdx;
      tauInput.value = state.tauIdx;
      container.querySelector("#explorer-alpha-out").textContent = fmtAlpha(state.alphaLevels[state.alphaIdx]);
      container.querySelector("#explorer-phi-out").textContent = fmtPhi(state.phiLevels[state.phiIdx]);
      container.querySelector("#explorer-tau-out").textContent = fmtTau(state.tauLevels[state.tauIdx]);

      renderSlice();
      renderMarker();
      var row = currentRow();
      renderReadouts(row);
      renderScatterMarker(row);
      renderCaption();
    }

    function nearestIndex(levels, value) {
      var best = 0, bestDist = Infinity;
      for (var i = 0; i < levels.length; i++) {
        var d = Math.abs(levels[i] - value);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      return best;
    }

    function setFromHeatmapEvent(evt) {
      var svg = container.querySelector('[data-el="heatmap-svg"]');
      var pt = svg.createSVGPoint();
      pt.x = evt.clientX;
      pt.y = evt.clientY;
      var ctm = svg.getScreenCTM();
      if (!ctm) return;
      var local = pt.matrixTransform(ctm.inverse());
      var pT = (local.x - HEATMAP_PLOT.x0) / HEATMAP_PLOT.w;
      var aT = (HEATMAP_PLOT.y0 - local.y) / HEATMAP_PLOT.h;
      pT = Math.max(0, Math.min(1, pT));
      aT = Math.max(0, Math.min(1, aT));
      state.alphaIdx = Math.round(aT * (state.alphaLevels.length - 1));
      state.phiIdx = Math.round(pT * (state.phiLevels.length - 1));
      render();
    }

    var heatmapSvg = container.querySelector('[data-el="heatmap-svg"]');
    var dragging = false;
    heatmapSvg.addEventListener("pointerdown", function (evt) {
      dragging = true;
      heatmapSvg.setPointerCapture(evt.pointerId);
      setFromHeatmapEvent(evt);
    });
    heatmapSvg.addEventListener("pointermove", function (evt) {
      if (dragging) setFromHeatmapEvent(evt);
    });
    heatmapSvg.addEventListener("pointerup", function (evt) {
      dragging = false;
      heatmapSvg.releasePointerCapture(evt.pointerId);
    });

    modeButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.metric = btn.dataset.metric;
        modeButtons.forEach(function (b) {
          b.setAttribute("aria-pressed", b.dataset.metric === state.metric ? "true" : "false");
        });
        render();
      });
    });

    alphaInput.addEventListener("input", function () { state.alphaIdx = parseInt(alphaInput.value, 10); render(); });
    phiInput.addEventListener("input", function () { state.phiIdx = parseInt(phiInput.value, 10); render(); });
    tauInput.addEventListener("input", function () { state.tauIdx = parseInt(tauInput.value, 10); render(); });

    function renderScatterRefPoints() {
      var refGroup = container.querySelector('[data-el="ref-points"]');
      refGroup.textContent = "";
      var frag = document.createDocumentFragment();
      SCATTER_REF_POINTS.forEach(function (ref) {
        var ai = nearestIndex(state.alphaLevels, ref.alpha);
        var pj = nearestIndex(state.phiLevels, ref.phi);
        var tk = nearestIndex(state.tauLevels, ref.tau);
        var row = state.grid3D[ai][pj][tk];
        if (!row) return;
        var cx = scatterXPixel(row.Aff_chg), cy = scatterYPixel(row.marketChg);
        frag.appendChild(svgEl("polygon", { class: "explorer-scatter-refpoint", points: diamondPoints(cx, cy, 6) }));
        var text = svgEl("text", { class: "explorer-scatter-reflabel", x: cx + 9, y: cy - 9 });
        text.textContent = ref.label;
        frag.appendChild(text);
      });
      refGroup.appendChild(frag);
    }

    fetch(dataPath + "grid-full.csv").then(function (r) { return r.text(); }).then(function (text) {
      var rows = parseCSV(text);
      state.alphaLevels = uniqueSorted(rows.map(function (r) { return r.alpha; }));
      state.phiLevels = uniqueSorted(rows.map(function (r) { return r.phi; }));
      state.tauLevels = uniqueSorted(rows.map(function (r) { return r.tau; }));
      state.alphaEdges = cellEdges(state.alphaLevels.length);
      state.phiEdges = cellEdges(state.phiLevels.length);
      state.grid3D = buildGrid3D(rows, state.alphaLevels, state.phiLevels, state.tauLevels);
      state.domain.production = globalAbsMax(rows, "AptNet_chg");
      state.domain.rent = globalAbsMax(rows, "rentPct");

      alphaInput.min = 0; alphaInput.max = state.alphaLevels.length - 1; alphaInput.step = 1;
      phiInput.min = 0; phiInput.max = state.phiLevels.length - 1; phiInput.step = 1;
      tauInput.min = 0; tauInput.max = state.tauLevels.length - 1; tauInput.step = 1;

      // Illustrative non-baseline default: the paper's 30% mandate scenario,
      // density bonus at the midpoint, no tax exemption.
      state.alphaIdx = nearestIndex(state.alphaLevels, 0.3);
      state.phiIdx = Math.floor(state.phiLevels.length / 2);
      state.tauIdx = 0;

      renderWireframe();
      renderScatterRefPoints();
      render();
    }).catch(function (err) {
      var banner = container.querySelector(".explorer-banner");
      banner.hidden = false;
      banner.textContent =
        "Explorer data failed to load (" + err.message + "). If you opened this " +
        "file directly, serve the site over http:// instead of file:// so the " +
        "CSV grid can be fetched.";
    });
  }

  global.CarrotStickExplorer = {
    init: init
  };
})(window);
