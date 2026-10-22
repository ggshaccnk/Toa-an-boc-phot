import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text')?.trim();

  if (!text) {
    return new NextResponse('Missing text parameter', { status: 400 });
  }

  // Google Translate TTS limit is 200 chars per chunk
  const cleanText = text.slice(0, 190);
  const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(
    cleanText
  )}`;

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://translate.google.com/',
      },
    });

    if (!res.ok) {
      return new NextResponse('Failed to fetch TTS from Google', {
        status: res.status,
      });
    }

    const audioBuffer = await res.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (err: any) {
    return new NextResponse(err.message || 'TTS Error', { status: 500 });
  }
}
