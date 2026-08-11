import { NextResponse } from 'next/server';
import YouTube from 'youtube-sr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        const videos = await YouTube.search(query, { limit: 15, type: 'video' });

        const results = videos.map((track) => ({
            id: track.id,
            title: track.title,
            artist: track.channel?.name || 'Unknown Artist',
            albumArt: track.thumbnail?.url || '',
            url: track.url,
            source: 'youtube',
            duration: track.duration ? track.duration / 1000 : 0
        }));

        return NextResponse.json(results);
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
    }
}
