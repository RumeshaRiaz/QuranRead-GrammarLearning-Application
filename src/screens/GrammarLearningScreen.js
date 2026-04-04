import { useState, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, FlatList, StatusBar, Platform, Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

/* ── Colors ── */
const BG       = '#0C1520';
const CARD     = '#111E2E';
const CARD2    = '#16253A';
const GOLD     = '#C9A84C';
const GOLD_L   = '#E8C875';
const EMERALD  = '#1B4332';
const EMERALD_L = '#5A8A6A';
const ISM      = '#4A90D9';   // blue  — اسم (noun)
const FIL      = '#E8734A';   // orange — فعل (verb)
const HARF     = '#9B59B6';   // purple — حرف (particle)
const TEXT     = '#F0EAD6';
const TEXT_S   = '#8AA898';
const BORDER   = 'rgba(201,168,76,0.13)';

/* ─────────────────────────────────────────────────────────────────
   GRAMMAR DATA  — sourced from مختصر عربی گرامر (27-page PDF)
───────────────────────────────────────────────────────────────── */
const CHAPTERS = [

  /* ══════════════════════════════════════════════════════
     CH 1  —  اصطلاحات  (Terminology)
  ══════════════════════════════════════════════════════ */
  {
    id: 'ch1', icon: 'info', color: GOLD,
    title: 'اصطلاحات', titleEn: 'Terminology',
    desc: 'بنیادی اصطلاحات اور عربی الفاظ کی اقسام',
    lessons: [
      {
        id: 'l1a',
        arabic: 'حَرَكَات',
        title: 'حرکات',
        titleEn: 'Vowel Marks',
        level: 'ابتدائی', tag: null,
        intro: 'عربی زبان میں ہر حرف کے ساتھ مخصوص علامات آتی ہیں جو آواز متعین کرتی ہیں۔ انہیں "حرکات" کہتے ہیں۔',
        points: [
          { title: 'زَبَر  (فَتْحَة)', arabic: 'بَ', urdu: 'اوپر ترچھی لکیر — آواز "اَ" ۔ مثال: كَتَبَ' },
          { title: 'زِیر  (كَسْرَة)', arabic: 'بِ', urdu: 'نیچے ترچھی لکیر — آواز "اِ" ۔ مثال: بِسْمِ' },
          { title: 'پیش  (ضَمَّة)',   arabic: 'بُ', urdu: 'چھوٹا واؤ اوپر — آواز "اُ" ۔ مثال: يَذْهَبُ' },
          { title: 'سُكُوْن',         arabic: 'بْ', urdu: 'گول دائرہ — بغیر آواز ۔ مثال: كَتَبْتُ' },
          { title: 'تَشْدِيْد (شَدَّة)', arabic: 'بَّ', urdu: 'دو بار پڑھا جائے ۔ مثال: رَبَّنَا' },
          { title: 'تَنْوِيْن',       arabic: 'ٌ ً ٍ', urdu: 'دو دو حرکات — اسم نکرہ کی علامت ۔ مثال: رَجُلٌ، رَجُلًا، رَجُلٍ' },
        ],
        table: null, examples: [],
      },
      {
        id: 'l1b',
        arabic: 'كَلِمَة',
        title: 'کلمہ اور اس کی اقسام',
        titleEn: 'The Word & Its Types',
        level: 'ابتدائی', tag: null,
        intro: 'عربی میں ہر بامعنی لفظ کو "کلمہ" کہتے ہیں۔ کلمہ کی تین اقسام ہیں:',
        points: [
          { title: 'اِسْم', arabic: 'زَيْدٌ  •  كِتَابٌ  •  مَسْجِدٌ', urdu: 'کسی شخص، جگہ یا چیز کا نام۔ تنوین یا "ال" اس کی پہچان ہے۔', color: ISM },
          { title: 'فِعْل', arabic: 'ذَهَبَ  •  يَكْتُبُ  •  اِذْهَبْ', urdu: 'کسی کام کو ظاہر کرے اور زمانہ معلوم ہو۔', color: FIL },
          { title: 'حَرْف', arabic: 'مِنْ  •  إِلَى  •  فِيْ  •  عَلَى', urdu: 'وہ کلمہ جو تنہا مکمل معنی نہ دے، دوسرے لفظ کے ساتھ معنی دے۔', color: HARF },
        ],
        table: null,
        examples: [
          { arabic: 'ذَهَبَ زَيْدٌ إِلَى الْمَسْجِدِ', urdu: 'زید مسجد گیا', breakdown: 'ذَهَبَ = فعل  •  زَيْدٌ = اسم  •  إِلَى = حرف  •  الْمَسْجِدِ = اسم' },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════
     CH 2  —  اسم  (Noun)
  ══════════════════════════════════════════════════════ */
  {
    id: 'ch2', icon: 'tag', color: ISM,
    title: 'اِسْم', titleEn: 'Noun (Ism)',
    desc: 'اسم کی پہچان، إعراب، جنس، عدد، معرفہ و نکرہ',
    lessons: [
      {
        id: 'l2a',
        arabic: 'عَلَامَاتُ الِاسْمِ',
        title: 'اسم کی پہچان',
        titleEn: 'Signs of a Noun',
        level: 'ابتدائی', tag: ISM,
        intro: 'اسم کو پہچاننے کے لیے ان علامتوں میں سے کوئی ایک ضروری ہے:',
        points: [
          { title: 'تَنْوِيْن',     arabic: 'زَيْدٌ / كِتَابًا / رَجُلٍ', urdu: 'آخر میں دو زبر، دو زیر یا دو پیش' },
          { title: 'الف لام (ال)', arabic: 'الْكِتَابُ / الْمَسْجِدُ',    urdu: 'شروع میں "ال" آئے' },
          { title: 'حرف جار',      arabic: 'فِيْ الْمَسْجِدِ / بِاللهِ',  urdu: 'پہلے حرف جار (مِنْ، فِيْ، إِلَى) آئے' },
          { title: 'نداء (يَا)',   arabic: 'يَا زَيْدُ / يَا رَبِّ',      urdu: '"يَا" کے بعد آئے — مُنَادٰى' },
        ],
        table: null,
        examples: [
          { arabic: 'الْكِتَابُ مُفِيْدٌ', urdu: 'کتاب فائدہ مند ہے', breakdown: 'الْكِتَابُ = اسم معرفہ  •  مُفِيْدٌ = اسم نکرہ' },
        ],
      },
      {
        id: 'l2b',
        arabic: 'إِعْرَابُ الْمُفْرَدِ',
        title: 'مفرد کا إعراب',
        titleEn: 'Declension of Singular Noun',
        level: 'ابتدائی', tag: ISM,
        intro: 'عربی اسم تین حالتوں (cases) میں آتا ہے۔ ہر حالت کی الگ علامت ہوتی ہے:',
        points: [
          { title: 'حالتِ رفع  (Nominative)', arabic: 'زَيْدٌ — پیش', urdu: 'فاعل، مبتدأ، خبر — آخر میں ضمہ (پیش)' },
          { title: 'حالتِ نصب (Accusative)', arabic: 'زَيْدًا — زبر', urdu: 'مفعول، حال، تمیز — آخر میں فتحہ (زبر)' },
          { title: 'حالتِ جر  (Genitive)',   arabic: 'زَيْدٍ — زیر',  urdu: 'مضاف الیہ، حرف جار کے بعد — آخر میں کسرہ (زیر)' },
        ],
        table: {
          headers: ['اسم', 'حالتِ رفع', 'حالتِ نصب', 'حالتِ جر'],
          arabicCols: [0, 1, 2, 3],
          rows: [
            ['زَيْد', 'زَيْدٌ', 'زَيْدًا', 'زَيْدٍ'],
            ['كِتَاب', 'كِتَابٌ', 'كِتَابًا', 'كِتَابٍ'],
            ['مُسْلِم', 'مُسْلِمٌ', 'مُسْلِمًا', 'مُسْلِمٍ'],
          ],
        },
        examples: [],
      },
      {
        id: 'l2c',
        arabic: 'الْمُثَنَّى',
        title: 'مثنی (دو کے لیے)',
        titleEn: 'Dual Noun',
        level: 'ابتدائی', tag: ISM,
        intro: 'جب دو چیزوں کا ذکر ہو تو اسم کے آخر میں "انِ" (رفع) یا "يْنِ" (نصب/جر) لگتا ہے:',
        points: [
          { title: 'رفع کی علامت',        arabic: 'رَجُلَانِ',  urdu: '"انِ" لگائیں — دو آدمی (مرفوع)' },
          { title: 'نصب و جر کی علامت',   arabic: 'رَجُلَيْنِ', urdu: '"يْنِ" لگائیں — دو آدمی (منصوب/مجرور)' },
        ],
        table: {
          headers: ['اسم', 'حالتِ رفع', 'حالتِ نصب/جر'],
          arabicCols: [0, 1, 2],
          rows: [
            ['زَيْد (م)', 'زَيْدَانِ', 'زَيْدَيْنِ'],
            ['كِتَاب', 'كِتَابَانِ', 'كِتَابَيْنِ'],
            ['مُسْلِمَة (ث)', 'مُسْلِمَتَانِ', 'مُسْلِمَتَيْنِ'],
          ],
        },
        examples: [
          { arabic: 'وَقَالَتِ الْيَهُودُ عُزَيْرٌ ابْنُ اللهِ', urdu: 'اور یہودیوں نے کہا: عزیر اللہ کے بیٹے ہیں', cite: 'التوبة ٩:٣٠' },
          { arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِيْ صَغِيْرًا', urdu: 'اے رب! ان دونوں پر رحم فرما جیسے انہوں نے مجھے بچپن میں پالا', cite: 'الإسراء ١٧:٢٤' },
        ],
      },
      {
        id: 'l2d',
        arabic: 'الْجِنْس',
        title: 'جنس  —  مذکر و مؤنث',
        titleEn: 'Gender (Masculine & Feminine)',
        level: 'ابتدائی', tag: ISM,
        intro: 'عربی میں ہر اسم مذکر یا مؤنث ہوتا ہے۔ مؤنث کی تین علامات ہیں:',
        points: [
          { title: 'تاء مربوطہ  (ة)',  arabic: 'مُسْلِمَة، فَاطِمَة', urdu: 'آخر میں گول تاء — مؤنث کی عام علامت' },
          { title: 'الف مقصورہ (ى)', arabic: 'سَلْمٰى، كُبْرٰى',    urdu: 'آخر میں الف مقصورہ' },
          { title: 'الف ممدودہ  (اء)', arabic: 'حَمْرَاء، بَيْضَاء', urdu: 'آخر میں "اء"' },
          { title: 'سماعی مؤنث',      arabic: 'أُمٌّ، نَفْسٌ، أَرْضٌ', urdu: 'بغیر علامت — از روایت مؤنث مانی جاتی ہیں' },
        ],
        table: null, examples: [],
      },
      {
        id: 'l2e',
        arabic: 'الْعَدَد',
        title: 'عدد  —  واحد، مثنی، جمع',
        titleEn: 'Number (Singular, Dual, Plural)',
        level: 'ابتدائی', tag: ISM,
        intro: 'اسم تعداد کے اعتبار سے تین قسموں میں آتا ہے:',
        points: [
          { title: 'وَاحِد (Singular)', arabic: 'مُسْلِمٌ / مُسْلِمَةٌ',        urdu: 'ایک کے لیے' },
          { title: 'مُثَنَّى (Dual)',   arabic: 'مُسْلِمَانِ / مُسْلِمَتَانِ', urdu: 'دو کے لیے' },
          { title: 'جَمْع (Plural)',    arabic: 'مُسْلِمُوْنَ / مُسْلِمَاتٌ',  urdu: 'تین یا زیادہ کے لیے' },
        ],
        table: {
          headers: ['', 'واحد', 'مثنی', 'جمعِ سالم'],
          arabicCols: [1, 2, 3],
          rows: [
            ['مذکر', 'مُسْلِمٌ', 'مُسْلِمَانِ', 'مُسْلِمُوْنَ'],
            ['مؤنث', 'مُسْلِمَةٌ', 'مُسْلِمَتَانِ', 'مُسْلِمَاتٌ'],
          ],
        },
        examples: [
          { arabic: 'إِنَّمَا الْمُؤْمِنُوْنَ إِخْوَةٌ', urdu: 'مومن تو بھائی بھائی ہیں', cite: 'الحجرات ٤٩:١٠' },
        ],
      },
      {
        id: 'l2f',
        arabic: 'نَكِرَة  وَ  مَعْرِفَة',
        title: 'نکرہ اور معرفہ',
        titleEn: 'Indefinite & Definite',
        level: 'ابتدائی', tag: ISM,
        intro: 'اسم یا تو غیر متعین (نکرہ) ہوتا ہے یا متعین (معرفہ):',
        points: [
          { title: 'اِسْمِ نَكِرَة',     arabic: 'كِتَابٌ، رَجُلٌ',          urdu: 'کوئی بھی کتاب، کوئی بھی آدمی — غیر متعین' },
          { title: 'اِسْمِ مَعْرِفَة (ال)', arabic: 'الْكِتَابُ، الرَّجُلُ', urdu: 'وہ متعین کتاب — "ال" لگانے سے معرفہ' },
          { title: 'عَلَم (ذاتی نام)',   arabic: 'مُحَمَّدٌ، فَاطِمَةُ',     urdu: 'ذاتی نام — ہمیشہ معرفہ، تنوین نہیں لیتا' },
          { title: 'ضَمِيْر',           arabic: 'هُوَ، هِيَ، أَنَا',         urdu: 'ضمائر — ہمیشہ معرفہ' },
        ],
        table: null, examples: [],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════
     CH 3  —  اسمِ اشارہ و موصول
  ══════════════════════════════════════════════════════ */
  {
    id: 'ch3', icon: 'crosshair', color: '#5DADE2',
    title: 'اسمِ اشارہ و موصول', titleEn: 'Demonstratives & Relatives',
    desc: 'قریب و بعید اشارے اور موصول اسماء',
    lessons: [
      {
        id: 'l3a',
        arabic: 'اِسْمُ الْإِشَارَة',
        title: 'اسم اشارہ',
        titleEn: 'Demonstrative Pronouns',
        level: 'ابتدائی', tag: ISM,
        intro: 'اسم اشارہ کسی چیز کی طرف اشارہ کرنے کے لیے استعمال ہوتا ہے:',
        points: [
          { title: 'قریب  مذکر',   arabic: 'هَذَا',        urdu: 'یہ (مذکر واحد) — This (masc. sg.)' },
          { title: 'قریب  مؤنث',   arabic: 'هَذِهِ',       urdu: 'یہ (مؤنث واحد) — This (fem. sg.)' },
          { title: 'بعید  مذکر',   arabic: 'ذَلِكَ',       urdu: 'وہ (مذکر واحد) — That (masc. sg.)' },
          { title: 'بعید  مؤنث',   arabic: 'تِلْكَ',       urdu: 'وہ (مؤنث واحد) — That (fem. sg.)' },
          { title: 'جمع (قریب)',   arabic: 'هَؤُلَاءِ',    urdu: 'یہ سب — These' },
          { title: 'جمع (بعید)',   arabic: 'أُولَئِكَ',    urdu: 'وہ سب — Those' },
        ],
        table: {
          headers: ['', 'واحد', 'مثنی (رفع)', 'جمع'],
          arabicCols: [1, 2, 3],
          rows: [
            ['قریب م', 'هَذَا', 'هَذَانِ', 'هَؤُلَاءِ'],
            ['قریب ث', 'هَذِهِ', 'هَاتَانِ', 'هَؤُلَاءِ'],
            ['بعید م', 'ذَلِكَ', 'ذَانِكَ', 'أُولَئِكَ'],
            ['بعید ث', 'تِلْكَ', 'تَانِكَ', 'أُولَئِكَ'],
          ],
        },
        examples: [
          { arabic: 'ذَلِكَ الْكِتَابُ لَا رَيْبَ فِيْهِ', urdu: 'یہ وہ کتاب ہے جس میں کوئی شک نہیں', cite: 'البقرة ٢:٢' },
          { arabic: 'هَذَا بَيَانٌ لِّلنَّاسِ', urdu: 'یہ لوگوں کے لیے بیان ہے', cite: 'آل عمران ٣:١٣٨' },
        ],
      },
      {
        id: 'l3b',
        arabic: 'اِسْمُ الْمَوْصُوْل',
        title: 'اسم موصول',
        titleEn: 'Relative Pronouns',
        level: 'درمیانہ', tag: ISM,
        intro: 'اسم موصول وہ اسم ہے جو اپنے بعد آنے والے جملہ (صِلَہ) کو ملاتا ہے:',
        points: [
          { title: 'مذکر واحد', arabic: 'اَلَّذِيْ',   urdu: 'جو (مرد، واحد) — Who/which (masc. sg.)' },
          { title: 'مؤنث واحد', arabic: 'اَلَّتِيْ',   urdu: 'جو (عورت، واحد) — Who/which (fem. sg.)' },
          { title: 'مذکر مثنی', arabic: 'اَلَّذَانِ',  urdu: 'جو دونوں (مذکر)' },
          { title: 'مذکر جمع',  arabic: 'اَلَّذِيْنَ', urdu: 'جو سب (مذکر) — Those who' },
          { title: 'مؤنث جمع', arabic: 'اَللَّاتِيْ', urdu: 'جو سب (مؤنث)' },
        ],
        table: null,
        examples: [
          { arabic: 'الَّذِيْنَ يُؤْمِنُوْنَ بِالْغَيْبِ', urdu: 'جو غیب پر ایمان رکھتے ہیں', cite: 'البقرة ٢:٣' },
          { arabic: 'إِنَّ اللهَ يُحِبُّ الَّذِيْنَ يُقَاتِلُوْنَ فِيْ سَبِيْلِهِ', urdu: 'بے شک اللہ ان سے محبت کرتا ہے جو اس کی راہ میں لڑتے ہیں', cite: 'الصف ٦١:٤' },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════
     CH 4  —  ضمیر  (Pronouns)
  ══════════════════════════════════════════════════════ */
  {
    id: 'ch4', icon: 'user', color: EMERALD_L,
    title: 'ضَمِيْر', titleEn: 'Pronouns',
    desc: 'منفصل اور متصل ضمائر کا مکمل بیان',
    lessons: [
      {
        id: 'l4a',
        arabic: 'ضَمِيْرٌ مُنْفَصِل',
        title: 'ضمیر منفصل',
        titleEn: 'Detached Pronouns',
        level: 'ابتدائی', tag: ISM,
        intro: 'وہ ضمیریں جو کسی لفظ سے الگ لکھی جاتی ہیں — مبتدأ یا مفعول کے طور پر آتی ہیں:',
        points: [
          { title: 'غائب (Third Person)',  arabic: 'هُوَ / هِيَ / هُمَا / هُمْ / هُنَّ',              urdu: 'وہ (م / ث / مثنی / جمع م / جمع ث)' },
          { title: 'حاضر (Second Person)', arabic: 'أَنْتَ / أَنْتِ / أَنْتُمَا / أَنْتُمْ / أَنْتُنَّ', urdu: 'تم (م / ث / مثنی / جمع م / جمع ث)' },
          { title: 'متکلم (First Person)', arabic: 'أَنَا / نَحْنُ',                                    urdu: 'میں / ہم' },
        ],
        table: {
          headers: ['شخص', 'مذکر', 'مؤنث'],
          arabicCols: [1, 2],
          rows: [
            ['غائب واحد', 'هُوَ', 'هِيَ'],
            ['غائب مثنی', 'هُمَا', 'هُمَا'],
            ['غائب جمع', 'هُمْ', 'هُنَّ'],
            ['حاضر واحد', 'أَنْتَ', 'أَنْتِ'],
            ['حاضر مثنی', 'أَنْتُمَا', 'أَنْتُمَا'],
            ['حاضر جمع', 'أَنْتُمْ', 'أَنْتُنَّ'],
            ['متکلم', 'أَنَا', 'نَحْنُ'],
          ],
        },
        examples: [
          { arabic: 'هُوَ اللهُ أَحَدٌ', urdu: 'وہ اللہ ایک ہے', cite: 'الإخلاص ١١٢:١' },
          { arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِيْنُ', urdu: 'ہم صرف تیری عبادت کرتے ہیں اور صرف تجھ سے مدد مانگتے ہیں', cite: 'الفاتحة ١:٥' },
        ],
      },
      {
        id: 'l4b',
        arabic: 'ضَمِيْرٌ مُتَّصِل',
        title: 'ضمیر متصل',
        titleEn: 'Attached Pronouns',
        level: 'درمیانہ', tag: ISM,
        intro: 'وہ ضمیریں جو کسی اسم، فعل یا حرف کے آخر میں جڑ جاتی ہیں:',
        points: [
          { title: 'غائب م واحد  ـهُ', arabic: 'رَبُّهُ / نَصَرَهُ', urdu: '"هُ" — اس کا / اسے (مذکر)' },
          { title: 'غائب ث واحد  ـهَا', arabic: 'رَبُّهَا / نَصَرَهَا', urdu: '"هَا" — اس کا (مؤنث)' },
          { title: 'غائب جمع م  ـهُمْ', arabic: 'رَبُّهُمْ / لَهُمْ', urdu: '"هُمْ" — ان کا (جمع مذکر)' },
          { title: 'حاضر م  ـكَ', arabic: 'رَبُّكَ / عَلَيْكَ', urdu: '"كَ" — تیرا / تمہیں (مذکر)' },
          { title: 'حاضر جمع  ـكُمْ', arabic: 'رَبُّكُمْ / لَكُمْ', urdu: '"كُمْ" — تم سب کا' },
          { title: 'متکلم  ـيْ / ـنَا', arabic: 'رَبِّيْ / رَبُّنَا', urdu: '"ي" = میرا  •  "نَا" = ہمارا' },
        ],
        table: null,
        examples: [
          { arabic: 'رَبُّنَا اغْفِرْ لَنَا', urdu: 'اے ہمارے رب! ہمیں معاف فرما', cite: 'آل عمران ٣:١٦' },
          { arabic: 'إِنَّ رَبَّكَ هُوَ الْخَالِقُ الْعَلِيْمُ', urdu: 'بے شک تیرا رب خالق اور علم والا ہے', cite: 'الحجر ١٥:٨٦' },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════
     CH 5  —  مرکبات  (Phrases & Compounds)
  ══════════════════════════════════════════════════════ */
  {
    id: 'ch5', icon: 'link', color: HARF,
    title: 'مُرَكَّبَات', titleEn: 'Phrases & Compounds',
    desc: 'مرکب اضافی، توصیفی، اسنادی اور حروف جارہ',
    lessons: [
      {
        id: 'l5a',
        arabic: 'مُرَكَّبٌ إِضَافِيٌّ',
        title: 'مرکب اضافی  (إضافة)',
        titleEn: 'Genitive Construct',
        level: 'درمیانہ', tag: null,
        intro: 'دو اسموں کا مرکب جس میں پہلا (مُضَاف) دوسرے (مُضَاف إِلَيْه) سے منسوب ہو:',
        points: [
          { title: 'مُضَاف کا قاعدہ',   arabic: 'بَيْتُ اللهِ',          urdu: 'مضاف سے "ال" اور تنوین دونوں ہٹ جاتے ہیں' },
          { title: 'مُضَاف إِلَيْه',    arabic: 'اللهِ / الْمَدِيْنَةِ', urdu: 'ہمیشہ مجرور (زیر) میں ہوگا' },
          { title: 'مثالیں',            arabic: 'كِتَابُ اللهِ  •  بَابُ الْمَسْجِدِ', urdu: 'اللہ کی کتاب  •  مسجد کا دروازہ' },
        ],
        table: null,
        examples: [
          { arabic: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ', urdu: 'اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے', cite: 'الفاتحة ١:١' },
          { arabic: 'كِتَابُ اللهِ وَسُنَّةُ نَبِيِّهِ', urdu: 'اللہ کی کتاب اور اس کے نبی کی سنت', cite: '' },
        ],
      },
      {
        id: 'l5b',
        arabic: 'مُرَكَّبٌ وَصْفِيٌّ',
        title: 'مرکب توصیفی  (نعت)',
        titleEn: 'Noun–Adjective Phrase',
        level: 'درمیانہ', tag: null,
        intro: 'اسم کے ساتھ اس کی صفت (نعت) آئے۔ صفت چار چیزوں میں موصوف کے موافق ہوتی ہے:',
        points: [
          { title: 'موافقت کی شرائط', arabic: 'جنس، عدد، حالت، معرفہ/نکرہ', urdu: 'صفت ان چاروں میں موصوف کے برابر ہوتی ہے' },
          { title: 'مذکر نکرہ',       arabic: 'رَجُلٌ كَرِيْمٌ',             urdu: 'ایک شریف آدمی' },
          { title: 'مؤنث معرفہ',      arabic: 'اَلْمَرْأَةُ الصَّالِحَةُ', urdu: 'وہ نیک عورت' },
        ],
        table: null,
        examples: [
          { arabic: 'اِهْدِنَا الصِّرَاطَ الْمُسْتَقِيْمَ', urdu: 'ہمیں سیدھی راہ دکھا', cite: 'الفاتحة ١:٦' },
          { arabic: 'وَلَهُمْ عَذَابٌ عَظِيْمٌ', urdu: 'اور ان کے لیے بڑا عذاب ہے', cite: 'البقرة ٢:٧' },
        ],
      },
      {
        id: 'l5c',
        arabic: 'مُرَكَّبٌ إِسْنَادِيٌّ',
        title: 'مرکب اسنادی  (جملہ)',
        titleEn: 'Predicative Compound',
        level: 'درمیانہ', tag: null,
        intro: 'ایسا مرکب جس میں کوئی بات بیان کی جائے — یہی مکمل جملہ ہے:',
        points: [
          { title: 'جملہ اسمیہ', arabic: 'اَللهُ أَكْبَرُ', urdu: 'مبتدأ + خبر — اسم سے شروع ہو' },
          { title: 'جملہ فعلیہ', arabic: 'ذَهَبَ زَيْدٌ', urdu: 'فعل + فاعل — فعل سے شروع ہو' },
        ],
        table: null,
        examples: [],
      },
      {
        id: 'l5d',
        arabic: 'حُرُوْفُ الْجَرّ',
        title: 'حروف جارہ',
        titleEn: 'Prepositions',
        level: 'ابتدائی', tag: HARF,
        intro: 'یہ حروف اسم کو مجرور (زیر) کرتے ہیں اور اسم و فعل کے درمیان تعلق ظاہر کرتے ہیں:',
        points: [
          { title: 'بِ',    arabic: 'بِسْمِ اللهِ',        urdu: 'کے ساتھ / کے نام سے  (by / with)' },
          { title: 'فِيْ',  arabic: 'فِيْ السَّمَاءِ',      urdu: 'میں / اندر  (in)' },
          { title: 'مِنْ', arabic: 'مِنَ الْجَنَّةِ',      urdu: 'سے  (from)' },
          { title: 'إِلَى', arabic: 'إِلَى اللهِ',         urdu: 'کی طرف  (to)' },
          { title: 'عَنْ', arabic: 'عَنِ الصَّلَاةِ',      urdu: 'سے / کے بارے میں  (about / from)' },
          { title: 'عَلَى', arabic: 'عَلَى كُلِّ شَيْءٍ',  urdu: 'پر / اوپر  (on / over)' },
          { title: 'لِ',   arabic: 'لِلَّهِ الْحَمْدُ',    urdu: 'کے لیے  (for)' },
          { title: 'كَ',   arabic: 'كَالْجَبَلِ',          urdu: 'کی طرح  (like)' },
          { title: 'حَتَّى', arabic: 'حَتَّى الصُّبْحِ',   urdu: 'تک  (until)' },
        ],
        table: {
          headers: ['حرف', 'معنی (اردو)', 'قرآنی مثال'],
          arabicCols: [0, 2],
          rows: [
            ['بِ', 'کے ساتھ', 'بِسْمِ اللهِ'],
            ['فِيْ', 'میں', 'فِيْ الدُّنْيَا'],
            ['مِنْ', 'سے', 'مِنَ النَّاسِ'],
            ['إِلَى', 'کی طرف', 'إِلَى اللهِ'],
            ['عَنْ', 'کے بارے میں', 'عَنِ الصَّلَاةِ'],
            ['عَلَى', 'پر', 'عَلَى الْعَرْشِ'],
            ['لِ', 'کے لیے', 'لِلَّهِ الْحَمْدُ'],
            ['حَتَّى', 'تک', 'حَتَّى الصُّبْحِ'],
          ],
        },
        examples: [
          { arabic: 'لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ', urdu: 'اللہ کا ہے جو کچھ آسمانوں میں اور جو کچھ زمین میں ہے', cite: 'البقرة ٢:٢٨٤' },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════
     CH 6  —  جملہ  (Sentence Structure)
  ══════════════════════════════════════════════════════ */
  {
    id: 'ch6', icon: 'align-right', color: '#E67E22',
    title: 'جُمْلَة', titleEn: 'Sentence Structure',
    desc: 'جملہ اسمیہ، فعلیہ، فاعل، مفعول اور منصوبات',
    lessons: [
      {
        id: 'l6a',
        arabic: 'جُمْلَةٌ اِسْمِيَّة',
        title: 'جملہ اسمیہ',
        titleEn: 'Nominal Sentence',
        level: 'درمیانہ', tag: null,
        intro: 'وہ جملہ جو اسم سے شروع ہو۔ اس میں دو حصے ہوتے ہیں:',
        points: [
          { title: 'مُبْتَدَأ', arabic: 'اَللهُ / زَيْدٌ / الْكِتَابُ',    urdu: 'جس کے بارے میں بات کی جائے — ہمیشہ مرفوع' },
          { title: 'خَبَر',    arabic: 'أَكْبَرُ / عَالِمٌ / مُفِيْدٌ',  urdu: 'جو مبتدأ کے بارے میں بتائے — ہمیشہ مرفوع' },
        ],
        table: null,
        examples: [
          { arabic: 'اَللهُ أَكْبَرُ', urdu: 'اللہ سب سے بڑا ہے', breakdown: 'اَللهُ = مبتدأ  •  أَكْبَرُ = خبر (دونوں مرفوع)' },
          { arabic: 'إِنَّ اللهَ غَفُوْرٌ رَّحِيْمٌ', urdu: 'بے شک اللہ بخشنے والا رحم کرنے والا ہے', cite: 'البقرة ٢:١٧٣' },
        ],
      },
      {
        id: 'l6b',
        arabic: 'جُمْلَةٌ فِعْلِيَّة',
        title: 'جملہ فعلیہ',
        titleEn: 'Verbal Sentence',
        level: 'درمیانہ', tag: null,
        intro: 'وہ جملہ جو فعل سے شروع ہو۔ ترتیب: فعل + فاعل (+ مفعول):',
        points: [
          { title: 'فَاعِل',   arabic: 'زَيْدٌ / اَللهُ / الرَّسُوْلُ', urdu: 'کام کرنے والا — ہمیشہ مرفوع (پیش)' },
          { title: 'مَفْعُوْل بِه', arabic: 'الْكِتَابَ / زَيْدًا',      urdu: 'جس پر کام ہو — ہمیشہ منصوب (زبر)' },
        ],
        table: null,
        examples: [
          { arabic: 'ذَهَبَ زَيْدٌ إِلَى الْمَسْجِدِ', urdu: 'زید مسجد گیا', breakdown: 'ذَهَبَ = فعل  •  زَيْدٌ = فاعل (م)  •  الْمَسْجِدِ = مجرور بحرف' },
          { arabic: 'خَلَقَ اللهُ السَّمَاوَاتِ وَالْأَرْضَ', urdu: 'اللہ نے آسمانوں اور زمین کو پیدا کیا', cite: 'إبراهيم ١٤:١٩' },
        ],
      },
      {
        id: 'l6c',
        arabic: 'اَلْمَنْصُوْبَات',
        title: 'منصوبات',
        titleEn: 'Accusative Cases',
        level: 'اعلی', tag: null,
        intro: 'فعل کے بعد کئی اسم منصوب (زبر) کی حالت میں آتے ہیں:',
        points: [
          { title: 'مَفْعُوْلٌ بِه',    arabic: 'ضَرَبَ زَيْدٌ عَمْرًا',     urdu: 'وہ اسم جس پر فعل واقع ہو' },
          { title: 'مَفْعُوْلٌ فِيْه',  arabic: 'جَلَسَ يَوْمًا',             urdu: 'ظرف زمان/مکان — کب یا کہاں' },
          { title: 'مَفْعُوْلٌ مُطْلَق', arabic: 'ضَرَبَ ضَرْبًا شَدِيْدًا', urdu: 'مصدر — تاکید یا نوعیت بیان کرے' },
          { title: 'حَال',              arabic: 'جَاءَ زَيْدٌ رَاكِبًا',      urdu: 'فاعل/مفعول کی اس وقت کی حالت' },
          { title: 'تَمْيِيْز',         arabic: 'عِنْدِيْ عِشْرُوْنَ كِتَابًا', urdu: 'ابہام دور کرنے والا' },
        ],
        table: null,
        examples: [
          { arabic: 'وَكَلَّمَ اللهُ مُوْسٰى تَكْلِيْمًا', urdu: 'اور اللہ نے موسی سے خوب کلام فرمایا', cite: 'النساء ٤:١٦٤' },
          { arabic: 'جَاءَ الْحَقُّ وَزَهَقَ الْبَاطِلُ', urdu: 'حق آ گیا اور باطل مٹ گیا', cite: 'الإسراء ١٧:٨١' },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════
     CH 7  —  فعل  (Verb)
  ══════════════════════════════════════════════════════ */
  {
    id: 'ch7', icon: 'zap', color: FIL,
    title: 'فِعْل', titleEn: "Verb (Fi'l)",
    desc: 'فعل کی اقسام — ماضی، مضارع، امر، نہی',
    lessons: [
      {
        id: 'l7a',
        arabic: 'أَقْسَامُ الْفِعْل',
        title: 'فعل کی اقسام',
        titleEn: 'Types of Verb',
        level: 'ابتدائی', tag: FIL,
        intro: 'فعل کی تین بنیادی اقسام ہیں جو زمانہ ظاہر کرتی ہیں:',
        points: [
          { title: 'فِعْلُ الْمَاضِيْ',   arabic: 'ذَهَبَ  •  كَتَبَ  •  نَصَرَ',       urdu: 'گزرا ہوا کام۔ آخر میں زبر یا سکون', color: FIL },
          { title: 'فِعْلُ الْمُضَارِع',  arabic: 'يَذْهَبُ  •  يَكْتُبُ  •  يَنْصُرُ', urdu: 'ابھی ہو رہا ہے یا آئندہ ہوگا۔ شروع میں يَ/تَ/أَ/نَ', color: FIL },
          { title: 'فِعْلُ الْأَمْر',     arabic: 'اِذْهَبْ  •  اُكْتُبْ  •  اُنْصُرْ', urdu: 'حکم دینا — صیغہ امر', color: FIL },
        ],
        table: {
          headers: ['قسم', 'مثال', 'ترجمہ'],
          arabicCols: [1],
          rows: [
            ['ماضی', 'كَتَبَ', 'اس نے لکھا'],
            ['مضارع', 'يَكْتُبُ', 'وہ لکھتا ہے / لکھے گا'],
            ['امر', 'اُكْتُبْ', 'لکھو!'],
          ],
        },
        examples: [
          { arabic: 'خَلَقَ اللهُ السَّمَاوَاتِ', urdu: 'اللہ نے آسمانوں کو پیدا کیا  (ماضی)', cite: 'إبراهيم ١٤:١٩' },
          { arabic: 'يُسَبِّحُ لِلَّهِ مَا فِيْ السَّمَاوَاتِ', urdu: 'تسبیح کرتا ہے اللہ کی جو کچھ آسمانوں میں ہے  (مضارع)', cite: 'الجمعة ٦٢:١' },
          { arabic: 'اِقْرَأْ بِاسْمِ رَبِّكَ', urdu: 'اپنے رب کے نام سے پڑھو  (امر)', cite: 'العلق ٩٦:١' },
        ],
      },
      {
        id: 'l7b',
        arabic: 'فِعْلُ الْمَاضِي',
        title: 'فعل ماضی',
        titleEn: 'Past Tense Verb',
        level: 'ابتدائی', tag: FIL,
        intro: 'فعل ماضی گزرے ہوئے وقت کا کام ظاہر کرتا ہے۔ قاعدے:',
        points: [
          { title: 'بنیادی صیغہ',      arabic: 'فَعَلَ — ضَرَبَ، ذَهَبَ',  urdu: 'تین حروف پر مشتمل — غائب مذکر واحد کا صیغہ' },
          { title: 'مؤنث کی علامت',    arabic: 'ذَهَبَتْ / ضَرَبَتْ',       urdu: 'آخر میں تاء ساکن (تْ) — مؤنث' },
          { title: 'قَدْ کے ساتھ',     arabic: 'قَدْ أَفْلَحَ الْمُؤْمِنُوْنَ', urdu: '"قَدْ" آئے تو تاکید یا قربِ حال ظاہر ہوتی ہے' },
        ],
        table: null,
        examples: [
          { arabic: 'قَدْ أَفْلَحَ الْمُؤْمِنُوْنَ', urdu: 'بے شک مومن کامیاب ہو گئے', cite: 'المؤمنون ٢٣:١' },
          { arabic: 'أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ', urdu: 'کیا ہم نے آپ کے سینے کو نہیں کھولا', cite: 'الشرح ٩٤:١' },
        ],
      },
      {
        id: 'l7c',
        arabic: 'فِعْلُ الْمُضَارِع',
        title: 'فعل مضارع',
        titleEn: 'Present / Future Verb',
        level: 'درمیانہ', tag: FIL,
        intro: 'فعل مضارع حال یا مستقبل کا کام ظاہر کرتا ہے — شروع میں: أَ / نَ / يَ / تَ:',
        points: [
          { title: 'حروف مضارعت  (أَنَيْتُ)', arabic: 'يَكْتُبُ / تَكْتُبُ / أَكْتُبُ / نَكْتُبُ', urdu: 'ان چاروں میں سے ایک حرف شروع میں لازمی' },
          { title: 'حالتِ رفع',               arabic: 'يَكْتُبُ — آخر میں پیش',  urdu: 'جب فعل آزاد ہو (ناصب اور جازم نہ آئے)' },
          { title: 'حالتِ نصب',               arabic: 'لَنْ يَكْتُبَ / أَنْ يَكْتُبَ — زبر', urdu: '"لَنْ / أَنْ / كَيْ" کے بعد' },
          { title: 'حالتِ جزم',               arabic: 'لَمْ يَكْتُبْ — سکون', urdu: '"لَمْ / لَمَّا / لَا نہی" کے بعد' },
        ],
        table: null,
        examples: [
          { arabic: 'لَنْ تَنَالُوا الْبِرَّ حَتَّى تُنْفِقُوا', urdu: 'تم نیکی نہیں پا سکتے جب تک خرچ نہ کرو', cite: 'آل عمران ٣:٩٢' },
          { arabic: 'وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ', urdu: 'اور اس کا کوئی ہمسر نہیں', cite: 'الإخلاص ١١٢:٤' },
        ],
      },
      {
        id: 'l7d',
        arabic: 'فِعْلُ الْأَمْر',
        title: 'فعل امر',
        titleEn: 'Command Verb',
        level: 'درمیانہ', tag: FIL,
        intro: 'فعل امر حکم دینے کے لیے استعمال ہوتا ہے۔ مضارع سے بنایا جاتا ہے:',
        points: [
          { title: 'بنانے کا طریقہ', arabic: 'يَذْهَبُ  ←  اِذْهَبْ', urdu: 'مضارع سے حرفِ مضارعت ہٹائیں، آخر میں سکون' },
          { title: 'اگر ابتدا ساکن', arabic: 'اِكْتُبْ  •  اِقْرَأْ', urdu: 'شروع میں ہمزہ وصل (اِ) لگائیں' },
          { title: 'واحد مذکر',     arabic: 'اِذْهَبْ', urdu: 'جاؤ! (ایک مرد سے)' },
          { title: 'جمع مذکر',      arabic: 'اِذْهَبُوْا', urdu: 'جاؤ! (سب مردوں سے)' },
        ],
        table: null,
        examples: [
          { arabic: 'اِقْرَأْ بِاسْمِ رَبِّكَ الَّذِيْ خَلَقَ', urdu: 'پڑھو اپنے رب کے نام سے جس نے پیدا کیا', cite: 'العلق ٩٦:١' },
          { arabic: 'فَاذْكُرُوْنِيْ أَذْكُرْكُمْ', urdu: 'پس میرا ذکر کرو، میں تمہارا ذکر کروں گا', cite: 'البقرة ٢:١٥٢' },
          { arabic: 'وَأَقِيْمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ', urdu: 'اور نماز قائم کرو اور زکوٰة ادا کرو', cite: 'البقرة ٢:٤٣' },
        ],
      },
      {
        id: 'l7e',
        arabic: 'فِعْلُ النَّهْي',
        title: 'فعل نہی',
        titleEn: 'Prohibition',
        level: 'درمیانہ', tag: FIL,
        intro: 'منع کرنے کے لیے:  لَا (نہی) + فعل مضارع مجزوم:',
        points: [
          { title: 'قاعدہ',        arabic: 'لَا + مضارع مجزوم',  urdu: '"لَا" نہی کے بعد فعل مضارع آخر میں سکون لیتا ہے' },
          { title: 'واحد مذکر',   arabic: 'لَا تَذْهَبْ',        urdu: 'مت جاؤ! (ایک مرد)' },
          { title: 'واحد مؤنث',   arabic: 'لَا تَذْهَبِيْ',      urdu: 'مت جاؤ! (ایک عورت)' },
          { title: 'جمع مذکر',    arabic: 'لَا تَذْهَبُوْا',     urdu: 'مت جاؤ! (سب مرد)' },
        ],
        table: null,
        examples: [
          { arabic: 'لَا تَحْزَنْ إِنَّ اللهَ مَعَنَا', urdu: 'غم مت کرو، بے شک اللہ ہمارے ساتھ ہے', cite: 'التوبة ٩:٤٠' },
          { arabic: 'لَا تَقْنَطُوْا مِنْ رَحْمَةِ اللهِ', urdu: 'اللہ کی رحمت سے نا امید مت ہو', cite: 'الزمر ٣٩:٥٣' },
          { arabic: 'لَا تُفْسِدُوْا فِيْ الْأَرْضِ', urdu: 'زمین میں فساد مت کرو', cite: 'البقرة ٢:١١' },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════════════════════
     CH 8  —  گردان  (Conjugation Tables)
  ══════════════════════════════════════════════════════ */
  {
    id: 'ch8', icon: 'grid', color: GOLD_L,
    title: 'گَرْدَان', titleEn: 'Conjugation Tables',
    desc: 'مکمل گردانیں — ماضی، مضارع اور امر',
    lessons: [
      {
        id: 'l8a',
        arabic: 'گَرْدَانُ فِعْلِ الْمَاضِي',
        title: 'گردان فعل ماضی',
        titleEn: 'Past Tense Conjugation',
        level: 'درمیانہ', tag: FIL,
        intro: 'فعل "نَصَرَ" (مدد کرنا) کی مکمل گردان — ماضی معروف:',
        points: [],
        table: {
          headers: ['ضمیر', 'صیغہ', 'معنی'],
          arabicCols: [0, 1],
          rows: [
            ['هُوَ', 'نَصَرَ', 'اس نے (م) مدد کی'],
            ['هِيَ', 'نَصَرَتْ', 'اس نے (ث) مدد کی'],
            ['هُمَا (م)', 'نَصَرَا', 'ان دونوں نے (م)'],
            ['هُمَا (ث)', 'نَصَرَتَا', 'ان دونوں نے (ث)'],
            ['هُمْ', 'نَصَرُوْا', 'انہوں نے (جمع م)'],
            ['هُنَّ', 'نَصَرْنَ', 'انہوں نے (جمع ث)'],
            ['أَنْتَ', 'نَصَرْتَ', 'تم نے (م)'],
            ['أَنْتِ', 'نَصَرْتِ', 'تم نے (ث)'],
            ['أَنْتُمَا', 'نَصَرْتُمَا', 'تم دونوں نے'],
            ['أَنْتُمْ', 'نَصَرْتُمْ', 'تم سب نے (م)'],
            ['أَنْتُنَّ', 'نَصَرْتُنَّ', 'تم سب نے (ث)'],
            ['أَنَا', 'نَصَرْتُ', 'میں نے'],
            ['نَحْنُ', 'نَصَرْنَا', 'ہم نے'],
          ],
        },
        examples: [],
      },
      {
        id: 'l8b',
        arabic: 'گَرْدَانُ فِعْلِ الْمُضَارِع',
        title: 'گردان فعل مضارع',
        titleEn: 'Present/Future Conjugation',
        level: 'درمیانہ', tag: FIL,
        intro: 'فعل "يَنْصُرُ" کی مکمل گردان — مضارع معروف:',
        points: [],
        table: {
          headers: ['ضمیر', 'صیغہ', 'معنی'],
          arabicCols: [0, 1],
          rows: [
            ['هُوَ', 'يَنْصُرُ', 'وہ (م) مدد کرتا ہے'],
            ['هِيَ', 'تَنْصُرُ', 'وہ (ث) مدد کرتی ہے'],
            ['هُمَا (م)', 'يَنْصُرَانِ', 'وہ دونوں (م)'],
            ['هُمَا (ث)', 'تَنْصُرَانِ', 'وہ دونوں (ث)'],
            ['هُمْ', 'يَنْصُرُوْنَ', 'وہ سب (جمع م)'],
            ['هُنَّ', 'يَنْصُرْنَ', 'وہ سب (جمع ث)'],
            ['أَنْتَ', 'تَنْصُرُ', 'تم (م)'],
            ['أَنْتِ', 'تَنْصُرِيْنَ', 'تم (ث)'],
            ['أَنْتُمَا', 'تَنْصُرَانِ', 'تم دونوں'],
            ['أَنْتُمْ', 'تَنْصُرُوْنَ', 'تم سب (م)'],
            ['أَنْتُنَّ', 'تَنْصُرْنَ', 'تم سب (ث)'],
            ['أَنَا', 'أَنْصُرُ', 'میں'],
            ['نَحْنُ', 'نَنْصُرُ', 'ہم'],
          ],
        },
        examples: [],
      },
      {
        id: 'l8c',
        arabic: 'گَرْدَانُ فِعْلِ الْأَمْر',
        title: 'گردان فعل امر',
        titleEn: 'Command Conjugation',
        level: 'درمیانہ', tag: FIL,
        intro: 'فعل "اُنْصُرْ" (مدد کرو) کی گردان — امر معروف:',
        points: [],
        table: {
          headers: ['ضمیر', 'فعل امر', 'معنی'],
          arabicCols: [0, 1],
          rows: [
            ['أَنْتَ', 'اُنْصُرْ', 'مدد کرو (م واحد)'],
            ['أَنْتِ', 'اُنْصُرِيْ', 'مدد کرو (ث واحد)'],
            ['أَنْتُمَا', 'اُنْصُرَا', 'مدد کرو (مثنی)'],
            ['أَنْتُمْ', 'اُنْصُرُوْا', 'مدد کرو (م جمع)'],
            ['أَنْتُنَّ', 'اُنْصُرْنَ', 'مدد کرو (ث جمع)'],
          ],
        },
        examples: [
          { arabic: 'وَتَعَاوَنُوْا عَلَى الْبِرِّ وَالتَّقْوٰى', urdu: 'نیکی اور تقوی پر ایک دوسرے کی مدد کرو', cite: 'المائدة ٥:٢' },
          { arabic: 'اِنْصُرُوا اللهَ يَنْصُرْكُمْ', urdu: 'اللہ کی مدد کرو وہ تمہاری مدد کرے گا', cite: 'محمد ٤٧:٧' },
        ],
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────
   UI COMPONENTS
───────────────────────────────────────────────────────────────── */

function GrammarTable({ headers, rows, arabicCols = [1] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tableScroll}>
      <View>
        {/* Header row */}
        <View style={s.tableHeaderRow}>
          {headers.map((h, i) => (
            <View key={i} style={s.tableHeaderCell}>
              <Text style={s.tableHeaderTxt}>{h}</Text>
            </View>
          ))}
        </View>
        {/* Data rows */}
        {rows.map((row, ri) => (
          <View key={ri} style={[s.tableDataRow, ri % 2 === 0 && s.tableRowAlt]}>
            {row.map((cell, ci) => (
              <View key={ci} style={s.tableDataCell}>
                <Text style={[s.tableDataTxt, arabicCols.includes(ci) && s.tableArabicTxt]}>{cell}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function AyahBox({ arabic, urdu, cite, breakdown }) {
  return (
    <View style={s.ayahBox}>
      <View style={s.ayahGlow} />
      {cite ? (
        <View style={s.ayahRefBadge}>
          <Text style={s.ayahRefTxt}>{cite}</Text>
        </View>
      ) : null}
      <Text style={s.ayahArabic}>{arabic}</Text>
      <View style={s.ayahDivider} />
      <Text style={s.ayahUrdu}>{urdu}</Text>
      {breakdown ? (
        <View style={s.breakdownBox}>
          <Text style={s.breakdownTxt}>{breakdown}</Text>
        </View>
      ) : null}
    </View>
  );
}

function LessonModal({ lesson, chapter, visible, onClose }) {
  if (!lesson) return null;
  const tagColor = lesson.tag === ISM ? ISM : lesson.tag === FIL ? FIL : lesson.tag === HARF ? HARF : null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.modalScroll}>
            {/* Chapter badge + title */}
            <View style={s.modalTitleRow}>
              <View style={[s.chapterBadge, { backgroundColor: chapter.color + '25', borderColor: chapter.color + '50' }]}>
                <Feather name={chapter.icon} size={13} color={chapter.color} />
                <Text style={[s.chapterBadgeTxt, { color: chapter.color }]}>{chapter.titleEn}</Text>
              </View>
              {tagColor && (
                <View style={[s.wordTypeBadge, { backgroundColor: tagColor + '22' }]}>
                  <Text style={[s.wordTypeTxt, { color: tagColor }]}>
                    {lesson.tag === ISM ? 'اسم' : lesson.tag === FIL ? 'فعل' : 'حرف'}
                  </Text>
                </View>
              )}
            </View>

            <Text style={s.modalArabic}>{lesson.arabic}</Text>
            <Text style={s.modalTitle}>{lesson.title}</Text>
            <Text style={s.modalTitleEn}>{lesson.titleEn}</Text>

            {/* Level badge */}
            <View style={s.levelBadgeRow}>
              <View style={[s.levelBadge, { backgroundColor: lesson.level === 'ابتدائی' ? EMERALD + '50' : lesson.level === 'درمیانہ' ? GOLD + '30' : FIL + '30' }]}>
                <Text style={[s.levelTxt, { color: lesson.level === 'ابتدائی' ? EMERALD_L : lesson.level === 'درمیانہ' ? GOLD_L : FIL }]}>{lesson.level}</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={s.modalDivider} />

            {/* Intro */}
            {!!lesson.intro && (
              <Text style={s.introText}>{lesson.intro}</Text>
            )}

            {/* Key points */}
            {lesson.points.map((pt, idx) => (
              <View key={idx} style={[s.pointBox, { borderRightColor: pt.color || (tagColor || GOLD) }]}>
                <Text style={[s.pointTitle, { color: pt.color || GOLD_L }]}>{pt.title}</Text>
                {pt.arabic ? <Text style={s.pointArabic}>{pt.arabic}</Text> : null}
                <Text style={s.pointUrdu}>{pt.urdu}</Text>
              </View>
            ))}

            {/* Grammar Table */}
            {lesson.table && (
              <View style={s.tableWrap}>
                <View style={s.tableLabelRow}>
                  <Feather name="grid" size={12} color={TEXT_S} />
                  <Text style={s.tableLabel}>جدول</Text>
                </View>
                <GrammarTable headers={lesson.table.headers} rows={lesson.table.rows} arabicCols={lesson.table.arabicCols} />
              </View>
            )}

            {/* Quranic Examples */}
            {lesson.examples.length > 0 && (
              <View style={s.examplesWrap}>
                <View style={s.examplesLabelRow}>
                  <Feather name="star" size={12} color={GOLD} />
                  <Text style={s.examplesLabel}>قرآنی مثالیں</Text>
                </View>
                {lesson.examples.map((ex, i) => (
                  <AyahBox
                    key={i}
                    arabic={ex.arabic}
                    urdu={ex.urdu}
                    cite={ex.cite}
                    breakdown={ex.breakdown}
                  />
                ))}
              </View>
            )}

            {/* Close button */}
            <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Feather name="check-circle" size={16} color={BG} />
              <Text style={s.closeBtnTxt}>سبق مکمل کریں</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function LessonCard({ lesson, chapter, index, onPress }) {
  const tagColor = lesson.tag === ISM ? ISM : lesson.tag === FIL ? FIL : lesson.tag === HARF ? HARF : chapter.color;
  const levelColor = lesson.level === 'ابتدائی' ? EMERALD_L : lesson.level === 'درمیانہ' ? GOLD : FIL;

  return (
    <TouchableOpacity style={s.lessonCard} onPress={() => onPress(lesson)} activeOpacity={0.8}>
      {/* Left accent bar */}
      <View style={[s.lessonAccent, { backgroundColor: tagColor }]} />

      {/* Number */}
      <View style={[s.lessonNumBox, { backgroundColor: tagColor + '20' }]}>
        <Text style={[s.lessonNum, { color: tagColor }]}>{index + 1}</Text>
      </View>

      {/* Content */}
      <View style={s.lessonContent}>
        <Text style={s.lessonArabic}>{lesson.arabic}</Text>
        <Text style={s.lessonTitle}>{lesson.title}</Text>
        <Text style={s.lessonTitleEn}>{lesson.titleEn}</Text>
      </View>

      {/* Right: level + arrow */}
      <View style={s.lessonRight}>
        <View style={[s.lessonLevelBadge, { backgroundColor: levelColor + '20' }]}>
          <Text style={[s.lessonLevelTxt, { color: levelColor }]}>{lesson.level}</Text>
        </View>
        {lesson.table && <Feather name="grid" size={11} color={TEXT_S} style={{ marginTop: 6 }} />}
        <Feather name="chevron-left" size={16} color={TEXT_S} style={{ marginTop: 4 }} />
      </View>
    </TouchableOpacity>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN SCREEN
───────────────────────────────────────────────────────────────── */
export default function GrammarLearningScreen({ navigation }) {
  const [activeChIdx, setActiveChIdx] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const tabsScrollRef = useRef(null);
  const tabScrollX = useRef(0);

  const activeChapter = CHAPTERS[activeChIdx];

  const handleLessonPress = useCallback((lesson) => {
    setSelectedLesson(lesson);
    setShowModal(true);
  }, []);

  const totalLessons = CHAPTERS.reduce((acc, ch) => acc + ch.lessons.length, 0);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.iconBtn}>
          <Feather name="arrow-left" size={20} color={GOLD} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>عربی گرامر</Text>
          <Text style={s.headerSub}>Arabic Grammar Learning</Text>
        </View>
        <View style={[s.iconBtn, s.statsBox]}>
          <Text style={s.statsTxt}>{totalLessons}</Text>
          <Text style={s.statsLabel}>سبق</Text>
        </View>
      </View>

      {/* ── Chapter Tabs ── */}
      <View style={s.tabsWrapper}>
        <ScrollView
          ref={tabsScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabsContent}
          onScroll={e => { tabScrollX.current = e.nativeEvent.contentOffset.x; }}
          scrollEventThrottle={16}
        >
          {CHAPTERS.map((ch, i) => {
            const active = i === activeChIdx;
            return (
              <TouchableOpacity
                key={ch.id}
                style={[s.chTab, active && { backgroundColor: ch.color + '20', borderColor: ch.color }]}
                onPress={() => setActiveChIdx(i)}
                activeOpacity={0.8}
              >
                <Feather name={ch.icon} size={14} color={active ? ch.color : TEXT_S} />
                <Text style={[s.chTabTitle, active && { color: ch.color }]} numberOfLines={1}>{ch.title}</Text>
                <Text style={s.chTabCount}>{ch.lessons.length}</Text>
              </TouchableOpacity>
            );
          })}
          <View style={{ width: 8 }} />
        </ScrollView>

        {/* Right fade + chevron — tappable to scroll right */}
        <View style={s.tabsFadeRight}>
          <View style={s.tabsFadeTransparent} pointerEvents="none" />
          <TouchableOpacity
            style={s.tabsFadeSolid}
            onPress={() => {
              tabsScrollRef.current?.scrollTo({
                x: tabScrollX.current + 150,
                animated: true,
              });
            }}
            activeOpacity={0.7}
          >
            <Feather name="chevron-right" size={15} color={TEXT_S} style={{ opacity: 0.9 }} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Chapter header card ── */}
      <View style={[s.chapterCard, { borderColor: activeChapter.color + '40' }]}>
        <View style={[s.chapterIconBox, { backgroundColor: activeChapter.color + '18' }]}>
          <Feather name={activeChapter.icon} size={22} color={activeChapter.color} />
        </View>
        <View style={s.chapterInfo}>
          <Text style={[s.chapterTitle, { color: activeChapter.color }]}>{activeChapter.title}</Text>
          <Text style={s.chapterTitleEn}>{activeChapter.titleEn}</Text>
          <Text style={s.chapterDesc}>{activeChapter.desc}</Text>
        </View>
        <View style={[s.chapterCountBox, { backgroundColor: activeChapter.color + '15' }]}>
          <Text style={[s.chapterCountNum, { color: activeChapter.color }]}>{activeChapter.lessons.length}</Text>
          <Text style={s.chapterCountLabel}>سبق</Text>
        </View>
      </View>

      {/* ── Lesson list ── */}
      <FlatList
        data={activeChapter.lessons}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => (
          <LessonCard
            lesson={item}
            chapter={activeChapter}
            index={index}
            onPress={handleLessonPress}
          />
        )}
        contentContainerStyle={s.listPad}
        showsVerticalScrollIndicator={false}
      />

      {/* ── Lesson Modal ── */}
      <LessonModal
        lesson={selectedLesson}
        chapter={activeChapter}
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
    </View>
  );
}

/* ─────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: BORDER,
    backgroundColor: BG,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, color: TEXT, fontWeight: '700' },
  headerSub:   { fontSize: 11, color: TEXT_S, marginTop: 1 },
  statsBox: { flexDirection: 'column', gap: 0 },
  statsTxt:    { fontSize: 16, color: GOLD, fontWeight: '700', textAlign: 'center' },
  statsLabel:  { fontSize: 9, color: TEXT_S, textAlign: 'center' },

  /* Chapter tabs */
  tabsWrapper: {
    height: 68,
    overflow: 'hidden',
    justifyContent: 'center',
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  tabsFadeRight: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    width: 56, flexDirection: 'row',
  },
  tabsFadeTransparent: {
    flex: 1, backgroundColor: 'transparent',
  },
  tabsFadeSolid: {
    width: 32, backgroundColor: BG,
    alignItems: 'center', justifyContent: 'center',
  },
  tabsContent: { paddingHorizontal: 12, gap: 8, alignItems: 'center' },
  chTab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 13, height: 36, borderRadius: 20,
    backgroundColor: CARD, borderWidth: 1, borderColor: BORDER,
  },
  chTabTitle: { fontSize: 15, color: TEXT_S, fontWeight: '600', lineHeight: 36, includeFontPadding: false, textAlignVertical: 'center' },
  chTabCount: {
    fontSize: 10, color: TEXT_S,
    backgroundColor: CARD2, borderRadius: 10,
    paddingHorizontal: 5, paddingVertical: 1,
  },

  /* Chapter card */
  chapterCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: CARD, borderWidth: 1,
    marginHorizontal: 16, marginTop: 14, marginBottom: 6,
    borderRadius: 20, padding: 16,
  },
  chapterIconBox: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  chapterInfo:     { flex: 1 },
  chapterTitle:    { fontSize: 18, fontWeight: '700' },
  chapterTitleEn:  { fontSize: 12, color: TEXT_S, marginTop: 1 },
  chapterDesc:     { fontSize: 11, color: TEXT_S, marginTop: 4, lineHeight: 17 },
  chapterCountBox: { alignItems: 'center', borderRadius: 12, padding: 10, minWidth: 44 },
  chapterCountNum: { fontSize: 22, fontWeight: '700' },
  chapterCountLabel: { fontSize: 9, color: TEXT_S },

  /* Lesson list */
  listPad: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 60 },

  /* Lesson card */
  lessonCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderRadius: 18,
    borderWidth: 1, borderColor: BORDER,
    marginBottom: 10, overflow: 'hidden',
  },
  lessonAccent:   { width: 4, alignSelf: 'stretch' },
  lessonNumBox:   { width: 40, height: 40, borderRadius: 12, margin: 12, alignItems: 'center', justifyContent: 'center' },
  lessonNum:      { fontSize: 14, fontWeight: '700' },
  lessonContent:  { flex: 1, paddingVertical: 14 },
  lessonArabic:   { fontSize: 17, color: GOLD_L, textAlign: 'right', paddingRight: 4 },
  lessonTitle:    { fontSize: 14, color: TEXT, fontWeight: '600', textAlign: 'right', marginTop: 3 },
  lessonTitleEn:  { fontSize: 11, color: TEXT_S, textAlign: 'right', marginTop: 1 },
  lessonRight:    { alignItems: 'center', paddingRight: 14, paddingLeft: 6, gap: 2 },
  lessonLevelBadge: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  lessonLevelTxt: { fontSize: 9, fontWeight: '600' },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: CARD2,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '94%', paddingTop: 12,
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: BORDER, alignSelf: 'center', marginBottom: 4,
  },
  modalScroll: { paddingHorizontal: 22, paddingBottom: 40 },

  modalTitleRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, marginTop: 8 },
  chapterBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  chapterBadgeTxt: { fontSize: 11, fontWeight: '600' },
  wordTypeBadge:   { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  wordTypeTxt:     { fontSize: 11, fontWeight: '700' },

  modalArabic:  { fontSize: 28, color: GOLD_L, textAlign: 'center', lineHeight: 48 },
  modalTitle:   { fontSize: 18, color: TEXT, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  modalTitleEn: { fontSize: 12, color: TEXT_S, textAlign: 'center', marginTop: 2 },

  levelBadgeRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  levelBadge:    { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  levelTxt:      { fontSize: 12, fontWeight: '600' },

  modalDivider: { height: 1, backgroundColor: BORDER, marginVertical: 18 },

  introText: {
    fontSize: 14, color: TEXT,
    textAlign: 'right', lineHeight: 26, marginBottom: 14,
  },

  /* Key point boxes */
  pointBox: {
    backgroundColor: CARD, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER,
    borderRightWidth: 4,
    paddingVertical: 12, paddingHorizontal: 14,
    marginBottom: 10,
  },
  pointTitle:  { fontSize: 14, fontWeight: '700', textAlign: 'right', marginBottom: 5 },
  pointArabic: { fontSize: 18, color: GOLD_L, textAlign: 'right', lineHeight: 36, marginBottom: 4 },
  pointUrdu:   { fontSize: 13, color: TEXT_S, textAlign: 'right', lineHeight: 22 },

  /* Table */
  tableWrap: { marginTop: 8, marginBottom: 16 },
  tableLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  tableLabel: { fontSize: 12, color: TEXT_S },
  tableScroll: { borderRadius: 14, overflow: 'hidden' },
  tableHeaderRow: { flexDirection: 'row-reverse', backgroundColor: GOLD + '25' },
  tableHeaderCell: { paddingHorizontal: 14, paddingVertical: 10, minWidth: 90, borderLeftWidth: 1, borderLeftColor: BORDER, alignItems: 'flex-end' },
  tableHeaderTxt: { fontSize: 12, color: GOLD_L, fontWeight: '700', textAlign: 'right' },
  tableDataRow:   { flexDirection: 'row-reverse', borderTopWidth: 1, borderTopColor: BORDER },
  tableRowAlt:    { backgroundColor: BG + '88' },
  tableDataCell:  { paddingHorizontal: 14, paddingVertical: 10, minWidth: 90, borderLeftWidth: 1, borderLeftColor: BORDER, justifyContent: 'center', alignItems: 'flex-end' },
  tableDataTxt:   { fontSize: 12, color: TEXT_S, textAlign: 'right' },
  tableArabicTxt: { fontSize: 15, color: TEXT, textAlign: 'right' },

  /* Quranic examples */
  examplesWrap:     { marginTop: 4, marginBottom: 10 },
  examplesLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  examplesLabel:    { fontSize: 12, color: GOLD },

  ayahBox: {
    backgroundColor: EMERALD + '25',
    borderRadius: 16, borderWidth: 1, borderColor: GOLD + '25',
    paddingHorizontal: 18, paddingVertical: 14,
    marginBottom: 12, overflow: 'hidden',
  },
  ayahGlow: {
    position: 'absolute', top: -10, right: -10,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: GOLD + '10',
  },
  ayahRefBadge: {
    alignSelf: 'center',
    backgroundColor: GOLD + '20', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3, marginBottom: 10,
  },
  ayahRefTxt:  { fontSize: 10, color: GOLD, textAlign: 'center' },
  ayahArabic:  { fontSize: 20, color: TEXT, textAlign: 'center', lineHeight: 40, marginBottom: 8 },
  ayahDivider: { height: 0.7, backgroundColor: GOLD + '30', marginBottom: 8 },
  ayahUrdu:    { fontSize: 13, color: TEXT_S, textAlign: 'center', lineHeight: 22 },
  breakdownBox: {
    backgroundColor: BG + 'AA', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, marginTop: 10,
  },
  breakdownTxt: { fontSize: 11, color: EMERALD_L, textAlign: 'center', lineHeight: 20 },

  /* Close button */
  closeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: GOLD, borderRadius: 16,
    paddingVertical: 14, marginTop: 20,
  },
  closeBtnTxt: { fontSize: 15, color: BG, fontWeight: '700' },
});
