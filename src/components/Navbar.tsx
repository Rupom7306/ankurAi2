import React from 'react';
import { Sprout, QrCode, Plus, Sparkles, Activity, LogIn, LogOut } from 'lucide-react';

interface NavbarProps {
  onOpenNewBatchModal?: () => void;
  onOpenScanModal?: () => void;
  onLoginClick?: () => void;
  user?: { name: string; email: string } | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewBatchModal,
  onOpenScanModal,
  onLoginClick,
  user,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-dark-750 bg-dark-950/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Left: Brand identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-dark-850 border border-parrot-500/30 shadow-glow-sm">
            <Sprout className="w-6 h-6 sm:w-7 sm:h-7 text-parrot-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-parrot-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-parrot-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl font-bold font-bengali text-white tracking-wide">অঙ্কুর</span>
              <span className="text-xl sm:text-2xl font-extrabold text-parrot-400 tracking-wider">AI</span>
              <span className="text-lg sm:text-xl">🌱</span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-parrot-500/10 text-parrot-400 border border-parrot-500/20">
                Crop Guardian
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Smart AI Agricultural Intelligence & Sensor Analytics</p>
          </div>
        </div>

        {/* Center: Live Telemetry Status (Desktop only) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-900 border border-dark-750 text-xs text-slate-300">
          <Activity className="w-3.5 h-3.5 text-parrot-400 animate-pulse" />
          <span>Telemetry: <strong className="text-parrot-400 font-semibold">10-Min Ingestion Ready</strong></span>
        </div>

        {/* Right side: Action Buttons + Top Right LOGIN Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Scan QR button */}
          <button
            onClick={onOpenScanModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-dark-850 hover:bg-dark-800 text-slate-200 border border-dark-700 hover:border-parrot-500/40 transition-all"
            title="Scan Batch QR Code"
          >
            <QrCode className="w-4 h-4 text-parrot-400" />
            <span>QR Scan</span>
          </button>

          {/* New Batch button */}
          <button
            onClick={onOpenNewBatchModal}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-dark-850 hover:bg-dark-800 text-parrot-300 border border-parrot-500/30 hover:border-parrot-500/60 shadow-inner-glow transition-all"
          >
            <Plus className="w-4 h-4 text-parrot-400 stroke-[2.5]" />
            <span className="hidden sm:inline">New Batch</span>
            <Sparkles className="w-3 h-3 text-parrot-400 opacity-80" />
          </button>

          {/* TOP RIGHT CORNER: LOGIN / USER PROFILE BUTTON */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-dark-750">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-900 border border-parrot-500/30">
                <div className="w-7 h-7 rounded-lg bg-parrot-500/20 text-parrot-400 flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[100px]">{user.name}</div>
                  <div className="text-[10px] text-slate-400">Farmer Account</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-2 rounded-xl bg-dark-850 hover:bg-dark-800 text-slate-400 hover:text-rose-400 border border-dark-750 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-parrot-500 hover:bg-parrot-400 text-dark-950 shadow-glow-sm hover:shadow-glow-md transition-all duration-200 transform hover:-translate-y-0.5 ml-1"
            >
              <LogIn className="w-4 h-4 stroke-[2.5]" />
              <span>Login</span>
              <span className="hidden sm:inline font-bengali text-xs font-normal">/ লগইন</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
