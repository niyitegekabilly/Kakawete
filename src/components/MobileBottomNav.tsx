import React from 'react';
import { Home, Gift, Shield } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'home' | 'secret' | 'admin';
  onSelectTab: (tab: 'home' | 'secret' | 'admin') => void;
  hasActiveEvent: boolean;
  isAdmin: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  hasActiveEvent,
  isAdmin,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="grid grid-cols-3 items-center h-14 max-w-sm mx-auto px-4">
        {/* Tab 1: Ahabanza */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'home' ? 'text-emerald-800 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">Ahabanza</span>
        </button>

        {/* Tab 2: Kakawete Wanjye */}
        <button
          onClick={() => onSelectTab('secret')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
            activeTab === 'secret' ? 'text-emerald-800 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Gift className={`w-5 h-5 ${activeTab === 'secret' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            {hasActiveEvent && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-medium whitespace-nowrap">Kakawete Wanjye</span>
        </button>

        {/* Tab 3: Umuyobozi */}
        <button
          onClick={() => onSelectTab('admin')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'admin' ? 'text-emerald-800 font-semibold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className={`w-5 h-5 ${activeTab === 'admin' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">
            {isAdmin ? 'Ibiro Byanjye' : 'Umuyobozi'}
          </span>
        </button>
      </div>
    </nav>
  );
};
