import React, { useState, useEffect } from 'react';
import {
  Users,
  Shuffle,
  Eye,
  EyeOff,
  UserPlus,
  Trash2,
  Copy,
  Check,
  Share2,
  QrCode,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';
import type { AdminEventView, Participant } from '../types';
import { QRCodeModal } from './QRCodeModal';

interface OrganizerDashboardProps {
  eventCode: string;
  adminToken: string;
  onLogout: () => void;
  onViewAsParticipant?: (token: string) => void;
  onCreateNewEvent?: () => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  eventCode,
  adminToken,
  onLogout,
  onViewAsParticipant,
  onCreateNewEvent,
}) => {
  const [data, setData] = useState<AdminEventView | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Quick Single Name Input
  const [quickName, setQuickName] = useState('');
  // Batch Add Names Modal / Input
  const [showBatchAdd, setShowBatchAdd] = useState(false);
  const [batchNamesText, setBatchNamesText] = useState('');

  const [showQRModal, setShowQRModal] = useState(false);

  // Copy states
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setError('');
      const res = await api.getAdminDashboard(eventCode, adminToken);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [eventCode, adminToken]);

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/join/${eventCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyParticipantToken = (p: Participant) => {
    const privateUrl = `${window.location.origin}/event/${eventCode}/my-secret/${p.secretToken}`;
    navigator.clipboard.writeText(privateUrl);
    setCopiedTokenId(p.id);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  const handleSendWhatsAppToParticipant = (p: Participant) => {
    if (!data) return;
    const privateUrl = `${window.location.origin}/event/${eventCode}/my-secret/${p.secretToken}`;
    const text = `🎁 Hello ${p.name}!\n\nLink yawe ya Kakawete muri *${data.event.title}* iriteguye:\n${privateUrl}\n\n🤫 Zirikana kugira ibanga uwo uzaha impano!`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleQuickAddName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    setActionLoading(true);
    try {
      await api.adminAddParticipant(eventCode, adminToken, quickName.trim());
      setQuickName('');
      setNotice(`Added ${quickName.trim()}`);
      await loadDashboard();
    } catch (err: any) {
      setError(err.message || 'Failed to add participant');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const names = batchNamesText
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (names.length === 0) return;

    setActionLoading(true);
    try {
      await api.adminBatchAddParticipants(eventCode, adminToken, names);
      setBatchNamesText('');
      setShowBatchAdd(false);
      setNotice(`Added ${names.length} participants!`);
      await loadDashboard();
    } catch (err: any) {
      setError(err.message || 'Failed to add participants');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteParticipant = async (id: string, name: string) => {
    if (!window.confirm(`Remove ${name} from Secret Santa?`)) return;

    setActionLoading(true);
    try {
      await api.adminDeleteParticipant(eventCode, adminToken, id);
      setNotice(`${name} removed.`);
      await loadDashboard();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDrawSecretSanta = async () => {
    if (!data) return;
    if (data.participants.length < 3) {
      setError('You need at least 3 names to perform the draw.');
      return;
    }

    if (!window.confirm(`Draw names for all ${data.participants.length} participants?`)) {
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      const res = await api.executeDraw(eventCode, adminToken);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0F5132', '#991B1B', '#D97706'],
      });
      setNotice(res.message);
      await loadDashboard();
    } catch (err: any) {
      setError(err.message || 'Draw failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetDraw = async () => {
    if (!window.confirm('Reset the draw? This will clear current assignments.')) return;

    setActionLoading(true);
    try {
      await api.resetDraw(eventCode, adminToken);
      setNotice('Draw reset. You can add or change names.');
      await loadDashboard();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleReveal = async () => {
    if (!data) return;
    const nextState = !data.event.revealIdentities;
    const msg = nextState ? 'Reveal who got whom to all participants?' : 'Hide identities again?';
    if (!window.confirm(msg)) return;

    setActionLoading(true);
    try {
      const res = await api.toggleReveal(eventCode, adminToken);
      if (res.revealIdentities) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      }
      setNotice(res.revealIdentities ? 'Identities revealed!' : 'Identities hidden.');
      await loadDashboard();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-800 animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-600 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold font-serif text-slate-900">Dashboard Unavailable</h2>
        <button
          onClick={onLogout}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const { event, participants } = data;
  const isDrawn = event.status !== 'REGISTRATION';
  const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${event.code}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 pb-24 text-slate-900">
      {notice && (
        <div className="mb-4 p-3 bg-emerald-50 text-emerald-900 text-xs rounded-2xl border border-emerald-200 flex items-center justify-between">
          <span className="font-medium">{notice}</span>
          <button onClick={() => setNotice('')} className="font-bold text-emerald-700 ml-2">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-900 text-xs rounded-2xl border border-rose-200 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold text-rose-700 ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm mb-6">
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
          <span>KODE: <strong className="text-emerald-800">{event.code}</strong></span>
          <span>Amazina {participants.length} Yanditse</span>
        </div>

        <h1 className="text-2xl font-bold font-serif text-slate-900">
          {event.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Yakoporowe!' : 'Koporora Link yo Gutumira'}</span>
          </button>

          <button
            onClick={() => setShowQRModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-700" />
            <span>Kode ya QR</span>
          </button>

          {onCreateNewEvent && (
            <button
              onClick={onCreateNewEvent}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tangiza Indi Kakawete</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="ml-auto px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-medium"
          >
            Sohoka
          </button>
        </div>
      </div>

      {/* Secret Santa Draw Action Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md mb-6 text-center">
        {!isDrawn ? (
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900">
              Gukora Kakawete
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Iyo umaze kwandika amazina yose y'abagize itsinda (nibura abantu 3), kanda hasi kugira ngo amazina akorwe mu ibanga.
            </p>

            <button
              onClick={handleDrawSecretSanta}
              disabled={actionLoading || participants.length < 3}
              className="mt-4 w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-emerald-900/15 disabled:opacity-50 transition-all inline-flex items-center justify-center gap-2"
            >
              <Shuffle className="w-4 h-4 text-amber-300" />
              <span>🎲 KORA KAKAWETE (DRAW NAMES)</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase font-bold text-emerald-800 mb-1">
              ✓ Kakawete Yakozwe Neza!
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Buri munyamuryango yahawe undi agomba guha impano mu ibanga. Oherereza buri wese link ye.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={handleToggleReveal}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {event.revealIdentities ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{event.revealIdentities ? 'Hisha ba Kakawete Nanone' : 'Erekana ba Kakawete Bose'}</span>
              </button>

              <button
                onClick={handleResetDraw}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-200 transition-colors"
              >
                Subiramo Tombola
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Enter Name Section */}
      {!isDrawn && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold font-serif text-slate-900 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-emerald-800" />
              <span>Ongeramo Izina ry'Umunyamuryango</span>
            </h3>
            <button
              onClick={() => setShowBatchAdd(!showBatchAdd)}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold"
            >
              {showBatchAdd ? 'Izina Rimwe' : '+ Shyiramo Amazina Menshi'}
            </button>
          </div>

          {!showBatchAdd ? (
            <form onSubmit={handleQuickAddName} className="flex gap-2">
              <input
                type="text"
                placeholder="Andika izina (urugero Alice) ukande Ongeraho..."
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />
              <button
                type="submit"
                disabled={actionLoading || !quickName.trim()}
                className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-all flex items-center gap-1 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Ongeraho</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleBatchAdd} className="space-y-3">
              <textarea
                rows={3}
                placeholder="Shyiramo amazina atandukanijwe na koma cyangwa umurongo mushya:&#10;Alice, Bosco, Jean, Diane, Patrick"
                value={batchNamesText}
                onChange={(e) => setBatchNamesText(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />
              <button
                type="submit"
                disabled={actionLoading || !batchNamesText.trim()}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                Ongeramo Ayo Mazina Yose
              </button>
            </form>
          )}
        </div>
      )}

      {/* Participants List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold font-serif text-slate-900">
            Abanyamuryango Bari Muri Kakawete ({participants.length})
          </h3>
          <span className="text-xs text-slate-500">
            {isDrawn ? 'Tombola yarangiye' : 'Kwandika birakinguye'}
          </span>
        </div>

        {participants.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Nta mazina arashyirwamo. Andika izina hejuru kugira ngo utangire.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {participants.map((p, idx) => {
              const isCopied = copiedTokenId === p.id;
              return (
                <div
                  key={p.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-900 text-sm">
                      {p.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {onViewAsParticipant && (
                      <button
                        onClick={() => onViewAsParticipant(p.secretToken)}
                        title="Reba ibaruwa ye"
                        className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors inline-flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Reba</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCopyParticipantToken(p)}
                      title="Koporora link ye"
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1 shadow-xs transition-colors"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{isCopied ? 'Yakoporowe' : 'Link'}</span>
                    </button>

                    <button
                      onClick={() => handleSendWhatsAppToParticipant(p)}
                      title="Ohereza kuri WhatsApp"
                      className="p-1.5 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {!isDrawn && (
                      <button
                        onClick={() => handleDeleteParticipant(p.id, p.name)}
                        title="Kuramo izina"
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        url={inviteUrl}
        title={event.title}
        code={event.code}
      />
    </div>
  );
};
