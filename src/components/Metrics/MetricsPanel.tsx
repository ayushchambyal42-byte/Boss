import { buildValidityGuidance, guidanceToneClass } from "../../domain/bcs/validityGuidance.ts";
import { buildTrustStatusSummary } from "../../domain/bcs/trustStatus.ts";
import type { ExplorerState } from "../../domain/bcs/types.ts";
import { TruthLayerStrip } from "../Truth/TruthLayerStrip.tsx";

export function MetricsPanel({ state }: { state: ExplorerState }) {
  const metricView = state.computed.metricView;
  const validityGuidance = buildValidityGuidance(state);
  const trustSummary = buildTrustStatusSummary(state);
  if (!metricView || metricView.cards.length === 0) {
    return (
      <section className="panel">
        <header className="panel-header">
          <h2>Core metrics</h2>
          <span className="pill">{state.updateStatus}</span>
        </header>
        <TruthLayerStrip
          ariaLabel="Metric truth layers"
          compact
          items={[
            { label: "computed cards", tone: "computed" },
            { label: "interpretive validity guidance", tone: "interpretive" },
          ]}
        />
        {metricView?.message ? <p className={`state-banner state-banner-${metricView.status}`}>{metricView.message}</p> : null}
        <p className={`trust-echo trust-echo-${trustSummary.tone}`}>
          Trust status: {trustSummary.stateText}. {trustSummary.actionText}
        </p>
        <div className={`validity-guidance validity-guidance-${guidanceToneClass(validityGuidance.tone)}`} aria-label="Output validity guidance">
          <p className="validity-guidance-label">{validityGuidance.label}</p>
          <p className="validity-guidance-copy">{validityGuidance.summary}</p>
          <p className="validity-guidance-action">{validityGuidance.recommendation}</p>
        </div>
        <p>Metrics unavailable for the current validated state.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>Core metrics</h2>
        <span className="pill">{state.updateStatus}</span>
      </header>
      <TruthLayerStrip
        ariaLabel="Metric truth layers"
        compact
        items={[
          { label: "computed cards", tone: "computed" },
          { label: "interpretive validity guidance", tone: "interpretive" },
        ]}
      />
      {metricView.isUpdating ? <p className="state-banner state-banner-pending">Updating: metric cards are showing stale values until validated recomputation completes.</p> : null}
      {metricView.message ? <p className={`state-banner state-banner-${metricView.status}`}>{metricView.message}</p> : null}
      {state.validity.status !== "valid" || state.updateStatus === "failed" ? (
        <p className={`trust-echo trust-echo-${trustSummary.tone}`}>
          Trust status: {trustSummary.stateText}. {trustSummary.actionText}
        </p>
      ) : null}
      {state.validity.status !== "valid" ? (
        <div className={`validity-guidance validity-guidance-${guidanceToneClass(validityGuidance.tone)}`} aria-label="Output validity guidance">
          <p className="validity-guidance-label">{validityGuidance.label}</p>
          <p className="validity-guidance-copy">{validityGuidance.summary}</p>
          <p className="validity-guidance-action">{validityGuidance.recommendation}</p>
        </div>
      ) : null}
      <div className="metric-state">
        <p>
          <strong>Metric state:</strong> {metricView.status}
        </p>
        <p>
          <strong>Source:</strong> {metricView.stateVersionLabel}
        </p>
      </div>
      <dl className="data-grid" aria-label="Core metric cards">
        {metricView.cards.map((card) => (
          <div key={card.key}>
            <dt>{card.label}</dt>
            <dd>{card.roundedValue}</dd>
            <dd className="metric-unit">
              {card.unit} · {card.stateLabel}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
