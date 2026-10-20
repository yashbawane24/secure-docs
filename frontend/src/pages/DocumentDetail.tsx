import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Lock, Download, Share2, ArrowLeft, Eye, Clock, UserCheck, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem, AnalysisReasoning } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { ReasoningModal } from '../components/ReasoningModal';
import { WatermarkOverlay } from '../components/WatermarkOverlay';

export const DocumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [reasoning, setReasoning] = useState<AnalysisReasoning | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Share form state
  const [shareEmail, setShareEmail] = useState('');
  const [customPerm, setCustomPerm] = useState('');
  const [shareMsg, setShareMsg] = useState('');

  const fetchDetail = () => {
    if (!id) return;
    setLoading(true);
    api.getDocumentDetail(id)
      .then(res => {
        setDoc(res.document);
        setReasoning(res.analysisReasoning);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !shareEmail) return;

    try {
      const res = await api.shareDocument({
        documentId: id,
        recipientEmail: shareEmail,
        customPermission: customPerm || undefined
      });
      setShareMsg(`Shared with ${shareEmail} (Permission: ${res.share.permissionLevel})`);
      setShareEmail('');
      fetchDetail();
    } catch (err: any) {
      alert(err.message || 'Sharing failed.');
    }
  };

  const [downloadingEncrypted, setDownloadingEncrypted] = useState(false);
  const [downloadingDecrypted, setDownloadingDecrypted] = useState(false);

  const handleDownloadEncrypted = async () => {
    if (!id) return;
    try {
      setDownloadingEncrypted(true);
      await api.downloadDocument(id, 'encrypted');
    } catch (err: any) {
      alert(err.message || 'Encrypted download failed');
    } finally {
      setDownloadingEncrypted(false);
    }
  };

  const handleDownloadDecrypted = async () => {
    if (!id) return;
    try {
      setDownloadingDecrypted(true);
      await api.downloadDocument(id, 'decrypted');
    } catch (err: any) {
      alert(err.message || 'Decrypted download failed');
    } finally {
      setDownloadingDecrypted(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-slate-400">Loading document detail...</div>;
  if (error || !doc) return <div className="text-center py-12 text-rose-400 font-semibold">{error || 'Document not found'}</div>;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <Link to="/documents" className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Document Library</span>
        </Link>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Primary Download Button: AES-256 Encrypted */}
          <button
            onClick={handleDownloadEncrypted}
            disabled={downloadingEncrypted}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-900 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 cursor-pointer"
            title="Download protected AES-256 Encrypted Security Envelope (PDF)"
          >
            <Lock className="w-4 h-4" />
            <Download className="w-4 h-4" />
            <span>{downloadingEncrypted ? 'Generating Encrypted PDF...' : 'Download Encrypted (PDF)'}</span>
          </button>

          {/* Secondary Download Button: Decrypted (if allowed) */}
          <button
            onClick={handleDownloadDecrypted}
            disabled={doc.recommendedAction === 'BLOCK' || downloadingDecrypted}
            title={doc.recommendedAction === 'BLOCK' ? 'Plaintext download blocked by Policy HC-900' : 'Download original decrypted document'}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingDecrypted ? 'Decrypting...' : 'Download Decrypted'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Preview + Entities + Reasoning */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Summary Card */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                  doc.classification === 'HIGHLY_CONFIDENTIAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                  doc.classification === 'CONFIDENTIAL' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                }`}>
                  {doc.classification}
                </span>
                <h1 className="text-xl font-extrabold font-outfit text-slate-100 mt-2">{doc.title}</h1>
                <p className="text-xs text-slate-400">{doc.filename} • Owner: {doc.owner?.name} ({doc.owner?.email})</p>
              </div>

              {doc.isEncrypted && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>AES-256 Encrypted</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Decision Reasoning Card */}
          {reasoning && (
            <ReasoningModal reasoning={reasoning} recommendedAction={doc.recommendedAction} />
          )}

          {/* Extracted Entities Found */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 font-outfit">Detected Sensitive Entity Tokens ({doc.entities.length})</h3>

            <div className="grid sm:grid-cols-2 gap-3">
              {doc.entities.map((ent) => (
                <div key={ent.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-cyan-400 font-mono">{ent.entityType}</span>
                    <p className="text-slate-300 font-mono text-[11px] mt-0.5">{ent.maskedValue}</p>
                  </div>
                  <span className="text-[10px] text-slate-500">{Math.round(ent.confidence * 100)}% Confidence</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Watermarked Document Preview */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-200 font-outfit flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Dynamic Identity Watermarked Preview</span>
            </h3>

            <WatermarkOverlay enabled={doc.classification === 'CONFIDENTIAL' || doc.classification === 'HIGHLY_CONFIDENTIAL'}>
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                {doc.extractedText || 'Binary contents restricted.'}
              </div>
            </WatermarkOverlay>
          </div>
        </div>

        {/* Right Col: Gauge + Sharing Panel + Audit Trail */}
        <div className="space-y-6">
          {/* Risk Score Meter */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
            <RiskGauge score={doc.leakScore} size="lg" />
          </div>

          {/* Dynamic Sharing Form */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200 font-outfit">Dynamic Secure Sharing</h3>
            </div>

            {shareMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                {shareMsg}
              </div>
            )}

            <form onSubmit={handleShareSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Recipient User Email</label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="client.external@partner.com"
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Permission Override</label>
                <select
                  value={customPerm}
                  onChange={(e) => setCustomPerm(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Auto Trust Calculation</option>
                  <option value="VIEW_ONLY">View Only (Watermarked)</option>
                  <option value="TIME_LIMITED">Time-Limited (7 Days)</option>
                  <option value="DOWNLOAD_EDIT">Download & Edit</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-navy-900 text-xs shadow-lg shadow-cyan-500/20 hover:from-cyan-400 transition-all"
              >
                Share Document Securely
              </button>
            </form>
          </div>

          {/* History / Shares List */}
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Recipient Permissions ({doc.shares?.length || 0})</h4>

            <div className="space-y-2">
              {doc.shares?.map((share) => (
                <div key={share.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-200">{share.recipient?.name}</p>
                    <p className="text-[10px] text-slate-400">{share.permissionLevel}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    share.status === 'SUSPICIOUS_DOWNGRADE' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {share.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
