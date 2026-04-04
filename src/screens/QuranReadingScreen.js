import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, Platform, Modal, ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

/* ── Offline data ── */
import QURAN_DATA from '../assets/quran.json';
import EN_DATA    from '../assets/en.json';
import UR_DATA    from '../assets/ur.json';

/* ── Colors ── */
const BG       = '#0C1520';
const CARD     = '#111E2E';
const CARD2    = '#16253A';
const GOLD     = '#C9A84C';
const GOLD_L   = '#E8C875';
const EMERALD  = '#1B4332';
const TEXT     = '#F0EAD6';
const TEXT_S   = '#8AA898';
const BORDER   = 'rgba(201,168,76,0.13)';

/* Word type colors */
const ISM_C  = '#C9A84C';  // gold  — اسم
const FIL_C  = '#5CB85C';  // green — فعل
const HARF_C = '#5B9BD5';  // blue  — حرف

/* ── Translation modes ── */
const TRANS_MODES = [
  { key: 'none', label: 'Arabic Only',         labelU: 'صرف عربی'       },
  { key: 'en',   label: 'English Translation', labelU: 'انگریزی ترجمہ'  },
  { key: 'ur',   label: 'Urdu Translation',    labelU: 'اردو ترجمہ'     },
  { key: 'both', label: 'Urdu + English',      labelU: 'اردو + انگریزی' },
];

/* ── Surah list ── */
const SURAHS = [
  { n: 1,   ar: 'الفاتحة',    en: 'Al-Fatihah',      v: 7,   mec: true  },
  { n: 2,   ar: 'البقرة',     en: 'Al-Baqarah',      v: 286, mec: false },
  { n: 3,   ar: 'آل عمران',   en: "Ali 'Imran",      v: 200, mec: false },
  { n: 4,   ar: 'النساء',     en: 'An-Nisa',         v: 176, mec: false },
  { n: 5,   ar: 'المائدة',    en: "Al-Ma'idah",      v: 120, mec: false },
  { n: 6,   ar: 'الأنعام',    en: "Al-An'am",        v: 165, mec: true  },
  { n: 7,   ar: 'الأعراف',    en: "Al-A'raf",        v: 206, mec: true  },
  { n: 8,   ar: 'الأنفال',    en: 'Al-Anfal',        v: 75,  mec: false },
  { n: 9,   ar: 'التوبة',     en: 'At-Tawbah',       v: 129, mec: false },
  { n: 10,  ar: 'يونس',       en: 'Yunus',           v: 109, mec: true  },
  { n: 11,  ar: 'هود',        en: 'Hud',             v: 123, mec: true  },
  { n: 12,  ar: 'يوسف',       en: 'Yusuf',           v: 111, mec: true  },
  { n: 13,  ar: 'الرعد',      en: "Ar-Ra'd",         v: 43,  mec: false },
  { n: 14,  ar: 'إبراهيم',    en: 'Ibrahim',         v: 52,  mec: true  },
  { n: 15,  ar: 'الحجر',      en: 'Al-Hijr',         v: 99,  mec: true  },
  { n: 16,  ar: 'النحل',      en: 'An-Nahl',         v: 128, mec: true  },
  { n: 17,  ar: 'الإسراء',    en: 'Al-Isra',         v: 111, mec: true  },
  { n: 18,  ar: 'الكهف',      en: 'Al-Kahf',         v: 110, mec: true  },
  { n: 19,  ar: 'مريم',       en: 'Maryam',          v: 98,  mec: true  },
  { n: 20,  ar: 'طه',         en: 'Ta-Ha',           v: 135, mec: true  },
  { n: 21,  ar: 'الأنبياء',   en: 'Al-Anbiya',       v: 112, mec: true  },
  { n: 22,  ar: 'الحج',       en: 'Al-Hajj',         v: 78,  mec: false },
  { n: 23,  ar: 'المؤمنون',   en: "Al-Mu'minun",     v: 118, mec: true  },
  { n: 24,  ar: 'النور',      en: 'An-Nur',          v: 64,  mec: false },
  { n: 25,  ar: 'الفرقان',    en: 'Al-Furqan',       v: 77,  mec: true  },
  { n: 26,  ar: 'الشعراء',    en: "Ash-Shu'ara",     v: 227, mec: true  },
  { n: 27,  ar: 'النمل',      en: 'An-Naml',         v: 93,  mec: true  },
  { n: 28,  ar: 'القصص',      en: 'Al-Qasas',        v: 88,  mec: true  },
  { n: 29,  ar: 'العنكبوت',   en: 'Al-Ankabut',      v: 69,  mec: true  },
  { n: 30,  ar: 'الروم',      en: 'Ar-Rum',          v: 60,  mec: true  },
  { n: 31,  ar: 'لقمان',      en: 'Luqman',          v: 34,  mec: true  },
  { n: 32,  ar: 'السجدة',     en: 'As-Sajdah',       v: 30,  mec: true  },
  { n: 33,  ar: 'الأحزاب',    en: 'Al-Ahzab',        v: 73,  mec: false },
  { n: 34,  ar: 'سبأ',        en: 'Saba',            v: 54,  mec: true  },
  { n: 35,  ar: 'فاطر',       en: 'Fatir',           v: 45,  mec: true  },
  { n: 36,  ar: 'يس',         en: 'Ya-Sin',          v: 83,  mec: true  },
  { n: 37,  ar: 'الصافات',    en: 'As-Saffat',       v: 182, mec: true  },
  { n: 38,  ar: 'ص',          en: 'Sad',             v: 88,  mec: true  },
  { n: 39,  ar: 'الزمر',      en: 'Az-Zumar',        v: 75,  mec: true  },
  { n: 40,  ar: 'غافر',       en: 'Ghafir',          v: 85,  mec: true  },
  { n: 41,  ar: 'فصلت',       en: 'Fussilat',        v: 54,  mec: true  },
  { n: 42,  ar: 'الشورى',     en: 'Ash-Shuraa',      v: 53,  mec: true  },
  { n: 43,  ar: 'الزخرف',     en: 'Az-Zukhruf',      v: 89,  mec: true  },
  { n: 44,  ar: 'الدخان',     en: 'Ad-Dukhan',       v: 59,  mec: true  },
  { n: 45,  ar: 'الجاثية',    en: 'Al-Jathiyah',     v: 37,  mec: true  },
  { n: 46,  ar: 'الأحقاف',    en: 'Al-Ahqaf',        v: 35,  mec: true  },
  { n: 47,  ar: 'محمد',       en: 'Muhammad',        v: 38,  mec: false },
  { n: 48,  ar: 'الفتح',      en: 'Al-Fath',         v: 29,  mec: false },
  { n: 49,  ar: 'الحجرات',    en: 'Al-Hujurat',      v: 18,  mec: false },
  { n: 50,  ar: 'ق',          en: 'Qaf',             v: 45,  mec: true  },
  { n: 51,  ar: 'الذاريات',   en: 'Adh-Dhariyat',    v: 60,  mec: true  },
  { n: 52,  ar: 'الطور',      en: 'At-Tur',          v: 49,  mec: true  },
  { n: 53,  ar: 'النجم',      en: 'An-Najm',         v: 62,  mec: true  },
  { n: 54,  ar: 'القمر',      en: 'Al-Qamar',        v: 55,  mec: true  },
  { n: 55,  ar: 'الرحمن',     en: 'Ar-Rahman',       v: 78,  mec: false },
  { n: 56,  ar: 'الواقعة',    en: "Al-Waqi'ah",      v: 96,  mec: true  },
  { n: 57,  ar: 'الحديد',     en: 'Al-Hadid',        v: 29,  mec: false },
  { n: 58,  ar: 'المجادلة',   en: 'Al-Mujadila',     v: 22,  mec: false },
  { n: 59,  ar: 'الحشر',      en: 'Al-Hashr',        v: 24,  mec: false },
  { n: 60,  ar: 'الممتحنة',   en: 'Al-Mumtahanah',   v: 13,  mec: false },
  { n: 61,  ar: 'الصف',       en: 'As-Saf',          v: 14,  mec: false },
  { n: 62,  ar: 'الجمعة',     en: "Al-Jumu'ah",      v: 11,  mec: false },
  { n: 63,  ar: 'المنافقون',  en: 'Al-Munafiqun',    v: 11,  mec: false },
  { n: 64,  ar: 'التغابن',    en: 'At-Taghabun',     v: 18,  mec: false },
  { n: 65,  ar: 'الطلاق',     en: 'At-Talaq',        v: 12,  mec: false },
  { n: 66,  ar: 'التحريم',    en: 'At-Tahrim',       v: 12,  mec: false },
  { n: 67,  ar: 'الملك',      en: 'Al-Mulk',         v: 30,  mec: true  },
  { n: 68,  ar: 'القلم',      en: 'Al-Qalam',        v: 52,  mec: true  },
  { n: 69,  ar: 'الحاقة',     en: 'Al-Haqqah',       v: 52,  mec: true  },
  { n: 70,  ar: 'المعارج',    en: "Al-Ma'arij",      v: 44,  mec: true  },
  { n: 71,  ar: 'نوح',        en: 'Nuh',             v: 28,  mec: true  },
  { n: 72,  ar: 'الجن',       en: 'Al-Jinn',         v: 28,  mec: true  },
  { n: 73,  ar: 'المزمل',     en: 'Al-Muzzammil',    v: 20,  mec: true  },
  { n: 74,  ar: 'المدثر',     en: 'Al-Muddaththir',  v: 56,  mec: true  },
  { n: 75,  ar: 'القيامة',    en: 'Al-Qiyamah',      v: 40,  mec: true  },
  { n: 76,  ar: 'الإنسان',    en: 'Al-Insan',        v: 31,  mec: false },
  { n: 77,  ar: 'المرسلات',   en: 'Al-Mursalat',     v: 50,  mec: true  },
  { n: 78,  ar: 'النبأ',      en: 'An-Naba',         v: 40,  mec: true  },
  { n: 79,  ar: 'النازعات',   en: "An-Nazi'at",      v: 46,  mec: true  },
  { n: 80,  ar: 'عبس',        en: 'Abasa',           v: 42,  mec: true  },
  { n: 81,  ar: 'التكوير',    en: 'At-Takwir',       v: 29,  mec: true  },
  { n: 82,  ar: 'الانفطار',   en: 'Al-Infitar',      v: 19,  mec: true  },
  { n: 83,  ar: 'المطففين',   en: 'Al-Mutaffifin',   v: 36,  mec: true  },
  { n: 84,  ar: 'الانشقاق',   en: 'Al-Inshiqaq',     v: 25,  mec: true  },
  { n: 85,  ar: 'البروج',     en: 'Al-Buruj',        v: 22,  mec: true  },
  { n: 86,  ar: 'الطارق',     en: 'At-Tariq',        v: 17,  mec: true  },
  { n: 87,  ar: 'الأعلى',     en: "Al-A'la",         v: 19,  mec: true  },
  { n: 88,  ar: 'الغاشية',    en: 'Al-Ghashiyah',    v: 26,  mec: true  },
  { n: 89,  ar: 'الفجر',      en: 'Al-Fajr',         v: 30,  mec: true  },
  { n: 90,  ar: 'البلد',      en: 'Al-Balad',        v: 20,  mec: true  },
  { n: 91,  ar: 'الشمس',      en: 'Ash-Shams',       v: 15,  mec: true  },
  { n: 92,  ar: 'الليل',      en: 'Al-Layl',         v: 21,  mec: true  },
  { n: 93,  ar: 'الضحى',      en: 'Ad-Duha',         v: 11,  mec: true  },
  { n: 94,  ar: 'الشرح',      en: 'Ash-Sharh',       v: 8,   mec: true  },
  { n: 95,  ar: 'التين',      en: 'At-Tin',          v: 8,   mec: true  },
  { n: 96,  ar: 'العلق',      en: 'Al-Alaq',         v: 19,  mec: true  },
  { n: 97,  ar: 'القدر',      en: 'Al-Qadr',         v: 5,   mec: true  },
  { n: 98,  ar: 'البينة',     en: 'Al-Bayyinah',     v: 8,   mec: false },
  { n: 99,  ar: 'الزلزلة',    en: 'Az-Zalzalah',     v: 8,   mec: false },
  { n: 100, ar: 'العاديات',   en: 'Al-Adiyat',       v: 11,  mec: true  },
  { n: 101, ar: 'القارعة',    en: "Al-Qari'ah",      v: 11,  mec: true  },
  { n: 102, ar: 'التكاثر',    en: 'At-Takathur',     v: 8,   mec: true  },
  { n: 103, ar: 'العصر',      en: 'Al-Asr',          v: 3,   mec: true  },
  { n: 104, ar: 'الهمزة',     en: 'Al-Humazah',      v: 9,   mec: true  },
  { n: 105, ar: 'الفيل',      en: 'Al-Fil',          v: 5,   mec: true  },
  { n: 106, ar: 'قريش',       en: 'Quraysh',         v: 4,   mec: true  },
  { n: 107, ar: 'الماعون',    en: "Al-Ma'un",        v: 7,   mec: true  },
  { n: 108, ar: 'الكوثر',     en: 'Al-Kawthar',      v: 3,   mec: true  },
  { n: 109, ar: 'الكافرون',   en: 'Al-Kafirun',      v: 6,   mec: true  },
  { n: 110, ar: 'النصر',      en: 'An-Nasr',         v: 3,   mec: false },
  { n: 111, ar: 'المسد',      en: 'Al-Masad',        v: 5,   mec: true  },
  { n: 112, ar: 'الإخلاص',    en: 'Al-Ikhlas',       v: 4,   mec: true  },
  { n: 113, ar: 'الفلق',      en: 'Al-Falaq',        v: 5,   mec: true  },
  { n: 114, ar: 'الناس',      en: 'An-Nas',          v: 6,   mec: true  },
];

/* ─────────────────────────────────────────────────────────────
   I'RAB DATA  —  Surah Al-Baqarah (2), Ayahs 1-5
   Word-by-word grammatical analysis (اعراب)
   ───────────────────────────────────────────────────────────── */
const IRAB_DATA = {
  2: {
    /* ── آیت ١: الٓمٓ ── */
    1: [
      {
        wordIndex: 0,
        arabicWord: 'الٓمٓ',
        urduMeaning: 'الف، لام، میم',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حروف مقطعات',
        grammaticalCase: null,
        irabRole: 'حروف مقطعات — معنی اللہ کے علم میں',
        governingElement: null,
        notes: 'یہ حروف مقطعات ہیں۔ علماء کے مطابق ان کا حقیقی مطلب اللہ تعالیٰ ہی جانتے ہیں۔ بعض کے نزدیک یہ اس سورت کا نام ہے اور بعض نے فرمایا یہ قرآن کے اعجاز کا اشارہ ہے کہ یہ کتاب انہی حروف سے بنی ہے جو تم استعمال کرتے ہو پھر بھی تم اس جیسی کتاب نہیں لا سکتے۔',
        classicalExplanation: 'حُرُوفٌ مُقَطَّعَةٌ — لَا مَحَلَّ لَهَا مِنَ الْإِعْرَابِ عِنْدَ الْجُمْهُورِ۔ وَقِيلَ: فِي مَحَلِّ رَفْعٍ خَبَرًا لِمُبْتَدَأٍ مَحْذُوفٍ۔',
      },
    ],

    /* ── آیت ٢: ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ ── */
    2: [
      {
        wordIndex: 0,
        arabicWord: 'ذَٰلِكَ',
        urduMeaning: 'وہ',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'اسم اشارہ — مفرد مذکر بعید',
        grammaticalCase: 'مرفوع',
        irabRole: 'مبتدا',
        governingElement: null,
        notes: 'ذَٰلِكَ: اشارہ بعید مفرد مذکر۔ یہاں اس کتاب (قرآن) کی طرف اشارہ ہے جو نبی ﷺ کے قلب اطہر پر نازل ہو رہی تھی۔ بعض نے کہا دور کی چیز کی طرف اشارہ عظمت و شان بیان کرنے کے لیے ہے۔',
        classicalExplanation: 'ذَٰلِكَ: مُبْتَدَأٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ الْمُقَدَّرَةُ مَنَعَ مِنْ ظُهُورِهَا التَّعَذُّرُ۔',
      },
      {
        wordIndex: 1,
        arabicWord: 'الْكِتَابُ',
        urduMeaning: 'کتاب',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ك ت ب',
        morphForm: 'اسم جامد — مفرد مذکر معرفہ',
        grammaticalCase: 'مرفوع',
        irabRole: 'خبر مبتدا یا بدل',
        governingElement: 'ذَٰلِكَ',
        notes: 'الکتاب — ال تعریف کے ساتھ معرفہ۔ الکتاب سے مراد قرآن مجید ہے۔ بعض نے اسے بدل اور بعض نے خبر قرار دیا ہے۔ مادہ: ک ت ب — لکھنا۔',
        classicalExplanation: 'الْكِتَابُ: خَبَرُ الْمُبْتَدَأِ مَرْفُوعٌ أَوْ بَدَلٌ مِنِ اسْمِ الْإِشَارَةِ۔',
      },
      {
        wordIndex: 2,
        arabicWord: 'لَا',
        urduMeaning: 'نہیں',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف نفی جنس — لا نافیہ للجنس',
        grammaticalCase: null,
        irabRole: 'نفی جنس — مشابہ بالفعل',
        governingElement: null,
        notes: 'لا نافیہ للجنس: یہ پوری جنس کی نفی کرتا ہے۔ اسم کو نصب اور خبر کو رفع دیتا ہے۔ جیسے لَا اِلٰہَ اِلَّا اللہ میں لا۔',
        classicalExplanation: 'لَا: نَافِيَةٌ لِلْجِنْسِ تَعْمَلُ عَمَلَ إِنَّ فَتَنْصِبُ الِاسْمَ وَتَرْفَعُ الْخَبَرَ۔',
      },
      {
        wordIndex: 3,
        arabicWord: 'رَيْبَ',
        urduMeaning: 'شک',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ر ي ب',
        morphForm: 'اسم — مفرد مذکر نکرہ',
        grammaticalCase: 'منصوب',
        irabRole: 'اسم لا نافیہ للجنس',
        governingElement: 'لَا',
        notes: 'ریب بمعنی شک و شبہ۔ لا نافیہ للجنس کا اسم ہونے کی وجہ سے منصوب ہے اور خبر محذوف ہے (متعلق بالکتاب یعنی فیہ)۔ یعنی اس میں کسی قسم کا کوئی شک نہیں۔',
        classicalExplanation: 'رَيْبَ: اسْمُ لَا مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ الظَّاهِرَةُ۔',
      },
      {
        wordIndex: 4,
        arabicWord: 'فِيهِ',
        urduMeaning: 'اس میں',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف جر (في) + ضمیر متصل مجرور (هِ)',
        grammaticalCase: 'مجرور',
        irabRole: 'خبر لا — متعلق بمحذوف',
        governingElement: 'لَا رَيْبَ',
        notes: 'في: حرف جر۔ ہ: ضمیر متصل مجرور راجع الی الکتاب۔ یہ جار مجرور لا نافیہ للجنس کی خبر ہے جو محذوف ہے (لا ریب مستقر فیہ)۔',
        classicalExplanation: 'فِيهِ: جَارٌّ وَمَجْرُورٌ مُتَعَلِّقٌ بِمَحْذُوفٍ هُوَ خَبَرُ لَا۔',
      },
      {
        wordIndex: 5,
        arabicWord: 'هُدًى',
        urduMeaning: 'ہدایت',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ه د ي',
        morphForm: 'اسم — مفرد مذکر نکرہ منقوص',
        grammaticalCase: 'مرفوع',
        irabRole: 'خبر ثانی یا حال',
        governingElement: 'ذَٰلِكَ الْكِتَابُ',
        notes: 'ھدی — مادہ ہ د ی۔ یہاں نکرہ تنوین کے ساتھ آیا ہے جو تعظیم کا فائدہ دیتا ہے — کیسی عظیم ہدایت! یہ کتاب مکمل ہدایت ہے۔',
        classicalExplanation: 'هُدًى: خَبَرٌ ثَانٍ لِذَٰلِكَ أَوْ حَالٌ مِنَ الضَّمِيرِ فِي فِيهِ۔ مَرْفُوعٌ بِضَمَّةٍ مُقَدَّرَةٍ۔',
      },
      {
        wordIndex: 6,
        arabicWord: 'لِّلْمُتَّقِينَ',
        urduMeaning: 'متقین (پرہیزگاروں) کے لیے',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: 'و ق ي',
        morphForm: 'لام جر + ال تعریف + اسم فاعل جمع مذکر سالم مجرور',
        grammaticalCase: 'مجرور',
        irabRole: 'متعلق بہدی — صفت یا بیان',
        governingElement: 'هُدًى',
        notes: 'للمتقین — لام جر + المتقین۔ متقی: وہ جو اللہ سے ڈرے اور گناہوں سے بچے۔ یہ ہدایت خاص ان کے لیے ہے کیونکہ وہی اس سے فائدہ اٹھاتے ہیں۔',
        classicalExplanation: 'لِلْمُتَّقِينَ: جَارٌّ وَمَجْرُورٌ مُتَعَلِّقٌ بِـهُدًى أَوْ نَعْتٌ لَهُ۔',
      },
    ],

    /* ── آیت ٣: الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ ── */
    3: [
      {
        wordIndex: 0,
        arabicWord: 'الَّذِينَ',
        urduMeaning: 'جو لوگ',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'اسم موصول — جمع مذکر',
        grammaticalCase: 'مرفوع (محلاً)',
        irabRole: 'نعت (صفت) للمتقین',
        governingElement: 'الْمُتَّقِينَ',
        notes: 'الذین — اسم موصول جمع مذکر۔ یہ پچھلی آیت کے "للمتقین" کی صفت ہے۔ اس کا صلہ (relative clause) جملہ یؤمنون بالغیب ہے۔',
        classicalExplanation: 'الَّذِينَ: اسْمٌ مَوْصُولٌ فِي مَحَلِّ جَرٍّ نَعْتٌ لِلْمُتَّقِينَ۔',
      },
      {
        wordIndex: 1,
        arabicWord: 'يُؤْمِنُونَ',
        urduMeaning: 'ایمان لاتے ہیں',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'أ م ن',
        morphForm: 'فعل مضارع باب افعال — جمع مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'صلہ موصول (الذین)',
        governingElement: 'الَّذِينَ',
        notes: 'یؤمنون — باب افعال سے، مادہ ا م ن۔ ایمان کا مفہوم: دل سے تصدیق، زبان سے اقرار، اور اعمال سے ظاہر کرنا۔',
        classicalExplanation: 'يُؤْمِنُونَ: فِعْلٌ مُضَارِعٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ ثُبُوتُ النُّونِ لِأَنَّهُ مِنَ الْأَفْعَالِ الْخَمْسَةِ۔',
      },
      {
        wordIndex: 2,
        arabicWord: 'بِالْغَيْبِ',
        urduMeaning: 'غیب پر',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: 'غ ي ب',
        morphForm: 'حرف جر (ب) + اسم مجرور معرفہ',
        grammaticalCase: 'مجرور',
        irabRole: 'متعلق بیؤمنون',
        governingElement: 'يُؤْمِنُونَ',
        notes: 'الغیب: وہ حقائق جو حواس سے مخفی ہوں — جنت، جہنم، فرشتے، قضا و قدر، قیامت وغیرہ۔ ب: حرف جر تعدیہ۔',
        classicalExplanation: 'بِالْغَيْبِ: جَارٌّ وَمَجْرُورٌ مُتَعَلِّقٌ بِيُؤْمِنُونَ۔',
      },
      {
        wordIndex: 3,
        arabicWord: 'وَيُقِيمُونَ',
        urduMeaning: 'اور قائم کرتے ہیں',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ق و م',
        morphForm: 'واو عطف + فعل مضارع باب افعال — جمع مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'معطوف علی یؤمنون',
        governingElement: 'يُؤْمِنُونَ',
        notes: 'یقیمون — باب افعال سے اقامت، یعنی پوری طرح، کامل شرائط کے ساتھ ادا کرنا — صرف پڑھنا نہیں بلکہ قائم کرنا۔',
        classicalExplanation: 'وَيُقِيمُونَ: الْوَاوُ حَرْفُ عَطْفٍ، يُقِيمُونَ: مَعْطُوفٌ عَلَى يُؤْمِنُونَ مَرْفُوعٌ۔',
      },
      {
        wordIndex: 4,
        arabicWord: 'الصَّلَاةَ',
        urduMeaning: 'نماز',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ص ل و',
        morphForm: 'اسم — مفرد مؤنث معرفہ',
        grammaticalCase: 'منصوب',
        irabRole: 'مفعول بہ',
        governingElement: 'يُقِيمُونَ',
        notes: 'الصلاة — لغوی معنی: دعا۔ شرعی معنی: مخصوص ارکان، شرائط اور اوقات کے ساتھ اللہ کی عبادت۔ مادہ ص ل و۔',
        classicalExplanation: 'الصَّلَاةَ: مَفْعُولٌ بِهِ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ الظَّاهِرَةُ۔',
      },
      {
        wordIndex: 5,
        arabicWord: 'وَمِمَّا',
        urduMeaning: 'اور اس میں سے جو',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'واو عطف + مِنْ (حرف جر) + مَا (اسم موصول)',
        grammaticalCase: null,
        irabRole: 'معطوف متعلق بینفقون',
        governingElement: 'يُنفِقُونَ',
        notes: 'من + ما = مِمَّا (ادغام)۔ من: حرف جر ابتداء۔ ما: اسم موصول جس کا صلہ رَزَقْنَاهُمْ ہے۔ یعنی اس میں سے جو ہم نے انہیں دیا ہے۔',
        classicalExplanation: 'وَمِمَّا: الْوَاوُ عَاطِفَةٌ، مِنْ: حَرْفُ جَرٍّ، مَا: اسْمٌ مَوْصُولٌ مَجْرُورٌ بِمِنْ۔',
      },
      {
        wordIndex: 6,
        arabicWord: 'رَزَقْنَاهُمْ',
        urduMeaning: 'ہم نے انہیں رزق دیا',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ر ز ق',
        morphForm: 'فعل ماضی + نا (ضمیر فاعل متصل) + هُمْ (ضمیر مفعول متصل)',
        grammaticalCase: null,
        irabRole: 'صلہ موصول (ما)',
        governingElement: 'مَا',
        notes: 'رزقناہم — مادہ ر ز ق۔ رزق میں مال، علم، صحت، اولاد اور ہر نعمت شامل ہے۔ نا: ضمیر فاعل۔ ہم: ضمیر مفعول۔',
        classicalExplanation: 'رَزَقْنَاهُمْ: صِلَةُ الْمَوْصُولِ، فِعْلٌ مَاضٍ وَنَا ضَمِيرُ الْفَاعِلِ وَهُمْ ضَمِيرُ الْمَفْعُولِ۔',
      },
      {
        wordIndex: 7,
        arabicWord: 'يُنفِقُونَ',
        urduMeaning: 'خرچ کرتے ہیں',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ن ف ق',
        morphForm: 'فعل مضارع باب افعال — جمع مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'معطوف علی یؤمنون — صلہ الذین',
        governingElement: 'الَّذِينَ',
        notes: 'ینفقون — باب افعال سے انفاق یعنی خرچ کرنا۔ اللہ کی راہ میں مال خرچ کرنا متقین کی تیسری صفت ہے۔',
        classicalExplanation: 'يُنْفِقُونَ: فِعْلٌ مُضَارِعٌ مَرْفُوعٌ مَعْطُوفٌ عَلَى صِلَةِ الْمَوْصُولِ۔',
      },
    ],

    /* ── آیت ٤: وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ ── */
    4: [
      {
        wordIndex: 0,
        arabicWord: 'وَالَّذِينَ',
        urduMeaning: 'اور جو لوگ',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'واو عطف + اسم موصول جمع مذکر',
        grammaticalCase: 'مرفوع (محلاً)',
        irabRole: 'معطوف علی الذین (آیت ٣)',
        governingElement: 'الَّذِينَ (آیت ٣)',
        notes: 'واو عاطفہ — یہ اگلی صفت بیان کرتی ہے جو پہلی آیت کے الذین کے ساتھ معطوف ہے یعنی متقین کی دوسری نوع کی صفت۔',
        classicalExplanation: 'وَالَّذِينَ: الْوَاوُ عَاطِفَةٌ، الَّذِينَ: مَعْطُوفٌ عَلَى الَّذِينَ فِي الْآيَةِ الثَّالِثَةِ۔',
      },
      {
        wordIndex: 1,
        arabicWord: 'يُؤْمِنُونَ',
        urduMeaning: 'ایمان لاتے ہیں',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'أ م ن',
        morphForm: 'فعل مضارع باب افعال — جمع مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'صلہ موصول (وَالَّذِينَ)',
        governingElement: 'وَالَّذِينَ',
        notes: 'یؤمنون — یہاں پہلے آپ ﷺ پر نازل قرآن اور پھر سابق کتابوں پر ایمان کا ذکر ہے۔',
        classicalExplanation: 'يُؤْمِنُونَ: صِلَةُ الْمَوْصُولِ لَا مَحَلَّ لَهَا مِنَ الْإِعْرَابِ، فِعْلٌ مُضَارِعٌ مَرْفُوعٌ۔',
      },
      {
        wordIndex: 2,
        arabicWord: 'بِمَا',
        urduMeaning: 'اس پر جو',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف جر (ب) + اسم موصول (مَا)',
        grammaticalCase: 'مجرور',
        irabRole: 'متعلق بیؤمنون',
        governingElement: 'يُؤْمِنُونَ',
        notes: 'بما: ب حرف جر + ما اسم موصول۔ یعنی اس پر جو نازل کیا گیا آپ ﷺ پر — یعنی قرآن مجید۔',
        classicalExplanation: 'بِمَا: الْبَاءُ حَرْفُ جَرٍّ، مَا: اسْمٌ مَوْصُولٌ مَجْرُورٌ۔',
      },
      {
        wordIndex: 3,
        arabicWord: 'أُنزِلَ',
        urduMeaning: 'نازل کیا گیا',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ن ز ل',
        morphForm: 'فعل ماضی مجہول باب افعال — مفرد مذکر غائب',
        grammaticalCase: null,
        irabRole: 'صلہ موصول (ما)',
        governingElement: 'مَا',
        notes: 'انزل — باب افعال سے فعل ماضی مجہول۔ نائب فاعل ضمیر مستتر ہے۔ یعنی وہ کتاب جو اللہ نے آپ ﷺ پر نازل فرمائی۔',
        classicalExplanation: 'أُنْزِلَ: فِعْلٌ مَاضٍ مَبْنِيٌّ لِلْمَجْهُولِ صِلَةُ الْمَوْصُولِ وَنَائِبُ فَاعِلِهِ ضَمِيرٌ مُسْتَتِرٌ۔',
      },
      {
        wordIndex: 4,
        arabicWord: 'إِلَيْكَ',
        urduMeaning: 'آپ کی طرف',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف جر (إلى) + ضمیر مخاطب متصل (كَ)',
        grammaticalCase: 'مجرور',
        irabRole: 'متعلق بانزل',
        governingElement: 'أُنزِلَ',
        notes: 'الیک — الی: حرف جر + ک ضمیر مخاطب (نبی ﷺ کے لیے)۔ آپ ﷺ کی طرف نازل کیا گیا — یعنی براہ راست آپ ﷺ پر۔',
        classicalExplanation: 'إِلَيْكَ: جَارٌّ وَمَجْرُورٌ مُتَعَلِّقٌ بِأُنْزِلَ، وَالْكَافُ ضَمِيرُ الْمُخَاطَبِ۔',
      },
      {
        wordIndex: 5,
        arabicWord: 'وَمَا',
        urduMeaning: 'اور جو',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'واو عطف + اسم موصول (مَا)',
        grammaticalCase: null,
        irabRole: 'معطوف علی ما الاولی',
        governingElement: 'بِمَا',
        notes: 'وما: واو عاطفہ + ما اسم موصول۔ یہ پچھلی ما پر معطوف ہے — یعنی وہ کتابیں جو آپ ﷺ سے پہلے انبیاء پر نازل ہوئیں: توراۃ، انجیل، زبور وغیرہ۔',
        classicalExplanation: 'وَمَا: الْوَاوُ عَاطِفَةٌ، مَا: مَعْطُوفَةٌ عَلَى مَا الْأُولَى مَجْرُورَةٌ بِالْبَاءِ الْمُقَدَّرَةِ۔',
      },
      {
        wordIndex: 6,
        arabicWord: 'أُنزِلَ',
        urduMeaning: 'نازل کیا گیا',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ن ز ل',
        morphForm: 'فعل ماضی مجہول — مفرد مذکر غائب',
        grammaticalCase: null,
        irabRole: 'صلہ موصول (ما الثانیہ)',
        governingElement: 'وَمَا',
        notes: 'انزل — دوسری مرتبہ۔ یہاں سابق انبیاء پر نازل کی گئی آسمانی کتابیں مراد ہیں۔',
        classicalExplanation: 'أُنْزِلَ: صِلَةُ الْمَوْصُولِ الثَّانِي فِعْلٌ مَاضٍ مَبْنِيٌّ لِلْمَجْهُولِ۔',
      },
      {
        wordIndex: 7,
        arabicWord: 'مِن',
        urduMeaning: 'سے',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف جر',
        grammaticalCase: null,
        irabRole: 'متعلق بانزل — ابتداء زمان',
        governingElement: 'أُنزِلَ',
        notes: 'من: حرف جر — یہاں ابتداء زمان کے معنی میں ہے۔ آپ ﷺ سے پہلے کے زمانے میں نازل کردہ کتب مراد ہیں۔',
        classicalExplanation: 'مِنْ: حَرْفُ جَرٍّ لِابْتِدَاءِ الْغَايَةِ الزَّمَانِيَّةِ مُتَعَلِّقٌ بِأُنْزِلَ۔',
      },
      {
        wordIndex: 8,
        arabicWord: 'قَبْلِكَ',
        urduMeaning: 'آپ سے پہلے',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ق ب ل',
        morphForm: 'ظرف زمان مجرور (مضاف) + ضمیر مضاف الیہ',
        grammaticalCase: 'مجرور',
        irabRole: 'مجرور بحرف من — مضاف و مضاف الیہ',
        governingElement: 'مِن',
        notes: 'قبلک — قبل: ظرف زمان مضاف + ک ضمیر مخاطب (آپ ﷺ) مضاف الیہ۔ آپ ﷺ سے پہلے کے انبیاء اور ان کی آسمانی کتابیں۔',
        classicalExplanation: 'قَبْلِكَ: مَجْرُورٌ بِمِنْ مُضَافٌ وَالْكَافُ مُضَافٌ إِلَيْهِ۔',
      },
      {
        wordIndex: 9,
        arabicWord: 'وَبِالْآخِرَةِ',
        urduMeaning: 'اور آخرت پر',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: 'أ خ ر',
        morphForm: 'واو عطف + حرف جر (ب) + اسم مجرور معرفہ',
        grammaticalCase: 'مجرور',
        irabRole: 'معطوف — مقدم متعلق بیوقنون',
        governingElement: 'يُوقِنُونَ',
        notes: 'الآخرة — آخرت: موت کے بعد کی زندگی، حشر و نشر، حساب و کتاب، جنت اور جہنم۔ اسے یوقنون سے پہلے ذکر کیا گیا تاکہ اس پر یقین کی اہمیت نمایاں ہو۔',
        classicalExplanation: 'وَبِالْآخِرَةِ: مُتَعَلِّقٌ بِيُوقِنُونَ مُقَدَّمٌ عَلَيْهِ لِلِاهْتِمَامِ۔',
      },
      {
        wordIndex: 10,
        arabicWord: 'هُمْ',
        urduMeaning: 'وہی',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'ضمیر منفصل — جمع مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'مبتدا ثانی یا ضمیر فصل',
        governingElement: null,
        notes: 'ہم — ضمیر فصل (عماد) یا مبتدا: یہ دونوں ہی قول درست ہیں۔ یقین کا اختصاص انہی سے بیان ہوتا ہے — یعنی یہی لوگ حقیقی یقین رکھتے ہیں۔',
        classicalExplanation: 'هُمْ: ضَمِيرُ فَصْلٍ لِلتَّخْصِيصِ أَوْ مُبْتَدَأٌ ثَانٍ۔',
      },
      {
        wordIndex: 11,
        arabicWord: 'يُوقِنُونَ',
        urduMeaning: 'یقین رکھتے ہیں',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ي ق ن',
        morphForm: 'فعل مضارع باب افعال — جمع مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'خبر ہم یا صلہ وَالَّذِینَ',
        governingElement: 'هُمْ',
        notes: 'یوقنون — باب افعال، مادہ ی ق ن۔ یقین: دل کا مکمل اطمینان جس میں شک کا شائبہ بھی نہ ہو — ایمان سے بھی پختہ درجہ۔',
        classicalExplanation: 'يُوقِنُونَ: خَبَرُ هُمْ أَوْ صِلَةُ الْمَوْصُولِ، فِعْلٌ مُضَارِعٌ مَرْفُوعٌ بِثُبُوتِ النُّونِ۔',
      },
    ],

    /* ── آیت ٥: أُولَئِكَ عَلَى هُدًى مِن رَّبِّهِمْ وَأُولَئِكَ هُمُ الْمُفْلِحُونَ ── */
    5: [
      {
        wordIndex: 0,
        arabicWord: 'أُولَئِكَ',
        urduMeaning: 'یہی لوگ',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'اسم اشارہ — جمع مذکر بعید',
        grammaticalCase: 'مرفوع',
        irabRole: 'مبتدا اول',
        governingElement: null,
        notes: 'اولئک — اشارہ بعید جمع مذکر۔ یہاں آیات ٣ اور ٤ میں بیان کردہ صفات والے متقین مراد ہیں۔ بعد کی طرف اشارہ ان کی عزت و رفعت بیان کرنے کے لیے ہے۔',
        classicalExplanation: 'أُولَئِكَ: اسْمُ إِشَارَةٍ مَبْنِيٌّ عَلَى الْكَسْرِ فِي مَحَلِّ رَفْعٍ مُبْتَدَأٌ أَوَّلُ۔',
      },
      {
        wordIndex: 1,
        arabicWord: 'عَلَى',
        urduMeaning: 'پر',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف جر',
        grammaticalCase: null,
        irabRole: 'متعلق بمحذوف خبر',
        governingElement: 'هُدًى (محذوف خبر)',
        notes: 'علی: حرف جر۔ یہاں استعلاء کے معنی میں — وہ ہدایت "پر" ہیں یعنی ہدایت ان کا پلیٹ فارم، ان کی بنیاد ہے۔',
        classicalExplanation: 'عَلَى: حَرْفُ جَرٍّ مُتَعَلِّقٌ بِمَحْذُوفٍ هُوَ خَبَرُ الْمُبْتَدَأِ أَيْ مُسْتَقِرُّونَ۔',
      },
      {
        wordIndex: 2,
        arabicWord: 'هُدًى',
        urduMeaning: 'ہدایت',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ه د ي',
        morphForm: 'اسم نکرہ — منقوص مجرور بالکسرۃ المقدرۃ',
        grammaticalCase: 'مجرور',
        irabRole: 'مجرور بعلی — خبر اولئک',
        governingElement: 'عَلَى',
        notes: 'ھدی — نکرہ تعظیمیہ: کیسی عظیم ہدایت! یعنی اللہ کی خاص ہدایت۔ تنوین کسرہ کے ساتھ مجرور مگر آخری یاء محذوف (منقوص)۔',
        classicalExplanation: 'هُدًى: مَجْرُورٌ بِعَلَى وَعَلَامَةُ جَرِّهِ الْكَسْرَةُ الْمُقَدَّرَةُ مَنَعَ مِنْهَا التَّعَذُّرُ۔',
      },
      {
        wordIndex: 3,
        arabicWord: 'مِّن',
        urduMeaning: 'سے',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف جر',
        grammaticalCase: null,
        irabRole: 'متعلق بہدی — ابتداء جنس (بیانیہ)',
        governingElement: 'هُدًى',
        notes: 'من: حرف جر — یہاں ابتداء جنس یا بیانیہ کے معنی میں۔ ہدایت کا سرچشمہ ان کا رب ہے — یعنی یہ رب کی طرف سے عطا کردہ ہدایت ہے۔',
        classicalExplanation: 'مِنْ: حَرْفُ جَرٍّ بَيَانِيٌّ مُتَعَلِّقٌ بِهُدًى أَوْ بِالْخَبَرِ الْمَحْذُوفِ۔',
      },
      {
        wordIndex: 4,
        arabicWord: 'رَّبِّهِمْ',
        urduMeaning: 'ان کے رب کی طرف سے',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ر ب ب',
        morphForm: 'اسم مجرور (مضاف) + ضمیر جمع مذکر غائب (مضاف الیہ)',
        grammaticalCase: 'مجرور',
        irabRole: 'مجرور بمن — مضاف الیہ',
        governingElement: 'مِّن',
        notes: 'ربہم — رب: لغوی معنی — پالنے والا، پرورش کرنے والا۔ ہم: ضمیر جمع غائب مضاف الیہ۔ ان کی ہدایت اللہ کی طرف سے ہے۔',
        classicalExplanation: 'رَبِّهِمْ: مَجْرُورٌ بِمِنْ وَهُوَ مُضَافٌ وَهُمْ ضَمِيرٌ مُضَافٌ إِلَيْهِ۔',
      },
      {
        wordIndex: 5,
        arabicWord: 'وَأُولَئِكَ',
        urduMeaning: 'اور یہی لوگ',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'واو عطف + اسم اشارہ جمع مذکر بعید',
        grammaticalCase: 'مرفوع',
        irabRole: 'مبتدا ثانی — جملہ جدید',
        governingElement: null,
        notes: 'وأولئک — واو: استئنافیہ یا عاطفہ۔ اولئک کا تکرار: فلاح کی اہمیت نمایاں کرنے اور ان لوگوں کی عزت بیان کرنے کے لیے ہے۔',
        classicalExplanation: 'وَأُولَئِكَ: الْوَاوُ اسْتِئْنَافِيَّةٌ، أُولَئِكَ: مُبْتَدَأٌ ثَانٍ۔',
      },
      {
        wordIndex: 6,
        arabicWord: 'هُمُ',
        urduMeaning: 'وہی',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'ضمیر منفصل — جمع مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'ضمیر فصل — قصر و اختصاص',
        governingElement: null,
        notes: 'ہُمُ — ضمیر فصل (عماد): فلاح صرف انہی کے لیے مخصوص ہے، دوسروں کے لیے نہیں۔ یہ قصر افراد کا فائدہ دیتا ہے۔',
        classicalExplanation: 'هُمُ: ضَمِيرُ فَصْلٍ لَا مَحَلَّ لَهُ مِنَ الْإِعْرَابِ يُفِيدُ التَّخْصِيصَ وَالْحَصْرَ۔',
      },
      {
        wordIndex: 7,
        arabicWord: 'الْمُفْلِحُونَ',
        urduMeaning: 'کامیاب لوگ',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ف ل ح',
        morphForm: 'اسم فاعل — جمع مذکر سالم معرفہ مرفوع',
        grammaticalCase: 'مرفوع',
        irabRole: 'خبر وَأُولَئِكَ',
        governingElement: 'وَأُولَئِكَ',
        notes: 'المفلحون — مادہ ف ل ح۔ فلاح: دنیا و آخرت دونوں کی مکمل کامیابی۔ المزارع فلح کرتا ہے یعنی زمین کاٹ کر فصل اگاتا ہے — یہاں مومن بھی روحانی فصل اگاتا ہے۔',
        classicalExplanation: 'الْمُفْلِحُونَ: خَبَرُ الْمُبْتَدَأِ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الْوَاوُ لِأَنَّهُ جَمْعُ مُذَكَّرٍ سَالِمٌ۔',
      },
    ],

    /* ── آیت ٦: إِنَّ الَّذِينَ كَفَرُوا سَوَاءٌ عَلَيْهِمْ أَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ ── */
    6: [
      {
        wordIndex: 0,
        arabicWord: 'إِنَّ',
        urduMeaning: 'بے شک',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف مشبہ بالفعل — ناصب',
        grammaticalCase: null,
        irabRole: 'ناصب — اسم کو نصب دیتا ہے',
        governingElement: null,
        notes: 'إن — حروف مشبہ بالفعل میں سے۔ تاکید کا فائدہ دیتا ہے۔ اسم کو نصب اور خبر کو رفع دیتا ہے۔',
        classicalExplanation: 'إِنَّ: حَرْفٌ مُشَبَّهٌ بِالْفِعْلِ يَنْصِبُ الِاسْمَ وَيَرْفَعُ الْخَبَرَ لِلتَّوْكِيدِ۔',
      },
      {
        wordIndex: 1,
        arabicWord: 'الَّذِينَ',
        urduMeaning: 'جن لوگوں نے',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'اسم موصول — جمع مذکر',
        grammaticalCase: 'منصوب',
        irabRole: 'اسم إن',
        governingElement: 'إِنَّ',
        notes: 'الذین — اسم موصول۔ إن کا اسم ہونے کی وجہ سے محلاً منصوب ہے۔ صلہ آگے کَفَرُوا ہے۔',
        classicalExplanation: 'الَّذِينَ: اسْمُ إِنَّ مَنْصُوبٌ مَحَلًّا لِأَنَّهُ مَبْنِيٌّ۔',
      },
      {
        wordIndex: 2,
        arabicWord: 'كَفَرُوا',
        urduMeaning: 'انہوں نے کفر کیا',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ك ف ر',
        morphForm: 'فعل ماضی — جمع مذکر غائب',
        grammaticalCase: null,
        irabRole: 'صلہ موصول (الَّذِينَ)',
        governingElement: 'الَّذِينَ',
        notes: 'کفروا — مادہ ک ف ر: ڈھانپنا، چھپانا۔ کفر: نعمت کو چھپانا، اللہ کی حقیقت کو ماننے سے انکار کرنا۔ واو فاعل جمع مذکر غائب ہے۔',
        classicalExplanation: 'كَفَرُوا: فِعْلٌ مَاضٍ صِلَةُ الْمَوْصُولِ وَالْوَاوُ ضَمِيرُ الْفَاعِلِ۔',
      },
      {
        wordIndex: 3,
        arabicWord: 'سَوَاءٌ',
        urduMeaning: 'برابر ہے',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'س و ي',
        morphForm: 'اسم — مصدر بمعنی مستوی',
        grammaticalCase: 'مرفوع',
        irabRole: 'خبر إن مقدم',
        governingElement: 'إِنَّ',
        notes: 'سواء — مادہ س و ی: برابر ہونا۔ إن کی خبر ہے جو اسم پر مقدم ہوئی۔ ان کے لیے ڈرانا اور نہ ڈرانا دونوں برابر ہیں۔',
        classicalExplanation: 'سَوَاءٌ: خَبَرُ إِنَّ مُقَدَّمٌ مَرْفُوعٌ وَالْمُبْتَدَأُ مُؤَخَّرٌ هُوَ الْجُمْلَةُ الِاسْتِفْهَامِيَّةُ۔',
      },
      {
        wordIndex: 4,
        arabicWord: 'عَلَيْهِمْ',
        urduMeaning: 'ان پر',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف جر (عَلى) + ضمیر جمع مذکر غائب',
        grammaticalCase: 'مجرور',
        irabRole: 'متعلق بسواء',
        governingElement: 'سَوَاءٌ',
        notes: 'علیہم — علی: حرف جر۔ ہم: ضمیر جمع غائب۔ ان کافروں پر ڈرانا اور نہ ڈرانا یکساں ہے۔',
        classicalExplanation: 'عَلَيْهِمْ: جَارٌّ وَمَجْرُورٌ مُتَعَلِّقٌ بِسَوَاءٌ۔',
      },
      {
        wordIndex: 5,
        arabicWord: 'أَأَنذَرْتَهُمْ',
        urduMeaning: 'کیا آپ نے انہیں ڈرایا',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ن ذ ر',
        morphForm: 'ہمزہ استفہام + فعل ماضی باب افعال + ت فاعل + ہم مفعول',
        grammaticalCase: null,
        irabRole: 'مبتدا مؤخر (اسم سواء) — جملہ استفہامیہ',
        governingElement: 'سَوَاءٌ',
        notes: 'أأنذرتہم — أ: ہمزہ استفہام۔ انذر: باب افعال مادہ ن ذ ر — خبردار کرنا، ڈرانا۔ پوری سوالیہ جملہ (أأنذرتہم أم لم تنذرہم) سواء کا فاعل یا مبتدا ہے۔',
        classicalExplanation: 'أَأَنْذَرْتَهُمْ: الْهَمْزَةُ لِلِاسْتِفْهَامِ وَالْجُمْلَةُ الِاسْتِفْهَامِيَّةُ فِي مَحَلِّ رَفْعٍ فَاعِلٌ لِسَوَاءٌ۔',
      },
      {
        wordIndex: 6,
        arabicWord: 'أَمْ',
        urduMeaning: 'یا',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف عطف معادلہ — أم متصلہ',
        grammaticalCase: null,
        irabRole: 'حرف عطف بین جملتین استفہامیتین',
        governingElement: 'أَأَنذَرْتَهُمْ',
        notes: 'أم — یہاں معادلہ کے لیے ہے یعنی پہلے سوال اور دوسرے سوال کو ملاتی ہے۔ ڈرانا یا نہ ڈرانا — دونوں کا نتیجہ ایک ہے۔',
        classicalExplanation: 'أَمْ: حَرْفُ عَطْفٍ مُتَّصِلَةٌ تُعَادِلُ هَمْزَةَ الِاسْتِفْهَامِ۔',
      },
      {
        wordIndex: 7,
        arabicWord: 'لَمْ',
        urduMeaning: 'نہیں',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف جزم و نفی — قلب مضارع کو ماضی میں',
        grammaticalCase: null,
        irabRole: 'جازمہ للفعل المضارع',
        governingElement: 'تُنذِرْهُمْ',
        notes: 'لم — حرف نفی جازم۔ مضارع کو مجزوم کرتا ہے اور ماضی کے معنی دیتا ہے۔ یعنی آپ نے انہیں ڈرایا نہ ہو۔',
        classicalExplanation: 'لَمْ: حَرْفُ نَفْيٍ وَجَزْمٍ وَقَلْبٍ يَجْزِمُ الْفِعْلَ الْمُضَارِعَ وَيَقْلِبُهُ إِلَى الْمُضِيِّ۔',
      },
      {
        wordIndex: 8,
        arabicWord: 'تُنذِرْهُمْ',
        urduMeaning: 'آپ انہیں ڈرائیں',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ن ذ ر',
        morphForm: 'فعل مضارع مجزوم باب افعال + ہم مفعول',
        grammaticalCase: 'مجزوم',
        irabRole: 'مجزوم بلم',
        governingElement: 'لَمْ',
        notes: 'تنذرہم — لم کی وجہ سے مجزوم، آخر پر سکون۔ مادہ ن ذ ر۔ خطاب نبی ﷺ کو ہے۔',
        classicalExplanation: 'تُنْذِرْهُمْ: فِعْلٌ مُضَارِعٌ مَجْزُومٌ بِلَمْ وَعَلَامَةُ جَزْمِهِ السُّكُونُ۔',
      },
      {
        wordIndex: 9,
        arabicWord: 'لَا',
        urduMeaning: 'نہیں',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف نفی',
        grammaticalCase: null,
        irabRole: 'نافیہ للجملة الفعلیة',
        governingElement: 'يُؤْمِنُونَ',
        notes: 'لا — حرف نفی مضارع کے ساتھ۔ یہ إن کی خبر (جملہ فعلیہ) کا آغاز ہے۔',
        classicalExplanation: 'لَا: نَافِيَةٌ لَا عَمَلَ لَهَا۔',
      },
      {
        wordIndex: 10,
        arabicWord: 'يُؤْمِنُونَ',
        urduMeaning: 'ایمان لائیں گے',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'أ م ن',
        morphForm: 'فعل مضارع باب افعال — جمع مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'خبر إن — جملہ فعلیہ',
        governingElement: 'إِنَّ',
        notes: 'یؤمنون — لا + یؤمنون مل کر إن کی خبر بناتے ہیں۔ یعنی یہ لوگ ایمان نہیں لائیں گے — یہ اللہ کا حتمی فیصلہ ہے ان کے متعلق جن کے دلوں پر مہر لگ چکی۔',
        classicalExplanation: 'يُؤْمِنُونَ: فِعْلٌ مُضَارِعٌ مَرْفُوعٌ وَجُمْلَةُ لَا يُؤْمِنُونَ فِي مَحَلِّ رَفْعٍ خَبَرُ إِنَّ۔',
      },
    ],

    /* ── آیت ٧: خَتَمَ اللَّهُ عَلَى قُلُوبِهِمْ وَعَلَى سَمْعِهِمْ وَعَلَى أَبْصَارِهِمْ غِشَاوَةٌ وَلَهُمْ عَذَابٌ عَظِيمٌ ── */
    7: [
      {
        wordIndex: 0,
        arabicWord: 'خَتَمَ',
        urduMeaning: 'مہر لگا دی',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'خ ت م',
        morphForm: 'فعل ماضی — مفرد مذکر غائب',
        grammaticalCase: null,
        irabRole: 'فعل — مستقل جملہ',
        governingElement: null,
        notes: 'ختم — مادہ خ ت م: مہر لگانا، بند کرنا۔ یعنی کفر پر اصرار کی وجہ سے اللہ نے ان کے دلوں پر مہر لگا دی کہ اب حق ان میں داخل نہیں ہو سکتا۔',
        classicalExplanation: 'خَتَمَ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ۔',
      },
      {
        wordIndex: 1,
        arabicWord: 'اللَّهُ',
        urduMeaning: 'اللہ نے',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'علم — لفظ جلالہ — مرفوع',
        grammaticalCase: 'مرفوع',
        irabRole: 'فاعل خَتَمَ',
        governingElement: 'خَتَمَ',
        notes: 'اللہ — لفظ جلالہ۔ فاعل ہے خَتَمَ کا۔ اللہ تعالیٰ خود اس مہر لگانے کو اپنی طرف منسوب فرما رہے ہیں۔',
        classicalExplanation: 'اللَّهُ: فَاعِلُ خَتَمَ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ الظَّاهِرَةُ۔',
      },
      {
        wordIndex: 2,
        arabicWord: 'عَلَى',
        urduMeaning: 'پر',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف جر',
        grammaticalCase: null,
        irabRole: 'متعلق بختم',
        governingElement: 'خَتَمَ',
        notes: 'علی — حرف جر استعلاء۔ ختم علی: اوپر سے مہر لگانا۔',
        classicalExplanation: 'عَلَى: حَرْفُ جَرٍّ مُتَعَلِّقٌ بِخَتَمَ۔',
      },
      {
        wordIndex: 3,
        arabicWord: 'قُلُوبِهِمْ',
        urduMeaning: 'ان کے دلوں پر',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ق ل ب',
        morphForm: 'جمع مکسر مجرور (مضاف) + ضمیر جمع غائب (مضاف الیہ)',
        grammaticalCase: 'مجرور',
        irabRole: 'مجرور بعلی',
        governingElement: 'عَلَى',
        notes: 'قلوبہم — قلب کی جمع قلوب۔ مادہ ق ل ب: الٹنا، پلٹنا۔ دل کو قلب اس لیے کہتے ہیں کہ وہ مسلسل پلٹتا رہتا ہے — مگر کفار کا دل اب اللہ کی طرف نہیں پلٹ سکتا۔',
        classicalExplanation: 'قُلُوبِهِمْ: مَجْرُورٌ بِعَلَى وَهُوَ مُضَافٌ وَالضَّمِيرُ مُضَافٌ إِلَيْهِ۔',
      },
      {
        wordIndex: 4,
        arabicWord: 'وَعَلَى',
        urduMeaning: 'اور پر',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'واو عطف + حرف جر',
        grammaticalCase: null,
        irabRole: 'معطوف علی الجار الاول',
        governingElement: 'خَتَمَ',
        notes: 'وعلی — واو عاطفہ + علی حرف جر۔ سمع کو بھی ختم کے ساتھ معطوف کیا گیا ہے۔',
        classicalExplanation: 'وَعَلَى: الْوَاوُ عَاطِفَةٌ وَعَلَى حَرْفُ جَرٍّ۔',
      },
      {
        wordIndex: 5,
        arabicWord: 'سَمْعِهِمْ',
        urduMeaning: 'ان کی سماعت پر',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'س م ع',
        morphForm: 'اسم مصدر مجرور (مضاف) + ضمیر',
        grammaticalCase: 'مجرور',
        irabRole: 'مجرور بعلی — معطوف',
        governingElement: 'وَعَلَى',
        notes: 'سمعہم — مادہ س م ع: سننا۔ سمع مفرد آیا جبکہ قلوب اور ابصار جمع ہیں۔ علماء نے کہا سمع کا مادہ مصدر ہے جو جمع کا معنی بھی دیتا ہے۔',
        classicalExplanation: 'سَمْعِهِمْ: مَجْرُورٌ بِعَلَى مُضَافٌ إِلَى الضَّمِيرِ۔',
      },
      {
        wordIndex: 6,
        arabicWord: 'وَعَلَى',
        urduMeaning: 'اور پر',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'واو عطف + حرف جر',
        grammaticalCase: null,
        irabRole: 'معطوف — یا استئناف جملہ جدید',
        governingElement: 'غِشَاوَةٌ',
        notes: 'وعلی — یہاں سے نیا جملہ شروع ہو سکتا ہے: آنکھوں پر پردہ ہے — یعنی یہ خبریہ جملہ ہے مبتدا غشاوة اور خبر وعلی ابصارہم۔',
        classicalExplanation: 'وَعَلَى: اسْتِئْنَافِيَّةٌ أَوْ عَاطِفَةٌ، وَعَلَى أَبْصَارِهِمْ خَبَرٌ مُقَدَّمٌ۔',
      },
      {
        wordIndex: 7,
        arabicWord: 'أَبْصَارِهِمْ',
        urduMeaning: 'ان کی آنکھوں پر',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ب ص ر',
        morphForm: 'جمع مکسر مجرور (مضاف) + ضمیر',
        grammaticalCase: 'مجرور',
        irabRole: 'مجرور بعلی',
        governingElement: 'وَعَلَى',
        notes: 'ابصارہم — بصر کی جمع ابصار۔ مادہ ب ص ر: دیکھنا، سمجھنا۔ دل، کان اور آنکھیں — تینوں ادراک کے ذرائع بند ہو گئے۔',
        classicalExplanation: 'أَبْصَارِهِمْ: مَجْرُورٌ بِعَلَى مُضَافٌ إِلَى ضَمِيرِهِمْ۔',
      },
      {
        wordIndex: 8,
        arabicWord: 'غِشَاوَةٌ',
        urduMeaning: 'پردہ ہے',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'غ ش و',
        morphForm: 'اسم نکرہ — مفرد مؤنث مرفوع',
        grammaticalCase: 'مرفوع',
        irabRole: 'مبتدا مؤخر — خبر وعلی ابصارہم',
        governingElement: null,
        notes: 'غشاوة — مادہ غ ش و: ڈھانپنا۔ وہ پردہ یا غلاف جو آنکھ کو ڈھانپ لے۔ نکرہ تعظیم کے لیے ہے — کتنا گھنا پردہ!',
        classicalExplanation: 'غِشَاوَةٌ: مُبْتَدَأٌ مُؤَخَّرٌ مَرْفُوعٌ وَخَبَرُهُ وَعَلَى أَبْصَارِهِمْ۔',
      },
      {
        wordIndex: 9,
        arabicWord: 'وَلَهُمْ',
        urduMeaning: 'اور ان کے لیے',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'واو استئناف + لام جر + ضمیر جمع',
        grammaticalCase: 'مجرور',
        irabRole: 'خبر مقدم — جملہ جدید',
        governingElement: 'عَذَابٌ',
        notes: 'ولہم — نئے جملے کا آغاز۔ لہم خبر مقدم اور عذاب مبتدا مؤخر ہے۔ دنیا میں بھی نقصان اور آخرت میں بھی۔',
        classicalExplanation: 'وَلَهُمْ: الْوَاوُ اسْتِئْنَافِيَّةٌ وَلَهُمْ جَارٌّ وَمَجْرُورٌ خَبَرٌ مُقَدَّمٌ۔',
      },
      {
        wordIndex: 10,
        arabicWord: 'عَذَابٌ',
        urduMeaning: 'عذاب',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ع ذ ب',
        morphForm: 'اسم نکرہ — مفرد مذکر مرفوع',
        grammaticalCase: 'مرفوع',
        irabRole: 'مبتدا مؤخر',
        governingElement: 'وَلَهُمْ',
        notes: 'عذاب — مادہ ع ذ ب: تکلیف دہ سزا۔ نکرہ تعظیم کے لیے: کتنا بڑا، کتنا شدید عذاب ہوگا!',
        classicalExplanation: 'عَذَابٌ: مُبْتَدَأٌ مُؤَخَّرٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ الظَّاهِرَةُ۔',
      },
      {
        wordIndex: 11,
        arabicWord: 'عَظِيمٌ',
        urduMeaning: 'بڑا',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ع ظ م',
        morphForm: 'صفت — مفرد مذکر مرفوع',
        grammaticalCase: 'مرفوع',
        irabRole: 'نعت (صفت) لعذاب',
        governingElement: 'عَذَابٌ',
        notes: 'عظیم — مادہ ع ظ م: بڑا، عظیم۔ عذاب کی صفت۔ عظمت کا یہ وصف خوف دلانے کے لیے بیان کیا گیا۔',
        classicalExplanation: 'عَظِيمٌ: نَعْتٌ لِعَذَابٌ مَرْفُوعٌ تَبَعًا لِمَنْعُوتِهِ۔',
      },
    ],

    /* ── آیت ٨: وَمِنَ النَّاسِ مَن يَقُولُ آمَنَّا بِاللَّهِ وَبِالْيَوْمِ الْآخِرِ وَمَا هُم بِمُؤْمِنِينَ ── */
    8: [
      {
        wordIndex: 0,
        arabicWord: 'وَمِنَ',
        urduMeaning: 'اور لوگوں میں سے',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'واو استئناف + حرف جر (مِن)',
        grammaticalCase: null,
        irabRole: 'خبر مقدم — متعلق بمحذوف',
        governingElement: 'مَن',
        notes: 'ومن — واو استئنافیہ: نئے موضوع کا آغاز — منافقین کا بیان شروع ہو رہا ہے۔ من + الناس: جار مجرور خبر مقدم اور مَن مبتدا مؤخر۔',
        classicalExplanation: 'وَمِنَ: الْوَاوُ اسْتِئْنَافِيَّةٌ، مِنَ: حَرْفُ جَرٍّ خَبَرٌ مُقَدَّمٌ۔',
      },
      {
        wordIndex: 1,
        arabicWord: 'النَّاسِ',
        urduMeaning: 'لوگوں میں سے',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ن و س',
        morphForm: 'جمع — معرفہ مجرور',
        grammaticalCase: 'مجرور',
        irabRole: 'مجرور بمن',
        governingElement: 'وَمِنَ',
        notes: 'الناس — مادہ ن و س یا ا ن س: انس، میل جول۔ جمع انسان۔ معرفہ بال تعریف: سارے لوگوں میں سے کچھ لوگ۔',
        classicalExplanation: 'النَّاسِ: مَجْرُورٌ بِمِنَ وَعَلَامَةُ جَرِّهِ الْكَسْرَةُ الظَّاهِرَةُ۔',
      },
      {
        wordIndex: 2,
        arabicWord: 'مَن',
        urduMeaning: 'جو',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'اسم موصول یا نکرہ موصوفہ — مفرد',
        grammaticalCase: 'مرفوع',
        irabRole: 'مبتدا مؤخر',
        governingElement: 'وَمِنَ النَّاسِ',
        notes: 'من — اسم موصول یا نکرہ بمعنی ناس۔ منافقین کی طرف اشارہ ہے — ظاہر میں مومن مگر باطن میں کافر۔',
        classicalExplanation: 'مَنْ: اسْمٌ مَوْصُولٌ فِي مَحَلِّ رَفْعٍ مُبْتَدَأٌ مُؤَخَّرٌ أَوِ اسْمٌ نَكِرَةٌ مَوْصُوفَةٌ۔',
      },
      {
        wordIndex: 3,
        arabicWord: 'يَقُولُ',
        urduMeaning: 'کہتا ہے',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ق و ل',
        morphForm: 'فعل مضارع — مفرد مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'صلہ موصول (مَن)',
        governingElement: 'مَن',
        notes: 'یقول — مادہ ق و ل: کہنا، بولنا۔ یقول کا فاعل ضمیر مستتر ہو (من)۔ یہ صلہ موصول ہے۔',
        classicalExplanation: 'يَقُولُ: صِلَةُ الْمَوْصُولِ فِعْلٌ مُضَارِعٌ مَرْفُوعٌ وَفَاعِلُهُ ضَمِيرٌ مُسْتَتِرٌ۔',
      },
      {
        wordIndex: 4,
        arabicWord: 'آمَنَّا',
        urduMeaning: 'ہم ایمان لائے',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'أ م ن',
        morphForm: 'فعل ماضی باب افعال + نا فاعل',
        grammaticalCase: null,
        irabRole: 'مقول القول (محکی)',
        governingElement: 'يَقُولُ',
        notes: 'آمنا — باب افعال ماضی، مادہ ا م ن۔ نا: ضمیر فاعل جمع متکلم۔ منافقین کا دعویٰ ایمان — محض زبانی کلامی، دل سے نہیں۔',
        classicalExplanation: 'آمَنَّا: فِعْلٌ مَاضٍ وَنَا ضَمِيرُ الْفَاعِلِ فِي مَحَلِّ نَصْبٍ مَفْعُولٌ بِهِ لِيَقُولُ۔',
      },
      {
        wordIndex: 5,
        arabicWord: 'بِاللَّهِ',
        urduMeaning: 'اللہ پر',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف جر (ب) + لفظ جلالہ مجرور',
        grammaticalCase: 'مجرور',
        irabRole: 'متعلق بآمنا',
        governingElement: 'آمَنَّا',
        notes: 'باللہ — ب: حرف جر تعدیہ۔ اللہ: لفظ جلالہ مجرور۔ منافقین نے اللہ پر ایمان کا دعویٰ کیا لیکن ان کے قلوب میں اللہ کی محبت نہ تھی۔',
        classicalExplanation: 'بِاللَّهِ: جَارٌّ وَمَجْرُورٌ مُتَعَلِّقٌ بِآمَنَّا۔',
      },
      {
        wordIndex: 6,
        arabicWord: 'وَبِالْيَوْمِ',
        urduMeaning: 'اور قیامت کے دن پر',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: 'ي و م',
        morphForm: 'واو عطف + حرف جر + اسم مجرور معرفہ',
        grammaticalCase: 'مجرور',
        irabRole: 'معطوف علی باللہ',
        governingElement: 'آمَنَّا',
        notes: 'وبالیوم — واو عطف + ب جر + الیوم: دن۔ یوم الآخر: روز قیامت۔ انہوں نے آخرت پر بھی ایمان کا دعویٰ کیا۔',
        classicalExplanation: 'وَبِالْيَوْمِ: مَعْطُوفٌ عَلَى بِاللَّهِ جَارٌّ وَمَجْرُورٌ۔',
      },
      {
        wordIndex: 7,
        arabicWord: 'الْآخِرِ',
        urduMeaning: 'آخرت',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'أ خ ر',
        morphForm: 'صفت — مجرور (نعت لیوم)',
        grammaticalCase: 'مجرور',
        irabRole: 'نعت (صفت) لِلْيَوْم',
        governingElement: 'الْيَوْمِ',
        notes: 'الآخر — مادہ ا خ ر: آخری، پچھلا۔ یوم آخر: آخری دن، قیامت۔ اس دن کے بعد کوئی دن نہیں۔',
        classicalExplanation: 'الْآخِرِ: نَعْتٌ لِلْيَوْمِ مَجْرُورٌ تَبَعًا لِمَنْعُوتِهِ۔',
      },
      {
        wordIndex: 8,
        arabicWord: 'وَمَا',
        urduMeaning: 'حالانکہ نہیں',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'واو حال + ما حجازیہ نافیہ',
        grammaticalCase: null,
        irabRole: 'ما حجازیہ — نفی مؤکد',
        governingElement: 'بِمُؤْمِنِينَ',
        notes: 'وما — واو حالیہ + ما حجازیہ (مشابہ لیس)۔ ما حجازیہ اسم کو رفع اور خبر کو نصب دیتی ہے یا باء زیادہ کے ساتھ۔ حقیقت یہ ہے کہ وہ مومن نہیں ہیں — خواہ کچھ بھی کہیں۔',
        classicalExplanation: 'وَمَا: الْوَاوُ حَالِيَّةٌ وَمَا نَافِيَةٌ حِجَازِيَّةٌ تَعْمَلُ عَمَلَ لَيْسَ۔',
      },
      {
        wordIndex: 9,
        arabicWord: 'هُم',
        urduMeaning: 'وہ',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'ضمیر منفصل — جمع مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'اسم ما حجازیہ (یا مبتدا)',
        governingElement: 'وَمَا',
        notes: 'ہم — ضمیر منفصل جمع غائب۔ ما کا اسم ہونے کی وجہ سے محلاً مرفوع۔',
        classicalExplanation: 'هُمْ: اسْمُ مَا الْحِجَازِيَّةِ مَرْفُوعٌ أَوْ مُبْتَدَأٌ عَلَى رَأْيِ تَمِيمٍ۔',
      },
      {
        wordIndex: 10,
        arabicWord: 'بِمُؤْمِنِينَ',
        urduMeaning: 'ایمان والے نہیں',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'أ م ن',
        morphForm: 'باء زائدہ + اسم فاعل جمع مذکر سالم مجرور لفظاً منصوب محلاً',
        grammaticalCase: 'مجرور (لفظاً)',
        irabRole: 'خبر ما حجازیہ — باء زائدہ للتوکید',
        governingElement: 'وَمَا',
        notes: 'بمؤمنین — ب: زائدہ برائے تاکید نفی۔ مؤمنین: خبر ما۔ باء زائدہ نفی کو مزید پختہ کرتی ہے — وہ ہرگز مومن نہیں ہیں۔',
        classicalExplanation: 'بِمُؤْمِنِينَ: الْبَاءُ زَائِدَةٌ لِتَوْكِيدِ النَّفْيِ وَمُؤْمِنِينَ خَبَرُ مَا مَجْرُورٌ لَفْظًا مَنْصُوبٌ مَحَلًّا۔',
      },
    ],

    /* ── آیت ٩: يُخَادِعُونَ اللَّهَ وَالَّذِينَ آمَنُوا وَمَا يَخْدَعُونَ إِلَّا أَنفُسَهُمْ وَمَا يَشْعُرُونَ ── */
    9: [
      {
        wordIndex: 0,
        arabicWord: 'يُخَادِعُونَ',
        urduMeaning: 'دھوکہ دیتے ہیں',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'خ د ع',
        morphForm: 'فعل مضارع باب مفاعلہ — جمع مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'خبر مبتدا محذوف یا استئناف بیانی',
        governingElement: null,
        notes: 'یخادعون — باب مفاعلہ (خادع) مادہ خ د ع: دھوکہ دینا۔ مفاعلہ کا صیغہ دو طرفہ دھوکے کا مفہوم دیتا ہے: وہ اللہ کو دھوکہ دینے کی کوشش کرتے ہیں۔',
        classicalExplanation: 'يُخَادِعُونَ: فِعْلٌ مُضَارِعٌ مَرْفُوعٌ وَالْوَاوُ فَاعِلٌ، وَالْجُمْلَةُ اسْتِئْنَافِيَّةٌ أَوْ خَبَرٌ لِمُبْتَدَأٍ مَحْذُوفٍ۔',
      },
      {
        wordIndex: 1,
        arabicWord: 'اللَّهَ',
        urduMeaning: 'اللہ کو',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'لفظ جلالہ — منصوب',
        grammaticalCase: 'منصوب',
        irabRole: 'مفعول به',
        governingElement: 'يُخَادِعُونَ',
        notes: 'اللہ — مفعول به منصوب۔ اللہ کو دھوکہ دینا محال ہے کیونکہ وہ ہر چیز جانتے ہیں — مگر منافقین اپنی جہالت میں یہی سمجھ رہے تھے۔',
        classicalExplanation: 'اللَّهَ: مَفْعُولٌ بِهِ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ الظَّاهِرَةُ۔',
      },
      {
        wordIndex: 2,
        arabicWord: 'وَالَّذِينَ',
        urduMeaning: 'اور جو',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'واو عطف + اسم موصول جمع مذکر',
        grammaticalCase: 'منصوب (محلاً)',
        irabRole: 'معطوف علی اللہ',
        governingElement: 'يُخَادِعُونَ',
        notes: 'والذین — واو عطف + اسم موصول۔ مومنوں کو بھی دھوکہ دینے کی کوشش کرتے ہیں۔ صلہ: آمنوا۔',
        classicalExplanation: 'وَالَّذِينَ: مَعْطُوفٌ عَلَى اللَّهَ فِي مَحَلِّ نَصْبٍ۔',
      },
      {
        wordIndex: 3,
        arabicWord: 'آمَنُوا',
        urduMeaning: 'ایمان لائے',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'أ م ن',
        morphForm: 'فعل ماضی + واو فاعل',
        grammaticalCase: null,
        irabRole: 'صلہ موصول (وَالَّذِينَ)',
        governingElement: 'وَالَّذِينَ',
        notes: 'آمنوا — فعل ماضی جمع مذکر۔ واو: فاعل۔ یہ مومنین مراد ہیں جن کو منافقین ظاہری ایمان سے دھوکہ دیتے تھے۔',
        classicalExplanation: 'آمَنُوا: صِلَةُ الْمَوْصُولِ فِعْلٌ مَاضٍ وَالْوَاوُ ضَمِيرُ الْفَاعِلِ۔',
      },
      {
        wordIndex: 4,
        arabicWord: 'وَمَا',
        urduMeaning: 'اور نہیں',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'واو حال/استئناف + ما نافیہ',
        grammaticalCase: null,
        irabRole: 'نافیہ — جملہ حالیہ یا استئنافیہ',
        governingElement: 'يَخْدَعُونَ',
        notes: 'وما — واو + ما نافیہ۔ حقیقت بیان کی جا رہی ہے: اصل میں وہ خود ہی دھوکہ کھا رہے ہیں۔',
        classicalExplanation: 'وَمَا: الْوَاوُ حَالِيَّةٌ أَوِ اسْتِئْنَافِيَّةٌ وَمَا نَافِيَةٌ لَا عَمَلَ لَهَا۔',
      },
      {
        wordIndex: 5,
        arabicWord: 'يَخْدَعُونَ',
        urduMeaning: 'دھوکہ دیتے ہیں',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'خ د ع',
        morphForm: 'فعل مضارع باب فعل — جمع مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'فعل نفی — مخدوع اصل میں وہ خود',
        governingElement: 'وَمَا',
        notes: 'یخدعون — باب اول (ثلاثی مجرد)، مادہ خ د ع۔ پہلا یخادعون باب مفاعلہ تھا — یہاں بغیر الف سے آیا جو نتیجہ بتاتا ہے: آخرکار دھوکہ انہی کو ہو رہا ہے۔',
        classicalExplanation: 'يَخْدَعُونَ: فِعْلٌ مُضَارِعٌ مَرْفُوعٌ وَالْجُمْلَةُ فِي مَحَلِّ نَصْبٍ حَالٌ أَوِ اسْتِئْنَافِيَّةٌ۔',
      },
      {
        wordIndex: 6,
        arabicWord: 'إِلَّا',
        urduMeaning: 'مگر / سوائے',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف استثناء',
        grammaticalCase: null,
        irabRole: 'استثناء — قصر و حصر',
        governingElement: 'أَنفُسَهُمْ',
        notes: 'إلا — حرف استثناء۔ ما یخدعون إلا انفسہم: وہ صرف اپنے آپ کو دھوکہ دے رہے ہیں — قصر اضافی: دوسروں کو نہیں، بس خود کو۔',
        classicalExplanation: 'إِلَّا: حَرْفُ اسْتِثْنَاءٍ مُفَرَّغٌ لِلْحَصْرِ۔',
      },
      {
        wordIndex: 7,
        arabicWord: 'أَنفُسَهُمْ',
        urduMeaning: 'اپنے آپ کو',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ن ف س',
        morphForm: 'جمع مکسر منصوب (مضاف) + ضمیر',
        grammaticalCase: 'منصوب',
        irabRole: 'مفعول بہ (مستثنی مفرغ)',
        governingElement: 'يَخْدَعُونَ',
        notes: 'انفسہم — نفس کی جمع انفس۔ مادہ ن ف س: جان، ذات۔ انہی کی جانیں نقصان اٹھا رہی ہیں — دنیا میں فتنہ، آخرت میں عذاب۔',
        classicalExplanation: 'أَنْفُسَهُمْ: مَفْعُولٌ بِهِ مَنْصُوبٌ وَهُوَ مُضَافٌ وَالضَّمِيرُ مُضَافٌ إِلَيْهِ۔',
      },
      {
        wordIndex: 8,
        arabicWord: 'وَمَا',
        urduMeaning: 'اور نہیں',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'واو حال + ما نافیہ',
        grammaticalCase: null,
        irabRole: 'نافیہ — جملہ حالیہ',
        governingElement: 'يَشْعُرُونَ',
        notes: 'وما — یہ جملہ حال ہے: وہ سمجھتے ہی نہیں کہ وہ خود کو نقصان پہنچا رہے ہیں۔',
        classicalExplanation: 'وَمَا: الْوَاوُ حَالِيَّةٌ وَمَا نَافِيَةٌ۔',
      },
      {
        wordIndex: 9,
        arabicWord: 'يَشْعُرُونَ',
        urduMeaning: 'سمجھتے ہیں',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ش ع ر',
        morphForm: 'فعل مضارع — جمع مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'خبر — جملہ حالیہ',
        governingElement: 'وَمَا',
        notes: 'یشعرون — مادہ ش ع ر: محسوس کرنا، سمجھنا۔ وہ یہ بھی نہیں جانتے کہ وہ خود ہی تباہ ہو رہے ہیں — یہ ان کی سب سے بڑی مصیبت ہے۔',
        classicalExplanation: 'يَشْعُرُونَ: فِعْلٌ مُضَارِعٌ مَرْفُوعٌ وَجُمْلَةُ لَا يَشْعُرُونَ فِي مَحَلِّ نَصْبٍ حَالٌ۔',
      },
    ],

    /* ── آیت ١٠: فِي قُلُوبِهِم مَّرَضٌ فَزَادَهُمُ اللَّهُ مَرَضًا وَلَهُمْ عَذَابٌ أَلِيمٌ بِمَا كَانُوا يَكْذِبُونَ ── */
    10: [
      {
        wordIndex: 0,
        arabicWord: 'فِي',
        urduMeaning: 'میں',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف جر ظرفیہ',
        grammaticalCase: null,
        irabRole: 'خبر مقدم — متعلق بمحذوف',
        governingElement: 'مَّرَضٌ',
        notes: 'فی — حرف جر ظرفیہ: اندر ہونے کا مفہوم۔ فی قلوبہم: خبر مقدم اور مرض مبتدا مؤخر۔ بیماری دلوں کے اندر ہے — نفاق کی بیماری۔',
        classicalExplanation: 'فِي: حَرْفُ جَرٍّ مُتَعَلِّقٌ بِمَحْذُوفٍ هُوَ خَبَرٌ مُقَدَّمٌ۔',
      },
      {
        wordIndex: 1,
        arabicWord: 'قُلُوبِهِم',
        urduMeaning: 'ان کے دلوں میں',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ق ل ب',
        morphForm: 'جمع مکسر مجرور (مضاف) + ضمیر',
        grammaticalCase: 'مجرور',
        irabRole: 'مجرور بفی',
        governingElement: 'فِي',
        notes: 'قلوبہم — یہاں منافقین کے دل مراد ہیں جن میں نفاق، حسد اور کینے کی بیماری ہے۔',
        classicalExplanation: 'قُلُوبِهِمْ: مَجْرُورٌ بِفِي وَالْجَارُّ وَالْمَجْرُورُ خَبَرٌ مُقَدَّمٌ۔',
      },
      {
        wordIndex: 2,
        arabicWord: 'مَّرَضٌ',
        urduMeaning: 'بیماری ہے',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'م ر ض',
        morphForm: 'اسم نکرہ — مفرد مذکر مرفوع',
        grammaticalCase: 'مرفوع',
        irabRole: 'مبتدا مؤخر',
        governingElement: 'فِي قُلُوبِهِم',
        notes: 'مرض — مادہ م ر ض: بیماری۔ یہاں روحانی بیماری مراد ہے — نفاق، شک، حسد۔ نکرہ تنکیر تعظیم: کتنی بڑی بیماری!',
        classicalExplanation: 'مَرَضٌ: مُبْتَدَأٌ مُؤَخَّرٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ الظَّاهِرَةُ۔',
      },
      {
        wordIndex: 3,
        arabicWord: 'فَزَادَهُمُ',
        urduMeaning: 'تو اللہ نے انہیں بڑھا دیا',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ز ي د',
        morphForm: 'فاء عطف + فعل ماضی + ہم مفعول',
        grammaticalCase: null,
        irabRole: 'معطوف علی الجملة السابقة',
        governingElement: null,
        notes: 'فزادہم — فاء: سببیہ یا عاطفہ۔ زاد: مادہ ز ی د: بڑھانا، اضافہ کرنا۔ ہم مفعول اول۔ جو نفاق اختیار کرتا ہے، اللہ اسے مزید بیماری میں ڈال دیتے ہیں — یہ سنت اللہ ہے۔',
        classicalExplanation: 'فَزَادَهُمُ: الْفَاءُ سَبَبِيَّةٌ، زَادَ: فِعْلٌ مَاضٍ وَهُمْ ضَمِيرُ الْمَفْعُولِ الْأَوَّلِ۔',
      },
      {
        wordIndex: 4,
        arabicWord: 'اللَّهُ',
        urduMeaning: 'اللہ نے',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'لفظ جلالہ — مرفوع',
        grammaticalCase: 'مرفوع',
        irabRole: 'فاعل زادَ',
        governingElement: 'فَزَادَ',
        notes: 'اللہ — فاعل۔ یعنی یہ بیماری کا بڑھنا اللہ کی طرف سے ہے — کیونکہ انہوں نے خود نفاق کو اختیار کیا۔',
        classicalExplanation: 'اللَّهُ: فَاعِلُ زَادَ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ الظَّاهِرَةُ۔',
      },
      {
        wordIndex: 5,
        arabicWord: 'مَرَضًا',
        urduMeaning: 'بیماری',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'م ر ض',
        morphForm: 'اسم نکرہ — مفرد مذکر منصوب',
        grammaticalCase: 'منصوب',
        irabRole: 'مفعول ثانی لزاد',
        governingElement: 'فَزَادَ',
        notes: 'مرضاً — مفعول ثانی۔ زاد یہاں دو مفعول لے رہا ہے: مفعول اول ہم (انہیں)، مفعول ثانی مرضاً (بیماری)۔ نکرہ تنوین — مزید بیماری۔',
        classicalExplanation: 'مَرَضًا: مَفْعُولٌ ثَانٍ لِزَادَ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ الظَّاهِرَةُ۔',
      },
      {
        wordIndex: 6,
        arabicWord: 'وَلَهُمْ',
        urduMeaning: 'اور ان کے لیے',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'واو عطف + لام جر + ضمیر',
        grammaticalCase: 'مجرور',
        irabRole: 'خبر مقدم',
        governingElement: 'عَذَابٌ',
        notes: 'ولہم — خبر مقدم اور عذاب مبتدا مؤخر۔ دنیا میں بیماری، آخرت میں عذاب — دوہرا نقصان۔',
        classicalExplanation: 'وَلَهُمْ: جَارٌّ وَمَجْرُورٌ خَبَرٌ مُقَدَّمٌ وَعَذَابٌ مُبْتَدَأٌ مُؤَخَّرٌ۔',
      },
      {
        wordIndex: 7,
        arabicWord: 'عَذَابٌ',
        urduMeaning: 'عذاب',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ع ذ ب',
        morphForm: 'اسم نکرہ — مفرد مذکر مرفوع',
        grammaticalCase: 'مرفوع',
        irabRole: 'مبتدا مؤخر',
        governingElement: 'وَلَهُمْ',
        notes: 'عذاب — نکرہ تعظیم۔ اس بار صفت الیم (دردناک) ہے، پچھلی آیت میں عظیم تھی — دو مختلف پہلو بتائے گئے۔',
        classicalExplanation: 'عَذَابٌ: مُبْتَدَأٌ مُؤَخَّرٌ مَرْفُوعٌ۔',
      },
      {
        wordIndex: 8,
        arabicWord: 'أَلِيمٌ',
        urduMeaning: 'دردناک',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'أ ل م',
        morphForm: 'صفت مشبہ — مفرد مذکر مرفوع',
        grammaticalCase: 'مرفوع',
        irabRole: 'نعت لعذاب',
        governingElement: 'عَذَابٌ',
        notes: 'الیم — مادہ ا ل م: درد۔ صفت مشبہ: دردناک، تکلیف دہ۔ الیم اور عظیم میں فرق: عظیم شدت بتاتا ہے، الیم تکلیف بتاتا ہے۔',
        classicalExplanation: 'أَلِيمٌ: نَعْتٌ لِعَذَابٌ مَرْفُوعٌ تَبَعًا لِمَنْعُوتِهِ۔',
      },
      {
        wordIndex: 9,
        arabicWord: 'بِمَا',
        urduMeaning: 'اس لیے کہ',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف جر سببیہ (ب) + اسم موصول (مَا)',
        grammaticalCase: null,
        irabRole: 'متعلق بالعذاب — سبب بیان',
        governingElement: 'عَذَابٌ أَلِيمٌ',
        notes: 'بما — ب سببیہ + ما مصدریہ یا موصولہ۔ سبب عذاب: جھوٹ بولنا۔ یعنی عذاب اس لیے ہے کہ وہ جھوٹ بولتے تھے۔',
        classicalExplanation: 'بِمَا: الْبَاءُ سَبَبِيَّةٌ وَمَا مَصْدَرِيَّةٌ أَوْ مَوْصُولَةٌ۔',
      },
      {
        wordIndex: 10,
        arabicWord: 'كَانُوا',
        urduMeaning: 'وہ تھے',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ك و ن',
        morphForm: 'فعل ماضی ناقص + واو اسم',
        grammaticalCase: null,
        irabRole: 'فعل ناقص — اسم واو',
        governingElement: 'يَكْذِبُونَ',
        notes: 'کانوا — کان: فعل ناقص ماضی مادہ ک و ن۔ واو: اسم کان۔ خبر آگے یکذبون ہے۔ استمرار کا مفہوم دیتا ہے: وہ مسلسل جھوٹ بولتے رہتے تھے۔',
        classicalExplanation: 'كَانُوا: فِعْلٌ مَاضٍ نَاقِصٌ وَالْوَاوُ اسْمُهُ۔',
      },
      {
        wordIndex: 11,
        arabicWord: 'يَكْذِبُونَ',
        urduMeaning: 'جھوٹ بولتے تھے',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ك ذ ب',
        morphForm: 'فعل مضارع — جمع مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'خبر کان',
        governingElement: 'كَانُوا',
        notes: 'یکذبون — مادہ ک ذ ب: جھوٹ بولنا۔ کذب: دانستہ جھوٹ۔ منافقوں کا جھوٹ: زبان سے ایمان کا اظہار اور دل سے انکار — یہی ان کا جرم ہے۔',
        classicalExplanation: 'يَكْذِبُونَ: خَبَرُ كَانَ مَرْفُوعٌ بِثُبُوتِ النُّونِ وَالْجُمْلَةُ صِلَةُ مَا الْمَصْدَرِيَّةِ۔',
      },
    ],

    /* ── آیت ١١: وَإِذَا قِيلَ لَهُمْ لَا تُفْسِدُوا فِي الْأَرْضِ قَالُوا إِنَّمَا نَحْنُ مُصْلِحُونَ ── */
    11: [
      {
        wordIndex: 0,
        arabicWord: 'وَإِذَا',
        urduMeaning: 'اور جب',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'واو عطف/استئناف + إذا ظرف شرط',
        grammaticalCase: null,
        irabRole: 'ظرف شرط — ظرف زمان',
        governingElement: 'قَالُوا',
        notes: 'وإذا — واو + إذا: ظرف شرط (غیر جازم)۔ شرط: قیل لہم لا تفسدوا۔ جواب شرط: قالوا إنما نحن مصلحون۔',
        classicalExplanation: 'وَإِذَا: الْوَاوُ اسْتِئْنَافِيَّةٌ وَإِذَا ظَرْفٌ لِمَا يُسْتَقْبَلُ مِنَ الزَّمَانِ خَافِضٌ لِشَرْطِهِ مَنْصُوبٌ بِجَوَابِهِ۔',
      },
      {
        wordIndex: 1,
        arabicWord: 'قِيلَ',
        urduMeaning: 'کہا گیا',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ق و ل',
        morphForm: 'فعل ماضی مجہول — مفرد',
        grammaticalCase: null,
        irabRole: 'فعل شرط — مجہول',
        governingElement: 'إِذَا',
        notes: 'قیل — ماضی مجہول مادہ ق و ل۔ فاعل نامعلوم یا عام ہے: جب بھی کہا جاتا ہے — علماء، مومنین، یا کوئی بھی ناصح۔',
        classicalExplanation: 'قِيلَ: فِعْلُ الشَّرْطِ فِعْلٌ مَاضٍ مَبْنِيٌّ لِلْمَجْهُولِ وَنَائِبُ فَاعِلِهِ الْجُمْلَةُ۔',
      },
      {
        wordIndex: 2,
        arabicWord: 'لَهُمْ',
        urduMeaning: 'انہیں',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'لام جر + ضمیر جمع مذکر غائب',
        grammaticalCase: 'مجرور',
        irabRole: 'متعلق بقیل — مخاطب',
        governingElement: 'قِيلَ',
        notes: 'لہم — ل: حرف جر۔ ہم: ضمیر۔ منافقین کو مخاطب کیا جاتا ہے۔',
        classicalExplanation: 'لَهُمْ: جَارٌّ وَمَجْرُورٌ مُتَعَلِّقٌ بِقِيلَ۔',
      },
      {
        wordIndex: 3,
        arabicWord: 'لَا',
        urduMeaning: 'نہ کرو',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'لا ناہیہ — حرف جزم',
        grammaticalCase: null,
        irabRole: 'ناہیہ جازمہ',
        governingElement: 'تُفْسِدُوا',
        notes: 'لا — ناہیہ: جمع مضارع کو مجزوم کرتی ہے، نہی (منع) کا مفہوم دیتی ہے۔',
        classicalExplanation: 'لَا: نَاهِيَةٌ جَازِمَةٌ۔',
      },
      {
        wordIndex: 4,
        arabicWord: 'تُفْسِدُوا',
        urduMeaning: 'فساد نہ پھیلاؤ',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ف س د',
        morphForm: 'فعل مضارع مجزوم باب افعال — جمع مذکر مخاطب',
        grammaticalCase: 'مجزوم',
        irabRole: 'مجزوم بلا ناہیہ',
        governingElement: 'لَا',
        notes: 'تفسدوا — باب افعال، مادہ ف س د: فساد پھیلانا، خرابی کرنا۔ نون حذف بوجہ جزم۔ فساد کی اقسام: جھوٹ، نفاق، قتل، اختلاف — یہ سب منافقین کر رہے تھے۔',
        classicalExplanation: 'تُفْسِدُوا: فِعْلٌ مُضَارِعٌ مَجْزُومٌ بِلَا وَعَلَامَةُ جَزْمِهِ حَذْفُ النُّونِ۔',
      },
      {
        wordIndex: 5,
        arabicWord: 'فِي',
        urduMeaning: 'میں',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف جر ظرفیہ',
        grammaticalCase: null,
        irabRole: 'متعلق بتفسدوا',
        governingElement: 'تُفْسِدُوا',
        notes: 'فی — حرف جر ظرفیہ۔ الارض میں فساد: زمین پر جہاں کہیں بھی وہ موجود ہوں۔',
        classicalExplanation: 'فِي: حَرْفُ جَرٍّ مُتَعَلِّقٌ بِتُفْسِدُوا۔',
      },
      {
        wordIndex: 6,
        arabicWord: 'الْأَرْضِ',
        urduMeaning: 'زمین',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'أ ر ض',
        morphForm: 'اسم معرفہ — مفرد مؤنث مجرور',
        grammaticalCase: 'مجرور',
        irabRole: 'مجرور بفی',
        governingElement: 'فِي',
        notes: 'الارض — مادہ ا ر ض: زمین۔ الارض معرفہ سے مراد پوری زمین ہے — جہاں کہیں بھی وہ رہیں فساد نہ کریں۔',
        classicalExplanation: 'الْأَرْضِ: مَجْرُورٌ بِفِي وَعَلَامَةُ جَرِّهِ الْكَسْرَةُ الظَّاهِرَةُ۔',
      },
      {
        wordIndex: 7,
        arabicWord: 'قَالُوا',
        urduMeaning: 'انہوں نے کہا',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ق و ل',
        morphForm: 'فعل ماضی + واو فاعل',
        grammaticalCase: null,
        irabRole: 'جواب شرط (إذا)',
        governingElement: 'إِذَا',
        notes: 'قالوا — جواب شرط: جب انہیں کہا گیا تو انہوں نے کہا۔ واو: فاعل جمع مذکر۔',
        classicalExplanation: 'قَالُوا: فِعْلٌ مَاضٍ جَوَابُ الشَّرْطِ وَالْوَاوُ فَاعِلٌ۔',
      },
      {
        wordIndex: 8,
        arabicWord: 'إِنَّمَا',
        urduMeaning: 'بس ہم تو',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'إن + ما کافہ — حرف حصر',
        grammaticalCase: null,
        irabRole: 'حصر و قصر',
        governingElement: null,
        notes: 'إنما — إن + ما کافہ (ما نے إن کا عمل کالعدم کر دیا)۔ حصر کا فائدہ دیتا ہے: صرف اور صرف ہم اصلاح کرنے والے ہیں — اعتراف جرم نہیں بلکہ فخر سے انکار!',
        classicalExplanation: 'إِنَّمَا: إِنَّ كُفَّتْ بِمَا فَأَفَادَتِ الْحَصْرَ وَالتَّوْكِيدَ۔',
      },
      {
        wordIndex: 9,
        arabicWord: 'نَحْنُ',
        urduMeaning: 'ہم',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'ضمیر منفصل — جمع متکلم',
        grammaticalCase: 'مرفوع',
        irabRole: 'مبتدا',
        governingElement: null,
        notes: 'نحن — ضمیر منفصل جمع متکلم۔ إنما کے بعد مبتدا ہے کیونکہ ما نے إن کا عمل باطل کر دیا۔',
        classicalExplanation: 'نَحْنُ: مُبْتَدَأٌ مَرْفُوعٌ لِأَنَّ مَا كَفَّتْ إِنَّ عَنِ الْعَمَلِ۔',
      },
      {
        wordIndex: 10,
        arabicWord: 'مُصْلِحُونَ',
        urduMeaning: 'اصلاح کرنے والے',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ص ل ح',
        morphForm: 'اسم فاعل باب افعال — جمع مذکر سالم مرفوع',
        grammaticalCase: 'مرفوع',
        irabRole: 'خبر نحن',
        governingElement: 'نَحْنُ',
        notes: 'مصلحون — مادہ ص ل ح: اصلاح کرنا۔ اسم فاعل باب افعال۔ منافقین کا دعویٰ: ہم فسادی نہیں، مصلح ہیں — صریح جھوٹ جو اگلی آیت میں رد ہوتا ہے۔',
        classicalExplanation: 'مُصْلِحُونَ: خَبَرُ الْمُبْتَدَأِ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الْوَاوُ لِأَنَّهُ جَمْعُ مُذَكَّرٍ سَالِمٌ۔',
      },
    ],

    /* ── آیت ١٢: أَلَا إِنَّهُمْ هُمُ الْمُفْسِدُونَ وَلَٰكِن لَّا يَشْعُرُونَ ── */
    12: [
      {
        wordIndex: 0,
        arabicWord: 'أَلَا',
        urduMeaning: 'آگاہ رہو! خبردار!',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف تنبیہ و استفتاح',
        grammaticalCase: null,
        irabRole: 'حرف تنبیہ — توجہ دلانا',
        governingElement: null,
        notes: 'ألا — حرف تنبیہ: سننے والے کو آگاہ کرنا کہ آگے اہم بات آ رہی ہے۔ پچھلی آیت میں منافقوں کے دعوے کا یہاں اللہ رد فرما رہے ہیں۔',
        classicalExplanation: 'أَلَا: حَرْفُ تَنْبِيهٍ وَاسْتِفْتَاحٍ لَا مَحَلَّ لَهُ مِنَ الْإِعْرَابِ۔',
      },
      {
        wordIndex: 1,
        arabicWord: 'إِنَّهُمْ',
        urduMeaning: 'بے شک وہی',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'إن + ہُمْ (اسم إن ضمیر متصل)',
        grammaticalCase: 'منصوب (محلاً)',
        irabRole: 'إن تاکید + اسم إن',
        governingElement: 'إِنَّ',
        notes: 'إنہم — إن: تاکید۔ ہم: اسم إن (ضمیر متصل جمع مذکر غائب)۔ اللہ تاکید کے ساتھ فیصلہ دے رہے ہیں۔',
        classicalExplanation: 'إِنَّهُمْ: إِنَّ حَرْفٌ مُشَبَّهٌ بِالْفِعْلِ وَهُمْ ضَمِيرٌ مُتَّصِلٌ اسْمُهَا مَنْصُوبٌ۔',
      },
      {
        wordIndex: 2,
        arabicWord: 'هُمُ',
        urduMeaning: 'وہی ہیں',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'ضمیر منفصل — جمع مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'ضمیر فصل — قصر و حصر',
        governingElement: null,
        notes: 'ہمُ — ضمیر فصل: حصر کا فائدہ دیتا ہے۔ فسادی صرف اور صرف یہی ہیں — نہ مومنین، نہ کوئی اور۔',
        classicalExplanation: 'هُمُ: ضَمِيرُ فَصْلٍ لِلتَّوْكِيدِ وَالْحَصْرِ لَا مَحَلَّ لَهُ مِنَ الْإِعْرَابِ۔',
      },
      {
        wordIndex: 3,
        arabicWord: 'الْمُفْسِدُونَ',
        urduMeaning: 'فساد پھیلانے والے',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ف س د',
        morphForm: 'اسم فاعل باب افعال — جمع مذکر سالم معرفہ مرفوع',
        grammaticalCase: 'مرفوع',
        irabRole: 'خبر إن',
        governingElement: 'إِنَّهُمْ',
        notes: 'المفسدون — مادہ ف س د۔ ال تعریف کے ساتھ: وہی اصل فسادی ہیں۔ پچھلی آیت میں منافقوں نے مفسد سے انکار کیا — اللہ نے یہاں ثابت کر دیا۔',
        classicalExplanation: 'الْمُفْسِدُونَ: خَبَرُ إِنَّ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الْوَاوُ لِأَنَّهُ جَمْعُ مُذَكَّرٍ سَالِمٌ۔',
      },
      {
        wordIndex: 4,
        arabicWord: 'وَلَٰكِن',
        urduMeaning: 'لیکن',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف استدراک',
        grammaticalCase: null,
        irabRole: 'استدراک — تصحیح سابق کلام',
        governingElement: null,
        notes: 'ولکن — واو + لکن: حرف استدراک۔ یہاں لکن مخففہ ہے (بغیر تشدید)، اس لیے عمل نہیں کرتی، بس استدراک کا معنی دیتی ہے۔',
        classicalExplanation: 'وَلَكِنْ: الْوَاوُ عَاطِفَةٌ وَلَكِنْ حَرْفُ اسْتِدْرَاكٍ مُخَفَّفَةٌ لَا عَمَلَ لَهَا۔',
      },
      {
        wordIndex: 5,
        arabicWord: 'لَّا',
        urduMeaning: 'نہیں',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف نفی',
        grammaticalCase: null,
        irabRole: 'نافیہ للجملة الفعلیة',
        governingElement: 'يَشْعُرُونَ',
        notes: 'لا — نافیہ۔ لا یشعرون: وہ سمجھتے نہیں۔',
        classicalExplanation: 'لَا: نَافِيَةٌ لَا عَمَلَ لَهَا۔',
      },
      {
        wordIndex: 6,
        arabicWord: 'يَشْعُرُونَ',
        urduMeaning: 'سمجھتے ہیں',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ش ع ر',
        morphForm: 'فعل مضارع — جمع مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'خبر مبتدا محذوف — استئنافیہ',
        governingElement: null,
        notes: 'یشعرون — وہ محسوس نہیں کرتے کہ وہ فسادی ہیں۔ یہ ان کی سب سے بڑی تراژیڈی ہے — نہ صرف برائی کرتے ہیں بلکہ برائی کو نیکی سمجھتے ہیں۔',
        classicalExplanation: 'يَشْعُرُونَ: فِعْلٌ مُضَارِعٌ مَرْفُوعٌ وَجُمْلَةُ لَا يَشْعُرُونَ اسْتِئْنَافِيَّةٌ۔',
      },
    ],

    /* ── آیت ١٣: وَإِذَا قِيلَ لَهُمْ آمِنُوا كَمَا آمَنَ النَّاسُ قَالُوا أَنُؤْمِنُ كَمَا آمَنَ السُّفَهَاءُ أَلَا إِنَّهُمْ هُمُ السُّفَهَاءُ وَلَٰكِن لَّا يَعْلَمُونَ ── */
    13: [
      {
        wordIndex: 0,
        arabicWord: 'وَإِذَا',
        urduMeaning: 'اور جب',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'واو عطف + إذا ظرف شرط',
        grammaticalCase: null,
        irabRole: 'ظرف شرط — شرطیہ جملہ',
        governingElement: 'قَالُوا',
        notes: 'وإذا — آیت ١١ کی طرح دوسری صورت بیان ہو رہی ہے — جب ایمان لانے کو کہا جائے تو کیا جواب دیتے ہیں۔',
        classicalExplanation: 'وَإِذَا: الْوَاوُ عَاطِفَةٌ وَإِذَا ظَرْفُ شَرْطٍ۔',
      },
      {
        wordIndex: 1,
        arabicWord: 'قِيلَ',
        urduMeaning: 'کہا گیا',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ق و ل',
        morphForm: 'فعل ماضی مجہول',
        grammaticalCase: null,
        irabRole: 'فعل شرط',
        governingElement: 'إِذَا',
        notes: 'قیل — مجہول، جیسا آیت ١١ میں تھا۔ ہر بار جب بھی کوئی انہیں ایمان کی دعوت دے۔',
        classicalExplanation: 'قِيلَ: فِعْلُ الشَّرْطِ مَاضٍ مَبْنِيٌّ لِلْمَجْهُولِ۔',
      },
      {
        wordIndex: 2,
        arabicWord: 'لَهُمْ',
        urduMeaning: 'انہیں',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'لام جر + ضمیر',
        grammaticalCase: 'مجرور',
        irabRole: 'متعلق بقیل',
        governingElement: 'قِيلَ',
        notes: 'لہم — منافقین کو دعوت ایمان دی جا رہی ہے۔',
        classicalExplanation: 'لَهُمْ: جَارٌّ وَمَجْرُورٌ مُتَعَلِّقٌ بِقِيلَ۔',
      },
      {
        wordIndex: 3,
        arabicWord: 'آمِنُوا',
        urduMeaning: 'ایمان لے آؤ',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'أ م ن',
        morphForm: 'فعل امر باب افعال — جمع مذکر مخاطب',
        grammaticalCase: null,
        irabRole: 'مقول القول — فعل امر',
        governingElement: 'قِيلَ',
        notes: 'آمنوا — امر جمع مذکر، مادہ ا م ن۔ ایمان لانے کا حکم جو مومنین نے منافقین کو دیا۔ واو: فاعل۔',
        classicalExplanation: 'آمِنُوا: فِعْلُ أَمْرٍ مَبْنِيٌّ عَلَى حَذْفِ النُّونِ وَالْوَاوُ فَاعِلٌ۔',
      },
      {
        wordIndex: 4,
        arabicWord: 'كَمَا',
        urduMeaning: 'جیسے کہ',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'کاف تشبیہ + ما مصدریہ/کافہ',
        grammaticalCase: null,
        irabRole: 'تشبیہ — متعلق بآمنوا',
        governingElement: 'آمِنُوا',
        notes: 'کما — ک تشبیہ + ما مصدریہ۔ یعنی اس طرح ایمان لاؤ جیسے عام مسلمانوں نے ایمان لایا — سادہ، مخلص، بغیر نفاق کے۔',
        classicalExplanation: 'كَمَا: الْكَافُ حَرْفُ تَشْبِيهٍ وَجَرٍّ وَمَا مَصْدَرِيَّةٌ وَالْجَارُّ وَالْمَجْرُورُ نَعْتٌ لِمَصْدَرٍ مَحْذُوفٍ۔',
      },
      {
        wordIndex: 5,
        arabicWord: 'آمَنَ',
        urduMeaning: 'ایمان لائے',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'أ م ن',
        morphForm: 'فعل ماضی — مفرد مذکر غائب',
        grammaticalCase: null,
        irabRole: 'صلہ ما مصدریہ',
        governingElement: 'كَمَا',
        notes: 'آمن — مفرد غائب۔ فاعل: الناس۔ جیسے عام لوگوں نے ایمان قبول کیا۔',
        classicalExplanation: 'آمَنَ: صِلَةُ مَا الْمَصْدَرِيَّةِ فِعْلٌ مَاضٍ۔',
      },
      {
        wordIndex: 6,
        arabicWord: 'النَّاسُ',
        urduMeaning: 'لوگوں نے',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ن و س',
        morphForm: 'جمع معرفہ — مرفوع',
        grammaticalCase: 'مرفوع',
        irabRole: 'فاعل آمَنَ',
        governingElement: 'آمَنَ',
        notes: 'الناس — مومنین مراد ہیں جن کے ایمان کو نمونہ بتایا جا رہا ہے: صحابہ کرامؓ جنہوں نے مخلصانہ ایمان قبول کیا۔',
        classicalExplanation: 'النَّاسُ: فَاعِلُ آمَنَ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ الظَّاهِرَةُ۔',
      },
      {
        wordIndex: 7,
        arabicWord: 'قَالُوا',
        urduMeaning: 'انہوں نے کہا',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ق و ل',
        morphForm: 'فعل ماضی + واو فاعل',
        grammaticalCase: null,
        irabRole: 'جواب شرط',
        governingElement: 'إِذَا',
        notes: 'قالوا — جواب شرط۔ منافقین کا جواب انتہائی تکبر آمیز ہے۔',
        classicalExplanation: 'قَالُوا: فِعْلٌ مَاضٍ جَوَابُ الشَّرْطِ وَالْوَاوُ فَاعِلٌ۔',
      },
      {
        wordIndex: 8,
        arabicWord: 'أَنُؤْمِنُ',
        urduMeaning: 'کیا ہم ایمان لائیں',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'أ م ن',
        morphForm: 'ہمزہ استفہام انکاری + فعل مضارع باب افعال جمع متکلم',
        grammaticalCase: 'مرفوع',
        irabRole: 'مقول القول — استفہام انکار',
        governingElement: 'قَالُوا',
        notes: 'أنؤمن — ہمزہ استنکاری (ہمزہ انکار): ہم ایمان لائیں؟ ہرگز نہیں! — تکبر اور حقارت سے انکار۔ نون: ضمیر فاعل جمع متکلم۔',
        classicalExplanation: 'أَنُؤْمِنُ: الْهَمْزَةُ لِلِاسْتِفْهَامِ الْإِنْكَارِيِّ وَنُؤْمِنُ فِعْلٌ مُضَارِعٌ مَرْفُوعٌ۔',
      },
      {
        wordIndex: 9,
        arabicWord: 'كَمَا',
        urduMeaning: 'جیسے کہ',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'کاف تشبیہ + ما مصدریہ',
        grammaticalCase: null,
        irabRole: 'تشبیہ تحقیری',
        governingElement: 'أَنُؤْمِنُ',
        notes: 'کما — یہاں تحقیر کے لیے: کیا ہم ایمان لائیں جیسے ان بے وقوفوں نے لایا؟ انہوں نے مومنوں کو سفہاء (بے وقوف) کہا۔',
        classicalExplanation: 'كَمَا: كَافُ التَّشْبِيهِ مُتَعَلِّقٌ بِنُؤْمِنُ تَحْقِيرًا لِإِيمَانِ الْمُؤْمِنِينَ۔',
      },
      {
        wordIndex: 10,
        arabicWord: 'آمَنَ',
        urduMeaning: 'ایمان لائے',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'أ م ن',
        morphForm: 'فعل ماضی — مفرد مذکر غائب',
        grammaticalCase: null,
        irabRole: 'صلہ ما مصدریہ',
        governingElement: 'كَمَا',
        notes: 'آمن — فاعل: السفہاء (منافقین کی نظر میں مومن)۔',
        classicalExplanation: 'آمَنَ: صِلَةُ مَا الْمَصْدَرِيَّةِ۔',
      },
      {
        wordIndex: 11,
        arabicWord: 'السُّفَهَاءُ',
        urduMeaning: 'بے وقوف',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'س ف ه',
        morphForm: 'جمع مکسر معرفہ — مرفوع',
        grammaticalCase: 'مرفوع',
        irabRole: 'فاعل آمَنَ',
        governingElement: 'آمَنَ',
        notes: 'السفہاء — مادہ س ف ہ: سبکی، کم عقلی۔ منافقین نے مومنوں کو سفہاء کہا — مگر اللہ نے اگلے جملے میں بتایا کہ سفیہ اصل میں کون ہیں۔',
        classicalExplanation: 'السُّفَهَاءُ: فَاعِلُ آمَنَ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ الظَّاهِرَةُ۔',
      },
      {
        wordIndex: 12,
        arabicWord: 'أَلَا',
        urduMeaning: 'آگاہ ہو جاؤ',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف تنبیہ',
        grammaticalCase: null,
        irabRole: 'تنبیہ — اللہ کا رد',
        governingElement: null,
        notes: 'ألا — پھر حرف تنبیہ۔ آیت ١٢ جیسا: اب اللہ فیصلہ دے رہے ہیں — سفیہ کون ہیں؟',
        classicalExplanation: 'أَلَا: حَرْفُ تَنْبِيهٍ لَا مَحَلَّ لَهُ۔',
      },
      {
        wordIndex: 13,
        arabicWord: 'إِنَّهُمْ',
        urduMeaning: 'بے شک وہی',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'إن + ہُمْ اسم',
        grammaticalCase: 'منصوب',
        irabRole: 'إن تاکید + اسم',
        governingElement: 'إِنَّ',
        notes: 'إنہم — آیت ١٢ جیسا ہی ساختی اعراب۔ اللہ تاکیداً فرما رہے ہیں۔',
        classicalExplanation: 'إِنَّهُمْ: إِنَّ وَاسْمُهَا مَنْصُوبٌ۔',
      },
      {
        wordIndex: 14,
        arabicWord: 'هُمُ',
        urduMeaning: 'وہی',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'ضمیر فصل',
        grammaticalCase: 'مرفوع',
        irabRole: 'ضمیر فصل — حصر',
        governingElement: null,
        notes: 'ہمُ — ضمیر فصل: یہی لوگ اصل سفہاء ہیں — نہ کہ مومنین۔',
        classicalExplanation: 'هُمُ: ضَمِيرُ فَصْلٍ لِلتَّوْكِيدِ وَالْحَصْرِ۔',
      },
      {
        wordIndex: 15,
        arabicWord: 'السُّفَهَاءُ',
        urduMeaning: 'بے وقوف',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'س ف ه',
        morphForm: 'جمع مکسر معرفہ مرفوع',
        grammaticalCase: 'مرفوع',
        irabRole: 'خبر إن',
        governingElement: 'إِنَّهُمْ',
        notes: 'السفہاء — منافقین کو اللہ نے السفہاء کہا۔ ال عہد: وہی سفہاء جو انہوں نے مومنوں کو کہا — وہ لفظ واپس انہی پر لوٹ آیا۔',
        classicalExplanation: 'السُّفَهَاءُ: خَبَرُ إِنَّ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ الظَّاهِرَةُ۔',
      },
      {
        wordIndex: 16,
        arabicWord: 'وَلَٰكِن',
        urduMeaning: 'لیکن',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'واو + لکن مخففہ — حرف استدراک',
        grammaticalCase: null,
        irabRole: 'استدراک',
        governingElement: null,
        notes: 'ولکن — آیت ١٢ جیسا: لیکن انہیں خبر نہیں۔',
        classicalExplanation: 'وَلَكِنْ: حَرْفُ اسْتِدْرَاكٍ مُخَفَّفٌ۔',
      },
      {
        wordIndex: 17,
        arabicWord: 'لَّا',
        urduMeaning: 'نہیں',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف نفی',
        grammaticalCase: null,
        irabRole: 'نافیہ',
        governingElement: 'يَعْلَمُونَ',
        notes: 'لا — نافیہ۔',
        classicalExplanation: 'لَا: نَافِيَةٌ۔',
      },
      {
        wordIndex: 18,
        arabicWord: 'يَعْلَمُونَ',
        urduMeaning: 'جانتے ہیں',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ع ل م',
        morphForm: 'فعل مضارع — جمع مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'خبر — جملہ استئنافیہ',
        governingElement: null,
        notes: 'یعلمون — مادہ ع ل م: جاننا، علم ہونا۔ آیت ١٢ میں لا یشعرون تھا (محسوس نہیں کرتے)، یہاں لا یعلمون (جانتے نہیں)۔ شعور (احساس) سے بڑھ کر علم (جاننا) سے بھی محروم ہیں۔',
        classicalExplanation: 'يَعْلَمُونَ: فِعْلٌ مُضَارِعٌ مَرْفُوعٌ وَجُمْلَةُ لَا يَعْلَمُونَ اسْتِئْنَافِيَّةٌ۔',
      },
    ],

    /* ── آیت ١٤ ── */
    14: [
      {
        wordIndex: 0,
        arabicWord: 'وَإِذَا',
        urduMeaning: 'اور جب',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'واو عطف + إذا ظرف شرط',
        grammaticalCase: null,
        irabRole: 'ظرف شرط',
        governingElement: 'قَالُوا',
        notes: 'وإذا — تیسری صورت: جب مومنوں سے ملتے ہیں تو ایمان کا اظہار کرتے ہیں۔',
        classicalExplanation: 'وَإِذَا: الْوَاوُ عَاطِفَةٌ وَإِذَا ظَرْفٌ۔',
      },
      {
        wordIndex: 1,
        arabicWord: 'لَقُوا',
        urduMeaning: 'ملے',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ل ق ي',
        morphForm: 'فعل ماضی + واو فاعل',
        grammaticalCase: null,
        irabRole: 'فعل شرط',
        governingElement: 'إِذَا',
        notes: 'لقوا — مادہ ل ق ی: ملنا۔ واو: فاعل جمع مذکر غائب — منافقین۔',
        classicalExplanation: 'لَقُوا: فِعْلُ الشَّرْطِ مَاضٍ وَالْوَاوُ فَاعِلٌ۔',
      },
      {
        wordIndex: 2,
        arabicWord: 'الَّذِينَ',
        urduMeaning: 'جو',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'اسم موصول جمع مذکر — منصوب',
        grammaticalCase: 'منصوب',
        irabRole: 'مفعول به لقوا',
        governingElement: 'لَقُوا',
        notes: 'الذین — اسم موصول مفعول به۔ صلہ: آمنوا — یعنی مومنین صحابہ۔',
        classicalExplanation: 'الَّذِينَ: مَفْعُولٌ بِهِ مَنْصُوبٌ مَحَلًّا۔',
      },
      {
        wordIndex: 3,
        arabicWord: 'آمَنُوا',
        urduMeaning: 'ایمان لائے',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'أ م ن',
        morphForm: 'فعل ماضی + واو فاعل',
        grammaticalCase: null,
        irabRole: 'صلہ موصول',
        governingElement: 'الَّذِينَ',
        notes: 'آمنوا — مومنین کی پہچان: وہ جو ایمان لائے — صحابہ کرامؓ مراد۔',
        classicalExplanation: 'آمَنُوا: صِلَةُ الْمَوْصُولِ۔',
      },
      {
        wordIndex: 4,
        arabicWord: 'قَالُوا',
        urduMeaning: 'کہا',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ق و ل',
        morphForm: 'فعل ماضی + واو فاعل',
        grammaticalCase: null,
        irabRole: 'جواب شرط اول',
        governingElement: 'إِذَا',
        notes: 'قالوا — جواب شرط: مومنوں سے ملتے وقت ایمان کا اظہار۔',
        classicalExplanation: 'قَالُوا: جَوَابُ الشَّرْطِ۔',
      },
      {
        wordIndex: 5,
        arabicWord: 'آمَنَّا',
        urduMeaning: 'ہم ایمان لائے',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'أ م ن',
        morphForm: 'فعل ماضی + نا فاعل',
        grammaticalCase: null,
        irabRole: 'مقول القول',
        governingElement: 'قَالُوا',
        notes: 'آمنا — مومنوں کے سامنے ایمان کا دعویٰ — یہ دوغلاپن ہے: مومنوں کے سامنے مومن، کافروں کے سامنے کافر۔',
        classicalExplanation: 'آمَنَّا: مَقُولُ الْقَوْلِ فِعْلٌ مَاضٍ وَنَا ضَمِيرُ الْفَاعِلِ۔',
      },
      {
        wordIndex: 6,
        arabicWord: 'وَإِذَا',
        urduMeaning: 'اور جب',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'واو عطف + إذا ظرف شرط',
        grammaticalCase: null,
        irabRole: 'ظرف شرط ثانی',
        governingElement: 'قَالُوا (دوسرا)',
        notes: 'وإذا — دوسری شرط: شیطانوں کے پاس جانے کا واقعہ۔',
        classicalExplanation: 'وَإِذَا: عَطْفٌ عَلَى الشَّرْطِ الْأَوَّلِ۔',
      },
      {
        wordIndex: 7,
        arabicWord: 'خَلَوْا',
        urduMeaning: 'تنہا ہوئے / گئے',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'خ ل و',
        morphForm: 'فعل ماضی + واو فاعل',
        grammaticalCase: null,
        irabRole: 'فعل شرط ثانی',
        governingElement: 'إِذَا (ثانی)',
        notes: 'خلوا — مادہ خ ل و: خلوت، تنہائی۔ جب اپنے شیطانی سرداروں کے پاس تنہا جاتے ہیں — اپنے اصل لوگوں میں۔',
        classicalExplanation: 'خَلَوْا: فِعْلُ الشَّرْطِ الثَّانِي مَاضٍ وَالْوَاوُ فَاعِلٌ۔',
      },
      {
        wordIndex: 8,
        arabicWord: 'إِلَى',
        urduMeaning: 'کی طرف',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف جر — انتہائے غایت',
        grammaticalCase: null,
        irabRole: 'متعلق بخلوا',
        governingElement: 'خَلَوْا',
        notes: 'إلی — إلی کا یہاں معنی: مع (کے ساتھ) یا کی طرف گئے — یعنی اپنے کفار سرداروں کے پاس۔',
        classicalExplanation: 'إِلَى: حَرْفُ جَرٍّ مُتَعَلِّقٌ بِخَلَوْا۔',
      },
      {
        wordIndex: 9,
        arabicWord: 'شَيَاطِينِهِمْ',
        urduMeaning: 'اپنے شیطانوں کے',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ش ي ط',
        morphForm: 'جمع مکسر مجرور (مضاف) + ضمیر',
        grammaticalCase: 'مجرور',
        irabRole: 'مجرور بإلی',
        governingElement: 'إِلَى',
        notes: 'شیاطینہم — شیطان کی جمع شیاطین۔ مادہ ش ی ط: تمرد، سرکشی۔ یہاں منافقین کے کافر سردار یا یہودی علماء مراد ہیں جو انہیں اسلام کی مخالفت پر اکساتے تھے۔',
        classicalExplanation: 'شَيَاطِينِهِمْ: مَجْرُورٌ بِإِلَى مُضَافٌ إِلَى الضَّمِيرِ۔',
      },
      {
        wordIndex: 10,
        arabicWord: 'قَالُوا',
        urduMeaning: 'انہوں نے کہا',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ق و ل',
        morphForm: 'فعل ماضی + واو فاعل',
        grammaticalCase: null,
        irabRole: 'جواب شرط ثانی',
        governingElement: 'إِذَا (ثانی)',
        notes: 'قالوا — دوسرا جواب شرط: شیطانوں کے ساتھ اپنا اصل چہرہ دکھایا۔',
        classicalExplanation: 'قَالُوا: جَوَابُ الشَّرْطِ الثَّانِي۔',
      },
      {
        wordIndex: 11,
        arabicWord: 'إِنَّا',
        urduMeaning: 'بے شک ہم',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'إن + نا (اسم إن)',
        grammaticalCase: 'منصوب',
        irabRole: 'إن تاکید + اسم',
        governingElement: 'إِنَّ',
        notes: 'إنا — إن + نا۔ مخاطب تاکید سے بتا رہے ہیں: ہم تمہارے ساتھ ہیں — تسلی دے رہے ہیں کہ ہم نے مومنوں کو دھوکہ دیا۔',
        classicalExplanation: 'إِنَّا: إِنَّ وَاسْمُهَا نَا مَنْصُوبٌ۔',
      },
      {
        wordIndex: 12,
        arabicWord: 'مَعَكُمْ',
        urduMeaning: 'تمہارے ساتھ',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'م ع',
        morphForm: 'ظرف مکان (مضاف) + ضمیر جمع مخاطب',
        grammaticalCase: 'مجرور',
        irabRole: 'خبر إن',
        governingElement: 'إِنَّا',
        notes: 'معکم — مع: ظرف مکان / حرف معیت۔ کم: ضمیر مخاطب جمع۔ خبر إن: یعنی ہم دل سے تمہارے ساتھ ہیں — مومنوں کو دھوکہ ہے۔',
        classicalExplanation: 'مَعَكُمْ: خَبَرُ إِنَّ مَنْصُوبٌ وَهُوَ مُضَافٌ وَالضَّمِيرُ مُضَافٌ إِلَيْهِ۔',
      },
      {
        wordIndex: 13,
        arabicWord: 'إِنَّمَا',
        urduMeaning: 'ہم تو بس',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'إن + ما کافہ — حرف حصر',
        grammaticalCase: null,
        irabRole: 'حصر — قصر',
        governingElement: null,
        notes: 'إنما — حصر: ہم تو صرف مذاق کر رہے ہیں — مومنوں کو ایمان لانا بے وقوفی لگتا ہے ان کے نزدیک۔',
        classicalExplanation: 'إِنَّمَا: إِنَّ كُفَّتْ بِمَا لِلْحَصْرِ۔',
      },
      {
        wordIndex: 14,
        arabicWord: 'نَحْنُ',
        urduMeaning: 'ہم',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'ضمیر منفصل جمع متکلم',
        grammaticalCase: 'مرفوع',
        irabRole: 'مبتدا',
        governingElement: null,
        notes: 'نحن — مبتدا (بعد إنما)۔',
        classicalExplanation: 'نَحْنُ: مُبْتَدَأٌ مَرْفُوعٌ۔',
      },
      {
        wordIndex: 15,
        arabicWord: 'مُسْتَهْزِئُونَ',
        urduMeaning: 'مذاق اڑانے والے',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ه ز ء',
        morphForm: 'اسم فاعل باب استفعال — جمع مذکر سالم مرفوع',
        grammaticalCase: 'مرفوع',
        irabRole: 'خبر نحن',
        governingElement: 'نَحْنُ',
        notes: 'مستہزئون — مادہ ہ ز ء: ٹھٹھا، مذاق۔ باب استفعال: خوب مذاق اڑانا۔ یہ ان کا آخری جواز: مومنوں سے ایمان کا اظہار محض مذاق تھا!',
        classicalExplanation: 'مُسْتَهْزِئُونَ: خَبَرُ الْمُبْتَدَأِ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الْوَاوُ لِأَنَّهُ جَمْعُ مُذَكَّرٍ سَالِمٌ۔',
      },
    ],

    /* ── آیت ١٥: اللَّهُ يَسْتَهْزِئُ بِهِمْ وَيَمُدُّهُمْ فِي طُغْيَانِهِمْ يَعْمَهُونَ ── */
    15: [
      {
        wordIndex: 0,
        arabicWord: 'اللَّهُ',
        urduMeaning: 'اللہ',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: null,
        morphForm: 'لفظ جلالہ — مرفوع',
        grammaticalCase: 'مرفوع',
        irabRole: 'مبتدا',
        governingElement: null,
        notes: 'اللہ — مبتدا۔ یہاں اللہ نے منافقین کے مذاق کا جواب دیا: تم مذاق اڑاتے ہو تو اللہ بھی تمہارا مذاق اڑاتے ہیں — یعنی تمہاری سزا ایسی ہوگی کہ تم خود مذاق بن جاؤ گے۔',
        classicalExplanation: 'اللَّهُ: مُبْتَدَأٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ الظَّاهِرَةُ۔',
      },
      {
        wordIndex: 1,
        arabicWord: 'يَسْتَهْزِئُ',
        urduMeaning: 'مذاق اڑاتا ہے',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ه ز ء',
        morphForm: 'فعل مضارع باب استفعال — مفرد مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'خبر المبتدا (اللہ) — جملہ فعلیہ',
        governingElement: 'اللَّهُ',
        notes: 'یستہزئ — اللہ کا استہزاء: مجاز مرسل — مطلب یہ کہ اللہ انہیں ویسا ہی سزا دیں گے جیسا انہوں نے کیا۔ یا یہ کہ ان کی چالوں کو الٹا ان ہی پر ڈال دیتے ہیں۔',
        classicalExplanation: 'يَسْتَهْزِئُ: فِعْلٌ مُضَارِعٌ مَرْفُوعٌ وَجُمْلَةُ يَسْتَهْزِئُ خَبَرُ الْمُبْتَدَأِ۔',
      },
      {
        wordIndex: 2,
        arabicWord: 'بِهِمْ',
        urduMeaning: 'ان کا',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف جر (ب) + ضمیر جمع',
        grammaticalCase: 'مجرور',
        irabRole: 'متعلق بیستہزئ',
        governingElement: 'يَسْتَهْزِئُ',
        notes: 'بہم — ب جر + ہم ضمیر۔ اللہ کا مذاق ان منافقین سے ہے۔',
        classicalExplanation: 'بِهِمْ: جَارٌّ وَمَجْرُورٌ مُتَعَلِّقٌ بِيَسْتَهْزِئُ۔',
      },
      {
        wordIndex: 3,
        arabicWord: 'وَيَمُدُّهُمْ',
        urduMeaning: 'اور انہیں ڈھیل دیتا ہے',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'م د د',
        morphForm: 'واو عطف + فعل مضارع + ہم مفعول',
        grammaticalCase: 'مرفوع',
        irabRole: 'معطوف علی یستہزئ',
        governingElement: 'اللَّهُ',
        notes: 'ویمدہم — مادہ م د د: کھینچنا، ڈھیل دینا۔ اللہ انہیں ڈھیل دیتے ہیں: مزید گناہوں کے لیے موقع دیتے ہیں جب تک آخری سزا نہ آ جائے — یہ استدراج ہے۔',
        classicalExplanation: 'وَيَمُدُّهُمْ: الْوَاوُ عَاطِفَةٌ يَمُدُّهُمْ فِعْلٌ مُضَارِعٌ مَعْطُوفٌ عَلَى يَسْتَهْزِئُ۔',
      },
      {
        wordIndex: 4,
        arabicWord: 'فِي',
        urduMeaning: 'میں',
        wordType: 'حرف',
        typeColor: HARF_C,
        root: null,
        morphForm: 'حرف جر ظرفیہ',
        grammaticalCase: null,
        irabRole: 'متعلق بیمدہم',
        governingElement: 'وَيَمُدُّهُمْ',
        notes: 'فی — ظرفیہ: طغیان میں ڈوبے ہوئے انہیں ڈھیل ملتی رہتی ہے۔',
        classicalExplanation: 'فِي: حَرْفُ جَرٍّ مُتَعَلِّقٌ بِيَمُدُّهُمْ۔',
      },
      {
        wordIndex: 5,
        arabicWord: 'طُغْيَانِهِمْ',
        urduMeaning: 'ان کی سرکشی میں',
        wordType: 'اسم',
        typeColor: ISM_C,
        root: 'ط غ ي',
        morphForm: 'مصدر مجرور (مضاف) + ضمیر',
        grammaticalCase: 'مجرور',
        irabRole: 'مجرور بفی',
        governingElement: 'فِي',
        notes: 'طغیانہم — مادہ ط غ ی: حد سے تجاوز کرنا، سرکشی۔ طغیان: بہت زیادہ سرکشی، کفر اور نفاق میں غرق ہونا۔',
        classicalExplanation: 'طُغْيَانِهِمْ: مَجْرُورٌ بِفِي مُضَافٌ إِلَى ضَمِيرِهِمْ۔',
      },
      {
        wordIndex: 6,
        arabicWord: 'يَعْمَهُونَ',
        urduMeaning: 'بھٹکتے پھرتے ہیں',
        wordType: 'فعل',
        typeColor: FIL_C,
        root: 'ع م ه',
        morphForm: 'فعل مضارع — جمع مذکر غائب',
        grammaticalCase: 'مرفوع',
        irabRole: 'حال — جملہ حالیہ',
        governingElement: 'وَيَمُدُّهُمْ',
        notes: 'یعمہون — مادہ ع م ہ: حیران و سرگردان بھٹکنا — نہ راستہ نظر آتا ہے نہ منزل۔ یہ حال ہے: ڈھیل دیتا ہے اس حال میں کہ وہ اندھیرے میں بھٹکتے رہتے ہیں۔',
        classicalExplanation: 'يَعْمَهُونَ: فِعْلٌ مُضَارِعٌ مَرْفُوعٌ وَجُمْلَةُ يَعْمَهُونَ فِي مَحَلِّ نَصْبٍ حَالٌ۔',
      },
    ],
  },
};

/* ─────────────────────────────────────────────────────────────
   WORD DETAIL PANEL  —  Bottom sheet showing I'rab analysis
   ───────────────────────────────────────────────────────────── */
function IrabSection({ icon, title, content, arabic }) {
  const [open, setOpen] = useState(true);
  return (
    <View style={sp.section}>
      <TouchableOpacity style={sp.sectionHeader} onPress={() => setOpen(o => !o)} activeOpacity={0.7}>
        <View style={sp.sectionLeft}>
          <Feather name={icon} size={14} color={GOLD} />
          <Text style={sp.sectionTitle}>{title}</Text>
        </View>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={14} color={TEXT_S} />
      </TouchableOpacity>
      {open && (
        <Text style={[sp.sectionBody, arabic && sp.sectionBodyAr]}>{content}</Text>
      )}
    </View>
  );
}

function WordDetailPanel({ word, onClose }) {
  if (!word) return null;

  const typeLabel = word.wordType;
  const tc        = word.typeColor || GOLD;

  return (
    <Modal
      visible={true}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Dim overlay — tap outside to close */}
      <TouchableOpacity style={sp.overlay} onPress={onClose} activeOpacity={1}>
        {/* Sheet — prevent tap-through */}
        <TouchableOpacity style={sp.sheet} activeOpacity={1} onPress={() => {}}>
          <View style={sp.handle} />

          {/* ── Word header ── */}
          <View style={sp.wordHeader}>
            <View style={sp.wordHeaderLeft}>
              <View style={[sp.typeBadge, { backgroundColor: tc + '22', borderColor: tc + '55' }]}>
                <Text style={[sp.typeTxt, { color: tc }]}>{typeLabel}</Text>
              </View>
              <Text style={sp.meaningTxt}>{word.urduMeaning}</Text>
            </View>
            <Text style={sp.wordArabic}>{word.arabicWord}</Text>
          </View>

          <View style={sp.divider} />

          {/* ── Details ── */}
          <ScrollView showsVerticalScrollIndicator={false} style={sp.scroll}>

            <IrabSection
              icon="git-branch"
              title="اعرابی کردار"
              content={word.irabRole + (word.grammaticalCase ? '\n' + 'اعراب: ' + word.grammaticalCase : '')}
            />

            {word.morphForm && (
              <IrabSection
                icon="layers"
                title="صیغہ و قسم"
                content={word.morphForm + (word.root ? '\nمادہ: ' + word.root : '')}
              />
            )}

            {word.governingElement && (
              <IrabSection
                icon="link"
                title="حاکم عنصر"
                content={word.governingElement}
              />
            )}

            {word.notes && (
              <IrabSection
                icon="book-open"
                title="تشریح"
                content={word.notes}
              />
            )}

            {word.classicalExplanation && (
              <IrabSection
                icon="feather"
                title="کلاسیکی اعراب (عربی)"
                content={word.classicalExplanation}
                arabic
              />
            )}

            <View style={{ height: 30 }} />
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

/* ── Verse row ── */
const AyahItem = React.memo(({ item, transMode, onWordPress }) => {
  const showEn = transMode === 'en' || transMode === 'both';
  const showUr = transMode === 'ur' || transMode === 'both';
  const hasTrans = showEn || showUr;

  /* Parse surah and ayah numbers from verseKey */
  const [surahNum, ayahNum] = item.verseKey.split(':').map(Number);

  /* Check if I'rab analysis is available for this ayah */
  const irabWords = IRAB_DATA[surahNum]?.[ayahNum];
  const hasIrab   = Array.isArray(irabWords) && irabWords.length > 0;
  const arabicWords = hasIrab ? item.arabic.split(' ') : null;

  return (
    <View style={s.ayahCard}>
      {/* Top row: verse number + key */}
      <View style={s.ayahTopRow}>
        <View style={s.ayahNumBadge}>
          <Text style={s.ayahNum}>{item.verseNumber}</Text>
        </View>
        <Text style={s.ayahKey}>{item.verseKey}</Text>
        {hasIrab && (
          <View style={s.irabBadge}>
            <Feather name="zap" size={9} color={GOLD} />
            <Text style={s.irabBadgeTxt}>اعراب</Text>
          </View>
        )}
        <View style={s.ayahTopLine} />
      </View>

      {/* Arabic text — tappable words when I'rab data exists */}
      {hasIrab ? (
        <View style={s.arabicWordsWrap}>
          {arabicWords.map((w, idx) => {
            const wd = irabWords.find(d => d.wordIndex === idx);
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => wd && onWordPress(wd)}
                activeOpacity={wd ? 0.6 : 1}
                style={[s.wordToken, wd && s.wordTokenActive]}
              >
                <Text style={[s.arabicWordTxt, wd && s.arabicWordTxtActive]}>
                  {w}
                </Text>
                {wd && <View style={[s.wordDot, { backgroundColor: wd.typeColor }]} />}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <Text style={s.arabicText}>{item.arabic}</Text>
      )}

      {/* Translations */}
      {hasTrans && (
        <View style={s.transBlock}>
          {showUr && (
            <View style={s.transRow}>
              <View style={s.transLangDot} />
              <Text style={s.urduText}>{item.urdu}</Text>
            </View>
          )}
          {showEn && (
            <View style={[s.transRow, showUr && { marginTop: 8 }]}>
              <View style={[s.transLangDot, { backgroundColor: GOLD + '60' }]} />
              <Text style={s.englishText}>{item.english}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
});

/* ── Surah selector modal ── */
function SurahModal({ visible, selected, onSelect, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />
          <Text style={s.modalTitle}>Select Surah  •  سورہ منتخب کریں</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {SURAHS.map(sr => {
              const active = sr.n === selected.n;
              return (
                <TouchableOpacity
                  key={sr.n}
                  style={[s.surahRow, active && s.surahRowActive]}
                  onPress={() => { onSelect(sr); onClose(); }}
                  activeOpacity={0.75}
                >
                  <View style={[s.surahNumBox, active && s.surahNumBoxActive]}>
                    <Text style={[s.surahNum, active && { color: BG }]}>{sr.n}</Text>
                  </View>
                  <View style={s.surahInfo}>
                    <Text style={[s.surahEn, active && { color: GOLD }]}>{sr.en}</Text>
                    <View style={s.surahMetaRow}>
                      <Text style={s.surahMetaTxt}>{sr.v} verses</Text>
                      <View style={[s.typeBadge, sr.mec ? s.meccan : s.medinan]}>
                        <Text style={s.typeTxt}>{sr.mec ? 'Meccan' : 'Medinan'}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={s.surahAr}>{sr.ar}</Text>
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 50 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ── Translation mode picker ── */
function TransPicker({ mode, onSelect, onClose }) {
  return (
    <View style={s.transPicker}>
      {TRANS_MODES.map(m => (
        <TouchableOpacity
          key={m.key}
          style={[s.transOption, mode === m.key && s.transOptionActive]}
          onPress={() => { onSelect(m.key); onClose(); }}
          activeOpacity={0.8}
        >
          <Text style={[s.transOptionTxt, mode === m.key && { color: BG }]}>{m.label}</Text>
          <Text style={[s.transOptionUrdu, mode === m.key && { color: BG + 'CC' }]}>{m.labelU}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

/* ── Main Screen ── */
export default function QuranReadingScreen({ navigation, route }) {
  const params = route?.params || {};

  const initialSurah = params.surahNum
    ? (SURAHS.find(s => s.n === params.surahNum) || SURAHS[0])
    : SURAHS[0];

  const [surah,          setSurah]          = useState(initialSurah);
  const [transMode,      setTransMode]      = useState('none');
  const [showSurahModal, setShowSurahModal] = useState(!!params.openSurahList);
  const [showTransPicker,setShowTransPicker]= useState(false);
  const [selectedWord,   setSelectedWord]   = useState(null);

  /* Build verse list from local JSON — instant, no async needed */
  const verses = useMemo(() => {
    const key   = String(surah.n);
    const arArr = QURAN_DATA[key] || [];
    const enArr = EN_DATA[key]    || [];
    const urArr = UR_DATA[key]    || [];
    return arArr.map((v, i) => ({
      id:          `${surah.n}:${v.verse}`,
      verseKey:    `${surah.n}:${v.verse}`,
      verseNumber: v.verse,
      arabic:      v.text,
      english:     enArr[i]?.text || '',
      urdu:        urArr[i]?.text || '',
    }));
  }, [surah]);

  const activeTransLabel = TRANS_MODES.find(m => m.key === transMode)?.label || 'Arabic Only';

  const handleWordPress = useCallback((wordData) => {
    setSelectedWord(wordData);
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <AyahItem
        item={item}
        transMode={transMode}
        onWordPress={handleWordPress}
      />
    ),
    [transMode, handleWordPress]
  );

  /* Check if current surah has any I'rab data */
  const hasIrabForSurah = !!IRAB_DATA[surah.n];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Feather name="arrow-left" size={20} color={GOLD} />
        </TouchableOpacity>

        {/* Surah selector */}
        <TouchableOpacity
          style={s.surahSelector}
          onPress={() => { setShowTransPicker(false); setShowSurahModal(true); }}
          activeOpacity={0.8}
        >
          <Text style={s.headerSurahEn} numberOfLines={1}>{surah.en}</Text>
          <Text style={s.headerSurahAr} numberOfLines={1}>{surah.ar}</Text>
        </TouchableOpacity>

        {/* Translation toggle */}
        <TouchableOpacity
          style={[s.iconBtn, transMode !== 'none' && s.iconBtnActive]}
          onPress={() => { setShowSurahModal(false); setShowTransPicker(p => !p); }}
        >
          <Feather name="type" size={18} color={transMode !== 'none' ? BG : TEXT_S} />
        </TouchableOpacity>
      </View>

      {/* ── Translation picker dropdown ── */}
      {showTransPicker && (
        <TransPicker
          mode={transMode}
          onSelect={setTransMode}
          onClose={() => setShowTransPicker(false)}
        />
      )}

      {/* ── Info bar ── */}
      <View style={s.infoBar}>
        <View style={[s.typeBadge, surah.mec ? s.meccan : s.medinan]}>
          <Text style={s.typeTxt}>{surah.mec ? 'Meccan' : 'Medinan'}</Text>
        </View>
        <Text style={s.infoTxt}>{surah.v} verses</Text>
        {transMode !== 'none' && (
          <>
            <View style={s.infoDot} />
            <Text style={[s.infoTxt, { color: GOLD }]}>{activeTransLabel}</Text>
          </>
        )}
        {hasIrabForSurah && (
          <>
            <View style={s.infoDot} />
            <Feather name="zap" size={10} color={FIL_C} />
            <Text style={[s.infoTxt, { color: FIL_C }]}>اعراب دستیاب</Text>
          </>
        )}
        <View style={{ flex: 1 }} />
        {/* All Surahs button */}
        <TouchableOpacity
          style={s.allSurahsBtn}
          onPress={() => { setShowTransPicker(false); setShowSurahModal(true); }}
          activeOpacity={0.8}
        >
          <Feather name="list" size={13} color={GOLD} />
          <Text style={s.allSurahsTxt}>تمام سورتیں</Text>
        </TouchableOpacity>
      </View>

      {/* ── Bismillah (skip Surah 9) ── */}
      {surah.n !== 9 && (
        <View style={s.bismillah}>
          <Text style={s.bismillahText}>بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</Text>
        </View>
      )}

      {/* ── Verse list ── */}
      <FlatList
        data={verses}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.listPad}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={6}
      />

      {/* ── Surah modal ── */}
      <SurahModal
        visible={showSurahModal}
        selected={surah}
        onSelect={setSurah}
        onClose={() => setShowSurahModal(false)}
      />

      {/* ── Word Detail Panel ── */}
      {selectedWord && (
        <WordDetailPanel
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </View>
  );
}

/* ── Main screen styles ── */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnActive: { backgroundColor: GOLD, borderColor: GOLD },
  surahSelector: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: BORDER,
  },
  headerSurahEn: { fontSize: 17, color: TEXT, fontWeight: '700', flex: 1 },
  headerSurahAr: { fontSize: 19, color: GOLD, fontWeight: '700', flex: 1, textAlign: 'right' },

  /* Translation picker */
  transPicker: {
    backgroundColor: CARD2, borderBottomWidth: 1, borderBottomColor: BORDER,
    paddingHorizontal: 16, paddingVertical: 10, gap: 6,
  },
  transOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 12, borderWidth: 1, borderColor: BORDER,
  },
  transOptionActive: { backgroundColor: GOLD, borderColor: GOLD },
  transOptionTxt:   { fontSize: 13, color: TEXT, fontWeight: '600' },
  transOptionUrdu:  { fontSize: 12, color: TEXT_S },

  /* Info bar */
  infoBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  infoTxt: { fontSize: 11, color: TEXT_S },
  infoDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: TEXT_S, opacity: 0.5 },
  allSurahsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: GOLD + '18', borderWidth: 1, borderColor: GOLD + '40',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  allSurahsTxt: { fontSize: 12, color: GOLD, fontWeight: '600' },

  /* Bismillah */
  bismillah: {
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 16,
    borderBottomWidth: 0.7, borderBottomColor: BORDER,
    marginBottom: 4,
  },
  bismillahText: { fontSize: 22, color: GOLD, textAlign: 'center', lineHeight: 40 },

  /* Verse list */
  listPad: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 50 },

  /* Ayah card */
  ayahCard: {
    backgroundColor: CARD, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 18, paddingTop: 14, paddingBottom: 18,
    marginBottom: 10,
  },
  ayahTopRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14,
  },
  ayahNumBadge: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: EMERALD + '50',
    borderWidth: 1, borderColor: GOLD + '30',
    alignItems: 'center', justifyContent: 'center',
  },
  ayahNum:    { fontSize: 11, color: GOLD, fontWeight: '700' },
  ayahKey:    { fontSize: 10, color: TEXT_S, letterSpacing: 0.5 },
  ayahTopLine:{ flex: 1, height: 0.5, backgroundColor: BORDER },

  /* I'rab available badge */
  irabBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: FIL_C + '18', borderWidth: 1, borderColor: FIL_C + '40',
    borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2,
  },
  irabBadgeTxt: { fontSize: 9, color: FIL_C, fontWeight: '700' },

  /* Arabic word tokens (tappable) */
  arabicWordsWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 2,
    rowGap: 10,
    justifyContent: 'flex-start',
    paddingVertical: 4,
  },
  wordToken: {
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  wordTokenActive: {
    backgroundColor: GOLD + '10',
    borderColor: GOLD + '30',
  },
  arabicWordTxt: {
    fontSize: 26, color: TEXT,
    lineHeight: 44, letterSpacing: 0.5,
    textAlign: 'center',
  },
  arabicWordTxtActive: {
    color: GOLD_L,
  },
  wordDot: {
    width: 5, height: 5, borderRadius: 2.5,
    marginTop: 2,
    opacity: 0.8,
  },

  /* Plain Arabic (no I'rab) */
  arabicText: {
    fontSize: 26, color: TEXT,
    textAlign: 'right', lineHeight: 52,
    letterSpacing: 0.5,
  },

  /* Translations */
  transBlock: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 0.7, borderTopColor: BORDER,
  },
  transRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  transLangDot: {
    width: 3, marginTop: 5,
    alignSelf: 'stretch',
    backgroundColor: EMERALD + '80',
    borderRadius: 2,
  },
  urduText: {
    flex: 1, fontSize: 15, color: TEXT,
    textAlign: 'right', lineHeight: 28,
  },
  englishText: {
    flex: 1, fontSize: 13, color: TEXT_S,
    textAlign: 'left', lineHeight: 22, fontStyle: 'italic',
  },

  /* Surah modal */
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: CARD2,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 12,
    maxHeight: '88%',
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: BORDER, alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: {
    fontSize: 15, color: GOLD_L, fontWeight: '700',
    textAlign: 'center', marginBottom: 16,
  },
  surahRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: BORDER,
  },
  surahRowActive: {
    backgroundColor: GOLD + '12', borderRadius: 12, paddingHorizontal: 8,
  },
  surahNumBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: EMERALD + '40', borderWidth: 1, borderColor: GOLD + '25',
    alignItems: 'center', justifyContent: 'center',
  },
  surahNumBoxActive: { backgroundColor: GOLD },
  surahNum:  { fontSize: 12, color: GOLD, fontWeight: '700' },
  surahInfo: { flex: 1 },
  surahEn:   { fontSize: 14, color: TEXT, fontWeight: '600' },
  surahMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  surahMetaTxt: { fontSize: 11, color: TEXT_S },
  surahAr:   { fontSize: 18, color: GOLD },
  typeBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  meccan:    { backgroundColor: GOLD + '20' },
  medinan:   { backgroundColor: EMERALD + '50' },
  typeTxt:   { fontSize: 9, color: TEXT_S, fontWeight: '600' },
});

/* ── Word Detail Panel styles ── */
const sp = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: CARD2,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '80%',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: BORDER, alignSelf: 'center', marginBottom: 18,
  },

  /* Word header */
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  wordHeaderLeft: {
    flex: 1,
    gap: 6,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  typeTxt: {
    fontSize: 13, fontWeight: '700',
  },
  meaningTxt: {
    fontSize: 18, color: TEXT, fontWeight: '600',
    textAlign: 'left',
  },
  wordArabic: {
    fontSize: 38, color: GOLD_L, fontWeight: '700',
    textAlign: 'right', lineHeight: 56,
    flex: 1,
  },

  divider: {
    height: 0.7, backgroundColor: BORDER,
    marginBottom: 12,
  },

  scroll: {
    flexGrow: 0,
  },

  /* Section row */
  section: {
    marginBottom: 8,
    backgroundColor: '#0d1a28',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13, color: TEXT_S, fontWeight: '600',
  },
  sectionBody: {
    fontSize: 14, color: TEXT,
    paddingHorizontal: 14, paddingBottom: 12,
    lineHeight: 24,
    textAlign: 'right',
  },
  sectionBodyAr: {
    fontSize: 15,
    color: GOLD_L,
    lineHeight: 28,
    textAlign: 'right',
  },
});
