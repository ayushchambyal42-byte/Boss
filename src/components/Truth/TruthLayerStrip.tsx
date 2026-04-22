type TruthLayerTone = "computed" | "interpretive" | "phenomenological" | "subordinate";

type TruthLayerItem = {
  label: string;
  tone?: TruthLayerTone;
};

type TruthLayerStripProps = {
  ariaLabel: string;
  items: TruthLayerItem[];
  kicker?: string;
  compact?: boolean;
};

export function TruthLayerStrip({ ariaLabel, items, kicker, compact = false }: TruthLayerStripProps) {
  return (
    <div className={`truth-layer-strip${compact ? " truth-layer-strip-compact" : ""}`} aria-label={ariaLabel}>
      {kicker ? <span className="section-kicker">{kicker}</span> : null}
      <div className="truth-layer-pills">
        {items.map((item) => (
          <span key={`${item.tone ?? "subordinate"}-${item.label}`} className={truthLabelClassName(item.tone)}>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function truthLabelClassName(tone: TruthLayerTone = "subordinate"): string {
  if (tone === "computed") {
    return "truth-label truth-label-computed";
  }
  if (tone === "interpretive") {
    return "truth-label truth-label-interpretive";
  }
  if (tone === "phenomenological") {
    return "truth-label truth-label-phenomenological";
  }
  return "truth-label truth-label-subordinate";
}
