import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Logo from "@/components/Logo";
import HeaderNav from "@/components/HeaderNav";
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
  title: "BioHazard — Saneamiento Ambiental",
  description:
    "Plataforma de gestión de certificados para servicios de saneamiento ambiental.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-mist-300">
          <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
            <Link href="/" className="flex items-center">
              <Logo />
            </Link>
            <HeaderNav />
          </nav>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
          {children}
        </main>

        <footer className="border-t border-mist-300 bg-white/60 backdrop-blur">
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
