import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { trackA, trackB, crossfader } = await req.json();

        // Use NVIDIA_API_KEY or fallback to GEMINI_API_KEY if they reuse the same env var name
        const apiKey = process.env.NVIDIA_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API key is missing from environment variables. Please set NVIDIA_API_KEY." }, { status: 500 });
        }

        const prompt = `You are an elite club DJ assistant. 
I am actively mixing two tracks. You control the entire mixer.
Track A (Master): BPM ${trackA.bpm.toFixed(1)}, Time: ${trackA.elapsed.toFixed(1)}s / ${trackA.duration.toFixed(1)}s (${((trackA.elapsed/trackA.duration)*100).toFixed(0)}%). Playing: ${trackA.isPlaying}. Vol: ${trackA.volume.toFixed(2)}. EQ(H/M/L): ${trackA.eq.high}/${trackA.eq.mid}/${trackA.eq.low}. FX(Delay/Rev/Wide): ${trackA.fx.delayFeedback.toFixed(2)}/${trackA.fx.reverbMix.toFixed(2)}/${trackA.fx.width.toFixed(2)}.
Track B (Incoming): BPM ${trackB.bpm.toFixed(1)}, Time: ${trackB.elapsed.toFixed(1)}s / ${trackB.duration.toFixed(1)}s (${((trackB.elapsed/trackB.duration)*100).toFixed(0)}%). Playing: ${trackB.isPlaying}. Vol: ${trackB.volume.toFixed(2)}. EQ(H/M/L): ${trackB.eq.high}/${trackB.eq.mid}/${trackB.eq.low}. FX(Delay/Rev/Wide): ${trackB.fx.delayFeedback.toFixed(2)}/${trackB.fx.reverbMix.toFixed(2)}/${trackB.fx.width.toFixed(2)}.
Crossfader: ${crossfader.toFixed(2)} (0 = Deck A, 1 = Deck B).

Analyze the track phrasing (e.g. 0-10% Intro, 40-60% Drop/Breakdown, 90-100% Outro).
Return a punchy, creative mixing instruction and output the TARGET STATE of the mixer to perform a seamless 2.5 second transition.
You MUST return ONLY a valid JSON object with no markdown formatting or backticks.
The JSON must follow this exact format:
{
  "suggestion": "A short description of the move (e.g. 'Track A is ending. Swapping bass on B and fading over')",
  "action": {
    "crossfader": 0.5, // 0 to 1
    "sync": true,     // true to sync BPMs
    "playA": true,    // set true/false to ensure playback state
    "playB": true,    // set true/false to ensure playback state
    "volA": 1.0, "volB": 0.8, // 0 to 1
    "eqA": { "high": 0, "mid": 0, "low": -12 }, // -12 to +12
    "eqB": { "high": 0, "mid": 0, "low": 0 },   // -12 to +12
    "fxA": { "delayFeedback": 0.2, "reverbMix": 0.1, "width": 1.0 }, // Delay 0-0.9, Rev 0-0.8, Wide 0.5-2.0
    "fxB": { "delayFeedback": 0.0, "reverbMix": 0.0, "width": 1.0 }  // Delay 0-0.9, Rev 0-0.8, Wide 0.5-2.0
  }
}
Give me the exact move to make right now. Omit properties in "action" if they should remain unchanged. Return ONLY JSON.`;

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
