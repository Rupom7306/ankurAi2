import React, { useState } from 'react';
import { X, Lock, Mail, User, Sprout, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in both email and password.');
      return;
    }
    onLoginSuccess({
      name: name || (email.split('@')[0] ? email.split('@')[0].toUpperCase() : 'Farmer Rafiq'),
      email,
    });
    onClose();
  };

  const handleDemoLogin = () => {
    onLoginSuccess({
      name: 'Farmer Rafiq',
      email: 'rafiq.farm@ankur-ai.org',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="card-glass-glow relative w-full max-w-md rounded-3xl p-6 sm:p-8 border border-parrot-500/40 shadow-glow-md bg-dark-900/95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-dark-800 text-slate-400 hover:text-white hover:bg-dark-750 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-dark-800 border border-parrot-500/40 shadow-glow-sm">
            <Sprout className="w-6 h-6 text-parrot-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="font-bengali">অঙ্কুর</span>
              <span className="text-parrot-400">AI</span> 🌱
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {isRegister ? 'Register your farm account' : 'Sign in to access your crop batches'}
            </p>
          </div>
        </div>

        {/* Switch Tabs */}
        <div className="flex rounded-xl bg-dark-800/80 p-1 mb-6 border border-dark-700">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isRegister
                ? 'bg-parrot-500 text-dark-950 shadow-glow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In (লগইন)
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              isRegister
                ? 'bg-parrot-500 text-dark-950 shadow-glow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register (নিবন্ধন)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name / খামারির নাম
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. মোঃ রফিকুল ইসলাম"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-dark-700 focus:border-parrot-400 focus:ring-1 focus:ring-parrot-400 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address / ইমেইল
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-dark-700 focus:border-parrot-400 focus:ring-1 focus:ring-parrot-400 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password / পাসওয়ার্ড
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-dark-700 focus:border-parrot-400 focus:ring-1 focus:ring-parrot-400 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-sm bg-parrot-500 hover:bg-parrot-400 text-dark-950 shadow-glow-sm hover:shadow-glow-md transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{isRegister ? 'Create Account' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo One-Click Login for immediate preview */}
        <div className="mt-5 pt-5 border-t border-dark-800 text-center">
          <p className="text-xs text-slate-400 mb-2">Want to test the app without typing?</p>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-dark-800 hover:bg-dark-750 text-parrot-400 border border-parrot-500/30 hover:border-parrot-500/60 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-parrot-400" />
            <span>One-Click Demo Login (Farmer Rafiq)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
