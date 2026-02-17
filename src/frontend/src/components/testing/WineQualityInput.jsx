import { useState, useEffect, useRef } from 'react';

const WINE_FEATURES = [
  { name: 'fixedAcidity', label: 'Fixed Acidity', unit: 'g/dm³', hint: 'Backbone acids (tartaric). Higher → sharper taste.', min: 4, max: 16, default: 7.4, step: 0.1, category: 'Acidity & Freshness' },
  { name: 'volatileAcidity', label: 'Volatile Acidity', unit: 'g/dm³', hint: 'Vinegar-like acids (acetic). Too high smells off.', min: 0, max: 1.6, default: 0.5, step: 0.01, category: 'Acidity & Freshness' },
  { name: 'citricAcid', label: 'Citric Acid', unit: 'g/dm³', hint: 'Fresh citrus bite; small amounts lift flavor.', min: 0, max: 1, default: 0.3, step: 0.01, category: 'Acidity & Freshness' },
  { name: 'pH', label: 'pH', unit: '', hint: 'Acid strength. Lower = more tart.', min: 2.8, max: 4, default: 3.3, step: 0.01, category: 'Acidity & Freshness' },
  { name: 'residualSugar', label: 'Residual Sugar', unit: 'g/dm³', hint: 'Sweetness left after ferment. Table wine stays low.', min: 0, max: 16, default: 2.5, step: 0.1, category: 'Sweetness & Body' },
  { name: 'density', label: 'Density', unit: 'g/cm³', hint: 'Related to sugar/alcohol balance.', min: 0.99, max: 1.01, default: 0.997, step: 0.0005, category: 'Sweetness & Body' },
  { name: 'alcohol', label: 'Alcohol', unit: '%', hint: 'More alcohol typically raises perceived quality.', min: 8, max: 15, default: 10.5, step: 0.1, category: 'Sweetness & Body' },
  { name: 'chlorides', label: 'Chlorides', unit: 'g/dm³', hint: 'Salt content; too much tastes briny.', min: 0, max: 0.6, default: 0.08, step: 0.01, category: 'Stability & Preservatives' },
  { name: 'freeSulfur', label: 'Free SO₂', unit: 'mg/dm³', hint: 'Active preservative; protects but can sting.', min: 0, max: 70, default: 15, step: 1, category: 'Stability & Preservatives' },
  { name: 'totalSulfur', label: 'Total SO₂', unit: 'mg/dm³', hint: 'Overall sulfur load; keep moderate.', min: 0, max: 300, default: 50, step: 1, category: 'Stability & Preservatives' },
  { name: 'sulphates', label: 'Sulphates', unit: 'g/dm³', hint: 'Stabilizer; can boost body and preservation.', min: 0.3, max: 2, default: 0.6, step: 0.01, category: 'Stability & Preservatives' },
];

const buildDefaults = () =>
  WINE_FEATURES.reduce((acc, f) => ({ ...acc, [f.name]: f.default }), {});

// Wine glass visualization — every slider drives a visible change
function WineVisualization({ alcohol, pH, residualSugar, volatileAcidity, fixedAcidity, sulphates, chlorides, freeSulfur, totalSulfur, citricAcid, density }) {
  const norm = (value, min, max, lo, hi) => {
    const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return lo + t * (hi - lo);
  };

  // ── COLOR  (pH + fixedAcidity) ────────────────────────────
  // Low pH / high acid → deep garnet;  high pH / low acid → pale rosé
  const pHFactor    = norm(pH, 2.8, 4, 1, 0);          // 1 = deep, 0 = pale
  const acidFactor  = norm(fixedAcidity, 4, 16, 0, 1);  // high acid = deep
  const depth       = pHFactor * 0.6 + acidFactor * 0.4;
  const r = Math.round(90 + depth * 130);    // 90 – 220
  const g = Math.round(5 + (1 - depth) * 45); // 50 – 5
  const b = Math.round(20 + (1 - depth) * 35); // 55 – 20
  const wineColor     = `rgb(${r},${g},${b})`;
  const wineColorLt   = `rgb(${Math.min(255, r + 55)},${g + 25},${b + 25})`;
  const wineColorDk   = `rgb(${Math.round(r * 0.35)},${Math.round(g * 0.3)},${Math.round(b * 0.35)})`;

  // ── FILL LEVEL  (alcohol) ─────────────────────────────────
  const fillLevel = norm(alcohol, 8, 15, 18, 82);

  // ── BUBBLES  (volatileAcidity + freeSulfur) ───────────────
  const bubbleCount = Math.round(
    norm(volatileAcidity, 0, 1.6, 0, 6) + norm(freeSulfur, 0, 70, 0, 5)
  );

  // ── LEGS / TEARS  (residualSugar + density) ───────────────
  const legCount = Math.round(norm(residualSugar, 0, 16, 1, 9));
  const viscosity = norm(density, 0.99, 1.01, 0.15, 1);

  // ── AROMA SWIRLS  (alcohol + citricAcid + sulphates) ──────
  const aromaOpacity = Math.min(0.7,
    norm(alcohol, 8, 15, 0.05, 0.35) +
    norm(citricAcid, 0, 1, 0, 0.15) +
    norm(sulphates, 0.3, 2, 0, 0.15)
  );

  // ── HAZE / CLOUDINESS  (chlorides + totalSulfur) ──────────
  const haze = norm(chlorides, 0, 0.6, 0, 0.22) + norm(totalSulfur, 0, 300, 0, 0.13);

  // ── SWEETNESS GLOW  (residualSugar) ───────────────────────
  const sweetnessGlow = norm(residualSugar, 0, 16, 0, 0.25);

  const wineTop = 95 - fillLevel;

  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <defs>
        <radialGradient id="wBg" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#2a1f1a" />
          <stop offset="100%" stopColor="#1a1215" />
        </radialGradient>
        <radialGradient id="candleGlow" cx="12%" cy="88%" r="35%">
          <stop offset="0%" stopColor="#ff9940" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ff9940" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={wineColorLt} />
          <stop offset="40%" stopColor={wineColor} />
          <stop offset="100%" stopColor={wineColorDk} />
        </linearGradient>
        <linearGradient id="wineSurface" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={wineColor} stopOpacity="0.7" />
          <stop offset="35%" stopColor={wineColorLt} stopOpacity="0.9" />
          <stop offset="65%" stopColor={wineColorLt} stopOpacity="0.7" />
          <stop offset="100%" stopColor={wineColor} stopOpacity="0.7" />
        </linearGradient>
        {/* Sweetness warmth around wine */}
        <radialGradient id="sweetnessGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFB347" stopOpacity={sweetnessGlow} />
          <stop offset="100%" stopColor="#FFB347" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="glassShine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
          <stop offset="25%" stopColor="rgba(255,255,255,0.03)" />
          <stop offset="75%" stopColor="rgba(255,255,255,0.03)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.18)" />
        </linearGradient>
        <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.22)" />
        </linearGradient>
        <linearGradient id="aromaGrad" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor={wineColorLt} stopOpacity="0.6" />
          <stop offset="100%" stopColor={wineColorLt} stopOpacity="0" />
        </linearGradient>
        <filter id="wineGlow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="softBlur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id="bubbleGlow">
          <feGaussianBlur stdDeviation="0.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id="glassClip">
          <path d="M 30 25 Q 25 50 28 75 Q 30 90 45 95 L 45 95 Q 55 97 60 97 Q 65 97 75 95 L 75 95 Q 90 90 92 75 Q 95 50 90 25 Z" />
        </clipPath>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width="120" height="160" fill="url(#wBg)" rx="8" />
      <rect x="0" y="0" width="120" height="160" fill="url(#candleGlow)" rx="8" />

      {/* Table surface */}
      <line x1="8" y1="142" x2="112" y2="142" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

      {/* Glass shadow */}
      <ellipse cx="60" cy="140" rx="24" ry="4" fill="rgba(0,0,0,0.35)" filter="url(#softBlur)" />

      {/* ── Aroma swirls ── */}
      <g opacity={aromaOpacity}>
        <path d="M 48 22 Q 41 12 48 3 Q 55 -6 48 -14" fill="none" stroke="url(#aromaGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <path d="M 60 20 Q 67 9 58 0 Q 50 -9 58 -16" fill="none" stroke="url(#aromaGrad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
        <path d="M 72 22 Q 79 12 72 3 Q 65 -6 72 -14" fill="none" stroke="url(#aromaGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        {aromaOpacity > 0.35 && (
          <path d="M 55 21 Q 48 8 55 -3 Q 62 -14 55 -20" fill="none" stroke="url(#aromaGrad)" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
        )}
      </g>

      {/* Glass bowl */}
      <path
        d="M 30 25 Q 25 50 28 75 Q 30 90 45 95 L 45 95 Q 55 97 60 97 Q 65 97 75 95 L 75 95 Q 90 90 92 75 Q 95 50 90 25 Z"
        fill="url(#glassShine)"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="0.8"
      />

      {/* ── Wine fill ── */}
      <g clipPath="url(#glassClip)">
        {/* Main wine body */}
        <rect x="28" y={wineTop} width="64" height={fillLevel + 5} fill="url(#wineGrad)" filter="url(#wineGlow)" />

        {/* Sweetness warmth glow */}
        {sweetnessGlow > 0.05 && (
          <rect x="28" y={wineTop} width="64" height={fillLevel + 5} fill="url(#sweetnessGlow)" />
        )}

        {/* Haze / cloudiness overlay (chlorides + totalSulfur) */}
        {haze > 0.05 && (
          <rect x="28" y={wineTop} width="64" height={fillLevel + 5} fill="rgba(180,160,130,1)" opacity={haze} />
        )}

        {/* Wine surface meniscus */}
        <ellipse cx="60" cy={wineTop + 2} rx="30" ry="5" fill="url(#wineSurface)" />

        {/* Specular highlight */}
        <ellipse cx="47" cy={wineTop + 1} rx="9" ry="2" fill="rgba(255,255,255,0.12)" />

        {/* ── Bubbles (volatileAcidity + freeSulfur) ── */}
        <g filter="url(#bubbleGlow)">
          {Array.from({ length: bubbleCount }).map((_, i) => {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const bx = 37 + col * 11 + Math.sin(i * 1.7) * 3;
            const by = wineTop + 14 + row * 10 + (i % 3) * 4;
            const br = 1.2 + (i % 3) * 0.8;
            return (
              <g key={i}>
                <circle cx={bx} cy={by} r={br} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
                <circle cx={bx - br * 0.3} cy={by - br * 0.3} r={br * 0.25} fill="rgba(255,255,255,0.4)" />
              </g>
            );
          })}
        </g>

        {/* ── Wine legs / tears (residualSugar + density) ── */}
        {Array.from({ length: legCount }).map((_, i) => {
          const legX = 34 + i * (52 / (legCount + 1));
          const legLen = 8 + viscosity * 12;
          const tearR = 1.2 + viscosity * 1;
          return (
            <g key={`leg-${i}`}>
              <line
                x1={legX} y1={wineTop - 1}
                x2={legX + (i % 2 ? 1 : -1)} y2={wineTop - legLen}
                stroke={wineColor} strokeWidth={1.5 + viscosity * 0.8}
                opacity={0.55} strokeLinecap="round"
              />
              <circle
                cx={legX + (i % 2 ? 1 : -1)} cy={wineTop - legLen}
                r={tearR} fill={wineColor} opacity={0.5}
              />
            </g>
          );
        })}
      </g>

      {/* Glass reflections */}
      <path d="M 32 30 Q 27 52 30 75" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1" strokeLinecap="round" />
      <path d="M 88 30 Q 93 52 90 75" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" strokeLinecap="round" />

      {/* Glass rim */}
      <ellipse cx="60" cy="25" rx="30" ry="5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
      <path d="M 36 24 Q 48 20 60 20 Q 72 20 84 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />

      {/* Stem */}
      <rect x="57" y="97" width="6" height="35" fill="url(#stemGrad)" rx="1" />
      <line x1="58.5" y1="99" x2="58.5" y2="130" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

      {/* Base */}
      <ellipse cx="60" cy="134" rx="20" ry="5" fill="url(#stemGrad)" />
      <ellipse cx="60" cy="135.5" rx="22" ry="3.5" fill="rgba(255,255,255,0.07)" />
      <path d="M 43 133 Q 52 131 60 131 Q 68 131 77 133" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />

      {/* Indicators */}
      <text x="8" y="152" fill="#7c7168" fontSize="6">ABV</text>
      <text x="8" y="158" fill="#fbbf24" fontSize="7" fontWeight="600">{alcohol.toFixed(1)}%</text>
      <text x="95" y="152" fill="#7c7168" fontSize="6">pH</text>
      <text x="95" y="158" fill="#f87171" fontSize="7" fontWeight="600">{pH.toFixed(1)}</text>
    </svg>
  );
}

const WineQualityInput = ({ onInputChange }) => {
  const [values, setValues] = useState(buildDefaults);
  const onInputChangeRef = useRef(onInputChange);
  
  // Keep callback ref up to date
  useEffect(() => {
    onInputChangeRef.current = onInputChange;
  }, [onInputChange]);

  useEffect(() => {
    const inputArray = WINE_FEATURES.map(f => values[f.name]);
    onInputChangeRef.current(inputArray);
  }, [values]);

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const presets = {
    'Table (easy drinker)': { alcohol: 9.5, fixedAcidity: 7, volatileAcidity: 0.55, residualSugar: 2.0, pH: 3.4 },
    'Balanced (house red)': { alcohol: 11, fixedAcidity: 8, volatileAcidity: 0.4, residualSugar: 2.5, pH: 3.3 },
    'Cellar-worthy': { alcohol: 12.5, fixedAcidity: 9, volatileAcidity: 0.3, residualSugar: 2.0, pH: 3.15 },
  };

  const formatValue = (feature, value) => {
    if (feature.name === 'density') return value.toFixed(4);
    if (feature.step < 0.02) return value.toFixed(2);
    if (feature.step < 0.1) return value.toFixed(2);
    return value.toFixed(1);
  };

  const SliderRow = ({ feature }) => (
    <div className="rounded-md border border-gray-700 bg-gray-800/80 p-2.5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] text-gray-100 leading-tight">{feature.label}</p>
          <p className="text-[10px] text-gray-500 leading-tight">{feature.hint}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {feature.unit && (
            <span className="text-[10px] text-gray-400 border border-gray-700 rounded px-1.5 py-0.5 leading-none">
              {feature.unit}
            </span>
          )}
          <span className="text-xs text-amber-200 font-mono bg-gray-800/80 px-2 py-0.5 rounded">
            {formatValue(feature, values[feature.name])}
          </span>
        </div>
      </div>
      <input
        type="range"
        min={feature.min}
        max={feature.max}
        step={feature.step}
        value={values[feature.name]}
        onChange={(e) => handleChange(feature.name, e.target.value)}
        className="w-full h-1.5 bg-gray-700/70 rounded-full appearance-none cursor-pointer accent-amber-400 mt-2"
      />
      <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono mt-1">
        <span>{feature.min}</span>
        <span>{feature.max}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Wine Glass Visualization */}
      <div className="flex gap-3">
        <div className="w-28 flex-shrink-0 rounded-xl border border-gray-700/50 bg-gray-800/50 overflow-hidden">
          <WineVisualization
            alcohol={values.alcohol}
            pH={values.pH}
            residualSugar={values.residualSugar}
            volatileAcidity={values.volatileAcidity}
            fixedAcidity={values.fixedAcidity}
            sulphates={values.sulphates}
            chlorides={values.chlorides}
            freeSulfur={values.freeSulfur}
            totalSulfur={values.totalSulfur}
            citricAcid={values.citricAcid}
            density={values.density}
          />
        </div>
        <div className="flex-1 p-3 bg-gradient-to-r from-gray-800 via-gray-800/70 to-gray-750 border border-gray-700 rounded-lg text-[11px] text-gray-300 leading-snug shadow-inner">
          <div className="flex flex-col h-full justify-between">
            <div>
              <p className="font-semibold text-white mb-0.5">Sommelier lab slip</p>
              <p className="text-gray-400 text-[10px]">
                11 lab measurements feed the model to predict expert quality (3-9 scale).
              </p>
            </div>
            <div className="text-[10px] text-blue-200 bg-blue-900/40 border border-blue-700/70 rounded px-2 py-1 font-semibold uppercase tracking-wide flex items-center gap-1 w-fit mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              11 features
            </div>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="flex items-center gap-2 flex-wrap bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2">
        <span className="text-xs text-gray-400">Quick presets:</span>
        <div className="flex gap-1.5 flex-wrap">
          {Object.entries(presets).map(([name, preset]) => (
            <button
              key={name}
              onClick={() => setValues(prev => ({ ...prev, ...preset }))}
              className="px-2.5 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-100 rounded transition-colors border border-gray-600 shadow-sm"
            >
              {name}
            </button>
          ))}
          <button
            onClick={() => setValues(buildDefaults())}
            className="px-2.5 py-1 text-xs text-gray-200 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded transition-colors"
          >
            Reset sliders
          </button>
        </div>
      </div>

      {/* Small slider strip */}
      <div className="grid sm:grid-cols-2 gap-2">
        {WINE_FEATURES.map((feature) => (
          <SliderRow key={feature.name} feature={feature} />
        ))}
      </div>
    </div>
  );
};

export default WineQualityInput;
