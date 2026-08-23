import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Sliders, Save, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { SecurityPolicy } from '../types';

export const Settings: React.FC = () => {
  const [policies, setPolicies] = useState<SecurityPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    api.getPolicies()
      .then(res => setPolicies(res.policies))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdatePolicy = async (id: string, updatedFields: Partial<SecurityPolicy>) => {
    try {
      const res = await api.updatePolicy(id, updatedFields);
      setPolicies(prev => prev.map(p => p.id === id ? res.policy : p));
      setSaveMsg(`Policy ${res.policy.name} updated successfully.`);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update policy.');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold font-outfit text-slate-100">Security Policy Controls</h2>
        <p className="text-xs text-slate-400">Configure leak probability thresholds and dynamic enforcement actions</p>
      </div>

      {saveMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>{saveMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading security policies...</div>
      ) : (
        <div className="space-y-4">
          {policies.map((policy) => (
            <div key={policy.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-outfit">{policy.name}</h3>
                  <p className="text-xs text-slate-400">{policy.description}</p>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${
                  policy.action === 'BLOCK' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                  policy.action === 'REQUIRE_APPROVAL' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                  policy.action === 'WATERMARK' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                  'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                }`}>
                  Action: {policy.action}
                </span>
              </div>

              {/* Sliders & Controls */}
              <div className="grid sm:grid-cols-3 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Min Leak Score Trigger ({policy.minLeakScore}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={policy.minLeakScore}
                    disabled={!policy.isEditable}
                    onChange={(e) => setPolicies(prev => prev.map(p => p.id === policy.id ? { ...p, minLeakScore: parseInt(e.target.value, 10) } : p))}
                    onMouseUp={() => handleUpdatePolicy(policy.id, { minLeakScore: policy.minLeakScore })}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Max Leak Score Trigger ({policy.maxLeakScore}%)
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={policy.maxLeakScore}
                    disabled={!policy.isEditable}
                    onChange={(e) => setPolicies(prev => prev.map(p => p.id === policy.id ? { ...p, maxLeakScore: parseInt(e.target.value, 10) } : p))}
                    onMouseUp={() => handleUpdatePolicy(policy.id, { maxLeakScore: policy.maxLeakScore })}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Enforcement Action</label>
                  <select
                    value={policy.action}
                    disabled={!policy.isEditable}
                    onChange={(e) => handleUpdatePolicy(policy.id, { action: e.target.value as any })}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  >
                    <option value="ALLOW">ALLOW</option>
                    <option value="ENCRYPT">ENCRYPT</option>
                    <option value="WATERMARK">WATERMARK</option>
                    <option value="REQUIRE_APPROVAL">REQUIRE APPROVAL</option>
                    <option value="BLOCK">BLOCK</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
