import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Printer,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Sparkles,
  MessageCircle,
  Mail,
  Download,
  Calendar,
  Building,
  User,
  Phone,
  FileCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Offer, CraftsmanProfile, PricingSettings } from '../types';

interface Props {
  offer: Offer;
  profile: CraftsmanProfile;
  pricing: PricingSettings;
  onBackToEdit: () => void;
  onUpdateStatus: (status: Offer['status']) => void;
}

export const OfferDocument: React.FC<Props> = ({
  offer,
  profile,
  pricing,
  onBackToEdit,
  onUpdateStatus,
}) => {
  const [copied, setCopied] = useState(false);
  const [aiMessageOpen, setAiMessageOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [whatsappText, setWhatsappText] = useState('');
  const [emailText, setEmailText] = useState('');
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!documentRef.current) return;
    setPdfGenerating(true);
    try {
      const element = documentRef.current;
      // High resolution scale 2 for crisp vector-like text
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pageHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Handle multi-page documents cleanly if offer has many rooms/items
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const cleanClientName = (offer.client.name || 'Klijent').replace(/[^a-zA-Z0-9_\u00C0-\u017F-]/g, '_');
      const cleanOfferNo = (offer.offerNumber || 'Ponuda').replace(/[^a-zA-Z0-9_-]/g, '-');
      const fileName = `Ponuda_${cleanOfferNo}_${cleanClientName}.pdf`;

      pdf.save(fileName);
    } catch (error) {
      console.error('Greška pri izradi PDF-a:', error);
      alert('Došlo je do greške prilikom generiranja PDF datoteke. Možete koristiti opciju "Ispiši / Spremi kao PDF".');
    } finally {
      setPdfGenerating(false);
    }
  };

  // Compile individual line items from rooms
  interface LineItem {
    id: string;
    roomName: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
  }

  const lineItems: LineItem[] = [];

  offer.rooms.forEach((room, rIdx) => {
    // 1. Pod
    if (room.floorArea > 0) {
      let floorRate = pricing.tileFloorStandard;
      if (room.tileType === 'large_format') floorRate = pricing.tileLargeFormat;
      else if (room.tileType === 'mosaic') floorRate = pricing.tileMosaic;
      else if (room.tileType === 'herringbone') floorRate = pricing.tileHerringbone;

      lineItems.push({
        id: `line-${rIdx}-floor`,
        roomName: room.name,
        description: `Postavljanje podnih keramičkih pločica (${room.tileFloorFormat || 'standardni format'})`,
        quantity: room.floorArea,
        unit: 'm²',
        unitPrice: floorRate,
        totalPrice: Number((room.floorArea * floorRate).toFixed(2)),
      });
    }

    // 2. Zidovi
    if (room.wallAreaNet > 0) {
      let wallRate = pricing.tileWallStandard;
      if (room.tileType === 'large_format') wallRate = pricing.tileLargeFormat;
      else if (room.tileType === 'mosaic') wallRate = pricing.tileMosaic;
      else if (room.tileType === 'herringbone') wallRate = pricing.tileHerringbone;

      lineItems.push({
        id: `line-${rIdx}-wall`,
        roomName: room.name,
        description: `Postavljanje zidnih pločica (${room.tileWallFormat || 'standardni format'}) s odbitkom otvora`,
        quantity: room.wallAreaNet,
        unit: 'm²',
        unitPrice: wallRate,
        totalPrice: Number((room.wallAreaNet * wallRate).toFixed(2)),
      });
    }

    // 3. Hidroizolacija
    if (room.applyWaterproofing && room.waterproofingArea > 0) {
      lineItems.push({
        id: `line-${rIdx}-hydro`,
        roomName: room.name,
        description: `Dvokomponentna elastična hidroizolacija poda i tuš zone (2 sloja)`,
        quantity: room.waterproofingArea,
        unit: 'm²',
        unitPrice: pricing.waterproofing,
        totalPrice: Number((room.waterproofingArea * pricing.waterproofing).toFixed(2)),
      });
    }

    // 4. Brtvena traka
    if (room.applyWaterproofing && (room.waterproofingTapeMeters || 0) > 0) {
      lineItems.push({
        id: `line-${rIdx}-hydrotape`,
        roomName: room.name,
        description: `Ugradnja elastične brtvene trake u kuteve poda i zidova`,
        quantity: room.waterproofingTapeMeters,
        unit: 'm\'',
        unitPrice: pricing.waterproofingTape,
        totalPrice: Number((room.waterproofingTapeMeters * pricing.waterproofingTape).toFixed(2)),
      });
    }

    // 5. Gerung 45°
    if ((room.mitreCut45Meters || 0) > 0) {
      lineItems.push({
        id: `line-${rIdx}-gerung`,
        roomName: room.name,
        description: `Fino brušenje vanjskih bridova keramike pod 45° (gerung)`,
        quantity: room.mitreCut45Meters,
        unit: 'm\'',
        unitPrice: pricing.mitreCut45,
        totalPrice: Number((room.mitreCut45Meters * pricing.mitreCut45).toFixed(2)),
      });
    }

    // 6. Sokl
    if ((room.skirtingMeters || 0) > 0) {
      lineItems.push({
        id: `line-${rIdx}-sokl`,
        roomName: room.name,
        description: `Rezanje, obrada i postavljanje keramičkog sokla (podne lajsne)`,
        quantity: room.skirtingMeters,
        unit: 'm\'',
        unitPrice: pricing.skirting,
        totalPrice: Number((room.skirtingMeters * pricing.skirting).toFixed(2)),
      });
    }

    // 7. Silikon
    if (room.applySiliconing && (room.siliconMeters || 0) > 0) {
      lineItems.push({
        id: `line-${rIdx}-silicon`,
        roomName: room.name,
        description: `Brtvljenje sanitarnim silikonom s fungicidom u svim kutovima`,
        quantity: room.siliconMeters,
        unit: 'm\'',
        unitPrice: pricing.siliconing,
        totalPrice: Number((room.siliconMeters * pricing.siliconing).toFixed(2)),
      });
    }

    // 8. Niveliranje
    if (room.applyFloorLeveling && (room.floorLevelingArea || room.floorArea) > 0) {
      const area = room.floorLevelingArea || room.floorArea;
      lineItems.push({
        id: `line-${rIdx}-leveling`,
        roomName: room.name,
        description: `Impregnacija podloge i izlijevanje samonivelirajuće mase`,
        quantity: area,
        unit: 'm²',
        unitPrice: pricing.floorLeveling,
        totalPrice: Number((area * pricing.floorLeveling).toFixed(2)),
      });
    }

    // 9. Štemanje
    if (room.removeOldTiles && (room.removeOldTilesArea || room.floorArea) > 0) {
      const area = room.removeOldTilesArea || room.floorArea + room.wallAreaNet;
      lineItems.push({
        id: `line-${rIdx}-demo`,
        roomName: room.name,
        description: `Štemanje i skidanje postojećih pločica s odvozom šute`,
        quantity: area,
        unit: 'm²',
        unitPrice: pricing.oldTileRemoval,
        totalPrice: Number((area * pricing.oldTileRemoval).toFixed(2)),
      });
    }

    // 10. Geberit
    if ((room.geberitCount || 0) > 0) {
      lineItems.push({
        id: `line-${rIdx}-geberit`,
        roomName: room.name,
        description: `Oblaganje ugradbenog vodokotlića gips pločama i keramikom`,
        quantity: room.geberitCount,
        unit: 'kom',
        unitPrice: pricing.geberitBoxEnclosure,
        totalPrice: Number((room.geberitCount * pricing.geberitBoxEnclosure).toFixed(2)),
      });
    }

    // 11. Niša
    if ((room.nicheCount || 0) > 0) {
      lineItems.push({
        id: `line-${rIdx}-niche`,
        roomName: room.name,
        description: `Izrada i precizno opločenje zidne niše za šampone`,
        quantity: room.nicheCount,
        unit: 'kom',
        unitPrice: pricing.nicheCrafting,
        totalPrice: Number((room.nicheCount * pricing.nicheCrafting).toFixed(2)),
      });
    }

    // 12. Walk-in kanalica
    if (room.hasWalkInShower) {
      lineItems.push({
        id: `line-${rIdx}-shower`,
        roomName: room.name,
        description: `Izrada padova u walk-in tušu i ugradnja linijske kanalice`,
        quantity: room.showerSlopesCount || 1,
        unit: 'kom',
        unitPrice: pricing.walkInSlopeChannel,
        totalPrice: Number(((room.showerSlopesCount || 1) * pricing.walkInSlopeChannel).toFixed(2)),
      });
    }

    // 13. Custom items
    if (room.customItems && room.customItems.length > 0) {
      room.customItems.forEach((ci, ciIdx) => {
        lineItems.push({
          id: `line-${rIdx}-custom-${ciIdx}`,
          roomName: room.name,
          description: ci.name,
          quantity: ci.quantity,
          unit: ci.unit,
          unitPrice: ci.pricePerUnit,
          totalPrice: Number((ci.quantity * ci.pricePerUnit).toFixed(2)),
        });
      });
    }
  });

  const generateAIMessage = async () => {
    setAiLoading(true);
    setAiMessageOpen(true);

    try {
      const res = await fetch('/api/ai/generate-offer-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: offer.client.name,
          projectName: offer.projectName,
          totalAmount: offer.totals.grandTotal,
          rooms: offer.rooms.map((r) => r.name),
          servicesCount: lineItems.length,
          craftsmanName: profile.ownerName,
          companyName: profile.companyName,
          notes: offer.notes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWhatsappText(data.whatsappMessage);
        setEmailText(data.emailBody);
      }
    } catch (err) {
      console.error('Greška pri generiranju poruke:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const copyWhatsApp = () => {
    const text =
      whatsappText ||
      `Poštovani ${offer.client.name || 'klijentu'},\n\nŠaljem vam ponudu br. ${offer.offerNumber} za ${
        offer.projectName || 'keramičarske radove'
      }.\nUkupna kvadratura keramike s otpadom: ${offer.totals.totalAreaWithWaste} m².\nSveukupni iznos ponude: ${offer.totals.grandTotal.toFixed(
        2
      )} €.\n\nZa detalje i termin stojim na raspolaganju!\n${profile.companyName} (${profile.phone})`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    // Open WhatsApp Web/App if on mobile or clicked
    const encoded = encodeURIComponent(text);
    const cleanPhone = (offer.client.phone || '').replace(/[^0-9]/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Controls Bar (Hidden during print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <button
          onClick={onBackToEdit}
          className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800 transition text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 text-orange-400" />
          <span>Natrag na uređivanje</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={offer.status}
              onChange={(e) => onUpdateStatus(e.target.value as any)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="draft" className="bg-slate-900">U izradi</option>
              <option value="sent" className="bg-slate-900">Poslano</option>
              <option value="accepted" className="bg-slate-900">Prihvaćeno</option>
              <option value="declined" className="bg-slate-900">Odbijeno</option>
              <option value="completed" className="bg-slate-900">Završeno</option>
            </select>
          </div>

          <button
            onClick={generateAIMessage}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-orange-400 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI Poruka</span>
          </button>

          <button
            onClick={copyWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={pdfGenerating}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition transform active:scale-95 ${
              pdfGenerating
                ? 'bg-slate-700 text-slate-300 cursor-wait'
                : 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-600/30'
            }`}
            title="Preuzmite ponudu kao gotovu .PDF datoteku na mobitel ili računalo"
          >
            {pdfGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Generiram PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Preuzmi PDF</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition"
            title="Ispis ili ispisni preglednik"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Ispiši</span>
          </button>
        </div>
      </div>

      {/* AI Message Drawer / Modal if opened */}
      {aiMessageOpen && (
        <div className="print:hidden bg-slate-900 border border-orange-500/40 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Predložena poruka za klijenta (WhatsApp & E-mail)</span>
            </h4>
            <button
              onClick={() => setAiMessageOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Zatvori
            </button>
          </div>

          {aiLoading ? (
            <p className="text-xs text-slate-400 animate-pulse">
              AI piše profesionalnu i ljubaznu poruku za klijenta...
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  Format za WhatsApp / SMS:
                </span>
                <textarea
                  rows={6}
                  value={whatsappText}
                  onChange={(e) => setWhatsappText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none resize-none font-sans"
                />
                <button
                  onClick={copyWhatsApp}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Otvori u WhatsAppu
                </button>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  Format za službeni E-mail:
                </span>
                <textarea
                  rows={6}
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none resize-none font-sans"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(emailText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Kopirano u međuspremnik!' : 'Kopiraj tekst e-maila'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Official Printable Quotation Document Paper (White background for print standard) */}
      <div
        ref={documentRef}
        id="official-offer-paper"
        className="bg-white text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-12 print:p-0 print:shadow-none print:rounded-none max-w-4xl mx-auto border border-slate-200 print:border-none print:w-full print:max-w-none"
      >
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            {/* Craftsman info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-sm">
                  K
                </div>
                <h2 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                  {profile.companyName || 'Keramičarski Obrt'}
                </h2>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Vlasnik: {profile.ownerName || 'Ovlašteni keramičar'}
              </p>
              <p className="text-xs text-slate-600">
                {profile.address}, {profile.city}
              </p>
              <div className="mt-2 text-xs text-slate-700 space-y-0.5">
                <p>
                  <strong>OIB:</strong> {profile.oib}
                </p>
                <p>
                  <strong>IBAN:</strong> {profile.iban} ({profile.bankName})
                </p>
                <p>
                  <strong>Tel:</strong> {profile.phone} | <strong>E-mail:</strong> {profile.email}
                </p>
              </div>
            </div>

            {/* Offer Metadata */}
            <div className="sm:text-right bg-slate-50 print:bg-transparent p-4 sm:p-0 rounded-xl sm:rounded-none border sm:border-none border-slate-200">
              <span className="text-xs font-bold text-orange-600 tracking-wider uppercase block">
                Službena Ponuda / Predračun
              </span>
              <h1 className="text-2xl font-black text-slate-950">
                Broj: {offer.offerNumber}
              </h1>
              <div className="text-xs text-slate-600 mt-2 space-y-1">
                <p>
                  <strong>Datum izdavanja:</strong> {offer.dateCreated}
                </p>
                <p>
                  <strong>Vrijedi do:</strong> {offer.validUntil}
                </p>
                <p>
                  <strong>Mjesto:</strong> {profile.city.replace(/^[0-9\s]+/, '')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Client & Project Banner */}
        <div className="bg-slate-100/80 rounded-xl p-4 mb-6 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Naručitelj / Kupac:
            </span>
            <p className="font-bold text-sm text-slate-900">{offer.client.name || 'Gospodin / Gospođa'}</p>
            <p className="text-slate-600">{offer.client.address}</p>
            <p className="text-slate-600">
              Tel: {offer.client.phone || '-'} | E-mail: {offer.client.email || '-'}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Objekt & Lokacija izvođenja:
            </span>
            <p className="font-bold text-sm text-slate-900">{offer.projectName || 'Keramičarski radovi'}</p>
            <p className="text-slate-600">{offer.client.projectLocation || offer.client.address}</p>
            <p className="text-slate-600">
              Ukupno prostorija: {offer.rooms.length} ({offer.rooms.map((r) => r.name).join(', ')})
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 font-extrabold uppercase text-[11px]">
                <th className="py-2.5 px-2 w-8 text-center">R.br.</th>
                <th className="py-2.5 px-3">Opis radova i materijala</th>
                <th className="py-2.5 px-2 text-center w-14">J.M.</th>
                <th className="py-2.5 px-2 text-right w-16">Količina</th>
                <th className="py-2.5 px-3 text-right w-24">Cijena (€)</th>
                <th className="py-2.5 px-3 text-right w-28">Ukupno (€)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {lineItems.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-2 text-center text-slate-500 font-medium">{idx + 1}.</td>
                  <td className="py-2.5 px-3 text-slate-900">
                    <span className="font-bold text-slate-950 block">{item.description}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Prostor: {item.roomName}</span>
                  </td>
                  <td className="py-2.5 px-2 text-center text-slate-700">{item.unit}</td>
                  <td className="py-2.5 px-2 text-right font-semibold text-slate-900">
                    {item.quantity.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700 font-mono">
                    {item.unitPrice.toFixed(2)} €
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-950 font-mono">
                    {item.totalPrice.toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quantities & Material Summary for Client */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200 text-xs">
          <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2 flex items-center gap-1.5">
            <span>Rekapitulacija površina & Tehnički proračun</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
            <div>
              <span className="text-slate-500 block">Podna površina:</span>
              <strong className="text-slate-900">{offer.totals.totalFloorArea.toFixed(2)} m²</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Zidna površina (neto):</span>
              <strong className="text-slate-900">{offer.totals.totalWallArea.toFixed(2)} m²</strong>
            </div>
            <div>
              <span className="text-slate-500 block">
                Potrebna keramika (+{offer.wasteMarginPercent}% otpad):
              </span>
              <strong className="text-orange-600 font-bold">
                {offer.totals.totalAreaWithWaste.toFixed(2)} m²
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">Ljepilo i fug masa:</span>
              <strong className="text-slate-900">
                ~{offer.totals.estimatedAdhesiveBags} vreća / ~{offer.totals.estimatedGroutKg} kg
              </strong>
            </div>
          </div>
        </div>

        {/* Financial Recap & Totals Box */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t-2 border-slate-900 pt-6 mb-8">
          <div className="text-xs text-slate-600 max-w-sm space-y-2">
            <div>
              <strong>Uvjeti plaćanja:</strong>
              <p>{offer.paymentTerms || profile.defaultPaymentTerms}</p>
            </div>
            <div>
              <strong>Jamstvo na izvedene radove:</strong>
              <p>{profile.defaultWarrantyYears} godine po pravilima građevinske struke.</p>
            </div>
            {offer.notes && (
              <div>
                <strong>Napomene:</strong>
                <p className="whitespace-pre-line text-slate-700">{offer.notes}</p>
              </div>
            )}
            <div className="text-[11px] text-slate-500 pt-1">
              {profile.isVatRegistered ? (
                <p>Iskazan PDV po stopi od 25%.</p>
              ) : (
                <p>{profile.vatExemptionNote}</p>
              )}
            </div>
          </div>

          <div className="w-full sm:w-72 bg-slate-100 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between text-slate-700">
              <span>Ukupno rad majstora:</span>
              <span className="font-mono">{offer.totals.laborSubtotal.toFixed(2)} €</span>
            </div>

            {offer.includeMaterials && offer.totals.materialsSubtotal > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>Materijal (ljepilo, fuge, 2K):</span>
                <span className="font-mono">{offer.totals.materialsSubtotal.toFixed(2)} €</span>
              </div>
            )}

            {offer.discountPercent > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Popust ({offer.discountPercent}%):</span>
                <span className="font-mono">-{offer.totals.discountAmount.toFixed(2)} €</span>
              </div>
            )}

            {profile.isVatRegistered && (
              <div className="flex justify-between text-slate-700">
                <span>PDV (25%):</span>
                <span className="font-mono">{offer.totals.vatAmount.toFixed(2)} €</span>
              </div>
            )}

            <div className="border-t-2 border-slate-900 pt-2 flex justify-between items-center text-sm font-black text-slate-950">
              <span className="uppercase">Sveukupno:</span>
              <span className="text-xl font-mono text-orange-600 font-black">
                {offer.totals.grandTotal.toFixed(2)} €
              </span>
            </div>

            {offer.paidAdvanceAmount && offer.paidAdvanceAmount > 0 ? (
              <div className="pt-2 border-t border-slate-300 space-y-1">
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Uplaćeni avans:</span>
                  <span className="font-mono">-{offer.paidAdvanceAmount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                  <span className="uppercase text-[11px]">Preostalo za isplatu:</span>
                  <span className="font-mono text-base text-orange-600 font-black">
                    {(offer.totals.grandTotal - offer.paidAdvanceAmount).toFixed(2)} €
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-center text-slate-600">
          <div>
            <div className="h-14 border-b border-dashed border-slate-400 mb-2" />
            <p className="font-bold text-slate-900">Za naručitelja (potpis klijenta)</p>
          </div>
          <div>
            <div className="h-14 border-b border-dashed border-slate-400 mb-2" />
            <p className="font-bold text-slate-900">
              Za izvođača: {profile.ownerName} (M.P.)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
