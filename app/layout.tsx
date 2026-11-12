import type { Metadata } from "next";
import { Be_Vietnam_Pro, Plus_Jakarta_Sans } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// Landing pages use Plus Jakarta Sans (from the web redesign); the app keeps Be Vietnam Pro
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
      className={`${beVietnamPro.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className={`${beVietnamPro.className} min-h-full flex flex-col font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
