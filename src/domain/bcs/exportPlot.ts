import { APP_NAME, APP_VERSION } from "../../appMetadata.ts";
import { buildSessionExportPackage } from "./exportSession.ts";
import type { ExplorerState, SessionExportPackage } from "./types.ts";

const EXPORT_WIDTH = 960;
const EXPORT_HEIGHT = 640;
const PADDING = 56;

export function buildPlotExportSvg(state: ExplorerState, exportedAt = new Date().toISOString()): string {
  const sessionPackage = buildSessionExportPackage(state, exportedAt);
  const title = `BCS gap plot export`;
  const sessionFilename = `bcs-session-v${sessionPackage.app.version}-state-${sessionPackage.stateVersion}.json`;
  const titleText = escapeXml(title);
  const descText = escapeXml(
    `Generated from ${sessionPackage.app.name} ${sessionPackage.app.version}. State version ${sessionPackage.stateVersion}. ` +
      `Matching session package: ${sessionFilename}. Trust status ${sessionPackage.sessionTrustStatus}. ` +
      `Validity status ${sessionPackage.validity.status}.`,
  );
  const issueLines = buildIssueLines(sessionPackage);
  const hasRenderedPlot = Boolean(sessionPackage.computed.plotView?.plot);
  const bannerY = hasRenderedPlot ? 492 : 388;
  const issueStartY = hasRenderedPlot ? 524 : 420;
  const plotMarkup = buildPlotMarkup(sessionPackage);
  const issueMarkup = issueLines
    .map(
      (line, index) =>
        `<text x="${PADDING}" y="${issueStartY + index * 24}" class="issue-copy">${escapeXml(line)}</text>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${EXPORT_WIDTH}" height="${EXPORT_HEIGHT}" viewBox="0 0 ${EXPORT_WIDTH} ${EXPORT_HEIGHT}" role="img" aria-labelledby="plot-export-title plot-export-desc">
  <title id="plot-export-title">${titleText}</title>
  <desc id="plot-export-desc">${descText}</desc>
  <metadata>${escapeXml(
    JSON.stringify({
      app: { name: APP_NAME, version: APP_VERSION },
      exportedAt,
      stateVersion: sessionPackage.stateVersion,
      sessionTrustStatus: sessionPackage.sessionTrustStatus,
      validityStatus: sessionPackage.validity.status,
      updateStatus: sessionPackage.updateStatus,
      matchingSessionPackage: sessionFilename,
    }),
  )}</metadata>
  <style>
    .frame { fill: #fbf7ee; stroke: #b7a98e; stroke-width: 2; rx: 24; }
    .title { font: 700 28px Georgia, serif; fill: #1a2020; }
    .subtitle { font: 600 15px \"IBM Plex Sans\", sans-serif; fill: #216869; letter-spacing: 0.04em; text-transform: uppercase; }
    .meta { font: 500 16px \"IBM Plex Sans\", sans-serif; fill: #354646; }
    .axis { stroke: #526262; stroke-width: 2; }
    .line { fill: none; stroke: #0d6b6f; stroke-width: 3; }
    .point { fill: #ba3f1d; stroke: #fbf7ee; stroke-width: 2; }
    .axis-label { font: 600 15px \"IBM Plex Sans\", sans-serif; fill: #1a2020; }
    .readout-label { font: 600 15px \"IBM Plex Sans\", sans-serif; fill: #354646; }
    .readout-value { font: 700 18px \"IBM Plex Sans\", sans-serif; fill: #1a2020; }
    .banner { font: 600 17px \"IBM Plex Sans\", sans-serif; }
    .banner-valid { fill: #216869; }
    .banner-constrained { fill: #8a6100; }
    .banner-invalid, .banner-failed { fill: #a12d17; }
    .issue-copy { font: 500 15px \"IBM Plex Sans\", sans-serif; fill: #354646; }
    .footer { font: 500 14px \"IBM Plex Sans\", sans-serif; fill: #526262; }
  </style>
  <rect class="frame" x="12" y="12" width="${EXPORT_WIDTH - 24}" height="${EXPORT_HEIGHT - 24}" />
  <text x="${PADDING}" y="54" class="subtitle">Teaching export</text>
  <text x="${PADDING}" y="92" class="title">Weak-coupling BCS gap plot</text>
  <text x="${PADDING}" y="122" class="meta">State ${sessionPackage.stateVersion} · trust ${escapeXml(sessionPackage.sessionTrustStatus)} · validity ${escapeXml(
    sessionPackage.validity.status,
  )} · update ${escapeXml(sessionPackage.updateStatus)}</text>
  <text x="${PADDING}" y="146" class="meta">Matching session package: ${escapeXml(sessionFilename)}</text>
  ${plotMarkup}
  <text x="${PADDING}" y="${bannerY}" class="banner banner-${bannerClass(sessionPackage)}">${escapeXml(buildBannerText(sessionPackage))}</text>
  ${issueMarkup}
  <text x="${PADDING}" y="${EXPORT_HEIGHT - 36}" class="footer">Export initiated by explicit user action. App ${escapeXml(
    sessionPackage.app.version,
  )}.</text>
</svg>`;
}

export function downloadPlotExport(state: ExplorerState): string {
  const sessionPackage = buildSessionExportPackage(state);
  const payload = buildPlotExportSvg(state);
  const blob = new Blob([payload], { type: "image/svg+xml" });
  const objectUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const filename = `bcs-plot-v${sessionPackage.app.version}-state-${sessionPackage.stateVersion}.svg`;

  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(objectUrl);

  return filename;
}

function buildPlotMarkup(sessionPackage: SessionExportPackage): string {
  const plot = sessionPackage.computed.plotView?.plot;
  if (!plot || plot.samples.length === 0) {
    return `<rect x="${PADDING}" y="180" width="${EXPORT_WIDTH - PADDING * 2}" height="180" fill="#fffaf0" stroke="#d2c6b1" stroke-dasharray="6 6" />
  <text x="${PADDING + 24}" y="230" class="readout-label">Plot unavailable for this exported state.</text>
  <text x="${PADDING + 24}" y="260" class="readout-value">${escapeXml(sessionPackage.computed.outputs.message ?? "No validated plot data is available.")}</text>`;
  }

  const maxT = plot.domain.maxT || 1;
  const maxDelta = Math.max(...plot.samples.map((sample) => sample.Delta), 1e-9);
  const plotWidth = EXPORT_WIDTH - PADDING * 2;
  const plotHeight = 180;
  const plotBottom = 180 + plotHeight;
  const path = plot.samples
    .map((point, index) => {
      const x = PADDING + (point.T / maxT) * plotWidth;
      const y = plotBottom - (point.Delta / maxDelta) * plotHeight;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const selectedX = PADDING + (plot.selectedPoint.T / maxT) * plotWidth;
  const selectedY = plotBottom - (plot.selectedPoint.Delta / maxDelta) * plotHeight;

  return `<line x1="${PADDING}" y1="${plotBottom}" x2="${EXPORT_WIDTH - PADDING}" y2="${plotBottom}" class="axis" />
  <line x1="${PADDING}" y1="180" x2="${PADDING}" y2="${plotBottom}" class="axis" />
  <path d="${path}" class="line" />
  <circle cx="${selectedX.toFixed(2)}" cy="${selectedY.toFixed(2)}" r="5" class="point" />
  <text x="${EXPORT_WIDTH / 2}" y="${plotBottom + 30}" text-anchor="middle" class="axis-label">Temperature T (energy)</text>
  <text x="28" y="${180 + plotHeight / 2}" text-anchor="middle" transform="rotate(-90 28 ${180 + plotHeight / 2})" class="axis-label">Gap Δ(T) (energy)</text>
  <text x="${PADDING}" y="${plotBottom + 60}" class="readout-label">Selected T</text>
  <text x="${PADDING}" y="${plotBottom + 84}" class="readout-value">${escapeXml(plot.selectedPoint.T.toPrecision(6))}</text>
  <text x="${PADDING + 220}" y="${plotBottom + 60}" class="readout-label">Selected Δ(T)</text>
  <text x="${PADDING + 220}" y="${plotBottom + 84}" class="readout-value">${escapeXml(plot.selectedPoint.Delta.toPrecision(6))}</text>
  <text x="${PADDING + 460}" y="${plotBottom + 60}" class="readout-label">Rendered state version</text>
  <text x="${PADDING + 460}" y="${plotBottom + 84}" class="readout-value">${escapeXml(String(sessionPackage.computed.outputs.renderedStateVersion ?? "n/a"))}</text>`;
}

function buildIssueLines(sessionPackage: SessionExportPackage): string[] {
  const lines = [
    `Warning/validity context: ${sessionPackage.validity.status}.`,
  ];

  for (const issue of sessionPackage.validity.issues) {
    lines.push(`${issue.status}: ${issue.message}`);
  }

  if (sessionPackage.computed.outputs.message) {
    lines.push(sessionPackage.computed.outputs.message);
  }

  if (sessionPackage.updateStatus === "pending") {
    lines.push("Updating: this export captures the currently held validated plot view while recomputation is still pending.");
  }

  return lines.slice(0, 4);
}

function buildBannerText(sessionPackage: SessionExportPackage): string {
  if (sessionPackage.sessionTrustStatus === "failed") {
    return "Failed state: export preserves the solver failure context instead of fabricating a plot.";
  }
  if (sessionPackage.sessionTrustStatus === "invalid") {
    return "Invalid state: export preserves the invalidity context and plot suppression.";
  }
  if (sessionPackage.sessionTrustStatus === "constrained") {
    return "Constrained state: use this plot with the attached warning context.";
  }
  if (sessionPackage.updateStatus === "pending") {
    return "Pending state: currently held validated plot exported with updating context.";
  }
  return "Valid state: plot export is tied to the validated computed session state.";
}

function bannerClass(sessionPackage: SessionExportPackage): "valid" | "constrained" | "invalid" | "failed" {
  if (sessionPackage.sessionTrustStatus === "failed") {
    return "failed";
  }
  if (sessionPackage.sessionTrustStatus === "invalid") {
    return "invalid";
  }
  if (sessionPackage.sessionTrustStatus === "constrained") {
    return "constrained";
  }
  return "valid";
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
