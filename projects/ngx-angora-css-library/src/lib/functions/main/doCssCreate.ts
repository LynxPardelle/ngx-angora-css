/* Interfaces */
import { IBPS } from '../../interfaces';
/* Singletons */
import { ValuesSingleton } from '../../singletons/valuesSingleton';
/* Funtions */
import { css_create_diagnostics } from '../css_create_diagnostics';
import { console_log } from '../console_log';
/* Utilities */
import { getNewClasses2Create } from './private_utilities/getNewClasses2Create';
import { parseClass } from './private_utilities/parseClass';
import { send2CreateRules } from './private_utilities/send2CreateRules';
import { comboParser } from './private_utilities/comboParser';
/* Types */
import { TLogPartsOptions } from '../../types';
const values: ValuesSingleton = ValuesSingleton.getInstance();
const log = (t: any, p?: TLogPartsOptions) => {
  console_log.betterLogV1('doCssCreate', t, p);
};
const multiLog = (toLog: [any, TLogPartsOptions?][]) => {
  console_log.multiBetterLogV1('doCssCreate', toLog);
};

const findMatchingCombo = (className: string): string | undefined => {
  let matchedCombo: string | undefined;

  for (const comboName of values.combosKeys) {
    if (className !== comboName && !className.startsWith(`${comboName}VAL`)) {
      continue;
    }

    if (!matchedCombo || comboName.length > matchedCombo.length) {
      matchedCombo = comboName;
    }
  }

  return matchedCombo;
};

const expandExplicitClasses = (classes: string[]): string[] => {
  if (typeof document === 'undefined') {
    return classes;
  }

  const expandedClasses = new Set<string>();

  classes.forEach(className => {
    const comboName = findMatchingCombo(className);

    if (!comboName || !values.combos[comboName]) {
      expandedClasses.add(className);
      return;
    }

    const hostElement = document.createElement('div');
    hostElement.className = className;
    comboParser(className, comboName, hostElement).forEach(comboClass => expandedClasses.add(comboClass));
  });

  return Array.from(expandedClasses);
};

const collectExistingStylesheetClasses = (): ReadonlySet<string> => {
  const classNames = new Set<string>();
  if (!values.sheet) return classNames;

  const classPattern = /\.([_a-zA-Z][\w-]*)/g;
  for (let index = 0; index < values.sheet.cssRules.length; index++) {
    const cssRule = values.sheet.cssRules[index] as CSSStyleRule;
    const selector = typeof cssRule.selectorText === 'string' ? cssRule.selectorText : cssRule.cssText.split('{')[0];
    classPattern.lastIndex = 0;
    const match = classPattern.exec(selector);
    if (match) {
      classNames.add(match[1]);
    }
  }

  return classNames;
};

export const doCssCreate = (id: number, updateClasses2Create?: string[]): number => {
  css_create_diagnostics.startRun(updateClasses2Create || []);
  try {
    log(updateClasses2Create, `updateClasses2Create [id:${id}]`);
    const startTimeCSSCreate = performance.now();
    const classes2Create: string[] = updateClasses2Create
      ? expandExplicitClasses(updateClasses2Create)
      : getNewClasses2Create();
    const existingStylesheetClasses = updateClasses2Create ? undefined : collectExistingStylesheetClasses();
    css_create_diagnostics.setInputClasses(classes2Create);
    log(classes2Create, `classes2Create [id:${id}]`);
    const classes2CreateStringed: string[] = [];
    const bpsStringed: IBPS[] = values.bps.map((b: any) => b);
    for (let class2Create of classes2Create) {
      css_create_diagnostics.startClass(class2Create);
      try {
        const parsedResult = parseClass(class2Create, !updateClasses2Create, { existingStylesheetClasses });
        const { classes2CreateStringed: returnedClasses2CreateStringed, bps: returnedBpsStringed, status } = parsedResult;

        if (status === 'created') {
          classes2CreateStringed.push(returnedClasses2CreateStringed);
          if (returnedBpsStringed) {
            for (let bps of bpsStringed) {
              if (bps.bp === returnedBpsStringed.bp) {
                bps.class2Create += returnedBpsStringed.class2Create;
                break;
              }
            }
          }
          css_create_diagnostics.recordClassCreated(class2Create);
        } else {
          css_create_diagnostics.recordClassSkipped(class2Create);
        }
      } catch (error) {
        css_create_diagnostics.recordClassFailed(class2Create);
        css_create_diagnostics.addDiagnostic({
          code: 'class-processing-error',
          severity: 'error',
          stage: 'cssCreate',
          className: class2Create,
          message: error instanceof Error ? error.message : 'Unexpected error while processing the class.',
          details: {
            error: error instanceof Error ? error.stack || error.message : String(error),
            cssCreateId: id,
          },
          suggestedFix: 'Inspect the class syntax and the diagnostics report for the failing stage, then retry the CSS creation.',
          recoverable: true,
        });
        console_log.consoleLog('error', { err: error, class2Create: class2Create, stage: 'doCssCreate.classLoop' });
      }
    }
    multiLog([
      [classes2CreateStringed, `classes2CreateStringed [id:${id}]`],
      [bpsStringed, `bpsStringed [id:${id}]`],
    ]);
    send2CreateRules(classes2CreateStringed.join(''), bpsStringed);
    const endTimeCSSCreate = performance.now();
    const durationMs = endTimeCSSCreate - startTimeCSSCreate;
    const timeToCreate = durationMs.toFixed(2) + 'ms';
    console_log.consoleLog('info', `Call to cssCreate() took ${timeToCreate}.`);
    let class2CreateTimer = document.getElementById(values.indicatorClass + 'Timer');
    if (class2CreateTimer) {
      // create a first time created if there is no first time created element
      if (!document.getElementById('firstTimeCreated')) {
        const firstTimeCreated = document.createElement('p');
        firstTimeCreated.id = 'firstTimeCreated';
        firstTimeCreated.innerHTML = `The first time cssCreate() was called took ${timeToCreate}.`;
        class2CreateTimer.appendChild(firstTimeCreated);
      }
      const message = `Call to cssCreate() took ${timeToCreate}.`;
      let cssCreateMessage = document.getElementById('cssCreateMessage');
      if (!cssCreateMessage) {
        cssCreateMessage = document.createElement('p');
        cssCreateMessage.id = 'cssCreateMessage';
        cssCreateMessage.innerHTML = message;
        class2CreateTimer.appendChild(cssCreateMessage);
      } else {
        cssCreateMessage.innerHTML = message;
      }
    }
    css_create_diagnostics.completeRun(durationMs);
    return Date.now();
  } catch (err) {
    css_create_diagnostics.addDiagnostic({
      code: 'css-create-run-error',
      severity: 'error',
      stage: 'cssCreate',
      message: err instanceof Error ? err.message : 'Unexpected error while finishing cssCreate.',
      details: {
        error: err instanceof Error ? err.stack || err.message : String(err),
        cssCreateId: id,
      },
      suggestedFix: 'Check the global setup and the diagnostics report for the current run before retrying.',
      recoverable: false,
    });
    css_create_diagnostics.completeRun();
    console_log.consoleLog('error', { err: err });
    return Date.now();
  }
};
