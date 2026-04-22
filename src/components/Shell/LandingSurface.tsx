type LandingSurfaceProps = {
  onEnterExplorer: () => void;
  onEnterGuided: () => void;
};

export function LandingSurface({ onEnterExplorer, onEnterGuided }: LandingSurfaceProps) {
  return (
    <section className="surface landing-surface">
      <p className="eyebrow">Weak-coupling BCS explorer</p>
      <h1>Explore the weak-coupling BCS gap without losing the thread of the model.</h1>
      <p className="surface-copy">
        This product is a weak-coupling BCS explorer for gap, transition, and threshold intuition. It is not a general superconductivity simulator.
      </p>
      <p className="surface-copy">
        The landing surface stays lightweight: it introduces the scope, then routes directly into guided entry or the live explorer without reshaping the SPA around broader content or SEO concerns.
      </p>
      <div className="surface-actions">
        <button type="button" onClick={onEnterGuided}>
          Start Guided Entry
        </button>
        <button type="button" className="secondary" onClick={onEnterExplorer}>
          Open Explorer
        </button>
      </div>
    </section>
  );
}
