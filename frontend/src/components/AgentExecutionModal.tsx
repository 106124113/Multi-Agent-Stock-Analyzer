import React from 'react';
import { Check, Loader2, Sparkles, X } from 'lucide-react';

export interface AgentProgressItem {
  id: string;
  role: string;
  name: string;
  stage: number;
  status: 'pending' | 'running' | 'completed';
  summary?: string;
  duration?: number;
}

interface AgentExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  companyName: string;
  exchange: string;
  agents: AgentProgressItem[];
  currentStage: number;
  isComplete: boolean;
  error?: string | null;
}

export const AgentExecutionModal: React.FC<AgentExecutionModalProps> = ({
  isOpen,
  onClose,
  symbol,
  companyName,
  exchange,
  agents,
  isComplete,
  error
}) => {
  if (!isOpen) return null;

  const totalAgents = agents.length || 13;
  const completedCount = agents.filter((a) => a.status === 'completed').length;
  const progressPct = Math.round((completedCount / totalAgents) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0b101b] border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-[#070b12]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  Deliberating on {symbol}
                </h3>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                  {exchange}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium truncate max-w-md mt-0.5">
                {companyName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-mono font-bold text-emerald-400">
                {completedCount} / {totalAgents} Agents Complete
              </div>
              <div className="text-xs text-slate-400">13-Agent Deliberation Loop</div>
            </div>
            {isComplete && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-1.5">
          <div
            className="bg-emerald-500 h-1.5 transition-all duration-300 shadow-sm shadow-emerald-500/50"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Agent Step-by-Step List with Clean Ticks */}
        <div className="p-5 overflow-y-auto divide-y divide-slate-800/60 space-y-1">
          {error && (
            <div className="p-3.5 mb-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {agents.map((agent) => {
            const isDone = agent.status === 'completed';
            const isRunning = agent.status === 'running';

            return (
              <div
                key={agent.id}
                className={`py-3.5 px-3.5 rounded-xl flex items-start justify-between gap-3 transition-colors ${
                  isRunning
                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                    : isDone
                    ? 'hover:bg-slate-900/40'
                    : 'opacity-40'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Clean SVG Vector Status Indicator */}
                  <div className="mt-0.5 flex-shrink-0">
                    {isDone ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/20">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    ) : isRunning ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700/80 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100">
                        {agent.name}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        ({agent.role})
                      </span>
                    </div>

                    {isDone && agent.summary && (
                      <p className="mt-1 text-xs text-slate-300 line-clamp-1 leading-relaxed">
                        {agent.summary}
                      </p>
                    )}

                    {isRunning && (
                      <p className="mt-1 text-xs text-emerald-400 font-medium animate-pulse">
                        Reasoning with verified market data &amp; ratios...
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0 font-mono text-xs">
                  {isDone ? (
                    <span className="text-slate-300 font-medium">
                      {agent.duration !== undefined && agent.duration > 0
                        ? `${Number(agent.duration).toFixed(1)}s`
                        : '0.8s'}
                    </span>
                  ) : isRunning ? (
                    <span className="text-emerald-400 font-semibold">Active</span>
                  ) : (
                    <span className="text-slate-500">Pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#070b12] flex items-center justify-between">
          <div className="text-xs text-slate-300 font-mono">
            {isComplete ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[2.5]" />
                All 13 Specialized Agents Completed Deliberation
              </span>
            ) : (
              <span className="text-slate-400 font-medium">
                Orchestrating multi-agent deliberation stages...
              </span>
            )}
          </div>

          {isComplete && (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              View Research Report →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
