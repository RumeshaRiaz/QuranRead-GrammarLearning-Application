import React from 'react';
import Svg, {
  Circle, Ellipse, Line, Path, Rect, G, Defs,
  RadialGradient, Stop,
} from 'react-native-svg';

/**
 * Theme-aware Noor ul Bayan logo.
 * isDark={true}  → original dark palette
 * isDark={false} → vivid gold/amber palette — fully visible on light backgrounds
 */
const LogoSVG = ({ size = 220, isDark = true }) => {
  // ── palette ─────────────────────────────────────────────
  const gold        = '#C9A84C';
  const goldDeep    = '#A07830';
  const goldLight   = '#E8C875';

  // inner circle: dark bg in dark mode / deep amber in light mode
  const innerBg     = isDark ? '#111E2E' : '#5A3800';
  const innerStroke = isDark ? gold : goldLight;

  // petals: light mode gets fill + full opacity so they pop
  const petalFill   = isDark ? 'none' : gold + '30';   // subtle gold fill in light
  const petalStroke = gold;
  const petalOpacity= isDark ? 0.55 : 0.90;

  // radial lines
  const lineOpacity = isDark ? 0.15 : 0.45;

  // outer dashed ring
  const ringOpacity = isDark ? 0.28 : 0.70;
  const ringWidth   = isDark ? 0.5 : 1.2;

  // glow gradient stops
  const glowCenter  = isDark ? '#0F1923' : '#F5E8C0';
  const outerCenter = isDark ? '#0A1018' : '#EDD99A';

  return (
    <Svg width={size} height={size} viewBox="-115 -115 230 230">
      <Defs>
        <RadialGradient id="nb_glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor={gold}       stopOpacity={isDark ? 0.18 : 0.10} />
          <Stop offset="100%" stopColor={glowCenter}  stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="nb_outer" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor="#1B4332"    stopOpacity={isDark ? 0.30 : 0.08} />
          <Stop offset="100%" stopColor={outerCenter} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* Background glows */}
      <Circle r="115" fill="url(#nb_outer)" />
      <Circle r="70"  fill="url(#nb_glow)"  />

      {/* Outer dashed decorative ring */}
      <Circle r="108"
        fill="none"
        stroke={gold}
        strokeWidth={ringWidth}
        strokeDasharray="3 8"
        opacity={ringOpacity}
      />

      {/* 12 radial lines */}
      <G stroke={gold} strokeWidth={isDark ? 0.6 : 1.0} opacity={lineOpacity}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30) * Math.PI / 180;
          return (
            <Line
              key={i}
              x1={Math.cos(a) * 48}  y1={Math.sin(a) * 48}
              x2={Math.cos(a) * 105} y2={Math.sin(a) * 105}
            />
          );
        })}
      </G>

      {/* ── 8 petal ellipses ── */}
      <G fill={petalFill} stroke={petalStroke} strokeWidth={isDark ? 1 : 1.4} opacity={petalOpacity}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
          <Ellipse
            key={deg}
            cx="0" cy="-70"
            rx="13" ry="30"
            transform={`rotate(${deg})`}
          />
        ))}
      </G>

      {/* ── Inner circle ── */}
      <Circle r="43" fill={innerBg} stroke={innerStroke} strokeWidth={isDark ? 1.3 : 1.8} />
      {/* Inner detail ring */}
      <Circle r="37" fill="none" stroke={gold} strokeWidth="0.6"
        opacity={isDark ? 0.45 : 0.70} />

      {/* ── Flame ── */}
      <Path
        d="M0,-26 C-6,-17 -8,-8 -5,1 C-3,9 3,9 5,1 C8,-8 6,-17 0,-26Z"
        fill={gold} opacity="0.95"
      />
      {/* Bright inner flame core */}
      <Path
        d="M0,-20 C-2.5,-13 -3,-5 -2,1 C-1,5 1,5 2,1 C3,-5 2.5,-13 0,-20Z"
        fill="#FFF8E0" opacity="0.80"
      />

      {/* Wick */}
      <Line x1="0" y1="1" x2="0" y2="-3"
        stroke={isDark ? '#2D1A00' : '#8B5E00'} strokeWidth="1.5" />

      {/* Candle body */}
      <Rect x="-5.5" y="1" width="11" height="19" rx="2" fill={goldLight} opacity="0.95" />

      {/* Candle base */}
      <Rect x="-8.5" y="19" width="17" height="5" rx="1.5" fill={goldDeep} opacity="0.88" />

      {/* Centre glow */}
      <Circle r="20" fill={gold} opacity="0.07" />
    </Svg>
  );
};

export default LogoSVG;
