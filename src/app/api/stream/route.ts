import { NextResponse } from 'next/server';
import SoundCloud from 'soundcloud-scraper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Ensure this runs in Node, not Edge

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('URL is required', { status: 400 });
    }

    try {
        const client = new SoundCloud.Client();
        
        // Ensure it's a soundcloud URL
        if (!url.includes('soundcloud.com')) {
            return new NextResponse('Invalid SoundCloud URL', { status: 400 });
        }

        const song = await client.getSongInfo(url);
        const stream = await song.downloadProgressive();

        const headers = new Headers();
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Content-Type', 'audio/mpeg');
        // Tell the browser this accepts range requests (helps with seeking)
        headers.set('Accept-Ranges', 'bytes'); 
        
        // We can cast the Node.js stream to any for Next.js Response
        return new NextResponse(stream as any, {
            status: 200,
            headers
        });
    } catch (error) {
        console.error('Stream API error:', error);
        return new NextResponse('Failed to stream audio', { status: 500 });
    }
}
