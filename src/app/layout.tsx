import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import { PlayerProvider } from "@/context/PlayerContext"; // NEW

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Musically AI",
  description: "Professional mood-driven music platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="h-full flex flex-col font-sans bg-white text-zinc-900 overflow-hidden">
        <PlayerProvider>
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-white">
              {children}
            </main>
          </div>
          <Player />
        </PlayerProvider>
      </body>
    </html>
  );
}
