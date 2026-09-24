'use client';

import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

/**
 * false saat render server & hydration, true setelahnya. Dipakai untuk membaca
 * localStorage/navigator tanpa hydration mismatch dan tanpa setState di effect.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
