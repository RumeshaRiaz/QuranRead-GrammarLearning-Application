import { createContext, useContext, useState, useCallback } from 'react';

/* ══════════════════════════════════════════════════════
   DARK PALETTE  (original)
══════════════════════════════════════════════════════ */
const DARK = {
  BG:           '#0C1520',
  CARD:         '#111E2E',
  CARD2:        '#16253A',
  VERSE_BG:     '#111E2E',
  VERSE_BORDER: 'rgba(201,168,76,0.22)',
  GOLD:         '#C9A84C',
  GOLD_L:       '#E8C875',
  EMERALD:      '#1B4332',
  EMERALD_L:    '#5A8A6A',
  TEXT:         '#F0EAD6',
  TEXT_S:       '#7A9E8A',
  BORDER:      'rgba(201,168,76,0.13)',
  // word-type colors (grammar / i’rab)
  ISM_C:       '#C9A84C',
  FIL_C:       '#5CB85C',
  HARF_C:      '#5B9BD5',
  ISM:         '#4A90D9',
  FIL:         '#E8734A',
  HARF:        '#9B59B6',
  // status bar
  statusBar: 'light-content',
};

/* ══════════════════════════════════════════════════════
   LIGHT PALETTE
══════════════════════════════════════════════════════ */
const LIGHT = {
  BG:           '#F8F5EE',
  CARD:         '#FFFFFF',
  CARD2:        '#F0ECE3',
  VERSE_BG:     '#FEF3DC',
  VERSE_BORDER: '#D4A927',
  GOLD:         '#B8941F',
  GOLD_L:       '#C9A530',
  EMERALD:      '#E0F0E4',
  EMERALD_L:    '#2E7D4F',
  TEXT:         '#1A1A2E',
  TEXT_S:       '#5A6B5E',
  BORDER:      'rgba(184,148,31,0.32)',
  // word-type colors
  ISM_C:       '#B8941F',
  FIL_C:       '#3D8B3D',
  HARF_C:      '#4A7FB5',
  ISM:         '#3A70B0',
  FIL:         '#D05A30',
  HARF:        '#7E3FA0',
  // status bar
  statusBar: 'dark-content',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = useCallback(() => setIsDark(prev => !prev), []);
  const colors = isDark ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
