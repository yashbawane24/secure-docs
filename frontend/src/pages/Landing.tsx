import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Zap, CheckCircle2, ChevronRight, Activity, Cpu } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-navy-900">
      {/* Navbar */}
      <header className="h-20 border-b border-slate-800/80 glass-panel px-8 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-navy-900 shadow-lg shadow-cyan-500/20 font-black">
            <Shield className="w-6 h-6 text-navy-900 fill-navy-900" />
          </div>
          <span className="font-extrabold text-xl text-slate-100 font-outfit tracking-tight">
            SecureDocs <span className="text-cyan-400">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-900 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            <span>Launch Platform</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-6xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-8">
          <Zap className="w-3.5 h-3.5" />
          <span>Next-Generation Adaptive Data Leakage Prevention</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold font-outfit tracking-tight leading-tight max-w-4xl">
          Intelligent Document Security That <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Adapts In Real-Time</span>
        </h1>

        <p className="mt-6 text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
          Say goodbye to static, blunt permission rules. SecureDocs AI scans sensitive PII, predicts dynamic leak probability scores, and executes context-aware security enforcement automatically.
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            to="/login"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-900 font-black text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center gap-3"
          >
            <span>Try Live Workspace Demo</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
          <a
            href="#innovations"
            className="px-8 py-4 rounded-xl glass-card text-slate-300 hover:text-white font-semibold text-sm border border-slate-800 transition-colors"
          >
            Explore Innovations
          </a>
        </div>
      </section>

      {/* Three Patent Innovations Section */}
      <section id="innovations" className="py-20 px-6 max-w-6xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold font-outfit text-slate-100">
            Core Architectural Innovations
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Engineered for high-trust enterprises, government KYC compliance, and confidential IP defense.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Innovation 1 */}
          <div className="glass-card p-8 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-cyan-500/40 transition-all duration-300">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 font-outfit">Adaptive AI Decision Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Replaces rigid block/allow rules with intelligent factor evaluation. Automatically recommends Encrypt, Watermark, Restrict Download, or Manager Approval based on exact risk reasoning.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-semibold text-cyan-400 flex items-center gap-1">
              <span>Explainable AI Output</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Innovation 2 */}
          <div className="glass-card p-8 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-blue-500/40 transition-all duration-300">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 font-outfit">Leak Probability Prediction</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Computes a composite score (0-100%) synthesizing Aadhaar, PAN, API Keys, passwords, recipient trust level, and document confidentiality language.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-semibold text-blue-400 flex items-center gap-1">
              <span>Composite Score Gauge</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Innovation 3 */}
          <div className="glass-card p-8 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 font-outfit">Dynamic Trust & Anomaly Guard</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monitors recipient download frequency in real-time. If access velocity spikes, permissions are instantly downgraded to View Only with mandatory watermark overlays.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <span>Velocity Downgrade</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison / Checklist */}
      <section className="py-16 px-6 max-w-5xl mx-auto glass-panel rounded-3xl border border-slate-800 p-10">
        <h3 className="text-2xl font-bold font-outfit text-center mb-8">Enterprise-Grade Security Baseline</h3>
        <div className="grid md:grid-cols-2 gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Real AES-256-GCM buffer encryption at rest</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Aadhaar, PAN, Passport, Bank & SSN regex/NER entity extraction</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Dynamic identity-stamped PDF watermark preview</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Role-Based Access Control (Employee, Manager, Admin, External)</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Full immutable audit trail with IP & event metadata</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Admin-configurable security policy trigger thresholds</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-800/80 text-center text-xs text-slate-500">
        <p>© 2026 SecureDocs AI Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};
