import React from 'react';
import { Sprout, QrCode, Plus, Sparkles, Activity } from 'lucide-react';

interface NavbarProps {
  onOpenNewBatchModal?: () => void;
  onOpenScanModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewBatchModal, onOpenScanModal }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-dark-750 bg-dark-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-dark-850 border border-parrot-500/30 shadow-glow-sm">
            <Sprout className="w-7 h-7 text-parrot-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-parrot-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-parrot-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-bengali text-white tracking-wide">অঙ্কুর</span>
              <span className="text-2xl font-extrabold text-parrot-400 tracking-wider">AI</span>
              <span className="text-xl">🌱</span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-parrot-500/10 text-parrot-400 border border-parrot-500/20">
                Crop Guardian
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Smart AI Agricultural Intelligence & Sensor Analytics</p>
          </div>
        </div>

        {/* Status & Quick Action Buttons */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-900 border border-dark-750 text-xs text-slate-300">
            <Activity className="w-3.5 h-3.5 text-parrot-400 animate-pulse" />
            <span>Telemetry: <strong className="text-parrot-400 font-semibold">10-Min Ingestion Ready</strong></span>
          </div>

          <button
            onClick={onOpenScanModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-dark-850 hover:bg-dark-800 text-slate-200 border border-dark-700 hover:border-parrot-500/40 transition-all duration-200"
            title="Scan QR Code or Plant Photo"
          >
            <QrCode className="w-4 h-4 text-parrot-400" />
            <span className="hidden sm:inline">Scan QR / Plant</span>
          </button>

          <button
            onClick={onOpenNewBatchModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-parrot-500 hover:bg-parrot-400 text-dark-950 shadow-glow-sm hover:shadow-glow-md transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">New Batch</span>
            <Sparkles className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>

      </div>
    </header>
  );
};
