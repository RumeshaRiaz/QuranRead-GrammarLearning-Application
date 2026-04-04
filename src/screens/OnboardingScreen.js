import { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
  Platform,
  useWindowDimensions,
} from 'react-native';

const PAGES = [
  {
    image: require('../assets/download (5).jpeg'),
    arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    english: 'In the name of Allah, the Most Gracious, the Most Merciful',
    urdu: 'اللہ کے نام سے جو بڑا مہربان، نہایت رحم والا ہے',
    source: 'الفاتحة  ١ : ١',
  },
  {
    image: require('../assets/download (2).jpeg'),
    arabic: 'ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ',
    english: 'Read in the name of your Lord who created',
    urdu: 'پڑھ اپنے رب کے نام سے جس نے پیدا کیا',
    source: 'العلق  ٩٦ : ١',
  },
  {
    image: require('../assets/download (4).jpeg'),
    arabic: 'إِنَّ هَـٰذَا ٱلْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ',
    english: 'This Quran guides to what is most upright',
    urdu: 'یہ قرآن اس راہ کی طرف ہدایت دیتا ہے جو سب سے سیدھی ہے',
    source: 'الإسراء  ١٧ : ٩',
  },
];

export default function OnboardingScreen({ navigation }) {
  /* Always read live dimensions — works on every screen size */
  const { width, height } = useWindowDimensions();

  const [currentPage, setCurrentPage] = useState(0);
  const fadeAnim    = useRef(new Animated.Value(1)).current;
  const slideAnim   = useRef(new Animated.Value(0)).current;
  const btnScaleAnim = useRef(new Animated.Value(1)).current;

  const isLast = currentPage === PAGES.length - 1;

  /* ── Responsive values ── */
  const arabicFontSize  = Math.min(width * 0.060, 26);
  const englishFontSize = Math.min(width * 0.034, 14);
  const urduFontSize    = Math.min(width * 0.040, 16);
  const sourceFontSize  = Math.min(width * 0.030, 12);

  /*
   * Card vertical position (% of screen height):
   *   Page 0 & 2 → upper-center  (bottom edge ≈ 62% from screen bottom)
   *   Page 1     → lower-center  (bottom edge ≈ 14% from screen bottom)
   *
   * Using percentage ensures the card sits correctly on any screen size.
   */
  const cardTopBottom    = height * 0.42;   // bottom: 42 % up = upper half
  const cardBottomBottom = height * 0.14;   // bottom: 14 % up = just above nav

  const animateToPage = (nextPage) => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 280, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -24, duration: 280, useNativeDriver: true }),
    ]).start(() => {
      setCurrentPage(nextPage);
      slideAnim.setValue(24);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 380, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 380, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = () => {
    Animated.sequence([
      Animated.timing(btnScaleAnim, { toValue: 0.88, duration: 100, useNativeDriver: true }),
      Animated.timing(btnScaleAnim, { toValue: 1,    duration: 150, useNativeDriver: true }),
    ]).start();

    if (isLast) {
      navigation.replace('Home');
    } else {
      animateToPage(currentPage + 1);
    }
  };

  const page = PAGES[currentPage];

  /* Bottom nav safe area */
  const navPaddingBottom = Platform.OS === 'ios' ? 42 : 28;

  return (
    <View style={styles.container}>
      <StatusBar translucent barStyle="light-content" backgroundColor="transparent" />

      {/* Background image — fills screen using dynamic dimensions */}
      <Image
        source={page.image}
        style={{ position: 'absolute', width, height }}
        resizeMode="cover"
      />

      {/* Overlay */}
      <View style={{ position: 'absolute', width, height, backgroundColor: 'rgba(8,14,22,0.55)' }} />

      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity
          style={[styles.skipBtn, { top: Platform.OS === 'ios' ? 54 : 42 }]}
          onPress={() => navigation.replace('Home')}
          activeOpacity={0.75}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Animated ayah card — bottom position is % of screen height */}
      <Animated.View
        style={[
          styles.cardWrapper,
          { bottom: currentPage === 1 ? cardBottomBottom : cardTopBottom },
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={[styles.arabicText, { fontSize: arabicFontSize, lineHeight: arabicFontSize * 1.65 }]}>
          {page.arabic}
        </Text>

        <View style={styles.ornament}>
          <View style={styles.ornamentBar} />
          <View style={styles.ornamentDot} />
          <View style={styles.ornamentBar} />
        </View>

        <Text style={[styles.englishText, { fontSize: englishFontSize, lineHeight: englishFontSize * 1.6 }]}>
          {page.english}
        </Text>

        <Text style={[styles.urduText, { fontSize: urduFontSize, lineHeight: urduFontSize * 1.7 }]}>
          {page.urdu}
        </Text>

        <Text style={[styles.sourceText, { fontSize: sourceFontSize }]}>
          {page.source}
        </Text>
      </Animated.View>

      {/* Bottom navigation bar — always anchored to screen bottom */}
      <View style={[styles.bottomNav, { paddingBottom: navPaddingBottom }]}>
        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {PAGES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentPage ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Next / Start button */}
        <Animated.View style={{ transform: [{ scale: btnScaleAnim }] }}>
          <TouchableOpacity
            style={[styles.nextBtn, isLast && styles.nextBtnLast]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            {isLast ? (
              <Text style={styles.startText}>
                شروع{'\n'}<Text style={styles.startTextSub}>Start</Text>
              </Text>
            ) : (
              <View style={styles.arrowContainer}>
                <View style={styles.arrowLine} />
                <View style={styles.arrowHead} />
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1018',
  },

  /* Skip button */
  skipBtn: {
    position: 'absolute',
    right: 22,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 0.8,
    borderColor: 'rgba(201,168,76,0.55)',
    backgroundColor: 'rgba(12,21,32,0.55)',
    zIndex: 10,
  },
  skipText: { color: '#C9A84C', fontSize: 13, opacity: 0.9 },

  /* Ayah card — left/right are fixed margins; bottom is set inline (responsive) */
  cardWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    paddingHorizontal: 22,
    paddingVertical: 20,
  },

  /* Ornament */
  ornament: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  ornamentBar: { flex: 1, height: 0.7, backgroundColor: '#C9A84C', opacity: 0.45 },
  ornamentDot: {
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: '#C9A84C',
    marginHorizontal: 10, opacity: 0.55,
  },

  /* Text — font sizes set inline for responsiveness */
  arabicText:  { color: '#F0D98A', textAlign: 'center', letterSpacing: 1.2 },
  englishText: { color: '#D4CAAF', textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 6, marginBottom: 8 },
  urduText:    { color: '#C0D4C8', textAlign: 'center', paddingHorizontal: 4, marginBottom: 10 },
  sourceText:  { color: '#7AB898', textAlign: 'center', letterSpacing: 0.8, opacity: 0.85 },

  /* Bottom nav */
  bottomNav: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  /* Dots */
  dotsRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
  dotActive:   { width: 26, backgroundColor: '#C9A84C' },
  dotInactive: { width: 8,  backgroundColor: 'rgba(201,168,76,0.30)' },

  /* Next / Start button */
  nextBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#C9A84C',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 10,
    elevation: 10,
  },
  nextBtnLast: { width: 72, borderRadius: 36, paddingHorizontal: 8 },

  arrowContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  arrowLine: { width: 18, height: 3, backgroundColor: '#0C1520', borderRadius: 2 },
  arrowHead: {
    width: 10, height: 10,
    borderTopWidth: 3, borderRightWidth: 3,
    borderColor: '#0C1520',
    transform: [{ rotate: '45deg' }],
    marginLeft: -3,
  },

  startText:    { fontSize: 15, color: '#0C1520', fontWeight: '700', textAlign: 'center', lineHeight: 18 },
  startTextSub: { fontSize: 10, fontWeight: '400', letterSpacing: 1.5 },
});
