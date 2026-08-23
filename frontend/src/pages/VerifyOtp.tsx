import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { OtpBanner } from '../components/OtpBanner';

export const VerifyOtp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const email = location.state?.email || 'admin@securedocs.ai';
  const mockOtpBanner = location.state?.mockOtpBanner || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.verifyOtp({ email, otp });
      login(res.token, res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid 2FA security code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 items-center justify-center text-cyan-400 font-black">
            <KeyRound className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold font-outfit text-slate-100">
            Two-Factor <span className="text-cyan-400">Authentication</span>
          </h1>
          <p className="text-xs text-slate-400">Verification code sent to <span className="text-slate-200 font-semibold">{email}</span></p>
        </div>

        {mockOtpBanner && <OtpBanner otp={mockOtpBanner} />}

        {/* OTP Form Card */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enter 6-Digit Code</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center text-2xl font-mono tracking-widest bg-slate-900/80 border border-slate-800 rounded-xl py-3 text-cyan-400 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="123456"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-900 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Validating Token...' : 'Authenticate & Access Workspace'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
