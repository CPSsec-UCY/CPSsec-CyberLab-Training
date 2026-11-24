import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";

const sans = Space_Grotesk({
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
    default: "CPSsec CyberLab — Cybersecurity & Post-Quantum Cryptography",
    template: "%s · CPSsec CyberLab",
  },
  description:
    "An open, citation-backed learning platform for cybersecurity and post-quantum cryptography. Four depth lenses, interactive animations, and a real WebAssembly NTT lab.",
  keywords: [
    "post-quantum cryptography",
    "PQC",
    "ML-KEM",
    "ML-DSA",
    "SLH-DSA",
    "NTT",
    "constant-time",
    "cybersecurity education",
    "NIST FIPS 203",
  ],
  authors: [{ name: "CPSsec-UCY" }],
  creator: "CPSsec-UCY",
  openGraph: {
    type: "website",
    title: "CPSsec CyberLab",
    description:
      "Cybersecurity and post-quantum cryptography, explained at four depths with verifiable citations and interactive labs.",
    url: siteUrl,
    siteName: "CPSsec CyberLab",
  },
  twitter: {
    card: "summary_large_image",
    title: "CPSsec CyberLab",
    description: "An open, citation-backed cybersecurity and PQC learning platform.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-cyber-cyan focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-ink-950"
        >
          Skip to content
        </a>
        <Providers>
          <Nav />
          <main id="main-content">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
