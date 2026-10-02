import React, { useState } from 'react';
import { X, Shield, KeyRound, ArrowRight } from 'lucide-react';
import { api } from '../api';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventCode: string;
  onSuccess: (adminToken: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  eventCode,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.adminLogin(eventCode, pin.trim());
      onSuccess(res.adminToken);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Incorrect PIN. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 mb-3">
          <Shield className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold font-serif text-slate-900">
          Kwinjira nk'Umuyobozi
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Shyiramo PIN yawe y'imibare 4 yo gucunga itsinda <strong>{eventCode}</strong>.
        </p>

        {error && (
          <div className="mt-3 p-2.5 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <input
              type="password"
              autoFocus
              maxLength={8}
              placeholder="Shyiramo PIN (urugero 1234)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center text-xl tracking-widest font-mono py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !pin.trim()}
            className="w-full min-h-[46px] py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Kugenzura...' : 'Fungura Ibiro'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-4 text-[11px] text-slate-400">
          PIN y'icyitegererezo cy'itsinda ni: <code className="font-mono font-bold text-slate-700">1234</code>.
        </p>
      </div>
    </div>
  );
};
