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
I am actively mixing two tracks. You control the ENTIRE mixer board — every knob and fader.
Track A (Master): BPM ${trackA.bpm.toFixed(1)}, Pitch: ${trackA.pitch.toFixed(2)}x, Time: ${trackA.elapsed.toFixed(1)}s / ${trackA.duration.toFixed(1)}s (${((trackA.elapsed/trackA.duration)*100).toFixed(0)}%). Playing: ${trackA.isPlaying}. Vol: ${trackA.volume.toFixed(2)}. EQ(H/M/L): ${trackA.eq.high}/${trackA.eq.mid}/${trackA.eq.low}. FX(Delay/Rev/Wide/Comp): ${trackA.fx.delayFeedback.toFixed(2)}/${trackA.fx.reverbMix.toFixed(2)}/${trackA.fx.width.toFixed(2)}/${trackA.fx.compression}.
Track B (Incoming): BPM ${trackB.bpm.toFixed(1)}, Pitch: ${trackB.pitch.toFixed(2)}x, Time: ${trackB.elapsed.toFixed(1)}s / ${trackB.duration.toFixed(1)}s (${((trackB.elapsed/trackB.duration)*100).toFixed(0)}%). Playing: ${trackB.isPlaying}. Vol: ${trackB.volume.toFixed(2)}. EQ(H/M/L): ${trackB.eq.high}/${trackB.eq.mid}/${trackB.eq.low}. FX(Delay/Rev/Wide/Comp): ${trackB.fx.delayFeedback.toFixed(2)}/${trackB.fx.reverbMix.toFixed(2)}/${trackB.fx.width.toFixed(2)}/${trackB.fx.compression}.
Crossfader: ${crossfader.toFixed(2)} (0 = Deck A only, 1 = Deck B only).

Analyze the track phrasing based on percentage position (0-10% Intro, 40-60% Drop/Breakdown, 90-100% Outro).
Return a punchy, creative mixing instruction and output the TARGET STATE of the mixer to perform a seamless 2.5 second transition.

CRITICAL RULES:
1. When transitioning from A to B, crossfader MUST be 1.0 at the end. When transitioning from B to A, crossfader MUST be 0.0.
2. DO NOT leave the crossfader in the middle. ALWAYS cut off the outgoing track completely.
3. ALWAYS set "sync": true when mixing tracks together to ensure perfect beatmatching.
4. BEAT TIMING: Consider the current position of both tracks. Choose the ideal moment to begin the transition. If Track B is at an awkward moment (e.g., middle of a phrase), include a "seekB" value in seconds to the nearest phrase boundary or beat drop (e.g., the start of a break or chorus) to snap to the perfect position before mixing in. Only include seekB if it meaningfully improves the mix.

You MUST return ONLY a valid JSON object with no markdown formatting or backticks.
The JSON must follow this exact format:
{
  "suggestion": "e.g. 'Track A ending — sought B to drop, pitched up, synced and fading over'",
  "action": {
    "crossfader": 0.5,
    "sync": true,
    "seekB": 64.0,
    "playA": true,
    "playB": true,
    "volA": 1.0, "volB": 0.8,
    "pitchA": 1.0,
    "pitchB": 1.05,
    "eqA": { "high": 0, "mid": 0, "low": -12 },
    "eqB": { "high": 2, "mid": 0, "low": 0 },
    "fxA": { "delayFeedback": 0.3, "reverbMix": 0.1, "width": 1.2, "compression": -24 },
    "fxB": { "delayFeedback": 0.0, "reverbMix": 0.0, "width": 1.0, "compression": -18 }
  }
}
pitchA/pitchB: playback speed multiplier (0.5=half speed, 1.0=normal, 2.0=double). Use subtle values (0.95-1.05) for tempo nudging unless dramatic effect desired.
eqA/eqB high/mid/low range: -12 to +12 dB.
fxA/fxB: delayFeedback 0-0.9, reverbMix 0-0.8, width 0.5-2.0, compression threshold -60 to 0.
Give me the exact move right now. Omit any "action" property that should remain unchanged. Return ONLY the JSON object.`;


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
                max_tokens: 350,
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
