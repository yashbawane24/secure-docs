import React from 'react';
import { ShieldAlert, CheckCircle, AlertTriangle, XOctagon } from 'lucide-react';

interface RiskGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, size = 'md' }) => {
  let color = 'text-emerald-400';
  let bgColor = 'bg-emerald-500/10 border-emerald-500/30';
  let label = 'Low Risk';
  let Icon = CheckCircle;

  if (score >= 80) {
    color = 'text-rose-500';
    bgColor = 'bg-rose-500/10 border-rose-500/30';
    label = 'Critical Risk';
    Icon = XOctagon;
  } else if (score >= 60) {
    color = 'text-rose-400';
    bgColor = 'bg-rose-400/10 border-rose-400/30';
    label = 'High Risk';
    Icon = ShieldAlert;
  } else if (score >= 35) {
    color = 'text-amber-400';
    bgColor = 'bg-amber-500/10 border-amber-500/30';
    label = 'Moderate Risk';
    Icon = AlertTriangle;
  }

  const dimensions = size === 'lg' ? 140 : size === 'sm' ? 80 : 110;
  const strokeWidth = size === 'lg' ? 12 : size === 'sm' ? 8 : 10;
  const radius = (dimensions - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: dimensions, height: dimensions }}>
        <svg className="transform -rotate-90" width={dimensions} height={dimensions}>
          {/* Background circle */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={dimensions / 2}
            cy={dimensions / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${color} transition-all duration-1000 ease-out`}
          />
        </svg>

        {/* Center Score */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`font-black font-outfit ${size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-base' : 'text-2xl'} ${color}`}>
            {score}%
          </span>
          <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
            Leak Score
          </span>
        </div>
      </div>

      <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${bgColor} ${color}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
    </div>
  );
};
