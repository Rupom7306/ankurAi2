import React, { useState, useRef, useEffect } from 'react';
import { Sprout, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  onLoginClick?: () => void;
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLoginClick,
  onOpenProfile,
}) => {
  const { currentUser, logoutUser } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Farmer';
  const initial = displayName.charAt(0).toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border-header bg-bg/95 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* Brand: Always reads "অঙ্কুর AI" with "AI" in parrot green in both languages */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-accent/10 border border-border-green text-accent shadow-glow-sm">
            <Sprout className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="flex items-baseline gap-1.5 select-none">
            <span className="text-2xl sm:text-3xl font-extrabold font-bengali text-text-primary tracking-normal">
              অঙ্কুর
            </span>
            <span className="text-2xl sm:text-3xl font-black text-accent tracking-wide">
              AI
            </span>
          </div>
        </div>

        {/* Right side: Language Segmented Control & User Action */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Clear Segmented Control: বাংলা | English (min 44px tall, active filled green) */}
          <div className="flex items-center h-11 p-1 rounded-xl border border-border-green bg-card select-none">
            <button
              type="button"
              onClick={() => setLang('bn')}
              className={`h-full px-3.5 sm:px-4 rounded-lg text-sm sm:text-base font-semibold transition-all cursor-pointer flex items-center justify-center ${
                lang === 'bn'
                  ? 'bg-accent text-text-on-accent font-bold shadow-glow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              aria-pressed={lang === 'bn'}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`h-full px-3.5 sm:px-4 rounded-lg text-sm sm:text-base font-semibold transition-all cursor-pointer flex items-center justify-center ${
                lang === 'en'
                  ? 'bg-accent text-text-on-accent font-bold shadow-glow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              aria-pressed={lang === 'en'}
            >
              English
            </button>
          </div>

          {/* User Auth Action */}
          {currentUser ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="interactive h-11 min-w-[48px] px-3.5 sm:px-4 rounded-xl border border-border-green bg-card text-text-primary flex items-center gap-2.5 cursor-pointer"
                aria-expanded={isMenuOpen}
              >
                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs">
                  {initial}
                </span>
                <span className="font-semibold text-sm sm:text-base truncate max-w-[120px] hidden md:inline">
                  {displayName}
                </span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border-green bg-card-elevated shadow-card-soft py-1.5 z-40">
                  <div className="px-4 py-2 border-b border-border-green text-xs text-text-secondary truncate font-mono">
                    {currentUser.email}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (onOpenProfile) onOpenProfile();
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm sm:text-base text-text-primary hover:bg-card hover:text-accent transition-colors cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-text-secondary" />
                    <span>{t('nav_profile')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      logoutUser();
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm sm:text-base text-text-secondary hover:text-alert-warning hover:bg-card transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav_logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onLoginClick}
              className="interactive h-11 px-5 rounded-xl border border-border-green bg-card hover:border-accent text-accent hover:text-accent font-semibold text-sm sm:text-base flex items-center gap-2 cursor-pointer transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('nav_login')}</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
