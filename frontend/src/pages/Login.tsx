import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, Lock, Mail } from 'lucide-react';
import { api } from '../services/api';
import { OtpBanner } from '../components/OtpBanner';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@securedocs.ai');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mockOtp, setMockOtp] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      if (res.requiresOtp) {
        setMockOtp(res.mockOtpBanner);
        setTimeout(() => {
          navigate('/verify-otp', { state: { email, mockOtpBanner: res.mockOtpBanner } });
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 items-center justify-center text-navy-900 shadow-xl shadow-cyan-500/20 font-black">
            <Shield className="w-7 h-7 text-navy-900 fill-navy-900" />
          </div>
          <h1 className="text-2xl font-extrabold font-outfit text-slate-100">
            SecureDocs <span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400">Sign in to your adaptive security portal</p>
        </div>

        {mockOtp && <OtpBanner otp={mockOtp} />}

        {/* Form Card */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="admin@securedocs.ai"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Quick Demo Credentials helper */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-bold text-cyan-400 uppercase tracking-wider text-[9px]">Demo Accounts (Password: password123)</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button type="button" onClick={() => setEmail('admin@securedocs.ai')} className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] hover:bg-purple-500/20">Admin</button>
                <button type="button" onClick={() => setEmail('manager@securedocs.ai')} className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] hover:bg-blue-500/20">Manager</button>
                <button type="button" onClick={() => setEmail('sarah.employee@securedocs.ai')} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] hover:bg-emerald-500/20">Employee</button>
                <button type="button" onClick={() => setEmail('client.external@partner.com')} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] hover:bg-amber-500/20">External</button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-900 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Verifying Credentials...' : 'Continue to 2FA Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-cyan-400 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
