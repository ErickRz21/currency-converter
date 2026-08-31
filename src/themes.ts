// ── Theme System ─────────────────────────────────────────────────────────────
// All Tailwind class names must be COMPLETE static strings in this file so
// Tailwind's content scanner includes them in the build output.

export type ThemeName = 'emerald' | 'blue' | 'rose' | 'violet';

export interface ThemeClasses {
  // Text
  label: string;         // e.g. text-emerald-300
  accent: string;        // e.g. text-emerald-400
  subtitle: string;      // subtitle line under heading
  rateText: string;      // rate chip text with lower opacity
  noResults: string;     // "No results" message color
  codeText: string;      // currency code in dropdown list
  searchIcon: string;    // search svg icon color

  // Backgrounds & borders
  resultBg: string;
  resultBorder: string;
  loadingOverlay: string;
  rateChipBorder: string;
  dropdownBorder: string;
  dropdownShadow: string;
  searchBorder: string;
  searchFocus: string;       // complete focus ring classes for search input
  searchPlaceholder: string;

  // List item states
  selectedItem: string;  // selected option bg
  itemHover: string;     // unselected option hover border

  // Controls
  swapButton: string;    // border + hover border for swap btn
  pill: string;          // quick-pair pill: full class set
}

export interface AppTheme {
  name: string;
  preview: string; // hex color for the swatch button
  /** Values for CSS custom properties set inline on the card wrapper */
  cssVars: {
    cardBorderRgb: string;
    cardBgRgb: string;
    glowRgb: string;
    /** opacity of the coloured outer glow (0–1 string, e.g. "0.18") */
    glowOpacity: string;
    /** blur spread of the coloured outer glow in px, e.g. "120" */
    glowSpread: string;
  };
  classes: ThemeClasses;
}

export const THEMES: Record<ThemeName, AppTheme> = {
  emerald: {
    name: 'Green',
    preview: '#34d399',
    cssVars: {
      cardBorderRgb: '116, 251, 181',
      cardBgRgb: '11, 15, 13',
      glowRgb: '116, 251, 181',
      glowOpacity: '0.22',
      glowSpread: '100',
    },
    classes: {
      label: 'text-emerald-300',
      accent: 'text-emerald-400',
      subtitle: 'text-emerald-300',
      rateText: 'text-emerald-300/70',
      noResults: 'text-emerald-300/40',
      codeText: 'text-emerald-300',
      searchIcon: 'text-emerald-400',
      resultBg: 'bg-emerald-950/60',
      resultBorder: 'border-emerald-700/50',
      loadingOverlay: 'bg-emerald-900/20',
      rateChipBorder: 'border-emerald-700/50',
      dropdownBorder: 'border-emerald-700/60',
      dropdownShadow: 'shadow-emerald-950',
      searchBorder: 'border-emerald-700/40',
      searchFocus: 'focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500',
      searchPlaceholder: 'placeholder-emerald-300',
      selectedItem: 'bg-emerald-500/20',
      itemHover: 'hover:border-emerald-300',
      swapButton: 'border-emerald-800 hover:border-emerald-400',
      pill: 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 hover:text-emerald-200 bg-emerald-950/50',
    },
  },

  blue: {
    name: 'Blue',
    preview: '#60a5fa',
    cssVars: {
      cardBorderRgb: '96, 165, 250',
      cardBgRgb: '11, 13, 25',
      glowRgb: '96, 165, 250',
      glowOpacity: '0.20',
      glowSpread: '90',
    },
    classes: {
      label: 'text-blue-300',
      accent: 'text-blue-400',
      subtitle: 'text-blue-300',
      rateText: 'text-blue-300/70',
      noResults: 'text-blue-300/40',
      codeText: 'text-blue-300',
      searchIcon: 'text-blue-400',
      resultBg: 'bg-blue-950/60',
      resultBorder: 'border-blue-700/50',
      loadingOverlay: 'bg-blue-900/20',
      rateChipBorder: 'border-blue-700/50',
      dropdownBorder: 'border-blue-700/60',
      dropdownShadow: 'shadow-blue-950',
      searchBorder: 'border-blue-700/40',
      searchFocus: 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
      searchPlaceholder: 'placeholder-blue-300',
      selectedItem: 'bg-blue-500/20',
      itemHover: 'hover:border-blue-300',
      swapButton: 'border-blue-800 hover:border-blue-400',
      pill: 'border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 bg-blue-950/50',
    },
  },

  rose: {
    name: 'Rose',
    preview: '#fb7185',
    cssVars: {
      cardBorderRgb: '251, 113, 133',
      cardBgRgb: '25, 11, 13',
      glowRgb: '251, 113, 133',
      glowOpacity: '0.24',
      glowSpread: '110',
    },
    classes: {
      label: 'text-rose-300',
      accent: 'text-rose-400',
      subtitle: 'text-rose-300',
      rateText: 'text-rose-300/70',
      noResults: 'text-rose-300/40',
      codeText: 'text-rose-300',
      searchIcon: 'text-rose-400',
      resultBg: 'bg-rose-950/60',
      resultBorder: 'border-rose-700/50',
      loadingOverlay: 'bg-rose-900/20',
      rateChipBorder: 'border-rose-700/50',
      dropdownBorder: 'border-rose-700/60',
      dropdownShadow: 'shadow-rose-950',
      searchBorder: 'border-rose-700/40',
      searchFocus: 'focus:border-rose-500 focus:ring-1 focus:ring-rose-500',
      searchPlaceholder: 'placeholder-rose-300',
      selectedItem: 'bg-rose-500/20',
      itemHover: 'hover:border-rose-300',
      swapButton: 'border-rose-800 hover:border-rose-400',
      pill: 'border-rose-500/30 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 bg-rose-950/50',
    },
  },

  violet: {
    name: 'Violet',
    preview: '#a78bfa',
    cssVars: {
      cardBorderRgb: '167, 139, 250',
      cardBgRgb: '15, 11, 25',
      glowRgb: '167, 139, 250',
      glowOpacity: '0.20',
      glowSpread: '95',
    },
    classes: {
      label: 'text-violet-300',
      accent: 'text-violet-400',
      subtitle: 'text-violet-300',
      rateText: 'text-violet-300/70',
      noResults: 'text-violet-300/40',
      codeText: 'text-violet-300',
      searchIcon: 'text-violet-400',
      resultBg: 'bg-violet-950/60',
      resultBorder: 'border-violet-700/50',
      loadingOverlay: 'bg-violet-900/20',
      rateChipBorder: 'border-violet-700/50',
      dropdownBorder: 'border-violet-700/60',
      dropdownShadow: 'shadow-violet-950',
      searchBorder: 'border-violet-700/40',
      searchFocus: 'focus:border-violet-500 focus:ring-1 focus:ring-violet-500',
      searchPlaceholder: 'placeholder-violet-300',
      selectedItem: 'bg-violet-500/20',
      itemHover: 'hover:border-violet-300',
      swapButton: 'border-violet-800 hover:border-violet-400',
      pill: 'border-violet-500/30 text-violet-300 hover:bg-violet-500/20 hover:text-violet-200 bg-violet-950/50',
    },
  },
};

export const DEFAULT_THEME: ThemeName = 'emerald';
