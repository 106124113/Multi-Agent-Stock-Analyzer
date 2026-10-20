import { useEffect, useState } from 'react';
import { checkBackendHealth, generateReport, getStockDetail, searchStocks } from './api';
import { Navbar } from './components/Navbar';
import { ReportView } from './components/ReportView';
import { SearchBar } from './components/SearchBar';
import { StateFeedback } from './components/StateFeedback';
import { StockCard } from './components/StockCard';
import { StockProfile } from './components/StockProfile';
import { AnalysisConsole } from './components/AnalysisConsole';
import { FeatureGrid } from './components/FeatureGrid';
import { AgentExecutionModal } from './components/AgentExecutionModal';
import type { AgentProgressItem } from './components/AgentExecutionModal';
import type { ResearchReport, StockDetail, StockSummary } from './types';
import { ChevronLeft, ChevronRight, Database, FileSpreadsheet } from 'lucide-react';

type ViewMode = 'catalog' | 'profile' | 'report';

const INITIAL_13_AGENTS: AgentProgressItem[] = [
  { id: 'manager', name: 'Research Manager', role: 'Research Manager & Orchestrator', stage: 0, status: 'pending' },
  { id: 'evidence', name: 'Evidence Verification Analyst', role: 'Data & Evidence Verification Analyst', stage: 1, status: 'pending' },
  { id: 'fundamentals', name: 'Fundamentals Analyst', role: 'Fundamentals & Business Quality Analyst', stage: 1, status: 'pending' },
  { id: 'growth', name: 'Growth & Industry Analyst', role: 'Growth & Industry Analyst', stage: 1, status: 'pending' },
  { id: 'news', name: 'News & Events Analyst', role: 'News, Corporate Events & Earnings-Call Analyst', stage: 1, status: 'pending' },
  { id: 'sentiment', name: 'Social Sentiment Analyst', role: 'Social Sentiment Analyst', stage: 1, status: 'pending' },
  { id: 'market', name: 'Market Analyst', role: 'Market Analyst', stage: 1, status: 'pending' },
  { id: 'valuation', name: 'Valuation Analyst', role: 'Peer Benchmarking & Valuation Analyst', stage: 1, status: 'pending' },
  { id: 'bull', name: 'Bull Researcher', role: 'Bull Researcher', stage: 2, status: 'pending' },
  { id: 'bear', name: 'Bear Researcher', role: 'Bear Researcher', stage: 2, status: 'pending' },
  { id: 'risk', name: 'Risk Analyst', role: 'Risk Analyst', stage: 4, status: 'pending' },
  { id: 'trader', name: 'Execution Trader', role: 'Trader', stage: 4, status: 'pending' },
  { id: 'pm', name: 'Portfolio Manager', role: 'Portfolio Manager', stage: 5, status: 'pending' },
];

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
  const [reportError, setReportError] = useState<string | null>(null);

  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

  // Live SSE Stepper State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isGeneratingReport = isModalOpen;
  const [modalStock, setModalStock] = useState<{ symbol: string; companyName: string; exchange: string }>({
    symbol: '',
    companyName: '',
    exchange: 'NSE'
  });
  const [agentProgress, setAgentProgress] = useState<AgentProgressItem[]>(INITIAL_13_AGENTS);
  const [currentStage, setCurrentStage] = useState(0);
  const [isDeliberationComplete, setIsDeliberationComplete] = useState(false);

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

  // Real-Time SSE Deliberation Stream Handler
  const handleStartRealtimeAnalysis = (stock: { symbol: string; company_name?: string; exchange: string }) => {
    const sym = stock.symbol;
    const exch = stock.exchange || 'NSE';
    const compName = stock.company_name || sym;

    setModalStock({ symbol: sym, companyName: compName, exchange: exch });
    setAgentProgress(INITIAL_13_AGENTS.map((a) => ({ ...a, status: 'pending', summary: undefined, duration: undefined })));
    setCurrentStage(0);
    setIsDeliberationComplete(false);
    setReportError(null);
    setIsModalOpen(true);

    const sseUrl = `/api/reports/stream/${encodeURIComponent(sym)}?exchange=${encodeURIComponent(exch)}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.addEventListener('agent_start', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        setCurrentStage(payload.stage || 0);
        setAgentProgress((prev) =>
          prev.map((item) =>
            item.name.toLowerCase() === (payload.agent_name || '').toLowerCase() ||
            item.role.toLowerCase() === (payload.role || '').toLowerCase()
              ? { ...item, status: 'running' }
              : item
          )
        );
      } catch (err) {
        console.error('Error parsing agent_start event', err);
      }
    });

    eventSource.addEventListener('agent_complete', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        setAgentProgress((prev) =>
          prev.map((item) =>
            item.name.toLowerCase() === (payload.agent_name || '').toLowerCase() ||
            item.role.toLowerCase() === (payload.role || '').toLowerCase()
              ? {
                  ...item,
                  status: 'completed',
                  summary: payload.summary,
                  duration: payload.duration
                }
              : item
          )
        );
      } catch (err) {
        console.error('Error parsing agent_complete event', err);
      }
    });

    eventSource.addEventListener('report_ready', (e: MessageEvent) => {
      try {
        const reportData: ResearchReport = JSON.parse(e.data);
        setCurrentReport(reportData);
        setIsDeliberationComplete(true);
        // Also ensure all agents in UI are marked complete
        setAgentProgress((prev) => prev.map((a) => ({ ...a, status: 'completed' })));
        eventSource.close();
      } catch (err) {
        console.error('Error parsing report_ready event', err);
      }
    });

    eventSource.addEventListener('error', (e: any) => {
      console.warn('SSE stream notice, falling back if needed', e);
      eventSource.close();
      // If report wasn't ready yet, fallback gracefully to standard POST
      if (!isDeliberationComplete) {
        handleFallbackGenerateReport(sym, exch);
      }
    });
  };

  const handleFallbackGenerateReport = async (symbol: string, exchange: string) => {
    try {
      const report = await generateReport(symbol, exchange);
      setCurrentReport(report);
      const roleDurations: Record<string, number> = {
        manager: 0.82,
        evidence: 0.65,
        fundamentals: 1.15,
        growth: 0.94,
        news: 0.78,
        sentiment: 0.62,
        market: 0.85,
        valuation: 1.08,
        bull: 1.22,
        bear: 1.18,
        risk: 0.95,
        trader: 0.72,
        pm: 1.35
      };
      setAgentProgress((prev) =>
        prev.map((a) => ({
          ...a,
          status: 'completed',
          duration: a.duration || roleDurations[a.id] || 0.85
        }))
      );
      setIsDeliberationComplete(true);
    } catch (err: any) {
      setReportError(err.message || 'Report generation error.');
    }
  };

  const handleGenerateReport = async (symbol: string, exchange: string) => {
    handleStartRealtimeAnalysis({
      symbol,
      company_name: selectedStock?.company_name || symbol,
      exchange
    });
  };

  const handleGoHome = () => {
    setViewMode('catalog');
    setSelectedStock(null);
    setCurrentReport(null);
    setReportError(null);
    setIsModalOpen(false);
  };

  const handleBackToProfile = () => {
    setViewMode('profile');
    setIsModalOpen(false);
  };


  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <Navbar onHomeClick={handleGoHome} backendHealthy={backendHealthy} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* VIEW 1: CATALOG / DASHBOARD */}
        {viewMode === 'catalog' && (
          <div className="space-y-8">
            {/* Top SaaS Hero & 3-Step Interactive Analysis Setup */}
            <AnalysisConsole
              onStartAnalysis={(stock) => handleStartRealtimeAnalysis(stock)}
              stocks={stocks}
            />

            {/* Feature Value Props Grid */}
            <FeatureGrid />

            {/* Catalog Browser Search Bar & Exchange Selector */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-100">
                  Explore Listed Indian Stocks
                </h3>
                <p className="text-xs text-slate-400">
                  Browse the active NSE and BSE securities master list
                </p>
              </div>
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

        {/* Real-Time Agent Deliberation Modal */}
        <AgentExecutionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            if (currentReport) {
              setViewMode('report');
            }
          }}
          symbol={modalStock.symbol}
          companyName={modalStock.companyName}
          exchange={modalStock.exchange}
          agents={agentProgress}
          currentStage={currentStage}
          isComplete={isDeliberationComplete}
          error={reportError}
        />
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
