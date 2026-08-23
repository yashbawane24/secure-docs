import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter } from 'lucide-react';
import { api } from '../services/api';
import { AuditLog as AuditLogType } from '../types';

export const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogType[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    api.getAuditLogs({ search, action: actionFilter })
      .then(res => setLogs(res.logs))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [search, actionFilter]);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold font-outfit text-slate-100">Security Audit Trail</h2>
        <p className="text-xs text-slate-400">Immutable record of uploads, views, downloads, policy triggers & access anomalies</p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor name, email, or document title..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Security Actions</option>
            <option value="UPLOAD">UPLOAD</option>
            <option value="VIEW">VIEW</option>
            <option value="DOWNLOAD">DOWNLOAD</option>
            <option value="SHARE">SHARE</option>
            <option value="ANOMALY_DOWNGRADE">ANOMALY DOWNGRADE</option>
            <option value="POLICY_TRIGGER">POLICY TRIGGER</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading audit records...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No audit logs matching query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px] font-bold">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Actor / User</th>
                  <th className="p-4">Security Action</th>
                  <th className="p-4">Target Document</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-200">{log.actor?.name || 'System Auto'}</p>
                      <p className="text-[10px] text-slate-400">{log.actor?.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === 'ANOMALY_DOWNGRADE' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        log.action === 'UPLOAD' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-300">
                      {log.document?.title || 'System Policy'}
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {log.ipAddress}
                    </td>
                    <td className="p-4 text-[10px] font-mono text-slate-400 max-w-xs truncate">
                      {log.metadataJson}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
