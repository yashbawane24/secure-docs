import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Share2, ShieldAlert, BarChart3, Settings, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Documents', path: '/documents', icon: FileText },
    { label: 'Shared with Me', path: '/shared', icon: Share2 },
    { label: 'Audit Trail', path: '/audit-log', icon: ShieldAlert, roles: ['ADMIN', 'MANAGER'] },
    { label: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
    { label: 'Security Policies', path: '/settings', icon: Settings, roles: ['ADMIN'] },
  ];

  const filteredNav = navItems.filter(item => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-navy-900 shadow-lg shadow-cyan-500/20 font-black">
          <Shield className="w-6 h-6 text-navy-900 fill-navy-900" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-slate-100 tracking-tight leading-none font-outfit">
            SecureDocs <span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-[10px] text-cyan-500 font-semibold tracking-wider uppercase mt-1">
            Data Leakage Protection
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-5 h-5 text-current" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Context & Sign Out */}
      <div className="p-4 m-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            user?.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
            user?.role === 'MANAGER' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
            user?.role === 'EXTERNAL_CLIENT' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
            'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
          }`}>
            {user?.role?.replace('_', ' ')}
          </span>
          
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-slate-400 hover:text-rose-400 transition-colors p-1"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
