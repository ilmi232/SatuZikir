import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_SECONDS,
  LOGIN_LIMITS,
  clearLoginFailures,
  clientIp,
  createSessionToken,
  getLockedUntil,
  isPinCorrect,
  recordLoginFailure,
} from '@/lib/serverAuth';

function lockedResponse(until: number) {
  const retryAfterSec = Math.max(1, Math.ceil((until - Date.now()) / 1000));
  return NextResponse.json(
    {
      error: `Terlalu banyak percobaan PIN salah. Coba lagi dalam ${Math.ceil(retryAfterSec / 60)} menit.`,
      retryAfterSec,
    },
    { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
  );
}

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);

    const lockedUntil = await getLockedUntil(ip);
    if (lockedUntil) return lockedResponse(lockedUntil);

    const body = await req.json().catch(() => ({}));
    const pin = typeof body.pin === 'string' ? body.pin.trim() : '';

    if (!isPinCorrect(pin)) {
      await recordLoginFailure(ip);
      const nowLocked = await getLockedUntil(ip);
      if (nowLocked) return lockedResponse(nowLocked);
      return NextResponse.json(
        { error: `PIN salah. Setelah ${LOGIN_LIMITS.IP_MAX_FAILURES}x salah, login dijeda 15 menit.` },
        { status: 401 }
      );
    }

    await clearLoginFailures(ip);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, createSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: ADMIN_SESSION_SECONDS,
    });
    return res;
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json(
      { error: `Login admin belum bisa dipakai: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
