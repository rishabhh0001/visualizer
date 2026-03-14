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

Return a punchy, creative mixing instruction.
You MUST return ONLY a valid JSON object with no markdown formatting or backticks.
The JSON must follow this exact format:
{
  "suggestion": "A short 1-2 sentence description of the move (e.g. 'Cut bass on A and slowly fade in B')",
  "action": {
    "crossfader": 0.5, // Target crossfader value (0 = only A, 1 = only B). 0.5 is middle.
    "sync": true,     // true if you want to sync BPMs
    "playA": true,    // set to true to ensure Deck A is playing, false to pause, omit to leave as is
    "playB": true     // set to true to ensure Deck B is playing, false to pause, omit to leave as is
  }
}
Give me the exact move to make right now to blend these seamlessly. Return ONLY JSON.`;

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
                max_tokens: 200, // increased tokens to accommodate JSON
                response_format: { type: "json_object" } // enforcing JSON if model supports it
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || data.message || "Failed to fetch from NVIDIA API");
        }

        let mixData;
        const textOut = data.choices[0].message.content;
        
        try {
            // Strip markdown formatting if the model still returns it
            const cleanedText = textOut.replace(/```json/g, '').replace(/```/g, '').trim();
            mixData = JSON.parse(cleanedText);
        } catch (parseError) {
             console.error("Failed to parse JSON from AI:", textOut);
             // graceful fallback
             mixData = { suggestion: textOut, action: null };
        }

        return NextResponse.json(mixData);
    } catch (e: any) {
        console.error("Automix API Error:", e);
        return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
    }
}
