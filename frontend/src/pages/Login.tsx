import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, Lock, Mail, Users, UserCheck, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

type PortalRole = 'EMPLOYEE' | 'MANAGER' | 'ADMIN';

export const Login: React.FC = () => {
  const [activeRole, setActiveRole] = useState<PortalRole>('EMPLOYEE');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enteredCaptcha, setEnteredCaptcha] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Generate random 5-character alphanumeric captcha
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setEnteredCaptcha('');
  };

  // Draw captcha on canvas with anti-bot noise and lines
  const drawCaptcha = (code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Random interference lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(168, 85, 247, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.bezierCurveTo(
        Math.random() * canvas.width, Math.random() * canvas.height,
        Math.random() * canvas.width, Math.random() * canvas.height,
        Math.random() * canvas.width, Math.random() * canvas.height
      );
      ctx.stroke();
    }

    // Random background noise dots
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(244, 63, 94, 0.3)';
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render Captcha Characters with individual rotation and color
    const colors = ['#38bdf8', '#818cf8', '#34d399', '#f43f5e', '#fbbf24'];
    ctx.font = 'bold 22px Courier, monospace';
    ctx.textBaseline = 'middle';

    const startX = 20;
    const spacing = 22;

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const charColor = colors[i % colors.length];
      const x = startX + i * spacing;
      const y = canvas.height / 2;
      const angle = (Math.random() - 0.5) * 0.4;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = charColor;
      ctx.fillText(char, -8, 2);
      ctx.restore();
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, [activeRole]);

  useEffect(() => {
    if (captchaCode) {
      drawCaptcha(captchaCode);
    }
  }, [captchaCode]);

  const handleSelectRole = (role: PortalRole) => {
    setActiveRole(role);
    setError('');
    generateCaptcha();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Verify CAPTCHA
    if (!enteredCaptcha || enteredCaptcha.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setError('Invalid CAPTCHA code. Please enter the characters shown in the box.');
      generateCaptcha();
      return;
    }

    setLoading(true);

    try {
      const res = await api.login({ email, password, portalRole: activeRole });
      login(res.token, res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 flex flex-col justify-between">
      {/* 1. Top Navigation Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-navy-900 shadow-lg shadow-cyan-500/20 font-black">
            <Shield className="w-6 h-6 text-navy-900 fill-navy-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-100 tracking-tight font-outfit">SECUREDOCS AI</span>
              <span className="text-xs text-cyan-400 font-semibold">(Enterprise Portal)</span>
            </div>
            <p className="text-[10px] text-slate-400">Adaptive Data Leak Prevention & Access Governance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Online
          </span>
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors hidden sm:block"
          >
            Public Site
          </Link>
        </div>
      </header>

      {/* 2. Main Body */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 space-y-8 flex flex-col justify-center">
        {/* Header Heading */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black font-outfit text-slate-100 tracking-tight">
            Select Your <span className="text-cyan-400">Access Portal</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Choose your role section to authenticate into the secure workspace
          </p>
        </div>

        {/* 3. The 3 Role Cards (Employee, Manager, Admin) - Matching Website Dark Theme */}
        <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto w-full">
          {/* Card 1: Employee */}
          <div
            onClick={() => handleSelectRole('EMPLOYEE')}
            className={`cursor-pointer rounded-2xl p-5 transition-all duration-200 flex items-center justify-between border ${
              activeRole === 'EMPLOYEE'
                ? 'bg-slate-900/90 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/30'
                : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                activeRole === 'EMPLOYEE'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-slate-800 text-amber-400/80 border border-slate-700'
              }`}>
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-400 font-outfit">Employee</h3>
                <p className="text-[11px] text-slate-400">Staff & Dev Portal</p>
              </div>
            </div>

            <button
              type="button"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                activeRole === 'EMPLOYEE'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              aria-label="Select Employee Portal"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Manager */}
          <div
            onClick={() => handleSelectRole('MANAGER')}
            className={`cursor-pointer rounded-2xl p-5 transition-all duration-200 flex items-center justify-between border ${
              activeRole === 'MANAGER'
                ? 'bg-slate-900/90 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30'
                : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                activeRole === 'MANAGER'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-emerald-400/80 border border-slate-700'
              }`}>
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-400 font-outfit">Manager</h3>
                <p className="text-[11px] text-slate-400">Review & Approvals</p>
              </div>
            </div>

            <button
              type="button"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                activeRole === 'MANAGER'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              aria-label="Select Manager Portal"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Admin */}
          <div
            onClick={() => handleSelectRole('ADMIN')}
            className={`cursor-pointer rounded-2xl p-5 transition-all duration-200 flex items-center justify-between border ${
              activeRole === 'ADMIN'
                ? 'bg-slate-900/90 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-500/30'
                : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                activeRole === 'ADMIN'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-slate-800 text-cyan-400/80 border border-slate-700'
              }`}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-cyan-400 font-outfit">Admin</h3>
                <p className="text-[11px] text-slate-400">Security Governance</p>
              </div>
            </div>

            <button
              type="button"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                activeRole === 'ADMIN'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              aria-label="Select Admin Portal"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4. Login Form Card with CAPTCHA */}
        <div className="max-w-lg mx-auto w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100 font-outfit">
                  {activeRole === 'EMPLOYEE' && 'Employee Sign In'}
                  {activeRole === 'MANAGER' && 'Manager Sign In'}
                  {activeRole === 'ADMIN' && 'Administrator Sign In'}
                </h2>
                <p className="text-xs text-slate-400">Enter credentials and complete CAPTCHA verification</p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
              activeRole === 'ADMIN' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' :
              activeRole === 'MANAGER' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {activeRole}
            </span>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="flex-1 space-y-1.5">
                  <p className="font-semibold leading-relaxed">{error}</p>
                  {error.toLowerCase().includes('employee portal') && activeRole !== 'EMPLOYEE' && (
                    <button
                      type="button"
                      onClick={() => handleSelectRole('EMPLOYEE')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all shadow-sm"
                    >
                      Switch to Employee Portal <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {error.toLowerCase().includes('manager portal') && activeRole !== 'MANAGER' && (
                    <button
                      type="button"
                      onClick={() => handleSelectRole('MANAGER')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition-all shadow-sm"
                    >
                      Switch to Manager Portal <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {error.toLowerCase().includes('administrator portal') && activeRole !== 'ADMIN' && (
                    <button
                      type="button"
                      onClick={() => handleSelectRole('ADMIN')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold transition-all shadow-sm"
                    >
                      Switch to Admin Portal <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">User Email / Corporate ID</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="name@securedocs.ai"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* CAPTCHA Verification */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Security CAPTCHA</span>
                <span className="text-[10px] text-slate-500">Case-insensitive</span>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Visual Canvas */}
                <div className="relative border border-slate-700 rounded-xl overflow-hidden shadow-inner bg-slate-950">
                  <canvas
                    ref={canvasRef}
                    width={140}
                    height={40}
                    className="block cursor-pointer"
                    onClick={generateCaptcha}
                    title="Click to refresh CAPTCHA"
                  />
                </div>

                {/* Refresh Button */}
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-all hover:text-cyan-400"
                  title="Generate New CAPTCHA"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                {/* Input */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={enteredCaptcha}
                    onChange={(e) => setEnteredCaptcha(e.target.value)}
                    maxLength={6}
                    placeholder="Enter code"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono tracking-widest uppercase text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-900 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : `Sign In to ${activeRole.charAt(0) + activeRole.slice(1).toLowerCase()} Portal`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            Need an employee or contractor account?{' '}
            <Link to="/signup" className="text-cyan-400 font-semibold hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </main>

      {/* 5. Clean Bottom Footer */}
      <footer className="bg-slate-900/60 border-t border-slate-800/80 px-4 py-3 text-center text-xs text-slate-500 mt-8">
        Copyright © 2026 SecureDocs AI Platform. All Rights Reserved.
      </footer>
    </div>
  );
};
