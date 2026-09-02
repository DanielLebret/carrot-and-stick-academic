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

  STATUS: the CSVs currently shipped are an illustrative placeholder grid, not
  Max's simulation output. See the PLACEHOLDER_GRID flag below and the on-page
  banner. When the real CSVs land in this folder with the same column headers,
  no code change is needed here; only the flag and banner copy should be updated.

  Heatmap panels (top of the explorer, above the mode toggle): these are the
  real paper figures (11a/b for Density Incentive Zoning, D10a/b for Fiscal
  Incentive Zoning), not placeholders, read from config.figuresPath. Each is
  a static 2400x1350 image with a marker overlaid at the current slider
  position via a fixed pixel calibration (HEATMAP_CONFIG / Y_CALIBRATION
  below), converted to percentages of image width/height so it tracks
  correctly regardless of the image's rendered size. The mandate share (α),
  density bonus (φ), and tax-exemption (τ) sliders are capped to match the
  real plotted range in these figures (75%, 100%, 30 years) rather than the
  narrower range of the placeholder DIZ/FIZ grid (40%, 60%, 25 years); the
  net-units/rent-change readouts still clamp to the grid's actual support
  (interpolate() below never extrapolates), so they hold flat past the
  grid's edge until the real simulation grid lands.
*/

(function (global) {
  "use strict";

  var PLACEHOLDER_GRID = true;

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
      whoPays: "Public / landowner cost split"
    }, config.labels || {});
    var leadReadout = config.leadReadout || "percent"; // 'percent' | 'whoPays'
    var bannerText = config.bannerText ||
      "Illustrative data, pending final simulation grid.";

    container.innerHTML =
      '<div class="explorer-banner" role="note">' + bannerText + "</div>" +
      '<div class="explorer-heatmaps">' +
      heatmapPanel("units", "Net new units") +
      heatmapPanel("rent", "Average expected rent change") +
      "</div>" +
      '<p class="explorer-heatmap-caption" data-out="heatmap-caption">—</p>' +
      '<div class="explorer-modes" role="tablist" aria-label="Policy mode">' +
      '<button type="button" class="explorer-mode-btn" data-mode="diz" ' +
      'role="tab" aria-pressed="true">' + labels.diz + "</button>" +
      '<button type="button" class="explorer-mode-btn" data-mode="fiz" ' +
      'role="tab" aria-pressed="false">' + labels.fiz + "</button>" +
      "</div>" +
      '<div class="explorer-body">' +
      '<div class="explorer-controls">' +
      '<fieldset data-fieldset="diz">' +
      '<legend>' + labels.diz + '</legend>' +
      sliderRow("alpha-diz", labels.alpha) +
      sliderRow("phi", labels.phi) +
      "</fieldset>" +
      '<fieldset data-fieldset="fiz" hidden>' +
      '<legend>' + labels.fiz + '</legend>' +
      sliderRow("alpha-fiz", labels.alpha) +
      sliderRow("tau", labels.tau) +
      "</fieldset>" +
      "</div>" +
      '<div class="explorer-readouts" aria-live="polite">' +
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
      '<div class="explorer-note">' +
      "The public/landowner cost split (Figure 12) is not part of this grid yet; " +
      "see Finding 3 above for the reported per-unit cost and incidence." +
      "</div>" +
      "</div>" +
      "</div>";

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

    var state = { mode: "diz", dizGrid: null, fizGrid: null };

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

      // Sliders are capped to ALPHA_UI_MAX/PHI_UI_MAX/TAU_UI_MAX (the real
      // heatmap figures' plotted range), wider than the placeholder grid's
      // own support (state.*Grid.aVals/bVals); interpolate() clamps to the
      // grid's edge for anything past it, so the readouts hold flat rather
      // than extrapolating.
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

      render();
    }).catch(function (err) {
      container.querySelector(".explorer-banner").textContent =
        "Explorer data failed to load (" + err.message + "). If you opened this " +
        "file directly, serve the site over http:// instead of file:// so the " +
        "CSV grids can be fetched.";
    });

    switchMode("diz");
  }

  global.CarrotStickExplorer = {
    init: init,
    PLACEHOLDER_GRID: PLACEHOLDER_GRID
  };
})(window);
