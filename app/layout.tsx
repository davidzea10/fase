import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { MainHeader } from "@/components/MainHeader";
import { AuthProvider } from "@/contexts/AuthContext";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Plateforme de communication – Présidente de la faculté",
  description:
    "Publication des réponses officielles de la faculté aux questions des étudiants.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${poppins.variable} antialiased bg-white text-black`}
      >
        <AuthProvider>
          <div className="min-h-screen bg-white relative">
            <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
              <MainHeader />

              <main className="flex-1 pb-12 pt-2">{children}</main>

            <footer className="relative mt-16 bg-gradient-to-br from-blue-50 via-blue-100/50 to-indigo-50 border-t border-blue-200/50">
              {/* Pattern décoratif */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgb(59 130 246) 1px, transparent 0)`,
                  backgroundSize: '40px 40px'
                }}></div>
              </div>
              
              <div className="relative py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                  {/* Contenu principal du footer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                    {/* Colonne 1: À propos */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                          <Image
                            src="/fase.jpg"
                            alt="Logo FASE"
                            width={32}
                            height={32}
                            className="rounded"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-blue-900 text-sm">FASE</h3>
                          <p className="text-xs text-blue-700/70">Faculté d&apos;économie</p>
                        </div>
                      </div>
                      <p className="text-sm text-blue-900/80 leading-relaxed">
                        Plateforme de communication initiée par la présidence facultaire pour faciliter le dialogue entre la faculté et ses étudiants.
                      </p>
                    </div>

                    {/* Colonne 2: Navigation rapide */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-blue-900 text-sm uppercase tracking-wide">
                        Navigation
                      </h4>
                      <ul className="space-y-3">
                        <li>
                          <Link href="/" className="text-sm text-blue-800/80 hover:text-blue-600 transition-colors flex items-center gap-2 group">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:bg-blue-600 transition-colors"></span>
                            Accueil
                          </Link>
                        </li>
                        <li>
                          <Link href="/questions" className="text-sm text-blue-800/80 hover:text-blue-600 transition-colors flex items-center gap-2 group">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:bg-blue-600 transition-colors"></span>
                            Questions
                          </Link>
                        </li>
                        <li>
                          <Link href="/activites" className="text-sm text-blue-800/80 hover:text-blue-600 transition-colors flex items-center gap-2 group">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:bg-blue-600 transition-colors"></span>
                            Activités
                          </Link>
                        </li>
                        <li>
                          <Link href="/exercices" className="text-sm text-blue-800/80 hover:text-blue-600 transition-colors flex items-center gap-2 group">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:bg-blue-600 transition-colors"></span>
                            Exercices
                          </Link>
                        </li>
                        <li>
                          <Link href="/about" className="text-sm text-blue-800/80 hover:text-blue-600 transition-colors flex items-center gap-2 group">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:bg-blue-600 transition-colors"></span>
                            À propos
                          </Link>
                        </li>
                        <li>
                          <Link href="/contact" className="text-sm text-blue-800/80 hover:text-blue-600 transition-colors flex items-center gap-2 group">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:bg-blue-600 transition-colors"></span>
                            Contact
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Colonne 3: Nos réseaux et Partenaires */}
                    <div className="space-y-6">
                      {/* Nos réseaux */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-blue-900 text-sm uppercase tracking-wide">
                          Nos réseaux
                        </h4>
                        <div className="flex items-center gap-3">
                          <a
                            href="https://www.instagram.com/prefacture_fase_upcofficiel?igsh=djZwN2xzYXFnZ2F6&utm_source=qr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-md"
                            aria-label="Instagram de la présidence facultaire"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </a>
                          <a
                            href="https://whatsapp.com/channel/0029VbA5YolCRs1rAi9zny1O"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-white hover:scale-110 transition-transform shadow-md"
                            aria-label="Chaîne WhatsApp de la Préfecture"
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                          </a>
                        </div>
                      </div>

                      {/* Partenaires */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-blue-900 text-sm uppercase tracking-wide">
                          Nos partenaires
                        </h4>
                        <div className="space-y-3">
                          <a
                            href="https://www.weact.cd"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 rounded-lg bg-white/60 hover:bg-white transition-all border border-blue-200/50 hover:border-blue-300 hover:shadow-md group"
                          >
                            <Image
                              src="/act.jpg"
                              alt="We Act Programme des Jeunes"
                              width={100}
                              height={35}
                              className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
                            />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Barre de séparation */}
                  <div className="border-t border-blue-200/50 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                      {/* Copyright */}
                      <div className="text-sm text-blue-800/70 text-center md:text-left">
                        <p className="font-medium text-blue-900">
                          © {new Date().getFullYear()} Faculté d&apos;économie – upc
                        </p>
                        <p className="text-xs mt-1">
                          Tous droits réservés. Plateforme de communication – Présidente de la faculté.
                        </p>
                      </div>

                      {/* Badge */}
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium shadow-lg">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Plateforme officielle</span>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-blue-800/70 text-center md:text-left">
                      Design by Dbz —{" "}
                      <a
                        href="https://www.linkedin.com/in/david-debuze-a91a7a32a/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-700 hover:text-blue-500"
                      >
                        David Debuze
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </footer>

            {/* Bouton WhatsApp flottant (fixe sur toutes les pages) */}
            <Link
              href="https://whatsapp.com/channel/0029VbA5YolCRs1rAi9zny1O"
              target="_blank"
              className="fixed bottom-5 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition hover:bg-green-500"
              aria-label="Chaîne WhatsApp de la Préfecture"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.5 0-9.96 4.45-9.96 9.94 0 1.75.46 3.46 1.34 4.97L2 22l5.22-1.38a9.95 9.95 0 0 0 4.82 1.23h.01c5.49 0 9.95-4.45 9.95-9.94A9.89 9.89 0 0 0 12.04 2Zm5.85 13.72c-.25.7-1.45 1.33-2 1.38-.51.05-1.15.07-1.86-.12-.43-.12-.98-.31-1.69-.6-2.98-1.3-4.92-4.33-5.07-4.53-.15-.2-1.21-1.61-1.21-3.07 0-1.46.77-2.18 1.05-2.47.28-.29.62-.36.83-.36h.6c.19 0 .44-.07.69.53.25.6.86 2.08.93 2.23.08.15.12.33.02.53-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.3.31-.13.61.18.3.8 1.32 1.7 2.14 1.17 1.04 2.16 1.37 2.47 1.52.31.15.5.13.69-.08.19-.2.79-.92 1-1.24.21-.32.43-.26.73-.16.3.1 1.92.91 2.25 1.07.33.15.55.24.63.38.08.15.08.86-.17 1.57Z" />
              </svg>
              <span className="hidden sm:inline">WhatsApp Préfecture</span>
            </Link>
          </div>
        </div>
        </AuthProvider>
      </body>
    </html>
  );
}
