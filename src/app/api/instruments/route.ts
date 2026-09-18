import { NextResponse } from 'next/server';
import { INSTRUMENT_OPTIONS } from '@/audio/audio.constants';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: INSTRUMENT_OPTIONS,
  });
}
