import { allPosibleParts, allPosibleSections } from './values/parts_sections';

export type TLOG_TYPE = 'log' | 'info' | 'trace' | 'error';
export type TBPS = {
  bp: string;
  value: string;
  class2Create: string;
};
export type TConsoleParser = {
  type?: TLOG_TYPE;
  thing: any;
  style?: string;
  line?: string | null;
  stoper?: boolean;
  showObjectAsString?: boolean;
};
export type TPseudo = {
  mask: string;
  real: string;
};
export type TAbreviationTraductor = {
  abreviation: string;
  abreviationRegExp: RegExp;
  traduction: string;
  traductionRegExp: RegExp;
};

export type TLogPartsOptions = (typeof allPosibleParts)[number];
export type TLogSectionOptions = (typeof allPosibleSections)[number];
export type TChosenLogSectionOptions = {
  sections: TLogSectionOptions[];
  parts: TLogPartsOptions[];
};
export type TReturnFromChanges = { success: boolean; message: string; data?: unknown; errors?: string[] };

export type TClassCreationDiagnosticSeverity = 'warning' | 'error';
export type TClassCreationDiagnosticStage =
  | 'setup'
  | 'discovery'
  | 'cssCreate'
  | 'parseClass'
  | 'convertPseudos'
  | 'valueTraductor'
  | 'values4ComboGetter'
  | 'valueComboReplacer'
  | 'property2ValueJoiner'
  | 'ruleCreation';

export type TClassCreationDiagnostic = {
  code: string;
  severity: TClassCreationDiagnosticSeverity;
  stage: TClassCreationDiagnosticStage;
  message: string;
  className?: string;
  details?: Record<string, unknown>;
  suggestedFix?: string;
  recoverable?: boolean;
};

export type TClassValidationStatus = 'valid' | 'invalid' | 'duplicate';

export type TClassValidationOptions = {
  requireSheet?: boolean;
  checkDuplicates?: boolean;
};

export type TClassValidationResult = {
  className: string;
  normalizedClassName: string;
  status: TClassValidationStatus;
  valid: boolean;
  canCreate: boolean;
  generatedRule: string;
  breakpoint?: TBPS;
  diagnostics: TClassCreationDiagnostic[];
};

export type TClassesValidationReport = {
  results: TClassValidationResult[];
  validClasses: number;
  invalidClasses: number;
  duplicateClasses: number;
};

export type TAngoraClassKind = 'combo' | 'utility' | 'abbreviation' | 'unknown';

export type TAngoraClassClassification = {
  className: string;
  normalizedClassName: string;
  kind: TAngoraClassKind;
  managed: boolean;
  comboKey?: string;
  prefix?: string;
};

export type TStylesheetDuplicateRule = {
  rule: string;
  count: number;
};

export type TManagedStylesheetAuditEntry = {
  available: boolean;
  href?: string;
  ruleCount: number;
  duplicateExactGroups: number;
  duplicateExactRules: TStylesheetDuplicateRule[];
  error?: string;
};

export type TManagedStylesheetAudit = {
  normal: TManagedStylesheetAuditEntry;
  responsive: TManagedStylesheetAuditEntry;
  totalRules: number;
  totalDuplicateExactGroups: number;
};

export type TCssCreateReport = {
  id: number;
  startedAt: number;
  completedAt?: number;
  durationMs?: number;
  inputClasses: string[];
  processedClasses: number;
  createdClasses: number;
  skippedClasses: number;
  failedClasses: number;
  currentClassName?: string;
  lastSuccessfulClassName?: string;
  lastFailedClassName?: string;
  diagnostics: TClassCreationDiagnostic[];
};

export type TCssCreateDebugSummary = {
  totalRuns: number;
  totalDurationMs: number;
  averageDurationMs: number;
  fastestDurationMs: number;
  slowestDurationMs: number;
  lastDurationMs: number;
  lastRunId?: number;
  lastStartedAt?: number;
  lastCompletedAt?: number;
  totalInputClasses: number;
  totalProcessedClasses: number;
  totalCreatedClasses: number;
  totalSkippedClasses: number;
  totalFailedClasses: number;
  totalDiagnostics: number;
  warningDiagnostics: number;
  errorDiagnostics: number;
};

export type TCssCreateDebugSnapshot = {
  lastReport: TCssCreateReport;
  history: TCssCreateReport[];
  summary: TCssCreateDebugSummary;
  stylesheets: {
    normal: {
      available: boolean;
      href?: string;
      ruleCount: number;
    };
    responsive: {
      available: boolean;
      href?: string;
      ruleCount: number;
    };
  };
  runtime: {
    alreadyCreatedClasses: number;
    colors: number;
    breakpoints: number;
    combos: number;
    abreviationsClasses: number;
    abreviationsValues: number;
    cacheActive: boolean;
    useTimer: boolean;
    useRecurrentStrategy: boolean;
    importantActive: boolean;
    isDebug: boolean;
  };
};

export type TCacheOptions =
  | 'propertyJoiner'
  | 'regExp'
  | 'buttonShade'
  | 'camel'
  | 'buttonCss'
  | 'cssValid'
  | 'colorTransform'
  | 'comboDecrypt'
  | 'parseClass'
  | 'getNewClasses2Create'
  | 'comboParser'
  | 'values4ComboGetter'
  | 'buttonCorrection';
export type TCacheOptionsPromised = 'buttonCorrection';
