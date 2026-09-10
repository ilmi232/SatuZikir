'use client';
import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('satuzikir_theme') as Theme | null;
      if (saved === 'dark') {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
    } catch { /* ignore */ }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('satuzikir_theme', next);
        if (next === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
