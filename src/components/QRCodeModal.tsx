import React, { useState } from 'react';
import { X, Copy, Check, Share2, Smartphone } from 'lucide-react';

interface QRCodeModalProps {
  url: string;
  title: string;
  code: string;
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ url, title, code, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Google Chart API provides a reliable, high-res static QR code SVG/PNG
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&color=0F5132&bgcolor=FFFFFF&data=${encodeURIComponent(url)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 mb-3">
          <Smartphone className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 font-serif">Sikana (Scan) Winjire</h3>
        <p className="text-sm text-slate-600 mt-1">{title}</p>

        <div className="my-5 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/80 inline-block shadow-inner">
          <img
            src={qrImageUrl}
            alt={`QR code for ${code}`}
            className="w-56 h-56 mx-auto rounded-xl object-contain bg-white p-2 shadow-sm"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="bg-slate-50 rounded-xl p-3 mb-4 text-xs font-mono text-slate-700 flex items-center justify-between border border-slate-200">
          <span className="font-bold text-emerald-900">Kode: {code}</span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-sans font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Yakoporowe' : 'Koporora Link'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm transition-all"
        >
          Birasohotse
        </button>
      </div>
    </div>
  );
};
