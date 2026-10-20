import React, { useState } from 'react';
import {
  X,
  Crown,
  Check,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building,
  Sparkles,
  Receipt,
  RotateCcw,
  CheckCircle2,
  Printer,
  FileText,
  Lock,
  Zap,
  Briefcase,
  FileSpreadsheet,
  Image as ImageIcon,
  PlusCircle,
  Coins,
} from 'lucide-react';
import { SubscriptionState, PaymentInvoice, CraftsmanProfile, PlanTier, AddonTier } from '../types';
import {
  PLANS_CONFIG,
  ADDON_PACKAGES,
  activatePlan,
  purchaseAddonPackage,
  simulateAddExtraAiAnalyses,
  cancelSubscription,
  loadInvoices,
  resetAiQuota,
  simulateAiQuotaExhausted,
  getAiQuotaInfo,
} from '../utils/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionState;
  profile: CraftsmanProfile;
  onSubscriptionUpdated: (updated: SubscriptionState) => void;
  forcePaywall?: boolean;
  initialPlan?: PlanTier;
}

export const SubscriptionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  subscription,
  profile,
  onSubscriptionUpdated,
  forcePaywall = false,
  initialPlan = 'pro',
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(
    subscription.plan === 'free' ? 'pro' : subscription.plan || initialPlan
  );
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'google_pay'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchasingAddon, setPurchasingAddon] = useState<AddonTier | null>(null);
  const [activeTab, setActiveTab] = useState<'checkout' | 'invoices'>('checkout');
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState(profile.ownerName || '');

  // Preview selected invoice
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentInvoice | null>(null);

  if (!isOpen) return null;

  const invoices = loadInvoices();
  const quota = getAiQuotaInfo(subscription);
  const chosenConfig = PLANS_CONFIG[selectedPlan];
  const isCurrentActivePlan = subscription.plan === selectedPlan;

  const showNotice = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleFillTestCard = () => {
    setCardNumber('4532 •••• •••• 8821');
    setCardExpiry('12/28');
    setCardCvc('884');
    if (!cardName) setCardName(profile.ownerName || 'Marko Keramičar');
    showNotice('Uneseni su testni podaci za kartično plaćanje.', 'info');
  };

  const handleActivate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const updated = activatePlan(selectedPlan, selectedMethod);
      onSubscriptionUpdated(updated);
      setIsProcessing(false);
      if (selectedPlan === 'free') {
        showNotice('Prebačeni ste na paket "Free (zauvijek)" (2 AI analize mjesečno).', 'success');
      } else {
        showNotice(
          `Paket "${chosenConfig.name}" (${chosenConfig.price.toFixed(2)} €/mj) je uspješno aktiviran! Hvala na povjerenju.`,
          'success'
        );
      }
      setTimeout(() => {
        onClose();
      }, 1300);
    }, 800);
  };

  const handleCancelAutoRenew = () => {
    const updated = cancelSubscription();
    onSubscriptionUpdated(updated);
    showNotice('Automatsko obnavljanje paketa je isključeno.', 'info');
  };

  const handleBuyAddon = (addonTier: AddonTier) => {
    setPurchasingAddon(addonTier);
    setTimeout(() => {
      const updatedSub = purchaseAddonPackage(addonTier, selectedMethod);
      onSubscriptionUpdated(updatedSub);
      setPurchasingAddon(null);
      const addon = ADDON_PACKAGES[addonTier];
      showNotice(
        `Uspješno kupljen ${addon.name} (+${addon.analysesCount} AI analiza za ${addon.price.toFixed(2)} €)!`,
        'success'
      );
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-4 sm:p-7 text-slate-100 max-h-[92vh] overflow-y-auto">
        {!forcePaywall && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            aria-label="Zatvori"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Top Notification Toast */}
        {notification && (
          <div
            className={`mb-4 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 border animate-in slide-in-from-top-2 ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
                : notification.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-300'
                : 'bg-sky-950/90 border-sky-500/50 text-sky-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.message}</span>
          </div>
        )}

        {/* Header Icon & Plan Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white">Paketi & Pretplata KeraKalk</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-600/30 text-orange-400 border border-orange-500/40">
                  {subscription.planName || 'Free'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Odaberite paket prilagođen vašim keramičarskim radovima i potrebama
              </p>
            </div>
          </div>

          {/* Current Plan Status Pill */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>
                AI analize: <strong className="text-white">{quota.used}/{quota.totalLimit}</strong>
                {quota.extra > 0 && (
                  <span className="text-emerald-400 font-bold ml-1">
                    (+{quota.extra} kupljenih)
                  </span>
                )}
              </span>
            </span>
          </div>
        </div>

        {/* Tab switcher: Checkout / Invoices */}
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setActiveTab('checkout')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'checkout'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Odabir Paketa & Plaćanje</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'invoices'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Računi ({invoices.length})</span>
          </button>
        </div>

        {activeTab === 'checkout' ? (
          <div className="space-y-6">
            {/* 3 Tier Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* 1. FREE (ZAUVIJEK) */}
              <div
                onClick={() => setSelectedPlan('free')}
                className={`relative rounded-2xl p-5 border transition cursor-pointer flex flex-col justify-between ${
                  selectedPlan === 'free'
                    ? 'bg-slate-800/90 border-orange-500 ring-2 ring-orange-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {PLANS_CONFIG.free.name}
                    </span>
                    {subscription.plan === 'free' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-200">
                        Trenutni
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-3xl font-black text-white">0 €</span>
                    <span className="text-xs text-slate-400">/ zauvijek</span>
                  </div>

                  <p className="text-xs text-slate-400 mb-4">{PLANS_CONFIG.free.description}</p>

                  <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Ručni unos površina</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Broj pločica i paketa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Ljepilo i fuga</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Izračun otpada (%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Jednostavna ponuda</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>2 AI analize nacrta mjesečno</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className={`mt-5 w-full py-2.5 rounded-xl text-xs font-bold transition ${
                    selectedPlan === 'free'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {selectedPlan === 'free' ? 'Odabran paket' : 'Odaberi Free'}
                </button>
              </div>

              {/* 2. AI PRO (9.99 €/mj) */}
              <div
                onClick={() => setSelectedPlan('pro')}
                className={`relative rounded-2xl p-5 border transition cursor-pointer flex flex-col justify-between ${
                  selectedPlan === 'pro'
                    ? 'bg-gradient-to-b from-orange-950/40 via-slate-900 to-slate-900 border-orange-500 ring-2 ring-orange-500/50 shadow-xl shadow-orange-950/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
                  Preporučeno
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5" />
                      {PLANS_CONFIG.pro.name}
                    </span>
                    {subscription.plan === 'pro' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-200">
                        Aktivno
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-3xl font-black text-white">9,99 €</span>
                    <span className="text-xs text-slate-400">/ mjesečno</span>
                  </div>

                  <p className="text-xs text-slate-400 mb-4">{PLANS_CONFIG.pro.description}</p>

                  <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-2 font-medium text-emerald-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Sve iz Free paketa</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>30 AI analiza nacrta mjesečno</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-white">
                      <ImageIcon className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>PDF ponude s vlastitim logom</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>Spremanje do 25 projekata</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Slanje na WhatsApp u 1 klik</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className={`mt-5 w-full py-2.5 rounded-xl text-xs font-bold transition shadow-md ${
                    selectedPlan === 'pro'
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-orange-600/30'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {selectedPlan === 'pro' ? 'Odabran paket (9,99 €)' : 'Odaberi AI Pro'}
                </button>
              </div>

              {/* 3. AI BUSINESS (19.99 €/mj) */}
              <div
                onClick={() => setSelectedPlan('business')}
                className={`relative rounded-2xl p-5 border transition cursor-pointer flex flex-col justify-between ${
                  selectedPlan === 'business'
                    ? 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-amber-500 ring-2 ring-amber-500/50 shadow-xl shadow-amber-950/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-800 border border-amber-500/50 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                  Maksimalni paket
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      {PLANS_CONFIG.business.name}
                    </span>
                    {subscription.plan === 'business' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-200">
                        Aktivno
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-3xl font-black text-white">19,99 €</span>
                    <span className="text-xs text-slate-400">/ mjesečno</span>
                  </div>

                  <p className="text-xs text-slate-400 mb-4">{PLANS_CONFIG.business.description}</p>

                  <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-2 font-medium text-emerald-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Sve iz AI Pro paketa</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>70 AI analiza nacrta mjesečno</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-emerald-400">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Excel (.xlsx / .csv) izvoz ponuda</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-white">
                      <Briefcase className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Neograničen broj projekata</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Prioritetna AI obrada skica</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className={`mt-5 w-full py-2.5 rounded-xl text-xs font-bold transition shadow-md ${
                    selectedPlan === 'business'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-amber-600/30'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {selectedPlan === 'business' ? 'Odabran paket (19,99 €)' : 'Odaberi AI Business'}
                </button>
              </div>
            </div>

            {/* Selected Plan Details & Payment Form (only for Pro and Business) */}
            {selectedPlan !== 'free' ? (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      Način plaćanja za paket {chosenConfig.name} ({chosenConfig.price.toFixed(2)} €/mj)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Bez ugovorne obveze • Mogućnost otkazivanja u bilo kojem trenutku
                    </p>
                  </div>
                  {selectedMethod === 'card' && (
                    <button
                      type="button"
                      onClick={handleFillTestCard}
                      className="text-xs text-orange-400 hover:text-orange-300 underline font-medium"
                    >
                      Ispuni testnim podacima
                    </button>
                  )}
                </div>

                {/* Payment Methods */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('card')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition ${
                      selectedMethod === 'card'
                        ? 'bg-orange-600/20 border-orange-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-orange-400" />
                    <span>Kartica (Visa/MC)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('google_pay')}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 text-xs font-bold transition ${
                      selectedMethod === 'google_pay'
                        ? 'bg-orange-600/20 border-orange-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <span>Google / Apple Pay</span>
                  </button>
                </div>

                {/* Method details */}
                {selectedMethod === 'card' && (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Ime i prezime vlasnika kartice:</label>
                      <input
                        type="text"
                        placeholder="npr. Marko Horvat"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Broj kartice:</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="4532 •••• •••• 8821"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                        />
                        <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Vrijedi do (MM/GG):</label>
                        <input
                          type="text"
                          placeholder="12/28"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">CVC sigurnosni kod:</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="•••"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedMethod === 'google_pay' && (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 text-center space-y-1">
                    <p className="font-semibold text-white">
                      Instantno plaćanje 1 dodirom putem Google Pay ili Apple Pay novčanika na telefonu.
                    </p>
                    <span className="text-slate-500 block text-[11px]">
                      Zaštićeno biometrijskom provjerom (otisak prsta / Face ID).
                    </span>
                  </div>
                )}





                {/* Submit Action */}
                <button
                  type="button"
                  onClick={handleActivate}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-orange-600/30 flex items-center justify-center gap-2 transition transform active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <span>Obrada u tijeku...</span>
                  ) : (
                    <>
                      <Crown className="w-5 h-5 text-amber-200" />
                      <span>
                        Aktiviraj {chosenConfig.name} ({chosenConfig.price.toFixed(2)} € / mj)
                      </span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Free Plan Confirmation */
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
                <h4 className="font-bold text-white text-sm">Paket: Free (zauvijek)</h4>
                <p className="text-slate-300">
                  Besplatan pristup zauvijek. Uključuje ručni unos površina, proračun pločica, ljepila, fuge i 2 AI analize skica mjesečno.
                </p>
                <button
                  type="button"
                  onClick={handleActivate}
                  disabled={isProcessing || isCurrentActivePlan}
                  className="w-full py-3 px-6 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  {isCurrentActivePlan ? 'Već koristite Free paket' : 'Prebaci na Free paket (0 €)'}
                </button>
              </div>
            )}

            {/* Dodatni paketi (Jednokratna kupnja bez pretplate) */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-amber-400">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                      <span>Dodatni paketi AI analiza</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Jednokratno
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Trebate više analiza, a ne želite mijenjati mjesečni paket? Dodatne analize se odmah pribrajaju kvoti i <strong>ne ističu</strong> krajem mjeseca!
                    </p>
                  </div>
                </div>

                {quota.extra > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+{quota.extra} dodatnih analiza aktivno</span>
                  </span>
                )}
              </div>

              {/* Addon Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Dodatni paket 10 AI analiza */}
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4.5 flex flex-col justify-between transition group relative">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                        Dodatni paket
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {ADDON_PACKAGES.addon_10.badge || 'Popularno'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-2xl font-black text-white flex items-center gap-1">
                          <span>10 AI analiza</span>
                        </div>
                        <span className="text-xs text-slate-400">{ADDON_PACKAGES.addon_10.unitPrice}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-amber-400">2,99 €</span>
                        <span className="text-[10px] block text-slate-400">jednokratno</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300">
                      {ADDON_PACKAGES.addon_10.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>10 dodatnih analiza skica i nacrta</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Ne ističe krajem mjeseca (trajno)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBuyAddon('addon_10')}
                    disabled={purchasingAddon !== null}
                    className="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {purchasingAddon === 'addon_10' ? (
                      <span>Kupovina u tijeku...</span>
                    ) : (
                      <>
                        <Coins className="w-4 h-4 text-amber-200" />
                        <span>Kupi 10 analiza (2,99 €)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Dodatni paket 25 AI analiza */}
                <div className="bg-gradient-to-b from-amber-950/20 via-slate-900 to-slate-950 border border-amber-500/40 hover:border-amber-500 rounded-2xl p-4.5 flex flex-col justify-between transition group relative shadow-lg shadow-amber-950/20">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                        Dodatni paket
                      </span>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm">
                        {ADDON_PACKAGES.addon_25.badge || 'Najisplativije'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-2xl font-black text-white flex items-center gap-1">
                          <span>25 AI analiza</span>
                        </div>
                        <span className="text-xs text-amber-300 font-semibold">{ADDON_PACKAGES.addon_25.unitPrice}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-amber-400">5,99 €</span>
                        <span className="text-[10px] block text-slate-400">jednokratno</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300">
                      {ADDON_PACKAGES.addon_25.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2 font-semibold text-white">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>25 dodatnih analiza skica i nacrta</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Ne ističe krajem mjeseca (trajno)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBuyAddon('addon_25')}
                    disabled={purchasingAddon !== null}
                    className="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {purchasingAddon === 'addon_25' ? (
                      <span>Kupovina u tijeku...</span>
                    ) : (
                      <>
                        <Coins className="w-4 h-4 text-amber-200" />
                        <span>Kupi 25 analiza (5,99 €)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Dodatni paketi (Jednokratna kupnja bez pretplate) */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-amber-400">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                      <span>Dodatni paketi AI analiza</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Jednokratno
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Trebate više analiza, a ne želite mijenjati mjesečni paket? Dodatne analize se odmah pribrajaju kvoti i <strong>ne ističu</strong> krajem mjeseca!
                    </p>
                  </div>
                </div>

                {quota.extra > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+{quota.extra} dodatnih analiza aktivno</span>
                  </span>
                )}
              </div>

              {/* Addon Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Dodatni paket 10 AI analiza */}
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4.5 flex flex-col justify-between transition group relative">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                        Dodatni paket
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {ADDON_PACKAGES.addon_10.badge || 'Popularno'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-2xl font-black text-white flex items-center gap-1">
                          <span>10 AI analiza</span>
                        </div>
                        <span className="text-xs text-slate-400">{ADDON_PACKAGES.addon_10.unitPrice}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-amber-400">2,99 €</span>
                        <span className="text-[10px] block text-slate-400">jednokratno</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300">
                      {ADDON_PACKAGES.addon_10.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>10 dodatnih analiza skica i nacrta</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Ne ističe krajem mjeseca (trajno)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBuyAddon('addon_10')}
                    disabled={purchasingAddon !== null}
                    className="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {purchasingAddon === 'addon_10' ? (
                      <span>Kupovina u tijeku...</span>
                    ) : (
                      <>
                        <Coins className="w-4 h-4 text-amber-200" />
                        <span>Kupi 10 analiza (2,99 €)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Dodatni paket 25 AI analiza */}
                <div className="bg-gradient-to-b from-amber-950/20 via-slate-900 to-slate-950 border border-amber-500/40 hover:border-amber-500 rounded-2xl p-4.5 flex flex-col justify-between transition group relative shadow-lg shadow-amber-950/20">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                        Dodatni paket
                      </span>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-sm">
                        {ADDON_PACKAGES.addon_25.badge || 'Najisplativije'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <div className="text-2xl font-black text-white flex items-center gap-1">
                          <span>25 AI analiza</span>
                        </div>
                        <span className="text-xs text-amber-300 font-semibold">{ADDON_PACKAGES.addon_25.unitPrice}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-amber-400">5,99 €</span>
                        <span className="text-[10px] block text-slate-400">jednokratno</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300">
                      {ADDON_PACKAGES.addon_25.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2 font-semibold text-white">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>25 dodatnih analiza skica i nacrta</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Ne ističe krajem mjeseca (trajno)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBuyAddon('addon_25')}
                    disabled={purchasingAddon !== null}
                    className="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-orange-600 via-amber-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {purchasingAddon === 'addon_25' ? (
                      <span>Kupovina u tijeku...</span>
                    ) : (
                      <>
                        <Coins className="w-4 h-4 text-amber-200" />
                        <span>Kupi 25 analiza (5,99 €)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Test simulator controls */}
            <div className="pt-2 border-t border-slate-800/80 bg-slate-950/40 p-3 rounded-xl text-[11px] text-slate-400 space-y-2">
              <span className="font-bold text-slate-300 block">
                🧪 Testiranje paketa i AI kvota (Simulator):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const updated = simulateAddExtraAiAnalyses(10);
                    onSubscriptionUpdated(updated);
                    showNotice('Simulirano: Dodano +10 dodatnih AI analiza.', 'success');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 font-semibold"
                >
                  +10 analiza (2,99 €)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = simulateAddExtraAiAnalyses(25);
                    onSubscriptionUpdated(updated);
                    showNotice('Simulirano: Dodano +25 dodatnih AI analiza.', 'success');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 font-semibold"
                >
                  +25 analiza (5,99 €)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = activatePlan('free');
                    onSubscriptionUpdated(updated);
                    showNotice('Postavljeno na Free paket (2 AI analize mjesečno).', 'info');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                >
                  Postavi na Free (0 €)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = activatePlan('pro');
                    onSubscriptionUpdated(updated);
                    showNotice('Postavljeno na AI Pro paket (30 AI analiza, logo).', 'success');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-orange-300 rounded-lg border border-slate-700"
                >
                  Postavi na AI Pro (9,99 €)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = activatePlan('business');
                    onSubscriptionUpdated(updated);
                    showNotice('Postavljeno na AI Business paket (70 AI analiza, Excel).', 'success');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700"
                >
                  Postavi na AI Business (19,99 €)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = simulateAiQuotaExhausted();
                    onSubscriptionUpdated(updated);
                    showNotice('Simulirano: Iskoristili ste sve AI analize za ovaj mjesec!', 'error');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg border border-slate-700"
                >
                  Simuliraj potrošenu AI kvotu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = resetAiQuota();
                    onSubscriptionUpdated(updated);
                    showNotice('AI kvota uspješno vraćena na 0 iskorištenih.', 'info');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg border border-slate-700 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Resetiraj AI kvotu
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Invoices Tab */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">Povijest izdanih računa za pretplatu</h4>
              <span className="text-xs text-slate-400">Pregled plaćanja</span>
            </div>

            {selectedInvoice ? (
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h5 className="font-bold text-white text-base">Račun {selectedInvoice.invoiceNumber}</h5>
                    <p className="text-xs text-slate-400">Datum: {selectedInvoice.date}</p>
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="text-xs text-orange-400 hover:underline"
                  >
                    Natrag na popis
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400">Izdavatelj:</p>
                    <p className="font-bold text-white">KeraKalk Software d.o.o.</p>
                    <p className="text-slate-300">OIB: 98765432101</p>
                    <p className="text-slate-300">Zagreb, Hrvatska</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Kupac:</p>
                    <p className="font-bold text-white">{profile.companyName || 'Keramičarski Obrt'}</p>
                    <p className="text-slate-300">OIB: {profile.oib || 'Nije upisan'}</p>
                    <p className="text-slate-300">{profile.address}, {profile.city}</p>
                  </div>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-900 px-3 py-2 flex justify-between font-bold text-slate-300">
                    <span>Opis stavke</span>
                    <span>Iznos</span>
                  </div>
                  <div className="p-3 flex justify-between bg-slate-950">
                    <span>{selectedInvoice.planName}</span>
                    <span className="font-mono font-bold text-white">{selectedInvoice.amount.toFixed(2)} €</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 text-xs">
                  <span className="text-emerald-400 font-bold">Status: Uredno plaćeno ({selectedInvoice.paymentMethod})</span>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center gap-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5 text-orange-400" />
                    <span>Ispiši račun</span>
                  </button>
                </div>
              </div>
            ) : invoices.length > 0 ? (
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="p-4 flex items-center justify-between text-xs hover:bg-slate-800/50 cursor-pointer transition"
                  >
                    <div>
                      <span className="font-bold text-white block text-sm">{inv.invoiceNumber}</span>
                      <span className="text-slate-400 text-[11px]">
                        Datum: {inv.date} • {inv.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-black text-white text-base font-mono">
                          {inv.amount.toFixed(2)} €
                        </span>
                        <span className="text-[10px] text-emerald-400 block font-bold">Plaćeno</span>
                      </div>
                      <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800">
                <Receipt className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p>Nema prethodnih računa. Vaš prvi račun bit će izdan po aktivaciji paketa AI Pro ili AI Business.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
