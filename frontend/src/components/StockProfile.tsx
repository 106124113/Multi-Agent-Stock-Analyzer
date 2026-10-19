import { ArrowLeft, Building2, Calendar, MapPin, Sparkles, Tag } from 'lucide-react';
import type { StockDetail } from '../types';

interface StockProfileProps {
  stock: StockDetail;
  onBack: () => void;
  onGenerateReport: (symbol: string, exchange: string) => void;
  isGeneratingReport: boolean;
}

export const StockProfile: React.FC<StockProfileProps> = ({
  stock,
  onBack,
  onGenerateReport,
  isGeneratingReport,
}) => {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Stock Catalog</span>
        </button>
      </div>

      {/* Header Profile Banner */}
      <div className="bg-[#111622] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
                {stock.symbol}
              </h1>
              <span
                className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
                  stock.exchange === 'NSE'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {stock.exchange} LISTING
              </span>
              {stock.series && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Series: {stock.series}
                </span>
              )}
              {stock.market_cap_category && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  {stock.market_cap_category}
                </span>
              )}
            </div>
            <h2 className="text-lg text-slate-300 font-medium">{stock.company_name}</h2>
            {stock.isin ? (
              <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                <span className="text-slate-500">ISIN:</span>
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{stock.isin}</span>
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-mono mt-1">ISIN: Not specified in source file</p>
            )}
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <button
              onClick={() => onGenerateReport(stock.symbol, stock.exchange)}
              disabled={isGeneratingReport}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm transition shadow-lg shadow-emerald-950/60 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGeneratingReport ? 'Synthesizing Report...' : 'Generate Full Report'}</span>
            </button>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <span>⚡ Multi-Agent synthesis demo ({stock.exchange})</span>
            </span>
          </div>
        </div>

        {/* Catalog Status Notice */}
        <div
          className={`mt-4 p-3 rounded-lg border text-xs flex items-center justify-between ${
            stock.is_prototype_data
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300/90'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300/90'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                stock.is_prototype_data ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            <span>
              <strong>Source:</strong> {stock.data_source}
              {stock.imported_at && ` (Imported: ${new Date(stock.imported_at).toLocaleDateString()})`}
            </span>
          </div>
          <span className="font-mono text-[11px] uppercase tracking-wider">
            {stock.is_prototype_data ? 'PROTOTYPE_SEED' : 'OFFICIAL_CATALOG'}
          </span>
        </div>

        {/* Meta Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-[#0b0f17] p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Sector</span>
            </div>
            <p className="text-sm font-medium text-slate-200 truncate">{stock.sector || stock.industry || 'General Equity'}</p>
          </div>

          <div className="bg-[#0b0f17] p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <span>Industry</span>
            </div>
            <p className="text-sm font-medium text-slate-200 truncate">{stock.industry || stock.sector || 'N/A'}</p>
          </div>

          <div className="bg-[#0b0f17] p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Headquarters</span>
            </div>
            <p className="text-sm font-medium text-slate-200 truncate">{stock.headquarters || 'India'}</p>
          </div>

          <div className="bg-[#0b0f17] p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Listing Date</span>
            </div>
            <p className="text-sm font-medium text-slate-200 truncate">{stock.listing_date || 'N/A'}</p>
          </div>
        </div>

        {/* Description Section */}
        {stock.description && (
          <div className="mt-6 pt-6 border-t border-slate-800/70">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Business Profile Summary
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
              {stock.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
