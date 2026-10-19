export type TileType = 'standard' | 'large_format' | 'mosaic' | 'herringbone';

export interface RoomItem {
  id: string;
  name: string;
  quantity: number;
  unit: string; // 'm²', 'm\'', 'kom', 'paušal'
  pricePerUnit: number;
  total: number;
}

export interface Room {
  id: string;
  name: string;
  // Floor
  floorLength: number; // m
  floorWidth: number; // m
  floorArea: number; // m²
  tileFloorFormat: string; // npr. '60x60 cm'
  // Walls
  wallHeight: number; // m
  wallPerimeter: number; // m
  wallAreaGross: number; // m²
  doorCount: number;
  doorWidth: number; // m (npr. 0.8)
  doorHeight: number; // m (npr. 2.0)
  windowCount: number;
  windowWidth: number; // m (npr. 0.8)
  windowHeight: number; // m (npr. 0.6)
  openingsArea: number; // m²
  wallAreaNet: number; // m²
  tileWallFormat: string; // npr. '30x60 cm'
  tileType: TileType;
  // Specific tasks
  applyWaterproofing: boolean;
  waterproofingArea: number; // m²
  waterproofingTapeMeters: number; // m'
  mitreCut45Meters: number; // m' (gerung)
  skirtingMeters: number; // m' (sokl)
  applySiliconing: boolean;
  siliconMeters: number; // m'
  applyFloorLeveling: boolean;
  floorLevelingArea: number; // m²
  removeOldTiles: boolean;
  removeOldTilesArea: number; // m²
  geberitCount: number; // kom
  nicheCount: number; // kom
  hasWalkInShower: boolean;
  showerSlopesCount: number; // kom
  customItems: RoomItem[];
  notes?: string;
}

export interface PricingSettings {
  // Labor rates in EUR
  tileFloorStandard: number; // €/m²
  tileWallStandard: number; // €/m²
  tileLargeFormat: number; // €/m² (npr. 60x120+)
  tileMosaic: number; // €/m²
  tileHerringbone: number; // €/m² (riblja kost)
  waterproofing: number; // €/m²
  waterproofingTape: number; // €/m'
  mitreCut45: number; // €/m' (gerung)
  skirting: number; // €/m' (sokl)
  siliconing: number; // €/m'
  floorLeveling: number; // €/m²
  oldTileRemoval: number; // €/m²
  geberitBoxEnclosure: number; // €/kom
  nicheCrafting: number; // €/kom
  walkInSlopeChannel: number; // €/kom
  drillHoleTile: number; // €/kom bušenje rupa
  // Material estimates
  includeMaterialsByDefault: boolean;
  adhesiveBagPrice: number; // € po vreći 25kg
  adhesiveKgPerM2: number; // kg po m2 (tipično 4.5kg)
  groutKgPrice: number; // € po kg
  groutKgPerM2: number; // kg po m2 (tipično 0.4kg)
  waterproofingKgPrice: number; // € po kg (tipično 3.5€)
  levelingBagPrice: number; // € po vreći 25kg (tipično 15€)
  primerM2Price: number; // € po m2
}

export interface CraftsmanProfile {
  companyName: string;
  ownerName: string;
  oib: string;
  iban: string;
  bankName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  isVatRegistered: boolean; // PDV 25% or exemption
  vatExemptionNote: string;
  defaultPaymentTerms: string;
  defaultWarrantyYears: number;
  defaultOfferValidityDays: number;
  defaultWastePercent: number;
  logoUrl?: string; // Base64 data URL logotipa obrta / tvrtke
}

export interface OfferTotals {
  totalFloorArea: number;
  totalWallArea: number;
  totalNetArea: number;
  totalAreaWithWaste: number;
  laborSubtotal: number;
  materialsSubtotal: number;
  discountPercent: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
  vatRate: number; // 0 or 25%
  vatAmount: number;
  grandTotal: number;
  // Material physical units
  estimatedAdhesiveBags: number; // vreće 25kg
  estimatedGroutKg: number; // kg
  estimatedWaterproofingKg: number; // kg
  estimatedPrimerLiters: number; // L
  estimatedLevelingBags: number; // vreće 25kg
}

export type OfferStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'completed';

export interface Offer {
  id: string;
  offerNumber: string;
  dateCreated: string;
  validUntil: string;
  status: OfferStatus;
  client: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    projectLocation: string;
  };
  projectName: string;
  rooms: Room[];
  wasteMarginPercent: number; // npr. 10%
  includeMaterials: boolean;
  discountPercent: number;
  paymentTerms: string;
  notes: string;
  paidAdvanceAmount?: number; // Uplaćeni avans (€)
  tilePackageM2?: number; // m² po kutiji/paketu keramike u trgovini
  totals: OfferTotals;
}

export interface AISketchAnalysisResult {
  title?: string;
  rooms: Array<{
    name: string;
    length?: number;
    width?: number;
    floorArea: number;
    height?: number;
    perimeter?: number;
    wallAreaGross?: number;
    openingsDeduction?: number;
    wallAreaNet: number;
    waterproofingArea?: number;
    mitreCutting45Meters?: number;
    skirtingMeters?: number;
    tileFloorFormat?: string;
    tileWallFormat?: string;
    features?: string[];
    notes?: string;
  }>;
  totalFloorArea: number;
  totalWallArea: number;
  totalWaterproofingArea?: number;
  confidenceScore: number;
  readDimensions?: string[];
  estimatedDimensions?: string[];
  craftsmanRecommendations?: string[];
  sketchObservations: string;
}

export interface AISketchGuidelines {
  headline: string;
  summary: string;
  sections: Array<{
    id: string;
    title: string;
    icon: string;
    mustHaveItems: string[];
    proTip?: string;
  }>;
  photoTips: string[];
  exampleSketchDescription?: string;
}

export type PlanTier = 'free' | 'pro' | 'business';
export type AddonTier = 'addon_10' | 'addon_25';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  badge?: string;
  price: number;
  billingPeriod: string;
  description: string;
  aiLimit: number;
  maxProjects: number; // -1 = neograničeno
  hasCustomLogo: boolean;
  hasExcelExport: boolean;
  features: string[];
}

export interface AddonPackage {
  id: AddonTier;
  name: string;
  analysesCount: number; // 10 ili 25
  price: number; // 2.99 ili 5.99
  unitPrice: string; // '0,30 €/analizi' ili '0,24 €/analizi'
  badge?: string;
  description: string;
}

export interface SubscriptionState {
  status: 'active' | 'trial' | 'expired';
  plan: PlanTier;
  planName: string;
  pricePerMonth: number; // 0, 9.99 ili 19.99
  aiAnalysesUsedThisMonth: number;
  aiAnalysesLimit: number; // 2 (Free), 30 (Pro), 70 (Business)
  extraAiAnalyses?: number; // Jednokratno kupljene dodatne analize (+10 ili +25)
  monthResetDate: string;
  subscriptionStartDate?: string;
  nextBillingDate?: string;
  paymentMethod?: 'card' | 'google_pay' | 'apple_pay' | 'bank_transfer';
  lastPaymentAmount?: number;
  autoRenew: boolean;
  trialStartDate?: string;
  trialEndDate?: string;
}

export interface PaymentInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  currency: string;
  planName: string;
  status: 'paid' | 'pending';
  paymentMethod: string;
}

