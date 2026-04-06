import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Animated, Dimensions, Platform, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import LogoSVG from '../components/LogoSVG';
import { useTheme } from '../context/ThemeContext';
import { getPrayerTimes, fmt } from '../utils/prayerTimes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadProgress } from '../utils/readingProgress';

const { width } = Dimensions.get('window');

/* ── Gregorian → Hijri conversion (Kuwaiti algorithm) ── */
const HIJRI_MONTHS = [
  'مُحَرَّم', 'صَفَر', 'رَبِيع الأوَّل', 'رَبِيع الثَّاني',
  'جُمَادَى الأُولَى', 'جُمَادَى الآخِرَة', 'رَجَب', 'شَعْبَان',
  'رَمَضَان', 'شَوَّال', 'ذُو الْقَعْدَة', 'ذُو الْحِجَّة',
];
function toHijri(date = new Date()) {
  const jd = Math.floor((14 + 12 * (date.getMonth() + 1)) / 12);
  const y = date.getFullYear() + 4800 - jd;
  const m = (date.getMonth() + 1) + 12 * jd - 3;
  const jdn = date.getDate()
    + Math.floor((153 * m + 2) / 5)
    + 365 * y
    + Math.floor(y / 4)
    - Math.floor(y / 100)
    + Math.floor(y / 400)
    - 32045;
  const l = jdn - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719)
    + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2
    - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
    - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hMonth = Math.floor((24 * l3) / 709);
  const hDay = l3 - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;
  return { day: hDay, month: hMonth - 1, year: hYear }; // month 0-indexed
}
const toArabicNumerals = n =>
  String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
function getIslamicDate() {
  const h = toHijri();
  return `${toArabicNumerals(h.day)} ${HIJRI_MONTHS[h.month]} ${toArabicNumerals(h.year)}`;
}

const DAILY_VERSES = [
  // 1
  { arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', urdu: 'بے شک مشکل کے ساتھ آسانی ہے', english: 'Indeed, with hardship comes ease.', ref: 'Ash-Sharh 94:6' },
  // 2
  { arabic: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ', urdu: 'اور وہ تمہارے ساتھ ہے جہاں بھی تم ہو', english: 'And He is with you wherever you are.', ref: 'Al-Hadid 57:4' },
  // 3
  { arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', urdu: 'ہمیں اللہ کافی ہے، وہ بہترین کارساز ہے', english: 'Allah is sufficient for us; He is the best disposer of affairs.', ref: 'Ali Imran 3:173' },
  // 4
  { arabic: 'وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ', urdu: 'اور اللہ کی رحمت سے مایوس نہ ہو', english: 'And despair not of relief from Allah.', ref: 'Yusuf 12:87' },
  // 5
  { arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', urdu: 'بے شک اللہ صبر کرنے والوں کے ساتھ ہے', english: 'Indeed, Allah is with the patient.', ref: 'Al-Baqarah 2:153' },
  // 6
  { arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', urdu: 'تو یقیناً مشکل کے ساتھ آسانی ہے', english: 'For indeed, with hardship will be ease.', ref: 'Ash-Sharh 94:5' },
  // 7
  { arabic: 'وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ', urdu: 'ممکن ہے کوئی چیز تمہیں ناپسند ہو اور وہ تمہارے لیے بہتر ہو', english: 'Perhaps you dislike something and it is good for you.', ref: 'Al-Baqarah 2:216' },
  // 8
  { arabic: 'رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ', urdu: 'اے میرے رب! جو بھلائی بھی تو نازل کرے میں اس کا محتاج ہوں', english: 'My Lord, I am in need of whatever good You send down to me.', ref: 'Al-Qasas 28:24' },
  // 9
  { arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', urdu: 'اور جو اللہ پر بھروسہ کرے تو وہی اسے کافی ہے', english: 'And whoever relies upon Allah — He will suffice him.', ref: 'At-Talaq 65:3' },
  // 10
  { arabic: 'يُحِبُّهُمْ وَيُحِبُّونَهُ', urdu: 'وہ ان سے محبت کرتا ہے اور وہ اس سے محبت کرتے ہیں', english: 'He loves them and they love Him.', ref: 'Al-Ma\'idah 5:54' },
  // 11
  { arabic: 'وَاللَّهُ يُحِبُّ الصَّابِرِينَ', urdu: 'اور اللہ صبر کرنے والوں سے محبت کرتا ہے', english: 'And Allah loves the steadfast.', ref: 'Ali Imran 3:146' },
  // 12
  { arabic: 'إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ', urdu: 'بے شک اللہ نیکی کرنے والوں کا اجر ضائع نہیں کرتا', english: 'Indeed, Allah does not waste the reward of the doers of good.', ref: 'At-Tawbah 9:120' },
  // 13
  { arabic: 'وَاللَّهُ خَيْرُ الرَّازِقِينَ', urdu: 'اور اللہ بہترین رزق دینے والا ہے', english: 'And Allah is the best of providers.', ref: 'Al-Jumu\'ah 62:11' },
  // 14
  { arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ', urdu: 'پس تم مجھے یاد کرو، میں تمہیں یاد کروں گا', english: 'Remember Me and I will remember you.', ref: 'Al-Baqarah 2:152' },
  // 15
  { arabic: 'وَهُوَ الْغَفُورُ الرَّحِيمُ', urdu: 'اور وہی بخشنے والا مہربان ہے', english: 'And He is the Forgiving, the Merciful.', ref: 'Yunus 10:107' },
  // 16
  { arabic: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ', urdu: 'کہو: اے میرے بندو جنہوں نے اپنے آپ پر زیادتی کی، اللہ کی رحمت سے مایوس نہ ہو', english: 'Do not despair of the mercy of Allah.', ref: 'Az-Zumar 39:53' },
  // 17
  { arabic: 'إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', urdu: 'بے شک اللہ ہر چیز پر قادر ہے', english: 'Indeed, Allah is over all things competent.', ref: 'Al-Baqarah 2:20' },
  // 18
  { arabic: 'وَاللَّهُ يَعْلَمُ وَأَنتُمْ لَا تَعْلَمُونَ', urdu: 'اور اللہ جانتا ہے اور تم نہیں جانتے', english: 'Allah knows and you do not know.', ref: 'Al-Baqarah 2:216' },
  // 19
  { arabic: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ', urdu: 'اور عنقریب تیرا رب تجھے اتنا دے گا کہ تو راضی ہو جائے گا', english: 'And your Lord is going to give you, and you will be satisfied.', ref: 'Ad-Duha 93:5' },
  // 20
  { arabic: 'أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ', urdu: 'کیا اس نے تجھے یتیم نہیں پایا اور پناہ نہیں دی؟', english: 'Did He not find you an orphan and give refuge?', ref: 'Ad-Duha 93:6' },
  // 21
  { arabic: 'وَمَا بِكُم مِّن نِّعْمَةٍ فَمِنَ اللَّهِ', urdu: 'اور تمہارے پاس جو بھی نعمت ہے وہ اللہ کی طرف سے ہے', english: 'Whatever of blessings you have, it is from Allah.', ref: 'An-Nahl 16:53' },
  // 22
  { arabic: 'وَلَذِكْرُ اللَّهِ أَكْبَرُ', urdu: 'اور اللہ کا ذکر سب سے بڑا ہے', english: 'And the remembrance of Allah is greater.', ref: 'Al-Ankabut 29:45' },
  // 23
  { arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', urdu: 'آگاہ رہو! اللہ کے ذکر سے دل سکون پاتے ہیں', english: 'Verily, in the remembrance of Allah do hearts find rest.', ref: 'Ar-Ra\'d 13:28' },
  // 24
  { arabic: 'إِنَّ مَعَ الصَّبْرِ فَرَجًا', urdu: 'بے شک صبر کے ساتھ فرج (کشادگی) ہے', english: 'Indeed, with patience comes relief.', ref: 'Hadith / Spirit of 94:5-6' },
  // 25
  { arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', urdu: 'اور کہو: اے میرے رب! مجھے علم میں اضافہ دے', english: 'And say: My Lord, increase me in knowledge.', ref: 'Ta-Ha 20:114' },
  // 26
  { arabic: 'إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ', urdu: 'بے شک اللہ بھروسہ کرنے والوں سے محبت کرتا ہے', english: 'Indeed, Allah loves those who rely upon Him.', ref: 'Al Imran 3:159' },
  // 27
  { arabic: 'وَاللَّهُ وَلِيُّ الْمُؤْمِنِينَ', urdu: 'اور اللہ مومنوں کا دوست ہے', english: 'And Allah is the ally of the believers.', ref: 'Ali Imran 3:68' },
  // 28
  { arabic: 'يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ', urdu: 'اللہ تمہارے ساتھ آسانی چاہتا ہے، مشکل نہیں', english: 'Allah intends ease for you, not hardship.', ref: 'Al-Baqarah 2:185' },
  // 29
  { arabic: 'وَاللَّهُ يَهْدِي مَن يَشَاءُ إِلَىٰ صِرَاطٍ مُّسْتَقِيمٍ', urdu: 'اور اللہ جسے چاہتا ہے سیدھے راستے کی ہدایت دیتا ہے', english: 'Allah guides whom He wills to a straight path.', ref: 'Al-Baqarah 2:213' },
  // 30
  { arabic: 'وَهُوَ الْقَادِرُ عَلَىٰ أَن يَبْعَثَ عَلَيْكُمْ عَذَابًا مِّن فَوْقِكُمْ', urdu: '—', english: '—', ref: '—' },
  // 30 — override with a beautiful closing verse
];
// Fix day 30 with a proper verse
DAILY_VERSES[29] = {
  arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً',
  urdu: 'اے ہمارے رب! ہمیں دنیا میں بھلائی دے اور آخرت میں بھی',
  english: 'Our Lord, give us good in this world and good in the Hereafter.',
  ref: 'Al-Baqarah 2:201',
};

function getDailyVerse() {
  const day = new Date().getDate(); // 1–31
  return DAILY_VERSES[(day - 1) % DAILY_VERSES.length];
}

const PRAYER_DEF = [
  { key: 'fajr', name: 'Fajr', nameU: 'فجر', icon: 'sunrise' },
  { key: 'dhuhr', name: 'Dhuhr', nameU: 'ظہر', icon: 'sun' },
  { key: 'asr', name: 'Asr', nameU: 'عصر', icon: 'cloud' },
  { key: 'maghrib', name: 'Maghrib', nameU: 'مغرب', icon: 'sunset' },
  { key: 'isha', name: 'Isha', nameU: 'عشاء', icon: 'moon' },
];

const SURAHS = [
  { num: 1, arabic: 'الفاتحة', english: 'Al-Fatihah', meaning: 'The Opening', verses: 7, type: 'Meccan' },
  { num: 2, arabic: 'البقرة', english: 'Al-Baqarah', meaning: 'The Cow', verses: 286, type: 'Medinan' },
  { num: 3, arabic: 'آل عمران', english: "Ali 'Imran", meaning: 'Family of Imran', verses: 200, type: 'Medinan' },
  { num: 36, arabic: 'يس', english: 'Ya-Sin', meaning: 'Ya Sin', verses: 83, type: 'Meccan' },
  { num: 55, arabic: 'الرحمن', english: 'Ar-Rahman', meaning: 'The Most Merciful', verses: 78, type: 'Medinan' },
];

const NAV_ITEMS = [
  { icon: 'home', label: 'Home', id: 'home' },
  { icon: 'book-open', label: 'Read', id: 'read' },
  { icon: 'compass', label: 'Qibla', id: 'qibla' },
  { icon: 'user', label: 'Profile', id: 'profile' },
];

function getPrayerStatus(times) {
  const now = new Date();
  const sunrise = times.sunrise; // sunrise Date object
  const list = PRAYER_DEF.map(p => ({ ...p, date: times[p.key], time: fmt(times[p.key]) }));
  let currentIdx = -1;
  for (let i = list.length - 1; i >= 0; i--) {
    if (now >= list[i].date) { currentIdx = i; break; }
  }
  const nextIdx = currentIdx < list.length - 1 ? currentIdx + 1 : -1;
  const fajrPastSunrise = sunrise && now >= sunrise; // Fajr expired at sunrise
  return list.map((p, i) => ({
    ...p,
    isCurrent: i === currentIdx && !(i === 0 && fajrPastSunrise),
    isNext: (i === nextIdx && !(currentIdx === 0 && fajrPastSunrise))
      || (fajrPastSunrise && currentIdx === 0 && i === 1),
    isPast: i < currentIdx || (i === 0 && fajrPastSunrise),
  }));
}

export default function HomeScreen({ navigation }) {
  const { isDark, colors: C } = useTheme();
  const [activeNav, setActiveNav] = useState('home');
  const [prayers, setPrayers] = useState(null);
  const [lastRead, setLastRead] = useState(null);
  const [userName, setUserName] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const QUICK_ACTIONS = [
    { icon: 'book-open', label: "Read the Qur'an", labelU: 'قرآن پڑھیں', color: C.GOLD, screen: 'QuranReading' },
    { icon: 'edit-2', label: 'Arabic Grammar', labelU: 'عربی گرامر سیکھیں', color: C.EMERALD_L, screen: 'GrammarLearning' },
  ];

  const loadPrayers = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat = 33.6844, lng = 73.0479;
      if (status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }
      const times = getPrayerTimes(lat, lng);
      setPrayers(getPrayerStatus(times));
    } catch (_) {
      const times = getPrayerTimes(33.6844, 73.0479);
      setPrayers(getPrayerStatus(times));
    }
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    loadPrayers();
    const tick = setInterval(() => {
      setPrayers(prev => {
        if (!prev) return prev;
        const now = new Date();
        let currentIdx = -1;
        for (let i = prev.length - 1; i >= 0; i--) {
          if (now >= prev[i].date) { currentIdx = i; break; }
        }
        const nextIdx = currentIdx < prev.length - 1 ? currentIdx + 1 : -1;
        return prev.map((p, i) => ({ ...p, isCurrent: i === currentIdx, isNext: i === nextIdx, isPast: i < currentIdx }));
      });
    }, 60000);
    return () => clearInterval(tick);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setActiveNav('home');
      loadProgress().then(setLastRead);
      AsyncStorage.getItem('@user_name').then(val => setUserName(val || ''));
    }, [])
  );

  const prayerCardW = Math.floor((width - 40 - 16) / 5);

  const prayerList = prayers || PRAYER_DEF.map(p => ({
    ...p, time: '--:--', isCurrent: false, isNext: false, isPast: false,
  }));

  return (
    <View style={[s.root, { backgroundColor: C.BG }]}>
      <StatusBar barStyle={C.statusBar} backgroundColor={C.BG} />

      {/* ════ HEADER ════ */}
      <View style={[s.header, { backgroundColor: C.BG, borderBottomColor: isDark ? 'transparent' : C.BORDER }]}>


        <TouchableOpacity style={s.headerLeft} onPress={() => navigation.navigate('Profile')} activeOpacity={0.85}>
          {/* Logo with themed background ring in light mode */}
          <View style={[
            s.avatarWrap,
            !isDark && {
              backgroundColor: C.GOLD + '15', borderRadius: 22, padding: 1,
              borderWidth: 1.5, borderColor: C.GOLD + '50'
            },
          ]}>
            <LogoSVG size={40} isDark={isDark} />

          </View>
          <View>
            <Text style={[s.greetSmall, { color: C.TEXT_S }]}>Assalamu Alaikum  •  السلام علیکم</Text>
            <Text style={[s.greetName, { color: C.TEXT }]}>{userName || 'User'}</Text>
          </View>
        </TouchableOpacity>

        {/* Date badge — always visible (both modes) */}
        <View style={[s.dateBadge, {
          backgroundColor: isDark ? C.CARD : C.GOLD + '18',
          borderColor: isDark ? C.BORDER : C.GOLD + '55',
        }]}>
          <Feather name="calendar" size={11} color={C.GOLD} />
          <View style={s.dateBadgeTexts}>
            <Text style={[s.dateTxtEn, { color: C.GOLD }]}>
              {new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
            <Text style={[s.dateTxtHijri, { color: C.GOLD }]}>
              {getIslamicDate()}
            </Text>
          </View>
        </View>
      </View>

      {/* ════ SCROLL ════ */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Verse of the Day ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={s.sectionRow}>
            <Feather name="star" size={14} color={C.GOLD} />
            <Text style={[s.secTitle, { color: C.TEXT }]}>Verse of the Day</Text>
            <View style={{ flex: 1 }} />
            <Text style={[s.secTitle, { color: C.TEXT }]}>آیتِ روز</Text>
          </View>

          <View style={[s.verseCard, { backgroundColor: C.VERSE_BG || C.CARD, borderColor: C.VERSE_BORDER || C.BORDER }]}>
            <Image
              source={require('../assets/mosque.png')}
              style={[s.mosqueBg, { tintColor: C.GOLD, opacity: 0.30 }]}
              resizeMode="contain"
            />
            <Text style={[s.verseArabic, { color: C.TEXT }]}>{getDailyVerse().arabic}</Text>
            <View style={[s.verseDivider, { backgroundColor: C.VERSE_BORDER || C.BORDER }]} />
            <View style={s.verseTextCenter}>
              <Text style={[s.verseUrdu, { color: C.TEXT }]}>{getDailyVerse().urdu}</Text>
              <Text style={[s.verseEnglish, { color: C.TEXT_S }]}>{getDailyVerse().english}</Text>
              <Text style={[s.verseRef, { color: C.GOLD }]}>{getDailyVerse().ref}</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Prayer Times ── */}
        <View style={[s.sectionRow, { marginBottom: 12, marginTop: 6 }]}>
          <Feather name="clock" size={14} color={C.GOLD} />
          <Text style={[s.secTitle2, { color: C.GOLD_L, marginBottom: 0, marginTop: 0 }]}>Prayer Times</Text>
          <View style={{ flex: 1 }} />
          <Text style={[s.secTitle2, { color: C.GOLD_L, marginBottom: 0, marginTop: 0 }]}>نماز کے اوقات</Text>
        </View>

        <View style={[s.prayerGrid, { backgroundColor: C.CARD, borderColor: C.BORDER }]}>
          {prayerList.map((p, i) => (
            <View
              key={i}
              style={[
                s.prayerCell,
                { width: prayerCardW },
                p.isCurrent && { backgroundColor: C.GOLD + '20' },
                i < 4 && { borderRightWidth: 1, borderRightColor: C.BORDER },
              ]}
            >
              <View style={s.prayerDotRow}>
                {p.isCurrent && <View style={[s.prayerDot, { backgroundColor: C.GOLD }]} />}
                {p.isNext && <View style={[s.prayerDot, { backgroundColor: C.EMERALD_L }]} />}
                {!p.isCurrent && !p.isNext && <View style={s.prayerDotEmpty} />}
              </View>
              <Feather
                name={p.icon} size={18}
                color={p.isCurrent ? C.GOLD : p.isNext ? C.EMERALD_L : p.isPast ? C.TEXT_S + '60' : C.TEXT_S}
              />
              <Text style={[s.prayerName, {
                color: p.isCurrent ? C.GOLD : p.isNext ? C.EMERALD_L : p.isPast ? C.TEXT_S + '60' : C.TEXT_S,
                fontWeight: p.isCurrent ? '700' : '600',
              }]}>{p.name}</Text>
              <Text style={[s.prayerNameU, {
                color: p.isCurrent ? C.GOLD : p.isNext ? C.EMERALD_L : p.isPast ? C.TEXT_S + '60' : C.TEXT_S,
              }]}>{p.nameU}</Text>
              <Text style={[s.prayerTime, {
                color: p.isCurrent ? C.TEXT : p.isNext ? C.TEXT : p.isPast ? C.TEXT_S + '60' : C.TEXT_S,
                fontWeight: p.isCurrent ? '700' : '500',
              }]}>{p.time}</Text>
              {p.isCurrent && (
                <View style={[s.prayerBadge, { backgroundColor: C.GOLD }]}>
                  <Text style={[s.prayerBadgeTxt, { color: C.BG }]}>NOW</Text>
                </View>
              )}
              {p.isNext && (
                <View style={[s.prayerBadge, { backgroundColor: C.EMERALD_L + '33', borderWidth: 1, borderColor: C.EMERALD_L + '80' }]}>
                  <Text style={[s.prayerBadgeTxt, { color: C.EMERALD_L }]}>NEXT</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* ── Quick Actions ── */}
        <View style={[s.sectionRow, { marginBottom: 12, marginTop: 6 }]}>
          <Text style={[s.secTitle2, { color: C.GOLD_L, marginBottom: 0, marginTop: 0 }]}>Quick Actions</Text>
          <View style={{ flex: 1 }} />
          <Text style={[s.secTitle2, { color: C.GOLD_L, marginBottom: 0, marginTop: 0 }]}>فوری رسائی</Text>
        </View>
        <View style={s.qaGrid}>
          {QUICK_ACTIONS.map((a, i) => (
            <TouchableOpacity
              key={i}
              style={[s.qaCard, { backgroundColor: C.CARD, borderColor: C.BORDER }]}
              activeOpacity={0.8}
              onPress={() => a.screen && navigation.navigate(a.screen)}
            >
              <View style={[s.qaIconBox, { backgroundColor: a.color + '18' }]}>
                <Feather name={a.icon} size={20} color={a.color} />
              </View>
              <Text style={[s.qaLabel, { color: a.color }]}>{a.label}</Text>
              <Text style={[s.qaLabelU, { color: C.TEXT_S }]}>{a.labelU}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Last Read / Start Reading ── */}
        {lastRead ? (
          /* Resume reading card */
          <TouchableOpacity
            style={[s.continueCard, { backgroundColor: C.CARD2, borderColor: C.BORDER }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('QuranReading', {
              surahNum: lastRead.surahNum,
              resumeAyah: lastRead.ayahNum,
            })}
          >
            <View style={[s.continueGlowGold, { backgroundColor: C.GOLD + '18' }]} />
            <View style={[s.continueGlowGreen, { backgroundColor: C.EMERALD + '25' }]} />

            {(() => {
              const R = 30;
              const circum = 2 * Math.PI * R;
              const pct = Math.min(lastRead.ayahNum / (lastRead.totalAyahs || 1), 1);
              return (
                <View style={s.circleWrap}>
                  <Svg width={76} height={76}>
                    <Circle cx={38} cy={38} r={R} stroke={C.CARD} strokeWidth={7} fill="none" />
                    <Circle
                      cx={38} cy={38} r={R}
                      stroke={C.GOLD} strokeWidth={7} fill="none"
                      strokeDasharray={circum}
                      strokeDashoffset={circum * (1 - pct)}
                      strokeLinecap="round"
                      rotation={90} origin="38,38" scale="-1,1"
                    />
                  </Svg>
                  <View style={s.circleCenter}>
                    <Text style={[s.circlePct, { color: C.GOLD }]}>{Math.round(pct * 100)}%</Text>
                  </View>
                </View>
              );
            })()}

            <View style={s.continueInfo}>
              <Text style={[s.continueSup, { color: C.GOLD_L }]}>Last Read  •  آخری مقام</Text>
              <View style={s.continueNameRow}>
                <Text style={[s.continueSurahEn, { color: C.TEXT }]}>{lastRead.surahEn}</Text>
                <Text style={[s.continueSurahAr, { color: C.GOLD }]}>{lastRead.surahAr}</Text>
              </View>
              <View style={s.ayahBadgeRow}>
                <View style={[s.ayahBadge, { backgroundColor: C.EMERALD + '40' }]}>
                  <Text style={[s.ayahBadgeTxt, { color: C.EMERALD_L }]}>Ayah {lastRead.ayahNum}</Text>
                </View>
                <Text style={[s.ayahOf, { color: C.TEXT_S }]}>of {lastRead.totalAyahs}</Text>
              </View>
            </View>

            <Feather name="chevron-right" size={20} color={C.GOLD} />
          </TouchableOpacity>
        ) : (
          /* First-time start card */
          <TouchableOpacity
            style={[s.startCard, { backgroundColor: C.VERSE_BG || C.CARD, borderColor: C.VERSE_BORDER || C.BORDER }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('QuranReading')}
          >
            <View style={[s.startGlow, { backgroundColor: C.GOLD + '30' }]} />
            <View style={[s.startIconBox, { backgroundColor: C.GOLD + '20' }]}>
              <Feather name="book-open" size={28} color={C.GOLD} />
            </View>
            <View style={s.startTextWrap}>
              <Text style={[s.startTitle, { color: C.TEXT }]}>قرآن پڑھنا شروع کریں</Text>
              <Text style={[s.startTitleEn, { color: C.GOLD }]}>Begin Your Quran Journey</Text>
              <Text style={[s.startDesc, { color: C.TEXT_S }]}>
                اپنی قرآنی پڑھائی یہاں سے شروع کریں — آپ کا مقام خود بخود محفوظ ہو جائے گا
              </Text>
            </View>
            <View style={[s.startBtn, { backgroundColor: C.GOLD }]}>
              <Feather name="arrow-right" size={16} color={C.BG} />
            </View>
          </TouchableOpacity>
        )}

        {/* ── Popular Surahs ── */}
        <View style={s.sectionRow}>
          <Text style={[s.secTitle2, { color: C.GOLD_L, marginBottom: 0, marginTop: 0 }]}>Popular Surahs  •  مشہور سورتیں</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={s.viewAll} onPress={() => navigation.navigate('QuranReading', { openSurahList: true })}>
            <Text style={[s.viewAllTxt, { color: C.GOLD }]}>View All</Text>
            <Feather name="chevron-right" size={14} color={C.GOLD} />
          </TouchableOpacity>
        </View>

        <View style={s.surahList}>
          {SURAHS.map((sr, i) => (
            <TouchableOpacity
              key={i}
              style={[s.surahRow, { backgroundColor: C.CARD, borderColor: C.BORDER }]}
              onPress={() => navigation.navigate('QuranReading', { surahNum: sr.num })}
              activeOpacity={0.8}
            >
              <View style={[s.surahNumBox, { backgroundColor: C.GOLD + '18', borderColor: C.GOLD + '30' }]}>
                <Text style={[s.surahNum, { color: C.GOLD }]}>{sr.num}</Text>
              </View>
              <View style={s.surahMid}>
                <View style={s.surahNameRow}>
                  <Text style={[s.surahEn, { color: C.TEXT }]}>{sr.english}</Text>
                  <Text style={[s.surahAr, { color: C.GOLD }]}>{sr.arabic}</Text>
                </View>
                <View style={s.surahMetaRow}>
                  <View style={[s.typeBadge, sr.type === 'Meccan' ? { backgroundColor: C.GOLD + '22' } : { backgroundColor: C.EMERALD + '44' }]}>
                    <Text style={[s.typeTxt, { color: C.TEXT_S }]}>{sr.type}</Text>
                  </View>
                  <Text style={[s.surahMeta, { color: C.TEXT_S }]}>{sr.verses} verses  •  {sr.meaning}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={18} color={C.TEXT_S} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ════ BOTTOM NAV ════ */}
      <View style={[s.bottomNav, { backgroundColor: C.BG, borderTopColor: C.BORDER }]}>
        {NAV_ITEMS.map(item => {
          const isActive = activeNav === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={s.navItem}
              onPress={() => {
                setActiveNav(item.id);
                if (item.id === 'read') navigation.navigate('QuranReading');
                if (item.id === 'profile') navigation.navigate('Profile');
              }}
              activeOpacity={0.7}
            >
              {isActive && <View style={[s.navActiveLine, { backgroundColor: C.GOLD, shadowColor: C.GOLD }]} />}
              <View style={[s.navIconBox, isActive && { backgroundColor: C.GOLD + '18' }]}>
                <Feather name={item.icon} size={20} color={isActive ? C.GOLD : C.TEXT_S} />
              </View>
              <Text style={[s.navLabel, { color: C.TEXT_S }, isActive && { color: C.GOLD, fontWeight: '600' }]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 14,
    borderBottomWidth: 1,
    position: 'relative',
  },
  headerAccentStrip: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 3, borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
  },
  dateBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  dateBadgeTexts: { flexDirection: 'column' },
  dateTxtEn: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  dateTxtHijri: { fontSize: 11, fontWeight: '700', textAlign: 'right', marginTop: 1, letterSpacing: 0.2 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  headerRight: { flexDirection: 'row', gap: 8 },
  avatarWrap: { position: 'relative' },
  onlineDot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 10, height: 10, borderRadius: 5, borderWidth: 2,
  },
  greetSmall: { fontSize: 12, letterSpacing: 0.3 },
  greetName: { fontSize: 18, fontWeight: '600', marginTop: 1 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 },
  secTitle: { fontSize: 16, fontWeight: '600' },
  secTitle2: { fontSize: 17, fontWeight: '700', marginBottom: 12, marginTop: 6 },
  smBtn: { padding: 6 },

  /* Verse card */
  verseCard: {
    borderRadius: 20, borderWidth: 1,
    paddingVertical: 5, paddingHorizontal: 22,
    marginBottom: 16, overflow: 'hidden',
  },
  mosqueBg: {
    position: 'absolute', bottom: 0, left: 20, right: 0,
    width: '100%', height: 460,
  },
  verseArabic: { fontSize: 28, textAlign: 'center', lineHeight: 54, fontWeight: '600' },
  verseDivider: { height: 0.8, marginVertical: 10 },
  verseUrdu: { fontSize: 17, textAlign: 'center', lineHeight: 30, marginBottom: 6 },
  verseEnglish: { fontSize: 15, textAlign: 'center', lineHeight: 24, fontStyle: 'italic', marginBottom: 10 },
  verseTextCenter: { paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  verseRef: { fontSize: 13, textAlign: 'center', letterSpacing: 0.4 },

  /* Prayer grid */
  prayerGrid: {
    flexDirection: 'row', borderRadius: 20, borderWidth: 1,
    overflow: 'hidden', marginBottom: 24,
  },
  prayerCell: {
    alignItems: 'center', paddingTop: 10, paddingBottom: 12,
    paddingHorizontal: 2, gap: 3, position: 'relative',
  },
  prayerDotRow: { height: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  prayerDot: { width: 6, height: 6, borderRadius: 3 },
  prayerDotEmpty: { width: 6, height: 6 },
  prayerName: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  prayerNameU: { fontSize: 10, textAlign: 'center' },
  prayerTime: { fontSize: 11, textAlign: 'center', marginTop: 1 },
  prayerBadge: { borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1, marginTop: 3 },
  prayerBadgeTxt: { fontSize: 7, fontWeight: '800', letterSpacing: 0.5 },

  /* Quick actions */
  qaGrid: { flexDirection: 'row', gap: 14, marginBottom: 24 },
  qaCard: {
    flex: 1, borderRadius: 20, borderWidth: 1,
    paddingVertical: 14, paddingHorizontal: 12,
    alignItems: 'center', gap: 7,
  },
  qaIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  qaLabelU: { fontSize: 12, textAlign: 'center' },

  /* Continue / resume reading */
  continueCard: {
    borderRadius: 24, borderWidth: 1,
    paddingVertical: 18, paddingHorizontal: 20,
    marginBottom: 24, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', gap: 18,
  },
  continueGlowGold: { position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 50 },
  continueGlowGreen: { position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40 },
  circleWrap: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center' },
  circleCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  circlePct: { fontSize: 14, fontWeight: '700' },
  continueInfo: { flex: 1 },
  continueSup: { fontSize: 14, letterSpacing: 0.6, fontWeight: '700', marginBottom: 6 },
  continueNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  continueSurahAr: { fontSize: 18, fontWeight: '600' },
  continueSurahEn: { fontSize: 14, fontWeight: '600' },
  ayahBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  ayahBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  ayahBadgeTxt: { fontSize: 13 },
  ayahOf: { fontSize: 13 },

  /* Start reading card */
  startCard: {
    borderRadius: 24, borderWidth: 1,
    paddingVertical: 20, paddingHorizontal: 20,
    marginBottom: 24, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  startGlow: {
    position: 'absolute', top: -20, right: -20,
    width: 100, height: 100, borderRadius: 50,
  },
  startIconBox: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  startTextWrap: { flex: 1 },
  startTitle: { fontSize: 16, fontWeight: '700', textAlign: 'right', marginBottom: 2 },
  startTitleEn: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  startDesc: { fontSize: 12, lineHeight: 18, textAlign: 'right' },
  startBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  /* Surah list */
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 2 },
  viewAllTxt: { fontSize: 15, fontWeight: '600' },
  surahList: { gap: 8, marginBottom: 10 },
  surahRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: 20, padding: 14, borderWidth: 1,
  },
  surahNumBox: {
    width: 44, height: 44, borderRadius: 14, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  surahNum: { fontSize: 16, fontWeight: '700' },
  surahMid: { flex: 1 },
  surahNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  surahEn: { fontSize: 17, fontWeight: '600' },
  surahAr: { fontSize: 19 },
  surahMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  typeBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  typeTxt: { fontSize: 12, fontWeight: '600' },
  surahMeta: { fontSize: 13 },

  /* Bottom nav */
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    paddingTop: 10,
  },
  navItem: { alignItems: 'center', position: 'relative', paddingHorizontal: 10 },
  navActiveLine: {
    position: 'absolute', top: -10, alignSelf: 'center',
    width: 28, height: 3, borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 6,
  },
  navIconBox: { width: 40, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  navLabel: { fontSize: 12, marginTop: 2 },
});
