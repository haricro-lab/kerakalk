import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  Eye,
  Trash2,
  Copy,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Offer, OfferStatus } from '../types';

interface Props {
  offers: Offer[];
  onSelectOffer: (offer: Offer) => void;
  onPreviewOffer: (offer: Offer) => void;
  onNewOffer: () => void;
  onDuplicateOffer: (offer: Offer) => void;
  onDeleteOffer: (offerId: string) => void;
  onScanSketch: () => void;
}

export const OffersList: React.FC<Props> = ({
  offers,
  onSelectOffer,
  onPreviewOffer,
  onNewOffer,
  onDuplicateOffer,
  onDeleteOffer,
  onScanSketch,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOffers = offers.filter((o) => {
    const matchesSearch =
      o.client.name.toLowerCase().includes(search.toLowerCase()) ||
      o.projectName.toLowerCase().includes(search.toLowerCase()) ||
      o.offerNumber.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalValue = offers.reduce((acc, curr) => acc + (curr.totals?.grandTotal || 0), 0);
  const acceptedValue = offers
    .filter((o) => o.status === 'accepted' || o.status === 'completed')
    .reduce((acc, curr) => acc + (curr.totals?.grandTotal || 0), 0);

  const getStatusBadge = (status: OfferStatus) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-3 h-3" />
            Prihvaćeno
          </span>
        );
      case 'sent':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-500/40">
            <Send className="w-3 h-3" />
            Poslano
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40">
            <CheckCircle2 className="w-3 h-3" />
            Završeno
          </span>
        );
      case 'declined':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-500/40">
            <XCircle className="w-3 h-3" />
            Odbijeno
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/40">
            <Clock className="w-3 h-3" />
            U izradi
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Metric summary banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Ukupno ponuda</span>
            <span className="text-3xl font-black text-white">{offers.length}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Svi projekti u bazi</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Vrijednost prihvaćenih</span>
            <span className="text-3xl font-black text-emerald-400">
              {acceptedValue.toFixed(2)} €
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Ugovoreni radovi</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Ukupno izračunato</span>
            <span className="text-3xl font-black text-amber-400">
              {totalValue.toFixed(2)} €
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Ukupan pipeline</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action / Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pretraži po klijentu, projektu ili broju..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="all">Svi statusi</option>
            <option value="draft">U izradi</option>
            <option value="sent">Poslano</option>
            <option value="accepted">Prihvaćeno</option>
            <option value="completed">Završeno</option>
            <option value="declined">Odbijeno</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onScanSketch}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-orange-400 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Skener Skice</span>
          </button>

          <button
            onClick={onNewOffer}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-600/30 transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Ponuda</span>
          </button>
        </div>
      </div>

      {/* Offers Cards / List */}
      {filteredOffers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOffers.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-orange-500/40 rounded-2xl p-5 shadow-lg transition flex flex-col justify-between group space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-orange-400 bg-orange-950/60 border border-orange-500/30 px-2 py-0.5 rounded">
                    {item.offerNumber}
                  </span>
                  {getStatusBadge(item.status)}
                </div>

                <h3 className="font-bold text-base text-white group-hover:text-orange-400 transition line-clamp-1">
                  {item.projectName || 'Keramičarski radovi'}
                </h3>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">
                  Klijent: {item.client.name || 'Neimenovani klijent'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lokacija: {item.client.projectLocation || 'Nije navedena'}
                </p>

                {/* Rooms and areas */}
                <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Ukupno keramike:</span>
                    <strong className="text-white text-sm">
                      {item.totals.totalNetArea.toFixed(1)} m²
                    </strong>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 block text-[10px]">Sa škartom (+10%):</span>
                    <strong className="text-amber-400 text-sm">
                      {item.totals.totalAreaWithWaste.toFixed(1)} m²
                    </strong>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Prostorije: {item.rooms.length}</span>
                  <span>Datum: {item.dateCreated}</span>
                </div>
              </div>

              {/* Card Footer: Price & Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">
                    Iznos ponude:
                  </span>
                  <span className="text-xl font-black text-orange-400">
                    {item.totals.grandTotal.toFixed(2)} €
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onPreviewOffer(item)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Pregled & Preuzmi PDF"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDuplicateOffer(item)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Dupliciraj ponudu"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelectOffer(item)}
                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition"
                  >
                    Uredi
                  </button>
                  <button
                    onClick={() => onDeleteOffer(item.id)}
                    className="p-2 rounded-lg hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition"
                    title="Obriši"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Nema pronađenih ponuda</h4>
            <p className="text-xs text-slate-400 mt-1">
              {search || filterStatus !== 'all'
                ? 'Nijedna ponuda ne odgovara filterima pretrage.'
                : 'Započnite izradu svoje prve ponude ili učitajte skicu s AI skenerom.'}
            </p>
          </div>
          <button
            onClick={onNewOffer}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            <span>Kreiraj Prvu Ponudu</span>
          </button>
        </div>
      )}
    </div>
  );
};
