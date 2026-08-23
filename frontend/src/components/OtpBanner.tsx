import React from 'react';
import { KeyRound, Copy, Check } from 'lucide-react';

interface OtpBannerProps {
  otp: string;
}

export const OtpBanner: React.FC<OtpBannerProps> = ({ otp }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
          <KeyRound className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Dev Simulated OTP</p>
          <p className="text-xs text-slate-300">Your login 2FA code: <span className="font-extrabold text-white tracking-widest text-sm">{otp}</span></p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/30 hover:bg-cyan-500/40 text-cyan-300 text-[11px] font-bold transition-all"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  );
};
