import { deriveCriticalTemperature } from "../../domain/bcs/metrics.ts";
import { assessThresholdProbe, THRESHOLD_INTERACTION_CONTRACT } from "../../domain/bcs/thresholdContract.ts";
import { buildThresholdGuidance } from "../../domain/bcs/thresholdGuidance.ts";
import { buildValidityGuidance, guidanceToneClass } from "../../domain/bcs/validityGuidance.ts";
import type { ExplorerState } from "../../domain/bcs/types.ts";
import { TruthLayerStrip } from "../Truth/TruthLayerStrip.tsx";

export function PlotPanel({ state, onThresholdChange }: { state: ExplorerState; onThresholdChange: (probeStrength: number) => void }) {
  const plotView = state.computed.plotView;
  const validityGuidance = buildValidityGuidance(state);
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
          <ThresholdResponsePanel state={state} onThresholdChange={onThresholdChange} />
        </div>
      </section>
    );
  }
  const samples = plotView.plot?.samples ?? [];
  const width = 640;
  const height = 320;
  const padding = 28;
  const maxT = plotView.plot?.domain.maxT ?? 1;
  const maxDelta = Math.max(plotView.metricSnapshot?.Delta_0 ?? 1, 1e-9);
  const path = samples
    .map((point: { T: number; Delta: number }, index: number) => {
      const x = padding + (point.T / maxT) * (width - padding * 2);
      const y = height - padding - (point.Delta / maxDelta) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

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
            <strong>Units:</strong> temperature and gap in energy
          </p>
        </div>
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
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="plot-axis" />
              <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="plot-axis" />
              <path d={path} className="plot-line" />
              <circle
                cx={padding + (plotView.plot.selectedPoint.T / maxT) * (width - padding * 2)}
                cy={height - padding - (plotView.plot.selectedPoint.Delta / maxDelta) * (height - padding * 2)}
                r="4"
                className="plot-point"
              />
              <text x={width / 2} y={height - 6} textAnchor="middle" className="plot-label">
                Temperature T (energy)
              </text>
              <text x={18} y={height / 2} textAnchor="middle" transform={`rotate(-90 18 ${height / 2})`} className="plot-label">
                Gap Δ(T) (energy)
              </text>
            </svg>
            <dl className="plot-readout" aria-label="Gap plot readout">
              <div>
                <dt>Selected T</dt>
                <dd>{plotView.plot.selectedPoint.T.toPrecision(6)}</dd>
              </div>
              <div>
                <dt>Selected Δ(T)</dt>
                <dd>{plotView.plot.selectedPoint.Delta.toPrecision(6)}</dd>
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
        <ThresholdResponsePanel state={state} onThresholdChange={onThresholdChange} />
      </div>
    </section>
  );
}

function ThresholdResponsePanel({ state, onThresholdChange }: { state: ExplorerState; onThresholdChange: (probeStrength: number) => void }) {
  const rawSelectedGap = state.computed.plotView?.plot?.selectedPoint.Delta ?? null;
  const assessment = assessThresholdProbe({
    probeStrength: state.thresholdProbeStrength,
    selectedGap: rawSelectedGap,
    updateStatus: state.updateStatus,
    validityStatus: state.validity.status,
  });
  const canShowCurrentGapContext = assessment.state !== "updating" && assessment.state !== "unavailable";
  const selectedGap =
    canShowCurrentGapContext && Number.isFinite(rawSelectedGap) && rawSelectedGap !== null ? rawSelectedGap : null;
  const probeEnergy = selectedGap !== null ? state.thresholdProbeStrength * selectedGap : null;
  const gapLabel = assessment.state === "updating" ? "Selected Δ(T) context" : "Current selected Δ(T)";
  const gapScaleLabel = assessment.state === "updating" ? "stale values hidden during recomputation" : "computed energy scale";
  const guidance = buildThresholdGuidance({
    assessment,
    parameters: state.parameters,
    effectiveParameters: state.effectiveParameters,
    validity: state.validity,
    baseline: state.baseline,
  });

  return (
    <section className="threshold-panel" aria-label="Threshold response view">
      <TruthLayerStrip
        ariaLabel="Threshold truth layers"
        kicker="Threshold interaction"
        items={[
          { label: "computed context", tone: "computed" },
          { label: "phenomenological response", tone: "phenomenological" },
          { label: "interpretive guidance", tone: "interpretive" },
        ]}
      />
      <div className="comparison-header">
        <p className="comparison-title">{THRESHOLD_INTERACTION_CONTRACT.title}</p>
        <span className="truth-label truth-label-subordinate">{assessment.truthLayer}</span>
      </div>
      <p className="comparison-copy">
        Probe strength is interpreted relative to the current selected gap. This is a phenomenological teaching view, not a non-equilibrium simulation.
      </p>
      <div className="control-card threshold-control-card">
        <div className="control-heading">
          <label htmlFor="threshold-probe-strength" className="control-label">
            {THRESHOLD_INTERACTION_CONTRACT.control.label}
          </label>
          <span className="control-unit">{THRESHOLD_INTERACTION_CONTRACT.control.unit}</span>
        </div>
        <input
          id="threshold-probe-strength"
          name="thresholdProbeStrength"
          type="range"
          min={THRESHOLD_INTERACTION_CONTRACT.control.min}
          max={THRESHOLD_INTERACTION_CONTRACT.control.max}
          step={THRESHOLD_INTERACTION_CONTRACT.control.step}
          value={state.thresholdProbeStrength}
          onChange={(event) => onThresholdChange(Number(event.currentTarget.value))}
        />
        <div className="control-reading">
          <output htmlFor="threshold-probe-strength">{state.thresholdProbeStrength.toFixed(2)}x gap</output>
          <span>
            {THRESHOLD_INTERACTION_CONTRACT.control.min} to {THRESHOLD_INTERACTION_CONTRACT.control.max}
          </span>
        </div>
      </div>
      <dl className="comparison-grid threshold-grid">
        <div>
          <dt>{gapLabel}</dt>
          <dd>{selectedGap !== null ? selectedGap.toPrecision(6) : "unavailable"}</dd>
          <dd className="comparison-delta comparison-flat">{gapScaleLabel}</dd>
        </div>
        <div>
          <dt>Probe energy equivalent</dt>
          <dd>{probeEnergy !== null ? probeEnergy.toPrecision(6) : "unavailable"}</dd>
          <dd className={`comparison-delta comparison-${assessment.state === "disruptive" ? "up" : assessment.state === "sub-threshold" ? "down" : "flat"}`}>
            {assessment.label}
          </dd>
        </div>
      </dl>
      <p className={`state-banner ${thresholdBannerClassName(assessment.state)}`}>{assessment.meaning}</p>
      <div className="threshold-guidance" aria-label="Threshold guidance">
        <div className="comparison-header">
          <p className="comparison-title">{guidance.title}</p>
          <span className="truth-label truth-label-subordinate">{guidance.truthLayer}</span>
        </div>
        <p className="comparison-copy">{guidance.summary}</p>
        <ul className="issue-list threshold-guidance-list">
          {guidance.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
        <p className="threshold-stage-cue">{guidance.stageCue}</p>
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

function thresholdBannerClassName(state: ReturnType<typeof assessThresholdProbe>["state"]): string {
  if (state === "disruptive") {
    return "state-banner-constrained";
  }
  if (state === "updating" || state === "sub-threshold") {
    return "state-banner-pending";
  }
  if (state === "constrained") {
    return "state-banner-constrained";
  }
  return "state-banner-invalid";
}
