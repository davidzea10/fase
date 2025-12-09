"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

const PAGE_SIZE = 10;

const THEMES = [
  "examen",
  "stage",
  "projet tutoré",
  "auditoire",
  "aumonerie",
  "promotion",
  "faculté",
  "université",
  "proposition",
  "opportunité",
  "activité",
  "election",
];

export default function QuestionsPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [themeFilter, setThemeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ theme: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("questions")
        .select("id, titre, description, theme, texte_reponse, intitule_question, cree_le, statut, visible")
        .eq("visible", true)
        .order("cree_le", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Erreur Supabase:", error);
        return;
      }

      const fetched = (data as Question[]) || [];
      if (page === 0) {
        setQuestions(fetched);
      } else {
        setQuestions((prev) => [...prev, ...fetched]);
      }
      setHasMore(fetched.length === PAGE_SIZE);
    };

    fetchQuestions();
  }, [page]);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.description.trim()) {
      alert("La description de la question est obligatoire.");
      return;
    }

    if (!formData.theme) {
      alert("Veuillez sélectionner une thématique.");
      return;
    }

    setSubmitting(true);
    // Utiliser les 100 premiers caractères de la description comme titre
    const titreCourt = formData.description.trim().substring(0, 100);
    const { error } = await supabase
      .from("questions")
      .insert({
        titre: titreCourt,
        intitule_question: formData.description.trim(),
        theme: formData.theme,
        statut: "en_attente",
        visible: false,
        auteur_id: user.id,
      });

    if (error) {
      console.error("Erreur soumission question:", error);
      alert("Erreur lors de la soumission. Réessaie.");
    } else {
      setFormData({ theme: "", description: "" });
      setShowForm(false);
      // Recharger depuis le début après soumission
      setPage(0);
      // Notifier les admins (best-effort)
      fetch("/api/notify-new-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titre: titreCourt,
          theme: formData.theme,
          description: formData.description,
        }),
      }).catch(() => {});
      alert("Question soumise avec succès ! Elle sera examinée par la préfecture.");
    }
    setSubmitting(false);
  };

  const themes = useMemo(() => {
    const unique = new Set(
      questions.map((q) => (q.theme ? q.theme.trim() : "Sans thématique"))
    );
    return ["all", ...Array.from(unique)];
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesTheme =
        themeFilter === "all" ||
        (q.theme ? q.theme.trim() : "Sans thématique") === themeFilter;

      const matchesSearch =
        q.titre.toLowerCase().includes(search.toLowerCase()) ||
        (q.description ?? "").toLowerCase().includes(search.toLowerCase());

      return matchesTheme && matchesSearch;
    });
  }, [questions, search, themeFilter]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-black">Toutes les questions</h1>
            <p className="mt-2 text-sm text-black/80">
              Explore les thématiques soulevées par les étudiants de la faculté.
            </p>
          </div>
          {user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
            >
              {showForm ? "Annuler" : "Poser une question"}
            </button>
          )}
        </div>
      </div>

      {/* Bloc WhatsApp fixe */}
      <div className="rounded-2xl border border-green-100 bg-green-50/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
            Chaîne WhatsApp de la Préfecture
          </p>
          <p className="text-sm text-green-900/80">
            Retrouve les annonces et réponses importantes partagées par la Préfecture.
          </p>
        </div>
        <Link
          href="https://whatsapp.com/channel/0029VbA5YolCRs1rAi9zny1O"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-500"
        >
          Ouvrir WhatsApp
        </Link>
      </div>

      {/* Formulaire de soumission de question */}
      {showForm && user && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/30 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-black">Poser une question</h2>
          <form onSubmit={handleSubmitQuestion} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Thématique *
              </label>
              <select
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                required
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Sélectionner une thématique</option>
                {THEMES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-black">
                Description de la question *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={5}
                placeholder="Décris ta question en détail..."
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !formData.description.trim() || !formData.theme}
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Envoi..." : "Soumettre la question"}
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-4 rounded-2xl border border-black/5 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col text-sm text-black">
          Mot-clé
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher par titre ou description"
            className="mt-1 rounded-xl border border-black/10 bg-white px-4 py-2 text-black outline-none ring-0 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="flex flex-col text-sm text-black">
          Thématique
          <select
            value={themeFilter}
            onChange={(event) => setThemeFilter(event.target.value)}
            className="mt-1 rounded-xl border border-black/10 bg-white px-4 py-2 text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {themes.map((theme) => (
              <option key={theme} value={theme}>
                {theme === "all" ? "Toutes" : theme}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-sm text-black/60">
          Aucun résultat pour ces critères. Essaie d’élargir la recherche.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
          {hasMore && filteredQuestions.length >= PAGE_SIZE && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:border-blue-500 hover:text-blue-600"
              >
                Voir plus
              </button>
            </div>
          )}
        </div>
      )}
    </section>
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
      // Compter les likes
      const { count: likesCount } = await supabase
        .from("question_likes")
        .select("*", { count: "exact", head: true })
        .eq("question_id", question.id)
        .eq("type", "like");

      // Compter les dislikes
      const { count: dislikesCount } = await supabase
        .from("question_likes")
        .select("*", { count: "exact", head: true })
        .eq("question_id", question.id)
        .eq("type", "dislike");

      // Vérifier si l'utilisateur a déjà liké/disliké
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
      // Retirer le like/dislike
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
      // Ajouter ou changer le like/dislike
      if (currentType) {
        // Supprimer l'ancien
        await supabase
          .from("question_likes")
          .delete()
          .eq("question_id", question.id)
          .eq("user_id", user.id);
      }

      // Ajouter le nouveau
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
            {question.theme ?? "Sans thématique"}
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

