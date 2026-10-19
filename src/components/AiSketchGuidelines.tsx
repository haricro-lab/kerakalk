import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Ruler,
  ArrowUpDown,
  ShowerHead,
  Grid,
  Camera,
  CheckCircle,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Share2,
  FileText,
  Layers,
} from 'lucide-react';
import { AISketchGuidelines } from '../types';

interface Props {
  onGoToScanner: () => void;
}

export const AiSketchGuidelines: React.FC<Props> = ({ onGoToScanner }) => {
  const [guidelines, setGuidelines] = useState<AISketchGuidelines | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const fetchGuidelines = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/sketch-guidelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setGuidelines(data);
      }
    } catch (err) {
      console.error('Greška pri dohvaćanju uputa:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyInstructionsForClient = () => {
    const text = `📐 UPUTE ZA SKICIRANJE KUPAONICE / PROSTORA ZA KERAMIKU 📐

Kako bismo vam mogli točno i brzo izraditi ponudu za keramičarske radove, nacrtajte jednostavnu skicu na papiru sa sljedećim oznakama:

1. POD & TLOCRT:
• Nacrtajte vanjski oblik prostorije odozgo
• Upišite dužinu i širinu zidova u metrima ili cm (npr. 2.40m x 1.80m)

2. VISINA & OTVORI:
• Zabilježite visinu stropa (npr. h=2.60m)
• Upišite dimenzije vrata (npr. Vrata 80x205) i prozora (npr. Prozor 60x80)

3. SANITARIJE & ELEMENTI:
• Označite poziciju walk-in tuša i kanalice (npr. Tuš 90x120 cm)
• Označite ugradbeni vodokotlić / Geberit kutiju (ako postoji)
• Ucrtajte zidnu nišu za šampone ako je želite

4. PLOČICE:
• Napišite željeni format pločica (npr. pod 60x60, zid 60x120 cm)

5. FOTOGRAFIRANJE SKICE:
• Položite papir na ravnu površinu pod dobrim svjetlom
• Slikajte točno odozgo (pod kutom od 90°) da se svi brojevi jasno vide.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Službeni Vodič & Checklist</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {guidelines?.headline || 'Što sve mora biti na skici za 100% točan AI izračun'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {guidelines?.summary ||
                'Ovaj vodič objašnjava majstorima i klijentima koje točno mjere i simbole treba ucrtati na ručnu skicu kako bi AI model bez greške izračunao kvadrate pločica, hidroizolaciju i sve stavke rada.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={copyInstructionsForClient}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs sm:text-sm font-semibold transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Kopirano!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-orange-400" />
                  <span>Kopiraj za Klijenta</span>
                </>
              )}
            </button>

            <button
              onClick={onGoToScanner}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-600/30 transition transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Otvori AI Skener</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Checklist Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Section 1: Floor & dimensions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">1. Dimenzije poda i tlocrt</h3>
              <p className="text-xs text-slate-400">Dužina, širina i oblik prostorije</p>
            </div>
          </div>

          <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Nacrtajte tlocrt odozgo (pravokutnik ili L-oblik s jasnim stranicama).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Upišite dužinu svih zidova u metrima ili centimetrima (npr.{' '}
                <strong className="text-white">"2.60 m"</strong> ili{' '}
                <strong className="text-white">"260 cm"</strong>).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Upišite naziv prostorije (npr. <em>Kupaonica, WC, Kuhinja, Terasa</em>).
              </span>
            </li>
          </ul>

          <div className="bg-blue-950/40 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300">
            💡 <strong>Savjet za majstore:</strong> Ako prostorija ima zub, dimnjak ili kosinu,
            dovoljno je ucrtati izbočinu i pored nje napisati mjere (npr. 40x30 cm).
          </div>
        </div>

        {/* Section 2: Heights & Deductions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <ArrowUpDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">2. Visina zidova & otvori</h3>
              <p className="text-xs text-slate-400">Strop, pločice do stropa, vrata i prozori</p>
            </div>
          </div>

          <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Upišite visinu stropa ili opločenja (npr.{' '}
                <strong className="text-white">"h = 2.60 m"</strong>).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Ucrtajte poziciju ulaznih vrata i njihove mjere (npr.{' '}
                <strong className="text-white">"Vrata 80x205"</strong>).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Ucrtajte prozor s mjerama (npr.{' '}
                <strong className="text-white">"Prozor 60x80"</strong>).
              </span>
            </li>
          </ul>

          <div className="bg-orange-950/40 border border-orange-500/20 rounded-xl p-3 text-xs text-orange-300">
            💡 <strong>Automatski odbitak:</strong> AI sam automatski izračunava kvadratutu vrata i
            prozora i oduzima ih od bruto površine zidova, tako da dobivate točnu neto kvadraturu!
          </div>
        </div>

        {/* Section 3: Sanitary & Special elements */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShowerHead className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">3. Sanitarni elementi & detalji</h3>
              <p className="text-xs text-slate-400">Walk-in tuš, Geberit, niša za šampone</p>
            </div>
          </div>

          <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Walk-in tuš:</strong> Ucrtajte zonu tuša i kanalicu (npr.{' '}
                <strong className="text-white">"Tuš 90x120 s kanalicom"</strong>).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Geberit:</strong> Označite kutiju ugradbenog vodokotlića (npr.{' '}
                <strong className="text-white">"Geberit 50x120"</strong>).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Zidna niša:</strong> Ucrtajte pravokutnik (npr.{' '}
                <strong className="text-white">"Niša 30x60"</strong>).
              </span>
            </li>
          </ul>

          <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-300">
            💡 <strong>Gerung (45° brušenje):</strong> Na temelju Geberita i niša, sustav
            automatski uračunava dužne metre finog brušenja keramike na vanjskim bridovima!
          </div>
        </div>

        {/* Section 4: Tile formats */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">4. Formati keramike & stil slaganja</h3>
              <p className="text-xs text-slate-400">Dimenzije pločica pod/zid i uzorak</p>
            </div>
          </div>

          <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Format podnih pločica (npr.{' '}
                <strong className="text-white">"Pod 60x60"</strong> ili{' '}
                <strong className="text-white">"Pod 60x120"</strong>).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Format zidnih pločica (npr.{' '}
                <strong className="text-white">"Zid 30x60"</strong> ili{' '}
                <strong className="text-white">"Zid 60x120"</strong>).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Ako je odabrana <strong className="text-white">riblja kost (herringbone)</strong>{' '}
                ili mozaik, napišite to pored prostorije.
              </span>
            </li>
          </ul>

          <div className="bg-purple-950/40 border border-purple-500/20 rounded-xl p-3 text-xs text-purple-300">
            💡 <strong>Kalkulacija cijene:</strong> Veliki formati (60x120+) i riblja kost nose višu
            cijenu postavljanja po m² i zahtijevaju nivelatore i odgovarajuće fleksibilno ljepilo.
          </div>
        </div>
      </div>

      {/* Section 5: Photo Tips */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Kako pravilno fotografirati skicu mobitelom</h3>
            <p className="text-xs text-slate-400">Savjeti za maksimalnu AI preciznost</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-300">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-white block">1. Ravna podloga</span>
            <p className="text-slate-400">
              Položite papir na ravan stol bez nabora i savijanja rubova.
            </p>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-white block">2. Kut od 90 stupnjeva</span>
            <p className="text-slate-400">
              Držite mobitel točno iznad papira (okomito odozgo) bez naginjanja.
            </p>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-white block">3. Bez sjene mobitela</span>
            <p className="text-slate-400">
              Pazite da sjena Vašeg tijela ili mobitela ne zaklanja ispisane brojeve.
            </p>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-white block">4. Tamna olovka / flomaster</span>
            <p className="text-slate-400">
              Pišite jasnim, podebljanim rukopisom s visokim kontrastom prema papiru.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Example Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
        <h4 className="text-base font-bold text-white">Spremni za skeniranje skice?</h4>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Možete fotografirati svoju skicu ili isprobati pripremljenu skicu kupaonice u AI skeneru jednim klikom.
        </p>
        <button
          onClick={onGoToScanner}
          className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-xl inline-flex items-center gap-2 shadow-lg shadow-orange-600/30 transition transform active:scale-95 text-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>Isprobaj AI Skener Skice Sada</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
