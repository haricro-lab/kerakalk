import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  FileCheck,
  Calculator,
  Layers,
  Sparkles,
  Percent,
  Check,
  AlertCircle,
  HelpCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Droplets,
  Ruler,
  Maximize2,
  Boxes,
  Package,
} from 'lucide-react';
import { Offer, Room, PricingSettings, CraftsmanProfile, RoomItem } from '../types';
import { calculateOfferTotals, createDefaultRoom, recalculateRoomGeometry } from '../utils/calculations';
import { CraftsmanToolsModal } from './CraftsmanToolsModal';
import { Wrench } from 'lucide-react';

interface Props {
  offer: Offer;
  pricing: PricingSettings;
  profile: CraftsmanProfile;
  onSaveOffer: (offer: Offer) => void;
  onPreviewOffer: (offer: Offer) => void;
  onScanSketch: () => void;
}

export const OfferEditor: React.FC<Props> = ({
  offer: initialOffer,
  pricing,
  profile,
  onSaveOffer,
  onPreviewOffer,
  onScanSketch,
}) => {
  const [offer, setOffer] = useState<Offer>(initialOffer);
  const [activeRoomId, setActiveRoomId] = useState<string>(
    initialOffer.rooms[0]?.id || ''
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);

  // Recalculate totals whenever rooms or offer settings change
  useEffect(() => {
    const updatedTotals = calculateOfferTotals(
      offer.rooms,
      pricing,
      profile,
      offer.wasteMarginPercent,
      offer.includeMaterials,
      offer.discountPercent
    );

    setOffer((prev) => ({
      ...prev,
      totals: updatedTotals,
    }));
  }, [
    offer.rooms,
    offer.wasteMarginPercent,
    offer.includeMaterials,
    offer.discountPercent,
    pricing,
    profile,
  ]);

  const handleClientChange = (field: keyof Offer['client'], value: string) => {
    setOffer((prev) => ({
      ...prev,
      client: {
        ...prev.client,
        [field]: value,
      },
    }));
  };

  const handleAddRoom = (presetName = 'Kupaonica') => {
    const newRoom = createDefaultRoom(presetName);
    setOffer((prev) => ({
      ...prev,
      rooms: [...prev.rooms, newRoom],
    }));
    setActiveRoomId(newRoom.id);
  };

  const handleRemoveRoom = (roomId: string) => {
    if (offer.rooms.length <= 1) {
      alert('Ponuda mora sadržavati barem jednu prostoriju.');
      return;
    }
    const remaining = offer.rooms.filter((r) => r.id !== roomId);
    setOffer((prev) => ({
      ...prev,
      rooms: remaining,
    }));
    if (activeRoomId === roomId) {
      setActiveRoomId(remaining[0].id);
    }
  };

  const handleUpdateRoom = (roomId: string, updates: Partial<Room>) => {
    setOffer((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) => {
        if (room.id !== roomId) return room;
        const modified = { ...room, ...updates };
        return recalculateRoomGeometry(modified);
      }),
    }));
  };

  const handleAddCustomItem = (roomId: string) => {
    const newItem: RoomItem = {
      id: `item-${Date.now()}`,
      name: 'Bušenje rupa za sanitarije / slavine',
      quantity: 4,
      unit: 'kom',
      pricePerUnit: pricing.drillHoleTile || 6.0,
      total: 24.0,
    };

    setOffer((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) => {
        if (room.id !== roomId) return room;
        const items = [...(room.customItems || []), newItem];
        return { ...room, customItems: items };
      }),
    }));
  };

  const handleRemoveCustomItem = (roomId: string, itemId: string) => {
    setOffer((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          customItems: (room.customItems || []).filter((i) => i.id !== itemId),
        };
      }),
    }));
  };

  const handleSave = () => {
    onSaveOffer(offer);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const activeRoom = offer.rooms.find((r) => r.id === activeRoomId) || offer.rooms[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              Kalkulator & Ponuda: {offer.offerNumber}
            </h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                offer.status === 'accepted'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                  : offer.status === 'sent'
                  ? 'bg-blue-950 text-blue-400 border border-blue-500/40'
                  : 'bg-amber-950 text-amber-400 border border-amber-500/40'
              }`}
            >
              {offer.status === 'accepted'
                ? 'Prihvaćeno'
                : offer.status === 'sent'
                ? 'Poslano'
                : 'U izradi'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Upišite dimenzije i odaberite stavke rada. Izračun kvadrata i troškova je automatski u
            realnom vremenu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onScanSketch}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-700 text-xs sm:text-sm font-semibold transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Skener Skice</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs sm:text-sm font-semibold transition"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Spremljeno!</span>
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4 text-slate-300" />
                <span>Spremi</span>
              </>
            )}
          </button>

          <button
            onClick={() => onPreviewOffer(offer)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-600/30 transition transform active:scale-95"
            title="Pregled ponude i preuzimanje u PDF formatu"
          >
            <Eye className="w-4 h-4" />
            <span>Pregled & PDF</span>
          </button>
        </div>
      </div>

      {/* Client & Project Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <span>Podaci o Naručitelju & Projektu</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Ime i prezime klijenta:
            </label>
            <input
              type="text"
              value={offer.client.name}
              onChange={(e) => handleClientChange('name', e.target.value)}
              placeholder="Npr. Ivan Horvat"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Broj telefona / mobitela:
            </label>
            <input
              type="text"
              value={offer.client.phone}
              onChange={(e) => handleClientChange('phone', e.target.value)}
              placeholder="Npr. 091 234 5678"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Adresa & Grad izvođenja:
            </label>
            <input
              type="text"
              value={offer.client.projectLocation}
              onChange={(e) => handleClientChange('projectLocation', e.target.value)}
              placeholder="Npr. Dubrava 45, Zagreb"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Naziv projekta / radova:
            </label>
            <input
              type="text"
              value={offer.projectName}
              onChange={(e) => setOffer((prev) => ({ ...prev, projectName: e.target.value }))}
              placeholder="Npr. Adaptacija kupaonice"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Broj ponude:
            </label>
            <input
              type="text"
              value={offer.offerNumber}
              onChange={(e) => setOffer((prev) => ({ ...prev, offerNumber: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Datum izdavanja:
            </label>
            <input
              type="date"
              value={offer.dateCreated}
              onChange={(e) => setOffer((prev) => ({ ...prev, dateCreated: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Vrijedi do:
            </label>
            <input
              type="date"
              value={offer.validUntil}
              onChange={(e) => setOffer((prev) => ({ ...prev, validUntil: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
            />
          </div>
        </div>
      </div>

      {/* Room Tabs & Switcher */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {offer.rooms.map((room, idx) => {
              const isActive = room.id === activeRoom.id;
              const roomArea = (room.floorArea + room.wallAreaNet).toFixed(1);
              return (
                <button
                  key={room.id}
                  onClick={() => setActiveRoomId(room.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>{room.name || `Prostorija ${idx + 1}`}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-orange-800/80 text-orange-200' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {roomArea} m²
                  </span>
                </button>
              );
            })}
          </div>

          {/* Add Room Dropdown / Quick presets */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleAddRoom('Kupaonica')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-orange-400" />
              <span>+ Kupaonica</span>
            </button>
            <button
              onClick={() => handleAddRoom('Kuhinja')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-orange-400" />
              <span>+ Kuhinja</span>
            </button>
            <button
              onClick={() => handleAddRoom('Terasa / Balkon')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-orange-400" />
              <span>+ Terasa</span>
            </button>
            <button
              onClick={() => handleAddRoom('Hodnik')}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-orange-400" />
              <span>+ Hodnik</span>
            </button>
          </div>
        </div>

        {/* Active Room Editor Card */}
        {activeRoom && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            {/* Room Header & Name */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={activeRoom.name}
                  onChange={(e) => handleUpdateRoom(activeRoom.id, { name: e.target.value })}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-base sm:text-lg font-bold text-white focus:outline-none focus:border-orange-500"
                />
                <span className="text-xs text-slate-400">
                  Sveukupno keramike u prostoriji:{' '}
                  <strong className="text-orange-400 font-bold">
                    {(activeRoom.floorArea + activeRoom.wallAreaNet).toFixed(2)} m²
                  </strong>
                </span>
              </div>

              {offer.rooms.length > 1 && (
                <button
                  onClick={() => handleRemoveRoom(activeRoom.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-xs font-medium border border-rose-800/40 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Obriši prostoriju</span>
                </button>
              )}
            </div>

            {/* Geometry Grid: Floor & Walls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Floor Dimensions */}
              <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-orange-400" />
                    Podne dimenzije (m²)
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-950/80 text-orange-300 border border-orange-500/30">
                    Pod: {activeRoom.floorArea.toFixed(2)} m²
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Dužina (m):</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={activeRoom.floorLength || ''}
                      onChange={(e) =>
                        handleUpdateRoom(activeRoom.id, { floorLength: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Širina (m):</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={activeRoom.floorWidth || ''}
                      onChange={(e) =>
                        handleUpdateRoom(activeRoom.id, { floorWidth: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Ručni m² (ako je nepravilan):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={activeRoom.floorArea || ''}
                      onChange={(e) =>
                        handleUpdateRoom(activeRoom.id, { floorArea: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-orange-400 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Format podnih pločica:</label>
                  <input
                    type="text"
                    value={activeRoom.tileFloorFormat}
                    onChange={(e) => handleUpdateRoom(activeRoom.id, { tileFloorFormat: e.target.value })}
                    placeholder="Npr. 60x60 cm protuklizne R10"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Wall Dimensions & Openings */}
              <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-orange-400" />
                    Zidovi & Odbici otvora (Neto m²)
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-950/80 text-orange-300 border border-orange-500/30">
                    Neto Zid: {activeRoom.wallAreaNet.toFixed(2)} m²
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Visina opločenja (m):</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={activeRoom.wallHeight || ''}
                      onChange={(e) =>
                        handleUpdateRoom(activeRoom.id, { wallHeight: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Opseg zidova (m'):</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={activeRoom.wallPerimeter || ''}
                      onChange={(e) =>
                        handleUpdateRoom(activeRoom.id, { wallPerimeter: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Vrata (odbici):</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        value={activeRoom.doorCount}
                        onChange={(e) =>
                          handleUpdateRoom(activeRoom.id, { doorCount: parseInt(e.target.value) || 0 })
                        }
                        className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white text-center"
                        title="Broj vrata"
                      />
                      <span className="text-[11px] text-slate-400">kom (80x200)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Format zidnih pločica:</label>
                    <input
                      type="text"
                      value={activeRoom.tileWallFormat}
                      onChange={(e) => handleUpdateRoom(activeRoom.id, { tileWallFormat: e.target.value })}
                      placeholder="Npr. 60x120 cm polirani gres"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Tip slaganja / cijene rada:</label>
                    <select
                      value={activeRoom.tileType}
                      onChange={(e) =>
                        handleUpdateRoom(activeRoom.id, { tileType: e.target.value as any })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="standard">Standard (30x60, 60x60) - {pricing.tileFloorStandard} €/m²</option>
                      <option value="large_format">Veliki format (60x120+) - {pricing.tileLargeFormat} €/m²</option>
                      <option value="mosaic">Mozaik pločice - {pricing.tileMosaic} €/m²</option>
                      <option value="herringbone">Riblja kost (Herringbone) - {pricing.tileHerringbone} €/m²</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Special tasks checklist for tilers */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Dodatne keramičarske stavke i obrade:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. Hidroizolacija */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeRoom.applyWaterproofing}
                      onChange={(e) =>
                        handleUpdateRoom(activeRoom.id, { applyWaterproofing: e.target.checked })
                      }
                      className="w-4 h-4 text-orange-600 rounded bg-slate-800 border-slate-700"
                    />
                    <span className="text-xs font-bold text-white">
                      Hidroizolacija (2 ruke) ({pricing.waterproofing} €/m²)
                    </span>
                  </label>
                  {activeRoom.applyWaterproofing && (
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Kvadratura (m²):</span>
                        <input
                          type="number"
                          step="0.5"
                          value={activeRoom.waterproofingArea || ''}
                          onChange={(e) =>
                            handleUpdateRoom(activeRoom.id, {
                              waterproofingArea: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block">Brtvena traka (m'):</span>
                        <input
                          type="number"
                          step="0.5"
                          value={activeRoom.waterproofingTapeMeters || ''}
                          onChange={(e) =>
                            handleUpdateRoom(activeRoom.id, {
                              waterproofingTapeMeters: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Gerung 45° */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      Gerung brušenje na 45° ({pricing.mitreCut45} €/m')
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">
                      Dužni metri brušenja (niše, geberit, špalete):
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={activeRoom.mitreCut45Meters || ''}
                      onChange={(e) =>
                        handleUpdateRoom(activeRoom.id, {
                          mitreCut45Meters: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white mt-1"
                    />
                  </div>
                </div>

                {/* 3. Sokl / lajsne */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      Sokl / podne lajsne ({pricing.skirting} €/m')
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">
                      Dužina sokla u metrima (m'):
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={activeRoom.skirtingMeters || ''}
                      onChange={(e) =>
                        handleUpdateRoom(activeRoom.id, {
                          skirtingMeters: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white mt-1"
                    />
                  </div>
                </div>

                {/* 4. Silikoniranje */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeRoom.applySiliconing}
                      onChange={(e) =>
                        handleUpdateRoom(activeRoom.id, { applySiliconing: e.target.checked })
                      }
                      className="w-4 h-4 text-orange-600 rounded bg-slate-800 border-slate-700"
                    />
                    <span className="text-xs font-bold text-white">
                      Sanitarno silikoniranje ({pricing.siliconing} €/m')
                    </span>
                  </label>
                  {activeRoom.applySiliconing && (
                    <div>
                      <span className="text-[11px] text-slate-400 block">Dužni metri silikona:</span>
                      <input
                        type="number"
                        step="0.5"
                        value={activeRoom.siliconMeters || ''}
                        onChange={(e) =>
                          handleUpdateRoom(activeRoom.id, {
                            siliconMeters: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white mt-1"
                      />
                    </div>
                  )}
                </div>

                {/* 5. Niveliranje / priprema */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeRoom.applyFloorLeveling}
                      onChange={(e) =>
                        handleUpdateRoom(activeRoom.id, { applyFloorLeveling: e.target.checked })
                      }
                      className="w-4 h-4 text-orange-600 rounded bg-slate-800 border-slate-700"
                    />
                    <span className="text-xs font-bold text-white">
                      Nivelir masa / priprema ({pricing.floorLeveling} €/m²)
                    </span>
                  </label>
                  {activeRoom.applyFloorLeveling && (
                    <div>
                      <span className="text-[11px] text-slate-400 block">Površina za niveliranje (m²):</span>
                      <input
                        type="number"
                        step="0.5"
                        value={activeRoom.floorLevelingArea || activeRoom.floorArea}
                        onChange={(e) =>
                          handleUpdateRoom(activeRoom.id, {
                            floorLevelingArea: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white mt-1"
                      />
                    </div>
                  )}
                </div>

                {/* 6. Štemanje starih pločica */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeRoom.removeOldTiles}
                      onChange={(e) =>
                        handleUpdateRoom(activeRoom.id, { removeOldTiles: e.target.checked })
                      }
                      className="w-4 h-4 text-orange-600 rounded bg-slate-800 border-slate-700"
                    />
                    <span className="text-xs font-bold text-white">
                      Štemanje i skidanje pločica ({pricing.oldTileRemoval} €/m²)
                    </span>
                  </label>
                  {activeRoom.removeOldTiles && (
                    <div>
                      <span className="text-[11px] text-slate-400 block">Površina za štemanje (m²):</span>
                      <input
                        type="number"
                        step="0.5"
                        value={activeRoom.removeOldTilesArea || activeRoom.floorArea + activeRoom.wallAreaNet}
                        onChange={(e) =>
                          handleUpdateRoom(activeRoom.id, {
                            removeOldTilesArea: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white mt-1"
                      />
                    </div>
                  )}
                </div>

                {/* 7. Geberit kutija */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      Geberit vodokotlić ({pricing.geberitBoxEnclosure} €/kom)
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Broj ugradbenih vodokotlića:</span>
                    <input
                      type="number"
                      min="0"
                      value={activeRoom.geberitCount}
                      onChange={(e) =>
                        handleUpdateRoom(activeRoom.id, { geberitCount: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white mt-1"
                    />
                  </div>
                </div>

                {/* 8. Niša u zidu */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      Izrada i opločenje niše ({pricing.nicheCrafting} €/kom)
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Broj zidnih niša za kozmetiku:</span>
                    <input
                      type="number"
                      min="0"
                      value={activeRoom.nicheCount}
                      onChange={(e) =>
                        handleUpdateRoom(activeRoom.id, { nicheCount: parseInt(e.target.value) || 0 })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white mt-1"
                    />
                  </div>
                </div>

                {/* 9. Walk-in tuš pad & kanalica */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeRoom.hasWalkInShower}
                      onChange={(e) =>
                        handleUpdateRoom(activeRoom.id, { hasWalkInShower: e.target.checked })
                      }
                      className="w-4 h-4 text-orange-600 rounded bg-slate-800 border-slate-700"
                    />
                    <span className="text-xs font-bold text-white">
                      Walk-in tuš pad & kanalica ({pricing.walkInSlopeChannel} €)
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Uključuje koso rezanje keramike prema kanalici i brtvljenje.
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Extra Items */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Proizvoljne dodatne stavke za ovu prostoriju:
                </span>
                <button
                  onClick={() => handleAddCustomItem(activeRoom.id)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-orange-400 text-xs font-semibold flex items-center gap-1 border border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dodaj stavku</span>
                </button>
              </div>

              {activeRoom.customItems && activeRoom.customItems.length > 0 ? (
                <div className="space-y-2">
                  {activeRoom.customItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800 text-xs"
                    >
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const updated = activeRoom.customItems.map((i) =>
                            i.id === item.id ? { ...i, name: e.target.value } : i
                          );
                          handleUpdateRoom(activeRoom.id, { customItems: updated });
                        }}
                        className="flex-1 min-w-[200px] bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-white"
                        placeholder="Naziv stavke"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          value={item.quantity}
                          onChange={(e) => {
                            const qty = parseFloat(e.target.value) || 0;
                            const updated = activeRoom.customItems.map((i) =>
                              i.id === item.id
                                ? { ...i, quantity: qty, total: qty * i.pricePerUnit }
                                : i
                            );
                            handleUpdateRoom(activeRoom.id, { customItems: updated });
                          }}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-center"
                        />
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => {
                            const updated = activeRoom.customItems.map((i) =>
                              i.id === item.id ? { ...i, unit: e.target.value } : i
                            );
                            handleUpdateRoom(activeRoom.id, { customItems: updated });
                          }}
                          className="w-14 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-center"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">×</span>
                        <input
                          type="number"
                          step="0.5"
                          value={item.pricePerUnit}
                          onChange={(e) => {
                            const price = parseFloat(e.target.value) || 0;
                            const updated = activeRoom.customItems.map((i) =>
                              i.id === item.id
                                ? { ...i, pricePerUnit: price, total: price * i.quantity }
                                : i
                            );
                            handleUpdateRoom(activeRoom.id, { customItems: updated });
                          }}
                          className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-right"
                        />
                        <span className="text-slate-400">€ =</span>
                        <strong className="text-orange-400 w-16 text-right">
                          {((item.quantity || 0) * (item.pricePerUnit || 0)).toFixed(2)} €
                        </strong>
                      </div>
                      <button
                        onClick={() => handleRemoveCustomItem(activeRoom.id, item.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Nema dodatnih stavki. Kliknite "Dodaj stavku" za specifične radove poput montaže
                  aluminijskih profila, postavljanja pragova ili dekorativnih mozaik traka.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Global Offer Parameters & Materials breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Global parameters & Notes (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span>Uvjeti ponude, škart & popust</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Postotak škarta / otpada pločica (%):
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={offer.wasteMarginPercent}
                onChange={(e) =>
                  setOffer((prev) => ({
                    ...prev,
                    wasteMarginPercent: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Standard je 10% (za veće formate i riblju kost 15%)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Popust za klijenta (%):
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={offer.discountPercent}
                onChange={(e) =>
                  setOffer((prev) => ({
                    ...prev,
                    discountPercent: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Uračunaj trošak materijala:
              </label>
              <label className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={offer.includeMaterials}
                  onChange={(e) =>
                    setOffer((prev) => ({
                      ...prev,
                      includeMaterials: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-orange-600 rounded bg-slate-900 border-slate-600"
                />
                <span className="text-xs text-slate-200">
                  {offer.includeMaterials ? 'Materijal uključen u cijenu' : 'Samo rad majstora'}
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Uvjeti plaćanja i rokovi:
              </label>
              <input
                type="text"
                value={offer.paymentTerms}
                onChange={(e) => setOffer((prev) => ({ ...prev, paymentTerms: e.target.value }))}
                placeholder="Npr. Avans 30% prije početka radova, 70% po završetku i primopredaji."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Uplaćeni avans / polog (€):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={offer.paidAdvanceAmount || ''}
                  onChange={(e) =>
                    setOffer((prev) => ({
                      ...prev,
                      paidAdvanceAmount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="0.00"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono font-bold"
                />
                {offer.paidAdvanceAmount && offer.paidAdvanceAmount > 0 ? (
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    Preostalo:{' '}
                    <strong className="text-orange-400">
                      {(offer.totals.grandTotal - offer.paidAdvanceAmount).toFixed(2)} €
                    </strong>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Napomene za klijenta (garancija, priprema prostora):
            </label>
            <textarea
              rows={2}
              value={offer.notes}
              onChange={(e) => setOffer((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Npr. U cijenu je uključena zaštita prostora folijama, nivelatori za keramiku te odvoz šute u vrećama."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white resize-none"
            />
          </div>
        </div>

        {/* Right: Estimated Material Consumption (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-400" />
              <span>Proračun Utroška Materijala</span>
            </h3>
            <button
              onClick={() => setIsToolsModalOpen(true)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-orange-950/80 hover:bg-orange-900 border border-orange-500/40 text-orange-300 font-semibold flex items-center gap-1 transition"
              title="Kalkulator paketa za trgovinu, nivelatori i pad tuša"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Majstorski Alati</span>
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300 font-medium">Potrebna keramika (sa škartom):</span>
              <strong className="text-amber-400 text-sm">
                {offer.totals.totalAreaWithWaste.toFixed(2)} m²
              </strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300 font-medium">
                Fleksibilno ljepilo (C2TE S1):
              </span>
              <strong className="text-white text-sm">
                ~{offer.totals.estimatedAdhesiveBags} vreća (25kg)
              </strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300 font-medium">Fug masa za keramiku:</span>
              <strong className="text-white text-sm">~{offer.totals.estimatedGroutKg} kg</strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300 font-medium">Hidroizolacija (2K elastična):</span>
              <strong className="text-white text-sm">
                ~{offer.totals.estimatedWaterproofingKg} kg
              </strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-300 font-medium">Temeljni premaz (impregnacija):</span>
              <strong className="text-white text-sm">~{offer.totals.estimatedPrimerLiters} L</strong>
            </div>

            <button
              onClick={() => setIsToolsModalOpen(true)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-orange-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition mt-2"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Izračunaj točan broj paketa i nivelatora za trgovinu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Totals Bar */}
      <div className="sticky bottom-0 z-30 bg-slate-900/95 backdrop-blur-md border border-orange-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Površina podova:</span>
              <strong className="text-white text-base">
                {offer.totals.totalFloorArea.toFixed(2)} m²
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Površina zidova:</span>
              <strong className="text-white text-base">
                {offer.totals.totalWallArea.toFixed(2)} m²
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Ukupno s otpadom:</span>
              <strong className="text-amber-400 text-base">
                {offer.totals.totalAreaWithWaste.toFixed(2)} m²
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Ukupan rad majstora:</span>
              <strong className="text-slate-200 text-base">
                {offer.totals.laborSubtotal.toFixed(2)} €
              </strong>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">SVEUKUPNO ZA NAPLATU:</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-orange-400 tracking-tight">
                {offer.totals.grandTotal.toFixed(2)} €
              </span>
              {profile.isVatRegistered && (
                <span className="text-[10px] text-slate-400 block">
                  (Uključuje PDV 25%: {offer.totals.vatAmount.toFixed(2)} €)
                </span>
              )}
            </div>

            <button
              onClick={() => onPreviewOffer(offer)}
              className="px-6 py-3.5 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold rounded-xl shadow-xl shadow-orange-600/30 flex items-center gap-2 transition transform active:scale-95 text-sm"
              title="Pregled ponude i preuzimanje kao PDF"
            >
              <Eye className="w-5 h-5" />
              <span>Pregled & Preuzmi PDF</span>
            </button>
          </div>
        </div>
      </div>
      {/* Craftsman Tools Modal (Shopping boxes, Levelers, Slope) */}
      <CraftsmanToolsModal
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
        totalAreaWithWaste={offer.totals.totalAreaWithWaste}
        tileFloorFormat={activeRoom?.tileFloorFormat}
        tileWallFormat={activeRoom?.tileWallFormat}
      />
    </div>
  );
};
