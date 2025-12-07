"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Question = {
  id: string;
  titre: string;
  description: string | null;
  theme: string | null;
  texte_reponse?: string | null;
  intitule_question?: string | null;
  cree_le: string;
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [themeFilter, setThemeFilter] = useState("all");

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("id, titre, description, theme, texte_reponse, intitule_question, cree_le")
        .order("cree_le", { ascending: false });

      if (error) {
        console.error("Erreur Supabase:", error);
        return;
      }

      setQuestions((data as Question[]) || []);
    };

    fetchQuestions();
  }, []);

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
        <h1 className="text-3xl font-semibold text-black">Toutes les questions</h1>
        <p className="mt-2 text-sm text-black/80">
          Explore les thématiques soulevées par les étudiants de la faculté.
          Cette page sera enrichie avec des filtres avancés lors des prochaines étapes.
        </p>
      </div>

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
        </div>
      )}
    </section>
  );
}

// Composant pour afficher une question avec réponse repliable
function QuestionCard({ question }: { question: Question }) {
  const [isOpen, setIsOpen] = useState(false);

  const questionTexte = question.intitule_question ?? question.titre;
  const reponseTexte =
    question.texte_reponse ??
    question.description ??
    "La réponse officielle sera publiée prochainement par la faculté.";

  return (
    <article className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:shadow-md">
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
              <p className="text-xs font-semibold text-black">Faculté d&apos;économie</p>
              <p className="text-xs text-black/60">Réponse officielle</p>
            </div>
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-black/80">
            {reponseTexte}
          </p>
        </div>
      )}

      {/* Actions (Like, Dislike, Commenter) */}
      <div className="mt-4 flex items-center gap-4 border-t border-black/10 pt-3">
        <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-black/70 transition hover:bg-black/5">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span>J&apos;aime</span>
        </button>
        <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-black/70 transition hover:bg-black/5">
          <svg className="h-5 w-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span>Je n&apos;aime pas</span>
        </button>
        <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-black/70 transition hover:bg-black/5">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>Commenter</span>
        </button>
      </div>
    </article>
  );
}

