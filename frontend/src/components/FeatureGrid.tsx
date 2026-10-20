import React from 'react';
import { Layers, MessageSquareDiff, ShieldCheck } from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: Layers,
      title: 'Multi-Dimensional Analysis',
      description:
        'Fundamentals, balance sheet debt, live Google News, BSE disclosures, and technical momentum evaluated concurrently by specialized analysts.'
    },
    {
      icon: MessageSquareDiff,
      title: 'Adversarial Bull vs Bear Debate',
      description:
        'Independent researchers argue both sides with zero cross-contamination, followed by a structured rebuttal round to challenge assumptions.'
    },
    {
      icon: ShieldCheck,
      title: 'Risk-Audited Conviction Synthesis',
      description:
        'Stress-tests debt solvency and promoter pledging before the Portfolio Manager delivers an institutional capital allocation decision.'
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mb-16">
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
          Why single-perspective analysis falls short
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Markets are multifaceted. EquiAgentic deploys 13 specialized roles to uncover blind spots before allocating capital.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {features.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-[#0b101b] border border-slate-800/80 p-6 flex flex-col justify-between hover:border-slate-700/80 transition-all shadow-lg shadow-black/20"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                  <Icon className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
