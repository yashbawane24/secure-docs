import React from 'react';
import { Search, Upload, ShieldCheck, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenUpload?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenUpload }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 glass-panel px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Input */}
      <div className="relative w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search documents, entities, logs..."
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
        />
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Recipient Trust Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <div className="text-[11px]">
            <span className="text-slate-400">Trust Index: </span>
            <span className="font-bold text-cyan-400">{user?.trustLevel || 75}/100</span>
          </div>
        </div>

        {/* Bell Notifications */}
        <button className="w-9 h-9 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {/* Upload Button */}
        {onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-900 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        )}
      </div>
    </header>
  );
};
