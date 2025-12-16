"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

type Question = {
  id: string;
  titre: string;
  description: string | null;
  theme: string | null;
  texte_reponse?: string | null;
  intitule_question?: string | null;
  cree_le: string;
  statut?: string | null;
  visible?: boolean | null;
};

type LikeData = {
  likes: number;
  dislikes: number;
  userLike: 'like' | 'dislike' | null;
};

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [themeFilter, setThemeFilter] = useState("all");

  // Rediriger vers /login si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Charger les questions seulement si l'utilisateur est connecté
  useEffect(() => {
    if (!user || loading) return;

    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("id, titre, description, theme, texte_reponse, intitule_question, cree_le, statut, visible")
        .eq("visible", true)
        .order("cree_le", { ascending: false })
        .limit(5); // Afficher seulement les 5 premières sur l'accueil

      if (error) {
        console.error("Erreur Supabase:", error);
        console.error("Type d'erreur:", typeof error);
        console.error("Erreur complète:", JSON.stringify(error, null, 2));
        return;
      }

      setQuestions((data as Question[]) || []);
    };

    fetchQuestions();
  }, [user, loading]);

  // Tous les hooks doivent être appelés avant les returns conditionnels
  const themes = useMemo(() => {
    if (!user) return ["all"];
    const unique = new Set(
      questions.map((q) => (q.theme ? q.theme.trim() : "Autres"))
    );
    return ["all", ...Array.from(unique)];
  }, [questions, user]);

  const filtered = useMemo(() => {
    if (!user) return [];
    return questions.filter((q) => {
      const themeLabel = q.theme ? q.theme.trim() : "Autres";

      const matchesTheme =
        themeFilter === "all" || themeLabel === themeFilter;

      const searchLower = search.toLowerCase();
      const matchesSearch =
        q.titre.toLowerCase().includes(searchLower) ||
        (q.description ?? "").toLowerCase().includes(searchLower);

      return matchesTheme && matchesSearch;
    });
  }, [questions, search, themeFilter, user]);

  // Afficher un message de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-black/70">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, ne rien afficher (redirection en cours)
  if (!user) {
    return null;
  }

  return (
    <main className="space-y-10">
      {/* Hero avec la présidente de faculté */}
      <section className="grid gap-8 rounded-3xl border border-black/5 bg-white p-6 shadow-sm md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:p-8">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Initiative de la présidente de facultaire
          </p>
          <h1 className="text-2xl font-semibold text-black md:text-3xl">
          Un espace de communication entre la présidente facultaire et les étudiants</h1>
          <p className="text-sm text-black/80 md:text-base">
          La présidente de faculté, Sabrina Penenge, met à disposition des étudiants de Fasé une plate-forme de communication où ces derniers pourront poser leurs différentes questions en vue d’obtenir des réponses mais aussi obtenir les informations pour faciliter la communication, clarifier les informations académiques et valoriser les retours des étudiants. </p>
          <p className="text-sm text-black/80">
          Les questions sont centralisées, structurées par thématique et accompagnées de réponses officielles. Les identités des étudiants ne sont pas affichées : seul le contenu compte.</p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/questions"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
            >
              Parcourir les questions
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-5 py-2 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600"
            >
              Comprendre le fonctionnement
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center md:justify-end">
            <div className="relative w-52 max-w-full rounded-3xl bg-white sm:w-64">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-black/5">
              <Image
                src="/presidente1.jpg"
                alt="Sabrina Penenge, présidente de faculté"
                fill
                sizes="(min-width: 768px) 256px, 208px"
                className="object-cover"
              />
            </div>
            <div className="mt-3 space-y-2">
              <div className="space-y-0.5">
              <p className="text-sm font-semibold text-black">
                Sabrina Penenge
              </p>
              <p className="text-xs text-black/80">
                Présidente de la faculté d&apos;économie
              </p>
              </div>
              
              {/* Réseaux sociaux de la présidente */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://www.instagram.com/sabrinapenenge?igsh=a2tvYmo2dXkzMDg4&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white hover:scale-110 transition-transform"
                  aria-label="Instagram de Sabrina Penenge"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@sabrina_penenge?_r=1&_t=ZM-91tKGDazk2W"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white hover:scale-110 transition-transform"
                  aria-label="TikTok de Sabrina Penenge"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-500 text-white hover:scale-110 transition-transform"
                  aria-label="Twitter de Sabrina Penenge"
                  title="Twitter (bientôt)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.633 7.997c.013.176.013.352.013.529 0 5.39-4.103 11.6-11.6 11.6-2.305 0-4.45-.676-6.253-1.84.321.037.63.05.964.05a8.18 8.18 0 0 0 5.074-1.748 4.09 4.09 0 0 1-3.817-2.835c.25.038.5.063.763.063.366 0 .733-.05 1.076-.138a4.084 4.084 0 0 1-3.276-4.01v-.05c.54.3 1.164.489 1.828.514a4.078 4.078 0 0 1-1.819-3.4c0-.751.202-1.44.553-2.04a11.6 11.6 0 0 0 8.417 4.27 4.606 4.606 0 0 1-.101-.936A4.086 4.086 0 0 1 18.09 5.9a8.045 8.045 0 0 0 2.59-.989 4.07 4.07 0 0 1-1.796 2.253 8.175 8.175 0 0 0 2.35-.64 8.79 8.79 0 0 1-1.601 1.473z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Activités */}
      <ActivitiesCarouselSection />

      {/* Barre de recherche + filtre thème */}
      <section className="grid gap-4 rounded-2xl border border-black/5 bg-white p-4 md:grid-cols-[2fr,1fr] md:p-5">
        <label className="flex flex-col text-sm text-black">
          Recherche
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher dans les questions ou les réponses"
            className="mt-1 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="flex flex-col text-sm text-black">
          Thématique
          <select
            value={themeFilter}
            onChange={(event) => setThemeFilter(event.target.value)}
            className="mt-1 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {themes.map((theme) => (
              <option key={theme} value={theme}>
                {theme === "all" ? "Toutes les thématiques" : theme}
              </option>
            ))}
          </select>
        </label>
      </section>

      {/* Bloc WhatsApp fixe */}
      <section className="rounded-2xl border border-green-100 bg-green-50/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
            Chaîne officielle WhatsApp
          </p>
          <p className="text-sm text-green-900/80">
            Suivez les annonces de la Préfecture et restez informé des réponses publiées.
          </p>
        </div>
        <Link
          href="https://whatsapp.com/channel/0029VbA5YolCRs1rAi9zny1O"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-500"
        >
          Ouvrir WhatsApp
        </Link>
      </section>

      {/* Liste Q/R style Facebook */}
      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-black md:text-3xl">
            Questions des étudiants sur la faculté
          </h2>
          <div className="flex flex-col gap-2 text-sm text-black/80 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium">
              {filtered.length} question(s) trouvée(s)
            </span>
            <Link
              href="/about"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              En savoir plus sur le fonctionnement
            </Link>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-sm text-black/60">
            Aucune question ne correspond à ces critères. Essaie une autre
            recherche ou un autre thème.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.slice(0, 5).map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
            <div className="pt-2">
              <Link
                href="/questions"
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100"
              >
                Voir plus de questions
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

// Composant pour afficher une question avec réponse repliable
function QuestionCard({ question }: { question: Question }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [likeData, setLikeData] = useState<LikeData>({ likes: 0, dislikes: 0, userLike: null });
  const [loading, setLoading] = useState(false);

  const questionTexte = question.intitule_question ?? question.titre;
  const reponseTexte =
    question.texte_reponse ??
    question.description ??
    "La réponse officielle sera publiée prochainement par la faculté.";

  // Charger les likes au montage du composant
  useEffect(() => {
    const fetchLikes = async () => {
      const { count: likesCount } = await supabase
        .from("question_likes")
        .select("*", { count: "exact", head: true })
        .eq("question_id", question.id)
        .eq("type", "like");

      const { count: dislikesCount } = await supabase
        .from("question_likes")
        .select("*", { count: "exact", head: true })
        .eq("question_id", question.id)
        .eq("type", "dislike");

      let userLike: 'like' | 'dislike' | null = null;
      if (user) {
        const { data } = await supabase
          .from("question_likes")
          .select("type")
          .eq("question_id", question.id)
          .eq("user_id", user.id)
          .single();
        if (data) userLike = data.type as 'like' | 'dislike';
      }

      setLikeData({
        likes: likesCount || 0,
        dislikes: dislikesCount || 0,
        userLike,
      });
    };

    fetchLikes();
  }, [question.id, user]);

  const handleLike = async (type: 'like' | 'dislike') => {
    if (!user) {
      alert("Tu dois être connecté pour aimer une question.");
      return;
    }

    setLoading(true);
    const currentType = likeData.userLike;

    if (currentType === type) {
      const { error } = await supabase
        .from("question_likes")
        .delete()
        .eq("question_id", question.id)
        .eq("user_id", user.id);

      if (!error) {
        setLikeData({
          likes: type === 'like' ? likeData.likes - 1 : likeData.likes,
          dislikes: type === 'dislike' ? likeData.dislikes - 1 : likeData.dislikes,
          userLike: null,
        });
      }
    } else {
      if (currentType) {
        await supabase
          .from("question_likes")
          .delete()
          .eq("question_id", question.id)
          .eq("user_id", user.id);
      }

      const { error } = await supabase
        .from("question_likes")
        .insert({
          question_id: question.id,
          user_id: user.id,
          type,
        });

      if (!error) {
        setLikeData({
          likes: type === 'like' 
            ? (currentType === 'dislike' ? likeData.likes + 1 : likeData.likes + 1)
            : (currentType === 'like' ? likeData.likes - 1 : likeData.likes),
          dislikes: type === 'dislike'
            ? (currentType === 'like' ? likeData.dislikes + 1 : likeData.dislikes + 1)
            : (currentType === 'dislike' ? likeData.dislikes - 1 : likeData.dislikes),
          userLike: type,
        });
      }
    }
    setLoading(false);
  };

  return (
    <article className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:shadow-lg">
      {/* En-tête de la question */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            {question.theme ?? "Autres"}
          </span>
        </div>
        <h2 className="mt-2 text-lg font-semibold text-black">{questionTexte}</h2>
      </div>

      {/* Bouton pour voir/masquer la réponse */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-3 flex w-full items-center justify-between rounded-lg border border-black/10 bg-black/5 px-4 py-2 text-sm font-medium text-black transition hover:bg-black/10"
      >
        <span>{isOpen ? "Masquer la réponse" : "Voir la réponse"}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Section réponse (repliable) */}
      {isOpen && (
        <div className="mt-3 space-y-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">F</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-black">Présidence facultaire</p>
              <p className="text-xs text-black/60">Réponse officielle</p>
            </div>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-black/80">
            {reponseTexte}
          </p>
        </div>
      )}

      {/* Actions (Like, Dislike) - Style Facebook */}
      <div className="mt-4 flex items-center gap-6 border-t border-black/10 pt-4">
        <button
          onClick={() => handleLike('like')}
          disabled={loading}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            likeData.userLike === 'like'
              ? "bg-blue-100 text-blue-600"
              : "text-black/70 hover:bg-black/5"
          } disabled:opacity-50`}
        >
          <svg 
            className={`h-5 w-5 ${likeData.userLike === 'like' ? 'fill-blue-600' : ''}`} 
            fill={likeData.userLike === 'like' ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span>J&apos;aime</span>
          {likeData.likes > 0 && (
            <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">
              {likeData.likes}
            </span>
          )}
        </button>
        <button
          onClick={() => handleLike('dislike')}
          disabled={loading}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            likeData.userLike === 'dislike'
              ? "bg-red-100 text-red-600"
              : "text-black/70 hover:bg-black/5"
          } disabled:opacity-50`}
        >
          <svg 
            className={`h-5 w-5 rotate-180 ${likeData.userLike === 'dislike' ? 'fill-red-600' : ''}`} 
            fill={likeData.userLike === 'dislike' ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span>Je n&apos;aime pas</span>
          {likeData.dislikes > 0 && (
            <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
              {likeData.dislikes}
            </span>
          )}
        </button>
      </div>
    </article>
  );
}

// Composant Section Activités avec Carousel
function ActivitiesCarouselSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const activityImages = [
    "/activite1.jpg",
    "/forum.jpg",
    "/meet1.jpg",
    "/meet2.jpg",
    "/meet3.jpg",
    "/meet4.jpg",
    "/meet5.jpg",
    "/fasecup1.jpg",
    "/fasecup2.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % activityImages.length);
    }, 4000); // Change d'image toutes les 4 secondes

    return () => clearInterval(interval);
  }, [activityImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % activityImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + activityImages.length) % activityImages.length);
  };

  return (
    <section className="grid gap-8 rounded-3xl border border-black/5 bg-gradient-to-br from-blue-50 via-blue-100/50 to-indigo-50 p-6 shadow-lg md:grid-cols-[1fr_1fr] md:p-8">
      {/* Texte à gauche */}
      <div className="flex flex-col justify-center space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
          Événements organisés
        </p>
        <h2 className="text-2xl font-bold text-black md:text-3xl">
          Nos Activités
        </h2>
        <p className="text-sm leading-relaxed text-black/80 md:text-base">
          Découvrez les événements et activités organisés par la présidence facultaire. 
          Des rencontres, des forums, des compétitions sportives et bien plus encore pour 
          renforcer le dialogue et l&apos;engagement étudiant.
        </p>
        <p className="text-sm text-black/70">
          Rejoignez-nous pour vivre des moments mémorables et enrichissants au sein de la FASE.
        </p>
        <Link
          href="/activites"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:scale-105 hover:shadow-xl"
        >
          <span>Voir tous les détails</span>
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {/* Carousel d'images à droite */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-black/5 shadow-xl">
        {activityImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ${
              idx === currentImageIndex
                ? "opacity-100 z-10"
                : "opacity-0 z-0"
            }`}
          >
            <Image
              src={img}
              alt={`Activité ${idx + 1}`}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-center"
              priority={idx === 0}
            />
          </div>
        ))}

        {/* Navigation */}
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
          aria-label="Image précédente"
        >
          <svg
            className="h-5 w-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
          aria-label="Image suivante"
        >
          <svg
            className="h-5 w-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Indicateurs */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {activityImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentImageIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Aller à l'image ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}