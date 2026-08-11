import { NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cache the Innertube client — it boots a session with YouTube on first create()
let cachedYt: Awaited<ReturnType<typeof Innertube.create>> | null = null;
async function getYt() {
    if (!cachedYt) {
        cachedYt = await Innertube.create();
    }
    return cachedYt;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        const yt = await getYt();
        const search = await yt.search(query, { type: 'video' });

        const results = search.results
            ?.filter((item: any) => item.type === 'Video' && item.video_id)
            .slice(0, 15)
            .map((item: any) => ({
                id: item.video_id,
                title: item.title?.text ?? 'Unknown',
                artist: item.author?.name ?? 'Unknown Artist',
                albumArt: item.thumbnails?.[0]?.url ?? '',
                // url is the SoundCloud search query passed to /api/stream,
                // but since we now stream YouTube we pass the youtube URL
                url: `https://www.youtube.com/watch?v=${item.video_id}`,
                source: 'youtube',
                duration: 0,
            })) ?? [];

        return NextResponse.json(results);
    } catch (error: any) {
        console.error('Search API error:', error?.message ?? error);

        // Reset stale client on session errors
        cachedYt = null;

        return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
    }
}
