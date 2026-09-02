/*
  Academic site's wrapper config for the shared policy explorer
  (../resources/explorer/). Percentages and plain instrument names foregrounded,
  per academic/CLAUDE.md ("percentages foregrounded, plus the supply-neutral
  contour if data allows"). The supply-neutral contour is deferred until the
  grid carries enough resolution to draw it (see explorer.js note and index.html
  pending-items list).
*/
document.addEventListener("DOMContentLoaded", function () {
  var root = document.getElementById("explorer-root");
  if (!root || !window.CarrotStickExplorer) return;

  window.CarrotStickExplorer.init(root, {
    dataPath: "../resources/explorer/",
    leadReadout: "percent",
    bannerText: "Illustrative data, pending final simulation grid.",
    labels: {
      diz: "Density Incentive Zoning",
      fiz: "Fiscal Incentive Zoning",
      alpha: "Affordable share (mandate, α)",
      phi: "Density bonus (φ)",
      tau: "Tax exemption, years (τ)",
      netUnits: "Net new units vs. no-policy baseline",
      rentChange: "Average expected rent change vs. baseline",
      whoPays: "Public / landowner cost split"
    }
  });
});
