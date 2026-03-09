export default function VisualizerPage() {
    return (
        <div className="w-full h-screen overflow-hidden bg-black">
            <iframe
                src="/engine/index.html"
                className="w-full h-full border-0"
                title="Wavecraft Visualizer Engine"
                allow="autoplay; fullscreen"
            />
        </div>
    );
}
