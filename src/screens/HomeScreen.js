import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Animated, Dimensions, Platform, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import LogoSVG from '../components/LogoSVG';

const { width } = Dimensions.get('window');

const BG        = '#0C1520';
const CARD      = '#111E2E';
const CARD2     = '#16253A';
const GOLD      = '#C9A84C';
const GOLD_L    = '#E8C875';
const EMERALD   = '#1B4332';
const EMERALD_L = '#5A8A6A';
const TEXT      = '#F0EAD6';
const TEXT_S    = '#7A9E8A';
const BORDER    = 'rgba(201,168,76,0.13)';

const DAILY = {
  arabic:  'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
  urdu:    'بے شک مشکل کے ساتھ آسانی ہے',
  english: 'Indeed, with hardship comes ease.',
  ref:     'Surah Ash-Sharh (94:6)  •  الشرح ٩٤:٦',
};

const QUICK_ACTIONS = [
  { icon: 'book-open', label: 'Read',    labelU: 'پڑھیں', color: GOLD,      screen: 'QuranReading'    },
  { icon: 'edit-2',    label: 'Grammar', labelU: 'گرامر',  color: EMERALD_L, screen: 'GrammarLearning' },
];

const PRAYERS = [
  { name: 'Fajr',    nameU: 'فجر',  time: '5:12 AM',  icon: 'sunrise', isNext: false, past: true  },
  { name: 'Dhuhr',   nameU: 'ظہر',  time: '12:30 PM', icon: 'sun',     isNext: false, past: true  },
  { name: 'Asr',     nameU: 'عصر',  time: '3:45 PM',  icon: 'cloud',   isNext: true,  past: false },
  { name: 'Maghrib', nameU: 'مغرب', time: '6:18 PM',  icon: 'sunset',  isNext: false, past: false },
  { name: 'Isha',    nameU: 'عشاء', time: '7:45 PM',  icon: 'moon',    isNext: false, past: false },
];

const SURAHS = [
  { num: 1,  arabic: 'الفاتحة',  english: 'Al-Fatihah', meaning: 'The Opening',      verses: 7,   type: 'Meccan'  },
  { num: 2,  arabic: 'البقرة',   english: 'Al-Baqarah', meaning: 'The Cow',           verses: 286, type: 'Medinan' },
  { num: 3,  arabic: 'آل عمران', english: "Ali 'Imran", meaning: 'Family of Imran',   verses: 200, type: 'Medinan' },
  { num: 36, arabic: 'يس',       english: 'Ya-Sin',      meaning: 'Ya Sin',            verses: 83,  type: 'Meccan'  },
  { num: 55, arabic: 'الرحمن',   english: 'Ar-Rahman',  meaning: 'The Most Merciful', verses: 78,  type: 'Medinan' },
];

const NAV_ITEMS = [
  { icon: 'home',     label: 'Home',      id: 'home'      },
  { icon: 'book-open',label: 'Read',      id: 'read'      },
  { icon: 'compass',  label: 'Qibla',     id: 'qibla'     },
  { icon: 'heart',    label: 'Favorites', id: 'favorites' },
  { icon: 'user',     label: 'Profile',   id: 'profile'   },
];

export default function HomeScreen({ navigation }) {
  const [liked, setLiked]       = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* ════ HEADER ════ */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.avatarWrap}>
            <LogoSVG size={40} />
            <View style={s.onlineDot} />
          </View>
          <View>
            <Text style={s.greetSmall}>Assalamu Alaikum  •  السلام علیکم</Text>
            <Text style={s.greetName}>Rumesha</Text>
          </View>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.iconBtn}>
            <Feather name="bell" size={18} color={TEXT_S} />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn}>
            <Feather name="settings" size={18} color={TEXT_S} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ════ SCROLL ════ */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* Verse of the Day */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={s.sectionRow}>
            <Feather name="star" size={14} color={GOLD} />
            <Text style={s.secTitle}>Verse of the Day  •  آیتِ روز</Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => setLiked(!liked)} style={s.smBtn}>
              <Feather name="heart" size={16} color={liked ? '#e55' : TEXT_S} />
            </TouchableOpacity>
            <TouchableOpacity style={s.smBtn}>
              <Feather name="share-2" size={16} color={TEXT_S} />
            </TouchableOpacity>
          </View>

          <View style={s.verseCard}>
            <View style={s.verseGlow} />
            <Image
              source={require('../assets/mosque.png')}
              style={s.mosqueBg}
              resizeMode="contain"
            />
            <Text style={s.verseArabic}>{DAILY.arabic}</Text>
            <View style={s.verseDivider} />
            <View style={s.verseTextCenter}>
              <Text style={s.verseUrdu}>{DAILY.urdu}</Text>
              <Text style={s.verseEnglish}>{DAILY.english}</Text>
              <Text style={s.verseRef}>{DAILY.ref}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Prayer Times */}
        <Text style={s.secTitle2}>Prayer Times  •  نماز کے اوقات</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.prayerScroll}
          contentContainerStyle={{ paddingTop: 14, paddingBottom: 4, paddingHorizontal: 2 }}
        >
          {PRAYERS.map((p, i) => (
            <View
              key={i}
              style={[
                s.prayerCard,
                p.isNext && s.prayerCardNext,
                p.past   && s.prayerCardPast,
              ]}
            >
              {p.isNext && (
                <View style={s.nextBadge}>
                  <Text style={s.nextBadgeTxt}>NEXT</Text>
                </View>
              )}
              <Feather name={p.icon} size={20} color={p.isNext ? GOLD : TEXT_S} />
              <Text style={[s.prayerName,  p.isNext && { color: GOLD }]}>{p.name}</Text>
              <Text style={[s.prayerNameU, p.isNext && { color: GOLD }]}>{p.nameU}</Text>
              <Text style={[s.prayerTime,  p.isNext && { color: TEXT }]}>{p.time}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <Text style={s.secTitle2}>Quick Actions  •  فوری رسائی</Text>
        <View style={s.qaGrid}>
          {QUICK_ACTIONS.map((a, i) => (
            <TouchableOpacity
              key={i}
              style={s.qaCard}
              activeOpacity={0.8}
              onPress={() => a.screen && navigation.navigate(a.screen)}
            >
              <View style={[s.qaIconBox, { backgroundColor: a.color + '18' }]}>
                <Feather name={a.icon} size={20} color={a.color} />
              </View>
              <Text style={[s.qaLabel, { color: a.color }]}>{a.label}</Text>
              <Text style={s.qaLabelU}>{a.labelU}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Reading */}
        <TouchableOpacity style={s.continueCard} activeOpacity={0.85} onPress={() => navigation.navigate('QuranReading')}>
          <View style={s.continueGlowGold} />
          <View style={s.continueGlowGreen} />

          {/* Circular SVG progress ring */}
          {(() => {
            const R = 30;
            const C = 2 * Math.PI * R;   // ≈ 188.5
            const pct = 0.49;
            return (
              <View style={s.circleWrap}>
                <Svg width={76} height={76}>
                  {/* Track ring */}
                  <Circle cx={38} cy={38} r={R} stroke={'#1A2E42'} strokeWidth={7} fill="none" />
                  {/* Gold arc — starts 12 o'clock, goes counter-clockwise (12→11→10→9) */}
                  <Circle
                    cx={38} cy={38} r={R}
                    stroke={GOLD}
                    strokeWidth={7}
                    fill="none"
                    strokeDasharray={C}
                    strokeDashoffset={C * (1 - pct)}
                    strokeLinecap="round"
                    rotation={-90}
                    origin="38,38"
                    scale="-1,1"
                  />
                </Svg>
                <View style={s.circleCenter}>
                  <Text style={s.circlePct}>49%</Text>
                </View>
              </View>
            );
          })()}

          {/* Right side text */}
          <View style={s.continueInfo}>
            <Text style={s.continueSup}>Last Read  •  آخری مقام</Text>
            <View style={s.continueNameRow}>
              <Text style={s.continueSurahEn}>Surah Al-Baqarah</Text>
              <Text style={s.continueSurahAr}>سورة البقرة</Text>
            </View>
            <View style={s.ayahBadgeRow}>
              <View style={s.ayahBadge}>
                <Text style={s.ayahBadgeTxt}>Ayah 142</Text>
              </View>
              <Text style={s.ayahOf}>of 286</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Popular Surahs */}
        <View style={s.sectionRow}>
          <Text style={s.secTitle2}>Popular Surahs  •  مشہور سورتیں</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={s.viewAll} onPress={() => navigation.navigate('QuranReading', { openSurahList: true })}>
            <Text style={s.viewAllTxt}>View All</Text>
            <Feather name="chevron-right" size={14} color={GOLD} />
          </TouchableOpacity>
        </View>

        <View style={s.surahList}>
          {SURAHS.map((sr, i) => (
            <TouchableOpacity
              key={i}
              style={s.surahRow}
              onPress={() => navigation.navigate('QuranReading', { surahNum: sr.num })}
              activeOpacity={0.8}
            >
              <View style={s.surahNumBox}>
                <Text style={s.surahNum}>{sr.num}</Text>
              </View>
              <View style={s.surahMid}>
                <View style={s.surahNameRow}>
                  <Text style={s.surahEn}>{sr.english}</Text>
                  <Text style={s.surahAr}>{sr.arabic}</Text>
                </View>
                <View style={s.surahMetaRow}>
                  <View style={[s.typeBadge, sr.type === 'Meccan' ? s.meccan : s.medinan]}>
                    <Text style={s.typeTxt}>{sr.type}</Text>
                  </View>
                  <Text style={s.surahMeta}>{sr.verses} verses  •  {sr.meaning}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={TEXT_S} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ════ BOTTOM NAV ════ */}
      <View style={s.bottomNav}>
        {NAV_ITEMS.map(item => {
          const isActive = activeNav === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={s.navItem}
              onPress={() => {
                setActiveNav(item.id);
                if (item.id === 'read') navigation.navigate('QuranReading');
              }}
              activeOpacity={0.7}
            >
              {isActive && <View style={s.navActiveLine} />}
              <View style={[s.navIconBox, isActive && s.navIconBoxActive]}>
                <Feather name={item.icon} size={20} color={isActive ? GOLD : TEXT_S} />
              </View>
              <Text style={[s.navLabel, isActive && s.navLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 14,
    backgroundColor: BG,
  },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerRight: { flexDirection: 'row', gap: 8 },
  avatarWrap:  { position: 'relative' },
  onlineDot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: EMERALD_L, borderWidth: 2, borderColor: BG,
  },
  greetSmall: { fontSize: 10, color: TEXT_S, letterSpacing: 0.3 },
  greetName:  { fontSize: 16, color: TEXT, fontWeight: '600', marginTop: 1 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingHorizontal: 20, paddingTop: 8 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 },
  secTitle:   { fontSize: 14, color: TEXT, fontWeight: '600' },
  secTitle2:  { fontSize: 15, color: GOLD_L, fontWeight: '700', marginBottom: 12, marginTop: 6 },

  verseCard: {
    backgroundColor: CARD, borderRadius: 20,
    borderWidth: 1, borderColor: BORDER,
    paddingVertical: 5, paddingHorizontal: 22,
    marginBottom: 16, overflow: 'hidden',
  },
  verseGlow: {
    position: 'absolute', top: 7, alignSelf: 'center',
    width: 180, height: 45, borderRadius: 30,
    backgroundColor: EMERALD + '30',
  },
  mosqueBg: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 0,
    width: '100%',
    height: 460,
    opacity: 0.40,
    tintColor: GOLD,
  },
  verseArabic: { fontSize: 24, color: TEXT, textAlign: 'center', lineHeight: 50, fontWeight: '600' },
  verseDivider: { height: 0.8, backgroundColor: BORDER, marginVertical: 10 },
  verseUrdu:   { fontSize: 15, color: TEXT, textAlign: 'center', lineHeight: 26, marginBottom: 6 },
  verseEnglish:{ fontSize: 13, color: TEXT_S, textAlign: 'center', lineHeight: 22, fontStyle: 'italic', marginBottom: 10 },
  verseTextCenter: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseRef:    { fontSize: 11, color: EMERALD_L, textAlign: 'center', letterSpacing: 0.4 },
  smBtn:       { padding: 6 },

  continueCard: {
    backgroundColor: CARD2, borderRadius: 24,
    borderWidth: 1, borderColor: BORDER,
    paddingVertical: 18, paddingHorizontal: 20,
    marginBottom: 24, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', gap: 18,
  },
  continueGlowGold: {
    position: 'absolute', top: -20, right: -20,
    width: 100, height: 100, borderRadius: 50, backgroundColor: GOLD + '18',
  },
  continueGlowGreen: {
    position: 'absolute', bottom: -20, left: -20,
    width: 80, height: 80, borderRadius: 40, backgroundColor: EMERALD + '25',
  },

  /* Circular progress */
  circleWrap: {
    width: 76, height: 76,
    alignItems: 'center', justifyContent: 'center',
  },
  circleCenter: {
    position: 'absolute',
    alignItems: 'center', justifyContent: 'center',
  },
  circlePct: { fontSize: 13, color: GOLD, fontWeight: '700' },

  /* Right text */
  continueInfo: { flex: 1 },
  continueSup:   { fontSize: 14, color: GOLD_L, letterSpacing: 0.8, fontWeight: '700', marginBottom: 8 },
  continueNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  continueSurahAr: { fontSize: 18, color: GOLD,fontWeight: '600' },
  continueSurahEn: { fontSize: 13, color: TEXT, fontWeight: '600' },
  ayahBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  ayahBadge: {
    backgroundColor: EMERALD + '40', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
  },
  ayahBadgeTxt: { fontSize: 11, color: EMERALD_L },
  ayahOf:       { fontSize: 11, color: TEXT_S },

  qaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 24 },
  qaCard: {
    width: (width - 54) / 2,
    backgroundColor: CARD, borderRadius: 20,
    borderWidth: 1, borderColor: BORDER,
    paddingVertical: 14, paddingHorizontal: 18,
    alignItems: 'center', gap: 7,
  },
  qaIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  qaLabel:   { fontSize: 13, fontWeight: '700' },
  qaLabelU:  { fontSize: 11, color: TEXT_S },

  prayerScroll: { marginBottom: 24 },
  prayerCard: {
    width: 76, marginRight: 10,
    backgroundColor: CARD, borderRadius: 20,
    borderWidth: 1, borderColor: BORDER,
    padding: 12, paddingTop: 16,
    alignItems: 'center', gap: 4,
  },
  prayerCardNext: { backgroundColor: GOLD + '18', borderColor: GOLD + '55' },
  prayerCardPast: { opacity: 0.4 },
  nextBadge: {
    position: 'absolute', top: -11, alignSelf: 'center',
    backgroundColor: GOLD, borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2,
    zIndex: 10,
  },
  nextBadgeTxt: { fontSize: 7, color: BG, fontWeight: '800', letterSpacing: 1 },
  prayerName:   { fontSize: 11, color: TEXT_S, fontWeight: '600' },
  prayerNameU:  { fontSize: 10, color: TEXT_S },
  prayerTime:   { fontSize: 11, color: TEXT_S, fontWeight: '500' },

  viewAll:    { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 2 },
  viewAllTxt: { fontSize: 13, color: GOLD, fontWeight: '600' },
  surahList:  { gap: 8, marginBottom: 10 },
  surahRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: CARD, borderRadius: 20, padding: 14,
    borderWidth: 1, borderColor: BORDER,
  },
  surahNumBox: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: GOLD + '18', borderWidth: 1, borderColor: GOLD + '30',
    alignItems: 'center', justifyContent: 'center',
  },
  surahNum:     { fontSize: 14, color: GOLD, fontWeight: '700' },
  surahMid:     { flex: 1 },
  surahNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  surahEn:      { fontSize: 15, color: TEXT, fontWeight: '600' },
  surahAr:      { fontSize: 17, color: GOLD },
  surahMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  typeBadge:    { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  meccan:       { backgroundColor: GOLD + '22' },
  medinan:      { backgroundColor: EMERALD + '44' },
  typeTxt:      { fontSize: 10, color: TEXT_S, fontWeight: '600' },
  surahMeta:    { fontSize: 11, color: TEXT_S },

  /* Bottom Nav — solid background, no bleed-through */
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    backgroundColor: BG,
    borderTopWidth: 1, borderTopColor: BORDER,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 10,
  },
  navItem:         { alignItems: 'center', position: 'relative', paddingHorizontal: 10 },
  navActiveLine: {
    position: 'absolute', top: -10, alignSelf: 'center',
    width: 28, height: 3, backgroundColor: GOLD, borderRadius: 2,
    shadowColor: GOLD, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 6,
  },
  navIconBox:       { width: 40, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  navIconBoxActive: { backgroundColor: GOLD + '18' },
  navLabel:         { fontSize: 10, color: TEXT_S, marginTop: 2 },
  navLabelActive:   { color: GOLD, fontWeight: '600' },
});
