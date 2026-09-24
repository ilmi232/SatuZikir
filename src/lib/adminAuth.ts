'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Login admin memakai PIN 6 digit yang diperiksa di server. Server mengirim
// cookie sesi httpOnly, jadi browser tidak pernah menyimpan PIN atau token.

/** Panggil route /api/admin/* dan lempar Error berisi pesan dari server. */
export async function adminApi<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  const res = await fetch(path, { ...init, headers, credentials: 'same-origin' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Permintaan gagal (HTTP ${res.status})`) as Error & {
      retryAfterSec?: number;
    };
    err.retryAfterSec = data.retryAfterSec;
    throw err;
  }
  return data as T;
}

export async function signInAdmin(pin: string): Promise<void> {
  await adminApi('/api/admin/login', { method: 'POST', body: JSON.stringify({ pin }) });
}

export async function signOutAdmin(): Promise<void> {
  await adminApi('/api/admin/logout', { method: 'POST' }).catch(() => {});
}

export async function isAdminSignedIn(): Promise<boolean> {
  try {
    const { admin } = await adminApi<{ admin: boolean }>('/api/admin/session');
    return admin;
  } catch {
    return false;
  }
}

/** fetch() untuk route admin yang tidak mengembalikan JSON (mis. skema SQL). */
export function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
  return fetch(input, { ...init, credentials: 'same-origin' });
}

/** Redirect ke /admin/login jika belum login sebagai admin. */
export function useAdminGuard(): boolean {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    isAdminSignedIn().then((ok) => {
      if (cancelled) return;
      if (ok) setReady(true);
      else router.replace('/admin/login');
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return ready;
}
