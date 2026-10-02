import React from 'react';
import { Users, Sparkles } from 'lucide-react';
import heroGiftImg from '../assets/images/secret_santa_hero_gift_1790946616026.jpg';

interface LandingViewProps {
  onJoinEvent: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onJoinEvent,
}) => {
  return (
    <div className="w-full pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-10 sm:pt-14 sm:pb-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-emerald-800 uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Itsinda Dufatanye VJN</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 font-serif leading-[1.2] text-balance">
            🎁 KAKAWETE Y'ITSINDA DUFATANYE VJN
          </h1>

          <p className="mt-3 text-lg sm:text-xl text-slate-600 font-serif italic max-w-lg mx-auto">
            “Tanga gake, ushimishe mugenzi wawe, urukundo rwaguke muri twe!”
          </p>

          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Injira muri Kakawete y'Itsinda Dufatanye VJN ukoresheje kode y'itsinda cyangwa link wahawe.
          </p>

          {/* Action Button: Single CTA to Enter Existing */}
          <div className="mt-7 flex justify-center max-w-sm mx-auto">
            <button
              onClick={onJoinEvent}
              className="w-full min-h-[52px] px-8 py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 active:scale-[0.98] text-white font-semibold text-base shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2.5"
            >
              <Users className="w-5 h-5 text-amber-300" />
              <span>Injira muri Kakawete</span>
            </button>
          </div>

          {/* Hero Visual Card */}
          <div className="mt-8 max-w-xl mx-auto rounded-3xl overflow-hidden shadow-lg border border-slate-200/70 bg-white">
            <div className="relative aspect-[16/9] w-full bg-stone-100 overflow-hidden">
              <img
                src={heroGiftImg}
                alt="Impano ya Kakawete"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent flex items-end p-5 text-left">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-300">
                    Bikorerwa mu Ibanga Rikomeye
                  </span>
                  <p className="text-white font-serif text-base sm:text-xl font-bold mt-0.5">
                    Injira wandike izina ryawe gusa, maze ubone uwo uzaha impano ya Kakawete.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
