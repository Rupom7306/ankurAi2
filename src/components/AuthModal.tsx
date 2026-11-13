import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Sprout, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, loginUser, registerUser, loginWithGoogle } = useAuth();
  const { t, lang } = useLanguage();
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
    if (lang === 'bn') {
      switch (code) {
        case 'auth/email-already-in-use':
          return 'এই ইমেইলটি ইতিমধ্যে নিবন্ধিত। অনুগ্রহ করে লগইন করুন।';
        case 'auth/invalid-email':
          return 'সঠিক ইমেইল ঠিকানা দিন (যেমন: name@example.com)।';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          return isRegister 
            ? 'নিবন্ধন সম্পন্ন করা যায়নি। ইমেইল ও পাসওয়ার্ড পরীক্ষা করুন।' 
            : 'ভুল ইমেইল বা পাসওয়ার্ড। আপনার একাউন্ট না থাকলে নিবন্ধন করুন।';
        case 'auth/weak-password':
          return 'পাসওয়ার্ডটি খুব ছোট। কমপক্ষে ৬ অক্ষর ব্যবহার করুন।';
        case 'auth/popup-closed-by-user':
          return 'Google সাইন-ইন উইন্ডো বন্ধ করা হয়েছে।';
        default:
          return message || 'প্রবেশ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
      }
    }

    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return isRegister 
          ? 'Registration failed. Please check your credentials.' 
          : 'Invalid email or password. Please check your details.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before completion.';
      default:
        return message || 'Authentication failed. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError(lang === 'bn' ? 'ইমেইল এবং পাসওয়ার্ড দুটিই প্রয়োজন।' : 'Please provide both email and password.');
      return;
    }

    if (isRegister && !name.trim()) {
      setError(lang === 'bn' ? 'অনুগ্রহ করে আপনার পুরো নাম লিখুন।' : 'Please enter your full name.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-md rounded-2xl border border-border-green bg-card-elevated p-6 sm:p-8 shadow-card-soft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="interactive absolute right-4 top-4 p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-card transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 border border-border-green text-accent mx-auto shadow-glow-sm">
            <Sprout className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-bengali text-text-primary">
            {isRegister ? t('auth_register_title') : t('auth_login_title')}
          </h3>
          <p className="text-sm sm:text-base text-text-secondary">
            {t('brand_tagline')}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Register */}
        <div className="flex rounded-xl bg-card border border-border-green p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`interactive flex-1 py-2.5 rounded-lg text-sm sm:text-base font-semibold transition-all cursor-pointer ${
              !isRegister
                ? 'bg-accent text-text-on-accent font-bold shadow-glow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('auth_login_tab')}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`interactive flex-1 py-2.5 rounded-lg text-sm sm:text-base font-semibold transition-all cursor-pointer ${
              isRegister
                ? 'bg-accent text-text-on-accent font-bold shadow-glow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('auth_register_tab')}
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl border border-alert-warning/30 bg-alert-warning/10 text-alert-warning text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleSubmitting || isSubmitting}
          className="interactive btn-secondary w-full h-12 text-sm sm:text-base font-semibold mb-5 flex items-center justify-center gap-3"
        >
          {isGoogleSubmitting ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
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
          )}
          <span>{t('auth_google')}</span>
        </button>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-green" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card-elevated px-3 text-text-secondary font-mono">
              {t('auth_or_email')}
            </span>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                <User className="w-4 h-4 text-accent" />
                <span>{t('auth_name_label')}</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('auth_name_placeholder')}
                className="w-full px-4 py-3 rounded-xl bg-card border border-border-green text-base text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent" />
              <span>{t('auth_email_label')}</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth_email_placeholder')}
              required
              className="w-full px-4 py-3 rounded-xl bg-card border border-border-green text-base text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
              <Lock className="w-4 h-4 text-accent" />
              <span>{t('auth_password_label')}</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth_password_placeholder')}
              required
              className="w-full px-4 py-3 rounded-xl bg-card border border-border-green text-base text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{t('auth_submitting')}</span>
                </>
              ) : (
                <>
                  <span>{isRegister ? t('auth_submit_register') : t('auth_submit_login')}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
