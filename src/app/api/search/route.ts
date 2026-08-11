import { NextResponse } from 'next/server';
import SoundCloud from 'soundcloud-scraper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        const client = new SoundCloud.Client();
        const results = await client.search(query, 'track');
        
        // Take top 15 results
        const tracks = results.slice(0, 15).map((track: any) => ({
            id: track.url, // SoundCloud uses full URL as unique identifier for streaming
            title: track.name,
            artist: track.artist,
            albumArt: track.thumbnail || '',
            url: track.url,
            source: 'soundcloud',
            duration: track.duration ? track.duration / 1000 : 0
        }));

        return NextResponse.json(tracks);
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
    }
}
