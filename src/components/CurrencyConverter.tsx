import { useState, useEffect, useCallback, useRef } from 'react';
import type { CurrenciesResponse, RatesResponse } from '../types/currency';

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
}

function CurrencySelect({ value, currencies, onChange, align = 'left' }: CurrencySelectProps) {
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

  const selectedName = currencies[value] as string | undefined;

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
        {/* <span className="truncate text-indigo-300/60 text-xs hidden sm:block">{selectedName}</span> */}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute z-50 mt-2 w-60 rounded-xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {/* Search input */}
          <div className="p-2 border-b border-slate-700/40">
            <div className="relative flex items-center">
              <svg className="absolute left-3 w-4 h-4 text-indigo-400/60 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search currency…"
                className="w-full bg-slate-800/60 border border-slate-700/40 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-indigo-300/30 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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
              <li className="px-4 py-3 text-sm text-indigo-300/40 text-center">No results</li>
            ) : (
              filtered.map(([code, name]) => (
                <li
                  key={code}
                  role="option"
                  aria-selected={code === value}
                  onClick={() => handleSelect(code)}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm transition-colors
                    ${code === value
                      ? 'bg-indigo-500/20 text-white'
                      : 'text-indigo-100/80 hover:bg-slate-700/50 hover:text-white'
                    }`}
                >
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-indigo-300 text-sm leading-tight">{code}</span>
                    <span className="text-xs opacity-60 leading-snug break-words">{name as string}</span>
                  </div>
                  {code === value && (
                    <svg className="ml-auto w-3.5 h-3.5 text-indigo-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

  // Fetch the list of currencies once on mount
  useEffect(() => {
    fetch('/api/currencies')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch currencies');
        return res.json();
      })
      .then((data: CurrenciesResponse) => {
        setCurrencies(data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  // Fetch rates when the base currency changes
  const fetchRates = useCallback((base: string) => {
    setLoading(true);
    setError(null);
    fetch(`/api/rates?base=${base}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch rates');
        return res.json();
      })
      .then((data: RatesResponse) => {
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
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setAmount(val);
    }
  };

  // Convert
  const parsedAmount = parseFloat(amount) || 0;
  const rate = rates?.rates[toCurrency] || (fromCurrency === toCurrency ? 1 : 0);
  const result = parsedAmount * rate;

  return (
    <div className="w-full max-w-md mx-auto p-8 glass-card">
      <div className="mb-8 text-center text-white">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Converter</h2>
        <p className="text-indigo-200/80 text-sm">Real-time exchange rates</p>
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
            <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">
              Amount
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xl font-medium text-indigo-200 mt-1 select-none pointer-events-none">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-4 pl-10 pr-4 text-2xl font-bold text-white glow-input transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3 z-20 relative">
            {/* From */}
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">
                From
              </label>
              {currencies ? (
                <CurrencySelect
                  value={fromCurrency}
                  currencies={currencies}
                  onChange={setFromCurrency}
                  align="left"
                />
              ) : (
                <div className="h-12.5 skeleton w-full" />
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center pb-1">
              <button
                onClick={handleSwap}
                className={`p-3 rounded-full bg-indigo-500 hover:bg-indigo-400 cursor-pointer text-white shadow-lg transition-all hover:scale-110 active:scale-95 ${isSwapping ? 'swap-spin' : ''}`}
                aria-label="Swap currencies"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </div>

            {/* To */}
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2 text-right">
                To
              </label>
              {currencies ? (
                <CurrencySelect
                  value={toCurrency}
                  currencies={currencies}
                  onChange={setToCurrency}
                  align="right"
                />
              ) : (
                <div className="h-12.5 skeleton w-full" />
              )}
            </div>
          </div>

          {/* Result */}
          <div className="mt-8 bg-slate-900/40 rounded-xl p-6 border border-slate-800/60 text-center relative overflow-hidden min-h-30 flex flex-col justify-center">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-4 bg-slate-900/20 backdrop-blur-sm z-10 fade-slide-up">
                <div className="w-3/4 h-12 skeleton mx-auto rounded-lg"></div>
                <div className="w-1/2 h-4 skeleton mx-auto rounded"></div>
              </div>
            ) : (
              <div className="fade-slide-up">
                <div className="text-4xl sm:text-5xl font-bold text-white tracking-tight wrap-break-word">
                  <span className="text-indigo-400 mr-2">{toCurrency === 'USD' ? '$' : toCurrency === 'EUR' ? '€' : toCurrency === 'GBP' ? '£' : toCurrency === 'MXN' ? '$' : ''}</span>
                  {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </div>

                {rates?.date && (
                  <div className="mt-4 text-sm text-indigo-300/70 py-1 px-3 bg-indigo-900/30 rounded-full inline-block border border-indigo-500/20">
                    Rate {rates.rates[toCurrency]?.toFixed(4) || 1} • Updated {rates.date}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Pairs */}
          <div className="pt-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {POPULAR_PAIRS.map(pair => (
                <button
                  key={`${pair.from}-${pair.to}`}
                  onClick={() => {
                    setFromCurrency(pair.from);
                    setToCurrency(pair.to);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition-colors bg-slate-900/50 shadow-sm cursor-pointer"
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
