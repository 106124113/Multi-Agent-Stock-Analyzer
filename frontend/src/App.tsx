import { useEffect, useState } from 'react';
import { checkBackendHealth, generateReport, getStockDetail, searchStocks } from './api';
import { Navbar } from './components/Navbar';
import { ReportView } from './components/ReportView';
import { SearchBar } from './components/SearchBar';
import { StateFeedback } from './components/StateFeedback';
import { StockCard } from './components/StockCard';
import { StockProfile } from './components/StockProfile';
import type { ResearchReport, StockDetail, StockSummary } from './types';
import { ChevronLeft, ChevronRight, Database, FileSpreadsheet, Sparkles } from 'lucide-react';

type ViewMode = 'catalog' | 'profile' | 'report';

export function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('catalog');
  const [stocks, setStocks] = useState<StockSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExchange, setSelectedExchange] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMatches, setTotalMatches] = useState(0);
  const [catalogImported, setCatalogImported] = useState(false);

  const [isLoadingStocks, setIsLoadingStocks] = useState(false);
  const [stocksError, setStocksError] = useState<string | null>(null);

  const [selectedStock, setSelectedStock] = useState<StockDetail | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentReport, setCurrentReport] = useState<ResearchReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  // Check health and load initial stocks on mount
  useEffect(() => {
    checkHealth();
    fetchStocksList('', '', 1);
  }, []);

  const checkHealth = async () => {
    try {
      const h = await checkBackendHealth();
      setBackendHealthy(true);
      setCatalogImported(h.catalog_imported);
    } catch {
      setBackendHealthy(false);
    }
  };

  const fetchStocksList = async (query: string, exchange: string, page: number) => {
    setIsLoadingStocks(true);
    setStocksError(null);
    try {
      const data = await searchStocks(query, exchange, page, 18);
      setStocks(data.items);
      setTotalMatches(data.total);
      setTotalPages(data.total_pages);
      setCurrentPage(data.page);
      setCatalogImported(data.catalog_imported);
      setBackendHealthy(true);
    } catch (err: any) {
      setStocksError(err.message || 'Failed to load stock list from backend.');
      setBackendHealthy(false);
    } finally {
      setIsLoadingStocks(false);
    }
  };

  const handleSearch = (query: string, exchange?: string) => {
    const exch = exchange !== undefined ? exchange : selectedExchange;
    setSearchQuery(query);
    setSelectedExchange(exch);
    setCurrentPage(1);
    fetchStocksList(query, exch, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    fetchStocksList(searchQuery, selectedExchange, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStock = async (symbol: string, exchange: string) => {
    setIsLoadingProfile(true);
    setProfileError(null);
    setViewMode('profile');
    try {
      const detail = await getStockDetail(symbol, exchange);
      setSelectedStock(detail);
    } catch (err: any) {
      setProfileError(err.message || `Failed to fetch profile for ${symbol} on ${exchange}.`);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleGenerateReport = async (symbol: string, exchange: string) => {
    setIsGeneratingReport(true);
    setReportError(null);
    try {
      const report = await generateReport(symbol, exchange);
      setCurrentReport(report);
      setViewMode('report');
    } catch (err: any) {
      setReportError(err.message || `Failed to generate report for ${symbol}.`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleGoHome = () => {
    setViewMode('catalog');
    setSelectedStock(null);
    setCurrentReport(null);
    setReportError(null);
  };

  const handleBackToProfile = () => {
    setViewMode('profile');
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <Navbar onHomeClick={handleGoHome} backendHealthy={backendHealthy} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* VIEW 1: CATALOG / DASHBOARD */}
        {viewMode === 'catalog' && (
          <div className="space-y-8">
            {/* Hero / Intro Section */}
            <div className="text-center max-w-3xl mx-auto pt-4 pb-2 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Multi-Agent Indian Equity Research Architecture</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Institutional Equity Research for <span className="text-emerald-400">NSE &amp; BSE</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Investigate fundamental thesis, stress-test bull vs bear scenarios, and generate
                autonomous multi-agent investment briefs across Indian exchanges.
              </p>
            </div>

            {/* Prominent Search Bar & Exchange Selector */}
            <div className="max-w-3xl mx-auto">
              <SearchBar
                onSearch={handleSearch}
                isLoading={isLoadingStocks}
                activeExchange={selectedExchange}
              />
            </div>

            {/* Catalog Status Notice Banner */}
            {!catalogImported && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-300">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-semibold block text-amber-200">Notice: Prototype Seed Catalog Active</span>
                    <span className="text-amber-300/80">
                      Official NSE/BSE securities files have not been imported into SQLite yet. Ingest via CLI to expand coverage to all listed equities.
                    </span>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-200 font-mono text-[11px] whitespace-nowrap">
                  python import_catalog.py
                </div>
              </div>
            )}

            {/* Catalog Content Area */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium text-slate-300">
                    {searchQuery
                      ? `Search Results (${totalMatches})`
                      : `Active Stock Catalog (${totalMatches})`}
                    {selectedExchange && ` • ${selectedExchange}`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-slate-500 hidden sm:inline">
                    {catalogImported ? 'Official Exchange Catalog' : 'Seed Catalog Store'}
                  </span>
                  {totalPages > 1 && (
                    <span className="font-mono text-[11px] text-slate-400">
                      Page {currentPage} of {totalPages}
                    </span>
                  )}
                </div>
              </div>

              {isLoadingStocks && (
                <StateFeedback
                  type="loading"
                  title="Querying Indian Stock Universe..."
                  message="Searching across trading symbols, company legal names, and ISIN records."
                />
              )}

              {stocksError && (
                <StateFeedback
                  type="error"
                  title="Backend API Error"
                  message={stocksError}
                  onRetry={() => fetchStocksList(searchQuery, selectedExchange, currentPage)}
                />
              )}

              {!isLoadingStocks && !stocksError && stocks.length === 0 && (
                <StateFeedback
                  type="no-results"
                  query={searchQuery}
                  exchange={selectedExchange}
                />
              )}

              {!isLoadingStocks && !stocksError && stocks.length > 0 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stocks.map((stock) => (
                      <StockCard
                        key={`${stock.exchange}-${stock.symbol}-${stock.id || ''}`}
                        stock={stock}
                        onSelect={handleSelectStock}
                      />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="text-slate-400 font-mono">
                        Showing {(currentPage - 1) * 18 + 1}-{Math.min(currentPage * 18, totalMatches)} of {totalMatches} listings
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </button>

                        <span className="px-3 py-1 rounded-lg bg-slate-800 font-mono text-slate-200">
                          {currentPage} / {totalPages}
                        </span>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: STOCK PROFILE */}
        {viewMode === 'profile' && (
          <div>
            {isLoadingProfile && (
              <StateFeedback
                type="loading"
                title="Retrieving Exchange Profile..."
                message="Loading security master attributes and corporate parameters."
              />
            )}

            {profileError && (
              <StateFeedback
                type="error"
                title="Profile Not Available"
                message={profileError}
                onRetry={handleGoHome}
              />
            )}

            {reportError && (
              <div className="mb-6">
                <StateFeedback
                  type="error"
                  title="Report Synthesis Failed"
                  message={reportError}
                />
              </div>
            )}

            {!isLoadingProfile && !profileError && selectedStock && (
              <StockProfile
                stock={selectedStock}
                onBack={handleGoHome}
                onGenerateReport={handleGenerateReport}
                isGeneratingReport={isGeneratingReport}
              />
            )}
          </div>
        )}

        {/* VIEW 3: RESEARCH REPORT */}
        {viewMode === 'report' && (
          <div>
            {currentReport ? (
              <ReportView
                report={currentReport}
                onBack={handleBackToProfile}
              />
            ) : (
              <StateFeedback
                type="error"
                title="No Report Active"
                message="Report data not found."
                onRetry={handleGoHome}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#070a10] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            EquiAgentic Intelligence Platform • Phase 2 NSE/BSE Universe
          </p>
          <p className="font-mono text-[11px] text-slate-600">
            FastAPI + SQLite + React + Vite + Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
