import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';
import SoundCloud from 'soundcloud-scraper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Cached SoundCloud client singleton
let cachedSC: InstanceType<typeof SoundCloud.Client> | null = null;
function getSC() {
    if (!cachedSC) cachedSC = new SoundCloud.Client();
    return cachedSC;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('URL is required', { status: 400 });
    }

    // --- SoundCloud stream path ---
    if (url.includes('soundcloud.com')) {
        try {
            const client = getSC();
            const song = await client.getSongInfo(url);

            const rawUrl = song.streams?.progressive || song.streams?.hls;
            if (!rawUrl) return new NextResponse('No stream available', { status: 404 });

            // Force progressive endpoint (may be HLS URL masquerading as progressive)
            const progressiveApiUrl = rawUrl.replace('/stream/hls', '/stream/progressive');

            let cdnUrl = await client.fetchStreamURL(progressiveApiUrl).catch(() => null);
            if (!cdnUrl && progressiveApiUrl !== rawUrl) {
                cdnUrl = await client.fetchStreamURL(rawUrl).catch(() => null);
            }
            if (!cdnUrl) return new NextResponse('Could not resolve stream URL', { status: 404 });

            return NextResponse.redirect(cdnUrl, { status: 307 });
        } catch (error: any) {
            console.error('SoundCloud stream error:', error?.message ?? error);
            if (error?.message?.includes('401') || error?.message?.includes('403')) cachedSC = null;
            return new NextResponse('Failed to stream audio', { status: 500 });
        }
    }

    // --- YouTube stream path ---
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        try {
            if (!ytdl.validateURL(url)) {
                return new NextResponse('Invalid YouTube URL', { status: 400 });
            }

            const info = await ytdl.getInfo(url);

            // Prefer audio-only formats; fall back to lowest video+audio if needed
            let format = ytdl.chooseFormat(info.formats, {
                quality: 'highestaudio',
                filter: 'audioonly',
            });
            if (!format) {
                format = ytdl.chooseFormat(info.formats, { quality: 'lowest' });
            }
            if (!format) {
                return new NextResponse('No audio format found', { status: 404 });
            }

            // If we have a direct URL (no cipher needed), redirect — otherwise proxy
            if (format.url) {
                return NextResponse.redirect(format.url, { status: 307 });
            }

            // Proxy stream through our function
            const stream = ytdl(url, { format });
            const headers = new Headers();
            headers.set('Access-Control-Allow-Origin', '*');
            headers.set('Content-Type', format.mimeType || 'audio/mp4');
            headers.set('Accept-Ranges', 'bytes');
            if (format.contentLength) headers.set('Content-Length', format.contentLength);

            return new NextResponse(stream as any, { status: 200, headers });
        } catch (error: any) {
            console.error('YouTube stream error:', error?.message ?? error);
            return new NextResponse('Failed to stream audio', { status: 500 });
        }
    }

    return new NextResponse('Unsupported URL', { status: 400 });
}
