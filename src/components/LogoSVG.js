import React from 'react';
import Svg, {
  Circle, Ellipse, Line, Path, Rect, G, Defs,
  RadialGradient, Stop,
} from 'react-native-svg';

/**
 * Static Noor ul Bayan logo — emblem only, no animation.
 * All coordinates are centred at (0,0) so scaling is clean.
 */
const LogoSVG = ({ size = 220 }) => (
  <Svg width={size} height={size} viewBox="-115 -115 230 230">
    <Defs>
      <RadialGradient id="nb_glow" cx="50%" cy="50%" r="50%">
        <Stop offset="0%"   stopColor="#C9A84C" stopOpacity="0.18" />
        <Stop offset="100%" stopColor="#0F1923"  stopOpacity="0"    />
      </RadialGradient>
      <RadialGradient id="nb_outer" cx="50%" cy="50%" r="50%">
        <Stop offset="0%"   stopColor="#1B4332" stopOpacity="0.30" />
        <Stop offset="100%" stopColor="#0A1018"  stopOpacity="0"    />
      </RadialGradient>
    </Defs>

    {/* Background glows */}
    <Circle r="115" fill="url(#nb_outer)" />
    <Circle r="70"  fill="url(#nb_glow)"  />

    {/* Outer dashed decorative ring */}
    <Circle r="108"
      fill="none" stroke="#C9A84C" strokeWidth="0.5"
      strokeDasharray="2 10" opacity="0.28" />

    {/* 12 subtle radial lines */}
    <G stroke="#C9A84C" strokeWidth="0.6" opacity="0.15">
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
    <G fill="none" stroke="#C9A84C" strokeWidth="1" opacity="0.55">
      {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
        <Ellipse
          key={deg}
          cx="0" cy="-70"
          rx="13" ry="30"
          transform={`rotate(${deg})`}
        />
      ))}
    </G>

    {/* ── Inner dark circle ── */}
    <Circle r="43" fill="#111E2E" stroke="#C9A84C" strokeWidth="1.3" />
    {/* Inner detail ring */}
    <Circle r="37" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.45" />

    {/* ── Candle & flame (everything relative to center 0,0) ── */}

    {/* Flame */}
    <Path
      d="M0,-26 C-6,-17 -8,-8 -5,1 C-3,9 3,9 5,1 C8,-8 6,-17 0,-26Z"
      fill="#C9A84C" opacity="0.95"
    />
    {/* Bright inner flame core */}
    <Path
      d="M0,-20 C-2.5,-13 -3,-5 -2,1 C-1,5 1,5 2,1 C3,-5 2.5,-13 0,-20Z"
      fill="#FFF8E0" opacity="0.70"
    />

    {/* Wick */}
    <Line x1="0" y1="1" x2="0" y2="-3" stroke="#2D1A00" strokeWidth="1.4" />

    {/* Candle body */}
    <Rect x="-5.5" y="1" width="11" height="19" rx="2" fill="#E8C875" opacity="0.92" />

    {/* Candle base */}
    <Rect x="-8.5" y="19" width="17" height="5" rx="1.5" fill="#A07830" opacity="0.82" />

    {/* Soft centre glow behind candle */}
    <Circle r="20" fill="#C9A84C" opacity="0.06" />
  </Svg>
);

export default LogoSVG;
