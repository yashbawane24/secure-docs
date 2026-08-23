import React from 'react';
import { useAuth } from '../context/AuthContext';

interface WatermarkOverlayProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({ children, enabled = true }) => {
  const { user } = useAuth();
  const timestamp = new Date().toLocaleString();

  if (!enabled) return <>{children}</>;

  const watermarkText = `SECUREDOCS AI • PREVIEW ONLY • ${user?.email || 'viewer@securedocs.ai'} • ${timestamp}`;

  return (
    <div className="relative overflow-hidden group">
      {/* Document Content */}
      {children}

      {/* Repeating Diagonal Watermark Grid */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-around opacity-25 select-none overflow-hidden rotate-[-25deg]">
        <div className="whitespace-nowrap text-[12px] font-mono font-bold tracking-widest text-cyan-400/80 drop-shadow-md">
          {watermarkText} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {watermarkText}
        </div>
        <div className="whitespace-nowrap text-[12px] font-mono font-bold tracking-widest text-cyan-400/80 drop-shadow-md ml-12">
          {watermarkText} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {watermarkText}
        </div>
        <div className="whitespace-nowrap text-[12px] font-mono font-bold tracking-widest text-cyan-400/80 drop-shadow-md">
          {watermarkText} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {watermarkText}
        </div>
        <div className="whitespace-nowrap text-[12px] font-mono font-bold tracking-widest text-cyan-400/80 drop-shadow-md ml-16">
          {watermarkText} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {watermarkText}
        </div>
      </div>
    </div>
  );
};
