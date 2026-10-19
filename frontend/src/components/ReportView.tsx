import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileCheck2,
  Layers,
  Scale,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { ResearchReport } from '../types';

interface ReportViewProps {
  report: ResearchReport;
  onBack: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ report, onBack }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Navigation */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Company Details</span>
        </button>
      </div>

      {/* Report Header Card */}
      <div className="bg-[#111622] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-slate-100">
                {report.symbol}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {report.exchange}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                SYNTHESIS REPORT
              </span>
            </div>
            <h2 className="text-lg text-slate-300 font-medium">{report.company_name}</h2>
          </div>

          <div className="flex flex-col items-start md:items-end text-xs text-slate-400 font-mono space-y-1">
            <span className="text-slate-500">Report ID: {report.report_id}</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Generated: {new Date(report.generated_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Prototype Disclaimer Banner */}
        <div className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-amber-200 mb-0.5">Prototype Demo Notice</strong>
            <p className="text-amber-300/90 leading-relaxed">{report.disclaimer}</p>
          </div>
        </div>
      </div>

      {/* Section 1: Business Overview */}
      <div className="bg-[#111622] border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-4">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-semibold text-slate-100">{report.business_overview.title}</h3>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">{report.business_overview.summary}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {report.business_overview.key_points.map((pt, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 bg-[#0b0f17] p-3 rounded-lg border border-slate-800/80">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>{pt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 & 3: Financial Analysis & Growth in Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Financial Analysis */}
        <div className="bg-[#111622] border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-4">
            <FileCheck2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-slate-100">{report.financial_analysis.title}</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">{report.financial_analysis.summary}</p>
          <ul className="space-y-2.5">
            {report.financial_analysis.key_points.map((pt, idx) => (
              <li key={idx} className="text-xs text-slate-300 bg-[#0b0f17] p-3 rounded-lg border border-slate-800/80 flex items-start gap-2">
                <span className="text-blue-400 font-mono font-bold">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Prospects */}
        <div className="bg-[#111622] border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-semibold text-slate-100">{report.growth_prospects.title}</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">{report.growth_prospects.summary}</p>
          <ul className="space-y-2.5">
            {report.growth_prospects.key_points.map((pt, idx) => (
              <li key={idx} className="text-xs text-slate-300 bg-[#0b0f17] p-3 rounded-lg border border-slate-800/80 flex items-start gap-2">
                <span className="text-emerald-400 font-mono font-bold">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Section 4 & 5: Valuation & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Valuation */}
        <div className="bg-[#111622] border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-4">
            <Scale className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-slate-100">{report.valuation.title}</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">{report.valuation.summary}</p>
          <ul className="space-y-2.5">
            {report.valuation.key_points.map((pt, idx) => (
              <li key={idx} className="text-xs text-slate-300 bg-[#0b0f17] p-3 rounded-lg border border-slate-800/80 flex items-start gap-2">
                <span className="text-cyan-400 font-mono font-bold">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risks */}
        <div className="bg-[#111622] border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-4">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-semibold text-slate-100">{report.risks.title}</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">{report.risks.summary}</p>
          <ul className="space-y-2.5">
            {report.risks.key_points.map((pt, idx) => (
              <li key={idx} className="text-xs text-slate-300 bg-[#0b0f17] p-3 rounded-lg border border-slate-800/80 flex items-start gap-2">
                <span className="text-rose-400 font-mono font-bold">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Section 6: Bull vs Bear Debate */}
      <div className="bg-[#111622] border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-slate-100">Multi-Agent Bull vs. Bear Thesis Debate</h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            Adversarial Agent Evaluation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bull Column */}
          <div className="rounded-xl p-5 bg-emerald-950/20 border border-emerald-900/40">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-3">
              <TrendingUp className="w-4 h-4" />
              <h4>Bullish Thesis</h4>
            </div>
            <ul className="space-y-2.5">
              {report.bull_vs_bear.bull_case.map((item, idx) => (
                <li key={idx} className="text-xs text-emerald-100/90 flex items-start gap-2 bg-[#0b0f17]/60 p-2.5 rounded-lg border border-emerald-900/30">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bear Column */}
          <div className="rounded-xl p-5 bg-rose-950/20 border border-rose-900/40">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm mb-3">
              <TrendingDown className="w-4 h-4" />
              <h4>Bearish Thesis</h4>
            </div>
            <ul className="space-y-2.5">
              {report.bull_vs_bear.bear_case.map((item, idx) => (
                <li key={idx} className="text-xs text-rose-100/90 flex items-start gap-2 bg-[#0b0f17]/60 p-2.5 rounded-lg border border-rose-900/30">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Critical Swing Factors */}
        {report.bull_vs_bear.critical_swing_factors.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-800">
            <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold mb-3">
              Key Swing Variables &amp; Triggers
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {report.bull_vs_bear.critical_swing_factors.map((factor, idx) => (
                <div key={idx} className="bg-[#0b0f17] p-3 rounded-lg border border-slate-800 text-xs text-slate-300">
                  <span className="text-amber-400 font-mono text-[11px] block mb-1">Trigger 0{idx + 1}</span>
                  {factor}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 7: Final Assessment */}
      <div className="bg-gradient-to-br from-[#111622] to-[#151c2d] border border-slate-700/80 rounded-xl p-6 sm:p-7 shadow-lg">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-semibold text-slate-100">{report.final_assessment.title}</h3>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed mb-4">{report.final_assessment.summary}</p>
        <div className="space-y-2">
          {report.final_assessment.key_points.map((pt, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-[#0b0f17]/80 p-3 rounded-lg border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{pt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
