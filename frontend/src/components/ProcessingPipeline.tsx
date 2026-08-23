import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileSearch, Cpu, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';
import { AnalysisReasoning, Classification, ActionType } from '../types';

interface ProcessingPipelineProps {
  isOpen: boolean;
  filename: string;
  onComplete: (data: { classification: Classification; leakScore: number; recommendedAction: ActionType; reasoning: AnalysisReasoning }) => void;
  analysisData?: { classification: Classification; leakScore: number; recommendedAction: ActionType; reasoning: AnalysisReasoning };
}

export const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({
  isOpen,
  filename,
  onComplete,
  analysisData
}) => {
  const [step, setStep] = useState<number>(1);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const timer1 = setTimeout(() => setStep(2), 900);
      const timer2 = setTimeout(() => setStep(3), 1800);
      const timer3 = setTimeout(() => setStep(4), 2700);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const stages = [
    { id: 1, title: 'Text Extraction & Parsing', subtitle: 'Reading document layout & content stream', icon: FileSearch },
    { id: 2, title: 'Heuristic Entity Extraction', subtitle: 'Scanning for Aadhaar, PAN, SSN, API Keys & PII', icon: Cpu },
    { id: 3, title: 'Leak Probability Prediction', subtitle: 'Computing composite score & trust indices', icon: AlertTriangle },
    { id: 4, title: 'Adaptive Security Policy', subtitle: 'Applying automated encryption & control rules', icon: Lock },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg glass-panel rounded-2xl border border-cyan-500/30 p-6 shadow-2xl shadow-cyan-500/10"
        >
          {/* Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-outfit">AI Document Security Pipeline</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{filename}</p>
            </div>
          </div>

          {/* Stepper list */}
          <div className="py-6 space-y-4">
            {stages.map((stage) => {
              const Icon = stage.icon;
              const isDone = step > stage.id;
              const isCurrent = step === stage.id;

              return (
                <div
                  key={stage.id}
                  className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-300 ${
                    isCurrent
                      ? 'bg-cyan-500/10 border-cyan-500/40 shadow-sm'
                      : isDone
                      ? 'bg-slate-900/40 border-slate-800 opacity-80'
                      : 'bg-slate-900/20 border-slate-800/40 opacity-40'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : isCurrent
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`text-xs font-semibold ${isCurrent ? 'text-cyan-400 font-bold' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                      {stage.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">{stage.subtitle}</p>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider animate-pulse">
                      Analyzing...
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Done Action */}
          {step === 4 && analysisData && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
              <button
                onClick={() => onComplete(analysisData)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-navy-900 text-xs tracking-wide shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all"
              >
                View Complete Security Audit & Controls
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
