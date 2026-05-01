import { TClassCreationDiagnostic, TCssCreateReport } from '../types';

const MAX_DIAGNOSTICS_PER_RUN = 200;
const MAX_REPORT_HISTORY = 100;

const createEmptyReport = (id: number = 0): TCssCreateReport => ({
  id,
  startedAt: Date.now(),
  inputClasses: [],
  processedClasses: 0,
  createdClasses: 0,
  skippedClasses: 0,
  failedClasses: 0,
  diagnostics: [],
});

let lastReport: TCssCreateReport = createEmptyReport();
let reportHistory: TCssCreateReport[] = [];
let nextRunId = 0;
let runIsActive = false;
let recordingSuspended = false;

const cloneDiagnostic = (diagnostic: TClassCreationDiagnostic): TClassCreationDiagnostic => ({
  ...diagnostic,
  details: diagnostic.details ? { ...diagnostic.details } : undefined,
});

const cloneReport = (report: TCssCreateReport): TCssCreateReport => ({
  ...report,
  inputClasses: [...report.inputClasses],
  diagnostics: report.diagnostics.map(cloneDiagnostic),
});

const ensureActiveReport = (): TCssCreateReport => {
  if (!runIsActive) {
    lastReport = createEmptyReport();
    runIsActive = true;
  }
  return lastReport;
};

export const css_create_diagnostics = {
  startRun(inputClasses: string[] = []): TCssCreateReport {
    nextRunId += 1;
    lastReport = createEmptyReport(nextRunId);
    lastReport.inputClasses = [...inputClasses];
    runIsActive = true;
    return this.getLastReport();
  },

  setInputClasses(inputClasses: string[] = []): void {
    ensureActiveReport().inputClasses = [...inputClasses];
  },

  startClass(className: string): void {
    const report = ensureActiveReport();
    report.processedClasses += 1;
    report.currentClassName = className;
  },

  recordClassCreated(className: string): void {
    const report = ensureActiveReport();
    report.createdClasses += 1;
    report.lastSuccessfulClassName = className;
    if (report.currentClassName === className) {
      report.currentClassName = undefined;
    }
  },

  recordClassSkipped(className: string): void {
    const report = ensureActiveReport();
    report.skippedClasses += 1;
    if (report.currentClassName === className) {
      report.currentClassName = undefined;
    }
  },

  recordClassFailed(className: string): void {
    const report = ensureActiveReport();
    report.failedClasses += 1;
    report.lastFailedClassName = className;
    if (report.currentClassName === className) {
      report.currentClassName = undefined;
    }
  },

  addDiagnostic(diagnostic: TClassCreationDiagnostic): void {
    if (recordingSuspended) {
      return;
    }

    const report = ensureActiveReport();
    report.diagnostics.push(cloneDiagnostic(diagnostic));
    if (report.diagnostics.length > MAX_DIAGNOSTICS_PER_RUN) {
      report.diagnostics = report.diagnostics.slice(-MAX_DIAGNOSTICS_PER_RUN);
    }
    if (diagnostic.className && diagnostic.severity === 'error') {
      report.lastFailedClassName = diagnostic.className;
    }
  },

  completeRun(durationMs?: number): TCssCreateReport {
    const report = ensureActiveReport();
    report.completedAt = Date.now();
    report.durationMs =
      typeof durationMs === 'number' && Number.isFinite(durationMs)
        ? Number(Math.max(0, durationMs).toFixed(2))
        : Math.max(0, report.completedAt - report.startedAt);
    report.currentClassName = undefined;
    runIsActive = false;
    if (report.id > 0) {
      reportHistory.push(cloneReport(report));
      if (reportHistory.length > MAX_REPORT_HISTORY) {
        reportHistory = reportHistory.slice(-MAX_REPORT_HISTORY);
      }
    }
    return this.getLastReport();
  },

  getLastReport(): TCssCreateReport {
    return cloneReport(lastReport);
  },

  getHistory(limit?: number): TCssCreateReport[] {
    const normalizedLimit = typeof limit === 'number' && Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : undefined;
    const history = normalizedLimit === undefined ? reportHistory : reportHistory.slice(-normalizedLimit);
    return history.map(cloneReport);
  },

  clearHistory(): TCssCreateReport[] {
    reportHistory = [];
    return this.getHistory();
  },

  clear(): TCssCreateReport {
    lastReport = createEmptyReport();
    runIsActive = false;
    return this.getLastReport();
  },

  runWithRecordingSuspended<T>(runner: () => T): T {
    const previousValue = recordingSuspended;
    recordingSuspended = true;
    try {
      return runner();
    } finally {
      recordingSuspended = previousValue;
    }
  },
};
