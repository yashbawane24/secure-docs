import React from 'react';
import { ShieldCheck, AlertCircle, FileKey2, ShieldAlert } from 'lucide-react';
import { AnalysisReasoning, ActionType } from '../types';

interface ReasoningModalProps {
  reasoning: AnalysisReasoning;
  recommendedAction: ActionType;
}

export const ReasoningModal: React.FC<ReasoningModalProps> = ({ reasoning, recommendedAction }) => {
  const getActionBadge = (action: ActionType) => {
    switch (action) {
      case 'BLOCK':
        return { label: 'BLOCK DOWNLOAD', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: ShieldAlert };
      case 'REQUIRE_APPROVAL':
        return { label: 'REQUIRE MANAGER APPROVAL', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: AlertCircle };
      case 'WATERMARK':
        return { label: 'DYNAMIC WATERMARK OVERLAY', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: FileKey2 };
      case 'ENCRYPT':
        return { label: 'AES-256 ENCRYPTION AT REST', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30', icon: ShieldCheck };
      default:
        return { label: 'ALLOW DISTRIBUTION', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: ShieldCheck };
    }
  };

  const badge = getActionBadge(recommendedAction);
  const BadgeIcon = badge.icon;

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
      {/* Title & Recommended Action */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-bold text-slate-100 font-outfit">Adaptive AI Decision Reasoning</h4>
          <p className="text-xs text-slate-400">Explainable security factors & policy triggers</p>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${badge.color}`}>
          <BadgeIcon className="w-3.5 h-3.5" />
          <span>{badge.label}</span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
        {reasoning.summary}
      </p>

      {/* Triggered Policy */}
      <div className="flex items-center gap-2 text-xs text-cyan-400 font-medium">
        <span className="text-slate-400">Triggered Security Policy:</span>
        <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 font-bold">{reasoning.policyTriggered}</span>
      </div>

      {/* Factors list */}
      <div className="space-y-2 pt-2">
        <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Risk Contributing Factors</h5>
        {reasoning.factors.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No high-risk sensitive factors detected in document content.</p>
        ) : (
          reasoning.factors.map((factor, idx) => (
            <div key={idx} className="flex items-start justify-between p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-200">{factor.title}</span>
                <p className="text-[11px] text-slate-400">{factor.description}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                factor.impact === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                factor.impact === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                'bg-cyan-500/20 text-cyan-400'
              }`}>
                +{factor.weight}%
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
