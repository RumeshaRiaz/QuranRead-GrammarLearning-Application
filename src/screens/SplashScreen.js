import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Easing,
  Platform,
} from 'react-native';
import LogoSVG from '../components/LogoSVG';

const { height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const logoFade  = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.80)).current;
  const textFade  = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(28)).current;
  const btnFade   = useRef(new Animated.Value(0)).current;
  const btnScale  = useRef(new Animated.Value(0.85)).current;
  const pulseBtn  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1 – logo
    Animated.parallel([
      Animated.timing(logoFade, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    // 2 – text (delayed)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 550);

    // 3 – button (delayed more)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(btnFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(btnScale, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();

      // gentle pulse on border after it appears
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseBtn, {
              toValue: 1.04,
              duration: 1400,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseBtn, {
              toValue: 1,
              duration: 1400,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, 700);
    }, 1100);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0C1520" />

      {/* Corner brackets – decorative */}
      <View style={[styles.corner, styles.cTL]} />
      <View style={[styles.corner, styles.cTR]} />
      <View style={[styles.corner, styles.cBL]} />
      <View style={[styles.corner, styles.cBR]} />

      {/* Warm radial tint behind logo */}
      <View style={styles.bgGlow} />

      {/*
       * ── Layout ──
       * |  topSpacer (flex 1.2)  |
       * |  logo                  |
       * |  text                  |
       * |  midSpacer (flex 1)    |
       * |  button + safePad      |
       */}

      <View style={styles.topSpacer} />

      {/* Logo */}
      <Animated.View style={{
        opacity: logoFade,
        transform: [{ scale: logoScale }],
        alignItems: 'center',
      }}>
        <LogoSVG size={220} />
      </Animated.View>

      {/* Text block */}
      <Animated.View style={[
        styles.textBlock,
        { opacity: textFade, transform: [{ translateY: textSlide }] },
      ]}>
        <Text style={styles.arabicName}>نور البيان</Text>

        <View style={styles.divider}>
          <View style={styles.divLine} />
          <View style={styles.divDiamond} />
          <View style={styles.divLine} />
        </View>

        <Text style={styles.englishName}>NOOR UL BAYAN</Text>
        <Text style={styles.tagEn}>The Light of Clarity</Text>
        <Text style={styles.tagUrdu}>قرآن کا نور </Text>
      </Animated.View>

      <View style={styles.midSpacer} />

      {/* Get Started button — part of normal flow, not absolute */}
      <Animated.View style={[
        styles.btnOuter,
        { opacity: btnFade, transform: [{ scale: btnScale }] },
      ]}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.replace('Onboarding')}
          activeOpacity={0.80}
        >
          <Text style={styles.btnUrdu}>شروع کریں</Text>
          <Text style={styles.btnEn}>GET STARTED</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Safe-area bottom padding */}
      <View style={styles.bottomPad} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0C1520',
    alignItems: 'center',
  },

  topSpacer: { flex: 1.2 },
  midSpacer: { flex: 1 },

  bottomPad: {
    height: Platform.OS === 'ios' ? 44 : 32,
  },

  /* Radial background tint */
  bgGlow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 140,
    backgroundColor: '#1B4332',
    opacity: 0.10,
    top: height * 0.19,
  },

  /* Text */
  textBlock: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  arabicName: {
    fontSize: 44,
    fontWeight: '700',
    color: '#C9A84C',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 200,
    marginBottom: 12,
  },
  divLine: {
    flex: 1,
    height: 0.7,
    backgroundColor: '#C9A84C',
    opacity: 0.50,
  },
  divDiamond: {
    width: 7,
    height: 7,
    backgroundColor: '#C9A84C',
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 10,
    opacity: 0.72,
  },
  englishName: {
    fontSize: 14,
    color: '#E8C875',
    letterSpacing: 7,
    marginBottom: 8,
  },
  tagEn: {
    fontSize: 12,
    color: '#5A8A6A',
    letterSpacing: 2.5,
    marginBottom: 6,
  },
  tagUrdu: {
    fontSize: 14,
    color: '#4A7A60',
  },

  /* Button */
  btnOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPulseRing: {
    position: 'absolute',
    width: 230,
    height: 62,
    borderRadius: 31,
    borderWidth: 1,
    borderColor: '#C9A84C',
    opacity: 0.22,
  },
  btn: {
    borderWidth: 1.5,
    borderColor: '#C9A84C',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 54,
    alignItems: 'center',
    backgroundColor: 'rgba(201,168,76,0.09)',
  },
  btnUrdu: {
    fontSize: 19,
    color: '#C9A84C',
    fontWeight: '700',
    letterSpacing: 1,
  },
  btnEn: {
    fontSize: 10,
    color: '#E8C875',
    letterSpacing: 4,
    marginTop: 3,
    opacity: 0.80,
  },

  /* Corner decorations */
  corner: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderColor: '#C9A84C',
    opacity: 0.20,
  },
  cTL: { top: 46, left: 22, borderTopWidth: 1, borderLeftWidth: 1 },
  cTR: { top: 46, right: 22, borderTopWidth: 1, borderRightWidth: 1 },
  cBL: { bottom: 46, left: 22, borderBottomWidth: 1, borderLeftWidth: 1 },
  cBR: { bottom: 46, right: 22, borderBottomWidth: 1, borderRightWidth: 1 },
});
