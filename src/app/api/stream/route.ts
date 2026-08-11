import { NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js';
import { execFile } from 'child_process';
import { promisify } from 'util';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const execFileAsync = promisify(execFile);

// Cache Innertube session (for YouTube search only, not streaming)
let cachedYt: Awaited<ReturnType<typeof Innertube.create>> | null = null;
async function getYt() {
    if (!cachedYt) cachedYt = await Innertube.create();
    return cachedYt;
}

// Find YouTube video ID for a search query using youtubei.js
async function findYouTubeVideoId(query: string): Promise<string | null> {
    try {
        const yt = await getYt();
        const results = await yt.search(query, { type: 'video' });
        const video = results.results?.find((r: any) => r.type === 'Video' && r.video_id);
        return (video as any)?.video_id ?? null;
    } catch {
        return null;
    }
}

// Get direct audio URL via yt-dlp subprocess
async function getAudioUrlViaYtDlp(youtubeUrl: string): Promise<string | null> {
    try {
        const { stdout } = await execFileAsync(
            'yt-dlp',
            [
                '-f', 'bestaudio[ext=m4a]/bestaudio/best',
                '--get-url',
                '--no-warnings',
                '--no-playlist',
                youtubeUrl,
            ],
            { timeout: 15000 }
        );
        const url = stdout.trim().split('\n')[0];
        return url || null;
    } catch {
        return null;
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('URL is required', { status: 400 });
    }

    try {
        let youtubeUrl: string | null = null;

        // --- Handle yt-search: protocol (Spotify search result) ---
        if (url.startsWith('yt-search:')) {
            const query = decodeURIComponent(url.replace('yt-search:', ''));
            const videoId = await findYouTubeVideoId(query);
            if (!videoId) {
                return new NextResponse('No YouTube result found for query', { status: 404 });
            }
            youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        }
        // --- Handle direct YouTube URLs ---
        else if (url.includes('youtube.com') || url.includes('youtu.be')) {
            youtubeUrl = url;
        }
        // --- Handle SoundCloud URLs ---
        else if (url.includes('soundcloud.com')) {
            const SoundCloud = (await import('soundcloud-scraper')).default;
            const client = new SoundCloud.Client();
            const song = await client.getSongInfo(url);
            const rawUrl = song.streams?.progressive || song.streams?.hls;
            if (!rawUrl) return new NextResponse('No SoundCloud stream', { status: 404 });
            const progressiveUrl = rawUrl.replace('/stream/hls', '/stream/progressive');
            const cdnUrl = await client.fetchStreamURL(progressiveUrl).catch(() => null)
                ?? await client.fetchStreamURL(rawUrl).catch(() => null);
            if (!cdnUrl) return new NextResponse('Could not resolve SoundCloud stream', { status: 404 });
            return NextResponse.redirect(cdnUrl, { status: 307 });
        } else {
            return new NextResponse('Unsupported URL', { status: 400 });
        }

        // --- Stream YouTube audio via yt-dlp ---
        if (!youtubeUrl) return new NextResponse('Could not resolve YouTube URL', { status: 404 });

        const audioUrl = await getAudioUrlViaYtDlp(youtubeUrl);
        if (!audioUrl) {
            return new NextResponse('Failed to extract audio URL', { status: 500 });
        }

        // Redirect to the direct CDN URL — browser handles the stream
        return NextResponse.redirect(audioUrl, { status: 307 });

    } catch (error: any) {
        console.error('Stream error:', error?.message ?? error);
        return new NextResponse('Stream failed', { status: 500 });
    }
}
