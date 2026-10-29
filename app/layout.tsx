import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hasito – Your One-Stop Digital Marketplace",
  description: "Pay bills, buy airtime, data, and more – instantly and securely.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${beVietnamPro.variable} h-full antialiased`}
    >
      <body className={`${beVietnamPro.className} min-h-full flex flex-col font-sans`}>
        {children}
      </body>
    </html>
  );
}
