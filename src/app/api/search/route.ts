import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=15`);
        const data = await response.json();

        const results = data.results.map((track: any) => ({
            id: track.trackId,
            title: track.trackName,
            artist: track.artistName,
            albumArt: track.artworkUrl100,
            url: track.previewUrl,
            source: 'itunes',
            duration: track.trackTimeMillis / 1000
        })).filter((t: any) => t.url); // only include tracks with previews

        return NextResponse.json(results);
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
    }
}
