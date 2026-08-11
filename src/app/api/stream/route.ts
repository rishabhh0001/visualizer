import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('URL is required', { status: 400 });
    }

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch from url: ${response.statusText}`);
        }

        const headers = new Headers();
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        return new NextResponse(response.body, {
            status: 200,
            headers
        });
    } catch (error) {
        console.error('Stream API error:', error);
        return new NextResponse('Failed to stream audio', { status: 500 });
    }
}
