import React from 'react';

interface NavbarProps {
  onHomeClick: () => void;
  backendHealthy: boolean | null;
}

export const Navbar: React.FC<NavbarProps> = ({ onHomeClick, backendHealthy }) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#070b12]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={onHomeClick}
          className="flex items-center gap-3 cursor-pointer group transition-opacity hover:opacity-90"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-base shadow-sm">
            AE
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 tracking-tight text-base sm:text-lg">
                EquiAgentic
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Get the edge with Agentic AI
            </p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs text-slate-400 font-medium">
          <button
            type="button"
            onClick={onHomeClick}
            className="text-slate-200 hover:text-emerald-400 transition-colors"
          >
            Catalog
          </button>
          <span className="text-slate-600 cursor-not-allowed">Watchlist</span>
          <span className="text-slate-600 cursor-not-allowed">IPO Audit</span>
          <span className="text-slate-600 cursor-not-allowed">Sentinel</span>
          <span className="text-slate-600 cursor-not-allowed">Edge</span>
        </nav>

        {/* Right Section: API Status & User Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-[#0b101b] border border-slate-800 text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                backendHealthy === true
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse'
                  : backendHealthy === false
                  ? 'bg-rose-500'
                  : 'bg-amber-400'
              }`}
            />
            <span className="font-mono text-[11px]">
              {backendHealthy === true ? 'API Connected' : backendHealthy === false ? 'API Offline' : 'Connecting'}
            </span>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-semibold text-xs">
              P
            </div>
            <span className="text-xs text-slate-300 font-medium hidden sm:inline">Piyush</span>
          </div>
        </div>
      </div>
    </header>
  );
};

