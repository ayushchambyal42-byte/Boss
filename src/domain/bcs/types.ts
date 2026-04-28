export type AppView = "landing" | "guided" | "explorer";
export type UpdateStatus = "idle" | "pending" | "stable" | "invalid" | "failed";
export type ViewportMode = "desktop" | "degraded";
export type ValidityStatus = "valid" | "near-edge" | "constrained" | "invalid" | "failed";
export type BrowserFamily = "chromium" | "firefox" | "safari" | "unknown";
export type BrowserSupportLevel = "full" | "best-effort" | "degraded";

export type ParameterVector = {
  lambda: number;
  omega_D_ref: number;
  E_F: number;
  T: number;
};

export type ParameterKey = keyof ParameterVector;

export type EffectiveParameters = {
  omega_D: number;
  omega_D_over_E_F: number;
};

export type ValidityState = {
  status: ValidityStatus;
  issues: Array<{ status: ValidityStatus; message: string }>;
};

export type ComputedPlaceholder = {
  stateVersion: number | null;
  metricsReady: boolean;
  gapReady: boolean;
  metricView: MetricView | null;
  plotView: GapPlotView | null;
};

export type BaselineSnapshot = {
  capturedAtStateVersion: number;
  parameters: ParameterVector;
  metricView: MetricView | null;
  plotView: GapPlotView | null;
};

export type MetricCardView = {
  key: string;
  label: string;
  unit: string;
  roundedValue: string;
  stateLabel: string;
};

export type MetricView = {
  status: string;
  stateVersionLabel: string;
  cards: MetricCardView[];
  issues: Array<{ status: string; message: string }>;
  message: string | null;
  isUpdating: boolean;
};

export type GapPlotView = {
  viewState: string;
  stateVersion: number;
  renderedStateVersion: number;
  issues: Array<{ status: string; message: string }>;
  isUpdating: boolean;
  metricSnapshot: {
    Delta_0: number;
  } | null;
  message: string | null;
  plot: {
    domain: { minT: number; maxT: number };
    samples: Array<{ T: number; Delta: number }>;
    selectedPoint: { T: number; Delta: number; stateVersion: number; insideDefaultDomain?: boolean };
    sampleCount: number;
  } | null;
};

export type ExplorerState = {
  view: AppView;
  viewportMode: ViewportMode;
  browserFamily: BrowserFamily;
  browserSupportLevel: BrowserSupportLevel;
  browserNotice: string | null;
  reducedMotion: boolean;
  reducedMotionSupported: boolean;
  thresholdProbeStrength: number;
  parameters: ParameterVector;
  effectiveParameters: EffectiveParameters;
  computed: ComputedPlaceholder;
  baseline: BaselineSnapshot | null;
  inspectedSession: SessionInspection | null;
  importedSessionError: string | null;
  validity: ValidityState;
  updateStatus: UpdateStatus;
  stateVersion: number;
};

export type ExportSessionTrustStatus = "valid" | "constrained" | "invalid" | "failed" | "partially-unavailable";

export type ExportedParameterEntry = {
  key: ParameterKey;
  symbol: string;
  label: string;
  unit: string;
  value: number;
};

export type ExportedMetricEntry = {
  key: string;
  label: string;
  unit: string;
  value: string;
  stateLabel: string;
};

export type SessionExportPackage = {
  app: {
    name: string;
    version: string;
  };
  exportedAt: string;
  stateVersion: number;
  updateStatus: UpdateStatus;
  sessionTrustStatus: ExportSessionTrustStatus;
  validity: ValidityState;
  parameters: ExportedParameterEntry[];
  effectiveParameters: EffectiveParameters;
  thresholdProbeStrength: number;
  computed: {
    metricView: MetricView | null;
    plotView: GapPlotView | null;
    outputs: {
      metrics: ExportedMetricEntry[];
      plotState: string | null;
      selectedPoint: { T: number; Delta: number; stateVersion: number; insideDefaultDomain?: boolean } | null;
      renderedStateVersion: number | null;
      message: string | null;
    };
  };
  baseline: {
    capturedAtStateVersion: number;
    parameters: ExportedParameterEntry[];
  } | null;
};

export type SessionIssueCategory = "numerical" | "unsupported-regime" | "truth-layer";

export type SessionInspection = {
  package: SessionExportPackage;
  importedVersionMatchesCurrent: boolean;
  issueCategory: SessionIssueCategory;
  cues: string[];
  importedParameters: ParameterVector;
};
