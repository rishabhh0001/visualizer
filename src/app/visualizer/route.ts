import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'public', 'visualizer', 'index.html');
        const fileContents = fs.readFileSync(filePath, 'utf8');

        return new NextResponse(fileContents, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Error serving visualizer:', error);
        return new NextResponse('Visualizer not found', { status: 404 });
    }
}
