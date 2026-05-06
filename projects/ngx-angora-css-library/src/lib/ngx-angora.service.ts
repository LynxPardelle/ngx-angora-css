import { Injectable } from '@angular/core';
/* Interfaces */
import { IAbreviationTraductor, IClassValidationOptions, IConsoleParser, IPseudo } from './interfaces';
/* Singleton */
import { ValuesSingleton } from './singletons/valuesSingleton';
/* Functions */
import { abreviation_traductors } from './functions/abreviation_traductors';
import { color_transform } from './functions/color_transform';
import { css_create_diagnostics } from './functions/css_create_diagnostics';
import { console_log } from './functions/console_log';
import { css_camel } from './functions/css-camel';
import { cssCreate } from './functions/cssCreate';
import { debugg_options } from './functions/debugg_options';
import { manage_abreviations } from './functions/manage_abreviations';
import { manage_bps } from './functions/manage_bps';
import { manage_classes } from './functions/manage_classes';
import { manage_colors } from './functions/manage_colors';
import { manage_combos } from './functions/manage_combos';
import { manage_CSSNamesParsed } from './functions/manage_CSSNamesParsed';
import { manage_CSSRules } from './functions/manage_CSSRules';
import { manage_sheet } from './functions/manage_sheet';
import { managePartsSections } from './functions/managePartsNSectionsToSeeOnLog';
import { utility_configurations } from './functions/utility_configurations';
import { validate_class } from './functions/validate_class';
/* Types */
import {
  TAngoraClassClassification,
  TCssCreateDebugSnapshot,
  TCssCreateDebugSummary,
  TLogPartsOptions,
  TLogSectionOptions,
  TManagedStylesheetAudit,
  TManagedStylesheetAuditEntry,
} from './types';
@Injectable({
  providedIn: 'root',
})
export class NgxAngoraService {
  public values: ValuesSingleton = ValuesSingleton.getInstance();
  public indicatorClass: string = this.values.indicatorClass;
  public colors: { [key: string]: string } = this.values.colors;
  public abreviationsClasses: { [key: string]: string } = this.values.abreviationsClasses;
  public abreviationsValues: { [key: string]: string } = this.values.abreviationsValues;
  public combos: { [key: string]: string[] } = this.values.combos;
  public combosCreated: { [key: string]: string } = this.values.combosCreated;
  public encryptCombo: boolean = this.values.encryptCombo;
  public encryptComboCharacters: string = this.values.encryptComboCharacters;
  public encryptComboCreatedCharacters: string = this.values.encryptComboCreatedCharacters;
  public cssNamesParsed: any = this.values.cssNamesParsed;
  public alreadyCreatedClasses: Set<string> = this.values.alreadyCreatedClasses;
  public sheet: any = this.values.sheet;
  public isDebug: boolean = this.values.isDebug;
  public bps: any = this.values.bps;
  public bpsSpecifyOptions: string[] = this.values.bpsSpecifyOptions;
  public limitBPS: boolean = this.values.limitBPS;
  public styleSheetToManage: string = this.values.styleSheetToManage;
  public separator: string = this.values.separator;
  public styleConsole: string = this.values.styleConsole;
  public pseudoClasses: string[] = this.values.pseudoClasses;
  public pseudosHasSDED: Set<string> = this.values.pseudosHasSDED;
  public pseudoElements: string[] = this.values.pseudoElements;
  public pseudos: IPseudo[] = this.values.pseudos;
  public importantActive: boolean = this.values.importantActive;
  public abreviationTraductors: IAbreviationTraductor[] = this.values.abreviationTraductors;
  public lastTimeAsked2Create: number = this.values.lastTimeAsked2Create;
  public timesCSSCreated: number = this.values.timesCSSCreated;
  public timeBetweenReCreate: number = this.values.timeBetweenReCreate;
  public useTimer: boolean = this.values.useTimer;
  constructor() {}
  public checkSheet = (option: 'normal' | 'responsive' = 'normal') => manage_sheet.checkSheet(option);
  public cssCreate = (updateBefs: string[] | undefined = undefined, primordial: boolean = false) =>
    cssCreate.cssCreate(updateBefs, primordial);
  public createCSSRules = (rule: string) => manage_CSSRules.createCSSRules(rule);
  public colorToRGB = (color: string) => color_transform.colorToRGB(color);
  public RGBToRGBA = (rgb: number[], alpha: number) => color_transform.RGBToRGBA(rgb, alpha);
  public parseRGB = (rgba: string) => color_transform.parseRGB(rgba);
  public HexToRGB = (Hex: string) => color_transform.HexToRGB(Hex);
  public HSLToRGB = (HSL: string) => color_transform.HSLToRGB(HSL);
  public HWBToRGB = (HWB: string) => color_transform.HWBToRGB(HWB);
  public shadeTintColor = (rgb: number[], percent: number) => color_transform.shadeTintColor(rgb, percent);
  public cssValidToCamel = (st: string) => css_camel.cssValidToCamel(st);
  public camelToCSSValid = (st: string) => css_camel.camelToCSSValid(st);
  /* CRUD */
  public pushCssNamesParsed = (cssNamesParsed: any) => manage_CSSNamesParsed.pushCssNamesParsed(cssNamesParsed);
  public pushBPS = (bps: any) => manage_bps.pushBPS(bps);
  public pushColors = (newColors: any) => manage_colors.pushColors(newColors);
  public pushAbreviationsValues = (abreviationsValues: any) =>
    manage_abreviations.pushAbreviationsValues(abreviationsValues);
  public pushAbreviationsClasses = (abreviationsClasses: any) =>
    manage_abreviations.pushAbreviationsClasses(abreviationsClasses);
  public pushCombos = (combos: any) => manage_combos.pushCombos(combos);
  /* Getters */
  public getColors = () => manage_colors.getColors();
  public getBPS = () => manage_bps.getBPS();
  public getAbreviationsValues = () => manage_abreviations.getAbreviationsValues();
  public getAbreviationsClasses = () => manage_abreviations.getAbreviationsClasses();
  public getCombos = () => manage_combos.getCombos();
  public getCssNamesParsed = () => manage_CSSNamesParsed.getCssNamesParsed();
  public getColorsNames = () => manage_colors.getColorsNames();
  public getColorValue = (color: string) => manage_colors.getColorValue(color);
  public getAlreadyCreatedClasses = () => manage_classes.getAlreadyCreatedClasses();
  public getSheet = () => manage_sheet.getSheet();
  public isComboClass = (className: string): boolean => !!this.findComboKeyForClass(className);
  public classifyClass = (className: string): TAngoraClassClassification => {
    const normalizedClassName = String(className ?? '').trim();
    const emptyClassification: TAngoraClassClassification = {
      className: String(className ?? ''),
      normalizedClassName,
      kind: 'unknown',
      managed: false,
    };

    if (!normalizedClassName) {
      return emptyClassification;
    }

    const comboKey = this.findComboKeyForClass(normalizedClassName);
    if (comboKey) {
      return {
        ...emptyClassification,
        kind: 'combo',
        managed: true,
        comboKey,
      };
    }

    const prefix = normalizedClassName.split('-')[0] ?? '';
    if (!normalizedClassName.includes('-')) {
      return emptyClassification;
    }

    const indicatorClass = String(this.values.indicatorClass ?? '').trim();
    if (indicatorClass && normalizedClassName.startsWith(`${indicatorClass}-`)) {
      return {
        ...emptyClassification,
        kind: 'utility',
        managed: true,
        prefix: indicatorClass,
      };
    }

    if (Object.keys(this.values.abreviationsClasses ?? {}).includes(prefix)) {
      return {
        ...emptyClassification,
        kind: 'abbreviation',
        managed: true,
        prefix,
      };
    }

    return emptyClassification;
  };
  public auditManagedStylesheets = (sampleLimit: number = 10): TManagedStylesheetAudit => {
    const normal = this.auditStylesheet(this.values.sheet, sampleLimit);
    const responsive = this.auditStylesheet(this.values.responsiveSheet, sampleLimit);

    return {
      normal,
      responsive,
      totalRules: normal.ruleCount + responsive.ruleCount,
      totalDuplicateExactGroups: normal.duplicateExactGroups + responsive.duplicateExactGroups,
    };
  };
  public collectRenderedDomClasses = (root?: ParentNode): string[] => {
    const scope = root ?? (typeof document !== 'undefined' ? document : null);
    if (!scope) {
      return [];
    }

    const classes = new Set<string>();
    if (scope instanceof Element) {
      scope.classList.forEach(className => classes.add(className));
    }

    scope.querySelectorAll?.('[class]').forEach(element => {
      element.classList.forEach(className => classes.add(className));
    });

    return Array.from(classes);
  };
  public hasGeneratedCssRules = (): boolean => {
    const audit = this.auditManagedStylesheets(0);
    if (audit.totalRules > 0) {
      return true;
    }

    return this.getCssCreateDebugSummary().totalCreatedClasses > 0;
  };
  public waitForCssReady = (timeoutMs: number = 1500): Promise<boolean> => {
    if (this.hasGeneratedCssRules()) {
      return this.waitForNextPaint(true);
    }

    const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const timeoutAt = startedAt + Math.max(0, timeoutMs);

    return new Promise<boolean>(resolve => {
      const check = () => {
        if (this.hasGeneratedCssRules()) {
          void this.waitForNextPaint(true).then(resolve);
          return;
        }

        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        if (now >= timeoutAt) {
          void this.waitForNextPaint(false).then(resolve);
          return;
        }

        this.requestNextFrame(check);
      };

      this.requestNextFrame(check);
    });
  };
  public getLastCssCreateReport = () => css_create_diagnostics.getLastReport();
  public clearCssCreateReport = () => css_create_diagnostics.clear();
  public getCssCreateHistory = (limit?: number) => css_create_diagnostics.getHistory(limit);
  public clearCssCreateHistory = () => css_create_diagnostics.clearHistory();
  public getCssCreateDebugSummary = (): TCssCreateDebugSummary => {
    const history = css_create_diagnostics.getHistory();
    const totalRuns = history.length;
    const durations = history.map(report => report.durationMs ?? 0);
    const totalDurationMs = Number(durations.reduce((total, duration) => total + duration, 0).toFixed(2));
    const lastReport = history[history.length - 1];
    const diagnostics = history.flatMap(report => report.diagnostics);

    return {
      totalRuns,
      totalDurationMs,
      averageDurationMs: totalRuns > 0 ? Number((totalDurationMs / totalRuns).toFixed(2)) : 0,
      fastestDurationMs: totalRuns > 0 ? Math.min(...durations) : 0,
      slowestDurationMs: totalRuns > 0 ? Math.max(...durations) : 0,
      lastDurationMs: lastReport?.durationMs ?? 0,
      lastRunId: lastReport?.id,
      lastStartedAt: lastReport?.startedAt,
      lastCompletedAt: lastReport?.completedAt,
      totalInputClasses: history.reduce((total, report) => total + report.inputClasses.length, 0),
      totalProcessedClasses: history.reduce((total, report) => total + report.processedClasses, 0),
      totalCreatedClasses: history.reduce((total, report) => total + report.createdClasses, 0),
      totalSkippedClasses: history.reduce((total, report) => total + report.skippedClasses, 0),
      totalFailedClasses: history.reduce((total, report) => total + report.failedClasses, 0),
      totalDiagnostics: diagnostics.length,
      warningDiagnostics: diagnostics.filter(diagnostic => diagnostic.severity === 'warning').length,
      errorDiagnostics: diagnostics.filter(diagnostic => diagnostic.severity === 'error').length,
    };
  };
  public getCssCreateDebugSnapshot = (historyLimit: number = 10): TCssCreateDebugSnapshot => ({
    lastReport: css_create_diagnostics.getLastReport(),
    history: css_create_diagnostics.getHistory(historyLimit),
    summary: this.getCssCreateDebugSummary(),
    stylesheets: {
      normal: this.getStylesheetDebugInfo(this.values.sheet),
      responsive: this.getStylesheetDebugInfo(this.values.responsiveSheet),
    },
    runtime: {
      alreadyCreatedClasses: this.values.alreadyCreatedClasses.size,
      colors: Object.keys(this.values.colors).length,
      breakpoints: this.values.bps.length,
      combos: Object.keys(this.values.combos).length,
      abreviationsClasses: Object.keys(this.values.abreviationsClasses).length,
      abreviationsValues: Object.keys(this.values.abreviationsValues).length,
      cacheActive: this.values.cacheActive,
      useTimer: this.values.useTimer,
      useRecurrentStrategy: this.values.useRecurrentStrategy,
      importantActive: this.values.importantActive,
      isDebug: this.values.isDebug,
    },
  });
  public validateClass = (className: string, options?: IClassValidationOptions) =>
    validate_class.validateClass(className, options);
  public validateClasses = (classNames: string[], options?: IClassValidationOptions) =>
    validate_class.validateClasses(classNames, options);
  /* Update */
  public updateColor = (color: string, value: string) => manage_colors.updateColor(color, value);
  public updateColors = (newColors: any) => manage_colors.updateColors(newColors);
  public updateAbreviationsClass = (abreviationsClass: string, value: string) =>
    manage_abreviations.updateAbreviationsClass(abreviationsClass, value);
  public updateAbreviationsValue = (abreviationsValue: string, value: string) =>
    manage_abreviations.updateAbreviationsValue(abreviationsValue, value);
  public updateCombo = (combo: string, values: string[]) => manage_combos.updateCombo(combo, values);
  public updateCssNamesParsed = (cssNameParsed: string, value: string) =>
    manage_CSSNamesParsed.updateCssNamesParsed(cssNameParsed, value);
  public updateClasses = (classesToUpdate: string[]) => manage_classes.updateClasses(classesToUpdate);
  /* Delete */
  public deleteColor = (color: string) => manage_colors.deleteColor(color);
  public clearAllColors = () => manage_colors.clearAllColors();
  /* Utility */
  private findComboKeyForClass = (className: string): string | undefined => {
    const normalizedClassName = String(className ?? '').trim();
    let matchedKey: string | undefined;

    Object.keys(this.values.combos ?? {}).forEach(key => {
      if (normalizedClassName !== key && !normalizedClassName.startsWith(`${key}VAL`)) {
        return;
      }

      if (!matchedKey || key.length > matchedKey.length) {
        matchedKey = key;
      }
    });

    return matchedKey;
  };
  private auditStylesheet = (sheet?: CSSStyleSheet, sampleLimit: number = 10): TManagedStylesheetAuditEntry => {
    const normalizedSampleLimit = Math.max(0, Math.floor(Number(sampleLimit) || 0));
    const base: TManagedStylesheetAuditEntry = {
      available: !!sheet,
      href: sheet?.href || undefined,
      ruleCount: 0,
      duplicateExactGroups: 0,
      duplicateExactRules: [],
    };

    if (!sheet) {
      return base;
    }

    try {
      const rules = Array.from(sheet.cssRules ?? []);
      const counts = new Map<string, number>();
      rules.forEach(rule => {
        const cssText = String(rule.cssText ?? '').trim();
        if (!cssText) {
          return;
        }

        counts.set(cssText, (counts.get(cssText) ?? 0) + 1);
      });

      const duplicateExactRules = Array.from(counts.entries())
        .filter(([, count]) => count > 1)
        .map(([rule, count]) => ({ rule, count }))
        .slice(0, normalizedSampleLimit);

      return {
        ...base,
        ruleCount: rules.length,
        duplicateExactGroups: Array.from(counts.values()).filter(count => count > 1).length,
        duplicateExactRules,
      };
    } catch (error) {
      return {
        ...base,
        ruleCount: -1,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };
  private waitForNextPaint = (value: boolean): Promise<boolean> =>
    new Promise<boolean>(resolve => {
      this.requestNextFrame(() => this.requestNextFrame(() => resolve(value)));
    });
  private requestNextFrame = (callback: () => void): void => {
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => callback());
      return;
    }

    if (typeof window !== 'undefined' && typeof window.setTimeout === 'function') {
      window.setTimeout(callback, 16);
      return;
    }

    setTimeout(callback, 16);
  };
  private getStylesheetDebugInfo = (sheet?: CSSStyleSheet) => {
    let ruleCount = 0;
    try {
      ruleCount = sheet?.cssRules?.length ?? 0;
    } catch {
      ruleCount = -1;
    }

    return {
      available: !!sheet,
      href: sheet?.href || undefined,
      ruleCount,
    };
  };
  public changeImportantActive = (active?: boolean) => utility_configurations.changeImportantActive(active);
  public changeDebugOption = (active?: boolean) => debugg_options.changeDebugOption(active);
  public changeUseTimerOption = (active?: boolean) => debugg_options.changeUseTimerOption(active);
  public setTimeBetweenReCreate = (time: number) => debugg_options.setTimeBetweenReCreate(time);
  public beginCssCreateBatch = () => {
    this.values.cssCreateBatchDepth++;
  };
  public endCssCreateBatch = (): number | void => {
    if (this.values.cssCreateBatchDepth > 0) {
      this.values.cssCreateBatchDepth--;
    }

    if (this.values.cssCreateBatchDepth > 0 || !this.values.cssCreatePending) {
      return;
    }

    const runFullScan = this.values.cssCreatePendingFullScan;
    const pendingClasses = Array.from(this.values.cssCreatePendingClasses);
    this.values.cssCreatePending = false;
    this.values.cssCreatePendingFullScan = false;
    this.values.cssCreatePendingClasses.clear();

    return cssCreate.cssCreate(runFullScan || pendingClasses.length === 0 ? null : pendingClasses, true);
  };
  public runInCssCreateBatch = (callback: () => void): number | void => {
    this.beginCssCreateBatch();
    let result: number | void;
    try {
      callback();
    } finally {
      result = this.endCssCreateBatch();
    }

    return result;
  };
  public unbefysize = (value: string) => abreviation_traductors.unbefysize(value);
  public befysize = (value: string) => abreviation_traductors.befysize(value);
  public consoleLog = (
    type: 'log' | 'info' | 'trace' | 'error' = 'log',
    thing: any,
    style: string = this.values.styleConsole,
    line: string | null = null,
    stoper: boolean = !this.values.isDebug
  ) => console_log.consoleLog(type, thing, style, line, stoper);
  public consoleParser = (config: IConsoleParser) => console_log.consoleParser(config);
  /* ManagePartsNSectionsForLog */
  public pushSection = (newSection: string) => managePartsSections.pushSection(newSection);
  public pushPart = (newPart: string) => managePartsSections.pushPart(newPart);
  public getChosenSectionsOptions = () => managePartsSections.getChosenSectionsOptions();
  public getChosenSectionsOptionsSections = () => managePartsSections.getChosenSectionsOptionsSections();
  public getChosenSectionsOptionsParts = () => managePartsSections.getChosenSectionsOptionsParts();
  public getAllPosibleSections = () => managePartsSections.getAllPosibleSections();
  public getAllPosibleParts = () => managePartsSections.getAllPosibleParts();
  public changeSections = (newSections: TLogSectionOptions[]) => managePartsSections.changeSections(newSections);
  public changeParts = (newParts: TLogPartsOptions[]) => managePartsSections.changeParts(newParts);
  public deleteSection = (sectionToDelete: TLogSectionOptions) => managePartsSections.deleteSection(sectionToDelete);
  public deletePart = (partToDelete: TLogPartsOptions) => managePartsSections.deletePart(partToDelete);
}
