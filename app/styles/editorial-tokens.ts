export type EditorialLocale = 'ka' | 'en';

type TokenScale = Record<string, string>;

export type EditorialTokens = {
  color: TokenScale;
  border: TokenScale;
  shadow: TokenScale;
  spacing: TokenScale;
  type: TokenScale;
  motion: TokenScale;
  breakpoint: TokenScale;
};

export const editorialTokens: EditorialTokens = {
  color: {
    canvas: '#f3f1eb',
    paper: '#ece9e1',
    ink: '#101010',
    inkSoft: '#2a2a2a',
    inkMute: '#6b6660',
    /* Grid color drives all structural borders — soft taupe at 12% opacity */
    grid: 'rgba(16, 16, 16, 0.12)',
    accentCritical: '#C86D53',
    accentSignal: '#C86D53',
  },
  border: {
    hairline: '1px',
    /* Strong is now same width as hairline — weight comes from context, not pixels */
    strong: '1px',
    radius: '6px',
  },
  shadow: {
    /* Diffused luxury shadows instead of pixel-art offsets */
    hardSm: '0 8px 30px rgba(0, 0, 0, 0.05)',
    hardMd: '0 20px 40px -15px rgba(0, 0, 0, 0.08)',
    none: 'none',
  },
  spacing: {
    xxs: '0.25rem',
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  type: {
    display: '"Noto Sans Georgian", "DM Sans", system-ui, sans-serif',
    body: '"Noto Sans Georgian", "DM Sans", system-ui, sans-serif',
    technical: 'ui-monospace, "Cascadia Code", "Segoe UI Mono", monospace',
    trackingTight: '0.01em',
    trackingWide: '0.14em',
    trackingUltra: '0.22em',
  },
  motion: {
    snap: '160ms ease',
    linearFast: '160ms ease',
    linearMedium: '200ms ease',
    overlayFade: '220ms ease',
  },
  breakpoint: {
    xs: '480px',
    sm: '768px',
    md: '1024px',
    lg: '1280px',
  },
};

type CssValue = string | number;

function cssVarBlock(prefix: string, scale: Record<string, CssValue>): string {
  return Object.entries(scale)
    .map(([key, value]) => `  --${prefix}-${key}: ${String(value)};`)
    .join('\n');
}

export const editorialTokenCssText = `
:root {
${cssVarBlock('ed-color', editorialTokens.color)}
${cssVarBlock('ed-border', editorialTokens.border)}
${cssVarBlock('ed-shadow', editorialTokens.shadow)}
${cssVarBlock('ed-space', editorialTokens.spacing)}
${cssVarBlock('ed-type', editorialTokens.type)}
${cssVarBlock('ed-motion', editorialTokens.motion)}
${cssVarBlock('ed-breakpoint', editorialTokens.breakpoint)}

  --cm-canvas: var(--ed-color-canvas);
  --cm-ink: var(--ed-color-ink);
  --cm-accent: var(--ed-color-accentSignal);
  --cm-border-width: var(--ed-border-hairline);
  --cm-border: var(--ed-border-hairline) solid var(--ed-color-grid);
  --cm-border-strong: var(--ed-border-strong) solid var(--ed-color-grid);
  --cm-border-muted: var(--ed-border-hairline) solid var(--ed-color-inkSoft);
  --cm-radius: var(--ed-border-radius);
  --cm-font-display: var(--ed-type-display);
  --cm-font-body: var(--ed-type-body);
  --cm-font-label: var(--ed-type-display);
  --cm-font-mono: var(--ed-type-technical);
  --cm-shadow-hard: var(--ed-shadow-hardSm);
  --cm-shadow-hard-md: var(--ed-shadow-hardMd);
}
`.trim();
