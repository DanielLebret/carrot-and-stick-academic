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
*/

(function (global) {
  "use strict";

  var PLACEHOLDER_GRID = true;

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

    var state = { mode: "diz", dizGrid: null, fizGrid: null };

    var modeButtons = container.querySelectorAll(".explorer-mode-btn");
    var dizFieldset = container.querySelector('[data-fieldset="diz"]');
    var fizFieldset = container.querySelector('[data-fieldset="fiz"]');

    function setupSlider(id, axisVals, step) {
      var input = container.querySelector("#explorer-" + id);
      input.min = axisVals[0];
      input.max = axisVals[axisVals.length - 1];
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

    function render() {
      var out;
      if (state.mode === "diz") {
        var alpha = parseFloat(container.querySelector("#explorer-alpha-diz").value);
        var phi = parseFloat(container.querySelector("#explorer-phi").value);
        container.querySelector("#explorer-alpha-diz-out").textContent = alpha.toFixed(2);
        container.querySelector("#explorer-phi-out").textContent = phi.toFixed(2);
        out = interpolate(state.dizGrid, alpha, phi);
      } else {
        var alpha2 = parseFloat(container.querySelector("#explorer-alpha-fiz").value);
        var tau = parseFloat(container.querySelector("#explorer-tau").value);
        container.querySelector("#explorer-alpha-fiz-out").textContent = alpha2.toFixed(2);
        container.querySelector("#explorer-tau-out").textContent = tau.toFixed(0) + " yrs";
        out = interpolate(state.fizGrid, alpha2, tau);
      }

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

      var dizAlphaInput = setupSlider("alpha-diz", state.dizGrid.aVals, axisStep(state.dizGrid.aVals));
      var phiInput = setupSlider("phi", state.dizGrid.bVals, axisStep(state.dizGrid.bVals));
      var fizAlphaInput = setupSlider("alpha-fiz", state.fizGrid.aVals, axisStep(state.fizGrid.aVals));
      var tauInput = setupSlider("tau", state.fizGrid.bVals, axisStep(state.fizGrid.bVals));

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
