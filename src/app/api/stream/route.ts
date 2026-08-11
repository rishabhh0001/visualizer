import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Ensure this runs in Node, not Edge, as ytdl-core needs Node APIs

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('URL is required', { status: 400 });
    }

    try {
        if (!ytdl.validateURL(url)) {
            return new NextResponse('Invalid YouTube URL', { status: 400 });
        }

        const info = await ytdl.getInfo(url);
        
        // Pick the best audio format
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        if (!format) {
            return new NextResponse('No audio format found', { status: 404 });
        }

        // Get the stream
        const stream = ytdl(url, { format });

        const headers = new Headers();
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Content-Type', format.mimeType || 'audio/mpeg');
        // Tell the browser this accepts range requests (helps with seeking)
        headers.set('Accept-Ranges', 'bytes'); 
        
        if (format.contentLength) {
            headers.set('Content-Length', format.contentLength);
        }

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
