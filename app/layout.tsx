import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Lunch Tray — Pick Your Lunch!",
  description:
    "A visual lunch picker for kids 5+. Tap photos to build your lunch tray!",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Lunch Tray", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FF8A3D",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-orange-50 font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
