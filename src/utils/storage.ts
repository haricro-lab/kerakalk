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
};

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
