import React, { useState } from 'react';
import { Gift, Check, Copy, Share2, ArrowRight, AlertCircle } from 'lucide-react';
import { api } from '../api';
import type { PublicEventInfo, Participant } from '../types';

interface ParticipantRegisterViewProps {
  event: PublicEventInfo;
  onRegistered: (token: string) => void;
  onBack: () => void;
}

export const ParticipantRegisterView: React.FC<ParticipantRegisterViewProps> = ({
  event,
  onRegistered,
  onBack,
}) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredParticipant, setRegisteredParticipant] = useState<Participant | null>(null);
  const [secretUrl, setSecretUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.joinEvent(event.code, name.trim());
      setRegisteredParticipant(res.participant);
      const fullUrl = `${window.location.origin}/event/${event.code}/my-secret/${res.participant.secretToken}`;
      setSecretUrl(fullUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to join event.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecretLink = () => {
    navigator.clipboard.writeText(secretUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppSave = () => {
    const text = `🔒 My Secret Santa Private Link for ${event.title}:\n${secretUrl}\n\n(Keep this private to see who you are giving a gift to!)`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      {/* Event Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm mb-5 text-center">
        <div className="inline-flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
          <span>EVENT: <strong className="text-emerald-800">{event.code}</strong></span>
          <span aria-hidden="true">·</span>
          <span>{event.participantCount} Participants</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
          {event.title}
        </h1>
        {event.exchangeDate && (
          <p className="text-xs text-slate-500 mt-1">
            Exchange Date: {new Date(event.exchangeDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>

      {!registeredParticipant ? (
        /* Simple Name Entry Form */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 mb-2">
              <Gift className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-serif text-slate-900">
              Injira muri Kakawete
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Andika izina ryawe hasi kugira ngo ugire uruhare muri Kakawete.
            </p>
          </div>

          {event.isRegistrationLocked ? (
            <div className="p-4 bg-amber-50 text-amber-900 rounded-2xl border border-amber-200 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-700" />
              <span>
                Kwandika amazina byafunzwe kuko amazina ya Kakawete yamaze gukurwamo.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Izina Ryawe Ryose (Full Name)
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g. Jean Bosco"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 text-base bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[48px] py-3 px-4 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.98] text-white font-semibold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Kwinjira...' : 'Injira muri Kakawete 🎁'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* Joined Success Card */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 text-2xl font-serif font-bold">
            ✓
          </div>

          <h2 className="text-2xl font-bold font-serif text-slate-900">
            Murakaza neza, {registeredParticipant.name}!
          </h2>

          <div className="mt-2 p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 font-medium">
            Wamaze kwinjira muri Kakawete y'Itsinda Dufatanye VJN.
          </div>

          <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2">
            <span className="text-[11px] uppercase font-bold text-slate-600 block">
              Link yawe y'Ibanga (Secret Link)
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bika iyi link mu ibanga! Uzayifungura igihe umuyobozi azaba amaze gukora tombola kugira ngo urebe uwo uzaha impano.
            </p>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 break-all select-all">
              {secretUrl}
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={handleCopySecretLink}
              className="w-full min-h-[44px] py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copiedLink ? 'Link Yakoporowe!' : 'Koporora Link y\'Ibanga'}</span>
            </button>

            <button
              onClick={handleWhatsAppSave}
              className="w-full min-h-[44px] py-2.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>Bika kuri WhatsApp</span>
            </button>

            <div className="pt-3">
              <button
                onClick={() => onRegistered(registeredParticipant.secretToken)}
                className="w-full min-h-[48px] py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>Reba Kakawete Wanjye →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
