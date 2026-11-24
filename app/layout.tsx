import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/site/Nav";
import { TopBar } from "@/components/site/TopBar";
import { Footer } from "@/components/site/Footer";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
const siteUrl = `https://cpssec-ucy.github.io${base}/`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CPSsec CyberLab Training — Open Cybersecurity & Cryptography Courses",
    template: "%s · CPSsec CyberLab Training",
  },
  description:
    "An open, citation-backed cybersecurity curriculum covering cryptography, networks, distributed systems, SOC operations and post-quantum migration, with interactive labs and four depth lenses.",
  keywords: [
    "cybersecurity courses",
    "cryptography",
    "network security",
    "SOC analyst",
    "deep packet inspection",
    "federated learning",
    "post-quantum cryptography",
    "ML-KEM",
    "constant-time",
    "security education",
  ],
  authors: [{ name: "CPSsec-UCY" }],
  creator: "CPSsec-UCY",
  openGraph: {
    type: "website",
    title: "CPSsec CyberLab Training",
    description:
      "Cybersecurity, cryptography, networks, distributed systems and SOC operations, explained at four depths with verifiable citations and interactive labs.",
    url: siteUrl,
    siteName: "CPSsec CyberLab Training",
  },
  twitter: {
    card: "summary_large_image",
    title: "CPSsec CyberLab Training",
    description: "An open, citation-backed cybersecurity and cryptography learning platform.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <Providers>
          <TopBar />
          <Nav />
          <main id="main-content">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
