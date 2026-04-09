import { useState, useEffect, useCallback } from 'react';
import type { CurrenciesResponse, RatesResponse } from '../types/currency';

const POPULAR_PAIRS = [
  { from: 'USD', to: 'MXN' },
  { from: 'CAD', to: 'MXN' },
  { from: 'EUR', to: 'MXN' },
  { from: 'GBP', to: 'MXN' },
  { from: 'JPY', to: 'MXN' },
];

export default function CurrencyConverter() {
  const [currencies, setCurrencies] = useState<CurrenciesResponse | null>(null);
  const [rates, setRates] = useState<RatesResponse | null>(null);

  const [amount, setAmount] = useState<string>('1.00');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');

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
    setTimeout(() => setIsSwapping(false), 350); // Matches CSS animation duration
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow positive numbers (with or without decimals)
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

          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3 z-10 relative">
            {/* From */}
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">
                From
              </label>
              {currencies ? (
                <div className="relative">
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="from-to currency-select"
                    title={currencies[fromCurrency]}
                  >
                    {Object.entries(currencies).map(([code, name]) => (
                      <option key={code} value={code}>
                        {code} - {name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="h-[50px] skeleton w-full"></div>
              )}
            </div>

            {/* Swap Button */}
            <div className="flex justify-center pb-1">
              <button
                onClick={handleSwap}
                className={`p-3 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg transition-all hover:scale-110 active:scale-95 ${isSwapping ? 'swap-spin' : ''}`}
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
                <div className="relative">
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="from-to currency-select"
                    title={currencies[toCurrency]}
                  >
                    {Object.entries(currencies).map(([code, name]) => (
                      <option key={code} value={code}>
                        {code} - {name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="h-[50px] skeleton w-full"></div>
              )}
            </div>
          </div>

          {/* Result */}
          <div className="mt-8 bg-slate-900/40 rounded-xl p-6 border border-slate-800/60 text-center relative overflow-hidden min-h-[140px] flex flex-col justify-center">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-4 bg-slate-900/20 backdrop-blur-sm z-10 fade-slide-up">
                <div className="w-3/4 h-12 skeleton mx-auto rounded-lg"></div>
                <div className="w-1/2 h-4 skeleton mx-auto rounded"></div>
              </div>
            ) : (
              <div className="fade-slide-up">
                <div className="text-4xl sm:text-5xl font-bold text-white tracking-tight break-words">
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
                  className="text-xs px-3 py-1.5 rounded-full border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 transition-colors bg-slate-900/50 shadow-sm"
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
