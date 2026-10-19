import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Building,
  Ruler,
  Layers,
  Coins,
  ShieldCheck,
  Check,
  Percent,
  Download,
  Upload,
  Database,
} from 'lucide-react';
import { PricingSettings, CraftsmanProfile, Offer } from '../types';
import { DEFAULT_PRICING, DEFAULT_PROFILE } from '../utils/storage';

interface Props {
  pricing: PricingSettings;
  profile: CraftsmanProfile;
  onSavePricing: (pricing: PricingSettings) => void;
  onSaveProfile: (profile: CraftsmanProfile) => void;
  offers?: Offer[];
  onRestoreOffers?: (offers: Offer[]) => void;
}

export const PricingAndProfile: React.FC<Props> = ({
  pricing: initialPricing,
  profile: initialProfile,
  onSavePricing,
  onSaveProfile,
  offers = [],
  onRestoreOffers,
}) => {
  const [pricing, setPricing] = useState<PricingSettings>(initialPricing);
  const [profile, setProfile] = useState<CraftsmanProfile>(initialProfile);
  const [activeTab, setActiveTab] = useState<'pricing' | 'profile'>('pricing');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handlePricingChange = (key: keyof PricingSettings, value: number) => {
    setPricing((prev) => ({ ...prev, [key]: value }));
  };

  const handleProfileChange = (key: keyof CraftsmanProfile, value: string | boolean | number) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = () => {
    onSavePricing(pricing);
    onSaveProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetPricing = () => {
    if (confirm('Želite li vratiti cjenik na preporučene tržišne cijene?')) {
      setPricing(DEFAULT_PRICING);
      onSavePricing(DEFAULT_PRICING);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Postavke Aplikacije</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Cjenik Radova & Profil Obrta</h1>
          <p className="text-xs text-slate-400 mt-1">
            Ovdje podesite vlastite satnice, cijene postavljanja pločica po m² i podatke koji se
            ispisuju na ponudi.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 transition transform active:scale-95"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Spremljeno!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Spremi Sve Promjene</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'pricing'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Cjenik Keramičarskih Radova (€)</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'profile'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Podaci o Obrtu / Firmi & PDV</span>
        </button>
      </div>

      {/* Pricing Form */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          {/* Tile laying rates */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-400" />
                Postavljanje keramike (cijene po m²)
              </h3>
              <button
                onClick={handleResetPricing}
                className="text-xs text-slate-400 hover:text-orange-400 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Vrati standardne cijene
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Podna keramika standard (30x60, 60x60):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={pricing.tileFloorStandard}
                    onChange={(e) =>
                      handlePricingChange('tileFloorStandard', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€/m²</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Zidna keramika standard:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={pricing.tileWallStandard}
                    onChange={(e) =>
                      handlePricingChange('tileWallStandard', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€/m²</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Veliki formati (60x120, 120x120 cm):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={pricing.tileLargeFormat}
                    onChange={(e) =>
                      handlePricingChange('tileLargeFormat', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-orange-400 font-mono font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€/m²</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mozaik pločice:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={pricing.tileMosaic}
                    onChange={(e) =>
                      handlePricingChange('tileMosaic', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€/m²</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Riblja kost (Herringbone):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={pricing.tileHerringbone}
                    onChange={(e) =>
                      handlePricingChange('tileHerringbone', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€/m²</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nivelir masa / priprema podloge:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={pricing.floorLeveling}
                    onChange={(e) =>
                      handlePricingChange('floorLeveling', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€/m²</span>
                </div>
              </div>
            </div>
          </div>

          {/* Linear meters & piece rates */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Ruler className="w-4 h-4 text-orange-400" />
              Obrade po dužnom metru (m') i komadu
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Gerung 45° brušenje vanjskih kutova:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={pricing.mitreCut45}
                    onChange={(e) =>
                      handlePricingChange('mitreCut45', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€/m'</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Sokl / podne lajsne:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={pricing.skirting}
                    onChange={(e) =>
                      handlePricingChange('skirting', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€/m'</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Sanitarno silikoniranje:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={pricing.siliconing}
                    onChange={(e) =>
                      handlePricingChange('siliconing', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€/m'</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Hidroizolacija (2 premaza):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={pricing.waterproofing}
                    onChange={(e) =>
                      handlePricingChange('waterproofing', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€/m²</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Brtvena traka za kutove:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={pricing.waterproofingTape}
                    onChange={(e) =>
                      handlePricingChange('waterproofingTape', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€/m'</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Štemanje starih pločica i odvoz:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={pricing.oldTileRemoval}
                    onChange={(e) =>
                      handlePricingChange('oldTileRemoval', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€/m²</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Ugradbeni vodokotlić (Geberit) oblaganje:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="5"
                    value={pricing.geberitBoxEnclosure}
                    onChange={(e) =>
                      handlePricingChange('geberitBoxEnclosure', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€/kom</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Izrada i opločenje niše:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="5"
                    value={pricing.nicheCrafting}
                    onChange={(e) =>
                      handlePricingChange('nicheCrafting', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€/kom</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Walk-in tuš pad i linijska kanalica:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="5"
                    value={pricing.walkInSlopeChannel}
                    onChange={(e) =>
                      handlePricingChange('walkInSlopeChannel', parseFloat(e.target.value) || 0)
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">€/kom</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Form */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white">
              Službeni podaci izvođača za zaglavlje ponuda
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ovi podaci pojavit će se na vrhu svakog predračuna i ponude koju pošaljete klijentu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Naziv obrta ili tvrtke:
              </label>
              <input
                type="text"
                value={profile.companyName}
                onChange={(e) => handleProfileChange('companyName', e.target.value)}
                placeholder="Npr. KERA-PRO Keramičarski Obrt"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Ime i prezime vlasnika:
              </label>
              <input
                type="text"
                value={profile.ownerName}
                onChange={(e) => handleProfileChange('ownerName', e.target.value)}
                placeholder="Npr. Marko Horvat"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">OIB:</label>
              <input
                type="text"
                value={profile.oib}
                onChange={(e) => handleProfileChange('oib', e.target.value)}
                placeholder="Npr. 12345678901"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">IBAN računa:</label>
              <input
                type="text"
                value={profile.iban}
                onChange={(e) => handleProfileChange('iban', e.target.value)}
                placeholder="Npr. HR1223400091110022334"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Banka:</label>
              <input
                type="text"
                value={profile.bankName}
                onChange={(e) => handleProfileChange('bankName', e.target.value)}
                placeholder="Npr. Erste Bank d.d."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kontakt telefon:</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                placeholder="Npr. 091 555 7890"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kontakt E-mail:</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                placeholder="Npr. keramika.horvat@gmail.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Adresa i grad:</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => handleProfileChange('address', e.target.value)}
                placeholder="Npr. Zagrebačka cesta 142"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          {/* VAT / PDV Settings */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-sm">Status u sustavu PDV-a</h4>

            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex-1">
                <input
                  type="radio"
                  name="vatRegistered"
                  checked={!profile.isVatRegistered}
                  onChange={() => handleProfileChange('isVatRegistered', false)}
                  className="w-4 h-4 text-orange-600 bg-slate-900"
                />
                <div className="text-xs">
                  <strong className="text-white block">Nisam u sustavu PDV-a (paušalist / obrt)</strong>
                  <span className="text-slate-400">
                    Oslobođeno PDV-a prema članku 90. stavak 2. Zakona o PDV-u.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex-1">
                <input
                  type="radio"
                  name="vatRegistered"
                  checked={profile.isVatRegistered}
                  onChange={() => handleProfileChange('isVatRegistered', true)}
                  className="w-4 h-4 text-orange-600 bg-slate-900"
                />
                <div className="text-xs">
                  <strong className="text-white block">U sustavu PDV-a (d.o.o. / j.d.o.o. / obrt)</strong>
                  <span className="text-slate-400">
                    Obračunava se stopa PDV-a od 25% na ponudama.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Backup & Restore Data */}
          <div className="pt-5 border-t border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-orange-400" />
              <span>Sigurnosna pohrana baze ponuda (Backup & Restore)</span>
            </h4>
            <p className="text-xs text-slate-400">
              Spremite sve svoje ponude, cjenike i klijente u sigurnosnu datoteku kako biste ih mogli prebaciti na novi mobitel ili računalo.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => {
                  const data = {
                    pricing,
                    profile,
                    offers,
                    exportedAt: new Date().toISOString(),
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `KeraKalk_Sigurnosna_Kopija_${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl flex items-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-orange-400" />
                <span>Preuzmi Sigurnosnu Kopiju (JSON)</span>
              </button>

              <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl flex items-center gap-2 cursor-pointer transition">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Uvezi Sigurnosnu Kopiju</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const parsed = JSON.parse(event.target?.result as string);
                        if (parsed.pricing) {
                          setPricing(parsed.pricing);
                          onSavePricing(parsed.pricing);
                        }
                        if (parsed.profile) {
                          setProfile(parsed.profile);
                          onSaveProfile(parsed.profile);
                        }
                        if (Array.isArray(parsed.offers) && onRestoreOffers) {
                          onRestoreOffers(parsed.offers);
                        }
                        alert('Sigurnosna kopija je uspješno učitana!');
                      } catch {
                        alert('Datoteka sigurnosne kopije nije ispravnog JSON formata.');
                      }
                    };
                    reader.readAsText(file);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveAll}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-orange-600/30 transition"
            >
              Spremi Podatke Profila
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
