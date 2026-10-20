import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, ShieldAlert, Activity, Lock, ArrowUpRight, Upload } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RiskGauge } from '../components/RiskGauge';
import { DocumentItem, AuditLog } from '../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [recentDocs, setRecentDocs] = useState<DocumentItem[]>([]);
  const [recentAudit, setRecentAudit] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.getAnalytics(),
      api.getDocuments(),
      api.getAuditLogs({ limit: 6 })
    ])
      .then(([analyticsResult, docsResult, auditResult]) => {
        if (analyticsResult.status === 'fulfilled') {
          setMetrics(analyticsResult.value);
        }
        if (docsResult.status === 'fulfilled') {
          setRecentDocs(docsResult.value.documents?.slice(0, 5) || []);
        }
        if (auditResult.status === 'fulfilled') {
          setRecentAudit(auditResult.value.logs || []);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const avgLeakScore = recentDocs.length > 0
    ? Math.round(recentDocs.reduce((acc, d) => acc + d.leakScore, 0) / recentDocs.length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Shield className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const isOrgView = user?.role === 'ADMIN' && metrics?.summary?.isOrgView;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold font-outfit text-slate-100">
              {isOrgView ? 'Organization Security & Data Leakage Overview' : `${user?.name || 'My'} Security Overview`}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {isOrgView ? 'Org-wide' : 'Personal Workspace'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {isOrgView
              ? 'Real-time adaptive protection active across all enterprise organization repositories.'
              : 'Real-time adaptive protection and leakage monitoring active for your personal workspace.'}
          </p>
        </div>

        <Link
          to="/documents"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-900 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all self-start md:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload & Scan Document</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Scanned Docs</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-outfit text-slate-100">
            {metrics?.summary?.totalDocuments ?? 0}
          </p>
          <p className="text-[10px] text-slate-500">
            {isOrgView ? 'Indexed across enterprise' : 'Uploaded by your account'}
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">High Risk Files</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-outfit text-rose-400">
            {metrics?.summary?.highRiskCount ?? 0}
          </p>
          <p className="text-[10px] text-slate-500">Leak Score ≥ 60% requiring action</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Encrypted Repositories</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-outfit text-slate-100">
            {(metrics?.summary?.totalDocuments ?? 0) > 0 ? '100%' : '0%'}
          </p>
          <p className="text-[10px] text-slate-500">AES-256 buffer protection at rest</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Security Events</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-outfit text-slate-100">
            {metrics?.summary?.totalAuditEvents ?? 0}
          </p>
          <p className="text-[10px] text-slate-500">Tracked in audit trail</p>
        </div>
      </div>

      {/* Main Section: Gauge + Top Risky Docs */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Radial Meter Card */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="text-sm font-bold text-slate-200 font-outfit">
            {isOrgView ? 'Org Risk Score Index' : 'Personal Document Risk Index'}
          </h3>
          <RiskGauge score={avgLeakScore} size="lg" />
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            {recentDocs.length === 0
              ? 'No documents scanned yet. Risk index is at 0% baseline.'
              : 'Composite risk weighted by Aadhaar, PAN, SSN, API Keys, and recipient trust levels.'}
          </p>
        </div>

        {/* High Risk Documents List */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 font-outfit">
              {isOrgView ? 'Top High-Risk Documents' : 'My Monitored Documents'}
            </h3>
            <Link to="/documents" className="text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1">
              <span>View All Documents</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentDocs.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">No documents scanned yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Upload your first document to analyze leak probability and sensitive entities.
                </p>
              </div>
              <Link
                to="/documents"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-all"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Document
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentDocs.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/documents/${doc.id}`}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/40 transition-all text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                      doc.classification === 'HIGHLY_CONFIDENTIAL' ? 'bg-rose-500/20 text-rose-400' :
                      doc.classification === 'CONFIDENTIAL' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {doc.classification.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-200 truncate">{doc.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{doc.filename} • {doc.entities?.length || 0} sensitive entities</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      doc.recommendedAction === 'BLOCK' ? 'bg-rose-500/20 text-rose-400' :
                      doc.recommendedAction === 'WATERMARK' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {doc.recommendedAction}
                    </span>
                    <span className={`font-mono font-bold text-xs ${doc.leakScore >= 60 ? 'text-rose-400' : 'text-amber-400'}`}>
                      {doc.leakScore}% Risk
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live Security Audit Feed */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 font-outfit">
            {isOrgView ? 'Live Security Activity Stream (Enterprise)' : 'My Security Activity Stream'}
          </h3>
          <Link to="/audit-log" className="text-xs font-semibold text-cyan-400 hover:underline">View Full Audit Log</Link>
        </div>

        {recentAudit.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
            No recent security activities recorded for your workspace.
          </div>
        ) : (
          <div className="space-y-2">
            {recentAudit.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    log.action === 'ANOMALY_DOWNGRADE' ? 'bg-rose-500' :
                    log.action === 'UPLOAD' ? 'bg-cyan-400' :
                    'bg-blue-400'
                  }`} />
                  <div>
                    <span className="font-semibold text-slate-200">{log.actor?.name || 'System'}</span>
                    <span className="text-slate-400 font-normal"> executed </span>
                    <span className="font-bold text-cyan-400">{log.action}</span>
                    {log.document && <span className="text-slate-400"> on {log.document.title}</span>}
                  </div>
                </div>
                <span className="text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
