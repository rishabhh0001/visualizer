import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SpotifyToken {
    access_token: string;
    expires_at: number;
}

let cachedToken: SpotifyToken | null = null;

async function getSpotifyToken(): Promise<string> {
    if (cachedToken && Date.now() < cachedToken.expires_at) {
        return cachedToken.access_token;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID!;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
    const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${creds}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!res.ok) throw new Error(`Spotify auth failed: ${res.status}`);
    const data = await res.json();

    cachedToken = {
        access_token: data.access_token,
        expires_at: Date.now() + (data.expires_in - 60) * 1000, // refresh 60s early
    };

    return cachedToken.access_token;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        const token = await getSpotifyToken();

        const res = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=15&market=US`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) {
            // Token may have expired externally
            cachedToken = null;
            throw new Error(`Spotify search failed: ${res.status}`);
        }

        const data = await res.json();

        const results = (data.tracks?.items ?? []).map((track: any) => ({
            id: track.id,
            title: track.name,
            artist: track.artists.map((a: any) => a.name).join(', '),
            album: track.album?.name ?? '',
            albumArt: track.album?.images?.[0]?.url ?? '',
            duration: Math.floor((track.duration_ms ?? 0) / 1000),
            // Pass title + artist so the stream route can search YouTube for the full track
            url: `yt-search:${encodeURIComponent(`${track.name} ${track.artists[0]?.name ?? ''}`)}`,
            source: 'spotify',
        }));

        return NextResponse.json(results);
    } catch (error: any) {
        console.error('Search API error:', error?.message ?? error);
        return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
    }
}
