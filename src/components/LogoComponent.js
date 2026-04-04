import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';

const LogoComponent = ({ size = 200 }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim  = useRef(new Animated.Value(0.05)).current;

  // Derived measurements
  const C       = size / 2;
  const ORBIT   = size * 0.31;
  const PETAL_W = size * 0.13;
  const PETAL_H = size * 0.28;
  const DOT_R   = size * 0.030;
  const DOT_ORB = size * 0.415;
  const INNER_R = size * 0.20;

  useEffect(() => {
    // ── Flame flicker ──
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.22,
          duration: 680,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.80,
          duration: 920,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // ── Centre glow breathe ──
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.22,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.05,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Pre-compute petal & dot positions (static — no rotation)
  const elements = Array.from({ length: 8 }, (_, i) => {
    const deg = i * 45;
    const rad = (deg - 90) * (Math.PI / 180);
    return {
      deg,
      px: C + ORBIT * Math.cos(rad),
      py: C + ORBIT * Math.sin(rad),
      dx: C + DOT_ORB * Math.cos(rad),
      dy: C + DOT_ORB * Math.sin(rad),
    };
  });

  return (
    <View style={{ width: size, height: size }}>

      {/* ── Static outer ring ── */}
      <View style={{
        position: 'absolute',
        width:  DOT_ORB * 2 + DOT_R * 2 + 4,
        height: DOT_ORB * 2 + DOT_R * 2 + 4,
        borderRadius: DOT_ORB + DOT_R + 2,
        borderWidth: 0.8,
        borderColor: '#C9A84C',
        opacity: 0.35,
        left: C - (DOT_ORB + DOT_R + 2),
        top:  C - (DOT_ORB + DOT_R + 2),
      }} />

      {/* ── Static petals + dots ── */}
      <View style={{ position: 'absolute', width: size, height: size }}>
        {elements.map(({ deg, px, py, dx, dy }) => (
          <React.Fragment key={deg}>
            {/* Oval petal */}
            <View style={{
              position: 'absolute',
              width:  PETAL_W,
              height: PETAL_H,
              borderRadius: PETAL_W / 2,
              borderWidth: 1.5,
              borderColor: '#C9A84C',
              backgroundColor: 'rgba(201,168,76,0.12)',
              left: px - PETAL_W / 2,
              top:  py - PETAL_H / 2,
              transform: [{ rotate: `${deg}deg` }],
            }} />
            {/* Gold dot */}
            <View style={{
              position: 'absolute',
              width:  DOT_R * 2,
              height: DOT_R * 2,
              borderRadius: DOT_R,
              backgroundColor: '#C9A84C',
              opacity: 0.75,
              left: dx - DOT_R,
              top:  dy - DOT_R,
            }} />
          </React.Fragment>
        ))}
      </View>

      {/* ── Breathing glow behind centre ── */}
      <Animated.View style={{
        position: 'absolute',
        width:  INNER_R * 2.8,
        height: INNER_R * 2.8,
        borderRadius: INNER_R * 1.4,
        backgroundColor: '#C9A84C',
        left: C - INNER_R * 1.4,
        top:  C - INNER_R * 1.4,
        opacity: glowAnim,
      }} />

      {/* ── Dark centre circle ── */}
      <View style={{
        position: 'absolute',
        width:  INNER_R * 2,
        height: INNER_R * 2,
        borderRadius: INNER_R,
        backgroundColor: '#111E2E',
        borderWidth: 1.3,
        borderColor: '#C9A84C',
        left: C - INNER_R,
        top:  C - INNER_R,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: INNER_R * 0.10,
        overflow: 'hidden',
      }}>

        {/* Inner ring detail */}
        <View style={{
          position: 'absolute',
          width:  INNER_R * 1.6,
          height: INNER_R * 1.6,
          borderRadius: INNER_R * 0.8,
          borderWidth: 0.4,
          borderColor: '#C9A84C',
          opacity: 0.35,
        }} />

        {/* Pulsing flame */}
        <Animated.View style={{
          alignItems: 'center',
          transform: [{ scale: pulseAnim }],
          marginBottom: -1,
        }}>
          {/* Outer flame shape */}
          <View style={{
            width:  INNER_R * 0.46,
            height: INNER_R * 0.64,
            borderTopLeftRadius:     INNER_R * 0.26,
            borderTopRightRadius:    INNER_R * 0.26,
            borderBottomLeftRadius:  INNER_R * 0.10,
            borderBottomRightRadius: INNER_R * 0.10,
            backgroundColor: '#C9A84C',
          }} />
          {/* Bright inner core */}
          <View style={{
            position: 'absolute',
            width:  INNER_R * 0.19,
            height: INNER_R * 0.32,
            borderTopLeftRadius:     INNER_R * 0.10,
            borderTopRightRadius:    INNER_R * 0.10,
            borderBottomLeftRadius:  INNER_R * 0.05,
            borderBottomRightRadius: INNER_R * 0.05,
            backgroundColor: '#FFF8E0',
            opacity: 0.88,
            top: INNER_R * 0.10,
          }} />
        </Animated.View>

        {/* Wick */}
        <View style={{
          width: 1.5,
          height: INNER_R * 0.11,
          backgroundColor: '#3D2800',
        }} />

        {/* Candle body */}
        <View style={{
          width:  INNER_R * 0.50,
          height: INNER_R * 0.78,
          borderRadius: 2,
          backgroundColor: '#E8C875',
          opacity: 0.92,
        }} />

        {/* Candle base */}
        <View style={{
          width:  INNER_R * 0.76,
          height: INNER_R * 0.18,
          borderRadius: 2,
          backgroundColor: '#A07830',
          opacity: 0.85,
          marginTop: 2,
        }} />
      </View>
    </View>
  );
};

export default LogoComponent;
