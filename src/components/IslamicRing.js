import React from 'react';
import Svg, { Circle, Polygon, G, Line, Path, Defs, ClipPath } from 'react-native-svg';

/**
 * Islamic geometric decorative ring — drawn with SVG primitives.
 * Gold colour theme to match the app.
 */
const IslamicRing = ({ size = 250 }) => {
  const c = size / 2;
  const GOLD = '#C9A84C';
  const GOLD_L = '#E8C875';

  const outerR  = size * 0.47;
  const mid1R   = size * 0.43;
  const mid2R   = size * 0.40;
  const innerR  = size * 0.37;
  const ornR    = size * 0.44;   // ornament orbit radius

  // 8 main diamond ornaments
  const diamonds = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 - 90) * (Math.PI / 180);
    return { cx: c + ornR * Math.cos(a), cy: c + ornR * Math.sin(a), rot: i * 45 };
  });

  // 8 small dots between diamonds
  const dots = Array.from({ length: 8 }, (_, i) => {
    const a = ((i * 45 + 22.5) - 90) * (Math.PI / 180);
    return { cx: c + (ornR - size * 0.045) * Math.cos(a), cy: c + (ornR - size * 0.045) * Math.sin(a) };
  });

  // 8 teardrop shapes at inner orbit (pointing outward)
  const teardrops = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 - 90) * (Math.PI / 180);
    return { cx: c + innerR * Math.cos(a), cy: c + innerR * Math.sin(a), rot: i * 45 };
  });

  const dm = size * 0.055; // diamond height half
  const dw = size * 0.035; // diamond width half

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>

      {/* ── Concentric rings ── */}
      <Circle cx={c} cy={c} r={outerR + size * 0.028}
        fill="none" stroke={GOLD} strokeWidth="0.4" opacity="0.18" />
      <Circle cx={c} cy={c} r={outerR + size * 0.009}
        fill="none" stroke={GOLD} strokeWidth="0.9" opacity="0.50" />
      <Circle cx={c} cy={c} r={outerR - size * 0.007}
        fill="none" stroke={GOLD} strokeWidth="0.4" opacity="0.28" />

      <Circle cx={c} cy={c} r={mid1R}
        fill="none" stroke={GOLD} strokeWidth="0.5" opacity="0.20" />
      <Circle cx={c} cy={c} r={mid2R}
        fill="none" stroke={GOLD} strokeWidth="0.4" opacity="0.15" />

      <Circle cx={c} cy={c} r={innerR + size * 0.005}
        fill="none" stroke={GOLD} strokeWidth="0.6" opacity="0.30" />
      <Circle cx={c} cy={c} r={innerR - size * 0.008}
        fill="none" stroke={GOLD} strokeWidth="0.4" opacity="0.18" />

      {/* ── Radial spokes (thin, subtle) ── */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 - 90) * (Math.PI / 180);
        return (
          <Line
            key={`spoke-${i}`}
            x1={c + (innerR + size * 0.02) * Math.cos(a)}
            y1={c + (innerR + size * 0.02) * Math.sin(a)}
            x2={c + (outerR - size * 0.025) * Math.cos(a)}
            y2={c + (outerR - size * 0.025) * Math.sin(a)}
            stroke={GOLD} strokeWidth="0.5" opacity="0.18"
          />
        );
      })}

      {/* ── 8 Teardrop shapes on inner ring ── */}
      {teardrops.map(({ cx, cy, rot }, i) => {
        const td = size * 0.038;
        const tw = size * 0.022;
        return (
          <G key={`tear-${i}`} transform={`translate(${cx},${cy}) rotate(${rot})`}>
            <Path
              d={`M 0 ${-td} C ${tw * 0.6} ${-td * 0.2}, ${tw} ${td * 0.5}, 0 ${td} C ${-tw} ${td * 0.5}, ${-tw * 0.6} ${-td * 0.2}, 0 ${-td}`}
              fill={GOLD} opacity="0.55"
            />
          </G>
        );
      })}

      {/* ── 8 Diamond ornaments on outer ring ── */}
      {diamonds.map(({ cx, cy, rot }, i) => (
        <G key={`d-${i}`} transform={`translate(${cx},${cy}) rotate(${rot})`}>
          {/* Outer diamond */}
          <Polygon
            points={`0,${-dm} ${dw},0 0,${dm} ${-dw},0`}
            fill={GOLD} opacity="0.92"
          />
          {/* Inner highlight diamond */}
          <Polygon
            points={`0,${-dm * 0.48} ${dw * 0.48},0 0,${dm * 0.48} ${-dw * 0.48},0`}
            fill={GOLD_L} opacity="0.45"
          />
        </G>
      ))}

      {/* ── 8 Small circular dots ── */}
      {dots.map(({ cx, cy }, i) => (
        <Circle key={`dot-${i}`}
          cx={cx} cy={cy} r={size * 0.013}
          fill={GOLD} opacity="0.60"
        />
      ))}

      {/* ── 24 tick marks on outermost ring ── */}
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i * 15 - 90) * (Math.PI / 180);
        const major = i % 3 === 0;
        const r1 = outerR + size * 0.022;
        const r2 = r1 + (major ? size * 0.020 : size * 0.011);
        return (
          <Line key={`tk-${i}`}
            x1={c + r1 * Math.cos(a)} y1={c + r1 * Math.sin(a)}
            x2={c + r2 * Math.cos(a)} y2={c + r2 * Math.sin(a)}
            stroke={GOLD}
            strokeWidth={major ? '1.3' : '0.6'}
            opacity={major ? '0.65' : '0.30'}
          />
        );
      })}

      {/* ── 8 small arc segments between diamonds ── */}
      {Array.from({ length: 8 }, (_, i) => {
        const startA = (i * 45 + 5 - 90)  * (Math.PI / 180);
        const endA   = (i * 45 + 40 - 90) * (Math.PI / 180);
        const arcR = outerR + size * 0.009;
        const x1 = c + arcR * Math.cos(startA);
        const y1 = c + arcR * Math.sin(startA);
        const x2 = c + arcR * Math.cos(endA);
        const y2 = c + arcR * Math.sin(endA);
        return (
          <Path
            key={`arc-${i}`}
            d={`M ${x1} ${y1} A ${arcR} ${arcR} 0 0 1 ${x2} ${y2}`}
            fill="none" stroke={GOLD_L} strokeWidth="1.8" opacity="0.55"
          />
        );
      })}
    </Svg>
  );
};

export default IslamicRing;
