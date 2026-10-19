/**
 * Built-in sample sketches rendered as realistic architectural sketches
 * so users can test AI Vision instantly without hunting for a pen and paper.
 */

// Generate an SVG sketch of a bathroom with dimensions, walk-in shower, Geberit and door
const bathroomSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 650" width="800" height="650">
  <!-- Blueprint / grid background style -->
  <rect width="800" height="650" fill="#f8fafc" />
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.8"/>
    </pattern>
  </defs>
  <rect width="800" height="650" fill="url(#grid)" />

  <!-- Title & annotations -->
  <text x="50" y="50" font-family="'Courier New', monospace" font-size="22" font-weight="bold" fill="#0f172a">SKICA KUPAONICE - GLAVNI PROJEKT</text>
  <text x="50" y="80" font-family="'Courier New', monospace" font-size="15" fill="#475569">Mjerilo: 1:20 | Visina stropa h = 2.60 m | Pločice: Pod 60x60, Zid 60x120</text>

  <!-- Outer Walls (Rough architectural sketch style) -->
  <g stroke="#0f172a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <!-- Top wall (2.80 m) -->
    <line x1="120" y1="130" x2="680" y2="130" />
    <!-- Right wall (2.20 m) -->
    <line x1="680" y1="130" x2="680" y2="520" />
    <!-- Bottom wall (2.80 m) with door gap -->
    <line x1="680" y1="520" x2="320" y2="520" />
    <line x1="220" y1="520" x2="120" y2="520" />
    <!-- Left wall (2.20 m) -->
    <line x1="120" y1="520" x2="120" y2="130" />
  </g>

  <!-- Door swing opening (Vrata 80x205) -->
  <path d="M 220 520 A 100 100 0 0 1 320 420" fill="none" stroke="#2563eb" stroke-width="3" stroke-dasharray="6,4" />
  <line x1="220" y1="520" x2="220" y2="420" stroke="#2563eb" stroke-width="4" />
  <text x="240" y="555" font-family="'Courier New', monospace" font-size="15" font-weight="bold" fill="#2563eb">VRATA 80x205 cm</text>

  <!-- Window (Prozor 70x60) on top wall -->
  <rect x="340" y="122" width="120" height="16" fill="#bae6fd" stroke="#0284c7" stroke-width="3" />
  <text x="345" y="105" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#0284c7">PROZOR 70x60 cm</text>

  <!-- Walk-in Shower (Tuš 120x90 cm) in top-left corner -->
  <rect x="126" y="136" width="220" height="170" fill="#e0f2fe" stroke="#0284c7" stroke-width="3" stroke-dasharray="5,5"/>
  <!-- Linear drain (Kanalica) -->
  <rect x="140" y="150" width="20" height="140" rx="3" fill="#64748b" stroke="#334155" stroke-width="2"/>
  <text x="170" y="225" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="#0369a1">WALK-IN TUŠ 90x120</text>
  <text x="170" y="248" font-family="'Courier New', monospace" font-size="13" fill="#0284c7">(Kanalica + Hidroizolacija 2 ruke)</text>

  <!-- Geberit Box (50x120x18 cm) on right wall -->
  <rect x="580" y="320" width="94" height="140" fill="#fed7aa" stroke="#ea580c" stroke-width="3" />
  <text x="470" y="375" font-family="'Courier New', monospace" font-size="15" font-weight="bold" fill="#c2410c">GEBERIT KUTIJA</text>
  <text x="470" y="395" font-family="'Courier New', monospace" font-size="13" fill="#ea580c">50x120 cm (Gerung 45°)</text>

  <!-- Niche in shower wall -->
  <rect x="122" y="340" width="20" height="70" fill="#fef08a" stroke="#ca8a04" stroke-width="3"/>
  <text x="155" y="375" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#a16207">NIŠA 30x60 (Gerung 45°)</text>

  <!-- Dimensions markup lines with arrows -->
  <!-- Top dimension 2.80 m -->
  <g stroke="#dc2626" stroke-width="2" marker-start="url(#dot)" marker-end="url(#dot)">
    <line x1="120" y1="110" x2="680" y2="110" />
    <line x1="120" y1="100" x2="120" y2="125" />
    <line x1="680" y1="100" x2="680" y2="125" />
  </g>
  <rect x="360" y="98" width="80" height="24" rx="4" fill="#fee2e2" />
  <text x="375" y="115" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="#dc2626">2.80 m</text>

  <!-- Left dimension 2.20 m -->
  <g stroke="#dc2626" stroke-width="2">
    <line x1="90" y1="130" x2="90" y2="520" />
    <line x1="80" y1="130" x2="105" y2="130" />
    <line x1="80" y1="520" x2="105" y2="520" />
  </g>
  <rect x="50" y="310" width="80" height="24" rx="4" fill="#fee2e2" />
  <text x="65" y="327" font-family="'Courier New', monospace" font-size="16" font-weight="bold" fill="#dc2626">2.20 m</text>

  <!-- Area notes box -->
  <rect x="420" y="160" width="240" height="120" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
  <text x="435" y="190" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#0f172a">POD: 2.80 x 2.20 = 6.16 m²</text>
  <text x="435" y="215" font-family="'Courier New', monospace" font-size="14" fill="#334155">Zidovi do stropa h=2.60m</text>
  <text x="435" y="238" font-family="'Courier New', monospace" font-size="14" fill="#334155">Odbitak vrata i prozor: -2.1 m²</text>
  <text x="435" y="260" font-family="'Courier New', monospace" font-size="14" font-weight="bold" fill="#ea580c">Zid neto: ~23.9 m²</text>
</svg>`;

export const SAMPLE_SKETCHES = [
  {
    id: 'kupaonica-master',
    title: 'Kupaonica s walk-in tušem i Geberitom',
    description: 'Skica kupaonice 2.80 x 2.20 m, strop h=2.60m, kanalica, niša i kutno brušenje na 45°',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(bathroomSvg)}`,
    userNotes: 'Kupaonica 2.8x2.2m. Pločice velikog formata 60x120 na zidovima, walk-in tuš sa staklenom stijenom, Geberit oblaganje i niša za šampone s gerungom.',
  },
];
