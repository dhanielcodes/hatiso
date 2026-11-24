import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

// Brand typeface (from the Hatiso colour palette). Variable font, so every weight from 100 to 900 is available.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hatiso – Your One-Stop Digital Marketplace",
  description: "Pay bills, buy airtime, data, and more – instantly and securely.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <body className={`${outfit.className} min-h-full flex flex-col font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
