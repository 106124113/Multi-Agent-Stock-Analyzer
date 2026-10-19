import { ArrowUpRight, Layers } from 'lucide-react';
import type { StockSummary } from '../types';

interface StockCardProps {
  stock: StockSummary;
  onSelect: (symbol: string, exchange: string) => void;
}

export const StockCard: React.FC<StockCardProps> = ({ stock, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(stock.symbol, stock.exchange)}
      className="group relative bg-[#111622] hover:bg-[#151c2c] border border-slate-800/90 hover:border-emerald-500/40 p-5 rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:shadow-black/40 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold text-slate-100 tracking-wide group-hover:text-emerald-400 transition-colors">
              {stock.symbol}
            </span>
            <span
              className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${
                stock.exchange === 'NSE'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {stock.exchange}
            </span>
            {stock.series && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                {stock.series}
              </span>
            )}
            {stock.is_prototype_data && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400/90 border border-amber-500/20">
                MOCK SEED
              </span>
            )}
          </div>
          <div className="p-1 rounded-md text-slate-500 group-hover:text-slate-200 group-hover:bg-slate-800 transition">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <h3 className="text-sm font-medium text-slate-200 line-clamp-1 mb-3">
          {stock.company_name}
        </h3>
      </div>

      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 truncate max-w-[65%]">
          <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{stock.sector || stock.industry || 'Equity Security'}</span>
        </div>
        {stock.isin ? (
          <span className="text-[11px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            {stock.isin}
          </span>
        ) : (
          <span className="text-[10px] font-mono text-slate-600">NO ISIN</span>
        )}
      </div>
    </div>
  );
};
