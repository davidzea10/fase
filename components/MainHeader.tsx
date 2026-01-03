"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { href: "/", label: "Accueil" },
  { href: "/questions", label: "Questions" },
  { href: "/activites", label: "Activités" },
  { href: "/exercices", label: "Exercices" },
  { href: "/about", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export function MainHeader() {
  const [open, setOpen] = useState(false);
  const { user, profile, signOut, loading } = useAuth();

  return (
    <header className="py-4 sm:py-6">
      <div className="flex items-center justify-between gap-3">
        {/* Logo + titre */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white">
            <Image
              src="/fase.jpg"
              alt="Logo faculté"
              width={48}
              height={48}
              className="object-contain p-1"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-black/70">
              Plateforme de communication
            </span>
            <span className="text-sm font-semibold text-black sm:text-base">
              Présidente de la faculté
            </span>
          </div>
        </Link>

        {/* Actions utilisateur desktop (en haut à droite) */}
        <div className="hidden items-center gap-3 md:flex">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-black/10"></div>
          ) : user ? (
            <>
              <div className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-1.5">
                <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {profile?.prenom?.[0] || profile?.nom?.[0] || user.email?.[0].toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-sm text-black/80">
                  {profile?.prenom || profile?.nom || user.email?.split("@")[0] || "Utilisateur"}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-black/70 transition hover:bg-black/5"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black/5"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition hover:bg-blue-500"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Bouton hamburger (mobile) - Style moderne avec trois traits superposés */}
        <button
          type="button"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-black/10 bg-white text-black shadow-sm transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Fermer le menu de navigation" : "Ouvrir le menu de navigation"}
          aria-expanded={open}
        >
          <div className="relative flex flex-col items-center justify-center gap-1.5 w-5 h-5">
            <span
              className={`absolute top-0 left-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                open ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`absolute top-2 left-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`absolute top-4 left-0 block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                open ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Navigation desktop (sous le header) */}
      <nav className="hidden items-center justify-center gap-6 border-t border-black/5 pt-4 text-sm font-medium text-black/80 md:flex">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border-b-2 border-transparent pb-1 transition hover:border-blue-500 hover:text-blue-600"
          >
            {item.label}
          </Link>
        ))}
        {/* Bouton Préfacture pour les admins (au même niveau que les autres boutons) */}
        {!loading && user && profile?.role === "admin" && (
          <Link
            href="/admin"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition hover:bg-blue-500"
          >
            Préfacture
          </Link>
        )}
      </nav>

      {/* Menu mobile déroulant */}
      {open && (
        <div className="mt-3 space-y-2 rounded-2xl border border-black/10 bg-white p-4 text-sm font-medium text-black shadow-lg md:hidden">
          <nav className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {/* Bouton Préfacture pour les admins (au même niveau que les autres boutons) */}
            {!loading && user && profile?.role === "admin" && (
              <Link
                href="/admin"
                className="block rounded-full bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500"
                onClick={() => setOpen(false)}
              >
                Préfacture
              </Link>
            )}
          </nav>
          {loading ? (
            <div className="mt-2 h-10 w-full animate-pulse rounded-lg bg-black/10"></div>
          ) : user ? (
            <>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {profile?.prenom?.[0] || profile?.nom?.[0] || user.email?.[0].toUpperCase() || "U"}
                  </span>
                </div>
                <span className="flex-1 text-sm text-black/80">
                  {profile?.prenom || profile?.nom || user.email?.split("@")[0] || "Utilisateur"}
                </span>
              </div>
              <button
                onClick={() => {
                  signOut();
                  setOpen(false);
                }}
                className="mt-2 w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/70 transition hover:bg-black/5"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="mt-2 block rounded-lg border border-black/10 bg-white px-4 py-2 text-center text-sm font-medium text-black transition hover:bg-black/5"
                onClick={() => setOpen(false)}
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="mt-2 block rounded-full bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500"
                onClick={() => setOpen(false)}
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
