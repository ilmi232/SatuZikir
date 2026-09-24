'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, isSupabaseConfigured } from './supabase';

// Mode demo = Supabase belum dikonfigurasi; semua data hanya ada di localStorage
// browser ini, jadi "login" demo tidak membuka akses ke data siapa pun.
export const isAdminDemoMode = !isSupabaseConfigured;

const DEMO_SESSION_KEY = 'satuzikir_demo_admin';

async function hasAdminRole(): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase.rpc('is_admin');
  return !error && data === true;
}

export async function signInAdmin(email: string, password: string): Promise<void> {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.');

  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error('Email atau kata sandi salah.');

  if (!(await hasAdminRole())) {
    await supabase.auth.signOut();
    throw new Error('Akun ini belum terdaftar sebagai admin SatuZikir.');
  }
}

export function signInDemoAdmin() {
  try {
    sessionStorage.setItem(DEMO_SESSION_KEY, 'true');
  } catch {
    // ignore
  }
}

export async function signOutAdmin() {
  try {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  } catch {
    // ignore
  }
  await supabase?.auth.signOut();
}

export async function isAdminSignedIn(): Promise<boolean> {
  if (isAdminDemoMode) {
    try {
      return sessionStorage.getItem(DEMO_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  }
  const { data } = await supabase!.auth.getSession();
  return Boolean(data.session) && (await hasAdminRole());
}

/** fetch() yang menyertakan token sesi admin untuk route handler yang dilindungi. */
export async function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session) headers.set('Authorization', `Bearer ${data.session.access_token}`);
  }
  return fetch(input, { ...init, headers });
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
