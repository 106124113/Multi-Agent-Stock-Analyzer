import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight, Lock, Loader2, Check } from 'lucide-react';
import type { StockSummary } from '../types';
import { searchStocks } from '../api';

interface AnalysisConsoleProps {
  onStartAnalysis: (stock: StockSummary) => void;
  stocks: StockSummary[];
}

export const AnalysisConsole: React.FC<AnalysisConsoleProps> = ({
  onStartAnalysis,
  stocks
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockSummary | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<StockSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search across all 7,854 stocks in backend database
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setSearchResults(stocks.slice(0, 10));
      setIsSearching(false);
      return;
    }

    // If the input exactly matches the selected stock's display string, don't re-search
    if (selectedStock && searchTerm.startsWith(selectedStock.symbol)) {
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchStocks(trimmed, '', 1, 15);
        setSearchResults(res.items || []);
      } catch (err) {
        console.error('Search error in AnalysisConsole:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, stocks, selectedStock]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (stock: StockSummary) => {
    setSelectedStock(stock);
    setSearchTerm(`${stock.symbol} - ${stock.company_name} (${stock.exchange})`);
    setIsDropdownOpen(false);
  };

  const quickPicks = [
    { symbol: 'RELIANCE', exchange: 'NSE' },
    { symbol: 'TCS', exchange: 'NSE' },
    { symbol: 'INFY', exchange: 'NSE' },
    { symbol: 'HDFCBANK', exchange: 'NSE' },
    { symbol: 'ICICIBANK', exchange: 'NSE' },
    { symbol: 'TATAMOTORS', exchange: 'NSE' }
  ];

  const handleQuickPick = async (qp: { symbol: string; exchange: string }) => {
    // Check local stocks first
    const matched = stocks.find((s) => s.symbol === qp.symbol && s.exchange === qp.exchange);
    if (matched) {
      handleSelect(matched);
      return;
    }
    // Search backend
    try {
      const res = await searchStocks(qp.symbol, qp.exchange, 1, 5);
      const found = res.items.find((s) => s.symbol === qp.symbol) || res.items[0];
      if (found) {
        handleSelect(found);
      } else {
        handleSelect({
          id: 0,
          symbol: qp.symbol,
          company_name: qp.symbol,
          exchange: qp.exchange,
          sector: 'General',
          industry: 'General',
          isin: 'INE000000000',
          series: 'EQ',
          is_active: true,
          is_prototype_data: false
        });
      }
    } catch {
      handleSelect({
        id: 0,
        symbol: qp.symbol,
        company_name: qp.symbol,
        exchange: qp.exchange,
        sector: 'General',
        industry: 'General',
        isin: 'INE000000000',
        series: 'EQ',
        is_active: true,
        is_prototype_data: false
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mb-14">
      {/* Hero Badge & Heading */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4 tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Institutional Multi-Agent Stock Analysis
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-100 leading-tight">
          Smarter equity research, <br className="hidden sm:inline" />
          <span className="text-emerald-400">powered by agentic deliberation</span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          13 specialized autonomous agents analyze Indian equities from fundamental, technical, news, and risk angles,
          then debate in an adversarial rebuttal loop to synthesize institutional conviction.
        </p>
      </div>

      {/* 3-Step Interactive Card */}
      <div className="rounded-2xl bg-[#0b101b] border border-slate-800/80 p-5 sm:p-7 shadow-xl shadow-black/40">
        {/* Step 1: Stock Selection */}
        <div className="mb-6" ref={dropdownRef}>
          <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs flex items-center justify-center font-mono font-bold">
              1
            </span>
            <span>Stock Selection</span>
          </div>

          <div className="relative">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                  if (!e.target.value) setSelectedStock(null);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search any Indian stock by symbol, legal name, or ISIN (e.g. RELIANCE, TCS, ZOMATO, SUZLON)..."
                className="w-full bg-[#070b12] border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 rounded-xl pl-10 pr-10 py-3.5 text-sm text-slate-100 placeholder-slate-400 outline-none transition-all shadow-inner"
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 text-emerald-400 absolute right-3.5 animate-spin" />
              )}
            </div>

            {/* Autocomplete Dropdown across all stocks */}
            {isDropdownOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0e1626] border border-slate-700/80 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800 max-h-72 overflow-y-auto">
                <div className="px-3 py-1.5 bg-[#0a0f1a] text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800">
                  <span>Matches in National &amp; Bombay Stock Exchange</span>
                  <span>{searchResults.length} results</span>
                </div>
                {searchResults.map((s) => (
                  <button
                    key={`${s.exchange}-${s.symbol}`}
                    type="button"
                    onClick={() => handleSelect(s)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-800/80 transition-colors group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-100 text-sm group-hover:text-emerald-400 transition-colors">
                          {s.symbol}
                        </span>
                        <span
                          className={`text-xs font-mono font-medium px-2 py-0.5 rounded ${
                            s.exchange === 'NSE'
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {s.exchange}
                        </span>
                        {s.series && (
                          <span className="text-[11px] font-mono text-slate-400">
                            [{s.series}]
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 truncate max-w-md">
                        {s.company_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-slate-400 block">{s.isin}</span>
                      <span className="text-[11px] text-slate-500">{s.sector || 'Equities'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Ticker Chips */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-slate-400 font-medium">Popular:</span>
            {quickPicks.map((qp) => (
              <button
                key={`${qp.exchange}-${qp.symbol}`}
                type="button"
                onClick={() => handleQuickPick(qp)}
                className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 transition-all cursor-pointer shadow-sm"
              >
                {qp.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 & Step 3: Horizon & Research Depth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
          {/* Step 2: Investment Horizon */}
          <div className="rounded-xl bg-[#070b12] border border-slate-800/80 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs flex items-center justify-center font-mono font-bold">
                  2
                </span>
                <span>Investment Horizon</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {/* Short-Term (Greyed Out / Coming Soon) */}
              <div className="relative rounded-xl border border-slate-800/80 bg-slate-900/30 p-3 text-center opacity-40 cursor-not-allowed select-none">
                <div className="text-xs font-semibold text-slate-300">Short-term</div>
                <div className="text-xs text-slate-400 mt-0.5">1-3 months</div>
                <span className="inline-block mt-2 text-[10px] uppercase font-mono font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Coming Soon
                </span>
              </div>

              {/* Medium-Term (Active & Supported: 1 Year Analysis) */}
              <div className="relative rounded-xl border border-emerald-500/60 bg-emerald-500/10 p-3 text-center ring-1 ring-emerald-500/30 cursor-pointer shadow-sm shadow-emerald-500/10">
                <div className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1">
                  <span>Medium-term</span>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="text-xs text-emerald-300/90 font-medium mt-0.5">3-24 months (1 Yr)</div>
                <span className="inline-block mt-2 text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Active
                </span>
              </div>

              {/* Long-Term (Greyed Out / Coming Soon) */}
              <div className="relative rounded-xl border border-slate-800/80 bg-slate-900/30 p-3 text-center opacity-40 cursor-not-allowed select-none">
                <div className="text-xs font-semibold text-slate-300">Long-term</div>
                <div className="text-xs text-slate-400 mt-0.5">2+ years</div>
                <span className="inline-block mt-2 text-[10px] uppercase font-mono font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Coming Soon
                </span>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
              Focuses on 1-year earnings momentum, balance sheet durability, and industry tailwinds.
            </p>
          </div>

          {/* Step 3: Research Depth */}
          <div className="rounded-xl bg-[#070b12] border border-slate-800/80 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs flex items-center justify-center font-mono font-bold">
                  3
                </span>
                <span>Research Depth</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Standard 1 Debate Round (Active) */}
              <div className="relative rounded-xl border border-emerald-500/60 bg-emerald-500/10 p-3 text-center ring-1 ring-emerald-500/30 cursor-pointer shadow-sm shadow-emerald-500/10">
                <div className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1">
                  <span>Standard Deliberation</span>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <div className="text-xs text-emerald-300/90 font-medium mt-0.5">1 Bounded Debate Round</div>
                <span className="inline-block mt-2 text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Active
                </span>
              </div>

              {/* Deep Multi-Round (Greyed Out / Coming Soon) */}
              <div className="relative rounded-xl border border-slate-800/80 bg-slate-900/30 p-3 text-center opacity-40 cursor-not-allowed select-none">
                <div className="flex items-center justify-center gap-1 text-xs font-semibold text-slate-300">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Deep Multi-Round</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">3 Debate Rounds</div>
                <span className="inline-block mt-2 text-[10px] uppercase font-mono font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Coming Soon
                </span>
              </div>
            </div>
            <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
              Executes the full 13-agent deliberation loop including independent Bull/Bear drafting and rebuttal.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
          <div className="text-xs text-slate-300 text-center sm:text-left">
            {selectedStock ? (
              <span>
                Selected equity:{' '}
                <strong className="text-emerald-400 font-mono text-sm">
                  {selectedStock.symbol} ({selectedStock.exchange})
                </strong>{' '}
                <span className="text-slate-200">- {selectedStock.company_name}</span>
              </span>
            ) : (
              <span className="text-slate-400">Select an Indian stock above to initiate institutional multi-agent analysis</span>
            )}
          </div>

          <button
            type="button"
            disabled={!selectedStock}
            onClick={() => selectedStock && onStartAnalysis(selectedStock)}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              selectedStock
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 cursor-pointer font-bold'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <span>Start Agentic Analysis</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
