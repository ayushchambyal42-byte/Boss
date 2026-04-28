import { useEffect, useState } from "react";
import { KB_EV_PER_K, REFERENCE_TC_K, formatKelvin, formatMeV } from "../../domain/bcs/displayUnits.ts";
import { deriveCriticalTemperature } from "../../domain/bcs/metrics.ts";
import { buildValidityGuidance, guidanceToneClass } from "../../domain/bcs/validityGuidance.ts";
import type { ExplorerState } from "../../domain/bcs/types.ts";
import { DOSPanel } from "../DOSPanel.tsx";

export function PlotPanel({ state, playing }: { state: ExplorerState; playing?: boolean }) {
  const plotView = state.computed.plotView;
  const validityGuidance = buildValidityGuidance(state);
  const currentDelta = plotView?.plot?.selectedPoint.Delta ?? Number.NaN;
  const currentDelta0 = plotView?.metricSnapshot?.Delta_0 ?? Number.NaN;
  const currentTemperature = plotView?.plot?.selectedPoint.T ?? state.parameters.T;
  const currentTc = deriveCriticalTemperature(state.parameters);
  const reducedTemperature = currentTc > 0 ? state.parameters.T / currentTc : Number.NaN;
  const transitionNarrative = buildTransitionNarrative(reducedTemperature);
  const nearTransition = Number.isFinite(reducedTemperature) && reducedTemperature > 0.95;
  const dosUnavailable = state.validity.status === "invalid" || state.updateStatus === "invalid" || plotView?.viewState === "invalid";
  const [dosTraceDeltas, setDosTraceDeltas] = useState<number[]>([]);
  const [displayTemperature, setDisplayTemperature] = useState(currentTemperature);

  useEffect(() => {
    if (!Number.isFinite(currentTemperature)) {
      setDisplayTemperature(currentTemperature);
      return;
    }

    if (!playing) {
      setDisplayTemperature(currentTemperature);
      return;
    }

    setDisplayTemperature((previous) => {
      if (!Number.isFinite(previous)) {
        return currentTemperature;
      }
      const alpha = 0.9;
      return alpha * previous + (1 - alpha) * currentTemperature;
    });
  }, [currentTemperature, playing]);

  useEffect(() => {
    if (!playing || !Number.isFinite(currentDelta) || currentDelta < 0) {
      if (!playing) {
        setDosTraceDeltas([]);
      }
      return;
    }

    setDosTraceDeltas((previous) => {
      if (previous.length > 0 && Math.abs(previous[previous.length - 1] - currentDelta) < 1e-6) {
        return previous;
      }
      const next = [...previous, currentDelta];
      return next.slice(-6, -1).concat(next.slice(-1));
    });
  }, [currentDelta, playing]);

  if (!plotView) {
    return (
      <section className="panel plot-panel">
        <header className="panel-header">
          <h2>Main gap plot</h2>
          <span className="truth-label">computed</span>
        </header>
        <div className="plot-frame">
          <p>Plot unavailable for the current validated state.</p>
          <div className={`validity-guidance validity-guidance-${guidanceToneClass(validityGuidance.tone)}`} aria-label="Plot validity guidance">
            <p className="validity-guidance-label">{validityGuidance.label}</p>
            <p className="validity-guidance-copy">{validityGuidance.summary}</p>
            <p className="validity-guidance-action">{validityGuidance.recommendation}</p>
          </div>
          <DOSPanel delta={currentDelta} delta0={currentDelta0} traceDeltas={dosTraceDeltas.slice(0, -1)} unavailable={dosUnavailable} />
        </div>
      </section>
    );
  }
  const samples = plotView.plot?.samples ?? [];
  const width = 640;
  const height = 320;
  const paddingLeft = 56;
  const paddingRight = 28;
  const paddingTop = 28;
  const paddingBottom = 52;
  const tickMargin = 8;
  const maxT = plotView.plot?.domain.maxT ?? (currentTc > 0 ? 1.2 * currentTc : 1);
  const maxDelta = Math.max(currentDelta0 || 1, 1e-9);
  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;
  const xTicks = buildAxisTicksWithTc(0, maxT, currentTc, 5);
  const yTicks = buildLinearTicks(0, maxDelta, 5);
  const path = samples
    .map((point: { T: number; Delta: number }, index: number) => {
      const x = paddingLeft + (point.T / maxT) * plotWidth;
      const y = height - paddingBottom - (point.Delta / maxDelta) * plotHeight;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const fallbackPointerPoint = plotView.plot?.selectedPoint ?? { T: currentTemperature, Delta: currentDelta };
  const pointerPoint = findNearestCurvePoint(samples, displayTemperature) ?? fallbackPointerPoint;
  const pointerX = paddingLeft + (pointerPoint.T / maxT) * plotWidth;
  const pointerY = height - paddingBottom - (Math.max(pointerPoint.Delta, 0) / maxDelta) * plotHeight;
  const tcX = currentTc > 0 ? paddingLeft + (currentTc / maxT) * plotWidth : null;

  return (
    <section className="panel plot-panel">
      <header className="panel-header">
        <h2>Main gap plot</h2>
        <span className="truth-label">computed</span>
      </header>
      <div className="plot-frame">
        <div className="plot-meta">
          <p>
            <strong>State:</strong> {plotView.viewState}
          </p>
          <p>
            <strong>Units:</strong> Temperature (K), Gap Δ(T) (meV), Energy (meV)
          </p>
        </div>
        <p className="physics-note">Display conversion uses k_B = {KB_EV_PER_K.toExponential(3)} eV/K, T_c = {REFERENCE_TC_K} K, and ħ = 1.</p>
        {state.validity.status !== "valid" || state.updateStatus === "failed" ? (
          <div className={`validity-guidance validity-guidance-${guidanceToneClass(validityGuidance.tone)}`} aria-label="Plot validity guidance">
            <p className="validity-guidance-label">{validityGuidance.label}</p>
            <p className="validity-guidance-copy">{validityGuidance.summary}</p>
            <p className="validity-guidance-action">{validityGuidance.recommendation}</p>
          </div>
        ) : null}
        {plotView.isUpdating ? <p className="state-banner state-banner-pending">Updating: stale plot held until validated recomputation completes.</p> : null}
        {plotView.viewState === "invalid" ? <p className="state-banner state-banner-invalid">Invalid input: plot suppressed for the current state.</p> : null}
        {plotView.viewState === "failed" ? <p className="state-banner state-banner-failed">Solver failure: {plotView.message ?? "plot computation failed."}</p> : null}
        {plotView.plot ? (
          <>
            <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Main superconducting gap plot" className="gap-plot">
              {xTicks.map((tick) => {
                const x = paddingLeft + (tick / maxT) * plotWidth;
                return (
                  <g key={`gap-x-${tick}`}>
                    <line x1={x} y1={height - paddingBottom} x2={x} y2={height - paddingBottom + 6} className="plot-tick" />
                    <text x={x} y={height - paddingBottom + 6 + tickMargin + 10} textAnchor="middle" className="plot-tick-label">
                      {formatTemperatureTick(tick, currentTc)}
                    </text>
                  </g>
                );
              })}
              {yTicks.map((tick) => {
                const y = height - paddingBottom - (tick / maxDelta) * plotHeight;
                return (
                  <g key={`gap-y-${tick}`}>
                    <line x1={paddingLeft - 6} y1={y} x2={paddingLeft} y2={y} className="plot-tick" />
                    <text x={paddingLeft - 6 - tickMargin} y={y + 4} textAnchor="end" className="plot-tick-label">
                      {formatMeV(tick)}
                    </text>
                  </g>
                );
              })}
              <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} className="plot-axis" />
              <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} className="plot-axis" />
              {tcX !== null ? <line x1={tcX} y1={paddingTop} x2={tcX} y2={height - paddingBottom} className="plot-tc-line" /> : null}
              {tcX !== null ? (
                <text x={tcX} y={paddingTop + 12} textAnchor="middle" className="plot-tc-label">
                  Tc
                </text>
              ) : null}
              <path d={path} className="plot-line" />
              <circle
                cx={pointerX}
                cy={pointerY}
                r={nearTransition ? "6" : "4"}
                className={`plot-point${nearTransition ? " plot-point-critical" : ""}`}
              />
              {nearTransition ? (
                <circle
                  cx={pointerX}
                  cy={pointerY}
                  r="10"
                  className="plot-point-halo"
                />
              ) : null}
              <text
                x={pointerX + 10}
                y={pointerY - 8}
                textAnchor="start"
                className="plot-label"
              >
                Current state
              </text>
              <text x={width / 2} y={height - 10} textAnchor="middle" className="plot-label">
                Temperature (K)
              </text>
              <text x={18} y={height / 2} textAnchor="middle" transform={`rotate(-90 18 ${height / 2})`} className="plot-label">
                Gap Δ(T) (meV)
              </text>
            </svg>
            <div className={`transition-story${nearTransition ? " transition-story-critical" : ""}`} aria-label="Transition narrative">
              <p className="comparison-title">{transitionNarrative}</p>
              {nearTransition ? <p className="comparison-copy">Gap collapses → no energy barrier → normal metal</p> : null}
              {nearTransition ? <p className="comparison-copy transition-story-strong">At Tc: Δ → 0 → superconductivity destroyed</p> : null}
            </div>
            <dl className="plot-readout" aria-label="Gap plot readout">
              <div>
                <dt>Selected T (K)</dt>
                <dd>{formatKelvin(plotView.plot.selectedPoint.T)}</dd>
              </div>
              <div>
                <dt>Selected Δ(T) (meV)</dt>
                <dd>{formatMeV(plotView.plot.selectedPoint.Delta)}</dd>
              </div>
              <div>
                <dt>Rendered state version</dt>
                <dd>{plotView.renderedStateVersion}</dd>
              </div>
              <div>
                <dt>Sample count</dt>
                <dd>{plotView.plot.sampleCount}</dd>
              </div>
            </dl>
            {state.baseline ? <ComparisonPanel state={state} /> : null}
          </>
        ) : (
          <p>{plotView.message ?? "Plot unavailable for the current validated state."}</p>
        )}
        <DOSPanel delta={currentDelta} delta0={currentDelta0} traceDeltas={dosTraceDeltas.slice(0, -1)} unavailable={dosUnavailable} />
      </div>
    </section>
  );
}

function ComparisonPanel({ state }: { state: ExplorerState }) {
  const currentPlot = state.computed.plotView;
  const baseline = state.baseline;
  if (!currentPlot?.plot || !currentPlot.metricSnapshot || !baseline?.plotView?.plot || !baseline.plotView.metricSnapshot || !baseline.metricView) {
    return (
      <section className="comparison-panel" aria-label="Baseline comparison">
        <p className="comparison-title">Baseline comparison</p>
        <p className="comparison-copy">Baseline comparison is unavailable until both current and captured states have trustworthy plot data.</p>
      </section>
    );
  }

  const currentTc = deriveCriticalTemperature(state.parameters);
  const baselineTc = deriveCriticalTemperature(baseline.parameters);
  const currentDelta0 = currentPlot.metricSnapshot.Delta_0;
  const baselineDelta0 = baseline.plotView.metricSnapshot.Delta_0;
  const currentSelectedDelta = currentPlot.plot.selectedPoint.Delta;
  const baselineSelectedDelta = baseline.plotView.plot.selectedPoint.Delta;
  const normalizedComparisonSupported = state.validity.status === "valid" && baseline.metricView.status === "valid";

  const rows = [
    {
      label: "T_c",
      current: currentTc,
      baseline: baselineTc,
      formatter: (value: number) => value.toPrecision(6),
      unit: "energy",
    },
    {
      label: "Δ(0)",
      current: currentDelta0,
      baseline: baselineDelta0,
      formatter: (value: number) => value.toPrecision(6),
      unit: "energy",
    },
    {
      label: "Selected Δ(T)",
      current: currentSelectedDelta,
      baseline: baselineSelectedDelta,
      formatter: (value: number) => value.toPrecision(6),
      unit: "energy",
    },
  ];
  const normalizedRows = normalizedComparisonSupported
    ? [
        {
          label: "Reduced T / T_c",
          current: currentTc > 0 ? state.parameters.T / currentTc : Number.NaN,
          baseline: baselineTc > 0 ? baseline.parameters.T / baselineTc : Number.NaN,
          formatter: (value: number) => value.toPrecision(4),
          unit: "normalized",
        },
        {
          label: "Reduced Δ(T) / Δ(0)",
          current: currentDelta0 > 0 ? currentSelectedDelta / currentDelta0 : Number.NaN,
          baseline: baselineDelta0 > 0 ? baselineSelectedDelta / baselineDelta0 : Number.NaN,
          formatter: (value: number) => value.toPrecision(4),
          unit: "normalized",
        },
      ]
    : [];

  return (
    <section className="comparison-panel" aria-label="Baseline comparison">
      <div className="comparison-header">
        <p className="comparison-title">Baseline comparison</p>
        <span className="truth-label truth-label-subordinate">interpretive</span>
      </div>
      <p className="comparison-copy">Current state is compared against one captured baseline. Normalized values help show directional change without replacing the main computed plot.</p>
      <dl className="comparison-grid">
        {rows.concat(normalizedRows).map((row) => (
          <div key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.formatter(row.current)}</dd>
            <dd className={`comparison-delta comparison-${direction(row.current, row.baseline)}`}>
              {directionLabel(row.current, row.baseline)} vs baseline {row.formatter(row.baseline)} {row.unit}
            </dd>
          </div>
        ))}
      </dl>
      {!normalizedComparisonSupported ? (
        <p className="comparison-copy">Normalized comparison is hidden unless both current and baseline states remain within the valid trust envelope.</p>
      ) : null}
    </section>
  );
}

function direction(current: number, baseline: number): "up" | "down" | "flat" {
  if (!Number.isFinite(current) || !Number.isFinite(baseline)) {
    return "flat";
  }
  if (Math.abs(current - baseline) < 1e-9) {
    return "flat";
  }
  return current > baseline ? "up" : "down";
}

function directionLabel(current: number, baseline: number): string {
  const trend = direction(current, baseline);
  if (trend === "up") {
    return "up";
  }
  if (trend === "down") {
    return "down";
  }
  return "unchanged";
}

function buildTransitionNarrative(reducedTemperature: number): string {
  if (!Number.isFinite(reducedTemperature)) {
    return "Strong pairing regime (few excitations)";
  }
  if (reducedTemperature >= 1) {
    return "Normal metal (no gap)";
  }
  if (reducedTemperature > 0.8) {
    return "Gap collapse imminent";
  }
  if (reducedTemperature > 0.3) {
    return "Pair breaking begins";
  }
  return "Strong pairing regime (few excitations)";
}

function buildLinearTicks(min: number, max: number, count: number): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min || count < 2) {
    return [min, max].filter(Number.isFinite);
  }

  return Array.from({ length: count }, (_, index) => min + ((max - min) * index) / (count - 1));
}

function buildAxisTicksWithTc(min: number, max: number, tc: number, count: number): number[] {
  const ticks = buildLinearTicks(min, max, count);
  if (!Number.isFinite(tc) || tc < min || tc > max) {
    return ticks;
  }

  const mergedTicks = [...ticks, tc].sort((left, right) => left - right);
  return mergedTicks.filter((tick, index) => index === 0 || Math.abs(tick - mergedTicks[index - 1]) > 1e-9);
}

function formatTemperatureTick(value: number, tc: number): string {
  if (Number.isFinite(tc) && Math.abs(value - tc) <= Math.max(Math.abs(tc), 1) * 1e-9) {
    return "Tc";
  }
  return formatKelvin(value);
}

function findNearestCurvePoint(samples: Array<{ T: number; Delta: number }>, temperature: number) {
  if (samples.length === 0 || !Number.isFinite(temperature)) {
    return null;
  }

  return samples.reduce((nearest, sample) => {
    if (!nearest) {
      return sample;
    }
    return Math.abs(sample.T - temperature) < Math.abs(nearest.T - temperature) ? sample : nearest;
  }, null as { T: number; Delta: number } | null);
}
