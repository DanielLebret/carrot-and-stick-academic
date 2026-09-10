/*
  Policy site's wrapper config for the shared policy explorer
  (../resources/explorer/). Per policy/CLAUDE.md: plainer labels than
  academic, "who pays" foregrounded via the separate Explore the Incidence
  widget in The Cost section rather than a restructured readout order here
  (the shared engine's readouts are already plain unit counts + a rent
  percentage, not the percentage/supply-neutral-contour framing that
  academic's own CLAUDE.md once described and that was never actually
  built; there is nothing to "lead with unit counts instead of" in the
  current engine). No bannerText override: real data, no banner needed,
  same as academic.
*/
document.addEventListener("DOMContentLoaded", function () {
  var root = document.getElementById("explorer-root");
  if (!root || !window.CarrotStickExplorer) return;

  window.CarrotStickExplorer.init(root, {
    dataPath: "../resources/explorer/",
    figuresPath: "../resources/figures/",
    labels: {
      diz: "Density Incentive Zoning",
      fiz: "Fiscal Incentive Zoning",
      alpha: "Mandate share (affordable, α)",
      phi: "Density bonus (φ)",
      tau: "Tax exemption, years (τ)",
      netUnits: "Net new units",
      rentChange: "Average rent effect",
      costSplitNote: "The public/landowner cost split is not part of this " +
        "grid; see The Cost above for the per-unit cost and incidence, or " +
        "move the mandate slider there to see it at any level."
    }
  });
});
