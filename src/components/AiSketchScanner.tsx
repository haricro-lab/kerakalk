import React, { useState, useRef } from 'react';
import {
  Scan,
  Upload,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Maximize2,
  FileCheck,
  Ruler,
  HelpCircle,
  RefreshCw,
  Info,
  Droplets,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { AISketchAnalysisResult, Room } from '../types';
import { SAMPLE_SKETCHES } from '../utils/sampleSketches';
import { recalculateRoomGeometry } from '../utils/calculations';

interface Props {
  onApplyAnalysisToOffer: (rooms: Room[], notes: string) => void;
  onNavigateToGuidelines: () => void;
}

export const AiSketchScanner: React.FC<Props> = ({
  onApplyAnalysisToOffer,
  onNavigateToGuidelines,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(SAMPLE_SKETCHES[0].dataUrl);
  const [mimeType, setMimeType] = useState<string>('image/svg+xml');
  const [userNotes, setUserNotes] = useState<string>(SAMPLE_SKETCHES[0].userNotes);
  const [tileFormatPreference, setTileFormatPreference] = useState<string>('60x120 cm (veliki format)');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AISketchAnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Molimo odaberite sliku (JPG, PNG ili WEBP).');
      return;
    }

    setError(null);
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: typeof SAMPLE_SKETCHES[0]) => {
    setImagePreview(sample.dataUrl);
    setMimeType('image/svg+xml');
    setUserNotes(sample.userNotes);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) {
      setError('Prvo prenesite sliku skice ili fotografirajte tlocrt.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze-sketch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          mimeType: mimeType || 'image/jpeg',
          userNotes: userNotes,
          tileFormat: tileFormatPreference,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || 'Neuspjela analiza skice.');
      }

      const data: AISketchAnalysisResult = await response.json();
      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Došlo je do pogreške.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferToOffer = () => {
    if (!result || !result.rooms || result.rooms.length === 0) return;

    const convertedRooms: Room[] = result.rooms.map((aiRoom, idx) => {
      const room: Room = {
        id: `ai-room-${Date.now()}-${idx}`,
        name: aiRoom.name || `Prostorija ${idx + 1}`,
        floorLength: aiRoom.length || 0,
        floorWidth: aiRoom.width || 0,
        floorArea: aiRoom.floorArea || 0,
        tileFloorFormat: aiRoom.tileFloorFormat || '60x60 cm',
        wallHeight: aiRoom.height || 2.5,
        wallPerimeter: aiRoom.perimeter || 0,
        wallAreaGross: aiRoom.wallAreaGross || 0,
        doorCount: 1,
        doorWidth: 0.8,
        doorHeight: 2.05,
        windowCount: 0,
        windowWidth: 0.7,
        windowHeight: 0.7,
        openingsArea: aiRoom.openingsDeduction || 1.64,
        wallAreaNet: aiRoom.wallAreaNet || 0,
        tileWallFormat: aiRoom.tileWallFormat || tileFormatPreference,
        tileType: tileFormatPreference.includes('120') ? 'large_format' : 'standard',
        applyWaterproofing: (aiRoom.waterproofingArea || 0) > 0,
        waterproofingArea: aiRoom.waterproofingArea || 0,
        waterproofingTapeMeters: aiRoom.perimeter ? Math.round(aiRoom.perimeter * 1.5) : 12,
        mitreCut45Meters: aiRoom.mitreCutting45Meters || 0,
        skirtingMeters: aiRoom.skirtingMeters || 0,
        applySiliconing: true,
        siliconMeters: aiRoom.perimeter || 12,
        applyFloorLeveling: false,
        floorLevelingArea: 0,
        removeOldTiles: false,
        removeOldTilesArea: 0,
        geberitCount: aiRoom.features?.some((f) => f.toLowerCase().includes('geberit')) ? 1 : 0,
        nicheCount: aiRoom.features?.some((f) => f.toLowerCase().includes('niš')) ? 1 : 0,
        hasWalkInShower: Boolean(
          aiRoom.features?.some(
            (f) =>
              f.toLowerCase().includes('walk') ||
              f.toLowerCase().includes('tuš') ||
              f.toLowerCase().includes('kanalica')
          )
        ),
        showerSlopesCount: 1,
        customItems: [],
        notes: aiRoom.notes || '',
      };

      return recalculateRoomGeometry(room);
    });

    const offerNotes = `AI Analiza skice: ${result.sketchObservations || ''}\nPreporuke: ${
      result.craftsmanRecommendations ? result.craftsmanRecommendations.join('; ') : ''
    }`;

    onApplyAnalysisToOffer(convertedRooms, offerNotes);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Pametni AI Vid za Keramičare</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              AI Analiza Skice & Obračun Kvadrata
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Fotografirajte nacrt ili ručnu skicu kupaonice. Umjetna inteligencija automatski
              očitava dužine zidova, površinu poda, visinu opločenja, otvore za vrata/prozore,
              walk-in tuš i kutove za gerung 45°.
            </p>
          </div>

          <button
            onClick={onNavigateToGuidelines}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs sm:text-sm font-semibold transition shrink-0"
          >
            <HelpCircle className="w-4 h-4 text-orange-400" />
            <span>Što mora biti na skici? (Upute)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Upload & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image input & preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Scan className="w-4 h-4 text-orange-500" />
                Slika skice ili tlocrta
              </span>
              {imagePreview && (
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setResult(null);
                  }}
                  className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Ukloni sliku
                </button>
              )}
            </div>

            {/* Hidden inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Image Preview Box or Empty Dropzone */}
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-[420px] flex items-center justify-center group">
                <img
                  src={imagePreview}
                  alt="Pregled skice"
                  className="max-h-[420px] w-auto object-contain"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg"
                  >
                    <Camera className="w-4 h-4 text-orange-400" />
                    Slikaj ponovno
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg"
                  >
                    <Upload className="w-4 h-4 text-orange-400" />
                    Odaberi drugu
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-700 hover:border-orange-500/60 rounded-xl p-8 text-center transition bg-slate-950/40">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-3">
                  <Scan className="w-8 h-8" />
                </div>
                <h4 className="text-base font-semibold text-slate-200">
                  Učitajte fotografiju skice ili tlocrta
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-5">
                  Podržani su JPG, PNG, WEBP. Za najbolje rezultate slikajte papir okomito odozgo uz
                  dobro svjetlo.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-orange-600/20 transition"
                  >
                    <Camera className="w-4 h-4" />
                    Fotografiraj mobitelom
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 border border-slate-700 transition"
                  >
                    <Upload className="w-4 h-4" />
                    Učitaj iz galerije / datoteke
                  </button>
                </div>
              </div>
            )}

            {/* Quick Sample Selector */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-xs font-medium text-slate-400 block mb-2">
                Ili isprobajte odmah s primjerom stvarne skice:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_SKETCHES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-orange-400" />
                    <span>{sample.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Parameters and Trigger (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Parametri za AI obradu
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Format pločica (za točniju kalkulaciju rada):
              </label>
              <select
                value={tileFormatPreference}
                onChange={(e) => setTileFormatPreference(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500"
              >
                <option value="60x60 cm (standardni format)">Standardne pločice (npr. 30x60, 60x60 cm)</option>
                <option value="60x120 cm (veliki format)">Veliki formati (60x120, 120x120 cm)</option>
                <option value="Mozaik pločice">Mozaik keramika</option>
                <option value="Riblja kost (Herringbone)">Riblja kost (Herringbone)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Dodatne napomene za AI (opcionalno):
              </label>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                rows={3}
                placeholder="Npr. Zidovi idu do visine 2.5m, kupaonica ima walk-in tuš i ugradbeni Geberit, izbrusiti vanjske kutove na 45°..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            {error && (
              <div className="bg-rose-950/50 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || !imagePreview}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                loading || !imagePreview
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-600/30'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>AI analizira skicu i računa kvadrate...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Pokreni AI Analizu Skice</span>
                </>
              )}
            </button>

            <div className="bg-slate-950/60 rounded-xl p-3 text-[11px] text-slate-400 border border-slate-800/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Info className="w-3.5 h-3.5 text-orange-400" />
                <span>Što AI automatski prepoznaje?</span>
              </div>
              <p>• Dimenzije prostorije (dužina x širina) i površinu poda (m²)</p>
              <p>• Visinu opločenja i bruto/neto površinu zidova uz odbitke otvora</p>
              <p>• Elemente: Walk-in tuš kanalica, Geberit kutija, niša u zidu</p>
              <p>• Dužinu kutnog brušenja na 45° (gerung) i hidroizolaciju</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header of results */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xl font-bold text-white">
                  Rezultati AI Analize: {result.title || 'Uređenje prostora'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {result.sketchObservations || 'Skica je uspješno obrađena i mjere su ekstrahirane.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pouzdanost: {result.confidenceScore || 90}%</span>
              </div>

              <button
                onClick={handleTransferToOffer}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-600/30 transition transform active:scale-95"
              >
                <span>Prebaci u Novu Ponudu</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
              <span className="text-xs text-slate-400 block font-medium">Ukupno Pod</span>
              <span className="text-2xl font-extrabold text-white">
                {result.totalFloorArea?.toFixed(2) || '0.00'} <span className="text-sm font-normal text-slate-400">m²</span>
              </span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
              <span className="text-xs text-slate-400 block font-medium">Ukupno Zidovi (Neto)</span>
              <span className="text-2xl font-extrabold text-orange-400">
                {result.totalWallArea?.toFixed(2) || '0.00'} <span className="text-sm font-normal text-slate-400">m²</span>
              </span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
              <span className="text-xs text-slate-400 block font-medium">Sveukupno Keramika</span>
              <span className="text-2xl font-extrabold text-amber-400">
                {((result.totalFloorArea || 0) + (result.totalWallArea || 0)).toFixed(2)}{' '}
                <span className="text-sm font-normal text-slate-400">m²</span>
              </span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
              <span className="text-xs text-slate-400 block font-medium">Preporučena Hidroizolacija</span>
              <span className="text-2xl font-extrabold text-sky-400">
                {result.totalWaterproofingArea?.toFixed(2) ||
                  ((result.totalFloorArea || 0) + 4).toFixed(2)}{' '}
                <span className="text-sm font-normal text-slate-400">m²</span>
              </span>
            </div>
          </div>

          {/* Rooms Cards */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Prepoznate prostorije i točan obračun:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.rooms?.map((room, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-bold text-base text-white">{room.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {room.length && room.width ? `${room.length}m × ${room.width}m` : 'Mjere ekstrahirane'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Podna površina:</span>
                      <strong className="text-white text-sm">{room.floorArea?.toFixed(2)} m²</strong>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Neto zidovi (nakon odbitaka):</span>
                      <strong className="text-orange-400 text-sm">{room.wallAreaNet?.toFixed(2)} m²</strong>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Visina stropa/opločenja:</span>
                      <strong className="text-slate-200">{room.height || 2.50} m</strong>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block">Odbitak za vrata/prozore:</span>
                      <strong className="text-slate-200">-{room.openingsDeduction?.toFixed(2) || 1.64} m²</strong>
                    </div>
                  </div>

                  {/* Features & special tasks */}
                  {room.features && room.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {room.features.map((feat, fIdx) => (
                        <span
                          key={fIdx}
                          className="text-[11px] px-2 py-0.5 rounded bg-orange-950/50 border border-orange-500/30 text-orange-300"
                        >
                          ✓ {feat}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Mitre & Waterproofing indicators */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-900">
                    <span>
                      Gerung (45°):{' '}
                      <strong className="text-slate-200">{room.mitreCutting45Meters || 0} m'</strong>
                    </span>
                    <span>
                      Hidroizolacija:{' '}
                      <strong className="text-slate-200">{room.waterproofingArea || 0} m²</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Observations & Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {result.readDimensions && result.readDimensions.length > 0 && (
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mjere pročitane izravno sa skice:
                </span>
                <ul className="list-disc list-inside text-slate-300 space-y-0.5 pl-1">
                  {result.readDimensions.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.craftsmanRecommendations && result.craftsmanRecommendations.length > 0 && (
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Preporuke za majstora i nabavu:
                </span>
                <ul className="list-disc list-inside text-slate-300 space-y-0.5 pl-1">
                  {result.craftsmanRecommendations.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Bottom Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleTransferToOffer}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-orange-600/30 transition transform active:scale-95"
            >
              <FileCheck className="w-5 h-5" />
              <span>Kreiraj Gotovu Ponudu iz ovih Podataka</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
