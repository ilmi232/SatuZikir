import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/serverAuth';

export async function GET(req: Request) {
  return NextResponse.json({ admin: isAdminRequest(req) }, { headers: { 'Cache-Control': 'no-store' } });
}
