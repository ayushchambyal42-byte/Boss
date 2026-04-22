import { useState } from "react";
import { TruthLayerStrip } from "../Truth/TruthLayerStrip.tsx";

type GuidedEntryProps = {
  onBack: () => void;
  onContinue: () => void;
  browserNotice: string | null;
  reducedMotion: boolean;
  reducedMotionSupported: boolean;
};

const GUIDED_STEPS = [
  {
    title: "Start from the default state",
    copy: "Begin at the default weak-coupling point so the gap, transition scale, and threshold view all share one stable baseline.",
    cue: "Default state cue: one validated baseline before you vary anything.",
  },
  {
    title: "Read the main gap plot",
    copy: "The gap plot is not just a curve to admire. It shows the energy scale that governs which responses remain suppressed and which become allowed.",
    cue: "Gap-as-constraint cue: treat Δ(T) as the boundary for allowed versus forbidden behavior.",
  },
  {
    title: "Test the threshold interaction",
    copy: "The threshold panel ties one probe strength to the current selected gap so you can feel the difference between sub-threshold probing and disruptive response.",
    cue: "Threshold cue: below the gap nothing disruptive happens; crossing the gap changes what the model permits.",
  },
  {
    title: "Keep the truth labels visible",
    copy: "Computed, interpretive, and phenomenological labels stay visible so you can tell what is solved, what is guidance, and what is a teaching model.",
    cue: "Trust cue: keep the labels in view before you switch to free exploration.",
  },
] as const;

export function GuidedEntry({ onBack, onContinue, browserNotice, reducedMotion, reducedMotionSupported }: GuidedEntryProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = GUIDED_STEPS[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === GUIDED_STEPS.length - 1;
  const hasSupportNotices = Boolean(browserNotice) || reducedMotion || !reducedMotionSupported;

  return (
    <section className="surface guided-surface" data-reduced-motion={reducedMotion ? "reduce" : "no-preference"}>
      <p className="eyebrow">Guided entry</p>
      <h1>Enter through the transition story, then continue into the explorer.</h1>
      <TruthLayerStrip
        ariaLabel="Guided entry truth layers"
        kicker="Guided surface"
        items={[
          { label: "interpretive transition guidance", tone: "interpretive" },
          { label: "computed session continuity", tone: "computed" },
        ]}
      />
      <p className="surface-copy">
        The guided entry is still part of the same in-memory SPA session, so it does not discard the active parameter or validity context.
      </p>
      {hasSupportNotices ? (
        <section className="support-notices" aria-label="Guided support notices">
          {browserNotice ? (
            <aside className="desktop-notice browser-notice" role="status">
              Guided compatibility: {browserNotice}
            </aside>
          ) : null}
          {reducedMotion ? (
            <aside className="desktop-notice motion-notice" role="status">
              Reduced motion is active. Guided emphasis and explanatory transitions are minimized.
            </aside>
          ) : null}
          {!reducedMotionSupported ? (
            <aside className="desktop-notice browser-notice" role="status">
              Reduced-motion preference detection is unavailable in this browser, so guided emphasis may not fully adapt.
            </aside>
          ) : null}
        </section>
      ) : null}
      <section className="comparison-panel guided-panel" aria-label="Guided transition story">
        <div className="comparison-header">
          <p className="comparison-title">
            Step {stepIndex + 1} of {GUIDED_STEPS.length}: {step.title}
          </p>
          <span className="truth-label truth-label-interpretive">interpretive transition guidance</span>
        </div>
        <p className="comparison-copy">{step.copy}</p>
        <p className="threshold-stage-cue">{step.cue}</p>
        <div className="surface-actions guided-actions">
          <button type="button" className="secondary" onClick={() => setStepIndex((index) => Math.max(0, index - 1))} disabled={isFirstStep}>
            Previous step
          </button>
          {!isLastStep ? (
            <button type="button" onClick={() => setStepIndex((index) => Math.min(GUIDED_STEPS.length - 1, index + 1))}>
              Next step
            </button>
          ) : (
            <button type="button" onClick={onContinue}>
              Continue to Explorer
            </button>
          )}
        </div>
      </section>
      <div className="surface-actions">
        {!isLastStep ? (
          <button type="button" onClick={onContinue}>
            Skip to Explorer
          </button>
        ) : null}
        <button type="button" className="secondary" onClick={onBack}>
          Back to Landing
        </button>
      </div>
    </section>
  );
}
