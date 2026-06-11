import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Logo from "@/components/Logo";
import HeaderNav from "@/components/HeaderNav";
import Watermark from "@/components/Watermark";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://certificadosbiohazard.com"),
  title: "BioHazard — Saneamiento Ambiental",
  description:
    "Plataforma de gestión de certificados para servicios de saneamiento ambiental.",
  // La imagen de preview (og:image / twitter:image) la genera
  // app/opengraph-image.js con el logo centrado y con margen.
  openGraph: {
    title: "BioHazard — Saneamiento Ambiental",
    description:
      "Plataforma de gestión de certificados para servicios de saneamiento ambiental.",
    url: "https://certificadosbiohazard.com",
    siteName: "BioHazard",
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "BioHazard — Saneamiento Ambiental",
    description:
      "Plataforma de gestión de certificados para servicios de saneamiento ambiental.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Marca de agua de fondo (fumigación) — fija, difuminada, detrás de todo */}
        <Watermark />

        <header className="sticky top-0 z-30 bg-white border-b border-mist-300">
          <nav className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-6">
            <Link href="/" className="flex items-center shrink-0">
              <Logo />
            </Link>
            <HeaderNav />
          </nav>
        </header>

        <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-6 py-10">
          {children}
        </main>

        <footer className="relative z-10 border-t border-mist-300 bg-white/60 backdrop-blur">
          <div className="max-w-5xl mx-auto px-6 py-6 text-xs text-aqua-800/70 flex items-center justify-between">
            <span>
              © {new Date().getFullYear()} BioHazard — Saneamiento Ambiental
            </span>
            <span className="hidden sm:inline">
              Limpieza, desinfección y control sanitario
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
