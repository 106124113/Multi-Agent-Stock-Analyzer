import { AlertCircle, AlertTriangle, FolderSearch, Loader2, RefreshCw } from 'lucide-react';

interface StateCardProps {
  type: 'loading' | 'empty' | 'error' | 'no-results' | 'unimported-catalog';
  title?: string;
  message?: string;
  onRetry?: () => void;
  query?: string;
  exchange?: string;
}

export const StateFeedback: React.FC<StateCardProps> = ({
  type,
  title,
  message,
  onRetry,
  query,
  exchange,
}) => {
  if (type === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-[#111622]/60 rounded-2xl border border-slate-800">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
        <h4 className="text-base font-medium text-slate-200">{title || 'Loading data...'}</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">{message || 'Fetching equity records from backend API'}</p>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-rose-950/20 rounded-2xl border border-rose-900/40">
        <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
        <h4 className="text-base font-semibold text-rose-200">{title || 'Encountered an Error'}</h4>
        <p className="text-xs text-rose-300/80 mt-1 max-w-md">{message || 'Unable to connect to the backend API or query failed.'}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-900/50 hover:bg-rose-800/60 text-xs text-rose-200 border border-rose-700/50 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-[#111622]/50 rounded-2xl border border-dashed border-slate-800">
        <FolderSearch className="w-10 h-10 text-slate-500 mb-3" />
        <h4 className="text-base font-semibold text-slate-300">
          No matches found {query ? `for "${query}"` : ''} {exchange ? `on ${exchange}` : ''}
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md">
          Check spelling or try searching by legal name, exchange symbol, or 12-digit ISIN (e.g. <span className="font-mono text-emerald-400">INE002A01018</span>).
        </p>
      </div>
    );
  }

  if (type === 'unimported-catalog') {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-amber-950/15 rounded-2xl border border-amber-900/30">
        <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
        <h4 className="text-base font-semibold text-amber-200">{title || 'Exchange Catalog Not Yet Imported'}</h4>
        <p className="text-xs text-amber-300/80 mt-1 max-w-lg leading-relaxed">
          {message || 'The full NSE and BSE stock directory has not yet been ingested. You are viewing prototype seed listings. Run the catalog importer script or upload official securities files to expand coverage.'}
        </p>
      </div>
    );
  }

  // Generic empty state
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#111622]/50 rounded-2xl border border-dashed border-slate-800">
      <FolderSearch className="w-10 h-10 text-slate-500 mb-3" />
      <h4 className="text-base font-semibold text-slate-300">{title || 'No stocks listed'}</h4>
      <p className="text-xs text-slate-400 mt-1 max-w-md">{message || 'Stock database contains no matching records.'}</p>
    </div>
  );
};
