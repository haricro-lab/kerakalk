import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '35mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

/**
 * AI Sketch and Floor Plan Analysis for Ceramic Tiling
 */
app.post('/api/ai/analyze-sketch', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', userNotes = '', tileFormat = 'standard' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Slika skice ili tlocrta je obavezna.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'Gemini API ključ nije konfiguriran na poslužitelju. Molimo provjerite postavke.',
      });
    }

    // Clean base64 string if it contains data URI prefix
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `Ti si vrhunski stručnjak za keramičarske radove, građevinske izmjere, troškovnike i čitanje arhitektonskih tlocrta i ručnih skica kupaonica, kuhinja, terasa i stanova.
Tvoj zadatak je detaljno analizirati priloženu sliku (ručnu skicu, nacrt ili tlocrt prostora za postavljanje keramike) i precizno izračunati sve potrebne dimenzije, površine i stavke rada za keramičarsku ponudu.

Dodatne bilješke korisnika: "${userNotes || 'Nema dodatnih bilješki'}"
Preferirani format keramike: "${tileFormat}"

Pravila analize:
1. Prepoznaj sve prostorije (npr. Kupaonica, WC, Kuhinja, Hodnik, Terasa, Balkon, itd.). Ako je skica samo jedne prostorije, označi je točnim nazivom.
2. Za svaku prostoriju prepoznaj ili procijeni:
   - Dužinu i širinu poda u metrima (npr. 2.40 m x 1.80 m)
   - Površinu poda u m² (dužina * širina)
   - Opseg poda u dužnim metrima (m')
   - Visinu zidova na koje ide keramika (ako je označeno npr. h=2.50m ili visina pločica do stropa / 2.20m, ako nije navedeno koristi standardnu visinu 2.50m)
   - Bruto površinu zidova (opseg * visina)
   - Odbitke za otvore (vrata obično 0.80x2.00m = 1.6m², prozori npr. 0.8x0.6m = 0.48m²)
   - Neto površinu zidova (bruto zidovi minus otvori)
   - Hidroizolaciju u m² (pod kupaonice/terase + zona tuša zidova npr. 6-10 m² za kupaonice, ili cijeli pod)
   - Brušenje vanjskih kutova na 45° (gerung) u metrima (oko niša, ugradbenog vodokotlića, prozorskih špaleta)
   - Dužinu sokla / lajsni u metrima (za podove gdje zidovi nisu opločeni npr. hodnik, balkon)
3. Zabilježi posebnosti:
   - Walk-in tuš / kanalica
   - Ugradbeni vodokotlić (Geberit) oblaganje
   - Niša za šampone u zidu
   - Padovi i koso rezanje
4. Daj iskrenu ocjenu točnosti (confidence 0-100%) i navedi zapažanja: što si točno očitao s crteža, a što si procijenio.
5. Popiši savjete ili upozorenja za keramičara (npr. provjeriti visinu stropa, preporučiti 10% rezerve na format pločica, priprema podloge/niveliranje).

Sve tekstualne opise i nazive vrati na HRVATSKOM jeziku.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Naslov projekta iz skice' },
            rooms: {
              type: Type.ARRAY,
              description: 'Popis prepoznatih prostorija s mjerama',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Naziv prostorije npr. Kupaonica' },
                  length: { type: Type.NUMBER, description: 'Dužina u metrima' },
                  width: { type: Type.NUMBER, description: 'Širina u metrima' },
                  floorArea: { type: Type.NUMBER, description: 'Neto površina poda u m2' },
                  height: { type: Type.NUMBER, description: 'Visina zidova opločenja u m' },
                  perimeter: { type: Type.NUMBER, description: 'Opseg zidova u m' },
                  wallAreaGross: { type: Type.NUMBER, description: 'Bruto zidna površina u m2' },
                  openingsDeduction: { type: Type.NUMBER, description: 'Odbici za vrata i prozore u m2' },
                  wallAreaNet: { type: Type.NUMBER, description: 'Neto zidna površina za pločice u m2' },
                  waterproofingArea: { type: Type.NUMBER, description: 'Preporučena hidroizolacija u m2' },
                  mitreCutting45Meters: { type: Type.NUMBER, description: 'Metara brušenja pod 45 stupnjeva gerung' },
                  skirtingMeters: { type: Type.NUMBER, description: 'Metara sokla / podnih lajsni' },
                  tileFloorFormat: { type: Type.STRING, description: 'Preporučeni ili uočeni format podnih pločica' },
                  tileWallFormat: { type: Type.STRING, description: 'Preporučeni ili uočeni format zidnih pločica' },
                  features: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'Specifičnosti npr. Walk-in tuš, Geberit, Zidna niša',
                  },
                  notes: { type: Type.STRING, description: 'Specifične napomene za ovu prostoriju' },
                },
                required: ['name', 'floorArea', 'wallAreaNet'],
              },
            },
            totalFloorArea: { type: Type.NUMBER, description: 'Ukupna podna kvadratura m2' },
            totalWallArea: { type: Type.NUMBER, description: 'Ukupna zidna kvadratura m2' },
            totalWaterproofingArea: { type: Type.NUMBER, description: 'Ukupna hidroizolacija m2' },
            confidenceScore: { type: Type.NUMBER, description: 'Postotak pouzdanosti analize od 10 do 98' },
            readDimensions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Dimenzije koje su eksplicitno pročitane s crteža',
            },
            estimatedDimensions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Elementi koji su procijenjeni prema standardima jer nisu bili jasno ispisani',
            },
            craftsmanRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Stručne preporuke za izvođenje i nabavu materijala',
            },
            sketchObservations: {
              type: Type.STRING,
              description: 'Opći dojam o skici i sažetak za majstora',
            },
          },
          required: ['rooms', 'totalFloorArea', 'totalWallArea', 'confidenceScore', 'sketchObservations'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: unknown) {
    console.error('Greška pri analizi skice:', error);
    const message = error instanceof Error ? error.message : 'Nepoznata greška pri obradi slike.';
    return res.status(500).json({
      error: 'Došlo je do greške prilikom analize skice umjetnom inteligencijom.',
      details: message,
    });
  }
});

/**
 * AI Sketch Guidelines generator: what must be drawn and written on the sketch for 100% accuracy
 */
app.post('/api/ai/sketch-guidelines', async (_req, res) => {
  try {
    if (!apiKey) {
      // Fallback structured guide in Croatian
      return res.json(getFallbackGuidelines());
    }

    const prompt = `Napiši najdetaljniji i najjasniji vodič za keramičare i njihove klijente na temu:
"Što sve MORA biti označeno na ručnoj skici ili tlocrtu da bi AI mogao 100% točno izračunati kvadrate i napraviti ponudu za keramičarske radove".

Formatiraj kao strukturiran popis s kategorijama:
1. Osnovne dimenzije poda (duljina, širina, nepravilni kutovi)
2. Visine (visina stropa, visina do koje se lijepe pločice)
3. Otvori i odbici (vrata, prozori, staklene stijene sa širinama i visinama)
4. Sanitarije i specifični elementi (walk-in tuš kada/kanalica, ugradbeni vodokotlić/Geberit, niša u zidu, kada)
5. Vrste i formati pločica (npr. 60x120cm, 30x60cm, mozaik, vanjska protuklizna)
6. Detalji rada (brušenje 45° gerung, hidroizolacija zona prskanja, sokl/cokl)
7. Savjeti za fotografiranje skice (osvjetljenje, kut slikanja pod 90°, kontrast olovke/flomastera).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            summary: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  icon: { type: Type.STRING },
                  mustHaveItems: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  proTip: { type: Type.STRING },
                },
                required: ['title', 'mustHaveItems'],
              },
            },
            photoTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            exampleSketchDescription: { type: Type.STRING },
          },
          required: ['headline', 'summary', 'sections', 'photoTips'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Greška pri dohvaćanju uputa za skicu:', error);
    return res.json(getFallbackGuidelines());
  }
});

/**
 * AI Professional Offer Letter / WhatsApp message generator
 */
app.post('/api/ai/generate-offer-summary', async (req, res) => {
  try {
    const { clientName, projectName, totalAmount, rooms, servicesCount, craftsmanName, companyName, notes } = req.body;

    if (!apiKey) {
      return res.json({
        whatsappMessage: `Poštovani ${clientName || 'klijentu'},\n\nU privitku vam dostavljam ponudu za keramičarske radove za projekt "${projectName || 'Uređenje'}" u ukupnom iznosu od ${totalAmount ? Number(totalAmount).toFixed(2) : '0.00'} €.\n\nPonuda uključuje pripremu, postavljanje keramike i sve specificirane radove. Za sva pitanja stojim na raspolaganju!\n\nSrdačan pozdrav,\n${craftsmanName || 'Vaš keramičar'}`,
        emailSubject: `Ponuda za keramičarske radove - ${projectName || 'KeraKalk'}`,
        emailBody: `Poštovani g./gđo ${clientName || ''},\n\nZahvaljujem na ukazanom povjerenju. Sastavio sam detaljnu ponudu s točnim obračunom površina i stavki rada.\n\nUkupan iznos ponude: ${totalAmount ? Number(totalAmount).toFixed(2) : '0.00'} €.\n\nRok izvođenja i točan termin početka definiramo po dogovoru. Slobodno me kontaktirajte za sva pojašnjenja.\n\nS poštovanjem,\n${companyName || craftsmanName || 'Keramičarski obrt'}`,
      });
    }

    const prompt = `Ti si profesionalni majstor keramičar koji šalje ponudu klijentu.
Napiši dva profesionalna, iznimno ljubazna i uvjerljiva formata poruke:
1. WhatsApp / SMS brza poruka s preglednim sažetkom (emojiji po potrebi, jasno istaknuta cijena i stavke).
2. Službeni popratni tekst za E-mail / PDF uvod.

Podaci:
- Ime klijenta: ${clientName || 'Klijent'}
- Naziv projekta / objekta: ${projectName || 'Keramičarski radovi'}
- Ukupni iznos ponude: ${totalAmount} EUR
- Broj prostorija: ${rooms ? rooms.length : 1}
- Broj stavki u ponudi: ${servicesCount || 0}
- Ime majstora/obrta: ${craftsmanName || companyName || 'Keramičarski obrt'}
- Napomene majstora: ${notes || 'Kvalitetna izvedba po pravilima struke, upotreba fleksibilnih ljepila i nivelatora.'}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            whatsappMessage: { type: Type.STRING },
            emailSubject: { type: Type.STRING },
            emailBody: { type: Type.STRING },
          },
          required: ['whatsappMessage', 'emailSubject', 'emailBody'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Greška pri generiranju poruke ponude:', error);
    return res.status(500).json({ error: 'Neuspjelo generiranje poruke' });
  }
});

function getFallbackGuidelines() {
  return {
    headline: 'Upute za savršenu skicu za AI izračun keramike',
    summary: 'Kako bi AI vid mogao 100% točno prepoznati kvadrate, opseg i sve detalje kupaonice ili prostorije, slijedite ove ključne korake.',
    sections: [
      {
        id: 'dimensions',
        title: '1. Dimenzije poda i tlocrt',
        icon: 'Ruler',
        mustHaveItems: [
          'Ucrtajte tlocrt prostorije odozgo (pravokutnik ili L-oblik).',
          'Napišite dužine svih zidova u metrima ili centimetrima (npr. "2.80 m" ili "280 cm").',
          'Označite ulazna vrata i širinu krila (npr. "V 80").',
        ],
        proTip: 'Ako prostorija ima izbočine, dimnjake ili ugradbene ormare, upišite njihove mjere posebno.',
      },
      {
        id: 'heights',
        title: '2. Visina zidova i opločenja',
        icon: 'ArrowUpDown',
        mustHaveItems: [
          'U kutu skice zabilježite visinu stropa (npr. "h = 2.60 m").',
          'Ako keramika ne ide do stropa, naznačite do koje visine ide (npr. "zidovi do h=2.20 m").',
          'Upišite dimenzije prozora (širina x visina, npr. "P 60x80 cm") i visinu parapeta.',
        ],
        proTip: 'AI automatski oduzima površinu vrata i prozora od bruto kvadrata zidova!',
      },
      {
        id: 'elements',
        title: '3. Sanitarije i kupaonski elementi',
        icon: 'ShowerHead',
        mustHaveItems: [
          'Walk-in tuš: označite zonu tuša i linijsku kanalicu (npr. "Tuš 90x120").',
          'Ugradbeni vodokotlić (Geberit): označite poziciju kutije (npr. "Geberit 50x120x18 cm").',
          'Zidna niša / polica za šampone: ucrtajte pravokutnik s mjerama (npr. "Niša 30x60").',
          'Kada ili kada za kupanje: označite ide li oblaganje kade keramikom.',
        ],
        proTip: 'Oznaka niša i Geberita omogućuje točan automatski izračun dužnih metara brušenja pod 45° (gerung).',
      },
      {
        id: 'tiles',
        title: '4. Formati pločica i posebnosti',
        icon: 'Grid',
        mustHaveItems: [
          'Format podnih pločica (npr. "Pod 60x60" ili "Pod 60x120").',
          'Format zidnih pločica (npr. "Zid 30x60" ili "Zid 60x120").',
          'Mozaik ili dekorativne pločice ako postoje u tušu.',
          'Postavka: ravno, na 1/3 (smak) ili riblja kost (herringbone).',
        ],
        proTip: 'Veliki formati (preko 60x120) i riblja kost zahtijevaju višu cijenu rada i veći postotak škarta (15%).',
      },
    ],
    photoTips: [
      'Položite papir na ravnu površinu pod dobrim dnevnim ili sobnim svjetlom.',
      'Slikajte mobitelom točno odozgo (kut od 90°), tako da crtež ispuni veći dio kadra.',
      'Pazite da sjena mobitela ili ruke ne prekriva brojeve.',
      'Koristite tamnu kemijsku olovku ili crni/plavi flomaster radi maksimalnog kontrasta.',
    ],
    exampleSketchDescription: 'Primjer: Nacrtana kupaonica 2.50 x 2.10 m, h=2.60m, walk-in tuš 90x120 cm u kutu, Geberit kutija, vrata 80x200 cm, pločice 60x120 cm.',
  };
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KeraKalk poslužitelj pokrenut na http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Neuspjelo pokretanje poslužitelja:', err);
});
