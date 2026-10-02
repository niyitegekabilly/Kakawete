import React from 'react';
import { Shield, Plus, LogIn } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigateHome: () => void;
  onCreateEvent: () => void;
  onJoinEvent: () => void;
  onOpenAdmin: () => void;
  activeEventCode?: string;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigateHome,
  onCreateEvent,
  onJoinEvent,
  onOpenAdmin,
  activeEventCode,
  isAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Zone 1: Wordmark */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-left group focus:outline-none"
        >
          <span className="font-serif text-sm sm:text-base font-bold tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors truncate max-w-[210px] sm:max-w-none">
            🎁 KAKAWETE Y'ITSINDA DUFATANYE VJN
          </span>
        </button>

        {/* Zone 2: Navigation links in Kinyarwanda */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={onNavigateHome}
            className={`hover:text-emerald-800 transition-colors ${currentView === 'landing' ? 'text-emerald-900 font-semibold' : ''}`}
          >
            Ahabanza
          </button>
          <button
            onClick={onJoinEvent}
            className="hover:text-emerald-800 transition-colors"
          >
            Injira muri Kakawete
          </button>
        </nav>

        {/* Zone 3: Actions - Creating new ONLY reserved for admin! */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            /* Admin Only: Create New & Badge */
            <>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                <Shield className="w-3 h-3" /> Umuyobozi
              </span>
              <button
                onClick={onCreateEvent}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 active:scale-95 rounded-xl shadow-sm transition-all whitespace-nowrap min-h-[40px]"
                title="Tangiza indi Kakawete (Reserved for Admin)"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Tangiza Nshya</span>
              </button>
            </>
          ) : (
            /* General Users: Enter Existing CTA button */
            <button
              onClick={onJoinEvent}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 active:scale-95 rounded-xl shadow-sm transition-all whitespace-nowrap min-h-[40px]"
            >
              <LogIn className="w-4 h-4 text-amber-300" />
              <span>Injira</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
