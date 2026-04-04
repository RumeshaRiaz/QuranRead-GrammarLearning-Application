# قرآن لرننگ ایپ 🕌

## React Native (Expo) - بنیادی سیٹ اپ

---

## فولڈر ڈھانچہ

```
QuranApp/
├── App.js                          ← مرکزی فائل
├── app.json                        ← Expo کنفیگریشن
├── package.json                    ← packages فہرست
├── babel.config.js
└── src/
    ├── assets/
    │   └── theme.js                ← رنگ اور فونٹ
    ├── data/
    │   └── quranData.js            ← نمونہ ڈیٹا
    ├── navigation/
    │   └── AppNavigator.js         ← نیویگیشن
    └── screens/
        ├── HomeScreen.js           ← مرکزی صفحہ
        ├── QuranReadingScreen.js   ← قرآن پڑھنا
        └── GrammarLearningScreen.js ← گرامر سبق
```

---

## چلانے کا طریقہ

### پہلا قدم - Node.js انسٹال کریں
https://nodejs.org سے LTS version ڈاؤنلوڈ کریں

### دوسرا قدم - Expo CLI انسٹال کریں
```bash
npm install -g expo-cli
```

### تیسرا قدم - اس فولڈر میں جائیں
```bash
cd QuranApp
```

### چوتھا قدم - Packages انسٹال کریں
```bash
npm install
```

### پانچواں قدم - ایپ چلائیں
```bash
npx expo start
```

### چھٹا قدم - فون پر دیکھیں
1. فون پر **Expo Go** ایپ انسٹال کریں
2. QR کوڈ اسکین کریں

---

## ابھی کیا بنا ہے

✅ مرکزی صفحہ (Home) - دو آپشن
✅ قرآن پڑھنے کا صفحہ
  - آیت پر کلک → تفصیل پینل
  - لفظ پر کلک → گرامر تفصیل
  - ترجمہ toggle
✅ گرامر سیکھنے کا صفحہ
  - 7 ابتدائی سبق
  - سطح کے مطابق فلٹر
  - تفصیلی سبق modal
✅ اسلامی رنگ تھیم (گہرا سبز + سنہری)
✅ اردو اور عربی متن
✅ Animations

---

## آگے کیا کرنا ہے

### ڈیٹا کے لیے:
1. Quran.com API سے مکمل قرآن ڈیٹا لیں:
   `https://api.quran.com/api/v4/verses/by_chapter/1`

2. Urdu ترجمہ (Jalandhari):
   `https://api.quran.com/api/v4/quran/translations/97`

3. Quranic Corpus سے grammar data:
   `http://corpus.quran.com/download/`

### فیچر کے لیے:
- SQLite database برائے offline
- Arabic Tajweed font (Amiri)
- Word-by-word highlight
- AI integration (Claude API)
- Tafseer section

---

## رنگوں کا نظام

| رنگ | مطلب |
|-----|------|
| فیروزی | اسم (Noun) |
| سرخ | فعل (Verb) |
| ہلکا فیروزی | حرف (Particle) |
| نیلا | مرفوع |
| نارنجی | منصوب |
| سبز | مجرور |

---

بنایا: Claude Sonnet کے ذریعے 🤖
