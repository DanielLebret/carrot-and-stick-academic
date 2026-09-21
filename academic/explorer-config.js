/*
  Academic site's wrapper config for the shared policy explorer
  (../resources/explorer/). Percentages and plain instrument names foregrounded,
  per academic/CLAUDE.md ("percentages foregrounded, plus the supply-neutral
  contour if data allows"). The supply-neutral (net-units=0) contour now
  renders directly on both the heatmap and cube slice, traced from the full
  factorial grid (see explorer.js).
*/
document.addEventListener("DOMContentLoaded", function () {
  var root = document.getElementById("explorer-root");
  if (!root || !window.CarrotStickExplorer) return;

  window.CarrotStickExplorer.init(root, {
    dataPath: "../resources/explorer/",
    figuresPath: "../resources/figures/",
    leadReadout: "percent",
    labels: {
      metricProduction: "Production",
      metricRent: "Rent",
      alpha: "Affordable share (mandate, α)",
      phi: "Density bonus (φ)",
      tau: "Tax exemption, years (τ)",
      netUnits: "Net new units vs. no-policy baseline",
      rentChange: "Average expected rent change vs. baseline",
      whoPays: "Public / landowner cost split",
      costSplitNote: "Reflects the full fiscal and property-value effect of " +
        "this policy, including any change in total production. This is not " +
        "the same as the per-unit incidence analysis in Finding 3 above, " +
        "which isolates the affordable/market trade-off by holding total " +
        "production fixed."
    }
  });
});
