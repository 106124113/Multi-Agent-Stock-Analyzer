import { ShieldAlert } from 'lucide-react';

interface NavbarProps {
  onHomeClick: () => void;
  backendHealthy: boolean | null;
}

export const Navbar: React.FC<NavbarProps> = ({ onHomeClick, backendHealthy }) => {
  return (
    <header className="border-b border-slate-800 bg-[#0b0f17]/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div 
          onClick={onHomeClick}
          className="flex items-center gap-3 cursor-pointer group transition-opacity hover:opacity-90"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-sm shadow-emerald-950">
            ₹
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 tracking-tight text-base sm:text-lg">
                EquiAgentic <span className="text-emerald-400 font-mono text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">AGENTIC RESEARCH</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">NSE &amp; BSE Equity Intelligence Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                backendHealthy === true
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse'
                  : backendHealthy === false
                  ? 'bg-rose-500 shadow-sm shadow-rose-500'
                  : 'bg-amber-400'
              }`}
            />
            <span className="font-mono">
              {backendHealthy === true ? 'API Connected' : backendHealthy === false ? 'API Offline' : 'Connecting...'}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-md text-amber-300">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Prototype Seed Mode</span>
          </div>
        </div>
      </div>
    </header>
  );
};
