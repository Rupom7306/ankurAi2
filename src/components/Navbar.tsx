import React from 'react';
import { Sprout, Plus, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenNewBatchModal?: () => void;
  onLoginClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewBatchModal,
  onLoginClick,
}) => {
  const { currentUser, logoutUser } = useAuth();

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Farmer';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-dark-800 bg-dark-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        
        {/* Minimal Brand Identity */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-dark-900 border border-parrot-500/30 text-parrot-400">
            <Sprout className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold font-bengali text-white">অঙ্কুর</span>
            <span className="text-xl font-extrabold text-parrot-400 tracking-wide">AI</span>
            <span className="text-base">🌱</span>
          </div>
        </div>

        {/* Right side: Action & Login */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewBatchModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-dark-900 hover:bg-dark-850 text-slate-200 border border-dark-750 hover:border-parrot-500/40 transition-all"
          >
            <Plus className="w-4 h-4 text-parrot-400" />
            <span>New Batch</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-900 border border-parrot-500/30 text-xs text-white">
                <span className="w-6 h-6 rounded-lg bg-parrot-500/20 text-parrot-400 flex items-center justify-center font-bold">
                  {initial}
                </span>
                <span className="font-semibold truncate max-w-[120px]">{displayName}</span>
              </div>
              <button
                onClick={() => logoutUser()}
                title="Sign Out"
                className="p-2 rounded-xl bg-dark-900 hover:bg-dark-850 text-slate-400 hover:text-rose-400 border border-dark-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-parrot-500 hover:bg-parrot-400 text-dark-950 shadow-glow-sm hover:shadow-glow-md transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
