import { CraftsmanProfile, PricingSettings, Offer } from '../types';
import { calculateOfferTotals, createDefaultRoom } from './calculations';

export const DEFAULT_PRICING: PricingSettings = {
  tileFloorStandard: 22.0,
  tileWallStandard: 24.0,
  tileLargeFormat: 32.0,
  tileMosaic: 38.0,
  tileHerringbone: 35.0,
  waterproofing: 12.0,
  waterproofingTape: 5.0,
  mitreCut45: 18.0,
  skirting: 6.0,
  siliconing: 3.5,
  floorLeveling: 8.0,
  oldTileRemoval: 10.0,
  geberitBoxEnclosure: 65.0,
  nicheCrafting: 55.0,
  walkInSlopeChannel: 75.0,
  drillHoleTile: 6.0,
  includeMaterialsByDefault: false,
  adhesiveBagPrice: 16.5,
  adhesiveKgPerM2: 4.5,
  groutKgPrice: 4.8,
  groutKgPerM2: 0.4,
  waterproofingKgPrice: 3.8,
  levelingBagPrice: 15.0,
  primerM2Price: 1.3,
};

export const DEFAULT_PROFILE: CraftsmanProfile = {
  companyName: 'KERA-PRO Majstorski Obrt',
  ownerName: 'Marko Horvat',
  oib: '12345678901',
  iban: 'HR1223400091110022334',
  bankName: 'Erste & Steiermärkische Bank d.d.',
  email: 'keramika.horvat@gmail.com',
  phone: '+385 91 555 7890',
  address: 'Zagrebačka cesta 142',
  city: '10000 Zagreb',
  isVatRegistered: false,
  vatExemptionNote: 'Pravna osoba nije u sustavu PDV-a prema članku 90. stavak 2. Zakona o PDV-u.',
  defaultPaymentTerms: 'Avans 30% po potvrdi ponude i početku radova, ostatak 70% po primopredaji radova.',
  defaultWarrantyYears: 2,
  defaultOfferValidityDays: 30,
  defaultWastePercent: 10,
};

export const SAMPLE_OFFERS: Offer[] = [
  {
    id: 'ponuda-demo-1',
    offerNumber: '01/2025',
    dateCreated: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'accepted',
    client: {
      name: 'Ivan Kovačević',
      address: 'Ilica 210, stan 4',
      city: 'Zagreb',
      phone: '+385 98 123 4567',
      email: 'ivan.kovacevic@gmail.com',
      projectLocation: 'Zagreb, Črnomerec',
    },
    projectName: 'Kompletna adaptacija kupaonice i hodnika',
    wasteMarginPercent: 10,
    includeMaterials: true,
    discountPercent: 5,
    paymentTerms: 'Avans 30% pri početku radova, 70% po završetku i pregledu.',
    notes: 'Uključeno brušenje na 45° oko Geberita i niše za kozmetiku. Korištenje nivelatora za pločice 60x120.',
    rooms: [
      {
        ...createDefaultRoom('Kupaonica'),
        floorLength: 2.6,
        floorWidth: 2.1,
        floorArea: 5.46,
        tileFloorFormat: '60x60 cm',
        wallHeight: 2.6,
        wallPerimeter: 9.4,
        wallAreaGross: 24.44,
        doorCount: 1,
        doorWidth: 0.8,
        doorHeight: 2.05,
        windowCount: 1,
        windowWidth: 0.7,
        windowHeight: 0.7,
        openingsArea: 2.13,
        wallAreaNet: 22.31,
        tileWallFormat: '60x120 cm (veliki format)',
        tileType: 'large_format',
        applyWaterproofing: true,
        waterproofingArea: 11.5,
        waterproofingTapeMeters: 16.0,
        mitreCut45Meters: 6.5,
        skirtingMeters: 0,
        applySiliconing: true,
        siliconMeters: 14.0,
        applyFloorLeveling: false,
        floorLevelingArea: 0,
        removeOldTiles: true,
        removeOldTilesArea: 27.77,
        geberitCount: 1,
        nicheCount: 1,
        hasWalkInShower: true,
        showerSlopesCount: 1,
        customItems: [],
      },
      {
        id: 'room-demo-hodnik',
        name: 'Hodnik',
        floorLength: 3.4,
        floorWidth: 1.5,
        floorArea: 5.1,
        tileFloorFormat: '60x60 cm',
        wallHeight: 2.6,
        wallPerimeter: 9.8,
        wallAreaGross: 0,
        doorCount: 3,
        doorWidth: 0.8,
        doorHeight: 2.05,
        windowCount: 0,
        windowWidth: 0,
        windowHeight: 0,
        openingsArea: 0,
        wallAreaNet: 0,
        tileWallFormat: '',
        tileType: 'standard',
        applyWaterproofing: false,
        waterproofingArea: 0,
        waterproofingTapeMeters: 0,
        mitreCut45Meters: 0,
        skirtingMeters: 7.4,
        applySiliconing: true,
        siliconMeters: 7.4,
        applyFloorLeveling: true,
        floorLevelingArea: 5.1,
        removeOldTiles: false,
        removeOldTilesArea: 0,
        geberitCount: 0,
        nicheCount: 0,
        hasWalkInShower: false,
        showerSlopesCount: 0,
        customItems: [],
      },
    ],
    totals: {} as any, // populated below
  },
];

// Initialize sample offer totals
SAMPLE_OFFERS[0].totals = calculateOfferTotals(
  SAMPLE_OFFERS[0].rooms,
  DEFAULT_PRICING,
  DEFAULT_PROFILE,
  SAMPLE_OFFERS[0].wasteMarginPercent,
  SAMPLE_OFFERS[0].includeMaterials,
  SAMPLE_OFFERS[0].discountPercent
);

const STORAGE_KEYS = {
  PRICING: 'kerakalk_pricing_v1',
  PROFILE: 'kerakalk_profile_v1',
  OFFERS: 'kerakalk_offers_v1',
  SUBSCRIPTION: 'kerakalk_subscription_v1',
  INVOICES: 'kerakalk_invoices_v1',
};

import { SubscriptionState, PaymentInvoice, PlanTier, PlanConfig } from '../types';

export const PLANS_CONFIG: Record<PlanTier, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free (zauvijek)',
    price: 0,
    billingPeriod: 'zauvijek',
    description: 'Osnovni paket za brzi ručni izračun i jednostavne ponude',
    aiLimit: 2,
    maxProjects: 3,
    hasCustomLogo: false,
    hasExcelExport: false,
    features: [
      'Ručni unos površina (pod, zidovi, otvori)',
      'Broj pločica i kalkulator kutija keramike',
      'Proračun ljepila i mase za fugiranje',
      'Izračun postotka otpada pločica (waste)',
      'Jednostavna ponuda za klijente',
      '2 AI analize nacrta mjesečno',
      'Spremanje do 3 projekta',
    ],
  },
  pro: {
    id: 'pro',
    name: 'AI Pro',
    badge: 'Preporučeno',
    price: 9.99,
    billingPeriod: 'mjesečno',
    description: 'Za profesionalne keramičare koji šalju brendirane ponude s logom',
    aiLimit: 30,
    maxProjects: 25,
    hasCustomLogo: true,
    hasExcelExport: false,
    features: [
      'Sve iz Free paketa',
      '30 AI analiza nacrta mjesečno (kamera i skica)',
      'Službene PDF ponude s vlastitim logom obrta/tvrtke',
      'Spremanje i upravljanje do 25 projekata',
      'Slanje ponude na WhatsApp u 1 klik',
      'Proračun hidroizolacije, traka, gerunga i sokla',
      'R1 račun za porezni trošak poslovanja',
    ],
  },
  business: {
    id: 'business',
    name: 'AI Business',
    badge: 'Maksimalni paket',
    price: 19.99,
    billingPeriod: 'mjesečno',
    description: 'Za veće obrte i firme s više majstora i gradilišta',
    aiLimit: 70,
    maxProjects: -1,
    hasCustomLogo: true,
    hasExcelExport: true,
    features: [
      'Sve iz AI Pro paketa',
      '70 AI analiza nacrta mjesečno',
      'Excel (.xlsx / .csv) detaljan izvoz troškovnika',
      'Neograničen broj projekata i arhiva ponuda',
      'Prioritetna AI obrada skica i tlocrta',
      'Sigurnosni backup baze klijenata i ponuda',
      'R1 račun za porezni odbitak obrta',
    ],
  },
};

export function createInitialSubscription(): SubscriptionState {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  return {
    status: 'active',
    plan: 'free',
    planName: PLANS_CONFIG.free.name,
    pricePerMonth: 0,
    aiAnalysesUsedThisMonth: 0,
    aiAnalysesLimit: PLANS_CONFIG.free.aiLimit,
    monthResetDate: nextMonth.toISOString(),
    autoRenew: true,
  };
}

export function loadSubscription(): SubscriptionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    if (!raw) {
      const initial = createInitialSubscription();
      saveSubscription(initial);
      return initial;
    }
    const sub = JSON.parse(raw);

    // Migracija starih formata na novi sustav s 3 paketa
    let plan: PlanTier = 'free';
    if (sub.plan === 'business' || sub.plan === 'AI Business') {
      plan = 'business';
    } else if (sub.plan === 'pro' || sub.plan === 'AI Pro' || sub.plan === 'monthly_10') {
      plan = 'pro';
    } else if (sub.plan === 'free') {
      plan = 'free';
    } else if (sub.status === 'active') {
      plan = 'pro';
    }

    const config = PLANS_CONFIG[plan] || PLANS_CONFIG.free;

    // Provjera mjesečnog reseta AI kvote
    const now = new Date();
    let monthResetDate = sub.monthResetDate ? new Date(sub.monthResetDate) : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    let aiUsed = typeof sub.aiAnalysesUsedThisMonth === 'number' ? sub.aiAnalysesUsedThisMonth : 0;

    if (now > monthResetDate) {
      aiUsed = 0;
      monthResetDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }

    const updated: SubscriptionState = {
      status: sub.status === 'expired' ? 'expired' : 'active',
      plan,
      planName: config.name,
      pricePerMonth: config.price,
      aiAnalysesUsedThisMonth: aiUsed,
      aiAnalysesLimit: config.aiLimit,
      monthResetDate: monthResetDate.toISOString(),
      subscriptionStartDate: sub.subscriptionStartDate || now.toISOString(),
      nextBillingDate: sub.nextBillingDate,
      paymentMethod: sub.paymentMethod || 'card',
      lastPaymentAmount: sub.lastPaymentAmount || config.price,
      autoRenew: sub.autoRenew !== false,
      trialStartDate: sub.trialStartDate,
      trialEndDate: sub.trialEndDate,
    };

    saveSubscription(updated);
    return updated;
  } catch {
    const initial = createInitialSubscription();
    return initial;
  }
}

export function saveSubscription(sub: SubscriptionState): void {
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(sub));
}

export function getAiQuotaInfo(sub: SubscriptionState) {
  const limit = sub.aiAnalysesLimit || PLANS_CONFIG[sub.plan]?.aiLimit || 2;
  const used = sub.aiAnalysesUsedThisMonth || 0;
  const remaining = Math.max(0, limit - used);
  const percentUsed = Math.min(100, Math.round((used / limit) * 100));

  return {
    used,
    limit,
    remaining,
    percentUsed,
    hasRemaining: remaining > 0,
  };
}

export function recordAiAnalysisUsage(): SubscriptionState {
  const current = loadSubscription();
  const updated: SubscriptionState = {
    ...current,
    aiAnalysesUsedThisMonth: (current.aiAnalysesUsedThisMonth || 0) + 1,
  };
  saveSubscription(updated);
  return updated;
}

export function canCreateProject(currentCount: number, sub: SubscriptionState): { allowed: boolean; max: number } {
  const config = PLANS_CONFIG[sub.plan] || PLANS_CONFIG.free;
  if (config.maxProjects === -1) {
    return { allowed: true, max: -1 };
  }
  return {
    allowed: currentCount < config.maxProjects,
    max: config.maxProjects,
  };
}

export function activatePlan(
  planTier: PlanTier,
  paymentMethod: SubscriptionState['paymentMethod'] = 'card',
  customAmount?: number
): SubscriptionState {
  const now = new Date();
  const nextBilling = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const config = PLANS_CONFIG[planTier] || PLANS_CONFIG.free;
  const amount = customAmount !== undefined ? customAmount : config.price;

  const current = loadSubscription();
  const updated: SubscriptionState = {
    ...current,
    status: 'active',
    plan: planTier,
    planName: config.name,
    pricePerMonth: config.price,
    aiAnalysesLimit: config.aiLimit,
    subscriptionStartDate: now.toISOString(),
    nextBillingDate: planTier === 'free' ? undefined : nextBilling.toISOString(),
    paymentMethod,
    lastPaymentAmount: amount,
    autoRenew: true,
  };

  saveSubscription(updated);

  // Ako se plaća (iznos > 0), evidentiraj službeni R1 račun
  if (amount > 0) {
    const invoice: PaymentInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `R1-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: now.toISOString().split('T')[0],
      amount,
      currency: 'EUR',
      planName: `${config.name} (${config.billingPeriod})`,
      status: 'paid',
      paymentMethod:
        paymentMethod === 'google_pay'
          ? 'Google Pay'
          : paymentMethod === 'apple_pay'
          ? 'Apple Pay'
          : paymentMethod === 'bank_transfer'
          ? 'Virman / Internet bankarstvo'
          : 'Kreditna/Debitna kartica',
    };

    const existingInvoices = loadInvoices();
    saveInvoices([invoice, ...existingInvoices]);
  }

  return updated;
}

export function cancelSubscription(): SubscriptionState {
  const current = loadSubscription();
  const updated: SubscriptionState = {
    ...current,
    autoRenew: false,
  };
  saveSubscription(updated);
  return updated;
}

export function resetAiQuota(): SubscriptionState {
  const current = loadSubscription();
  const updated: SubscriptionState = {
    ...current,
    aiAnalysesUsedThisMonth: 0,
  };
  saveSubscription(updated);
  return updated;
}

export function simulateAiQuotaExhausted(): SubscriptionState {
  const current = loadSubscription();
  const updated: SubscriptionState = {
    ...current,
    aiAnalysesUsedThisMonth: current.aiAnalysesLimit,
  };
  saveSubscription(updated);
  return updated;
}

export function loadInvoices(): PaymentInvoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveInvoices(invoices: PaymentInvoice[]): void {
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
}

export function loadPricing(): PricingSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRICING);
    if (!raw) return DEFAULT_PRICING;
    return { ...DEFAULT_PRICING, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PRICING;
  }
}

export function savePricing(pricing: PricingSettings): void {
  localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(pricing));
}

export function loadProfile(): CraftsmanProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: CraftsmanProfile): void {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function loadOffers(): Offer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFERS);
    if (!raw) {
      saveOffers(SAMPLE_OFFERS);
      return SAMPLE_OFFERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_OFFERS;
  } catch {
    return SAMPLE_OFFERS;
  }
}

export function saveOffers(offers: Offer[]): void {
  localStorage.setItem(STORAGE_KEYS.OFFERS, JSON.stringify(offers));
}

export function getNextOfferNumber(offers: Offer[]): string {
  const currentYear = new Date().getFullYear();
  const count = offers.length + 1;
  const pad = count < 10 ? `0${count}` : `${count}`;
  return `${pad}/${currentYear}`;
}

