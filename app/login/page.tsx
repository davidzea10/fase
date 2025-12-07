"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error, data } = await signIn(email, password);

    if (error) {
      console.error("Erreur connexion détaillée:", {
        message: error.message,
        status: error.status,
        name: error.name,
        originalError: error.originalError,
      });
      
      // Messages d'erreur plus explicites
      let errorMessage = "Erreur lors de la connexion";
      
      if (error.message) {
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid login credentials") || msg.includes("invalid") || msg.includes("email or password")) {
          errorMessage = "Email ou mot de passe incorrect. Si tu viens de t'inscrire, tu dois peut-être confirmer ton email dans Supabase (même si la confirmation est désactivée pour les nouveaux utilisateurs).";
        } else if (msg.includes("email not confirmed") || msg.includes("not confirmed") || msg.includes("email_confirmed_at")) {
          errorMessage = "Ton email n'est pas confirmé. Va dans Supabase Dashboard → Authentication → Users, trouve ton compte et clique sur 'Confirm user'.";
        } else if (msg.includes("rate limit") || msg.includes("too many")) {
          errorMessage = "Trop de tentatives. Réessaie dans quelques minutes.";
        } else if (msg.includes("network") || msg.includes("fetch")) {
          errorMessage = "Problème de connexion. Vérifie ta connexion internet et que les variables d'environnement Supabase sont correctement configurées.";
        } else {
          errorMessage = error.message || "Erreur lors de la connexion";
        }
      }
      
      setError(errorMessage);
      setLoading(false);
    } else {
      // Connexion réussie
      setLoading(false);
      router.push("/");
      router.refresh();
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    await signInWithGoogle();
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold text-black">Connexion</h1>
          <p className="text-sm text-black/70">
            Connecte-toi pour poser tes questions
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-black">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="ton.email@exemple.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-black">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-black/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-black/60">Ou</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuer avec Google
        </button>

        <p className="text-center text-sm text-black/70">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}

