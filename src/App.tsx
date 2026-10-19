import React, { useState, useEffect } from 'react';
import { Header, NavTab } from './components/Header';
import { OffersList } from './components/OffersList';
import { OfferEditor } from './components/OfferEditor';
import { OfferDocument } from './components/OfferDocument';
import { AiSketchScanner } from './components/AiSketchScanner';
import { AiSketchGuidelines } from './components/AiSketchGuidelines';
import { PricingAndProfile } from './components/PricingAndProfile';
import { PWAInstallModal } from './components/PWAInstallModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { Offer, CraftsmanProfile, PricingSettings, Room, SubscriptionState } from './types';
import {
  loadOffers,
  saveOffers,
  loadPricing,
  savePricing,
  loadProfile,
  saveProfile,
  getNextOfferNumber,
  loadSubscription,
  getAiQuotaInfo,
  recordAiAnalysisUsage,
  canCreateProject,
  PLANS_CONFIG,
} from './utils/storage';
import { calculateOfferTotals, createDefaultRoom } from './utils/calculations';
import { WifiOff, Crown, Sparkles, ChevronRight, Zap } from 'lucide-react';

export default function App() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [pricing, setPricing] = useState<PricingSettings>(loadPricing());
  const [profile, setProfile] = useState<CraftsmanProfile>(loadProfile());
  const [subscription, setSubscription] = useState<SubscriptionState>(loadSubscription());

  const [activeTab, setActiveTab] = useState<NavTab>('offers');
  const [currentOfferId, setCurrentOfferId] = useState<string | null>(null);
  const [previewOffer, setPreviewOffer] = useState<Offer | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [forcePaywall, setForcePaywall] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Load initial offers
  useEffect(() => {
    const loaded = loadOffers();
    setOffers(loaded);
    if (loaded.length > 0) {
      setCurrentOfferId(loaded[0].id);
    }
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const quota = getAiQuotaInfo(subscription);
  const currentPlanConfig = PLANS_CONFIG[subscription.plan] || PLANS_CONFIG.free;

  const handleSaveOffer = (updatedOffer: Offer) => {
    const exists = offers.some((o) => o.id === updatedOffer.id);
    let newOffers: Offer[];
    if (exists) {
      newOffers = offers.map((o) => (o.id === updatedOffer.id ? updatedOffer : o));
    } else {
      newOffers = [updatedOffer, ...offers];
    }
    setOffers(newOffers);
    saveOffers(newOffers);
    setCurrentOfferId(updatedOffer.id);
  };

  const handleNewOffer = () => {
    // Check maximum projects quota for active plan
    const check = canCreateProject(offers.length, subscription);
    if (!check.allowed) {
      setForcePaywall(true);
      setIsSubscriptionModalOpen(true);
      return;
    }

    const newOfferNumber = getNextOfferNumber(offers);
    const defaultRoom = createDefaultRoom('Kupaonica');
    const initialRooms = [defaultRoom];

    const newOffer: Offer = {
      id: `ponuda-${Date.now()}`,
      offerNumber: newOfferNumber,
      dateCreated: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + (profile.defaultOfferValidityDays || 30) * 86400000)
        .toISOString()
        .split('T')[0],
      status: 'draft',
      client: {
        name: '',
        address: '',
        city: profile.city,
        phone: '',
        email: '',
        projectLocation: '',
      },
      projectName: 'Keramičarski radovi',
      rooms: initialRooms,
      wasteMarginPercent: profile.defaultWastePercent || 10,
      includeMaterials: pricing.includeMaterialsByDefault || false,
      discountPercent: 0,
      paymentTerms: profile.defaultPaymentTerms,
      notes: 'Korištenje profesionalnih nivelatora za keramiku i fleksibilnog ljepila C2TE S1.',
      totals: calculateOfferTotals(
        initialRooms,
        pricing,
        profile,
        profile.defaultWastePercent || 10,
        pricing.includeMaterialsByDefault || false,
        0
      ),
    };

    const updated = [newOffer, ...offers];
    setOffers(updated);
    saveOffers(updated);
    setCurrentOfferId(newOffer.id);
    setPreviewOffer(null);
    setActiveTab('editor');
  };

  const handleSelectOffer = (offer: Offer) => {
    setCurrentOfferId(offer.id);
    setPreviewOffer(null);
    setActiveTab('editor');
  };

  const handlePreviewOffer = (offer: Offer) => {
    setPreviewOffer(offer);
  };

  const handleDuplicateOffer = (offerToCopy: Offer) => {
    const check = canCreateProject(offers.length, subscription);
    if (!check.allowed) {
      setForcePaywall(true);
      setIsSubscriptionModalOpen(true);
      return;
    }

    const nextNum = getNextOfferNumber(offers);
    const duplicated: Offer = {
      ...offerToCopy,
      id: `ponuda-${Date.now()}`,
      offerNumber: nextNum,
      projectName: `${offerToCopy.projectName} (Kopija)`,
      dateCreated: new Date().toISOString().split('T')[0],
      status: 'draft',
    };

    const updated = [duplicated, ...offers];
    setOffers(updated);
    saveOffers(updated);
    setCurrentOfferId(duplicated.id);
  };

  const handleDeleteOffer = (offerId: string) => {
    const remaining = offers.filter((o) => o.id !== offerId);
    setOffers(remaining);
    saveOffers(remaining);
    if (currentOfferId === offerId) {
      setCurrentOfferId(remaining.length > 0 ? remaining[0].id : null);
    }
    if (previewOffer?.id === offerId) {
      setPreviewOffer(null);
    }
  };

  const handleSavePricing = (newPricing: PricingSettings) => {
    setPricing(newPricing);
    savePricing(newPricing);
  };

  const handleSaveProfile = (newProfile: CraftsmanProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleApplyAnalysisToOffer = (rooms: Room[], notes: string) => {
    const check = canCreateProject(offers.length, subscription);
    if (!check.allowed) {
      setForcePaywall(true);
      setIsSubscriptionModalOpen(true);
      return;
    }

    const newOfferNumber = getNextOfferNumber(offers);

    const newOffer: Offer = {
      id: `ponuda-ai-${Date.now()}`,
      offerNumber: newOfferNumber,
      dateCreated: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'draft',
      client: {
        name: 'Klijent prema skici',
        address: '',
        city: profile.city,
        phone: '',
        email: '',
        projectLocation: '',
      },
      projectName: `Radovi prema AI analizi skice`,
      rooms: rooms,
      wasteMarginPercent: profile.defaultWastePercent || 10,
      includeMaterials: pricing.includeMaterialsByDefault || false,
      discountPercent: 0,
      paymentTerms: profile.defaultPaymentTerms,
      notes: notes,
      totals: calculateOfferTotals(
        rooms,
        pricing,
        profile,
        profile.defaultWastePercent || 10,
        pricing.includeMaterialsByDefault || false,
        0
      ),
    };

    const updated = [newOffer, ...offers];
    setOffers(updated);
    saveOffers(updated);
    setCurrentOfferId(newOffer.id);
    setPreviewOffer(null);
    setActiveTab('editor');
  };

  const currentOffer = offers.find((o) => o.id === currentOfferId) || offers[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Offline Alert Badge */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 print:hidden">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Radite u offline načinu rada. Sve ponude i izračuni su sačuvani na uređaju.</span>
        </div>
      )}

      {/* Subscription Tier & Quota Info Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/70 border-b border-slate-800 text-xs py-2 px-4 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left flex-wrap">
            <span className="inline-flex items-center gap-1 font-bold text-orange-400 bg-orange-950/60 border border-orange-500/30 px-2 py-0.5 rounded-md">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              {currentPlanConfig.name}
            </span>
            <span className="text-slate-300">
              AI analize ovog mjeseca: <strong className="text-white">{quota.used} / {quota.limit}</strong> iskorišteno
              {quota.remaining > 0 ? ` (preostalo ${quota.remaining})` : ' (kvota potrošena)'}.
            </span>
            {subscription.plan === 'free' && (
              <span className="text-slate-400 hidden md:inline">
                • Nadogradite za 30 AI analiza, logo na PDF-u ili Excel izvoz.
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setForcePaywall(false);
              setIsSubscriptionModalOpen(true);
            }}
            className="px-3 py-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Zap className="w-3 h-3 text-amber-200" />
            <span>{subscription.plan === 'free' ? 'Pregled paketa (AI Pro & Business)' : 'Upravljaj paketom'}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* App Header & Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setPreviewOffer(null);
        }}
        onNewOffer={handleNewOffer}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenSubscriptionModal={() => {
          setForcePaywall(false);
          setIsSubscriptionModalOpen(true);
        }}
        subscription={subscription}
        offersCount={offers.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {previewOffer ? (
          <OfferDocument
            offer={previewOffer}
            profile={profile}
            pricing={pricing}
            subscription={subscription}
            onBackToEdit={() => setPreviewOffer(null)}
            onUpdateStatus={(newStatus) => {
              const updated = { ...previewOffer, status: newStatus };
              handleSaveOffer(updated);
              setPreviewOffer(updated);
            }}
            onOpenSubscriptionModal={() => {
              setForcePaywall(false);
              setIsSubscriptionModalOpen(true);
            }}
          />
        ) : (
          <>
            {activeTab === 'offers' && (
              <OffersList
                offers={offers}
                onSelectOffer={handleSelectOffer}
                onPreviewOffer={handlePreviewOffer}
                onNewOffer={handleNewOffer}
                onDuplicateOffer={handleDuplicateOffer}
                onDeleteOffer={handleDeleteOffer}
                onScanSketch={() => setActiveTab('scanner')}
              />
            )}

            {activeTab === 'editor' && currentOffer && (
              <OfferEditor
                offer={currentOffer}
                pricing={pricing}
                profile={profile}
                onSaveOffer={handleSaveOffer}
                onPreviewOffer={handlePreviewOffer}
                onScanSketch={() => setActiveTab('scanner')}
              />
            )}

            {activeTab === 'scanner' && (
              <AiSketchScanner
                subscription={subscription}
                onApplyAnalysisToOffer={handleApplyAnalysisToOffer}
                onNavigateToGuidelines={() => setActiveTab('guidelines')}
                onOpenSubscriptionModal={() => {
                  setForcePaywall(false);
                  setIsSubscriptionModalOpen(true);
                }}
                onAiAnalysisPerformed={() => {
                  const updated = recordAiAnalysisUsage();
                  setSubscription(updated);
                }}
              />
            )}

            {activeTab === 'guidelines' && (
              <AiSketchGuidelines onGoToScanner={() => setActiveTab('scanner')} />
            )}

            {activeTab === 'pricing' && (
              <PricingAndProfile
                pricing={pricing}
                profile={profile}
                onSavePricing={handleSavePricing}
                onSaveProfile={handleSaveProfile}
                offers={offers}
                onRestoreOffers={(restored) => {
                  setOffers(restored);
                  saveOffers(restored);
                  if (restored.length > 0) {
                    setCurrentOfferId(restored[0].id);
                  }
                }}
                subscription={subscription}
                onOpenSubscriptionModal={() => {
                  setForcePaywall(false);
                  setIsSubscriptionModalOpen(true);
                }}
                onSubscriptionUpdated={(updated) => setSubscription(updated)}
              />
            )}
          </>
        )}
      </main>

      {/* PWA Mobile Installation Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* 3 Tier Packages (Free, AI Pro 9.99, AI Business 19.99) & Payment Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => {
          setIsSubscriptionModalOpen(false);
          setForcePaywall(false);
        }}
        subscription={subscription}
        profile={profile}
        onSubscriptionUpdated={(updated) => setSubscription(updated)}
        forcePaywall={forcePaywall}
      />
    </div>
  );
}
