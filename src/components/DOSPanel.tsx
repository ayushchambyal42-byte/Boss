import { useEffect } from "react";
import { formatMeV } from "../domain/bcs/displayUnits.ts";
import { buildDosCurveWithDomain, deriveDynesGamma, isNormalMetal } from "../domain/bcs/dos.ts";

export function DOSPanel(props: { delta: number; delta0: number; traceDeltas: number[]; unavailable?: boolean }) {
  const delta = props.delta;
  const delta0 = props.delta0;
  const traceDeltas = props.traceDeltas;
  const unavailable = Boolean(props.unavailable);
  const width = 640;
  const height = 320;
  const paddingLeft = 56;
  const paddingRight = 28;
  const paddingTop = 28;
  const paddingBottom = 52;
  const tickMargin = 8;

  useEffect(() => {
    console.log("DOS delta:", delta);
  }, [delta]);

  const gamma = deriveDynesGamma(delta0);
  const domainDelta = Math.max(
    Number.isFinite(delta0) ? Math.abs(delta0) : 0,
    Number.isFinite(delta) ? Math.abs(delta) : 0,
    ...traceDeltas.map((traceDelta) => (Number.isFinite(traceDelta) ? Math.abs(traceDelta) : 0)),
    0,
  );
  const sharedEMax = domainDelta > 0 ? 3 * domainDelta : 1;
  const normalMetal = isNormalMetal(delta);
  const currentCurve = buildDosCurveWithDomain(delta, gamma, sharedEMax);
  const traceCurves = traceDeltas.map((traceDelta) => buildDosCurveWithDomain(traceDelta, gamma, sharedEMax));
  const maxDos = Math.max(
    ...currentCurve.points.flatMap((point) => (point.N !== null && Number.isFinite(point.N) ? [point.N] : [])),
    ...traceCurves.flatMap((curve) => curve.points.flatMap((point) => (point.N !== null && Number.isFinite(point.N) ? [point.N] : []))),
    1,
  );
  const markerOffset = normalMetal || !Number.isFinite(delta) ? 0 : Math.min(Math.abs(delta), currentCurve.eMax);
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const leftGapX = paddingLeft + ((-markerOffset + currentCurve.eMax) / (2 * currentCurve.eMax)) * plotWidth;
  const rightGapX = paddingLeft + ((markerOffset + currentCurve.eMax) / (2 * currentCurve.eMax)) * plotWidth;
  const xTicks = buildLinearTicks(-currentCurve.eMax, currentCurve.eMax, 5);
  const yTicks = buildLinearTicks(0, maxDos, 5);

  return (
    <section className="dos-panel" aria-label="Density of states panel">
      <div className="comparison-header">
        <p className="comparison-title">Density of states</p>
        <span className="truth-label">computed</span>
      </div>
      <p className="comparison-copy">
        {unavailable ? "BCS model not valid in this parameter regime" : "Dynes-broadened quasiparticle DOS computed from the current gap with constant lifetime broadening."}
      </p>
      {unavailable ? (
        <div className="gap-plot" aria-label="DOS unavailable plot area">
          <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="DOS unavailable" className="gap-plot">
            <rect x={paddingLeft} y={paddingTop} width={plotWidth} height={plotHeight} fill="transparent" className="plot-axis" />
            <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} className="plot-axis" />
            <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} className="plot-axis" />
            <text x={width / 2} y={height / 2} textAnchor="middle" className="plot-label">
              BCS model not valid in this parameter regime
            </text>
            <text x={width / 2} y={height - 10} textAnchor="middle" className="plot-label">
              Energy E (meV)
            </text>
            <text x={18} y={height / 2} textAnchor="middle" transform={`rotate(-90 18 ${height / 2})`} className="plot-label">
              N(E)/N₀ (normalized DOS)
            </text>
          </svg>
        </div>
      ) : (
        <>
          <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="BCS density of states plot" className="gap-plot">
            {xTicks.map((tick) => {
              const x = paddingLeft + ((tick + currentCurve.eMax) / (2 * currentCurve.eMax)) * plotWidth;
              return (
                <g key={`dos-x-${tick}`}>
                  <line x1={x} y1={height - paddingBottom} x2={x} y2={height - paddingBottom + 6} className="plot-tick" />
                  <text x={x} y={height - paddingBottom + 6 + tickMargin + 10} textAnchor="middle" className="plot-tick-label">
                    {formatMeV(tick)}
                  </text>
                </g>
              );
            })}
            {yTicks.map((tick) => {
              const y = height - paddingBottom - (tick / maxDos) * plotHeight;
              return (
                <g key={`dos-y-${tick}`}>
                  <line x1={paddingLeft - 6} y1={y} x2={paddingLeft} y2={y} className="plot-tick" />
                  <text x={paddingLeft - 6 - tickMargin} y={y + 4} textAnchor="end" className="plot-tick-label">
                    {tick.toPrecision(3)}
                  </text>
                </g>
              );
            })}
            <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} className="plot-axis" />
            <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} className="plot-axis" />
            {traceCurves.map((curve, index) => (
              <path key={`trace-${index}`} d={buildPath(curve.points, width, height, paddingLeft, paddingRight, paddingTop, paddingBottom, curve.eMax, maxDos)} className="plot-line dos-trace-line" />
            ))}
            {!normalMetal ? <line x1={leftGapX} y1={paddingTop} x2={leftGapX} y2={height - paddingBottom} className="dos-gap-line" /> : null}
            {!normalMetal ? <line x1={rightGapX} y1={paddingTop} x2={rightGapX} y2={height - paddingBottom} className="dos-gap-line" /> : null}
            <path d={buildPath(currentCurve.points, width, height, paddingLeft, paddingRight, paddingTop, paddingBottom, currentCurve.eMax, maxDos)} className="plot-line dos-current-line" />
            {!normalMetal ? (
              <text x={width / 2} y={paddingTop + 12} textAnchor="middle" className="plot-label">
                Energy gap Δ
              </text>
            ) : null}
            <text x={width / 2} y={height - 10} textAnchor="middle" className="plot-label">
              Energy E (meV)
            </text>
            <text x={18} y={height / 2} textAnchor="middle" transform={`rotate(-90 18 ${height / 2})`} className="plot-label">
              N(E)/N₀ (normalized DOS)
            </text>
          </svg>
          <div className="energy-threshold-note" aria-label="Pair-breaking energy indicator">
            <div className="energy-threshold-bar" style={{ width: `${Math.max(Math.min((markerOffset / currentCurve.eMax) * 100, 100), 0)}%` }} />
            <p className="physics-note">Energy required to break a Cooper pair = Δ</p>
          </div>
        </>
      )}
      <dl className="plot-readout" aria-label="Density of states readout">
        <div>
          <dt>Current Δ(T) (meV)</dt>
          <dd>{unavailable ? "unavailable" : formatMeV(delta)}</dd>
        </div>
        <div>
          <dt>DOS state</dt>
          <dd>{unavailable ? "DOS unavailable" : normalMetal ? "flat normal-metal DOS" : "gapped superconducting DOS"}</dd>
        </div>
        <div>
          <dt>Broadening Γ (meV)</dt>
          <dd>{unavailable ? "unavailable" : formatMeV(gamma)}</dd>
        </div>
      </dl>
    </section>
  );
}

function buildLinearTicks(min: number, max: number, count: number): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min || count < 2) {
    return [min, max].filter(Number.isFinite);
  }

  return Array.from({ length: count }, (_, index) => min + ((max - min) * index) / (count - 1));
}

function buildPath(
  points: Array<{ E: number; N: number | null }>,
  width: number,
  height: number,
  paddingLeft: number,
  paddingRight: number,
  paddingTop: number,
  paddingBottom: number,
  eMax: number,
  maxDos: number,
): string {
  let path = "";
  let drawingSegment = false;
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  for (const point of points) {
    if (point.N === null || !Number.isFinite(point.N)) {
      drawingSegment = false;
      continue;
    }

    const x = paddingLeft + ((point.E + eMax) / (2 * eMax)) * plotWidth;
    const y = height - paddingBottom - (point.N / maxDos) * plotHeight;
    path += `${drawingSegment ? " L" : `${path ? " " : ""}M`} ${x.toFixed(2)} ${y.toFixed(2)}`;
    drawingSegment = true;
  }

  return path;
}
