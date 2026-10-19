import { Room, PricingSettings, OfferTotals, CraftsmanProfile } from '../types';

/**
 * Calculates derived geometric properties of a room
 */
export function recalculateRoomGeometry(room: Room): Room {
  // If length & width provided, recalculate floorArea and perimeter if not manually altered
  let floorArea = room.floorArea;
  let wallPerimeter = room.wallPerimeter;

  if (room.floorLength > 0 && room.floorWidth > 0) {
    floorArea = Number((room.floorLength * room.floorWidth).toFixed(2));
    wallPerimeter = Number(((room.floorLength + room.floorWidth) * 2).toFixed(2));
  }

  // Calculate gross wall area
  const wallAreaGross = Number((wallPerimeter * (room.wallHeight || 2.5)).toFixed(2));

  // Deductions for doors and windows
  const doorArea = (room.doorCount || 0) * (room.doorWidth || 0.8) * (room.doorHeight || 2.0);
  const windowArea = (room.windowCount || 0) * (room.windowWidth || 0.8) * (room.windowHeight || 0.6);
  const openingsArea = Number((doorArea + windowArea).toFixed(2));

  // Net wall area cannot be negative
  const wallAreaNet = Math.max(0, Number((wallAreaGross - openingsArea).toFixed(2)));

  // Default waterproofing if enabled and not set: floor area + shower wall splash zone (~4-6m²)
  let waterproofingArea = room.waterproofingArea;
  if (room.applyWaterproofing && (!waterproofingArea || waterproofingArea <= 0)) {
    waterproofingArea = Number((floorArea + (room.hasWalkInShower ? 6 : 4)).toFixed(2));
  }

  // Default skirting (sokl) if wall area is 0 (i.e. floor-only like hallways/balconies)
  let skirtingMeters = room.skirtingMeters;
  if (wallAreaNet === 0 && wallPerimeter > 0 && skirtingMeters === 0) {
    skirtingMeters = Math.max(0, Number((wallPerimeter - (room.doorCount * (room.doorWidth || 0.8))).toFixed(2)));
  }

  return {
    ...room,
    floorArea,
    wallPerimeter,
    wallAreaGross,
    openingsArea,
    wallAreaNet,
    waterproofingArea,
    skirtingMeters,
  };
}

/**
 * Calculates complete offer totals: labor, materials, discounts, VAT and physical units
 */
export function calculateOfferTotals(
  rooms: Room[],
  pricing: PricingSettings,
  profile: CraftsmanProfile,
  wastePercent: number = 10,
  includeMaterials: boolean = false,
  discountPercent: number = 0
): OfferTotals {
  let totalFloorArea = 0;
  let totalWallArea = 0;
  let laborSubtotal = 0;
  let materialsSubtotal = 0;

  let totalAdhesiveKg = 0;
  let totalGroutKg = 0;
  let totalWaterproofingKg = 0;
  let totalLevelingKg = 0;
  let totalPrimerArea = 0;

  for (const r of rooms) {
    const room = recalculateRoomGeometry(r);
    totalFloorArea += room.floorArea;
    totalWallArea += room.wallAreaNet;

    // Determine rate per m² based on tile type
    let floorRate = pricing.tileFloorStandard;
    let wallRate = pricing.tileWallStandard;

    if (room.tileType === 'large_format') {
      floorRate = pricing.tileLargeFormat;
      wallRate = pricing.tileLargeFormat;
    } else if (room.tileType === 'mosaic') {
      floorRate = pricing.tileMosaic;
      wallRate = pricing.tileMosaic;
    } else if (room.tileType === 'herringbone') {
      floorRate = pricing.tileHerringbone;
      wallRate = pricing.tileHerringbone;
    }

    // 1. Tile laying labor
    laborSubtotal += room.floorArea * floorRate;
    laborSubtotal += room.wallAreaNet * wallRate;

    // 2. Waterproofing
    if (room.applyWaterproofing && room.waterproofingArea > 0) {
      laborSubtotal += room.waterproofingArea * pricing.waterproofing;
      laborSubtotal += (room.waterproofingTapeMeters || 0) * pricing.waterproofingTape;
      totalWaterproofingKg += room.waterproofingArea * 1.5; // ~1.5kg/m2 per 2 coats
    }

    // 3. Mitre 45° cuts (gerung)
    if (room.mitreCut45Meters > 0) {
      laborSubtotal += room.mitreCut45Meters * pricing.mitreCut45;
    }

    // 4. Skirting (sokl)
    if (room.skirtingMeters > 0) {
      laborSubtotal += room.skirtingMeters * pricing.skirting;
    }

    // 5. Siliconing
    if (room.applySiliconing && (room.siliconMeters || 0) > 0) {
      laborSubtotal += room.siliconMeters * pricing.siliconing;
    }

    // 6. Floor leveling / preparation
    if (room.applyFloorLeveling && (room.floorLevelingArea || room.floorArea) > 0) {
      const area = room.floorLevelingArea || room.floorArea;
      laborSubtotal += area * pricing.floorLeveling;
      totalLevelingKg += area * 5.0; // ~5kg/m2 for 3-4mm layer
    }

    // 7. Old tile removal
    if (room.removeOldTiles && (room.removeOldTilesArea || (room.floorArea + room.wallAreaNet)) > 0) {
      const area = room.removeOldTilesArea || (room.floorArea + room.wallAreaNet);
      laborSubtotal += area * pricing.oldTileRemoval;
    }

    // 8. Geberit enclosure
    if (room.geberitCount > 0) {
      laborSubtotal += room.geberitCount * pricing.geberitBoxEnclosure;
    }

    // 9. Niche crafting
    if (room.nicheCount > 0) {
      laborSubtotal += room.nicheCount * pricing.nicheCrafting;
    }

    // 10. Walk-in slope & channel
    if (room.hasWalkInShower) {
      laborSubtotal += (room.showerSlopesCount || 1) * pricing.walkInSlopeChannel;
    }

    // 11. Custom items in room
    if (room.customItems && room.customItems.length > 0) {
      for (const item of room.customItems) {
        laborSubtotal += (item.quantity || 0) * (item.pricePerUnit || 0);
      }
    }

    // Materials consumption
    const roomTotalArea = room.floorArea + room.wallAreaNet;
    totalPrimerArea += roomTotalArea;
    totalAdhesiveKg += roomTotalArea * (pricing.adhesiveKgPerM2 || 4.5);
    totalGroutKg += roomTotalArea * (pricing.groutKgPerM2 || 0.4);
  }

  const totalNetArea = Number((totalFloorArea + totalWallArea).toFixed(2));
  const wasteMultiplier = 1 + (wastePercent || 0) / 100;
  const totalAreaWithWaste = Number((totalNetArea * wasteMultiplier).toFixed(2));

  // Convert material kg to bags
  const estimatedAdhesiveBags = Math.ceil(totalAdhesiveKg / 25);
  const estimatedGroutKg = Math.ceil(totalGroutKg);
  const estimatedWaterproofingKg = Math.ceil(totalWaterproofingKg);
  const estimatedLevelingBags = Math.ceil(totalLevelingKg / 25);
  const estimatedPrimerLiters = Math.ceil(totalPrimerArea * 0.15); // ~0.15 L/m²

  // Calculate material monetary cost if checked
  if (includeMaterials) {
    materialsSubtotal += estimatedAdhesiveBags * pricing.adhesiveBagPrice;
    materialsSubtotal += estimatedGroutKg * pricing.groutKgPrice;
    materialsSubtotal += totalWaterproofingKg * (pricing.waterproofingKgPrice || 3.5);
    materialsSubtotal += estimatedLevelingBags * (pricing.levelingBagPrice || 15);
    materialsSubtotal += totalPrimerArea * (pricing.primerM2Price || 1.2);
  }

  laborSubtotal = Number(laborSubtotal.toFixed(2));
  materialsSubtotal = Number(materialsSubtotal.toFixed(2));
  const combinedSubtotal = laborSubtotal + materialsSubtotal;

  const discountAmount = Number(((combinedSubtotal * (discountPercent || 0)) / 100).toFixed(2));
  const subtotalAfterDiscount = Number((combinedSubtotal - discountAmount).toFixed(2));

  const vatRate = profile.isVatRegistered ? 25 : 0;
  const vatAmount = profile.isVatRegistered
    ? Number(((subtotalAfterDiscount * vatRate) / 100).toFixed(2))
    : 0;

  const grandTotal = Number((subtotalAfterDiscount + vatAmount).toFixed(2));

  return {
    totalFloorArea: Number(totalFloorArea.toFixed(2)),
    totalWallArea: Number(totalWallArea.toFixed(2)),
    totalNetArea,
    totalAreaWithWaste,
    laborSubtotal,
    materialsSubtotal,
    discountPercent,
    discountAmount,
    subtotalAfterDiscount,
    vatRate,
    vatAmount,
    grandTotal,
    estimatedAdhesiveBags,
    estimatedGroutKg,
    estimatedWaterproofingKg,
    estimatedPrimerLiters,
    estimatedLevelingBags,
  };
}

/**
 * Creates an empty default room
 */
export function createDefaultRoom(name = 'Kupaonica'): Room {
  return {
    id: `room-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name,
    floorLength: 2.5,
    floorWidth: 2.0,
    floorArea: 5.0,
    tileFloorFormat: '60x60 cm',
    wallHeight: 2.5,
    wallPerimeter: 9.0,
    wallAreaGross: 22.5,
    doorCount: 1,
    doorWidth: 0.8,
    doorHeight: 2.0,
    windowCount: 1,
    windowWidth: 0.6,
    windowHeight: 0.6,
    openingsArea: 1.96,
    wallAreaNet: 20.54,
    tileWallFormat: '30x60 cm',
    tileType: 'standard',
    applyWaterproofing: true,
    waterproofingArea: 10.0,
    waterproofingTapeMeters: 14.0,
    mitreCut45Meters: 5.0,
    skirtingMeters: 0,
    applySiliconing: true,
    siliconMeters: 12.0,
    applyFloorLeveling: false,
    floorLevelingArea: 0,
    removeOldTiles: false,
    removeOldTilesArea: 0,
    geberitCount: 1,
    nicheCount: 1,
    hasWalkInShower: true,
    showerSlopesCount: 1,
    customItems: [],
  };
}
