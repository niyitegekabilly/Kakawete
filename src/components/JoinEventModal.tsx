import React, { useState } from 'react';
import { X, Search, ArrowRight, Sparkles, KeyRound } from 'lucide-react';

interface JoinEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinCode: (code: string) => void;
  onSecretToken: (code: string, token: string) => void;
}

export const JoinEventModal: React.FC<JoinEventModalProps> = ({
  isOpen,
  onClose,
  onJoinCode,
  onSecretToken,
}) => {
  const [tab, setTab] = useState<'code' | 'token'>('code');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (tab === 'code') {
      const cleanCode = code.trim().toUpperCase();
      if (!cleanCode) {
        setError('Please enter an event code.');
        return;
      }
      onJoinCode(cleanCode);
    } else {
      const cleanCode = code.trim().toUpperCase();
      const cleanToken = token.trim();
      if (!cleanCode || !cleanToken) {
        setError('Please enter both event code and your secret token.');
        return;
      }
      onSecretToken(cleanCode, cleanToken);
    }
  };

  const handleUseDemo = () => {
    setCode('VJN-XMAS-8K4P');
    onJoinCode('VJN-XMAS-8K4P');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 mb-2">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-900">
            Injira muri Kakawete
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Shyiramo kode y'itsinda cyangwa kode yawe y'ibanga ngo urebe Kakawete yawe.
          </p>
        </div>

        {/* Segmented Tab Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('code')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === 'code' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mfite Kode y'Itsinda
          </button>
          <button
            type="button"
            onClick={() => setTab('token')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              tab === 'token' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mfite Kode y'Ibanga
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Kode y'Itsinda (Event Code)
            </label>
            <input
              type="text"
              placeholder="e.g. VJN-XMAS-8K4P"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
            />
          </div>

          {tab === 'token' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Kode yawe y'Ibanga (Secret Token)
              </label>
              <input
                type="text"
                placeholder="e.g. bosco-token-77a1"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full min-h-[48px] py-3 px-4 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.98] text-white font-semibold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{tab === 'code' ? 'Komeza Winjire' : 'Reba Kakawete Wanjye'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
