/**
 * Official Codinfy design tokens (DESIGN_SYSTEM.md). These are versioned
 * brand-identity constants — real published data, shipped with the
 * package so agents can theme integrations offline.
 */
export const DESIGN_TOKENS = {
  version: "1.0",
  source: "https://github.com/bakalagoin/codinfy — docs/DESIGN_SYSTEM.md",
  colors: {
    primary: "#1A1A1A",
    secondary: "#333333",
    reverse: "#FFFFFF",
    success: "#34BB78",
    danger: "#d40000",
    warning: "#EF9F27",
    info: "#2563EB",
    premium: "#C6A15B",
    deals: "#FF7900",
    "info-deep": "#1E40AF",
    highlight: "#FFCB05",
    "note-bg": "#FFF9C4",
    earth: "#412402",
    "accent-orange": "#F57C00",
    "neutral-light": "#F9F9F9",
    "gray-mid": "#666666",
    "gray-soft": "#999999",
    "gray-line": "#E5E5E5",
  },
  typography: {
    display: "Arial Black (hero, 32-60px)",
    headings: "Plus Jakarta Sans (600-700)",
    body: "Inter (16px, line-height 1.6)",
    ui: "Segoe UI (admin)",
    code: "Courier New",
  },
  ux: {
    minTouchTarget: "44px",
    darkMode: "required (Tailwind dark: variants)",
    mobile: "app-like PWA: bottom navigation, bottom sheets, sticky actions, safe areas",
  },
} as const;
