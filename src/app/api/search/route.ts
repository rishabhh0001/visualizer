import { NextResponse } from 'next/server';
import ytSearch from 'yt-search';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        const r = await ytSearch(query);
        const videos = r.videos.slice(0, 15);

        const results = videos.map((track) => ({
            id: track.videoId,
            title: track.title,
            artist: track.author.name,
            albumArt: track.thumbnail,
            url: track.url,
            source: 'youtube',
            duration: track.seconds
        }));

        return NextResponse.json(results);
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
    }
}
