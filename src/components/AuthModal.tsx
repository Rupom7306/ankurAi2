import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Sprout, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, loginUser, registerUser, loginWithGoogle } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Automatically close modal when user successfully authenticates
  useEffect(() => {
    if (currentUser && isOpen) {
      onClose();
    }
  }, [currentUser, isOpen, onClose]);

  if (!isOpen) return null;

  const getFriendlyErrorMessage = (code: string, message?: string) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please click "Sign In (লগইন)" instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address (e.g. name@example.com).';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return isRegister 
          ? 'Registration failed. Please check your email and password.' 
          : 'Invalid email or password. If you don\'t have an account yet, switch to the "Register (নিবন্ধন)" tab above!';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/operation-not-allowed':
        return 'Sign-in method is not enabled yet in your Firebase Console.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before completing.';
      case 'auth/popup-blocked':
        return 'Google sign-in popup was blocked by your browser. Please allow popups for localhost.';
      case 'auth/network-request-failed':
        return 'Network connection error. Please verify your internet connection.';
      default:
        return message || (code ? `Authentication error (${code})` : 'Authentication failed. Please check your inputs.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (isRegister && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegister) {
        await registerUser(name.trim(), email.trim(), password);
      } else {
        await loginUser(email.trim(), password);
      }
      onClose();
    } catch (err: unknown) {
      console.error('Firebase Auth error:', err);
      const firebaseError = err as { code?: string; message?: string };
      setError(getFriendlyErrorMessage(firebaseError.code || '', firebaseError.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: unknown) {
      console.error('Google Auth error:', err);
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code !== 'auth/popup-closed-by-user') {
        setError(getFriendlyErrorMessage(firebaseError.code || '', firebaseError.message));
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="card-glass relative w-full max-w-md rounded-3xl p-6 sm:p-8 border border-parrot-500/40 shadow-glow-md bg-dark-900/95"
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
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-dark-800 border border-parrot-500/40 shadow-glow-sm">
            <Sprout className="w-6 h-6 text-parrot-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-1.5">
              <span className="font-bengali">অঙ্কুর</span>
              <span className="text-parrot-400">AI</span> 🌱
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {isRegister ? 'Create your farmer account' : 'Sign in to access your crop batches'}
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* GOOGLE SIGN IN BUTTON */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleSubmitting || isSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-dark-800 hover:bg-dark-750 text-white font-bold text-sm border border-dark-700 hover:border-parrot-500/40 shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 mb-4"
        >
          {isGoogleSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-parrot-400" />
              <span>Connecting with Google...</span>
            </>
          ) : (
            <>
              {/* Google G Logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-dark-800"></div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            or with email
          </span>
          <div className="flex-1 h-px bg-dark-800"></div>
        </div>

        {/* Switch Tabs (Sign In / Register) */}
        <div className="flex rounded-xl bg-dark-800/80 p-1 mb-4 border border-dark-750">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              !isRegister
                ? 'bg-parrot-500 text-dark-950 font-bold shadow-glow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In (লগইন)
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isRegister
                ? 'bg-parrot-500 text-dark-950 font-bold shadow-glow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register (নিবন্ধন)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name / খামারির নাম
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. মোঃ রফিকুল ইসলাম"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-dark-750 focus:border-parrot-400 focus:ring-1 focus:ring-parrot-400 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address / ইমেইল
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-dark-750 focus:border-parrot-400 focus:ring-1 focus:ring-parrot-400 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password / পাসওয়ার্ড
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-dark-950 border border-dark-750 focus:border-parrot-400 focus:ring-1 focus:ring-parrot-400 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full py-3 rounded-xl font-bold text-sm bg-parrot-500 hover:bg-parrot-400 text-dark-950 shadow-glow-sm hover:shadow-glow-md transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
