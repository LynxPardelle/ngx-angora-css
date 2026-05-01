import { Component, NgZone, afterNextRender } from '@angular/core';
import {
  ICssCreateDebugSummary,
  IClassesValidationReport,
  IClassValidationResult,
  ICssCreateReport,
  ItExistsDirective,
  NgxAngoraService,
} from '../../projects/ngx-angora-css-library/src/public-api';

type ShowcaseButton = {
  label: string;
  className: string;
  note: string;
};

type RuntimeFamily = {
  method: string;
  title: string;
  description: string;
  tokens: string[];
};

type ResponsiveItem = {
  title: string;
  breakpoint: string;
  description: string;
  tokens: string[];
};

type ApiStat = {
  label: string;
  method: string;
  count: number;
  hint: string;
};

type RuntimeBreakpoint = {
  bp: string;
  value: string;
};

type TutorialStep = {
  label: string;
  title: string;
  description: string;
  code: string;
};

type LearningPathItem = {
  label: string;
  title: string;
  description: string;
  tokens: string[];
};

type PerformanceNote = {
  title: string;
  description: string;
  code: string;
};

@Component({
  selector: 'app-root',
  imports: [ItExistsDirective],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private readonly validationOptions = { checkDuplicates: true };
  private runtimeFeaturesRegistered = false;

  public readonly runtimeColors: Record<string, string> = {
    brandAurora: 'linear-gradient(135deg, #0f766e 0%, #38bdf8 100%)',
    brandNebula: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
    inkpulse: '#0f172a',
    fieldMist: '#f8fafc',
    cloudLine: '#cbd5e1',
    signalMint: '#10b981',
  };

  public readonly runtimeBreakpoints: RuntimeBreakpoint[] = [
    { bp: 'stage', value: '1080px' },
    { bp: 'billboard', value: '1440px' },
  ];

  public readonly runtimeAbreviationsValues: Record<string, string> = {
    spaceStack: '1rem',
    panelWidth: '18rem',
    heroScale: '2_6rem',
    pillRadius: '999px',
    softShadow: '0__16px__32px__rgbaSD15COM23COM42COM0_12ED',
  };

  public readonly runtimeAbreviationsClasses: Record<string, string> = {
    disp: 'ank-display',
    flowDir: 'ank-flexDirection',
    flowJust: 'ank-justifyContent',
    crossAlign: 'ank-alignItems',
    clusterGap: 'ank-gap',
    surfacePad: 'ank-padding',
    maxPanel: 'ank-maxWidth',
  };

  public readonly runtimeCombos: { [key: string]: string[] } = {
    LabBanner: [
      'ank-bg-VAL1DEFbrandAuroraDEF ank-c-VAL2DEFfieldMistDEF ank-rounded-pillRadius ank-d-inlineMINflex ank-alignItems-center ank-gap-0_45rem ank-borderWidth-1px ank-borderStyle-solid ank-borderColor-cloudLine ank-p-0_35rem__0_75rem ank-fontWeight-700',
    ],
  };

  public readonly tutorialSteps: TutorialStep[] = [
    {
      label: '01',
      title: 'Install the package',
      description: 'Add the Angular package, then import the service from the library public API.',
      code: 'npm install ngx-angora-css',
    },
    {
      label: '02',
      title: 'Load the managed stylesheets',
      description: 'Keep both stylesheet links present. The runtime inserts normal and responsive rules into them.',
      code: '<link rel="stylesheet" href="assets/css/angora-styles.css" />\n<link rel="stylesheet" href="assets/css/angora-styles-responsive.css" />',
    },
    {
      label: '03',
      title: 'Register runtime tokens in one batch',
      description: 'Group colors, breakpoints, aliases, and combos so setup produces one creation pass.',
      code: 'ank.runInCssCreateBatch(() => {\n  ank.pushColors({ brandAurora: "linear-gradient(135deg, #0f766e 0%, #38bdf8 100%)" });\n  ank.pushBPS([{ bp: "stage", value: "1080px" }]);\n  ank.pushCombos({ Badge: ["ank-bg-brandAurora ank-c-white"] });\n});',
    },
    {
      label: '04',
      title: 'Create CSS from classes',
      description: 'Use ank-prefixed classes in templates, then call cssCreate after render or after a DOM-changing action.',
      code: '<button class="ank-bg-brandAurora ank-c-fieldMist ank-p-0_75rem__1rem">Save</button>\nank.cssCreate();',
    },
  ];

  public readonly learningPath: LearningPathItem[] = [
    {
      label: 'Basics',
      title: 'Class grammar',
      description: 'Start with property-value utilities, value encoding, aliases, and readable class names.',
      tokens: ['ank-property-value', 'ank-c-red', 'ank-p-0_75rem__1rem'],
    },
    {
      label: 'Tokens',
      title: 'Runtime registries',
      description: 'Register palettes, breakpoints, value aliases, property aliases, and reusable combos together.',
      tokens: ['pushColors', 'pushBPS', 'pushAbreviationsValues', 'pushCombos'],
    },
    {
      label: 'States',
      title: 'Pseudos and selectors',
      description: 'Compose hover, focus, active, and descendant selector utilities without writing a custom CSS file.',
      tokens: ['ank-bgHover-brandAurora', 'ank-boxShadowFocus-*', 'SEL__button'],
    },
    {
      label: 'Responsive',
      title: 'Breakpoint output',
      description: 'Create responsive variants in the dedicated responsive stylesheet using custom breakpoint names.',
      tokens: ['ank-gridTemplateColumns-stage-*', 'angora-styles-responsive.css'],
    },
    {
      label: 'Quality',
      title: 'Validation and diagnostics',
      description: 'Preview generated rules, detect malformed classes, and inspect the last CSS creation report.',
      tokens: ['validateClass', 'validateClasses', 'getLastCssCreateReport'],
    },
    {
      label: 'Debug',
      title: 'Debugging API',
      description: 'Read timing history, aggregate performance, and stylesheet/runtime state without DOM timer hooks.',
      tokens: ['getCssCreateHistory', 'getCssCreateDebugSummary', 'getCssCreateDebugSnapshot'],
    },
  ];

  public combos: { [key: string]: string[] } = {
    Abtn: [
      'ank-borderWidth-VAL1DEF4pxDEF ank-m-VAL2DEF1rem__autoDEF ank-p-VAL3DEF0_5remDEF ank-rounded-VAL4DEF0_5remDEF',
    ],
    APage: ['ank-minHeight-100vh ank-bg-fieldMist ank-c-inkpulse ank-px-1rem ank-py-1_5rem'],
    ALayout: ['ank-w-100per ank-maxWidth-96rem ank-mx-auto ank-d-flex ank-flexWrap-wrap ank-gap-1_5rem ank-alignItems-start ank-bxs-borderMINbox'],
    AShowcaseStack: ['ank-flex-1 ank-flexBasis-22rem ank-wmn-0 ank-d-grid ank-gap-1_25rem'],
    AHero: ['ank-w-100per ank-wmn-0 ank-bxs-borderMINbox ank-bg-white ank-rounded-1_75rem ank-p-2rem ank-d-grid ank-gap-1rem ank-borderWidth-1px ank-borderStyle-solid ank-borderColor-cloudLine ank-boxShadow-softShadow'],
    ASection: ['ank-w-100per ank-wmn-0 ank-bxs-borderMINbox ank-bg-white ank-rounded-1_5rem ank-p-1_5rem ank-d-grid ank-gap-1rem ank-borderWidth-1px ank-borderStyle-solid ank-borderColor-cloudLine ank-boxShadow-softShadow'],
    ASectionHeader: ['ank-wmn-0 ank-d-grid ank-gap-0_35rem'],
    APanelStack: ['ank-flex-1 ank-flexBasis-20rem ank-wmn-0 ank-maxWidth-28rem ank-d-grid ank-gap-1rem'],
    APanel: ['ank-w-100per ank-wmn-0 ank-bxs-borderMINbox ank-bg-white ank-c-inkpulse ank-rounded-1_5rem ank-p-1_5rem ank-d-grid ank-gap-1rem ank-borderWidth-1px ank-borderStyle-solid ank-borderColor-cloudLine ank-boxShadow-softShadow'],
    ALabel: ['ank-m-0 ank-c-signalMint ank-fontSize-0_8rem ank-letterSpacing-0_18em ank-textTransform-uppercase ank-opacity-0_85 ank-fontWeight-700'],
    AHeroCopy: ['ank-m-0 ank-c-inkpulse ank-lineHeight-1_65 ank-maxWidth-58ch ank-opacity-0_85'],
    ATutorialGrid: ['ank-wmn-0 ank-display-grid ank-gridTemplateColumns-1fr ank-gap-1rem ank-gridTemplateColumns-stage-repeatSD2COM__1frED'],
    ATutorialStep: ['ank-wmn-0 ank-bxs-borderMINbox ank-bg-fieldMist ank-rounded-1rem ank-p-1rem ank-d-grid ank-gap-0_75rem ank-borderWidth-1px ank-borderStyle-solid ank-borderColor-cloudLine'],
    AStepHead: ['ank-wmn-0 ank-d-flex ank-gap-0_75rem ank-alignItems-center'],
    AStepNumber: ['ank-d-inlineMINflex ank-alignItems-center ank-justifyContent-center ank-w-2_35rem ank-h-2_35rem ank-rounded-pillRadius ank-bg-inkpulse ank-c-fieldMist ank-fontWeight-800'],
    ACodeBlock: ['ank-wmn-0 ank-maxWidth-100per ank-bxs-borderMINbox ank-m-0 ank-p-1rem ank-rounded-0_85rem ank-bg-inkpulse ank-c-fieldMist ank-whiteSpace-preMINwrap ank-overflow-auto ank-fontSize-0_84rem ank-lineHeight-1_45'],
    APathCard: ['ank-wmn-0 ank-bxs-borderMINbox ank-bg-fieldMist ank-rounded-1rem ank-p-1rem ank-d-grid ank-gap-0_75rem ank-borderWidth-1px ank-borderStyle-solid ank-borderColor-cloudLine'],
    APathLabel: ['ank-d-inlineMINblock ank-w-fitMINcontent ank-rounded-pillRadius ank-px-0_65rem ank-py-0_25rem ank-bg-inkpulse ank-c-fieldMist ank-fontSize-0_72rem ank-fontWeight-800 ank-textTransform-uppercase'],
    AButtonGallery: ['ank-wmn-0 ank-display-grid ank-gridTemplateColumns-1fr ank-gap-1rem ank-gridTemplateColumns-stage-repeatSD2COM__1frED ank-gridTemplateColumns-billboard-repeatSD3COM__1frED'],
    AShowcaseCard: ['ank-wmn-0 ank-bxs-borderMINbox ank-bg-fieldMist ank-rounded-1rem ank-p-1rem ank-d-grid ank-gap-0_75rem ank-borderWidth-1px ank-borderStyle-solid ank-borderColor-cloudLine'],
    AShowcaseLabel: ['ank-m-0 ank-c-inkpulse ank-fontSize-0_72rem ank-letterSpacing-0_14em ank-textTransform-uppercase ank-fontWeight-700 ank-opacity-0_75'],
    APreviewSurface: ['ank-wmn-0 ank-bxs-borderMINbox ank-bg-fieldMist ank-rounded-1rem ank-p-1rem ank-d-grid ank-gap-0_75rem ank-borderWidth-1px ank-borderStyle-solid ank-borderColor-cloudLine'],
    AActionButton: ['ank-bg-brandAurora ank-c-fieldMist ank-p-0_85rem__1_1rem ank-rounded-pillRadius ank-borderWidth-1px ank-borderStyle-solid ank-borderColor-cloudLine ank-fontWeight-800 ank-transformHover-translateYSDMIN2pxED ank-transformActive-scaleSD0_98ED ank-boxShadowHover-0__12px__28px__rgbaSD15COM23COM42COM0_18ED'],
    AFormButton: ['ank-bg-fieldMist ank-c-inkpulse ank-p-0_85rem__1rem ank-rounded-pillRadius ank-borderWidth-1px ank-borderStyle-solid ank-borderColor-cloudLine ank-fontWeight-700'],
    AChipRow: ['ank-d-flex ank-flexWrap-wrap ank-gap-0_5rem ank-alignItems-center'],
    AChip: ['ank-wmn-0 ank-maxWidth-100per ank-bxs-borderMINbox ank-overflow-auto ank-d-inlineMINblock ank-bg-white ank-c-inkpulse ank-rounded-pillRadius ank-px-0_65rem ank-py-0_3rem ank-borderWidth-1px ank-borderStyle-solid ank-borderColor-cloudLine ank-fontSize-0_78rem'],
    AResponsiveGrid: ['ank-wmn-0 ank-display-grid ank-gridTemplateColumns-1fr ank-gap-1rem ank-gridTemplateColumns-stage-repeatSD2COM__1frED ank-gridTemplateColumns-billboard-repeatSD3COM__1frED'],
    AResponsiveCard: ['ank-wmn-0 ank-bxs-borderMINbox ank-bg-fieldMist ank-rounded-1rem ank-p-1rem ank-d-grid ank-gap-0_65rem ank-borderWidth-1px ank-borderStyle-solid ank-borderColor-cloudLine'],
    AMetricGrid: ['ank-wmn-0 ank-d-flex ank-flexWrap-wrap ank-gap-0_75rem'],
    AMetricCard: ['ank-flex-1 ank-wmn-0 ank-minWidth-8rem ank-bxs-borderMINbox ank-bg-fieldMist ank-rounded-1rem ank-p-1rem ank-d-grid ank-gap-0_25rem ank-borderWidth-1px ank-borderStyle-solid ank-borderColor-cloudLine'],
    AMeta: ['ank-d-grid ank-gap-0_35rem ank-fontSize-0_92rem'],
    AList: ['ank-listStyle-none ank-p-0 ank-m-0 ank-d-grid ank-gap-0_75rem'],
    ADiagnosticItem: ['ank-wmn-0 ank-bxs-borderMINbox ank-bg-white ank-rounded-1rem ank-p-1rem ank-borderWidth-1px ank-borderStyle-solid ank-borderColor-goldenrod ank-d-grid ank-gap-0_5rem'],
    AValidateRow: ['ank-wmn-0 ank-d-flex ank-flexWrap-wrap ank-gap-0_75rem ank-alignItems-center'],
    AInput: ['ank-flex-1 ank-w-100per ank-wmn-0 ank-bxs-borderMINbox ank-bg-white ank-c-inkpulse ank-p-1rem ank-rounded-1rem ank-borderWidth-1px ank-borderStyle-solid ank-borderColor-cloudLine'],
    AValidationBox: ['ank-wmn-0 ank-bxs-borderMINbox ank-mt-1rem ank-p-1rem ank-rounded-1_25rem ank-borderWidth-1px ank-borderStyle-solid ank-d-grid ank-gap-0_75rem'],
    AValidationHead: ['ank-d-flex ank-flexWrap-wrap ank-gap-0_75rem ank-justifyContent-spaceMINbetween ank-alignItems-center'],
    ABadge: ['ank-rounded-99rem ank-px-0_75rem ank-py-0_3rem ank-fontWeight-700 ank-textTransform-uppercase ank-letterSpacing-0_08em ank-fontSize-0_74rem ank-c-white'],
    ARulePreview: ['ank-wmn-0 ank-maxWidth-100per ank-bxs-borderMINbox ank-m-0 ank-p-1rem ank-rounded-1rem ank-bg-black ank-c-white ank-whiteSpace-preMINwrap ank-overflow-auto ank-fontSize-0_85rem ank-lineHeight-1_5'],
    ASummary: ['ank-wmn-0 ank-d-flex ank-flexWrap-wrap ank-gap-0_75rem ank-fontSize-0_92rem'],
    ASampleItem: ['ank-wmn-0 ank-bxs-borderMINbox ank-bg-fieldMist ank-rounded-1rem ank-p-0_85rem ank-d-flex ank-flexWrap-wrap ank-gap-0_75rem ank-justifyContent-spaceMINbetween ank-alignItems-center ank-borderWidth-1px ank-borderStyle-solid ank-borderColor-cloudLine'],
    ADirectiveStatus: ['ank-d-flex ank-flexWrap-wrap ank-gap-0_75rem ank-alignItems-center'],
    AMuted: ['ank-m-0 ank-opacity-0_8'],
  };

  public readonly showcaseButtons: ShowcaseButton[] = [
    {
      label: 'Warm outline',
      className: 'ank-btnOutline-succank-secbank AbtnVALSVL2pxVL2rem__auto__1rem',
      note: 'Original variable combo with a custom border width and shared margin override.',
    },
    {
      label: 'Neon block',
      className: 'ank-btnOutline-indigoBS-friend AbtnVALSVAL3N2remVAL3NVL8px',
      note: 'Large padding with a lighter border value for a softer outline.',
    },
    {
      label: 'High contrast',
      className: 'ank-btn-dankcent-revdankcent AbtnVALSVAL3N1remVAL3NVAL4N1remVAL4N',
      note: 'Filled gradient button with paired gradient text owned by the button generator.',
    },
    {
      label: 'Interactive contrast',
      className: 'ank-btn-dankcent ank-c-success ank-cHover-info AbtnVALSVAL3N1remVAL3NVAL4N1remVAL4N',
      note: 'Shows color transitions on hover without changing the combo shell.',
    },
    {
      label: 'Secondary fill',
      className: 'ank-btn-secondary ank-c-dankcent AbtnVALSVAL3N1remVAL3NVAL4N1remVAL4N',
      note: 'Default token families compose cleanly with the variable combo wrapper.',
    },
    {
      label: 'Warning fill',
      className: 'ank-btn-warning ank-c-revdankcent AbtnVALSVAL3N1remVAL3NVAL4N1remVAL4N',
      note: 'A bright semantic surface using the same spacing shell.',
    },
    {
      label: 'Gradient fill',
      className: 'ank-btn-gradsecbank-revdankcent AbtnVALSVAL3N1remVAL3NVAL4N1remVAL4N',
      note: 'Exercises the paired filled-gradient path with owned text and surface layers.',
    },
    {
      label: 'Mono outline',
      className: 'ank-btnOutline-dankcent-revdankcent AbtnVALSVAL3_4N1remVAL3_4N',
      note: 'Single override shared by padding and radius for a tighter mono outline.',
    },
    {
      label: 'Accent mix',
      className: 'ank-btnOutline-primary-danger ank-fw-900 AbtnVALSVAL3_4N1remVAL3_4NVL8pxVL2rem__autoVL3rem',
      note: 'Multi-value combo overrides with stronger weight and a larger outer rhythm.',
    },
  ];

  public readonly runtimeFamilies: RuntimeFamily[] = [
    {
      method: 'pushColors',
      title: 'Runtime palette injection',
      description: 'Adds gradients and semantic colors that can be consumed immediately by classes and combos.',
      tokens: ['ank-bg-brandAurora', 'ank-bg-brandNebula', 'ank-c-inkpulse', 'ank-borderColor-cloudLine'],
    },
    {
      method: 'pushBPS',
      title: 'Custom breakpoints',
      description: 'Registers stage and billboard breakpoints for responsive grid behavior beyond the defaults.',
      tokens: [
        'ank-gridTemplateColumns-stage-repeatSD2COM__1frED',
        'ank-gridTemplateColumns-billboard-repeatSD3COM__1frED',
      ],
    },
    {
      method: 'pushAbreviationsValues',
      title: 'Readable value aliases',
      description: 'Maps domain-friendly names to spacing, radius, typography, and shadow values.',
      tokens: ['clusterGap-spaceStack', 'maxPanel-panelWidth', 'ank-fontSize-heroScale', 'ank-boxShadow-softShadow'],
    },
    {
      method: 'pushAbreviationsClasses',
      title: 'Property aliases',
      description: 'Shortens verbose property names so repeated layout patterns stay easy to scan.',
      tokens: ['disp-flex', 'flowDir-column', 'flowJust-center', 'crossAlign-center'],
    },
    {
      method: 'pushCombos',
      title: 'Reusable view recipes',
      description: 'Registers the page shell and the new runtime banner combo with default and overridden values.',
      tokens: ['LabBanner', 'LabBannerVALSVLbrandNebulaVLfieldMist', 'AActionButton', 'APreviewSurface'],
    },
  ];

  public readonly performanceNotes: PerformanceNote[] = [
    {
      title: 'Batch runtime registration',
      description: 'Use one setup transaction so registry methods do not each trigger their own scan and rule creation pass.',
      code: 'ank.runInCssCreateBatch(() => {\n  ank.pushColors(colors);\n  ank.pushBPS(breakpoints);\n  ank.pushCombos(combos);\n});',
    },
    {
      title: 'Idempotent rule creation',
      description: 'Forced updates now replace the matching selector before inserting the new rule, including nested responsive rules.',
      code: 'ank.cssCreate(["ank-color-red"], true);\nank.cssCreate(["ank-color-red"], true);\n// one .ank-color-red rule remains',
    },
    {
      title: 'Use cssCreate intentionally',
      description: 'Run it after the view renders, after lazy content appears, or after user-generated classes change. Avoid unconditional DoCheck loops.',
      code: 'afterNextRender(() => ank.cssCreate());\n// later, after a class-changing action:\nank.cssCreate();',
    },
    {
      title: 'Debug from the service',
      description: 'Read timings and run history directly from the library instead of creating a cssCreateMessage element.',
      code: 'const history = ank.getCssCreateHistory(8);\nconst summary = ank.getCssCreateDebugSummary();\nconst snapshot = ank.getCssCreateDebugSnapshot();',
    },
  ];

  public readonly responsiveItems: ResponsiveItem[] = [
    {
      title: 'Single-column baseline',
      breakpoint: 'base',
      description: 'The showcase collapses to one column first so every capability remains legible on narrow screens.',
      tokens: ['ank-gridTemplateColumns-1fr'],
    },
    {
      title: 'Two-column stage layout',
      breakpoint: 'stage',
      description: 'The custom stage breakpoint splits the showcase into two balanced columns once there is enough room.',
      tokens: ['ank-gridTemplateColumns-stage-repeatSD2COM__1frED'],
    },
    {
      title: 'Three-column billboard layout',
      breakpoint: 'billboard',
      description: 'The billboard breakpoint expands the grid again for larger desktop viewports and demos side-by-side states.',
      tokens: ['ank-gridTemplateColumns-billboard-repeatSD3COM__1frED'],
    },
  ];

  public readonly utilityTokens: string[] = [
    'disp-flex',
    'flowDir-column',
    'flowJust-center',
    'crossAlign-center',
    'clusterGap-spaceStack',
    'surfacePad-spaceStack',
    'maxPanel-panelWidth',
  ];

  public readonly selectorTokens: string[] = [
    'ank-cSEL__strong-brandAurora',
    'ank-bgSEL__code-fieldMist',
    'ank-cSEL__code-inkpulse',
    'ank-bgSEL__button-brandAurora',
    'ank-cSEL__button-fieldMist',
    'ank-pSEL__button-0_55rem__0_9rem',
    'ank-roundedSEL__button-pillRadius',
  ];

  public validationCandidate = 'ank-color-signalMint';
  public sampleClasses = ['ank-color-signalMint', 'disp-flex', 'ank-'];
  public cssCreateReport: ICssCreateReport;
  public cssCreateDebugSummary: ICssCreateDebugSummary;
  public cssCreateHistory: ICssCreateReport[] = [];
  public latestValidation: IClassValidationResult;
  public sampleValidationReport: IClassesValidationReport;
  public apiStats: ApiStat[] = [];
  public directiveReady = false;
  public directiveEvents = 0;

  constructor(
    private _ank: NgxAngoraService,
    private _ngZone: NgZone,
  ) {
    this._ank.values.useTimer = false;
    this._ank.values.useRecurrentStrategy = false;
    this._ank.values.encryptCombo = false;
    this.cssCreateReport = this._ank.getLastCssCreateReport();
    this.cssCreateDebugSummary = this._ank.getCssCreateDebugSummary();
    this.cssCreateHistory = this.getDisplayHistory();
    this.latestValidation = this._ank.validateClass(this.validationCandidate, this.validationOptions);
    this.sampleValidationReport = this._ank.validateClasses(this.sampleClasses, this.validationOptions);
    this.refreshApiStats();
    // this._ank.changeDebugOption(true);

    afterNextRender(() => {
      setTimeout(() => {
        this._ngZone.run(() => {
          this._ank.checkSheet();
          this._ank.checkSheet('responsive');
          this.registerRuntimeFeatures();
          this.refreshInspector();
        });
      });
    });
  }

  cssCreate(): void {
    this.runCssCreate();
  }

  validateCandidate(className: string): void {
    this.validationCandidate = className;
    this.latestValidation = this._ank.validateClass(className, this.validationOptions);

    setTimeout(() => {
      this.runCssCreate();
    });
  }

  markDirectiveReady(): void {
    this.directiveReady = true;
    this.directiveEvents += 1;
  }

  clearCssCreateHistory(): void {
    this._ank.clearCssCreateHistory();
    this.refreshInspector();
  }

  formatDuration(durationMs?: number): string {
    if (typeof durationMs !== 'number') {
      return 'pending';
    }

    return `${durationMs.toFixed(2)}ms`;
  }

  formatCentralTime(timestamp?: number): string {
    if (!timestamp) {
      return 'pending';
    }

    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/Mexico_City',
    }).format(timestamp);
  }

  private registerRuntimeFeatures(): void {
    if (this.runtimeFeaturesRegistered) {
      return;
    }

    this.runtimeFeaturesRegistered = true;
    this._ank.runInCssCreateBatch(() => {
      this._ank.pushColors(this.runtimeColors);
      this._ank.pushBPS(this.runtimeBreakpoints);
      this._ank.pushAbreviationsValues(this.runtimeAbreviationsValues);
      this._ank.pushAbreviationsClasses(this.runtimeAbreviationsClasses);
      this._ank.pushCombos(this.combos);
      this._ank.pushCombos(this.runtimeCombos);
    });
  }

  private refreshApiStats(): void {
    this.apiStats = [
      {
        label: 'Colors',
        method: 'getColors',
        count: this.countEntries(this._ank.getColors()),
        hint: 'Base palette plus runtime additions.',
      },
      {
        label: 'Breakpoints',
        method: 'getBPS',
        count: this.countEntries(this._ank.getBPS()),
        hint: 'Default breakpoints plus stage and billboard.',
      },
      {
        label: 'Class aliases',
        method: 'getAbreviationsClasses',
        count: this.countEntries(this._ank.getAbreviationsClasses()),
        hint: 'Readable shortcuts for verbose property names.',
      },
      {
        label: 'Value aliases',
        method: 'getAbreviationsValues',
        count: this.countEntries(this._ank.getAbreviationsValues()),
        hint: 'Spacing, radius, typography, and shadow aliases.',
      },
      {
        label: 'Combos',
        method: 'getCombos',
        count: this.countEntries(this._ank.getCombos()),
        hint: 'App shell combos and runtime banner recipes.',
      },
      {
        label: 'Tracked classes',
        method: 'getAlreadyCreatedClasses',
        count: this.countEntries(this._ank.getAlreadyCreatedClasses()),
        hint: 'Classes already generated during this session.',
      },
    ];
  }

  private countEntries(collection: unknown): number {
    if (collection instanceof Set || collection instanceof Map) {
      return collection.size;
    }

    if (Array.isArray(collection)) {
      return collection.length;
    }

    if (collection && typeof collection === 'object') {
      return Object.keys(collection as Record<string, unknown>).length;
    }

    return 0;
  }

  private refreshInspector(): void {
    this.cssCreateReport = this._ank.getLastCssCreateReport();
    this.cssCreateDebugSummary = this._ank.getCssCreateDebugSummary();
    this.cssCreateHistory = this.getDisplayHistory();
    this.latestValidation = this._ank.validateClass(this.validationCandidate, this.validationOptions);
    this.sampleValidationReport = this._ank.validateClasses(this.sampleClasses, this.validationOptions);
    this.refreshApiStats();
  }

  private getDisplayHistory(): ICssCreateReport[] {
    return this._ank.getCssCreateHistory(8).slice().reverse();
  }

  private runCssCreate(allowDiagnosticFollowUp = true): void {
    this._ank.cssCreate();
    this.refreshInspector();

    if (allowDiagnosticFollowUp && this.cssCreateReport.diagnostics.length > 0) {
      setTimeout(() => {
        this.runCssCreate(false);
      });
    }
  }
}
