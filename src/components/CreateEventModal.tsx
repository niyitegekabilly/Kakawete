import React, { useState } from 'react';
import { X, Gift, Check, Copy, Share2, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../api';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (code: string, adminToken: string) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields (Simple!)
  const [title, setTitle] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [exchangeDate, setExchangeDate] = useState('2026-12-24');

  // Result info
  const [createdCode, setCreatedCode] = useState('');
  const [createdAdminToken, setCreatedAdminToken] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide an event name.');
      return;
    }
    if (!organizerName.trim()) {
      setError('Please provide your name as organizer.');
      return;
    }
    if (!adminPin || adminPin.trim().length < 4) {
      setError('Please enter a 4-digit PIN to manage the event.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createEvent({
        title: title.trim(),
        organizerName: organizerName.trim(),
        adminPin: adminPin.trim(),
        exchangeDate,
      });

      const loginRes = await api.adminLogin(res.code, adminPin.trim());
      setCreatedCode(res.code);
      setCreatedAdminToken(loginRes.adminToken);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inviteUrl = typeof window !== 'undefined' ? `${window.location.origin}/join/${createdCode}` : `https://secretsanta.app/join/${createdCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(createdCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const message = `🎁 You're invited to our Secret Santa!\n\nEvent: ${title}\nJoin with your name here:\n${inviteUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 'form' ? (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 mb-2">
                <Gift className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold font-serif text-slate-900">
                Kora Kakawete Nshya
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Itsinda Dufatanye VJN
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Izina ry'Itsinda cyangwa Igikorwa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KAKAWETE Y'ITSINDA DUFATANYE VJN"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Your Name (Organizer) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bosco"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    4-Digit Admin PIN *
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="e.g. 1234"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Exchange Date
                  </label>
                  <input
                    type="date"
                    value={exchangeDate}
                    onChange={(e) => setExchangeDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[48px] py-3 px-4 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.98] text-white font-semibold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Creating Group...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Create Secret Santa Event</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Step: Success Screen */
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
              <Check className="w-7 h-7 stroke-[2.5]" />
            </div>

            <h2 className="text-2xl font-bold font-serif text-slate-900">
              Event Created!
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
              Your Secret Santa group is ready. Invite participants to enter their names.
            </p>

            <div className="my-5 p-4 bg-emerald-50 rounded-2xl border border-emerald-200/80">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-800">
                Event Code
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-950 mt-0.5 tracking-wider">
                {createdCode}
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleCopyCode}
                className="w-full min-h-[44px] py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copiedCode ? 'Code Copied!' : 'Copy Event Code'}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full min-h-[44px] py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Invitation Link'}</span>
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="w-full min-h-[46px] py-2.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-900/10"
              >
                <Share2 className="w-4 h-4" />
                <span>Share on WhatsApp</span>
              </button>

              <div className="pt-3">
                <button
                  onClick={() => onCreated(createdCode, createdAdminToken)}
                  className="w-full min-h-[48px] py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-semibold text-sm transition-all"
                >
                  Go to Group Dashboard →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
