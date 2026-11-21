import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "مغزتو به چالش بکش! | Brain Challenge",
  description:
    "بازی معما و طنز دوبعدی — با لمس، کشیدن، تکان دادن گوشی و فکر کردن خارج از کادر معماها را حل کن. A 2D cartoon puzzle game solved with taps, drags, shakes and out-of-the-box thinking.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Brain Challenge",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#6C4AB6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router: font needed globally for the game */}
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;900&family=Fredoka:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-background text-foreground" style={{ touchAction: "manipulation" }}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
