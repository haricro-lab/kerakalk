import React, { useState } from 'react';
import {
  X,
  Package,
  Wrench,
  Percent,
  Sliders,
  Droplets,
  Layers,
  Copy,
  Check,
  Calculator,
  Share2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  totalAreaWithWaste: number;
  tileFloorFormat?: string;
  tileWallFormat?: string;
}

export const CraftsmanToolsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  totalAreaWithWaste,
  tileFloorFormat = '60x60 cm',
}) => {
  const [activeTab, setActiveTab] = useState<'boxes' | 'levelers' | 'slope'>('boxes');

  // Box calculator state
  const [m2PerBox, setM2PerBox] = useState<number>(1.44);
  const [tilePricePerM2, setTilePricePerM2] = useState<number>(25.0);
  const [copiedText, setCopiedText] = useState(false);

  // Levelers calculator state
  const [tileFormatType, setTileFormatType] = useState<string>('60x120');

  // Slope calculator state
  const [showerLengthCm, setShowerLengthCm] = useState<number>(120);
  const [slopePercent, setSlopePercent] = useState<number>(1.8);

  if (!isOpen) return null;

  // Box math
  const boxesNeeded = m2PerBox > 0 ? Math.ceil(totalAreaWithWaste / m2PerBox) : 0;
  const totalPurchasedM2 = Number((boxesNeeded * m2PerBox).toFixed(2));
  const surplusM2 = Number((totalPurchasedM2 - totalAreaWithWaste).toFixed(2));
  const estimatedTileCost = Number((totalPurchasedM2 * tilePricePerM2).toFixed(2));

  // Levelers math (spone po m2 ovisno o formatu)
  let clipsPerM2 = 8;
  if (tileFormatType === '60x60') clipsPerM2 = 11;
  else if (tileFormatType === '60x120') clipsPerM2 = 7;
  else if (tileFormatType === '120x120') clipsPerM2 = 5;
  else if (tileFormatType === '30x60') clipsPerM2 = 16;
  else if (tileFormatType === '20x120') clipsPerM2 = 14;

  const totalClipsNeeded = Math.ceil(totalAreaWithWaste * clipsPerM2);
  const recommendedWedges = Math.min(250, Math.ceil(totalClipsNeeded * 0.4)); // Kajle se ponovno koriste

  // Slope math
  const slopeCm = Number(((showerLengthCm * slopePercent) / 100).toFixed(1));

  const copyShoppingNote = () => {
    const text = `📦 SPECIFIKACIJA ZA KUPOVINU KERAMIKE U TRGOVINI 📦

• Neto kvadratura s uračunatim škartom: ${totalAreaWithWaste} m²
• Pakiranje: ${m2PerBox} m² po kutiji
• POTREBNO KUPITI: ${boxesNeeded} punih paketa / kutija
• Ukupno preuzimate: ${totalPurchasedM2} m²
• Čista rezerva / višak nakon rezanja: ${surplusM2} m²
• Procijenjeni trošak pločica (${tilePricePerM2} €/m²): ~${estimatedTileCost} €

Preporuka: Sačuvajte barem 1 cijeli paket pločica za slučaj budućih naknadnih popravaka (ista serija/ton).`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5 border-b border-slate-800 pb-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Majstorski Kalkulatori za Keramičare</h3>
            <p className="text-xs text-slate-400">
              Proračun paketa za trgovinu, nivelatori i pad walk-in tuša
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setActiveTab('boxes')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'boxes'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Kutije za Trgovinu</span>
          </button>

          <button
            onClick={() => setActiveTab('levelers')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'levelers'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Kalkulator Nivelatora</span>
          </button>

          <button
            onClick={() => setActiveTab('slope')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'slope'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span>Pad Walk-in Tuša</span>
          </button>
        </div>

        {/* Tab 1: Box Calculator */}
        {activeTab === 'boxes' && (
          <div className="space-y-4">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Ukupna keramika sa škartom:</label>
                <div className="text-lg font-black text-orange-400 font-mono">
                  {totalAreaWithWaste.toFixed(2)} m²
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kvadratura po kutiji / paketu:</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={m2PerBox}
                    onChange={(e) => setM2PerBox(parseFloat(e.target.value) || 1.44)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white font-bold"
                  />
                  <span className="text-slate-400 font-bold">m²</span>
                </div>
                <div className="flex gap-1 mt-1 text-[10px] text-slate-500">
                  <button onClick={() => setM2PerBox(1.08)} className="hover:text-orange-400 underline">
                    1.08
                  </button>
                  <span>•</span>
                  <button onClick={() => setM2PerBox(1.44)} className="hover:text-orange-400 underline">
                    1.44
                  </button>
                  <span>•</span>
                  <button onClick={() => setM2PerBox(1.8)} className="hover:text-orange-400 underline">
                    1.80
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Cijena pločica u trgovini (€/m²):</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={tilePricePerM2}
                    onChange={(e) => setTilePricePerM2(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white font-bold"
                  />
                  <span className="text-slate-400 font-bold">€</span>
                </div>
              </div>
            </div>

            {/* Result highlights */}
            <div className="bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-slate-900 border border-orange-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-orange-400 tracking-wider">
                    Točna narudžba za klijenta:
                  </span>
                  <div className="text-3xl font-black text-white mt-1">
                    {boxesNeeded} <span className="text-lg font-normal text-slate-300">paketa / kutija</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Preuzeta kvadratura:</span>
                  <span className="text-xl font-bold text-amber-400 font-mono">
                    {totalPurchasedM2} m²
                  </span>
                  <span className="text-[11px] text-emerald-400 block mt-0.5">
                    (višak za rezervu: +{surplusM2} m²)
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span>Ukupni trošak samih pločica za klijenta:</span>
                <strong className="text-base text-white font-mono">~{estimatedTileCost.toFixed(2)} €</strong>
              </div>
            </div>

            <button
              onClick={copyShoppingNote}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Kopirano! Pošaljite klijentu na WhatsApp</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-orange-400" />
                  <span>Kopiraj napomenu za kupovinu keramike</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab 2: Levelers Calculator */}
        {activeTab === 'levelers' && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <label className="block text-slate-300 font-semibold">
                Odaberite format keramike za niveliranje:
              </label>
              <select
                value={tileFormatType}
                onChange={(e) => setTileFormatType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
              >
                <option value="60x120">60x120 cm (veliki format - ~7 spona/m²)</option>
                <option value="60x60">60x60 cm (standard - ~11 spona/m²)</option>
                <option value="120x120">120x120 cm (vrlo veliki - ~5 spona/m²)</option>
                <option value="30x60">30x60 cm (~16 spona/m²)</option>
                <option value="20x120">20x120 cm (imitacija drva / parketa - ~14 spona/m²)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-slate-400 block mb-1">Potrebno spona (jednokratne):</span>
                <div className="text-3xl font-black text-orange-400 font-mono">
                  ~{totalClipsNeeded} <span className="text-sm font-normal text-slate-400">kom</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  (npr. {Math.ceil(totalClipsNeeded / 100)} vrećica od 100 kom)
                </span>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-center">
                <span className="text-slate-400 block mb-1">Preporučeno kajli (višekratne):</span>
                <div className="text-3xl font-black text-amber-400 font-mono">
                  ~{recommendedWedges} <span className="text-sm font-normal text-slate-400">kom</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Kajle se vade idući dan i koriste ponovno
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl text-blue-300 text-[11px]">
              💡 <strong>Savjet za nivelatore:</strong> Kod pločica formata 60x120 cm postavite barem
              2 spone na kraću stranu i 3-4 spone na dužu stranu kako bi se u potpunosti uklonio zub
              između pločica.
            </div>
          </div>
        )}

        {/* Tab 3: Slope Calculator */}
        {activeTab === 'slope' && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Dužina tuša od zida do kanalice (cm):</label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  value={showerLengthCm}
                  onChange={(e) => setShowerLengthCm(parseFloat(e.target.value) || 120)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Željeni pad (%):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1.2"
                    max="2.5"
                    step="0.1"
                    value={slopePercent}
                    onChange={(e) => setSlopePercent(parseFloat(e.target.value))}
                    className="flex-1 accent-orange-600"
                  />
                  <span className="text-sm font-bold text-white w-12 text-right">
                    {slopePercent}%
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">Preporuka struke: 1.5% do 2.0%</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-sky-950/40 via-blue-950/30 to-slate-900 border border-sky-500/30 rounded-2xl p-5 text-center space-y-2">
              <span className="text-xs uppercase font-bold text-sky-400 tracking-wider">
                Potrebna visinska razlika (pad prema kanalici):
              </span>
              <div className="text-4xl font-black text-white font-mono">
                {slopeCm} <span className="text-xl font-normal text-slate-300">cm</span>
              </div>
              <p className="text-[11px] text-slate-300 max-w-md mx-auto">
                Na dužini od {showerLengthCm} cm, početak tuša mora biti točno{' '}
                <strong className="text-sky-300">{slopeCm} cm viši</strong> od nivoa gornjeg ruba
                kanalice kako bi voda nesmetano otjecala bez zadržavanja.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
        >
          Zatvori
        </button>
      </div>
    </div>
  );
};
