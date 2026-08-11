import { NextResponse } from 'next/server';
import SoundCloud from 'soundcloud-scraper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Cache the client as a module-level singleton so we don't re-fetch the
// SoundCloud client_id on every single request (saves ~500ms per call)
let cachedClient: InstanceType<typeof SoundCloud.Client> | null = null;
function getClient() {
    if (!cachedClient) {
        cachedClient = new SoundCloud.Client();
    }
    return cachedClient;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('URL is required', { status: 400 });
    }

    if (!url.includes('soundcloud.com')) {
        return new NextResponse('Invalid SoundCloud URL', { status: 400 });
    }

    try {
        const client = getClient();

        // Get song info which contains the stream API endpoint
        const song = await client.getSongInfo(url);

        if (!song.streams?.progressive) {
            return new NextResponse('No stream available for this track', { status: 404 });
        }

        // Resolve the actual CDN URL (e.g. playback.media-streaming.soundcloud.cloud/...)
        // This avoids private-track errors from downloadProgressive() and is much faster
        const cdnUrl = await client.fetchStreamURL(song.streams.progressive);

        if (!cdnUrl) {
            return new NextResponse('Could not resolve stream URL', { status: 404 });
        }

        // 307 redirect so the browser fetches audio directly from SoundCloud's CDN.
        // This means:
        //  - Full Content-Length header → progress bar and seeking work correctly
        //  - No audio data is proxied through our Vercel function → much faster
        return NextResponse.redirect(cdnUrl, { status: 307 });
    } catch (error: any) {
        console.error('Stream API error:', error?.message ?? error);

        // If the cached client has gone stale (client_id expired), reset it
        if (error?.message?.includes('401') || error?.message?.includes('403')) {
            cachedClient = null;
        }

        return new NextResponse('Failed to stream audio', { status: 500 });
    }
}
