import { NextResponse } from 'next/server';
import SoundCloud from 'soundcloud-scraper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Singleton client - avoids re-fetching client_id on every search request
let cachedClient: InstanceType<typeof SoundCloud.Client> | null = null;
function getClient() {
    if (!cachedClient) {
        cachedClient = new SoundCloud.Client();
    }
    return cachedClient;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        const client = getClient();
        const results = await client.search(query, 'track');

        // Take top 15 results
        const tracks = results.slice(0, 15).map((track: any) => ({
            id: track.url,
            title: track.name,
            artist: track.artist,
            albumArt: track.thumbnail || '',
            url: track.url,
            source: 'soundcloud',
            duration: track.duration ? track.duration / 1000 : 0
        }));

        return NextResponse.json(tracks);
    } catch (error: any) {
        console.error('Search API error:', error?.message ?? error);

        // Reset stale client on auth errors
        if (error?.message?.includes('401') || error?.message?.includes('403')) {
            cachedClient = null;
        }

        return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
    }
}
