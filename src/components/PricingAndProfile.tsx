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
  Crown,
  Clock,
  Sparkles,
  AlertTriangle,
  Receipt,
  CreditCard,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
  Zap,
  FileSpreadsheet,
  Briefcase,
} from 'lucide-react';
import { PricingSettings, CraftsmanProfile, Offer, SubscriptionState } from '../types';
import {
  DEFAULT_PRICING,
  DEFAULT_PROFILE,
  loadInvoices,
  PLANS_CONFIG,
  getAiQuotaInfo,
  resetAiQuota,
  simulateAiQuotaExhausted,
  activatePlan,
} from '../utils/storage';

interface Props {
  pricing: PricingSettings;
  profile: CraftsmanProfile;
  onSavePricing: (pricing: PricingSettings) => void;
  onSaveProfile: (profile: CraftsmanProfile) => void;
  offers?: Offer[];
  onRestoreOffers?: (offers: Offer[]) => void;
  subscription: SubscriptionState;
  onOpenSubscriptionModal: () => void;
  onSubscriptionUpdated: (updated: SubscriptionState) => void;
}

export const PricingAndProfile: React.FC<Props> = ({
  pricing: initialPricing,
  profile: initialProfile,
  onSavePricing,
  onSaveProfile,
  offers = [],
  onRestoreOffers,
  subscription,
  onOpenSubscriptionModal,
  onSubscriptionUpdated,
}) => {
  const [pricing, setPricing] = useState<PricingSettings>(initialPricing);
  const [profile, setProfile] = useState<CraftsmanProfile>(initialProfile);
  const [activeTab, setActiveTab] = useState<'pricing' | 'profile' | 'subscription'>('pricing');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

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
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 ${
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 ${
            activeTab === 'profile'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Podaci o Obrtu / Firmi & PDV</span>
        </button>

        <button
          onClick={() => setActiveTab('subscription')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition shrink-0 ${
            activeTab === 'subscription'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Pretplata & Licenca (10 €/mj)</span>
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
              Ovi podaci i logotip pojavit će se na vrhu svakog predračuna i ponude.
            </p>
          </div>

          {/* Logo uploader */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {profile.logoUrl ? (
                <div className="w-16 h-16 rounded-xl bg-white p-1 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={profile.logoUrl} alt="Logo obrta" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-800 border border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 shrink-0">
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                  <span className="text-[9px] mt-0.5">Bez loga</span>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">Logotip obrta / tvrtke za PDF ponude</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-600/20 text-orange-400 border border-orange-500/30">
                    AI Pro & Business
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Učitajte sliku vašeg logotipa (PNG, JPG) koja se automatski ispisuje na vrhu svake PDF ponude.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-orange-400" />
                <span>{profile.logoUrl ? 'Promijeni logo' : 'Učitaj logo'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const base64 = ev.target?.result as string;
                      handleProfileChange('logoUrl', base64);
                      setNoticeMessage('Logotip je uspješno učitan!');
                      setTimeout(() => setNoticeMessage(null), 3000);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>

              {profile.logoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    handleProfileChange('logoUrl', '');
                    setNoticeMessage('Logotip je uklonjen.');
                    setTimeout(() => setNoticeMessage(null), 3000);
                  }}
                  className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-lg text-xs transition"
                  title="Ukloni logo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
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
                        setNoticeMessage('Sigurnosna kopija je uspješno učitana!');
                        setTimeout(() => setNoticeMessage(null), 3000);
                      } catch {
                        setNoticeMessage('Datoteka sigurnosne kopije nije ispravnog JSON formata.');
                        setTimeout(() => setNoticeMessage(null), 3000);
                      }
                    };
                    reader.readAsText(file);
                  }}
                  className="hidden"
                />
              </label>
            </div>
            {noticeMessage && (
              <p className="text-xs text-emerald-400 font-semibold">{noticeMessage}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveAll}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-orange-600/30 transition cursor-pointer"
            >
              Spremi Podatke Profila
            </button>
          </div>
        </div>
      )}

      {/* Subscription & License Tab */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          {/* Main Plan Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
                  <Crown className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-white">{subscription.planName || 'KeraKalk Paket'}</h3>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-600/30 text-orange-400 border border-orange-500/40">
                      {subscription.plan === 'business' ? 'Maksimalni' : subscription.plan === 'pro' ? 'Pro Majstor' : 'Zauvijek Besplatno'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {PLANS_CONFIG[subscription.plan]?.description || 'Softver za keramičare s AI vizualnom analizom'}
                  </p>
                </div>
              </div>

              {/* Status Pill */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                  <Check className="w-3.5 h-3.5" />
                  Aktivno ({subscription.pricePerMonth.toFixed(2)} €/mj)
                </span>
              </div>
            </div>

            {/* AI Quota Usage Progress Bar */}
            <div className="mt-5 bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Mjesečna kvota AI analiza nacrta i skica:
                </span>
                <span className="font-mono text-slate-300">
                  <strong className="text-white font-bold">{getAiQuotaInfo(subscription).used}</strong> / {getAiQuotaInfo(subscription).limit} iskorišteno
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    getAiQuotaInfo(subscription).percentUsed >= 100
                      ? 'bg-rose-500'
                      : getAiQuotaInfo(subscription).percentUsed > 70
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${getAiQuotaInfo(subscription).percentUsed}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span>
                  Preostalo: <strong className="text-white">{getAiQuotaInfo(subscription).remaining} analiza</strong>
                </span>
                <span>
                  Obnova kvote: {new Date(subscription.monthResetDate).toLocaleDateString('hr-HR')}
                </span>
              </div>
            </div>

            {/* 3 Packages Mini-Cards */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Free */}
              <div
                className={`p-4 rounded-xl border text-xs flex flex-col justify-between ${
                  subscription.plan === 'free'
                    ? 'bg-slate-800/80 border-orange-500 ring-1 ring-orange-500'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-white">{PLANS_CONFIG.free.name}</strong>
                    <span className="font-bold text-slate-400">0 €</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">2 AI analize mjesečno, ručni unos, jednostavna ponuda.</p>
                </div>
                {subscription.plan === 'free' ? (
                  <span className="mt-3 text-[11px] text-emerald-400 font-bold block">✓ Vaš trenutni paket</span>
                ) : (
                  <button
                    onClick={onOpenSubscriptionModal}
                    className="mt-3 text-[11px] text-orange-400 hover:underline font-semibold text-left"
                  >
                    Odaberi Free →
                  </button>
                )}
              </div>

              {/* AI Pro */}
              <div
                className={`p-4 rounded-xl border text-xs flex flex-col justify-between ${
                  subscription.plan === 'pro'
                    ? 'bg-orange-950/30 border-orange-500 ring-1 ring-orange-500'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-white">{PLANS_CONFIG.pro.name}</strong>
                    <span className="font-bold text-orange-400">9,99 €/mj</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">30 AI analiza, PDF ponude s logom, do 25 projekata.</p>
                </div>
                {subscription.plan === 'pro' ? (
                  <span className="mt-3 text-[11px] text-emerald-400 font-bold block">✓ Vaš trenutni paket</span>
                ) : (
                  <button
                    onClick={onOpenSubscriptionModal}
                    className="mt-3 text-[11px] text-orange-400 hover:underline font-semibold text-left"
                  >
                    Nadogradi na AI Pro →
                  </button>
                )}
              </div>

              {/* AI Business */}
              <div
                className={`p-4 rounded-xl border text-xs flex flex-col justify-between ${
                  subscription.plan === 'business'
                    ? 'bg-amber-950/30 border-amber-500 ring-1 ring-amber-500'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <strong className="text-white">{PLANS_CONFIG.business.name}</strong>
                    <span className="font-bold text-amber-400">19,99 €/mj</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">70 AI analiza, Excel izvoz, neograničeni projekti.</p>
                </div>
                {subscription.plan === 'business' ? (
                  <span className="mt-3 text-[11px] text-emerald-400 font-bold block">✓ Vaš trenutni paket</span>
                ) : (
                  <button
                    onClick={onOpenSubscriptionModal}
                    className="mt-3 text-[11px] text-amber-400 hover:underline font-semibold text-left"
                  >
                    Nadogradi na AI Business →
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenSubscriptionModal}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-600/30 flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>Promijeni paket ili upravljaj pretplatom</span>
              </button>
            </div>
          </div>

          {/* Invoices Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-orange-400" />
                <span>Povijest računa za pretplatu</span>
              </h3>
              <span className="text-xs text-slate-400">Pregled plaćanja</span>
            </div>

            {loadInvoices().length > 0 ? (
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                {loadInvoices().map((inv) => (
                  <div key={inv.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-white block text-sm">{inv.invoiceNumber}</strong>
                      <span className="text-slate-400 text-[11px]">
                        Datum: {inv.date} • Način: {inv.paymentMethod}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-white text-sm font-mono">
                        {inv.amount.toFixed(2)} €
                      </span>
                      <span className="text-[10px] text-emerald-400 block font-bold">Plaćeno</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Trenutno nema izdanih računa. Nakon aktivacije pretplate AI Pro ili AI Business ovdje će se nalaziti svi vaši računi.
              </p>
            )}
          </div>

          {/* Testing tools */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
            <span className="font-bold text-slate-300 block">
              🧪 Testiranje paketa i AI kvota (Simulator):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const updated = activatePlan('free');
                  onSubscriptionUpdated(updated);
                  setNoticeMessage('Postavljeno na Free (zauvijek).');
                  setTimeout(() => setNoticeMessage(null), 3000);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
              >
                Postavi na Free (0 €)
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = activatePlan('pro');
                  onSubscriptionUpdated(updated);
                  setNoticeMessage('Postavljeno na AI Pro (9,99 €/mj).');
                  setTimeout(() => setNoticeMessage(null), 3000);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-orange-300 rounded-lg border border-slate-700 transition"
              >
                Postavi na AI Pro (9,99 €)
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = activatePlan('business');
                  onSubscriptionUpdated(updated);
                  setNoticeMessage('Postavljeno na AI Business (19,99 €/mj).');
                  setTimeout(() => setNoticeMessage(null), 3000);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 transition"
              >
                Postavi na AI Business (19,99 €)
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = simulateAiQuotaExhausted();
                  onSubscriptionUpdated(updated);
                  setNoticeMessage('Simulirana potrošena AI kvota.');
                  setTimeout(() => setNoticeMessage(null), 3000);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg border border-slate-700 transition"
              >
                Simuliraj potrošenu AI kvotu
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = resetAiQuota();
                  onSubscriptionUpdated(updated);
                  setNoticeMessage('AI kvota resetirana na 0.');
                  setTimeout(() => setNoticeMessage(null), 3000);
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Resetiraj AI kvotu
              </button>
            </div>
            {noticeMessage && (
              <p className="text-xs text-emerald-400 font-semibold pt-1">{noticeMessage}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
