/**
 * Reading Progress Utility
 * Saves / loads the user's last-read position to AsyncStorage.
 *
 * Stored shape:
 * {
 *   surahNum:   number,   // e.g. 2
 *   surahEn:    string,   // e.g. "Al-Baqarah"
 *   surahAr:    string,   // e.g. "البقرة"
 *   ayahNum:    number,   // e.g. 142
 *   totalAyahs: number,   // e.g. 286
 *   savedAt:    number,   // Date.now()
 * }
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@quran_last_read';

export async function saveProgress(data) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
  } catch (_) {}
}

export async function loadProgress() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export async function clearProgress() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (_) {}
}
