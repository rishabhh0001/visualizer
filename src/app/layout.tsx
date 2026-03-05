import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WAVECRAFT STUDIO",
  description: "Next-gen web audio visualizer and DJ mixing studio by Rishabh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ background: "#000", color: "#fff", overflowX: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
