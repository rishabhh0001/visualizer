import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { trackA, trackB } = await req.json();

        // Use NVIDIA_API_KEY or fallback to GEMINI_API_KEY if they reuse the same env var name
        const apiKey = process.env.NVIDIA_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API key is missing from environment variables. Please set NVIDIA_API_KEY." }, { status: 500 });
        }

        const prompt = `You are an elite club DJ assistant. 
I am actively mixing two tracks.
Track A (Master): BPM ${trackA.bpm.toFixed(1)}, Time Elapsed: ${trackA.elapsed.toFixed(1)}s / ${trackA.duration.toFixed(1)}s.
Track B (Incoming): BPM ${trackB.bpm.toFixed(1)}, Time Elapsed: ${trackB.elapsed.toFixed(1)}s / ${trackB.duration.toFixed(1)}s.

Suggest a punchy, creative mixing instruction in maximum 2 short sentences. 
Focus on actionable parameters like EQ kills (e.g., cut Bass A), Volume crossfading, or FX triggers (e.g., echo out A). 
Give me the exact move to make right now to blend these seamlessly.`;

        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "meta/llama-4-maverick-17b-128e-instruct",
                messages: [
                    { role: "user", content: prompt }
                ],
                temperature: 0.8,
                max_tokens: 60,
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || data.message || "Failed to fetch from NVIDIA API");
        }

        const text = data.choices[0].message.content;

        return NextResponse.json({ suggestion: text });
    } catch (e: any) {
        console.error("Automix API Error:", e);
        return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
    }
}
