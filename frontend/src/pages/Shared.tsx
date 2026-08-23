import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Share2, Lock, AlertTriangle, Eye, Download, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { Share } from '../types';

export const Shared: React.FC = () => {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyShares()
      .then(res => setShares(res.shares))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold font-outfit text-slate-100">Shared With Me</h2>
        <p className="text-xs text-slate-400">Documents shared with your recipient account and trust level permissions</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading shared documents...</div>
      ) : shares.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl border border-slate-800 space-y-3">
          <Share2 className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No documents currently shared with your account.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shares.map((share) => (
            <div key={share.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
              {/* Velocity Anomaly Banner */}
              {share.anomalyFlag && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 animate-bounce" />
                  <span>{share.anomalyReason}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100 font-outfit">{share.document?.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      share.permissionLevel === 'VIEW_ONLY' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                      share.permissionLevel === 'DOWNLOAD_EDIT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                      'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {share.permissionLevel.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    Sender: <span className="text-slate-200">{share.sender?.name}</span> ({share.sender?.email}) • Shared on {new Date(share.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/documents/${share.documentId}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Watermarked Preview</span>
                  </Link>

                  {share.permissionLevel === 'DOWNLOAD_EDIT' && (
                    <a
                      href={`/api/documents/${share.documentId}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 text-navy-900 font-bold text-xs shadow-md transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
