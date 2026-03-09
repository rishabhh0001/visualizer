import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: "/visualizer",
                destination: "/visualizer/index.html",
            },
        ];
    },
};

export default nextConfig;
