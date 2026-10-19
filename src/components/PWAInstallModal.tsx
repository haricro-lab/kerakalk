import React from 'react';
import { Smartphone, Download, Share, PlusSquare, Check, X, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Zatvori"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-500">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Instaliraj KeraKalk kao Aplikaciju</h3>
            <p className="text-sm text-slate-400">Radi izravno na Vašem Android mobitelu ili iPhoneu</p>
          </div>
        </div>

        {isInstalled ? (
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 mb-4 flex items-center gap-3 text-emerald-300">
            <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-400" />
            <div>
              <p className="font-semibold">Aplikacija je već instalirana!</p>
              <p className="text-xs text-emerald-400/80">
                Pokreće se u punom zaslonu bez preglednika s ikone na početnom zaslonu.
              </p>
            </div>
          </div>
        ) : isInstallable ? (
          <div className="mb-6">
            <p className="text-sm text-slate-300 mb-4">
              Pritiskom na gumb u nastavku instalirajte aplikaciju izravno na uređaj za trenutačno otvaranje i rad na gradilištu.
            </p>
            <button
              onClick={async () => {
                await install();
                onClose();
              }}
              className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition transform active:scale-98"
            >
              <Download className="w-5 h-5" />
              Instaliraj Aplikaciju na Uređaj
            </button>
          </div>
        ) : null}

        {/* Tabbed / Side-by-side guide for iPhone & Android */}
        <div className="space-y-4">
          <div className="border border-slate-800 bg-slate-800/40 rounded-xl p-4">
            <div className="flex items-center gap-2 text-orange-400 font-semibold mb-2">
              <Share className="w-4 h-4" />
              <span>Upute za iPhone & iPad (Apple iOS Safari):</span>
            </div>
            <ol className="text-sm text-slate-300 space-y-2.5 list-decimal list-inside pl-1">
              <li>
                Otvorite ovu stranicu u pregledniku <strong>Safari</strong> na iPhoneu.
              </li>
              <li>
                Dodirnite ikonu <strong>Dijeli (Share)</strong>{' '}
                <span className="inline-block px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs text-blue-400">
                  kvadrat sa strelicom prema gore
                </span>{' '}
                pri dnu ekrana.
              </li>
              <li>
                U izborniku pronađite i odaberite opciju{' '}
                <strong className="text-white">"Dodaj na početni zaslon" (Add to Home Screen)</strong>.
              </li>
              <li>
                Dodirnite <strong>"Dodaj" (Add)</strong> u gornjem desnom kutu.
              </li>
            </ol>
          </div>

          <div className="border border-slate-800 bg-slate-800/40 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
              <Smartphone className="w-4 h-4" />
              <span>Upute za Android (Google Chrome / Samsung Internet):</span>
            </div>
            <ol className="text-sm text-slate-300 space-y-2.5 list-decimal list-inside pl-1">
              <li>
                Otvorite stranicu u <strong>Chrome</strong> pregledniku.
              </li>
              <li>
                Dodirnite izbornik s <strong>tri točkice (⋮)</strong> u gornjem desnom kutu.
              </li>
              <li>
                Odaberite <strong className="text-white">"Instaliraj aplikaciju"</strong> ili{' '}
                <strong className="text-white">"Dodaj na početni zaslon"</strong>.
              </li>
              <li>Potvrdite instalaciju i KeraKalk ikona će se pojaviti među Vašim aplikacijama.</li>
            </ol>
          </div>
        </div>

        {/* Features banner */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Bez preuzimanja s App Storea</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Zauzima manje od 5 MB memorije</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Brzi rad bez čekanja</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Automatsko spremanje ponuda</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition"
        >
          Zatvori
        </button>
      </div>
    </div>
  );
};
