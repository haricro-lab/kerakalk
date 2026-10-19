import { Offer, CraftsmanProfile, PricingSettings } from '../types';

/**
 * Generira profesionalnu Excel / CSV datoteku za ponudu keramičara
 * Koristi UTF-8 BOM (\uFEFF) i točku-zarez (;) kao separator za besprijekoran prikaz
 * u hrvatskom/europskom Microsoft Excelu, LibreOffice Calcu i Google Tablicama.
 */
export function generateOfferExcelCSV(
  offer: Offer,
  profile: CraftsmanProfile,
  pricing: PricingSettings
): string {
  const rows: string[][] = [];

  // Helper za siguran unos u CSV (ako sadrži ; ili navodnike)
  const sanitize = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const formatNumber = (num: number): string => {
    return num.toFixed(2).replace('.', ',');
  };

  // 1. ZAGLAVLJE DOKUMENTA
  rows.push(['PONUDA ZA KERAMIČARSKE RADOVE']);
  rows.push(['Broj ponude:', offer.offerNumber, 'Datum izrade:', offer.dateCreated, 'Vrijedi do:', offer.validUntil]);
  rows.push(['Projekt:', offer.projectName, 'Status:', offer.status.toUpperCase()]);
  rows.push([]);

  // 2. PODACI O IZVOĐAČU I KLIJENTU
  rows.push(['IZVOĐAČ RADOVA', '', '', 'NARUČITELJ / KLIJENT']);
  rows.push(['Naziv / Ime:', profile.companyName, '', 'Ime i prezime:', offer.client.name]);
  rows.push(['Vlasnik:', profile.ownerName, '', 'Adresa:', offer.client.address]);
  rows.push(['OIB:', profile.oib, '', 'Grad / Lokacija:', offer.client.city]);
  rows.push(['IBAN:', profile.iban, '', 'Lokacija projekta:', offer.client.projectLocation || offer.client.city]);
  rows.push(['Banka:', profile.bankName, '', 'Telefon:', offer.client.phone]);
  rows.push(['Telefon:', profile.phone, '', 'E-mail:', offer.client.email]);
  rows.push(['E-mail:', profile.email, '', '', '']);
  rows.push([]);

  // 3. SPECIFIKACIJA PROSTORIJA I DIMENZIJA
  rows.push(['SPECIFIKACIJA PROSTORIJA I KVADRATURA']);
  rows.push([
    'R.br.',
    'Prostorija',
    'Pod D x Š (m)',
    'Pod (m²)',
    'Format poda',
    'Zid Visina (m)',
    'Opseg (m)',
    'Bruto zidovi (m²)',
    'Odbici otvora (m²)',
    'Neto zidovi (m²)',
    'Format zida',
    'Hidroizolacija (m²)',
    'Gerung 45° (m\')',
    'Sokl (m\')',
  ]);

  offer.rooms.forEach((room, idx) => {
    rows.push([
      String(idx + 1),
      room.name,
      room.floorLength && room.floorWidth ? `${room.floorLength} x ${room.floorWidth}` : '-',
      formatNumber(room.floorArea),
      room.tileFloorFormat || '-',
      formatNumber(room.wallHeight),
      formatNumber(room.wallPerimeter),
      formatNumber(room.wallAreaGross),
      formatNumber(room.openingsArea),
      formatNumber(room.wallAreaNet),
      room.tileWallFormat || '-',
      formatNumber(room.waterproofingArea || 0),
      formatNumber(room.mitreCut45Meters || 0),
      formatNumber(room.skirtingMeters || 0),
    ]);
  });

  rows.push([]);
  rows.push([
    'UKUPNO KVADRATURA:',
    '',
    'Ukupno pod:',
    formatNumber(offer.totals.totalFloorArea) + ' m²',
    '',
    'Ukupno zidovi:',
    formatNumber(offer.totals.totalWallArea) + ' m²',
    '',
    'Ukupno neto površina:',
    formatNumber(offer.totals.totalNetArea) + ' m²',
    '',
    `S uračunatim otpadom (${offer.wasteMarginPercent}%):`,
    formatNumber(offer.totals.totalAreaWithWaste) + ' m²',
  ]);
  rows.push([]);

  // 4. TROŠKOVNIK RADOVA
  rows.push(['TROŠKOVNIK KERAMIČARSKIH RADOVA']);
  rows.push(['Stavka', 'Opis radova i normativ', 'Količina', 'Jed. mjere', 'Cijena po jed. (€)', 'Ukupno (€)']);

  let itemIdx = 1;
  offer.rooms.forEach((room) => {
    // Podna keramika
    if (room.floorArea > 0) {
      let unitPrice = pricing.tileFloorStandard;
      if (room.tileType === 'large_format') unitPrice = pricing.tileLargeFormat;
      if (room.tileType === 'mosaic') unitPrice = pricing.tileMosaic;
      if (room.tileType === 'herringbone') unitPrice = pricing.tileHerringbone;
      const total = room.floorArea * unitPrice;
      rows.push([
        String(itemIdx++),
        `Polaganje podne keramike - ${room.name} (${room.tileFloorFormat || 'Standard'})`,
        formatNumber(room.floorArea),
        'm²',
        formatNumber(unitPrice),
        formatNumber(total),
      ]);
    }

    // Zidna keramika
    if (room.wallAreaNet > 0) {
      let unitPrice = pricing.tileWallStandard;
      if (room.tileType === 'large_format') unitPrice = pricing.tileLargeFormat;
      if (room.tileType === 'mosaic') unitPrice = pricing.tileMosaic;
      if (room.tileType === 'herringbone') unitPrice = pricing.tileHerringbone;
      const total = room.wallAreaNet * unitPrice;
      rows.push([
        String(itemIdx++),
        `Polaganje zidne keramike - ${room.name} (${room.tileWallFormat || 'Standard'})`,
        formatNumber(room.wallAreaNet),
        'm²',
        formatNumber(unitPrice),
        formatNumber(total),
      ]);
    }

    // Hidroizolacija
    if (room.applyWaterproofing && room.waterproofingArea > 0) {
      const total = room.waterproofingArea * pricing.waterproofing;
      rows.push([
        String(itemIdx++),
        `Nanošenje 2K polimercementne hidroizolacije - ${room.name}`,
        formatNumber(room.waterproofingArea),
        'm²',
        formatNumber(pricing.waterproofing),
        formatNumber(total),
      ]);
    }

    // Hidroizolacijska traka
    if (room.waterproofingTapeMeters > 0) {
      const total = room.waterproofingTapeMeters * pricing.waterproofingTape;
      rows.push([
        String(itemIdx++),
        `Ugradnja brtvene trake u kuteve - ${room.name}`,
        formatNumber(room.waterproofingTapeMeters),
        'm\'',
        formatNumber(pricing.waterproofingTape),
        formatNumber(total),
      ]);
    }

    // Brušenje na 45 stupnjeva (Gerung)
    if (room.mitreCut45Meters > 0) {
      const total = room.mitreCut45Meters * pricing.mitreCut45;
      rows.push([
        String(itemIdx++),
        `Rezanje i brušenje keramike na 45° (gerung) - ${room.name}`,
        formatNumber(room.mitreCut45Meters),
        'm\'',
        formatNumber(pricing.mitreCut45),
        formatNumber(total),
      ]);
    }

    // Izrada sokla
    if (room.skirtingMeters > 0) {
      const total = room.skirtingMeters * pricing.skirting;
      rows.push([
        String(itemIdx++),
        `Rezanje i postavljanje keramičkog sokla - ${room.name}`,
        formatNumber(room.skirtingMeters),
        'm\'',
        formatNumber(pricing.skirting),
        formatNumber(total),
      ]);
    }

    // Silikoniranje
    if (room.applySiliconing && room.siliconMeters > 0) {
      const total = room.siliconMeters * pricing.siliconing;
      rows.push([
        String(itemIdx++),
        `Sanitarno silikoniranje unutarnjih kuteva - ${room.name}`,
        formatNumber(room.siliconMeters),
        'm\'',
        formatNumber(pricing.siliconing),
        formatNumber(total),
      ]);
    }

    // Niveliranje poda
    if (room.applyFloorLeveling && room.floorLevelingArea > 0) {
      const total = room.floorLevelingArea * pricing.floorLeveling;
      rows.push([
        String(itemIdx++),
        `Priprema podloge i izlijevanje nivelir mase - ${room.name}`,
        formatNumber(room.floorLevelingArea),
        'm²',
        formatNumber(pricing.floorLeveling),
        formatNumber(total),
      ]);
    }

    // Skidanje starih pločica
    if (room.removeOldTiles && room.removeOldTilesArea > 0) {
      const total = room.removeOldTilesArea * pricing.oldTileRemoval;
      rows.push([
        String(itemIdx++),
        `Štemanje i uklanjanje starih pločica - ${room.name}`,
        formatNumber(room.removeOldTilesArea),
        'm²',
        formatNumber(pricing.oldTileRemoval),
        formatNumber(total),
      ]);
    }

    // Geberit obloga
    if (room.geberitCount > 0) {
      const total = room.geberitCount * pricing.geberitBoxEnclosure;
      rows.push([
        String(itemIdx++),
        `Oblaganje ugradbenog vodokotlića keramikom - ${room.name}`,
        formatNumber(room.geberitCount),
        'kom',
        formatNumber(pricing.geberitBoxEnclosure),
        formatNumber(total),
      ]);
    }

    // Niša
    if (room.nicheCount > 0) {
      const total = room.nicheCount * pricing.nicheCrafting;
      rows.push([
        String(itemIdx++),
        `Precizna izrada i oblaganje šampon niše - ${room.name}`,
        formatNumber(room.nicheCount),
        'kom',
        formatNumber(pricing.nicheCrafting),
        formatNumber(total),
      ]);
    }

    // Walk-in tuš padovi
    if (room.hasWalkInShower && room.showerSlopesCount > 0) {
      const total = room.showerSlopesCount * pricing.walkInSlopeChannel;
      rows.push([
        String(itemIdx++),
        `Izvedba padova prema linijskoj tuš kanalici - ${room.name}`,
        formatNumber(room.showerSlopesCount),
        'kom',
        formatNumber(pricing.walkInSlopeChannel),
        formatNumber(total),
      ]);
    }

    // Prilagođene stavke
    if (room.customItems && room.customItems.length > 0) {
      room.customItems.forEach((ci) => {
        rows.push([
          String(itemIdx++),
          `${ci.name} - ${room.name}`,
          formatNumber(ci.quantity),
          ci.unit,
          formatNumber(ci.pricePerUnit),
          formatNumber(ci.total),
        ]);
      });
    }
  });

  rows.push([]);

  // 5. PRORAČUN POTREBNOG GRAĐEVINSKOG MATERIJALA
  rows.push(['NORMATIV I PRORAČUN POTREBNOG MATERIJALA']);
  rows.push(['Materijal', 'Preporučena specifikacija', 'Proračunata količina', 'Jedinica']);
  rows.push([
    'Keramičke pločice (bruto s otpadom)',
    `${offer.wasteMarginPercent}% rezerve za rezanje`,
    formatNumber(offer.totals.totalAreaWithWaste),
    'm²',
  ]);
  rows.push([
    'Fleksibilno ljepilo za keramiku',
    'Klasa C2TE S1 (cca 4,5 kg/m²)',
    `${offer.totals.estimatedAdhesiveBags}`,
    'vreća 25 kg',
  ]);
  rows.push([
    'Masa za fugiranje (vodoodbojna)',
    'Fina fuga s fungicidom (cca 0,4 kg/m²)',
    formatNumber(offer.totals.estimatedGroutKg),
    'kg',
  ]);
  rows.push([
    'Hidroizolacijski premaz 2K',
    'Elastični polimercement (kupaonice/terase)',
    formatNumber(offer.totals.estimatedWaterproofingKg),
    'kg',
  ]);
  rows.push([
    'Temeljni premaz (Primer)',
    'Dubinski kontaktni premaz za podlogu',
    formatNumber(offer.totals.estimatedPrimerLiters),
    'L',
  ]);
  if (offer.totals.estimatedLevelingBags > 0) {
    rows.push([
      'Samonivelirajuća masa za podove',
      'Vreće 25 kg za izravnavanje podloge',
      `${offer.totals.estimatedLevelingBags}`,
      'vreća 25 kg',
    ]);
  }
  rows.push([]);

  // 6. FINANCIJSKA REKAPITULACIJA
  rows.push(['FINANCIJSKI OBRAČUN I REKAPITULACIJA']);
  rows.push(['Opis financijskih stavki', '', '', '', '', 'Iznos (€)']);
  rows.push(['Ukupno radovi (radna snaga):', '', '', '', '', formatNumber(offer.totals.laborSubtotal)]);
  if (offer.includeMaterials) {
    rows.push(['Ukupno procijenjeni materijali:', '', '', '', '', formatNumber(offer.totals.materialsSubtotal)]);
  }
  if (offer.discountPercent > 0) {
    rows.push([
      `Popust (${offer.discountPercent}%):`,
      '',
      '',
      '',
      '',
      `-${formatNumber(offer.totals.discountAmount)}`,
    ]);
    rows.push(['Iznos nakon popusta:', '', '', '', '', formatNumber(offer.totals.subtotalAfterDiscount)]);
  }
  if (profile.isVatRegistered) {
    rows.push(['PDV (25%):', '', '', '', '', formatNumber(offer.totals.vatAmount)]);
  } else {
    rows.push(['PDV:', profile.vatExemptionNote || 'Oslobođeno PDV-a prema čl. 90 st. 2 Zakona o PDV-u', '', '', '', '0,00']);
  }
  rows.push(['SVEUKUPNO ZA NAPLATU:', '', '', '', '', formatNumber(offer.totals.grandTotal)]);

  if (offer.paidAdvanceAmount && offer.paidAdvanceAmount > 0) {
    rows.push(['Uplaćeni avans:', '', '', '', '', `-${formatNumber(offer.paidAdvanceAmount)}`]);
    rows.push(['Preostalo za uplatu:', '', '', '', '', formatNumber(offer.totals.grandTotal - offer.paidAdvanceAmount)]);
  }

  rows.push([]);
  rows.push(['UVJETI PLAĆANJA I NAPOMENE:']);
  rows.push(['Uvjeti plaćanja:', offer.paymentTerms || profile.defaultPaymentTerms]);
  rows.push(['Napomene majstora:', offer.notes || 'Nema dodatnih napomena.']);
  rows.push(['Jamstvo na izvedene radove:', `${profile.defaultWarrantyYears} godine.`]);

  // Spoji sve u CSV s točkom-zarezom i dodaj UTF-8 BOM
  const csvContent = '\uFEFF' + rows.map((r) => r.map(sanitize).join(';')).join('\r\n');
  return csvContent;
}

/**
 * Pokreće preuzimanje CSV/Excel datoteke u pregledniku
 */
export function downloadOfferExcel(offer: Offer, profile: CraftsmanProfile, pricing: PricingSettings): void {
  const csvData = generateOfferExcelCSV(offer, profile, pricing);
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const cleanNumber = (offer.offerNumber || 'ponuda').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanClient = (offer.client.name || 'klijent').replace(/[^a-zA-Z0-9_-]/g, '_');
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Ponuda_${cleanNumber}_${cleanClient}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
