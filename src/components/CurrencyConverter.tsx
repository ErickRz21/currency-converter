import { useState, useEffect, useCallback, useRef } from 'react';
import type { CurrenciesResponse, RatesResponse } from '../types/currency';
import { THEMES, DEFAULT_THEME, type ThemeName, type ThemeClasses } from '../themes';

const POPULAR_PAIRS = [
  { from: 'MXN', to: 'USD' },
  { from: 'CAD', to: 'MXN' },
  { from: 'EUR', to: 'MXN' },
  { from: 'GBP', to: 'MXN' },
  { from: 'JPY', to: 'MXN' },
];

// ── Searchable currency combobox ──────────────────────────────────────────────
interface CurrencySelectProps {
  value: string;
  currencies: CurrenciesResponse;
  onChange: (code: string) => void;
  align?: 'left' | 'right';
  tc: ThemeClasses;
}

function CurrencySelect({ value, currencies, onChange, align = 'left', tc }: CurrencySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const entries = Object.entries(currencies); // [code, name][]

  const filtered = query.trim()
    ? entries.filter(([code, name]) =>
        code.toLowerCase().includes(query.toLowerCase()) ||
        (name as string).toLowerCase().includes(query.toLowerCase())
      )
    : entries;

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  function handleSelect(code: string) {
    onChange(code);
    setOpen(false);
    setQuery('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
  }

  return (
    <div ref={containerRef} className="relative w-full" onKeyDown={handleKeyDown}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="from-to currency-select w-full flex items-center justify-between gap-2 text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate font-semibold tracking-wide">{value}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute z-50 mt-2 w-60 rounded-xl border ${tc.dropdownBorder} bg-neutral-950/60 backdrop-blur-sm shadow-md ${tc.dropdownShadow} overflow-hidden ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {/* Search input */}
          <div className={`p-2 border-b ${tc.searchBorder}`}>
            <div className={`relative flex items-center ${tc.searchIcon}`}>
              <svg className="absolute left-3 w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search currency…"
                className={`w-full bg-neutral-900/40 border ${tc.searchBorder} rounded-lg py-2 pl-9 pr-3 text-sm text-white ${tc.searchPlaceholder} focus:outline-none ${tc.searchFocus} transition-all`}
              />
            </div>
          </div>

          {/* List */}
          <ul
            ref={listRef}
            role="listbox"
            className="max-h-52 overflow-y-auto py-1 overscroll-contain"
          >
            {filtered.length === 0 ? (
              <li className={`px-4 py-3 text-sm ${tc.noResults} text-center`}>No results</li>
            ) : (
              filtered.map(([code, name]) => (
                <li
                  key={code}
                  role="option"
                  aria-selected={code === value}
                  onClick={() => handleSelect(code)}
                  className={`flex items-center gap-3 px-4 py-1.5 cursor-pointer text-xs transition-colors
                    ${code === value
                      ? `${tc.selectedItem} text-white`
                      : `border-l border-transparent text-white/70 ${tc.itemHover} hover:text-white`
                    }`}
                >
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className={`font-semibold ${tc.codeText} text-sm leading-tight`}>{code}</span>
                    <span className="text-xs leading-snug wrap-break-word">{name as string}</span>
                  </div>
                  {code === value && (
                    <svg className={`ml-auto w-3.5 h-3.5 ${tc.accent} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Main converter ────────────────────────────────────────────────────────────
export default function CurrencyConverter() {
  const [currencies, setCurrencies] = useState<CurrenciesResponse | null>(null);
  const [rates, setRates] = useState<RatesResponse | null>(null);

  const [amount, setAmount] = useState<string>('1.00');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('MXN');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);

  // ── Theme state ────────────────────────────────────────────────────────────
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(DEFAULT_THEME);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const theme = THEMES[currentTheme];
  const tc = theme.classes;

  // Sync theme to <html> so Astro static components (Footer, badge) can use it.
  // Also set CSS vars globally so elements outside the card wrapper inherit them.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    document.documentElement.style.setProperty('--theme-card-border-rgb', theme.cssVars.cardBorderRgb);
    document.documentElement.style.setProperty('--theme-card-bg-rgb', theme.cssVars.cardBgRgb);
    document.documentElement.style.setProperty('--theme-glow-rgb', theme.cssVars.glowRgb);
  }, [currentTheme, theme.cssVars]);

  // Close picker on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  // Fetch the list of currencies once on mount
  // NOTE: Using the external API directly so this works in Capacitor (no Astro server).
  useEffect(() => {
    fetch('https://api.frankfurter.dev/v2/currencies')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch currencies');
        return res.json();
      })
      .then((raw: { iso_code: string; name: string }[]) => {
        // v2 returns an array; transform into { CODE: name } map
        const map: CurrenciesResponse = {};
        for (const currency of raw) {
          map[currency.iso_code] = currency.name;
        }
        setCurrencies(map);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  // Fetch rates when the base currency changes
  // NOTE: Using the external API directly so this works in Capacitor (no Astro server).
  const fetchRates = useCallback((base: string) => {
    setLoading(true);
    setError(null);
    fetch(`https://api.frankfurter.dev/v2/rates?base=${base}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch rates');
        return res.json();
      })
      .then((raw: { date: string; base: string; quote: string; rate: number }[]) => {
        // v2 returns an array of rows; normalize to { amount, base, date, rates: {} }
        const rates: Record<string, number> = {};
        let date = '';
        for (const row of raw) {
          rates[row.quote] = row.rate;
          date = row.date;
        }
        const data: RatesResponse = { amount: 1, base, date, rates };
        setRates(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchRates(fromCurrency);
  }, [fromCurrency, fetchRates]);

  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => setIsSwapping(false), 350);
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip commas before validating/storing
    const raw = e.target.value.replace(/,/g, '');
    if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
      setAmount(raw);
    }
  };

  // Format the stored raw value with thousands separators for display
  const displayAmount = amount === ''
    ? ''
    : (() => {
        const [integer, decimal] = amount.split('.');
        const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return decimal !== undefined ? `${formattedInteger}.${decimal}` : formattedInteger;
      })();

  // Convert
  const parsedAmount = parseFloat(amount) || 0;
  const rate = rates?.rates[toCurrency] || (fromCurrency === toCurrency ? 1 : 0);
  const result = parsedAmount * rate;

  return (
    <div
      data-theme={currentTheme}
      style={
        {
          "--theme-card-border-rgb": theme.cssVars.cardBorderRgb,
          "--theme-card-bg-rgb": theme.cssVars.cardBgRgb,
          "--theme-glow-rgb": theme.cssVars.glowRgb,
        } as React.CSSProperties
      }
      className="w-full max-w-md lg:max-w-xl mx-auto p-4 lg:p-6 glass-card"
    >
      {/* Header */}
      <div className="mb-8 text-center text-white relative">
        <h2 className="text-3xl font-medium tracking-tight mb-2">Converter</h2>
        <p className={`${tc.subtitle} text-sm`}>Real-time exchange rates</p>

        {/* ── Theme Picker ────────────────────────────────────────────────── */}
        <div ref={pickerRef} className="absolute top-0 right-0">
          <button
            onClick={() => setPickerOpen((o) => !o)}
            className="w-7 h-7 rounded-full opacity-80 hover:opacity-100 hover:scale-110 transition-all shadow-lg cursor-pointer"
            style={{ background: theme.preview }}
            aria-label="Change color theme"
            title="Change theme"
          />
          <h1 className="text-white/40 text-sm font-medium">Theme</h1>

          {pickerOpen && (
            <div className="absolute right-0 mt-2 p-3 rounded-2xl bg-neutral-950/95 backdrop-blur-md border border-white/10 shadow-2xl z-50 min-w-max">
              <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mb-2.5 text-center">
                Theme
              </p>
              <div className="flex gap-3">
                {(Object.keys(THEMES) as ThemeName[]).map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setCurrentTheme(name);
                      setPickerOpen(false);
                    }}
                    className="flex flex-col items-center gap-1.5 group"
                    title={THEMES[name].name}
                  >
                    <span
                      className={`w-7 h-7 rounded-full border-2 block transition-all duration-200 group-hover:scale-110 cursor-pointer ${
                        currentTheme === name
                          ? "border-white scale-110 shadow-lg"
                          : "border-white/20 group-hover:border-white/50"
                      }`}
                      style={{ background: THEMES[name].preview }}
                    />
                    <span
                      className={`text-[9px] font-medium transition-colors ${
                        currentTheme === name
                          ? "text-white"
                          : "text-white/40 group-hover:text-white/70"
                      }`}
                    >
                      {THEMES[name].name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-center">
          <p className="text-red-200 text-sm mb-3">{error}</p>
          <button
            onClick={() => fetchRates(fromCurrency)}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-100 rounded-lg text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-6 relative">
          {/* Amount input */}
          <div className="relative">
            <label
              className={`block text-xs font-semibold ${tc.label} uppercase tracking-wider mb-2`}
            >
              Amount
            </label>
            <div className="relative flex items-center text-2xl">
              <span
                className={`absolute left-4 font-medium ${tc.accent} select-none pointer-events-none`}
              >
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={displayAmount}
                onChange={handleAmountChange}
                className="from-to py-4! pl-10! pr-4! font-light! text-2xl!"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3 z-20 relative">
            {/* From */}
            <div className="min-w-0">
              <label
                className={`block text-xs font-semibold ${tc.label} uppercase tracking-wider mb-2`}
              >
                From
              </label>
              {currencies ? (
                <CurrencySelect
                  value={fromCurrency}
                  currencies={currencies}
                  onChange={setFromCurrency}
                  align="left"
                  tc={tc}
                />
              ) : (
                <div className="h-12.5 skeleton w-full" />
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center pb-1">
              <button
                onClick={handleSwap}
                className={`p-3 rounded-full bg-transparent border-2 ${tc.swapButton} cursor-pointer text-white shadow-lg transition-all duration-300 active:scale-90 ${isSwapping ? "swap-spin" : ""}`}
                aria-label="Swap currencies"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </button>
            </div>

            {/* To */}
            <div className="min-w-0">
              <label
                className={`block text-xs font-semibold ${tc.label} uppercase tracking-wider mb-2 text-right`}
              >
                To
              </label>
              {currencies ? (
                <CurrencySelect
                  value={toCurrency}
                  currencies={currencies}
                  onChange={setToCurrency}
                  align="right"
                  tc={tc}
                />
              ) : (
                <div className="h-12.5 skeleton w-full" />
              )}
            </div>
          </div>

          {/* Result */}
          <div
            className={`mt-8 ${tc.resultBg} rounded-xl p-6 border ${tc.resultBorder} text-center relative overflow-hidden min-h-30 flex flex-col justify-center`}
          >
            {loading ? (
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center p-6 space-y-4 ${tc.loadingOverlay} backdrop-blur-sm z-10 fade-slide-up`}
              >
                <div className="w-3/4 h-12 skeleton mx-auto rounded-lg"></div>
                <div className="w-1/2 h-4 skeleton mx-auto rounded-lg"></div>
              </div>
            ) : (
              <div className="fade-slide-up">
                <div className="text-4xl sm:text-5xl font-light text-white tracking-tight wrap-break-word">
                  <span className={`${tc.accent} mr-2`}>
                    {toCurrency === "USD"
                      ? "$"
                      : toCurrency === "EUR"
                        ? "€"
                        : toCurrency === "GBP"
                          ? "£"
                          : toCurrency === "MXN"
                            ? "$"
                            : toCurrency === "CNY"
                              ? "¥"
                              : toCurrency === "JPY"
                                ? "¥"
                                : toCurrency === "CAD"
                                  ? "$"
                                  : ""}
                  </span>
                  {result.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })}
                </div>

                {rates?.date && (
                  <div
                    className={`mt-4 text-xs lg:text-sm ${tc.rateText} py-1 px-3 bg-black/60 rounded-full inline-block border ${tc.rateChipBorder}`}
                  >
                    Rate {rates.rates[toCurrency]?.toFixed(4) || 1} • Updated{" "}
                    {rates.date}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Pairs */}
          <div className="pt-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {POPULAR_PAIRS.map((pair) => (
                <button
                  key={`${pair.from}-${pair.to}`}
                  onClick={() => {
                    setFromCurrency(pair.from);
                    setToCurrency(pair.to);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full border ${tc.pill} transition-colors shadow-sm cursor-pointer`}
                >
                  {pair.from} → {pair.to}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
