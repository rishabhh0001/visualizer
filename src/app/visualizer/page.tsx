import { engineHtml } from "./engineHtml";
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Wavecraft Visualizer',
};

export default function VisualizerPage() {
    return (
        <div className="w-full h-screen overflow-hidden bg-black">
            <iframe
                srcDoc={engineHtml}
                className="w-full h-full border-0"
                title="Wavecraft Visualizer Engine"
                allow="autoplay; fullscreen"
            />
        </div>
    );
}
