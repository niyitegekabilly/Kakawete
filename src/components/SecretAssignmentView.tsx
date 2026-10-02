import React, { useState, useEffect } from 'react';
import { Gift, Lock, Copy, Check, Sparkles, RefreshCw, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';
import type { ParticipantSecretView } from '../types';
import envelopeImg from '../assets/images/secret_santa_envelope_1790946637568.jpg';

interface SecretAssignmentViewProps {
  eventCode: string;
  secretToken: string;
  onNavigateHome: () => void;
}

export const SecretAssignmentView: React.FC<SecretAssignmentViewProps> = ({
  eventCode,
  secretToken,
  onNavigateHome,
}) => {
  const [data, setData] = useState<ParticipantSecretView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpened, setIsOpened] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setError('');
        const res = await api.getParticipantSecretView(eventCode, secretToken);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Ntabwo tubashije kubona amakuru ya Kakawete yawe.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventCode, secretToken]);

  const handleOpenEnvelope = () => {
    setIsOpened(true);
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#0F5132', '#991B1B', '#D97706'],
    });
  };

  const handleCopySecretLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-800 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">Turimo gushaka amakuru ya Kakawete yawe...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold font-serif text-slate-900">Ntabwo Bihuye</h2>
        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
          {error || 'Link yawe ntabwo ari yo. Baza umuyobozi w’itsinda aguhe link nyayo.'}
        </p>
        <button
          onClick={onNavigateHome}
          className="mt-5 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Subira Ahabanza
        </button>
      </div>
    );
  }

  const { event, me, hasDrawn, recipient, mySanta } = data;

  return (
    <div className="max-w-md mx-auto px-4 py-8 text-slate-900">
      {/* Event Header */}
      <div className="text-center mb-6">
        <span className="text-xs font-mono text-emerald-800 uppercase font-semibold">
          {event.title}
        </span>
        <h1 className="text-2xl font-bold font-serif text-slate-900 mt-1">
          Muraho, {me.name}!
        </h1>
      </div>

      {/* Reveal Banner: "Kakawete Wanjye" */}
      {event.revealIdentities && mySanta && (
        <div className="mb-6 p-6 rounded-3xl bg-gradient-to-br from-amber-500 via-rose-600 to-amber-600 text-white shadow-xl text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-mono uppercase font-semibold text-amber-200 mb-2">
            <PartyPopper className="w-4 h-4" />
            <span>Kumenyekana kwa Ba Kakawete!</span>
          </div>
          <p className="text-xs text-amber-100 font-medium">Kakawete Wanjye (uwagombaga kumpa impano) yari:</p>
          <div className="mt-2 text-2xl sm:text-3xl font-bold font-serif text-white tracking-wide">
            ✨ {mySanta.name} ✨
          </div>
        </div>
      )}

      {!hasDrawn || !recipient ? (
        /* Waiting for draw */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold font-serif text-slate-900">
            Amazina Ntaratoranywa
          </h2>

          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Uri mu itsinda! Tegereza ko umuyobozi akora tombola ya Kakawete, uwo uzaha impano azahita agaragara hano kuri iyi link yawe.
          </p>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={handleCopySecretLink}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copiedLink ? 'Link Yakoporowe!' : 'Bika iyi Link yawe'}</span>
            </button>
          </div>
        </div>
      ) : !isOpened ? (
        /* Sealed envelope to open */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl text-center">
          <div className="max-w-[200px] mx-auto mb-4 relative rounded-2xl overflow-hidden shadow-md border border-rose-100">
            <img
              src={envelopeImg}
              alt="Ibaruwa ifunze ya Kakawete"
              className="w-full aspect-square object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-rose-700 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Ibanga rya Kakawete</span>
          </div>

          <h2 className="text-2xl font-bold font-serif text-slate-900">
            Uwo uzaha impano yamaze kumenyekana!
          </h2>

          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Kanda kuri buto iri hasi ufungure ibaruwa yawe umenye uwo ugomba guha impano.
          </p>

          <button
            onClick={handleOpenEnvelope}
            className="mt-6 w-full min-h-[48px] py-3 px-6 rounded-2xl bg-emerald-800 hover:bg-emerald-900 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-emerald-900/15 transition-all flex items-center justify-center gap-2"
          >
            <Gift className="w-5 h-5 text-amber-300" />
            <span>Fungura Ibaruwa ya Kakawete 🎁</span>
          </button>
        </div>
      ) : (
        /* Revealed Recipient Card */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-800/20 shadow-xl text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="text-xs uppercase tracking-wider font-bold text-emerald-800 mb-1">
            🎁 KAKAWETE Y'ITSINDA DUFATANYE VJN
          </div>

          <p className="text-xs text-slate-500">
            Uwo ugomba guha impano ni:
          </p>

          <div className="my-6 p-6 bg-gradient-to-b from-emerald-50 to-white rounded-3xl border border-emerald-200/80">
            <div className="w-14 h-14 rounded-2xl bg-white text-2xl flex items-center justify-center mx-auto shadow-sm border border-emerald-100 mb-3">
              🎁
            </div>
            <h3 className="text-3xl font-bold font-serif text-slate-900 tracking-wide text-balance">
              ✨ {recipient.name.toUpperCase()} ✨
            </h3>
          </div>

          <div className="p-3.5 bg-slate-900 text-white rounded-2xl text-xs font-medium mb-4 leading-relaxed">
            🤫 <strong>Gira ibanga rikomeye!</strong> Ntukabibwire {recipient.name} cyangwa undi muntu uwo ari we wese kugeza igihe cyo guhanahana impano kigeze!
          </div>

          <button
            onClick={handleCopySecretLink}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copiedLink ? 'Link Yakoporowe!' : 'Koporora Link yawe y\'Ibanga'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
