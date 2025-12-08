"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Question = {
  id: string;
  titre: string;
  intitule_question?: string | null;
  theme: string | null;
  texte_reponse?: string | null;
  statut?: string | null;
  visible?: boolean | null;
  cree_le: string;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState<"all" | "en_attente" | "repondu">("all");
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [filter]);

  const fetchQuestions = async () => {
    let query = supabase
      .from("questions")
      .select("id, titre, intitule_question, theme, texte_reponse, statut, visible, cree_le")
      .order("cree_le", { ascending: false });

    if (filter === "en_attente") {
      query = query.eq("statut", "en_attente");
    } else if (filter === "repondu") {
      query = query.eq("statut", "repondu");
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur chargement questions admin:", error);
      return;
    }

    setQuestions((data as Question[]) || []);
  };

  const handleRespond = async (questionId: string) => {
    if (!responseText.trim()) {
      alert("Veuillez entrer une réponse.");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("questions")
      .update({
        texte_reponse: responseText.trim(),
        statut: "repondu",
      })
      .eq("id", questionId);

    if (error) {
      console.error("Erreur mise à jour réponse:", error);
      alert("Erreur lors de l'enregistrement de la réponse.");
    } else {
      setEditingQuestion(null);
      setResponseText("");
      fetchQuestions();
    }
    setLoading(false);
  };

  const handlePublish = async (questionId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("questions")
      .update({ visible: true })
      .eq("id", questionId);

    if (error) {
      console.error("Erreur publication:", error);
      alert("Erreur lors de la publication.");
    } else {
      fetchQuestions();
    }
    setLoading(false);
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) {
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", questionId);

    if (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression.");
    } else {
      fetchQuestions();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres et bouton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-black">Gestion des questions</h2>
          <p className="mt-1 text-xs text-black/70">
            Répondre aux questions des étudiants et les publier
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-lg border border-black/10 bg-white p-1">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "text-black/70 hover:bg-black/5"
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter("en_attente")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                filter === "en_attente"
                  ? "bg-orange-600 text-white"
                  : "text-black/70 hover:bg-black/5"
              }`}
            >
              En attente
            </button>
            <button
              onClick={() => setFilter("repondu")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                filter === "repondu"
                  ? "bg-green-600 text-white"
                  : "text-black/70 hover:bg-black/5"
              }`}
            >
              Répondues
            </button>
          </div>
          <Link
            href="/admin/questions/new"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Ajouter une question
          </Link>
        </div>
      </div>

      {/* Liste des questions */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white p-8 text-center">
            <p className="text-sm text-black/60">
              {filter === "en_attente"
                ? "Aucune question en attente de réponse."
                : filter === "repondu"
                ? "Aucune question répondue."
                : "Aucune question enregistrée."}
            </p>
          </div>
        ) : (
          questions.map((q) => (
            <div
              key={q.id}
              className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
            >
              <div className="mb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        {q.theme ?? "Sans thème"}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          q.statut === "repondu"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {q.statut === "repondu" ? "Répondu" : "En attente"}
                      </span>
                      {q.visible && (
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          Publiée
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-black">{q.titre}</h3>
                    {q.intitule_question && (
                      <p className="mt-2 text-sm text-black/70">{q.intitule_question}</p>
                    )}
                    {q.texte_reponse && (
                      <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Réponse :</p>
                        <p className="text-sm text-black/80 whitespace-pre-line">{q.texte_reponse}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 border-t border-black/10 pt-4">
                {editingQuestion === q.id ? (
                  <div className="w-full space-y-2">
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Rédige ta réponse ici..."
                      rows={4}
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond(q.id)}
                        disabled={loading || !responseText.trim()}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                      >
                        {loading ? "Enregistrement..." : "Enregistrer la réponse"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingQuestion(null);
                          setResponseText("");
                        }}
                        className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/70 transition hover:bg-black/5"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {q.statut !== "repondu" && (
                      <button
                        onClick={() => {
                          setEditingQuestion(q.id);
                          setResponseText(q.texte_reponse || "");
                        }}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                      >
                        {q.texte_reponse ? "Modifier la réponse" : "Répondre"}
                      </button>
                    )}
                    {q.statut === "repondu" && !q.visible && (
                      <button
                        onClick={() => handlePublish(q.id)}
                        disabled={loading}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
                      >
                        {loading ? "Publication..." : "Publier"}
                      </button>
                    )}
                    {q.visible && (
                      <span className="rounded-lg bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                        Publiée
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(q.id)}
                      disabled={loading}
                      className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


