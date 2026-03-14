import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { trackA, trackB } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "GEMINI_API_KEY is missing from environment variables." }, { status: 500 });
        }

        const prompt = `You are an elite club DJ assistant. 
I am actively mixing two tracks.
Track A (Master): BPM ${trackA.bpm.toFixed(1)}, Time Elapsed: ${trackA.elapsed.toFixed(1)}s / ${trackA.duration.toFixed(1)}s.
Track B (Incoming): BPM ${trackB.bpm.toFixed(1)}, Time Elapsed: ${trackB.elapsed.toFixed(1)}s / ${trackB.duration.toFixed(1)}s.

Suggest a punchy, creative mixing instruction in maximum 2 short sentences. 
Focus on actionable parameters like EQ kills (e.g., cut Bass A), Volume crossfading, or FX triggers (e.g., echo out A). 
Give me the exact move to make right now to blend these seamlessly.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 60,
                }
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const text = data.candidates[0].content.parts[0].text;

        return NextResponse.json({ suggestion: text });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
