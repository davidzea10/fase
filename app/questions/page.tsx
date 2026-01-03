"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  auteur_id?: string | null;
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
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [themeFilter, setThemeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ theme: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({ theme: "", description: "" });

  // Charger toutes les questions (publiques)
  useEffect(() => {
    if (activeTab !== "all") return;
    
    const fetchQuestions = async () => {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      // Filtrer explicitement pour ne montrer QUE les questions publiques (approuvées/répondues)
      // Exclure les questions en attente même si RLS les autorise
      const { data, error } = await supabase
        .from("questions")
        .select("id, titre, description, theme, texte_reponse, intitule_question, cree_le, statut, visible, auteur_id")
        .eq("visible", true)
        .in("statut", ["approuve", "repondu"])
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
  }, [page, activeTab]);

  // Charger les questions de l'utilisateur (TOUTES, y compris en attente)
  useEffect(() => {
    if (activeTab !== "my" || !user) return;

    const fetchMyQuestions = async () => {
      // Charger TOUTES les questions de l'utilisateur, quel que soit le statut
      // La politique RLS "Users can view own questions" permet de voir même les questions en attente
      const { data, error } = await supabase
        .from("questions")
        .select("id, titre, description, theme, texte_reponse, intitule_question, cree_le, statut, visible, auteur_id")
        .eq("auteur_id", user.id)
        .order("cree_le", { ascending: false });

      if (error) {
        console.error("Erreur chargement mes questions:", error);
        console.error("Détails erreur:", JSON.stringify(error, null, 2));
        return;
      }

      console.log("Mes questions chargées:", data); // Debug
      setMyQuestions((data as Question[]) || []);
    };

    fetchMyQuestions();
  }, [activeTab, user]);

  // Recharger les questions après modification/suppression
  const refreshQuestions = () => {
    if (activeTab === "all") {
      setPage(0);
      setQuestions([]);
    } else {
      if (user) {
        supabase
          .from("questions")
          .select("id, titre, description, theme, texte_reponse, intitule_question, cree_le, statut, visible, auteur_id")
          .eq("auteur_id", user.id)
          .order("cree_le", { ascending: false })
          .then(({ data, error }) => {
            if (!error && data) {
              setMyQuestions(data as Question[]);
            }
          });
      }
    }
  };

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
      setPage(0);
      refreshQuestions();
      alert("Question soumise avec succès ! Elle sera examinée par la préfecture.");
    }
    setSubmitting(false);
  };

  const handleEditQuestion = async (questionId: string) => {
    if (!editFormData.description.trim() || !editFormData.theme) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    // Vérifier que la question n'est pas déjà répondue
    const { data: questionData } = await supabase
      .from("questions")
      .select("statut")
      .eq("id", questionId)
      .eq("auteur_id", user?.id)
      .single();

    if (questionData && (questionData.statut === 'repondu' || questionData.statut === 'approuve')) {
      alert("Cette question a déjà été répondue et est publique. Elle ne peut plus être modifiée.");
      setEditingQuestion(null);
      setEditFormData({ theme: "", description: "" });
      return;
    }

    const titreCourt = editFormData.description.trim().substring(0, 100);
    const { error } = await supabase
      .from("questions")
      .update({
        titre: titreCourt,
        intitule_question: editFormData.description.trim(),
        theme: editFormData.theme,
        statut: "en_attente", // Remettre en attente après modification
        visible: false,
      })
      .eq("id", questionId)
      .eq("auteur_id", user?.id)
      .neq("statut", "repondu") // Empêcher la modification si déjà répondue
      .neq("statut", "approuve"); // Empêcher la modification si déjà approuvée

    if (error) {
      console.error("Erreur modification question:", error);
      if (error.message.includes("permission") || error.message.includes("0 rows")) {
        alert("Cette question a déjà été répondue et ne peut plus être modifiée.");
      } else {
        alert("Erreur lors de la modification.");
      }
    } else {
      setEditingQuestion(null);
      setEditFormData({ theme: "", description: "" });
      refreshQuestions();
      alert("Question modifiée avec succès !");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    // Vérifier que la question n'est pas déjà répondue
    const { data: questionData } = await supabase
      .from("questions")
      .select("statut")
      .eq("id", questionId)
      .eq("auteur_id", user?.id)
      .single();

    if (questionData && (questionData.statut === 'repondu' || questionData.statut === 'approuve')) {
      alert("Cette question a déjà été répondue et est publique. Elle ne peut plus être supprimée.");
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
      return;
    }

    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", questionId)
      .eq("auteur_id", user?.id)
      .neq("statut", "repondu") // Empêcher la suppression si déjà répondue
      .neq("statut", "approuve"); // Empêcher la suppression si déjà approuvée

    if (error) {
      console.error("Erreur suppression question:", error);
      if (error.message.includes("permission") || error.message.includes("0 rows")) {
        alert("Cette question a déjà été répondue et ne peut plus être supprimée.");
      } else {
        alert("Erreur lors de la suppression.");
      }
    } else {
      refreshQuestions();
      alert("Question supprimée avec succès !");
    }
  };

  const startEditing = (question: Question) => {
    setEditingQuestion(question.id);
    setEditFormData({
      theme: question.theme || "",
      description: question.intitule_question || question.description || "",
    });
  };

  const themes = useMemo(() => {
    const sourceQuestions = activeTab === "my" ? myQuestions : questions;
    const unique = new Set(
      sourceQuestions.map((q) => (q.theme ? q.theme.trim() : "Sans thématique"))
    );
    return ["all", ...Array.from(unique)];
  }, [questions, myQuestions, activeTab]);

  const filteredQuestions = useMemo(() => {
    const sourceQuestions = activeTab === "my" ? myQuestions : questions;
    return sourceQuestions.filter((q) => {
      const matchesTheme =
        themeFilter === "all" ||
        (q.theme ? q.theme.trim() : "Sans thématique") === themeFilter;

      const matchesSearch =
        q.titre.toLowerCase().includes(search.toLowerCase()) ||
        (q.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (q.intitule_question ?? "").toLowerCase().includes(search.toLowerCase());

      return matchesTheme && matchesSearch;
    });
  }, [questions, myQuestions, search, themeFilter, activeTab]);

  const getStatusBadge = (statut: string | null | undefined) => {
    switch (statut) {
      case "approuve":
      case "repondu":
        return (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Répondu
          </span>
        );
      case "en_attente":
        return (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
            En attente
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
            En attente
          </span>
        );
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-black">Questions</h1>
            <p className="mt-2 text-sm text-black/80">
              {activeTab === "all"
                ? "Explore les thématiques soulevées par les étudiants de la faculté."
                : "Gérez vos questions posées à la faculté."}
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

        {/* Onglets */}
        {user && (
          <div className="mt-4 flex gap-2 border-b border-black/10">
            <button
              onClick={() => {
                setActiveTab("all");
                setPage(0);
                setQuestions([]);
              }}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === "all"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-black/60 hover:text-black"
              }`}
            >
              Toutes les questions
            </button>
            <button
              onClick={() => {
                setActiveTab("my");
                refreshQuestions();
              }}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === "my"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-black/60 hover:text-black"
              }`}
            >
              Mes questions ({myQuestions.length})
            </button>
          </div>
        )}
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

      {/* Filtres */}
      {activeTab === "all" && (
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
      )}

      {/* Liste des questions */}
      {activeTab === "my" && filteredQuestions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-sm text-black/60">
          Vous n&apos;avez pas encore posé de questions.
        </div>
      )}

      {activeTab === "all" && filteredQuestions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-sm text-black/60">
          Aucun résultat pour ces critères. Essaie d&apos;élargir la recherche.
        </div>
      )}

      {filteredQuestions.length > 0 && (
        <div className="space-y-4">
          {filteredQuestions.map((q) => (
            activeTab === "my" ? (
              <MyQuestionCard
                key={q.id}
                question={q}
                onEdit={startEditing}
                onDelete={handleDeleteQuestion}
                editingQuestion={editingQuestion}
                editFormData={editFormData}
                setEditFormData={setEditFormData}
                onSaveEdit={handleEditQuestion}
                onCancelEdit={() => {
                  setEditingQuestion(null);
                  setEditFormData({ theme: "", description: "" });
                }}
                getStatusBadge={getStatusBadge}
              />
            ) : (
              <QuestionCard key={q.id} question={q} />
            )
          ))}
          {activeTab === "all" && hasMore && filteredQuestions.length >= PAGE_SIZE && (
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

// Composant pour afficher une question avec réponse repliable (vue publique)
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
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            {question.theme ?? "Sans thématique"}
          </span>
        </div>
        <h2 className="mt-2 text-lg font-semibold text-black">{questionTexte}</h2>
      </div>

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

// Composant pour afficher une question de l'utilisateur avec actions (modifier/supprimer)
function MyQuestionCard({
  question,
  onEdit,
  onDelete,
  editingQuestion,
  editFormData,
  setEditFormData,
  onSaveEdit,
  onCancelEdit,
  getStatusBadge,
}: {
  question: Question;
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => void;
  editingQuestion: string | null;
  editFormData: { theme: string; description: string };
  setEditFormData: (data: { theme: string; description: string }) => void;
  onSaveEdit: (questionId: string) => void;
  onCancelEdit: () => void;
  getStatusBadge: (statut: string | null | undefined) => React.ReactElement;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const questionTexte = question.intitule_question ?? question.titre;
  const reponseTexte = question.texte_reponse ?? "Aucune réponse pour le moment.";

  const isEditing = editingQuestion === question.id;

  return (
    <article className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:shadow-lg">
      {!isEditing ? (
        <>
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  {question.theme ?? "Sans thématique"}
                </span>
                {getStatusBadge(question.statut)}
              </div>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-black">{questionTexte}</h2>
            <p className="mt-1 text-xs text-black/60">
              {new Date(question.cree_le).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {question.texte_reponse && (
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
          )}

          {isOpen && question.texte_reponse && (
            <div className="mb-3 space-y-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
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

          {/* Actions : Modifier/Supprimer uniquement si la question n'est pas encore répondue */}
          {question.statut !== 'repondu' && question.statut !== 'approuve' ? (
            <div className="flex items-center gap-2 border-t border-black/10 pt-4">
              <button
                onClick={() => onEdit(question)}
                className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Modifier
              </button>
              <button
                onClick={() => onDelete(question.id)}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Supprimer
              </button>
            </div>
          ) : (
            <div className="border-t border-black/10 pt-4">
              <p className="text-xs text-black/60 italic">
                Cette question a été répondue et est maintenant publique. Elle ne peut plus être modifiée ni supprimée.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-black">Modifier la question</h3>
          <div>
            <label className="mb-1 block text-sm font-medium text-black">
              Thématique *
            </label>
            <select
              value={editFormData.theme}
              onChange={(e) => setEditFormData({ ...editFormData, theme: e.target.value })}
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
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              required
              rows={5}
              placeholder="Décris ta question en détail..."
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSaveEdit(question.id)}
              disabled={!editFormData.description.trim() || !editFormData.theme}
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Enregistrer
            </button>
            <button
              onClick={onCancelEdit}
              className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-black/5"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
