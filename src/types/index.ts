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
