'use client';

import { engineHtml } from "./engineHtml";
import { useState, useRef, FormEvent } from 'react';
import { Search, Loader2, Music } from 'lucide-react';

export default function VisualizerPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleSearch = async (e: FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        setIsOpen(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSearching(false);
        }
    };

    const playSong = (track: any) => {
        setIsOpen(false);
        // We will proxy the url through our stream route to avoid CORS
        const streamUrl = `/api/stream?url=${encodeURIComponent(track.url)}`;
        
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'PLAY_URL',
                url: streamUrl,
                title: track.title,
                artist: track.artist
            }, '*');
        }
    };

    return (
        <div className="w-full h-screen overflow-hidden bg-black relative">
            <div className="absolute top-4 right-4 z-50 flex flex-col items-end gap-2 max-w-md w-[400px]">
                <form onSubmit={handleSearch} className="w-full relative flex items-center bg-[#1E1E1E] border border-[#333] rounded-full px-4 py-2 shadow-xl focus-within:border-[#1DB954] transition-colors">
                    <Search className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search songs on SoundCloud..."
                        className="bg-transparent text-white outline-none w-full"
                    />
                    {isSearching && <Loader2 className="w-5 h-5 text-gray-400 animate-spin absolute right-4" />}
                </form>

                {isOpen && results.length > 0 && (
                    <div className="w-full bg-[#1E1E1E] border border-[#333] rounded-xl shadow-2xl overflow-hidden mt-1 max-h-[400px] overflow-y-auto">
                        {results.map((track) => (
                            <div 
                                key={track.id} 
                                onClick={() => playSong(track)}
                                className="flex items-center gap-3 p-3 hover:bg-[#2A2A2A] cursor-pointer transition-colors border-b border-[#333] last:border-b-0"
                            >
                                {track.albumArt ? (
                                    <img src={track.albumArt} alt="Album Art" className="w-10 h-10 rounded-md object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-md bg-gray-800 flex items-center justify-center">
                                        <Music className="w-5 h-5 text-gray-500" />
                                    </div>
                                )}
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-sm font-semibold text-white truncate">{track.title}</span>
                                    <span className="text-xs text-gray-400 truncate">{track.artist}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {isOpen && !isSearching && results.length === 0 && query && (
                    <div className="w-full bg-[#1E1E1E] border border-[#333] rounded-xl shadow-2xl p-4 text-center text-gray-400 text-sm">
                        No results found.
                    </div>
                )}
            </div>

            <iframe
                ref={iframeRef}
                srcDoc={engineHtml}
                className="w-full h-full border-0"
                title="Wavecraft Visualizer Engine"
                allow="autoplay; fullscreen"
            />
        </div>
    );
}
