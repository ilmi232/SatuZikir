'use client';
import { useState, useCallback } from 'react';
import { useIsClient } from './useIsClient';

export type Theme = 'light' | 'dark';

function readStoredTheme(): Theme {
  try {
    return localStorage.getItem('satuzikir_theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function useTheme() {
  const isClient = useIsClient();
  // null = ikuti pilihan tersimpan (kelas .dark sudah dipasang skrip anti-FOUC di layout)
  const [chosen, setChosen] = useState<Theme | null>(null);
  const theme: Theme = chosen ?? (isClient ? readStoredTheme() : 'light');

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setChosen(next);
    try {
      localStorage.setItem('satuzikir_theme', next);
    } catch { /* ignore */ }
    document.documentElement.classList.toggle('dark', next === 'dark');
  }, [theme]);

  return { theme, toggleTheme };
}
