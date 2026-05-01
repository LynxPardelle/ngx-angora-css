import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { NgxAngoraService } from '../../projects/ngx-angora-css-library/src/public-api';

const createMockStyleSheet = (spyName: string): CSSStyleSheet => {
  const cssRules: Array<Partial<CSSRule>> = [];
  const insertRule = jasmine.createSpy(spyName).and.callFake((rule: string) => {
    cssRules.push({
      cssText: rule,
    });
    return cssRules.length - 1;
  });
  const deleteRule = jasmine.createSpy(`${spyName}Delete`).and.callFake((index: number) => {
    cssRules.splice(index, 1);
  });

  return {
    cssRules: cssRules as unknown as CSSRuleList,
    insertRule,
    deleteRule,
  } as unknown as CSSStyleSheet;
};

describe('AppComponent', () => {
  let ankService: NgxAngoraService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();

    ankService = TestBed.inject(NgxAngoraService);
    ankService.values.sheet = createMockStyleSheet('appInsertRule');
    ankService.values.responsiveSheet = createMockStyleSheet('appResponsiveInsertRule');
    ankService.values.cacheActive = false;
    ankService.values.useTimer = false;
    ankService.values.useRecurrentStrategy = false;
    ankService.values.importantActive = false;
    ankService.values.isDebug = false;
    ankService.values.colorsRegex = undefined;
    ankService.values.pseudos = [];
    ankService.values.combos = {};
    ankService.values.combosKeys = new Set();
    ankService.values.combosCreated = {};
    ankService.values.combosCreatedKeys = new Set();
    ankService.values.alreadyCreatedClasses.clear();
    ankService.clearCssCreateReport();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('creates CSS rules for the demo classes through the app integration', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const report = ankService.getLastCssCreateReport();

    expect(ankService.getCombos().Abtn).toBeTruthy();
    expect(report.createdClasses).toBeGreaterThan(0);
    expect(report.failedClasses).toBe(0);
    expect(report.diagnostics.filter(diagnostic => diagnostic.severity === 'error').length).toBe(0);
    expect((ankService.values.sheet as unknown as { insertRule: jasmine.Spy }).insertRule).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('CSS creation report');
    expect(fixture.nativeElement.textContent).toContain('Validate a class before creation');
  }));

  it('renders guided tutorial copy and an accessible validation input label', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const label = host.querySelector('label[for="validationCandidate"]');
    const input = host.querySelector('#validationCandidate');

    expect(host.textContent).toContain('Start here');
    expect(host.textContent).toContain('Install the package');
    expect(host.textContent).toContain('Load the managed stylesheets');
    expect(label?.textContent).toContain('Class to validate');
    expect(input).toBeTruthy();
  }));

  it('creates CSS for validation states after the candidate changes', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const getRuleText = () => Array.from(
      (ankService.values.sheet as unknown as { cssRules: Array<{ cssText?: string }> }).cssRules
    )
      .map(rule => rule.cssText ?? '')
      .join('\n');

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    app.validateCandidate('ank-');
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(app.latestValidation.status).toBe('invalid');
    expect(fixture.nativeElement.textContent).toContain('invalid-class-structure');
    expect(getRuleText()).toContain('.ADiagnosticItem');
    expect(getRuleText()).toContain('.ank-bg-mistyrose');

    app.validateCandidate('ank-m-0');
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(app.latestValidation.status).toBe('duplicate');
    expect(fixture.nativeElement.textContent).toContain('duplicate');
    expect(getRuleText()).toContain('.ank-bg-cornsilk');
    expect(getRuleText()).toContain('.ank-borderColor-goldenrod');
  }));

  it('creates CSS for report diagnostics after a cssCreate warning is rendered', fakeAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const getRuleText = () => Array.from(
      (ankService.values.sheet as unknown as { cssRules: Array<{ cssText?: string }> }).cssRules
    )
      .map(rule => rule.cssText ?? '')
      .join('\n');

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button.AActionButton') as HTMLButtonElement).classList.add('ank-');

    app.cssCreate();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(app.cssCreateReport.diagnostics.length).toBeGreaterThan(0);
    expect(app.cssCreateReport.diagnostics[0].code).toBe('invalid-class-discovered');
    expect(getRuleText()).toContain('.ADiagnosticItem');
  }));
});
