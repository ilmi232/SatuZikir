'use client';

import { useEffect, useState, useCallback } from 'react';

export function useWakeLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(typeof navigator !== 'undefined' && 'wakeLock' in navigator);
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;

    try {
      type WakeLockSentinelType = { release: () => Promise<void>; addEventListener: (event: string, cb: () => void) => void };
      const wakeLockApi = (navigator as unknown as { wakeLock: { request: (type: string) => Promise<WakeLockSentinelType> } }).wakeLock;
      const sentinel = await wakeLockApi.request('screen');
      setIsLocked(true);

      sentinel.addEventListener('release', () => {
        setIsLocked(false);
      });
    } catch {
      setIsLocked(false);
    }
  }, []);

  return { isLocked, isSupported, requestWakeLock };
}
