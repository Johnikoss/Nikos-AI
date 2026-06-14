import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Slab } from "next/font/google";
import { SceneBackground } from "@/components/scene-background";
import { LogoDefs } from "@/components/logo";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

// Display slab serif for headings + wordmark (Roboto Slab).
// Keeps the --font-fraunces variable name so globals.css (--font-serif) is unchanged.
const slab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nikos AI — Navigate your life",
  description:
    "Not another chatbot. A cognitive navigation system that turns overload into one clear move — and remembers where you're going.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c0b16",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${slab.variable}`}>
      <body>
        {/* Global living background — shared by the landing and the chat */}
        <SceneBackground />
        <LogoDefs />
        {children}
      </body>
    </html>
  );
}
