import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/nisar/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NISAR PULSE — An Interactive Atlas of Earth's Changing Surface",
  description:
    "Explore surface change measured by NASA-ISRO Synthetic Aperture Radar (NISAR): subsiding megacities, wandering glaciers, waking volcanoes, burn scars and breathing wetlands — tracked every 12 days with L-band and S-band interferometry.",
  keywords: [
    "NISAR",
    "NASA",
    "ISRO",
    "SAR",
    "InSAR",
    "interferometry",
    "remote sensing",
    "surface change",
    "subsidence",
    "glaciers",
    "Space Apps",
  ],
  authors: [{ name: "NISAR PULSE Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "NISAR PULSE — Earth's Changing Surface, Measured by Radar",
    description:
      "An interactive observatory for NISAR radar interferometry: 14 global study sites, synthetic interferograms, mission clock and open data pathways.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
